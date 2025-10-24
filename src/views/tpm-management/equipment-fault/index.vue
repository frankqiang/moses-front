/**
 * 文件名称：index.vue
 * 文件描述：设备故障管理主页面
 * 创建日期：2025-01-20
 * 修改记录：
 *   - 2025-01-20: 初始创建
 *   - 2025-01-20: 集成故障详情组件
 */
<template>
  <div class="equipment-fault-container">
    <!-- 列表视图 -->
    <template v-if="currentView === 'list'">
      <FaultSearch
        v-model="queryParams"
        :loading="loading"
        :equipment-options="equipmentOptions"
        :user-options="userOptions"
        @search="handleSearch"
        @reset="handleReset"
      />

      <FaultTable
        ref="faultTable"
        :data="tableData"
        :loading="loading"
        :load-error="loadError"
        :pagination="paginationData"
        :sort-by="queryParams.sortBy"
        @refresh="handleRefresh"
        @pagination-change="handlePaginationChange"
        @sort-change="handleSortChange"
        @retry="handleRetry"
        @create="handleCreate"
        @view="handleView"
        @process="handleProcess"
        @close="handleClose"
      />

      <!-- 故障报告表单抽屉 -->
      <FailureReportFormDrawer
        v-model="formDrawerVisible"
        :mode="formMode"
        :failure-id="currentFailureId"
        @created="handleCreated"
      />
    </template>

    <!-- 详情视图 -->
    <FaultDetail
      v-else-if="currentView === 'detail'"
      :failure-id="currentFailureId"
      @back="handleBackToList"
      @action="handleDetailAction"
    />

    <!-- 故障处理流程对话框 -->
    <StartRepairDialog
      v-if="startRepairDialogVisible"
      :visible.sync="startRepairDialogVisible"
      :failure-id="currentProcessFailureId"
      :failure-code="currentProcessFailure.failureCode"
      :failure-level="currentProcessFailure.failureLevel"
      :impact-degree="currentProcessFailure.impactDegree"
      :user-list="userOptions"
      @success="handleProcessSuccess"
    />

    <CompleteRepairDialog
      v-if="completeRepairDialogVisible"
      :visible.sync="completeRepairDialogVisible"
      :failure-id="currentProcessFailureId"
      :failure-code="currentProcessFailure.failureCode"
      :spare-parts-list="sparePartsList"
      @success="handleProcessSuccess"
    />

    <VerifyRepairDialog
      v-if="verifyRepairDialogVisible"
      :visible.sync="verifyRepairDialogVisible"
      :failure-id="currentProcessFailureId"
      :failure-code="currentProcessFailure.failureCode"
      :repairer-id="currentProcessFailure.repairerId"
      :repairer-name="currentProcessFailure.repairerName"
      :repair-actions="currentProcessFailure.repairActions"
      :user-list="userOptions"
      @success="handleProcessSuccess"
    />

    <CloseFailureDialog
      v-if="closeFailureDialogVisible"
      :visible.sync="closeFailureDialogVisible"
      :failure-id="currentProcessFailureId"
      :failure-code="currentProcessFailure.failureCode"
      :current-status="currentProcessFailure.status"
      @success="handleProcessSuccess"
    />

    <RootCauseAnalysisDialog
      v-if="rootCauseAnalysisDialogVisible"
      :visible.sync="rootCauseAnalysisDialogVisible"
      :failure-id="currentProcessFailureId"
      :failure-code="currentProcessFailure.failureCode"
      @success="handleProcessSuccess"
    />
  </div>
</template>

<script>
import FaultSearch from './components/FaultSearch.vue'
import FaultTable from './components/FaultTable.vue'
import FailureReportFormDrawer from './components/FailureReportFormDrawer.vue'
import FaultDetail from './components/FaultDetail.vue'
import StartRepairDialog from './components/StartRepairDialog.vue'
import CompleteRepairDialog from './components/CompleteRepairDialog.vue'
import VerifyRepairDialog from './components/VerifyRepairDialog.vue'
import CloseFailureDialog from './components/CloseFailureDialog.vue'
import RootCauseAnalysisDialog from './components/RootCauseAnalysisDialog.vue'
import { getEquipmentFailures, getEquipmentFailureById } from '@/api/mdm/tpm/equipmentFailure'
import { DEFAULT_PAGINATION, DEFAULT_SORT, SUCCESS_MESSAGES, ERROR_MESSAGES, FAILURE_STATUS } from './constants'
import { buildQueryParams } from './utils'

