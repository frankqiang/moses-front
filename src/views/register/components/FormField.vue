/**
 * 表单字段组件
 * 功能描述：提供统一的表单输入体验，支持常用验证规则和多种输入类型
 * 创建日期：2024-01-20
 * 修改记录：
 *   - 2024-01-20: 初始创建，实现表单字段功能
 */
<template>
  <el-form-item
    :label="label"
    :prop="prop"
    :required="required"
    :rules="computedRules"
    :label-width="labelWidth"
    :class="fieldClass"
  >
    <!-- 输入框 -->
    <el-input
      v-if="type === 'input'"
      v-model="currentValue"
      :type="inputType"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :maxlength="maxlength"
      :show-word-limit="showWordLimit"
      :clearable="clearable"
      :show-password="showPassword"
      :prefix-icon="prefixIcon"
      :suffix-icon="suffixIcon"
      :size="size"
      @input="handleInput"
      @change="handleChange"
      @blur="handleBlur"
      @focus="handleFocus"
    >
      <template v-if="$slots.prepend" slot="prepend">
        <slot name="prepend"></slot>
      </template>
      <template v-if="$slots.append" slot="append">
        <slot name="append"></slot>
      </template>
      <template v-if="suffixIcon" slot="suffix">
        <i :class="suffixIcon" class="suffix-icon" @click="handleSuffixClick" />
      </template>
    </el-input>

    <!-- 文本域 -->
    <el-input
      v-else-if="type === 'textarea'"
      v-model="currentValue"
      type="textarea"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :maxlength="maxlength"
      :show-word-limit="showWordLimit"
      :rows="rows"
      :autosize="autosize"
      :resize="resize"
      :size="size"
      @input="handleInput"
      @change="handleChange"
      @blur="handleBlur"
      @focus="handleFocus"
    />

    <!-- 选择器 -->
    <el-select
      v-else-if="type === 'select'"
      v-model="currentValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :clearable="clearable"
      :filterable="filterable"
      :multiple="multiple"
      :size="size"
      @change="handleChange"
      @blur="handleBlur"
      @focus="handleFocus"
    >
      <el-option
        v-for="option in options"
        :key="option.value"
        :label="option.label"
        :value="option.value"
        :disabled="option.disabled"
      />
    </el-select>

    <!-- 日期选择器 -->
    <el-date-picker
      v-else-if="type === 'date'"
      v-model="currentValue"
      :type="dateType"
      :placeholder="placeholder"
      :disabled="disabled"
      :clearable="clearable"
      :format="dateFormat"
      :value-format="dateValueFormat"
      :size="size"
      @change="handleChange"
      @blur="handleBlur"
      @focus="handleFocus"
    />

    <!-- 数字输入框 -->
    <el-input-number
      v-else-if="type === 'number'"
      v-model="currentValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :min="min"
      :max="max"
      :step="step"
      :precision="precision"
      :controls="controls"
      :size="size"
      @change="handleChange"
      @blur="handleBlur"
      @focus="handleFocus"
    />

    <!-- 开关 -->
    <el-switch
      v-else-if="type === 'switch'"
      v-model="currentValue"
      :disabled="disabled"
      :active-text="activeText"
      :inactive-text="inactiveText"
      :active-value="activeValue"
      :inactive-value="inactiveValue"
      @change="handleChange"
    />

    <!-- 复选框组 -->
    <el-checkbox-group
      v-else-if="type === 'checkbox'"
      v-model="currentValue"
      :disabled="disabled"
      :size="size"
      @change="handleChange"
    >
      <el-checkbox
        v-for="option in options"
        :key="option.value"
        :label="option.value"
        :disabled="option.disabled"
      >
        {{ option.label }}
      </el-checkbox>
    </el-checkbox-group>

    <!-- 单选框组 -->
    <el-radio-group
      v-else-if="type === 'radio'"
      v-model="currentValue"
      :disabled="disabled"
      :size="size"
      @change="handleChange"
    >
      <el-radio
        v-for="option in options"
        :key="option.value"
        :label="option.value"
        :disabled="option.disabled"
      >
        {{ option.label }}
      </el-radio>
    </el-radio-group>

    <!-- 帮助文本 -->
    <div v-if="helpText" class="field-help-text">
      <i class="el-icon-info"></i>
      {{ helpText }}
    </div>

    <!-- 错误提示 -->
    <div v-if="errorMessage" class="field-error-text">
      <i class="el-icon-warning"></i>
      {{ errorMessage }}
    </div>
  </el-form-item>
