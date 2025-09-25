/**
 * 申请信息卡片组件
 * 功能描述：展示注册申请的详细信息，包括基本信息、可选信息和审批信息
 * 创建日期：2024-01-20
 * 修改记录：
 *   - 2024-01-20: 初始创建，实现申请信息展示功能
 */
<template>
  <div class="application-content">
    <!-- 内容头部 -->
    <div class="content-header">
      <div class="header-left">
        <h3 class="application-title">
          <i :class="titleIcon" class="title-icon" />
          {{ title }}
        </h3>
        <p v-if="subtitle" class="application-subtitle">{{ subtitle }}</p>
      </div>
      <div class="header-right">
        <StatusTag
          v-if="applicationData.status"
          :status="applicationData.status"
          :text-map="statusTextMap"
          :type-map="statusTypeMap"
          :icon-map="statusIconMap"
          :clickable="statusClickable"
          size="medium"
          effect="light"
          @click="handleStatusClick"
        />
      </div>
    </div>

    <!-- 内容主体 -->
    <div class="content-body">
      <!-- 基本信息 -->
      <div v-if="showBasicInfo" class="info-section">
        <h4 class="section-title">
          <i class="el-icon-user section-icon" />
          基本信息
        </h4>
        <el-row :gutter="16" class="info-row">
          <el-col v-if="applicationData.id" :span="12">
            <div class="info-item">
              <span class="info-label">申请ID：</span>
              <span class="info-value">{{ applicationData.id }}</span>
            </div>
          </el-col>
          <el-col v-if="applicationData.applicantName" :span="12">
            <div class="info-item">
              <span class="info-label">申请人姓名：</span>
              <span class="info-value">{{ applicationData.applicantName }}</span>
            </div>
          </el-col>
          <el-col v-if="applicationData.applicantEmail" :span="12">
            <div class="info-item">
              <span class="info-label">邮箱地址：</span>
              <span class="info-value">{{ applicationData.applicantEmail }}</span>
            </div>
          </el-col>
          <el-col v-if="applicationData.username" :span="12">
            <div class="info-item">
              <span class="info-label">用户名：</span>
              <span class="info-value">{{ applicationData.username }}</span>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 可选信息 -->
      <div v-if="showOptionalInfo && hasOptionalInfo" class="info-section">
        <h4 class="section-title">
          <i class="el-icon-info section-icon" />
          可选信息
        </h4>
        <el-row :gutter="16" class="info-row">
          <el-col v-if="applicationData.departmentName" :span="12">
            <div class="info-item">
              <span class="info-label">部门：</span>
              <span class="info-value">{{ applicationData.departmentName }}</span>
            </div>
          </el-col>
          <el-col v-if="applicationData.jobTitle" :span="12">
            <div class="info-item">
              <span class="info-label">职位：</span>
              <span class="info-value">{{ applicationData.jobTitle }}</span>
            </div>
          </el-col>
          <el-col v-if="applicationData.phone" :span="12">
            <div class="info-item">
              <span class="info-label">手机号码：</span>
              <span class="info-value">{{ applicationData.phone }}</span>
            </div>
          </el-col>
          <el-col v-if="applicationData.employeeId" :span="12">
            <div class="info-item">
              <span class="info-label">员工ID：</span>
              <span class="info-value">{{ applicationData.employeeId }}</span>
            </div>
          </el-col>
          <el-col v-if="applicationData.applicationReason" :span="24">
            <div class="info-item">
              <span class="info-label">申请原因：</span>
              <span class="info-value">{{ applicationData.applicationReason }}</span>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 审批信息 -->
      <div v-if="showApprovalInfo && hasApprovalInfo" class="info-section">
        <h4 class="section-title">
          <i class="el-icon-document-checked section-icon" />
          审批信息
        </h4>
        <el-row :gutter="16" class="info-row">
          <el-col v-if="applicationData.submittedAt" :span="12">
            <div class="info-item">
              <span class="info-label">提交时间：</span>
              <span class="info-value">{{ formatDateTime(applicationData.submittedAt) }}</span>
            </div>
          </el-col>
          <el-col v-if="applicationData.reviewedAt" :span="12">
            <div class="info-item">
              <span class="info-label">审核时间：</span>
              <span class="info-value">{{ formatDateTime(applicationData.reviewedAt) }}</span>
            </div>
          </el-col>
          <el-col v-if="applicationData.reviewedBy" :span="12">
            <div class="info-item">
              <span class="info-label">审核人：</span>
              <span class="info-value">{{ applicationData.reviewedBy }}</span>
            </div>
          </el-col>
          <el-col v-if="applicationData.reviewComments" :span="24">
            <div class="info-item">
              <span class="info-label">审核意见：</span>
              <span class="info-value review-comments">{{ applicationData.reviewComments }}</span>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 申请历史时间线 -->
      <div v-if="showTimeline && applicationData.id" class="info-section">
        <ApplicationTimeline
          :application-id="applicationData.id"
          @timeline-loaded="$emit('timeline-loaded', $event)"
          @timeline-error="$emit('timeline-error', $event)"
        />
      </div>

      <!-- 操作按钮 -->
      <div v-if="showActions" class="content-actions">
        <slot name="actions">
          <el-button
            v-if="showRefreshButton"
            type="primary"
            icon="el-icon-refresh"
            size="small"
            @click="handleRefresh"
          >
            刷新
          </el-button>
        </slot>
      </div>
    </div>
  </div>
