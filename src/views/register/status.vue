<template>
  <div class="register-status-container">
    <div class="status-card">
      <div class="status-header">
        <h2 class="status-title">申请状态查询</h2>
        <p class="status-subtitle">请输入申请ID查询注册申请状态</p>
      </div>

      <!-- 查询表单 -->
      <el-form
        ref="queryForm"
        :model="queryForm"
        :rules="queryRules"
        class="query-form"
        @submit.native.prevent="handleQuery"
      >
        <el-form-item prop="applicationId">
          <el-input
            v-model="queryForm.applicationId"
            placeholder="请输入申请ID"
            size="large"
            clearable
            @keyup.enter.native="handleQuery"
          >
            <el-button slot="append" type="primary" :loading="queryLoading" @click="handleQuery">
              {{ queryLoading ? '查询中...' : '查询' }}
            </el-button>
          </el-input>
        </el-form-item>
      </el-form>

      <!-- 查询加载指示器 -->
      <LoadingIndicator v-if="queryLoading" text="正在查询申请状态..." class="query-loading" />

      <!-- 查询结果 -->
      <div v-if="applicationData" class="status-result">

        <div class="result-content">
          <!-- 使用ApplicationCard组件展示申请信息 -->
          <ApplicationCard
            :application-data="applicationData"
            :show-actions="false"
            :show-status="true"
            :show-basic-info="true"
            :show-optional-info="true"
            :show-approval-info="true"
            :show-timeline="true"
            title="申请详细信息"
            subtitle="以下是您的注册申请详细信息及当前状态"
            title-icon="el-icon-document-checked"
            class="application-detail-content"
            @timeline-loaded="handleTimelineLoaded"
            @timeline-error="handleTimelineError"
          />

          <!-- 状态说明 -->
          <div class="status-description">
            <h4 class="section-title">状态说明</h4>
            <div class="status-help">
              <p v-if="applicationData.status === 'pending'" class="help-text pending">
                <i class="el-icon-time" />
                您的申请正在等待审批，请耐心等待管理员处理。
              </p>
              <p v-else-if="applicationData.status === 'approved'" class="help-text approved">
                <i class="el-icon-success" />
                恭喜！您的申请已通过审批，账户已创建成功。
              </p>
              <p v-else-if="applicationData.status === 'rejected'" class="help-text rejected">
                <i class="el-icon-error" />
                很抱歉，您的申请未通过审批。如有疑问，请联系管理员。
              </p>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="result-actions">
          <el-button @click="handleReset">
            查询其他申请
          </el-button>
          <el-button v-if="applicationData.status === 'rejected'" type="primary" @click="goToApply">
            重新申请
          </el-button>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="showEmptyState" class="empty-state">
        <i class="el-icon-document" />
        <h3>未找到申请记录</h3>
        <p>请检查申请ID是否正确，或联系管理员确认申请状态。</p>
        <el-button type="primary" @click="goToApply">
          提交新申请
        </el-button>
      </div>

      <!-- 登录入口 -->
      <div class="login-section">
        <span class="login-text">已有账号？</span>
        <router-link to="/login" class="login-link">立即登录</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { getApplicationHistory, handleRegistrationError } from './api/register'
import { showStatusQuerySuccess } from './utils/errorHandler'
import ApplicationCard from './components/ApplicationCard.vue'
import LoadingIndicator from './components/LoadingIndicator.vue'
import { QUERY_FORM_RULES } from './constants'

