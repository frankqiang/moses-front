/**
 * 文件名称：detail.vue
 * 文件描述：生产计划详情页面
 * 创建日期：2025-01-21
 * 修改记录：
 *   - 2025-01-21: 初始创建，实现P0阶段核心功能
 *   - 2025-10-17: 根据接口文档完全重构，确保数据处理和错误处理符合规范
 *   - 2025-10-18: 根据最新接口文档（2025-10-18更新）优化
 *     * 按钮控制逻辑符合最新状态转换规则
 *     * 增强审批重复提交检测
 *     * 添加 PENDING_APPROVAL 状态判断
 *     * 实时检查待处理审批请求
 *     * 简化UX：移除"提交审批"按钮，审批逻辑整合到"状态变更"和"取消"操作中
 */

<template>
  <div class="production-plan-detail">
    <!-- 页面头部 -->
    <div class="detail-header">
      <el-page-header :content="pageTitle" @back="handleBack" />
      <div class="header-actions">
        <el-button icon="el-icon-refresh" @click="handleRefresh">刷新</el-button>
        <el-button
          v-if="canChangeStatus"
          type="primary"
          icon="el-icon-refresh"
          @click="handleChangeStatus"
        >
          状态变更
        </el-button>
        <el-button
          v-if="canSplit"
          icon="el-icon-share"
          @click="handleSplit"
        >
          拆分
        </el-button>
        <el-button
          v-if="canAdjust"
          icon="el-icon-setting"
          @click="handleAdjust"
        >
          调整
        </el-button>
        <el-button
          v-if="canMerge"
          icon="el-icon-connection"
          @click="handleMerge"
        >
          合并
        </el-button>
        <el-button
          v-if="canEvaluate"
          icon="el-icon-data-analysis"
          @click="handleEvaluate"
        >
          可行性评估
        </el-button>
      </div>
    </div>

    <!-- 审批状态显示 -->
    <approval-status-banner
      v-if="planId && planData.planNumber"
      ref="approvalStatusBanner"
      :plan-id="planId"
      :plan-number="planData.planNumber"
      @view-approval-detail="handleViewApprovalDetail"
      @approval-cancelled="handleApprovalCancelled"
      @approval-status-change="handleApprovalStatusChange"
    />

    <!-- 加载状态 -->
    <div v-loading="loading" class="detail-content">
      <el-tabs v-model="activeTab" type="border-card">
        <!-- 基本信息Tab -->
        <el-tab-pane label="基本信息" name="basic">
          <basic-info
            ref="basicInfo"
            :plan-data="planData"
          />
        </el-tab-pane>

        <!-- 子批次列表Tab -->
        <el-tab-pane label="子批次列表" name="items">
          <items-table
            :items="planData.items || []"
            :loading="loading"
            @generate-task="handleGenerateTask"
          />
        </el-tab-pane>

        <!-- 变更日志Tab -->
        <el-tab-pane label="变更日志" name="changeLogs">
          <change-logs-timeline
            :change-logs="changeLogs"
            :loading="changeLogsLoading"
          />
          <!-- 分页 -->
          <div v-if="changeLogs.length > 0" class="pagination-wrapper">
            <el-pagination
              :current-page="changeLogsPagination.page"
              :page-sizes="[10, 20, 50]"
              :page-size="changeLogsPagination.limit"
              :total="changeLogsPagination.total"
              layout="total, sizes, prev, pager, next"
              @size-change="handleChangeLogsPageSizeChange"
              @current-change="handleChangeLogsPageChange"
            />
          </div>
        </el-tab-pane>

        <!-- 审批记录Tab -->
        <el-tab-pane label="审批记录" name="approvals">
          <approval-records
            ref="approvalRecords"
            :plan-id="planId"
            :plan-data="planData"
            @approval-processed="handleApprovalProcessed"
          />
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 拆分对话框 -->
    <split-dialog
      ref="splitDialog"
      :plan-data="planData"
      @success="handleSplitSuccess"
    />

    <!-- 调整对话框 -->
    <adjust-dialog
      ref="adjustDialog"
      :plan-data="planData"
      @success="handleAdjustSuccess"
    />

    <!-- 合并对话框 -->
    <merge-dialog
      ref="mergeDialog"
      @success="handleMergeSuccess"
    />

    <!-- 状态变更对话框 -->
    <status-change-dialog
      ref="statusChangeDialog"
      @success="handleStatusChangeSuccess"
    />

    <!-- 可行性评估对话框 -->
    <feasibility-dialog
      ref="feasibilityDialog"
    />

    <!-- 生成退火任务抽屉 -->
    <task-generate-from-plan-drawer
      :visible.sync="generateTaskDrawerVisible"
      :plan-item="selectedPlanItem"
      @success="handleGenerateTaskSuccess"
      @view-task-list="handleViewTaskList"
    />
  </div>
