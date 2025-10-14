/**
 * 文件名称：StatusChangeDialog.vue
 * 文件描述：生产计划状态变更对话框组件
 * 创建日期：2025-01-21
 * 修改记录：
 *   - 2025-01-21: 初始创建，实现P0阶段核心功能
 */

<template>
  <el-dialog
    :visible.sync="visible"
    :title="dialogTitle"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="form"
      :model="formData"
      :rules="rules"
      label-width="120px"
    >
      <!-- 当前状态显示 -->
      <el-form-item label="当前状态">
        <el-tag :type="getStatusType(currentStatus)" size="medium">
          {{ getStatusText(currentStatus) }}
        </el-tag>
      </el-form-item>

      <!-- 目标状态选择 -->
      <el-form-item label="目标状态" prop="targetStatus">
        <el-select
          v-model="formData.targetStatus"
          placeholder="请选择目标状态"
          style="width: 100%"
          @change="handleTargetStatusChange"
        >
          <el-option
            v-for="status in availableStatuses"
            :key="status.value"
            :label="status.label"
            :value="status.value"
          >
            <span style="float: left">{{ status.label }}</span>
            <el-tag
              :type="getStatusType(status.value)"
              size="mini"
              style="float: right; margin-left: 10px"
            >
              {{ status.value }}
            </el-tag>
          </el-option>
        </el-select>
        <div v-if="needsApproval" class="approval-tip">
          <i class="el-icon-warning" />
          此状态变更需要提交审批流程
        </div>
      </el-form-item>

      <!-- 取消原因（仅取消状态时显示） -->
      <el-form-item
        v-if="formData.targetStatus === 'CANCELLED'"
        label="取消原因"
        prop="cancelReason"
      >
        <el-input
          v-model="formData.cancelReason"
          type="textarea"
          :rows="3"
          maxlength="200"
          show-word-limit
          placeholder="请输入取消原因"
        />
      </el-form-item>

      <!-- 变更描述 -->
      <el-form-item label="变更描述" prop="changeDescription">
        <el-input
          v-model="formData.changeDescription"
          type="textarea"
          :rows="3"
          maxlength="500"
          show-word-limit
          placeholder="请输入变更描述（选填）"
        />
      </el-form-item>

      <!-- 状态转换提示 -->
      <el-alert
        v-if="formData.targetStatus"
        :title="getTransitionTip()"
        type="info"
        show-icon
        :closable="false"
        style="margin-bottom: 16px"
      />
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button
        type="primary"
        :loading="loading"
        @click="handleConfirm"
      >
        {{ needsApproval ? '提交审批' : '确认变更' }}
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import {
  PLAN_STATUS_MAP,
  PLAN_STATUS_TYPE_MAP,
  STATUS_TRANSITION_RULES,
  CRITICAL_STATUS_CHANGES
} from '../constants'
import { updatePlanStatus } from '../api'
import { withRetry, createApprovalErrorHandler } from '../utils/approval-error-handler'
import { submitPlanOperation } from '../utils/submission-manager'

