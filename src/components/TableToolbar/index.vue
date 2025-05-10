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
      
      <!-- 打印按钮 -->
      <print-button
        v-if="enablePrint"
        :print-selector="printSelector"
        :print-title="printTitle"
        :text="printText"
        :icon="printIcon"
        :type="printType"
        :size="size"
        :disabled="printDisabled"
        @before-print="handleBeforePrint"
        @after-print="handleAfterPrint"
      ></print-button>
      
      <!-- 刷新按钮 -->
      <el-button
        size="mini"
        icon="el-icon-refresh"
        @click="handleRefresh"
      >
        刷新
      </el-button>
      
      <!-- 列设置下拉菜单 -->
      <el-dropdown
        v-if="enableColumnSettings"
        trigger="click"
        @command="handleColumnCommand"
        ref="columnDropdown"
      >
        <el-button size="mini">
          <i class="el-icon-s-operation"></i>
          列设置
          <i class="el-icon-arrow-down el-icon--right"></i>
        </el-button>
        <el-dropdown-menu slot="dropdown" class="column-dropdown">
          <div class="column-dropdown-header">
            <el-checkbox
              v-model="tempCheckAll"
              :indeterminate="tempIndeterminate"
              @change="handleTempCheckAllChange"
            >
              全选
            </el-checkbox>
            <div class="column-dropdown-actions">
              <el-button type="text" size="mini" @click="applyColumnSettings">应用</el-button>
              <el-button type="text" size="mini" @click="resetColumnSettings">重置</el-button>
            </div>
          </div>
          <el-dropdown-item divided></el-dropdown-item>
          <div class="column-item"
            v-for="col in columnOptions" 
            :key="col.prop"
          >
            <el-checkbox 
              v-model="tempColumnVisibility[col.prop]"
              @change="handleTempColumnChange"
            >
              {{ col.label }}
            </el-checkbox>
          </div>
        </el-dropdown-menu>
      </el-dropdown>
      
      <slot name="toolbar-right"></slot>
    </div>
  </div>
</template>

<script>
import BatchAction from '@/components/BatchAction'
import ExportButton from '@/components/ExportButton'
import ImportButton from '@/components/ImportButton'
import PrintButton from '@/components/PrintButton'

export default {
  name: 'TableToolbar',
  components: {
    BatchAction,
    ExportButton,
    ImportButton,
    PrintButton
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
    },

    // 打印按钮相关属性
    enablePrint: {
      type: Boolean,
      default: false
    },
    printSelector: {
      type: String,
      default: ''
    },
    printTitle: {
      type: String,
      default: '打印文档'
    },
    printText: {
      type: String,
      default: '打印'
    },
    printIcon: {
      type: String,
      default: 'el-icon-printer'
    },
    printType: {
      type: String,
      default: 'default'
    },
    printDisabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      // 临时列可见性状态
      tempColumnVisibility: {},
      // 临时全选状态
      tempCheckAll: true,
      // 临时半选状态
      tempIndeterminate: false
    }
  },
  computed: {
    // 当前可见列
    visibleColumns() {
      return this.columnOptions
        .filter(col => this.tempColumnVisibility[col.prop])
        .map(col => col.prop)
    }
  },
  created() {
    this.initTempColumnVisibility()
  },
  methods: {
    // 刷新表格
    handleRefresh() {
      this.$emit('refresh')
    },
    
    // 列设置命令处理
    handleColumnCommand(command) {
      // 可以用于处理特殊列设置命令
    },
    
    // 初始化临时列可见性状态
    initTempColumnVisibility() {
      // 尝试从localStorage读取用户设置的可见列
      const savedColumns = localStorage.getItem(this.storageKey)
      let visibleColumns = []
      
      if (savedColumns) {
        try {
          visibleColumns = JSON.parse(savedColumns)
        } catch (e) {
          console.error('解析保存的列设置失败:', e)
          visibleColumns = [...this.defaultVisibleColumns]
        }
      } else {
        visibleColumns = [...this.defaultVisibleColumns]
      }
      
      // 初始化临时列可见性状态
      const tempVisibility = {}
      this.columnOptions.forEach(col => {
        tempVisibility[col.prop] = visibleColumns.includes(col.prop)
      })
      
      this.tempColumnVisibility = tempVisibility
      this.updateTempCheckAllState()
    },
    
    // 更新临时全选状态
    updateTempCheckAllState() {
      const selectedCount = Object.values(this.tempColumnVisibility).filter(v => v).length
      this.tempCheckAll = selectedCount === this.columnOptions.length
      this.tempIndeterminate = selectedCount > 0 && selectedCount < this.columnOptions.length
    },
    
    // 临时列变化处理
    handleTempColumnChange() {
      this.updateTempCheckAllState()
    },
    
    // 临时全选变化处理
    handleTempCheckAllChange(val) {
      Object.keys(this.tempColumnVisibility).forEach(key => {
        this.tempColumnVisibility[key] = val
      })
      this.tempIndeterminate = false
    },
    
    // 应用列设置
    applyColumnSettings() {
      // 保存设置到localStorage
      localStorage.setItem(this.storageKey, JSON.stringify(this.visibleColumns))
      
      // 发送列设置变更事件
      this.$emit('column-change', this.visibleColumns)
      
      // 提示用户
      this.$message.success('列设置已应用')
      
      // 关闭下拉菜单
      this.$refs.columnDropdown.hide()
    },
    
    // 重置列设置
    resetColumnSettings() {
      // 重置为默认列配置
      const tempVisibility = {}
      this.columnOptions.forEach(col => {
        tempVisibility[col.prop] = this.defaultVisibleColumns.includes(col.prop)
      })
      
      this.tempColumnVisibility = tempVisibility
      this.updateTempCheckAllState()
      
      // 清除localStorage中保存的设置
      localStorage.removeItem(this.storageKey)
      
      // 发送列设置变更事件
      this.$emit('column-change', [...this.defaultVisibleColumns])
      
      // 提示用户
      this.$message.success('列设置已重置为默认')
      
      // 关闭下拉菜单
      this.$refs.columnDropdown.hide()
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

    // PrintButton 相关方法
    handleBeforePrint() {
      this.$emit('before-print')
    },
    
    handleAfterPrint() {
      this.$emit('after-print')
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

// 列设置下拉菜单样式
.el-dropdown-menu.column-dropdown {
  min-width: 180px;
  max-height: 400px;
  overflow-y: auto;

  .column-dropdown-header {
    padding: 12px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #ebeef5;
    margin-bottom: 5px;
    background-color: #f5f7fa;
    
    .column-dropdown-actions {
      .el-button {
        padding: 2px 5px;
        margin-left: 8px;
      }
    }
  }
  
  .column-item {
    padding: 8px 16px;
    line-height: 1.5;
    cursor: pointer;
    
    .el-checkbox {
      width: 100%;
      display: flex;
      align-items: center;
      margin-right: 0;
    }

    &:hover {
      background-color: transparent;
    }
  }

  .el-dropdown-menu__item.divided {
    margin: 0;
    padding: 0;
    height: 1px;
  }
}
</style> 