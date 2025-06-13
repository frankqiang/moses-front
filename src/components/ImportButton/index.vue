/**
 * 导入按钮组件
 * 功能描述：提供通用的数据导入功能，支持文件上传、模板下载和结果展示
 * 创建日期：2023-12-10
 * 更新日期：2024-12-20
 * 优化内容：添加防抖保护、增强错误处理、支持请求取消、优化用户体验和内存管理
 */
<template>
  <div class="import-button-container">
    <!-- 触发按钮 -->
    <el-button
      :type="type"
      :size="size"
      :disabled="disabled || loading"
      @click="debouncedShowImportDialog"
    >
      <i v-if="icon" :class="icon" />
      <span>{{ text }}</span>
    </el-button>

    <!-- 导入对话框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      :width="dialogWidth"
      :close-on-click-modal="false"
      :close-on-press-escape="!loading"
      @close="handleDialogClose"
    >
      <div v-if="!importResult" class="import-container">
        <!-- 上传区域 -->
        <el-upload
          class="upload-area"
          drag
          action="#"
          :auto-upload="false"
          :show-file-list="showFileList"
          :on-change="handleFileChange"
          :before-upload="beforeUpload"
          :on-progress="handleUploadProgress"
          :multiple="enableModernFeatures ? enableMultipleFiles : false"
          :accept="acceptTypes"
          :disabled="loading"
          :limit="enableMultipleFiles ? maxFileCount : 1"
          :on-exceed="handleExceedLimit"
        >
          <i class="el-icon-upload" />
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <div slot="tip" class="el-upload__tip">
            {{ getFileTypeTip() }}
            <br v-if="templateApi">
            <el-link
              v-if="templateApi"
              type="primary"
              :underline="false"
              @click.stop="debouncedDownloadTemplate"
            >
              {{ templateText }}
            </el-link>
          </div>
        </el-upload>

        <!-- 上传进度 -->
        <div v-if="uploadProgress > 0 && uploadProgress < 100" class="upload-progress">
          <el-progress
            :percentage="uploadProgress"
            :stroke-width="8"
            :show-text="true"
            status="active"
          />
          <p class="progress-text">正在上传文件...</p>
        </div>

        <!-- 已选择的文件信息 -->
        <div v-if="selectedFiles.length > 0" class="file-info-list">
          <div class="file-info-header">
            <span>已选择{{ selectedFiles.length }}个文件</span>
            <el-button
              type="text"
              icon="el-icon-delete"
              :disabled="loading"
              @click="clearSelectedFiles"
            >
              全部移除
            </el-button>
          </div>
          <div v-for="(file, index) in selectedFiles" :key="index" class="file-info">
            <div class="file-details">
              <span class="file-name">{{ file.name }}</span>
              <span class="file-size">{{ formatFileSize(file.size) }}</span>
            </div>
            <el-button
              type="text"
              icon="el-icon-delete"
              :disabled="loading"
              @click="removeFile(index)"
            >
              移除
            </el-button>
          </div>
        </div>

        <!-- 导入说明 -->
        <div class="import-tips">
          <div class="tips-title">
            <i class="el-icon-info" style="color: #E6A23C;" />
            {{ tipTitle }}
          </div>
          <slot name="tips">
            <ol>
              <li>请先下载导入模板，按照模板格式填写数据</li>
              <li>所有标有*的字段为必填项</li>
              <li>编码字段不能重复</li>
              <li>数据格式需符合系统要求，详见模板中的说明</li>
              <li v-if="enableMultipleFiles">支持同时选择多个文件进行批量导入</li>
            </ol>
          </slot>
        </div>
      </div>

      <!-- 导入结果展示 -->
      <div v-else class="import-result">
        <el-result
          :icon="getResultIcon()"
          :title="getResultTitle()"
          :sub-title="getResultSubTitle()"
        >
          <template slot="extra">
            <el-button type="primary" @click="resetImport">继续导入</el-button>
            <el-button @click="handleDialogClose">关闭</el-button>
            <el-button
              v-if="importResult.errors && importResult.errors.length > 0"
              type="warning"
              @click="exportErrorData"
            >
              导出错误数据
            </el-button>
          </template>

          <!-- 失败数据展示 -->
          <div v-if="importResult.fail > 0 && importResult.errors" class="error-list">
            <div class="error-title">
              失败详情（共{{ importResult.errors.length }}条错误）：
            </div>
            <el-table
              :data="paginatedErrors"
              max-height="300"
              border
              stripe
              style="width: 100%"
            >
              <el-table-column type="index" label="#" width="50" />
              <el-table-column v-if="showRowNumber" prop="row" label="行号" width="80" />
              <el-table-column prop="message" label="错误原因" min-width="250" />
              <el-table-column v-if="showFileName" prop="fileName" label="文件名" width="150" />
            </el-table>

            <!-- 分页 -->
            <div v-if="importResult.errors.length > pageSize" class="error-pagination">
              <el-pagination
                small
                :current-page="currentPage"
                :page-size="pageSize"
                :total="importResult.errors.length"
                layout="prev, pager, next"
                @current-change="handlePageChange"
              />
            </div>
          </div>
        </el-result>
      </div>

      <div v-if="!importResult" slot="footer" class="dialog-footer">
        <el-button :disabled="loading" @click="handleDialogClose">{{ cancelText }}</el-button>
        <el-button
          v-if="loading && enableModernFeatures"
          type="danger"
          @click="cancelImport"
        >
          取消导入
        </el-button>
        <el-button
          type="primary"
          :loading="loading"
          :disabled="selectedFiles.length === 0"
          @click="debouncedSubmitImport"
        >
          {{ confirmText }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { debounce } from '@/utils'

export default {
  name: 'ImportButton',
  props: {
    // 导入API方法
    importApi: {
      type: Function,
      required: true,
      validator(value) {
        if (typeof value !== 'function') {
          console.error('ImportButton: importApi must be a function')
          return false
        }
        return true
      }
    },
    // 模板下载API方法
    templateApi: {
      type: Function,
      default: null,
      validator(value) {
        if (value !== null && typeof value !== 'function') {
          console.error('ImportButton: templateApi must be a function or null')
          return false
        }
        return true
      }
    },
    // 按钮文本
    text: {
      type: String,
      default: '导入'
    },
    // 按钮图标
    icon: {
      type: String,
      default: 'el-icon-upload2'
    },
    // 按钮类型
    type: {
      type: String,
      default: 'primary',
      validator(value) {
        const validTypes = ['default', 'primary', 'success', 'warning', 'danger', 'info', 'text']
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
    // 对话框标题
    dialogTitle: {
      type: String,
      default: '导入数据'
    },
    // 对话框宽度
    dialogWidth: {
      type: String,
      default: '550px',
      validator(value) {
        // 验证是否为有效的CSS宽度值
        return /^\d+(px|%|em|rem|vw)$/.test(value)
      }
    },
    // 是否显示文件列表
    showFileList: {
      type: Boolean,
      default: false
    },
    // 接受的文件类型
    acceptTypes: {
      type: String,
      default: '.xlsx,.xls',
      validator(value) {
        // 验证文件类型格式
        const pattern = /^(\.\w+)(,\.\w+)*$/
        return pattern.test(value)
      }
    },
    // 文件类型提示
    fileTypeTip: {
      type: String,
      default: '只能上传Excel文件(xlsx/xls)，且不超过10MB'
    },
    // 模板下载按钮文本
    templateText: {
      type: String,
      default: '下载模板'
    },
    // 确认按钮文本
    confirmText: {
      type: String,
      default: '开始导入'
    },
    // 取消按钮文本
    cancelText: {
      type: String,
      default: '取消'
    },
    // 导入提示标题
    tipTitle: {
      type: String,
      default: '导入说明：'
    },
    // 最大文件大小（MB）
    maxFileSize: {
      type: Number,
      default: 10,
      validator(value) {
        return value > 0 && value <= 1024 // 最大1GB
      }
    },
    // 是否在错误表格中显示行号
    showRowNumber: {
      type: Boolean,
      default: true
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
      default: 60000,
      validator(value) {
        return value > 0 && value <= 600000 // 最长10分钟
      }
    },
    // 是否启用现代化特性
    enableModernFeatures: {
      type: Boolean,
      default: false
    },
    // 是否支持多文件上传
    enableMultipleFiles: {
      type: Boolean,
      default: false
    },
    // 最大文件数量
    maxFileCount: {
      type: Number,
      default: 5,
      validator(value) {
        return value > 0 && value <= 20
      }
    },
    // 是否在错误表格中显示文件名
    showFileName: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      // 对话框可见性
      dialogVisible: false,
      // 加载状态
      loading: false,
      // 选中的文件列表
      selectedFiles: [],
      // 导入结果
      importResult: null,
      // 上传进度
      uploadProgress: 0,
      // 导入控制器（用于取消）
      importController: null,
      // 创建的URL对象集合
      downloadUrls: new Set(),
      // 错误列表分页
      currentPage: 1,
      pageSize: 10
    }
  },
  computed: {
    // 兼容性：单文件模式下的选中文件
    selectedFile() {
      return this.selectedFiles.length > 0 ? this.selectedFiles[0] : null
    },

    // 分页后的错误数据
    paginatedErrors() {
      if (!this.importResult || !this.importResult.errors) return []

      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.importResult.errors.slice(start, end)
    }
  },
  created() {
    // 创建防抖函数
    this.debouncedShowImportDialog = debounce(this.showImportDialog, this.debounceDelay)
    this.debouncedSubmitImport = debounce(this.submitImport, this.debounceDelay)
    this.debouncedDownloadTemplate = debounce(this.downloadTemplate, this.debounceDelay)
  },
  beforeDestroy() {
    // 清理资源
    this.cleanup()
  },
  methods: {
    // 显示导入对话框
    showImportDialog() {
      if (this.loading) return
      this.dialogVisible = true
    },

    // 处理对话框关闭
    handleDialogClose() {
      if (this.loading && !this.enableModernFeatures) {
        this.$message.warning('导入进行中，请稍候...')
        return
      }

      this.dialogVisible = false

      // 延迟重置，避免视觉跳动
      setTimeout(() => {
        this.resetImport()
      }, 300)
    },

    // 处理文件变更
    handleFileChange(file, fileList) {
      if (this.enableMultipleFiles) {
        // 多文件模式
        this.selectedFiles = fileList.map(item => item.raw).filter(Boolean)
      } else {
        // 单文件模式
        this.selectedFiles = file.raw ? [file.raw] : []
      }
    },

    // 处理上传进度
    handleUploadProgress(event) {
      if (this.enableModernFeatures) {
        this.uploadProgress = Math.round((event.loaded / event.total) * 100)
      }
    },

    // 处理文件数量超限
    handleExceedLimit() {
      this.$message.warning(`最多只能选择${this.maxFileCount}个文件`)
    },

    // 移除指定文件
    removeFile(index) {
      this.selectedFiles.splice(index, 1)
    },

    // 清空所有选中文件
    clearSelectedFiles() {
      this.selectedFiles = []
    },

    // 上传前验证
    beforeUpload(file) {
      try {
        // 检查文件类型
        const isValidType = this.validateFileType(file)

        // 检查文件大小
        const isValidSize = this.validateFileSize(file)

        // 检查文件内容（现代化特性）
        if (this.enableModernFeatures) {
          const isValidContent = this.validateFileContent(file)
          return isValidType && isValidSize && isValidContent
        }

        return isValidType && isValidSize
      } catch (error) {
        console.error('文件验证错误:', error)
        this.$message.error('文件验证失败')
        return false
      }
    },

    // 验证文件类型
    validateFileType(file) {
      const acceptedTypes = this.acceptTypes.split(',').map(type => type.trim())
      const isValidType = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return file.name.toLowerCase().endsWith(type.toLowerCase())
        }
        return file.type === type
      })

      if (!isValidType) {
        this.$message.error(`只能上传 ${acceptedTypes.join(', ')} 格式的文件!`)
        return false
      }

      return true
    },

    // 验证文件大小
    validateFileSize(file) {
      const fileSizeMB = file.size / 1024 / 1024

      if (fileSizeMB > this.maxFileSize) {
        this.$message.error(`文件大小不能超过 ${this.maxFileSize}MB! 当前文件: ${fileSizeMB.toFixed(2)}MB`)
        return false
      }

      return true
    },

    // 验证文件内容（现代化特性）
    validateFileContent(file) {
      // 检查文件是否为空
      if (file.size === 0) {
        this.$message.error('文件内容为空，请检查文件')
        return false
      }

      // 检查文件名是否包含特殊字符
      const invalidChars = /[<>:"/\\|?*]/
      if (invalidChars.test(file.name)) {
        this.$message.error('文件名包含非法字符，请重命名后重试')
        return false
      }

      return true
    },

    // 提交导入
    async submitImport() {
      if (this.selectedFiles.length === 0) {
        this.$message.warning('请先选择文件')
        return
      }

      try {
        this.loading = true
        this.uploadProgress = 0
        this.$emit('import-start', this.selectedFiles)

        // 创建FormData
        const formData = new FormData()

        if (this.enableMultipleFiles && this.selectedFiles.length > 1) {
          // 多文件模式
          this.selectedFiles.forEach((file, index) => {
            formData.append(`files[${index}]`, file)
          })
          formData.append('fileCount', this.selectedFiles.length.toString())
        } else {
          // 单文件模式（兼容）
          formData.append('file', this.selectedFiles[0])
        }

        // 创建可取消的请求
        const importPromise = this.createCancellableImport(formData)

        const response = await importPromise

        // 验证响应数据
        this.importResult = this.validateImportResult(response.data)

        // 发送导入结果事件
        this.$emit('import-success', this.importResult)

        // 显示结果消息
        this.showImportResultMessage()
      } catch (error) {
        this.handleImportError(error)
      } finally {
        this.loading = false
        this.uploadProgress = 0
        this.importController = null
        this.$emit('import-complete')
      }
    },

    // 创建可取消的导入请求
    createCancellableImport(formData) {
      if (this.enableModernFeatures && typeof AbortController !== 'undefined') {
        // 现代化：使用AbortController
        this.importController = new AbortController()

        return this.importApi(formData, {
          signal: this.importController.signal,
          timeout: this.timeout,
          onUploadProgress: this.handleUploadProgress
        })
      } else {
        // 兼容模式：使用超时
        return Promise.race([
          this.importApi(formData),
          new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Import timeout')), this.timeout)
          })
        ])
      }
    },

    // 验证导入结果
    validateImportResult(data) {
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid import result format')
      }

      // 设置默认值
      const result = {
        total: data.total || 0,
        success: data.success || 0,
        fail: data.fail || 0,
        errors: data.errors || []
      }

      // 验证数据一致性
      if (result.success + result.fail !== result.total) {
        console.warn('Import result data inconsistency detected')
      }

      return result
    },

    // 显示导入结果消息
    showImportResultMessage() {
      const { total, success, fail } = this.importResult

      if (success === total) {
        this.$message.success(`导入成功，共处理 ${total} 条数据`)
      } else if (success > 0) {
        this.$message.warning(`导入完成，成功 ${success} 条，失败 ${fail} 条`)
      } else {
        this.$message.error(`导入失败，共 ${total} 条数据全部失败`)
      }
    },

    // 处理导入错误
    handleImportError(error) {
      console.error('导入错误:', error)

      let errorMessage = '导入失败'

      if (error.name === 'AbortError') {
        errorMessage = '导入已取消'
      } else if (error.message === 'Import timeout') {
        errorMessage = '导入超时，请检查文件大小或网络连接'
      } else if (error.response) {
        const status = error.response.status
        if (status >= 500) {
          errorMessage = '服务器错误，请稍后重试'
        } else if (status === 413) {
          errorMessage = '文件过大，请减小文件大小后重试'
        } else if (status === 415) {
          errorMessage = '不支持的文件格式'
        } else {
          errorMessage = error.response.data?.message || '导入失败'
        }
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage = '网络错误，请检查网络连接'
      } else {
        errorMessage = error.message || '未知错误'
      }

      this.$message.error(errorMessage)
      this.$emit('import-error', error)
    },

    // 取消导入
    cancelImport() {
      if (this.importController && this.enableModernFeatures) {
        this.importController.abort()
        this.$message.info('导入已取消')
      }
    },

    // 下载模板
    async downloadTemplate() {
      if (!this.templateApi) return

      try {
        this.$emit('template-download-start')

        const response = await this.templateApi()

        // 判断是否是Mock数据
        if (typeof response.data === 'string' && response.data.includes('template-download-success')) {
          // Mock环境处理
          this.$message.success('模板下载成功（Mock环境）')
          this.$emit('template-download-success', { isMock: true })
        } else {
          // 实际环境处理文件下载
          const fileName = `${this.dialogTitle.replace(/导入/g, '')}导入模板.xlsx`
          this.downloadFileModern(response.data, fileName)
          this.$message.success('模板下载成功')
          this.$emit('template-download-success', { fileName })
        }
      } catch (error) {
        console.error('下载模板错误:', error)
        const errorMessage = error.response?.data?.message || error.message || '未知错误'
        this.$message.error(`模板下载失败：${errorMessage}`)
        this.$emit('template-download-error', error)
      }
    },

    // 导出错误数据
    exportErrorData() {
      if (!this.importResult || !this.importResult.errors) return

      try {
        // 构造错误数据CSV格式
        const headers = ['序号', '行号', '错误原因']
        if (this.showFileName) headers.push('文件名')

        const csvContent = [
          headers.join(','),
          ...this.importResult.errors.map((error, index) => {
            const row = [
              index + 1,
              error.row || '',
              `"${error.message || ''}"` // 用引号包围以处理逗号
            ]
            if (this.showFileName) row.push(`"${error.fileName || ''}"`)
            return row.join(',')
          })
        ].join('\n')

        // 添加BOM以支持中文
        const BOM = '\uFEFF'
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8' })

        const fileName = `导入错误数据_${new Date().toLocaleDateString('zh-CN')}.csv`
        this.downloadFileModern(blob, fileName)

        this.$message.success('错误数据导出成功')
      } catch (error) {
        console.error('导出错误数据失败:', error)
        this.$message.error('导出错误数据失败')
      }
    },

    // 重置导入状态
    resetImport() {
      this.selectedFiles = []
      this.importResult = null
      this.uploadProgress = 0
      this.currentPage = 1
      this.$emit('reset')
    },

    // 获取结果图标
    getResultIcon() {
      if (!this.importResult) return 'info'

      const { total, success } = this.importResult
      if (success === total) return 'success'
      if (success > 0) return 'warning'
      return 'error'
    },

    // 获取结果标题
    getResultTitle() {
      if (!this.importResult) return '导入完成'

      const { total, success } = this.importResult
      if (success === total) return '导入成功'
      if (success > 0) return '部分导入成功'
      return '导入失败'
    },

    // 获取结果子标题
    getResultSubTitle() {
      if (!this.importResult) return ''

      const { total, success, fail } = this.importResult
      return `总数据 ${total} 条，成功 ${success} 条，失败 ${fail} 条`
    },

    // 错误列表分页
    handlePageChange(page) {
      this.currentPage = page
    },

    // 获取文件类型提示
    getFileTypeTip() {
      if (this.enableMultipleFiles) {
        return `${this.fileTypeTip}，支持同时选择最多${this.maxFileCount}个文件`
      }
      return this.fileTypeTip
    },

    // 格式化文件大小
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },

    // 现代化文件下载
    downloadFileModern(data, fileName) {
      try {
        // 检查浏览器支持
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
          // IE浏览器
          const blob = data instanceof Blob ? data : new Blob([data], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          })
          window.navigator.msSaveOrOpenBlob(blob, fileName)
        } else {
          // 现代浏览器
          const blob = data instanceof Blob ? data : new Blob([data], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          })

          const url = URL.createObjectURL(blob)
          this.downloadUrls.add(url) // 跟踪URL

          const link = document.createElement('a')
          link.href = url
          link.download = fileName
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
        this.$message.error('文件下载失败')
      }
    },

    // 传统文件下载（向后兼容）
    downloadFile(data, fileName) {
      // 创建Blob对象
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })

      // 创建下载链接
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(link.href)
    },

    // 清理资源
    cleanup() {
      // 取消进行中的请求
      if (this.importController) {
        this.importController.abort()
      }

      // 清理防抖函数
      if (this.debouncedShowImportDialog && this.debouncedShowImportDialog.cancel) {
        this.debouncedShowImportDialog.cancel()
      }
      if (this.debouncedSubmitImport && this.debouncedSubmitImport.cancel) {
        this.debouncedSubmitImport.cancel()
      }
      if (this.debouncedDownloadTemplate && this.debouncedDownloadTemplate.cancel) {
        this.debouncedDownloadTemplate.cancel()
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

<style lang="scss" scoped>
.import-button-container {
  display: inline-block;
}

.import-container {
  margin-bottom: 10px;
}

.upload-area {
  width: 100%;

  ::v-deep .el-upload {
    width: 100%;

    .el-upload-dragger {
      width: 100%;
      transition: all 0.3s ease;
    }

    .el-upload-dragger:hover {
      border-color: #409EFF;
      background-color: #f0f9ff;
    }
  }
}

.upload-progress {
  margin: 15px 0;

  .progress-text {
    text-align: center;
    margin-top: 8px;
    color: #606266;
    font-size: 14px;
  }
}

.file-info-list {
  margin-top: 15px;

  .file-info-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    font-weight: bold;
    color: #303133;
  }
}

.file-info {
  margin-bottom: 8px;
  padding: 10px;
  border-radius: 4px;
  background-color: #f5f7fa;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;

  &:hover {
    background-color: #eef4fb;
  }

  .file-details {
    flex: 1;
    display: flex;
    flex-direction: column;

    .file-name {
      font-weight: 500;
      color: #303133;
    }

    .file-size {
      font-size: 12px;
      color: #909399;
      margin-top: 2px;
    }
  }
}

.import-tips {
  margin-top: 20px;

  .tips-title {
    font-weight: bold;
    margin-bottom: 8px;
    display: flex;
    align-items: center;

    i {
      margin-right: 5px;
    }
  }

  ol {
    margin: 0;
    padding-left: 25px;

    li {
      line-height: 1.8;
      color: #606266;
      margin-bottom: 4px;
    }
  }
}

.import-result {
  .error-list {
    margin-top: 20px;

    .error-title {
      font-weight: bold;
      margin-bottom: 10px;
      color: #303133;
    }

    .error-pagination {
      margin-top: 15px;
      text-align: center;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

// 现代化样式增强
.el-button {
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .import-button-container {
    .el-dialog {
      width: 95% !important;
      margin: 5vh auto !important;
    }
  }

  .file-info {
    .file-details {
      .file-name {
        font-size: 14px;
      }
    }
  }
}
</style>
