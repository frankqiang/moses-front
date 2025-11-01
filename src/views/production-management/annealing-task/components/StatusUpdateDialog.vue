/**
 * 文件名称：StatusUpdateDialog.vue
 * 文件描述：退火任务状态更新对话框组件
 * 创建日期：2025-10-20
 * 修改记录：
 *   - 2025-10-20: 初始创建，实现状态更新功能
 *   - 2025-11-01: 适配接口v1.2，已排程任务不允许直接回退或取消；移除状态历史功能
 */
<template>
  <el-dialog
    :visible.sync="dialogVisible"
    title="更新任务状态"
    width="600px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="handleClose"
  >
    <el-form
      ref="statusForm"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      label-position="right"
    >
      <!-- 当前状态 -->
      <el-form-item label="当前状态">
        <status-tag
          v-if="currentStatus"
          :status="currentStatus"
          :text-map="statusTextMap"
          :type-map="statusTypeMap"
          effect="light"
          size="medium"
        />
      </el-form-item>

      <!-- 目标状态 -->
      <el-form-item label="目标状态" prop="status">
        <el-select
          v-model="formData.status"
          placeholder="请选择目标状态"
          style="width: 100%"
          @change="handleStatusChange"
        >
          <el-option
            v-for="option in allowedNextStatuses"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          >
            <div style="display: flex; align-items: center; justify-content: space-between">
              <status-tag
                :status="option.value"
                :text-map="statusTextMap"
                :type-map="statusTypeMap"
                effect="plain"
                size="small"
              />
              <span style="font-size: 12px; color: #909399; margin-left: 8px">
                {{ statusDescriptions[option.value] }}
              </span>
            </div>
          </el-option>
        </el-select>
        <div v-if="selectedStatusDescription" class="status-hint">
          <i class="el-icon-info" />
          {{ selectedStatusDescription }}
        </div>
      </el-form-item>

      <!-- 原因说明（特定状态必填） -->
      <el-form-item
        v-if="isReasonRequired"
        label="原因说明"
        prop="reason"
      >
        <el-select
          v-if="hasQuickReasons"
          v-model="formData.reason"
          placeholder="请选择或输入原因"
          filterable
          allow-create
          style="width: 100%"
        >
          <el-option
            v-for="option in quickReasonOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
        <el-input
          v-else
          v-model="formData.reason"
          type="textarea"
          :rows="3"
          placeholder="请输入原因说明（必填）"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>

      <!-- 备注信息 -->
      <el-form-item label="备注" prop="remarks">
        <el-input
          v-model="formData.remarks"
          type="textarea"
          :rows="3"
          placeholder="请输入备注信息（选填）"
          maxlength="1000"
          show-word-limit
        />
      </el-form-item>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">确定更新</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { updateAnnealingTaskStatus } from '../api'
import errorMixin from '@/mixins/errorMixin'
import {
  TASK_STATUS_OPTIONS,
  STATE_TRANSITIONS,
  REASON_REQUIRED_STATUSES,
  QUICK_REASON_OPTIONS,
  STATUS_DESCRIPTIONS
} from '../constants'
import { STATUS_CONFIG } from '../constants/table-config'
import StatusTag from '@/components/StatusTag'

export default {
  name: 'StatusUpdateDialog',
  components: {
    StatusTag
  },
  mixins: [errorMixin],
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    taskId: {
      type: String,
      default: ''
    },
    currentStatus: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      formData: {
        status: '',
        reason: '',
        remarks: ''
      },
      submitting: false,
      statusTextMap: STATUS_CONFIG.textMap,
      statusTypeMap: STATUS_CONFIG.typeMap,
      statusDescriptions: STATUS_DESCRIPTIONS
    }
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible
      },
      set(val) {
        this.$emit('update:visible', val)
      }
    },
    // 允许的下一状态选项
    allowedNextStatuses() {
      const allowedStatuses = STATE_TRANSITIONS[this.currentStatus] || []
      return TASK_STATUS_OPTIONS.filter(option =>
        allowedStatuses.includes(option.value)
      )
    },
    // 是否需要填写原因
    isReasonRequired() {
      return this.formData.status && REASON_REQUIRED_STATUSES.includes(this.formData.status)
    },
    // 是否有快捷原因选项
    hasQuickReasons() {
      return this.formData.status && QUICK_REASON_OPTIONS[this.formData.status]
    },
    // 快捷原因选项
    quickReasonOptions() {
      return QUICK_REASON_OPTIONS[this.formData.status] || []
    },
    // 选中状态的说明
    selectedStatusDescription() {
      return this.formData.status ? STATUS_DESCRIPTIONS[this.formData.status] : ''
    },
    // 表单校验规则
    formRules() {
      return {
        status: [
          { required: true, message: '请选择目标状态', trigger: 'change' }
        ],
        reason: [
          {
            required: this.isReasonRequired,
            message: '暂停、取消或异常终止任务时，必须提供原因说明',
            trigger: 'blur'
          },
          {
            max: 500,
            message: '原因说明长度不能超过500个字符',
            trigger: 'blur'
          }
        ],
        remarks: [
          {
            max: 1000,
            message: '备注长度不能超过1000个字符',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.resetForm()
      }
    }
  },
  methods: {
    resetForm() {
      this.formData = {
        status: '',
        reason: '',
        remarks: ''
      }
      if (this.$refs.statusForm) {
        this.$refs.statusForm.clearValidate()
      }
    },
    handleStatusChange() {
      // 切换状态时清空原因和备注
      this.formData.reason = ''
      if (this.$refs.statusForm) {
        this.$refs.statusForm.clearValidate(['reason'])
      }
    },
    handleSubmit() {
      this.$refs.statusForm.validate(async(valid) => {
        if (!valid) {
          return false
        }

        // 二次确认
        const statusText = this.statusTextMap[this.formData.status]
        const confirmMessage = this.isReasonRequired
          ? `确认将任务状态更新为"${statusText}"？此操作需要提供原因说明。`
          : `确认将任务状态更新为"${statusText}"？`

        try {
          await this.$confirm(confirmMessage, '确认操作', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })
        } catch {
          return false
        }

        this.submitting = true
        try {
          const payload = {
            status: this.formData.status
          }

          if (this.formData.reason) {
            payload.reason = this.formData.reason
          }
          if (this.formData.remarks) {
            payload.remarks = this.formData.remarks
          }

          const response = await updateAnnealingTaskStatus(this.taskId, payload)

          if (response && response.data) {
            this.$message.success(response.message || '更新任务状态成功')
            this.$emit('success', response.data)
            this.handleClose()
          }
        } catch (error) {
          console.error('更新任务状态失败:', error)
          this.handleError(error)
        } finally {
          this.submitting = false
        }
      })
    },
    handleClose() {
      this.dialogVisible = false
      this.resetForm()
    }
  }
}
</script>

<style lang="scss" scoped>
.status-hint {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
  display: flex;
  align-items: flex-start;

  i {
    margin-right: 4px;
    margin-top: 2px;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>

