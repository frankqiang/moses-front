/** * 文件名称：PositionFormDrawer.vue * 文件描述：岗位表单抽屉组件，使用全局
BaseDrawer 和 EnhancedForm 统一交互风格 * 创建日期：2024-01-20 * 修改记录： * -
2024-01-20: 创建，符合process-management/operations模块的开发范式 * -
2025-09-25: 重构为全局组件风格，接入部门选项API */

<template>
  <base-drawer
    :visible.sync="drawerVisible"
    :title="drawerTitle"
    width="700px"
    :wrapper-closable="false"
    custom-class="position-form-drawer"
    :loading="drawerLoading"
    @open="handleDrawerOpen"
    @close="handleDrawerClose"
  >
    <enhanced-form
      ref="enhancedForm"
      :data="formData"
      :mode="innerMode"
      :rules="formRules"
      label-width="120px"
      :show-footer="false"
      :validate-on-data-change="false"
      :clear-validate-on-data-update="true"
      :disable-initial-validation="true"
      :loading="drawerLoading"
      @submit="handleFormSubmit"
      @reset="handleFormReset"
      @validate="handleCustomValidate"
      @validate-error="handleValidateError"
    >
      <template v-slot="{ form, mode: formMode }">
        <!-- 一、基础信息 -->
        <div class="form-section">
          <div class="section-title">
            <i class="el-icon-info" />
            基本信息
          </div>

          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="岗位名称" prop="name">
                <el-input
                  v-model="form.name"
                  placeholder="请输入岗位名称"
                  maxlength="100"
                  show-word-limit
                  :disabled="formMode === 'view'"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="岗位编码" prop="code">
                <el-input
                  v-model="form.code"
                  placeholder="请输入岗位编码，将自动转为大写"
                  maxlength="50"
                  show-word-limit
                  :disabled="formMode === 'view' || formMode === 'update'"
                  @input="(value) => handleCodeInput(form, value)"
                />
                <div class="field-hint">
                  <span v-if="formMode === 'update'" class="edit-disabled-hint">
                    编码创建后不可修改，确保系统数据一致性
                  </span>
                  <span v-else>
                    岗位编码用于系统内部识别，建议使用英文缩写，如：DEV、QA等
                  </span>
                </div>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="岗位职责" prop="description">
                <el-input
                  v-model="form.description"
                  type="textarea"
                  placeholder="请输入岗位职责描述（可选）"
                  :rows="4"
                  maxlength="1000"
                  show-word-limit
                  :disabled="formMode === 'view'"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 二、组织关系 -->
        <div class="form-section">
          <div class="section-title">
            <i class="el-icon-connection" />
            组织关系
          </div>

          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="所属部门" prop="departmentId">
                <el-select
                  v-model="form.departmentId"
                  placeholder="请选择所属部门"
                  filterable
                  style="width: 100%"
                  :disabled="formMode === 'view'"
                  :loading="departmentOptionsLoading"
                >
                  <el-option
                    v-for="option in departmentSelectOptions"
                    :key="option.value"
                    :label="option.labelWithLevel || option.label"
                    :value="option.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="岗位级别" prop="level">
                <el-input-number
                  v-model="form.level"
                  :min="1"
                  :max="10"
                  :disabled="formMode === 'view'"
                  style="width: 100%"
                />
                <div class="field-hint">数值越小级别越高，用于岗位层级管理</div>
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="排序顺序" prop="sortOrder">
                <el-input-number
                  v-model="form.sortOrder"
                  :min="0"
                  :max="9999"
                  :disabled="formMode === 'view'"
                  style="width: 100%"
                />
                <div class="field-hint">
                  数值越小排序越靠前，用于同部门岗位的显示顺序
                </div>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 三、状态设置 -->
        <div class="form-section">
          <div class="section-title">
            <i class="el-icon-setting" />
            状态设置
          </div>

          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="岗位状态" prop="status">
                <el-radio-group
                  v-model="form.status"
                  :disabled="formMode === 'view'"
                >
                  <el-radio
                    v-for="option in statusOptions"
                    :key="option.value"
                    :label="option.value"
                  >
                    {{ option.label }}
                  </el-radio>
                </el-radio-group>
                <div class="field-hint">
                  禁用的岗位将不能分配员工，也不会在选择器中显示
                </div>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 查看模式的系统信息 -->
        <div v-if="formMode === 'view' && latestDetail" class="form-section">
          <div class="section-title">
            <i class="el-icon-time" />
            系统信息
          </div>

          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="创建时间">
                <span>{{ formatDateTime(latestDetail.createdAt) }}</span>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="更新时间">
                <span>{{ formatDateTime(latestDetail.updatedAt) }}</span>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row
            v-if="latestDetail.employees && latestDetail.employees.length"
            :gutter="20"
          >
            <el-col :span="24">
              <el-form-item label="在职员工">
                <el-tag
                  v-for="employee in latestDetail.employees"
                  :key="employee.id"
                  type="info"
                  size="small"
                  class="employee-tag"
                >
                  {{ employee.name }}
                </el-tag>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </template>
    </enhanced-form>

    <template #footer>
      <el-button @click="handleCancel">
        {{ innerMode === "view" ? "关闭" : "取消" }}
      </el-button>
      <el-button v-if="innerMode !== 'view'" @click="handleReset">
        重置
      </el-button>
      <el-button
        v-if="innerMode === 'create'"
        type="primary"
        :loading="drawerLoading"
        @click="handleSubmitAndContinue"
      >
        保存并继续
      </el-button>
      <el-button
        v-if="innerMode !== 'view'"
        type="primary"
        :loading="drawerLoading"
        @click="handleSubmit"
      >
        {{ innerMode === "create" ? "确认保存" : "保存修改" }}
      </el-button>
    </template>
  </base-drawer>
