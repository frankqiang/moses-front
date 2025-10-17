<!--
  文件名称：PostponeTaskDialog.vue
  文件描述：任务延期对话框组件
  创建日期：2024-01-20
  修改记录：
    - 2024-01-20: 初始创建，实现任务延期功能
    - 2024-01-20: 重构以对齐最新接口文档，优化错误处理和业务提示
    - 2024-01-20: 增加延期原因最大长度验证（500字符）
    - 2024-01-20: 补充INTERNAL_ERROR错误码处理，完善边缘场景
-->
<template>
  <el-dialog
    :visible.sync="dialogVisible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    title="任务延期申请"
    width="600px"
    @close="handleClose"
  >
    <!-- 任务信息展示 -->
    <div v-if="taskInfo" class="task-info-section">
      <h4 class="section-title">
        <i class="el-icon-document" />
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
    </div>

    <!-- 延期表单 -->
    <el-form
      ref="postponeForm"
      :model="formData"
      :rules="formRules"
      label-width="120px"
      class="postpone-form"
    >
      <el-form-item label="延期原因" prop="delayReason" required>
        <el-input
          v-model="formData.delayReason"
          type="textarea"
          :rows="4"
          placeholder="请详细说明延期原因（必填，最多500字符）"
          maxlength="500"
          show-word-limit
        />
        <div class="form-item-tip">
          <i class="el-icon-warning" />
          延期原因为必填项，用于后续追溯和流程改进分析
        </div>
      </el-form-item>

      <el-form-item label="新计划开始时间" prop="newPlannedStartTime">
        <el-date-picker
          v-model="formData.newPlannedStartTime"
          type="datetime"
          placeholder="选择新的计划开始时间（可选）"
          format="yyyy-MM-dd HH:mm"
          value-format="yyyy-MM-dd HH:mm:ss"
          :picker-options="pickerOptions"
          style="width: 100%"
        />
        <div class="form-item-tip">
          <i class="el-icon-info" />
          可选项：不填写时保持原计划时间，仅记录延期原因
        </div>
      </el-form-item>

      <!-- 业务规则提示 -->
      <el-alert
        v-if="taskInfo && taskInfo.status === '执行中'"
        title="温馨提示：执行中的任务延期后，设备将保持"维护中"状态，直到任务完成或取消"
        type="info"
        :closable="false"
        show-icon
        class="business-tip"
      />
    </el-form>

    <!-- 对话框底部按钮 -->
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button
        type="warning"
        :loading="submitting"
        @click="handleConfirm"
      >
        确认延期
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { postponeTask } from '../api/maintenance-task'
import { STATUS_TAG_TYPE_MAP } from '../constants/maintenance-task'
import { parseTime } from '@/utils'

export default {
  name: 'PostponeTaskDialog',

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
        delayReason: '',
        newPlannedStartTime: ''
      },
      formRules: {
        delayReason: [
          { required: true, message: '请输入延期原因', trigger: 'blur' },
          { min: 5, message: '延期原因至少需要5个字符', trigger: 'blur' },
          { max: 500, message: '延期原因不能超过500个字符', trigger: 'blur' }
        ],
        newPlannedStartTime: [
          { validator: this.validateNewStartTime, trigger: 'change' }
        ]
      },
      pickerOptions: {
        disabledDate: (time) => {
          // 禁用早于当前时间的日期
          return time.getTime() < Date.now() - 86400000 // 86400000 = 24小时
        }
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
        delayReason: '',
        newPlannedStartTime: ''
      }
      if (this.$refs.postponeForm) {
        this.$refs.postponeForm.clearValidate()
      }
    },

    /**
     * 验证新的计划开始时间
     */
    validateNewStartTime(rule, value, callback) {
      if (!value) {
        // 可选字段，不填写则通过
        callback()
        return
      }

      const newStartTime = new Date(value).getTime()
      const currentTime = Date.now()

      if (newStartTime < currentTime) {
        callback(new Error('新的计划开始时间不能早于当前时间'))
      } else {
        callback()
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
     * 确认延期
     */
    async handleConfirm() {
      // 表单验证
      const valid = await this.$refs.postponeForm.validate().catch(() => false)
      if (!valid) {
        return
      }

      // 二次确认
      try {
        const confirmMessage = this.buildConfirmMessage()
        await this.$confirm(
          confirmMessage,
          '确认延期',
          {
            confirmButtonText: '确定延期',
            cancelButtonText: '取消',
            type: 'warning',
            dangerouslyUseHTMLString: true
          }
        )
      } catch {
        return
      }

      // 提交延期申请
      this.submitting = true
      try {
        const requestData = {
          delayReason: this.formData.delayReason.trim()
        }

        // 如果填写了新的计划开始时间，转换为ISO 8601格式
        if (this.formData.newPlannedStartTime) {
          requestData.newPlannedStartTime = new Date(this.formData.newPlannedStartTime).toISOString()
        }

        const response = await postponeTask(this.taskInfo.id, requestData)

        // 使用后端返回的消息
        this.$message.success(response.message || '任务延期申请成功')

        // 触发成功事件
        this.$emit('success', response.data)

        // 关闭对话框
        this.handleClose()
      } catch (error) {
        console.error('延期申请失败:', error)
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
      const delayReason = this.formData.delayReason || ''
      const newStartTime = this.formData.newPlannedStartTime
        ? this.formatDateTime(this.formData.newPlannedStartTime)
        : ''

      let message = `<div style="line-height: 1.6;">
        <p style="margin-bottom: 12px;">确认将任务 <strong>"${taskTitle}"</strong> 申请延期吗？</p>
        <p style="margin-bottom: 8px;"><strong>延期原因：</strong>${delayReason}</p>`

      if (newStartTime) {
        message += `<p style="margin-bottom: 8px;"><strong>新计划开始时间：</strong>${newStartTime}</p>`
      }

      if (this.taskInfo.status === '执行中') {
        message += `<p style="color: #e6a23c; margin-top: 12px;">
          <i class="el-icon-warning"></i> 任务当前处于执行中状态，延期后设备将保持"维护中"状态
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
        case 'TPM_TASK_001':
          userMessage = '维护任务不存在，请刷新页面后重试'
          break
        case 'TPM_TASK_014':
          if (errorMessage.includes('状态')) {
            userMessage = '只有待执行或执行中状态的任务才能申请延期'
          } else if (errorMessage.includes('延期原因')) {
            userMessage = '延期原因不能为空，请填写延期原因'
          } else {
            userMessage = errorMessage || '任务状态不符合延期条件'
          }
          break
        case 'TPM_TASK_016':
          userMessage = '只有任务执行人才能申请延期，当前用户无权操作'
          break
        case 'VALIDATION_ERROR':
          userMessage = '请求参数验证失败，请检查填写的信息'
          break
        case 'UNAUTHORIZED':
          userMessage = '登录已过期，请重新登录'
          break
        case 'FORBIDDEN':
          userMessage = '无权限操作，需要执行维护任务的权限'
          break
        case 'INTERNAL_ERROR':
          userMessage = '服务器内部错误，请稍后重试或联系技术支持'
          break
        default:
          userMessage = errorMessage || '延期申请失败，请重试'
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
}

.postpone-form {
  margin-top: 20px;

  .form-item-tip {
    margin-top: 8px;
    font-size: 12px;
    color: #909399;
    display: flex;
    align-items: center;
    gap: 4px;

    i {
      color: #e6a23c;
    }
  }

  .business-tip {
    margin-top: 16px;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>

