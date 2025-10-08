<template>
  <Drawer
    :visible.sync="visibleProxy"
    :title="drawerTitle"
    :width="drawerWidth"
    :loading="loading || submitting"
    :wrapper-closable="false"
    class="template-form-drawer"
    @close="handleDrawerClose"
    @cancel="handleCancel"
  >
    <template #error>
      <el-alert
        v-if="errorMessage"
        type="error"
        show-icon
        :closable="false"
        :title="errorMessage"
      />
    </template>

    <div v-if="visibleProxy" class="template-form-drawer__content">
      <el-tabs v-model="activeTab" type="border-card" class="template-form-drawer__tabs">
        <!-- 步骤1：模板基础信息 -->
        <el-tab-pane label="步骤1：基础信息" name="basic">
          <el-form
            ref="basicForm"
            class="template-form-drawer__form"
            :model="formModel.basic"
            :rules="basicFormRules"
            label-width="160px"
            size="small"
            :disabled="formMode === 'view'"
          >
            <section class="form-section">
              <header class="form-section__header">
                <h3 class="form-section__title">模板基础信息</h3>
                <span v-if="formMode !== 'view'" class="form-section__badge">必填</span>
              </header>
              <el-row :gutter="24">
                <el-col
                  v-for="field in baseFields"
                  :key="field.prop"
                  :span="getFieldSpan(field)"
                >
                  <el-form-item :label="field.label" :prop="field.prop">
                    <component
                      :is="resolveFieldComponent(field)"
                      v-model="formModel.basic[field.prop]"
                      v-bind="buildFieldProps(field, formMode)"
                    />
                    <small v-if="field.hint" class="field-hint">{{ field.hint }}</small>
                  </el-form-item>
                </el-col>
              </el-row>
            </section>

            <section class="form-section">
              <header class="form-section__header">
                <h3 class="form-section__title">适用范围</h3>
                <span class="form-section__badge form-section__badge--optional">选填</span>
              </header>
              <el-row :gutter="24">
                <el-col
                  v-for="field in scopeFields"
                  :key="field.prop"
                  :span="getFieldSpan(field)"
                >
                  <el-form-item
                    :label="field.label"
                    :prop="field.prop"
                    :class="{ 'form-item--full-width': field.prop === 'applicableProductIds' }"
                  >
                    <!-- 适用产品字段使用 el-select 并渲染 el-option -->
                    <template v-if="field.prop === 'applicableProductIds'">
                      <el-select
                        v-model="formModel.basic[field.prop]"
                        v-bind="buildFieldProps(field, formMode)"
                        class="full-width-select"
                        value-key="id"
                        multiple
                        filterable
                        remote
                        :remote-method="handleProductSearch"
                        reserve-keyword
                        collapse-tags
                        collapse-tags-tooltip
                        popper-class="template-form-drawer__product-popper"
                      >
                        <el-option
                          v-for="product in productOptions"
                          :key="product.id"
                          :label="`${product.productCode} - ${product.productName}`"
                          :value="product.id"
                        >
                          <div class="product-option">
                            <div class="product-code">{{ product.productCode }}</div>
                            <div class="product-name">{{ product.productName }}</div>
                          </div>
                        </el-option>
                      </el-select>
                    </template>
                    <!-- 其他字段使用动态组件 -->
                    <component
                      :is="resolveFieldComponent(field)"
                      v-else
                      v-model="formModel.basic[field.prop]"
                      v-bind="buildFieldProps(field, formMode)"
                    />
                    <small v-if="field.hint" class="field-hint">{{ field.hint }}</small>
                  </el-form-item>
                </el-col>
              </el-row>
            </section>

            <section class="form-section">
              <header class="form-section__header">
                <h3 class="form-section__title">版本信息</h3>
                <span v-if="formMode !== 'view'" class="form-section__badge">必填</span>
              </header>
              <el-row :gutter="24">
                <el-col
                  v-for="field in versionFields"
                  :key="field.prop"
                  :span="getFieldSpan(field)"
                >
                  <el-form-item :label="field.label" :prop="field.prop">
                    <component
                      :is="resolveFieldComponent(field)"
                      v-model="formModel.basic[field.prop]"
                      v-bind="buildFieldProps(field, formMode)"
                    />
                    <small v-if="field.hint" class="field-hint">{{ field.hint }}</small>
                  </el-form-item>
                </el-col>
              </el-row>
            </section>
          </el-form>
        </el-tab-pane>

        <!-- 步骤2：温度曲线段配置 -->
        <el-tab-pane label="步骤2：温度曲线段" name="segments">
          <div class="tab-pane-content">
            <SegmentEditor
              v-if="activeTab === 'segments'"
              ref="segmentEditor"
              v-model="formModel.segments"
              :disabled="formMode === 'view'"
            />
          </div>
        </el-tab-pane>

        <!-- 步骤3：保护气氛参数 -->
        <el-tab-pane label="步骤3：保护气氛" name="atmosphere">
          <div class="tab-pane-content">
            <AtmosphereEditor
              v-if="activeTab === 'atmosphere'"
              ref="atmosphereEditor"
              v-model="formModel.atmosphereSettings"
              :disabled="formMode === 'view'"
            />
          </div>
        </el-tab-pane>

        <!-- 步骤4：循环风机参数 -->
        <el-tab-pane label="步骤4：循环风机" name="fan">
          <div class="tab-pane-content">
            <FanEditor
              v-if="activeTab === 'fan'"
              ref="fanEditor"
              v-model="formModel.fanSettings"
              :segment-orders="segmentOrders"
              :disabled="formMode === 'view'"
            />
          </div>
        </el-tab-pane>
      </el-tabs>

      <!-- 底部提示 -->
      <div v-if="formMode !== 'view'" class="template-form-drawer__hint">
        <el-alert
          type="info"
          :closable="false"
          show-icon
        >
          <div slot="title">
            <strong>配置提示：</strong>请依次完成四个步骤的配置。温度段、保护气氛、风机参数均至少需要配置 1 条记录。
          </div>
        </el-alert>
      </div>
    </div>

    <template #footer>
      <div>
        <el-button :disabled="submitting" @click="handleCancel">
          {{ formMode === 'view' ? '关闭' : '取消' }}
        </el-button>
        <el-button
          v-if="formMode !== 'view' && activeTab !== 'basic'"
          :disabled="submitting"
          @click="handlePrevStep"
        >
          上一步
        </el-button>
        <el-button
          v-if="formMode !== 'view' && activeTab !== 'fan'"
          type="primary"
          :disabled="submitting"
          @click="handleNextStep"
        >
          下一步
        </el-button>
        <el-button
          v-if="formMode !== 'view' && activeTab === 'fan'"
          type="primary"
          :loading="submitting"
          @click="handleSubmit"
        >
          {{ submitButtonText }}
        </el-button>
      </div>
    </template>
  </Drawer>
