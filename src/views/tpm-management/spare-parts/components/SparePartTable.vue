/**
 * 文件名称：SparePartTable.vue
 * 文件描述：备件列表表格组件
 * 创建日期：2025-01-21
 * 修改记录：
 *   - 2025-01-21: 初始创建，实现P0阶段核心功能
 */
<template>
  <div class="spare-part-table">
    <table-toolbar
      ref="toolbar"
      class="spare-part-table__toolbar"
      :enable-column-settings="toolbarProps.enableColumnSettings"
      :enable-batch-actions="toolbarProps.enableBatchActions"
      :enable-export="toolbarProps.enableExport"
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
          <span v-if="selectedRows.length" class="spare-part-table__selection-indicator">
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
      class="spare-part-table__main"
      :data="data"
      :columns="visibleTableColumns"
      :loading="loading"
      :load-error="loadError"
      :allow-retry="allowRetry"
      :pagination="tablePagination"
      :show-selection="true"
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
      <template #sparePartCode="{ row, value }">
        <el-tooltip
          v-if="value"
          effect="light"
          placement="top"
          :content="copyTooltip"
        >
          <span class="spare-part-table__code" @click="handleCopySparePartCode(value)">
            {{ value }}
            <i class="el-icon-document-copy" aria-hidden="true" />
          </span>
        </el-tooltip>
        <span v-else>-</span>
      </template>

      <template #unitPrice="{ value }">
        <span>{{ formatPrice(value) }}</span>
      </template>

      <template #currentQuantity="{ row }">
        <span
          v-if="row.inventory"
          :class="getInventoryClass(row)"
        >
          {{ row.inventory.currentQuantity }} {{ row.unit }}
        </span>
        <span v-else>-</span>
      </template>

      <template #inventoryStatus="{ row }">
        <status-tag
          v-if="row.inventory"
          :status="getInventoryStatusKey(row)"
          :text-map="statusConfig.textMap"
          :type-map="statusConfig.typeMap"
          effect="light"
          size="small"
        />
        <span v-else>-</span>
      </template>

      <template #supplierName="{ row }">
        <span v-if="row.supplierInfo && row.supplierInfo.name">
          {{ row.supplierInfo.name }}
        </span>
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
import {
  TABLE_COLUMNS,
  DEFAULT_VISIBLE_COLUMNS,
  STATUS_CONFIG,
  TABLE_TOOLBAR_CONFIG
} from '../constants/table-config'
import { DEFAULT_SORT } from '../constants/spare-part-management'
import { formatDateTime } from '../utils'
export default {
  name: 'SparePartTable',
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
    toolbarConfig: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      columnSettingsKeyPrefix: 'sparePartColumns',
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
    statusConfig() {
      return STATUS_CONFIG
    },
    toolbarProps() {
      return {
        ...TABLE_TOOLBAR_CONFIG,
        ...this.toolbarConfig
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
      const prop = strategy[0] || 'createdAt'
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
          if (column.prop === 'createdAt' || column.prop === 'updatedAt') {
            return {
              ...column,
              formatter: (row) => formatDateTime(row[column.prop])
            }
          }
          return column
        })
    },
    copyTooltip() {
      return '点击复制备件编码'
    },
    toolbarButtons() {
      return [
        {
          action: 'create',
          text: '新增备件',
          type: 'primary',
          icon: 'el-icon-plus',
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
        default:
          console.warn('未处理的工具栏操作:', action)
      }
    },
    handleCopySparePartCode(code) {
      if (!code) {
        return
      }

      const text = String(code)
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          this.$message.success('备件编码已复制')
        }).catch(() => {
          fallbackCopyText(text, this.$message)
        })
        return
      }

      fallbackCopyText(text, this.$message)
    },
    resolveRowClass({ row }) {
      if (!row || !row.inventory) {
        return ''
      }
      const statusKey = this.getInventoryStatusKey(row)
      const type = this.statusConfig.typeMap[statusKey]
      return type ? `spare-part-table__row--${type}` : ''
    },
    getInventoryStatusKey(row) {
      if (!row || !row.inventory) {
        return 'NORMAL'
      }
      const { currentQuantity } = row.inventory
      const { safetyStock } = row
      if (currentQuantity <= safetyStock) {
        return 'LOW_STOCK'
      }
      return 'NORMAL'
    },
    getInventoryClass(row) {
      const statusKey = this.getInventoryStatusKey(row)
      return statusKey === 'LOW_STOCK' ? 'spare-part-table__low-stock' : ''
    },
    getActionButtons(row) {
      if (!row) {
        return []
      }
      return [
        {
          text: '详情',
          action: 'view',
          icon: 'el-icon-view'
        },
        {
          text: '编辑',
          action: 'edit',
          icon: 'el-icon-edit'
        },
        {
          text: '入库',
          action: 'in-stock',
          icon: 'el-icon-upload2'
        },
        {
          text: '出库',
          action: 'out-stock',
          icon: 'el-icon-download'
        }
      ]
    },
    handleActionClick({ action, row }) {
      if (!action) {
        return
      }
      this.$emit(action, row)
    },
    /**
     * 刷新成功反馈
     */
    refreshSucceed(message) {
      if (this.$refs.toolbar) {
        this.$refs.toolbar.refreshSucceed(message)
      }
    },
    /**
     * 刷新失败反馈
     */
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
    messageInstance?.success('备件编码已复制')
  } catch (error) {
    console.error('复制失败:', error)
    messageInstance?.warning('复制失败，请手动复制')
  } finally {
    document.body.removeChild(textarea)
  }
}
</script>

<style lang="scss" scoped>
.spare-part-table {
  display: flex;
  flex-direction: column;
  gap: 12px;

  &__toolbar {
    display: flex;
  }

  &__selection-indicator {
    font-size: 12px;
    color: #909399;
  }

  &__code {
    cursor: pointer;
    color: #409eff;
    display: inline-flex;
    align-items: center;
    gap: 4px;

    &:hover {
      text-decoration: underline;
    }
  }

  &__low-stock {
    color: #f56c6c;
    font-weight: bold;
  }
}

.spare-part-table__row--danger {
  background-color: rgba(245, 108, 108, 0.08);
}

.spare-part-table__row--success {
  background-color: rgba(103, 194, 58, 0.08);
}

.spare-part-table__row--info {
  background-color: rgba(144, 147, 153, 0.08);
}
</style>

