/**
 * 文件名称：ApprovalSubmitDialog.vue
 * 文件描述：生产计划审批提交对话框组件
 * 创建日期：2025-01-21
 * 修改记录：
 *   - 2025-01-21: 初始创建，实现P0阶段核心功能
 */

<template>
  <el-dialog
    :visible.sync="visible"
    :title="dialogTitle"
    width="700px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <!-- 计划基本信息 -->
    <el-descriptions
      :column="2"
      border
      class="plan-info"
    >
      <el-descriptions-item label="计划编号">
        {{ planData.planNumber }}
      </el-descriptions-item>
      <el-descriptions-item label="产品编码">
        {{ planData.productCode }}
      </el-descriptions-item>
      <el-descriptions-item label="需求数量">
        {{ planData.demandQuantity }} {{ planData.demandUnit }}
      </el-descriptions-item>
      <el-descriptions-item label="当前状态">
        <el-tag :type="getStatusType(planData.status)" size="small">
          {{ getStatusText(planData.status) }}
        </el-tag>
      </el-descriptions-item>
    </el-descriptions>

    <el-divider />

    <!-- 审批表单 -->
    <el-form
      ref="form"
      :model="formData"
      :rules="rules"
      label-width="120px"
    >
      <!-- 目标状态 -->
      <el-form-item label="目标状态" prop="targetStatus">
        <el-select
          v-model="formData.targetStatus"
          placeholder="请选择目标状态"
          style="width: 100%"
        >
          <el-option
            v-for="option in targetStatusOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          >
            <span style="float: left">{{ option.label }}</span>
            <el-tag
              :type="getStatusType(option.value)"
              size="mini"
              style="float: right"
            >
              {{ option.value }}
            </el-tag>
          </el-option>
        </el-select>
      </el-form-item>

      <!-- 审批说明 -->
      <el-form-item label="审批说明" prop="remarks">
        <el-input
          v-model="formData.remarks"
          type="textarea"
          :rows="4"
          maxlength="500"
          show-word-limit
          placeholder="请输入审批说明，说明申请审批的原因（选填）"
        />
      </el-form-item>

      <!-- 要求的审批权限 -->
      <el-form-item label="要求的权限" prop="requiredPermissions">
        <el-select
          v-model="formData.requiredPermissions"
          multiple
          placeholder="请选择要求的审批权限"
          style="width: 100%"
        >
          <el-option
            v-for="permission in permissionOptions"
            :key="permission.value"
            :label="permission.label"
            :value="permission.value"
          />
        </el-select>
        <div class="permission-tip">
          <i class="el-icon-info" />
          默认权限为 prod.production-plan.approval，可根据需要选择其他相关权限
        </div>
      </el-form-item>
    </el-form>

    <!-- 提示信息 -->
    <el-alert
      title="提交审批后，计划状态将变为「待审批」，需要具有相应权限的用户审批通过后才能变更为目标状态"
      type="info"
      show-icon
      :closable="false"
    />

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button
        type="primary"
        :loading="loading"
        @click="handleConfirm"
      >
        提交审批
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import {
  PLAN_STATUS_MAP,
  PLAN_STATUS_TYPE_MAP
} from '../constants'
import { submitApproval } from '../api'
import { withRetry, createApprovalErrorHandler } from '../utils/approval-error-handler'

export default {
  name: 'ApprovalSubmitDialog',
  data() {
    return {
      visible: false,
      loading: false,
      planData: {},
      formData: {
        targetStatus: 'RELEASED',
        remarks: '',
        requiredPermissions: ['prod.production-plan.approval']
      },
      rules: {
        targetStatus: [
          { required: true, message: '请选择目标状态', trigger: 'change' }
        ],
        requiredPermissions: [
          { type: 'array', required: true, message: '请选择至少一个审批权限', trigger: 'change' }
        ]
      },
      // 目标状态选项（仅限需要审批的状态）
      targetStatusOptions: [
        { value: 'RELEASED', label: '已下达' },
        { value: 'CANCELLED', label: '已取消' }
      ],
      // 权限选项
      permissionOptions: [
        { value: 'prod.production-plan.approval', label: '生产计划审批权限' },
        { value: 'prod.production-plan.manage', label: '生产计划管理权限' },
        { value: 'prod.production-plan.cancel', label: '生产计划取消权限' }
      ]
    }
  },
  computed: {
    dialogTitle() {
      return `提交生产计划审批 - ${this.planData.planNumber || ''}`
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
        targetStatus: 'RELEASED',
        remarks: '',
        requiredPermissions: ['prod.production-plan.approval']
      }
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.clearValidate()
        }
      })
    },

    /**
     * 确认提交
     */
    async handleConfirm() {
      try {
        // 表单验证
        const valid = await this.$refs.form.validate()
        if (!valid) {
          return
        }

        this.loading = true

        // 使用带重试机制的审批提交
        const response = await withRetry(
          () => submitApproval(this.planData.id, {
            targetStatus: this.formData.targetStatus,
            remarks: this.formData.remarks || `申请将生产计划状态变更为${PLAN_STATUS_MAP[this.formData.targetStatus]}`,
            requiredPermissions: this.formData.requiredPermissions
          }),
          {
            maxRetries: 3,
            context: {
              operation: 'submitApproval',
              planId: this.planData.id,
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
              console.log(`审批提交重试第${attempt}次:`, error.response?.data?.error?.code)
            }
          }
        )

        if (response.success) {
          this.$message.success(response.message || '审批提交成功')
          this.$emit('success', response.data)
          this.handleClose()
        } else {
          this.$message.error(response.message || '审批提交失败')
        }
      } catch (error) {
        console.error('审批提交失败:', error)
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
            operation: 'submitApproval',
            planId: this.planData.id
          })
        }
      } finally {
        this.loading = false
      }
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
    }
  }
}
</script>

<style lang="scss" scoped>
.plan-info {
  margin-bottom: 20px;
}

.permission-tip {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;

  i {
    margin-right: 4px;
  }
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

