<template>
  <base-drawer
    :visible.sync="drawerVisible"
    :title="drawerTitle"
    width="100%"
    :wrapper-closable="false"
    @open="handleDrawerOpen"
    @close="handleDrawerClose"
  >
    <el-row :gutter="20" class="routing-form-container">
      <!-- Left Panel -->
      <el-col :span="18">
        <!-- 
          启用sync-changes确保基础表单数据与步骤编辑操作保持同步
          解决在添加、移动、删除工序步骤时基础信息被意外清空的问题
          @since 2024-12-19 - 修复数据一致性bug
        -->
        <enhanced-form
          ref="routingForm"
          :data.sync="formData"
          :rules="formRules"
          :mode="mode"
          label-width="110px"
          :show-footer="false"
          :clear-validate-on-data-update="true"
          :disable-initial-validation="true"
          :validate-on-data-change="false"
          :sync-changes="true"
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
                      @blur="debouncedHandleCodeBlur"
                    />
                    <i v-if="checkingCode" class="el-icon-loading input-suffix"></i>
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
                      @change="handleTypeChange"
                    >
                      <el-option
                        v-for="item in routingTypeOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      />
                    </el-select>
                    <div class="field-hint">{{ getTypeDescription(form.type) }}</div>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                   <el-form-item label="适用产品" prop="applicableProducts">
                     <el-select
                       v-model="form.applicableProducts"
                       multiple
                       filterable
                       remote
                       reserve-keyword
                       collapse-tags
                       placeholder="请输入产品代码或名称进行搜索"
                       style="width: 100%;"
                       :disabled="formMode === 'view'"
                       :remote-method="debouncedRemoteSearchProducts"
                       :loading="productLoading"
                       no-data-text="请输入关键词搜索产品"
                       loading-text="搜索中..."
                     >
                       <el-option
                         v-for="item in productOptions"
                         :key="item.id"
                         :label="item.code + (item.name ? ' ' + item.name : '') + (item.lifecycleStatus === 'discontinued' ? ' (已停产)' : '')"
                         :value="item.code"
                         :disabled="item.lifecycleStatus === 'discontinued'"
                         :class="{ 'discontinued-product': item.lifecycleStatus === 'discontinued' }"
                       />
                     </el-select>
                     <div class="field-hint">输入产品代码或名称进行搜索，支持模糊匹配</div>
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
        @click="handleSubmit(true)"
      >
        保存并继续
      </el-button>
      <el-button
        v-if="mode !== 'view'"
        type="primary"
        :loading="loading"
        @click="handleSubmit(false)"
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
import { createRouting, updateRouting, checkRoutingCodeUnique } from '../api'
import { ROUTING_TYPE_OPTIONS, ROUTING_STATUS_CONFIG, getRoutingTypeRule } from '../constants'
import { cloneDeep, debounce } from '@/utils' // 导入 debounce
import { v4 as uuidv4 } from 'uuid'
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
      previousType: null, // 用于跟踪之前的路线类型
      formRules: {
        code: [
          { required: true, message: '路线代码不能为空', trigger: [] },
          { pattern: /^[A-Z0-9_]+$/, message: '只能包含大写字母、数字和下划线', trigger: [] },
          {
            validator: this.validateRoutingCodeUnique,
            message: '', // 显式设置为空字符串，避免EnhancedForm的默认消息覆盖
            trigger: []
          }
        ],
        name: [{ required: true, message: '路线名称不能为空', trigger: 'blur' }],
        type: [{ required: true, message: '路线类型不能为空', trigger: 'change' }],
        applicableProducts: [{ type: 'array', required: true, message: '至少选择或输入一个适用产品', trigger: 'change' }]
      },
      operationSelectorVisible: false,
      selectedStep: null,
      productOptions: [],
      productLoading: false, // 产品搜索加载状态
      checkingCode: false // 用于控制路线代码输入框的加载状态
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
  created() {
    this.debouncedHandleCodeBlur = debounce(this.handleCodeBlur, 500); // 500ms 防抖
    this.debouncedRemoteSearchProducts = debounce(this.remoteSearchProducts, 300); // 300ms 防抖搜索
  },
  watch: {
    'formData.type': {
      handler(newType, oldType) {
        if (oldType && newType !== oldType) {
          this.previousType = oldType
        }
      },
      immediate: false
    }
  },
  methods: {
    async handleDrawerOpen() {
      // 每次打开弹窗都重置表单数据，自动清除校验提示（最佳实践）
      this.formData = this.initFormData(this.routingData)
      this.previousType = this.formData.type // 初始化previousType
      this.selectedStep = null
      // 重置产品选项，使用远程搜索模式
      this.productOptions = []
      this.productLoading = false
      
      // 如果是编辑模式且已有选中的产品，需要加载这些产品的详细信息
      if (this.mode !== 'create' && this.formData.applicableProducts && this.formData.applicableProducts.length > 0) {
        await this.loadSelectedProducts()
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
      this.confirmFlowLogicReset('移动工序步骤', () => {
        const temp = this.formData.steps[index]
        this.$set(this.formData.steps, index, this.formData.steps[index - 1])
        this.$set(this.formData.steps, index - 1, temp)
        this.recalculateStepNumbers()
        this.resetFlowLogic() // 重置流程逻辑但不显示提示
      })
    },
    
    handleMoveStepDown(index) {
      if (index === this.formData.steps.length - 1) return
      this.confirmFlowLogicReset('移动工序步骤', () => {
        const temp = this.formData.steps[index]
        this.$set(this.formData.steps, index, this.formData.steps[index + 1])
        this.$set(this.formData.steps, index + 1, temp)
        this.recalculateStepNumbers()
        this.resetFlowLogic() // 重置流程逻辑但不显示提示
      })
    },
    
    handleDeleteStep(index) {
      this.confirmFlowLogicReset('删除工序步骤', () => {
        const deletedStep = this.formData.steps[index]
        this.formData.steps.splice(index, 1)
        this.recalculateStepNumbers()
        this.resetFlowLogic() // 重置流程逻辑但不显示提示
        if (this.selectedStep && this.selectedStep.stepId === deletedStep.stepId) {
          this.selectedStep = null
        }
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
      })
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
        if (!this.formData.applicableProducts || this.formData.applicableProducts.length === 0) {
          return
        }
    
        // 验证路线类型特定规则
        try {
          this.validateTypeSpecificRules()
        } catch (validationError) {
          this.$message.warning(validationError.message)
          return
        }
    
        // 校验所选产品的有效性
        if (this.formData.applicableProducts && this.formData.applicableProducts.length > 0) {
          const validationResult = await this.validateSelectedProducts()
          if (!validationResult.isValid) {
            this.$message.error(validationResult.message)
            return
          }
        }
    
        this.loading = true
        const apiCall = this.mode === 'create' ? createRouting : updateRouting
        const response = await apiCall(this.formData)
        
        this.$message.success(response.message || '操作成功')
        
        this.$emit('success', { mode: this.mode, data: this.formData, continueEdit: andContinue })
        
        if (andContinue) {
          // 保存并继续 - 重置表单但不关闭抽屉
          this.handleReset()
        } else {
          // 普通保存 - 关闭抽屉
          this.drawerVisible = false
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || '操作失败，请稍后重试';
        this.$message.error(errorMessage);
        return; // 确保API失败时不继续执行
      } finally {
        this.loading = false;
      }
    },
    handleCancel() {
      this.drawerVisible = false
    },
    handleReset() {
      // 点击重置按钮时重置表单数据，自动清除校验提示（最佳实践）
      this.formData = this.initFormData()
      this.selectedStep = null
    },
    /**
     * 确认流程逻辑重置操作
     * @param {string} operation - 操作类型（如：移动工序步骤、删除工序步骤）
     * @param {Function} callback - 确认后执行的回调函数
     */
    confirmFlowLogicReset(operation, callback) {
      this.$confirm(
        `${operation}将会重置所有步骤的流程逻辑配置，需要重新设置相关步骤的下一步。确定要继续吗？`,
        '重要提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        callback()
      }).catch(() => {
        // 用户取消操作，不执行任何操作
      })
    },

    /**
     * 重置流程逻辑（不显示提示）
     */
    resetFlowLogic() {
      // 重置所有步骤的流程逻辑
      this.formData.steps.forEach(step => {
        this.$set(step.flowLogic, 'nextStep', null)
        this.$set(step.flowLogic, 'onSuccessStep', null)
        this.$set(step.flowLogic, 'onFailureStep', null)
      })
    },

    /**
     * 重置流程逻辑并显示提示（保留原方法以兼容其他可能的调用）
     */
    resetFlowLogicAndNotify() {
      this.resetFlowLogic()
      this.$alert('工序步骤的移动/删除操作已导致流程逻辑重置，请重新配置相关步骤的下一步设置。', '重要提示', {
        confirmButtonText: '确定',
        type: 'warning'
      })
    },
    
    /**
     * 远程搜索产品
     * @param {string} query - 搜索关键词
     */
    async remoteSearchProducts(query) {
      if (query && query.trim() !== '') {
        this.productLoading = true
        try {
          const res = await getAllProductList({
            search: query.trim(),
            limit: 50 // 限制返回数量，提升性能
          })
          this.productOptions = (res.data && res.data.items) || []
        } catch (error) {
          console.error('搜索产品失败:', error)
          this.productOptions = []
          this.$message.error('搜索产品失败，请重试')
        } finally {
          this.productLoading = false
        }
      } else {
        this.productOptions = []
      }
    },
    
    /**
     * 加载已选中的产品详细信息（用于编辑模式）
     * 检查产品状态，识别无效产品并给出提示
     */
    async loadSelectedProducts() {
      if (!this.formData.applicableProducts || this.formData.applicableProducts.length === 0) {
        return
      }
      
      this.productLoading = true
      try {
        // 加载所有已选产品（包括无效的），用于状态检查
        const searchQuery = this.formData.applicableProducts.join(',')
        const res = await getAllProductList({ 
          search: searchQuery, 
          limit: 100,
          includeInactive: true // 包含无效产品以便检查状态
        })
        
        const allProducts = res.data?.items || []
        const validProducts = []
        const invalidProducts = []
        const missingProducts = []
        
        // 分类产品状态
        this.formData.applicableProducts.forEach(code => {
          const product = allProducts.find(p => p.code === code)
          if (product) {
            if (product.lifecycleStatus === 'discontinued') {
              invalidProducts.push(product)
            } else {
              validProducts.push(product)
            }
          } else {
            missingProducts.push(code)
          }
        })
        
        // 设置产品选项（包含所有产品用于显示）
        this.productOptions = allProducts
        
        // 提示用户无效或缺失的产品
        if (invalidProducts.length > 0) {
          const invalidNames = invalidProducts.map(p => `${p.code}(${p.name})`).join('、')
          this.$message.warning(`以下产品已停产，建议移除：${invalidNames}`)
        }
        
        if (missingProducts.length > 0) {
          const missingNames = missingProducts.join('、')
          this.$message.error(`以下产品代码不存在：${missingNames}`)
        }
        
      } catch (error) {
        console.error('加载已选产品失败:', error)
        this.productOptions = []
      } finally {
        this.productLoading = false
      }
    },

    /**
     * 校验所选产品的有效性
     * @returns {Object} 校验结果 { isValid: boolean, message: string }
     */
    async validateSelectedProducts() {
      try {
        const searchQuery = this.formData.applicableProducts.join(',')
        const res = await getAllProductList({ 
          search: searchQuery, 
          limit: 100,
          includeInactive: true
        })
        
        const allProducts = res.data?.items || []
        const invalidProducts = []
        const missingProducts = []
        
        this.formData.applicableProducts.forEach(code => {
          const product = allProducts.find(p => p.code === code)
          if (product) {
            if (product.lifecycleStatus === 'discontinued') {
              invalidProducts.push(product)
            }
          } else {
            missingProducts.push(code)
          }
        })
        
        if (missingProducts.length > 0) {
          return {
            isValid: false,
            message: `以下产品代码不存在：${missingProducts.join('、')}`
          }
        }
        
        if (invalidProducts.length > 0) {
          const invalidNames = invalidProducts.map(p => `${p.code}(${p.name})`).join('、')
          return {
            isValid: false,
            message: `以下产品已停产，无法保存：${invalidNames}`
          }
        }
        
        return { isValid: true, message: '' }
        
      } catch (error) {
        console.error('校验产品有效性失败:', error)
        return {
          isValid: false,
          message: '校验产品有效性失败，请重试'
        }
      }
    },
    async handleCodeBlur() {
      if (this.mode === 'create') { // 仅在创建模式下进行唯一性校验
        this.$refs.routingForm.$refs.form.validateField('code'); // 触发表单项的校验
      }
    },

    async validateRoutingCodeUnique(rule, value, callback) {
      if (!value) {
        this.checkingCode = false; // 如果值为空，也需要重置加载状态
        return callback(); // 如果为空，由required规则处理
      }
      if (this.mode !== 'create') {
        this.checkingCode = false; // 非创建模式，重置加载状态
        return callback(); // 非创建模式不进行唯一性校验
      }

      this.checkingCode = true; // 开始校验，显示加载状态
      try {
        const res = await checkRoutingCodeUnique(value);
        if (!res.data.unique) {
          // 从 API 响应中获取错误信息，如果没有则使用默认信息
          const errorMessage = res.message || res.data?.message || '该路线代码已被使用';
          callback(new Error(errorMessage));
        } else {
          callback();
        }
      } catch (error) {
        // API 校验失败（例如网络错误），从 API 响应中获取错误信息
        console.error('路线代码唯一性校验失败:', error);
        const errorMessage = error.response?.data?.message || error.message || '路线代码校验失败，请稍后重试';
        callback(new Error(errorMessage));
      } finally {
        this.checkingCode = false; // 校验结束，隐藏加载状态
      }
    },

    // --- 路线类型变更处理 ---
    handleTypeChange(newType) {
      if (!this.previousType || newType === this.previousType) {
        return
      }

      // 检查是否有已填写的数据
      if (this.hasFormData()) {
        this.$confirm(
          `切换到"${getRoutingTypeRule(newType).name}"将重置当前表单数据和工序步骤，是否继续？`,
          '确认切换路线类型',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        ).then(() => {
          this.resetFormForType(newType)
          this.$message.success(`已切换到${getRoutingTypeRule(newType).name}`)
        }).catch(() => {
          // 恢复原类型
          this.$nextTick(() => {
            this.formData.type = this.previousType
          })
        })
      } else {
        // 没有数据时直接切换
        this.resetFormForType(newType)
      }
    },

    // 检查是否有已填写的表单数据
    hasFormData() {
      return (
        this.formData.code ||
        this.formData.name ||
        (this.formData.applicableProducts && this.formData.applicableProducts.length > 0) ||
        (this.formData.steps && this.formData.steps.length > 0)
      )
    },

    // 为新类型重置表单
    resetFormForType(newType) {
      const typeRule = getRoutingTypeRule(newType)
      this.formData = {
        ...this.initFormData(),
        type: newType
      }
      this.previousType = newType
      this.selectedStep = null
      
      // 清除表单验证
      this.$nextTick(() => {
        if (this.$refs.routingForm && this.$refs.routingForm.$refs.form) {
          this.$refs.routingForm.$refs.form.clearValidate()
        }
      })
    },

    // 获取路线类型描述
    getTypeDescription(type) {
      if (!type) return ''
      const typeRule = getRoutingTypeRule(type)
      return typeRule.description
    },

    // 验证路线类型特定规则
    validateTypeSpecificRules() {
      const typeRule = getRoutingTypeRule(this.formData.type)
      const steps = this.formData.steps || []
      
      // 检查最小步骤数
      if (steps.length < typeRule.stepConstraints.minSteps) {
        throw new Error(`${typeRule.name}至少需要${typeRule.stepConstraints.minSteps}个工序步骤`)
      }
      
      // 检查最大步骤数
      if (typeRule.stepConstraints.maxSteps && steps.length > typeRule.stepConstraints.maxSteps) {
        throw new Error(`${typeRule.name}最多允许${typeRule.stepConstraints.maxSteps}个工序步骤`)
      }
      
      // 检查必需的工序类型
      if (typeRule.stepConstraints.requiredOperationTypes.length > 0) {
        const stepOperationTypes = steps.map(step => step.operationType)
        const missingTypes = typeRule.stepConstraints.requiredOperationTypes.filter(
          type => !stepOperationTypes.includes(type)
        )
        if (missingTypes.length > 0) {
          throw new Error(`${typeRule.name}必须包含以下工序类型：${missingTypes.join('、')}`)
        }
      }
      
      // 检查返工路线的特殊规则
      if (this.formData.type === 'Rework' && typeRule.validationRules.firstStepMustBeInspection) {
        if (steps.length > 0 && steps[0].operationType !== 'Inspection') {
          throw new Error('返工路线的第一个工序必须是检验工序')
        }
      }
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

.input-suffix {
  position: absolute;
  right: 10px; /* Adjust as needed for alignment */
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
}

/* 已停产产品样式 */
::v-deep .discontinued-product {
  color: #909399 !important;
  background-color: #f5f7fa !important;
}

::v-deep .discontinued-product:hover {
  background-color: #e9ecef !important;
}
</style>