</template>

<script>
import Drawer from '@/components/Drawer'
import SegmentEditor from './SegmentEditor.vue'
import AtmosphereEditor from './AtmosphereEditor.vue'
import FanEditor from './FanEditor.vue'
import TemplateNumberRange from './TemplateNumberRange.vue'
import { cloneDeep } from 'lodash'
import {
  TEMPLATE_FORM_FIELDS
} from '../constants/template-form-config'
import { TEMPLATE_STATUS } from '../constants/process-parameter-management'
import { MESSAGE_FALLBACKS } from '../constants/messages-config'
import {
  fetchProductOptions,
  createProcessTemplate,
  getProcessTemplateDetail,
  updateProcessTemplateVersion
} from '../api'

const NUMBER_RANGE_COMPONENT = 'template-number-range'

export default {
  name: 'TemplateFormDrawer',
  components: {
    Drawer,
    SegmentEditor,
    AtmosphereEditor,
    FanEditor,
    TemplateNumberRange
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    mode: {
      type: String,
      default: 'create',
      validator: value => ['create', 'update', 'view'].includes(value)
    },
    templateId: {
      type: String,
      default: ''
    },
    versionId: {
      type: String,
      default: ''
    },
    initialData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    // 初始化默认的基础信息模型
    const defaultBasic = {}
    TEMPLATE_FORM_FIELDS.forEach(field => {
      if (Object.prototype.hasOwnProperty.call(field, 'defaultValue')) {
        defaultBasic[field.prop] = field.defaultValue
      } else {
        defaultBasic[field.prop] = field.type === 'remote-select' ? [] : ''
      }
    })
    defaultBasic.status = TEMPLATE_STATUS.DRAFT

    return {
      visibleProxy: false,
      formMode: 'create',
      activeTab: 'basic',
      loading: false,
      submitting: false,
      errorMessage: '',
      drawerWidth: '1200px',
      formModel: {
        basic: defaultBasic,
        segments: [],
        atmosphereSettings: [],
        fanSettings: []
      },
      productOptions: [],
      productKeyword: '',
      productPagination: {
        page: 1,
        limit: 30,
        totalPages: 1
      },
      availableVersions: []
    }
  },
  computed: {
    drawerTitle() {
      const titles = {
        create: '新建工艺模板',
        update: '编辑工艺模板',
        view: '查看工艺模板'
      }
      return titles[this.formMode] || '工艺模板'
    },
    submitButtonText() {
      return this.formMode === 'create' ? '创建模板' : '保存修改'
    },
    basicFormRules() {
      return TEMPLATE_FORM_FIELDS.reduce((rules, field) => {
        if (field.rules) {
          rules[field.prop] = field.rules
        }
        return rules
      }, {})
    },
    baseFields() {
      return TEMPLATE_FORM_FIELDS.filter(field =>
        ['templateCode', 'templateName', 'description'].includes(field.prop)
      )
    },
    scopeFields() {
      return TEMPLATE_FORM_FIELDS.filter(field =>
        ['applicableProductIds', 'applicableAlloyGrades', 'applicableThicknessRange', 'applicableWidthRange'].includes(field.prop)
      )
    },
    versionFields() {
      return TEMPLATE_FORM_FIELDS.filter(field =>
        ['versionNumber', 'versionDescription'].includes(field.prop)
      )
    },
    segmentOrders() {
      return this.formModel.segments.map(seg => seg.segmentOrder)
    }
  },
  watch: {
    visible: {
      immediate: true,
      handler(val) {
        this.visibleProxy = val
        if (val) {
          this.initialize()
        }
      }
    },
    // 同步来自父组件的 visible 变化，避免初始化时机错过
    formMode(val) {
      // no-op 仅确保响应式
    },
    initialData: {
      handler(val) {
        if (val && Object.keys(val).length) {
          this.parseInitialData(val)
        }
      },
      deep: false
    },
    visibleProxy(val) {
      this.$emit('update:visible', val)
      if (!val) {
        this.resetState()
      }
    },
    mode: {
      immediate: true,
      handler(val) {
        this.formMode = val
      }
    }
  },
  methods: {
    async initialize() {
      this.errorMessage = ''
      this.loading = true
      this.activeTab = 'basic'
      try {
        await this.prepareFormModel()
        // 二次兜底：initialData 异步注入的场景
        if (!this.formModel || !this.formModel.basic || !this.formModel.basic.templateCode) {
          if (Object.keys(this.initialData || {}).length) {
            this.parseInitialData(this.initialData)
          }
        }
        await this.fetchInitialProductOptions()
      } catch (error) {
        console.error('[TemplateFormDrawer] initialize failed', error)
        this.errorMessage = error?.message || '加载工艺模板数据失败，请稍后重试'
      } finally {
        this.loading = false
      }
    },
    async prepareFormModel() {
      if (this.formMode === 'create') {
        this.formModel = this.buildDefaultModel()
        return
      }

      // 优先使用父组件传入的 initialData（避免重复请求）
      if (Object.keys(this.initialData || {}).length) {
        this.parseInitialData(this.initialData)
        return
      }

      if ((this.formMode === 'update' || this.formMode === 'view') && this.templateId) {
        await this.loadTemplateDetail()
        return
      }

      this.formModel = this.buildDefaultModel()
    },
    buildDefaultModel() {
      const basicModel = {}
      TEMPLATE_FORM_FIELDS.forEach(field => {
        if (Object.prototype.hasOwnProperty.call(field, 'defaultValue')) {
          basicModel[field.prop] = cloneDeep(field.defaultValue)
        } else {
          basicModel[field.prop] = field.type === 'remote-select' ? [] : ''
        }
      })
      basicModel.status = TEMPLATE_STATUS.DRAFT

      return {
        basic: basicModel,
        segments: [],
        atmosphereSettings: [],
        fanSettings: []
      }
    },
    async loadTemplateDetail() {
      const { data } = await getProcessTemplateDetail(this.templateId)
      const latestVersion = data.latestVersion || {}

      const basicModel = {}
      TEMPLATE_FORM_FIELDS.forEach(field => {
        basicModel[field.prop] = field.type === 'remote-select' ? [] : ''
      })

      basicModel.templateCode = data.templateCode
      basicModel.templateName = data.templateName
      basicModel.description = data.description || ''
      basicModel.status = data.status || TEMPLATE_STATUS.DRAFT
      basicModel.applicableProductIds = data.applicableProductIds || (data.applicableProducts || []).map(item => item.id)
      basicModel.applicableAlloyGrades = data.applicableAlloyGrades || ''
      basicModel.applicableThicknessRange = data.applicableThicknessRange || ''
      basicModel.applicableWidthRange = data.applicableWidthRange || ''
      basicModel.versionNumber = latestVersion.versionNumber || ''
      basicModel.versionDescription = latestVersion.versionDescription || ''

      this.formModel = {
        basic: basicModel,
        segments: latestVersion.segments || [],
        atmosphereSettings: latestVersion.atmosphereSettings || [],
        fanSettings: latestVersion.fanSettings || []
      }

      this.productOptions = (data.applicableProducts || []).map(product => ({
        id: product.id,
        productCode: product.productCode,
        productName: product.productName,
        lifecycleStatus: product.lifecycleStatus
      }))
      this.availableVersions = data.versions || []
    },
    parseInitialData(data) {
      // data 为模板详情的完整数据结构
      const latestVersion = data.latestVersion || {}

      const basicModel = {}
      TEMPLATE_FORM_FIELDS.forEach(field => {
        if (field.type === 'remote-select') {
          basicModel[field.prop] = []
        } else {
          basicModel[field.prop] = ''
        }
      })

      basicModel.templateCode = data.templateCode || ''
      basicModel.templateName = data.templateName || ''
      basicModel.description = data.description || ''
      basicModel.status = data.status || TEMPLATE_STATUS.DRAFT
      // 优先使用后端直接提供的 applicableProductIds
      basicModel.applicableProductIds = data.applicableProductIds || (data.applicableProducts || []).map(item => item.id)
      basicModel.applicableAlloyGrades = data.applicableAlloyGrades || ''
      basicModel.applicableThicknessRange = data.applicableThicknessRange || ''
      basicModel.applicableWidthRange = data.applicableWidthRange || ''
      basicModel.versionNumber = latestVersion.versionNumber || ''
      basicModel.versionDescription = latestVersion.versionDescription || ''

      this.formModel = {
        basic: basicModel,
        segments: latestVersion.segments || [],
        atmosphereSettings: latestVersion.atmosphereSettings || [],
        fanSettings: latestVersion.fanSettings || []
      }

      // 初始化产品下拉选项与版本列表，便于显示
      this.productOptions = (data.applicableProducts || []).map(product => ({
        id: product.id,
        productCode: product.productCode,
        productName: product.productName,
        lifecycleStatus: product.lifecycleStatus
      }))
      this.availableVersions = data.versions || []
    },
    async fetchInitialProductOptions() {
      try {
        const response = await fetchProductOptions({ limit: this.productPagination.limit })
        this.productOptions = response.data.options || []
        this.productPagination.totalPages = response.data.pagination.totalPages
      } catch (error) {
        console.warn('[TemplateFormDrawer] fetch products failed', error)
        if (!this.productOptions.length) {
          this.$message.warning('适用产品选项加载失败，可稍后再试')
        }
      }
    },
    async handleProductSearch(keyword = '') {
      this.productKeyword = keyword
      this.productPagination.page = 1
      try {
        const response = await fetchProductOptions({ keyword, limit: this.productPagination.limit })
        this.productOptions = response.data.options
        this.productPagination.totalPages = response.data.pagination.totalPages
      } catch (error) {
        console.error('[TemplateFormDrawer] product search failed', error)
        this.$message.error(error?.message || '搜索产品失败，请稍后重试')
      }
    },
    async handleProductLoadMore() {
      if (this.productPagination.page >= this.productPagination.totalPages) {
        return
      }
      const nextPage = this.productPagination.page + 1
      try {
        const response = await fetchProductOptions({
          keyword: this.productKeyword,
          page: nextPage,
          limit: this.productPagination.limit
        })
        const exists = new Set(this.productOptions.map(item => item.id))
        response.data.options.forEach(option => {
          if (!exists.has(option.id)) {
            this.productOptions.push(option)
          }
        })
        this.productPagination.page = nextPage
        this.productPagination.totalPages = response.data.pagination.totalPages
      } catch (error) {
        console.error('[TemplateFormDrawer] load more products failed', error)
      }
    },
    resolveFieldComponent(field) {
      const typeMap = {
        input: 'el-input',
        textarea: 'el-input',
        select: 'el-select',
        'remote-select': 'el-select',
        'input-number': 'el-input-number',
        'number-range': NUMBER_RANGE_COMPONENT
      }
      return typeMap[field.type] || 'el-input'
    },
    buildFieldProps(field, mode) {
      const disabled = (field.disabledOnEdit && mode === 'update') || mode === 'view' || this.submitting
      const common = {
        placeholder: field.placeholder,
        clearable: field.clearable !== false,
        disabled
      }

      if (field.type === 'textarea') {
        return {
          ...common,
          type: 'textarea',
          rows: field.rows || 3,
          maxlength: field.maxLength || field.maxlength
        }
      }

      if (field.type === 'input') {
        const props = {
          ...common,
          maxlength: field.maxLength || field.maxlength
        }
        if (field.formatter) {
          props.formatter = value => field.formatter(value)
        }
        return props
      }

      if (field.type === 'select') {
        return {
          ...common,
          options: field.options || this.getDynamicOptions(field.prop),
          filterable: true
        }
      }

      if (field.type === 'remote-select') {
        return {
          ...common,
          valueKey: 'id',
          multiple: true,
          filterable: true,
          remote: true,
          remoteMethod: this.handleProductSearch,
          reserveKeyword: true,
          collapseTags: true,
          collapseTagsTooltip: true,
          options: this.productOptions,
          popperClass: 'template-form-drawer__product-popper'
        }
      }

      if (field.type === 'input-number') {
        return {
          ...common,
          min: field.min,
          max: field.max,
          precision: field.precision,
          step: field.step || 1
        }
      }

      if (field.type === 'number-range') {
        return {
          ...common,
          min: field.min,
          max: field.max,
          precision: field.precision
        }
      }

      return common
    },
    getDynamicOptions(prop) {
      if (prop === 'copyFromVersionId' && Array.isArray(this.availableVersions) && this.availableVersions.length) {
        return this.availableVersions.map(item => ({
          label: `${item.versionNumber || '-'}（${item.status || '未知'}）`,
          value: item.id
        }))
      }
      return []
    },
    getFieldSpan(field) {
      if (field.colSpan) return field.colSpan
      // 描述类字段全宽
      if (['description', 'versionDescription'].includes(field.prop)) {
        return 24
      }
      // 适用范围字段统一全宽，确保对齐
      if (['applicableProductIds', 'applicableAlloyGrades', 'applicableThicknessRange', 'applicableWidthRange'].includes(field.prop)) {
        return 24
      }
      return 12
    },
    handlePrevStep() {
      const tabs = ['basic', 'segments', 'atmosphere', 'fan']
      const currentIndex = tabs.indexOf(this.activeTab)
      if (currentIndex > 0) {
        this.activeTab = tabs[currentIndex - 1]
      }
    },
    async handleNextStep() {
      // 验证当前步骤
      const valid = await this.validateCurrentStep()
      if (!valid) {
        return
      }

      const tabs = ['basic', 'segments', 'atmosphere', 'fan']
      const currentIndex = tabs.indexOf(this.activeTab)
      if (currentIndex < tabs.length - 1) {
        this.activeTab = tabs[currentIndex + 1]
      }
    },
    validateCurrentStep() {
      return new Promise((resolve) => {
        if (this.activeTab === 'basic') {
          // 验证基础信息表单
          if (this.$refs.basicForm) {
            this.$refs.basicForm.validate((valid) => {
              if (!valid) {
                this.$message.warning('请完善基础信息必填项')
                resolve(false)
              } else {
                resolve(true)
              }
            })
          } else {
            resolve(true)
          }
        } else if (this.activeTab === 'segments') {
          // 等待下一个tick确保组件已渲染
          this.$nextTick(() => {
            if (this.$refs.segmentEditor && !this.$refs.segmentEditor.validate()) {
              this.$message.warning('温度段配置有误，请检查')
              resolve(false)
            } else {
              resolve(true)
            }
          })
        } else if (this.activeTab === 'atmosphere') {
          this.$nextTick(() => {
            if (this.$refs.atmosphereEditor && !this.$refs.atmosphereEditor.validate()) {
              this.$message.warning('保护气氛配置有误，请检查')
              resolve(false)
            } else {
              resolve(true)
            }
          })
        } else if (this.activeTab === 'fan') {
          this.$nextTick(() => {
            if (this.$refs.fanEditor && !this.$refs.fanEditor.validate()) {
              this.$message.warning('风机参数配置有误，请检查')
              resolve(false)
            } else {
              resolve(true)
            }
          })
        } else {
          resolve(true)
        }
      })
    },
    transformPayload(formData) {
      const payload = { ...formData.basic }

      // 移除不需要的字段（创建和更新时都需要移除）
      delete payload.status

      // 更新模式下，不允许修改 templateCode 和 versionNumber
      if (this.formMode === 'update') {
        delete payload.templateCode
        delete payload.versionNumber
      }

      // 处理适用产品 - 接口要求: string[] (UUID列表)
      if (Array.isArray(payload.applicableProductIds)) {
        payload.applicableProductIds = payload.applicableProductIds.filter(Boolean)
      } else {
        payload.applicableProductIds = []
      }

      // 处理合金牌号 - 接口要求: string[] (每项最大50字符)
      if (payload.applicableAlloyGrades) {
        if (typeof payload.applicableAlloyGrades === 'string') {
          // 如果是字符串，按逗号分割转为数组
          const grades = payload.applicableAlloyGrades
            .split(',')
            .map(item => item.trim())
            .filter(Boolean)
          payload.applicableAlloyGrades = grades.length > 0 ? grades : undefined
        } else if (Array.isArray(payload.applicableAlloyGrades)) {
          // 如果已经是数组，确保非空
          const grades = payload.applicableAlloyGrades.filter(Boolean)
          payload.applicableAlloyGrades = grades.length > 0 ? grades : undefined
        } else {
          // 其他情况，删除该字段
          delete payload.applicableAlloyGrades
        }
      } else {
        // 空值时删除该字段
        delete payload.applicableAlloyGrades
      }

      // 处理范围字段 - 接口要求: string (min-max 格式)
      ['applicableThicknessRange', 'applicableWidthRange'].forEach(key => {
        if (payload[key]) {
          if (typeof payload[key] === 'object') {
            const { start, end } = payload[key]
            if (start || end) {
              payload[key] = `${start || ''}-${end || ''}`
            } else {
              delete payload[key]
            }
          } else if (typeof payload[key] === 'string' && !payload[key].trim()) {
            delete payload[key]
          }
        } else {
          delete payload[key]
        }
      })

      // 清理温度段配置 - 移除数据库字段
      payload.segments = this.cleanDatabaseFields(formData.segments || [])

      // 清理保护气氛配置 - 移除数据库字段
      payload.atmosphereSettings = this.cleanDatabaseFields(formData.atmosphereSettings || [])

      // 清理风机参数配置 - 移除数据库字段
      payload.fanSettings = this.cleanDatabaseFields(formData.fanSettings || [])

      return payload
    },
    cleanDatabaseFields(items) {
      // 移除数据库相关字段，只保留业务字段
      const fieldsToRemove = ['id', 'versionId', 'isDeleted', 'createdBy', 'updatedBy', 'createdAt', 'updatedAt']

      return items.map(item => {
        const cleanItem = { ...item }
        fieldsToRemove.forEach(field => {
          delete cleanItem[field]
        })
        return cleanItem
      })
    },
    async handleSubmit() {
      // 验证基础信息
      this.activeTab = 'basic'
      await this.$nextTick()

      const basicValid = await new Promise((resolve) => {
        if (!this.$refs.basicForm) {
          resolve(true)
          return
        }
        this.$refs.basicForm.validate((valid) => {
          if (!valid) {
            this.$message.error('基础信息填写有误，请检查')
          }
          resolve(valid)
        })
      })

      if (!basicValid) return

      // 验证温度段
      this.activeTab = 'segments'
      await this.$nextTick()
      if (!this.$refs.segmentEditor || !this.$refs.segmentEditor.validate()) {
        this.$message.error('温度段配置有误，请检查')
        return
      }

      // 验证保护气氛
      this.activeTab = 'atmosphere'
      await this.$nextTick()
      if (!this.$refs.atmosphereEditor || !this.$refs.atmosphereEditor.validate()) {
        this.$message.error('保护气氛配置有误，请检查')
        return
      }

      // 验证风机参数
      this.activeTab = 'fan'
      await this.$nextTick()
      if (!this.$refs.fanEditor || !this.$refs.fanEditor.validate()) {
        this.$message.error('风机参数配置有误，请检查')
        return
      }

      // 所有验证通过，开始提交
      if (this.submitting) return
      this.submitting = true
      this.errorMessage = ''

      try {
        const payload = this.transformPayload(this.formModel)
        let response

        if (this.formMode === 'update' && this.templateId && this.versionId) {
          response = await updateProcessTemplateVersion(this.templateId, this.versionId, payload)
        } else {
          response = await createProcessTemplate(payload)
        }

        // 优先使用后端返回的消息，不同模式使用不同的备用消息
        const message = this.formMode === 'update'
          ? (response.message || MESSAGE_FALLBACKS.updateTemplate)
          : (response.message || MESSAGE_FALLBACKS.createTemplate)

        this.$message.success(message)
        this.$emit('success', response.data)
        this.visibleProxy = false
      } catch (error) {
        console.error('[TemplateFormDrawer] submit failed', error)
        const msg = error?.response?.data?.error?.message || error?.message || '保存失败，请检查输入'
        this.errorMessage = msg
        this.$message.error(msg)
      } finally {
        this.submitting = false
      }
    },
    handleCancel() {
      this.visibleProxy = false
      this.$emit('cancel')
    },
    handleDrawerClose() {
      this.visibleProxy = false
      this.$emit('close')
    },
    resetState() {
      this.formModel = this.buildDefaultModel()
      this.activeTab = 'basic'
      this.loading = false
      this.submitting = false
      this.errorMessage = ''
      this.productOptions = []
      this.productKeyword = ''
      this.productPagination.page = 1
      this.productPagination.totalPages = 1
    }
  }
}
</script>

