/**
 * BaseTable 表格组件 (优化版)
 * 功能描述：配置驱动的表格组件，提供加载状态、分页、空状态、虚拟滚动等功能
 * 创建日期：2024-12-18
 * 优化日期：2024-12-19
 */
<template>
  <div class="base-table-container">
    <!-- 错误状态显示 -->
    <div v-if="loadError" class="load-error">
      <div class="error-content">
        <i class="el-icon-warning-outline" />
        <p class="error-message">{{ getErrorMessage(loadError) }}</p>
        <el-button
          v-if="allowRetry"
          type="primary"
          size="small"
          :loading="retrying"
          @click="handleRetry"
        >
          {{ retrying ? '重试中...' : '重试' }}
        </el-button>
      </div>
    </div>

    <!-- 虚拟滚动表格 -->
    <div v-else-if="virtualScroll && safeTableData.length > virtualThreshold" class="virtual-table-wrapper">
      <div ref="headerRef" class="virtual-table-header">
        <!-- 表头 -->
        <el-table
          :data="[]"
          v-bind="tableAttrs"
          style="width: 100%"
          show-header
        >
          <el-table-column
            v-if="showSelection"
            type="selection"
            width="55"
            align="center"
            fixed="left"
          />

          <el-table-column
            v-if="showIndex"
            type="index"
            label="序号"
            width="60"
            align="center"
          />

          <el-table-column
            v-for="column in processedColumns"
            :key="column.key"
            v-bind="column.attrs"
          />

          <slot name="actions" />
        </el-table>
      </div>

      <div
        ref="virtualScrollRef"
        class="virtual-table-body"
        :style="{ height: virtualHeight + 'px' }"
        @scroll="handleVirtualScroll"
      >
        <div :style="{ height: totalHeight + 'px', position: 'relative' }">
          <el-table
            :data="visibleData"
            v-bind="tableAttrs"
            :style="{ transform: `translateY(${offsetY}px)` }"
            show-header="false"
            @selection-change="handleSelectionChange"
            @row-click="handleRowClick"
            @row-dblclick="handleRowDblClick"
          >
            <el-table-column
              v-if="showSelection"
              type="selection"
              width="55"
              align="center"
              fixed="left"
            />

            <el-table-column
              v-if="showIndex"
              type="index"
              label="序号"
              width="60"
              align="center"
              :index="getVirtualIndex"
            />

            <el-table-column
              v-for="column in processedColumns"
              :key="column.key"
              v-bind="column.attrs"
            >
              <template v-if="column.slotName" v-slot="scope">
                <error-boundary :fallback="getCellFallback(scope.row, column)">
                  <slot
                    :name="column.slotName"
                    :row="scope.row"
                    :column="scope.column"
                    :$index="scope.$index"
                    :value="safeGetValue(scope.row, column.prop)"
                  />
                </error-boundary>
              </template>

              <template v-else-if="column.type === 'status'" v-slot="scope">
                <error-boundary :fallback="getCellFallback(scope.row, column)">
                  <status-tag
                    :status="safeGetValue(scope.row, column.prop)"
                    :text-map="column.textMap || {}"
                    :type-map="column.typeMap || {}"
                    :color-map="column.colorMap || {}"
                    :default-text="column.defaultText || ''"
                    :default-type="column.defaultType || 'info'"
                    :size="column.tagSize || 'small'"
                    :effect="column.tagEffect || 'light'"
                  />
                </error-boundary>
              </template>

              <template v-else-if="column.type === 'datetime'" v-slot="scope">
                <error-boundary :fallback="getCellFallback(scope.row, column)">
                  <span>{{ safeFormatTime(safeGetValue(scope.row, column.prop), column.format) }}</span>
                </error-boundary>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>

    <!-- 普通表格 -->
    <el-table
      v-else
      ref="elTable"
      v-loading="loading"
      :data="safeTableData"
      v-bind="tableAttrs"
      style="width: 100%"
      @sort-change="debouncedSortChange"
      @selection-change="handleSelectionChange"
      @row-click="handleRowClick"
      @row-dblclick="handleRowDblClick"
    >
      <!-- 多选列 -->
      <el-table-column
        v-if="showSelection"
        type="selection"
        width="55"
        align="center"
        fixed="left"
      />

      <!-- 序号列 -->
      <el-table-column
        v-if="showIndex"
        type="index"
        label="序号"
        width="60"
        align="center"
        :index="indexMethod"
      />

      <!-- 数据列 (通过配置动态生成) -->
      <el-table-column
        v-for="column in processedColumns"
        :key="column.key"
        v-bind="column.attrs"
      >
        <!-- 使用插槽进行自定义渲染 -->
        <template v-if="column.slotName" v-slot="scope">
          <error-boundary :fallback="getCellFallback(scope.row, column)">
            <slot
              :name="column.slotName"
              :row="scope.row"
              :column="scope.column"
              :$index="scope.$index"
              :value="safeGetValue(scope.row, column.prop)"
            />
          </error-boundary>
        </template>

        <!-- 状态列的默认渲染 -->
        <template v-else-if="column.type === 'status'" v-slot="scope">
          <error-boundary :fallback="getCellFallback(scope.row, column)">
            <status-tag
              :status="safeGetValue(scope.row, column.prop)"
              :text-map="column.textMap || {}"
              :type-map="column.typeMap || {}"
              :color-map="column.colorMap || {}"
              :default-text="column.defaultText || ''"
              :default-type="column.defaultType || 'info'"
              :size="column.tagSize || 'small'"
              :effect="column.tagEffect || 'light'"
            />
          </error-boundary>
        </template>

        <!-- 时间列的默认渲染 -->
        <template v-else-if="column.type === 'datetime'" v-slot="scope">
          <error-boundary :fallback="getCellFallback(scope.row, column)">
            <span>{{ safeFormatTime(safeGetValue(scope.row, column.prop), column.format) }}</span>
          </error-boundary>
        </template>
      </el-table-column>

      <!-- 操作列 (便捷插槽) -->
      <slot name="actions" />

      <!-- 自定义空状态 -->
      <template #empty>
        <slot name="empty">
          <div class="empty-block">
            <i class="el-icon-document" />
            <p>暂无数据</p>
          </div>
        </slot>
      </template>

      <!-- 附加内容 -->
      <slot name="append" />

    </el-table>

    <!-- 分页组件 -->
    <pagination
      v-if="pagination && showPagination && !loadError"
      :total="pagination.total"
      :page.sync="pagination.page"
      :limit.sync="pagination.limit"
      :page-sizes="pagination.pageSizes || [10, 20, 50, 100]"
      :layout="pagination.layout || 'total, sizes, prev, pager, next, jumper'"
      :background="pagination.background !== false"
      :auto-scroll="pagination.autoScroll !== false"
      @pagination="debouncedPaginationChange"
    />
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import StatusTag from '@/components/StatusTag'
import { parseTime } from '@/utils'

