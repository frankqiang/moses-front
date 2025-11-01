/**
 * 文件名称：TaskTable.vue
 * 文件描述：退火任务表格组件
 * 创建日期：2025-10-18
 * 修改记录：
 *   - 2025-10-18: 初始创建，实现任务列表展示和操作
 *   - 2025-11-01: 移除"标记为待排程"快速状态更新按钮
 */
<template>
  <div class="task-table">
    <table-toolbar
      ref="toolbar"
      class="task-table__toolbar"
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
          <span v-if="selectedRows.length" class="task-table__selection-indicator">
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
      class="task-table__main"
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
      <template #taskCode="{ value }">
        <el-link v-if="value" type="primary" @click="handleViewDetail(value)">
          {{ value }}
        </el-link>
        <span v-else>-</span>
      </template>

      <template #status="{ value }">
        <status-tag
          v-if="value"
          :status="value"
          :text-map="statusConfig.textMap"
          :type-map="statusConfig.typeMap"
          effect="light"
          size="small"
        />
        <span v-else>-</span>
      </template>

      <template #priority="{ value }">
        <status-tag
          v-if="value"
          :status="value"
          :text-map="priorityConfig.textMap"
          :type-map="priorityConfig.typeMap"
          effect="plain"
          size="small"
        />
        <span v-else>-</span>
      </template>

      <template #processTemplateName="{ row }">
        <span v-if="row.processTemplate && row.processTemplate.templateName">
          {{ row.processTemplate.templateName }}
        </span>
        <span v-else>-</span>
      </template>

      <template #plannedWeight="{ value }">
        <span v-if="value !== null && value !== undefined">{{ formatWeight(value) }}</span>
        <span v-else>-</span>
      </template>

      <template #plannedQuantity="{ value }">
        <span v-if="value !== null && value !== undefined">{{ formatQuantity(value) }}</span>
        <span v-else>-</span>
      </template>

      <template #actualWeight="{ value }">
        <span v-if="value !== null && value !== undefined">{{ formatWeight(value) }}</span>
        <span v-else>-</span>
      </template>

      <template #expectedDurationMinutes="{ value }">
        <span v-if="value !== null && value !== undefined">{{ formatDuration(value) }}</span>
        <span v-else>-</span>
      </template>

      <template #scheduleContextTaskCount="{ row }">
        <span v-if="row.scheduleContext && row.scheduleContext.taskCount !== null && row.scheduleContext.taskCount !== undefined">
          {{ row.scheduleContext.taskCount }}
        </span>
        <span v-else>-</span>
      </template>

      <template #scheduleContextTotalWeight="{ row }">
        <span v-if="row.scheduleContext && row.scheduleContext.totalWeight !== null && row.scheduleContext.totalWeight !== undefined">
          {{ formatWeight(row.scheduleContext.totalWeight) }}
        </span>
        <span v-else>-</span>
      </template>

      <template #scheduleContextCapacityUtilization="{ row }">
        <span v-if="row.scheduleContext && (row.scheduleContext.capacityUtilization || row.scheduleContext.capacityUtilization === 0)">
          {{ formatPercentage(row.scheduleContext.capacityUtilization) }}
        </span>
        <span v-else>-</span>
      </template>

      <template #planNumber="{ row }">
        <el-link v-if="row.plan && row.plan.planNumber" type="primary" @click="handleViewPlan(row.plan.id)">
          {{ row.plan.planNumber }}
        </el-link>
        <span v-else>-</span>
      </template>

      <template #source="{ value }">
        <status-tag
          v-if="value"
          :status="value"
          :text-map="sourceConfig.textMap"
          :type-map="sourceConfig.typeMap"
          effect="plain"
          size="small"
        />
        <span v-else>-</span>
      </template>

      <template #schedulingStatus="{ value }">
        <status-tag
          v-if="value && value.status"
          :status="value.status"
          :text-map="schedulingStatusConfig.textMap"
          :type-map="schedulingStatusConfig.typeMap"
          effect="light"
          size="small"
        />
        <span v-else>-</span>
      </template>

      <template #isLocked="{ row }">
        <el-tag
          v-if="row.schedulingStatus && row.schedulingStatus.isLocked"
          type="warning"
          size="small"
          effect="plain"
        >
          <i class="el-icon-lock" /> 已锁定
        </el-tag>
        <el-tag
          v-else-if="row.schedulingStatus && !row.schedulingStatus.isLocked"
          type="info"
          size="small"
          effect="plain"
        >
          <i class="el-icon-unlock" /> 未锁定
        </el-tag>
        <span v-else>-</span>
      </template>

      <template #actions="{ row }">
        <action-buttons
          :buttons="getActionButtons(row)"
          :row="row"
          mode="text"
          size="small"
          :max-visible="2"
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
  PRIORITY_CONFIG,
  SOURCE_CONFIG,
  SCHEDULING_STATUS_CONFIG,
  TABLE_TOOLBAR_CONFIG
} from '../constants/table-config'
import {
  DEFAULT_SORT,
  TASK_STATUS,
  QUICK_STATUS_ACTIONS
} from '../constants'

