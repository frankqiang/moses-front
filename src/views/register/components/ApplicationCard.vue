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
      <div class="info-grid">
        <!-- 基本信息 -->
        <div v-if="showBasicInfo" class="info-section">
          <h4 class="section-title">
            <i class="el-icon-user section-icon" />
            基本信息
          </h4>
          <el-row :gutter="16" class="info-row">
            <el-col v-if="applicationData.id" :span="24">
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

        <!-- 职业信息 -->
        <div v-if="showOptionalInfo && hasJobInfo" class="info-section">
          <h4 class="section-title">
            <i class="el-icon-suitcase section-icon" />
            职业信息
          </h4>
          <el-row :gutter="16" class="info-row">
            <el-col v-if="getDepartmentName()" :span="12">
              <div class="info-item">
                <span class="info-label">部门：</span>
                <span class="info-value">{{ getDepartmentName() }}</span>
              </div>
            </el-col>
            <el-col v-if="getPositionName()" :span="12">
              <div class="info-item">
                <span class="info-label">岗位：</span>
                <span class="info-value">{{ getPositionName() }}</span>
              </div>
            </el-col>
            <el-col v-if="applicationData.jobTitle" :span="12">
              <div class="info-item">
                <span class="info-label">职位名称：</span>
                <span class="info-value">{{ applicationData.jobTitle }}</span>
              </div>
            </el-col>
            <el-col v-if="applicationData.employeeId" :span="12">
              <div class="info-item">
                <span class="info-label">员工ID：</span>
                <span class="info-value">{{ applicationData.employeeId }}</span>
              </div>
            </el-col>
            <el-col v-if="getManagerName()" :span="12">
              <div class="info-item">
                <span class="info-label">直属上级：</span>
                <span class="info-value">{{ getManagerName() }}</span>
              </div>
            </el-col>
            <el-col v-if="applicationData.hireDate" :span="12">
              <div class="info-item">
                <span class="info-label">预期入职日期：</span>
                <span class="info-value">{{ formatDate(applicationData.hireDate) }}</span>
              </div>
            </el-col>
          </el-row>
        </div>

        <!-- 个人信息 -->
        <div v-if="showOptionalInfo && hasPersonalInfo" class="info-section">
          <h4 class="section-title">
            <i class="el-icon-user-solid section-icon" />
            个人信息
          </h4>
          <el-row :gutter="16" class="info-row">
            <el-col v-if="applicationData.phone" :span="12">
              <div class="info-item">
                <span class="info-label">手机号码：</span>
                <span class="info-value">{{ applicationData.phone }}</span>
              </div>
            </el-col>
            <el-col v-if="applicationData.gender" :span="12">
              <div class="info-item">
                <span class="info-label">性别：</span>
                <span class="info-value">{{ getGenderText(applicationData.gender) }}</span>
              </div>
            </el-col>
            <el-col v-if="applicationData.birthDate" :span="12">
              <div class="info-item">
                <span class="info-label">出生日期：</span>
                <span class="info-value">{{ formatDate(applicationData.birthDate) }}</span>
              </div>
            </el-col>
            <el-col v-if="applicationData.address" :span="24">
              <div class="info-item">
                <span class="info-label">家庭住址：</span>
                <span class="info-value">{{ applicationData.address }}</span>
              </div>
            </el-col>
          </el-row>
        </div>

        <!-- 紧急联系人信息 -->
        <div v-if="showOptionalInfo && hasEmergencyContact" class="info-section">
          <h4 class="section-title">
            <i class="el-icon-phone section-icon" />
            紧急联系人
          </h4>
          <el-row :gutter="16" class="info-row">
            <el-col v-if="applicationData.emergencyContact" :span="12">
              <div class="info-item">
                <span class="info-label">联系人姓名：</span>
                <span class="info-value">{{ applicationData.emergencyContact }}</span>
              </div>
            </el-col>
            <el-col v-if="applicationData.emergencyPhone" :span="12">
              <div class="info-item">
                <span class="info-label">联系人电话：</span>
                <span class="info-value">{{ applicationData.emergencyPhone }}</span>
              </div>
            </el-col>
          </el-row>
        </div>

        <!-- 自定义字段 -->
        <div v-if="showOptionalInfo && hasCustomFields" class="info-section">
          <h4 class="section-title">
            <i class="el-icon-setting section-icon" />
            自定义信息
          </h4>
          <el-row :gutter="16" class="info-row">
            <el-col
              v-for="(value, key) in applicationData.customFields"
              :key="key"
              :span="12"
            >
              <div class="info-item">
                <span class="info-label">{{ formatCustomFieldLabel(key) }}：</span>
                <span class="info-value">{{ value }}</span>
              </div>
            </el-col>
          </el-row>
        </div>

        <!-- 其他信息 -->
        <div v-if="showOptionalInfo && hasOtherInfo" class="info-section">
          <h4 class="section-title">
            <i class="el-icon-info section-icon" />
            其他信息
          </h4>
          <el-row :gutter="16" class="info-row">
            <el-col v-if="applicationData.applicationReason" :span="24">
              <div class="info-item">
                <span class="info-label">申请原因：</span>
                <span class="info-value">{{ getApplicationReasonText(applicationData.applicationReason) }}</span>
              </div>
            </el-col>
            <el-col v-if="applicationData.notes" :span="24">
              <div class="info-item">
                <span class="info-label">备注信息：</span>
                <span class="info-value">{{ applicationData.notes }}</span>
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
        <div
          v-if="showTimeline && applicationData.id"
          class="info-section info-section--full"
        >
          <ApplicationTimeline
            :application-id="applicationData.id"
            @timeline-loaded="$emit('timeline-loaded', $event)"
            @timeline-error="$emit('timeline-error', $event)"
          />
        </div>
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
import { REASON_OPTIONS } from '../constants/register'
import ApplicationTimeline from './ApplicationTimeline.vue'
import StatusTag from '@/components/StatusTag/index.vue'

