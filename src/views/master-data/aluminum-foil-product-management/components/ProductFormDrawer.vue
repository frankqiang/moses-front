/**
 * 文件名称：ProductFormDrawer.vue
 * 文件描述：铝箔产品管理模块表单抽屉，基于 BaseDrawer + EnhancedForm 实现新增/编辑/查看/复制
 * 创建日期：2025-09-27
 * 修改记录：
 *   - 2025-09-27: 首次创建，完成P0要求及P1第6/7/8/9项
 */

<template>
  <base-drawer
    :visible.sync="drawerVisible"
    :title="drawerTitle"
    width="720px"
    :wrapper-closable="false"
    @open="handleDrawerOpen"
    @close="handleDrawerClose"
  >
    <enhanced-form
      ref="enhancedForm"
      :data="formData"
      :mode="innerMode"
      :rules="formRules"
      label-width="130px"
      :show-footer="false"
      :clear-validate-on-data-update="true"
      :disable-initial-validation="true"
      :validate-on-data-change="false"
      :loading="loading"
      @submit="handleFormSubmit"
      @reset="handleFormReset"
      @validate-error="handleValidateError"
      @validate="handleCustomValidate"
    >
      <template v-slot="{ form, mode: formMode }">
        <section class="form-section">
          <header class="section-title">一、基础信息</header>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="产品编码" prop="productCode">
                <el-input
                  v-model="form.productCode"
                  placeholder="如：AF-1100-H18-0.006x1200"
                  maxlength="200"
                  clearable
                  :disabled="formMode === 'view' || formMode === 'update'"
                  @input="handleProductCodeInput"
                />
                <div class="field-hint">格式：AF-合金-硬度-厚度x宽度，自动转换为大写</div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="产品名称" prop="productName">
                <el-input
                  v-model="form.productName"
                  placeholder="请输入产品名称"
                  maxlength="200"
                  show-word-limit
                  clearable
                  :disabled="formMode === 'view'"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="原材料类型" prop="rawMaterialType">
                <el-input
                  v-model="form.rawMaterialType"
                  placeholder="请输入原材料类型"
                  maxlength="100"
                  clearable
                  :disabled="formMode === 'view'"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="合金牌号" prop="alloyGrade">
                <el-input
                  v-model="form.alloyGrade"
                  placeholder="请输入合金牌号，如1100"
                  maxlength="50"
                  clearable
                  :disabled="formMode === 'view'"
                  @input="handleAlloyGradeInput"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="状态/硬度" prop="temper">
                <el-input
                  v-model="form.temper"
                  placeholder="请输入状态/硬度，如H18"
                  maxlength="50"
                  clearable
                  :disabled="formMode === 'view'"
                  @input="handleTemperInput"
                />
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
                    v-for="option in lifecycleOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </section>

        <section class="form-section">
          <header class="section-title">二、规格参数</header>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="厚度 (mm)" prop="thickness">
                <div class="number-field">
                  <el-input-number
                    v-model="form.thickness"
                    :min="thicknessLimits.MIN"
                    :max="thicknessLimits.MAX"
                    :precision="thicknessLimits.PRECISION"
                    :step="thicknessLimits.STEP"
                    :controls="false"
                    :disabled="formMode === 'view'"
                    placeholder="请输入厚度"
                  />
                  <span class="unit-label">mm</span>
                  <div class="quick-actions">
                    <span class="quick-actions__label">常用：</span>
                    <el-button
                      v-for="value in thicknessPresets"
                      :key="`thickness-${value}`"
                      type="text"
                      size="mini"
                      :disabled="formMode === 'view'"
                      @click="() => handleSetNumericValue('thickness', value)"
                    >{{ value }}</el-button>
                  </div>
                </div>
                <div class="field-hint">范围：{{ thicknessLimits.MIN }} - {{ thicknessLimits.MAX }}，支持6位小数</div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="宽度 (mm)" prop="width">
                <div class="number-field">
                  <el-input-number
                    v-model="form.width"
                    :min="widthLimits.MIN"
                    :max="widthLimits.MAX"
                    :precision="widthLimits.PRECISION"
                    :step="widthLimits.STEP"
                    :controls="false"
                    :disabled="formMode === 'view'"
                    placeholder="请输入宽度"
                  />
                  <span class="unit-label">mm</span>
                  <div class="quick-actions">
                    <span class="quick-actions__label">快速：</span>
                    <el-button
                      v-for="value in widthPresets"
                      :key="`width-${value}`"
                      type="text"
                      size="mini"
                      :disabled="formMode === 'view'"
                      @click="() => handleSetNumericValue('width', value)"
                    >{{ value }}</el-button>
                  </div>
                </div>
                <div class="field-hint">范围：{{ widthLimits.MIN }} - {{ widthLimits.MAX }}，支持3位小数</div>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="单位重量 (kg)" prop="unitWeight">
                <div class="number-field">
                  <el-input-number
                    v-model="form.unitWeight"
                    :min="unitWeightLimits.MIN"
                    :max="unitWeightLimits.MAX"
                    :precision="unitWeightLimits.PRECISION"
                    :step="unitWeightLimits.STEP"
                    :controls="false"
                    :disabled="formMode === 'view'"
                    placeholder="请输入单位重量"
                  />
                  <span class="unit-label">kg</span>
                  <div class="quick-actions">
                    <span class="quick-actions__label">常规：</span>
                    <el-button
                      v-for="value in unitWeightPresets"
                      :key="`weight-${value}`"
                      type="text"
                      size="mini"
                      :disabled="formMode === 'view'"
                      @click="() => handleSetNumericValue('unitWeight', value)"
                    >{{ value }}</el-button>
                  </div>
                </div>
                <div class="field-hint">范围：{{ unitWeightLimits.MIN }} - {{ unitWeightLimits.MAX }}，支持6位小数</div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="单位重量类型" prop="unitWeightType">
                <el-select
                  v-model="form.unitWeightType"
                  placeholder="请选择单位重量类型"
                  style="width: 100%"
                  :disabled="formMode === 'view'"
                >
                  <el-option
                    v-for="option in unitWeightTypeOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </section>

        <section class="form-section">
          <header class="section-title">三、关联配置</header>
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="关联工艺模板" prop="processTemplateIds">
                <el-select
                  ref="processTemplateSelect"
                  v-model="form.processTemplateIds"
                  multiple
                  filterable
                  remote
                  collapse-tags
                  reserve-keyword
                  :disabled="formMode === 'view'"
                  :loading="processTemplateLoading"
                  placeholder="请选择工艺模板"
                  style="width: 100%"
                  clearable
                  :remote-method="handleProcessTemplateSearch"
                  @visible-change="handleProcessTemplateVisibleChange"
                  @clear="resetProcessTemplateSelection"
                >
                  <el-option
                    v-for="option in processTemplateOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>
                <div class="field-hint">支持关键词搜索，滚动到底自动加载更多</div>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="质量标准" prop="qualityStandardId">
                <el-select
                  ref="qualityStandardSelect"
                  v-model="form.qualityStandardId"
                  filterable
                  remote
                  reserve-keyword
                  :disabled="formMode === 'view'"
                  :loading="qualityStandardLoading"
                  placeholder="请选择质量标准"
                  style="width: 100%"
                  clearable
                  :remote-method="handleQualityStandardSearch"
                  @visible-change="handleQualityStandardVisibleChange"
                >
                  <el-option
                    v-for="option in qualityStandardOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>
                <div class="field-hint">必须选择一个生效的质量标准，支持搜索与分页</div>
              </el-form-item>
            </el-col>
          </el-row>
        </section>

        <section class="form-section">
          <header class="section-title">四、附加信息</header>
          <el-row>
            <el-col :span="24">
              <el-form-item label="产品描述" prop="description">
                <el-input
                  v-model="form.description"
                  type="textarea"
                  :rows="4"
                  maxlength="500"
                  show-word-limit
                  clearable
                  :disabled="formMode === 'view'"
                  placeholder="请输入产品描述"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </section>
      </template>
    </enhanced-form>

    <template #footer>
      <el-button @click="handleCancel">{{ innerMode === 'view' ? '关闭' : '取消' }}</el-button>
      <el-button v-if="innerMode !== 'view'" @click="handleReset">重置</el-button>
      <el-button
        v-if="innerMode === 'create'"
        type="primary"
        :loading="loading"
        @click="submitAndContinue"
      >保存并继续</el-button>
      <el-button
        v-if="innerMode !== 'view'"
        type="primary"
        :loading="loading"
        @click="submitForm"
      >{{ confirmButtonText }}</el-button>
    </template>
  </base-drawer>