</template>

<script>
import BaseDrawer from '@/components/Drawer'
import EnhancedForm from '@/components/EnhancedForm'
import { parseTime } from '@/utils'
import {
  createPosition,
  updatePosition,
  getDepartmentOptions,
  getPositionDetail
} from '../api'
import {
  FORM_RULES,
  POSITION_STATUS,
  POSITION_STATUS_OPTIONS,
  POSITION_SUCCESS_MESSAGES,
  POSITION_ERROR_MESSAGES
} from '../constants'

export default {
  name: 'PositionFormDrawer',
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
      validator: (value) => ['create', 'update', 'view'].includes(value)
    },
    positionData: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      drawerVisible: false,
      formData: this.initFormData(),
      submitting: false,
      detailLoading: false,
      departmentOptions: [],
      departmentOptionsLoading: false,
      latestDetail: null
    }
  },
  computed: {
    innerMode() {
      return this.mode
    },
    drawerTitle() {
      const titleMap = {
        create: '新增岗位',
        update: '编辑岗位',
        view: '查看岗位'
      }
      return titleMap[this.innerMode] || '岗位管理'
    },
    drawerLoading() {
      return this.submitting || this.detailLoading
    },
    formRules() {
      return FORM_RULES
    },
    statusOptions() {
      return POSITION_STATUS_OPTIONS
    },
    departmentSelectOptions() {
      return this.departmentOptions
    }
  },
  watch: {
    visible: {
      immediate: true,
      handler(newVal) {
        this.drawerVisible = newVal
      }
    },
    drawerVisible(newVal) {
      this.$emit('update:visible', newVal)
    },
    mode(newMode, oldMode) {
      if (this.drawerVisible) {
        this.handleModeChange(newMode, oldMode)
      }
    },
    positionData: {
      deep: true,
      handler(newVal) {
        if (!this.drawerVisible) {
          return
        }
        if (this.innerMode === 'update' || this.innerMode === 'view') {
          if (newVal?.id && newVal.id !== this.latestDetail?.id) {
            this.fetchPositionDetail(newVal.id)
          } else {
            this.initializeForm()
          }
        } else {
          this.initializeForm()
        }
      }
    }
  },
  methods: {
    initFormData() {
      return {
        id: undefined,
        name: '',
        code: '',
        description: '',
        departmentId: '',
        level: 1,
        sortOrder: 0,
        status: POSITION_STATUS.ACTIVE
      }
    },
    initializeForm() {
      if (this.innerMode === 'create') {
        this.formData = this.initFormData()
        return
      }
      const source = this.latestDetail || this.positionData || {}
      this.formData = this.mapFormDataFromSource(source)
    },
    handleModeChange(newMode, oldMode) {
      if (newMode === oldMode && this.latestDetail) {
        return
      }
      if (newMode === 'create') {
        this.latestDetail = null
        this.initializeForm()
        return
      }
      if (
        (newMode === 'update' || newMode === 'view') &&
        this.positionData?.id
      ) {
        this.latestDetail = null
        this.fetchPositionDetail(this.positionData.id)
      } else {
        this.initializeForm()
      }
    },
    mapFormDataFromSource(source = {}) {
      const departmentId = source.departmentId || source.department?.id || ''
      return {
        id: source.id,
        name: source.name || '',
        code: (source.code || '').toUpperCase(),
        description: source.description || '',
        departmentId,
        level: typeof source.level === 'number' ? source.level : 1,
        sortOrder: typeof source.sortOrder === 'number' ? source.sortOrder : 0,
        status: source.status || POSITION_STATUS.ACTIVE
      }
    },
    async handleDrawerOpen() {
      this.initializeForm()
      const tasks = [this.loadDepartmentOptions()]
      if (
        (this.innerMode === 'update' || this.innerMode === 'view') &&
        this.positionData?.id
      ) {
        tasks.push(this.fetchPositionDetail(this.positionData.id))
      }
      await Promise.all(tasks)
    },
    handleDrawerClose() {
      this.submitting = false
      this.detailLoading = false
      this.formData = this.initFormData()
      this.latestDetail = null
      this.$nextTick(() => {
        if (this.$refs.enhancedForm && this.$refs.enhancedForm.$refs?.form) {
          this.$refs.enhancedForm.$refs.form.clearValidate()
        }
      })
      this.$emit('close')
    },
    handleCancel() {
      if (this.submitting) {
        this.$message.warning('正在保存中，请稍候...')
        return
      }
      this.drawerVisible = false
    },
    handleReset() {
      if (this.innerMode === 'view') {
        return
      }
      this.$confirm('确定要重置表单吗？', '重置确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.handleFormReset()
          this.$message.success('表单已重置')
        })
        .catch(() => {
          // 用户取消重置
        })
    },
    handleSubmit() {
      if (this.$refs.enhancedForm) {
        this.$refs.enhancedForm.handleSubmitClick()
      }
    },
    handleSubmitAndContinue() {
      if (this.$refs.enhancedForm) {
        this.$refs.enhancedForm.handleContinueClick()
      }
    },
    async handleFormSubmit(formData, continueEdit = false) {
      try {
        this.submitting = true
        const payload = {
          ...formData,
          code: (formData.code || '').toUpperCase().trim()
        }

        let response
        if (this.innerMode === 'create') {
          delete payload.id
          response = await createPosition(payload)
        } else if (this.innerMode === 'update') {
          const targetId = payload.id || this.positionData?.id
          // eslint-disable-next-line no-unused-vars
          const { code, id, ...updatePayload } = payload
          response = await updatePosition(targetId, updatePayload)
        } else {
          return
        }

        const messageKey = this.innerMode === 'create' ? 'create' : 'update'
        const successMessage =
          response?.message ||
          POSITION_SUCCESS_MESSAGES[messageKey] ||
          '操作成功'
        this.$message.success(successMessage)

        this.$emit('success', {
          mode: this.innerMode,
          data: response?.data || payload,
          continueEdit
        })

        if (continueEdit) {
          this.formData = this.initFormData()
          this.$nextTick(() => {
            if (
              this.$refs.enhancedForm &&
              this.$refs.enhancedForm.$refs?.form
            ) {
              this.$refs.enhancedForm.$refs.form.clearValidate()
            }
          })
        } else {
          this.drawerVisible = false
        }
      } catch (error) {
        console.error('岗位保存失败:', error)
        const errorMessage =
          error?.response?.data?.message ||
          error?.response?.data?.error?.message ||
          error?.message ||
          POSITION_ERROR_MESSAGES.DEFAULT
        this.$message.error(errorMessage)
      } finally {
        this.submitting = false
      }
    },
    handleFormReset() {
      const sourceData = this.latestDetail || this.positionData || {}
      this.formData =
        this.innerMode === 'create'
          ? this.initFormData()
          : this.mapFormDataFromSource(sourceData)
      this.$nextTick(() => {
        if (this.$refs.enhancedForm && this.$refs.enhancedForm.$refs?.form) {
          this.$refs.enhancedForm.$refs.form.clearValidate()
        }
      })
    },
    handleCustomValidate(formData, callback) {
      callback(true)
    },
    handleValidateError(invalidFields) {
      const fieldKeys = Object.keys(invalidFields || {})
      if (!fieldKeys.length) {
        return
      }
      this.$nextTick(() => {
        const firstErrorField = fieldKeys[0]
        const formEl = this.$refs.enhancedForm && this.$refs.enhancedForm.$el
        if (!formEl) {
          return
        }
        const fieldElement = formEl.querySelector(
          `[prop="${firstErrorField}"] input, [prop="${firstErrorField}"] textarea, [prop="${firstErrorField}"] .el-select`
        )
        if (fieldElement && typeof fieldElement.focus === 'function') {
          fieldElement.focus()
        }
      })
    },
    async loadDepartmentOptions() {
      this.departmentOptionsLoading = true
      try {
        const response = await getDepartmentOptions({
          status: POSITION_STATUS.ACTIVE,
          limit: 100,
          sortBy: 'level:asc,sortOrder:asc'
        })
        const options = response?.data?.options || []
        this.departmentOptions = options.map((option) => ({
          value: option.value,
          label: option.label,
          labelWithLevel: option.labelWithLevel || option.label,
          code: option.code
        }))
        this.ensureCurrentDepartmentVisible(
          this.latestDetail || this.positionData
        )
      } catch (error) {
        console.error('加载部门选项失败:', error)
        const errorMessage =
          error?.response?.data?.message ||
          error?.response?.data?.error?.message ||
          error?.message ||
          '加载部门选项失败，请稍后重试'
        this.$message.error(errorMessage)
      } finally {
        this.departmentOptionsLoading = false
      }
    },
    ensureCurrentDepartmentVisible(detail) {
      const effectiveDetail = detail || this.latestDetail || this.positionData
      const currentId =
        this.formData.departmentId ||
        effectiveDetail?.departmentId ||
        effectiveDetail?.department?.id
      if (!currentId) {
        return
      }
      const exists = this.departmentOptions.some(
        (option) => option.value === currentId
      )
      if (!exists) {
        const fallbackLabel =
          effectiveDetail?.department?.name ||
          effectiveDetail?.departmentName ||
          this.positionData?.department?.name
        if (fallbackLabel) {
          this.departmentOptions = [
            ...this.departmentOptions,
            {
              value: currentId,
              label: fallbackLabel,
              labelWithLevel: fallbackLabel
            }
          ]
        }
      }
    },
    ensureFormDataConsistency() {
      if (!this.latestDetail && !this.positionData) {
        return
      }
      const source = this.latestDetail || this.positionData
      if (!source?.id) {
        return
      }
      if (source.id !== this.formData.id) {
        this.formData = this.mapFormDataFromSource(source)
      }
    },
    async fetchPositionDetail(id) {
      if (!id) {
        return
      }
      this.detailLoading = true
      try {
        const response = await getPositionDetail(id, {
          populate: 'department,employees'
        })
        if (response?.success) {
          this.latestDetail = response.data
          this.formData = this.mapFormDataFromSource(response.data)
          this.ensureCurrentDepartmentVisible(response.data)
          this.$emit('detail-loaded', response.data)
        } else if (response?.error?.message) {
          this.$message.error(response.error.message)
        }
      } catch (error) {
        console.error('获取岗位详情失败:', error)
        const errorMessage =
          error?.response?.data?.message ||
          error?.response?.data?.error?.message ||
          error?.message ||
          '获取岗位详情失败，请稍后重试'
        this.$message.error(errorMessage)
      } finally {
        this.detailLoading = false
        this.ensureFormDataConsistency()
      }
    },
    handleCodeInput(form, value) {
      form.code = (value || '').toUpperCase()
    },
    formatDateTime(dateTime) {
      return parseTime(dateTime, '{y}-{m}-{d} {h}:{i}')
    }
  }
}
</script>

