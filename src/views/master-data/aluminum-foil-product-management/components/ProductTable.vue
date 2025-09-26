<template>
  <div class="product-table">
    <table-toolbar
      ref="toolbar"
      class="product-table__toolbar"
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
          <span v-if="selectedRows.length" class="product-table__selection-indicator">
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
      class="product-table__main"
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
      <template #productCode="{ row, value }">
        <el-tooltip
          v-if="value"
          effect="light"
          placement="top"
          :content="copyTooltip"
        >
          <span class="product-table__code" @click="handleCopyProductCode(value)">
            {{ value }}
            <i class="el-icon-document-copy" aria-hidden="true" />
          </span>
        </el-tooltip>
        <span v-else>-</span>
      </template>

      <template #lifecycleStatus="{ value }">
        <status-tag
          v-if="value"
          :status="value"
          :text-map="lifecycleStatusConfig.textMap"
          :type-map="lifecycleStatusConfig.typeMap"
          effect="light"
          size="small"
        />
        <span v-else>-</span>
      </template>

      <template #thickness="{ row, value }">
        <spec-tooltip
          :value="value"
          :row="row"
          field="thickness"
        />
      </template>

      <template #width="{ row, value }">
        <spec-tooltip
          :value="value"
          :row="row"
          field="width"
        />
      </template>

      <template #unitWeight="{ row, value }">
        <spec-tooltip
          :value="value"
          :row="row"
          field="unitWeight"
        />
      </template>

      <template #processTemplateIds="{ row }">
        <overflow-tags-popover
          v-if="processTemplates(row).length"
          :data="processTemplates(row)"
          :label-key="'label'"
          :max-show="1"
          effect="light"
          placement="top"
        >
          <template #tag="{ item }">
            <el-tag type="info" size="mini">{{ item.label }}</el-tag>
          </template>
          <template #popover-item="{ item, index }">
            <span>{{ index + 1 }}. {{ item.label }}</span>
          </template>
        </overflow-tags-popover>
        <span v-else>-</span>
      </template>

      <template #qualityStandard="{ row }">
        <el-tag v-if="qualityStandardLabel(row)" size="mini" type="success">
          {{ qualityStandardLabel(row) }}
        </el-tag>
        <span v-else>-</span>
      </template>

      <template #actions="{ row }">
        <action-buttons
          mode="text"
          :buttons="getActionButtons(row)"
          :row="row"
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
import OverflowTagsPopover from '@/components/OverflowTagsPopover'
import columnSettingsMixin from '@/components/TableToolbar/columnSettingsMixin'
import {
  TABLE_COLUMNS,
  DEFAULT_VISIBLE_COLUMNS,
  LIFECYCLE_STATUS_CONFIG,
  TABLE_TOOLBAR_CONFIG
} from '../constants/table-config'
import {
  DEFAULT_SORT,
  THICKNESS_LIMITS,
  WIDTH_LIMITS,
  UNIT_WEIGHT_LIMITS,
  UNIT_DISPLAY
} from '../constants/aluminum-foil-product-management'

const FIELD_LIMITS = {
  thickness: THICKNESS_LIMITS,
  width: WIDTH_LIMITS,
  unitWeight: UNIT_WEIGHT_LIMITS
}

const FIELD_LABELS = {
  thickness: '厚度',
  width: '宽度',
  unitWeight: '单位重量'
}