</template>

<script>
import BaseDrawer from '@/components/Drawer'
import EnhancedForm from '@/components/EnhancedForm'
import { debounce, cloneDeep } from '@/utils'
import isEqual from 'lodash/isEqual'
import {
  createFoilProduct,
  updateFoilProduct,
  getFoilProductDetail
} from '../api'
import {
  FORM_CONFIG,
  FORM_DEFAULTS,
  LIFECYCLE_STATUS_OPTIONS,
  UNIT_WEIGHT_TYPE_OPTIONS,
  THICKNESS_LIMITS,
  WIDTH_LIMITS,
  UNIT_WEIGHT_LIMITS,
  DEFAULT_MESSAGES
} from '../constants'
import { MESSAGE_KEYS } from '../constants/messages-config'
import { formatQueryParams } from '@/utils'
import { getProcessTemplateList, getQualityStandardList } from '@/api/master-data/product-management'

const THICKNESS_PRESETS = Object.freeze([0.004, 0.005, 0.006, 0.0075, 0.009])
const WIDTH_PRESETS = Object.freeze([900, 1000, 1200, 1300, 1500])
const UNIT_WEIGHT_PRESETS = Object.freeze([18.5, 19, 19.5, 20, 21])

const PAGINATION_DEFAULT = () => ({
  page: 1,
  totalPages: 1,
  hasNextPage: false,
  keyword: '',
  loadingMore: false
})

