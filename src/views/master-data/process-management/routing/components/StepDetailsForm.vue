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

      <!-- 下一步骤 (通用) / 成功下一步 & 失败下一步 -->
      <template v-if="['Production', 'Packing'].includes(formData.operationType)">
        <el-form-item label="下一步骤" prop="onSuccessStep">
          <el-select v-model="formData.onSuccessStep" placeholder="请选择下一步骤" style="width: 100%;">
            <el-option label="0 (顺序执行)" :value="0"></el-option>
            <el-option
              v-for="step in availableStepOptions"
              :key="step.stepId"
              :label="`${step.stepNumber} - ${step.operationName}`"
              :value="step.stepNumber"
            />
          </el-select>
          <div class="field-hint">0 或留空表示顺序执行到下一步</div>
        </el-form-item>
      </template>

      <template v-else-if="formData.operationType === 'Inspection'">
        <el-form-item label="成功后跳转至步骤号" prop="onSuccessStep">
          <el-select v-model="formData.onSuccessStep" placeholder="请选择步骤" style="width: 100%;">
            <el-option label="0 (顺序执行)" :value="0"></el-option>
            <el-option
              v-for="step in availableStepOptions"
              :key="step.stepId"
              :label="`${step.stepNumber} - ${step.operationName}`"
              :value="step.stepNumber"
            />
          </el-select>
          <div class="field-hint">0 或留空表示顺序执行到下一步</div>
        </el-form-item>
        
        <el-form-item label="失败后跳转至步骤号" prop="onFailureStep">
          <el-select v-model="formData.onFailureStep" placeholder="请选择步骤" style="width: 100%;">
            <el-option label="0 (工艺终止)" :value="0"></el-option>
            <el-option
              v-for="step in availableStepOptions"
              :key="step.stepId"
              :label="`${step.stepNumber} - ${step.operationName}`"
              :value="step.stepNumber"
            />
          </el-select>
          <div class="field-hint">0 或留空表示工艺终止</div>
        </el-form-item>
      </template>

      <el-form-item label="标准准备时间 (分钟)" prop="standardSetupTime">
        <el-input-number v-model="formData.standardSetupTime" controls-position="right" :min="0" style="width: 100%;" />
        <el-tooltip class="item" effect="dark" placement="top">
          <div slot="content">指为加工本批次而进行的换模、清洗、预热等占用设备的活动时间。<br/>不包含因等待上一批次完成而产生的排队时间。</div>
          <i class="el-icon-info field-info-icon"></i>
        </el-tooltip>
      </el-form-item>

      <el-form-item label="标准加工时间" prop="standardProcessingTime">
        <el-input-number v-model="formData.standardProcessingTime" controls-position="right" :min="0" style="width: calc(100% - 160px); margin-right: 10px;" />
        <el-select v-model="formData.processingTimeUnit" placeholder="单位" style="width: 150px;">
          <el-option
            v-for="item in processingTimeUnitOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <el-tooltip class="item" effect="dark" placement="top">
          <div slot="content">指加工一个标准业务单位（如1吨母卷、1个成品卷）本身所消耗的时间。<br/>系统将基于此进行生产计划的初步估算。</div>
          <i class="el-icon-info field-info-icon"></i>
        </el-tooltip>
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
    },
    allSteps: { // 新增 allSteps prop
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      formData: {},
      formRules: {
        onSuccessStep: [{ type: 'integer', message: '必须为整数', trigger: 'change' }],
        onFailureStep: [{ type: 'integer', message: '必须为整数', trigger: 'change' }],
        standardSetupTime: [
          { type: 'number', message: '必须为数字', trigger: 'blur' },
          { validator: (rule, value, callback) => {
            if (value < 0) {
              callback(new Error('不能为负数'));
            } else {
              callback();
            }
          }, trigger: 'blur' }
        ],
        standardProcessingTime: [
          { type: 'number', message: '必须为数字', trigger: 'blur' },
          { validator: (rule, value, callback) => {
            if (value < 0) {
              callback(new Error('不能为负数'));
            } else {
              callback();
            }
          }, trigger: 'blur' }
        ]
      },
      processingTimeUnitOptions: [
        { label: '分钟/吨', value: '分钟/吨' },
        { label: '分钟/卷', value: '分钟/卷' },
        { label: '分钟/批次', value: '分钟/批次' },
        { label: '分钟/米', value: '分钟/米' }
      ]
    }
  },
  computed: {
    availableStepOptions() {
      // 过滤掉当前步骤，防止自循环
      return this.allSteps.filter(step => step.stepId !== this.selectedStep.stepId);
    }
  },
  watch: {
    selectedStep: {
      handler(newVal) {
        this.formData = newVal ? { ...newVal } : null
        if (this.formData && this.formData.operationId) {
          // 从 allSteps 中找到对应的 operation.type
          const correspondingStep = this.allSteps.find(step => step.stepId === this.formData.stepId);
          if (correspondingStep) {
            this.formData.operationType = correspondingStep.operationType; // 从路由步骤中获取工序类型
          }
        }
        // 初始化加工时间单位，如果未设置则默认为 '分钟/吨'
        if (this.formData && !this.formData.processingTimeUnit) {
          this.$set(this.formData, 'processingTimeUnit', '分钟/吨');
        }
      },
      immediate: true,
      deep: true
    },
    formData: {
        handler(newVal) {
            if (newVal && this.selectedStep) {
                // 确保只有在 formData 的内容真正改变时才发出 update-step 事件，避免不必要的更新循环
                const hasChanged = Object.keys(newVal).some(key => newVal[key] !== this.selectedStep[key]);
                if (hasChanged) {
                  this.$emit('update-step', newVal);
                }
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

  .field-info-icon {
    margin-left: 5px;
    color: #409EFF;
    cursor: help;
  }
}

::v-deep .el-form--label-top .el-form-item__label {
    padding-bottom: 2px;
    font-weight: 500;
}
</style> 