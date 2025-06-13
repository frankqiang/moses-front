<template>
  <div :class="{'hidden':hidden}" class="pagination-container">
    <!-- 错误边界组件 -->
    <error-boundary v-if="enableModernFeatures" @error="handleError">
      <el-pagination
        :background="background"
        :current-page.sync="currentPage"
        :page-size.sync="pageSize"
        :layout="layout"
        :page-sizes="pageSizes"
        :total="total"
        :disabled="disabled || isLoading"
        v-bind="$attrs"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </error-boundary>

    <!-- 传统模式 -->
    <el-pagination
      v-else
      :background="background"
      :current-page.sync="currentPage"
      :page-size.sync="pageSize"
      :layout="layout"
      :page-sizes="pageSizes"
      :total="total"
      v-bind="$attrs"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />

    <!-- 重试按钮 (仅现代模式) -->
    <div v-if="enableModernFeatures && hasError && allowRetry" class="pagination-error">
      <p class="error-message">分页操作失败: {{ errorMessage }}</p>
      <el-button size="mini" type="primary" @click="handleRetry">重试</el-button>
    </div>

    <!-- 加载指示器 (仅现代模式) -->
    <div v-if="enableModernFeatures && isLoading" class="pagination-loading">
      <i class="el-icon-loading" />
      <span>{{ loadingText }}</span>
    </div>
  </div>
</template>

<script>
import { scrollTo } from '@/utils/scroll-to'

// 错误边界组件
const ErrorBoundary = {
  name: 'ErrorBoundary',
  data() {
    return {
      hasError: false,
      error: null
    }
  },
  errorCaptured(err, vm, info) {
    this.hasError = true
    this.error = err
    this.$emit('error', { error: err, info })
    console.error('Pagination组件错误:', err, info)
    return false
  },
  render(h) {
    if (this.hasError) {
      return h('div', { class: 'pagination-error-boundary' }, [
        h('p', '分页组件渲染出错，请稍后重试'),
        h('el-button', {
          props: { size: 'mini', type: 'primary' },
          on: { click: () => { this.hasError = false; this.error = null } }
        }, '重试')
      ])
    }
    return this.$slots.default
  }
}

// 防抖函数
function debounce(func, wait, immediate) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      timeout = null
      if (!immediate) func.apply(this, args)
    }
    const callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) func.apply(this, args)
  }
}

