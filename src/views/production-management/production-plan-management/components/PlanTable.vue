/**
 * 文件名称：PlanTable.vue
 * 文件描述：生产计划表格组件
 * 创建日期：2025-01-21
 * 修改记录：
 *   - 2025-01-21: 初始创建
 */
<template>
  <div class="plan-table">
    <table-toolbar
      ref="toolbar"
      class="plan-table__toolbar"
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
        <!-- 视图切换 -->
        <div class="plan-table__view-switch">
          <el-radio-group v-model="currentFormat" size="small" @change="handleFormatChange">
            <el-radio-button
              v-for="option in formatOptions"
              :key="option.value"
              :label="option.value"
            >
              <i :class="option.icon" /> {{ option.label }}
            </el-radio-button>
          </el-radio-group>
        </div>

        <!-- 自动刷新开关 -->
        <div class="plan-table__auto-refresh">
          <el-checkbox v-model="autoRefreshEnabled" @change="handleAutoRefreshChange">
            自动刷新
          </el-checkbox>
        </div>

        <slot name="toolbar-left">
          <span v-if="selectedRows.length" class="plan-table__selection-indicator">
            已选{{ selectedRows.length }}项
          </span>
        </slot>
      </template>
      <template #toolbar-right>
        <slot name="toolbar-right" />
      </template>
    </table-toolbar>

    <!-- 表格视图 -->
    <base-table
      v-if="currentFormat === 'table'"
      ref="baseTable"
      class="plan-table__main"
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
      <!-- 计划编号 -->
      <template #planNumber="{ row, value }">
        <el-link type="primary" @click="handleView(row)">
          {{ value || '-' }}
        </el-link>
      </template>

      <!-- 来源 -->
      <template #source="{ value }">
        <el-tag v-if="value" type="info" size="small">
          {{ sourceConfig.textMap[value] || value }}
        </el-tag>
        <span v-else>-</span>
      </template>

      <!-- 需求数量 -->
      <template #demandQuantity="{ row }">
        <span>{{ formatNumber(row.demandQuantity, 3) }}</span>
      </template>

      <!-- 计划交期 -->
      <template #plannedDeliveryDate="{ value }">
        <span>{{ formatDate(value) }}</span>
      </template>

      <!-- 优先级 -->
      <template #planPriority="{ value }">
        <status-tag
          v-if="value"
          :status="value"
          :text-map="priorityConfig.textMap"
          :type-map="priorityConfig.typeMap"
          effect="light"
          size="small"
        />
        <span v-else>-</span>
      </template>

      <!-- 状态 -->
      <template #status="{ value }">
        <status-tag
          v-if="value"
          :status="value"
          :text-map="statusConfig.textMap"
          :type-map="statusConfig.typeMap"
          effect="plain"
          size="small"
        />
        <span v-else>-</span>
      </template>

      <!-- 完成进度 -->
      <template #progress="{ value }">
        <div class="plan-table__progress">
          <el-progress
            :percentage="Math.round(value || 0)"
            :color="getProgressColor(value)"
            :stroke-width="16"
          />
        </div>
      </template>

      <!-- 创建时间 -->
      <template #createdAt="{ value }">
        <span>{{ formatDateTime(value) }}</span>
      </template>

      <!-- 操作列 -->
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

    <!-- 甘特图视图 -->
    <div v-if="currentFormat === 'gantt'" class="plan-table__gantt">
      <el-alert
        title="甘特图视图"
        type="info"
        description="甘特图功能开发中，敬请期待..."
        :closable="false"
        show-icon
      />
    </div>
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
  SOURCE_CONFIG,
  PRIORITY_CONFIG,
  TABLE_TOOLBAR_CONFIG
} from '../constants/table-config'
import {
  DEFAULT_SORT,
  OUTPUT_FORMAT_OPTIONS,
  OUTPUT_FORMAT,
  AUTO_REFRESH_INTERVAL,
  PLAN_STATUS
} from '../constants/production-plan-management'

