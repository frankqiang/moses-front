<template>
  <div class="template-number-range">
    <el-input-number
      v-model="localStart"
      :min="min"
      :max="localEnd || max"
      :precision="precision"
      :step="step"
      :disabled="disabled"
      :placeholder="startPlaceholder"
      size="small"
      controls-position="right"
      class="range-input"
      @change="handleChange"
    />
    <span class="range-separator">~</span>
    <el-input-number
      v-model="localEnd"
      :min="localStart || min"
      :max="max"
      :precision="precision"
      :step="step"
      :disabled="disabled"
      :placeholder="endPlaceholder"
      size="small"
      controls-position="right"
      class="range-input"
      @change="handleChange"
    />
  </div>
</template>

<script>
export default {
  name: 'TemplateNumberRange',
  props: {
    value: {
      type: [Object, String],
      default: () => ({})
    },
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: Infinity
    },
    precision: {
      type: Number,
      default: 0
    },
    step: {
      type: Number,
      default: 1
    },
    disabled: {
      type: Boolean,
      default: false
    },
    startPlaceholder: {
      type: String,
      default: '最小值'
    },
    endPlaceholder: {
      type: String,
      default: '最大值'
    }
  },
  data() {
    return {
      localStart: null,
      localEnd: null
    }
  },
  watch: {
    value: {
      immediate: true,
      deep: true,
      handler(val) {
        if (typeof val === 'string') {
          // 解析 "min-max" 格式的字符串
          const parts = val.split('-')
          this.localStart = parts[0] ? Number(parts[0]) : null
          this.localEnd = parts[1] ? Number(parts[1]) : null
        } else if (val && typeof val === 'object') {
          this.localStart = val.start !== undefined ? val.start : null
          this.localEnd = val.end !== undefined ? val.end : null
        } else {
          this.localStart = null
          this.localEnd = null
        }
      }
    }
  },
  methods: {
    handleChange() {
      const value = {
        start: this.localStart,
        end: this.localEnd
      }
      this.$emit('input', value)
      this.$emit('change', value)
    }
  }
}
</script>

<style scoped>
.template-number-range {
  display: flex;
  align-items: center;
  gap: 8px;
}

.range-input {
  flex: 1;
  min-width: 0;
}

.range-separator {
  color: #909399;
  font-weight: 500;
  flex-shrink: 0;
}

.template-number-range >>> .el-input-number {
  width: 100%;
}

.template-number-range >>> .el-input-number__decrease,
.template-number-range >>> .el-input-number__increase {
  width: 28px;
}
</style>

