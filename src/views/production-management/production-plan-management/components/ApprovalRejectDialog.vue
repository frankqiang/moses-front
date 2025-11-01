<!--
  文件名称：ApprovalRejectDialog.vue
  文件描述：审批驳回对话框组件
  创建日期：2025-01-21
  修改记录：
    - 2025-01-21: 初始创建
-->
<template>
  <el-dialog
    :visible.sync="visible"
    title="驳回审批"
    width="750px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <!-- 审批请求信息 -->
    <approval-info-card
      v-if="approvalData"
      :approval-data="approvalData"
      :plan-data="planData"
    />

    <el-divider />

    <!-- 审批表单 -->
    <el-form
      ref="form"
      :model="formData"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="驳回原因" prop="decisionRemarks">
        <el-input
          v-model="formData.decisionRemarks"
          type="textarea"
          :rows="4"
          maxlength="500"
          show-word-limit
          placeholder="请输入驳回原因（必填）"
        />
      </el-form-item>
    </el-form>

    <!-- 提示信息 -->
    <el-alert
      title="驳回后，计划状态将回退到原状态，申请人需重新提交审批"
      type="warning"
      show-icon
      :closable="false"
    />

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button
        type="danger"
        :loading="loading"
        @click="handleConfirm"
      >
        驳回
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import ApprovalInfoCard from './ApprovalInfoCard.vue'
import { rejectApproval } from '../api'
import { getErrorMessage } from '../constants'
import dictionaryMixin from '../mixins/dictionary'

export default {
  name: 'ApprovalRejectDialog',
  components: {
    ApprovalInfoCard
  },
  mixins: [dictionaryMixin],
  props: {
    // 生产计划数据 - 用于显示实际的计划编号和状态
    planData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      visible: false,
      loading: false,
      approvalData: null,
      formData: {
        decisionRemarks: ''
      },
      rules: {
        decisionRemarks: [
          { required: true, message: '请输入驳回原因', trigger: 'blur' },
          { min: 5, message: '驳回原因至少5个字符', trigger: 'blur' },
          { max: 500, message: '驳回原因最多500个字符', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    // 当前状态文本 - 用于确认提示
    previousStatusText() {
      const status = this.planData.status ||
                    (this.approvalData && this.approvalData.metadata && this.approvalData.metadata.previousStatus) || ''
      return this.getPlanStatusLabel(status) || '-'
    }
  },
  methods: {
    /**
     * 打开对话框
     */
    open(approvalData) {
      if (!approvalData || !approvalData.id) {
        this.$message.error('缺少审批数据')
        return
      }

      this.approvalData = approvalData
      this.resetForm()
      this.visible = true
    },

    /**
     * 关闭对话框
     */
    handleClose() {
      this.visible = false
      this.resetForm()
    },

    /**
     * 重置表单
     */
    resetForm() {
      this.formData = {
        decisionRemarks: ''
      }
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.clearValidate()
        }
      })
    },

    /**
     * 确认驳回
     */
    async handleConfirm() {
      try {
        // 表单验证
        const valid = await this.$refs.form.validate()
        if (!valid) {
          return
        }

        // 二次确认
        await this.$confirm(
          `确认驳回此审批请求吗？驳回后计划状态将保持为「${this.previousStatusText}」`,
          '驳回确认',
          {
            confirmButtonText: '确认驳回',
            cancelButtonText: '取消',
            type: 'warning',
            closeOnClickModal: false
          }
        )

        this.loading = true

        // 调用驳回接口
        const response = await rejectApproval(this.approvalData.id, {
          decisionRemarks: this.formData.decisionRemarks,
          requiredPermissions: this.approvalData.requiredPermissions || ['prod.production-plan.approval']
        })

        // 显示后端返回的成功消息
        this.$message.success(response.message || '审批驳回成功')
        this.$emit('success', response.data)
        this.handleClose()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('驳回审批失败:', error)
          const errorMessage = getErrorMessage(error)
          this.$message.error(errorMessage)
        }
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep .el-dialog__body {
  padding-top: 16px;
}

::v-deep .el-divider {
  margin: 16px 0;
}

::v-deep .el-alert {
  margin-top: 20px;
}
</style>

