/**
 * 文件名称：EquipmentFormDrawer.vue
 * 文件描述：设备主数据管理表单抽屉组件，支持创建/编辑/查看三种模式，基于设备类型动态渲染详情字段
 * 创建日期：2025-09-29
 * 修改记录：
 *   - 2025-09-29: 初始创建，实现P0核心功能与P1-#6折叠面板优化
 */
<template>
  <Drawer
    :visible.sync="drawerVisible"
    :title="drawerTitle"
    :loading="formLoading"
    :width="drawerWidth"
    :wrapper-closable="false"
    @close="handleClose"
    @cancel="handleCancel"
    @confirm="handleConfirm"
  >
    <!-- 抽屉内容 -->
    <!-- 错误提示 -->
    <div v-if="errorMessage" class="form-error-alert" role="alert">
      <el-alert
        show-icon
        :title="errorMessage"
        type="error"
        :closable="true"
        @close="clearError"
      />
    </div>

    <!-- 表单主体 -->
    <EnhancedForm
      ref="enhancedForm"
      class="equipment-form"
      :data="formData"
      :mode="formMode"
      :loading="formLoading"
      :rules="formRules"
      :label-width="'140px'"
      :show-footer="false"
      :validate-on-data-change="false"
      :merge-on-data-update="true"
      @data-change="handleFormDataChange"
      @validation-change="handleValidationChange"
    >
      <template #default="{ form, mode: scopedMode, loading }">
        <!-- 基础信息分组 -->
        <div class="form-section">
          <div class="section-header" @click="toggleSection('basic')">
            <i
              :class="['section-toggle', sectionStates.basic ? 'el-icon-arrow-down' : 'el-icon-arrow-right']"
              aria-hidden="true"
            />
            <h3 class="section-title">{{ DETAIL_FIELD_GROUPS.BASIC.label }}</h3>
            <span v-if="scopedMode !== 'view'" class="section-badge">必填</span>
          </div>
          <el-collapse-transition>
            <div v-show="sectionStates.basic" class="section-content">
              <el-row :gutter="20">
                <template v-for="field in basicFormFields">
                  <el-col :key="field.prop" :span="getFieldSpan(field)">
                    <el-form-item
                      :prop="field.prop"
                      :label="field.label"
                      :rules="field.rules"
                    >
                      <!-- 设备类型字段特殊处理 -->
                      <el-select
                        v-if="field.prop === 'equipmentType'"
                        v-model="form[field.prop]"
                        :placeholder="field.placeholder"
                        :disabled="field.disabledOnEdit && scopedMode === 'update' || scopedMode === 'view' || loading"
                        :clearable="field.clearable && scopedMode !== 'view'"
                        @change="handleEquipmentTypeChange"
                      >
                        <el-option
                          v-for="option in field.options"
                          :key="option.value"
                          :label="option.label"
                          :value="option.value"
                        />
                      </el-select>

                      <!-- 状态字段处理 -->
                      <el-select
                        v-else-if="field.prop === 'status'"
                        v-model="form[field.prop]"
                        :placeholder="field.placeholder"
                        :disabled="scopedMode === 'view' || loading"
                        :clearable="field.clearable && scopedMode !== 'view'"
                      >
                        <el-option
                          v-for="option in field.options"
                          :key="option.value"
                          :label="option.label"
                          :value="option.value"
                        />
                      </el-select>

                      <!-- 其他基础字段 -->
                      <component
                        :is="getFieldComponent(field)"
                        v-else
                        v-model="form[field.prop]"
                        v-bind="getFieldProps(field, scopedMode, loading)"
                      />

                      <!-- 字段提示 -->
                      <div v-if="field.tooltip" class="field-tooltip">
                        <i class="el-icon-info" />
                        {{ field.tooltip }}
                      </div>
                    </el-form-item>
                  </el-col>
                </template>
              </el-row>
            </div>
          </el-collapse-transition>
        </div>

        <!-- 通讯参数分组 -->
        <div class="form-section">
          <div class="section-header" @click="toggleSection('communication')">
            <i
              :class="['section-toggle', sectionStates.communication ? 'el-icon-arrow-down' : 'el-icon-arrow-right']"
              aria-hidden="true"
            />
            <h3 class="section-title">{{ DETAIL_FIELD_GROUPS.COMMUNICATION.label }}</h3>
            <span v-if="scopedMode !== 'view'" class="section-badge important">重要</span>
          </div>
          <el-collapse-transition>
            <div v-show="sectionStates.communication" class="section-content">
              <el-row :gutter="20">
                <template v-for="field in communicationFormFields">
                  <el-col :key="field.prop" :span="getFieldSpan(field)">
                    <el-form-item
                      :prop="field.prop"
                      :label="field.label"
                      :rules="field.rules"
                    >
                      <!-- 通讯参数特殊组件 -->
                      <template v-if="field.type === 'key-value-editor'">
                        <KeyValueEditor
                          v-model="form.detail[getDetailFieldKey(field.prop)]"
                          :disabled="scopedMode === 'view' || loading"
                          :placeholder="field.placeholder || '请添加控制参数'"
                        />
                        <div v-if="field.tooltip" class="field-tooltip">
                          <i class="el-icon-warning-outline" />
                          {{ field.tooltip }}
                        </div>
                      </template>

                      <!-- 其他通讯字段 -->
                      <template v-else>
                        <component
                          :is="getFieldComponent(field)"
                          v-model="form[field.prop]"
                          v-bind="getFieldProps(field, scopedMode, loading)"
                        />
                        <div v-if="field.tooltip" class="field-tooltip">
                          <i class="el-icon-info" />
                          {{ field.tooltip }}
                        </div>
                      </template>
                    </el-form-item>
                  </el-col>
                </template>
              </el-row>
            </div>
          </el-collapse-transition>
        </div>

        <!-- 维护计划分组 -->
        <div class="form-section">
          <div class="section-header" @click="toggleSection('maintenance')">
            <i
              :class="['section-toggle', sectionStates.maintenance ? 'el-icon-arrow-down' : 'el-icon-arrow-right']"
              aria-hidden="true"
            />
            <h3 class="section-title">{{ DETAIL_FIELD_GROUPS.MAINTENANCE.label }}</h3>
            <span v-if="scopedMode !== 'view'" class="section-badge optional">可选</span>
          </div>
          <el-collapse-transition>
            <div v-show="sectionStates.maintenance" class="section-content">
              <el-row :gutter="20">
                <template v-for="field in maintenanceFormFields">
                  <el-col :key="field.prop" :span="getFieldSpan(field)">
                    <el-form-item
                      :prop="field.prop"
                      :label="field.label"
                      :rules="field.rules"
                    >
                      <component
                        :is="getFieldComponent(field)"
                        v-model="form[field.prop]"
                        v-bind="getFieldProps(field, scopedMode, loading)"
                      />
                      <div v-if="field.tooltip" class="field-tooltip">
                        <i class="el-icon-info" />
                        {{ field.tooltip }}
                      </div>
                    </el-form-item>
                  </el-col>
                </template>
              </el-row>
            </div>
          </el-collapse-transition>
        </div>

        <!-- 类型化详情分组 - 根据设备类型动态显示 -->
        <div v-if="currentEquipmentType && detailFormFields.length > 0" class="form-section">
          <div class="section-header" @click="toggleSection('detail')">
            <i
              :class="['section-toggle', sectionStates.detail ? 'el-icon-arrow-down' : 'el-icon-arrow-right']"
              aria-hidden="true"
            />
            <h3 class="section-title">
              {{ EQUIPMENT_TYPE_DETAIL_TITLES[currentEquipmentType] || '设备详情' }}
            </h3>
            <StatusTag
              :status="currentEquipmentType"
              :text-map="EQUIPMENT_TYPE_MAP"
              :type-map="EQUIPMENT_TYPE_TYPE_MAP"
              size="small"
              effect="light"
            />
            <span v-if="scopedMode !== 'view'" class="section-badge">必填</span>
          </div>
          <el-collapse-transition>
            <div v-show="sectionStates.detail" class="section-content">
              <el-row :gutter="20">
                <template v-for="field in detailFormFields">
                  <el-col :key="field.prop" :span="getFieldSpan(field)">
                    <el-form-item
                      :prop="field.prop"
                      :label="field.label"
                      :rules="field.rules"
                    >
                      <template v-if="field.type === 'key-value-editor'">
                        <KeyValueEditor
                          v-model="form.detail[getDetailFieldKey(field.prop)]"
                          :disabled="scopedMode === 'view' || loading"
                          :placeholder="field.placeholder || '请添加控制参数'"
                        />
                      </template>

                      <el-select
                        v-else-if="field.prop === 'detail.navigationType'"
                        v-model="form.detail.navigationType"
                        :placeholder="field.placeholder"
                        :disabled="scopedMode === 'view' || loading"
                      >
                        <el-option
                          v-for="option in field.options"
                          :key="option.value"
                          :label="option.label"
                          :value="option.value"
                        />
                      </el-select>

                      <component
                        :is="getFieldComponent(field)"
                        v-else
                        v-model="form.detail[getDetailFieldKey(field.prop)]"
                        v-bind="getFieldProps(field, scopedMode, loading)"
                      />

                      <div v-if="field.tooltip" class="field-tooltip">
                        <i class="el-icon-info" />
                        {{ field.tooltip }}
                      </div>
                    </el-form-item>
                  </el-col>
                </template>
              </el-row>
            </div>
          </el-collapse-transition>
        </div>

        <!-- 备注分组 -->
        <div class="form-section">
          <div class="section-header" @click="toggleSection('remark')">
            <i
              :class="['section-toggle', sectionStates.remark ? 'el-icon-arrow-down' : 'el-icon-arrow-right']"
              aria-hidden="true"
            />
            <h3 class="section-title">备注信息</h3>
            <span v-if="scopedMode !== 'view'" class="section-badge optional">可选</span>
          </div>
          <el-collapse-transition>
            <div v-show="sectionStates.remark" class="section-content">
              <el-form-item prop="remark" label="备注" :rules="remarkRules">
                <el-input
                  v-model="form.remark"
                  type="textarea"
                  :rows="3"
                  :placeholder="scopedMode === 'view' ? '暂无备注' : '请输入备注信息，最多1000字符'"
                  :disabled="scopedMode === 'view' || loading"
                  :maxlength="1000"
                  show-word-limit
                />
              </el-form-item>
            </div>
          </el-collapse-transition>
        </div>
      </template>
    </EnhancedForm>

    <!-- 自定义底部 -->
    <template #footer>
      <div>
        <el-button
          :disabled="formLoading"
          @click="handleCancel"
        >
          {{ formMode === 'view' ? '关闭' : '取消' }}
        </el-button>
        <el-button
          v-if="formMode !== 'view'"
          type="primary"
          :loading="formLoading"
          :disabled="!isFormValid || formLoading"
          @click="handleConfirm"
        >
          {{ formMode === 'create' ? '创建设备' : '更新设备' }}
        </el-button>
      </div>
    </template>
  </Drawer>
