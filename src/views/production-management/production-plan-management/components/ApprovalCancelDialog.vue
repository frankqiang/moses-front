<!--
  文件名称：ApprovalCancelDialog.vue
  文件描述：取消审批对话框组件
  创建日期：2025-01-21
  修改记录：
    - 2025-01-21: 初始创建
-->
<template>
  <el-dialog
    :visible.sync="visible"
    title="取消审批"
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

    <!-- 取消表单 -->
    <el-form
      ref="form"
      :model="formData"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="取消原因" prop="cancelRemarks">
        <el-input
          v-model="formData.cancelRemarks"
          type="textarea"
          :rows="4"
          maxlength="500"
          show-word-limit
          placeholder="请输入取消原因（选填）"
        />
      </el-form-item>
    </el-form>

    <!-- 提示信息 -->
    <el-alert
      title="取消后，审批请求将被撤销，计划状态保持不变"
      type="info"
      show-icon
      :closable="false"
    />

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">返回</el-button>
      <el-button
        type="warning"
        :loading="loading"
        @click="handleConfirm"
      >
        确认取消
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { cancelApproval } from '../api'
import {
  PLAN_STATUS_TYPE_MAP,
  getErrorMessage
} from '../constants'
import dictionaryMixin from '../mixins/dictionary'

export default {
  name: 'ApprovalCancelDialog',
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
        cancelRemarks: ''
      },
      rules: {
        cancelRemarks: [
          { max: 500, message: '取消原因最多500个字符', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    planNumber() {
      // 优先使用实际计划数据中的计划编号
      return this.planData.planNumber ||
             (this.approvalData && this.approvalData.metadata && this.approvalData.metadata.planNumber) || '-'
    },
    previousStatusText() {
      // 优先使用实际计划数据中的状态作为当前状态
      const status = this.planData.status ||
                    (this.approvalData && this.approvalData.metadata && this.approvalData.metadata.previousStatus) || ''
      return this.getStatusText(status)
    },
    previousStatusType() {
      // 优先使用实际计划数据中的状态作为当前状态
      const status = this.planData.status ||
                    (this.approvalData && this.approvalData.metadata && this.approvalData.metadata.previousStatus) || ''
      return this.getStatusType(status)
    },
    targetStatusText() {
      // 目标状态优先从审批数据的requestedAction获取，其次从metadata获取
      const status = (this.approvalData && this.approvalData.requestedAction) ||
                    (this.approvalData && this.approvalData.metadata && this.approvalData.metadata.targetStatus) || ''
      return this.getStatusText(status)
    },
    targetStatusType() {
      // 目标状态优先从审批数据的requestedAction获取，其次从metadata获取
      const status = (this.approvalData && this.approvalData.requestedAction) ||
                    (this.approvalData && this.approvalData.metadata && this.approvalData.metadata.targetStatus) || ''
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
        cancelRemarks: ''
      }
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.clearValidate()
        }
      })
    },

    /**
     * 确认取消
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
          '确认取消此审批请求吗？取消后需要重新提交审批',
          '取消确认',
          {
            confirmButtonText: '确认取消',
            cancelButtonText: '返回',
            type: 'warning',
            closeOnClickModal: false
          }
        )

        this.loading = true

        // 调用取消接口
        const response = await cancelApproval(this.approvalData.id, {
          cancelRemarks: this.formData.cancelRemarks || '取消审批申请'
        })

        // 显示后端返回的成功消息
        this.$message.success(response.message || '取消审批成功')
        this.$emit('success', response.data)
        this.handleClose()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('取消审批失败:', error)
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
      return this.getPlanStatusLabel(status) || '-'
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

