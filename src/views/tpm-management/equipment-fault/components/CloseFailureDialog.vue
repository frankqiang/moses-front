/**
 * 文件名称：CloseFailureDialog.vue
 * 文件描述：关闭故障单对话框组件
 * 创建日期：2025-01-20
 * 修改记录：
 *   - 2025-01-20: 初始创建
 */
<template>
  <el-dialog
    title="关闭故障单"
    :visible.sync="dialogVisible"
    width="600px"
    :close-on-click-modal="false"
    :before-close="handleClose"
    @open="handleOpen"
  >
    <el-form
      ref="form"
      :model="formData"
      :rules="rules"
      label-width="120px"
      size="medium"
    >
      <el-form-item label="故障编码">
        <span>{{ failureCode }}</span>
      </el-form-item>

      <el-form-item label="当前状态">
        <status-tag
          :status="currentStatus"
          :type-map="FAILURE_STATUS_CONFIG.typeMap"
          :text-map="FAILURE_STATUS_CONFIG.textMap"
        />
      </el-form-item>

      <el-alert
        v-if="isForceClose"
        type="warning"
        :closable="false"
        style="margin-bottom: 16px"
      >
        <template slot="title">
          <strong>强制关闭警告</strong>
        </template>
        当前故障处于"{{ currentStatus }}"状态，强制关闭需要提供充分的关闭原因
      </el-alert>

      <el-form-item
        label="关闭原因"
        :prop="isForceClose ? 'closeReason' : ''"
      >
        <el-input
          v-model="formData.closeReason"
          type="textarea"
          :rows="4"
          :placeholder="isForceClose ? '请填写关闭原因（必填）' : '请填写关闭原因（可选）'"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>

      <el-alert
        type="info"
        :closable="false"
        style="margin-bottom: 0"
      >
        关闭后故障单将无法再进行操作，请确认是否继续
      </el-alert>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取 消</el-button>
      <el-button
        type="danger"
        :loading="submitting"
        @click="handleSubmit"
      >
        确认关闭
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { closeFailure } from '@/api/mdm/tpm/equipmentFailure'
import { FAILURE_STATUS_CONFIG, FAILURE_STATUS } from '../constants'
import StatusTag from '@/components/StatusTag'

export default {
  name: 'CloseFailureDialog',
  components: {
    StatusTag
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    failureId: {
      type: String,
      required: true
    },
    failureCode: {
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
      dialogVisible: false,
      submitting: false,
      FAILURE_STATUS_CONFIG,
      FAILURE_STATUS,
      formData: {
        closeReason: ''
      },
      rules: {
        closeReason: [
          { required: true, message: '请填写关闭原因', trigger: 'blur' },
          { min: 5, message: '关闭原因至少需要5个字符', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    // 是否为强制关闭（非正常流程关闭）
    isForceClose() {
      return this.currentStatus !== FAILURE_STATUS.RESOLVED &&
             this.currentStatus !== FAILURE_STATUS.VERIFIED
    }
  },
  watch: {
    visible(val) {
      this.dialogVisible = val
    },
    dialogVisible(val) {
      if (!val) {
        this.$emit('update:visible', false)
      }
    }
  },
  methods: {
    handleOpen() {
      this.formData.closeReason = ''
      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.clearValidate()
      })
    },
    handleClose() {
      this.dialogVisible = false
    },
    handleSubmit() {
      this.$refs.form.validate(async(valid) => {
        if (!valid) return

        // 二次确认
        try {
          await this.$confirm(
            '关闭后故障单将无法再进行操作，确定要关闭吗？',
            '确认关闭',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }
          )

          this.submitting = true
          const requestData = {}
          if (this.formData.closeReason) {
            requestData.closeReason = this.formData.closeReason
          }

          const response = await closeFailure(this.failureId, requestData)
          this.$message.success(response.message || '关闭故障单成功')
          this.$emit('success')
          this.handleClose()
        } catch (error) {
          if (error !== 'cancel') {
            this.$message.error(error.message || '关闭故障单失败')
          }
        } finally {
          this.submitting = false
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>

