/**
 * 申请历史时间线组件
 * 文件描述：展示注册申请的审批历史和时间线，包括提交、审核、批准/拒绝等状态变化
 * 创建日期：2024-12-19
 * 修改记录：
 *   - 2024-12-19: 初始创建，实现申请历史时间线展示功能
 */
<template>
  <div class="application-timeline">
    <!-- 时间线标题 -->
    <div class="timeline-header">
      <h4 class="timeline-title">
        <i class="el-icon-time timeline-icon" />
        申请历史
      </h4>
      <p class="timeline-subtitle">查看申请的完整审批流程和状态变化</p>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="timeline-loading">
      <el-skeleton :rows="3" animated />
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="timeline-error">
      <el-alert
        title="加载失败"
        :description="error"
        type="error"
        show-icon
        :closable="false"
      />
      <el-button
        type="primary"
        size="small"
        class="retry-button"
        @click="loadTimeline"
      >
        重新加载
      </el-button>
    </div>

    <!-- 时间线内容 -->
    <div v-else-if="timelineData && timelineData.length > 0" class="timeline-content">
      <el-timeline>
        <el-timeline-item
          v-for="(item, index) in timelineData"
          :key="index"
          :timestamp="formatTimestamp(item.timestamp)"
          :type="getTimelineType(item.action)"
          :icon="getTimelineIcon(item.action)"
          :color="getTimelineColor(item.action)"
          placement="top"
        >
          <el-card class="timeline-card" shadow="hover">
            <div class="timeline-item-header">
              <div class="action-info">
                <span class="action-title">{{ getActionTitle(item.action) }}</span>
                <el-tag
                  :type="getStatusTagType(item.status)"
                  size="small"
                  class="status-tag"
                >
                  {{ getStatusText(item.status) }}
                </el-tag>
              </div>
              <div class="timestamp-info">
                <span class="timestamp">{{ formatDetailTimestamp(item.timestamp) }}</span>
              </div>
            </div>

            <div class="timeline-item-content">
              <p class="description">{{ item.description }}</p>

              <!-- 审批人信息 -->
              <div v-if="item.approver" class="approver-info">
                <div class="approver-label">审批人：</div>
                <div class="approver-details">
                  <span class="approver-name">{{ item.approver.name }}</span>
                  <span class="approver-email">({{ item.approver.email }})</span>
                </div>
              </div>

              <!-- 创建的用户信息 -->
              <div v-if="item.createdUser" class="created-user-info">
                <div class="created-user-label">创建用户：</div>
                <div class="created-user-details">
                  <span class="user-name">{{ item.createdUser.name }}</span>
                  <span class="user-email">({{ item.createdUser.email }})</span>
                  <el-tag
                    :type="item.createdUser.status === 'active' ? 'success' : 'info'"
                    size="mini"
                  >
                    {{ item.createdUser.status === 'active' ? '已激活' : '未激活' }}
                  </el-tag>
                </div>
              </div>

              <!-- 拒绝原因 -->
              <div v-if="item.reason" class="rejection-reason">
                <div class="reason-label">拒绝原因：</div>
                <div class="reason-content">{{ item.reason }}</div>
              </div>

              <!-- 备注信息 -->
              <div v-if="item.notes" class="notes-info">
                <div class="notes-label">备注：</div>
                <div class="notes-content">{{ item.notes }}</div>
              </div>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </div>

    <!-- 空状态 -->
    <div v-else class="timeline-empty">
      <el-empty
        description="暂无申请历史记录"
        image-size="80"
      >
        <el-button type="primary" @click="loadTimeline">刷新</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script>
import { getApplicationHistory } from '../api/register'
// import { formatDateTime } from '@/utils/date' // 暂时注释掉，使用本地方法