</template>

<script>
import Drawer from '@/components/Drawer'
import EnhancedForm from '@/components/EnhancedForm'
import KeyValueEditor from './KeyValueEditor' // 需要实现的键值对编辑器
import StatusTag from '@/components/StatusTag'
import {
  FORM_FIELDS,
  DETAIL_FORM_FIELDS
} from '../constants/form-config'
import {
  EQUIPMENT_TYPES,
  EQUIPMENT_TYPE_MAP,
  EQUIPMENT_TYPE_COLORS,
  EQUIPMENT_TYPE_DETAIL_TITLES,
  DETAIL_FIELD_GROUPS,
  COMMUNICATION_SENSITIVE_KEYS
} from '../constants/equipment-management'
import {
  EQUIPMENT_DETAIL_LABELS,
  EQUIPMENT_TYPE_TYPE_MAP
} from '../constants/equipment-management'
import { createEquipment, updateEquipment, getEquipmentDetail } from '../api'
import { cloneDeep } from 'lodash'

export default {
  name: 'EquipmentFormDrawer',
  components: {
    Drawer,
    EnhancedForm,
    KeyValueEditor,
    StatusTag
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
    equipmentId: {
      type: String,
      default: null
    },
    // 初始数据（用于创建时预填充）
    initialData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      // 常量引用
      EQUIPMENT_TYPES,
      EQUIPMENT_TYPE_MAP,
      EQUIPMENT_TYPE_COLORS,
      EQUIPMENT_TYPE_TYPE_MAP,
      EQUIPMENT_TYPE_DETAIL_TITLES,
      DETAIL_FIELD_GROUPS,
      COMMUNICATION_SENSITIVE_KEYS,

      // 表单状态
      formData: {},
      formLoading: false,
      isFormValid: false,
      errorMessage: '',

      // 分组折叠状态
      sectionStates: {
        basic: true,
        communication: true,
        maintenance: false,
        detail: true,
        remark: false
      },

      // 当前设备类型
      currentEquipmentType: null,

      // 备注校验规则
      remarkRules: [
        { max: 1000, message: '长度不能超过1000字符', trigger: 'blur' }
      ],

      // 临时存储详情字段值，用于在编辑时避免直接修改form.detail
      temporaryDetail: {}
    }
  },
  computed: {
    drawerVisible: {
      get() {
        return this.visible
      },
      set(value) {
        this.$emit('update:visible', value)
      }
    },

    drawerTitle() {
      const titleMap = {
        create: '创建设备档案',
        update: '编辑设备档案',
        view: '查看设备档案'
      }
      return titleMap[this.formMode] || '设备档案'
    },

    drawerWidth() {
      return this.currentEquipmentType ? '1200px' : '1000px'
    },

    formMode() {
      return this.mode
    },

    // 基础表单字段
    basicFormFields() {
      return FORM_FIELDS.filter(field =>
        DETAIL_FIELD_GROUPS.BASIC.fields.includes(field.prop)
      )
    },

    // 通讯参数字段
    communicationFormFields() {
      return FORM_FIELDS.filter(field =>
        DETAIL_FIELD_GROUPS.COMMUNICATION.fields.includes(field.prop)
      )
    },

    // 维护计划字段
    maintenanceFormFields() {
      return FORM_FIELDS.filter(field =>
        DETAIL_FIELD_GROUPS.MAINTENANCE.fields.includes(field.prop)
      )
    },

    // 类型化详情字段
    detailFormFields() {
      if (!this.currentEquipmentType || !DETAIL_FORM_FIELDS[this.currentEquipmentType]) {
        return []
      }
      return DETAIL_FORM_FIELDS[this.currentEquipmentType]
    },

    // 表单校验规则
    formRules() {
      const rules = {}

      // 基础字段规则
      FORM_FIELDS.forEach(field => {
        if (field.rules) {
          rules[field.prop] = field.rules
        }
      })

      // 详情字段规则
      if (this.currentEquipmentType && DETAIL_FORM_FIELDS[this.currentEquipmentType]) {
        DETAIL_FORM_FIELDS[this.currentEquipmentType].forEach(field => {
          if (field.rules) {
            rules[field.prop] = field.rules
          }
        })
      }

      return rules
    }
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.initializeForm()
      } else {
        this.resetForm()
      }
    },

    equipmentId(newVal) {
      if (newVal && this.visible) {
        this.loadEquipmentDetail()
      }
    }
  },
  methods: {
    // 初始化表单
    async initializeForm() {
      this.clearError()

      if (this.formMode === 'create') {
        this.initCreateForm()
      } else if (this.equipmentId) {
        await this.loadEquipmentDetail()
      }
    },

    // 初始化创建表单
    initCreateForm() {
      this.formData = {
        equipmentCode: '',
        name: '',
        equipmentType: '',
        status: 'enabled',
        model: '',
        manufacturer: '',
        locationDescription: '',
        installationDate: '',
        maintenanceCycleDays: null,
        lastMaintenanceDate: '',
        nextMaintenanceDate: '',
        communicationEndpoint: '',
        communicationParams: {},
        plcNodeId: '',
        controlSystemAddress: '',
        remark: '',
        metadata: {},
        detail: {},
        ...this.initialData
      }

      // 设置当前设备类型
      this.currentEquipmentType = this.formData.equipmentType

      // 根据设备类型初始化详情字段
      this.initDetailFields()
    },

    // 加载设备详情
    async loadEquipmentDetail() {
      if (!this.equipmentId) return

      try {
        this.formLoading = true
        const response = await getEquipmentDetail(this.equipmentId, { includeDetails: true })

        if (response.success) {
          this.formData = cloneDeep(response.data)
          this.currentEquipmentType = this.formData.equipmentType

          // 确保detail对象存在
          if (!this.formData.detail) {
            this.formData.detail = {}
          }

          // 初始化详情字段
          this.initDetailFields()
        } else {
          this.showError(response.error?.message || '加载设备详情失败')
        }
      } catch (error) {
        this.showError(error.message || '加载设备详情失败')
        console.error('Load equipment detail error:', error)
      } finally {
        this.formLoading = false
      }
    },

    // 初始化详情字段
    initDetailFields() {
      if (!this.currentEquipmentType) return

      const detailFields = DETAIL_FORM_FIELDS[this.currentEquipmentType]
      if (!detailFields) return

      // 确保detail对象存在
      if (!this.formData.detail) {
        this.$set(this.formData, 'detail', {})
      }

      // 为每个详情字段设置默认值
      detailFields.forEach(field => {
        const key = this.getDetailFieldKey(field.prop)
        if (this.formData.detail[key] === undefined) {
          this.$set(this.formData.detail, key, field.type === 'key-value-editor' ? {} : '')
        }
        if (this.formData[field.prop] === undefined) {
          this.$set(this.formData, field.prop, this.formData.detail[key])
        }
      })
    },

    // 获取详情字段键名
    getDetailFieldKey(prop) {
      return prop.replace('detail.', '')
    },

    // 处理设备类型变更
    handleEquipmentTypeChange(value) {
      this.currentEquipmentType = value
      this.formData.equipmentType = value

      // 重置详情字段
      if (!this.formData.detail) {
        this.$set(this.formData, 'detail', {})
      }

      DETAIL_FORM_FIELDS[this.currentEquipmentType]?.forEach(field => {
        const key = this.getDetailFieldKey(field.prop)
        const defaultValue = field.type === 'key-value-editor' ? {} : ''
        if (this.formData.detail[key] === undefined) {
          this.$set(this.formData.detail, key, defaultValue)
        }
      })

      // 根据设备类型自动展开详情分组
      if (value) {
        this.sectionStates.detail = true
      }
    },

    // 获取字段组件类型
    getFieldComponent(field) {
      const componentMap = {
        'input': 'el-input',
        'textarea': 'el-input',
        'input-number': 'el-input-number',
        'select': 'el-select',
        'date': 'el-date-picker',
        'daterange': 'el-date-picker',
        'switch': 'el-switch'
      }
      return componentMap[field.type] || 'el-input'
    },

    // 获取字段属性
    getFieldProps(field, mode, loading) {
      const props = {
        placeholder: mode === 'view' ? '暂无数据' : field.placeholder,
        disabled: mode === 'view' || loading,
        clearable: field.clearable && mode !== 'view'
      }

      // 根据字段类型设置特定属性
      switch (field.type) {
        case 'textarea':
          props.type = 'textarea'
          props.rows = field.rows || 2
          break
        case 'input-number':
          props.min = field.min
          props.max = field.max
          props.precision = field.precision
          props.step = field.step || 1
          break
        case 'date':
        case 'daterange':
          props.type = field.type === 'daterange' ? 'daterange' : 'date'
          props.format = field.format
          props.valueFormat = field.valueFormat
          break
      }

      return props
    },

    // 获取字段栅格占位
    getFieldSpan(field) {
      // 根据字段类型和内容调整栅格
      if (field.type === 'textarea' || field.type === 'key-value-editor') {
        return 24
      }
      if (field.type === 'daterange') {
        return 24
      }
      return 12
    },

    // 处理字段输入
    handleFieldInput() {},

    // 处理详情字段输入
    handleDetailFieldInput() {},

    // 切换分组展开状态
    toggleSection(section) {
      this.$set(this.sectionStates, section, !this.sectionStates[section])
    },

    // 处理表单数据变更
    handleFormDataChange(data) {
      // 仅合并根层简单字段，保持 detail 引用不变，防止已填详情被覆盖
      const { detail: incomingDetail, ...rest } = data || {}
      Object.keys(rest || {}).forEach(key => {
        this.$set(this.formData, key, cloneDeep(rest[key]))
      })
      if (!this.formData.detail) {
        this.$set(this.formData, 'detail', {})
      }
      // 仅在缺少键时补充，不覆盖已有值
      if (incomingDetail && typeof incomingDetail === 'object') {
        Object.keys(incomingDetail).forEach(k => {
          if (this.formData.detail[k] === undefined) {
            this.$set(this.formData.detail, k, cloneDeep(incomingDetail[k]))
          }
        })
      }
    },

    // 处理表单验证状态变更
    handleValidationChange(isValid) {
      this.isFormValid = isValid
    },

    // 格式化提交数据
    formatSubmitData() {
      const data = cloneDeep(this.formData)

      // 清理空字段
      Object.keys(data).forEach(key => {
        if (data[key] === '' || data[key] === null) {
          delete data[key]
        }
      })

      // 确保必要字段
      if (!data.communicationParams) {
        data.communicationParams = {}
      }

      // 处理详情字段
      if (data.detail && Object.keys(data.detail).length === 0) {
        delete data.detail
      }

      // 根据模式设置equipmentType（编辑时需要携带以验证详情）
      if (this.formMode === 'update' && this.currentEquipmentType) {
        data.equipmentType = this.currentEquipmentType
      }

      return data
    },

    // 提交表单
    async handleConfirm() {
      try {
        // 表单验证
        const valid = await this.$refs.enhancedForm.validate()
        if (!valid) return

        this.formLoading = true
        this.clearError()

        const submitData = this.formatSubmitData()
        let response

        if (this.formMode === 'create') {
          response = await createEquipment(submitData)
        } else {
          response = await updateEquipment(this.equipmentId, submitData)
        }

        if (response.success) {
          // 使用后端返回的message
          this.$message.success(response.message || '操作成功')

          // 透传保存结果给父组件
          this.$emit('success', {
            mode: this.formMode,
            data: response.data,
            message: response.message
          })

          // 关闭抽屉
          this.handleClose()
        } else {
          this.showError(response.error?.message || '操作失败')
        }
      } catch (error) {
        this.showError(error.message || '操作失败')
        console.error('Submit error:', error)
      } finally {
        this.formLoading = false
      }
    },

    // 取消操作
    handleCancel() {
      this.handleClose()
    },

    // 关闭抽屉
    handleClose() {
      this.$emit('update:visible', false)
      this.$emit('close')
    },

    // 重置表单
    resetForm() {
      this.formData = {}
      this.currentEquipmentType = null
      this.clearError()

      // 重置分组状态
      this.sectionStates = {
        basic: true,
        communication: true,
        maintenance: false,
        detail: true,
        remark: false
      }

      if (this.$refs.enhancedForm) {
        this.$refs.enhancedForm.resetFields()
      }
    },

    // 显示错误
    showError(message) {
      this.errorMessage = message
    },

    // 清除错误
    clearError() {
      this.errorMessage = ''
    }
  }
}
</script>