// 错误边界组件
const ErrorBoundary = {
  name: 'ErrorBoundary',
  props: {
    fallback: {
      type: [String, Object],
      default: '渲染错误'
    }
  },
  data() {
    return {
      hasError: false,
      error: null
    }
  },
  errorCaptured(err, vm, info) {
    this.hasError = true
    this.error = err
    console.error('组件渲染错误:', err, info)
    return false
  },
  render(h) {
    if (this.hasError) {
      if (typeof this.fallback === 'string') {
        return h('span', { class: 'cell-error' }, this.fallback)
      }
      return h('span', { class: 'cell-error' }, '-')
    }
    return this.$slots.default
  }
}

// 防抖函数
function debounce(func, wait, immediate) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      timeout = null
      if (!immediate) func.apply(this, args)
    }
    const callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) func.apply(this, args)
  }
}

export default {
  name: 'BaseTable',
  components: {
    Pagination,
    StatusTag,
    ErrorBoundary
  },
  // 透传的属性不应用在根元素上，而是应用在 el-table 上
  inheritAttrs: false,
  props: {
    // 表格数据
    data: {
      type: Array,
      required: true,
      default: () => []
    },
    // 列配置
    columns: {
      type: Array,
      required: true,
      default: () => []
    },
    // 加载状态
    loading: {
      type: Boolean,
      default: false
    },
    // 加载错误状态
    loadError: {
      type: [Boolean, String, Error],
      default: false
    },
    // 是否允许重试
    allowRetry: {
      type: Boolean,
      default: true
    },
    // 是否显示多选列
    showSelection: {
      type: Boolean,
      default: false
    },
    // 是否显示序号列
    showIndex: {
      type: Boolean,
      default: false
    },
    // 序号计算方法
    indexMethod: {
      type: Function,
      default: null
    },
    // 分页配置
    pagination: {
      type: Object,
      default: null
    },
    // 是否显示分页（当pagination存在时）
    showPagination: {
      type: Boolean,
      default: true
    },
    // 虚拟滚动配置
    virtualScroll: {
      type: Boolean,
      default: false
    },
    // 虚拟滚动触发阈值
    virtualThreshold: {
      type: Number,
      default: 100
    },
    // 虚拟滚动容器高度
    virtualHeight: {
      type: Number,
      default: 400
    },
    // 虚拟滚动行高
    itemHeight: {
      type: Number,
      default: 48
    },
    // 虚拟滚动缓冲区大小
    bufferSize: {
      type: Number,
      default: 5
    }
  },
  data() {
    return {
      // 错误状态
      hasError: false,
      errorMessage: '',
      retrying: false,

      // 虚拟滚动状态
      scrollTop: 0,
      visibleStart: 0,
      visibleEnd: 0,

      // 防抖函数实例
      debouncedSortChange: null,
      debouncedPaginationChange: null
    }
  },
  computed: {
    // 安全的表格数据
    safeTableData() {
      if (!Array.isArray(this.data)) {
        console.warn('BaseTable: data必须是数组类型，当前类型:', typeof this.data, this.data)
        this.$emit('data-error', { type: 'format', message: 'data必须是数组类型', originalData: this.data })
        return []
      }

      return this.data.map((row, index) => {
        if (!row || typeof row !== 'object') {
          console.warn(`BaseTable: 第${index}行数据格式错误:`, row)
          this.$emit('data-error', { type: 'row', message: `第${index}行数据格式错误`, originalData: row, index })
          return { _error: true, _originalData: row, _index: index }
        }
        return row
      })
    },

    // 处理后的列配置 (memoization优化)
    processedColumns() {
      return this.columns.map((column, index) => {
        // 为每一列生成唯一key
        const key = column.prop || column.slotName || `column_${index}`

        // 预处理列属性，避免在模板中重复计算
        const attrs = {
          prop: column.prop,
          label: column.label,
          width: column.width,
          minWidth: column.minWidth,
          align: column.align || 'left',
          fixed: column.fixed,
          sortable: column.sortable || false,
          formatter: column.formatter,
          showOverflowTooltip: column.showOverflowTooltip !== false,
          className: column.className,
          labelClassName: column.labelClassName,
          ...(column.attrs || {})
        }

        return {
          key,
          ...column,
          attrs
        }
      })
    },

    // 透传给el-table的属性
    tableAttrs() {
      return {
        ...this.$attrs,
        'element-loading-text': this.loading ? '加载中...' : ''
      }
    },

    // 虚拟滚动相关计算属性
    visibleCount() {
      return Math.ceil(this.virtualHeight / this.itemHeight)
    },

    totalHeight() {
      return this.safeTableData.length * this.itemHeight
    },

    visibleData() {
      if (!this.virtualScroll) return this.safeTableData

      const start = Math.max(0, this.visibleStart - this.bufferSize)
      const end = Math.min(this.safeTableData.length, this.visibleEnd + this.bufferSize)

      return this.safeTableData.slice(start, end)
    },

    offsetY() {
      const start = Math.max(0, this.visibleStart - this.bufferSize)
      return start * this.itemHeight
    }
  },
  created() {
    // 初始化防抖函数
    this.debouncedSortChange = debounce(this.handleSortChange, 300)
    this.debouncedPaginationChange = debounce(this.handlePaginationChange, 300)

    // 初始化虚拟滚动
    this.updateVisibleRange()
  },
  methods: {
    // 安全获取对象属性值
    safeGetValue(obj, prop) {
      if (!obj || !prop) return undefined

      try {
        // 支持嵌套属性，如 'user.name'
        return prop.split('.').reduce((current, key) => {
          return current && current[key] !== undefined ? current[key] : undefined
        }, obj)
      } catch (error) {
        console.warn('BaseTable: 获取属性值失败:', prop, error)
        return undefined
      }
    },

    // 安全的时间格式化
    safeFormatTime(time, format = '{y}-{m}-{d} {h}:{i}:{s}') {
      if (!time) return ''

      try {
        return parseTime(time, format)
      } catch (error) {
        console.warn('BaseTable: 时间格式化失败:', time, error)
        this.$emit('format-error', { type: 'time', value: time, error, format })

        // 降级处理：尝试转换为字符串
        try {
          return time.toString()
        } catch (e) {
          return ''
        }
      }
    },

    // 获取单元格错误回退内容
    getCellFallback(row, column) {
      if (row._error) {
        return '数据错误'
      }
      return column.errorFallback || '-'
    },

    // 错误信息处理
    getErrorMessage(error) {
      if (typeof error === 'string') return error
      if (error instanceof Error) return error.message
      if (typeof error === 'object' && error.message) return error.message
      return '加载失败，请重试'
    },

    // 重试处理
    async handleRetry() {
      this.retrying = true
      try {
        this.$emit('retry')
        // 等待一小段时间让父组件处理重试
        await new Promise(resolve => setTimeout(resolve, 100))
      } finally {
        this.retrying = false
      }
    },

    // 虚拟滚动处理
    handleVirtualScroll(event) {
      this.scrollTop = event.target.scrollTop
      this.updateVisibleRange()
    },

    updateVisibleRange() {
      const start = Math.floor(this.scrollTop / this.itemHeight)
      const end = start + this.visibleCount

      this.visibleStart = start
      this.visibleEnd = end
    },

    getVirtualIndex(index) {
      const actualIndex = this.visibleStart - this.bufferSize + index
      return this.indexMethod ? this.indexMethod(actualIndex) : actualIndex + 1
    },

    // 事件处理方法
    handleSortChange(data) {
      this.$emit('sort-change', data)
    },

    handleSelectionChange(selection) {
      this.$emit('selection-change', selection)
    },

    handleRowClick(row, column, event) {
      this.$emit('row-click', row, column, event)
      // Emit current-change event to mimic el-table's behavior when highlight-current-row is used
      this.$emit('current-change', row)
    },

    handleRowDblClick(row, column, event) {
      this.$emit('row-dblclick', row, column, event)
    },

    handlePaginationChange(pagination) {
      this.$emit('pagination-change', pagination)
    },

    // 暴露 el-table 的原生方法
    clearSelection() {
      if (this.$refs.elTable) {
        this.$refs.elTable.clearSelection()
      }
    },

    toggleRowSelection(row, selected) {
      if (this.$refs.elTable) {
        this.$refs.elTable.toggleRowSelection(row, selected)
      }
    },

    toggleAllSelection() {
      if (this.$refs.elTable) {
        this.$refs.elTable.toggleAllSelection()
      }
    },

    setCurrentRow(row) {
      if (this.$refs.elTable) {
        this.$refs.elTable.setCurrentRow(row)
      }
    },

    clearSort() {
      if (this.$refs.elTable) {
        this.$refs.elTable.clearSort()
      }
    },

    clearFilter(columnKey) {
      if (this.$refs.elTable) {
        this.$refs.elTable.clearFilter(columnKey)
      }
    },

    doLayout() {
      if (this.$refs.elTable) {
        this.$refs.elTable.doLayout()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.base-table-container {
  .empty-block {
    padding: 40px 0;
    color: #909399;
    text-align: center;

    i {
      font-size: 48px;
      margin-bottom: 16px;
      color: #c0c4cc;
    }

    p {
      margin: 0;
      font-size: 14px;
    }
  }

  // 错误状态样式
  .load-error {
    padding: 60px 20px;
    text-align: center;
    background-color: #fafafa;
    border: 1px dashed #d9d9d9;
    border-radius: 4px;

    .error-content {
      max-width: 400px;
      margin: 0 auto;

      i {
        font-size: 48px;
        color: #f56c6c;
        margin-bottom: 16px;
      }

      .error-message {
        color: #606266;
        margin: 0 0 20px 0;
        font-size: 14px;
        line-height: 1.5;
      }
    }
  }

  // 单元格错误样式
  .cell-error {
    color: #f56c6c;
    font-style: italic;
  }

  // 虚拟滚动样式
  .virtual-table-wrapper {
    border: 1px solid #ebeef5;
    border-radius: 4px;
    overflow: hidden;

    .virtual-table-header {
      border-bottom: 1px solid #ebeef5;

      ::v-deep .el-table__body-wrapper {
        display: none;
      }
    }

    .virtual-table-body {
      overflow-y: auto;

      ::v-deep .el-table__header-wrapper {
        display: none;
      }

      ::v-deep .el-table__body {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
      }
    }
  }
}
</style>
