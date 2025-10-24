<template>
  <div v-loading="loading" class="plan-detail">
    <!-- 页面头部 -->
    <div class="detail-header">
      <div class="header-left">
        <el-page-header :content="pageTitle" @back="handleBack" />
      </div>
      <div class="header-right">
        <el-button
          icon="el-icon-refresh"
          size="medium"
          @click="handleRefresh"
        >
          刷新
        </el-button>
        <el-button
          v-if="canViewGantt"
          icon="el-icon-data-line"
          size="medium"
          type="primary"
          @click="handleViewGantt"
        >
          查看甘特图
        </el-button>
        <el-button
          v-if="canPublish"
          icon="el-icon-check"
          size="medium"
          type="success"
          @click="handlePublish"
        >
          发布方案
        </el-button>
        <el-button
          v-if="canCancel"
          icon="el-icon-close"
          size="medium"
          type="danger"
          @click="handleCancelPlan"
        >
          取消方案
        </el-button>
      </div>
    </div>

    <!-- Tab标签页 -->
    <el-tabs v-model="activeTab" class="detail-tabs" @tab-click="handleTabClick">
      <!-- 基本信息 -->
      <el-tab-pane label="基本信息" name="basic">
        <basic-info-panel
          v-if="planDetail"
          :plan="planDetail"
        />
      </el-tab-pane>

      <!-- 排程结果 -->
      <el-tab-pane name="items">
        <span slot="label">
          排程结果
          <el-badge
            v-if="planDetail && planDetail.taskCount"
            :value="planDetail.taskCount"
            class="tab-badge"
          />
        </span>
        <schedule-items-panel
          v-if="planDetail"
          :plan-id="planId"
          :plan-status="planDetail.status"
          :items="scheduleItems"
          :conflicts="conflicts"
          @highlight-conflict="handleHighlightConflict"
          @refresh="handleRefresh"
        />
      </el-tab-pane>

      <!-- 冲突记录 -->
      <el-tab-pane name="conflicts">
        <span slot="label">
          冲突记录
          <el-badge
            v-if="planDetail && planDetail.conflictCount > 0"
            :value="planDetail.conflictCount"
            type="danger"
            class="tab-badge"
          />
        </span>
        <conflicts-panel
          v-if="planDetail"
          :plan-id="planId"
          :conflicts="conflicts"
          @locate-task="handleLocateTask"
        />
      </el-tab-pane>

      <!-- 操作日志 -->
      <el-tab-pane label="操作日志" name="logs">
        <logs-panel
          v-if="planDetail"
          :logs="operationLogs"
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { fetchSchedulePlanDetail, fetchScheduleConflicts, publishSchedulePlan, cancelSchedulePlan } from '../api'
import BasicInfoPanel from './PlanDetailPanels/BasicInfoPanel.vue'
import ScheduleItemsPanel from './PlanDetailPanels/ScheduleItemsPanel.vue'
import ConflictsPanel from './PlanDetailPanels/ConflictsPanel.vue'
import LogsPanel from './PlanDetailPanels/LogsPanel.vue'

