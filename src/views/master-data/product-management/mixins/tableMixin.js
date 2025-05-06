/**
 * 表格操作混入
 * 功能描述：提供表格通用操作方法
 * 依赖项：Element UI
 */
export default {
  data() {
    return {
      selectedRows: [] // 已选择的行数据
    }
  },
  methods: {
    // 处理选择行变化
    handleSelectionChange(rows) {
      this.selectedRows = rows
    },
    
    // 批量删除
    handleBatchDelete(ids) {
      if (!ids || ids.length === 0) {
        this.$message.warning('请选择需要删除的记录')
        return
      }
      
      this.$confirm('确认删除选中的记录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 批量删除逻辑，调用API
        this.batchDeleteProduct(ids).then(() => {
          this.$message.success('批量删除成功')
          this.getList()
          this.selectedRows = []
        }).catch(() => {
          this.$message.error('批量删除失败')
        })
      }).catch(() => {
        // 取消删除
      })
    },
    
    // 批量更改状态
    handleBatchStatus(ids, lifecycleStatus) {
      if (!ids || ids.length === 0) {
        this.$message.warning('请选择需要操作的记录')
        return
      }
      
      const statusText = {
        'trial': '试产',
        'production': '量产',
        'discontinued': '停产'
      }
      
      this.$confirm(`确认将选中的记录状态修改为"${statusText[lifecycleStatus]}"吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 批量更改状态逻辑，调用API
        this.batchChangeProductStatus(ids, lifecycleStatus).then(() => {
          this.$message.success('批量更改状态成功')
          this.getList()
        }).catch(() => {
          this.$message.error('批量更改状态失败')
        })
      }).catch(() => {
        // 取消操作
      })
    },
    
    // 单条记录状态变更
    handleStatusChange(row, lifecycleStatus) {
      const statusText = {
        'trial': '试产',
        'production': '量产',
        'discontinued': '停产'
      }
      
      this.$confirm(`确认将该记录状态修改为"${statusText[lifecycleStatus]}"吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 更改状态逻辑，调用API
        this.changeProductStatus(row.id, lifecycleStatus).then(() => {
          this.$message.success('更改状态成功')
          this.getList()
        }).catch(() => {
          this.$message.error('更改状态失败')
        })
      }).catch(() => {
        // 取消操作
      })
    }
  }
} 