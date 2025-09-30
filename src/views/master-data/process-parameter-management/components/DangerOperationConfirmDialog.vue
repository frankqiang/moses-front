<!--
文件名称：DangerOperationConfirmDialog.vue
文件描述：危险操作确认对话框，提供二次验证提示与风险说明
创建日期：2025-09-30
修改记录：
  - 2025-09-30: 初始创建，支持输入校验与风险说明可配置
-->

<template>
  <el-dialog
    :visible.sync="internalVisible"
    :title="dialogTitle"
    :width="dialogWidth"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    append-to-body
    custom-class="danger-operation-confirm-dialog"
    @close="handleClose"
  >
    <div class="danger-operation-confirm-dialog__body">
      <el-alert
        type="warning"
        :title="alertTitle"
        :description="alertDescription"
        show-icon
        :closable="false"
        class="danger-operation-confirm-dialog__alert"
      />

      <el-form
        ref="formRef"
        :model="formModel"
        :rules="formRules"
        label-width="0"
        class="danger-operation-confirm-dialog__form"
      >
        <el-form-item prop="confirmText">
          <el-input
            v-model="formModel.confirmText"
            :placeholder="inputPlaceholder"
            maxlength="32"
            clearable
          />
        </el-form-item>
        <el-form-item v-if="showReason" prop="reason">
          <el-input
            v-model="formModel.reason"
            type="textarea"
            :rows="3"
            maxlength="200"
            show-word-limit
            placeholder="请输入操作原因（可选）"
          />
        </el-form-item>
      </el-form>
    </div>

    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleConfirm">确认操作</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  name: 'DangerOperationConfirmDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    operation: {
      type: String,
      default: 'delete'
    },
    templateName: {
      type: String,
      default: ''
    },
    confirmKeyword: {
      type: String,
      default: '删除'
    },
    showReason: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      internalVisible: false,
      submitting: false,
      formModel: {
        confirmText: '',
        reason: ''
      },
      formRules: {
        confirmText: [
          { required: true, message: '请输入确认关键词', trigger: 'blur' },
          {
            validator: (_, value, callback) => {
              if (!value || value.trim() !== this.confirmKeyword) {
                callback(new Error(`请输入“${this.confirmKeyword}”以确认`))
                return
              }
              callback()
            },
            trigger: 'blur'
          }
        ],
        reason: [
          {
            validator: (_, value, callback) => {
              if (value && value.trim().length > 200) {
                callback(new Error('备注长度不能超过200个字符'))
                return
              }
              callback()
            },
            trigger: 'blur'
          }
        ]
      }
    }
  },
  computed: {
    dialogTitle() {
      const map = {
        delete: '删除确认',
        void: '作废确认'
      }
      return map[this.operation] || '确认操作'
    },
    alertTitle() {
      const map = {
        delete: '危险操作：删除工艺模板',
        void: '危险操作：作废工艺模板版本'
      }
      return map[this.operation] || '危险操作'
    },
    alertDescription() {
      const base = '该操作无法撤销，请确认已完成引用检查并告知相关业务人员。'
      if (this.templateName) {
        return `即将对模板「${this.templateName}」执行操作。${base}`
      }
      return base
    },
    inputPlaceholder() {
      return `请输入 “${this.confirmKeyword}” 以确认`
    },
    dialogWidth() {
      return '480px'
    }
  },
  watch: {
    visible: {
      immediate: true,
      handler(val) {
        this.internalVisible = val
        if (!val) {
          this.resetForm()
        }
      }
    }
  },
  methods: {
    handleClose() {
      this.internalVisible = false
      this.$emit('update:visible', false)
      this.$emit('cancel')
      this.resetForm()
    },
    async handleConfirm() {
      if (this.submitting) return
      const form = this.$refs.formRef
      if (!form) return
      try {
        this.submitting = true
        await form.validate()
        this.$emit('confirm', {
          reason: this.formModel.reason.trim(),
          confirmText: this.formModel.confirmText.trim()
        })
        this.resetForm()
      } catch (error) {
        // 验证失败时不做提示，由表单展示
        if (error && error.message) {
          console.warn('[DangerOperationConfirmDialog] validation failed', error.message)
        }
      } finally {
        this.submitting = false
      }
    },
    resetForm() {
      this.formModel.confirmText = ''
      this.formModel.reason = ''
      if (this.$refs.formRef) {
        this.$refs.formRef.resetFields()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.danger-operation-confirm-dialog__body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.danger-operation-confirm-dialog__alert {
  margin-bottom: 4px;
}

.danger-operation-confirm-dialog__form {
  margin-top: 8px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