export default {
  name: 'ProductTable',
  components: {
    BaseTable,
    TableToolbar,
    StatusTag,
    ActionButtons,
    OverflowTagsPopover,
    SpecTooltip: {
      functional: true,
      render(h, { props }) {
        const { value, row, field } = props
        const limits = FIELD_LIMITS[field]
        const unit = UNIT_DISPLAY[field] || ''
        const formatted = formatNumber(value, limits?.PRECISION)
        const tooltipLines = buildTooltipLines(row)

        if (!formatted) {
          return h('span', '-', [])
        }

        return h(
          'el-tooltip',
          {
            props: {
              effect: 'light',
              placement: 'top'
            }
          },
          [
            h(
              'div',
              {
                slot: 'content',
                staticClass: 'product-table__spec-tooltip'
              },
              tooltipLines.map((line, index) => h('p', { key: index }, [line]))
            ),
            h(
              'span',
              { staticClass: 'product-table__spec-value' },
              [`${formatted} ${unit}`.trim()]
            )
          ]
        )
      }
    }
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
      default: '铝箔产品列表'
    },
    toolbarConfig: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      columnSettingsKeyPrefix: 'aluminumFoilProductColumns',
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
    lifecycleStatusConfig() {
      return LIFECYCLE_STATUS_CONFIG
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
          if (column.prop === 'updatedAt') {
            return {
              ...column,
              formatter: (row) => formatDate(row.updatedAt)
            }
          }
          if (column.prop === 'updatedBy') {
            return {
              ...column,
              formatter: (row) => row.updatedBy || '-'
            }
          }
          return column
        })
    },
    copyTooltip() {
      return '点击复制产品编码'
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
    handleCopyProductCode(code) {
      if (!code) {
        return
      }

      const text = String(code)
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          this.$message.success('产品编码已复制')
        }).catch(() => {
          fallbackCopyText(text, this.$message)
        })
        return
      }

      fallbackCopyText(text, this.$message)
    },
    resolveRowClass({ lifecycleStatus }) {
      if (!lifecycleStatus) {
        return ''
      }
      const type = this.lifecycleStatusConfig.typeMap[lifecycleStatus]
      return type ? `product-table__row--${type}` : ''
    },
    processTemplates(row) {
      if (!row) {
        return []
      }
      if (Array.isArray(row.processTemplates)) {
        return row.processTemplates.map((item) => ({
          label: item.name || item.label || item.code || item.id || '-',
          raw: item
        }))
      }
      if (Array.isArray(row.processTemplateDetails)) {
        return row.processTemplateDetails.map((item) => ({
          label: item.name || item.label || item.code || item.id || '-',
          raw: item
        }))
      }
      if (Array.isArray(row.processTemplateIds)) {
        return row.processTemplateIds.map((id) => ({ label: id, raw: id }))
      }
      return []
    },
    qualityStandardLabel(row) {
      if (!row) {
        return ''
      }
      if (row.qualityStandard?.name) {
        return row.qualityStandard.name
      }
      if (row.qualityStandardName) {
        return row.qualityStandardName
      }
      return row.qualityStandardId || ''
    },
    getActionButtons(row) {
      if (!row) {
        return []
      }
      return [
        {
          text: '查看详情',
          action: 'view',
          icon: 'el-icon-view',
          type: 'text'
        },
        {
          text: '编辑',
          action: 'edit',
          icon: 'el-icon-edit',
          type: 'text'
        },
        {
          text: '刷新数据',
          action: 'refresh',
          icon: 'el-icon-refresh',
          type: 'text'
        }
      ]
    },
    handleActionClick({ action, row }) {
      if (!action) {
        return
      }
      this.$emit(action, row)
    }
  }
}

function formatNumber(value, precision = 2) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return ''
  }
  return Number(value).toFixed(precision)
}

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

function buildTooltipLines(row = {}) {
  const thickness = formatNumber(row.thickness, THICKNESS_LIMITS.PRECISION)
  const width = formatNumber(row.width, WIDTH_LIMITS.PRECISION)
  const weight = formatNumber(row.unitWeight, UNIT_WEIGHT_LIMITS.PRECISION)
  const weightType = row.unitWeightType || '-'

  return [
    `${FIELD_LABELS.thickness}：${thickness ? `${thickness} ${UNIT_DISPLAY.thickness}` : '-'}`,
    `${FIELD_LABELS.width}：${width ? `${width} ${UNIT_DISPLAY.width}` : '-'}`,
    `${FIELD_LABELS.unitWeight}：${weight ? `${weight} ${UNIT_DISPLAY.unitWeight}` : '-'}`,
    `重量类型：${weightType}`
  ]
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
    messageInstance?.success('产品编码已复制')
  } catch (error) {
    console.error('复制失败:', error)
    messageInstance?.warning('复制失败，请手动复制')
  } finally {
    document.body.removeChild(textarea)
  }
}
</script>

<style lang="scss" scoped>
.product-table {
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

  &__spec-tooltip {
    min-width: 180px;
    line-height: 1.6;
  }

  &__spec-value {
    display: inline-block;
  }
}

.product-table__row--warning {
  background-color: rgba(250, 173, 20, 0.08);
}

.product-table__row--success {
  background-color: rgba(82, 196, 26, 0.08);
}

.product-table__row--info {
  background-color: rgba(144, 147, 153, 0.08);
}
</style>


