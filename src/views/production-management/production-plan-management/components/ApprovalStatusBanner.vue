<!--
  文件名称：ApprovalStatusBanner.vue
  文件描述：审批状态实时显示组件
  创建日期：2025-10-13
  修改记录：
    - 2025-10-13: 初始创建，根据审批重复提交修复对接文档实现
-->
<template>
  <div v-if="visibleApprovals.length > 0" class="approval-status-banner">
    <el-alert
      :title="alertTitle"
      type="info"
      :closable="false"
      show-icon
      class="approval-alert"
    >
      <div class="approval-content">
        <div class="approval-list">
          <div
            v-for="approval in visibleApprovals"
            :key="approval.id"
            class="approval-item"
          >
            <div class="approval-info">
              <span class="approval-action">{{ getActionText(approval.requestedAction) }}</span>
              <span class="approval-status">审批正在处理中</span>
              <span class="approval-time">{{ formatTime(approval.requestedAt) }}</span>
            </div>
            <div class="approval-actions">
              <el-button
                size="mini"
                type="text"
                @click="handleViewDetail(approval)"
              >
                查看详情
              </el-button>
              <el-button
                v-if="canCancelApproval(approval)"
                size="mini"
                type="text"
                style="color: #E6A23C"
                @click="handleCancelApproval(approval)"
              >
                撤销审批
              </el-button>
            </div>
          </div>
        </div>

        <!-- 操作按钮区域 -->
        <div class="banner-actions">
          <el-button
            size="mini"
            icon="el-icon-refresh"
            :loading="loading"
            @click="refreshApprovalStatus"
          >
            刷新状态
          </el-button>
          <el-button
            v-if="visibleApprovals.length > maxVisible"
            size="mini"
            type="text"
            @click="toggleShowAll"
          >
            {{ showAll ? '收起' : `查看全部 (${visibleApprovals.length})` }}
          </el-button>
        </div>
      </div>
    </el-alert>
  </div>
</template>

<script>
import { parseTime } from '@/utils'
import { fetchApprovalRequests, cancelApproval } from '../api'