export default {
  name: 'RegisterStatus',

  components: {
    ApplicationCard,
    LoadingIndicator
  },
  data() {
    return {
      queryForm: {
        applicationId: ''
      },
      queryRules: QUERY_FORM_RULES,
      queryLoading: false,
      applicationData: null,
      showEmptyState: false
    }
  },

  mounted() {
    // 如果URL中有申请ID参数，自动查询
    const applicationId = this.$route.query.id
    if (applicationId) {
      this.queryForm.applicationId = applicationId
      this.handleQuery()
    }
  },
  methods: {
    /**
     * 处理查询
     */
    async handleQuery() {
      try {
        // 表单验证
        const valid = await this.$refs.queryForm.validate()
        if (!valid) {
          return
        }

        this.queryLoading = true
        this.applicationData = null
        this.showEmptyState = false

        // 查询申请历史（包含完整的申请信息和时间线）
        const response = await getApplicationHistory(this.queryForm.applicationId.trim())

        if (response.success && response.data && response.data.application) {
          // 处理响应数据，从application字段中获取申请信息
          this.applicationData = this.processApplicationData(response.data.application)
          this.showEmptyState = false

          // 显示查询成功提示
          showStatusQuerySuccess({
            statusText: response.message || '查询成功'
          })
        } else {
          this.applicationData = null
          this.showEmptyState = true
        }
      } catch (error) {
        // 使用统一错误处理
        handleRegistrationError(error, {
          context: '查询申请状态'
        })

        // 显示空状态
        this.applicationData = null
        this.showEmptyState = true
      } finally {
        this.queryLoading = false
      }
    },

    /**
     * 重置查询
     */
    handleReset() {
      this.queryForm.applicationId = ''
      this.applicationData = null
      this.showEmptyState = false
      this.$refs.queryForm.clearValidate()
    },

    /**
     * 跳转到申请页面
     */
    goToApply() {
      this.$router.push('/register/apply')
    },

    /**
     * 处理申请数据，确保字段映射正确
     * @param {Object} rawData - 从API返回的原始数据
     * @returns {Object} 处理后的申请数据
     */
    processApplicationData(rawData) {
      if (!rawData) return null

      // 基于接口文档确保所有字段都正确映射
      const processedData = {
        // 基本信息
        id: rawData.id,
        applicantName: rawData.applicantName,
        applicantEmail: rawData.applicantEmail,
        username: rawData.username,

        // 职业信息（包含新增字段）
        departmentId: rawData.departmentId,
        department: rawData.department || null, // 嵌套的部门信息
        positionId: rawData.positionId, // 新增：岗位ID
        position: rawData.position || null, // 新增：嵌套的岗位信息
        jobTitle: rawData.jobTitle,
        employeeId: rawData.employeeId,
        managerId: rawData.managerId, // 新增：直属上级ID
        manager: rawData.manager || null, // 新增：嵌套的上级信息
        hireDate: rawData.hireDate, // 新增：预期入职日期

        // 个人信息（新增字段）
        gender: rawData.gender, // 新增：性别
        birthDate: rawData.birthDate, // 新增：出生日期
        phone: rawData.phone,
        address: rawData.address, // 新增：家庭住址

        // 紧急联系人（新增字段）
        emergencyContact: rawData.emergencyContact, // 新增：紧急联系人姓名
        emergencyPhone: rawData.emergencyPhone, // 新增：紧急联系人电话

        // 其他信息
        applicationReason: rawData.applicationReason,
        notes: rawData.notes,
        customFields: rawData.customFields || {}, // 新增：自定义字段

        // 审批信息（包含从getApplicationHistory获取的完整审批数据）
        status: rawData.status,
        createdAt: rawData.createdAt,
        updatedAt: rawData.updatedAt,
        approver: rawData.approver || null,
        approvedBy: rawData.approvedBy || null, // 新增：审批人ID
        approvedAt: rawData.approvedAt || null, // 新增：审批时间
        createdUserId: rawData.createdUserId || null, // 新增：创建用户ID
        createdUser: rawData.createdUser || null, // 新增：创建用户信息
        rejectionReason: rawData.rejectionReason || null, // 新增：拒绝原因
        approvalNotes: rawData.approvalNotes || null, // 新增：审批备注

        // 兼容旧字段（保持向后兼容性）
        departmentName: rawData.department?.name || rawData.departmentName || null,
        submittedAt: rawData.createdAt,
        reviewedAt: rawData.approvedAt || rawData.updatedAt,
        reviewedBy: rawData.approver?.name || null,
        reviewComments: rawData.approvalNotes || rawData.approver?.comments || null
      }

      // 数据完整性检查和日志记录
      this.logDataMappingInfo(rawData, processedData)

      return processedData
    },

    /**
     * 记录数据映射信息用于调试
     * @param {Object} rawData - 原始数据
     * @param {Object} processedData - 处理后数据
     */
    logDataMappingInfo(rawData, processedData) {
      // 记录调试信息
      console.log('API响应原始数据:', rawData)
      console.log('处理后的申请数据:', processedData)

      // 检查新增字段的映射情况
      const newFields = ['positionId', 'hireDate', 'birthDate', 'gender', 'address', 'emergencyContact', 'emergencyPhone', 'managerId', 'customFields', 'approvedBy', 'approvedAt', 'createdUserId', 'createdUser', 'rejectionReason', 'approvalNotes']
      const mappedNewFields = newFields.filter(field => processedData[field] !== null && processedData[field] !== undefined)
      if (mappedNewFields.length > 0) {
        console.log('成功映射的新字段:', mappedNewFields)
      }

      // 检查嵌套对象的映射情况
      const nestedFields = ['department', 'position', 'manager', 'approver', 'createdUser']
      nestedFields.forEach(field => {
        if (processedData[field]) {
          console.log(`${field}嵌套对象信息:`, processedData[field])
        }
      })

      // 检查自定义字段
      if (processedData.customFields && Object.keys(processedData.customFields).length > 0) {
        console.log('自定义字段内容:', processedData.customFields)
      }
    },

    /**
     * 格式化日期时间
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
        console.error('日期格式化失败:', error)
        return dateTime
      }
    },

    /**
     * 处理时间线加载完成事件
     * @param {Array} timelineData - 时间线数据
     */
    handleTimelineLoaded(timelineData) {
      console.log('申请历史时间线加载完成:', timelineData)
      // 可以在这里添加额外的时间线数据处理逻辑
    },

    /**
     * 处理时间线加载错误事件
     * @param {Error} error - 错误信息
     */
    handleTimelineError(error) {
      console.error('申请历史时间线加载失败:', error)
      this.$message.warning('申请历史记录加载失败，但不影响查看申请详情')
      this.$emit('timeline-error', error)
    }
  }
}
</script>

