<template>
  <base-drawer
    :visible.sync="drawerVisible"
    :title="drawerTitle"
    width="90%"
    :wrapper-closable="false"
    @open="handleDrawerOpen"
    @close="handleDrawerClose"
  >
    <el-row :gutter="20" class="routing-form-container">
      <!-- Left Panel -->
      <el-col :span="18">
        <enhanced-form
          ref="routingForm"
          :data="formData"
          :rules="formRules"
          :mode="mode"
          label-width="110px"
          :show-footer="false"
          :clear-validate-on-data-update="true"
          :disable-initial-validation="true"
          :validate-on-data-change="false"
        >
          <template #default="{ form, mode: formMode }">
            <div class="form-section">
              <div class="section-title">一、路线基本信息</div>
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="路线代码" prop="code">
                    <el-input
                      v-model="form.code"
                      placeholder="请输入路线代码"
                      maxlength="30"
                      show-word-limit
                      :disabled="formMode !== 'create'"
                    />
                    <div class="field-hint">路线代码必须唯一，建议使用大写字母、数字和下划线</div>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="路线名称" prop="name">
                    <el-input
                      v-model="form.name"
                      placeholder="请输入路线名称"
                      maxlength="50"
                      show-word-limit
                      :disabled="formMode === 'view'"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="版本" prop="version">
                    <el-input v-model="form.version" disabled />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                
                
                <el-col :span="8">
                  <el-form-item label="路线类型" prop="type">
                    <el-select
                      v-model="form.type"
                      placeholder="请选择路线类型"
                      style="width: 100%"
                      :disabled="formMode === 'view'"
                    >
                      <el-option
                        v-for="item in routingTypeOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                   <el-form-item label="适用产品" prop="applicableProducts">
                     <el-select
                       v-model="form.applicableProducts"
                       multiple
                       filterable
                       default-first-option
                       collapse-tags
                       placeholder="请输入或选择适用的产品代码"
                       style="width: 100%;"
                       :disabled="formMode === 'view'"
                     >
                       <el-option
                         v-for="item in productOptions"
                         :key="item.id"
                         :label="item.code + (item.name ? ' ' + item.name : '')"
                         :value="item.code"
                       />
                     </el-select>
                   </el-form-item>
                 </el-col>
                 <el-col :span="8">
                  <el-form-item label="状态" prop="status">
                    <StatusTag
                      v-if="form.status"
                      :status="form.status"
                      :text-map="statusTextMap"
                      :type-map="statusTypeMap"
                    />
                    <span v-else>-</span>
                  </el-form-item>
                </el-col>
              </el-row>
           
            </div>
          </template>
        </enhanced-form>

        <div class="form-section">
          <routing-steps-editor
            ref="stepsEditor"
            :steps="formData.steps || []"
            :is-view-mode="mode === 'view'"
            @add-step="handleOpenOperationSelector"
            @select-step="handleSelectStep"
            @up="handleMoveStepUp"
            @down="handleMoveStepDown"
            @delete="handleDeleteStep"
          />
        </div>
      </el-col>

      <!-- Right Panel -->
      <el-col :span="6">
        <div class="form-section step-details-panel">
           <step-details-form
             :selected-step="selectedStep"
             :is-view-mode="mode === 'view'"
             :all-steps="formData.steps" 
             @update-step="handleUpdateStepDetails"
           />
        </div>
      </el-col>
    </el-row>
    
    <template #footer>
      <el-button @click="handleCancel">{{ mode === 'view' ? '关闭' : '取消' }}</el-button>
      <el-button v-if="mode !== 'view'" @click="handleReset">重置</el-button>
      <el-button
        v-if="mode === 'create'"
        type="primary"
        :loading="loading"
        @click="handleSubmitAndContinue"
      >
        保存并继续
      </el-button>
      <el-button
        v-if="mode !== 'view'"
        type="primary"
        :loading="loading"
        @click="handleSubmit"
      >
        {{ mode === 'create' ? '确认保存' : '保存修改' }}
      </el-button>
    </template>

    <operation-selector-modal
      :visible.sync="operationSelectorVisible"
      @confirm="handleAddOperations"
    />
  </base-drawer>
