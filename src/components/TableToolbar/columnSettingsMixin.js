/**
 * 列设置Mixin
 * 功能描述：为表格组件提供列设置功能，配合ColumnSettings组件使用
 * 创建日期：2024-12-15
 * 更新日期：2024-12-16 - 集成表格配置存储服务，实现集中式配置管理
 * 现代化升级：2024-12-19 - 增强错误处理、防抖保护、虚拟化支持等现代化特性
 */

import tableConfigStore from '@/utils/table-config-store'
import { debounce } from '@/utils'

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
      visibleColumns: [],
      
      // 现代化特性状态
      columnSettingsLoading: false,
      columnSettingsError: null,
      columnChangeHistory: [],
      
      // 性能优化状态
      isLargeDataset: false,
      virtualizedConfig: null
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
    computedDefaultVisibleColumns() {
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
        return this.computedDefaultVisibleColumns.length > 0
          ? this.allColumns.filter(col => this.computedDefaultVisibleColumns.includes(col.prop))
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
    
    // 检测大数据集
    this.detectLargeDataset()
  },

  mounted() {
    // 在 mounted 阶段初始化防抖函数，确保所有方法都已绑定
    this.initDebouncedMethods()
  },

  beforeDestroy() {
    this.cleanupDebouncedMethods()
  },
  methods: {
    // 初始化防抖方法
    initDebouncedMethods() {
      // 确保方法存在再创建防抖版本
      if (typeof this.handleColumnChangeInternal === 'function') {
        this.debouncedColumnChange = debounce(this.handleColumnChangeInternal, 300)
      }
      if (typeof this.handleBatchOperationInternal === 'function') {
        this.debouncedBatchOperation = debounce(this.handleBatchOperationInternal, 500)
      }
    },

    // 处理列变更 - 内部方法
    handleColumnChangeInternal(columns) {
      this.recordColumnChange('column-change', { columns })
      this.$emit('column-change', columns)
    },

    // 处理批量操作 - 内部方法
    handleBatchOperationInternal(operation, data = {}) {
      this.recordColumnChange('batch-operation', { operation, data })
      this.$emit('batch-operation', operation, data)
    },

    // 清理防抖方法
    cleanupDebouncedMethods() {
      if (this.debouncedColumnChange?.cancel) {
        this.debouncedColumnChange.cancel()
      }
      if (this.debouncedBatchOperation?.cancel) {
        this.debouncedBatchOperation.cancel()
      }
    },

    // 检测大数据集
    detectLargeDataset() {
      // 检测表格数据量，如果超过1000条则认为是大数据集
      this.isLargeDataset = (this.tableData?.length || 0) > 1000
      
      if (this.isLargeDataset) {
        this.setupVirtualizedConfig()
      }
    },

    // 设置虚拟化配置
    setupVirtualizedConfig() {
      this.virtualizedConfig = {
        itemHeight: 40,
        visibleItemCount: Math.ceil(window.innerHeight / 40),
        bufferSize: 10
      }
    },

    // 错误处理
    handleColumnSettingsError(error, operation = 'unknown') {
      this.columnSettingsError = {
        message: this.extractErrorMessage(error),
        operation,
        timestamp: Date.now()
      }

      console.error(`列设置操作失败 [${operation}]:`, error)
      
      // 可选的错误上报
      if (window.errorReporter) {
        window.errorReporter.captureException({
          component: 'ColumnSettingsMixin',
          operation,
          error: error.message
        })
      }
    },

    // 提取错误信息
    extractErrorMessage(error) {
      if (typeof error === 'string') return error
      if (error.message) return error.message
      return '操作失败，请稍后重试'
    },

    // 记录列变更历史
    recordColumnChange(operation, data = {}) {
      this.columnChangeHistory.push({
        operation,
        timestamp: Date.now(),
        data: { ...data }
      })

      // 保持历史记录在合理范围内
      if (this.columnChangeHistory.length > 50) {
        this.columnChangeHistory = this.columnChangeHistory.slice(-30)
      }
    },

    // 初始化列配置
    initColumns(columns) {
      this.allColumns = columns
      this.loadColumnSettings()
      this.detectLargeDataset()
    },

    // 加载列设置
    loadColumnSettings() {
      // 从配置存储服务获取列设置
      this.internalVisibleColumns = tableConfigStore.getColumnConfig(
        this.columnSettingsKey,
        this.computedDefaultVisibleColumns
      )
    },

    // 重置为默认列配置
    resetToDefaultColumns() {
      this.internalVisibleColumns = [...this.computedDefaultVisibleColumns]
    },

    // 处理列设置变更
    handleColumnChange(columns) {
      this.internalVisibleColumns = columns
      this.visibleColumns = columns
      // 通过配置存储服务保存设置
      tableConfigStore.saveColumnConfig(this.columnSettingsKey, columns)
      tableConfigStore.saveColumnConfig(this.tableStorageKey, columns)
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
        // 刷新表格数据 - 如果父组件有此方法才调用
        if (typeof this.getTableData === 'function') {
          this.getTableData()
        } else {
          this.$emit('refresh')
        }
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
        // 刷新表格数据 - 如果父组件有此方法才调用
        if (typeof this.getTableData === 'function') {
          this.getTableData()
        } else {
          this.$emit('refresh')
        }
      }).catch(() => {
        // 用户取消操作，不做任何处理
      })
    },

    // 处理导入成功
    handleImportSuccess(result) {
      this.$message.success(`导入成功：${result.success}条数据`)
      // 刷新表格数据 - 如果父组件有此方法才调用
      if (typeof this.getTableData === 'function') {
        this.getTableData()
      } else {
        this.$emit('refresh')
      }
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
        this.computedDefaultVisibleColumns
      )
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
