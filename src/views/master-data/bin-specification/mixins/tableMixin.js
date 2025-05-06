import { 
  changeBinSpecStatus, 
  batchDeleteBinSpec, 
  batchChangeBinSpecStatus 
} from '@/api/bin-specification'

export default {
  data() {
    return {
      selectedRows: [] // 选中的行
    }
  },
  methods: {
    // 表格选择变化
    handleSelectionChange(selection) {
      this.selectedRows = selection
    },

    // 批量删除
    handleBatchDelete() {
      if (this.selectedRows.length === 0) {
        return
      }

      const ids = this.selectedRows.map(row => row.id)
      const names = this.selectedRows.map(row => row.name).join('、')

      this.$confirm(`确认批量删除以下料框规格吗？<br><span class="text-danger">${names}</span>`, '批量删除提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: true
      }).then(() => {
        batchDeleteBinSpec(ids).then(response => {
          this.$message.success(`成功删除${response.data.count}条数据`)
          this.getList()
        })
      }).catch(() => {})
    },

    // 批量状态变更
    handleBatchStatus(status) {
      if (this.selectedRows.length === 0) {
        return
      }

      const ids = this.selectedRows.map(row => row.id)
      const statusText = status === 1 ? '启用' : '禁用'
      const names = this.selectedRows.map(row => row.name).join('、')

      this.$confirm(`确认批量${statusText}以下料框规格吗？<br><span class="text-primary">${names}</span>`, '批量操作提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: true
      }).then(() => {
        batchChangeBinSpecStatus(ids, status).then(response => {
          this.$message.success(`成功${statusText}${response.data.count}条数据`)
          this.getList()
        })
      }).catch(() => {})
    },

    // 状态变更
    handleStatusChange(row) {
      const status = row.status === 1 ? 0 : 1
      const statusText = status === 1 ? '启用' : '禁用'

      this.$confirm(`确认要${statusText}该料框规格吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        changeBinSpecStatus(row.id, status).then(() => {
          this.$message.success(`${statusText}成功`)
          this.getList()
        })
      }).catch(() => {})
    }
  }
} 