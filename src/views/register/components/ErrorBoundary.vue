<!--
 * 文件名称：ErrorBoundary.vue
 * 文件描述：页面错误边界处理组件，用于捕获和处理页面级别的错误
 * 创建日期：2024-01-15
 * 修改记录：
 *   - 2024-01-15: 初始创建
-->

<template>
  <div class="error-boundary">
    <!-- 正常状态显示子组件 -->
    <div v-if="!hasError" class="content-wrapper">
      <slot />
    </div>

    <!-- 错误状态显示错误信息 -->
    <div v-else class="error-container">
      <div class="error-content">
        <!-- 错误图标 -->
        <div class="error-icon">
          <i class="el-icon-warning-outline" />
        </div>

        <!-- 错误标题 -->
        <h3 class="error-title">{{ errorTitle }}</h3>

        <!-- 错误描述 -->
        <p class="error-description">{{ errorDescription }}</p>

        <!-- 错误详情（开发环境显示） -->
        <div v-if="showErrorDetails && errorDetails" class="error-details">
          <el-collapse>
            <el-collapse-item title="错误详情" name="details">
              <pre class="error-stack">{{ errorDetails }}</pre>
            </el-collapse-item>
          </el-collapse>
        </div>

        <!-- 操作按钮 -->
        <div class="error-actions">
          <el-button
            type="primary"
            :loading="retrying"
            @click="handleRetry"
          >
            重试
          </el-button>

          <el-button
            :loading="reloading"
            @click="handleReload"
          >
            刷新页面
          </el-button>

          <el-button
            type="text"
            @click="handleGoHome"
          >
            返回首页
          </el-button>
        </div>

        <!-- 错误报告 -->
        <div class="error-report">
          <el-button
            type="text"
            size="small"
            :loading="reporting"
            @click="handleReportError"
          >
            <i class="el-icon-message" />
            报告此错误
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ErrorBoundary',

  props: {
    /**
     * 是否显示错误详情（通常在开发环境显示）
     */
    showErrorDetails: {
      type: Boolean,
      default: process.env.NODE_ENV === 'development'
    },

    /**
     * 自定义错误标题
     */
    customErrorTitle: {
      type: String,
      default: ''
    },

    /**
     * 自定义错误描述
     */
    customErrorDescription: {
      type: String,
      default: ''
    },

    /**
     * 是否启用自动重试
     */
    enableAutoRetry: {
      type: Boolean,
      default: false
    },

    /**
     * 自动重试间隔（毫秒）
     */
    autoRetryInterval: {
      type: Number,
      default: 3000
    },

    /**
     * 最大重试次数
     */
    maxRetryCount: {
      type: Number,
      default: 3
    }
  },

  data() {
    return {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      retrying: false,
      reloading: false,
      reporting: false,
      autoRetryTimer: null
    }
  },

  computed: {
    /**
     * 错误标题
     */
    errorTitle() {
      if (this.customErrorTitle) {
        return this.customErrorTitle
      }

      if (this.error) {
        // 根据错误类型返回不同标题
        if (this.error.name === 'ChunkLoadError') {
          return '资源加载失败'
        } else if (this.error.name === 'NetworkError') {
          return '网络连接错误'
        } else if (this.error.name === 'TypeError') {
          return '程序运行错误'
        }
      }

      return '页面出现错误'
    },

    /**
     * 错误描述
     */
    errorDescription() {
      if (this.customErrorDescription) {
        return this.customErrorDescription
      }

      if (this.error) {
        // 根据错误类型返回不同描述
        if (this.error.name === 'ChunkLoadError') {
          return '页面资源加载失败，可能是网络问题或服务器更新导致。请尝试刷新页面。'
        } else if (this.error.name === 'NetworkError') {
          return '网络连接出现问题，请检查您的网络连接后重试。'
        } else if (this.error.name === 'TypeError') {
          return '程序运行时出现错误，我们已记录此问题，请稍后重试。'
        }
      }

      return '页面运行时出现了意外错误，请尝试刷新页面或联系技术支持。'
    },

    /**
     * 错误详情
     */
    errorDetails() {
      if (!this.error) return ''

      let details = `错误名称: ${this.error.name}\n`
      details += `错误消息: ${this.error.message}\n`

      if (this.error.stack) {
        details += `\n错误堆栈:\n${this.error.stack}`
      }

      if (this.errorInfo) {
        details += `\n\n组件信息:\n${this.errorInfo}`
      }

      return details
    }
  },

  mounted() {
    // 监听全局错误
    window.addEventListener('error', this.handleGlobalError)
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection)
  },

  beforeDestroy() {
    // 清理事件监听器
    window.removeEventListener('error', this.handleGlobalError)
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection)

    // 清理定时器
    if (this.autoRetryTimer) {
      clearTimeout(this.autoRetryTimer)
    }
  },

  methods: {
    /**
     * 捕获错误
     */
    captureError(error, errorInfo = null) {
      console.error('ErrorBoundary 捕获到错误:', error)

      this.hasError = true
      this.error = error
      this.errorInfo = errorInfo

      // 触发错误事件
      this.$emit('error', {
        error,
        errorInfo,
        retryCount: this.retryCount
      })

      // 记录错误日志
      this.logError(error, errorInfo)

      // 启用自动重试
      if (this.enableAutoRetry && this.retryCount < this.maxRetryCount) {
        this.scheduleAutoRetry()
      }
    },

    /**
     * 处理全局错误
     */
    handleGlobalError(event) {
      const error = event.error || new Error(event.message)
      this.captureError(error, `文件: ${event.filename}, 行号: ${event.lineno}, 列号: ${event.colno}`)
    },

    /**
     * 处理未捕获的 Promise 拒绝
     */
    handleUnhandledRejection(event) {
      const error = event.reason instanceof Error ? event.reason : new Error(event.reason)
      this.captureError(error, 'Unhandled Promise Rejection')
    },

    /**
     * 重试操作
     */
    async handleRetry() {
      this.retrying = true
      this.retryCount++

      try {
        // 等待一段时间后重试
        await new Promise(resolve => setTimeout(resolve, 1000))

        // 重置错误状态
        this.resetError()

        // 触发重试事件
        this.$emit('retry', this.retryCount)
      } catch (error) {
        console.error('重试失败:', error)
        this.$message.error('重试失败，请稍后再试')
      } finally {
        this.retrying = false
      }
    },

    /**
     * 刷新页面
     */
    handleReload() {
      this.reloading = true

      // 触发刷新事件
      this.$emit('reload')

      // 延迟刷新，给用户反馈时间
      setTimeout(() => {
        window.location.reload()
      }, 500)
    },

    /**
     * 返回首页
     */
    handleGoHome() {
      this.$emit('go-home')
      this.$router.push('/')
    },

    /**
     * 报告错误
     */
    async handleReportError() {
      this.reporting = true

      try {
        // 收集错误信息
        const errorReport = {
          error: {
            name: this.error?.name,
            message: this.error?.message,
            stack: this.error?.stack
          },
          errorInfo: this.errorInfo,
          userAgent: navigator.userAgent,
          url: window.location.href,
          timestamp: new Date().toISOString(),
          retryCount: this.retryCount
        }

        // 这里可以发送错误报告到服务器
        console.log('错误报告:', errorReport)

        // 触发报告事件
        this.$emit('report-error', errorReport)

        this.$message.success('错误报告已提交，感谢您的反馈')
      } catch (error) {
        console.error('提交错误报告失败:', error)
        this.$message.error('提交错误报告失败，请稍后重试')
      } finally {
        this.reporting = false
      }
    },

    /**
     * 重置错误状态
     */
    resetError() {
      this.hasError = false
      this.error = null
      this.errorInfo = null

      // 清理自动重试定时器
      if (this.autoRetryTimer) {
        clearTimeout(this.autoRetryTimer)
        this.autoRetryTimer = null
      }
    },

    /**
     * 安排自动重试
     */
    scheduleAutoRetry() {
      if (this.autoRetryTimer) {
        clearTimeout(this.autoRetryTimer)
      }

      this.autoRetryTimer = setTimeout(() => {
        this.handleRetry()
      }, this.autoRetryInterval)
    },

    /**
     * 记录错误日志
     */
    logError(error, errorInfo) {
      // 这里可以发送错误日志到服务器
      const logData = {
        level: 'error',
        message: error.message,
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        },
        errorInfo,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      }

      console.error('错误日志:', logData)
    }
  }
}
</script>

