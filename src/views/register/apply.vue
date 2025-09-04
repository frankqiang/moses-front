<template>
  <ErrorBoundary @error="handlePageError" @retry="handleErrorRetry" @reload="handleErrorReload" @go-home="handleGoHome"
    @report-error="handleReportError">
    <div class="register-apply-container">
      <div class="register-card">
        <div class="register-header">
          <login-header />
        </div>

        <el-form ref="registerForm" :model="formData" :rules="formRules" label-width="120px" class="register-form"
          @submit.native.prevent="handleSubmit">
          <!-- 基本信息 -->
          <div class="form-section">
            <h3 class="section-title">基本信息</h3>
            <el-row :gutter="20">
              <el-col :span="12">
                <FormField v-model="formData.applicantName" type="input" label="申请人姓名" prop="applicantName"
                  placeholder="请输入申请人姓名" :maxlength="255" :show-word-limit="true" :required="true"
                  validation-type="chineseName" help-text="请输入真实姓名，用于身份验证" />
              </el-col>
              <el-col :span="12">
                <FormField v-model="formData.applicantEmail" type="input" input-type="email" label="申请人邮箱"
                  prop="applicantEmail" placeholder="请输入申请人邮箱" :required="true" validation-type="email"
                  help-text="邮箱将用于接收申请状态通知" />
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <FormField v-model="formData.username" type="input" label="用户名" prop="username"
                  placeholder="3-50字符，支持字母、数字、下划线，不能以数字开头" :maxlength="50" :show-word-limit="true" :required="true"
                  validation-type="username" help-text="用户名一旦创建不可修改，请谨慎填写" />
              </el-col>
              <el-col :span="12">
                <FormField v-model="formData.password" type="input" :input-type="passwordVisible ? 'text' : 'password'"
                  label="密码" prop="password" placeholder="至少8位，必须包含字母和数字" :maxlength="50" :required="true"
                  validation-type="password" :suffix-icon="passwordVisible ? 'el-icon-view' : 'el-icon-view-off'"
                  help-text="密码强度越高，账户越安全" @click-suffix="togglePasswordVisibility" />
              </el-col>
            </el-row>
          </div>

          <!-- 可选信息 -->
          <div class="form-section">
            <h3 class="section-title">可选信息</h3>
            <el-row :gutter="20">
              <el-col :span="12">
                <FormField v-model="formData.departmentId" type="select" label="部门" prop="departmentId"
                  placeholder="请选择部门" :options="departmentOptions" :filterable="true" help-text="选择您所属的部门，便于管理员审核" />
              </el-col>

              <el-col :span="12">
                <FormField v-model="formData.jobTitle" type="input" label="职位名称" prop="jobTitle" placeholder="请输入职位名称"
                  :maxlength="100" :show-word-limit="true" help-text="填写您的职位信息，便于权限分配" />
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <FormField v-model="formData.phone" type="input" label="手机号码" prop="phone" placeholder="请输入手机号码"
                  :maxlength="11" validation-type="phone" help-text="手机号用于重要通知和安全验证" />
              </el-col>
              <el-col :span="12">
                <FormField v-model="formData.employeeId" type="input" label="员工ID" prop="employeeId"
                  placeholder="请输入员工ID" :maxlength="50" :show-word-limit="true" help-text="如果您已是公司员工，请填写员工ID" />
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <FormField v-model="formData.employeeId" type="input" label="员工ID" prop="employeeId"
                  placeholder="请输入员工ID" :maxlength="50" :show-word-limit="true" help-text="如果您已是公司员工，请填写员工ID" />
              </el-col>
              <el-col :span="12">
                <FormField v-model="formData.applicationReason" type="textarea" label="申请原因" prop="applicationReason"
                  placeholder="请输入申请原因" :maxlength="500" :show-word-limit="true" :rows="3"
                  help-text="详细说明申请原因有助于加快审核进度" />
              </el-col>
            </el-row>
          </div>

          <!-- 提交按钮 -->
          <div class="form-actions">
            <LoadingIndicator v-if="submitLoading" text="正在提交申请..." />
            <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
              {{ submitLoading ? '提交中...' : '提交申请' }}
            </el-button>
            <el-button @click="handleReset">
              重置表单
            </el-button>
          </div>

          <!-- 登录入口 -->
          <div class="login-section">
            <span class="login-text">已有账号？</span>
            <router-link to="/login" class="login-link">立即登录</router-link>
          </div>
        </el-form>
      </div>

      <!-- 表单验证提示组件 -->
      <ValidationMessage :visible="validationErrors.length > 0" :message-list="validationErrors"
        :show-summary="validationErrors.length > 3" :closable="true" @close="clearValidationErrors"
        @item-close="removeValidationError" class="validation-container" />

      <!-- 成功提示组件 -->
      <SuccessNotification :visible.sync="successDialog.visible" :title="successDialog.title"
        :success-title="successDialog.successTitle" :success-message="successDialog.successMessage"
        :details="successDialog.details" :tips="successDialog.tips" :actions="successDialog.actions"
        @action="handleSuccessAction" />


    </div>
  </ErrorBoundary>
