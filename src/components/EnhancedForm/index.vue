/**
 * 增强表单组件
 * 功能描述：增强的表单组件，专注于表单的数据处理和验证，支持多种模式和自定义验证
 * 创建日期：2024-11-21
 */
<template>
  <el-form
    ref="form"
    :model="formModel"
    :rules="rules"
    :label-width="labelWidth"
    :size="size"
    :disabled="mode === 'view'"
    @submit.native.prevent="handleSubmit"
  >
    <!-- 默认插槽提供表单内容 -->
    <slot :form="formModel" :mode="mode" :submit="handleSubmit" :reset="resetForm" />

    <!-- 底部按钮插槽 -->
    <div v-if="$slots.footer || showFooter" class="form-footer">
      <slot name="footer" :loading="loading" :mode="mode" :submit="handleSubmit" :reset="resetForm">
        <el-button @click="resetForm">{{ resetButtonText }}</el-button>
        <el-button
          v-if="mode === 'create' && showContinueButton"
          type="primary"
          :loading="loading"
          @click="handleSubmitAndContinue"
        >
          {{ continueButtonText }}
        </el-button>
        <el-button
          v-if="mode !== 'view'"
          type="primary"
          :loading="loading"
          @click="handleSubmit"
        >
          {{ submitButtonText }}
        </el-button>
      </slot>
    </div>
  </el-form>
</template>

<script>
import { cloneDeep } from 'lodash'

export default {
  name: 'EnhancedForm',
  props: {
    // 表单数据
    data: {
      type: Object,
      default: () => ({})
    },
    // 表单模式：create/update/view
    mode: {
      type: String,
      default: 'create',
      validator: value => ['create', 'update', 'view'].includes(value)
    },
    // 表单验证规则
    rules: {
      type: Object,
      default: () => ({})
    },
    // 表单标签宽度
    labelWidth: {
      type: String,
      default: '120px'
    },
    // 表单尺寸
    size: {
      type: String,
      default: 'small'
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
    }
  },
  data() {
    return {
      // 内部表单数据模型
      formModel: {},
      // 原始表单数据（用于重置）
      originFormData: {}
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
    }
  },
  methods: {
    // 更新表单数据模型
    updateFormModel(val) {
      this.formModel = cloneDeep(val || {})
      this.originFormData = cloneDeep(val || {})

      // 通知父组件表单数据已更新
      this.$emit('form-update', this.formModel)
    },

    // 处理表单提交
    handleSubmit() {
      // 查看模式不进行提交
      if (this.mode === 'view') {
        return
      }

      // 判断是否需要验证
      if (this.validateBeforeSubmit) {
        this.validateAndSubmit(false)
      } else {
        // 直接提交，不验证
        this.$emit('submit', cloneDeep(this.formModel), false)
      }
    },

    // 保存并继续
    handleSubmitAndContinue() {
      if (this.validateBeforeSubmit) {
        this.validateAndSubmit(true)
      } else {
        this.$emit('submit', cloneDeep(this.formModel), true)
      }
    },

    // 验证并提交表单
    validateAndSubmit(continueEdit) {
      this.$refs.form.validate(valid => {
        if (valid) {
          // 触发自定义验证事件，允许父组件进行额外验证
          this.$emit('validate', this.formModel, isCustomValid => {
            // 如果没有自定义验证或自定义验证通过
            if (isCustomValid !== false) {
              // 提交表单
              this.$emit('submit', cloneDeep(this.formModel), continueEdit)
            }
          })
        } else {
          // 验证失败，触发验证失败事件
          this.$emit('validate-error')
          return false
        }
      })
    },

    // 重置表单
    resetForm() {
      this.$refs.form && this.$refs.form.resetFields()
      this.formModel = cloneDeep(this.originFormData)
      this.$emit('reset', this.formModel)
    },

    // 手动触发表单验证
    validate(callback) {
      if (this.$refs.form) {
        this.$refs.form.validate(valid => {
          callback(valid)
        })
      } else {
        callback(false)
      }
    },

    // 清除表单验证
    clearValidate(props) {
      this.$refs.form && this.$refs.form.clearValidate(props)
    },

    // 获取表单数据
    getFormData() {
      return cloneDeep(this.formModel)
    },

    // 设置表单字段值
    setFieldValue(field, value) {
      if (this.formModel) {
        this.$set(this.formModel, field, value)
        // 通知父组件字段更新
        this.$emit('field-change', { field, value, formData: this.formModel })
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
  }
}
</style>
