/**
 * 文件名称：PendingTaskTable.vue
 * 文件描述：待排程任务表格组件，提供数据展示与排程相关操作
 * 创建日期：2025-10-20
 * 修改记录：
 *   - 2025-10-20: 初始创建，实现待排程任务表格及操作
 *   - 2025-10-31: 新增交货日期格式化显示，将ISO格式转换为易读的日期格式
 *   - 2025-11-01: 适配后端接口更新，使用 schedulingStatus.isLocked 判断锁定状态，新增排程状态列显示
 */

<template>
  <div class="pending-task-table">
    <TableToolbar
      ref="toolbar"
      class="pending-task-table__toolbar"
      :enable-column-settings="true"
      :enable-batch-actions="true"
      :enable-export="false"
      :enable-import="false"
      :enable-refresh="true"
      :refresh-feedback-mode="'all'"
      :column-options="columnOptions"
      :storage-key="columnSettingsKey"
      :default-visible-columns="defaultVisibleColumns"
      :visible-columns="internalVisibleColumns"
      :selected-rows="selectedRows"
      :table-data="data"
      :custom-actions="toolbarCustomActions"
      @refresh="handleRefresh"
      @column-change="handleToolbarColumnChange"
      @batch-status="handleBatchAction"
      @custom-action="handleToolbarAction"
    >
      <template #toolbar-left>
        <ActionButtons :buttons="toolbarButtons" mode="normal" @click="handleToolbarAction" />
        <slot name="toolbar-left">
          <span v-if="selectedRows.length" class="pending-task-table__selection-indicator">
            已选{{ selectedRows.length }}项
          </span>
        </slot>
      </template>
      <template #toolbar-right>
        <slot name="toolbar-right" />
      </template>
    </TableToolbar>

    <BaseTable
      ref="baseTable"
      class="pending-task-table__main"
      :data="data"
      :columns="visibleTableColumns"
      :loading="loading"
      :load-error="loadError"
      :allow-retry="allowRetry"
      :pagination="paginationProps"
      :show-selection="true"
      :show-index="true"
      stripe
      border
      highlight-current-row
      row-key="id"
      @selection-change="handleSelectionChange"
      @pagination-change="handlePaginationChange"
      @retry="handleRetry"
    >
      <template #taskCode="{ value, row }">
        <el-link v-if="value" type="primary" @click="handleViewDetail(row)">
          {{ value }}
        </el-link>
        <span v-else>-</span>
      </template>

      <template #priority="{ value }">
        <StatusTag
          v-if="value"
          :status="value"
          :text-map="priorityConfig.textMap"
          :type-map="priorityConfig.typeMap"
          effect="plain"
          size="small"
        />
        <span v-else>-</span>
      </template>

      <template #plannedWeight="{ value }">
        <span v-if="value !== null && value !== undefined">{{ formatWeight(value) }}</span>
        <span v-else>-</span>
      </template>

      <template #actualWeight="{ value }">
        <span v-if="value !== null && value !== undefined">{{ formatWeight(value) }}</span>
        <span v-else>-</span>
      </template>

      <template #schedulingStatus="{ row }">
        <el-tag
          v-if="row.schedulingStatus || row.schedulingStatusLabel"
          size="small"
          :type="getSchedulingStatusType(row)"
          effect="plain"
        >
          {{ getSchedulingStatusLabel(row) }}
        </el-tag>
        <span v-else>-</span>
      </template>

      <template #scheduleLockedUntil="{ value, row }">
        <el-tag
          v-if="row.isLocked && value"
          size="small"
          type="danger"
        >
          锁定至 {{ formatDateTime(value) }}
        </el-tag>
        <el-tag v-else size="small" type="success" effect="plain">
          未锁定
        </el-tag>
      </template>

      <template #expectedDurationMinutes="{ value }">
        <span>{{ formatDuration(value) }}</span>
      </template>

      <template #estimatedEnergyConsumption="{ value }">
        <span>{{ formatEnergy(value) }}</span>
      </template>

      <template #deliveryDate="{ value }">
        <span v-if="value">{{ formatDate(value) }}</span>
        <span v-else>-</span>
      </template>

      <template #actions="{ row }">
        <ActionButtons
          :buttons="getRowActions(row)"
          :row="row"
          mode="text"
          size="small"
          @click="handleRowAction"
        />
      </template>

      <template #expand="{ row }">
        <div class="expand-content">
          <h4 class="expand-title">物料明细</h4>
          <el-table
            v-if="row.materials && row.materials.length"
            :data="row.materials"
            size="mini"
            border
            style="width: 100%"
          >
            <el-table-column prop="materialCode" label="物料编码" min-width="160" />
            <el-table-column prop="materialType" label="类型" min-width="80">
              <template slot-scope="{ row: material }">
                {{ materialTypeText(material.materialType) }}
              </template>
            </el-table-column>
            <el-table-column prop="batchNumber" label="批次号" min-width="140" />
            <el-table-column prop="expectedWeight" label="预计重量(吨)" min-width="140">
              <template slot-scope="{ row: material }">
                {{ formatWeight(material.expectedWeight) }}
              </template>
            </el-table-column>
            <el-table-column prop="actualWeight" label="实际重量(吨)" min-width="140">
              <template slot-scope="{ row: material }">
                {{ formatWeight(material.actualWeight) }}
              </template>
            </el-table-column>
            <el-table-column prop="loadSequence" label="装炉顺序" min-width="100" />
            <el-table-column prop="loadPosition" label="装炉位置" min-width="100" />
            <el-table-column prop="warehouseLocationCode" label="当前库位" min-width="140" />
            <el-table-column prop="statusSnapshot" label="状态" min-width="120" />
          </el-table>
          <el-empty v-else description="暂无物料数据" />
        </div>
      </template>
    </BaseTable>
  </div>
