<template>
  <div class="step-details-form">
    <div class="form-title">三、步骤属性配置</div>
    <div v-if="!selectedStep" class="no-step-selected">
      <i class="el-icon-info"></i>
      <p>请在左侧列表中选择一个工序步骤以配置其属性。</p>
    </div>
    <el-form
      v-else
      ref="stepForm"
      :model="formData"
      :rules="formRules"
      label-width="140px"
      label-position="top"
      :disabled="isViewMode"
    >
      <div class="step-identity">
        步骤 {{ formData.stepNumber }}: {{ formData.operationName }} ({{ formData.operationCode }})
      </div>

      <el-form-item label="成功后跳转至步骤号" prop="onSuccessStep">
        <el-input-number v-model="formData.onSuccessStep" controls-position="right" :min="0" style="width: 100%;" />
        <div class="field-hint">0 或留空表示顺序执行到下一步</div>
      </el-form-item>
      
      <el-form-item label="失败后跳转至步骤号" prop="onFailureStep">
        <el-input-number v-model="formData.onFailureStep" controls-position="right" :min="0" style="width: 100%;" />
        <div class="field-hint">0 或留空表示工艺终止</div>
      </el-form-item>

      <el-form-item label="标准准备时间 (分钟)" prop="standardSetupTime">
        <el-input-number v-model="formData.standardSetupTime" controls-position="right" :min="0" style="width: 100%;" />
      </el-form-item>

      <el-form-item label="标准加工时间 (分钟)" prop="standardProcessingTime">
        <el-input-number v-model="formData.standardProcessingTime" controls-position="right" :min="0" style="width: 100%;" />
      </el-form-item>

    </el-form>
  </div>
</template>

<script>
export default {
  name: 'StepDetailsForm',
  props: {
    selectedStep: {
      type: Object,
      default: null
    },
    isViewMode: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      formData: {},
      formRules: {
        onSuccessStep: [{ type: 'integer', message: '必须为整数', trigger: 'blur' }],
        onFailureStep: [{ type: 'integer', message: '必须为整数', trigger: 'blur' }],
        standardSetupTime: [{ type: 'number', message: '必须为数字', trigger: 'blur' }],
        standardProcessingTime: [{ type: 'number', message: '必须为数字', trigger: 'blur' }]
      }
    }
  },
  watch: {
    selectedStep: {
      handler(newVal) {
        this.formData = newVal ? { ...newVal } : null
      },
      immediate: true,
      deep: true
    },
    formData: {
        handler(newVal) {
            if (newVal && this.selectedStep) {
                this.$emit('update-step', newVal);
            }
        },
        deep: true
    }
  }
}
</script>

<style lang="scss" scoped>
.step-details-form {
  padding: 0 15px;
  .form-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 20px;
    padding-bottom: 8px;
    border-bottom: 1px solid #e4e7ed;
  }

  .no-step-selected {
    text-align: center;
    color: #909399;
    padding: 40px 20px;
    background-color: #f7f7f7;
    border-radius: 4px;

    .el-icon-info {
      font-size: 24px;
      margin-bottom: 10px;
    }
  }
  
  .step-identity {
    font-size: 14px;
    font-weight: 600;
    color: #409eff;
    background-color: #f0f6ff;
    padding: 10px;
    border-radius: 4px;
    margin-bottom: 22px;
    text-align: center;
  }

  .field-hint {
    font-size: 12px;
    color: #909399;
    margin-top: 5px;
    line-height: 1.4;
  }
}

::v-deep .el-form--label-top .el-form-item__label {
    padding-bottom: 2px;
    font-weight: 500;
}
</style> 