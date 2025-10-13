<!--
  文件名称：ApprovalApproveDialog.vue
  文件描述：审批批准对话框组件
  创建日期：2025-01-21
  修改记录：
    - 2025-01-21: 初始创建
-->
<template>
  <el-dialog
    :visible.sync="visible"
    title="批准审批"
    width="650px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <!-- 审批请求信息 -->
    <el-descriptions
      v-if="approvalData"
      :column="2"
      border
      class="approval-info"
    >
      <el-descriptions-item label="计划编号">
        {{ planNumber }}
      </el-descriptions-item>
      <el-descriptions-item label="申请人">
        {{ approvalData.requesterName || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="当前状态">
        <el-tag :type="previousStatusType" size="small">
          {{ previousStatusText }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="目标状态">
        <el-tag :type="targetStatusType" size="small">
          {{ targetStatusText }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="申请原因" :span="2">
        {{ approvalData.remarks || '-' }}
      </el-descriptions-item>
    </el-descriptions>

    <el-divider />

    <!-- 审批表单 -->
    <el-form
      ref="form"
      :model="formData"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="审批意见" prop="decisionRemarks">
        <el-input
          v-model="formData.decisionRemarks"
          type="textarea"
          :rows="4"
          maxlength="500"
          show-word-limit
          placeholder="请输入审批意见（选填）"
        />
      </el-form-item>
    </el-form>

    <!-- 提示信息 -->
    <el-alert
      title="批准后，计划状态将自动更新为目标状态"
      type="success"
      show-icon
      :closable="false"
    />

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button
        type="success"
        :loading="loading"
        @click="handleConfirm"
      >
        批准
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { approveApproval } from '../api'
import {
  PLAN_STATUS_MAP,
  PLAN_STATUS_TYPE_MAP,
  getErrorMessage
} from '../constants'

export default {
  name: 'ApprovalApproveDialog',
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
          { max: 500, message: '审批意见最多500个字符', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    planNumber() {
      return (this.approvalData && this.approvalData.metadata && this.approvalData.metadata.planNumber) || '-'
    },
    previousStatusText() {
      const status = (this.approvalData && this.approvalData.metadata && this.approvalData.metadata.previousStatus) || ''
      return this.getStatusText(status)
    },
    previousStatusType() {
      const status = (this.approvalData && this.approvalData.metadata && this.approvalData.metadata.previousStatus) || ''
      return this.getStatusType(status)
    },
    targetStatusText() {
      const status = (this.approvalData && this.approvalData.metadata && this.approvalData.metadata.targetStatus) || ''
      return this.getStatusText(status)
    },
    targetStatusType() {
      const status = (this.approvalData && this.approvalData.metadata && this.approvalData.metadata.targetStatus) || ''
      return this.getStatusType(status)
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
     * 确认批准
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
          `确认批准此审批请求吗？批准后计划状态将变更为「${this.targetStatusText}」`,
          '批准确认',
          {
            confirmButtonText: '确认批准',
            cancelButtonText: '取消',
            type: 'success',
            closeOnClickModal: false
          }
        )

        this.loading = true

        // 调用批准接口
        const response = await approveApproval(this.approvalData.id, {
          decisionRemarks: this.formData.decisionRemarks || '审批通过',
          requiredPermissions: this.approvalData.requiredPermissions || ['prod.production-plan.approval']
        })

        // 显示后端返回的成功消息
        this.$message.success(response.message || '审批批准成功')
        this.$emit('success', response.data)
        this.handleClose()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('批准审批失败:', error)
          const errorMessage = getErrorMessage(error)
          this.$message.error(errorMessage)
        }
      } finally {
        this.loading = false
      }
    },

    /**
     * 获取状态文本
     */
    getStatusText(status) {
      return PLAN_STATUS_MAP[status] || status || '-'
    },

    /**
     * 获取状态类型
     */
    getStatusType(status) {
      return PLAN_STATUS_TYPE_MAP[status] || 'info'
    }
  }
}
</script>

<style lang="scss" scoped>
.approval-info {
  margin-bottom: 20px;
}

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

