/**
 * 文件名称：LockTaskDialog.vue
 * 文件描述：待排程任务锁定对话框，支持设置锁定时长与排程方案ID
 * 创建日期：2025-10-20
 * 修改记录：
 *   - 2025-10-20: 初始创建
 */

<template>
  <el-dialog
    title="锁定任务"
    :visible.sync="visibleSync"
    width="480px"
    :close-on-click-modal="false"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="120px"
      size="small"
    >
      <el-form-item label="锁定任务数量" prop="taskIds">
        <span class="info-text">{{ selectedCount }} 条</span>
      </el-form-item>
      <el-form-item label="锁定时长(分钟)" prop="lockDurationMinutes">
        <el-input-number
          v-model="formData.lockDurationMinutes"
          :min="1"
          :max="1440"
          :step="5"
          controls-position="right"
          placeholder="请输入锁定时长"
        />
        <div class="form-tip">范围 1-1440，默认30分钟</div>
      </el-form-item>
      <el-form-item label="排程方案ID" prop="schedulePlanId">
        <el-input
          v-model="formData.schedulePlanId"
          placeholder="可选，填写排程方案ID"
          clearable
        />
      </el-form-item>
    </el-form>

    <span slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取 消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleConfirm">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  name: 'LockTaskDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    selectedTasks: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      visibleSync: this.visible,
      formData: {
        taskIds: [],
        lockDurationMinutes: 30,
        schedulePlanId: ''
      },
      submitting: false,
      rules: {
        taskIds: [
          { required: true, message: '请选择需要锁定的任务', trigger: 'change' }
        ],
        lockDurationMinutes: [
          { required: true, message: '请输入锁定时长', trigger: 'change' }
        ],
        schedulePlanId: [
          {
            pattern: /^[0-9a-fA-F-]{0,}$/,
            message: '排程方案ID需为UUID格式',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  computed: {
    selectedCount() {
      return this.formData.taskIds.length
    }
  },
  watch: {
    visible(value) {
      this.visibleSync = value
      if (value) {
        this.initialize()
      }
    },
    visibleSync(value) {
      this.$emit('update:visible', value)
    },
    selectedTasks: {
      immediate: true,
      handler(newVal) {
        this.formData.taskIds = (newVal || []).map((item) => item.id || item.taskId || item)
      }
    }
  },
  methods: {
    initialize() {
      this.formData.lockDurationMinutes = 30
      this.formData.schedulePlanId = ''
      this.formData.taskIds = (this.selectedTasks || []).map((item) => item.id || item.taskId || item)
      this.$nextTick(() => {
        this.$refs.formRef && this.$refs.formRef.clearValidate()
      })
    },
    handleCancel() {
      this.visibleSync = false
    },
    handleConfirm() {
      this.$refs.formRef.validate((valid) => {
        if (!valid) return
        this.submitting = true
        const payload = {
          taskIds: [...this.formData.taskIds],
          lockDurationMinutes: this.formData.lockDurationMinutes,
          schedulePlanId: this.formData.schedulePlanId || undefined
        }
        this.$emit('confirm', payload)
        this.submitting = false
      })
    }
  }
}
</script>

<style scoped>
.info-text {
  font-weight: 600;
  color: #303133;
}

.form-tip {
  margin-top: 6px;
  font-size: 12px;
  color: #909399;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>