// 节流函数
function throttle(func, limit) {
  let inThrottle
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

export default {
  name: 'Pagination',
  components: {
    ErrorBoundary
  },
  props: {
    // 基础参数
    total: {
      required: true,
      type: Number,
      validator(value) {
        if (value < 0) {
          console.warn('Pagination: total should be non-negative')
          return false
        }
        return true
      }
    },
    page: {
      type: Number,
      default: 1,
      validator(value) {
        if (value < 1) {
          console.warn('Pagination: page should be greater than 0')
          return false
        }
        return true
      }
    },
    limit: {
      type: Number,
      default: 20,
      validator(value) {
        if (value < 1) {
          console.warn('Pagination: limit should be greater than 0')
          return false
        }
        return true
      }
    },
    pageSizes: {
      type: Array,
      default() {
        return [10, 20, 30, 50]
      },
      validator(value) {
        if (!Array.isArray(value) || value.length === 0) {
          console.warn('Pagination: pageSizes should be a non-empty array')
          return false
        }
        return value.every(size => typeof size === 'number' && size > 0)
      }
    },
    layout: {
      type: String,
      default: 'total, sizes, prev, pager, next, jumper'
    },
    background: {
      type: Boolean,
      default: true
    },
    autoScroll: {
      type: Boolean,
      default: true
    },
    hidden: {
      type: Boolean,
      default: false
    },

    // 现代化功能参数
    enableModernFeatures: {
      type: Boolean,
      default: false
    },
    // 禁用状态
    disabled: {
      type: Boolean,
      default: false
    },
    // 加载状态
    loading: {
      type: Boolean,
      default: false
    },
    // 加载文本
    loadingText: {
      type: String,
      default: '正在加载...'
    },
    // 防抖延迟
    debounceDelay: {
      type: Number,
      default: 300
    },
    // 是否允许重试
    allowRetry: {
      type: Boolean,
      default: true
    },
    // 滚动配置
    scrollOptions: {
      type: Object,
      default: () => ({
        position: 0,
        duration: 800,
        easing: 'ease-in-out'
      })
    },
    // 自定义滚动目标
    scrollTarget: {
      type: [String, Element],
      default: null
    },
    // 最大重试次数
    maxRetries: {
      type: Number,
      default: 3
    },
    // 错误消息显示时间
    errorDisplayTime: {
      type: Number,
      default: 3000
    }
  },

  data() {
    return {
      // 错误状态
      hasError: false,
      errorMessage: '',
      errorTimer: null,
      retryCount: 0,

      // 加载状态
      isLoading: false,
      loadingTimer: null,

      // 防抖处理器
      debouncedHandlers: new Map(),

      // 性能监控
      performanceMetrics: {
        startTime: 0,
        endTime: 0,
        duration: 0
      }
    }
  },

  computed: {
    currentPage: {
      get() {
        return this.page
      },
      set(val) {
        this.$emit('update:page', val)
      }
    },
    pageSize: {
      get() {
        return this.limit
      },
      set(val) {
        this.$emit('update:limit', val)
      }
    },
    // 总页数
    totalPages() {
      return Math.ceil(this.total / this.pageSize)
    },
    // 是否为第一页
    isFirstPage() {
      return this.currentPage === 1
    },
    // 是否为最后一页
    isLastPage() {
      return this.currentPage >= this.totalPages
    },
    // 当前显示范围
    displayRange() {
      const start = (this.currentPage - 1) * this.pageSize + 1
      const end = Math.min(this.currentPage * this.pageSize, this.total)
      return { start, end }
    }
  },

  watch: {
    loading: {
      handler(newVal) {
        if (this.enableModernFeatures) {
          this.isLoading = newVal
          if (newVal) {
            this.startPerformanceMonitoring()
          } else {
            this.endPerformanceMonitoring()
          }
        }
      },
      immediate: true
    },

    // 监听页码变化，校验合法性
    currentPage: {
      handler(newVal) {
        if (newVal > this.totalPages && this.totalPages > 0) {
          this.$nextTick(() => {
            this.currentPage = this.totalPages
          })
        }
      },
      immediate: true
    }
  },

  created() {
    if (this.enableModernFeatures) {
      this.initializeModernFeatures()
    }
  },

  beforeDestroy() {
    this.cleanup()
  },

  methods: {
    // 初始化现代化功能
    initializeModernFeatures() {
      // 创建防抖处理器
      this.debouncedHandlers.set('sizeChange', debounce(this.handleSizeChangeInternal, this.debounceDelay))
      this.debouncedHandlers.set('currentChange', debounce(this.handleCurrentChangeInternal, this.debounceDelay))

      // 创建节流滚动处理器
      this.throttledScroll = throttle(this.performScroll, 100)
    },

    // 处理页面大小变化
    handleSizeChange(val) {
      if (this.enableModernFeatures) {
        this.clearError()
        this.debouncedHandlers.get('sizeChange')(val)
      } else {
        this.handleSizeChangeInternal(val)
      }
    },

    // 处理当前页变化
    handleCurrentChange(val) {
      if (this.enableModernFeatures) {
        this.clearError()
        this.debouncedHandlers.get('currentChange')(val)
      } else {
        this.handleCurrentChangeInternal(val)
      }
    },

    // 内部页面大小变化处理
    handleSizeChangeInternal(val) {
      try {
        // 重置到第一页
        const newPage = 1
        this.$emit('pagination', { page: newPage, limit: val })

        if (this.autoScroll) {
          this.handleAutoScroll()
        }

        // 发出额外事件用于分析
        if (this.enableModernFeatures) {
          this.$emit('size-change', {
            newSize: val,
            oldSize: this.pageSize,
            page: newPage,
            timestamp: Date.now()
          })
        }
      } catch (error) {
        this.handlePaginationError(error, 'size-change')
      }
    },

    // 内部当前页变化处理
    handleCurrentChangeInternal(val) {
      try {
        this.$emit('pagination', { page: val, limit: this.pageSize })

        if (this.autoScroll) {
          this.handleAutoScroll()
        }

        // 发出额外事件用于分析
        if (this.enableModernFeatures) {
          this.$emit('current-change', {
            newPage: val,
            oldPage: this.currentPage,
            limit: this.pageSize,
            timestamp: Date.now()
          })
        }
      } catch (error) {
        this.handlePaginationError(error, 'current-change')
      }
    },

    // 处理自动滚动
    handleAutoScroll() {
      if (this.enableModernFeatures && this.throttledScroll) {
        this.throttledScroll()
      } else {
        this.performScroll()
      }
    },

    // 执行滚动
    performScroll() {
      const options = this.scrollOptions
      const target = this.scrollTarget

      if (target) {
        // 滚动到指定目标
        const element = typeof target === 'string' ? document.querySelector(target) : target
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      } else {
        // 滚动到页面顶部
        scrollTo(options.position, options.duration)
      }
    },

    // 处理分页错误
    handlePaginationError(error, action) {
      if (!this.enableModernFeatures) {
        console.error('分页操作失败:', error)
        return
      }

      this.hasError = true
      this.errorMessage = error.message || `${action} 操作失败`

      // 发出错误事件
      this.$emit('error', {
        error,
        action,
        page: this.currentPage,
        limit: this.pageSize,
        timestamp: Date.now()
      })

      // 自动清除错误消息
      if (this.errorTimer) {
        clearTimeout(this.errorTimer)
      }
      this.errorTimer = setTimeout(() => {
        this.clearError()
      }, this.errorDisplayTime)
    },

    // 清除错误状态
    clearError() {
      this.hasError = false
      this.errorMessage = ''
      if (this.errorTimer) {
        clearTimeout(this.errorTimer)
        this.errorTimer = null
      }
    },

    // 处理重试
    handleRetry() {
      if (this.retryCount >= this.maxRetries) {
        this.$message.error('重试次数已达上限，请刷新页面')
        return
      }

      this.retryCount++
      this.clearError()

      // 发出重试事件
      this.$emit('retry', {
        retryCount: this.retryCount,
        maxRetries: this.maxRetries,
        page: this.currentPage,
        limit: this.pageSize
      })
    },

    // 处理错误边界错误
    handleError(errorInfo) {
      console.error('分页组件错误边界捕获:', errorInfo)
      this.$emit('component-error', errorInfo)
    },

    // 开始性能监控
    startPerformanceMonitoring() {
      this.performanceMetrics.startTime = performance.now()
    },

    // 结束性能监控
    endPerformanceMonitoring() {
      this.performanceMetrics.endTime = performance.now()
      this.performanceMetrics.duration = this.performanceMetrics.endTime - this.performanceMetrics.startTime

      // 发出性能指标事件
      this.$emit('performance', {
        duration: this.performanceMetrics.duration,
        page: this.currentPage,
        limit: this.pageSize,
        total: this.total
      })
    },

    // 跳转到指定页
    goToPage(page) {
      if (page < 1 || page > this.totalPages) {
        console.warn(`页码 ${page} 超出范围 [1, ${this.totalPages}]`)
        return
      }
      this.currentPage = page
    },

    // 跳转到第一页
    goToFirst() {
      this.goToPage(1)
    },

    // 跳转到最后一页
    goToLast() {
      this.goToPage(this.totalPages)
    },

    // 上一页
    prevPage() {
      if (!this.isFirstPage) {
        this.goToPage(this.currentPage - 1)
      }
    },

    // 下一页
    nextPage() {
      if (!this.isLastPage) {
        this.goToPage(this.currentPage + 1)
      }
    },

    // 设置每页大小
    setPageSize(size) {
      if (this.pageSizes.includes(size)) {
        this.pageSize = size
      } else {
        console.warn(`页面大小 ${size} 不在允许的选项中`)
      }
    },

    // 获取当前状态
    getCurrentState() {
      return {
        page: this.currentPage,
        limit: this.pageSize,
        total: this.total,
        totalPages: this.totalPages,
        displayRange: this.displayRange,
        isFirstPage: this.isFirstPage,
        isLastPage: this.isLastPage,
        hasError: this.hasError,
        isLoading: this.isLoading
      }
    },

    // 清理资源
    cleanup() {
      // 清理定时器
      if (this.errorTimer) {
        clearTimeout(this.errorTimer)
      }
      if (this.loadingTimer) {
        clearTimeout(this.loadingTimer)
      }

      // 清理防抖处理器
      this.debouncedHandlers.clear()

      // 重置状态
      this.hasError = false
      this.isLoading = false
      this.retryCount = 0
    }
  }
}
</script>

<style scoped>
.pagination-container {
  background: #fff;
  padding: 10px 16px;
  position: relative;
}

.pagination-container.hidden {
  display: none;
}

/* 现代化功能样式 */
.pagination-error {
  margin-top: 10px;
  padding: 8px 12px;
  background: #fef0f0;
  border: 1px solid #fbc4c4;
  border-radius: 4px;
  color: #f56c6c;
  font-size: 12px;
}

.error-message {
  margin: 0 0 8px 0;
  font-size: 12px;
}

.pagination-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.9);
  padding: 10px 15px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  font-size: 12px;
  color: #666;
}

.pagination-loading i {
  margin-right: 5px;
}

.pagination-error-boundary {
  padding: 20px;
  text-align: center;
  background: #fef0f0;
  border: 1px solid #fbc4c4;
  border-radius: 4px;
  color: #f56c6c;
}

/* 无障碍访问优化 */
.pagination-container :focus {
  outline: 2px solid #409eff;
  outline-offset: 2px;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .pagination-container {
    padding: 8px 12px;
  }

  .pagination-container ::v-deep .el-pagination {
    text-align: center;
  }

  .pagination-container ::v-deep .el-pagination .el-pager {
    margin-left: 0;
  }
}

/* 加载状态动画 */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.pagination-loading {
  animation: fadeIn 0.3s ease-in;
}

/* 错误状态动画 */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.pagination-error {
  animation: slideDown 0.3s ease-out;
}
</style>
