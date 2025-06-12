/**
 * 导出按钮组件
 * 功能描述：将表格数据导出为Excel文件，支持自定义文件名和导出前确认
 * 创建日期：2023-12-10
 * 更新日期：2024-12-20
 * 优化内容：添加防抖保护、增强错误处理、优化内存管理和用户体验
 */
<template>
  <el-button
    :type="type"
    :size="size"
    :disabled="disabled || loading"
    :loading="loading"
    @click="debouncedHandleExport"
  >
    <i v-if="icon" :class="icon" />
    <span>{{ text }}</span>
  </el-button>
</template>

<script>
import { debounce } from '@/utils'

export default {
  name: 'ExportButton',
  props: {
    // 导出API方法，接收参数并返回Promise
    exportApi: {
      type: Function,
      required: true,
      validator(value) {
        if (typeof value !== 'function') {
          console.error('ExportButton: exportApi must be a function')
          return false
        }
        return true
      }
    },
    // 导出参数，会传递给exportApi
    params: {
      type: Object,
      default: () => ({}),
      validator(value) {
        if (value !== null && typeof value !== 'object') {
          console.error('ExportButton: params must be an object')
          return false
        }
        return true
      }
    },
    // 导出文件名（不含扩展名）
    filename: {
      type: String,
      default: '导出数据',
      validator(value) {
        // 检查文件名是否包含非法字符
        const invalidChars = /[<>:"/\\|?*]/
        if (invalidChars.test(value)) {
          console.error('ExportButton: filename contains invalid characters')
          return false
        }
        return true
      }
    },
    // 文件类型（扩展名，不含点号）
    fileType: {
      type: String,
      default: 'xlsx',
      validator(value) {
        const supportedTypes = ['xlsx', 'xls', 'csv', 'pdf']
        if (!supportedTypes.includes(value.toLowerCase())) {
          console.warn(`ExportButton: fileType "${value}" may not be supported. Supported types: ${supportedTypes.join(', ')}`)
        }
        return true
      }
    },
    // 按钮文本
    text: {
      type: String,
      default: '导出'
    },
    // 按钮图标
    icon: {
      type: String,
      default: 'el-icon-download'
    },
    // 按钮类型
    type: {
      type: String,
      default: 'primary',
      validator(value) {
        const validTypes = ['primary', 'success', 'warning', 'danger', 'info', 'text']
        return validTypes.includes(value)
      }
    },
    // 按钮大小
    size: {
      type: String,
      default: 'small',
      validator(value) {
        const validSizes = ['medium', 'small', 'mini']
        return validSizes.includes(value)
      }
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false
    },
    // 导出前是否需要确认
    needConfirm: {
      type: Boolean,
      default: true
    },
    // 确认提示文本
    confirmText: {
      type: String,
      default: '确认导出当前筛选条件下的所有数据吗？'
    },
    // 导出成功提示文本
    successText: {
      type: String,
      default: '导出成功'
    },
    // 导出失败提示文本
    errorText: {
      type: String,
      default: '导出失败'
    },
    // MIME类型
    mimeType: {
      type: String,
      default: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    },
    // 防抖延迟时间（毫秒）
    debounceDelay: {
      type: Number,
      default: 500,
      validator(value) {
        return value >= 0 && value <= 5000
      }
    },
    // 请求超时时间（毫秒）
    timeout: {
      type: Number,
      default: 30000,
      validator(value) {
        return value > 0 && value <= 300000 // 最长5分钟
      }
    },
    // 是否启用现代化特性
    enableModernFeatures: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loading: false,
      exportController: null, // 用于取消请求
      downloadUrls: new Set() // 跟踪创建的URL对象
    }
  },
  computed: {
    // 完整文件名（含扩展名）
    fullFilename() {
      if (this.enableModernFeatures) {
        // 现代化时间戳格式 YYYYMMDD_HHMMSS
        const now = new Date()
        const timestamp = now.getFullYear() +
          String(now.getMonth() + 1).padStart(2, '0') +
          String(now.getDate()).padStart(2, '0') + '_' +
          String(now.getHours()).padStart(2, '0') +
          String(now.getMinutes()).padStart(2, '0') +
          String(now.getSeconds()).padStart(2, '0')
        return `${this.filename}_${timestamp}.${this.fileType}`
      } else {
        // 兼容模式
        const timestamp = new Date().toLocaleDateString('zh-CN').replace(/\//g, '')
        return `${this.filename}_${timestamp}.${this.fileType}`
      }
    }
  },
  created() {
    // 创建防抖函数
    this.debouncedHandleExport = debounce(this.handleExport, this.debounceDelay)
  },
  beforeDestroy() {
    // 清理资源
    this.cleanup()
  },
  methods: {
    // 处理导出点击事件
    handleExport() {
      if (this.loading) return // 防止重复点击

      if (this.needConfirm) {
        this.$confirm(this.confirmText, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info',
          closeOnClickModal: false,
          closeOnPressEscape: false
        }).then(() => {
          this.executeExport()
        }).catch(() => {
          // 用户取消导出
          this.$emit('cancel')
        })
      } else {
        this.executeExport()
      }
    },

    // 执行导出
    executeExport() {
      this.loading = true
      this.$emit('export-start', this.params)

      // 创建可取消的Promise
      const exportPromise = this.createCancellableExport()

      exportPromise.then(response => {
        if (this.enableModernFeatures) {
          this.handleModernResponse(response)
        } else {
          this.handleLegacyResponse(response)
        }
      }).catch(error => {
        this.handleExportError(error)
      }).finally(() => {
        this.loading = false
        this.exportController = null
        this.$emit('export-complete')
      })
    },

    // 创建可取消的导出请求
    createCancellableExport() {
      if (this.enableModernFeatures && typeof AbortController !== 'undefined') {
        // 现代化：使用AbortController
        this.exportController = new AbortController()
        return this.exportApi({
          ...this.params,
          signal: this.exportController.signal,
          timeout: this.timeout
        })
      } else {
        // 兼容模式：使用超时
        return Promise.race([
          this.exportApi(this.params),
          new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Export timeout')), this.timeout)
          })
        ])
      }
    },

    // 处理现代化响应
    handleModernResponse(response) {
      try {
        // 检查是否是Mock数据
        if (typeof response.data === 'string' && response.data.includes('export-success')) {
          // Mock环境处理
          this.$message.success(`${this.successText}（Mock环境）`)
          this.$emit('export-success', { isMock: true, filename: this.fullFilename })
        } else {
          // 实际环境处理文件下载
          this.downloadFileModern(response.data)
          this.$message.success(this.successText)
          this.$emit('export-success', { filename: this.fullFilename, size: response.data.size })
        }
      } catch (error) {
        console.error('处理导出响应失败:', error)
        throw new Error(`响应处理失败: ${error.message}`)
      }
    },

    // 处理传统响应（向后兼容）
    handleLegacyResponse(response) {
      // 检查是否是Mock数据
      if (typeof response.data === 'string' && response.data.includes('export-success')) {
        // Mock环境处理
        this.$message.success(`${this.successText}（Mock环境）`)
        this.$emit('export-success', { isMock: true })
      } else {
        // 实际环境处理文件下载
        this.downloadFile(response.data)
        this.$message.success(this.successText)
        this.$emit('export-success', { filename: this.fullFilename })
      }
    },

    // 处理导出错误
    handleExportError(error) {
      console.error('导出错误:', error)
      
      let errorMessage = this.errorText
      let shouldRetry = false

      if (error.name === 'AbortError') {
        errorMessage = '导出已取消'
      } else if (error.message === 'Export timeout') {
        errorMessage = '导出超时，请稍后重试'
        shouldRetry = true
      } else if (error.response) {
        // API错误
        const status = error.response.status
        if (status >= 500) {
          errorMessage = '服务器错误，请稍后重试'
          shouldRetry = true
        } else if (status === 403) {
          errorMessage = '没有导出权限'
        } else if (status === 404) {
          errorMessage = '导出接口不存在'
        } else {
          errorMessage = error.response.data?.message || this.errorText
        }
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage = '网络错误，请检查网络连接'
        shouldRetry = true
      }

      if (this.enableModernFeatures && shouldRetry) {
        // 现代化：提供重试选项
        this.$confirm(errorMessage, '导出失败', {
          confirmButtonText: '重试',
          cancelButtonText: '取消',
          type: 'error',
          closeOnClickModal: false
        }).then(() => {
          this.executeExport()
        }).catch(() => {
          this.$emit('export-error', error)
        })
      } else {
        this.$message.error(errorMessage)
        this.$emit('export-error', error)
      }
    },

    // 现代化文件下载
    downloadFileModern(data) {
      try {
        // 检查数据类型
        if (!data || (typeof data !== 'object' && typeof data !== 'string')) {
          throw new Error('Invalid export data format')
        }

        // 创建Blob对象
        const blob = new Blob([data], { type: this.mimeType })
        
        // 检查浏览器支持
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
          // IE浏览器
          window.navigator.msSaveOrOpenBlob(blob, this.fullFilename)
        } else {
          // 现代浏览器
          const url = URL.createObjectURL(blob)
          this.downloadUrls.add(url) // 跟踪URL
          
          const link = document.createElement('a')
          link.href = url
          link.download = this.fullFilename
          link.style.display = 'none'
          
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          
          // 延迟清理URL，确保下载完成
          setTimeout(() => {
            URL.revokeObjectURL(url)
            this.downloadUrls.delete(url)
          }, 1000)
        }
      } catch (error) {
        console.error('文件下载失败:', error)
        throw new Error(`文件下载失败: ${error.message}`)
      }
    },

    // 传统文件下载（向后兼容）
    downloadFile(data) {
      // 创建Blob对象
      const blob = new Blob([data], { type: this.mimeType })

      // 创建下载链接
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = this.fullFilename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(link.href)
    },

    // 取消导出
    cancelExport() {
      if (this.exportController && this.enableModernFeatures) {
        this.exportController.abort()
        this.$message.info('导出已取消')
      }
    },

    // 清理资源
    cleanup() {
      // 取消进行中的请求
      if (this.exportController) {
        this.exportController.abort()
      }
      
      // 清理防抖函数
      if (this.debouncedHandleExport && this.debouncedHandleExport.cancel) {
        this.debouncedHandleExport.cancel()
      }
      
      // 清理所有创建的URL
      this.downloadUrls.forEach(url => {
        URL.revokeObjectURL(url)
      })
      this.downloadUrls.clear()
    }
  }
}
</script>

<style scoped>
/* 组件样式可根据项目需要调整 */
.el-button {
  /* 添加过渡效果 */
  transition: all 0.3s ease;
}

.el-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.el-button:active {
  transform: translateY(0);
}

.el-button[disabled] {
  transform: none !important;
  box-shadow: none !important;
}
</style>