export default {
  name: 'StatusChangeDialog',
  data() {
    return {
      visible: false,
      loading: false,
      currentStatus: '',
      planId: '',
      planData: null,
      formData: {
        targetStatus: '',
        cancelReason: '',
        changeDescription: ''
      },
      rules: {
        targetStatus: [
          { required: true, message: '请选择目标状态', trigger: 'change' }
        ],
        cancelReason: [
          { required: true, message: '请输入取消原因', trigger: 'blur' },
          { min: 1, max: 200, message: '长度在 1 到 200 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    dialogTitle() {
      return `变更生产计划状态 - ${this.planData?.planNumber || ''}`
    },
    // 可用的目标状态列表
    availableStatuses() {
      const availableStatusCodes = STATUS_TRANSITION_RULES[this.currentStatus] || []
      return availableStatusCodes.map(code => ({
        value: code,
        label: PLAN_STATUS_MAP[code] || code
      }))
    },
    // 是否需要审批
    needsApproval() {
      return CRITICAL_STATUS_CHANGES.includes(this.formData.targetStatus)
    }
  },
  methods: {
    /**
     * 打开对话框
     */
    open(planData) {
      if (!planData || !planData.id) {
        this.$message.error('缺少计划数据')
        return
      }

      this.planData = planData
      this.planId = planData.id
      this.currentStatus = planData.status
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
        targetStatus: '',
        cancelReason: '',
        changeDescription: ''
      }
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.clearValidate()
        }
      })
    },

    /**
     * 目标状态变更处理
     */
    handleTargetStatusChange(value) {
      // 如果不是取消状态，清空取消原因
      if (value !== 'CANCELLED') {
        this.formData.cancelReason = ''
      }
    },

    /**
     * 确认变更
     */
    async handleConfirm() {
      try {
        // 表单验证
        const valid = await this.$refs.form.validate()
        if (!valid) {
          return
        }

        // 状态流转规则验证
        if (!this.validateStatusTransition()) {
          this.$message.error('不合法的状态转换')
          return
        }

        this.loading = true

        // 构建请求数据
        const requestData = {
          targetStatus: this.formData.targetStatus,
          changeDescription: this.formData.changeDescription || `变更状态从${PLAN_STATUS_MAP[this.currentStatus]}到${PLAN_STATUS_MAP[this.formData.targetStatus]}`
        }

        // 如果是取消状态，添加取消原因
        if (this.formData.targetStatus === 'CANCELLED') {
          requestData.cancelReason = this.formData.cancelReason
        }

        // 使用防重复提交机制和带重试机制的API调用
        const response = await submitPlanOperation(
          () => withRetry(
            () => updatePlanStatus(this.planId, requestData),
            {
              maxRetries: 3,
              context: {
                operation: 'updateStatus',
                planId: this.planId,
                targetStatus: this.formData.targetStatus
              },
              onApprovalDetailsView: (approvalId) => {
                // 查看审批详情的逻辑
                this.$emit('view-approval', approvalId)
              },
              onCancelApproval: (approvalId) => {
                // 撤销审批的逻辑
                this.$emit('cancel-approval', approvalId)
              },
              onRefreshData: () => {
                // 刷新数据的逻辑
                this.$emit('refresh-data')
              },
              onRetry: (attempt, error) => {
                console.log(`状态更新重试第${attempt}次:`, error.response?.data?.error?.code)
              }
            }
          ),
          this.planId,
          `updateStatus_${this.formData.targetStatus}`
        )

        if (response.success) {
          this.$message.success(response.message || '状态变更成功')
          this.$emit('success', response.data)
          this.handleClose()
        } else {
          this.$message.error(response.message || '状态变更失败')
        }
      } catch (error) {
        console.error('状态变更失败:', error)
        // 如果错误没有被处理，使用默认处理
        if (!error.handled) {
          const errorHandler = createApprovalErrorHandler({
            onApprovalDetailsView: (approvalId) => {
              this.$emit('view-approval', approvalId)
            },
            onRefreshData: () => {
              this.$emit('refresh-data')
            }
          })
          await errorHandler.handleError(error, {
            operation: 'updateStatus',
            planId: this.planId
          })
        }
      } finally {
        this.loading = false
      }
    },

    /**
     * 验证状态流转规则
     */
    validateStatusTransition() {
      const allowedStatuses = STATUS_TRANSITION_RULES[this.currentStatus] || []
      return allowedStatuses.includes(this.formData.targetStatus)
    },

    /**
     * 获取状态文本
     */
    getStatusText(status) {
      return PLAN_STATUS_MAP[status] || status
    },

    /**
     * 获取状态类型
     */
    getStatusType(status) {
      return PLAN_STATUS_TYPE_MAP[status] || 'info'
    },

    /**
     * 获取状态转换提示
     */
    getTransitionTip() {
      const currentText = this.getStatusText(this.currentStatus)
      const targetText = this.getStatusText(this.formData.targetStatus)

      if (this.needsApproval) {
        return `状态将从"${currentText}"变更为"${targetText}"，此操作需要提交审批流程，审批通过后状态将自动变更`
      } else {
        return `状态将从"${currentText}"变更为"${targetText}"，操作将立即生效`
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.approval-tip {
  margin-top: 8px;
  font-size: 12px;
  color: #e6a23c;

  i {
    margin-right: 4px;
  }
}

::v-deep .el-dialog__body {
  padding-top: 16px;
}

::v-deep .el-select-dropdown__item {
  height: auto;
  line-height: normal;
  padding: 8px 20px;
}
</style>

