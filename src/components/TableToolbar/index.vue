/**
 * 表格工具栏组件
 * 功能描述：提供表格常用工具操作，包括批量操作、导入/导出、打印和列设置
 * 创建日期：2023-12-01
 */
<template>
  <div class="table-toolbar">
    <!-- 左侧工具栏区域 - 新增按钮 -->
    <div class="toolbar-left">
      <slot name="toolbar-left"></slot>
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
        @batch-delete="handleBatchDelete"
        @batch-enable="handleBatchEnable"
        @batch-disable="handleBatchDisable"
        @batch-status="handleBatchStatus"
        @custom-action="handleCustomAction"
      >
        <slot name="batch-actions"></slot>
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
          <slot name="import-tips"></slot>
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
      ></export-button>
      
      <!-- 刷新按钮 -->
      <refresh-button
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
      
      <slot name="toolbar-right"></slot>
    </div>
  </div>
</template>

<script>
import BatchAction from '@/components/BatchAction'
import ExportButton from '@/components/ExportButton'
import ImportButton from '@/components/ImportButton'
import RefreshButton from '@/components/RefreshButton'
import ColumnSettings from '@/components/ColumnSettings'

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
      default: 'mini'
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
      // 临时数据，如果需要的话
    }
  },
  computed: {
    // 计算属性，如果需要的话
  },
  created() {
    // 初始化逻辑，如果需要的话
  },
  methods: {
    // 刷新表格
    handleRefresh() {
      this.$emit('refresh')
    },
    
    // BatchAction 相关方法
    handleBatchDelete() {
      this.$emit('batch-delete', this.selectedRows)
    },
    
    handleBatchEnable() {
      this.$emit('batch-enable', this.selectedRows)
    },
    
    handleBatchDisable() {
      this.$emit('batch-disable', this.selectedRows)
    },
    
    handleBatchStatus(status) {
      this.$emit('batch-status', this.selectedRows, status)
    },
    
    handleCustomAction(action) {
      this.$emit('custom-action', action, this.selectedRows)
    },

    // ImportButton 相关方法
    handleImportSuccess(result) {
      this.$emit('import-success', result)
    },
    
    handleImportError(error) {
      this.$emit('import-error', error)
    },

    // ExportButton 相关方法
    handleExportSuccess(result) {
      this.$emit('export-success', result)
    },
    
    handleExportError(error) {
      this.$emit('export-error', error)
    },

    // ColumnSettings 相关方法
    handleColumnChange(newVisibleColumns) {
      this.$emit('column-change', newVisibleColumns)
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
  }
}
</style> 