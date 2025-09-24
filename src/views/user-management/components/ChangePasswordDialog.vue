<!--
  文件名称：ChangePasswordDialog.vue
  文件描述：用户修改密码对话框组件
  创建日期：2024-01-20
  修改记录：
    - 2024-01-20: 初始创建，实现用户自主修改密码功能
-->
<template>
  <el-dialog
    :visible.sync="dialogVisible"
    title="修改密码"
    width="680px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    top="5vh"
    @close="handleClose"
  >
    <!-- 修改密码表单 -->
    <el-form ref="changeForm" :model="formData" :rules="formRules" label-width="100px" class="change-form">
      <!-- 当前密码 -->
      <el-form-item label="当前密码" prop="currentPassword">
        <el-input
          v-model="formData.currentPassword"
          type="password"
          placeholder="请输入当前密码"
          autocomplete="current-password"
          :security-mode="true"
          show-password
        />
      </el-form-item>

      <!-- 新密码 -->
      <el-form-item label="新密码" prop="newPassword">
        <secure-password-input
          v-model="formData.newPassword"
          placeholder="请输入新密码"
          :show-generate-button="true"
          :security-mode="false"
          @password-generated="handlePasswordGenerated"
        />
      </el-form-item>

      <!-- 确认新密码 -->
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input
          v-model="formData.confirmPassword"
          type="password"
          placeholder="请再次输入新密码"
          autocomplete="new-password"
          show-password
        />
      </el-form-item>
    </el-form>

    <!-- 密码安全提示 - 紧凑版 -->
    <div class="security-tips">
      <el-alert title="密码安全建议" type="info" :closable="false" show-icon>
        <template #default>
          <div class="tips-compact">
            定期更换密码，不要使用与其他网站相同的密码，密码应包含大小写字母、数字和特殊字符，避免使用个人信息作为密码。
          </div>
        </template>
      </el-alert>
    </div>

    <!-- 对话框底部按钮 -->
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleConfirm">
          {{ loading ? '修改中...' : '确认修改' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import { changeUserPassword } from '../api/user-management'
import { validatePasswordBasic } from '../utils/password-utils'
import SecurePasswordInput from './SecurePasswordInput.vue'

export default {
  name: 'ChangePasswordDialog',
  components: {
    SecurePasswordInput
  },
  props: {
    // 对话框显示状态
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      dialogVisible: this.visible,
      loading: false,
      formData: {
        currentPassword: '', // 当前密码
        newPassword: '', // 新密码
        confirmPassword: '' // 确认密码
      },
      formRules: {
        currentPassword: [
          { required: true, message: '请输入当前密码', trigger: 'blur' }
        ],
        newPassword: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          {
            validator: this.validateNewPassword,
            trigger: 'blur'
          }
        ],
        confirmPassword: [
          { required: true, message: '请确认新密码', trigger: 'blur' },
          {
            validator: this.validateConfirmPassword,
            trigger: 'blur'
          }
        ]
      }
    }
  },
  watch: {
    visible(newVal) {
      this.dialogVisible = newVal
    },
    dialogVisible(newVal) {
      this.$emit('update:visible', newVal)

      // 对话框打开时聚焦第一个输入框
      if (newVal) {
        this.$nextTick(() => {
          const firstInput = this.$el.querySelector('input')
          if (firstInput) {
            firstInput.focus()
          }
        })
      }
    }
  },
  methods: {
    /**
         * 验证新密码
         */
    validateNewPassword(rule, value, callback) {
      if (!value) {
        callback(new Error('请输入新密码'))
      } else if (!validatePasswordBasic(value)) {
        callback(new Error('密码至少8位，必须包含字母和数字'))
      } else if (value === this.formData.currentPassword) {
        callback(new Error('新密码不能与当前密码相同'))
      } else {
        // 重新验证确认密码
        if (this.formData.confirmPassword) {
          this.$refs.changeForm.validateField('confirmPassword')
        }
        callback()
      }
    },

    /**
         * 验证确认密码
         */
    validateConfirmPassword(rule, value, callback) {
      if (!value) {
        callback(new Error('请确认新密码'))
      } else if (value !== this.formData.newPassword) {
        callback(new Error('两次输入的密码不一致'))
      } else {
        callback()
      }
    },

    /**
         * 密码生成处理
         */
    handlePasswordGenerated(password) {
      this.formData.newPassword = password
      this.formData.confirmPassword = password

      // 重新验证表单
      this.$nextTick(() => {
                this.$refs.changeForm?.validateField('newPassword')
                this.$refs.changeForm?.validateField('confirmPassword')
      })
    },

    /**
         * 确认修改
         */
    async handleConfirm() {
      try {
        // 表单验证
        await this.$refs.changeForm.validate()

        this.loading = true

        // 调用修改密码API
        const response = await changeUserPassword({
          currentPassword: this.formData.currentPassword,
          newPassword: this.formData.newPassword
        })

        if (response.success) {
          this.$message.success('密码修改成功，请使用新密码登录')
          this.$emit('success', response.data)
          this.handleClose()

          // 可选：修改成功后跳转到登录页面
          if (this.$route.name !== 'Login') {
            this.$confirm('密码已修改成功，是否重新登录？', '提示', {
              confirmButtonText: '重新登录',
              cancelButtonText: '稍后登录',
              type: 'success'
            }).then(() => {
              // 清除本地存储的认证信息
              this.$store.dispatch('user/logout').then(() => {
                this.$router.push('/login')
              })
            })
          }
        }
      } catch (error) {
        console.error('修改密码失败:', error)

        // 根据错误类型显示不同的错误信息
        let errorMessage = '修改密码失败'

        if (error.response?.data?.error?.code === 'AUTH_013') {
          errorMessage = '当前密码错误，请重新输入'
        } else if (error.response?.data?.error?.code === 'VAL_005') {
          errorMessage = '新密码格式不符合要求'
        } else if (error.message) {
          errorMessage = error.message
        }

        this.$message.error(errorMessage)
      } finally {
        this.loading = false
      }
    },

    /**
         * 取消操作
         */
    handleCancel() {
      this.handleClose()
    },

    /**
         * 关闭对话框
         */
    handleClose() {
      this.dialogVisible = false
      this.resetForm()
      this.$emit('close')
    },

    /**
         * 重置表单
         */
    resetForm() {
      this.formData = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }

      this.$nextTick(() => {
                this.$refs.changeForm?.clearValidate()
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.change-form {
  margin-bottom: 16px;
}

.security-tips {
  margin-bottom: 16px;

  .tips-compact {
    font-size: 12px;
    line-height: 1.4;
    color: #606266;
  }

  .tips-list {
    margin: 0;
    padding-left: 16px;

    li {
      font-size: 13px;
      line-height: 1.5;
      margin-bottom: 4px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

.dialog-footer {
  text-align: right;
  padding-top: 16px;
}

// 对话框内容优化
::v-deep .el-dialog {
  margin-bottom: 5vh !important;

  .el-dialog__body {
    padding: 20px 20px 10px 20px;
  }

  .el-dialog__footer {
    padding: 10px 20px 20px 20px;
  }
}

// 响应式优化
@media (max-height: 800px) {
  ::v-deep .el-dialog {
    margin-top: 3vh !important;
    margin-bottom: 3vh !important;
  }
}

@media (max-height: 600px) {
  ::v-deep .el-dialog {
    margin-top: 2vh !important;
    margin-bottom: 2vh !important;

    .el-dialog__body {
      padding: 15px 20px 5px 20px;
    }

    .el-dialog__footer {
      padding: 5px 20px 15px 20px;
    }
  }

  .security-tips {
    margin-bottom: 12px;
  }

  .change-form {
    margin-bottom: 12px;
  }
}
</style>