<style lang="scss" scoped>
.form-error-alert {
  margin-bottom: 20px;
}

.equipment-form {
  padding: 0 4px;

  .form-section {
    margin-bottom: 24px;
    border: 1px solid #e4e7ed;
    border-radius: 6px;
    overflow: hidden;

    .section-header {
      display: flex;
      align-items: center;
      padding: 16px 20px;
      background: #fafbfc;
      border-bottom: 1px solid #e4e7ed;
      cursor: pointer;
      transition: background-color 0.3s;

      &:hover {
        background: #f5f7fa;
      }

      .section-toggle {
        margin-right: 8px;
        transition: transform 0.3s;
        color: #606266;
      }

      .section-title {
        flex: 1;
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }

      .section-badge {
        padding: 2px 8px;
        border-radius: 3px;
        font-size: 12px;
        font-weight: 500;
        margin-left: 8px;

        &.important {
          background: #fef0f0;
          color: #f56c6c;
        }

        &.optional {
          background: #f0f9ff;
          color: #909399;
        }

        &:not(.important):not(.optional) {
          background: #f0f2f5;
          color: #606266;
        }
      }

      .section-type-tag {
        margin-left: 12px;
        border: none;
      }
    }

    .section-content {
      padding: 20px;
      background: #ffffff;
    }
  }

  .field-tooltip {
    margin-top: 4px;
    font-size: 12px;
    color: #909399;
    display: flex;
    align-items: center;

    i {
      margin-right: 4px;
    }
  }

  // 表单项样式优化
  ::v-deep .el-form-item {
    margin-bottom: 20px;

    .el-form-item__label {
      font-weight: 500;
      color: #606266;
    }

    .el-form-item__content {
      .el-input,
      .el-select,
      .el-date-editor {
        width: 100%;
      }

      .el-textarea {
        .el-textarea__inner {
          resize: vertical;
        }
      }
    }
  }
}

</style>
