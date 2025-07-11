/**
 * 刷新按钮组件 - 现代化升级版
 * 功能描述：提供表格数据刷新功能，支持加载状态显示、防抖保护、错误处理和现代化UI设计
 * 创建日期：2023-12-10
 * 更新日期：2024-01-15
 */
<template>
  <error-boundary @error="handleError">
    <el-tooltip
      v-if="showTooltip && (title || text)"
      :content="tooltipContent"
      :disabled="disabled || !tooltipContent"
      placement="top"
      :open-delay="300"
    >
      <el-button
        :size="size"
        :type="type"
        :plain="plain"
        :round="round"
        :circle="circle"
        :disabled="disabled || currentLoading"
        :loading="currentLoading"
        :class="buttonClass"
        :aria-label="ariaLabel"
        @click="handleRefresh"
      >
        <i v-if="!currentLoading && !hideIcon && !circle" :class="currentIcon" />
        <span v-if="!circle && text">{{ text }}</span>
      </el-button>
    </el-tooltip>
    <el-button
      v-else
      :size="size"
      :type="type"
      :plain="plain"
      :round="round"
      :circle="circle"
      :disabled="disabled || currentLoading"
      :loading="currentLoading"
      :class="buttonClass"
      :aria-label="ariaLabel"
      @click="handleRefresh"
    >
      <i v-if="!currentLoading && !hideIcon && !circle" :class="currentIcon" />
      <span v-if="!circle && text">{{ text }}</span>
    </el-button>
  </error-boundary>
</template>

<script>
import { debounce } from '@/utils'

// 错误边界组件
const ErrorBoundary = {
  name: 'ErrorBoundary',
  render(h) {
    return this.$slots.default
  },
  errorCaptured(err, vm, info) {
    console.error('RefreshButton Error:', err, info)
    this.$emit('error', { error: err, vm, info })
    return false
  }
}

