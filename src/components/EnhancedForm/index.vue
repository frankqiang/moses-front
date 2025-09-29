/**
* 增强表单组件
* 功能描述：增强的表单组件，专注于表单的数据处理和验证，支持多种模式和自定义验证
* 创建日期：2024-11-21
* 更新日期：2024-12-16 - 应用现代前端开发范式优化，增强用户体验和代码质量
*/
<template>
  <el-form
    ref="form"
    :model="formModel"
    :rules="enhancedRules"
    :label-width="labelWidth"
    :size="size"
    :disabled="mode === 'view' || actualLoading"
    :aria-label="`${mode === 'create' ? '创建' : mode === 'update' ? '编辑' : '查看'}表单`"
    role="form"
    @submit.native.prevent="handleSubmitClick"
  >
    <!-- 默认插槽提供表单内容 -->
    <slot
      :form="formModel"
      :mode="mode"
      :submit="handleSubmitClick"
      :reset="handleResetClick"
      :loading="actualLoading"
      :hasChanges="hasFormChanges"
      :setFieldValue="setFieldValue"
      :validate="validate"
    />

    <!-- 底部按钮插槽 -->
    <div v-if="$slots.footer || showFooter" class="form-footer" role="toolbar" :aria-label="'表单操作按钮区域'">
      <slot
        name="footer"
        :loading="actualLoading"
        :mode="mode"
        :submit="handleSubmitClick"
        :reset="handleResetClick"
        :hasChanges="hasFormChanges"
        :isValid="isFormValid"
      >
        <el-button :disabled="actualLoading" :aria-label="`重置表单到初始状态`" @click="handleResetClick">
          {{ resetButtonText }}
        </el-button>
        <el-button
          v-if="mode === 'create' && showContinueButton"
          type="primary"
          :loading="actualLoading"
          :disabled="!isFormValid || !hasFormChanges"
          :aria-label="`${continueButtonText}操作`"
          @click="handleContinueClick"
        >
          {{ continueButtonText }}
        </el-button>
        <el-button
          v-if="mode !== 'view'"
          type="primary"
          :loading="actualLoading"
          :disabled="!isFormValid || (!allowEmptySubmit && !hasFormChanges)"
          :aria-label="`${submitButtonText}表单`"
          @click="handleSubmitClick"
        >
          {{ submitButtonText }}
        </el-button>
      </slot>
    </div>

    <!-- 错误提示区域 -->
    <div v-if="showError && errorMessage" class="form-error" role="alert" aria-live="polite">
      <i class="el-icon-warning" aria-hidden="true" />
      <span class="error-text">{{ errorMessage }}</span>
      <el-button type="text" size="mini" :aria-label="'清除错误信息'" @click="clearError">
        <i class="el-icon-close" aria-hidden="true" />
      </el-button>
    </div>
  </el-form>
</template>

<script>
import { cloneDeep } from 'lodash'
import { debounce } from '@/utils'

