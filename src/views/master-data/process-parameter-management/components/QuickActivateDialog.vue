<!--
文件名称：QuickActivateDialog.vue
文件描述：快速生效对话框，跳过审批流程直接将版本设为生效状态
创建日期：2025-10-15
修改记录:
  - 2025-10-15: 初始创建，完成TASK06 P0阶段第4项任务（不限制管理员权限）
-->

<template>
  <el-dialog
    :visible.sync="visibleProxy"
    title="快速生效"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    width="600px"
    class="quick-activate-dialog"
    @close="handleClose"
  >
    <!-- 警告提示 -->
    <el-alert
      type="warning"
      show-icon
      :closable="false"
      title="重要提示"
      style="margin-bottom: 20px"
    >
      <div slot="default">
        <p style="margin: 0 0 8px 0; font-weight: 600;">此操作将跳过审批流程，直接将版本设为"生效"状态。</p>
        <ul style="margin: 0; padding-left: 20px;">
          <li>适用于紧急情况或测试场景</li>
          <li>如存在其他生效版本，会自动转为"历史"状态</li>
          <li>正式环境建议使用标准审批流程</li>
        </ul>
      </div>
    </el-alert>

    <!-- 错误提示 -->
    <el-alert
      v-if="errorMessage"
      type="error"
      show-icon
      :closable="false"
      :title="errorMessage"
      style="margin-bottom: 16px"
    />

    <!-- 版本信息提示 -->
    <el-alert
      v-if="templateInfo && versionInfo"
      type="info"
      :closable="false"
      show-icon
      style="margin-bottom: 20px"
    >
      <div slot="title">
        <strong>模板：</strong>{{ templateInfo.templateCode }} - {{ templateInfo.templateName }}
        <br>
        <strong>版本：</strong>{{ versionInfo.versionNumber }}
        <span v-if="versionInfo.versionDescription" style="margin-left: 8px; color: #909399;">
          （{{ versionInfo.versionDescription }}）
        </span>
      </div>
    </el-alert>

    <el-form
      ref="activateForm"
      :model="formData"
      :rules="formRules"
      label-width="120px"
      size="medium"
      :disabled="submitting"
      @submit.native.prevent
    >
      <el-form-item label="生效日期" prop="effectiveDate">
        <el-date-picker
          v-model="formData.effectiveDate"
          type="datetime"
          placeholder="选择生效日期（默认当前时间）"
          value-format="yyyy-MM-dd HH:mm:ss"
          format="yyyy-MM-dd HH:mm:ss"
          style="width: 100%;"
          :picker-options="effectiveDatePickerOptions"
        />
        <small class="field-hint">
          不选择则使用当前时间作为生效日期
        </small>
      </el-form-item>

      <el-form-item label="失效日期" prop="expiryDate">
        <el-date-picker
          v-model="formData.expiryDate"
          type="datetime"
          placeholder="选择失效日期（可选）"
          value-format="yyyy-MM-dd HH:mm:ss"
          format="yyyy-MM-dd HH:mm:ss"
          style="width: 100%;"
          :picker-options="expiryDatePickerOptions"
          clearable
        />
        <small class="field-hint">
          失效日期必须晚于生效日期，不设置则永久生效
        </small>
      </el-form-item>

      <el-form-item label="操作备注" prop="comment">
        <el-input
          v-model="formData.comment"
          type="textarea"
          :rows="3"
          placeholder="请输入操作备注，如：紧急启用新工艺、测试用途等"
          maxlength="500"
          show-word-limit
        />
        <small class="field-hint">
          建议说明快速生效的原因，便于后续查阅
        </small>
      </el-form-item>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button :disabled="submitting" @click="handleCancel">
        取消
      </el-button>
      <el-button
        type="danger"
        :loading="submitting"
        @click="handleSubmit"
      >
        {{ submitting ? '生效中...' : '确认生效' }}
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { activateProcessTemplateVersion } from '../api'
import { MESSAGE_FALLBACKS } from '../constants/messages-config'