</template>

<script>
import BasicInfo from './components/detail/BasicInfo.vue'
import ItemsTable from './components/detail/ItemsTable.vue'
import ChangeLogsTimeline from './components/detail/ChangeLogsTimeline.vue'
import ApprovalRecords from './components/detail/ApprovalRecords.vue'
import ApprovalStatusBanner from './components/ApprovalStatusBanner.vue'
import AdjustDialog from './components/AdjustDialog.vue'
import SplitDialog from './components/SplitDialog.vue'
import MergeDialog from './components/MergeDialog.vue'
import StatusChangeDialog from './components/StatusChangeDialog.vue'
import FeasibilityDialog from './components/FeasibilityDialog.vue'
import TaskGenerateFromPlanDrawer from '@/views/production-management/annealing-task/components/TaskGenerateFromPlanDrawer.vue'
import { fetchPlanDetail, fetchAuditLogs } from './api'
import { getErrorMessage, PLAN_STATUS } from './constants'

export default {
  name: 'ProductionPlanDetail',
  components: {
    BasicInfo,
    ItemsTable,
    ChangeLogsTimeline,
    ApprovalRecords,
    ApprovalStatusBanner,
    AdjustDialog,
    SplitDialog,
    MergeDialog,
    StatusChangeDialog,
    FeasibilityDialog,
    TaskGenerateFromPlanDrawer
  },
  data() {
    return {
      planId: '',
      planData: {
        items: []
      },
      loading: false,
      activeTab: 'basic',
      // 变更日志相关数据（根据接口文档，默认limit为10）
      changeLogs: [],
      changeLogsLoading: false,
      changeLogsPagination: {
        page: 1,
        limit: 10,
        total: 0
      },
      // 生成退火任务相关
      generateTaskDrawerVisible: false,
      selectedPlanItem: null
    }
  },
  computed: {
    pageTitle() {
      return this.planData.planNumber ? `生产计划详情 - ${this.planData.planNumber}` : '生产计划详情'
    },

    /**
     * 是否可以进行状态变更
     *
     * 📢 根据最新接口文档（2025-10-18更新）：
     * - 《更新生产计划状态接口详细说明_已重构.md》
     *
     * 不允许状态变更的情况：
     * - 已完成和已取消是终态，不可再变更
     * - 已冻结的计划不允许任何状态变更
     * - 待审批状态（PENDING_APPROVAL）不允许直接状态变更，需等待审批完成
     */
    canChangeStatus() {
      // 如果计划数据未加载，不显示按钮
      if (!this.planData || !this.planData.status) {
        console.log('⚠️ canChangeStatus: 计划数据未加载')
        return false
      }

      const currentStatus = this.planData.status
      console.log('🔍 canChangeStatus 检查:', {
        currentStatus,
        isPendingApproval: currentStatus === PLAN_STATUS.PENDING_APPROVAL,
        comparison: `"${currentStatus}" === "${PLAN_STATUS.PENDING_APPROVAL}"`,
        isFrozen: this.planData.isFrozen
      })

      // 冻结状态不允许变更
      if (this.planData.isFrozen) {
        console.log('🚫 计划已冻结，禁用状态变更按钮')
        return false
      }

      // 终态不允许变更
      const terminalStatuses = [PLAN_STATUS.COMPLETED, PLAN_STATUS.CANCELLED]
      if (terminalStatuses.includes(currentStatus)) {
        console.log('🚫 终态状态，禁用状态变更按钮')
        return false
      }

      // 待审批状态不允许直接变更（需等待审批完成）
      if (currentStatus === PLAN_STATUS.PENDING_APPROVAL) {
        console.log('🚫 待审批状态，禁用状态变更按钮')
        return false
      }

      console.log('✅ 允许状态变更')
      return true
    },

    /**
     * 是否可以拆分
     *
     * 📢 根据接口文档《拆分生产计划接口详细说明_已重构.md》：
     * - 前置条件：计划状态必须为 RECEIVED（已接收）或 CONFIRMED（已确认）
     * - 待审批状态（PENDING_APPROVAL）需等待审批完成，不允许拆分
     * - 已冻结的计划不允许拆分
     */
    canSplit() {
      if (this.planData.isFrozen) {
        return false
      }
      if (this.planData.status === PLAN_STATUS.PENDING_APPROVAL) {
        return false
      }
      const allowedStatuses = [PLAN_STATUS.RECEIVED, PLAN_STATUS.CONFIRMED]
      return allowedStatuses.includes(this.planData.status)
    },

    /**
     * 是否可以调整
     *
     * 📢 根据业务流程文档（2025-10-18）：
     * - 前置条件是计划状态为RECEIVED或CONFIRMED
     * - 待审批状态（PENDING_APPROVAL）需等待审批完成，不允许调整
     * - 已冻结的计划不允许调整
     */
    canAdjust() {
      if (this.planData.isFrozen) {
        return false
      }
      if (this.planData.status === PLAN_STATUS.PENDING_APPROVAL) {
        return false
      }
      const allowedStatuses = [PLAN_STATUS.RECEIVED, PLAN_STATUS.CONFIRMED]
      return allowedStatuses.includes(this.planData.status)
    },

    /**
     * 是否可以合并
     *
     * 📢 根据业务流程文档（2025-10-18）：
     * - 待合并的计划必须状态相同且为CONFIRMED或PARTIALLY_RELEASED
     * - 待审批状态（PENDING_APPROVAL）需等待审批完成，不允许合并
     * - 已冻结的计划不允许合并
     */
    canMerge() {
      if (this.planData.isFrozen) {
        return false
      }
      if (this.planData.status === PLAN_STATUS.PENDING_APPROVAL) {
        return false
      }
      const allowedStatuses = [PLAN_STATUS.CONFIRMED, PLAN_STATUS.PARTIALLY_RELEASED]
      return allowedStatuses.includes(this.planData.status)
    },

    /**
     * 是否可以进行可行性评估
     * 根据业务流程：已确认及之后的状态可以评估
     */
    canEvaluate() {
      const allowedStatuses = [
        PLAN_STATUS.CONFIRMED,
        PLAN_STATUS.PENDING_APPROVAL,
        PLAN_STATUS.PARTIALLY_RELEASED,
        PLAN_STATUS.RELEASED,
        PLAN_STATUS.IN_PROGRESS
      ]
      return allowedStatuses.includes(this.planData.status)
    }
  },
  watch: {
    // 监听activeTab变化，当切换到变更日志Tab时加载数据
    activeTab(newTab) {
      if (newTab === 'changeLogs' && this.changeLogs.length === 0) {
        this.fetchChangeLogs()
      }
    }
  },
  created() {
    this.planId = this.$route.params.id
    if (!this.planId) {
      this.$message.error('缺少计划ID参数')
      this.handleBack()
      return
    }
    this.fetchDetail()
    // 如果路由参数指定打开变更日志Tab，则切换到该Tab
    if (this.$route.query.tab === 'changeLogs') {
      this.activeTab = 'changeLogs'
    }
  },
  methods: {
    /**
     * 加载计划详情
     * 根据接口文档：GET /v1/prod/plans/:planId
     * 响应格式：
     * {
     *   success: true,
     *   data: { 计划详情对象，包含items数组 },
     *   message: "获取生产计划详情成功",
     *   meta: { timestamp, requestId, version }
     * }
     */
    async fetchDetail() {
      try {
        this.loading = true
        const response = await fetchPlanDetail(this.planId)

        // 根据接口文档，响应结构为：{ success, data, message, meta }
        if (response.success && response.data) {
          // 确保items数组存在
          this.planData = {
            ...response.data,
            items: response.data.items || []
          }

          // 打印调试信息（包含按钮状态）
          console.log('📋 计划详情加载成功:', {
            planNumber: this.planData.planNumber,
            status: this.planData.status,
            itemsCount: this.planData.items.length,
            buttonStates: {
              canChangeStatus: this.canChangeStatus,
              canSplit: this.canSplit,
              canAdjust: this.canAdjust,
              canMerge: this.canMerge
            }
          })
        } else {
          // 区分失败和成功但无数据两种情况
          if (response.success === false) {
            // 请求失败，message 在 error 对象中
            const errorMsg = response.error?.message || '获取计划详情失败'
            this.$message.error(errorMsg)
          } else {
            // 成功但数据为空，message 在顶层
            const errorMsg = response.message || '获取计划详情失败：数据为空'
            this.$message.error(errorMsg)
          }
          this.handleBack()
        }
      } catch (error) {
        console.error('❌ 加载计划详情失败:', error)

        // 根据接口文档的错误响应处理
        const errorCode = error.response?.data?.error?.code
        const errorMessage = error.response?.data?.error?.message || getErrorMessage(error)

        // 特殊错误码处理
        if (errorCode === 'PRODUCTION_PLAN_NOT_FOUND' || error.response?.status === 404) {
          this.$message.error('生产计划不存在')
          this.handleBack()
        } else if (errorCode === 'VALIDATION_ERROR') {
          this.$message.error(`参数验证失败: ${errorMessage}`)
          this.handleBack()
        } else if (errorCode === 'FORBIDDEN' || error.response?.status === 403) {
          this.$message.error('无权限查看此生产计划')
          this.handleBack()
        } else if (errorCode === 'UNAUTHORIZED' || error.response?.status === 401) {
          this.$message.error('未授权，请重新登录')
          // 可以触发重新登录逻辑
        } else {
          // 其他错误
          this.$message.error(errorMessage)
        }
      } finally {
        this.loading = false
      }
    },

    /**
     * 加载变更日志
     * 根据新接口文档：GET /v1/prod/plans/audit-logs
     * 使用planId参数筛选特定计划的审计日志
     */
    async fetchChangeLogs() {
      try {
        this.changeLogsLoading = true

        const params = {
          planId: this.planId,
          page: this.changeLogsPagination.page,
          limit: this.changeLogsPagination.limit,
          sortBy: 'createdAt:desc'
        }

        console.log('📊 查询变更日志参数:', params)

        const response = await fetchAuditLogs(params)

        // 根据接口文档的响应格式处理数据
        if (response.success && response.data) {
          this.changeLogs = response.data.results || []
          this.changeLogsPagination = {
            page: response.data.page || 1,
            limit: response.data.limit || 20,
            total: response.data.totalResults || 0
          }

          console.log('✅ 变更日志加载成功:', {
            count: this.changeLogs.length,
            total: this.changeLogsPagination.total
          })
        } else {
          this.changeLogs = []
          console.warn('未查询到变更日志数据')
        }
      } catch (error) {
        console.error('❌ 加载变更日志失败:', error)
        const errorMessage = error.response?.data?.error?.message || getErrorMessage(error)
        this.$message.error(`查询变更日志失败: ${errorMessage}`)
        this.changeLogs = []
      } finally {
        this.changeLogsLoading = false
      }
    },

    /**
     * 处理变更日志分页大小变化
     */
    handleChangeLogsPageSizeChange(size) {
      this.changeLogsPagination.limit = size
      this.changeLogsPagination.page = 1
      this.fetchChangeLogs()
    },

    /**
     * 处理变更日志页码变化
     */
    handleChangeLogsPageChange(page) {
      this.changeLogsPagination.page = page
      this.fetchChangeLogs()
    },

    /**
     * 刷新详情
     */
    async handleRefresh() {
      await this.fetchDetail()
      this.$message.success('刷新成功')
    },

    /**
     * 返回列表页
     */
    handleBack() {
      this.$router.push('/production-management/production-plan')
    },

    /**
     * 打开拆分对话框
     */
    handleSplit() {
      this.$refs.splitDialog.open()
    },

    /**
     * 拆分成功
     */
    async handleSplitSuccess() {
      await this.fetchDetail()
    },

    /**
     * 打开调整对话框
     */
    handleAdjust() {
      this.$refs.adjustDialog.open()
    },

    /**
     * 调整成功
     */
    async handleAdjustSuccess() {
      await this.fetchDetail()
    },

    /**
     * 打开合并对话框
     */
    handleMerge() {
      this.$refs.mergeDialog.open()
    },

    /**
     * 合并成功
     */
    async handleMergeSuccess() {
      await this.fetchDetail()
    },

    /**
     * 处理状态变更
     */
    handleChangeStatus() {
      this.$refs.statusChangeDialog.open(this.planData)
    },

    /**
     * 状态变更成功
     */
    async handleStatusChangeSuccess() {
      await this.fetchDetail()
      // 刷新审批记录列表（状态变更可能自动创建审批）
      if (this.$refs.approvalRecords) {
        this.$refs.approvalRecords.fetchApprovals()
      }
    },

    /**
     * 处理可行性评估
     */
    handleEvaluate() {
      this.$refs.feasibilityDialog.open(this.planData)
    },

    /**
     * 审批处理成功后刷新详情
     */
    async handleApprovalProcessed() {
      await this.fetchDetail()
    },

    /**
     * 查看审批详情
     */
    handleViewApprovalDetail(approval) {
      // 切换到审批记录Tab并高亮对应的审批
      this.activeTab = 'approvals'

      // 可以进一步实现高亮显示特定审批的逻辑
      this.$nextTick(() => {
        console.log('查看审批详情:', approval)
      })
    },

    /**
     * 审批被撤销后刷新详情
     */
    async handleApprovalCancelled(approval) {
      console.log('审批已撤销:', approval)
      await this.fetchDetail()
      // 刷新审批记录列表
      if (this.$refs.approvalRecords) {
        this.$refs.approvalRecords.fetchApprovals()
      }
    },

    /**
     * 审批状态发生变化
     *
     * 当审批状态变化时（如新审批创建、审批完成、审批撤销），需要：
     * 1. 刷新计划详情（状态可能已变更）
     * 2. 强制更新计算属性（触发按钮显示/隐藏逻辑）
     */
    async handleApprovalStatusChange(statusInfo) {
      console.log('审批状态变化:', statusInfo)

      // 审批状态变化时，重新获取计划详情
      // 因为计划状态可能已经改变（如审批通过后从 PENDING_APPROVAL 变为 RELEASED）
      await this.fetchDetail()

      // 强制更新视图，确保按钮状态正确更新
      this.$forceUpdate()
    },

    /**
     * 处理生成退火任务
     * @param {Object} planItem - 选中的计划批次
     */
    handleGenerateTask(planItem) {
      // 保存选中的计划批次，并添加产品编码（产品编码在主计划层级）
      this.selectedPlanItem = {
        ...planItem,
        productCode: this.planData.productCode
      }
      // 打开生成任务抽屉
      this.generateTaskDrawerVisible = true
    },

    /**
     * 生成退火任务成功
     *
     * 📢 重要：后端会自动更新子批次状态为 SCHEDULED（已排程）
     * 参考：docs/接口文档/单独接口/创建退火任务接口详细说明.md
     */
    async handleGenerateTaskSuccess(result) {
      // 关闭生成任务抽屉
      this.generateTaskDrawerVisible = false

      // 刷新计划详情（后端已自动更新批次状态为 SCHEDULED）
      await this.fetchDetail()

      // 显示成功提示（如果后端没有返回消息）
      if (result && result.totalCount) {
        this.$message.success(`成功生成 ${result.totalCount} 个退火任务，子批次状态已更新为"已排程"`)
      }
    },

    /**
     * 查看任务列表
     */
    handleViewTaskList() {
      // 跳转到退火任务列表页面
      this.$router.push({ path: '/production-management/annealing-task' })
    }
  }
}
</script>

<style lang="scss" scoped>
.production-plan-detail {
  padding: 20px;

  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid #ebeef5;

    .header-actions {
      .el-button {
        margin-left: 12px;
      }
    }
  }

  .detail-content {
    min-height: 400px;

    ::v-deep .el-tabs {
      .el-tabs__header {
        margin: 0;
      }

      .el-tabs__content {
        padding: 20px;
      }
    }
  }

  // 分页组件样式
  .pagination-wrapper {
    margin-top: 20px;
    padding: 16px;
    text-align: right;
    background-color: #fff;
    border-top: 1px solid #ebeef5;
  }

  // 响应式设计
  @media (max-width: 768px) {
    padding: 10px;

    .detail-header {
      flex-direction: column;
      align-items: flex-start;

      .header-actions {
        margin-top: 12px;
        width: 100%;

        .el-button {
          margin-left: 0;
          margin-right: 8px;
          margin-bottom: 8px;
        }
      }
    }

    .pagination-wrapper {
      text-align: center;

      ::v-deep .el-pagination {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
      }
    }
  }
}
</style>

