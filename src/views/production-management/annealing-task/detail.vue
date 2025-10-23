/**
 * 文件名称：detail.vue
 * 文件描述：退火任务详情页面
 * 创建日期：2025-10-18
 * 修改记录：
 *   - 2025-10-18: 初始创建，完成P0和P1第9项任务
 */

<template>
  <div class="annealing-task-detail">
    <!-- 页面头部 -->
    <div class="page-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/production-management/annealing-task' }">
          退火任务管理
        </el-breadcrumb-item>
        <el-breadcrumb-item>任务详情</el-breadcrumb-item>
      </el-breadcrumb>
      <div class="header-actions">
        <el-button
          v-if="canUpdateStatus"
          type="success"
          icon="el-icon-s-promotion"
          @click="handleUpdateStatus"
        >
          更新状态
        </el-button>
        <el-button
          v-if="canBindMaterial"
          type="primary"
          icon="el-icon-link"
          @click="handleBindMaterial"
        >
          绑定物料
        </el-button>
        <el-button
          icon="el-icon-refresh"
          :loading="loading"
          @click="handleRefresh"
        >
          刷新
        </el-button>
        <el-button
          icon="el-icon-back"
          @click="handleBack"
        >
          返回
        </el-button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading && !taskDetail" v-loading="true" class="loading-container" />

    <!-- 错误状态 -->
    <el-alert
      v-if="loadError"
      type="error"
      :title="loadError"
      :closable="false"
      show-icon
      style="margin-bottom: 16px"
    >
      <el-button type="text" @click="handleRefresh">重新加载</el-button>
    </el-alert>

    <!-- 详情内容 -->
    <div v-if="taskDetail && !loadError" class="detail-content">
      <!-- 基本信息 -->
      <basic-info :task-data="taskDetail.task" />

      <!-- 产品信息与工艺模板 -->
      <product-info
        :task-data="taskDetail.task"
        :product-info="taskDetail.productInfo"
        :process-info="taskDetail.processInfo"
      />

      <!-- 生产计划信息 -->
      <plan-info
        :plan-info="taskDetail.planInfo"
        :plan-item-info="taskDetail.planItemInfo"
        @view-plan="handleViewPlan"
      />

      <!-- 排程信息 -->
      <schedule-info :schedule-info="taskDetail.scheduleInfo" />

      <!-- 执行信息 -->
      <execution-info :execution-info="taskDetail.executionInfo" />

      <!-- 任务执行进度（P1第9项） -->
      <task-progress
        v-if="shouldShowProgress"
        :progress-data="progressData"
        :refreshing="progressRefreshing"
        @refresh="handleRefreshProgress"
      />

      <!-- 物料明细 -->
      <material-list :materials="taskDetail.materials || []" />
    </div>

    <!-- 物料绑定对话框 -->
    <material-bind-dialog
      :visible.sync="bindDialogVisible"
      :task-info="bindTaskInfo"
      @success="handleBindSuccess"
    />

    <!-- 状态更新对话框 -->
    <status-update-dialog
      :visible.sync="statusUpdateDialogVisible"
      :task-id="taskId"
      :task-code="taskDetail ? taskDetail.task.taskCode : ''"
      :current-status="taskDetail ? taskDetail.task.status : ''"
      @success="handleStatusUpdateSuccess"
    />
  </div>
</template>

<script>
import { fetchAnnealingTaskDetail, fetchTaskProgress } from './api'
import { ERROR_MESSAGES, TASK_STATUS, STATE_TRANSITIONS } from './constants'
import BasicInfo from './components/detail/BasicInfo.vue'
import ProductInfo from './components/detail/ProductInfo.vue'
import PlanInfo from './components/detail/PlanInfo.vue'
import ScheduleInfo from './components/detail/ScheduleInfo.vue'
import ExecutionInfo from './components/detail/ExecutionInfo.vue'
import MaterialList from './components/detail/MaterialList.vue'
import TaskProgress from './components/detail/TaskProgress.vue'
import MaterialBindDialog from './components/MaterialBindDialog.vue'
import StatusUpdateDialog from './components/StatusUpdateDialog.vue'

