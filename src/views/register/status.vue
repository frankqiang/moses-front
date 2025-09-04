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
            <el-button
              slot="append"
              type="primary"
              :loading="queryLoading"
              @click="handleQuery"
            >
              {{ queryLoading ? '查询中...' : '查询' }}
            </el-button>
          </el-input>
        </el-form-item>
      </el-form>

      <!-- 查询加载指示器 -->
      <LoadingIndicator 
        v-if="queryLoading" 
        text="正在查询申请状态..." 
        class="query-loading"
      />

      <!-- 查询结果 -->
      <div v-if="applicationData" class="status-result">
        <div class="result-header">
          <h3 class="result-title">申请信息</h3>
          <ApplicationStatusTag :status="applicationData.status" size="medium" />
        </div>

        <div class="result-content">
          <!-- 使用ApplicationCard组件展示申请信息 -->
          <ApplicationCard
            :application="applicationData"
            :show-actions="false"
            :show-status="false"
            class="application-detail-card"
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
          <el-button
            v-if="applicationData.status === 'rejected'"
            type="primary"
            @click="goToApply"
          >
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
import { getApplicationStatus, handleRegistrationError } from './api/register'
import { showErrorMessage, showStatusQuerySuccess } from './utils/errorHandler'
import ApplicationCard from './components/ApplicationCard.vue'
import ApplicationStatusTag from './components/ApplicationStatusTag.vue'
import LoadingIndicator from './components/LoadingIndicator.vue'

// 导入常量
import {
  APPLICATION_STATUS,
  STATUS_CONFIG,
  QUERY_FORM_RULES
} from './constants'

export default {
  name: 'RegisterStatus',
  
  components: {
    ApplicationCard,
    ApplicationStatusTag,
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

        // 查询申请状态
        const response = await getApplicationStatus(this.queryForm.applicationId.trim())
        
        if (response.data) {
          this.applicationData = response.data
          this.showEmptyState = false
          
          // 显示查询成功提示
          showStatusQuerySuccess({
            statusText: this.applicationData.statusText || '查询成功'
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
}

.status-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 800px;
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
  .result-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 2px solid #ecf0f1;

    .result-title {
      font-size: 20px;
      font-weight: 600;
      color: #2c3e50;
      margin: 0;
    }

    .status-tag {
      font-size: 14px;
      font-weight: 600;
    }
  }

  .result-content {
    .info-section {
      margin-bottom: 32px;

      .section-title {
        font-size: 16px;
        font-weight: 600;
        color: #34495e;
        margin: 0 0 16px 0;
        padding-bottom: 8px;
        border-bottom: 1px solid #ecf0f1;
      }

      .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 16px;
      }

      .info-item {
        display: flex;
        align-items: flex-start;

        &.full-width {
          grid-column: 1 / -1;
          flex-direction: column;
        }

        label {
          font-weight: 600;
          color: #606266;
          min-width: 100px;
          margin-right: 8px;
        }

        .info-value {
          color: #2c3e50;
          word-break: break-word;

          &.reason-text {
            background: #f8f9fa;
            padding: 12px;
            border-radius: 6px;
            border-left: 4px solid #409eff;
            margin-top: 8px;
            line-height: 1.6;
            width: 100%;
          }
        }
      }
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
    .result-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }

    .result-content {
      .info-section {
        .info-grid {
          grid-template-columns: 1fr;
        }

        .info-item {
          flex-direction: column;
          align-items: flex-start;

          label {
            min-width: auto;
            margin-right: 0;
            margin-bottom: 4px;
          }
        }
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