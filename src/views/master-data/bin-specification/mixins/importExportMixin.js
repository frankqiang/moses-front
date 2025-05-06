import { 
  exportBinSpec, 
  downloadTemplate, 
  importBinSpec 
} from '@/api/master-data/bin-specification'

export default {
  data() {
    return {
      importDialogVisible: false, // 导入对话框可见性
      importLoading: false, // 导入加载状态
      importResult: null, // 导入结果
      exportLoading: false // 导出加载状态
    }
  },
  methods: {
    // 处理导入导出命令
    handleImportExport(command) {
      switch (command) {
        case 'import':
          this.importDialogVisible = true
          this.importResult = null
          break
        case 'export':
          this.handleExport()
          break
        case 'template':
          this.handleDownloadTemplate()
          break
      }
    },

    // 导出数据
    handleExport() {
      this.exportLoading = true
      
      // 构建导出参数，复用当前的搜索条件
      const query = {
        ...this.listQuery,
        page: undefined,
        limit: undefined
      }
      
      exportBinSpec(query).then(response => {
        // 检查响应类型
        if (response.data === 'export-success') {
          // Mock环境下的处理
          this.$message.success('导出成功（Mock环境）')
        } else {
          // 实际环境下处理二进制文件流
          // 创建文件名
          const filename = `料框规格_${new Date().toLocaleDateString()}.xlsx`
          
          // 创建Blob对象
          const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
          
          // 创建下载链接
          const link = document.createElement('a')
          link.href = URL.createObjectURL(blob)
          link.download = filename
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          
          this.$message.success('导出成功')
        }
        this.exportLoading = false
      }).catch(error => {
        console.error('导出错误:', error)
        this.$message.error('导出失败')
        this.exportLoading = false
      })
    },

    // 下载导入模板
    handleDownloadTemplate() {
      downloadTemplate().then(response => {
        // 检查响应类型
        if (response.data === 'template-download-success') {
          // Mock环境下的处理
          this.$message.success('模板下载成功（Mock环境）')
        } else {
          // 创建文件名
          const filename = '料框规格导入模板.xlsx'
          
          // 创建Blob对象
          const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
          
          // 创建下载链接
          const link = document.createElement('a')
          link.href = URL.createObjectURL(blob)
          link.download = filename
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          
          this.$message.success('模板下载成功')
        }
      }).catch(error => {
        console.error('下载模板错误:', error)
        this.$message.error('模板下载失败')
      })
    },

    // 提交导入
    handleImport(file) {
      if (!file) {
        return
      }
      
      this.importLoading = true
      
      importBinSpec(file).then(response => {
        this.importResult = response.data
        this.importLoading = false
        
        // 如果导入成功，刷新列表
        if (response.data.success > 0) {
          this.getList()
        }
      }).catch(error => {
        console.error('导入错误:', error)
        this.$message.error('导入失败')
        this.importLoading = false
      })
    },

    // 重置导入状态
    resetImport() {
      this.importResult = null
    }
  }
} 