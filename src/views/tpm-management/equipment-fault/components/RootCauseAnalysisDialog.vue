/**
 * 文件名称：RootCauseAnalysisDialog.vue
 * 文件描述：提交根本原因分析对话框组件
 * 创建日期：2025-01-20
 * 修改记录：
 *   - 2025-01-20: 初始创建
 */
<template>
  <el-dialog
    title="提交根本原因分析"
    :visible.sync="dialogVisible"
    width="800px"
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

      <el-alert
        type="info"
        :closable="false"
        style="margin-bottom: 20px"
      >
        <template slot="title">
          <div style="font-size: 14px; line-height: 1.6;">
            <strong>分析方法提示：</strong><br>
            • <strong>5Why分析法：</strong>连续问"为什么"找出根本原因<br>
            • <strong>鱼骨图分析：</strong>从人、机、料、法、环等方面分析<br>
            • <strong>故障树分析：</strong>系统性分析故障发生的各种可能
          </div>
        </template>
      </el-alert>

      <el-form-item label="根本原因分析" prop="rootCauseAnalysis">
        <el-input
          v-model="formData.rootCauseAnalysis"
          type="textarea"
          :rows="8"
          placeholder="请详细填写根本原因分析内容&#10;&#10;建议格式（5Why分析法）：&#10;1. 为什么发生故障？&#10;2. 为什么会出现这个问题？&#10;3. 为什么没有预防？&#10;4. 为什么流程有缺陷？&#10;5. 根本原因是什么？"
          maxlength="5000"
          show-word-limit
        />
        <div style="margin-top: 8px; color: #909399; font-size: 12px;">
          <i class="el-icon-info" />
          支持使用5Why分析法或鱼骨图等方法进行深入分析
        </div>
      </el-form-item>

      <el-form-item label="预防措施">
        <el-input
          v-model="formData.preventiveMeasures"
          type="textarea"
          :rows="6"
          placeholder="请填写针对根本原因制定的预防措施（可选）&#10;&#10;建议包括：&#10;1. 短期纠正措施&#10;2. 长期预防措施&#10;3. 流程改进建议&#10;4. 培训或制度完善需求"
          maxlength="3000"
          show-word-limit
        />
        <div style="margin-top: 8px; color: #909399; font-size: 12px;">
          <i class="el-icon-info" />
          预防措施应具体、可操作，并明确责任人和完成时间
        </div>
      </el-form-item>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取 消</el-button>
      <el-button
        type="primary"
        :loading="submitting"
        @click="handleSubmit"
      >
        确 定
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { submitRootCauseAnalysis } from '@/api/mdm/tpm/equipmentFailure'

export default {
  name: 'RootCauseAnalysisDialog',
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
    }
  },
  data() {
    return {
      dialogVisible: false,
      submitting: false,
      formData: {
        rootCauseAnalysis: '',
        preventiveMeasures: ''
      },
      rules: {
        rootCauseAnalysis: [
          { required: true, message: '请填写根本原因分析', trigger: 'blur' },
          { min: 20, message: '根本原因分析至少需要20个字符', trigger: 'blur' }
        ]
      }
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
      this.formData = {
        rootCauseAnalysis: '',
        preventiveMeasures: ''
      }
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

        try {
          this.submitting = true
          const requestData = {
            rootCauseAnalysis: this.formData.rootCauseAnalysis,
            preventiveMeasures: this.formData.preventiveMeasures || undefined
          }

          const response = await submitRootCauseAnalysis(this.failureId, requestData)
          this.$message.success(response.message || '提交根本原因分析成功')
          this.$emit('success')
          this.handleClose()
        } catch (error) {
          this.$message.error(error.message || '提交根本原因分析失败')
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

::v-deep .el-alert {
  .el-alert__title {
    font-size: 14px;
    line-height: 1.6;
  }
}

::v-deep .el-textarea {
  .el-textarea__inner {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  }
}
</style>

