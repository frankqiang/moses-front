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

    <EnhancedForm
      v-if="visibleProxy"
      ref="enhancedForm"
      class="template-form-drawer__form"
      :data="formModel"
      :rules="formRules"
      :mode="formMode"
      :loading="submitting"
      label-width="160px"
      :show-footer="false"
      :clear-validate-on-data-update="true"
      :disable-initial-validation="true"
      :validate-on-data-change="false"
      :sync-changes="true"
      @submit="handleSubmit"
    >
      <template #default="{ form, mode, setFieldValue }">
        <section class="form-section">
          <header class="form-section__header">
            <h3 class="form-section__title">模板基础信息</h3>
            <span v-if="mode !== 'view'" class="form-section__badge">必填</span>
          </header>
          <el-row :gutter="24">
            <el-col
              v-for="field in baseFields"
              :key="field.prop"
              :span="getFieldSpan(field)"
            >
              <component
                :is="resolveFieldComponent(field)"
                v-model="form[field.prop]"
                v-bind="buildFieldProps(field, mode, setFieldValue)"
              />
              <small v-if="field.hint" class="field-hint">{{ field.hint }}</small>
            </el-col>
          </el-row>
        </section>

        <section class="form-section">
          <header class="form-section__header">
            <h3 class="form-section__title">适用范围</h3>
            <span v-if="mode !== 'view'" class="form-section__badge">必填</span>
          </header>
          <el-row :gutter="24">
            <el-col
              v-for="field in scopeFields"
              :key="field.prop"
              :span="getFieldSpan(field)"
            >
              <component
                :is="resolveFieldComponent(field)"
                v-model="form[field.prop]"
                v-bind="buildFieldProps(field, mode, setFieldValue)"
                @remote-search="handleProductSearch"
                @scroll-bottom="handleProductLoadMore"
              />
              <small v-if="field.hint" class="field-hint">{{ field.hint }}</small>
            </el-col>
          </el-row>
        </section>

        <section class="form-section">
          <header class="form-section__header">
            <h3 class="form-section__title">版本信息</h3>
          </header>
          <el-row :gutter="24">
            <el-col
              v-for="field in versionFields"
              :key="field.prop"
              :span="getFieldSpan(field)"
            >
              <component
                :is="resolveFieldComponent(field)"
                v-model="form[field.prop]"
                v-bind="buildFieldProps(field, mode, setFieldValue)"
              />
              <small v-if="field.hint" class="field-hint">{{ field.hint }}</small>
            </el-col>
          </el-row>
        </section>
      </template>
    </EnhancedForm>

    <template #footer>
      <div class="template-form-drawer__footer">
        <el-button :disabled="submitting" @click="handleCancel">
          {{ formMode === 'view' ? '关闭' : '取消' }}
        </el-button>
        <el-button
          v-if="formMode !== 'view'"
          type="primary"
          :loading="submitting"
          @click="triggerSubmit"
        >
          {{ submitButtonText }}
        </el-button>
      </div>
    </template>
  </Drawer>
</template>

