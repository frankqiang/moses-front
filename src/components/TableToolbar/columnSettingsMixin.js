/**
 * 表格列设置混入
 * 功能描述：用于表格组件集成列设置和批量操作功能
 * 创建日期：2023-12-01
 * 更新日期：2024-07-21
 */
export default {
  data() {
    return {
      // 可见列 - 内部存储
      internalVisibleColumns: [],
      // 所有可用列
      allColumns: [],
      // 列设置存储键前缀
      columnSettingsKeyPrefix: 'table_columns',
      // 选中的行数据
      selectedRows: []
    }
  },
  computed: {
    // 表格列配置
    tableColumns() {
      return this.allColumns.filter(col => this.internalVisibleColumns.includes(col.prop))
    },
    // 列设置存储键
    columnSettingsKey() {
      return `${this.columnSettingsKeyPrefix}_${this.$options.name || 'common'}`
    },
    // 默认可见列
    defaultVisibleColumns() {
      return this.allColumns.map(col => col.prop)
    },
    // 是否有选中行
    hasSelectedRows() {
      return this.selectedRows && this.selectedRows.length > 0
    },
    // 选中行的ID数组
    selectedIds() {
      return this.selectedRows.map(row => row.id || row._id)
    },
    // 可见列 - 兼容属性
    visibleColumns() {
      return this.internalVisibleColumns
    }
  },
  created() {
    // 如果allColumns已在组件中初始化，则直接加载列设置
    if (this.allColumns.length > 0) {
      this.loadColumnSettings()
    }
  },
  methods: {
    // 初始化列配置
    initColumns(columns) {
      this.allColumns = columns
      this.loadColumnSettings()
    },
    
    // 加载列设置
    loadColumnSettings() {
      // 尝试从localStorage读取用户设置的可见列
      const savedColumns = localStorage.getItem(this.columnSettingsKey)
      
      if (savedColumns) {
        try {
          this.internalVisibleColumns = JSON.parse(savedColumns)
        } catch (e) {
          console.error('解析保存的列设置失败:', e)
          this.resetToDefaultColumns()
        }
      } else {
        this.resetToDefaultColumns()
      }
    },
    
    // 重置为默认列配置
    resetToDefaultColumns() {
      this.internalVisibleColumns = [...this.defaultVisibleColumns]
    },
    
    // 处理列设置变更
    handleColumnChange(columns) {
      this.internalVisibleColumns = columns
    },
    
    // 处理多选变化
    handleSelectionChange(selection) {
      this.selectedRows = selection
    },
    
    // 批量删除
    handleBatchDelete() {
      if (!this.hasSelectedRows) return
      
      this.$confirm('确认删除选中的数据吗？此操作不可恢复', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 实际删除逻辑，通常是调用API
        this.$message.success(`已删除${this.selectedRows.length}条数据`)
        this.getTableData() // 刷新表格数据
      }).catch(() => {
        // 用户取消删除，不做任何操作
      })
    },
    
    // 批量启用
    handleBatchEnable() {
      this.handleBatchStatus(1)
    },
    
    // 批量禁用
    handleBatchDisable() {
      this.handleBatchStatus(0)
    },
    
    // 批量更改状态
    handleBatchStatus(status) {
      if (!this.hasSelectedRows) return
      
      const statusText = status === 1 ? '启用' : '禁用'
      this.$confirm(`确认${statusText}选中的数据吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }).then(() => {
        // 实际更新状态逻辑，通常是调用API
        this.$message.success(`已${statusText}${this.selectedRows.length}条数据`)
        this.getTableData() // 刷新表格数据
      }).catch(() => {
        // 用户取消操作，不做任何处理
      })
    },
    
    // 处理导入成功
    handleImportSuccess(result) {
      this.$message.success(`导入成功：${result.success}条数据`)
      this.getTableData() // 刷新表格数据
    },
    
    // 处理导出成功
    handleExportSuccess(result) {
      this.$message.success(`导出成功：${result.filename || '数据已导出'}`)
    }
  }
} 