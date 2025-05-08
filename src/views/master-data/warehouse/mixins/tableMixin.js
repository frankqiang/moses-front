/**
 * 表格操作混入
 * 功能描述：提供表格通用逻辑，包括选择、排序等
 * 创建日期：2023-11-01
 */

export default {
  data() {
    return {
      // 选中的行数据
      selectedRows: []
    }
  },
  methods: {
    // 表格选择变化
    handleSelectionChange(selection) {
      this.selectedRows = selection
    }
  }
} 