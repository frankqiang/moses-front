/**
 * 铝箔产品表单抽屉组件
 * 功能描述：提供铝箔产品新增、编辑和查看功能的表单，使用BaseDrawer+EnhancedForm组合
 * 创建日期：2024-12-28
 */
<template>
  <base-drawer
    :visible.sync="drawerVisible"
    :title="drawerTitle"
    width="800px"
    :wrapper-closable="false"
    @open="handleDrawerOpen"
    @close="handleDrawerClose"
  >
    <!-- 表单内容 -->
    <enhanced-form
      ref="enhancedForm"
      :data="formData"
      :mode="innerMode"
      :rules="formRules"
      label-width="140px"
      :show-footer="false"
      :clear-validate-on-data-update="true"
      :disable-initial-validation="true"
      :validate-on-data-change="false"
      @submit="handleFormSubmit"
      @validate="handleCustomValidate"
      @validate-error="handleValidateError"
      @reset="handleFormReset"
    >
      <!-- 表单内容 -->
      <template v-slot="{ form, mode: formMode }">
        <!-- 一、基础信息 -->
        <div class="form-section">
          <div class="section-title">一、基础信息</div>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="产品编码" prop="code">
                <el-input
                  v-model="form.code"
                  placeholder="请输入产品编码"
                  maxlength="50"
                  show-word-limit
                  :disabled="formMode === 'view' || formMode === 'update'"
                  @blur="handleCodeBlur"
                />
                <div class="field-hint">产品编码创建后不可修改，建议使用规范命名</div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="产品名称" prop="name">
                <el-input
                  v-model="form.name"
                  placeholder="请输入产品名称"
                  maxlength="100"
                  show-word-limit
                  :disabled="formMode === 'view'"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="产品系列" prop="series">
                <el-select
                  v-model="form.series"
                  placeholder="请选择产品系列"
                  style="width: 100%"
                  :disabled="formMode === 'view'"
                  filterable
                  allow-create
                  default-first-option
                >
                  <el-option
                    v-for="option in productSeriesOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="生命周期状态" prop="lifecycleStatus">
                <el-select
                  v-model="form.lifecycleStatus"
                  placeholder="请选择生命周期状态"
                  style="width: 100%"
                  :disabled="formMode === 'view'"
                >
                  <el-option
                    v-for="option in lifecycleStatusOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 二、规格参数 -->
        <div class="form-section">
          <div class="section-title">二、规格参数</div>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="厚度 (μm)" prop="thickness">
                <el-input-number
                  v-model="form.thickness"
                  placeholder="请输入厚度"
                  :min="0.1"
                  :max="1000"
                  :precision="2"
                  :step="0.1"
                  controls-position="right"
                  style="width: 100%"
                  :disabled="formMode === 'view'"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="宽度 (mm)" prop="width">
                <el-input-number
                  v-model="form.width"
                  placeholder="请输入宽度"
                  :min="1"
                  :max="10000"
                  :precision="1"
                  :step="1"
                  controls-position="right"
                  style="width: 100%"
                  :disabled="formMode === 'view'"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="单位重量 (g/m²)" prop="unitWeight">
                <el-input-number
                  v-model="form.unitWeight"
                  placeholder="请输入单位重量"
                  :min="0.01"
                  :max="1000"
                  :precision="3"
                  :step="0.001"
                  controls-position="right"
                  style="width: 100%"
                  :disabled="formMode === 'view'"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 三、工艺配置 -->
        <div class="form-section">
          <div class="section-title">三、工艺配置</div>
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="工艺模板" prop="processTemplates">
                <el-select
                  v-model="form.processTemplates"
                  placeholder="请选择工艺模板"
                  style="width: 100%"
                  multiple
                  filterable
                  :disabled="formMode === 'view'"
                  collapse-tags
                  :collapse-tags-tooltip="true"
                >
                  <el-option
                    v-for="template in processTemplateOptions"
                    :key="template.value"
                    :label="template.label"
                    :value="template.value"
                  />
                </el-select>
                <div class="field-hint">可选择多个工艺模板，用于生产指导</div>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 四、质量标准 -->
        <div class="form-section">
          <div class="section-title">四、质量标准</div>
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="质量标准" prop="qualityStandards">
                <el-select
                  v-model="form.qualityStandards"
                  placeholder="请选择质量标准"
                  style="width: 100%"
                  multiple
                  filterable
                  :disabled="formMode === 'view'"
                  collapse-tags
                  :collapse-tags-tooltip="true"
                >
                  <el-option
                    v-for="standard in qualityStandardOptions"
                    :key="standard.value"
                    :label="standard.label"
                    :value="standard.value"
                  />
                </el-select>
                <div class="field-hint">选择适用的质量检验标准</div>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 五、备注信息 -->
        <div class="form-section">
          <div class="section-title">五、备注信息</div>
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="备注" prop="remarks">
                <el-input
                  v-model="form.remarks"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入备注信息（选填）"
                  maxlength="500"
                  show-word-limit
                  :disabled="formMode === 'view'"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </template>
    </enhanced-form>

    <!-- 抽屉底部按钮 -->
    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button
        v-if="innerMode !== 'view'"
        type="primary"
        :loading="submitLoading"
        @click="handleSubmit"
      >
        {{ innerMode === 'create' ? '创建' : '更新' }}
      </el-button>
    </template>
  </base-drawer>