export default {
  name: 'PlanDetail',
  components: {
    BasicInfoPanel,
    ScheduleItemsPanel,
    ConflictsPanel,
    LogsPanel
  },
  props: {
    planId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      loading: false,
      activeTab: 'basic',
      planDetail: null,
      scheduleItems: [],
      conflicts: [],
      operationLogs: [],
      autoRefreshTimer: null,
      highlightedTaskIds: [] // 用于高亮显示的任务ID列表
    }
  },
  computed: {
    pageTitle() {
      if (this.planDetail) {
        return `${this.planDetail.planCode || ''} - ${this.planDetail.planName || '排程方案详情'}`
      }
      return '排程方案详情'
    },
    canViewGantt() {
      return this.planDetail && ['generated', 'published'].includes(this.planDetail.status)
    },
    canPublish() {
      return this.planDetail && this.planDetail.status === 'generated'
    },
    canCancel() {
      return this.planDetail && ['draft', 'generated'].includes(this.planDetail.status)
    },
    isComputing() {
      return this.planDetail && this.planDetail.status === 'computing'
    }
  },
  watch: {
    isComputing: {
      immediate: true,
      handler(val) {
        if (val) {
          this.startAutoRefresh()
        } else {
          this.stopAutoRefresh()
        }
      }
    }
  },
  created() {
    this.loadPlanDetail()
  },
  beforeDestroy() {
    this.stopAutoRefresh()
  },
  methods: {
    /**
     * 加载排程方案详情
     */
    async loadPlanDetail() {
      try {
        this.loading = true
        const response = await fetchSchedulePlanDetail(this.planId)

        if (response.success && response.data) {
          const { plan, items, conflicts, logs } = response.data
          this.planDetail = plan
          this.scheduleItems = items || []
          this.conflicts = conflicts || []
          this.operationLogs = logs || []
        } else {
          this.$message.error(response.message || '获取排程方案详情失败')
        }
      } catch (error) {
        console.error('加载排程方案详情失败:', error)
        const message = error.response?.data?.error?.message || '获取排程方案详情失败，请稍后重试'
        this.$message.error(message)
      } finally {
        this.loading = false
      }
    },

    /**
     * 刷新数据
     */
    async handleRefresh() {
      await this.loadPlanDetail()
      this.$message.success('刷新成功')
    },

    /**
     * 返回列表页面
     */
    handleBack() {
      this.$router.back()
    },

    /**
     * 查看甘特图
     */
    handleViewGantt() {
      this.$router.push({
        name: 'ScheduleGanttChart',
        params: { id: this.planId }
      })
    },

    /**
     * 发布排程方案
     */
    async handlePublish() {
      try {
        // 先检查冲突
        const criticalConflicts = this.conflicts.filter(c => c.severityLevel === 'critical')

        if (criticalConflicts.length > 0) {
          this.$alert(
            `检测到 ${criticalConflicts.length} 个致命冲突，无法发布。请先解决冲突后再发布。`,
            '无法发布',
            {
              type: 'error',
              confirmButtonText: '查看冲突'
            }
          ).then(() => {
            this.activeTab = 'conflicts'
          })
          return
        }

        // 检查非致命冲突
        const nonCriticalConflicts = this.conflicts.filter(c => c.severityLevel !== 'critical')
        let forcePublish = false

        if (nonCriticalConflicts.length > 0) {
          await this.$confirm(
            `检测到 ${nonCriticalConflicts.length} 个非致命冲突，建议处理后再发布。是否强制发布？`,
            '发布确认',
            {
              type: 'warning',
              confirmButtonText: '强制发布',
              cancelButtonText: '返回调整'
            }
          )
          forcePublish = true
        }

        // 发布确认
        const { value: remarks } = await this.$prompt(
          '请输入发布备注（可选）',
          '发布排程方案',
          {
            confirmButtonText: '确认发布',
            cancelButtonText: '取消',
            inputType: 'textarea'
          }
        ).catch(() => ({ value: null }))

        if (remarks === null) return

        const response = await publishSchedulePlan(this.planId, {
          forcePublish,
          remarks
        })

        if (response.success) {
          this.$message.success(response.message || '发布排程方案成功')
          await this.loadPlanDetail()
        } else {
          this.$message.error(response.message || '发布排程方案失败')
        }
      } catch (error) {
        console.error('发布排程方案失败:', error)
        const message = error.response?.data?.error?.message || '发布排程方案失败，请稍后重试'
        this.$message.error(message)
      }
    },

    /**
     * 取消排程方案
     */
    async handleCancelPlan() {
      try {
        const { value: reason } = await this.$prompt(
          '取消后方案将无法恢复，请输入取消原因',
          '取消排程方案',
          {
            confirmButtonText: '确认取消',
            cancelButtonText: '返回',
            inputType: 'textarea',
            inputValidator: (value) => {
              if (!value || value.trim() === '') {
                return '请输入取消原因'
              }
              return true
            }
          }
        ).catch(() => ({ value: null }))

        if (reason === null) return

        const response = await cancelSchedulePlan(this.planId, { reason })

        if (response.success) {
          this.$message.success(response.message || '取消排程方案成功')
          await this.loadPlanDetail()
        } else {
          this.$message.error(response.message || '取消排程方案失败')
        }
      } catch (error) {
        console.error('取消排程方案失败:', error)
        const message = error.response?.data?.error?.message || '取消排程方案失败，请稍后重试'
        this.$message.error(message)
      }
    },

    /**
     * Tab切换事件
     */
    handleTabClick(tab) {
      // 可以在这里添加tab切换后的逻辑
    },

    /**
     * 启动自动刷新
     */
    startAutoRefresh() {
      if (this.autoRefreshTimer) return

      this.autoRefreshTimer = setInterval(() => {
        this.loadPlanDetail()
      }, 3000) // 每3秒刷新一次
    },

    /**
     * 停止自动刷新
     */
    stopAutoRefresh() {
      if (this.autoRefreshTimer) {
        clearInterval(this.autoRefreshTimer)
        this.autoRefreshTimer = null
      }
    },

    /**
     * 高亮显示冲突任务
     * @param {Array} taskIds - 任务ID列表
     */
    handleHighlightConflict(taskIds) {
      this.highlightedTaskIds = taskIds
      this.activeTab = 'items'
      this.$nextTick(() => {
        // 通知排程结果面板高亮显示任务
        this.$emit('highlight-tasks', taskIds)
      })
    },

    /**
     * 定位到指定任务
     * @param {Array} taskIds - 任务ID列表
     */
    handleLocateTask(taskIds) {
      this.highlightedTaskIds = taskIds
      this.activeTab = 'items'
    }
  }
}
</script>

<style lang="scss" scoped>
.plan-detail {
  padding: 20px;
  background: #fff;

  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid #e4e7ed;

    .header-left {
      flex: 1;
    }

    .header-right {
      display: flex;
      gap: 12px;
    }
  }

  .detail-tabs {
    ::v-deep .el-tabs__header {
      margin-bottom: 20px;
    }

    .tab-badge {
      margin-left: 8px;
    }
  }
}
</style>

