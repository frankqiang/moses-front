/**
 * 导入导出混入
 * 功能描述：提供导入导出通用逻辑
 * 创建日期：2023-11-01
 */

export default {
  data() {
    return {
      // 导入对话框可见性
      importDialogVisible: false,
      // 导入加载状态
      importLoading: false,
      // 导入结果
      importResult: null
    }
  },
  methods: {
    // 下载文件
    downloadFile(data, fileName) {
      if (!data) {
        return
      }
      
      const blob = new Blob([data])
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = fileName
      link.click()
      URL.revokeObjectURL(link.href)
    }
  }
}