export default {
  name: 'QuickActivateDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    templateInfo: {
      type: Object,
      default: null
    },
    versionInfo: {
      type: Object,
      default: null
    }
  },
  data() {
    const validateExpiryDate = (rule, value, callback) => {
      if (value && this.formData.effectiveDate) {
        const effectiveTime = new Date(this.formData.effectiveDate).getTime()
        const expiryTime = new Date(value).getTime()

        if (expiryTime <= effectiveTime) {
          callback(new Error('失效日期必须晚于生效日期'))
        } else {
          callback()
        }
      } else {
        callback()
      }
    }

    return {
      visibleProxy: false,
      submitting: false,
      errorMessage: '',
      formData: {
        effectiveDate: '',
        expiryDate: '',
        comment: ''
      },
      formRules: {
        expiryDate: [
          { validator: validateExpiryDate, trigger: 'change' }
        ],
        comment: [
          { max: 500, message: '操作备注不能超过500个字符', trigger: 'blur' }
        ]
      },
      effectiveDatePickerOptions: {
        disabledDate(time) {
          // 可以选择当前时间之前的日期（用于补录历史数据）
          return false
        }
      },
      expiryDatePickerOptions: {
        disabledDate: (time) => {
          // 失效日期不能早于生效日期
          if (this.formData.effectiveDate) {
            const effectiveTime = new Date(this.formData.effectiveDate).getTime()
            return time.getTime() <= effectiveTime
          }
          return false
        }
      }
    }
  },
  watch: {
    visible: {
      immediate: true,
      handler(val) {
        this.visibleProxy = val
        if (val) {
          this.initializeForm()
        }
      }
    },
    visibleProxy(val) {
      this.$emit('update:visible', val)
      if (!val) {
        this.resetForm()
      }
    },
    'formData.effectiveDate'() {
      // 生效日期变化时，重新验证失效日期
      if (this.formData.expiryDate) {
        this.$refs.activateForm && this.$refs.activateForm.validateField('expiryDate')
      }
    }
  },
  methods: {
    initializeForm() {
      this.errorMessage = ''
      // 默认使用当前时间作为生效日期
      // this.formData.effectiveDate = this.formatDateTime(new Date())
    },

    formatDateTime(date) {
      if (!date) return ''
      const d = new Date(date)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      const hours = String(d.getHours()).padStart(2, '0')
      const minutes = String(d.getMinutes()).padStart(2, '0')
      const seconds = String(d.getSeconds()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    },

    async handleSubmit() {
      // 验证表单
      const valid = await new Promise((resolve) => {
        this.$refs.activateForm.validate((isValid) => {
          if (!isValid) {
            this.$message.warning('请检查输入格式')
          }
          resolve(isValid)
        })
      })

      if (!valid || this.submitting) {
        return
      }

      if (!this.templateInfo || !this.templateInfo.id || !this.versionInfo || !this.versionInfo.id) {
        this.$message.error('缺少模板或版本信息')
        return
      }

      this.submitting = true
      this.errorMessage = ''

      try {
        // 调用快速生效接口
        const payload = {
          effectiveDate: this.formData.effectiveDate ? this.convertToISO8601(this.formData.effectiveDate) : undefined,
          expiryDate: this.formData.expiryDate ? this.convertToISO8601(this.formData.expiryDate) : undefined,
          comment: this.formData.comment || undefined
        }

        const response = await activateProcessTemplateVersion(
          this.templateInfo.id,
          this.versionInfo.id,
          payload
        )

        // 使用后端返回的消息
        this.$message.success(response.message || MESSAGE_FALLBACKS.activateVersion)

        // 通知父组件操作成功
        this.$emit('success', {
          templateId: this.templateInfo.id,
          versionId: this.versionInfo.id,
          version: response.data
        })

        // 关闭对话框
        this.visibleProxy = false
      } catch (error) {
        console.error('[QuickActivateDialog] submit failed', error)

        // 优先显示后端返回的错误消息
        const errorMsg = error?.response?.data?.error?.message || error?.message || '快速生效失败，请检查输入'

        this.errorMessage = errorMsg
        this.$message.error(errorMsg)
      } finally {
        this.submitting = false
      }
    },

    convertToISO8601(dateStr) {
      if (!dateStr) return undefined
      // 如果已经是ISO 8601格式，直接返回
      if (dateStr.includes('T') && dateStr.includes('Z')) {
        return dateStr
      }
      // 转换为ISO 8601格式
      const date = new Date(dateStr)
      return date.toISOString()
    },

    handleCancel() {
      this.visibleProxy = false
      this.$emit('cancel')
    },

    handleClose() {
      this.visibleProxy = false
      this.$emit('close')
    },

    resetForm() {
      this.formData = {
        effectiveDate: '',
        expiryDate: '',
        comment: ''
      }
      this.errorMessage = ''
      this.submitting = false

      // 清除验证状态
      this.$nextTick(() => {
        if (this.$refs.activateForm) {
          this.$refs.activateForm.clearValidate()
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
.quick-activate-dialog {
  ::v-deep .el-dialog__body {
    padding: 20px 30px;
  }
}

.field-hint {
  display: block;
  margin-top: 4px;
  color: #909399;
  font-size: 12px;
  line-height: 1.5;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>

