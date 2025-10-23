/**
 * 文件名称：AuditLogTable.vue
 * 文件描述：生产计划审计日志表格组件
 * 创建日期：2025-10-17
 * 修改记录：
 *   - 2025-10-17: 根据新接口文档创建，支持展开查看详情和变更对比
 *   - 2025-10-23: 重构使用BaseTable和TableToolbar组件，统一UI风格
 */

<template>
  <div class="audit-log-table">
    <table-toolbar
      ref="toolbar"
      class="audit-log-table__toolbar"
      :enable-column-settings="toolbarProps.enableColumnSettings"
      :enable-batch-actions="toolbarProps.enableBatchActions"
      :enable-export="toolbarProps.enableExport"
      :enable-refresh="toolbarProps.enableRefresh"
      :refresh-feedback-mode="toolbarProps.refreshFeedbackMode"
      :column-options="columnOptions"
      :storage-key="columnSettingsKey"
      :default-visible-columns="defaultVisibleColumns"
      :visible-columns="internalVisibleColumns"
      @refresh="handleToolbarRefresh"
      @column-change="handleToolbarColumnChange"
    />

    <base-table
      ref="baseTable"
      class="audit-log-table__main"
      :data="data"
      :columns="visibleTableColumns"
      :loading="loading"
      :pagination="tablePagination"
      :show-selection="false"
      :show-index="true"
      :default-sort="defaultSort"
      stripe
      border
      @pagination-change="handlePaginationChange"
      @sort-change="handleSortChange"
    >
      <!-- 操作时间 -->
      <template #createdAt="{ value }">
        {{ formatTime(value) }}
      </template>

      <!-- 主计划ID -->
      <template #planId="{ value }">
        <el-link
          v-if="value"
          type="primary"
          @click="handleViewPlan(value)"
        >
          {{ value.substring(0, 8) }}...
        </el-link>
        <span v-else>-</span>
      </template>

      <!-- 子批次ID -->
      <template #planItemId="{ value }">
        <span v-if="value">
          {{ value.substring(0, 8) }}...
        </span>
        <span v-else>-</span>
      </template>

      <!-- 变更类型 -->
      <template #changeType="{ value }">
        <status-tag
          v-if="value"
          :status="value"
          :text-map="changeTypeConfig.textMap"
          :type-map="changeTypeConfig.typeMap"
          effect="light"
          size="small"
        />
        <span v-else>-</span>
      </template>

      <!-- 操作人 -->
      <template #operatorName="{ value }">
        <span>{{ value || '-' }}</span>
      </template>

      <!-- 操作来源 -->
      <template #operationSource="{ value }">
        <status-tag
          v-if="value"
          :status="value"
          :text-map="operationSourceConfig.textMap"
          :type-map="operationSourceConfig.typeMap"
          effect="light"
          size="mini"
        />
        <span v-else>-</span>
      </template>

      <!-- 操作IP -->
      <template #operatorIp="{ value }">
        <span>{{ value || '-' }}</span>
      </template>

      <!-- 变更说明 -->
      <template #changeDescription="{ value }">
        {{ value || '无描述' }}
      </template>

      <!-- 操作列 -->
      <template #actions="{ row }">
        <el-button
          type="text"
          size="small"
          icon="el-icon-view"
          @click="handleViewDetail(row)"
        >
          查看详情
        </el-button>
      </template>
    </base-table>

    <!-- 详情对话框 -->
    <el-dialog
      :visible.sync="detailDialogVisible"
      title="审计日志详情"
      width="800px"
      :close-on-click-modal="false"
    >
      <div v-if="currentLog" class="log-detail">
        <!-- 变更描述 -->
        <div class="detail-section">
          <h4>变更描述</h4>
          <p>{{ currentLog.changeDescription || '无描述' }}</p>
        </div>

        <!-- 变更前后值对比 -->
        <div v-if="currentLog.originalValue || currentLog.newValue" class="detail-section">
          <h4>变更对比</h4>
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="change-label">变更前：</div>
              <div class="change-value">
                <pre>{{ formatValue(currentLog.originalValue) }}</pre>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="change-label">变更后：</div>
              <div class="change-value changed">
                <pre>{{ formatValue(currentLog.newValue) }}</pre>
              </div>
            </el-col>
          </el-row>
        </div>

        <!-- 关联工艺模板信息 -->
        <div v-if="currentLog.affectedProcessTemplateId" class="detail-section">
          <h4>关联工艺模板</h4>
          <p>
            <el-tag size="mini" type="info">
              {{ currentLog.processTemplateLinkType || '-' }}
            </el-tag>
            工艺模板ID: {{ currentLog.affectedProcessTemplateId }}
          </p>
        </div>

        <!-- 关联设备信息 -->
        <div v-if="currentLog.affectedEquipmentId" class="detail-section">
          <h4>关联设备</h4>
          <p>
            <el-tag size="mini" type="info">
              {{ currentLog.equipmentLinkType || '-' }}
            </el-tag>
            设备ID: {{ currentLog.affectedEquipmentId }}
          </p>
        </div>

        <!-- 元信息 -->
        <div class="detail-section">
          <h4>元信息</h4>
          <el-row :gutter="20">
            <el-col :span="8">
              <span class="meta-label">记录ID:</span>
              <span class="meta-value">{{ currentLog.id }}</span>
            </el-col>
            <el-col :span="8">
              <span class="meta-label">创建人:</span>
              <span class="meta-value">{{ currentLog.createdBy || '-' }}</span>
            </el-col>
            <el-col :span="8">
              <span class="meta-label">创建时间:</span>
              <span class="meta-value">{{ formatTime(currentLog.createdAt) }}</span>
            </el-col>
          </el-row>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import BaseTable from '@/components/BaseTable'