</template>

<script>
// 导入组件
import FormField from './components/FormField.vue'
import LoadingIndicator from './components/LoadingIndicator.vue'
import SuccessNotification from './components/SuccessNotification.vue'
import ValidationMessage from './components/ValidationMessage.vue'
import ErrorBoundary from './components/ErrorBoundary.vue'

import LoginHeader from '../login/components/LoginHeader.vue'

// 导入API服务
import { submitRegistration, handleRegistrationError } from './api/register'

// 导入常量
import {
  DEFAULT_REGISTER_FORM,
  REGISTER_FORM_RULES,
  DEPARTMENT_OPTIONS,
} from './constants'

// 导入工具函数
import { showErrorMessage } from './utils/errorHandler'

export default {
  name: 'RegisterApply',

  components: {
    LoginHeader,
    FormField,
    LoadingIndicator,
    SuccessNotification,
    ValidationMessage,
    ErrorBoundary
  },

  data() {
    return {
      formData: { ...DEFAULT_REGISTER_FORM },
      formRules: REGISTER_FORM_RULES,
      passwordVisible: false,
      submitLoading: false,
      applicationId: '',
      validationErrors: [],
      successDialog: {
        visible: false,
        title: '申请提交成功',
        successTitle: '注册申请提交成功！',
        successMessage: '',
        details: [],
        tips: ['请保存此申请ID，您可以使用它查询申请状态。'],
        actions: [
          { text: '查看申请状态', type: 'primary', action: 'view-status' },
          { text: '继续申请', type: 'default', action: 'continue' },
          { text: '完成', type: 'default', action: 'finish' }
        ]
      },
      departmentOptions: DEPARTMENT_OPTIONS
    }
  },
  methods: {
    /**
     * 切换密码可见性
     */
    togglePasswordVisibility() {
      this.passwordVisible = !this.passwordVisible
    },

    /**
     * 处理表单提交
     */
    async handleSubmit() {
      try {
        // 先进行表单验证
        if (!this.validateForm()) {
          this.$message.warning('请检查表单中的错误信息')
          return
        }

        // 表单验证
        const valid = await this.$refs.registerForm.validate()
        if (!valid) {
          showErrorMessage('请填写完整的申请信息')
          return
        }

        this.submitLoading = true

        // 提交注册申请
        const response = await submitRegistration(this.formData)

        // 处理成功响应
        if (response.success) {
          this.applicationId = response.data.id

          // 准备成功提示数据
          const applicationData = {
            applicationId: response.data.id,
            applicantName: this.formData.applicantName,
            submittedAt: new Date().toLocaleString('zh-CN')
          }

          // 更新成功对话框数据
          this.successDialog.details = [
            {
              label: '申请编号',
              value: applicationData.applicationId
            },
            {
              label: '申请人',
              value: applicationData.applicantName
            },
            {
              label: '提交时间',
              value: applicationData.submittedAt
            }
          ]

          this.successDialog.successMessage = '您的注册申请已成功提交，我们将在1-3个工作日内完成审核'
          this.successDialog.visible = true
        } else {
          throw new Error(response.error?.message || '提交失败')
        }
      } catch (error) {
        console.error('注册申请提交失败:', error)

        // 使用统一错误处理
        handleRegistrationError(error, {
          context: '提交注册申请'
        })
      } finally {
        this.submitLoading = false
      }
    },

    /**
     * 重置表单
     */
    handleReset() {
      this.$refs.registerForm.resetFields()
      this.passwordVisible = false
      this.clearValidationErrors()
    },

    /**
       * 处理成功通知的操作
       */
    handleSuccessAction(action) {
      if (action === 'view-status') {
        this.goToStatusQuery()
      } else if (action === 'continue') {
        this.submitAnother()
      } else if (action === 'finish') {
        this.successDialog.visible = false
      }
    },

    /**
     * 清除所有验证错误
     */
    clearValidationErrors() {
      this.validationErrors = []
    },

    /**
     * 移除单个验证错误
     */
    removeValidationError(index) {
      this.validationErrors.splice(index, 1)
    },

    /**
     * 添加验证错误
     */
    addValidationError(error) {
      // 避免重复添加相同的错误
      const exists = this.validationErrors.some(existing =>
        existing.field === error.field && existing.message === error.message
      )

      if (!exists) {
        this.validationErrors.push(error)
      }
    },

    /**
     * 处理表单验证
     */
    validateForm() {
      this.clearValidationErrors()

      // 验证必填字段
      const requiredFields = [
        { field: 'applicantName', label: '申请人姓名' },
        { field: 'idNumber', label: '身份证号' },
        { field: 'phone', label: '手机号码' },
        { field: 'email', label: '邮箱地址' },
        { field: 'applicationType', label: '申请类型' },
        { field: 'department', label: '申请部门' },
        { field: 'reason', label: '申请原因' }
      ]

      requiredFields.forEach(({ field, label }) => {
        if (!this.formData[field] || !this.formData[field].trim()) {
          this.addValidationError({
            id: `required_${field}`,
            field,
            message: `${label}不能为空`,
            type: 'error'
          })
        }
      })

      // 验证邮箱格式
      if (this.formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.formData.email)) {
        this.addValidationError({
          id: 'email_format',
          field: 'email',
          message: '邮箱格式不正确',
          type: 'error'
        })
      }

      // 验证手机号格式
      if (this.formData.phone && !/^1[3-9]\d{9}$/.test(this.formData.phone)) {
        this.addValidationError({
          id: 'phone_format',
          field: 'phone',
          message: '手机号格式不正确',
          type: 'error'
        })
      }

      // 验证身份证号格式
      if (this.formData.idNumber && !/^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/.test(this.formData.idNumber)) {
        this.addValidationError({
          id: 'id_format',
          field: 'idNumber',
          message: '身份证号格式不正确',
          type: 'error'
        })
      }

      return this.validationErrors.length === 0
    },

    /**
      * 跳转到状态查询页面
      */
    goToStatusQuery() {
      this.successDialog.visible = false
      this.$router.push({
        path: '/register/status',
        query: { id: this.applicationId }
      })
    },

    /**
     * 提交另一个申请
     */
    submitAnother() {
      this.successDialog.visible = false
      this.handleReset()
      this.applicationId = ''
    },

    /**
     * 处理页面错误
     */
    handlePageError(errorData) {
      console.error('页面错误:', errorData)

      // 记录错误信息
      this.$message.error('页面出现错误，请稍后重试')

      // 可以在这里发送错误报告到服务器
      // this.reportErrorToServer(errorData)
    },

    /**
     * 处理错误重试
     */
    handleErrorRetry(retryCount) {
      console.log(`错误重试，第 ${retryCount} 次`)

      // 重置表单状态
      this.handleReset()

      // 清除错误状态
      this.clearValidationErrors()

      this.$message.info('正在重试...')
    },

    /**
     * 处理错误刷新
     */
    handleErrorReload() {
      console.log('用户选择刷新页面')
      this.$message.info('正在刷新页面...')
    },

    /**
     * 处理返回首页
     */
    handleGoHome() {
      console.log('用户选择返回首页')
      this.$router.push('/')
    },

    /**
     * 处理错误报告
     */
    handleReportError(errorReport) {
      console.log('错误报告:', errorReport)

      // 这里可以发送错误报告到服务器
      // try {
      //   await this.$http.post('/api/error-report', errorReport)
      //   this.$message.success('错误报告已提交')
      // } catch (error) {
      //   console.error('提交错误报告失败:', error)
      //   this.$message.error('提交错误报告失败')
      // }
    }
  }
}
</script>

