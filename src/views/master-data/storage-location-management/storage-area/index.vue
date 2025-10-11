<!--
文件名称: index.vue
文件描述: 库区管理页面
创建日期: 2025-01-20
修改记录:
  - 2025-01-20: 初始创建
  - 2025-01-20: 重构为独立页面
-->

<template>
  <div class="area-management app-container">
    <!-- 搜索表单 -->
    <area-search
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- 表格 -->
    <area-table
      :table-data="tableData"
      :loading="loading"
      :pagination="pagination"
      @create="handleCreate"
      @refresh="handleRefresh"
      @view="handleView"
      @edit="handleEdit"
      @status-change="handleStatusChange"
      @sort-change="handleSortChange"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
    />

    <!-- 创建/编辑表单抽屉 -->
    <area-form-drawer
      :visible.sync="formDrawerVisible"
      :mode="formMode"
      :initial-data="currentRow"
      :loading="formLoading"
      @confirm="handleFormConfirm"
    />

    <!-- 详情抽屉 -->
    <area-detail-drawer
      :visible.sync="detailDrawerVisible"
      :detail-data="currentRow"
      :location-count="locationCount"
    />
  </div>
</template>

<script>
import AreaSearch from './components/AreaSearch.vue'
import AreaTable from './components/AreaTable.vue'
import AreaFormDrawer from './components/AreaFormDrawer.vue'
import AreaDetailDrawer from './components/AreaDetailDrawer.vue'
import {
  createStorageArea,
  getStorageAreas,
  getStorageAreaById,
  updateStorageArea
} from './api'
import {
  DEFAULT_PAGE_CONFIG,
  DEFAULT_SORT_CONFIG
} from './constants'
import { debounce } from '@/utils'

export default {
  name: 'StorageAreaManagement',
  components: {
    AreaSearch,
    AreaTable,
    AreaFormDrawer,
    AreaDetailDrawer
  },
  data() {
    return {
      // 搜索参数
      searchParams: {
        keyword: '',
        areaType: '',
        status: ''
      },
      // 表格数据
      tableData: [],
      loading: false,
      // 分页参数
      pagination: {
        page: DEFAULT_PAGE_CONFIG.page,
        limit: DEFAULT_PAGE_CONFIG.limit,
        total: 0
      },
      // 排序参数
      sortBy: DEFAULT_SORT_CONFIG.sortBy,
      // 表单抽屉
      formDrawerVisible: false,
      formMode: 'create',
      formLoading: false,
      // 详情抽屉
      detailDrawerVisible: false,
      locationCount: null,
      // 当前操作行
      currentRow: null
    }
  },
  created() {
    this.loadTableData()
  },
  methods: {
    // 加载表格数据
    async loadTableData() {
      this.loading = true
      try {
        const params = {
          ...this.searchParams,
          page: this.pagination.page,
          limit: this.pagination.limit,
          sortBy: this.sortBy
        }

        // 移除空值参数
        Object.keys(params).forEach(key => {
          if (params[key] === '' || params[key] === null || params[key] === undefined) {
            delete params[key]
          }
        })

        const response = await getStorageAreas(params)
        this.tableData = response.data.results || []
        this.pagination.total = response.data.totalResults || 0
      } catch (error) {
        console.error('获取列表失败:', error)
        const errorMsg = error.error?.message || error.message || '加载库区列表失败'
        this.$message.error(errorMsg)
      } finally {
        this.loading = false
      }
    },

    // 搜索
    handleSearch(values) {
      this.searchParams = { ...values }
      this.pagination.page = 1
      this.loadTableData()
    },

    // 重置搜索
    handleReset() {
      this.searchParams = {
        keyword: '',
        areaType: '',
        status: ''
      }
      this.pagination.page = 1
      this.sortBy = DEFAULT_SORT_CONFIG.sortBy
      this.loadTableData()
    },

    // 刷新
    handleRefresh: debounce(function() {
      this.loadTableData()
    }, 300),

    // 排序变化
    handleSortChange(sortBy) {
      this.sortBy = sortBy || DEFAULT_SORT_CONFIG.sortBy
      this.loadTableData()
    },

    // 页码变化
    handlePageChange(page) {
      this.pagination.page = page
      this.loadTableData()
    },

    // 每页数量变化
    handleSizeChange(limit) {
      this.pagination.limit = limit
      this.pagination.page = 1
      this.loadTableData()
    },

    // 创建
    handleCreate() {
      this.formMode = 'create'
      this.currentRow = null
      this.formDrawerVisible = true
    },

    // 查看详情
    async handleView(row) {
      try {
        const response = await getStorageAreaById(row.id)
        this.currentRow = response.data
        // TODO: 获取关联库位数量(需要后续实现库位管理后调用)
        this.locationCount = 0
        this.detailDrawerVisible = true
      } catch (error) {
        console.error('获取详情失败:', error)
        const errorMsg = error.error?.message || error.message || '获取库区详情失败'
        this.$message.error(errorMsg)
      }
    },

    // 编辑
    handleEdit(row) {
      this.formMode = 'edit'
      this.currentRow = { ...row }
      this.formDrawerVisible = true
    },

    // 状态切换
    async handleStatusChange(row) {
      const newStatus = row.status === 'enabled' ? 'disabled' : 'enabled'
      const confirmMessage = newStatus === 'disabled'
        ? '禁用库区后将无法添加新库位，确定要禁用吗？'
        : '确定要启用该库区吗？'

      try {
        await this.$confirm(confirmMessage, '确认操作', {
          type: 'warning',
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        })

        const response = await updateStorageArea(row.id, { status: newStatus })
        this.$message.success(response.message || '库区状态变更成功')
        this.loadTableData()
      } catch (error) {
        if (error !== 'cancel') {
          const errorMsg = error.error?.message || error.message || '状态切换失败'
          this.$message.error(errorMsg)
        }
      }
    },

    // 表单确认
    async handleFormConfirm(formData) {
      this.formLoading = true
      try {
        if (this.formMode === 'create') {
          const response = await createStorageArea(formData)
          this.$message.success(response.message || '创建库区成功')
        } else {
          const response = await updateStorageArea(this.currentRow.id, formData)
          this.$message.success(response.message || '更新库区信息成功')
        }
        this.formDrawerVisible = false
        this.loadTableData()
      } catch (error) {
        console.error('操作失败:', error)
        const errorMsg = error.error?.message || error.message || (this.formMode === 'create' ? '创建库区失败' : '更新库区失败')
        this.$message.error(errorMsg)
      } finally {
        this.formLoading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.area-management {
  padding: 16px;
}
</style>