<style scoped>
.template-form-drawer {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.template-form-drawer__content {
  padding: 0 20px 24px;
  background: #f7f8fa;
}

.template-form-drawer__tabs {
  background: #fff;
  border: none;
  box-shadow: 0 6px 20px rgba(31, 45, 61, 0.06);
}

.template-form-drawer__tabs >>> .el-tabs__header {
  background: #fafbfc;
  border-bottom: 2px solid #e4e7ed;
  margin: 0;
}

.template-form-drawer__tabs >>> .el-tabs__item {
  font-size: 15px;
  font-weight: 500;
  padding: 0 30px;
  height: 50px;
  line-height: 50px;
}

.template-form-drawer__tabs >>> .el-tabs__item.is-active {
  color: #409eff;
  font-weight: 600;
}

.template-form-drawer__tabs >>> .el-tabs__content {
  padding: 20px;
  min-height: 400px;
}

.template-form-drawer__form {
  background: transparent;
}

.tab-pane-content {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  min-height: 400px;
}

.form-section {
  margin-bottom: 24px;
  background: #fff;
  border-radius: 12px;
  padding: 20px 24px;
  box-shadow: 0 6px 20px rgba(31, 45, 61, 0.06);
  border: 1px solid #edf2fc;
}

.form-section__header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.form-section__title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2d3d;
}