</template>

<script>
import { APPLICATION_STATUS_CONFIG } from '../constants/application-status'
import ApplicationTimeline from './ApplicationTimeline.vue'

export default {
  name: 'ApplicationCard',

  components: {
    ApplicationTimeline
  },

  props: {
    /**
     * 申请数据
     */
    applicationData: {
      type: Object,
      default: () => ({})
    },

    /**
     * 卡片标题
     */
    title: {
      type: String,
      default: '申请信息'
    },

    /**
     * 卡片副标题
     */
    subtitle: {
      type: String,
      default: ''
    },

    /**
     * 标题图标
     */
    titleIcon: {
      type: String,
      default: 'el-icon-document'
    },

    /**
     * 是否显示基本信息
     */
    showBasicInfo: {
      type: Boolean,
      default: true
    },

    /**
     * 是否显示可选信息
     */
    showOptionalInfo: {
      type: Boolean,
      default: true
    },

    /**
     * 是否显示审批信息
     */
    showApprovalInfo: {
      type: Boolean,
      default: true
    },

    /**
     * 是否显示操作区
     */
    showActions: {
      type: Boolean,
      default: false
    },

    /**
     * 是否显示刷新按钮
     */
    showRefreshButton: {
      type: Boolean,
      default: false
    },

    /**
     * 状态标签是否可点击
     */
    statusClickable: {
      type: Boolean,
      default: false
    },

    /**
     * 空状态文本
     */
    emptyText: {
      type: String,
      default: '暂无申请信息'
    },

    /**
     * 是否显示申请历史时间线
     */
    showTimeline: {
      type: Boolean,
      default: false
    },

    /**
     * 时间线是否自动加载
     */
    timelineAutoLoad: {
      type: Boolean,
      default: true
    }
  },

  computed: {
    /**
     * 是否有可选信息
     */
    hasOptionalInfo() {
      const optionalFields = ['departmentName', 'jobTitle', 'phone', 'employeeId', 'applicationReason']
      return optionalFields.some(field => this.applicationData[field])
    },

    /**
     * 是否有审批信息
     */
    hasApprovalInfo() {
      const approvalFields = ['submittedAt', 'reviewedAt', 'reviewedBy', 'reviewComments']
      return approvalFields.some(field => this.applicationData[field])
    },

    /**
     * 是否为空状态
     */
    isEmpty() {
      return !this.applicationData || Object.keys(this.applicationData).length === 0
    },

    /**
     * 状态文本映射
     */
    statusTextMap() {
      return APPLICATION_STATUS_CONFIG.TEXT_MAP
    },

    /**
     * 状态类型映射
     */
    statusTypeMap() {
      return APPLICATION_STATUS_CONFIG.TYPE_MAP
    },

    /**
     * 状态图标映射
     */
    statusIconMap() {
      return APPLICATION_STATUS_CONFIG.ICON_MAP
    }
  },

  methods: {
    /**
     * 格式化日期时间
     * @param {string} dateTime - 日期时间字符串
     * @returns {string} 格式化后的日期时间
     */
    formatDateTime(dateTime) {
      if (!dateTime) return '-'

      try {
        const date = new Date(dateTime)
        return date.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      } catch (error) {
        console.warn('日期格式化失败:', error)
        return dateTime
      }
    },

    /**
     * 处理状态点击事件
     */
    handleStatusClick() {
      this.$emit('status-click', this.applicationData)
    },

    /**
     * 处理刷新事件
     */
    handleRefresh() {
      this.$emit('refresh', this.applicationData)
    },

    /**
     * 处理时间线加载完成事件
     * @param {Array} timelineData - 时间线数据
     */
    handleTimelineLoaded(timelineData) {
      this.$emit('timeline-loaded', timelineData)
    },

    /**
     * 处理时间线加载错误事件
     * @param {Error} error - 错误信息
     */
    handleTimelineError(error) {
      this.$emit('timeline-error', error)
    }
  }
}
</script>

