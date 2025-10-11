<!--
  文件名称: index.vue
  文件描述: 库位管理页面
  创建日期: 2025-01-20
  修改记录:
    - 2025-01-20: 初始创建
    - 2025-01-20: 重构为独立页面
-->

<template>
  <div class="location-management-container app-container">
    <!-- 搜索表单 -->
    <LocationSearch @search="handleSearch" @reset="handleReset" />

    <!-- 表格 -->
    <LocationTable
      :table-data="locationList"
      :loading="loading"
      :pagination="pagination"
      @create="handleCreate"
      @edit="handleEdit"
      @detail="handleDetail"
      @status-change="handleStatusChange"
      @refresh="fetchLocationList"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
      @sort-change="handleSortChange"
    />

    <!-- 表单抽屉 -->
    <LocationFormDrawer
      :visible.sync="formDrawerVisible"
      :mode="formMode"
      :initial-data="currentLocation"
      @confirm="handleFormConfirm"
      @cancel="handleFormCancel"
    />

    <!-- 详情抽屉 -->
    <LocationDetailDrawer
      :visible.sync="detailDrawerVisible"
      :location-data="currentLocation"
      :loading="detailLoading"
    />

    <!-- 状态变更对话框 -->
    <el-dialog
      :visible.sync="statusDialogVisible"
      title="变更库位占用状态"
      width="500px"
      @close="handleStatusDialogClose"
    >
      <el-form
        ref="statusForm"
        :model="statusForm"
        :rules="statusFormRules"
        label-width="120px"
        size="small"
      >
        <el-form-item label="当前库位">
          {{ statusForm.locationId }}
        </el-form-item>
        <el-form-item label="当前状态">
          <StatusTag
            :status="statusForm.currentStatus"
            :type-map="statusConfig.typeMap"
            :text-map="statusConfig.textMap"
          />
        </el-form-item>
        <el-form-item label="目标状态" prop="newStatus">
          <el-select
            v-model="statusForm.newStatus"
            placeholder="请选择目标状态"
            style="width: 100%"
          >
            <el-option
              v-for="status in allowedStatusOptions"
              :key="status.value"
              :label="status.label"
              :value="status.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button size="small" @click="statusDialogVisible = false">取消</el-button>
        <el-button type="primary" size="small" :loading="statusChanging" @click="confirmStatusChange">
          确定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import LocationSearch from './components/LocationSearch.vue'
import LocationTable from './components/LocationTable.vue'
import LocationFormDrawer from './components/LocationFormDrawer.vue'
import LocationDetailDrawer from './components/LocationDetailDrawer.vue'
import StatusTag from '@/components/StatusTag'
import {
  getLocationList,
  getLocationDetail,
  createLocation,
  updateLocation,
  updateLocationOccupancy
} from './api'
import {
  OCCUPANCY_STATUS_CONFIG,
  OCCUPANCY_STATUS_MAP,
  OCCUPANCY_STATUS_OPTIONS,
  STATUS_TRANSITION_RULES
} from './constants'
import { debounce } from '@/utils'