export default {
  name: 'ApplicationCard',

  components: {
    ApplicationTimeline,
    StatusTag
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
     * 是否有职业信息
     */
    hasJobInfo() {
      const jobFields = ['departmentId', 'department', 'positionId', 'position', 'jobTitle', 'employeeId', 'managerId', 'manager', 'hireDate']
      return jobFields.some(field => this.applicationData[field])
    },

    /**
     * 是否有个人信息
     */
    hasPersonalInfo() {
      const personalFields = ['phone', 'gender', 'birthDate', 'address']
      return personalFields.some(field => this.applicationData[field])
    },

    /**
     * 是否有紧急联系人信息
     */
    hasEmergencyContact() {
      return this.applicationData.emergencyContact || this.applicationData.emergencyPhone
    },

    /**
     * 是否有自定义字段
     */
    hasCustomFields() {
      return this.applicationData.customFields && Object.keys(this.applicationData.customFields).length > 0
    },

    /**
     * 是否有其他信息
     */
    hasOtherInfo() {
      return this.applicationData.applicationReason || this.applicationData.notes
    },

    /**
     * 是否有可选信息（向后兼容）
     */
    hasOptionalInfo() {
      return this.hasJobInfo || this.hasPersonalInfo || this.hasEmergencyContact || this.hasCustomFields || this.hasOtherInfo
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
    },

    /**
     * 获取部门名称
     * @returns {string} 部门名称
     */
    getDepartmentName() {
      // 优先使用嵌套的部门信息，然后是旧的departmentName字段
      if (this.applicationData.department && this.applicationData.department.name) {
        return this.applicationData.department.name
      }
      return this.applicationData.departmentName || ''
    },

    /**
     * 获取岗位名称
     * @returns {string} 岗位名称
     */
    getPositionName() {
      // 使用嵌套的岗位信息
      if (this.applicationData.position && this.applicationData.position.name) {
        return this.applicationData.position.name
      }
      return ''
    },

    /**
     * 获取上级名称
     * @returns {string} 上级名称
     */
    getManagerName() {
      // 使用嵌套的上级信息
      if (this.applicationData.manager && this.applicationData.manager.name) {
        return this.applicationData.manager.name
      }
      return ''
    },

    /**
     * 获取性别文本
     * @param {string} gender - 性别代码
     * @returns {string} 性别文本
     */
    getGenderText(gender) {
      const genderMap = {
        'male': '男',
        'female': '女',
        'other': '其他'
      }
      return genderMap[gender] || gender || '-'
    },

    /**
     * 格式化日期（不含时间）
     * @param {string} date - 日期字符串
     * @returns {string} 格式化后的日期
     */
    formatDate(date) {
      if (!date) return '-'

      try {
        const dateObj = new Date(date)
        return dateObj.toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        })
      } catch (error) {
        console.warn('日期格式化失败:', error)
        return date
      }
    },

    /**
     * 格式化自定义字段标签
     * @param {string} key - 字段键名
     * @returns {string} 格式化后的标签
     */
    formatCustomFieldLabel(key) {
      // 将驼峰命名转换为可读的中文标签
      const labelMap = {
        'specialty': '专业特长',
        'level': '技能等级',
        'experience': '工作经验',
        'education': '教育背景',
        'certification': '相关认证'
      }
      return labelMap[key] || key
    },

    /**
     * 获取申请原因的显示文本
     * @param {string} reasonValue - 申请原因值
     * @returns {string} 申请原因显示文本
     */
    getApplicationReasonText(reasonValue) {
      if (!reasonValue) return '-'

      const reasonOption = REASON_OPTIONS.find(option => option.value === reasonValue)
      return reasonOption ? reasonOption.label : reasonValue
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
    .info-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 24px;
    }

    .info-section {
      flex: 1 1 calc(50% - 12px);
      min-width: 320px;
      margin: 0;
      border-radius: 8px;
      border: 1px solid #E4E7ED;
      background: #FFFFFF;
      overflow: hidden;

      &--full {
        flex-basis: 100%;
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
            align-items: center;
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
              line-height: 1.6;
            }

            .info-value {
              color: #303133;
              word-break: break-word;
              line-height: 1.6;
              flex: 1;

              &.review-comments {
                background-color: #F5F7FA;
                padding: 12px 16px;
                border-radius: 6px;
                border-left: 4px solid #409EFF;
                margin-top: 4px;
                line-height: 1.6;
                font-style: italic;
                align-self: flex-start;
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
      .info-grid {
        flex-direction: column;
        gap: 16px;
      }

      .info-section {
        flex-basis: 100%;

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
              line-height: 1.5;
            }

            .info-value {
              width: 100%;
              line-height: 1.5;
            }
          }
        }
      }
    }
  }
}
</style>