export default {
  name: 'ProductFormDrawer',
  components: {
    BaseDrawer,
    EnhancedForm
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    mode: {
      type: String,
      default: 'create',
      validator: (value) => ['create', 'update', 'view', 'copy'].includes(value)
    },
    productId: {
      type: String,
      default: ''
    },
    productData: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      drawerVisible: false,
      formData: cloneDeep(FORM_DEFAULTS),
      originData: cloneDeep(FORM_DEFAULTS),
      loading: false,
      isDirty: false,
      processTemplateLoading: false,
      qualityStandardLoading: false,
      processTemplateOptions: [],
      qualityStandardOptions: [],
      paginationState: {
        processTemplate: PAGINATION_DEFAULT(),
        qualityStandard: PAGINATION_DEFAULT()
      },
      dropdownScrollHandlers: {
        processTemplate: null,
        qualityStandard: null
      }
    }
  },
  computed: {
    innerMode() {
      return this.mode
    },
    drawerTitle() {
      const map = {
        create: '新增铝箔产品',
        update: '编辑铝箔产品',
        view: '查看铝箔产品',
        copy: '复制新增铝箔产品'
      }
      return map[this.innerMode] || map.create
    },
    confirmButtonText() {
      if (this.innerMode === 'create') return '确认保存'
      if (this.innerMode === 'copy') return '复制创建'
      if (this.innerMode === 'update') return '保存修改'
      return '确认'
    },
    lifecycleOptions() {
      return LIFECYCLE_STATUS_OPTIONS
    },
    unitWeightTypeOptions() {
      return UNIT_WEIGHT_TYPE_OPTIONS
    },
    thicknessPresets() {
      return THICKNESS_PRESETS
    },
    widthPresets() {
      return WIDTH_PRESETS
    },
    unitWeightPresets() {
      return UNIT_WEIGHT_PRESETS
    },
    thicknessLimits() {
      return THICKNESS_LIMITS
    },
    widthLimits() {
      return WIDTH_LIMITS
    },
    unitWeightLimits() {
      return UNIT_WEIGHT_LIMITS
    },
    formRules() {
      const rules = {}
      FORM_CONFIG.forEach((item) => {
        if (item.rules) {
          rules[item.prop] = item.rules
        }
      })
      return rules
    }
  },
  watch: {
    visible: {
      immediate: true,
      handler(val) {
        this.drawerVisible = val
      }
    },
    drawerVisible(val) {
      this.$emit('update:visible', val)
    },
    mode: {
      immediate: true,
      handler(newMode) {
        if (newMode === 'copy') {
          this.applyCopyDefaults()
        }
      }
    },
    productData: {
      immediate: true,
      deep: true,
      handler(newData) {
        if (!this.drawerVisible && newData && (this.mode === 'update' || this.mode === 'view' || this.mode === 'copy')) {
          this.formData = this.mapDetailToForm(newData)
          this.originData = cloneDeep(this.formData)
        }
      }
    }
  },
  created() {
    this.debouncedProcessTemplateSearch = debounce((keyword) => {
      this.loadProcessTemplateOptions(keyword, false)
    }, 300)
    this.debouncedQualityStandardSearch = debounce((keyword) => {
      this.loadQualityStandardOptions(keyword, false)
    }, 300)
  },
  beforeDestroy() {
    this.detachDropdownScroll('processTemplate')
    this.detachDropdownScroll('qualityStandard')
  },
  methods: {
    handleFormChange(form) {
      this.formData = form
      this.isDirty = !isEqual(form, this.originData)
    },
    async handleDrawerOpen() {
      try {
        await this.initializeFormData()
        await Promise.all([
          this.loadProcessTemplateOptions('', false),
          this.loadQualityStandardOptions('', false)
        ])
        this.originData = cloneDeep(this.formData)
        this.isDirty = false
      } catch (error) {
        console.error('表单初始化失败', error)
        this.$message.error(this.extractErrorMessage(error, '表单初始化失败'))
        this.drawerVisible = false
      }
    },
    handleDrawerClose() {
      this.resetState()
      this.$emit('close')
    },
    handleCancel() {
      if (this.innerMode !== 'view' && this.isDirty) {
        this.$confirm('存在未保存的修改，确认要关闭吗？', '提示', {
          type: 'warning'
        }).then(() => {
          this.drawerVisible = false
        }).catch(() => {})
      } else {
        this.drawerVisible = false
      }
    },
    submitForm() {
      if (this.innerMode === 'view') {
        this.drawerVisible = false
        return
      }
      this.$refs.enhancedForm.handleSubmitClick()
    },
    submitAndContinue() {
      if (this.innerMode !== 'create') return
      this.$refs.enhancedForm.handleContinueClick()
    },
    handleReset() {
      if (this.innerMode === 'view') {
        this.drawerVisible = false
        return
      }
      this.$confirm('确定要重置表单吗？', '重置确认', {
        type: 'warning'
      }).then(() => {
        this.handleFormReset()
        this.$message.success('表单已重置')
      }).catch(() => {})
    },
    handleFormReset() {
      this.formData = cloneDeep(this.originData)
      this.isDirty = false
    },
    handleValidateError(invalidFields) {
      const firstField = Object.keys(invalidFields)[0]
      if (firstField && invalidFields[firstField] && invalidFields[firstField][0]) {
        this.$message.error(invalidFields[firstField][0].message)
      }
    },
    handleCustomValidate(_, callback) {
      callback(true)
    },
    async handleFormSubmit(form, continueEdit) {
      const payload = this.buildSubmitPayload(form)
      try {
        this.loading = true
        let response
        if (this.innerMode === 'create' || this.innerMode === 'copy') {
          response = await createFoilProduct(payload)
        } else if (this.innerMode === 'update') {
          response = await updateFoilProduct(this.formData.id || this.productId, payload)
        }
        const key = this.innerMode === 'update' ? MESSAGE_KEYS.updateSuccess : MESSAGE_KEYS.createSuccess
        const successMessage = response?.message || DEFAULT_MESSAGES[key]
        this.$message.success(successMessage)
        this.$emit('success', { mode: this.innerMode, data: response?.data || payload, continueEdit })
        if (continueEdit && this.innerMode === 'create') {
          this.formData = cloneDeep(FORM_DEFAULTS)
          this.originData = cloneDeep(FORM_DEFAULTS)
          this.isDirty = false
          this.$nextTick(() => {
            this.$refs.enhancedForm?.resetFields?.()
          })
        } else {
          this.drawerVisible = false
        }
      } catch (error) {
        console.error('保存铝箔产品失败', error)
        this.$message.error(this.extractErrorMessage(error, '保存失败'))
      } finally {
        this.loading = false
      }
    },
    async initializeFormData() {
      if (this.innerMode === 'create') {
        this.formData = cloneDeep(FORM_DEFAULTS)
        return
      }
      let source = this.productData
      if (!source && this.productId) {
        const response = await getFoilProductDetail(this.productId)
        source = response.data
      }
      if (!source) {
        throw new Error('产品数据不存在')
      }
      const mapped = this.mapDetailToForm(source)
      if (this.innerMode === 'copy') {
        mapped.productCode = `${mapped.productCode || ''}-COPY`
        mapped.productName = `${mapped.productName || ''}（副本）`
        mapped.lifecycleStatus = LIFECYCLE_STATUS_OPTIONS[0]?.value || mapped.lifecycleStatus
      }
      this.formData = mapped
    },
    mapDetailToForm(detail) {
      const form = cloneDeep(FORM_DEFAULTS)
      Object.keys(form).forEach((key) => {
        const value = detail[key]
        if (value !== undefined && value !== null) {
          form[key] = Array.isArray(value) ? cloneDeep(value) : value
        }
      })
      if (!Array.isArray(form.processTemplateIds)) {
        form.processTemplateIds = []
      }
      return form
    },
    resetState() {
      this.formData = cloneDeep(FORM_DEFAULTS)
      this.originData = cloneDeep(FORM_DEFAULTS)
      this.isDirty = false
      this.processTemplateOptions = []
      this.qualityStandardOptions = []
      this.paginationState = {
        processTemplate: PAGINATION_DEFAULT(),
        qualityStandard: PAGINATION_DEFAULT()
      }
      this.detachDropdownScroll('processTemplate')
      this.detachDropdownScroll('qualityStandard')
      this.$refs.enhancedForm?.resetFields?.()
    },
    handleProductCodeInput(value) {
      this.formData.productCode = value ? value.toUpperCase().trim() : value
    },
    handleAlloyGradeInput(value) {
      this.formData.alloyGrade = value ? value.toUpperCase().trim() : value
    },
    handleTemperInput(value) {
      this.formData.temper = value ? value.toUpperCase().trim() : value
    },
    handleSetNumericValue(field, value) {
      if (this.innerMode === 'view') return
      const formatted = Number(value)
      if (!Number.isNaN(formatted)) {
        this.$set(this.formData, field, formatted)
      }
    },
    buildSubmitPayload(form) {
      const payload = cloneDeep(form)
      payload.productCode = payload.productCode?.toUpperCase().trim()
      payload.alloyGrade = payload.alloyGrade?.toUpperCase().trim()
      payload.temper = payload.temper?.toUpperCase().trim()
      payload.thickness = payload.thickness !== null ? Number(payload.thickness) : null
      payload.width = payload.width !== null ? Number(payload.width) : null
      payload.unitWeight = payload.unitWeight !== null ? Number(payload.unitWeight) : null
      payload.processTemplateIds = Array.isArray(payload.processTemplateIds) ? payload.processTemplateIds : []
      payload.qualityStandardId = payload.qualityStandardId || ''
      return payload
    },
    extractErrorMessage(error, defaultMessage) {
      if (!error?.response) {
        return error?.message || defaultMessage
      }
      const response = error.response.data || {}
      if (response.error?.message) return response.error.message
      if (response.message) return response.message
      return defaultMessage
    },
    applyCopyDefaults() {
      if (this.mode !== 'copy' || !this.productData) return
      const copyData = this.mapDetailToForm(this.productData)
      copyData.productCode = `${copyData.productCode || ''}-COPY`
      copyData.productName = `${copyData.productName || ''}（副本）`
      copyData.lifecycleStatus = LIFECYCLE_STATUS_OPTIONS[0]?.value || copyData.lifecycleStatus
      this.formData = copyData
      this.originData = cloneDeep(copyData)
    },
    async loadProcessTemplateOptions(keyword = '', append = false) {
      const pagination = this.paginationState.processTemplate
      if (this.processTemplateLoading) return
      if (append) {
        if (!pagination.hasNextPage) return
        pagination.page += 1
      } else {
        pagination.page = 1
        pagination.keyword = keyword
        pagination.hasNextPage = false
      }
      this.processTemplateLoading = true
      try {
        const params = formatQueryParams({
          search: pagination.keyword,
          status: 'active',
          limit: 20,
          page: pagination.page
        })
        const response = await getProcessTemplateList(params)
        const data = response?.data || {}
        const items = data.results || data.items || []
        const mapped = items.map((item) => ({
          value: item.id || item.templateId,
          label: item.name || item.templateName || item.code || ''
        })).filter((item) => item.value)
        if (append) {
          const existingMap = new Map(this.processTemplateOptions.map((item) => [item.value, item]))
          mapped.forEach((item) => existingMap.set(item.value, item))
          this.processTemplateOptions = Array.from(existingMap.values())
        } else {
          this.processTemplateOptions = mapped
        }
        const totalPages = data.totalPages ?? data.meta?.totalPages ?? pagination.totalPages
        pagination.totalPages = totalPages || pagination.page
        const hasNext = data.hasNextPage ?? (pagination.page < pagination.totalPages)
        pagination.hasNextPage = Boolean(hasNext)
      } catch (error) {
        console.error('加载工艺模板失败', error)
        this.$message.warning(this.extractErrorMessage(error, '加载工艺模板失败'))
      } finally {
        this.processTemplateLoading = false
      }
    },
    async loadQualityStandardOptions(keyword = '', append = false) {
      const pagination = this.paginationState.qualityStandard
      if (this.qualityStandardLoading) return
      if (append) {
        if (!pagination.hasNextPage) return
        pagination.page += 1
      } else {
        pagination.page = 1
        pagination.keyword = keyword
        pagination.hasNextPage = false
      }
      this.qualityStandardLoading = true
      try {
        const params = formatQueryParams({
          search: pagination.keyword,
          status: 'active',
          limit: 20,
          page: pagination.page
        })
        const response = await getQualityStandardList(params)
        const data = response?.data || {}
        const items = data.results || data.items || []
        const mapped = items.map((item) => ({
          value: item.id || item.standardId,
          label: item.name || item.standardName || ''
        })).filter((item) => item.value)
        if (append) {
          const existingMap = new Map(this.qualityStandardOptions.map((item) => [item.value, item]))
          mapped.forEach((item) => existingMap.set(item.value, item))
          this.qualityStandardOptions = Array.from(existingMap.values())
        } else {
          this.qualityStandardOptions = mapped
        }
        const totalPages = data.totalPages ?? data.meta?.totalPages ?? pagination.totalPages
        pagination.totalPages = totalPages || pagination.page
        const hasNext = data.hasNextPage ?? (pagination.page < pagination.totalPages)
        pagination.hasNextPage = Boolean(hasNext)
      } catch (error) {
        console.error('加载质量标准失败', error)
        this.$message.warning(this.extractErrorMessage(error, '加载质量标准失败'))
      } finally {
        this.qualityStandardLoading = false
      }
    },
    handleProcessTemplateSearch(keyword) {
      this.debouncedProcessTemplateSearch(keyword || '')
    },
    handleQualityStandardSearch(keyword) {
      this.debouncedQualityStandardSearch(keyword || '')
    },
    handleProcessTemplateVisibleChange(visible) {
      if (visible) {
        this.attachDropdownScroll('processTemplate')
        if (!this.processTemplateOptions.length) {
          this.loadProcessTemplateOptions('', false)
        }
      } else {
        this.detachDropdownScroll('processTemplate')
      }
    },
    handleQualityStandardVisibleChange(visible) {
      if (visible) {
        this.attachDropdownScroll('qualityStandard')
        if (!this.qualityStandardOptions.length) {
          this.loadQualityStandardOptions('', false)
        }
      } else {
        this.detachDropdownScroll('qualityStandard')
      }
    },
    attachDropdownScroll(type) {
      this.$nextTick(() => {
        const refName = type === 'processTemplate' ? 'processTemplateSelect' : 'qualityStandardSelect'
        const select = this.$refs[refName]
        if (!select || !select.$refs || !select.$refs.popper) return
        const dropdown = select.$refs.popper.$el.querySelector('.el-select-dropdown__wrap')
        if (!dropdown) return
        const handler = () => {
          const pagination = this.paginationState[type]
          if (this.loading || !pagination.hasNextPage) return
          const nearBottom = dropdown.scrollTop + dropdown.clientHeight >= dropdown.scrollHeight - 10
          if (nearBottom) {
            if (type === 'processTemplate') {
              this.loadProcessTemplateOptions(pagination.keyword, true)
            } else {
              this.loadQualityStandardOptions(pagination.keyword, true)
            }
          }
        }
        dropdown.addEventListener('scroll', handler)
        this.dropdownScrollHandlers[type] = { dropdown, handler }
      })
    },
    detachDropdownScroll(type) {
      const record = this.dropdownScrollHandlers[type]
      if (record && record.dropdown && record.handler) {
        record.dropdown.removeEventListener('scroll', record.handler)
      }
      this.dropdownScrollHandlers[type] = null
    },
    resetProcessTemplateSelection() {
      if (!Array.isArray(this.formData.processTemplateIds)) {
        this.$set(this.formData, 'processTemplateIds', [])
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.form-section {
  margin-bottom: 28px;

  &:last-of-type {
    margin-bottom: 0;
  }
}

.section-title {
  position: relative;
  margin-bottom: 16px;
  padding-left: 12px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;

  &::before {
    position: absolute;
    left: 0;
    top: 4px;
    width: 4px;
    height: 16px;
    background-color: #409eff;
    border-radius: 2px;
    content: '';
  }
}

.field-hint {
  margin-top: 6px;
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}

.number-field {
  display: flex;
  align-items: center;
  gap: 8px;

  .el-input-number {
    flex: 1;
  }
}

.unit-label {
  color: #606266;
  font-size: 12px;
  min-width: 24px;
}

.quick-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;

  &__label {
    color: #909399;
    font-size: 12px;
    margin-right: 4px;
  }

  .el-button {
    padding: 0 6px;
    font-size: 12px;
  }
}

:deep(.el-select) {
  width: 100%;
}

:deep(.el-form-item.is-required > .el-form-item__label::before) {
  margin-right: 4px;
}

:deep(.el-select-dropdown__wrap) {
  max-height: 244px;
}
</style>