export default {
  name: 'RefreshButton',
  components: {
    ErrorBoundary
  },
  props: {
    // 按钮文本
    text: {
      type: String,
      default: '刷新',
      validator: value => typeof value === 'string' && value.length <= 20
    },

    // 按钮图标
    icon: {
      type: String,
      default: 'el-icon-refresh',
      validator: value => typeof value === 'string' && value.includes('icon')
    },

    // 是否隐藏图标
    hideIcon: {
      type: Boolean,
      default: false
    },

    // 按钮大小
    size: {
      type: String,
      default: 'mini',
      validator: value => ['large', 'medium', 'small', 'mini'].includes(value)
    },

    // 按钮类型
    type: {
      type: String,
      default: 'default',
      validator: value => ['primary', 'success', 'warning', 'danger', 'info', 'text', 'default'].includes(value)
    },

    // 是否为朴素按钮
    plain: {
      type: Boolean,
      default: false
    },

    // 是否为圆角按钮
    round: {
      type: Boolean,
      default: false
    },

    // 是否为圆形按钮
    circle: {
      type: Boolean,
      default: false
    },

    // 按钮标题（tooltip）
    title: {
      type: String,
      default: ''
    },

    // 是否禁用
    disabled: {
      type: Boolean,
      default: false
    },

    // 手动控制加载状态
    loading: {
      type: Boolean,
      default: false
    },

    // 点击后是否自动显示加载状态
    autoLoading: {
      type: Boolean,
      default: false
    },

    // 自动加载状态持续时间（毫秒）
    autoLoadingDuration: {
      type: Number,
      default: 500,
      validator: value => value >= 0 && value <= 10000
    },

    // 刷新前确认
    confirmBeforeRefresh: {
      type: Boolean,
      default: false
    },

    // 刷新确认文本
    confirmText: {
      type: String,
      default: '确定刷新数据吗？'
    },

    // 刷新确认标题
    confirmTitle: {
      type: String,
      default: '刷新确认'
    },

    // 防抖延迟时间（毫秒）
    debounceDelay: {
      type: Number,
      default: 300,
      validator: value => value >= 0 && value <= 5000
    },

    // 是否启用现代化特性
    enableModernFeatures: {
      type: Boolean,
      default: false
    },

    // 是否显示提示
    showTooltip: {
      type: Boolean,
      default: true
    },

    // 反馈模式
    feedbackMode: {
      type: String,
      default: 'error',
      validator: value => ['all', 'error', 'none'].includes(value)
    },

    // 自定义CSS类
    customClass: {
      type: String,
      default: ''
    },

    // 最大重试次数
    maxRetries: {
      type: Number,
      default: 3,
      validator: value => value >= 0 && value <= 10
    },

    // 重试延迟（毫秒）
    retryDelay: {
      type: Number,
      default: 1000,
      validator: value => value >= 0 && value <= 10000
    }
  },

  data() {
    return {
      // 内部加载状态
      internalLoading: false,
      // 加载定时器
      loadingTimer: null,
      // 重试次数
      retryCount: 0,
      // 错误状态
      hasError: false,
      // 上次刷新时间
      lastRefreshTime: null,
      // 防抖处理函数
      debouncedRefresh: null
    }
  },

  computed: {
    // 组合加载状态
    currentLoading() {
      return this.loading || this.internalLoading
    },

    // 当前图标
    currentIcon() {
      if (this.hasError) return 'el-icon-warning'
      return this.icon
    },

    // 按钮样式类
    buttonClass() {
      const classes = []

      if (this.customClass) {
        classes.push(this.customClass)
      }

      if (this.enableModernFeatures) {
        classes.push('modern-refresh-button')
      }

      if (this.hasError) {
        classes.push('error-state')
      }

      return classes.join(' ')
    },

    // 无障碍标签
    ariaLabel() {
      if (this.currentLoading) return '正在刷新数据'
      if (this.hasError) return '刷新出错，点击重试'
      return this.title || `${this.text}数据`
    },

    // 提示内容
    tooltipContent() {
      if (!this.showTooltip) return ''

      if (this.hasError) return '刷新出错，点击重试'
      if (this.currentLoading) return '正在刷新数据...'
      if (this.title) return this.title

      const baseText = `${this.text}数据`
      if (this.lastRefreshTime && this.enableModernFeatures) {
        return `${baseText}（上次刷新：${this.formatTime(this.lastRefreshTime)}）`
      }

      return baseText
    }
  },

  created() {
    this.initializeDebounce()
  },

  beforeDestroy() {
    this.cleanup()
  },

  methods: {
    // 初始化防抖函数
    initializeDebounce() {
      if (this.enableModernFeatures) {
        this.debouncedRefresh = debounce(() => {
          this.executeRefresh()
        }, this.debounceDelay)
      }
    },

    // 处理刷新点击
    handleRefresh() {
      if (this.disabled || this.currentLoading) return

      // 现代化特性：使用防抖
      if (this.enableModernFeatures && this.debouncedRefresh) {
        // 如需确认
        if (this.confirmBeforeRefresh) {
          this.showConfirmDialog()
        } else {
          this.debouncedRefresh()
        }
      } else {
        // 传统模式
        if (this.confirmBeforeRefresh) {
          this.showConfirmDialog()
        } else {
          this.executeRefresh()
        }
      }
    },

    // 显示确认对话框
    showConfirmDialog() {
      this.$confirm(this.confirmText, this.confirmTitle, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info',
        closeOnClickModal: false,
        closeOnPressEscape: true
      }).then(() => {
        if (this.enableModernFeatures && this.debouncedRefresh && !this.confirmBeforeRefresh) {
          this.debouncedRefresh()
        } else {
          this.executeRefresh()
        }
      }).catch(() => {
        this.$emit('cancel')
      })
    },

    // 执行刷新
    executeRefresh() {
      try {
        // 清除错误状态
        this.hasError = false
        this.retryCount = 0

        // 记录刷新时间
        if (this.enableModernFeatures) {
          this.lastRefreshTime = new Date()
        }

        // 如果开启自动加载状态
        if (this.autoLoading) {
          this.startLoading()
        }

        // 触发刷新事件
        this.$emit('refresh')

        // 现代化特性：触发成功事件
        if (this.enableModernFeatures) {
          this.$nextTick(() => {
            this.$emit('refresh-start', {
              timestamp: this.lastRefreshTime,
              retryCount: this.retryCount
            })
          })
        }
      } catch (error) {
        this.handleRefreshError(error)
      }
    },

    // 公开方法：供父组件调用，表示刷新成功
    refreshSucceed(message) {
      if (this.feedbackMode === 'all') {
        this.$message({
          message: message || '刷新成功',
          type: 'success',
          duration: 1500
        })
      }
      this.reset() // 重置内部状态，如错误
    },

    // 公开方法：供父组件调用，表示刷新失败
    refreshFail(message) {
      if (this.feedbackMode === 'all' || this.feedbackMode === 'error') {
        this.$message({
          message: message || '刷新失败，请稍后重试',
          type: 'error',
          duration: 3000
        })
      }
      this.hasError = true // 设置错误状态
    },

    // 开始加载状态
    startLoading() {
      this.clearLoadingTimer()
      this.internalLoading = true

      this.loadingTimer = setTimeout(() => {
        this.internalLoading = false

        // 现代化特性：触发完成事件
        if (this.enableModernFeatures) {
          this.$emit('refresh-complete', {
            timestamp: new Date(),
            duration: this.autoLoadingDuration
          })
        }
      }, this.autoLoadingDuration)
    },

    // 清除加载定时器
    clearLoadingTimer() {
      if (this.loadingTimer) {
        clearTimeout(this.loadingTimer)
        this.loadingTimer = null
      }
    },

    // 手动停止加载状态
    stopLoading() {
      this.clearLoadingTimer()
      this.internalLoading = false

      if (this.enableModernFeatures) {
        this.$emit('refresh-complete', {
          timestamp: new Date(),
          manual: true
        })
      }
    },

    // 重试刷新
    async retryRefresh() {
      if (this.retryCount >= this.maxRetries) {
        this.$emit('retry-exhausted', { maxRetries: this.maxRetries })
        return
      }

      this.retryCount++

      if (this.retryDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, this.retryDelay))
      }

      this.$emit('retry', { retryCount: this.retryCount })
      this.executeRefresh()
    },

    // 处理刷新错误
    handleRefreshError(error) {
      console.error('RefreshButton: 刷新失败', error)
      this.hasError = true
      this.internalLoading = false
      this.clearLoadingTimer()

      this.$emit('refresh-error', {
        error,
        retryCount: this.retryCount,
        canRetry: this.retryCount < this.maxRetries
      })

      // 现代化特性：自动重试
      if (this.enableModernFeatures && this.retryCount < this.maxRetries) {
        setTimeout(() => {
          this.retryRefresh()
        }, this.retryDelay)
      }
    },

    // 处理组件错误
    handleError(errorInfo) {
      console.error('RefreshButton: 组件错误', errorInfo)
      this.hasError = true
      this.$emit('component-error', errorInfo)
    },

    // 格式化时间
    formatTime(date) {
      if (!date) return ''

      const now = new Date()
      const diff = now - date

      if (diff < 60000) { // 1分钟内
        return '刚刚'
      } else if (diff < 3600000) { // 1小时内
        return `${Math.floor(diff / 60000)}分钟前`
      } else if (diff < 86400000) { // 1天内
        return `${Math.floor(diff / 3600000)}小时前`
      } else {
        return date.toLocaleTimeString()
      }
    },

    // 重置状态
    reset() {
      this.hasError = false
      this.retryCount = 0
      this.lastRefreshTime = null
      this.clearLoadingTimer()
      this.internalLoading = false
    },

    // 清理资源
    cleanup() {
      this.clearLoadingTimer()
      if (this.debouncedRefresh && typeof this.debouncedRefresh.cancel === 'function') {
        this.debouncedRefresh.cancel()
      }
    }
  }
}
</script>

<style scoped>
/* 现代化按钮样式 */
.modern-refresh-button {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.modern-refresh-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.modern-refresh-button:active {
  transform: translateY(0);
}

/* 错误状态样式 */
.error-state {
  border-color: #f56c6c !important;
  color: #f56c6c !important;
}

.error-state:hover {
  background-color: #fef0f0 !important;
  border-color: #f56c6c !important;
  color: #f56c6c !important;
}

/* 加载动画增强 */
.modern-refresh-button.is-loading {
  position: relative;
}

.modern-refresh-button.is-loading::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

/* 无障碍改进 */
.modern-refresh-button:focus {
  outline: 2px solid #409eff;
  outline-offset: 2px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .modern-refresh-button {
    min-width: 44px;
    min-height: 44px;
  }
}
</style>