export default {
  name: 'PlanTable',
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
    toolbarConfig: {
      type: Object,
      default: () => ({})
    },
    format: {
      type: String,
      default: OUTPUT_FORMAT.TABLE
    }
  },
  data() {
    return {
      columnSettingsKeyPrefix: 'productionPlanColumns',
      selectedRows: [],
      currentFormat: this.format,
      autoRefreshEnabled: false,
      autoRefreshTimer: null
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
    sourceConfig() {
      return SOURCE_CONFIG
    },
    priorityConfig() {
      return PRIORITY_CONFIG
    },
    toolbarProps() {
      return {
        ...TABLE_TOOLBAR_CONFIG,
        ...this.toolbarConfig
      }
    },
    formatOptions() {
      return OUTPUT_FORMAT_OPTIONS
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
        .filter((column) => visibleProps.includes(column.prop) || column.prop === 'actions')
    }
  },
  watch: {
    format(newVal) {
      this.currentFormat = newVal
    }
  },
  created() {
    this.initColumns(this.columnOptions)
  },
  beforeDestroy() {
    this.stopAutoRefresh()
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
    handleFormatChange(format) {
      this.currentFormat = format
      this.$emit('format-change', format)
    },
    handleAutoRefreshChange(enabled) {
      if (enabled) {
        this.startAutoRefresh()
      } else {
        this.stopAutoRefresh()
      }
    },
    startAutoRefresh() {
      this.stopAutoRefresh()
      this.autoRefreshTimer = setInterval(() => {
        this.$emit('refresh')
      }, AUTO_REFRESH_INTERVAL)
    },
    stopAutoRefresh() {
      if (this.autoRefreshTimer) {
        clearInterval(this.autoRefreshTimer)
        this.autoRefreshTimer = null
      }
    },
    handleView(row) {
      this.$emit('view', row)
    },
    getActionButtons(row) {
      if (!row) {
        return []
      }

      const buttons = []

      // 状态变更（除已完成和已取消外的其他状态，且未冻结）
      if (
        row.status !== PLAN_STATUS.COMPLETED &&
        row.status !== PLAN_STATUS.CANCELLED &&
        !row.isFrozen
      ) {
        buttons.push({
          text: '状态变更',
          action: 'change-status',
          icon: 'el-icon-refresh',
          type: 'primary'
        })
      }

      // 确认操作（仅已接收状态）
      if (row.status === PLAN_STATUS.RECEIVED && !row.isFrozen) {
        buttons.push({
          text: '确认',
          action: 'confirm',
          icon: 'el-icon-check',
          type: 'success'
        })
      }

      // 提交审批（仅已确认状态）
      if (row.status === PLAN_STATUS.CONFIRMED && !row.isFrozen) {
        buttons.push({
          text: '提交审批',
          action: 'submit-approval',
          icon: 'el-icon-s-promotion',
          type: 'warning'
        })
      }

      // 取消操作（除已完成和已取消外的其他状态）
      if (
        row.status !== PLAN_STATUS.COMPLETED &&
        row.status !== PLAN_STATUS.CANCELLED &&
        !row.isFrozen
      ) {
        buttons.push({
          text: '取消',
          action: 'cancel',
          icon: 'el-icon-close',
          type: 'danger'
        })
      }

      // 查看详情（所有状态）
      buttons.push({
        text: '查看',
        action: 'view',
        icon: 'el-icon-view'
      })

      return buttons
    },
    handleActionClick({ action, row }) {
      if (!action || !row) {
        return
      }
      this.$emit(action, row)
    },
    formatNumber(value, precision = 2) {
      if (value === null || value === undefined || Number.isNaN(Number(value))) {
        return '-'
      }
      return Number(value).toFixed(precision)
    },
    formatDate(value) {
      if (!value) {
        return '-'
      }
      try {
        const date = new Date(value)
        if (Number.isNaN(date.getTime())) {
          return '-'
        }
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      } catch (error) {
        console.warn('格式化日期失败:', value, error)
        return '-'
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
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`
      } catch (error) {
        console.warn('格式化日期时间失败:', value, error)
        return '-'
      }
    },
    getProgressColor(percentage) {
      if (percentage >= 100) {
        return '#67C23A'
      } else if (percentage >= 50) {
        return '#409EFF'
      } else if (percentage >= 25) {
        return '#E6A23C'
      } else {
        return '#F56C6C'
      }
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
.plan-table {
  display: flex;
  flex-direction: column;
  gap: 12px;

  &__toolbar {
    display: flex;
  }

  &__view-switch {
    margin-right: 16px;
  }

  &__auto-refresh {
    margin-right: 16px;
    display: flex;
    align-items: center;
  }

  &__selection-indicator {
    font-size: 12px;
    color: #909399;
  }

  &__progress {
    padding: 0 8px;
  }

  &__gantt {
    padding: 20px;
    background-color: #fff;
    border: 1px solid #DCDFE6;
    border-radius: 4px;
    min-height: 400px;
  }
}
</style>

