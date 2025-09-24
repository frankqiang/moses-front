<!--
  文件名称：ResetPasswordDialog.vue
  文件描述：管理员重置用户密码对话框组件
  创建日期：2024-01-20
  修改记录：
    - 2024-01-20: 初始创建，实现管理员重置密码功能
-->
<template>
  <el-dialog
    :visible.sync="dialogVisible"
    title="重置用户密码"
    width="680px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    top="5vh"
    @close="handleClose"
  >
    <!-- 用户信息展示 -->
    <div class="user-info">
      <el-alert
        :title="`正在为用户 ${userData.name || userData.username} 重置密码`"
        type="warning"
        :closable="false"
        show-icon
      />
    </div>

    <!-- 重置密码表单 -->
    <el-form ref="resetForm" :model="formData" :rules="formRules" label-width="120px" class="reset-form">
      <!-- 重置方式选择 -->
      <el-form-item label="重置方式" prop="resetMode">
        <el-radio-group v-model="formData.resetMode" @change="handleResetModeChange">
          <el-radio label="auto">系统自动生成</el-radio>
          <el-radio label="manual">手动输入新密码</el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- 手动输入新密码 -->
      <el-form-item v-if="formData.resetMode === 'manual'" label="新密码" prop="newPassword">
        <secure-password-input
          v-model="formData.newPassword"
          placeholder="请输入新密码"
          :show-generate-button="true"
          :security-mode="false"
          @password-generated="handlePasswordGenerated"
        />
      </el-form-item>

      <!-- 确认新密码 -->
      <el-form-item v-if="formData.resetMode === 'manual'" label="确认密码" prop="confirmPassword">
        <el-input
          v-model="formData.confirmPassword"
          type="password"
          placeholder="请再次输入新密码"
          autocomplete="new-password"
        />
      </el-form-item>

      <!-- 强制修改密码选项 -->
      <el-form-item label="安全设置">
        <el-checkbox v-model="formData.requirePasswordChange">
          要求用户下次登录时修改密码
        </el-checkbox>
        <div class="setting-hint">
          <i class="el-icon-info" />
          建议开启此选项以确保账户安全
        </div>
      </el-form-item>

      <!-- 重置原因 -->
      <el-form-item label="重置原因" prop="reason">
        <el-input
          v-model="formData.reason"
          type="textarea"
          placeholder="请输入重置密码的原因（可选）"
          :rows="3"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>
    </el-form>

    <!-- 安全提示 - 紧凑版 -->
    <div class="security-tips">
      <el-alert title="安全提示" type="info" :closable="false" show-icon>
        <template #default>
          <div class="tips-compact">
            重置后的密码请妥善保管并安全传达给用户，建议要求用户首次登录后立即修改密码，系统会记录此次密码重置操作。
          </div>
        </template>
      </el-alert>
    </div>

    <!-- 对话框底部按钮 -->
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleConfirm">
          {{ loading ? '重置中...' : '确认重置' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import { resetUserPassword } from '../api/user-management'
import { validatePasswordBasic } from '../utils/password-utils'
import SecurePasswordInput from './SecurePasswordInput.vue'

export default {
  name: 'ResetPasswordDialog',
  components: {
    SecurePasswordInput
  },
  props: {
    // 对话框显示状态
    visible: {
      type: Boolean,
      default: false
    },
    // 用户数据
    userData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      dialogVisible: this.visible,
      loading: false,
      formData: {
        resetMode: 'auto', // 重置方式：auto-自动生成，manual-手动输入
        newPassword: '', // 新密码
        confirmPassword: '', // 确认密码
        requirePasswordChange: true, // 是否要求下次登录修改密码
        reason: '' // 重置原因
      },
      formRules: {
        newPassword: [
          {
            validator: this.validateNewPassword,
            trigger: 'blur'
          }
        ],
        confirmPassword: [
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
    }
  },
  methods: {
    /**
         * 验证新密码
         */
    validateNewPassword(rule, value, callback) {
      if (this.formData.resetMode === 'manual') {
        if (!value) {
          callback(new Error('请输入新密码'))
        } else if (!validatePasswordBasic(value)) {
          callback(new Error('密码至少8位，必须包含字母和数字'))
        } else {
          callback()
        }
      } else {
        callback()
      }
    },

    /**
         * 验证确认密码
         */
    validateConfirmPassword(rule, value, callback) {
      if (this.formData.resetMode === 'manual') {
        if (!value) {
          callback(new Error('请确认新密码'))
        } else if (value !== this.formData.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      } else {
        callback()
      }
    },

    /**
         * 重置方式改变处理
         */
    handleResetModeChange(mode) {
      if (mode === 'auto') {
        this.formData.newPassword = ''
        this.formData.confirmPassword = ''
      }

      // 清除验证错误
      this.$nextTick(() => {
                this.$refs.resetForm?.clearValidate()
      })
    },

    /**
         * 密码生成处理
         */
    handlePasswordGenerated(password) {
      this.formData.newPassword = password
      this.formData.confirmPassword = password
    },

    /**
         * 确认重置
         */
    async handleConfirm() {
      try {
        // 表单验证
        await this.$refs.resetForm.validate()

        this.loading = true

        // 准备重置数据
        const resetData = {
          requirePasswordChange: this.formData.requirePasswordChange
        }

        // 如果是手动输入模式，传递新密码
        if (this.formData.resetMode === 'manual') {
          resetData.newPassword = this.formData.newPassword
        }

        // 调用重置密码API
        const response = await resetUserPassword(this.userData.id, resetData)

        if (response.success) {
          const message = '密码重置成功'

          // 如果是自动生成密码，显示临时密码
          if (response.data?.temporaryPassword) {
            this.$alert(
              `临时密码：${response.data.temporaryPassword}\n请妥善保管并安全传达给用户`,
              '密码重置成功',
              {
                confirmButtonText: '已复制',
                type: 'success',
                dangerouslyUseHTMLString: false
              }
            )

            // 尝试复制到剪贴板
            if (navigator.clipboard) {
              navigator.clipboard.writeText(response.data.temporaryPassword)
            }
          } else {
            this.$message.success(message)
          }

          this.$emit('success', response.data)
          this.handleClose()
        }
      } catch (error) {
        console.error('重置密码失败:', error)
        this.$message.error(error.message || '重置密码失败')
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
        resetMode: 'auto',
        newPassword: '',
        confirmPassword: '',
        requirePasswordChange: true,
        reason: ''
      }

      this.$nextTick(() => {
                this.$refs.resetForm?.clearValidate()
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.user-info {
  margin-bottom: 16px;
}

.reset-form {
  margin-bottom: 16px;

  .setting-hint {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
    display: flex;
    align-items: center;

    i {
      margin-right: 4px;
    }
  }
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

// 对话框内容优化 - 与ChangePasswordDialog保持一致
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

  .reset-form {
    margin-bottom: 12px;
  }

  .user-info {
    margin-bottom: 12px;
  }
}
</style>

