<!--
文件名称：ApprovalDialog.vue
文件描述：工艺模板审批操作对话框，处理提交审批、审批通过、审批驳回、撤回审批、作废版本等操作
创建日期：2025-10-15
修改记录：
  - 2025-10-15: 初始创建，完成TASK05 P0阶段审批流程功能
-->

<template>
  <el-dialog
    :visible.sync="internalVisible"
    :title="dialogTitle"
    :width="dialogWidth"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    append-to-body
    custom-class="approval-dialog"
    @close="handleClose"
  >
    <div class="approval-dialog__body">
      <!-- 操作说明提示 -->
      <el-alert
        :title="alertTitle"
        :type="alertType"
        :description="alertDescription"
        show-icon
        :closable="false"
        class="approval-dialog__alert"
      />

      <!-- 基本信息展示 -->
      <el-descriptions
        v-if="templateInfo"
        :column="2"
        border
        size="small"
        class="approval-dialog__info"
      >
        <el-descriptions-item label="模板编码">
          {{ templateInfo.templateCode || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="模板名称">
          {{ templateInfo.templateName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="版本号">
          {{ templateInfo.versionNumber || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="当前状态">
          <el-tag :type="getStatusType(templateInfo.status)" size="mini">
            {{ templateInfo.status || '-' }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 审批表单 -->
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
        class="approval-dialog__form"
      >
        <!-- 审批意见/备注 -->
        <el-form-item
          :label="commentLabel"
          prop="approvalComment"
        >
          <el-input
            v-model="formData.approvalComment"
            type="textarea"
            :rows="4"
            :maxlength="500"
            show-word-limit
            :placeholder="commentPlaceholder"
          />
        </el-form-item>

        <!-- 生效日期（仅审批通过时显示） -->
        <el-form-item
          v-if="actionType === 'approve'"
          label="生效日期"
          prop="effectiveDate"
        >
          <el-date-picker
            v-model="formData.effectiveDate"
            type="datetime"
            placeholder="选择生效日期"
            format="yyyy-MM-dd HH:mm:ss"
            value-format="yyyy-MM-ddTHH:mm:ss.000Z"
            :picker-options="effectiveDatePickerOptions"
            style="width: 100%;"
          />
          <div class="form-item-tip">不填写默认为当前时间生效</div>
        </el-form-item>

        <!-- 失效日期（仅审批通过时显示） -->
        <el-form-item
          v-if="actionType === 'approve'"
          label="失效日期"
          prop="expiryDate"
        >
          <el-date-picker
            v-model="formData.expiryDate"
            type="datetime"
            placeholder="选择失效日期"
            format="yyyy-MM-dd HH:mm:ss"
            value-format="yyyy-MM-ddTHH:mm:ss.000Z"
            :picker-options="expiryDatePickerOptions"
            style="width: 100%;"
          />
          <div class="form-item-tip">不填写表示长期有效</div>
        </el-form-item>
      </el-form>
    </div>

    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button
        :type="confirmButtonType"
        :loading="submitting"
        @click="handleConfirm"
      >
        {{ confirmButtonText }}
      </el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  name: 'ApprovalDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    // 操作类型：submit-提交审批，approve-审批通过，reject-审批驳回，withdraw-撤回审批，void-作废版本
    actionType: {
      type: String,
      required: true,
      validator: (value) => ['submit', 'approve', 'reject', 'withdraw', 'void'].includes(value)
    },
    // 模板信息
    templateInfo: {
      type: Object,
      default: () => null
    }
  },
  data() {
    return {
      internalVisible: false,
      submitting: false,
      formData: {
        approvalComment: '',
        effectiveDate: '',
        expiryDate: ''
      }
    }
  },
  computed: {
    dialogTitle() {
      const titleMap = {
        submit: '提交审批',
        approve: '审批通过',
        reject: '审批驳回',
        withdraw: '撤回审批',
        void: '作废版本'
      }
      return titleMap[this.actionType] || '审批操作'
    },
    dialogWidth() {
      return '600px'
    },
    alertType() {
      const typeMap = {
        submit: 'info',
        approve: 'success',
        reject: 'warning',
        withdraw: 'info',
        void: 'error'
      }
      return typeMap[this.actionType] || 'info'
    },
    alertTitle() {
      const titleMap = {
        submit: '提交审批确认',
        approve: '审批通过确认',
        reject: '审批驳回确认',
        withdraw: '撤回审批确认',
        void: '作废版本确认'
      }
      return titleMap[this.actionType] || '操作确认'
    },
    alertDescription() {
      const descMap = {
        submit: '提交审批后，版本状态将变为"待审批"，需要审批人员进行审批。',
        approve: '审批通过后，版本状态将变为"生效"，可用于生产任务。如存在其他生效版本，将自动转为"历史"状态。',
        reject: '审批驳回后，版本状态将变为"驳回"，需要修改后重新提交审批。必须填写驳回原因。',
        withdraw: '撤回审批后，版本状态将变回"草稿"，可重新编辑后再次提交审批。',
        void: '作废版本后，版本状态将变为"作废"，不可再使用且无法恢复。此操作不可逆，请谨慎操作。'
      }
      return descMap[this.actionType] || ''
    },
    commentLabel() {
      const labelMap = {
        submit: '提交说明',
        approve: '审批意见',
        reject: '驳回原因',
        withdraw: '撤回原因',
        void: '作废原因'
      }
      return labelMap[this.actionType] || '备注'
    },
    commentPlaceholder() {
      const placeholderMap = {
        submit: '请输入提交说明（可选）',
        approve: '请输入审批意见（可选）',
        reject: '请输入驳回原因（必填）',
        withdraw: '请输入撤回原因（可选）',
        void: '请输入作废原因（可选）'
      }
      return placeholderMap[this.actionType] || '请输入备注'
    },
    confirmButtonText() {
      const textMap = {
        submit: '提交审批',
        approve: '审批通过',
        reject: '驳回',
        withdraw: '撤回',
        void: '作废'
      }
      return textMap[this.actionType] || '确认'
    },
    confirmButtonType() {
      const typeMap = {
        submit: 'primary',
        approve: 'success',
        reject: 'warning',
        withdraw: 'info',
        void: 'danger'
      }
      return typeMap[this.actionType] || 'primary'
    },
    formRules() {
      const rules = {
        approvalComment: []
      }

      // 驳回操作必须填写原因
      if (this.actionType === 'reject') {
        rules.approvalComment.push(
          { required: true, message: '请输入驳回原因', trigger: 'blur' }
        )
      }

      // 字符长度限制
      rules.approvalComment.push(
        { max: 500, message: '字符长度不能超过500', trigger: 'blur' }
      )

      // 审批通过时的日期校验
      if (this.actionType === 'approve') {
        rules.expiryDate = [
          {
            validator: (rule, value, callback) => {
              if (value && this.formData.effectiveDate) {
                const effectiveTime = new Date(this.formData.effectiveDate).getTime()
                const expiryTime = new Date(value).getTime()
                if (expiryTime <= effectiveTime) {
                  callback(new Error('失效日期必须晚于生效日期'))
                  return
                }
              }
              callback()
            },
            trigger: 'change'
          }
        ]
      }

      return rules
    },
    effectiveDatePickerOptions() {
      return {
        disabledDate: (time) => {
          // 禁用过去的日期（可选）
          // return time.getTime() < Date.now() - 8.64e7
          return false
        }
      }
    },
    expiryDatePickerOptions() {
      return {
        disabledDate: (time) => {
          // 失效日期必须晚于生效日期
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

      try {
        this.submitting = true
        // 表单验证
        await this.$refs.formRef.validate()

        // 构建提交数据
        const payload = {
          currentStatus: this.templateInfo.status
        }

        // 审批意见（驳回时必填，其他可选）
        if (this.formData.approvalComment.trim()) {
          payload.approvalComment = this.formData.approvalComment.trim()
        }

        // 审批通过时添加生效日期和失效日期
        if (this.actionType === 'approve') {
          if (this.formData.effectiveDate) {
            payload.effectiveDate = this.formData.effectiveDate
          }
          if (this.formData.expiryDate) {
            payload.expiryDate = this.formData.expiryDate
          }
        }

        // 触发确认事件
        this.$emit('confirm', payload)
        this.resetForm()
      } catch (error) {
        // 验证失败时不做提示，由表单展示错误
        if (error && error.message && error.message !== '验证失败') {
          console.warn('[ApprovalDialog] validation failed', error.message)
        }
      } finally {
        this.submitting = false
      }
    },

    resetForm() {
      this.formData = {
        approvalComment: '',
        effectiveDate: '',
        expiryDate: ''
      }
      if (this.$refs.formRef) {
        this.$refs.formRef.resetFields()
      }
    },

    getStatusType(status) {
      const typeMap = {
        '草稿': 'info',
        '待审批': 'warning',
        '生效': 'success',
        '历史': 'default',
        '驳回': 'danger',
        '作废': 'info'
      }
      return typeMap[status] || 'info'
    }
  }
}
</script>

<style lang="scss" scoped>
.approval-dialog__body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.approval-dialog__alert {
  margin-bottom: 4px;
}

.approval-dialog__info {
  margin-top: 8px;
}

.approval-dialog__form {
  margin-top: 12px;
}

.form-item-tip {
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

::v-deep .el-descriptions__label {
  width: 90px;
}
</style>