export default {
  name: 'StorageLocationManagement',
  components: {
    LocationSearch,
    LocationTable,
    LocationFormDrawer,
    LocationDetailDrawer,
    StatusTag
  },
  data() {
    return {
      loading: false,
      locationList: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0
      },
      queryParams: {
        keyword: '',
        storageAreaId: '',
        occupancyStatus: '',
        locationType: '',
        sortBy: 'createdAt:desc'
      },
      formDrawerVisible: false,
      formMode: 'create',
      currentLocation: null,
      detailDrawerVisible: false,
      detailLoading: false,
      statusDialogVisible: false,
      statusForm: {
        locationId: '',
        currentStatus: '',
        newStatus: ''
      },
      statusFormRules: {
        newStatus: [
          { required: true, message: '请选择目标状态', trigger: 'change' }
        ]
      },
      statusChanging: false,
      statusConfig: OCCUPANCY_STATUS_CONFIG,
      currentLocationId: null
    }
  },
  computed: {
    allowedStatusOptions() {
      if (!this.statusForm.currentStatus) return []

      const allowedStatuses = STATUS_TRANSITION_RULES[this.statusForm.currentStatus] || []
      return OCCUPANCY_STATUS_OPTIONS.filter(opt =>
        allowedStatuses.includes(opt.value)
      )
    }
  },
  created() {
    this.fetchLocationList = debounce(this._fetchLocationList, 300)
    this.fetchLocationList()
  },
  methods: {
    /**
     * 获取库位列表
     */
    async _fetchLocationList() {
      try {
        this.loading = true
        const params = {
          ...this.queryParams,
          page: this.pagination.page,
          limit: this.pagination.limit
        }

        // 清理空参数
        Object.keys(params).forEach(key => {
          if (params[key] === '' || params[key] === null || params[key] === undefined) {
            delete params[key]
          }
        })

        const response = await getLocationList(params)
        this.locationList = response.data.results || []
        this.pagination.total = response.data.totalResults || 0
      } catch (error) {
        console.error('获取库位列表失败:', error)
        const errorMsg = error.error?.message || error.message || '获取库位列表失败'
        this.$message.error(errorMsg)
      } finally {
        this.loading = false
      }
    },

    /**
     * 处理搜索
     */
    handleSearch(searchParams) {
      this.queryParams = {
        ...this.queryParams,
        ...searchParams
      }
      this.pagination.page = 1
      this.fetchLocationList()
    },

    /**
     * 处理重置
     */
    handleReset() {
      this.queryParams = {
        keyword: '',
        storageAreaId: '',
        occupancyStatus: '',
        locationType: '',
        sortBy: 'createdAt:desc'
      }
      this.pagination.page = 1
      this.fetchLocationList()
    },

    /**
     * 处理创建
     */
    handleCreate() {
      this.formMode = 'create'
      this.currentLocation = null
      this.formDrawerVisible = true
    },

    /**
     * 处理编辑
     */
    handleEdit(row) {
      this.formMode = 'edit'
      this.currentLocation = { ...row }
      this.formDrawerVisible = true
    },

    /**
     * 处理详情
     */
    async handleDetail(row) {
      try {
        this.detailDrawerVisible = true
        this.detailLoading = true
        const response = await getLocationDetail(row.id)
        this.currentLocation = response.data
      } catch (error) {
        console.error('获取库位详情失败:', error)
        const errorMsg = error.error?.message || error.message || '获取库位详情失败'
        this.$message.error(errorMsg)
        this.detailDrawerVisible = false
      } finally {
        this.detailLoading = false
      }
    },

    /**
     * 处理表单确认
     */
    async handleFormConfirm(formData) {
      try {
        if (this.formMode === 'create') {
          const response = await createLocation(formData)
          this.$message.success(response.message || '创建库位成功')
          this.formDrawerVisible = false
          this.fetchLocationList()
        } else if (this.formMode === 'edit') {
          const { ...updateData } = formData
          const response = await updateLocation(this.currentLocation.id, updateData)
          this.$message.success(response.message || '更新库位信息成功')
          this.formDrawerVisible = false
          this.fetchLocationList()
        }
      } catch (error) {
        console.error('操作失败:', error)
        const errorMsg = error.error?.message || error.message || '操作失败，请重试'
        this.$message.error(errorMsg)
      }
    },

    /**
     * 处理表单取消
     */
    handleFormCancel() {
      this.formDrawerVisible = false
      this.currentLocation = null
    },

    /**
     * 处理状态变更
     */
    async handleStatusChange(row, targetStatus = null) {
      this.currentLocationId = row.id
      this.statusForm = {
        locationId: row.locationId,
        currentStatus: row.occupancyStatus,
        newStatus: targetStatus || ''
      }

      if (targetStatus) {
        // 直接变更到指定状态
        const currentStatusText = OCCUPANCY_STATUS_MAP[row.occupancyStatus]
        const newStatusText = OCCUPANCY_STATUS_MAP[targetStatus]

        try {
          await this.$confirm(
            `确定要将库位 ${row.locationId} 的状态从 ${currentStatusText} 变更为 ${newStatusText} 吗？`,
            '确认操作',
            {
              type: 'warning',
              confirmButtonText: '确定',
              cancelButtonText: '取消'
            }
          )
          await this.performStatusChange(targetStatus)
        } catch (error) {
          if (error !== 'cancel') {
            console.error('状态变更失败:', error)
          }
        }
      } else {
        // 打开状态选择对话框
        this.statusDialogVisible = true
        this.$nextTick(() => {
          this.$refs.statusForm && this.$refs.statusForm.clearValidate()
        })
      }
    },

    /**
     * 确认状态变更
     */
    async confirmStatusChange() {
      try {
        await this.$refs.statusForm.validate()
        await this.performStatusChange(this.statusForm.newStatus)
        this.statusDialogVisible = false
      } catch (error) {
        if (error !== 'cancel') {
          console.error('表单验证失败:', error)
        }
      }
    },

    /**
     * 执行状态变更
     */
    async performStatusChange(newStatus) {
      try {
        this.statusChanging = true
        const response = await updateLocationOccupancy(this.currentLocationId, {
          occupancyStatus: newStatus
        })
        this.$message.success(response.message || '库位状态变更成功')
        this.fetchLocationList()
      } catch (error) {
        console.error('状态变更失败:', error)
        const errorMsg = error.error?.message || error.message || '状态变更失败，请重试'
        this.$message.error(errorMsg)
      } finally {
        this.statusChanging = false
      }
    },

    /**
     * 处理状态对话框关闭
     */
    handleStatusDialogClose() {
      this.statusForm = {
        locationId: '',
        currentStatus: '',
        newStatus: ''
      }
      this.currentLocationId = null
    },

    /**
     * 处理分页变化
     */
    handlePageChange(page) {
      this.pagination.page = page
      this.fetchLocationList()
    },

    /**
     * 处理每页数量变化
     */
    handleSizeChange(size) {
      this.pagination.limit = size
      this.pagination.page = 1
      this.fetchLocationList()
    },

    /**
     * 处理排序变化
     */
    handleSortChange({ prop, order }) {
      if (prop && order) {
        const orderMap = {
          ascending: 'asc',
          descending: 'desc'
        }
        this.queryParams.sortBy = `${prop}:${orderMap[order]}`
      } else {
        this.queryParams.sortBy = 'createdAt:desc'
      }
      this.fetchLocationList()
    }
  }
}
</script>

<style lang="scss" scoped>
.location-management-container {
  padding: 16px;
}
</style>