</template>

<script>
import BaseDrawer from '@/components/Drawer'
import EnhancedForm from '@/components/EnhancedForm'
import {
  FORM_CONFIGS,
  PRODUCT_SERIES_OPTIONS,
  LIFECYCLE_STATUS_OPTIONS,
  PROCESS_TEMPLATE_OPTIONS,
  QUALITY_STANDARD_OPTIONS
} from '../constants'
import { createProduct, updateProduct, getProductDetail } from '../api'

export default {
  name: 'ProductFormDrawer',
  components: {
    BaseDrawer,
    EnhancedForm
  },
  model: {
    prop: 'visible',
    event: 'update:visible'
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    mode: {
      type: String,
      default: 'create',
      validator: (value) => ['create', 'update', 'view'].includes(value)
    },
    productId: {
      type: [String, Number],
      default: null
    }
  },
  data() {
    return {
      drawerVisible: false,
      innerMode: 'create',
      formData: {},
      submitLoading: false,
      productSeriesOptions: PRODUCT_SERIES_OPTIONS,
      lifecycleStatusOptions: LIFECYCLE_STATUS_OPTIONS,
      processTemplateOptions: PROCESS_TEMPLATE_OPTIONS,
      qualityStandardOptions: QUALITY_STANDARD_OPTIONS
    }
  },
  computed: {
    drawerTitle() {
      const titleMap = {
        create: '新增铝箔产品',
        update: '编辑铝箔产品',
        view: '查看铝箔产品'
      }
      return titleMap[this.innerMode] || '铝箔产品'
    },
    formRules() {
      return FORM_CONFIGS[this.innerMode] || FORM_CONFIGS.create
    }
  },
  watch: {
    visible: {
      handler(val) {
        this.drawerVisible = val
        if (val) {
          this.innerMode = this.mode
          this.initializeForm()
        }
      },
      immediate: true
    },
    drawerVisible(val) {
      this.$emit('update:visible', val)
    }
  },
  methods: {
    /**
     * 初始化表单数据
     */
    async initializeForm() {
      try {
        if (this.innerMode === 'create') {
          this.formData = this.getDefaultFormData()
        } else if (this.productId) {
          const response = await getProductDetail(this.productId)
          this.formData = this.transformApiDataToForm(response.data)
        }
      } catch (error) {
        console.error('初始化表单数据失败:', error)
        this.$message.error('获取产品详情失败')
        this.handleCancel()
      }
    },

    /**
     * 获取默认表单数据
     */
    getDefaultFormData() {
      return {
        code: '',
        name: '',
        series: '',
        lifecycleStatus: 'trial_production',
        thickness: null,
        width: null,
        unitWeight: null,
        processTemplates: [],
        qualityStandards: [],
        remarks: ''
      }
    },

    /**
     * 将API数据转换为表单数据
     */
    transformApiDataToForm(apiData) {
      return {
        code: apiData.code || '',
        name: apiData.name || '',
        series: apiData.series || '',
        lifecycleStatus: apiData.lifecycleStatus || 'trial_production',
        thickness: apiData.specifications?.thickness || null,
        width: apiData.specifications?.width || null,
        unitWeight: apiData.specifications?.unitWeight || null,
        processTemplates: apiData.processTemplates || [],
        qualityStandards: apiData.qualityStandards || [],
        remarks: apiData.remarks || ''
      }
    },

    /**
     * 将表单数据转换为API数据
     */
    transformFormDataToApi(formData) {
      return {
        code: formData.code,
        name: formData.name,
        series: formData.series,
        lifecycleStatus: formData.lifecycleStatus,
        specifications: {
          thickness: formData.thickness,
          width: formData.width,
          unitWeight: formData.unitWeight
        },
        processTemplates: formData.processTemplates,
        qualityStandards: formData.qualityStandards,
        remarks: formData.remarks
      }
    },

    /**
     * 产品编码失焦处理
     */
    handleCodeBlur() {
      // 可以在这里添加编码格式验证或重复性检查
      const code = this.formData.code
      if (code && !/^[A-Z][A-Z0-9_]*$/.test(code)) {
        this.$message.warning('建议产品编码使用大写字母开头，包含大写字母、数字和下划线')
      }
    },

    /**
     * 抽屉打开事件
     */
    handleDrawerOpen() {
      this.$emit('open')
    },

    /**
     * 抽屉关闭事件
     */
    handleDrawerClose() {
      this.formData = {}
      this.submitLoading = false
      this.$emit('close')
    },

    /**
     * 取消操作
     */
    handleCancel() {
      this.drawerVisible = false
    },

    /**
     * 提交表单
     */
    async handleSubmit() {
      try {
        const valid = await this.$refs.enhancedForm.validate()
        if (!valid) return

        await this.handleFormSubmit(this.formData)
      } catch (error) {
        console.error('表单提交失败:', error)
      }
    },

    /**
     * 表单提交处理
     */
    async handleFormSubmit(formData) {
      this.submitLoading = true
      try {
        const apiData = this.transformFormDataToApi(formData)
        let response

        if (this.innerMode === 'create') {
          response = await createProduct(apiData)
          this.$message.success(response.message || '创建产品成功')
          this.$emit('created', response.data)
        } else if (this.innerMode === 'update') {
          response = await updateProduct(this.productId, apiData)
          this.$message.success(response.message || '更新产品成功')
          this.$emit('updated', response.data)
        }

        this.drawerVisible = false
      } catch (error) {
        console.error('提交失败:', error)
        const errorMessage = error.response?.data?.error?.message || '操作失败'
        this.$message.error(errorMessage)
      } finally {
        this.submitLoading = false
      }
    },

    /**
     * 自定义验证处理
     */
    handleCustomValidate(isValid, invalidFields) {
      this.$emit('validate', isValid, invalidFields)
    },

    /**
     * 验证错误处理
     */
    handleValidateError(errors) {
      console.warn('表单验证错误:', errors)
    },

    /**
     * 表单重置处理
     */
    handleFormReset() {
      this.formData = this.getDefaultFormData()
      this.$emit('reset')
    }
  }
}
</script>

<style lang="scss" scoped>
.form-section {
  margin-bottom: 32px;

  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 2px solid #e4e7ed;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      bottom: -2px;
      width: 40px;
      height: 2px;
      background: #409eff;
    }
  }
}

.field-hint {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.4;
}

::v-deep .el-form-item {
  margin-bottom: 20px;
}

::v-deep .el-form-item__label {
  font-weight: 500;
  color: #606266;
}

::v-deep .el-input-number {
  .el-input__inner {
    text-align: left;
  }
}

::v-deep .el-select {
  .el-tag {
    margin-right: 6px;
    margin-bottom: 2px;
  }
}
</style>
