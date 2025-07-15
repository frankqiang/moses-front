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
      
      <div class="form-group">
        <div class="group-title">流程逻辑 (Flow Logic)</div>
        <!-- 下一步骤 (通用) -->
        <template v-if="formData.operationType && ['Production', 'Packing', 'Storage', 'Move'].includes(formData.operationType)">
          <el-form-item label="下一步骤" prop="flowLogic.onSuccessStep">
            <el-select v-model="formData.flowLogic.onSuccessStep" placeholder="请选择下一步骤" style="width: 100%;">
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

        <!-- 成功下一步 & 失败下一步 (检验类型) -->
        <template v-else-if="formData.operationType === 'Inspection'">
          <el-form-item label="成功后跳转至步骤号" prop="flowLogic.onSuccessStep">
            <el-select v-model="formData.flowLogic.onSuccessStep" placeholder="请选择步骤" style="width: 100%;">
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
          
          <el-form-item label="失败后跳转至步骤号" prop="flowLogic.onFailureStep">
            <el-select v-model="formData.flowLogic.onFailureStep" placeholder="请选择步骤" style="width: 100%;">
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
      </div>

      <div class="form-group">
        <div class="group-title">时间标准 (Time Standards)</div>
        <el-form-item prop="timeStandards.setup.value">
          <div slot="label">
            标准准备时间 (分钟)
            <el-tooltip class="item" effect="dark" placement="top">
              <div slot="content">指为加工本批次而进行的换模、清洗、预热等占用设备的活动时间。<br/>不包含因等待上一批次完成而产生的排队时间。</div>
              <i class="el-icon-info field-info-icon"></i>
            </el-tooltip>
          </div>
          <el-row type="flex" align="middle">
            <el-col :span="14">
              <el-input-number
                v-model="formData.timeStandards.setup.value"
                controls-position="right"
                :min="0"
                style="width: 100%;"
              />
            </el-col>
            <el-col :span="10">
              <el-select
                v-model="formData.timeStandards.setup.type"
                placeholder="计算规则"
                style="width: calc(100% - 10px); margin-left: 10px;"
                prop="timeStandards.setup.type"
              >
                <el-option
                  v-for="item in setupTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-col>
          </el-row>
          <el-form-item
            v-if="formData.timeStandards.setup.type === 'Matrix'"
            prop="timeStandards.setup.matrixId"
            label="关联矩阵"
            label-width="80px"
            style="margin-top: 10px;"
          >
            <el-select
              v-model="formData.timeStandards.setup.matrixId"
              placeholder="请选择关联矩阵"
              style="width: 100%;"
            >
              <el-option
                v-for="item in matrixOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-form-item>

        <el-form-item prop="timeStandards.processing.value">
          <div slot="label">
            标准加工时间
            <el-tooltip class="item" effect="dark" placement="top">
              <div slot="content">指加工一个标准业务单位（如1吨母卷、1个成品卷）本身所消耗的时间。<br/>系统将基于此进行生产计划的初步估算。</div>
              <i class="el-icon-info field-info-icon"></i>
            </el-tooltip>
          </div>
          <el-row type="flex" align="middle">
            <el-col :span="14">
              <el-input-number
                v-model="formData.timeStandards.processing.value"
                controls-position="right"
                :min="0"
                style="width: 100%;"
              />
            </el-col>
            <el-col :span="10">
              <el-select
                v-model="formData.timeStandards.processing.type"
                placeholder="计算规则"
                style="width: calc(100% - 10px); margin-left: 10px;"
                prop="timeStandards.processing.type"
              >
                <el-option
                  v-for="item in processingTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-col>
          </el-row>
          <el-form-item
            v-if="formData.timeStandards.processing.type === 'Fixed'"
            prop="timeStandards.processing.unit"
            label="单位"
            label-width="80px"
            style="margin-top: 10px;"
          >
            <el-select
              v-model="formData.timeStandards.processing.unit"
              placeholder="单位"
              style="width: 100%;"
            >
              <el-option
                v-for="item in processingTimeUnitOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            v-if="formData.timeStandards.processing.type === 'Formula'"
            prop="timeStandards.processing.formula"
            label="计算公式"
            label-width="80px"
            style="margin-top: 10px;"
          >
            <el-input
              v-model="formData.timeStandards.processing.formula"
              type="textarea"
              :rows="3"
              placeholder="请输入公式，例如：10 * [thickness] + 5"
              style="width: 100%;"
            />
          </el-form-item>
        </el-form-item>
      </div>
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
      formData: {}, // 将在 watch 中初始化
      formRules: {
        'flowLogic.onSuccessStep': [{ type: 'integer', message: '必须为整数', trigger: 'change' }],
        'flowLogic.onFailureStep': [{ type: 'integer', message: '必须为整数', trigger: 'change' }],
        'timeStandards.setup.value': [
          { type: 'number', message: '必须为数字', trigger: 'blur' },
          { validator: (rule, value, callback) => {
            if (value < 0) {
              callback(new Error('不能为负数'));
            } else {
              callback();
            }
          }, trigger: 'blur' }
        ],
        'timeStandards.processing.value': [
          { type: 'number', message: '必须为数字', trigger: 'blur' },
          { validator: (rule, value, callback) => {
            if (value < 0) {
              callback(new Error('不能为负数'));
            } else {
              callback();
            }
          }, trigger: 'blur' }
        ],
        'timeStandards.setup.type': [{ required: true, message: '请选择计算规则', trigger: 'change' }],
        'timeStandards.processing.type': [{ required: true, message: '请选择计算规则', trigger: 'change' }],
        'timeStandards.setup.matrixId': [{ 
          validator: (rule, value, callback) => {
            if (this.formData.timeStandards.setup.type === 'Matrix' && !value) {
              callback(new Error('请选择关联矩阵'));
            } else {
              callback();
            }
          }, trigger: 'change' 
        }],
        'timeStandards.processing.unit': [{ 
          validator: (rule, value, callback) => {
            if (this.formData.timeStandards.processing.type === 'Fixed' && !value) {
              callback(new Error('请选择单位'));
            } else {
              callback();
            }
          }, trigger: 'change' 
        }],
        'timeStandards.processing.formula': [{ 
          validator: (rule, value, callback) => {
            if (this.formData.timeStandards.processing.type === 'Formula' && !value) {
              callback(new Error('请输入公式'));
            } else {
              callback();
            }
          }, trigger: 'blur' 
        }]
      },
      // 准备时间计算规则选项
      setupTypeOptions: [
        { label: '使用固定时间', value: 'Fixed' },
        { label: '使用切换矩阵', value: 'Matrix' }
      ],
      // 加工时间计算规则选项
      processingTypeOptions: [
        { label: '使用固定时间', value: 'Fixed' },
        { label: '使用公式计算', value: 'Formula' }
      ],
      // 加工时间单位选项
      processingTimeUnitOptions: [
        { label: '分钟/吨', value: '分钟/吨' },
        { label: '分钟/卷', value: '分钟/卷' },
        { label: '分钟/批次', value: '分钟/批次' },
        { label: '分钟/米', value: '分钟/米' }
      ],
      // 关联矩阵选项（占位符，未来扩展）
      matrixOptions: [
        { label: '颜色切换矩阵', value: 'SM-SPEC-02' },
        { label: '尺寸切换矩阵', value: 'SM-SIZE-01' }
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
        if (newVal) {
          // 深度克隆以避免直接修改props，并确保嵌套对象存在
          const clonedStep = JSON.parse(JSON.stringify(newVal));
          this.formData = {
            ...clonedStep,
            flowLogic: clonedStep.flowLogic || { nextStep: 0, onSuccessStep: 0, onFailureStep: 0 },
            timeStandards: {
              setup: clonedStep.timeStandards?.setup || { type: 'Fixed', value: 0, unit: 'minute', matrixId: null },
              processing: clonedStep.timeStandards?.processing || { type: 'Fixed', value: 0, unit: '分钟/吨', formula: null }
            }
          };

          // 从 allSteps 中找到对应的 operation.type
          const correspondingStep = this.allSteps.find(step => step.stepId === this.formData.stepId);
          if (correspondingStep) {
            this.formData.operationType = correspondingStep.operationType; // 从路由步骤中获取工序类型
          }

          // 如果加工时间单位未设置，则默认为 '分钟/吨'
          if (!this.formData.timeStandards.processing.unit) {
            this.$set(this.formData.timeStandards.processing, 'unit', '分钟/吨');
          }
        } else {
          this.formData = null;
        }
      },
      immediate: true,
      deep: true
    },
    formData: {
        handler(newVal) {
            if (newVal && this.selectedStep) {
                // 确保只有在 formData 的内容真正改变时才发出 update-step 事件，避免不必要的更新循环
                // 这里需要更精确的比较，因为对象嵌套了，简单的 keys 比较可能不够
                const hasChanged = JSON.stringify(newVal) !== JSON.stringify(this.selectedStep);
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

  .form-group {
    margin-bottom: 20px;
    padding: 15px;
    border: 1px solid #EBEEF5;
    border-radius: 4px;
    .group-title {
      font-size: 14px;
      font-weight: 600;
      color: #606266;
      margin-bottom: 15px;
      padding-bottom: 5px;
      border-bottom: 1px dashed #EBEEF5;
    }
  }
}

::v-deep .el-form--label-top .el-form-item__label {
    padding-bottom: 2px;
    font-weight: 500;
}
</style> 