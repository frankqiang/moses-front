/**
 * 表格工具栏组件
 * 功能描述：提供表格常用工具操作，包括批量操作、导入/导出、刷新和列设置
 * 创建日期：2023-12-01
 * 现代化升级：2024-12-19 - 增强错误处理、防抖保护、响应式设计等现代化特性
 */
<template>
  <div
    class="table-toolbar"
    :class="{
      'mobile-layout': isMobile,
      'loading-state': isLoading,
      'has-error': hasError
    }"
  >
    <!-- 错误提示 -->
    <transition name="slide-down">
      <div v-if="hasError" class="error-banner">
        <i class="el-icon-warning" />
        <span>{{ errorMessage }}</span>
        <el-button size="mini" type="text" @click="resetError">重试</el-button>
      </div>
    </transition>

    <!-- 左侧工具栏区域 - 新增按钮 -->
    <div class="toolbar-left">
      <slot name="toolbar-left" />
    </div>

    <!-- 右侧工具栏区域 - 其他所有功能按钮 -->
    <div class="toolbar-right">
      <!-- 批量操作工具栏 -->
      <batch-action
        v-if="enableBatchActions"
        :selected-rows="selectedRows"
        :min-selection="minSelection"
        :size="size"
        :show-selected-count="showSelectedCount"
        :show-default-actions="showDefaultActions"
        :hide-delete-button="hideDeleteButton"
        :hide-status-buttons="hideStatusButtons"
        :delete-text="deleteText"
        :delete-icon="deleteIcon"
        :status-text="statusText"
        :enable-text="enableText"
        :enable-icon="enableIcon"
        :disable-text="disableText"
        :disable-icon="disableIcon"
        :status-buttons-mode="statusButtonsMode"
        :custom-actions="customActions"
        :delete-confirm="deleteConfirm"
        :delete-confirm-text="deleteConfirmText"
        :delete-confirm-title="deleteConfirmTitle"
        :status-confirm="statusConfirm"
        :status-field="statusField"
        :enabled-value="enabledValue"
        :disabled-value="disabledValue"
        :smart-status-buttons="smartStatusButtons"
        @batch-delete="handleBatchDelete"
        @batch-enable="handleBatchEnable"
        @batch-disable="handleBatchDisable"
        @batch-status="handleBatchStatus"
        @custom-action="handleCustomAction"
      >
        <slot name="batch-actions" />
      </batch-action>

      <!-- 导入按钮 -->
      <import-button
        v-if="enableImport"
        :import-api="importApi"
        :template-api="templateApi"
        :text="importText"
        :icon="importIcon"
        :type="importType"
        :size="size"
        :disabled="importDisabled"
        :dialog-title="importDialogTitle"
        @import-success="handleImportSuccess"
        @import-error="handleImportError"
      >
        <template slot="tips">
          <slot name="import-tips" />
        </template>
      </import-button>

      <!-- 导出按钮 -->
      <export-button
        v-if="enableExport"
        :export-api="exportApi"
        :params="exportParams"
        :filename="exportFilename"
        :text="exportText"
        :icon="exportIcon"
        :type="exportType"
        :size="size"
        :disabled="exportDisabled"
        :need-confirm="exportConfirm"
        @export-success="handleExportSuccess"
        @export-error="handleExportError"
      />

      <!-- 刷新按钮 -->
      <refresh-button
        ref="refreshBtn"
        :feedback-mode="refreshFeedbackMode"
        size="mini"
        @refresh="handleRefresh"
      />

      <!-- 列设置组件 -->
      <column-settings
        v-if="enableColumnSettings"
        :column-options="columnOptions"
        :storage-key="storageKey"
        :default-visible-columns="defaultVisibleColumns"
        :size="size"
        @change="handleColumnChange"
      />

      <slot name="toolbar-right" />
    </div>
  </div>
</template>

<script>
import BatchAction from '@/components/BatchAction'
import ExportButton from '@/components/ExportButton'
import ImportButton from '@/components/ImportButton'
import RefreshButton from '@/components/RefreshButton'
import ColumnSettings from '@/components/ColumnSettings'
import { debounce, throttle } from '@/utils'

