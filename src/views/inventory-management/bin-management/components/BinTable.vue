/**
 * 文件名称：BinTable.vue
 * 文件描述：料框管理表格组件
 * 创建日期：2025-01-10
 * 修改记录:
 *   - 2025-01-10: 初始创建，实现料框列表展示和操作功能
 */
<template>
  <div class="bin-table">
    <!-- 表格工具栏 -->
    <table-toolbar
      ref="toolbar"
      class="bin-table__toolbar"
      :enable-column-settings="toolbarProps.enableColumnSettings"
      :enable-batch-actions="toolbarProps.enableBatchActions"
      :enable-export="hasExport"
      :export-api="exportApi"
      :export-params="effectiveExportParams"
      :export-filename="exportFilename"
      :enable-import="toolbarProps.enableImport"
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
        <action-buttons
          :buttons="toolbarButtons"
          mode="normal"
          @click="handleToolbarAction"
        />
        <slot name="toolbar-left">
          <span v-if="selectedRows.length" class="bin-table__selection-indicator">
            已选{{ selectedRows.length }}项
          </span>
        </slot>
      </template>
      <template #toolbar-right>
        <slot name="toolbar-right" />
      </template>
    </table-toolbar>

    <!-- 料框表格 -->
    <base-table
      ref="baseTable"
      class="bin-table__main"
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
      <!-- 料框编号列 - 支持点击复制 -->
      <template #binCode="{ value }">
        <el-tooltip
          v-if="value"
          effect="light"
          placement="top"
          :content="copyTooltip"
        >
          <span class="bin-table__code" @click="handleCopyBinCode(value)">
            {{ value }}
            <i class="el-icon-document-copy" aria-hidden="true" />
          </span>
        </el-tooltip>
        <span v-else>-</span>
      </template>

      <!-- 料框规格列 - 显示规格名称 -->
      <template #specification="{ row }">
        <span v-if="getSpecificationName(row)">
          {{ getSpecificationName(row) }}
        </span>
        <span v-else class="bin-table__placeholder">-</span>
      </template>

      <!-- 料框状态列 - 使用StatusTag组件 -->
      <template #status="{ value }">
        <status-tag
          v-if="value"
          :status="value"
          :text-map="binStatusConfig.textMap"
          :type-map="binStatusConfig.typeMap"
          effect="light"
          size="small"
        />
        <span v-else>-</span>
      </template>

      <!-- 当前位置列 - 显示位置名称 -->
      <template #currentLocation="{ row }">
        <span v-if="getCurrentLocationName(row)">
          {{ getCurrentLocationName(row) }}
        </span>
        <span v-else class="bin-table__placeholder">-</span>
      </template>

      <!-- 所属料垛列 - 显示料垛编号 -->
      <template #stack="{ row }">
        <el-tag
          v-if="getStackCode(row)"
          size="small"
          type="info"
          effect="plain"
        >
          {{ getStackCode(row) }}
        </el-tag>
        <span v-else class="bin-table__placeholder">-</span>
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
  </div>
</template>

<script>
import BaseTable from '@/components/BaseTable'
import TableToolbar from '@/components/TableToolbar'
import StatusTag from '@/components/StatusTag'
import ActionButtons from '@/components/ActionButtons'
import columnSettingsMixin from '@/components/TableToolbar/columnSettingsMixin'
import {
  BIN_TABLE_COLUMNS,
  BIN_DEFAULT_VISIBLE_COLUMNS,
  BIN_STATUS_TAG_CONFIG,
  BIN_TABLE_TOOLBAR_CONFIG
} from '../constants/table-config'
import { DEFAULT_SORT } from '../constants'