</template>

<script>
import BaseDrawer from '@/components/Drawer'
import EnhancedForm from '@/components/EnhancedForm'
import StatusTag from '@/components/StatusTag'
import RoutingStepsEditor from './RoutingStepsEditor.vue'
import StepDetailsForm from './StepDetailsForm.vue'
import OperationSelectorModal from './OperationSelectorModal.vue'
import { createRouting, updateRouting } from '../api'
import { ROUTING_TYPE_OPTIONS, ROUTING_STATUS_CONFIG } from '../constants'
import { cloneDeep } from '@/utils'
import { v4 as uuidv4 } from 'uuid' // 导入uuid v4方法并重命名为uuidv4
import { getAllProductList } from '@/api/master-data/product-management'

export default {
  name: 'RoutingFormDrawer',
  components: {
    BaseDrawer,
    EnhancedForm,
    StatusTag,
    RoutingStepsEditor,
    StepDetailsForm,
    OperationSelectorModal
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    mode: {
      type: String,
      default: 'create',
      validator: (val) => ['create', 'update', 'view'].includes(val)
    },
    routingData: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      loading: false,
      formData: {},
      formRules: {
        code: [
          { required: true, message: '路线代码不能为空', trigger: 'blur' },
          { pattern: /^[A-Z0-9_]+$/, message: '只能包含大写字母、数字和下划线', trigger: 'blur' }
        ],
        name: [{ required: true, message: '路线名称不能为空', trigger: 'blur' }],
        type: [{ required: true, message: '路线类型不能为空', trigger: 'change' }],
        applicableProducts: [{ type: 'array', required: true, message: '至少选择或输入一个适用产品', trigger: 'change' }]
      },
      operationSelectorVisible: false,
      selectedStep: null,
      productOptions: [] // 新增：产品下拉选项
    }
  },
  computed: {
    drawerVisible: {
      get() {
        return this.visible
      },
      set(val) {
        this.$emit('update:visible', val)
      }
    },
    drawerTitle() {
      const titleMap = {
        create: '新增工艺路线',
        update: '编辑工艺路线',
        view: '查看工艺路线'
      }
      return titleMap[this.mode]
    },
    routingTypeOptions() {
      return ROUTING_TYPE_OPTIONS
    },
    statusTextMap() {
      return ROUTING_STATUS_CONFIG.textMap
    },
    statusTypeMap() {
      return ROUTING_STATUS_CONFIG.typeMap
    }
  },
  methods: {
    async handleDrawerOpen() {
      // 每次打开弹窗都重置表单数据，自动清除校验提示（最佳实践）
      this.formData = this.initFormData(this.routingData)
      this.selectedStep = null
      // 加载产品选项
      try {
        const res = await getAllProductList()
        this.productOptions = (res.data && res.data.items) || []
      } catch (e) {
        this.productOptions = []
      }
    },
    handleDrawerClose() {
      // 关闭弹窗时重置表单数据，自动清除校验提示（最佳实践）
      this.formData = this.initFormData()
      this.$emit('close')
      this.selectedStep = null
    },
    initFormData(data) {
      if (this.mode === 'create') {
        return {
          code: '',
          name: '',
          version: '1.0',
          status: 'Draft',
          type: 'Standard',
          applicableProducts: [],
          steps: []
        }
      }
      // 确保现有数据也包含默认的 flowLogic 和 timeStandards
      const clonedData = data ? cloneDeep(data) : {};
      clonedData.steps = (clonedData.steps || []).map(step => ({
        ...step,
        flowLogic: step.flowLogic || { nextStep: 0, onSuccessStep: 0, onFailureStep: 0 },
        timeStandards: {
          setup: step.timeStandards?.setup || { type: 'Fixed', value: 0, unit: 'minute', matrixId: null },
          processing: step.timeStandards?.processing || { type: 'Fixed', value: 0, unit: '分钟/吨', formula: null }
        }
      }));
      return clonedData;
    },
    
    // --- Steps Management ---
    handleOpenOperationSelector() {
      this.operationSelectorVisible = true
    },
    
    handleAddOperations(selectedOperations) {
      if (!selectedOperations || selectedOperations.length === 0) {
        return;
      }

      let maxStepNumber = this.formData.steps.reduce((max, step) => Math.max(max, step.stepNumber), 0);
      const addedOperationsCount = selectedOperations.length;
      let actualAddedCount = 0;
      const duplicateOperations = []; // 步骤1: 初始化空数组用于收集重复工序

      selectedOperations.forEach(operation => {
        // 检查是否已存在相同的基础工序
        const isDuplicate = this.formData.steps.some(step => step.operationId === operation.id);

        if (isDuplicate) {
          // 步骤2: 不立即弹出警告，而是添加到重复工序数组
          duplicateOperations.push(operation);
        } else {
          maxStepNumber += 10; // 步骤号递增10
          const newStep = {
            stepId: uuidv4(), // 生成唯一UUID
            stepNumber: maxStepNumber,
            operationId: operation.id,
            operationCode: operation.code,
            operationName: operation.name,
            operationType: operation.type,
            flowLogic: { // 默认流程逻辑
              nextStep: null,
              onSuccessStep: null,
              onFailureStep: null
            },
            timeStandards: { // 默认时间标准
              setup: { type: 'Fixed', value: 0, unit: 'minute', matrixId: null },
              processing: { type: 'Fixed', value: 0, unit: '分钟/吨', formula: null }
            }
          };
          this.formData.steps.push(newStep);
          actualAddedCount++;
        }
      });

      // 步骤1: 删除所有原有的 this.$message.warning(), this.$message.success() 和 this.$message.info() 调用。
      // 原有警告消息处理代码已在上次修改中替换为收集duplicateOperations数组
      // 原有的成功和信息提示代码如下：
      // if (actualAddedCount > 0) {
      //   this.$message.success(`成功添加 ${actualAddedCount} 个工序步骤。`);
      // } else if (addedOperationsCount > 0 && actualAddedCount === 0) {
      //   this.$message.info(`没有新的工序步骤被添加。`);
      // }

      // 步骤2: 新增一个统一的消息生成和显示逻辑
      if (actualAddedCount > 0 && duplicateOperations.length > 0) {
        // 既有成功添加的，也有重复的
        const duplicateNames = duplicateOperations.map(op => `${op.name} (${op.code})`).join('、');
        const message = `成功添加 ${actualAddedCount} 个工序步骤，但以下工序已存在，无法重复添加：${duplicateNames}。`;
        this.$message.warning(message);
      } else if (actualAddedCount > 0 && duplicateOperations.length === 0) {
        // 只有成功添加的
        this.$message.success(`成功添加 ${actualAddedCount} 个工序步骤。`);
      } else if (actualAddedCount === 0 && duplicateOperations.length > 0) {
        // 没有成功添加，但有重复的 (所有选择的都是重复的)
        let warningMessage = '';
        if (duplicateOperations.length <= 3) {
          const duplicateNames = duplicateOperations.map(op => `${op.name} (${op.code})`).join('、');
          warningMessage = `以下工序已存在于当前工艺路线中，无法重复添加：${duplicateNames}。`;
        } else {
          warningMessage = `所有选择的工序（共 ${duplicateOperations.length} 项）均已存在于当前工艺路线中，无法重复添加。`;
        }
        this.$message.warning(warningMessage);
      } else if (actualAddedCount === 0 && duplicateOperations.length === 0 && addedOperationsCount > 0) {
        // 理论上不会出现，但作为兜底
         this.$message.info(`没有新的工序步骤被添加。`);
      }

      // 步骤3: 保持 selectedStep 更新和 setCurrentRow 的逻辑不变
      if (this.formData.steps.length > 0) {
        this.$nextTick(() => {
          this.selectedStep = this.formData.steps[0];
          if (this.$refs.stepsEditor) {
            this.$refs.stepsEditor.setCurrentRow(this.selectedStep);
          }
        });
      }
    },
    
    handleSelectStep(step) {
      this.selectedStep = step
    },
    
    handleMoveStepUp(index) {
      if (index === 0) return
      const temp = this.formData.steps[index]
      this.$set(this.formData.steps, index, this.formData.steps[index - 1])
      this.$set(this.formData.steps, index - 1, temp)
      this.recalculateStepNumbers()
      this.resetFlowLogicAndNotify() // 新增：重置流程逻辑并通知用户
    },
    
    handleMoveStepDown(index) {
      if (index === this.formData.steps.length - 1) return
      const temp = this.formData.steps[index]
      this.$set(this.formData.steps, index, this.formData.steps[index + 1])
      this.$set(this.formData.steps, index + 1, temp)
      this.recalculateStepNumbers()
      this.resetFlowLogicAndNotify() // 新增：重置流程逻辑并通知用户
    },
    
    handleDeleteStep(index) {
       this.$confirm('确定要删除这个工序步骤吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          const deletedStep = this.formData.steps[index]
          this.formData.steps.splice(index, 1)
          this.recalculateStepNumbers()
          this.resetFlowLogicAndNotify() // 新增：重置流程逻辑并通知用户
          if (this.selectedStep && this.selectedStep.stepId === deletedStep.stepId) {
            this.selectedStep = null
          }
           this.$message({
            type: 'success',
            message: '删除成功!'
          });
        }).catch(() => {});
    },
    
    recalculateStepNumbers() {
      this.formData.steps.forEach((step, index) => {
        step.stepNumber = (index + 1) * 10
      })
    },

    handleUpdateStepDetails(updatedStep) {
      const index = this.formData.steps.findIndex(s => s.stepId === updatedStep.stepId)
      if (index !== -1) {
        this.$set(this.formData.steps, index, updatedStep)
      }
    },
    // --- Form Submission ---
    async handleSubmit(andContinue = false) {
      try {
        await this.$refs.routingForm.validate()
        
        if (!this.formData.steps || this.formData.steps.length === 0) {
          this.$message.warning('请至少添加一个工序步骤')
          return
        }

        this.loading = true
        const apiCall = this.mode === 'create' ? createRouting : updateRouting
        const response = await apiCall(this.formData)
        
        this.$message.success(response.message || '操作成功')

        if (andContinue) {
          this.$emit('success', { continue: true })
          this.handleReset()
        } else {
          this.$emit('success')
          this.drawerVisible = false
        }
      } catch (error) {
        if (error && error.message) {
           console.error('API请求失败:', error)
        }
      } finally {
        this.loading = false
      }
    },
    handleSubmitAndContinue() {
      this.handleSubmit(true)
    },
    handleCancel() {
      this.drawerVisible = false
    },
    handleReset() {
      // 点击重置按钮时重置表单数据，自动清除校验提示（最佳实践）
      this.formData = this.initFormData()
      this.selectedStep = null
    },
    resetFlowLogicAndNotify() {
      // 重置所有步骤的流程逻辑
      this.formData.steps.forEach(step => {
        this.$set(step.flowLogic, 'nextStep', null);
        this.$set(step.flowLogic, 'onSuccessStep', null);
        this.$set(step.flowLogic, 'onFailureStep', null);
      });

      this.$alert('工序步骤的移动/删除操作已导致流程逻辑重置，请重新配置相关步骤的下一步设置。', '重要提示', {
        confirmButtonText: '确定',
        type: 'warning'
      });
    }
  }
}
</script>

<style lang="scss" scoped>
.routing-form-container {
  // height: calc(100vh - 150px); // Adjust based on your header/footer height
}

.form-section {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
  margin-bottom: 20px;
  &:last-child {
    margin-bottom: 0;
  }
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 20px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e4e7ed;
}

.step-details-panel {
  // height: 100%;
  // overflow-y: auto;
}

.field-hint {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
  line-height: 1.4;
}

::v-deep .el-form-item__label {
  font-weight: 500;
}
</style> 