</template>

<script>
// 常用验证规则
const VALIDATION_RULES = {
  // 必填验证
  required: {
    required: true,
    message: '此字段为必填项',
    trigger: 'blur'
  },
  
  // 邮箱验证
  email: {
    type: 'email',
    message: '请输入正确的邮箱地址',
    trigger: 'blur'
  },
  
  // 手机号验证
  phone: {
    pattern: /^1[3-9]\d{9}$/,
    message: '请输入正确的手机号码',
    trigger: 'blur'
  },
  
  // 用户名验证
  username: {
    pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5]{3,50}$/,
    message: '用户名只能包含字母、数字、下划线和中文字符，长度3-50位',
    trigger: 'blur'
  },
  
  // 密码验证
  password: {
    pattern: /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,20}$/,
    message: '密码必须包含至少一个字母和一个数字，长度6-20位',
    trigger: 'blur'
  },
  
  // 中文姓名验证
  chineseName: {
    pattern: /^[\u4e00-\u9fa5]{2,10}$/,
    message: '请输入正确的中文姓名（2-10个字符）',
    trigger: 'blur'
  },
  
  // 身份证号验证
  idCard: {
    pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
    message: '请输入正确的身份证号码',
    trigger: 'blur'
  }
}

export default {
  name: 'FormField',
  
  props: {
    /**
     * 字段值
     */
    value: {
      type: [String, Number, Boolean, Array, Date],
      default: ''
    },
    
    /**
     * 字段类型
     */
    type: {
      type: String,
      default: 'input',
      validator: value => [
        'input', 'textarea', 'select', 'date', 'number', 
        'switch', 'checkbox', 'radio'
      ].includes(value)
    },
    
    /**
     * 字段标签
     */
    label: {
      type: String,
      default: ''
    },
    
    /**
     * 字段属性名（用于表单验证）
     */
    prop: {
      type: String,
      default: ''
    },
    
    /**
     * 占位符文本
     */
    placeholder: {
      type: String,
      default: ''
    },
    
    /**
     * 是否必填
     */
    required: {
      type: Boolean,
      default: false
    },
    
    /**
     * 是否禁用
     */
    disabled: {
      type: Boolean,
      default: false
    },
    
    /**
     * 是否只读
     */
    readonly: {
      type: Boolean,
      default: false
    },
    
    /**
     * 验证规则类型
     */
    validationType: {
      type: [String, Array],
      default: ''
    },
    
    /**
     * 自定义验证规则
     */
    customRules: {
      type: Array,
      default: () => []
    },
    
    /**
     * 帮助文本
     */
    helpText: {
      type: String,
      default: ''
    },
    
    /**
     * 错误信息
     */
    errorMessage: {
      type: String,
      default: ''
    },
    
    /**
     * 组件尺寸
     */
    size: {
      type: String,
      default: 'medium',
      validator: value => ['large', 'medium', 'small', 'mini'].includes(value)
    },
    
    /**
     * 标签宽度
     */
    labelWidth: {
      type: String,
      default: ''
    },
    
    // 输入框特有属性
    inputType: {
      type: String,
      default: 'text'
    },
    maxlength: {
      type: Number,
      default: null
    },
    showWordLimit: {
      type: Boolean,
      default: false
    },
    clearable: {
      type: Boolean,
      default: true
    },
    showPassword: {
      type: Boolean,
      default: false
    },
    prefixIcon: {
      type: String,
      default: ''
    },
    suffixIcon: {
      type: String,
      default: ''
    },
    
    // 文本域特有属性
    rows: {
      type: Number,
      default: 3
    },
    autosize: {
      type: [Boolean, Object],
      default: false
    },
    resize: {
      type: String,
      default: 'vertical'
    },
    
    // 选择器特有属性
    options: {
      type: Array,
      default: () => []
    },
    filterable: {
      type: Boolean,
      default: false
    },
    multiple: {
      type: Boolean,
      default: false
    },
    
    // 日期选择器特有属性
    dateType: {
      type: String,
      default: 'date'
    },
    dateFormat: {
      type: String,
      default: 'yyyy-MM-dd'
    },
    dateValueFormat: {
      type: String,
      default: 'yyyy-MM-dd'
    },
    
    // 数字输入框特有属性
    min: {
      type: Number,
      default: -Infinity
    },
    max: {
      type: Number,
      default: Infinity
    },
    step: {
      type: Number,
      default: 1
    },
    precision: {
      type: Number,
      default: null
    },
    controls: {
      type: Boolean,
      default: true
    },
    
    // 开关特有属性
    activeText: {
      type: String,
      default: ''
    },
    inactiveText: {
      type: String,
      default: ''
    },
    activeValue: {
      type: [Boolean, String, Number],
      default: true
    },
    inactiveValue: {
      type: [Boolean, String, Number],
      default: false
    }
  },
  
  data() {
    return {
      currentValue: this.value
    }
  },
  
  computed: {
    /**
     * 计算后的验证规则
     */
    computedRules() {
      const rules = [...this.customRules]
      
      // 添加必填验证
      if (this.required) {
        rules.unshift({
          ...VALIDATION_RULES.required,
          message: this.label ? `${this.label}为必填项` : VALIDATION_RULES.required.message
        })
      }
      
      // 添加类型验证
      if (this.validationType) {
        const types = Array.isArray(this.validationType) ? this.validationType : [this.validationType]
        types.forEach(type => {
          if (VALIDATION_RULES[type]) {
            rules.push(VALIDATION_RULES[type])
          }
        })
      }
      
      return rules
    },
    
    /**
     * 字段样式类
     */
    fieldClass() {
      return {
        'form-field': true,
        'form-field--required': this.required,
        'form-field--disabled': this.disabled,
        'form-field--readonly': this.readonly,
        'form-field--error': !!this.errorMessage,
        [`form-field--${this.type}`]: true,
        [`form-field--${this.size}`]: true
      }
    }
  },
  
  watch: {
    value: {
      handler(newVal) {
        this.currentValue = newVal
      },
      immediate: true
    },
    
    currentValue(newVal) {
      this.$emit('input', newVal)
    }
  },
  
  methods: {
    /**
     * 处理输入事件
     */
    handleInput(value) {
      this.$emit('input', value)
    },
    
    /**
     * 处理变化事件
     */
    handleChange(value) {
      this.$emit('change', value)
    },
    
    /**
     * 处理失焦事件
     */
    handleBlur(event) {
      this.$emit('blur', event)
    },
    
    /**
     * 处理聚焦事件
     */
    handleFocus(event) {
      this.$emit('focus', event)
    },
    
    /**
     * 处理后缀图标点击事件
     */
    handleSuffixClick(event) {
      this.$emit('click-suffix', event)
    },
    
    /**
     * 验证字段
     */
    validate() {
      return new Promise((resolve, reject) => {
        this.$parent.validateField(this.prop, (errorMessage) => {
          if (errorMessage) {
            reject(new Error(errorMessage))
          } else {
            resolve()
          }
        })
      })
    },
    
    /**
     * 清除验证
     */
    clearValidate() {
      this.$parent.clearValidate(this.prop)
    }
  }
}
</script>