<style lang="scss" scoped>
.register-status-container {
  min-height: 100vh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 40px 20px;
  background-image: url('../../assets/login-bg.svg');
}

.status-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 1500px;
  margin: 0 auto;
}

.status-header {
  text-align: center;
  margin-bottom: 40px;

  .status-title {
    font-size: 28px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 8px 0;
  }

  .status-subtitle {
    font-size: 16px;
    color: #7f8c8d;
    margin: 0;
  }
}

.query-form {
  margin-bottom: 40px;

  .el-form-item {
    margin-bottom: 0;
  }

  .el-input {
    .el-input__inner {
      border-radius: 8px;
    }

    .el-input-group__append {
      border-radius: 0 8px 8px 0;
    }
  }
}

.status-result {
  .result-content {
    .application-detail-content {
      // 为ApplicationCard内容提供合适的样式环境
      background: #FAFBFC;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
    }

    .status-description {
      .section-title {
        font-size: 16px;
        font-weight: 600;
        color: #34495e;
        margin: 0 0 16px 0;
        padding-bottom: 8px;
        border-bottom: 1px solid #ecf0f1;
      }

      .status-help {
        .help-text {
          display: flex;
          align-items: center;
          padding: 16px;
          border-radius: 8px;
          margin: 0;
          font-size: 14px;
          line-height: 1.6;

          i {
            font-size: 18px;
            margin-right: 8px;
          }

          &.pending {
            background: #fdf6ec;
            color: #e6a23c;
            border: 1px solid #f5dab1;
          }

          &.approved {
            background: #f0f9ff;
            color: #67c23a;
            border: 1px solid #c2e7b0;
          }

          &.rejected {
            background: #fef0f0;
            color: #f56c6c;
            border: 1px solid #fbc4c4;
          }
        }
      }
    }
  }

  .result-actions {
    text-align: center;
    margin-top: 32px;
    padding-top: 24px;
    border-top: 1px solid #ecf0f1;

    .el-button {
      min-width: 120px;
      margin: 0 8px;
    }
  }
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #909399;

  i {
    font-size: 64px;
    color: #c0c4cc;
    margin-bottom: 16px;
  }

  h3 {
    font-size: 18px;
    color: #606266;
    margin: 0 0 8px 0;
  }

  p {
    font-size: 14px;
    margin: 0 0 24px 0;
    line-height: 1.6;
  }
}

.query-loading {
  margin: 20px 0;
  text-align: center;
}

// 登录入口样式
.login-section {
  text-align: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
  font-size: 14px;

  .login-text {
    color: #909399;
    margin-right: 8px;
  }

  .login-link {
    color: #409eff;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.3s;

    &:hover {
      color: #66b1ff;
      text-decoration: underline;
    }
  }

}

// 响应式设计
@media (max-width: 768px) {
  .register-status-container {
    padding: 20px 10px;
  }

  .status-card {
    padding: 20px;
  }

  .status-header {
    margin-bottom: 30px;

    .status-title {
      font-size: 24px;
    }

    .status-subtitle {
      font-size: 14px;
    }
  }

  .status-result {
    .result-content {
      .application-detail-content {
        padding: 16px;
        margin-bottom: 16px;
      }
    }

    .result-actions {
      .el-button {
        width: 100%;
        margin: 8px 0;
      }
    }
  }

  .empty-state {
    padding: 40px 20px;

    i {
      font-size: 48px;
    }
  }

  .login-section {
    .login-link {
      display: block;
      margin-top: 8px;
    }
  }
}
</style>
