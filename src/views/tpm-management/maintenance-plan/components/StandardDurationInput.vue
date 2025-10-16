/**
 * 文件名称：StandardDurationInput.vue
 * 文件描述：标准工时输入组件，支持数值验证和单位显示
 * 创建日期：2025-10-15
 * 修改记录：
 *   - 2025-10-15: 初始创建
 */
<template>
  <div class="standard-duration-input">
    <el-input-number
      v-model="innerValue"
      :min="min"
      :max="max"
      :precision="precision"
      :step="step"
      :placeholder="placeholder"
      :disabled="disabled"
      :size="size"
      :controls-position="controlsPosition"
      style="width: 100%"
      @change="handleChange"
      @blur="handleBlur"
      @focus="handleFocus"
    />
    <span v-if="showUnit" class="duration-unit">{{ unit }}</span>
  </div>
</template>

<script>
export default {
  name: 'StandardDurationInput',

  props: {
    // v-model 绑定值
    value: {
      type: Number,
      default: null
    },
    // 最小值
    min: {
      type: Number,
      default: 0
    },
    // 最大值
    max: {
      type: Number,
      default: 999
    },
    // 数值精度
    precision: {
      type: Number,
      default: 2,
      validator: value => value >= 0 && value <= 10
    },
    // 步长
    step: {
      type: Number,
      default: 0.5
    },
    // 单位文本
    unit: {
      type: String,
      default: '小时'
    },
    // 是否显示单位
    showUnit: {
      type: Boolean,
      default: true
    },
    // 占位符
    placeholder: {
      type: String,
      default: '请输入标准工时'
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false
    },
    // 组件大小
    size: {
      type: String,
      default: 'small',
      validator: value => ['medium', 'small', 'mini'].includes(value)
    },
    // 控制按钮位置
    controlsPosition: {
      type: String,
      default: 'right',
      validator: value => ['', 'right'].includes(value)
    }
  },

  data() {
    return {
      innerValue: this.value,
      isFocused: false
    }
  },

  computed: {
    /**
     * 格式化显示的工时文本
     */
    formattedDuration() {
      if (this.innerValue === null || this.innerValue === undefined) {
        return ''
      }
      return `${this.innerValue}${this.unit}`
    }
  },

  watch: {
    value(newVal) {
      this.innerValue = newVal
    }
  },

  methods: {
    /**
     * 数值变更处理
     * @param {number} value - 变更后的值
     */
    handleChange(value) {
      this.$emit('input', value)
      this.$emit('change', value)

      // 发送格式化后的工时信息
      this.$emit('duration-change', {
        value,
        formatted: value !== null ? `${value}${this.unit}` : ''
      })
    },

    /**
     * 失焦处理
     * @param {Event} event - 失焦事件
     */
    handleBlur(event) {
      this.isFocused = false
      this.$emit('blur', event)

      // 验证值是否在范围内
      if (this.innerValue !== null) {
        if (this.innerValue < this.min) {
          this.innerValue = this.min
          this.$emit('input', this.min)
          this.$message.warning(`工时不能小于${this.min}${this.unit}`)
        } else if (this.innerValue > this.max) {
          this.innerValue = this.max
          this.$emit('input', this.max)
          this.$message.warning(`工时不能大于${this.max}${this.unit}`)
        }
      }
    },

    /**
     * 聚焦处理
     * @param {Event} event - 聚焦事件
     */
    handleFocus(event) {
      this.isFocused = true
      this.$emit('focus', event)
    }
  }
}
</script>

<style scoped>
.standard-duration-input {
  position: relative;
  display: inline-flex;
  align-items: center;
  width: 100%;
}

.duration-unit {
  position: absolute;
  right: 40px;
  color: #909399;
  font-size: 14px;
  pointer-events: none;
  user-select: none;
}

/* 当控制按钮在右侧时，单位文本需要调整位置 */
.standard-duration-input >>> .el-input-number--small .el-input-number__decrease,
.standard-duration-input >>> .el-input-number--small .el-input-number__increase {
  width: 32px;
}
</style>

