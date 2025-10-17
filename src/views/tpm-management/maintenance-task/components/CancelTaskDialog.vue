<!--
  文件名称：CancelTaskDialog.vue
  文件描述：任务取消对话框组件
  创建日期：2024-01-20
  修改记录：
    - 2024-01-20: 初始创建，实现任务取消功能
    - 2024-01-20: 重构以对齐最新接口文档，优化错误处理和状态支持
    - 2024-01-20: 重构取消原因字段，分离为cancelReason(100字符)和cancelRemarks(500字符)
    - 2024-01-20: 补充USER_001和INTERNAL_ERROR错误码处理，完善边缘场景
-->
<template>
  <el-dialog
    :visible.sync="dialogVisible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    title="取消任务"
    width="600px"
    @close="handleClose"
  >
    <!-- 任务信息展示 -->
    <div v-if="taskInfo" class="task-info-section">
      <h4 class="section-title">
        <i class="el-icon-warning" />
        当前任务信息
      </h4>
      <el-descriptions :column="1" border size="small">
        <el-descriptions-item label="任务编码">
          <span class="code-text">{{ taskInfo.taskCode }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="任务标题">
          {{ taskInfo.taskTitle }}
        </el-descriptions-item>
        <el-descriptions-item label="设备">
          {{ taskInfo.equipment ? taskInfo.equipment.name : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="任务状态">
          <el-tag :type="getStatusTagType(taskInfo.status)" size="small">
            {{ taskInfo.status }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="计划开始时间">
          {{ formatDateTime(taskInfo.plannedStartTime) }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 警告提示 -->
      <el-alert
        :title="getWarningMessage()"
        type="warning"
        :closable="false"
        show-icon
        class="cancel-warning"
      />
    </div>

    <!-- 取消表单 -->
    <el-form
      ref="cancelForm"
      :model="formData"
      :rules="formRules"
      label-width="120px"
      class="cancel-form"
    >
      <el-form-item label="取消原因" prop="cancelReason" required>
        <el-input
          v-model="formData.cancelReason"
          type="textarea"
          :rows="3"
          placeholder="请简要说明取消原因（必填，最多100字符）"
          maxlength="100"
          show-word-limit
        />
        <div class="form-item-tip">
          <i class="el-icon-warning" />
          取消原因为必填项，应简洁明了，如"设备故障"、"计划变更"等
        </div>
      </el-form-item>

      <el-form-item label="详细说明" prop="cancelRemarks">
        <el-input
          v-model="formData.cancelRemarks"
          type="textarea"
          :rows="4"
          placeholder="请详细说明取消的具体情况（可选，最多500字符）"
          maxlength="500"
          show-word-limit
        />
        <div class="form-item-tip">
          <i class="el-icon-info" />
          可选项：可提供更详细的背景信息，如具体故障描述、后续安排等
        </div>
      </el-form-item>
    </el-form>

    <!-- 对话框底部按钮 -->
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">我再想想</el-button>
      <el-button
        type="danger"
        :loading="submitting"
        @click="handleConfirm"
      >
        确认取消任务
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { cancelTask } from '../api/maintenance-task'
import { STATUS_TAG_TYPE_MAP } from '../constants/maintenance-task'
import { parseTime } from '@/utils'

export default {
  name: 'CancelTaskDialog',

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    taskInfo: {
      type: Object,
      default: null
    }
  },

  data() {
    return {
      dialogVisible: false,
      submitting: false,
      formData: {
        cancelReason: '',
        cancelRemarks: ''
      },
      formRules: {
        cancelReason: [
          { required: true, message: '请输入取消原因', trigger: 'blur' },
          { min: 2, message: '取消原因至少需要2个字符', trigger: 'blur' },
          { max: 100, message: '取消原因不能超过100个字符', trigger: 'blur' }
        ],
        cancelRemarks: [
          { max: 500, message: '详细说明不能超过500个字符', trigger: 'blur' }
        ]
      }
    }
  },

  watch: {
    visible(val) {
      this.dialogVisible = val
      if (val) {
        this.initDialog()
      }
    }
  },

  methods: {
    /**
     * 初始化对话框
     */
    initDialog() {
      this.resetForm()
    },

    /**
     * 重置表单
     */
    resetForm() {
      this.formData = {
        cancelReason: '',
        cancelRemarks: ''
      }
      if (this.$refs.cancelForm) {
        this.$refs.cancelForm.clearValidate()
      }
    },

    /**
     * 格式化日期时间
     */
    formatDateTime(dateTime) {
      if (!dateTime) return '-'
      return parseTime(dateTime, '{y}-{m}-{d} {h}:{i}')
    },

    /**
     * 获取任务状态标签类型
     */
    getStatusTagType(status) {
      return STATUS_TAG_TYPE_MAP[status] || 'info'
    },

    /**
     * 获取警告消息
     */
    getWarningMessage() {
      if (!this.taskInfo) return '取消任务后将无法恢复，请谨慎操作'

      const status = this.taskInfo.status
      let message = '取消任务后将无法恢复，请谨慎操作'

      if (status === '执行中') {
        message += '，设备状态将自动恢复为"空闲"'
      }

      return message
    },

    /**
     * 确认取消
     */
    async handleConfirm() {
      // 表单验证
      const valid = await this.$refs.cancelForm.validate().catch(() => false)
      if (!valid) {
        return
      }

      // 二次确认
      try {
        const confirmMessage = this.buildConfirmMessage()
        await this.$confirm(
          confirmMessage,
          '确认取消',
          {
            confirmButtonText: '确定取消',
            cancelButtonText: '我再想想',
            type: 'error',
            dangerouslyUseHTMLString: true
          }
        )
      } catch {
        return
      }

      // 提交取消请求
      this.submitting = true
      try {
        // 构建请求数据
        const requestData = {
          cancelReason: this.formData.cancelReason.trim()
        }

        // 如果填写了详细说明，添加到请求数据中
        if (this.formData.cancelRemarks && this.formData.cancelRemarks.trim()) {
          requestData.cancelRemarks = this.formData.cancelRemarks.trim()
        }

        const response = await cancelTask(this.taskInfo.id, requestData)

        // 使用后端返回的消息
        this.$message.success(response.message || '任务取消成功')

        // 触发成功事件
        this.$emit('success', response.data)

        // 关闭对话框
        this.handleClose()
      } catch (error) {
        console.error('取消任务失败:', error)
        this.handleError(error)
      } finally {
        this.submitting = false
      }
    },

    /**
     * 构建确认消息
     */
    buildConfirmMessage() {
      const taskTitle = this.taskInfo.taskTitle || '当前任务'
      const cancelReason = this.formData.cancelReason || ''
      const cancelRemarks = this.formData.cancelRemarks || ''
      const status = this.taskInfo.status

      let message = `<div style="line-height: 1.6;">
        <p style="color: #f56c6c; font-weight: 600; margin-bottom: 12px;">
          ⚠️ 取消任务后将无法恢复，请确认操作！
        </p>
        <p style="margin-bottom: 8px;">确认取消任务 <strong>"${taskTitle}"</strong> 吗？</p>
        <p style="margin-bottom: 8px;"><strong>取消原因：</strong>${cancelReason}</p>`

      if (cancelRemarks) {
        message += `<p style="margin-bottom: 8px;"><strong>详细说明：</strong>${cancelRemarks}</p>`
      }

      if (status === '执行中') {
        message += `<p style="color: #e6a23c; margin-top: 12px;">
          <i class="el-icon-warning"></i> 任务当前处于执行中状态，取消后设备将自动恢复为"空闲"状态
        </p>`
      }

      message += '</div>'
      return message
    },

    /**
     * 处理错误
     */
    handleError(error) {
      const errorCode = error.code || ''
      const errorMessage = error.message || ''

      // 根据错误码提供友好的错误提示
      let userMessage = ''

      switch (errorCode) {
        case 'TPM_TASK_002':
          userMessage = '维护任务不存在，请刷新页面后重试'
          break
        case 'TPM_TASK_010':
          userMessage = '只有活跃状态的任务才能取消（待执行、执行中或已延期）'
          break
        case 'VALIDATION_ERROR':
          if (errorMessage.includes('cancelReason')) {
            userMessage = '取消原因不能为空或格式不正确，请检查填写的信息'
          } else {
            userMessage = '请求参数验证失败，请检查填写的信息'
          }
          break
        case 'UNAUTHORIZED':
          userMessage = '登录已过期，请重新登录'
          break
        case 'FORBIDDEN':
          userMessage = '无权限操作，需要管理维护任务权限'
          break
        case 'USER_001':
          userMessage = '当前用户状态异常，请重新登录'
          break
        case 'INTERNAL_ERROR':
          userMessage = '服务器内部错误，请稍后重试或联系技术支持'
          break
        default:
          userMessage = errorMessage || '取消任务失败，请重试'
      }

      this.$message.error(userMessage)
    },

    /**
     * 关闭对话框
     */
    handleClose() {
      this.resetForm()
      this.$emit('update:visible', false)
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss" scoped>
.task-info-section {
  margin-bottom: 24px;
  padding: 16px;
  background-color: #fef0f0;
  border-radius: 4px;
  border-left: 4px solid #f56c6c;

  .section-title {
    margin: 0 0 12px 0;
    font-size: 14px;
    font-weight: 600;
    color: #303133;
    display: flex;
    align-items: center;
    gap: 6px;

    i {
      color: #f56c6c;
    }
  }

  .code-text {
    font-family: 'Courier New', Courier, monospace;
    color: #409eff;
    font-weight: 500;
  }

  .cancel-warning {
    margin-top: 16px;
  }
}

.cancel-form {
  margin-top: 20px;

  .form-item-tip {
    margin-top: 8px;
    font-size: 12px;
    color: #909399;
    display: flex;
    align-items: center;
    gap: 4px;

    i {
      color: #f56c6c;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>