export default {
  name: 'EquipmentFault',
  components: {
    FaultSearch,
    FaultTable,
    FailureReportFormDrawer,
    FaultDetail,
    StartRepairDialog,
    CompleteRepairDialog,
    VerifyRepairDialog,
    CloseFailureDialog,
    RootCauseAnalysisDialog
  },
  data() {
    return {
      currentView: 'list',
      tableData: [],
      loading: false,
      loadError: false,
      queryParams: {
        ...DEFAULT_PAGINATION,
        sortBy: DEFAULT_SORT
      },
      paginationData: {
        page: 1,
        limit: 10,
        total: 0
      },
      equipmentOptions: [],
      userOptions: [],
      sparePartsList: [],
      formDrawerVisible: false,
      formMode: 'create',
      currentFailureId: null,
      // 处理流程对话框状态
      startRepairDialogVisible: false,
      completeRepairDialogVisible: false,
      verifyRepairDialogVisible: false,
      closeFailureDialogVisible: false,
      rootCauseAnalysisDialogVisible: false,
      currentProcessFailureId: null,
      currentProcessFailure: {}
    }
  },
  created() {
    this.fetchData()
    this.fetchEquipmentOptions()
    this.fetchUserOptions()
    this.fetchSparePartsOptions()
  },
  methods: {
    async fetchData() {
      this.loading = true
      this.loadError = false

      try {
        const params = this.buildQueryParams()
        const response = await getEquipmentFailures(params)

        if (response && response.data) {
          this.tableData = response.data.results || []
          this.paginationData = {
            page: response.data.page || 1,
            limit: response.data.limit || 10,
            total: response.data.totalResults || 0
          }

          if (this.$refs.faultTable) {
            this.$refs.faultTable.refreshSucceed(response.message || SUCCESS_MESSAGES.QUERY_SUCCESS)
          }
        }
      } catch (error) {
        console.error('查询故障列表失败:', error)
        this.loadError = error.message || ERROR_MESSAGES.QUERY_FAILED
        this.tableData = []

        if (this.$refs.faultTable) {
          this.$refs.faultTable.refreshFail(error.message || ERROR_MESSAGES.QUERY_FAILED)
        }

        this.$message.error(error.message || ERROR_MESSAGES.QUERY_FAILED)
      } finally {
        this.loading = false
      }
    },
    buildQueryParams() {
      // 使用工具函数过滤空值
      return buildQueryParams({
        page: this.queryParams.page || 1,
        limit: this.queryParams.limit || 10,
        sortBy: this.queryParams.sortBy,
        equipmentId: this.queryParams.equipmentId,
        failureLevel: this.queryParams.failureLevel,
        failureType: this.queryParams.failureType,
        status: this.queryParams.status,
        reporterId: this.queryParams.reporterId,
        repairerId: this.queryParams.repairerId,
        isRepeatFailure: this.queryParams.isRepeatFailure,
        startDate: this.queryParams.startDate,
        endDate: this.queryParams.endDate,
        search: this.queryParams.search
      })
    },
    async fetchEquipmentOptions() {
      // TODO: 实现设备选项数据获取
      this.equipmentOptions = []
    },
    async fetchUserOptions() {
      // TODO: 实现用户选项数据获取
      this.userOptions = []
    },
    async fetchSparePartsOptions() {
      // TODO: 实现备件选项数据获取
      this.sparePartsList = []
    },
    handleSearch(query) {
      this.queryParams = {
        ...this.queryParams,
        ...query,
        page: 1
      }
      this.fetchData()
    },
    handleReset(query) {
      this.queryParams = {
        ...query,
        page: 1
      }
      this.fetchData()
    },
    handleRefresh() {
      this.fetchData()
    },
    handlePaginationChange({ page, limit }) {
      this.queryParams = {
        ...this.queryParams,
        page,
        limit
      }
      this.fetchData()
    },
    handleSortChange(sortBy) {
      this.queryParams = {
        ...this.queryParams,
        sortBy: sortBy || DEFAULT_SORT,
        page: 1
      }
      this.fetchData()
    },
    handleRetry() {
      this.fetchData()
    },
    handleCreate() {
      this.formMode = 'create'
      this.currentFailureId = null
      this.formDrawerVisible = true
    },
    handleCreated() {
      this.formDrawerVisible = false
      this.fetchData()
    },
    handleView(row) {
      this.currentFailureId = row.id
      this.currentView = 'detail'
    },
    handleBackToList() {
      this.currentView = 'list'
      this.currentFailureId = null
      this.fetchData()
    },
    async handleDetailAction({ action, failureId }) {
      try {
        // 获取故障详情
        const response = await getEquipmentFailureById(failureId)
        const failureData = response.data || {}

        this.currentProcessFailureId = failureId
        this.currentProcessFailure = {
          failureCode: failureData.failureCode,
          failureLevel: failureData.failureLevel,
          impactDegree: failureData.impactDegree,
          status: failureData.status,
          repairerId: failureData.repairerId,
          repairerName: failureData.repairer?.name || '',
          repairActions: failureData.repairActions || ''
        }

        // 根据操作类型打开对应对话框
        switch (action) {
          case 'start-repair':
            this.validateStatusTransition(failureData.status, [FAILURE_STATUS.PENDING, FAILURE_STATUS.RESOLVED])
            this.startRepairDialogVisible = true
            break
          case 'complete-repair':
            this.validateStatusTransition(failureData.status, [FAILURE_STATUS.IN_PROGRESS])
            this.completeRepairDialogVisible = true
            break
          case 'verify':
            this.validateStatusTransition(failureData.status, [FAILURE_STATUS.RESOLVED])
            this.verifyRepairDialogVisible = true
            break
          case 'root-cause-analysis':
            this.validateStatusTransition(failureData.status, [FAILURE_STATUS.RESOLVED, FAILURE_STATUS.VERIFIED])
            this.rootCauseAnalysisDialogVisible = true
            break
          case 'close':
            this.closeFailureDialogVisible = true
            break
          case 'edit':
            this.formMode = 'edit'
            this.currentFailureId = failureId
            this.formDrawerVisible = true
            break
          default:
            this.$message.warning(`未知操作: ${action}`)
        }
      } catch (error) {
        this.$message.error(error.message || '获取故障信息失败')
      }
    },
    // 验证状态流转
    validateStatusTransition(currentStatus, allowedStatuses) {
      if (!allowedStatuses.includes(currentStatus)) {
        const statusNames = allowedStatuses.map(s => `"${s}"`).join('、')
        throw new Error(`当前状态不允许此操作，只有${statusNames}状态才能执行`)
      }
    },
    async handleProcess(row) {
      // 从列表快速操作
      this.currentProcessFailureId = row.id
      this.currentProcessFailure = {
        failureCode: row.failureCode,
        failureLevel: row.failureLevel,
        impactDegree: row.impactDegree,
        status: row.status,
        repairerId: row.repairerId,
        repairerName: row.repairer?.name || '',
        repairActions: row.repairActions || ''
      }

      // 根据当前状态判断操作类型
      switch (row.status) {
        case FAILURE_STATUS.PENDING:
          this.startRepairDialogVisible = true
          break
        case FAILURE_STATUS.IN_PROGRESS:
          this.completeRepairDialogVisible = true
          break
        case FAILURE_STATUS.RESOLVED:
          this.verifyRepairDialogVisible = true
          break
        default:
          this.$message.warning('当前状态无法进行快速操作')
      }
    },
    async handleClose(row) {
      this.currentProcessFailureId = row.id
      this.currentProcessFailure = {
        failureCode: row.failureCode,
        status: row.status
      }
      this.closeFailureDialogVisible = true
    },
    // 处理成功回调
    handleProcessSuccess() {
      if (this.currentView === 'detail') {
        // 详情页：刷新详情
        this.$nextTick(() => {
          // 触发详情组件重新加载
          const detailComp = this.$children.find(c => c.$options.name === 'FaultDetail')
          if (detailComp && detailComp.fetchFailureDetail) {
            detailComp.fetchFailureDetail()
          }
        })
      } else {
        // 列表页：刷新列表
        this.fetchData()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.equipment-fault-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 50px);
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>

