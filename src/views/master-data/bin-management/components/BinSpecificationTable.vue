/**
 * 文件名称：BinSpecificationTable.vue
 * 文件描述：料框规格列表表格组件，使用BaseTable和TableToolbar实现完整的表格功能
 * 创建日期：2025-01-09
 * 修改记录：
 *   - 2025-01-09: 初始创建，实现P0和部分P1功能
 */
<template>
  <div class="bin-specification-table">
    <table-toolbar
      ref="toolbar"
      class="bin-specification-table__toolbar"
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
          <span v-if="selectedRows.length" class="bin-specification-table__selection-indicator">
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
      class="bin-specification-table__main"
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
      <template #specCode="{ value }">
        <el-tooltip
          v-if="value"
          effect="light"
          placement="top"
          content="点击复制规格代码"
        >
          <span class="bin-specification-table__code" @click="handleCopySpecCode(value)">
            {{ value }}
            <i class="el-icon-document-copy" aria-hidden="true" />
          </span>
        </el-tooltip>
        <span v-else>-</span>
      </template>

      <template #dimensions="{ row }">
        <el-tooltip
          v-if="hasDimensions(row)"
          effect="light"
          placement="top"
        >
          <div slot="content" class="bin-specification-table__dimensions-tooltip">
            <p>长度：{{ formatNumber(row.length, 2) }} cm</p>
            <p>宽度：{{ formatNumber(row.width, 2) }} cm</p>
            <p>高度：{{ formatNumber(row.height, 2) }} cm</p>
          </div>
          <span class="bin-specification-table__dimensions-value">
            {{ formatDimensions(row) }}
          </span>
        </el-tooltip>
        <span v-else>-</span>
      </template>

      <template #maxLoadCapacity="{ value }">
        <span v-if="value">{{ formatNumber(value, 2) }}</span>
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
  STATUS_CONFIG,
  DEFAULT_SORT
} from '../constants'

// 默认可见列
const DEFAULT_VISIBLE_COLUMNS = [
  'specCode',
  'specName',
  'dimensions',
  'maxLoadCapacity',
  'material',
  'maxStackLayers',
  'status',
  'createdAt'
]

// 工具栏配置
const TABLE_TOOLBAR_CONFIG = {
  enableColumnSettings: true,
  enableBatchActions: false,
  enableRefresh: true,
  refreshFeedbackMode: 'message'
}

