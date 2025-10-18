/**
 * 文件名称：ApprovalSubmitDialog.vue
 * 文件描述：生产计划审批提交对话框组件
 * 创建日期：2025-01-21
 * 修改记录：
 *   - 2025-01-21: 初始创建，实现P0阶段核心功能
 *   - 2025-10-17: 根据新接口文档重构，完全符合后端API规范
 *   - 2025-10-18: 根据最新接口文档优化
 *     * 添加 APPROVAL_PENDING_EXISTS (409) 错误处理
 *     * 增强防重复提交机制（2秒冷却）
 *     * 完善错误码处理（BIZ_030/031/032）
 *     * 移除硬编码的 targetStatusOptions，改为从字典系统动态获取
 *     * 修复：根据当前状态动态筛选可选的目标状态（防止状态回退）
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
  PLAN_STATUS_TYPE_MAP
} from '../constants'
import { submitApproval } from '../api'
import { withRetry, createApprovalErrorHandler } from '../utils/approval-error-handler'
import dictionaryMixin from '../mixins/dictionary'

export default {
  name: 'ApprovalSubmitDialog',
  mixins: [dictionaryMixin],
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
      // 防重复提交机制（根据《审批重复提交修复对接文档》）
      lastSubmitTime: 0,
      submitCooldown: 2000, // 2秒冷却时间
      rules: {
        targetStatus: [
          { required: true, message: '请选择目标状态', trigger: 'change' }
        ],
        requiredPermissions: [
          { type: 'array', required: true, message: '请选择至少一个审批权限', trigger: 'change' }
        ]
      },
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
    },
    /**
     * 目标状态选项（仅限需要审批的状态）
     * 📢 从字典系统动态获取，根据当前状态动态筛选
     *
     * 业务规则（根据《生产计划业务流程说明.md》）：
     * - RECEIVED、CONFIRMED、PARTIALLY_RELEASED：可以提交 RELEASED 或 CANCELLED 审批
     * - RELEASED、IN_PROGRESS：只能提交 CANCELLED 审批（已经超过 RELEASED，不能回退）
     * - COMPLETED、CANCELLED：终态，不能提交审批
     */
    targetStatusOptions() {
      const currentStatus = this.planData.status

      // 定义各状态可以提交的审批目标
      let allowedStatuses = []

      if (['RECEIVED', 'CONFIRMED', 'PARTIALLY_RELEASED'].includes(currentStatus)) {
        // 可以提交发布或取消审批
        allowedStatuses = ['RELEASED', 'CANCELLED']
      } else if (['RELEASED', 'IN_PROGRESS'].includes(currentStatus)) {
        // 只能提交取消审批（已经超过 RELEASED，不能回退）
        allowedStatuses = ['CANCELLED']
      }

      // 从字典系统获取所有计划状态选项
      const allStatusOptions = this.planStatusOptions || []

      // 筛选出允许的状态
      return allStatusOptions.filter(option => allowedStatuses.includes(option.value))
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
     *
     * 根据接口文档重构：
     * - 请求参数：targetStatus（必填）、remarks（选填，最多500字符）、requiredPermissions（选填数组）
     * - 响应结构：{ plan, approval, targetStatus, status, message }
     *
     * 根据《审批重复提交修复对接文档》添加防重复提交机制：
     * - 防止快速重复点击（2秒冷却时间）
     * - 增强错误处理（BIZ_030、BIZ_031、BIZ_032）
     */
    async handleConfirm() {
      try {
        // 表单验证
        const valid = await this.$refs.form.validate()
        if (!valid) {
          return
        }

        // 防止请求正在处理中时重复提交
        if (this.loading) {
          this.$message.warning('请求正在处理中，请勿重复提交')
          return
        }

        // 防止短时间内重复提交（2秒冷却时间）
        const now = Date.now()
        const timeSinceLastSubmit = now - this.lastSubmitTime
        if (timeSinceLastSubmit < this.submitCooldown) {
          const waitSeconds = Math.ceil((this.submitCooldown - timeSinceLastSubmit) / 1000)
          this.$message.warning(`请等待 ${waitSeconds} 秒后再试`)
          return
        }

        this.loading = true
        this.lastSubmitTime = now

        // 构建请求数据，完全符合接口文档
        const requestData = {
          targetStatus: this.formData.targetStatus,
          // remarks 是选填的，如果用户没有填写，提供默认说明
          remarks: this.formData.remarks || `申请将生产计划状态变更为${this.getPlanStatusLabel(this.formData.targetStatus)}`,
          // requiredPermissions 是选填的数组
          requiredPermissions: this.formData.requiredPermissions
        }

        // 使用带重试机制的审批提交
        const response = await withRetry(
          () => submitApproval(this.planData.id, requestData),
          {
            maxRetries: 3,
            context: {
              operation: 'submitApproval',
              planId: this.planData.id,
              targetStatus: this.formData.targetStatus
            },
            onApprovalDetailsView: (approvalId) => {
              this.$emit('view-approval', approvalId)
            },
            onCancelApproval: (approvalId) => {
              this.$emit('cancel-approval', approvalId)
            },
            onRefreshData: () => {
              this.$emit('refresh-data')
            },
            onRetry: (attempt, error) => {
              console.log(`审批提交重试第${attempt}次:`, error.response?.data?.error?.code)
            }
          }
        )

        if (response.success) {
          // ⚠️ 必须使用后端返回的message显示提示，不得硬编码
          // 成功时 message 在顶层：response.message
          const message = response.message || '审批提交成功'

          // 处理响应数据，符合接口文档的响应结构
          this.handleApprovalSubmitResponse(response.data, message)
        } else {
          // ⚠️ 优先使用后端返回的错误消息
          // 失败时 message 在 error 对象中：response.error.message
          this.$message.error(response.error?.message || '审批提交失败')
        }
      } catch (error) {
        console.error('审批提交失败:', error)

        // 根据最新接口文档（2025-10-18更新）处理特定错误码
        const errorCode = error.response?.data?.error?.code
        const errorMessage = error.response?.data?.error?.message
        const errorDetails = error.response?.data?.error?.details

        // 处理新增的错误码 APPROVAL_PENDING_EXISTS (409) - 2025-10-18新增
        if (errorCode === 'APPROVAL_PENDING_EXISTS') {
          // 该计划存在待处理的审批请求
          this.$alert(
            `${errorMessage || '该计划存在待处理的审批请求，请等待当前审批完成后再提交'}`,
            '审批正在处理中',
            {
              confirmButtonText: '我知道了',
              type: 'warning',
              callback: () => {
                this.$emit('refresh-data')
                this.handleClose()
              }
            }
          )
          return
        }

        // 处理特定的业务错误码
        if (errorCode === 'BIZ_030') {
          // 存在待处理的审批请求
          this.$confirm(
            `${errorMessage || '该计划有审批请求正在处理中'}`,
            '审批正在处理中',
            {
              confirmButtonText: '查看审批详情',
              cancelButtonText: '关闭',
              type: 'warning',
              distinguishCancelAndClose: true
            }
          ).then(() => {
            // 查看审批详情
            if (errorDetails?.approvalId) {
              this.$emit('view-approval', errorDetails.approvalId)
            }
            this.handleClose()
          }).catch(() => {
            this.handleClose()
          })
          return
        } else if (errorCode === 'BIZ_031') {
          // 并发操作冲突（现在应该很少见）
          this.$confirm(
            `${errorMessage || '检测到并发操作，请重试'}`,
            '并发冲突',
            {
              confirmButtonText: '立即重试',
              cancelButtonText: '取消',
              type: 'warning'
            }
          ).then(() => {
            // 重新调用提交
            setTimeout(() => {
              this.handleConfirm()
            }, 300)
          }).catch(() => {
            // 用户取消，关闭对话框
          })
          return
        } else if (errorCode === 'BIZ_032') {
          // 操作已被批准，无需重复提交
          this.$alert(
            `${errorMessage || '该操作已被批准，无需重复提交'}`,
            '提示',
            {
              confirmButtonText: '刷新页面',
              type: 'info'
            }
          ).then(() => {
            this.$emit('refresh-data')
            this.handleClose()
          })
          return
        }

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
     * 处理审批提交成功的响应
     *
     * 响应结构（符合接口文档）：
     * {
     *   plan: { ... },          // 更新后的计划信息（状态为 PENDING_APPROVAL）
     *   approval: { ... },      // 审批请求信息（状态为 PENDING）
     *   targetStatus: string,   // 目标状态
     *   status: string,         // 计划当前状态（PENDING_APPROVAL）
     *   message: string         // 操作成功提示信息
     * }
     */
    handleApprovalSubmitResponse(data, message) {
      const { approval, targetStatus, status } = data

      // 显示成功消息
      this.$message.success(message)

      // 显示详细的审批信息
      const approvalInfo = `
        <div style="text-align: left; padding: 10px;">
          <p><strong>审批请求ID：</strong>${approval.id}</p>
          <p><strong>目标状态：</strong>${this.getPlanStatusLabel(targetStatus)}</p>
          <p><strong>当前状态：</strong>${this.getPlanStatusLabel(status)}</p>
          <p><strong>审批状态：</strong>${approval.status === 'PENDING' ? '待审批' : approval.status}</p>
          <p><strong>申请人：</strong>${approval.requesterName || '-'}</p>
          <p><strong>提交时间：</strong>${this.formatTime(approval.requestedAt)}</p>
          ${approval.remarks ? `<p><strong>审批说明：</strong>${approval.remarks}</p>` : ''}
          <p style="color: #E6A23C; margin-top: 10px;">
            <i class="el-icon-warning"></i> ${data.message || '请等待审批人审核'}
          </p>
        </div>
      `

      this.$notify({
        title: '生产计划审批已提交',
        dangerouslyUseHTMLString: true,
        message: approvalInfo,
        type: 'warning',
        duration: 10000,
        position: 'top-right'
      })

      // 触发成功事件，传递完整的响应数据
      this.$emit('success', data)
      this.handleClose()
    },

    /**
     * 格式化时间
     */
    formatTime(time) {
      if (!time) return '-'
      const date = new Date(time)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    /**
     * 获取状态文本
     */
    getStatusText(status) {
      return this.getPlanStatusLabel(status)
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