export default {
  name: 'EnhancedForm',
  props: {
    // 表单数据 - 加强验证
    data: {
      type: Object,
      default: () => ({}),
      validator(value) {
        if (value !== null && typeof value !== 'object') {
          console.error('[EnhancedForm] data must be an object')
          return false
        }
        return true
      }
    },

    // 表单模式：create/update/view/copy - 已有验证
    mode: {
      type: String,
      default: 'create',
      validator: value => ['create', 'update', 'view', 'copy'].includes(value)
    },

    // 表单验证规则
    rules: {
      type: Object,
      default: () => ({}),
      validator(value) {
        if (value !== null && typeof value !== 'object') {
          console.error('[EnhancedForm] rules must be an object')
          return false
        }
        return true
      }
    },

    // 表单标签宽度 - 加强验证
    labelWidth: {
      type: String,
      default: '120px',
      validator(value) {
        const cssUnitRegex = /^\d+(\.\d+)?(px|%|rem|em|vw|vh|auto)$/
        if (!cssUnitRegex.test(value)) {
          console.error('[EnhancedForm] labelWidth must be a valid CSS unit (e.g., "120px", "10rem", "auto")')
          return false
        }
        return true
      }
    },

    // 表单尺寸
    size: {
      type: String,
      default: 'small',
      validator: value => ['large', 'small', 'mini'].includes(value)
    },

    // 是否显示底部按钮
    showFooter: {
      type: Boolean,
      default: false
    },

    // 提交按钮文本
    submitButtonText: {
      type: String,
      default: '提交'
    },

    // 重置按钮文本
    resetButtonText: {
      type: String,
      default: '重置'
    },

    // 继续按钮文本
    continueButtonText: {
      type: String,
      default: '保存并继续'
    },

    // 是否显示"保存并继续"按钮
    showContinueButton: {
      type: Boolean,
      default: false
    },

    // 加载状态
    loading: {
      type: Boolean,
      default: false
    },

    // 是否在提交前自动验证表单
    validateBeforeSubmit: {
      type: Boolean,
      default: true
    },

    // 是否允许空表单提交
    allowEmptySubmit: {
      type: Boolean,
      default: false
    },

    // 自动保存间隔(毫秒)，0表示禁用
    autoSaveInterval: {
      type: Number,
      default: 0,
      validator(value) {
        if (value < 0) {
          console.error('[EnhancedForm] autoSaveInterval must be >= 0')
          return false
        }
        return true
      }
    },

    // 是否在数据变化时自动验证
    validateOnDataChange: {
      type: Boolean,
      default: true
    },

    // 是否在数据更新时清除验证状态
    clearValidateOnDataUpdate: {
      type: Boolean,
      default: false
    },

    // 是否在组件初始化时禁用验证
    disableInitialValidation: {
      type: Boolean,
      default: false
    },

    /**
     * 是否同步内部变更到外部data
     * 当启用时，组件内部formModel的变更会自动同步到外部传入的data属性
     * 适用于复杂交互场景，如表单与其他组件联动时需要保持数据一致性
     * @since 2024-12-19
     */
    syncChanges: {
      type: Boolean,
      default: false
    },

    /**
     * 是否显示内置错误提示
     * 当设为false时，不显示组件内置的错误提示区域
     * 适用于使用外部错误提示机制的场景
     * @since 2024-12-19
     */
    showError: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      // 内部表单数据模型
      formModel: {},
      // 原始表单数据（用于重置和变更检测）
      originFormData: {},
      // 内部加载状态
      internalLoading: false,
      // 错误信息
      errorMessage: '',
      // 表单验证状态
      isFormValid: false,
      // 自动保存定时器
      autoSaveTimer: null,
      // 深度监听器引用
      dataWatcher: null,
      // 是否正在初始化数据
      isInitializingData: false,
      // 验证禁用标志
      validationDisabled: false
    }
  },

  computed: {
    // 实际的加载状态
    actualLoading() {
      return this.loading || this.internalLoading
    },

    // 表单是否有变更
    hasFormChanges() {
      return JSON.stringify(this.formModel) !== JSON.stringify(this.originFormData)
    },

    // 增强的验证规则
    enhancedRules() {
      const rules = { ...this.rules }

      // 可以在这里添加通用的验证规则增强
      Object.keys(rules).forEach(field => {
        if (Array.isArray(rules[field])) {
          rules[field] = rules[field].map(rule => {
            // 对于包含自定义验证器的规则，不覆盖message
            if (rule.validator) {
              return rule
            }
            return {
              ...rule,
              // 增强错误提示
              message: rule.message || `${field}字段验证失败`
            }
          })
        }
      })

      return rules
    }
  },

  watch: {
    // 监听外部data变化
    data: {
      handler(val) {
        this.updateFormModel(val)
      },
      deep: true,
      immediate: true
    },

    // 监听表单数据变化进行验证
    formModel: {
      handler(newVal) {
        if (this.validateOnDataChange && !this.validationDisabled && !this.isInitializingData) {
          this.debouncedValidate()
        }
        if (this.autoSaveInterval > 0) {
          this.scheduleAutoSave()
        }
        // 数据同步机制：当启用syncChanges时，将内部formModel变更同步到外部data
        // 使用JSON比较避免不必要的更新，使用cloneDeep确保数据独立性
        // 解决复杂交互场景下（如工艺路线编辑器）的数据一致性问题
        if (this.syncChanges && JSON.stringify(newVal) !== JSON.stringify(this.data)) {
          this.$emit('update:data', cloneDeep(newVal))
        }
      },
      deep: true
    }
  },

  created() {
    this.initDebouncedMethods()
  },

  mounted() {
    this.setupKeyboardListeners()
    if (this.autoSaveInterval > 0) {
      this.startAutoSave()
    }

    // 如果禁用初始验证，设置验证禁用标志
    if (this.disableInitialValidation) {
      this.validationDisabled = true
      // 延迟启用验证，给外部组件处理的时间
      setTimeout(() => {
        this.validationDisabled = false
      }, 500)
    }

    // 兼容父组件通过ref调用clearValidate
    this.$emit('hook:mounted')
    if (typeof this.clearValidate === 'function') {
      this.$parent && (this.$parent.$refs && this.$parent.$refs[this.$vnode.key || this.$options.name] === this) && (this.clearValidate = this.clearValidate.bind(this))
    }
  },

  beforeDestroy() {
    this.cleanup()
  },

  methods: {
    // 初始化防抖方法
    initDebouncedMethods() {
      this.debouncedSubmit = debounce(this.handleSubmit, 300)
      this.debouncedReset = debounce(this.resetForm, 300)
      this.debouncedValidate = debounce(this.validateForm, 300)
    },

    // 设置键盘监听
    setupKeyboardListeners() {
      this.handleKeydown = (event) => {
        // Ctrl+S 保存表单
        if (event.ctrlKey && event.key === 's') {
          event.preventDefault()
          if (this.mode !== 'view') {
            this.handleSubmitClick()
          }
        }

        // Ctrl+R 重置表单
        if (event.ctrlKey && event.key === 'r') {
          event.preventDefault()
          this.handleResetClick()
        }
      }

      document.addEventListener('keydown', this.handleKeydown)
    },

    // 清理资源
    cleanup() {
      if (this.debouncedSubmit?.cancel) {
        this.debouncedSubmit.cancel()
      }
      if (this.debouncedReset?.cancel) {
        this.debouncedReset.cancel()
      }
      if (this.debouncedValidate?.cancel) {
        this.debouncedValidate.cancel()
      }
      if (this.handleKeydown) {
        document.removeEventListener('keydown', this.handleKeydown)
      }
      if (this.autoSaveTimer) {
        clearInterval(this.autoSaveTimer)
      }
    },

    // 防抖版本的按钮点击处理
    handleSubmitClick() {
      this.debouncedSubmit()
    },

    handleResetClick() {
      this.debouncedReset()
    },

    handleContinueClick() {
      this.debouncedSubmit(true)
    },

    // 更新表单数据模型
    updateFormModel(val) {
      try {
        // 标记为数据初始化状态
        this.isInitializingData = true
        this.formModel = cloneDeep(val || {})
        this.originFormData = cloneDeep(val || {})
        this.clearError()

        // 如果启用了数据更新时清除验证
        if (this.clearValidateOnDataUpdate) {
          this.$nextTick(() => {
            this.clearValidate()
          })
        }

        // 通知父组件表单数据已更新
        this.$emit('form-update', this.formModel)
      } catch (error) {
        console.error('[EnhancedForm] Failed to update form model:', error)
        this.setError('更新表单数据失败')
      } finally {
        // 使用 nextTick 确保 DOM 更新完成后再取消初始化状态
        this.$nextTick(() => {
          this.isInitializingData = false
        })
      }
    },

    // 处理表单提交 - 增强错误处理
    async handleSubmit(continueEdit = false) {
      if (this.actualLoading) return

      try {
        // 查看模式不进行提交
        if (this.mode === 'view') {
          return
        }

        this.internalLoading = true
        this.clearError()

        // 判断是否需要验证
        if (this.validateBeforeSubmit) {
          await this.validateAndSubmit(continueEdit)
        } else {
          // 直接提交，不验证
          this.$emit('submit', cloneDeep(this.formModel), continueEdit)
        }
      } catch (error) {
        console.error('[EnhancedForm] Submit failed:', error)
        this.setError(error.message || '提交失败，请稍后重试')
        this.$emit('error', error)
      } finally {
        this.internalLoading = false
      }
    },

    // 保存并继续
    handleSubmitAndContinue() {
      this.handleSubmit(true)
    },

    // 验证并提交表单 - 增强错误处理
    async validateAndSubmit(continueEdit) {
      return new Promise((resolve, reject) => {
        if (!this.$refs.form) {
          reject(new Error('表单引用不存在'))
          return
        }

        this.$refs.form.validate(async(valid, invalidFields) => {
          try {
            if (valid) {
              // 触发自定义验证事件，允许父组件进行额外验证
              const customValidationResult = await new Promise((resolveCustom) => {
                this.$emit('validate', this.formModel, (isCustomValid) => {
                  resolveCustom(isCustomValid)
                })

                // 如果父组件没有处理自定义验证，默认通过
                this.$nextTick(() => {
                  resolveCustom(true)
                })
              })

              // 如果自定义验证通过
              if (customValidationResult !== false) {
                // 提交表单
                this.$emit('submit', cloneDeep(this.formModel), continueEdit)
                resolve()
              } else {
                reject(new Error('自定义验证失败'))
              }
            } else {
              // 验证失败，触发验证失败事件
              const errorMsg = this.formatValidationErrors(invalidFields)
              this.setError(errorMsg)
              this.$emit('validate-error', invalidFields)
              reject(new Error(errorMsg))
            }
          } catch (error) {
            reject(error)
          }
        })
      })
    },

    // 格式化验证错误信息
    formatValidationErrors(invalidFields) {
      if (!invalidFields) return '表单验证失败'

      const errors = Object.keys(invalidFields).map(field => {
        const fieldErrors = invalidFields[field]
        return fieldErrors[0]?.message || `${field}验证失败`
      })

      return errors.slice(0, 3).join('；') + (errors.length > 3 ? '等' : '')
    },

    // 重置表单 - 增强错误处理
    async resetForm() {
      if (this.actualLoading) return

      try {
        // 检查是否有未保存的更改
        if (this.hasFormChanges) {
          await this.$confirm('确定要重置表单吗？未保存的更改将丢失。', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })
        }

        this.$refs.form && this.$refs.form.resetFields()
        this.formModel = cloneDeep(this.originFormData)
        this.clearError()
        this.$emit('reset', this.formModel)
      } catch (error) {
        if (error !== 'cancel') {
          console.error('[EnhancedForm] Reset failed:', error)
          this.setError('重置表单失败')
        }
      }
    },

    // 验证表单 - 增强版本
    validateForm() {
      if (this.$refs.form) {
        this.$refs.form.validate((valid, invalidFields) => {
          this.isFormValid = valid
          if (!valid && invalidFields) {
            // 可以在这里处理验证失败的逻辑
            console.debug('[EnhancedForm] Validation failed:', invalidFields)
          }
        })
      }
    },

    // 手动触发表单验证
    validate(callback) {
      if (this.$refs.form) {
        this.$refs.form.validate((valid, invalidFields) => {
          this.isFormValid = valid
          if (callback) {
            callback(valid, invalidFields)
          }
        })
      } else {
        if (callback) {
          callback(false, {})
        }
      }
    },

    // 清除表单验证
    clearValidate(props) {
      this.$refs.form && this.$refs.form.clearValidate(props)
      this.isFormValid = true
    },

    // 获取表单数据
    getFormData() {
      return cloneDeep(this.formModel)
    },

    // 设置表单字段值 - 增强版本
    setFieldValue(field, value) {
      try {
        if (this.formModel) {
          this.$set(this.formModel, field, value)
          // 通知父组件字段更新
          this.$emit('field-change', { field, value, formData: this.formModel })
        }
      } catch (error) {
        console.error('[EnhancedForm] Failed to set field value:', error)
        this.setError(`设置字段${field}失败`)
      }
    },

    // 设置错误信息
    setError(message) {
      this.errorMessage = message
    },

    // 清除错误信息
    clearError() {
      this.errorMessage = ''
    },

    // 获取表单变更状态
    getChanges() {
      if (!this.hasFormChanges) return null

      const changes = {}
      Object.keys(this.formModel).forEach(key => {
        if (JSON.stringify(this.formModel[key]) !== JSON.stringify(this.originFormData[key])) {
          changes[key] = {
            from: this.originFormData[key],
            to: this.formModel[key]
          }
        }
      })

      return changes
    },

    // 启动自动保存
    startAutoSave() {
      if (this.autoSaveInterval > 0) {
        this.autoSaveTimer = setInterval(() => {
          if (this.hasFormChanges && this.isFormValid && !this.actualLoading) {
            this.$emit('auto-save', cloneDeep(this.formModel))
          }
        }, this.autoSaveInterval)
      }
    },

    // 调度自动保存
    scheduleAutoSave() {
      if (this.autoSaveTimer) {
        clearInterval(this.autoSaveTimer)
        this.startAutoSave()
      }
    },

    // 手动设置加载状态
    setLoading(loading) {
      this.internalLoading = loading
    },

    // 手动启用/禁用验证
    setValidationEnabled(enabled) {
      this.validationDisabled = !enabled
      if (enabled) {
        // 启用验证时立即执行一次验证
        this.$nextTick(() => {
          this.validateForm()
        })
      }
    },

    // 临时禁用验证执行操作
    withValidationDisabled(callback) {
      const originalState = this.validationDisabled
      this.validationDisabled = true
      try {
        callback()
      } finally {
        this.$nextTick(() => {
          this.validationDisabled = originalState
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.form-footer {
  margin-top: 20px;
  text-align: right;

  .el-button {
    margin-left: 10px;

    // 改善按钮的可访问性
    &:focus {
      box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.3);
    }

    // 禁用状态样式
    &.is-disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
}

// 错误提示区域
.form-error {
  margin-top: 16px;
  padding: 12px 16px;
  background-color: #fef0f0;
  border: 1px solid #fbc4c4;
  border-radius: 4px;
  color: #f56c6c;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .error-text {
    flex: 1;
    margin-left: 8px;
    font-size: 14px;
    line-height: 1.4;
  }

  .el-icon-warning {
    font-size: 16px;
    flex-shrink: 0;
  }

  .el-button {
    margin-left: 8px;
    color: #f56c6c;

    &:hover {
      color: #f78989;
    }
  }
}

// 加载状态下的表单样式
:deep(.el-form.is-disabled) {
  .el-form-item__content {
    opacity: 0.6;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .form-footer {
    text-align: center;

    .el-button {
      margin: 4px;
      display: block;
      width: 100%;
      max-width: 200px;
    }
  }

  .form-error {
    padding: 8px 12px;
    font-size: 13px;
  }
}

// 表单动画
.form-error {
  animation: slideInDown 0.3s ease-out;
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
