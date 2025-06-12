/**
 * 导出按钮组件
 * 功能描述：将表格数据导出为Excel文件，支持自定义文件名和导出前确认
 * 创建日期：2023-12-10
 */
<template>
  <el-button
    :type="type"
    :size="size"
    :disabled="disabled || loading"
    :loading="loading"
    @click="handleExport"
  >
    <i v-if="icon" :class="icon" />
    <span>{{ text }}</span>
  </el-button>
</template>

<script>
export default {
  name: 'ExportButton',
  props: {
    // 导出API方法，接收参数并返回Promise
    exportApi: {
      type: Function,
      required: true
    },
    // 导出参数，会传递给exportApi
    params: {
      type: Object,
      default: () => ({})
    },
    // 导出文件名（不含扩展名）
    filename: {
      type: String,
      default: '导出数据'
    },
    // 文件类型（扩展名，不含点号）
    fileType: {
      type: String,
      default: 'xlsx'
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
      default: 'primary'
    },
    // 按钮大小
    size: {
      type: String,
      default: 'small'
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
    }
  },
  data() {
    return {
      loading: false
    }
  },
  computed: {
    // 完整文件名（含扩展名）
    fullFilename() {
      // 添加时间戳使文件名唯一
      const timestamp = new Date().toLocaleDateString('zh-CN').replace(/\//g, '')
      return `${this.filename}_${timestamp}.${this.fileType}`
    }
  },
  methods: {
    // 处理导出点击事件
    handleExport() {
      if (this.needConfirm) {
        this.$confirm(this.confirmText, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info'
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

      // 调用导出API
      this.exportApi(this.params).then(response => {
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
      }).catch(error => {
        console.error('导出错误:', error)
        this.$message.error(this.errorText)
        this.$emit('export-error', error)
      }).finally(() => {
        this.loading = false
        this.$emit('export-complete')
      })
    },

    // 下载文件
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
    }
  }
}
</script>

<style scoped>
/* 组件样式可根据项目需要调整 */
</style>
