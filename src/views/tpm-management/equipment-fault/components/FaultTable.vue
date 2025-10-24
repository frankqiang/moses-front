/**
 * 文件名称：FaultTable.vue
 * 文件描述：设备故障列表表格组件
 * 创建日期：2025-01-20
 * 修改记录：
 *   - 2025-01-20: 初始创建
 */
<template>
  <div class="fault-table">
    <table-toolbar
      ref="toolbar"
      class="fault-table__toolbar"
      :enable-column-settings="toolbarProps.enableColumnSettings"
      :enable-batch-actions="toolbarProps.enableBatchActions"
      :enable-export="hasExport"
      :export-api="exportApi"
      :export-params="effectiveExportParams"
      :export-filename="exportFilename"
      :enable-import="false"
      :enable-refresh="toolbarProps.enableRefresh"
      :refresh-feedback-mode="toolbarProps.refreshFeedbackMode"
      :column-options="columnOptions"
      :storage-key="columnSettingsKey"
      :default-visible-columns="defaultVisibleColumns"
      :visible-columns="internalVisibleColumns"
      :selected-rows="selectedRows"
      :table-data="data"
      @refresh="handleToolbarRefresh"
      @column-change="handleToolbarColumnChange"
    >
      <template #toolbar-left>
        <action-buttons :buttons="toolbarButtons" mode="normal" @click="handleToolbarAction" />
        <slot name="toolbar-left">
          <span v-if="selectedRows.length" class="fault-table__selection-indicator">
            已选{{ selectedRows.length }}项
          </span>
        </slot>
      </template>
      <template #toolbar-right>
        <slot name="toolbar-right" />
      </template>
    </table-toolbar>

    <base-table
      ref="baseTable"
      class="fault-table__main"
      :data="data"
      :columns="visibleTableColumns"
      :loading="loading"
      :load-error="loadError"
      :allow-retry="allowRetry"
      :pagination="tablePagination"
      :show-selection="false"
      :show-index="true"
      :default-sort="defaultSort"
      stripe
      border
      highlight-current-row
      :row-class-name="resolveRowClass"
      @selection-change="handleSelectionChange"
      @pagination-change="handlePaginationChange"
      @sort-change="handleSortChange"
      @retry="handleRetry"
    >
      <template #failureCode="{ row, value }">
        <el-tooltip
          v-if="value"
          effect="light"
          placement="top"
          :content="copyTooltip"
        >
          <span class="fault-table__code" @click="handleCopyFailureCode(value)">
            {{ value }}
            <i class="el-icon-document-copy" aria-hidden="true" />
          </span>
        </el-tooltip>
        <span v-else>-</span>
      </template>

      <template #failureLevel="{ value }">
        <status-tag
          v-if="value"
          :status="value"
          :text-map="failureLevelConfig.textMap"
          :type-map="failureLevelConfig.typeMap"
          effect="plain"
          size="small"
        />
        <span v-else>-</span>
      </template>

      <template #status="{ value }">
        <status-tag
          v-if="value"
          :status="value"
          :text-map="failureStatusConfig.textMap"
          :type-map="failureStatusConfig.typeMap"
          effect="light"
          size="small"
        />
        <span v-else>-</span>
      </template>

      <template #isRepeatFailure="{ value }">
        <el-tooltip
          v-if="value"
          effect="light"
          placement="top"
          content="重复故障"
        >
          <i class="el-icon-warning fault-table__repeat-icon" aria-label="重复故障" />
        </el-tooltip>
        <span v-else>-</span>
      </template>

      <template #mttrHours="{ value }">
        <span v-if="value !== null && value !== undefined">{{ formatMTTR(value) }}</span>
        <span v-else>-</span>
      </template>

      <template #actions="{ row }">
        <action-buttons
          :buttons="getActionButtons(row)"
          :row="row"
          mode="text"
          size="small"
          @click="handleActionClick"
        />
      </template>
    </base-table>
  </div>
</template>