<script>
import Drawer from '@/components/Drawer'
import EnhancedForm from '@/components/EnhancedForm'
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
      validator: value => ['create', 'update', 'view', 'copy'].includes(value)
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
    return {
      visibleProxy: false,
      formMode: 'create',
      loading: false,
      submitting: false,
      errorMessage: '',
      drawerWidth: '960px',
      formModel: {},
      productOptions: [],
      productKeyword: '',
      productPagination: {
        page: 1,
        limit: 30,
        totalPages: 1
      }
    }
  },
  computed: {
    drawerTitle() {
      const titles = {
        create: '新建工艺模板',
        update: '编辑工艺模板',
        view: '查看工艺模板',
        copy: '复制工艺模板'
      }
      return titles[this.formMode] || '工艺模板'
    },
    submitButtonText() {
      return this.formMode === 'create' || this.formMode === 'copy' ? '创建模板' : '保存修改'
    },
    formRules() {
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
      try {
        await this.prepareFormModel()
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
      if (this.formMode === 'copy' && this.templateId && this.versionId) {
        await this.loadTemplateDetail({ copyMode: true })
        return
      }
      if (this.formMode === 'update' || this.formMode === 'view') {
        if (this.templateId) {
          await this.loadTemplateDetail()
          return
        }
      }
      if (Object.keys(this.initialData || {}).length) {
        this.formModel = cloneDeep(this.initialData)
      } else {
        this.formModel = this.buildDefaultModel()
      }
    },
    buildDefaultModel() {
      const model = {}
      TEMPLATE_FORM_FIELDS.forEach(field => {
        if (Object.prototype.hasOwnProperty.call(field, 'defaultValue')) {
          model[field.prop] = cloneDeep(field.defaultValue)
        } else {
          model[field.prop] = field.type === 'remote-select' ? [] : ''
        }
      })
      model.status = TEMPLATE_STATUS.DRAFT
      return model
    },
    async loadTemplateDetail({ copyMode = false } = {}) {
      const { data } = await getProcessTemplateDetail(this.templateId)
      const latestVersion = data.latestVersion || {}
      const targetVersion = copyMode
        ? (data.versions || []).find(item => item.id === this.versionId) || latestVersion
        : latestVersion

      const model = this.buildDefaultModel()
      model.templateCode = copyMode ? '' : data.templateCode
      model.templateName = copyMode ? `${data.templateName || ''}-副本` : data.templateName
      model.description = data.description || ''
      model.status = data.status || TEMPLATE_STATUS.DRAFT
      model.applicableProductIds = (data.applicableProducts || []).map(item => item.id)
      model.applicableAlloyGrades = data.applicableAlloyGrades || ''
      model.applicableThicknessRange = data.applicableThicknessRange || ''
      model.applicableWidthRange = data.applicableWidthRange || ''
      model.versionNumber = copyMode ? `${targetVersion.versionNumber || 'v1.0'}-copy` : targetVersion.versionNumber || ''
      model.versionDescription = targetVersion.versionDescription || ''

      this.formModel = model
      this.productOptions = (data.applicableProducts || []).map(product => ({
        id: product.id,
        productCode: product.productCode,
        productName: product.productName,
        lifecycleStatus: product.lifecycleStatus
      }))
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
    buildFieldProps(field, mode, setFieldValue) {
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
          props.formatter = value => field.formatter(value, setFieldValue)
        }
        return props
      }

      if (field.type === 'select') {
        return {
          ...common,
          options: field.options,
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
    getFieldSpan(field) {
      if (field.colSpan) return field.colSpan
      if (['description', 'applicableProductIds', 'versionDescription'].includes(field.prop)) {
        return 24
      }
      return 12
    },
    triggerSubmit() {
      if (this.$refs.enhancedForm) {
        this.$refs.enhancedForm.handleSubmitClick()
      }
    },
    transformPayload(formData) {
      const payload = { ...formData }
      payload.applicableProductIds = Array.isArray(payload.applicableProductIds)
        ? payload.applicableProductIds.filter(Boolean)
        : []

      if (payload.applicableAlloyGrades) {
        payload.applicableAlloyGrades = payload.applicableAlloyGrades
          .split(',')
          .map(item => item.trim())
          .filter(Boolean)
      }

      ['applicableThicknessRange', 'applicableWidthRange'].forEach(key => {
        if (payload[key] && typeof payload[key] === 'object') {
          const { start, end } = payload[key]
          payload[key] = start || end ? `${start || ''}-${end || ''}` : ''
        }
      })

      return payload
    },
    async handleSubmit(formData) {
      if (this.submitting) return
      this.submitting = true
      this.errorMessage = ''
      try {
        const payload = this.transformPayload(formData)
        let response
        if (this.formMode === 'update' && this.templateId && this.versionId) {
          response = await updateProcessTemplateVersion(this.templateId, this.versionId, payload)
        } else {
          response = await createProcessTemplate(payload)
        }
        this.$message.success(response.message || MESSAGE_FALLBACKS.createTemplate)
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

.template-form-drawer__form {
  padding: 0 20px 24px;
  background: #f7f8fa;
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

.field-hint {
  display: block;
  margin-top: 4px;
  color: #909399;
  font-size: 12px;
}

.template-form-drawer__footer {
  text-align: right;
  padding: 12px 24px 8px;
  background: #fff;
  border-top: 1px solid #ebeef5;
}

.template-form-drawer__product-popper ::v-deep .el-select-dropdown__item {
  display: flex;
  flex-direction: column;
  padding: 6px 12px;
}

.template-form-drawer__product-popper ::v-deep .el-select-dropdown__item .product-code {
  font-weight: 600;
  color: #1f2d3d;
}

.template-form-drawer__product-popper ::v-deep .el-select-dropdown__item .product-name {
  font-size: 12px;
  color: #909399;
}

@media (max-width: 1440px) {
  .template-form-drawer__form {
    padding: 0 16px 20px;
  }

  .form-section {
    padding: 18px 20px;
  }
}
</style>