export default {
  name: 'BinSpecificationTable',
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
      default: '料框规格列表'
    },
    toolbarConfig: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      columnSettingsKeyPrefix: 'binSpecificationColumns',
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
        .filter((column) => visibleProps.includes(column.prop) || column.prop === 'actions')
        .map((column) => {
          if (column.prop === 'createdAt') {
            return {
              ...column,
              formatter: (row) => this.formatDate(row.createdAt)
            }
          }
          return column
        })
    },
    toolbarButtons() {
      return [
        {
          action: 'create',
          text: '新增规格',
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
    /**
     * 格式化数字
     * @param {number} value - 数值
     * @param {number} precision - 精度
     * @returns {string} 格式化后的字符串
     */
    formatNumber(value, precision = 2) {
      if (value === null || value === undefined || Number.isNaN(Number(value))) {
        return ''
      }
      return Number(value).toFixed(precision)
    },
    /**
     * 格式化日期
     * @param {string} value - 日期字符串
     * @returns {string} 格式化后的日期
     */
    formatDate(value) {
      if (!value) {
        return '-'
      }
      try {
        const date = new Date(value)
        if (Number.isNaN(date.getTime())) {
          return '-'
        }
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        const seconds = String(date.getSeconds()).padStart(2, '0')
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
      } catch (error) {
        console.warn('格式化日期失败:', value, error)
        return '-'
      }
    },
    /**
     * 检查是否有尺寸数据
     * @param {Object} row - 行数据
     * @returns {boolean} 是否有尺寸
     */
    hasDimensions(row) {
      return row && (row.length || row.width || row.height)
    },
    /**
     * 格式化尺寸显示
     * @param {Object} row - 行数据
     * @returns {string} 格式化后的尺寸字符串
     */
    formatDimensions(row) {
      if (!row) {
        return '-'
      }
      const length = this.formatNumber(row.length, 2)
      const width = this.formatNumber(row.width, 2)
      const height = this.formatNumber(row.height, 2)

      if (!length && !width && !height) {
        return '-'
      }

      return `${length || '0'} × ${width || '0'} × ${height || '0'}`
    },
    /**
     * 复制规格代码
     * @param {string} code - 规格代码
     */
    handleCopySpecCode(code) {
      if (!code) {
        return
      }

      const text = String(code)
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          this.$message.success('规格代码已复制')
        }).catch(() => {
          this.fallbackCopyText(text)
        })
        return
      }

      this.fallbackCopyText(text)
    },
    /**
     * 降级复制方法
     * @param {string} text - 要复制的文本
     */
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
        this.$message.success('规格代码已复制')
      } catch (error) {
        console.error('复制失败:', error)
        this.$message.warning('复制失败，请手动复制')
      } finally {
        document.body.removeChild(textarea)
      }
    },
    /**
     * 工具栏刷新事件
     */
    handleToolbarRefresh() {
      this.$emit('refresh')
    },
    /**
     * 工具栏列变更事件
     * @param {Array} columns - 可见列
     */
    handleToolbarColumnChange(columns) {
      this.handleColumnChange(columns)
      this.$emit('column-change', columns)
    },
    /**
     * 选择变更事件
     * @param {Array} selection - 选中的行
     */
    handleSelectionChange(selection) {
      this.selectedRows = selection
      this.$emit('selection-change', selection)
    },
    /**
     * 分页变更事件
     * @param {Object} params - 分页参数
     */
    handlePaginationChange({ page, limit }) {
      this.$emit('pagination-change', { page, limit })
    },
    /**
     * 排序变更事件
     * @param {Object} params - 排序参数
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
     * 重试事件
     */
    handleRetry() {
      this.$emit('retry')
    },
    /**
     * 工具栏操作事件
     * @param {Object} action - 操作对象
     */
    handleToolbarAction(action) {
      switch (action.action) {
        case 'create':
          this.$emit('create')
          break
        default:
          console.warn('未处理的工具栏操作:', action)
      }
    },
    /**
     * 获取操作按钮
     * @param {Object} row - 行数据
     * @returns {Array} 操作按钮配置
     */
    getActionButtons(row) {
      if (!row) {
        return []
      }

      const buttons = [
        {
          text: '编辑',
          action: 'edit',
          icon: 'el-icon-edit'
        }
      ]

      // 根据状态显示启用/禁用按钮
      if (row.status === '启用') {
        buttons.push({
          text: '禁用',
          action: 'disable',
          icon: 'el-icon-close',
          type: 'warning'
        })
      } else {
        buttons.push({
          text: '启用',
          action: 'enable',
          icon: 'el-icon-check',
          type: 'success'
        })
      }

      return buttons
    },
    /**
     * 操作按钮点击事件
     * @param {Object} params - 参数对象
     */
    handleActionClick({ action, row }) {
      if (!action) {
        return
      }
      this.$emit(action, row)
    },
    /**
     * 刷新成功反馈
     * @param {string} message - 消息文本
     */
    refreshSucceed(message) {
      if (this.$refs.toolbar) {
        this.$refs.toolbar.refreshSucceed(message)
      }
    },
    /**
     * 刷新失败反馈
     * @param {string} message - 消息文本
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
.bin-specification-table {
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

    i {
      font-size: 12px;
    }
  }

  &__dimensions-tooltip {
    min-width: 150px;
    line-height: 1.6;

    p {
      margin: 0;
      padding: 2px 0;
    }
  }

  &__dimensions-value {
    display: inline-block;
  }
}
</style>