<style lang="scss" scoped>
.register-apply-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.register-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.register-header {
  text-align: center;
  margin-bottom: 40px;

  .register-title {
    font-size: 28px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 8px 0;
  }

  .register-subtitle {
    font-size: 16px;
    color: #7f8c8d;
    margin: 0;
  }
}

.register-form {
  .form-section {
    margin-bottom: 32px;

    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: #34495e;
      margin: 0 0 20px 0;
      padding-bottom: 8px;
      border-bottom: 2px solid #ecf0f1;
    }
  }

  .password-toggle {
    cursor: pointer;
    color: #909399;
    transition: color 0.3s;

    &:hover {
      color: #409eff;
    }
  }

  .form-actions {
    text-align: center;
    margin-top: 40px;

    .el-button {
      min-width: 120px;
      margin: 0 8px;
    }
  }

  .loading-indicator {
    margin: 20px 0;
    text-align: center;
  }
}

.success-content {
  text-align: center;
  padding: 20px 0;

  .success-icon {
    font-size: 48px;
    color: #67c23a;
    margin-bottom: 16px;
  }

  h3 {
    font-size: 20px;
    color: #2c3e50;
    margin: 0 0 16px 0;
  }

  .success-message {
    font-size: 16px;
    color: #606266;
    margin: 0 0 8px 0;

    .application-id {
      color: #409eff;
      font-family: 'Courier New', monospace;
      background: #f0f9ff;
      padding: 2px 8px;
      border-radius: 4px;
    }
  }

  .success-tip {
    font-size: 14px;
    color: #909399;
    margin: 0;
  }
}

.dialog-footer {
  text-align: center;

  .el-button {
    min-width: 120px;
    margin: 0 8px;
  }
}

// 验证消息容器样式
.validation-container {
  margin-bottom: 20px;
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
  .register-apply-container {
    padding: 10px;
  }

  .register-card {
    padding: 20px;
  }

  .register-header {
    margin-bottom: 30px;

    .register-title {
      font-size: 24px;
    }

    .register-subtitle {
      font-size: 14px;
    }
  }

  .register-form {
    .form-section {
      margin-bottom: 24px;

      .section-title {
        font-size: 16px;
      }
    }

    .form-actions {
      margin-top: 30px;

      .el-button {
        width: 100%;
        margin: 8px 0;
      }
    }

    .login-section {
      .login-link {
        display: block;
        margin-top: 8px;
      }
    }
  }
}
</style>