</template>

<script>
import BaseTable from '@/components/BaseTable'
import TableToolbar from '@/components/TableToolbar'
import ActionButtons from '@/components/ActionButtons'
import StatusTag from '@/components/StatusTag'
import { parseTime } from '@/utils'
import {
  PENDING_TABLE_COLUMNS,
  PENDING_DEFAULT_VISIBLE_COLUMNS,
  PRIORITY_CONFIG,
  SCHEDULING_STATUS_CONFIG,
  TABLE_TOOLBAR_CONFIG,
  MATERIAL_TYPE
} from '../constants'
import columnSettingsMixin from '@/components/TableToolbar/columnSettingsMixin'

export default {
  name: 'PendingTaskTable',
  components: {
    BaseTable,
    TableToolbar,
    ActionButtons,
    StatusTag
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
        limit: 20,
        offset: 0,
        total: 0
      })
    }
  },
  data() {
    return {
      selectedRows: [],
      defaultVisibleColumns: PENDING_DEFAULT_VISIBLE_COLUMNS,
      priorityConfig: PRIORITY_CONFIG,
      toolbarConfig: TABLE_TOOLBAR_CONFIG
    }
  },
  computed: {
    columnOptions() {
      return PENDING_TABLE_COLUMNS.filter((col) => col.prop !== 'actions').map((col) => ({
        prop: col.prop,
        label: col.label
      }))
    },
    columnSettingsKey() {
      return 'annealingPendingTaskTableColumns'
    },
    visibleTableColumns() {
      if (!this.internalVisibleColumns || this.internalVisibleColumns.length === 0) {
        return PENDING_TABLE_COLUMNS
      }
      const visibleSet = new Set(this.internalVisibleColumns)
      return PENDING_TABLE_COLUMNS.filter((col) => {
        if (col.prop === 'actions') {
          return true
        }
        return visibleSet.has(col.prop)
      })
    },
    paginationProps() {
      return {
        page: this.getPageFromOffset(this.pagination.offset, this.pagination.limit),
        limit: this.pagination.limit || 20,
        total: this.pagination.total || 0
      }
    },
    toolbarButtons() {
      return [
        {
          action: 'lock',
          text: '锁定任务',
          icon: 'el-icon-lock',
          type: 'primary'
        },
        {
          action: 'unlock',
          text: '释放锁定',
          icon: 'el-icon-unlock',
          type: 'warning'
        }
      ]
    },
    toolbarCustomActions() {
      return [
        {
          action: 'lock',
          text: '锁定任务',
          icon: 'el-icon-lock',
          type: 'primary'
        },
        {
          action: 'unlock',
          text: '释放锁定',
          icon: 'el-icon-unlock',
          type: 'warning'
        }
      ]
    }
  },
  methods: {
    getPageFromOffset(offset = 0, limit = 20) {
      return Math.floor(offset / limit) + 1
    },
    getOffsetFromPage(page, limit) {
      const safePage = Math.max(page, 1)
      return (safePage - 1) * limit
    },
    formatWeight(value) {
      if (value === null || value === undefined) {
        return '-'
      }
      return Number(value).toFixed(3)
    },
    formatDateTime(time) {
      if (!time) return '-'
      return parseTime(time, '{y}-{m}-{d} {h}:{i}')
    },
    formatDate(time) {
      if (!time) return '-'
      return parseTime(time, '{y}-{m}-{d}')
    },
    formatDuration(minutes) {
      if (!minutes && minutes !== 0) return '-'
      const totalMinutes = Number(minutes)
      if (Number.isNaN(totalMinutes)) {
        return '-'
      }
      const hours = Math.floor(totalMinutes / 60)
      const mins = totalMinutes % 60
      if (hours <= 0) {
        return `${mins}分钟`
      }
      return `${hours}小时${mins}分钟`
    },
    formatEnergy(energy) {
      if (energy === null || energy === undefined) {
        return '-'
      }
      return `${Number(energy).toFixed(1)} kWh`
    },
    materialTypeText(type) {
      if (type === MATERIAL_TYPE.BASKET) {
        return '料框'
      }
      if (type === MATERIAL_TYPE.STACK) {
        return '料垛'
      }
      return type || '-'
    },
    getSchedulingStatusType(row) {
      const statusCode = row.schedulingStatusCode || (row.schedulingStatus && row.schedulingStatus.status)
      if (!statusCode) return 'info'
      return SCHEDULING_STATUS_CONFIG.typeMap[statusCode] || 'info'
    },
    getSchedulingStatusLabel(row) {
      return row.schedulingStatusLabel || (row.schedulingStatus && row.schedulingStatus.statusLabel) || '-'
    },
    handleSelectionChange(selection) {
      this.selectedRows = selection || []
      this.$emit('selection-change', selection)
    },
    handlePaginationChange({ page, limit }) {
      const offset = this.getOffsetFromPage(page, limit)
      this.$emit('pagination-change', { offset, limit })
    },
    handleRetry() {
      this.$emit('retry')
    },
    handleRefresh() {
      this.$emit('refresh')
    },
    handleToolbarColumnChange(visibleColumns) {
      this.handleColumnChange(visibleColumns)
    },
    handleToolbarAction({ action }) {
      this.$emit(action, this.selectedRows)
    },
    handleBatchAction({ action }) {
      this.$emit(action, this.selectedRows)
    },
    handleRowAction({ action, row }) {
      this.$emit(action, row)
    },
    handleViewDetail(row) {
      if (row && row.id) {
        this.$emit('view', row)
      }
    },
    getRowActions(row) {
      if (!row) return []

      const actions = [
        {
          action: 'view',
          text: '查看详情',
          icon: 'el-icon-view'
        }
      ]

      // ✅ 使用 schedulingStatus.isLocked 或扁平化的 isLocked 字段判断锁定状态
      // 而不是直接判断 scheduleLockedUntil 是否有值
      const isLocked = row.isLocked || row.schedulingStatus?.isLocked || false

      if (!isLocked) {
        actions.push({
          action: 'lock-single',
          text: '锁定任务',
          icon: 'el-icon-lock'
        })
      } else {
        actions.push({
          action: 'unlock-single',
          text: '释放锁定',
          icon: 'el-icon-unlock'
        })
      }

      return actions
    }
  }
}
</script>

<style scoped>
.pending-task-table {
  display: flex;
  flex-direction: column;
}

.pending-task-table__toolbar {
  background-color: #fff;
  padding: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.pending-task-table__main {
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.pending-task-table__selection-indicator {
  margin-left: 12px;
  padding: 4px 12px;
  border-radius: 4px;
  background-color: #f0f2f5;
  font-size: 13px;
  color: #606266;
}

.expand-content {
  padding: 16px;
}

.expand-title {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.expand-content ::v-deep .el-table {
  margin-bottom: 12px;
}
</style>

