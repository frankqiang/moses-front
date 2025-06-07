/**
 * 列设置Mixin
 * 功能描述：为表格组件提供列设置功能，配合ColumnSettings组件使用
 * 创建日期：2024-12-15
 * 更新日期：2024-12-16 - 集成表格配置存储服务，实现集中式配置管理
 */

import tableConfigStore from '@/utils/table-config-store'

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
      selectedRows: [],
      // 存储键前缀
      storageKeyPrefix: 'table_columns_',
      // 当前可见列
      visibleColumns: []
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
    // 表格存储键（用于localStorage）
    tableStorageKey() {
      return `table_columns_${this.storageKeySuffix || this.$route.name || 'default'}`
    },
    
    // 可见的列配置（用于el-table的显示）
    visibleColumnsConfig() {
      if (!this.visibleColumns || !this.visibleColumns.length) {
        return this.defaultVisibleColumns.length > 0 
          ? this.allColumns.filter(col => this.defaultVisibleColumns.includes(col.prop)) 
          : this.allColumns
      }
      
      return this.allColumns.filter(col => 
        this.visibleColumns.includes(col.prop)
      )
    }
  },
  created() {
    // 如果allColumns已在组件中初始化，则直接加载列设置
    if (this.allColumns.length > 0) {
      this.loadColumnSettings()
    }
    this.initVisibleColumns()
  },
  methods: {
    // 初始化列配置
    initColumns(columns) {
      this.allColumns = columns
      this.loadColumnSettings()
    },
    
    // 加载列设置
    loadColumnSettings() {
      // 从配置存储服务获取列设置
      this.internalVisibleColumns = tableConfigStore.getColumnConfig(
        this.columnSettingsKey,
        this.defaultVisibleColumns
      )
    },
    
    // 重置为默认列配置
    resetToDefaultColumns() {
      this.internalVisibleColumns = [...this.defaultVisibleColumns]
    },
    
    // 处理列设置变更
    handleColumnChange(columns) {
      this.internalVisibleColumns = columns
      // 通过配置存储服务保存设置
      tableConfigStore.saveColumnConfig(this.columnSettingsKey, columns)
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
    },
    
    /**
     * 初始化可见列
     */
    initVisibleColumns() {
      // 从配置存储服务获取列设置
      this.visibleColumns = tableConfigStore.getColumnConfig(
        this.tableStorageKey,
        this.defaultVisibleColumns
      )
    },
    
    /**
     * 处理列变更
     * @param {Array} columns - 新的可见列属性名数组
     */
    handleColumnChange(columns) {
      this.visibleColumns = columns
      // 通过配置存储服务保存设置
      tableConfigStore.saveColumnConfig(this.tableStorageKey, columns)
    },
    
    /**
     * 迁移旧版列设置到新版存储
     * 用于从直接使用localStorage的方式迁移到使用配置存储服务
     */
    migrateOldColumnSettings() {
      // 检查是否存在旧版本的设置
      const oldKey = this.columnSettingsKeyPrefix
      const newKey = this.columnSettingsKey
      
      try {
        const oldSettings = localStorage.getItem(oldKey)
        if (oldSettings) {
          const columns = JSON.parse(oldSettings)
          // 保存到新的存储服务
          tableConfigStore.saveColumnConfig(newKey, columns)
          // 删除旧的设置
          localStorage.removeItem(oldKey)
          console.log(`已将列设置从 ${oldKey} 迁移到 ${newKey}`)
        }
      } catch (error) {
        console.error('迁移旧版列设置失败:', error)
      }
    }
  }
} 