<style lang="scss" scoped>
.application-content {
  .content-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 2px solid #F0F2F5;

    .header-left {
      flex: 1;

      .application-title {
        margin: 0 0 8px 0;
        font-size: 20px;
        font-weight: 600;
        color: #303133;
        display: flex;
        align-items: center;

        .title-icon {
          margin-right: 10px;
          color: #409EFF;
          font-size: 22px;
        }
      }

      .application-subtitle {
        margin: 0;
        font-size: 14px;
        color: #909399;
        line-height: 1.5;
      }
    }

    .header-right {
      flex-shrink: 0;
      margin-left: 16px;
    }
  }

  .content-body {
    .info-section {
      margin-bottom: 28px;
      border-radius: 8px;
      border: 1px solid #E4E7ED;
      background: #FFFFFF;
      overflow: hidden;

      &:last-child {
        margin-bottom: 0;
      }

      .section-title {
        margin: 0 0 16px 0;
        font-size: 16px;
        font-weight: 600;
        color: #303133;
        display: flex;
        align-items: center;
        padding: 12px 16px;
        background: linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%);
        border-radius: 8px;
        border-left: 4px solid #409EFF;

        .section-icon {
          margin-right: 8px;
          color: #409EFF;
          font-size: 16px;
        }
      }

      .info-row {
        padding: 0 16px 16px 16px;

        .info-item {
          margin-bottom: 16px;
          display: flex;
          align-items: flex-start;
          padding: 8px 0;
          border-bottom: 1px solid #F5F7FA;

          &:last-child {
            border-bottom: none;
            margin-bottom: 8px;
          }

          .info-label {
            font-weight: 600;
            color: #606266;
            min-width: 120px;
            flex-shrink: 0;
            padding: 8px 0;
          }

          .info-value {
            color: #303133;
            word-break: break-word;
            padding: 8px 0;
            line-height: 1.6;

            &.review-comments {
              background-color: #F5F7FA;
              padding: 12px 16px;
              border-radius: 6px;
              border-left: 4px solid #409EFF;
              margin-top: 4px;
              line-height: 1.6;
              font-style: italic;
            }
          }
        }
      }
    }

    .empty-state {
      text-align: center;
      padding: 40px 20px;

      .empty-icon {
        font-size: 48px;
        color: #C0C4CC;
        margin-bottom: 16px;
        display: block;
      }

      .empty-text {
        margin: 0;
        color: #909399;
        font-size: 14px;
      }
    }
  }

  .content-actions {
    border-top: 1px solid #EBEEF5;
    padding: 16px 0 0 0;
    margin-top: 20px;
    text-align: right;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .application-content {
    .content-header {
      flex-direction: column;
      align-items: flex-start;
      margin-bottom: 20px;

      .application-title {
        font-size: 18px;

        .title-icon {
          font-size: 20px;
        }
      }

      .header-right {
        margin-left: 0;
        margin-top: 12px;
      }
    }

    .content-body {
      .info-section {
        margin-bottom: 20px;

        .section-title {
          font-size: 15px;
          padding: 10px 12px;
        }

        .info-row {
          .el-col {
            margin-bottom: 8px;
          }

          .info-item {
            flex-direction: column;
            align-items: flex-start;

            .info-label {
              min-width: auto;
              margin-bottom: 4px;
              padding-bottom: 4px;
            }

            .info-value {
              width: 100%;
              padding-top: 0;
            }
          }
        }
      }
    }
  }
}
</style>
