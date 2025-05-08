/**
 * 导入导出混入
 * 功能描述：封装导入导出通用逻辑
 * 创建日期：2023-09-01
 */
export default {
  data() {
    return {
      importDialogVisible: false, // 导入对话框可见性
      importLoading: false, // 导入加载状态
      importResult: null // 导入结果
    }
  },
  methods: {
    // 处理导入导出
    handleImportExport(command) {
      if (command === 'import') {
        this.importDialogVisible = true
      } else if (command === 'export') {
        this.exportData()
      } else if (command === 'download-template') {
        this.downloadTemplate()
      }
    },
    
    // 重置导入状态
    resetImport() {
      this.importResult = null
    }
    
    // 注意：导入、导出和下载模板方法已移至index.vue中实现
  }
} 