<style lang="scss" scoped>
.position-form-drawer {
  :deep(.drawer-content) {
    padding: 0;
    display: flex;
    flex-direction: column;
  }

  :deep(.el-form) {
    padding: 24px;
  }

  .form-section {
    margin-bottom: 32px;

    &:last-child {
      margin-bottom: 0;
    }

    .section-title {
      display: flex;
      align-items: center;
      font-size: 16px;
      font-weight: 500;
      color: #303133;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e4e7ed;

      i {
        margin-right: 8px;
        color: #409eff;
      }
    }
  }

  .field-hint {
    margin-top: 4px;
    font-size: 12px;
    color: #909399;
    line-height: 1.4;

    .edit-disabled-hint {
      color: #f56c6c;
      font-weight: 500;
    }
  }

  .employee-tag {
    margin-right: 8px;
    margin-bottom: 4px;
  }

  :deep(.el-form-item) {
    margin-bottom: 20px;
  }

  :deep(.el-radio) {
    margin-right: 20px;
  }

  :deep(.drawer-footer) {
    padding: 16px 24px;
    border-top: 1px solid #e4e7ed;
    background: #fafafa;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}

@media (max-width: 768px) {
  .position-form-drawer {
    :deep(.el-drawer) {
      width: 100% !important;
    }

    :deep(.el-form) {
      padding: 16px;
    }

    :deep(.drawer-footer) {
      flex-direction: column-reverse;

      .el-button {
        width: 100%;
      }
    }
  }
}
</style>