export default {
  name: 'TableToolbar',
  components: {
    BatchAction,
    ExportButton,
    ImportButton,
    RefreshButton,
    ColumnSettings
  },
  props: {
    // 通用配置
    size: {
      type: String,
      default: 'mini',
      validator(value) {
        return ['large', 'medium', 'small', 'mini'].includes(value)
      }
    },

    // 现代化特性配置
    enableModernFeatures: {
      type: Boolean,
      default: true
    },

    // 防抖延迟时间
    debounceDelay: {
      type: Number,
      default: 300
    },

    // 错误重试次数
    maxRetries: {
      type: Number,
      default: 3
    },

    // 刷新按钮反馈模式
    refreshFeedbackMode: {
      type: String,
      default: 'error'
    },

    // 列设置相关属性
    enableColumnSettings: {
      type: Boolean,
      default: true
    },
    columnOptions: {
      type: Array,
      default: () => []
    },
    storageKey: {
      type: String,
      default: 'table_visible_columns'
    },
    defaultVisibleColumns: {
      type: Array,
      default: () => []
    },

    // 表格数据
    tableData: {
      type: Array,
      default: () => []
    },

    // 可见列
    visibleColumns: {
      type: Array,
      default: () => []
    },

    // 批量操作相关属性
    enableBatchActions: {
      type: Boolean,
      default: false
    },
    selectedRows: {
      type: Array,
      default: () => []
    },
    minSelection: {
      type: Number,
      default: 1
    },
    showSelectedCount: {
      type: Boolean,
      default: true
    },
    showDefaultActions: {
      type: Boolean,
      default: true
    },
    hideDeleteButton: {
      type: Boolean,
      default: false
    },
    hideStatusButtons: {
      type: Boolean,
      default: false
    },
    deleteText: {
      type: String,
      default: ''
    },
    deleteIcon: {
      type: String,
      default: 'el-icon-delete'
    },
    statusText: {
      type: String,
      default: ''
    },
    enableText: {
      type: String,
      default: ''
    },
    enableIcon: {
      type: String,
      default: 'el-icon-check'
    },
    disableText: {
      type: String,
      default: ''
    },
    disableIcon: {
      type: String,
      default: 'el-icon-close'
    },
    statusButtonsMode: {
      type: String,
      default: 'dropdown'
    },
    customActions: {
      type: Array,
      default: () => []
    },
    deleteConfirm: {
      type: Boolean,
      default: true
    },
    deleteConfirmText: {
      type: String,
      default: '确认批量删除选中项吗？此操作不可恢复'
    },
    deleteConfirmTitle: {
      type: String,
      default: '警告'
    },
    statusConfirm: {
      type: Boolean,
      default: true
    },
    // 状态字段名称
    statusField: {
      type: String,
      default: 'status'
    },
    // 启用状态的值
    enabledValue: {
      type: [String, Number, Boolean],
      default: 'Enabled'
    },
    // 禁用状态的值
    disabledValue: {
      type: [String, Number, Boolean],
      default: 'Disabled'
    },
    // 是否启用智能状态按钮判断
    smartStatusButtons: {
      type: Boolean,
      default: false
    },

    // 导入按钮相关属性
    enableImport: {
      type: Boolean,
      default: false
    },
    importApi: {
      type: Function,
      default: null
    },
    templateApi: {
      type: Function,
      default: null
    },
    importText: {
      type: String,
      default: '导入'
    },
    importIcon: {
      type: String,
      default: 'el-icon-upload2'
    },
    importType: {
      type: String,
      default: 'default'
    },
    importDisabled: {
      type: Boolean,
      default: false
    },
    importDialogTitle: {
      type: String,
      default: '导入数据'
    },

    // 导出按钮相关属性
    enableExport: {
      type: Boolean,
      default: false
    },
    exportApi: {
      type: Function,
      default: null
    },
    exportParams: {
      type: Object,
      default: () => ({})
    },
    exportFilename: {
      type: String,
      default: '导出数据'
    },
    exportText: {
      type: String,
      default: '导出'
    },
    exportIcon: {
      type: String,
      default: 'el-icon-download'
    },
    exportType: {
      type: String,
      default: 'default'
    },
    exportDisabled: {
      type: Boolean,
      default: false
    },
    exportConfirm: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      // 错误处理状态
      hasError: false,
      errorMessage: '',
      retryCount: 0,
      isLoading: false,

      // 响应式状态
      isMobile: false,
      resizeObserver: null,

      // 操作历史
      operationHistory: []
    }
  },

  computed: {
    // 工具栏按钮总数
    totalButtonsCount() {
      let count = 1 // 刷新按钮

      if (this.enableBatchActions) count += 1
      if (this.enableImport) count += 1
      if (this.enableExport) count += 1
      if (this.enableColumnSettings) count += 1

      return count
    },

    // 是否处于错误状态
    inErrorState() {
      return this.hasError && this.retryCount >= this.maxRetries
    }
  },

  watch: {
    // 监听选中行变化
    selectedRows: {
      handler(newRows, oldRows) {
        if (this.enableModernFeatures) {
          this.logOperation('selection-change', {
            previousCount: oldRows?.length || 0,
            currentCount: newRows?.length || 0
          })
        }
      },
      immediate: true
    }
  },

  created() {
    // 初始化防抖函数
    this.initDebouncedMethods()
    // 检测移动设备
    this.detectMobile()
  },

  mounted() {
    // 设置响应式监听
    this.setupResponsiveHandling()
  },

  beforeDestroy() {
    this.cleanup()
  },

  methods: {
    // 初始化防抖方法
    initDebouncedMethods() {
      if (this.enableModernFeatures) {
        this.debouncedRefresh = debounce(this.handleRefreshInternal, this.debounceDelay)
        this.debouncedColumnChange = debounce(this.handleColumnChangeInternal, this.debounceDelay)
        this.throttledResize = throttle(this.handleResize, 100)
      }
    },

    // 检测移动设备
    detectMobile() {
      this.isMobile = window.innerWidth <= 768
    },

    // 设置响应式处理
    setupResponsiveHandling() {
      if (this.enableModernFeatures && window.ResizeObserver) {
        this.resizeObserver = new ResizeObserver(() => {
          this.throttledResize()
        })
        this.resizeObserver.observe(this.$el)
      }
    },

    // 处理窗口大小变化
    handleResize() {
      this.detectMobile()
    },

    // 清理资源
    cleanup() {
      if (this.resizeObserver) {
        this.resizeObserver.disconnect()
        this.resizeObserver = null
      }

      // 清理防抖函数
      if (this.debouncedRefresh?.cancel) {
        this.debouncedRefresh.cancel()
      }
      if (this.debouncedColumnChange?.cancel) {
        this.debouncedColumnChange.cancel()
      }
      if (this.throttledResize?.cancel) {
        this.throttledResize.cancel()
      }
    },

    // 记录操作历史
    logOperation(type, data = {}) {
      if (this.enableModernFeatures) {
        this.operationHistory.push({
          type,
          timestamp: Date.now(),
          data: { ...data }
        })

        // 保持历史记录在合理范围内
        if (this.operationHistory.length > 50) {
          this.operationHistory = this.operationHistory.slice(-30)
        }
      }
    },

    // 错误处理
    handleError(error, operation = 'unknown') {
      this.hasError = true
      this.errorMessage = this.extractErrorMessage(error)
      this.logOperation('error', { operation, error: error.message })

      // 错误上报
      if (this.enableModernFeatures && window.errorReporter) {
        window.errorReporter.captureException({
          component: 'TableToolbar',
          operation,
          error: error.message,
          props: this.$props
        })
      }

      this.$emit('error', { operation, error })
    },

    // 提取错误信息
    extractErrorMessage(error) {
      if (typeof error === 'string') return error
      if (error.message) return error.message
      if (error.response?.data?.message) return error.response.data.message
      return '操作失败，请稍后重试'
    },

    // 重置错误状态
    resetError() {
      this.hasError = false
      this.errorMessage = ''
      this.retryCount = 0
      this.logOperation('error-reset')
    },

    // 安全的异步操作包装
    async safeAsyncOperation(operation, operationName) {
      try {
        this.isLoading = true
        const result = await operation()
        this.logOperation(operationName, { success: true })
        return result
      } catch (error) {
        this.retryCount++
        this.handleError(error, operationName)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // 刷新表格 - 内部方法
    async handleRefreshInternal() {
      try {
        await this.safeAsyncOperation(
          () => Promise.resolve(),
          'refresh'
        )
        this.$emit('refresh')
      } catch (error) {
        // 错误已在 safeAsyncOperation 中处理
      }
    },

    // 列设置变更 - 内部方法
    handleColumnChangeInternal(columns) {
      this.logOperation('column-change', { columns })
      this.$emit('column-change', columns)
    },

    // 公共方法 - 刷新表格
    handleRefresh() {
      if (this.enableModernFeatures) {
        this.debouncedRefresh()
      } else {
        this.$emit('refresh')
      }
    },

    // BatchAction 相关方法
    handleBatchDelete() {
      this.logOperation('batch-delete', { count: this.selectedRows.length })
      this.$emit('batch-delete', this.selectedRows)
    },

    handleBatchEnable() {
      this.logOperation('batch-enable', { count: this.selectedRows.length })
      this.$emit('batch-enable', this.selectedRows)
    },

    handleBatchDisable() {
      this.logOperation('batch-disable', { count: this.selectedRows.length })
      this.$emit('batch-disable', this.selectedRows)
    },

    handleBatchStatus(status) {
      this.logOperation('batch-status', { status, count: this.selectedRows.length })
      this.$emit('batch-status', this.selectedRows, status)
    },

    handleCustomAction(action) {
      this.logOperation('custom-action', { action: action.action, count: this.selectedRows.length })
      this.$emit('custom-action', action, this.selectedRows)
    },



    // ImportButton 相关方法
    handleImportSuccess(result) {
      this.logOperation('import-success', result)
      this.$emit('import-success', result)
    },

    handleImportError(error) {
      this.handleError(error, 'import')
      this.$emit('import-error', error)
    },

    // ExportButton 相关方法
    handleExportSuccess(result) {
      this.logOperation('export-success', result)
      this.$emit('export-success', result)
    },

    handleExportError(error) {
      this.handleError(error, 'export')
      this.$emit('export-error', error)
    },

    // ColumnSettings 相关方法
    handleColumnChange(newVisibleColumns) {
      if (this.enableModernFeatures) {
        this.debouncedColumnChange(newVisibleColumns)
      } else {
        this.$emit('column-change', newVisibleColumns)
      }
    },

    // 获取操作统计
    getOperationStats() {
      if (!this.enableModernFeatures) return null

      const stats = {
        totalOperations: this.operationHistory.length,
        errorCount: this.operationHistory.filter(op => op.type === 'error').length,
        lastOperation: this.operationHistory[this.operationHistory.length - 1] || null
      }

      return stats
    },

    // 公开方法：刷新成功
    refreshSucceed(message) {
      if (this.$refs.refreshBtn) {
        this.$refs.refreshBtn.refreshSucceed(message)
      }
    },

    // 公开方法：刷新失败
    refreshFail(message) {
      if (this.$refs.refreshBtn) {
        this.$refs.refreshBtn.refreshFail(message)
      }
    }
  }
}
</script>

<style lang="scss">
.table-toolbar {
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  transition: all 0.3s ease;

  // 错误状态样式
  &.has-error {
    .toolbar-right {
      opacity: 0.7;
    }
  }

  // 加载状态样式
  &.loading-state {
    .toolbar-right {
      pointer-events: none;
      opacity: 0.8;
    }
  }

  // 移动端布局
  &.mobile-layout {
    flex-direction: column;
    gap: 10px;

    .toolbar-left {
      width: 100%;
      justify-content: center;
    }

    .toolbar-right {
      width: 100%;
      justify-content: center;
      flex-wrap: wrap;
      gap: 5px;
    }
  }

  // 错误提示横幅
  .error-banner {
    position: absolute;
    top: -50px;
    left: 0;
    right: 0;
    background-color: #fef0f0;
    border: 1px solid #fde2e2;
    border-radius: 4px;
    padding: 8px 12px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #f56c6c;
    z-index: 10;

    i {
      font-size: 16px;
    }

    span {
      flex: 1;
    }

    .el-button {
      color: #f56c6c;
      padding: 0;
      min-height: auto;
    }
  }

  .toolbar-left {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .toolbar-right {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    transition: all 0.3s ease;
  }
}

// 过渡动画
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter,
.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

// 响应式设计
@media (max-width: 768px) {
  .table-toolbar {
    .toolbar-right {
      gap: 5px;

      .el-button {
        font-size: 12px;
        padding: 5px 8px;
      }
    }
  }
}

// 深色主题支持（可选）
@media (prefers-color-scheme: dark) {
  .table-toolbar {
    .error-banner {
      background-color: rgba(245, 108, 108, 0.1);
      border-color: rgba(245, 108, 108, 0.3);
      color: #f78989;
    }
  }
}

// 高对比度模式支持（可选）
@media (prefers-contrast: high) {
  .table-toolbar {
    .error-banner {
      border-width: 2px;
      font-weight: 600;
    }
  }
}
</style>