export default {
  name: 'BinTable',
  components: {
    BaseTable,
    TableToolbar,
    StatusTag,
    ActionButtons
  },
  mixins: [columnSettingsMixin],
  props: {
    // 表格数据
    data: {
      type: Array,
      default: () => []
    },
    // 加载状态
    loading: {
      type: Boolean,
      default: false
    },
    // 加载错误
    loadError: {
      type: [Boolean, String, Object],
      default: false
    },
    // 分页配置
    pagination: {
      type: Object,
      default: () => ({
        page: 1,
        limit: 20,
        total: 0
      })
    },
    // 排序参数
    sortBy: {
      type: String,
      default: DEFAULT_SORT
    },
    // 允许重试
    allowRetry: {
      type: Boolean,
      default: true
    },
    // 导出API函数
    exportApi: {
      type: Function,
      default: null
    },
    // 导出参数
    exportParams: {
      type: Object,
      default: () => ({})
    },
    // 导出文件名
    exportFilename: {
      type: String,
      default: '料框列表'
    },
    // 工具栏配置
    toolbarConfig: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      columnSettingsKeyPrefix: 'binManagementTableColumns',
      selectedRows: []
    }
  },
  computed: {
    // 列配置选项
    columnOptions() {
      return BIN_TABLE_COLUMNS
    },
    // 默认可见列
    defaultVisibleColumns() {
      return BIN_DEFAULT_VISIBLE_COLUMNS
    },
    // 料框状态配置
    binStatusConfig() {
      return BIN_STATUS_TAG_CONFIG
    },
    // 工具栏配置
    toolbarProps() {
      return {
        ...BIN_TABLE_TOOLBAR_CONFIG,
        ...this.toolbarConfig
      }
    },
    // 是否有导出功能
    hasExport() {
      return typeof this.exportApi === 'function'
    },
    // 有效的导出参数
    effectiveExportParams() {
      return {
        ...this.exportParams
      }
    },
    // 表格分页配置
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
    // 默认排序
    defaultSort() {
      const strategy = (this.sortBy || DEFAULT_SORT).split(':')
      const prop = strategy[0] || 'createdAt'
      const order = strategy[1] === 'asc' ? 'ascending' : 'descending'
      return { prop, order }
    },
    // 可见的表格列
    visibleTableColumns() {
      const visibleProps = this.internalVisibleColumns.length
        ? this.internalVisibleColumns
        : this.defaultVisibleColumns

      return this.columnOptions
        .filter((column) => visibleProps.includes(column.prop) || column.prop === 'actions')
        .map((column) => {
          if (column.prop === 'registeredAt' || column.prop === 'updatedAt') {
            return {
              ...column,
              formatter: (row) => formatDate(row[column.prop])
            }
          }
          return column
        })
    },
    // 复制提示文本
    copyTooltip() {
      return '点击复制料框编号'
    },
    // 工具栏按钮配置
    toolbarButtons() {
      return [
        {
          action: 'register',
          text: '注册料框',
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
    // ==================== 工具栏事件处理 ====================
    // 处理工具栏刷新事件
    handleToolbarRefresh() {
      this.$emit('refresh')
    },
    // 处理工具栏列变更事件
    handleToolbarColumnChange(columns) {
      this.handleColumnChange(columns)
      this.$emit('column-change', columns)
    },
    // 处理工具栏操作
    handleToolbarAction(action) {
      switch (action.action) {
        case 'register':
          this.$emit('register')
          break
        default:
          console.warn('未处理的工具栏操作:', action)
      }
    },

    // ==================== 表格事件处理 ====================
    // 处理选择变更
    handleSelectionChange(selection) {
      this.selectedRows = selection
      this.$emit('selection-change', selection)
    },
    // 处理分页变更
    handlePaginationChange({ page, limit }) {
      this.$emit('pagination-change', { page, limit })
    },
    // 处理排序变更
    handleSortChange({ prop, order }) {
      if (!prop || !order) {
        this.$emit('sort-change', '')
        return
      }
      const direction = order === 'ascending' ? 'asc' : 'desc'
      this.$emit('sort-change', `${prop}:${direction}`)
    },
    // 处理重试
    handleRetry() {
      this.$emit('retry')
    },

    // ==================== 数据处理方法 ====================
    // 获取规格显示文本
    getSpecificationName(row) {
      if (!row) return ''

      // 优先使用specification对象（包含完整的规格信息）
      if (row.specification) {
        const spec = row.specification
        // 格式：规格代码 - 规格名称
        if (spec.specCode) {
          return spec.specName
            ? `${spec.specCode} - ${spec.specName}`
            : spec.specCode
        }
        // 降级：只有名称
        if (spec.specName) {
          return spec.specName
        }
      }

      // 降级处理：直接显示binSpecificationId（UUID）
      return row.binSpecificationId || ''
    },
    // 获取当前位置显示文本
    getCurrentLocationName(row) {
      if (!row) return ''

      // 优先使用currentLocation对象（包含完整的位置信息）
      if (row.currentLocation) {
        const loc = row.currentLocation
        // 格式：库位编码 - 库位类型名称
        if (loc.locationId) {
          return loc.locationTypeName
            ? `${loc.locationId} - ${loc.locationTypeName}`
            : loc.locationId
        }
      }

      // 降级处理：直接显示currentLocationId（UUID）
      return row.currentLocationId || ''
    },
    // 获取料垛编号
    getStackCode(row) {
      if (!row) return ''
      // 优先使用stack对象中的stackCode字段
      if (row.stack?.stackCode) {
        return row.stack.stackCode
      }
      // 其次使用stackCode字段
      if (row.stackCode) {
        return row.stackCode
      }
      // 最后使用料垛ID
      return row.stackId || ''
    },

    // ==================== 交互操作方法 ====================
    // 复制料框编号
    handleCopyBinCode(code) {
      if (!code) {
        return
      }

      const text = String(code)
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          this.$message.success('料框编号已复制')
        }).catch(() => {
          fallbackCopyText(text, this.$message)
        })
        return
      }

      fallbackCopyText(text, this.$message)
    },
    // 处理操作按钮点击
    handleActionClick({ action, row }) {
      if (!action) {
        return
      }
      this.$emit(action, row)
    },

    // ==================== 样式相关方法 ====================
    // 解析行样式类名
    resolveRowClass({ status }) {
      if (!status) {
        return ''
      }
      const type = this.binStatusConfig.typeMap[status]
      return type ? `bin-table__row--${type}` : ''
    },
    // 获取操作按钮配置
    getActionButtons(row) {
      if (!row) {
        return []
      }
      return [
        {
          text: '查看',
          action: 'view',
          icon: 'el-icon-view'
        },
        // 注意：料框一旦注册，基本信息不可修改，只能变更状态
        // 因此没有编辑按钮，如需修改请通过状态变更功能
        {
          text: '状态变更',
          action: 'change-status',
          icon: 'el-icon-refresh'
        },
        {
          text: '历史',
          action: 'view-history',
          icon: 'el-icon-time'
        }
      ]
    },

    // ==================== 公开方法 ====================
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

/**
 * 格式化日期时间
 */
function formatDate(value) {
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
    console.warn('格式化日期失败:', value, error)
    return '-'
  }
}

/**
 * 备用复制文本方法
 */
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
    messageInstance?.success('料框编号已复制')
  } catch (error) {
    console.error('复制失败:', error)
    messageInstance?.warning('复制失败，请手动复制')
  } finally {
    document.body.removeChild(textarea)
  }
}
</script>

<style lang="scss" scoped>
.bin-table {
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
    transition: all 0.2s ease;

    &:hover {
      text-decoration: underline;
      opacity: 0.8;
    }

    i {
      font-size: 12px;
    }
  }

  &__placeholder {
    color: #c0c4cc;
    font-style: italic;
  }
}

// 行状态样式
.bin-table__row--warning {
  background-color: rgba(250, 173, 20, 0.08);
}

.bin-table__row--success {
  background-color: rgba(82, 196, 26, 0.08);
}

.bin-table__row--danger {
  background-color: rgba(245, 108, 108, 0.08);
}

.bin-table__row--info {
  background-color: rgba(144, 147, 153, 0.08);
}
</style>

