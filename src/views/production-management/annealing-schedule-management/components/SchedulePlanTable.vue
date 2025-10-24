/**
 * 文件名称：SchedulePlanTable.vue
 * 文件描述：排程方案列表表格组件
 * 创建日期：2025-10-23
 * 修改记录：
 *   - 2025-10-23: 初始创建，实现P0和P1阶段功能
 */
<template>
  <div class="schedule-plan-table">
    <table-toolbar
      ref="toolbar"
      class="schedule-plan-table__toolbar"
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
        <span v-if="selectedRows.length" class="schedule-plan-table__selection-indicator">
          已选{{ selectedRows.length }}项
        </span>
      </template>
      <template #toolbar-right>
        <slot name="toolbar-right" />
      </template>
    </table-toolbar>

    <base-table
      ref="baseTable"
      class="schedule-plan-table__main"
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
      @selection-change="handleSelectionChange"
      @pagination-change="handlePaginationChange"
      @sort-change="handleSortChange"
      @retry="handleRetry"
    >
      <template #planCode="{ value }">
        <el-tooltip
          v-if="value"
          effect="light"
          placement="top"
          content="点击复制方案编号"
        >
          <span class="schedule-plan-table__code" @click="handleCopyPlanCode(value)">
            {{ value }}
            <i class="el-icon-document-copy" aria-hidden="true" />
          </span>
        </el-tooltip>
        <span v-else>-</span>
      </template>

      <template #status="{ row }">
        <status-tag
          v-if="row.status"
          :status="row.status"
          :text-map="planStatusConfig.textMap"
          :type-map="planStatusConfig.typeMap"
          effect="light"
          size="small"
        >
          <template v-if="row.status === 'computing'" #icon>
            <i class="el-icon-loading schedule-plan-table__computing-icon" />
          </template>
          <template #default>
            {{ row.statusLabel }}
          </template>
        </status-tag>
        <span v-else>-</span>
      </template>

      <template #scheduleTimeRange="{ row }">
        <span v-if="row.scheduleStartTime && row.scheduleEndTime" class="schedule-plan-table__time-range">
          {{ formatDateTime(row.scheduleStartTime) }}
          <br>
          至 {{ formatDateTime(row.scheduleEndTime) }}
        </span>
        <span v-else>-</span>
      </template>

      <template #utilizationRate="{ value }">
        <el-progress
          v-if="typeof value === 'number'"
          :percentage="toPercentage(value)"
          :color="getMetricColor(value)"
          :stroke-width="18"
          :text-inside="true"
        />
        <span v-else>-</span>
      </template>

      <template #loadRate="{ value }">
        <el-progress
          v-if="typeof value === 'number'"
          :percentage="toPercentage(value)"
          :color="getMetricColor(value)"
          :stroke-width="18"
          :text-inside="true"
        />
        <span v-else>-</span>
      </template>

      <template #deliveryAchievementRate="{ value }">
        <el-progress
          v-if="typeof value === 'number'"
          :percentage="toPercentage(value)"
          :color="getMetricColor(value)"
          :stroke-width="18"
          :text-inside="true"
        />
        <span v-else>-</span>
      </template>

      <template #conflictCount="{ value }">
        <span v-if="value > 0" class="schedule-plan-table__conflict-count">
          <i class="el-icon-warning" />
          {{ value }}
        </span>
        <span v-else>{{ value || 0 }}</span>
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
  TABLE_TOOLBAR_CONFIG,
  PLAN_STATUS_CONFIG,
  METRIC_THRESHOLD,
  PLAN_STATUS,
  DEFAULT_SORT
} from '../constants'

export default {
  name: 'SchedulePlanTable',
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
        limit: 20,
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
      default: '排程方案列表'
    },
    toolbarConfig: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      columnSettingsKeyPrefix: 'schedulePlanColumns',
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
    planStatusConfig() {
      return PLAN_STATUS_CONFIG
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
      const { page = 1, limit = 20, total = 0, pageSizes, layout, background } = this.pagination
      return {
        page: Number(page) || 1,
        limit: Number(limit) || 20,
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
          if (column.prop === 'createdAt' || column.prop === 'publishedAt') {
            return {
              ...column,
              formatter: (row) => this.formatDateTime(row[column.prop])
            }
          }
          if (column.prop === 'taskCount' || column.prop === 'conflictCount') {
            return {
              ...column,
              formatter: (row) => row[column.prop] || 0
            }
          }
          return column
        })
    },
    toolbarButtons() {
      // 开发阶段：不检查权限，直接显示创建按钮
      // 生产环境：需检查 prod.scheduling.create 权限
      return [
        {
          action: 'create',
          text: '创建排程方案',
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
    handleCopyPlanCode(code) {
      if (!code) {
        return
      }

      const text = String(code)
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          this.$message.success('方案编号已复制')
        }).catch(() => {
          this.fallbackCopyText(text)
        })
        return
      }

      this.fallbackCopyText(text)
    },
    fallbackCopyText(text) {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.setAttribute('readonly', '')
      textarea.style.position = 'absolute'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      try {
        document.execCommand('copy')
        this.$message.success('方案编号已复制')
      } catch (error) {
        console.error('复制失败:', error)
        this.$message.warning('复制失败，请手动复制')
      } finally {
        document.body.removeChild(textarea)
      }
    },
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
    toPercentage(value) {
      if (typeof value !== 'number') {
        return 0
      }
      return Math.round(value * 100)
    },
    getMetricColor(value) {
      if (typeof value !== 'number') {
        return '#909399'
      }
      const percentage = value * 100
      if (percentage >= METRIC_THRESHOLD.HIGH) {
        return '#67C23A'
      }
      if (percentage >= METRIC_THRESHOLD.MEDIUM) {
        return '#E6A23C'
      }
      return '#F56C6C'
    },
    getActionButtons(row) {
      if (!row) {
        return []
      }

      // 开发阶段：仅根据方案状态判断操作按钮显示
      // 生产环境：需添加权限检查（prod.scheduling.view, prod.scheduling.publish, prod.scheduling.cancel）
      const buttons = [
        {
          text: '查看详情',
          action: 'view'
        },
        {
          text: '查看甘特图',
          action: 'viewGantt'
        }
      ]

      // 已生成状态可以发布
      if (row.status === PLAN_STATUS.GENERATED) {
        buttons.push({
          text: '发布',
          action: 'publish'
        })
      }

      // 草稿和已生成状态可以取消
      if (row.status === PLAN_STATUS.DRAFT || row.status === PLAN_STATUS.GENERATED) {
        buttons.push({
          text: '取消',
          action: 'cancel'
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
</script>

<style lang="scss" scoped>
.schedule-plan-table {
  display: flex;
  flex-direction: column;
  gap: 12px;

  &__toolbar {
    display: flex;
  }

  &__selection-indicator {
    margin-left: 12px;
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

  &__computing-icon {
    margin-right: 4px;
    animation: rotate 1s linear infinite;
  }

  &__time-range {
    font-size: 12px;
    line-height: 1.5;
  }

  &__conflict-count {
    color: #F56C6C;
    font-weight: bold;

    i {
      margin-right: 4px;
    }
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>

