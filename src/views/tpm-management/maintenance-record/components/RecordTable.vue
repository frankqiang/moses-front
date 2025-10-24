/**
 * 文件名称：RecordTable.vue
 * 文件描述：维护记录表格组件
 * 创建日期：2025-01-20
 * 修改记录：
 *   - 2025-01-20: 初始创建，实现维护记录列表展示
 */
<template>
  <div class="record-table">
    <!-- 维护工时统计卡片 (P1功能) -->
    <el-card v-if="showWorkHoursStats" class="record-table__stats" shadow="never">
      <div class="stats-content">
        <div class="stats-item">
          <span class="stats-label">总维护记录</span>
          <span class="stats-value">{{ pagination.total || 0 }}条</span>
        </div>
        <el-divider direction="vertical" />
        <div class="stats-item">
          <span class="stats-label">总维护工时</span>
          <span class="stats-value stats-value--primary">{{ totalWorkHours }}小时</span>
        </div>
        <el-divider direction="vertical" />
        <div class="stats-item">
          <span class="stats-label">平均工时</span>
          <span class="stats-value">{{ averageWorkHours }}小时</span>
        </div>
      </div>
    </el-card>

    <table-toolbar
      ref="toolbar"
      class="record-table__toolbar"
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
        <slot name="toolbar-left">
          <span v-if="selectedRows.length" class="record-table__selection-indicator">
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
      class="record-table__main"
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
      @selection-change="handleSelectionChange"
      @pagination-change="handlePaginationChange"
      @sort-change="handleSortChange"
      @retry="handleRetry"
    >
      <template #recordCode="{ row, value }">
        <span v-if="value" class="record-table__code">
          {{ value }}
        </span>
        <span v-else>-</span>
      </template>

      <template #equipmentCode="{ row }">
        <span v-if="row.equipment && row.equipment.equipmentCode">
          {{ row.equipment.equipmentCode }}
        </span>
        <span v-else>-</span>
      </template>

      <template #equipmentName="{ row }">
        <el-tooltip
          v-if="row.equipment && row.equipment.name"
          effect="light"
          placement="top"
        >
          <div slot="content">
            <p><strong>设备名称：</strong>{{ row.equipment.name }}</p>
            <p><strong>设备类型：</strong>{{ row.equipment.equipmentType || '-' }}</p>
            <p><strong>设备状态：</strong>{{ row.equipment.status || '-' }}</p>
          </div>
          <span class="record-table__equipment-name">
            {{ row.equipment.name }}
          </span>
        </el-tooltip>
        <span v-else>-</span>
      </template>

      <template #maintenanceType="{ value }">
        <status-tag
          v-if="value"
          :status="value"
          :text-map="maintenanceTypeConfig.textMap"
          :type-map="maintenanceTypeConfig.typeMap"
          effect="light"
          size="small"
        />
        <span v-else>-</span>
      </template>

      <template #maintenanceDate="{ value }">
        <span v-if="value">{{ formatDateTime(value) }}</span>
        <span v-else>-</span>
      </template>

      <template #executorName="{ row }">
        <el-tooltip
          v-if="row.executor && row.executor.name"
          effect="light"
          placement="top"
        >
          <div slot="content">
            <p><strong>姓名：</strong>{{ row.executor.name }}</p>
            <p><strong>邮箱：</strong>{{ row.executor.email || '-' }}</p>
          </div>
          <span class="record-table__executor">{{ row.executor.name }}</span>
        </el-tooltip>
        <span v-else>-</span>
      </template>

      <template #workHours="{ value }">
        <span v-if="value" class="record-table__work-hours">
          {{ formatWorkHours(value) }}
        </span>
        <span v-else>-</span>
      </template>

      <template #confirmerName="{ row }">
        <el-tooltip
          v-if="row.confirmer && row.confirmer.name"
          effect="light"
          placement="top"
        >
          <div slot="content">
            <p><strong>姓名：</strong>{{ row.confirmer.name }}</p>
            <p><strong>邮箱：</strong>{{ row.confirmer.email || '-' }}</p>
          </div>
          <span class="record-table__confirmer">{{ row.confirmer.name }}</span>
        </el-tooltip>
        <span v-else>-</span>
      </template>

      <template #maintenanceContent="{ value }">
        <span v-if="value">{{ value }}</span>
        <span v-else>-</span>
      </template>

      <template #updatedAt="{ value }">
        <span v-if="value">{{ formatDateTime(value) }}</span>
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
  TABLE_TOOLBAR_CONFIG
} from '../constants/table-config'
import {
  DEFAULT_SORT,
  MAINTENANCE_TYPE_CONFIG,
  WORK_HOURS_PRECISION
} from '../constants/maintenance-record'

