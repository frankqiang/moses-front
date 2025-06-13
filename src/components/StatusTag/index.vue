/**
 * 状态标签组件
 * 功能描述：根据状态值显示不同类型的标签，支持自定义文本、类型和颜色映射
 * 创建日期：2023-11-20
 * 更新日期：2024-12-19
 */
<template>
  <div class="status-tag-wrapper">
    <!-- 错误边界处理 -->
    <el-tag
      v-if="!hasError"
      :type="tagType"
      :effect="effect"
      :size="size"
      :color="customColor"
      :hit="hit"
      :closable="closable"
      :disable-transitions="disableTransitions"
      :class="tagClasses"
      :style="tagStyles"
      @click="handleClick"
      @close="handleClose"
    >
      <!-- 图标插槽 -->
      <i v-if="iconClass" :class="iconClass" class="status-tag-icon" />
      {{ displayText }}
    </el-tag>

    <!-- 错误后备显示 -->
    <el-tag v-else type="info" size="mini" effect="plain">
      {{ errorFallbackText }}
    </el-tag>
  </div>
</template>

<script>
// 导入工具函数
import { debounce } from '@/utils'

export default {
  name: 'StatusTag',

  props: {
    // 状态值
    status: {
      type: [String, Number, Boolean],
      required: true,
      validator(value) {
        // 允许 0、false 等假值
        return value !== null && value !== undefined
      }
    },

    // 状态文本映射 {状态值: 显示文本}
    textMap: {
      type: Object,
      default: () => ({}),
      validator(value) {
        return typeof value === 'object' && value !== null
      }
    },

    // 状态类型映射 {状态值: 类型} - 支持element-ui的tag类型
    typeMap: {
      type: Object,
      default: () => ({}),
      validator(value) {
        return typeof value === 'object' && value !== null
      }
    },

    // 状态颜色映射 {状态值: 颜色} - 优先级高于typeMap
    colorMap: {
      type: Object,
      default: () => ({}),
      validator(value) {
        return typeof value === 'object' && value !== null
      }
    },

    // 图标映射 {状态值: 图标类名}
    iconMap: {
      type: Object,
      default: () => ({}),
      validator(value) {
        return typeof value === 'object' && value !== null
      }
    },

    // 标签效果 (dark/plain/light)
    effect: {
      type: String,
      default: 'light',
      validator(value) {
        return ['dark', 'plain', 'light'].includes(value)
      }
    },

    // 标签大小 (medium/small/mini)
    size: {
      type: String,
      default: 'small',
      validator(value) {
        return ['medium', 'small', 'mini'].includes(value)
      }
    },

    // 是否显示边框描边
    hit: {
      type: Boolean,
      default: false
    },

    // 是否可关闭
    closable: {
      type: Boolean,
      default: false
    },

    // 是否禁用渐变动画
    disableTransitions: {
      type: Boolean,
      default: false
    },

    // 默认文本，当textMap中没有对应映射时显示
    defaultText: {
      type: String,
      default: ''
    },

    // 默认类型，当typeMap中没有对应映射时使用
    defaultType: {
      type: String,
      default: 'info',
      validator(value) {
        return ['success', 'info', 'warning', 'danger', 'primary'].includes(value)
      }
    },

    // 是否启用现代化特性
    enableModernFeatures: {
      type: Boolean,
      default: false
    },

    // 点击防抖延迟(ms)
    clickDebounceDelay: {
      type: Number,
      default: 300,
      validator(value) {
        return value >= 0 && value <= 5000
      }
    },

    // 错误后备文本
    errorFallbackText: {
      type: String,
      default: '错误'
    },

    // 自定义CSS类名
    customClass: {
      type: [String, Array, Object],
      default: ''
    },

    // 是否可点击
    clickable: {
      type: Boolean,
      default: false
    },

    // 最大显示文本长度
    maxTextLength: {
      type: Number,
      default: 0,
      validator(value) {
        return value >= 0
      }
    }
  },

  data() {
    return {
      hasError: false,
      errorInfo: null,
      clickCount: 0
    }
  },

  computed: {
    // 显示的文本
    displayText() {
      try {
        if (this.status === null || this.status === undefined) {
          return this.defaultText || '未知'
        }

        let text = ''
        if (this.textMap && this.textMap[this.status] !== undefined) {
          text = this.textMap[this.status]
        } else {
          text = this.defaultText || this.status.toString()
        }

        // 文本长度限制
        if (this.maxTextLength > 0 && text.length > this.maxTextLength) {
          return text.substring(0, this.maxTextLength) + '...'
        }

        return text
      } catch (error) {
        this.handleError(error, 'displayText计算错误')
        return this.errorFallbackText
      }
    },

    // 标签类型
    tagType() {
      try {
        if (this.status === null || this.status === undefined) {
          return this.defaultType
        }
        if (this.customColor) {
          return undefined // 使用自定义颜色时不指定type
        }
        if (this.typeMap && this.typeMap[this.status] !== undefined) {
          return this.typeMap[this.status]
        }
        return this.defaultType
      } catch (error) {
        this.handleError(error, 'tagType计算错误')
        return this.defaultType
      }
    },

    // 自定义颜色
    customColor() {
      try {
        if (this.status === null || this.status === undefined) {
          return undefined
        }
        if (this.colorMap && this.colorMap[this.status] !== undefined) {
          return this.colorMap[this.status]
        }
        return undefined
      } catch (error) {
        this.handleError(error, 'customColor计算错误')
        return undefined
      }
    },

    // 图标类名
    iconClass() {
      try {
        if (this.status === null || this.status === undefined) {
          return undefined
        }
        if (this.iconMap && this.iconMap[this.status] !== undefined) {
          return this.iconMap[this.status]
        }
        return undefined
      } catch (error) {
        this.handleError(error, 'iconClass计算错误')
        return undefined
      }
    },

    // 标签CSS类名
    tagClasses() {
      const classes = []

      if (this.clickable) {
        classes.push('status-tag-clickable')
      }

      if (this.customClass) {
        if (typeof this.customClass === 'string') {
          classes.push(this.customClass)
        } else if (Array.isArray(this.customClass)) {
          classes.push(...this.customClass)
        } else if (typeof this.customClass === 'object') {
          Object.keys(this.customClass).forEach(key => {
            if (this.customClass[key]) {
              classes.push(key)
            }
          })
        }
      }

      return classes
    },

    // 标签样式
    tagStyles() {
      const styles = {}

      if (this.clickable) {
        styles.cursor = 'pointer'
      }

      return styles
    }
  },

  created() {
    // 创建防抖函数
    if (this.enableModernFeatures) {
      this.debouncedClick = debounce(this.emitClick, this.clickDebounceDelay)
    }
  },

  errorCaptured(err, vm, info) {
    this.handleError(err, `组件错误: ${info}`)
    return false // 阻止错误传播
  },

  methods: {
    // 错误处理
    handleError(error, context = '未知错误') {
      this.hasError = true
      this.errorInfo = {
        message: error.message || error,
        context,
        timestamp: new Date().toISOString(),
        status: this.status
      }

      console.error(`[StatusTag错误] ${context}:`, error)

      // 触发错误事件
      this.$emit('error', this.errorInfo)

      // 错误上报
      if (window.errorReporter) {
        window.errorReporter.captureException(error, {
          component: 'StatusTag',
          context,
          status: this.status
        })
      }
    },

    // 重置错误状态
    resetError() {
      this.hasError = false
      this.errorInfo = null
      this.$emit('error-reset')
    },

    // 点击处理
    handleClick(event) {
      if (!this.clickable) return

      this.clickCount++

      if (this.enableModernFeatures && this.debouncedClick) {
        this.debouncedClick(event)
      } else {
        this.emitClick(event)
      }
    },

    // 发送点击事件
    emitClick(event) {
      this.$emit('click', {
        status: this.status,
        displayText: this.displayText,
        tagType: this.tagType,
        event,
        clickCount: this.clickCount
      })
    },

    // 关闭处理
    handleClose(event) {
      this.$emit('close', {
        status: this.status,
        displayText: this.displayText,
        event
      })
    },

    // 获取组件状态信息
    getStatusInfo() {
      return {
        status: this.status,
        displayText: this.displayText,
        tagType: this.tagType,
        customColor: this.customColor,
        iconClass: this.iconClass,
        hasError: this.hasError,
        errorInfo: this.errorInfo,
        clickCount: this.clickCount
      }
    }
  }
}
</script>

<style scoped>
.status-tag-wrapper {
  display: inline-block;
}

.status-tag-icon {
  margin-right: 4px;
}

.status-tag-clickable {
  transition: all 0.2s ease;
}

.status-tag-clickable:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.status-tag-clickable:active {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* 添加标签间距 */
.el-tag + .el-tag {
  margin-left: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .status-tag-wrapper {
    margin-bottom: 4px;
  }

  .el-tag + .el-tag {
    margin-left: 4px;
  }
}
</style>