<style lang="scss" scoped>
.error-boundary {
  width: 100%;
  height: 100%;

  .content-wrapper {
    width: 100%;
    height: 100%;
  }

  .error-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    padding: 40px 20px;

    .error-content {
      text-align: center;
      max-width: 600px;

      .error-icon {
        font-size: 64px;
        color: #f56c6c;
        margin-bottom: 20px;

        i {
          font-size: inherit;
        }
      }

      .error-title {
        font-size: 24px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 12px;
      }

      .error-description {
        font-size: 16px;
        color: #606266;
        line-height: 1.6;
        margin-bottom: 30px;
      }

      .error-details {
        margin-bottom: 30px;
        text-align: left;

        .error-stack {
          background-color: #f5f5f5;
          padding: 16px;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 12px;
          line-height: 1.4;
          color: #666;
          white-space: pre-wrap;
          word-break: break-all;
          max-height: 300px;
          overflow-y: auto;
        }
      }

      .error-actions {
        margin-bottom: 20px;

        .el-button {
          margin: 0 8px;
        }
      }

      .error-report {
        .el-button {
          color: #909399;

          &:hover {
            color: #409eff;
          }

          i {
            margin-right: 4px;
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .error-boundary {
    .error-container {
      padding: 20px 16px;

      .error-content {
        .error-icon {
          font-size: 48px;
        }

        .error-title {
          font-size: 20px;
        }

        .error-description {
          font-size: 14px;
        }

        .error-actions {
          .el-button {
            margin: 4px;
            display: block;
            width: 100%;

            &:not(:last-child) {
              margin-bottom: 8px;
            }
          }
        }
      }
    }
  }
}
</style>