export default {
  name: 'ApprovalStatusBanner',
  props: {
    planId: {
      type: String,
      required: true
    },
    planNumber: {
      type: String,
      default: ''
    },
    // 自动刷新间隔（毫秒）
    refreshInterval: {
      type: Number,
      default: 30000 // 30秒
    },
    // 最多显示的审批数量
    maxVisible: {
      type: Number,
      default: 3
    }
  },
  data() {
    return {
      approvals: [],
      loading: false,
      refreshTimer: null,
      showAll: false
    }
  },
  computed: {
    // 待处理的审批列表
    pendingApprovals() {
      return this.approvals.filter(approval => approval.status === 'PENDING')
    },

    // 可见的审批列表
    visibleApprovals() {
      const approvals = this.pendingApprovals
      if (this.showAll || approvals.length <= this.maxVisible) {
        return approvals
      }
      return approvals.slice(0, this.maxVisible)
    },

    // 警告标题
    alertTitle() {
      const count = this.pendingApprovals.length
      const planText = this.planNumber ? `${this.planNumber} - ` : ''

      if (count === 1) {
        return `${planText}有 1 个审批请求正在处理中`
      } else {
        return `${planText}有 ${count} 个审批请求正在处理中`
      }
    },

    // 获取当前用户ID（模拟，实际应从Vuex store获取）
    currentUserId() {
      // TODO: 从Vuex store获取当前登录用户ID
      return this.$store.state.user?.id || null
    }
  },
  watch: {
    planId: {
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          this.refreshApprovalStatus()
        }
      },
      immediate: true
    }
  },
  mounted() {
    this.startPolling()
  },
  beforeDestroy() {
    this.stopPolling()
  },
  methods: {
    /**
     * 开始轮询检查审批状态
     */
    startPolling() {
      this.refreshApprovalStatus()

      if (this.refreshInterval > 0) {
        this.refreshTimer = setInterval(() => {
          this.refreshApprovalStatus()
        }, this.refreshInterval)
      }
    },

    /**
     * 停止轮询
     */
    stopPolling() {
      if (this.refreshTimer) {
        clearInterval(this.refreshTimer)
        this.refreshTimer = null
      }
    },

    /**
     * 刷新审批状态
     */
    async refreshApprovalStatus() {
      if (!this.planId || this.loading) return

      try {
        this.loading = true

        const response = await fetchApprovalRequests(this.planId, {
          status: 'PENDING',
          limit: 20,
          sortBy: 'requestedAt:desc'
        })

        if (response.success && response.data) {
          this.approvals = response.data.approvals || []

          // 发出状态变化事件
          this.$emit('approval-status-change', {
            pendingCount: this.pendingApprovals.length,
            approvals: this.pendingApprovals
          })
        }
      } catch (error) {
        console.warn('检查审批状态失败:', error)
        // 静默处理错误，不影响用户体验
      } finally {
        this.loading = false
      }
    },

    /**
     * 切换显示全部/收起
     */
    toggleShowAll() {
      this.showAll = !this.showAll
    },

    /**
     * 查看审批详情
     */
    handleViewDetail(approval) {
      this.$emit('view-approval-detail', approval)
    },

    /**
     * 撤销审批
     */
    async handleCancelApproval(approval) {
      try {
        await this.$confirm(
          `确认撤销「${this.getActionText(approval.requestedAction)}」审批请求吗？`,
          '撤销确认',
          {
            confirmButtonText: '确认撤销',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        const response = await cancelApproval(approval.id, {
          cancelRemarks: '用户主动撤销审批请求'
        })

        if (response.success) {
          this.$message.success(response.message || '审批撤销成功')
          this.refreshApprovalStatus()
          this.$emit('approval-cancelled', approval)
        } else {
          // 失败时 message 在 error 对象中
          this.$message.error(response.error?.message || '撤销失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('撤销审批失败:', error)
          this.$message.error('撤销审批失败，请稍后重试')
        }
      }
    },

    /**
     * 判断是否可以撤销审批
     */
    canCancelApproval(approval) {
      // 只有申请人本人可以撤销待处理的审批
      return approval.status === 'PENDING' &&
             approval.requesterId === this.currentUserId
    },

    /**
     * 获取操作类型文本
     */
    getActionText(action) {
      const actionMap = {
        RELEASED: '下达',
        CANCELLED: '取消',
        CONFIRMED: '确认',
        ADJUST: '调整',
        SPLIT: '拆分',
        MERGE: '合并'
      }
      return actionMap[action] || action || '-'
    },

    /**
     * 格式化时间
     */
    formatTime(time) {
      if (!time) return '-'

      const now = new Date()
      const targetTime = new Date(time)
      const diffMinutes = Math.floor((now - targetTime) / (1000 * 60))

      if (diffMinutes < 1) {
        return '刚刚'
      } else if (diffMinutes < 60) {
        return `${diffMinutes}分钟前`
      } else if (diffMinutes < 24 * 60) {
        const hours = Math.floor(diffMinutes / 60)
        return `${hours}小时前`
      } else {
        return parseTime(time, '{m}-{d} {h}:{i}')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.approval-status-banner {
  margin-bottom: 16px;

  .approval-alert {
    border: 1px solid #d1ecf1;
    background-color: #d1ecf1;

    ::v-deep .el-alert__content {
      flex: 1;
    }
  }

  .approval-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
  }

  .approval-list {
    flex: 1;
  }

  .approval-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;

    &:not(:last-child) {
      border-bottom: 1px solid rgba(255, 255, 255, 0.3);
    }
  }

  .approval-info {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
  }

  .approval-action {
    font-weight: 500;
    color: #1890ff;
    background-color: rgba(24, 144, 255, 0.1);
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
  }

  .approval-status {
    color: #666;
    font-size: 13px;
  }

  .approval-time {
    color: #999;
    font-size: 12px;
    margin-left: auto;
  }

  .approval-actions {
    display: flex;
    gap: 8px;
  }

  .banner-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: flex-end;
  }

  // 响应式设计
  @media (max-width: 768px) {
    .approval-content {
      flex-direction: column;
      align-items: stretch;
    }

    .approval-item {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }

    .approval-info {
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
    }

    .approval-time {
      margin-left: 0;
    }

    .banner-actions {
      flex-direction: row;
      justify-content: space-between;
    }
  }
}
</style>