export default {
  name: 'ApplicationTimeline',

  props: {
    // 申请ID
    applicationId: {
      type: String,
      required: true
    },
    // 是否自动加载
    autoLoad: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      loading: false,
      error: null,
      timelineData: []
    }
  },

  watch: {
    applicationId: {
      handler(newId) {
        if (newId && this.autoLoad) {
          this.loadTimeline()
        }
      },
      immediate: true
    }
  },

  methods: {
    /**
     * 加载时间线数据
     */
    async loadTimeline() {
      if (!this.applicationId) {
        this.error = '申请ID不能为空'
        return
      }

      try {
        this.loading = true
        this.error = null

        const response = await getApplicationHistory(this.applicationId)

        if (response.success && response.data && response.data.timeline) {
          this.timelineData = response.data.timeline
          this.$emit('timeline-loaded', this.timelineData)
        } else {
          throw new Error('获取申请历史失败')
        }
      } catch (error) {
        console.error('加载申请历史失败:', error)
        this.error = error.message || '加载申请历史失败，请稍后重试'
        this.$emit('timeline-error', error)
      } finally {
        this.loading = false
      }
    },

    /**
     * 获取操作标题
     */
    getActionTitle(action) {
      const actionMap = {
        'submitted': '申请提交',
        'under_review': '开始审核',
        'approved': '申请批准',
        'rejected': '申请拒绝',
        'cancelled': '申请取消',
        'expired': '申请过期'
      }
      return actionMap[action] || action
    },

    /**
     * 获取状态文本
     */
    getStatusText(status) {
      const statusMap = {
        'pending': '待审批',
        'under_review': '审核中',
        'approved': '已批准',
        'rejected': '已拒绝',
        'cancelled': '已取消',
        'expired': '已过期'
      }
      return statusMap[status] || status
    },

    /**
     * 获取时间线类型
     */
    getTimelineType(action) {
      const typeMap = {
        'submitted': 'primary',
        'under_review': 'warning',
        'approved': 'success',
        'rejected': 'danger',
        'cancelled': 'info',
        'expired': 'info'
      }
      return typeMap[action] || 'primary'
    },

    /**
     * 获取时间线图标
     */
    getTimelineIcon(action) {
      const iconMap = {
        'submitted': 'el-icon-upload',
        'under_review': 'el-icon-view',
        'approved': 'el-icon-check',
        'rejected': 'el-icon-close',
        'cancelled': 'el-icon-remove',
        'expired': 'el-icon-time'
      }
      return iconMap[action] || 'el-icon-info'
    },

    /**
     * 获取时间线颜色
     */
    getTimelineColor(action) {
      const colorMap = {
        'submitted': '#409EFF',
        'under_review': '#E6A23C',
        'approved': '#67C23A',
        'rejected': '#F56C6C',
        'cancelled': '#909399',
        'expired': '#909399'
      }
      return colorMap[action] || '#409EFF'
    },

    /**
     * 获取状态标签类型
     */
    getStatusTagType(status) {
      const typeMap = {
        'pending': 'warning',
        'under_review': 'primary',
        'approved': 'success',
        'rejected': 'danger',
        'cancelled': 'info',
        'expired': 'info'
      }
      return typeMap[status] || 'info'
    },

    /**
     * 格式化日期
     * @param {string|Date} date - 日期
     * @param {string} format - 格式
     * @returns {string} 格式化后的日期
     */
    formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
      if (!date) return ''

      try {
        const d = new Date(date)
        if (isNaN(d.getTime())) return ''

        const year = d.getFullYear()
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        const hours = String(d.getHours()).padStart(2, '0')
        const minutes = String(d.getMinutes()).padStart(2, '0')
        const seconds = String(d.getSeconds()).padStart(2, '0')

        return format
          .replace('YYYY', year)
          .replace('MM', month)
          .replace('DD', day)
          .replace('HH', hours)
          .replace('mm', minutes)
          .replace('ss', seconds)
      } catch (error) {
        console.warn('日期格式化失败:', error)
        return String(date)
      }
    },

    /**
     * 格式化时间戳（简短格式）
     */
    formatTimestamp(timestamp) {
      if (!timestamp) return ''
      return this.formatDate(timestamp, 'MM-DD HH:mm')
    },

    /**
     * 格式化时间戳（详细格式）
     */
    formatDetailTimestamp(timestamp) {
      if (!timestamp) return ''
      return this.formatDate(timestamp, 'YYYY-MM-DD HH:mm:ss')
    },

    /**
     * 刷新时间线
     */
    refresh() {
      this.loadTimeline()
    }
  }
}
</script>

<style lang="scss" scoped>
.application-timeline {
  .timeline-header {
    margin-bottom: 20px;

    .timeline-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      margin: 0 0 8px 0;
      display: flex;
      align-items: center;

      .timeline-icon {
        margin-right: 8px;
        color: #409EFF;
      }
    }

    .timeline-subtitle {
      font-size: 14px;
      color: #606266;
      margin: 0;
    }
  }

  .timeline-loading {
    padding: 20px;
  }

  .timeline-error {
    .retry-button {
      margin-top: 12px;
    }
  }

  .timeline-content {
    .timeline-card {
      margin-bottom: 0;

      .timeline-item-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 12px;

        .action-info {
          display: flex;
          align-items: center;
          gap: 8px;

          .action-title {
            font-weight: 600;
            color: #303133;
            font-size: 15px;
          }

          .status-tag {
            font-size: 12px;
          }
        }

        .timestamp-info {
          .timestamp {
            font-size: 13px;
            color: #909399;
          }
        }
      }

      .timeline-item-content {
        .description {
          color: #606266;
          margin: 0 0 12px 0;
          line-height: 1.5;
        }

        .approver-info,
        .created-user-info,
        .rejection-reason,
        .notes-info {
          margin-top: 12px;
          padding: 8px 12px;
          background-color: #f8f9fa;
          border-radius: 4px;
          font-size: 13px;

          .approver-label,
          .created-user-label,
          .reason-label,
          .notes-label {
            font-weight: 600;
            color: #303133;
            margin-bottom: 4px;
          }

          .approver-details,
          .created-user-details {
            display: flex;
            align-items: center;
            gap: 8px;

            .approver-name,
            .user-name {
              color: #303133;
              font-weight: 500;
            }

            .approver-email,
            .user-email {
              color: #909399;
              font-size: 12px;
            }
          }

          .reason-content,
          .notes-content {
            color: #606266;
            line-height: 1.4;
          }
        }

        .rejection-reason {
          background-color: #fef0f0;
          border-left: 3px solid #F56C6C;
        }

        .created-user-info {
          background-color: #f0f9ff;
          border-left: 3px solid #67C23A;
        }
      }
    }
  }

  .timeline-empty {
    padding: 40px 20px;
    text-align: center;
  }
}

// Element UI 时间线样式覆盖
:deep(.el-timeline) {
  padding-left: 0;

  .el-timeline-item {
    padding-bottom: 20px;

    &:last-child {
      padding-bottom: 0;
    }

    .el-timeline-item__timestamp {
      font-size: 12px;
      color: #909399;
    }

    .el-timeline-item__node {
      width: 14px;
      height: 14px;

      &.el-timeline-item__node--normal {
        left: -7px;
      }
    }

    .el-timeline-item__wrapper {
      padding-left: 24px;
      top: -4px;
    }
  }
}
</style>