<script>
import BaseTable from '@/components/BaseTable'
import TableToolbar from '@/components/TableToolbar'
import StatusTag from '@/components/StatusTag'
import ActionButtons from '@/components/ActionButtons'
import columnSettingsMixin from '@/components/TableToolbar/columnSettingsMixin'
import { formatDateTime } from '../utils'
import {
  TABLE_COLUMNS,
  DEFAULT_VISIBLE_COLUMNS,
  TABLE_TOOLBAR_CONFIG,
  FAILURE_LEVEL_CONFIG,
  FAILURE_STATUS_CONFIG,
  FAILURE_LEVEL,
  FAILURE_STATUS,
  DEFAULT_SORT
} from '../constants'

export default {
  name: 'FaultTable',
  components: {
    BaseTable,
    TableToolbar,
    StatusTag,
    ActionButtons
  },
  mixins: [columnSettingsMixin],
  props: {
    data: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    loadError: {
      type: [Boolean, String, Object],
      default: false
    },
    pagination: {
      type: Object,
      default: () => ({
        page: 1,
        limit: 10,
        total: 0
      })
    },
    sortBy: {
      type: String,
      default: DEFAULT_SORT
    },
    allowRetry: {
      type: Boolean,
      default: true
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
      default: '设备故障列表'
    },
    toolbarConfig: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      columnSettingsKeyPrefix: 'equipmentFaultColumns',
      selectedRows: []
    }
  },
  computed: {
    columnOptions() {
      return TABLE_COLUMNS
    },
    defaultVisibleColumns() {
      return DEFAULT_VISIBLE_COLUMNS
    },
    failureLevelConfig() {
      return FAILURE_LEVEL_CONFIG
    },
    failureStatusConfig() {
      return FAILURE_STATUS_CONFIG
    },
    toolbarProps() {
      return {
        ...TABLE_TOOLBAR_CONFIG,
        ...this.toolbarConfig
      }
    },
    hasExport() {
      return typeof this.exportApi === 'function'
    },
    effectiveExportParams() {
      return {
        ...this.exportParams
      }
    },
    tablePagination() {
      if (!this.pagination) {
        return null
      }
      const { page = 1, limit = 10, total = 0, pageSizes, layout, background } = this.pagination
      return {
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        total: Number(total) || 0,
        pageSizes: pageSizes || [10, 20, 50, 100],
        layout: layout || 'total, sizes, prev, pager, next, jumper',
        background: background !== false
      }
    },
    defaultSort() {
      const strategy = (this.sortBy || DEFAULT_SORT).split(':')
      const prop = strategy[0] || 'failureTime'
      const order = strategy[1] === 'asc' ? 'ascending' : 'descending'
      return { prop, order }
    },
    visibleTableColumns() {
      const visibleProps = this.internalVisibleColumns.length
        ? this.internalVisibleColumns
        : this.defaultVisibleColumns

      return this.columnOptions
        .filter((column) => visibleProps.includes(column.prop))
        .map((column) => {
          if (column.prop === 'failureTime') {
            return {
              ...column,
              formatter: (row) => formatDateTime(row.failureTime)
            }
          }
          if (column.prop === 'equipmentCode') {
            return {
              ...column,
              formatter: (row) => row.equipment?.equipmentCode || '-'
            }
          }
          if (column.prop === 'equipmentName') {
            return {
              ...column,
              formatter: (row) => row.equipment?.equipmentName || '-'
            }
          }
          if (column.prop === 'reporterName') {
            return {
              ...column,
              formatter: (row) => row.reporter?.name || '-'
            }
          }
          if (column.prop === 'repairerName') {
            return {
              ...column,
              formatter: (row) => row.repairer?.name || '-'
            }
          }
          return column
        })
    },
    copyTooltip() {
      return '点击复制故障编码'
    },
    toolbarButtons() {
      return [
        {
          action: 'create',
          text: '新增故障报告',
          type: 'primary',
          icon: 'el-icon-plus',
          size: 'small'
        },
        {
          action: 'statistics',
          text: '统计分析',
          type: 'default',
          icon: 'el-icon-data-analysis',
          size: 'small'
        }
      ]
    }
  },
  created() {
    this.initColumns(this.columnOptions)
  },
  methods: {
    handleToolbarRefresh() {
      this.$emit('refresh')
    },
    handleToolbarColumnChange(columns) {
      this.handleColumnChange(columns)
      this.$emit('column-change', columns)
    },
    handleSelectionChange(selection) {
      this.selectedRows = selection
      this.$emit('selection-change', selection)
    },
    handlePaginationChange({ page, limit }) {
      this.$emit('pagination-change', { page, limit })
    },
    handleSortChange({ prop, order }) {
      if (!prop || !order) {
        this.$emit('sort-change', '')
        return
      }
      const direction = order === 'ascending' ? 'asc' : 'desc'
      this.$emit('sort-change', `${prop}:${direction}`)
    },
    handleRetry() {
      this.$emit('retry')
    },
    handleToolbarAction(action) {
      switch (action.action) {
        case 'create':
          this.$emit('create')
          break
        case 'statistics':
          this.$router.push({ name: 'EquipmentFaultStatistics' })
          break
        default:
          console.warn('未处理的工具栏操作:', action)
      }
    },
    handleCopyFailureCode(code) {
      if (!code) {
        return
      }

      const text = String(code)
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          this.$message.success('故障编码已复制')
        }).catch(() => {
          fallbackCopyText(text, this.$message)
        })
        return
      }

      fallbackCopyText(text, this.$message)
    },
    resolveRowClass({ row }) {
      if (!row) {
        return ''
      }
      if (row.failureLevel === FAILURE_LEVEL.CRITICAL) {
        return 'fault-table__row--critical'
      }
      if (row.failureLevel === FAILURE_LEVEL.MAJOR) {
        return 'fault-table__row--major'
      }
      return ''
    },
    formatMTTR(value) {
      if (value === null || value === undefined || Number.isNaN(Number(value))) {
        return '-'
      }
      return `${Number(value).toFixed(1)}小时`
    },
    getActionButtons(row) {
      if (!row) {
        return []
      }

      const buttons = [
        {
          text: '查看详情',
          action: 'view',
          icon: 'el-icon-view'
        }
      ]

      if (row.status === FAILURE_STATUS.PENDING || row.status === FAILURE_STATUS.IN_PROGRESS) {
        buttons.push({
          text: '处理',
          action: 'process',
          icon: 'el-icon-edit-outline',
          type: 'primary'
        })
      }

      if (row.status !== FAILURE_STATUS.CLOSED) {
        buttons.push({
          text: '关闭',
          action: 'close',
          icon: 'el-icon-circle-close',
          type: 'warning'
        })
      }

      return buttons
    },
    handleActionClick({ action, row }) {
      if (!action) {
        return
      }
      this.$emit(action, row)
    },
    refreshSucceed(message) {
      if (this.$refs.toolbar) {
        this.$refs.toolbar.refreshSucceed(message)
      }
    },
    refreshFail(message) {
      if (this.$refs.toolbar) {
        this.$refs.toolbar.refreshFail(message)
      }
    }
  }
}

