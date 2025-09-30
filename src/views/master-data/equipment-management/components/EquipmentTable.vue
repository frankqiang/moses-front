/**
 * 文件名称：EquipmentTable.vue
 * 文件描述：设备主数据管理模块表格组件，基于 BaseTable 与 TableToolbar 实现数据展示、操作工具栏
 * 创建日期：2025-09-29
 * 修改记录：
 *   - 2025-09-29: 初始创建，完成 TASK004 P0 要求
 */

<template>
  <div class="equipment-table">
    <TableToolbar
      ref="toolbarRef"
      :enable-column-settings="true"
      :storage-key="columnStorageKey"
      :column-options="tableColumns"
      :default-visible-columns="defaultVisibleColumns"
      :selected-rows="selectedRows"
      :enable-batch-actions="false"
      :enable-export="true"
      :export-api="resolvedExportApi"
      :export-params="exportParams"
      :refresh-feedback-mode="'all'"
      @refresh="$emit('refresh')"
      @column-change="handleColumnChange"
      @export-success="handleExportSuccess"
    >
      <template #toolbar-left>
        <ActionButtons
          :buttons="primaryButtons"
          mode="normal"
          @click="handleToolbarAction"
        />
        <slot name="toolbar-left" />
      </template>
      <template #toolbar-right>
        <slot name="toolbar-right" />
      </template>
    </TableToolbar>

    <BaseTable
      ref="baseTableRef"
      :data="data"
      :loading="loading"
      :columns="visibleColumns"
      :pagination="paginationConfig"
      :show-selection="false"
      stripe
      border
      highlight-current-row
      :empty-text="emptyText"
      @pagination-change="$emit('pagination-change', $event)"
    >
      <template #equipmentType="{ row }">
        <span>{{ getEquipmentTypeText(row.equipmentType) }}</span>
      </template>
      <template #status="{ row }">
        <StatusTag
          :status="row.status"
          :text-map="statusConfig.textMap"
          :type-map="statusConfig.typeMap"
        />
      </template>
      <template #detailSummary="{ row }">
        <div class="detail-summary">
          <span v-if="detailSummary(row)" class="summary-text">
            {{ detailSummary(row) }}
          </span>
          <span v-else class="summary-empty">-</span>
        </div>
      </template>
      <template #actions="{ row }">
        <ActionButtons
          :buttons="getRowActions(row)"
          mode="text"
          :row="row"
          @click="handleRowAction"
        />
      </template>
    </BaseTable>
  </div>
</template>

<script>
import TableToolbar from '@/components/TableToolbar'
import BaseTable from '@/components/BaseTable'
import ActionButtons from '@/components/ActionButtons'
import StatusTag from '@/components/StatusTag'
import tableConfigStore from '@/utils/table-config-store'
import { cloneDeep } from 'lodash'
import {
  TABLE_COLUMNS,
  DEFAULT_VISIBLE_COLUMNS,
  STATUS_CONFIG
} from '../constants/table-config'
import { EQUIPMENT_DETAIL_LABELS, EQUIPMENT_TYPE_MAP } from '../constants/equipment-management'

const COLUMN_STORAGE_KEY = 'equipment_columns_EquipmentTable'

export default {
  name: 'EquipmentTable',
  components: {
    TableToolbar,
    BaseTable,
    ActionButtons,
    StatusTag
  },
  props: {
    data: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    total: {
      type: Number,
      default: 0
    },
    page: {
      type: Number,
      default: 1
    },
    limit: {
      type: Number,
      default: 10
    },
    exportApi: {
      type: Function,
      default: null
    },
    exportParams: {
      type: Object,
      default: () => ({})
    },
    selectedRows: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      tableColumns: TABLE_COLUMNS,
      statusConfig: STATUS_CONFIG,
      columnStorageKey: COLUMN_STORAGE_KEY,
      internalVisibleColumns: this.getInitialVisibleColumns()
    }
  },
  computed: {
    defaultVisibleColumns() {
      return DEFAULT_VISIBLE_COLUMNS
    },
    visibleColumns() {
      if (!Array.isArray(this.internalVisibleColumns) || this.internalVisibleColumns.length === 0) {
        return this.tableColumns
      }
      return this.tableColumns.filter(column => this.internalVisibleColumns.includes(column.columnId))
    },
    paginationConfig() {
      return {
        total: this.total,
        page: this.page,
        limit: this.limit,
        pageSizes: [10, 20, 50, 100],
        layout: 'total, sizes, prev, pager, next, jumper',
        background: true
      }
    },
    primaryButtons() {
      return [
        {
          action: 'create',
          text: '新增设备',
          type: 'primary',
          icon: 'el-icon-plus',
          size: 'small'
        }
      ]
    },
    resolvedExportApi() {
      if (typeof this.exportApi === 'function') {
        return this.exportApi
      }
      return () => Promise.resolve()
    },
    emptyText() {
      return this.loading ? '加载中...' : '暂无设备数据'
    }
  },
  methods: {
    getInitialVisibleColumns() {
      const stored = tableConfigStore.getColumnConfig(this.columnStorageKey, DEFAULT_VISIBLE_COLUMNS)
      if (Array.isArray(stored) && stored.length > 0) {
        return cloneDeep(stored)
      }
      return cloneDeep(DEFAULT_VISIBLE_COLUMNS)
    },
    handleColumnChange(visibleColumns) {
      this.internalVisibleColumns = visibleColumns
      tableConfigStore.saveColumnConfig(this.columnStorageKey, visibleColumns)
    },
    handleExportSuccess(message) {
      if (message) {
        this.$message.success(message)
      }
    },
    detailSummary(row) {
      if (!row || !row.detail) {
        return ''
      }
      const detailEntries = Object.entries(row.detail)
      if (!detailEntries.length) {
        return ''
      }
      const summaryParts = detailEntries.slice(0, 3).map(([key, value]) => {
        const label = EQUIPMENT_DETAIL_LABELS[key] || key
        return `${label}: ${value}`
      })
      return summaryParts.join(' | ')
    },
    handleToolbarAction(button, context) {
      if (button.action === 'create') {
        this.$emit('create')
        return
      }
      this.$emit('toolbar-action', { button, context })
    },
    getRowActions(row) {
      return [
        {
          action: 'view',
          text: '查看详情',
          icon: 'el-icon-view',
          type: 'text'
        },
        {
          action: 'edit',
          text: '编辑',
          icon: 'el-icon-edit-outline',
          type: 'text'
        }
      ]
    },
    getEquipmentTypeText(equipmentType) {
      return EQUIPMENT_TYPE_MAP[equipmentType] || equipmentType || '-'
    },
    handleRowAction({ action, row }) {
      if (!row) return
      switch (action) {
        case 'view':
          this.$emit('view', row)
          break
        case 'edit':
          this.$emit('edit', row)
          break
        default:
          this.$emit('row-action', { action, row })
      }
    },
    handleRefreshSuccess(message) {
      this.$refs.toolbarRef?.refreshSucceed(message)
    },
    handleRefreshError(message) {
      this.$refs.toolbarRef?.refreshFail(message)
    }
  }
}
</script>

<style lang="scss" scoped>
.equipment-table {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .detail-summary {
    display: flex;
    align-items: center;
    min-height: 24px;

    .summary-text {
      color: #303133;
    }

    .summary-empty {
      color: #909399;
    }
  }
}
</style>