import TableToolbar from '@/components/TableToolbar'
import StatusTag from '@/components/StatusTag'
import columnSettingsMixin from '@/components/TableToolbar/columnSettingsMixin'
import { parseTime } from '@/utils'
import {
  AUDIT_LOG_TABLE_COLUMNS,
  AUDIT_LOG_DEFAULT_VISIBLE_COLUMNS,
  AUDIT_LOG_TABLE_TOOLBAR_CONFIG,
  AUDIT_LOG_DEFAULT_SORT,
  AUDIT_LOG_COLUMN_SETTINGS_KEY,
  CHANGE_TYPE_STATUS_CONFIG,
  OPERATION_SOURCE_STATUS_CONFIG
} from '../constants/audit-logs-config'

export default {
  name: 'AuditLogTable',
  components: {
    BaseTable,
    TableToolbar,
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
      default: AUDIT_LOG_DEFAULT_SORT
    },
    toolbarConfig: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      columnSettingsKeyPrefix: AUDIT_LOG_COLUMN_SETTINGS_KEY,
      detailDialogVisible: false,
      currentLog: null
    }
  },
  computed: {
    columnOptions() {
      return AUDIT_LOG_TABLE_COLUMNS
    },
    defaultVisibleColumns() {
      return AUDIT_LOG_DEFAULT_VISIBLE_COLUMNS
    },
    changeTypeConfig() {
      return CHANGE_TYPE_STATUS_CONFIG
    },
    operationSourceConfig() {
      return OPERATION_SOURCE_STATUS_CONFIG
    },
    toolbarProps() {
      return {
        ...AUDIT_LOG_TABLE_TOOLBAR_CONFIG,
        ...this.toolbarConfig
      }
    },
    columnSettingsKey() {
      return AUDIT_LOG_COLUMN_SETTINGS_KEY
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
      const strategy = (this.sortBy || AUDIT_LOG_DEFAULT_SORT).split(':')
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
          // 为所有列添加slotName（如果配置了的话）
          return {
            ...column,
            slotName: column.slotName || column.prop
          }
        })
    }
  },
  created() {
    this.initColumns(this.columnOptions)
  },
  methods: {
    /**
     * 格式化时间
     */
    formatTime(time) {
      return time ? parseTime(time, '{y}-{m}-{d} {h}:{i}:{s}') : '-'
    },

    /**
     * 格式化值
     */
    formatValue(value) {
      if (!value) return '-'
      if (typeof value === 'object') {
        return JSON.stringify(value, null, 2)
      }
      return String(value)
    },

    /**
     * 查看计划详情
     */
    handleViewPlan(planId) {
      this.$emit('view-plan', planId)
    },

    /**
     * 查看日志详情
     */
    handleViewDetail(log) {
      this.currentLog = log
      this.detailDialogVisible = true
    },

    /**
     * 处理工具栏刷新
     */
    handleToolbarRefresh() {
      this.$emit('refresh')
    },

    /**
     * 处理列设置变化
     */
    handleToolbarColumnChange(columns) {
      this.handleColumnChange(columns)
      this.$emit('column-change', columns)
    },

    /**
     * 处理分页变化
     */
    handlePaginationChange({ page, limit }) {
      this.$emit('pagination-change', { page, limit })
    },

    /**
     * 处理排序变化
     */
    handleSortChange({ prop, order }) {
      if (!prop || !order) {
        this.$emit('sort-change', '')
        return
      }
      const direction = order === 'ascending' ? 'asc' : 'desc'
      this.$emit('sort-change', `${prop}:${direction}`)
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
.audit-log-table {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background-color: #fff;
  border-radius: 4px;
  padding: 20px;

  &__toolbar {
    display: flex;
  }

  .log-detail {
    padding: 20px;
    background-color: #f5f7fa;
    border-radius: 4px;

    .detail-section {
      margin-bottom: 20px;

      &:last-child {
        margin-bottom: 0;
      }

      h4 {
        font-size: 14px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid #dcdfe6;
      }

      p {
        font-size: 13px;
        color: #606266;
        line-height: 1.6;
        margin: 0;
      }

      .change-label {
        font-size: 12px;
        font-weight: 600;
        color: #909399;
        margin-bottom: 8px;
      }

      .change-value {
        padding: 12px;
        background-color: #fff;
        border-radius: 4px;
        border: 1px solid #dcdfe6;

        pre {
          margin: 0;
          font-size: 12px;
          font-family: 'Courier New', monospace;
          color: #606266;
          white-space: pre-wrap;
          word-wrap: break-word;
          line-height: 1.6;
        }

        &.changed {
          border-color: #409eff;
          background-color: #ecf5ff;

          pre {
            color: #409eff;
          }
        }
      }

      .meta-label {
        font-size: 12px;
        color: #909399;
        margin-right: 8px;
      }

      .meta-value {
        font-size: 12px;
        color: #606266;
      }
    }
  }
}
</style>