export default {
  name: 'RecordTable',
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
      default: '维护记录列表'
    },
    toolbarConfig: {
      type: Object,
      default: () => ({})
    },
    showWorkHoursStats: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      columnSettingsKeyPrefix: 'maintenanceRecordColumns',
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
    maintenanceTypeConfig() {
      return MAINTENANCE_TYPE_CONFIG
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
      const prop = strategy[0] || 'maintenanceDate'
      const order = strategy[1] === 'asc' ? 'ascending' : 'descending'
      return { prop, order }
    },
    visibleTableColumns() {
      const visibleProps = this.internalVisibleColumns.length
        ? this.internalVisibleColumns
        : this.defaultVisibleColumns

      return this.columnOptions.filter((column) => visibleProps.includes(column.prop))
    },
    /**
     * 计算总维护工时（P1功能）
     */
    totalWorkHours() {
      if (!this.data || !this.data.length) {
        return '0.00'
      }
      const total = this.data.reduce((sum, record) => {
        const hours = parseFloat(record.workHours)
        return sum + (Number.isNaN(hours) ? 0 : hours)
      }, 0)
      return total.toFixed(WORK_HOURS_PRECISION)
    },
    /**
     * 计算平均维护工时（P1功能）
     */
    averageWorkHours() {
      if (!this.data || !this.data.length) {
        return '0.00'
      }
      const validRecords = this.data.filter(record => {
        const hours = parseFloat(record.workHours)
        return !Number.isNaN(hours)
      })
      if (validRecords.length === 0) {
        return '0.00'
      }
      const total = parseFloat(this.totalWorkHours)
      const average = total / validRecords.length
      return average.toFixed(WORK_HOURS_PRECISION)
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
    getActionButtons(row) {
      if (!row) {
        return []
      }
      return [
        {
          text: '查看详情',
          action: 'view',
          icon: 'el-icon-view'
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
     * 格式化日期时间
     */
    formatDateTime(value) {
      if (!value) {
        return '-'
      }
      try {
        const date = new Date(value)
        if (Number.isNaN(date.getTime())) {
          return '-'
        }
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
      } catch (error) {
        console.warn('格式化日期失败:', value, error)
        return '-'
      }
    },
    /**
     * 格式化维护工时
     */
    formatWorkHours(value) {
      if (value === null || value === undefined) {
        return '-'
      }
      const hours = parseFloat(value)
      if (Number.isNaN(hours)) {
        return '-'
      }
      return `${hours.toFixed(WORK_HOURS_PRECISION)}小时`
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
</script>

<style lang="scss" scoped>
.record-table {
  display: flex;
  flex-direction: column;
  gap: 12px;

  &__stats {
    margin-bottom: 8px;

    .stats-content {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 24px;
    }

    .stats-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .stats-label {
      font-size: 14px;
      color: #909399;
    }

    .stats-value {
      font-size: 20px;
      font-weight: 600;
      color: #303133;

      &--primary {
        color: #409eff;
      }
    }

    .el-divider--vertical {
      height: 40px;
      margin: 0;
    }
  }

  &__toolbar {
    display: flex;
  }

  &__selection-indicator {
    font-size: 12px;
    color: #909399;
  }

  &__code {
    font-family: 'Courier New', Courier, monospace;
    font-weight: 500;
    color: #303133;
  }

  &__equipment-name,
  &__executor,
  &__confirmer {
    color: #606266;
    cursor: help;
  }

  &__work-hours {
    font-weight: 500;
    color: #409eff;
  }
}
</style>

