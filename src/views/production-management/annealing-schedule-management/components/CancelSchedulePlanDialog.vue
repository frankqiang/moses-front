<!--
  文件名称：CancelSchedulePlanDialog.vue
  文件描述：取消排程方案对话框组件
  创建日期：2025-10-23
  修改记录：
    - 2025-10-23: 初始创建
-->

<template>
  <el-dialog
    :visible="visible"
    title="取消排程方案"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <!-- 警告提示 -->
    <el-alert
      title="警告"
      type="warning"
      description="取消后方案将无法恢复，请谨慎操作！"
      show-icon
      :closable="false"
      style="margin-bottom: 20px;"
    />

    <!-- 方案基本信息 -->
    <div class="plan-info">
      <div class="info-row">
        <span class="label">方案编号：</span>
        <span class="value">{{ planData.planCode }}</span>
      </div>
      <div class="info-row">
        <span class="label">方案名称：</span>
        <span class="value">{{ planData.planName || '-' }}</span>
      </div>
      <div class="info-row">
        <span class="label">方案状态：</span>
        <span class="value">
          <el-tag :type="getStatusTagType(planData.status)" size="small">
            {{ formatStatus(planData.status) }}
          </el-tag>
        </span>
      </div>
      <div class="info-row">
        <span class="label">关联任务数：</span>
        <span class="value">{{ planData.taskCount || 0 }} 个</span>
      </div>
    </div>

    <!-- 取消原因表单 -->
    <el-form
      ref="cancelForm"
      :model="cancelForm"
      :rules="cancelRules"
      label-width="100px"
      style="margin-top: 20px;"
    >
      <el-form-item label="取消原因" prop="reason">
        <el-input
          v-model="cancelForm.reason"
          type="textarea"
          :rows="4"
          placeholder="请输入取消原因（必填，用于记录追溯）"
          maxlength="500"
          show-word-limit
        />
        <div class="reason-hint">
          <span class="hint-title">常见取消原因示例：</span>
          <ul class="hint-list">
            <li @click="fillReason('设备故障，需要重新排程')">设备故障，需要重新排程</li>
            <li @click="fillReason('生产计划调整，本批次任务优先级降低')">生产计划调整，本批次任务优先级降低</li>
            <li @click="fillReason('排程数据有误，需要重新配置约束规则后再次排程')">排程数据有误，需要重新配置约束规则</li>
          </ul>
        </div>
      </el-form-item>
    </el-form>

    <!-- 底部按钮 -->
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button
        type="danger"
        :loading="cancelling"
        @click="handleCancel"
      >
        确认取消
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { cancelSchedulePlan } from '../api'
import { PLAN_STATUS_MAP } from '../constants'

export default {
  name: 'CancelSchedulePlanDialog',
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    planData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      cancelling: false,
      cancelForm: {
        reason: ''
      },
      cancelRules: {
        reason: [
          { required: true, message: '请输入取消原因', trigger: 'blur' },
          { min: 1, max: 500, message: '长度在 1 到 500 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  watch: {
    visible: {
      handler(val) {
        if (val) {
          this.initDialog()
        }
      },
      immediate: true
    }
  },
  methods: {
    /**
     * 初始化对话框
     */
    initDialog() {
      if (!this.visible) {
        return
      }

      // 重置表单
      this.cancelForm = {
        reason: ''
      }
      if (this.$refs.cancelForm) {
        this.$refs.cancelForm.clearValidate()
      }
    },

    /**
     * 快速填充取消原因
     */
    fillReason(reason) {
      this.cancelForm.reason = reason
    },

    /**
     * 执行取消
     */
    async handleCancel() {
      // 表单验证
      try {
        await this.$refs.cancelForm.validate()
      } catch {
        return
      }

      // 二次确认
      try {
        await this.$confirm(
          `确认取消排程方案 ${this.planData.planCode} 吗？取消后将释放 ${this.planData.taskCount || 0} 个关联任务。`,
          '最终确认',
          {
            confirmButtonText: '确认取消',
            cancelButtonText: '返回',
            type: 'warning'
          }
        )
      } catch {
        return
      }

      this.cancelling = true
      try {
        const response = await cancelSchedulePlan(this.planData.id, {
          reason: this.cancelForm.reason.trim()
        })

        if (response.success && response.data) {
          // 显示成功消息
          const cancelledAt = response.data.cancelledAt ? this.formatDateTime(response.data.cancelledAt) : ''
          const successMessage = `${response.message || '取消排程方案成功'}${cancelledAt ? '，取消时间：' + cancelledAt : ''}`

          this.$message.success(successMessage)
          this.$emit('success', response.data)
          this.handleClose()
        } else {
          // 根据错误码显示不同的错误消息
          const errorMessage = this.getErrorCodeMessage(response.error?.code) || response.message || '取消排程方案失败'
          this.$message.error(errorMessage)
        }
      } catch (error) {
        console.error('取消排程方案失败:', error)
        const errorMessage = this.getErrorMessage(error)
        this.$message.error(errorMessage)
      } finally {
        this.cancelling = false
      }
    },

    /**
     * 关闭对话框
     */
    handleClose() {
      this.$emit('update:visible', false)
      this.$emit('close')
    },

    /**
     * 格式化状态
     */
    formatStatus(status) {
      return PLAN_STATUS_MAP[status]?.text || status
    },

    /**
     * 获取状态标签类型
     */
    getStatusTagType(status) {
      const typeMap = {
        'draft': 'info',
        'computing': 'primary',
        'generated': 'warning',
        'published': 'success',
        'cancelled': 'danger'
      }
      return typeMap[status] || 'info'
    },

    /**
     * 格式化日期时间
     */
    formatDateTime(dateTime) {
      if (!dateTime) return '-'
      const date = new Date(dateTime)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    },

    /**
     * 获取错误消息
     */
    getErrorMessage(error) {
      if (error.response) {
        const { status, data } = error.response
        if (status === 401) {
          return '请先登录'
        } else if (status === 403) {
          return '权限不足，请联系管理员'
        } else if (data && data.error) {
          return this.getErrorCodeMessage(data.error.code) || data.error.message || '操作失败'
        }
      }
      return error.message || '操作失败'
    },

    /**
     * 根据错误码获取错误消息
     */
    getErrorCodeMessage(code) {
      const errorMap = {
        'PARAM_ERROR': '参数错误，请检查输入',
        'INVALID_STATUS': '排程方案状态无效',
        'RESOURCE_NOT_FOUND': '排程方案不存在',
        'SPM_009': '取消排程方案失败，请稍后重试'
      }
      return errorMap[code] || ''
    }
  }
}
</script>

<style lang="scss" scoped>
.plan-info {
  background-color: #f5f7fa;
  padding: 16px;
  border-radius: 4px;

  .info-row {
    display: flex;
    margin-bottom: 12px;
    line-height: 1.6;

    &:last-child {
      margin-bottom: 0;
    }

    .label {
      width: 100px;
      color: #606266;
      font-weight: 500;
    }

    .value {
      flex: 1;
      color: #303133;
    }
  }
}

.reason-hint {
  margin-top: 8px;
  padding: 8px 12px;
  background-color: #f5f7fa;
  border-radius: 4px;

  .hint-title {
    font-size: 12px;
    color: #909399;
    display: block;
    margin-bottom: 4px;
  }

  .hint-list {
    list-style: none;
    padding: 0;
    margin: 0;

    li {
      font-size: 12px;
      color: #409eff;
      cursor: pointer;
      padding: 4px 0;
      transition: color 0.2s;

      &:hover {
        color: #66b1ff;
        text-decoration: underline;
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>