.form-section__badge {
  margin-left: 12px;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  color: #f56c6c;
  background: #fdecea;
}

.form-section__badge--optional {
  color: #909399;
  background: #f4f4f5;
}

.field-hint {
  display: block;
  margin-top: 4px;
  color: #909399;
  font-size: 12px;
}

/* 适用产品字段使用更宽的输入框，确保 placeholder 能够完整显示 */
.form-item--full-width >>> .el-form-item__label {
  width: 120px !important;
}

.form-item--full-width >>> .el-form-item__content {
  margin-left: 120px !important;
}

.full-width-select {
  min-width: 500px;
  max-width: 100%;
}

.full-width-select >>> .el-select__tags {
  max-width: 100%;
}

.template-form-drawer__hint {
  margin-top: 16px;
}

.template-form-drawer__product-popper >>> .el-select-dropdown__item {
  height: auto;
  padding: 8px 12px;
}

.product-option {
  display: flex;
  flex-direction: column;
  line-height: 1.4;
}

.product-option .product-code {
  font-weight: 600;
  color: #1f2d3d;
  font-size: 14px;
}

.product-option .product-name {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

@media (max-width: 1440px) {
  .template-form-drawer__content {
    padding: 0 16px 20px;
  }

  .form-section {
    padding: 18px 20px;
  }

  .tab-pane-content {
    padding: 16px;
  }
}
</style>