<style lang="scss" scoped>
.form-field {
  margin-bottom: 20px;
  
  .field-help-text {
    margin-top: 8px;
    font-size: 12px;
    color: #909399;
    line-height: 1.4;
    
    i {
      margin-right: 4px;
    }
  }
  
  .field-error-text {
    margin-top: 8px;
    font-size: 12px;
    color: #F56C6C;
    line-height: 1.4;
    
    i {
      margin-right: 4px;
    }
  }
  
  // 必填字段样式
  &.form-field--required {
    :deep(.el-form-item__label) {
      &::before {
        content: '*';
        color: #F56C6C;
        margin-right: 4px;
      }
    }
  }
  
  // 禁用状态样式
  &.form-field--disabled {
    opacity: 0.6;
  }
  
  // 错误状态样式
  &.form-field--error {
    :deep(.el-input__inner),
    :deep(.el-textarea__inner),
    :deep(.el-select .el-input__inner) {
      border-color: #F56C6C;
    }
  }
  
  // 不同尺寸样式
  &.form-field--large {
    :deep(.el-input),
    :deep(.el-select) {
      font-size: 16px;
    }
  }
  
  &.form-field--small {
    margin-bottom: 16px;
  }
  
  &.form-field--mini {
    margin-bottom: 12px;
  }
  
  // 后缀图标样式
  :deep(.suffix-icon) {
    cursor: pointer;
    color: #909399;
    transition: color 0.3s;
    
    &:hover {
      color: #409eff;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .form-field {
    margin-bottom: 16px;
    
    :deep(.el-form-item__label) {
      line-height: 1.4;
      margin-bottom: 8px;
    }
  }
}
</style>