function fallbackCopyText(text, messageInstance) {
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'absolute'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  try {
    document.execCommand('copy')
    messageInstance?.success('故障编码已复制')
  } catch (error) {
    console.error('复制失败:', error)
    messageInstance?.warning('复制失败，请手动复制')
  } finally {
    document.body.removeChild(textarea)
  }
}
</script>

<style lang="scss" scoped>
.fault-table {
  display: flex;
  flex-direction: column;
  gap: 12px;

  &__toolbar {
    display: flex;
  }

  &__selection-indicator {
    font-size: 12px;
    color: #909399;
    margin-left: 12px;
  }

  &__code {
    cursor: pointer;
    color: #409eff;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    transition: all 0.2s;

    &:hover {
      text-decoration: underline;
      color: #66b1ff;
    }

    i {
      font-size: 12px;
    }
  }

  &__repeat-icon {
    color: #f56c6c;
    font-size: 18px;
    cursor: help;
    animation: pulse 2s ease-in-out infinite;
  }
}

::v-deep .fault-table__row--critical {
  background-color: rgba(245, 108, 108, 0.08);

  &:hover > td {
    background-color: rgba(245, 108, 108, 0.12) !important;
  }
}

::v-deep .fault-table__row--major {
  background-color: rgba(230, 162, 60, 0.08);

  &:hover > td {
    background-color: rgba(230, 162, 60, 0.12) !important;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}
</style>