export default {
  name: 'TaskTable',
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
      type: [String, Error],
      default: null
    },
    allowRetry: {
      type: Boolean,
      default: true
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
    exportApi: {
      type: Function,
      default: null
    },
    exportParams: {
      type: Object,
      default: () => ({})
    },
    toolbarConfig: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      selectedRows: [],
      defaultVisibleColumns: DEFAULT_VISIBLE_COLUMNS,
      copyTooltip: '点击复制'
    }
  },
  computed: {
    statusConfig() {
      return STATUS_CONFIG
    },
    priorityConfig() {
      return PRIORITY_CONFIG
    },
    sourceConfig() {
      return SOURCE_CONFIG
    },
    schedulingStatusConfig() {
      return SCHEDULING_STATUS_CONFIG
    },
    toolbarProps() {
      return {
        ...TABLE_TOOLBAR_CONFIG,
        ...this.toolbarConfig
      }
    },
    hasExport() {
      return Boolean(this.exportApi) && this.toolbarProps.enableExport
    },
    effectiveExportParams() {
      return {
        ...this.exportParams,
        sortBy: this.sortBy
      }
    },
    exportFilename() {
      const now = new Date()
      const dateStr = now.toISOString().split('T')[0]
      return `退火任务列表_${dateStr}.xlsx`
    },
    columnSettingsKey() {
      return this.toolbarProps.columnSettings?.cacheKey || 'annealingTaskTableColumns'
    },
    columnOptions() {
      return TABLE_COLUMNS.filter((col) => col.prop !== 'actions')
        .map((col) => ({
          prop: col.prop,
          label: col.label
        }))
    },
    visibleTableColumns() {
      if (!this.internalVisibleColumns || this.internalVisibleColumns.length === 0) {
        return TABLE_COLUMNS
      }
      const visibleSet = new Set(this.internalVisibleColumns)
      return TABLE_COLUMNS.filter((col) => {
        if (col.prop === 'actions') {
          return true
        }
        return visibleSet.has(col.prop)
      })
    },
    tablePagination() {
      return {
        page: this.pagination.page || 1,
        limit: this.pagination.limit || 20,
        total: this.pagination.total || 0
      }
    },
    defaultSort() {
      if (!this.sortBy) {
        return { prop: 'createdAt', order: 'descending' }
      }
      const [prop, order] = this.sortBy.split(':')
      return {
        prop,
        order: order === 'asc' ? 'ascending' : 'descending'
      }
    },
    toolbarButtons() {
      return [
        {
          action: 'create',
          text: '创建任务',
          icon: 'el-icon-plus',
          type: 'primary'
        }
      ]
    }
  },
  methods: {
    handleSelectionChange(selection) {
      this.selectedRows = selection
      this.$emit('selection-change', selection)
    },
    handlePaginationChange({ page, limit }) {
      this.$emit('pagination-change', { page, limit })
    },
    handleSortChange({ prop, order }) {
      let sortBy = ''
      if (prop && order) {
        const direction = order === 'ascending' ? 'asc' : 'desc'
        sortBy = `${prop}:${direction}`
      } else {
        sortBy = DEFAULT_SORT
      }
      this.$emit('sort-change', sortBy)
    },
    handleRetry() {
      this.$emit('retry')
    },
    handleToolbarRefresh() {
      this.$emit('refresh')
    },
    handleToolbarColumnChange(visibleColumns) {
      this.handleColumnChange(visibleColumns)
    },
    handleToolbarAction({ action }) {
      if (action === 'create') {
        this.$emit('create')
      }
    },
    handleViewDetail(taskCode) {
      const task = this.data.find((t) => t.taskCode === taskCode)
      if (task) {
        this.$emit('view', task)
      }
    },
    handleViewPlan(planId) {
      this.$emit('view-plan', planId)
    },
    handleActionClick({ action, row }) {
      this.$emit(action, row)
    },
    getActionButtons(row) {
      // 检查 row 是否存在，避免访问 undefined 对象
      if (!row) {
        return []
      }

      const buttons = [
        {
          action: 'view',
          text: '查看详情',
          icon: 'el-icon-view'
        }
      ]

      // 添加快速状态更新按钮
      const quickActions = QUICK_STATUS_ACTIONS.filter(action =>
        action.allowedFromStatuses.includes(row.status)
      )

      quickActions.forEach(quickAction => {
        buttons.push({
          action: 'quick-status-update',
          text: quickAction.label,
          icon: quickAction.icon,
          type: quickAction.type,
          targetStatus: quickAction.targetStatus
        })
      })

      // 添加通用的更新状态按钮（如果不是终态）
      const finalStatuses = [TASK_STATUS.COMPLETED, TASK_STATUS.CANCELLED, TASK_STATUS.TERMINATED]
      if (!finalStatuses.includes(row.status)) {
        buttons.push({
          action: 'update-status',
          text: '更新状态',
          icon: 'el-icon-s-promotion'
        })
      }

      // 以下按钮放到更多菜单中（添加到最后）
      // 草稿和待排程状态可以绑定物料
      if (row.status === TASK_STATUS.DRAFT || row.status === TASK_STATUS.PENDING_SCHEDULE) {
        buttons.push({
          action: 'bind-materials',
          text: '绑定物料',
          icon: 'el-icon-connection'
        })
      }

      return buttons
    },
    formatWeight(value) {
      if (value === null || value === undefined) {
        return '-'
      }
      return Number(value).toFixed(3)
    },
    formatQuantity(value) {
      if (value === null || value === undefined) {
        return '-'
      }
      // 如果是整数，不显示小数点
      const num = Number(value)
      return Number.isInteger(num) ? num.toString() : num.toFixed(2)
    },
    formatDuration(minutes) {
      if (minutes === null || minutes === undefined) {
        return '-'
      }
      const mins = Number(minutes)
      if (mins < 60) {
        return `${mins} 分钟`
      }
      const hours = Math.floor(mins / 60)
      const remainingMins = mins % 60
      if (remainingMins === 0) {
        return `${hours} 小时`
      }
      return `${hours} 小时 ${remainingMins} 分钟`
    },
    formatPercentage(value) {
      if (value === null || value === undefined || value === '') {
        return '-'
      }
      const num = Number(value)
      // 检查转换后是否为有效数字
      if (isNaN(num)) {
        return '-'
      }
      // 如果值在0-1之间，认为是小数形式，转换为百分比
      if (num >= 0 && num <= 1) {
        return `${(num * 100).toFixed(1)}%`
      }
      // 如果值大于1，认为已经是百分比形式
      return `${num.toFixed(1)}%`
    }
  }
}
</script>

<style scoped>
.task-table {
  display: flex;
  flex-direction: column;
}

.task-table__toolbar {
  background-color: #fff;
  padding: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.task-table__main {
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.task-table__selection-indicator {
  margin-left: 12px;
  padding: 4px 12px;
  border-radius: 4px;
  background-color: #f0f2f5;
  font-size: 13px;
  color: #606266;
}
</style>

