/**
 * 表格通用混入
 * 功能描述：封装表格通用逻辑，如选择、批量操作、状态变更等
 * 创建日期：2023-09-01
 */
export default {
  data() {
    return {
      selectedRows: [], // 已选择的行
      multipleSelection: [] // 多选数据
    }
  },
  methods: {
    // 处理行选择变化
    handleSelectionChange(selection) {
      this.selectedRows = selection
      this.multipleSelection = selection
    },
    
    // 获取所有选中行ID
    getSelectedIds() {
      return this.selectedRows.map(row => row.id)
    },
    
    // 清除选择
    clearSelection() {
      this.$refs.locationTable && this.$refs.locationTable.clearSelection()
      this.selectedRows = []
      this.multipleSelection = []
    },
    
    // 表格排序变化
    handleSortChange({ prop, order }) {
      this.listQuery.sort = prop
      this.listQuery.order = order === 'ascending' ? 'asc' : 'desc'
      this.getList()
    }
  }
} 