export default {
  name: 'AnnealingTaskDetail',
  components: {
    BasicInfo,
    ProductInfo,
    PlanInfo,
    ScheduleInfo,
    ExecutionInfo,
    MaterialList,
    TaskProgress,
    MaterialBindDialog,
    StatusUpdateDialog
  },
  data() {
    return {
      taskId: null,
      taskDetail: null,
      progressData: null,
      loading: false,
      progressRefreshing: false,
      loadError: null,
      bindDialogVisible: false,
      statusUpdateDialogVisible: false
    }
  },
  computed: {
    shouldShowProgress() {
      // 只有在已排程及之后的状态才显示进度
      const progressStatuses = [
        'scheduled',
        'waiting-loading',
        'loading',
        'waiting-execute',
        'in-progress',
        'waiting-unload',
        'completed'
      ]
      return this.taskDetail &&
        this.taskDetail.task &&
        progressStatuses.includes(this.taskDetail.task.status)
    },
    // 是否可以绑定物料（仅draft和pending-schedule状态）
    canBindMaterial() {
      if (!this.taskDetail || !this.taskDetail.task) return false
      const status = this.taskDetail.task.status
      return status === TASK_STATUS.DRAFT || status === TASK_STATUS.PENDING_SCHEDULE
    },
    // 是否可以更新状态（非终态都可以更新）
    canUpdateStatus() {
      if (!this.taskDetail || !this.taskDetail.task) return false
      const status = this.taskDetail.task.status
      const finalStatuses = [TASK_STATUS.COMPLETED, TASK_STATUS.CANCELLED, TASK_STATUS.TERMINATED]
      return !finalStatuses.includes(status) && STATE_TRANSITIONS[status] && STATE_TRANSITIONS[status].length > 0
    },
    // 物料绑定对话框所需的任务信息
    bindTaskInfo() {
      if (!this.taskDetail || !this.taskDetail.task) {
        return {
          taskId: '',
          taskCode: '',
          productCode: '',
          plannedWeight: 0,
          actualWeight: 0
        }
      }
      const task = this.taskDetail.task
      return {
        taskId: task.id,
        taskCode: task.taskCode,
        productCode: task.productCode,
        plannedWeight: parseFloat(task.plannedWeight || 0),
        actualWeight: parseFloat(task.actualWeight || 0)
      }
    }
  },
  mounted() {
    this.taskId = this.$route.params.id
    if (!this.taskId) {
      this.$message.error('缺少任务ID参数')
      this.handleBack()
      return
    }
    this.loadTaskDetail()
  },
  methods: {
    async loadTaskDetail() {
      this.loading = true
      this.loadError = null
      try {
        const response = await fetchAnnealingTaskDetail(this.taskId)

        if (response && response.data) {
          this.taskDetail = response.data

          // 如果应该显示进度，则加载进度数据
          if (this.shouldShowProgress) {
            await this.loadTaskProgress()
          }
        }
      } catch (error) {
        console.error('获取退火任务详情失败:', error)
        const errorMessage = error.response?.data?.error?.message || ERROR_MESSAGES.FETCH_DETAIL
        this.loadError = errorMessage
        this.$message.error(errorMessage)
      } finally {
        this.loading = false
      }
    },
    async loadTaskProgress() {
      try {
        const response = await fetchTaskProgress(this.taskId)
        if (response && response.data) {
          this.progressData = response.data
        }
      } catch (error) {
        console.error('获取任务进度失败:', error)
        // 进度获取失败不影响详情展示，只记录错误
      }
    },
    async handleRefreshProgress() {
      this.progressRefreshing = true
      try {
        await this.loadTaskProgress()
        this.$message.success('进度已刷新')
      } catch (error) {
        const errorMessage = error.response?.data?.error?.message || '刷新进度失败'
        this.$message.error(errorMessage)
      } finally {
        this.progressRefreshing = false
      }
    },
    handleRefresh() {
      this.loadTaskDetail()
    },
    handleBack() {
      this.$router.push('/production-management/annealing-task')
    },
    handleViewPlan(planId) {
      // 跳转到生产计划详情页
      this.$router.push(`/production-management/production-plan/${planId}`)
    },
    handleBindMaterial() {
      this.bindDialogVisible = true
    },
    handleBindSuccess(data) {
      // 绑定成功后刷新任务详情
      this.loadTaskDetail()
    },
    handleUpdateStatus() {
      this.statusUpdateDialogVisible = true
    },
    handleStatusUpdateSuccess(data) {
      // 状态更新成功后刷新任务详情
      this.loadTaskDetail()
    }
  }
}
</script>

<style lang="scss" scoped>
.annealing-task-detail {
  padding: 20px;
  background-color: #f0f2f5;
  min-height: calc(100vh - 84px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px 20px;
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  ::v-deep .el-breadcrumb {
    font-size: 14px;
  }

  .header-actions {
    display: flex;
    gap: 12px;
  }
}

.loading-container {
  min-height: 400px;
  background: white;
  border-radius: 4px;
}

.detail-content {
  // 内容样式由各个卡片组件自己控制
}
</style>

