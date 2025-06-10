/**
 * BaseTable 表格组件
 * 功能描述：配置驱动的表格组件，提供加载状态、分页、空状态等功能
 * 创建日期：2024-12-18
 */
<template>
  <div class="base-table-container">
    <el-table
      ref="elTable"
      :data="data"
      v-loading="loading"
      v-bind="$attrs"
      style="width: 100%"
      @sort-change="handleSortChange"
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
        v-for="column in columns"
        :key="column.prop || column.slotName"
        :prop="column.prop"
        :label="column.label"
        :width="column.width"
        :min-width="column.minWidth"
        :align="column.align || 'left'"
        :fixed="column.fixed"
        :sortable="column.sortable || false"
        :formatter="column.formatter"
        :show-overflow-tooltip="column.showOverflowTooltip !== false"
        :class-name="column.className"
        :label-class-name="column.labelClassName"
        v-bind="column.attrs"
      >
        <!-- 使用插槽进行自定义渲染 -->
        <template v-if="column.slotName" v-slot="scope">
          <slot 
            :name="column.slotName" 
            :row="scope.row" 
            :column="scope.column" 
            :$index="scope.$index"
            :value="scope.row[column.prop]"
          />
        </template>
        
        <!-- 状态列的默认渲染 -->
        <template v-else-if="column.type === 'status'" v-slot="scope">
          <status-tag
            :status="scope.row[column.prop]"
            :text-map="column.textMap || {}"
            :type-map="column.typeMap || {}"
            :color-map="column.colorMap || {}"
            :default-text="column.defaultText || ''"
            :default-type="column.defaultType || 'info'"
            :size="column.tagSize || 'small'"
            :effect="column.tagEffect || 'light'"
          />
        </template>
        
        <!-- 时间列的默认渲染 -->
        <template v-else-if="column.type === 'datetime'" v-slot="scope">
          <span>{{ formatTime(scope.row[column.prop], column.format) }}</span>
        </template>
      </el-table-column>

      <!-- 操作列 (便捷插槽) -->
      <slot name="actions" />

      <!-- 自定义空状态 -->
      <template #empty>
        <slot name="empty">
          <div class="empty-block">
            <i class="el-icon-document"></i>
            <p>暂无数据</p>
          </div>
        </slot>
      </template>
      
      <!-- 附加内容 -->
      <slot name="append" />

    </el-table>

    <!-- 分页组件 -->
    <pagination
      v-if="pagination && showPagination"
      :total="pagination.total"
      :page.sync="pagination.page"
      :limit.sync="pagination.limit"
      :page-sizes="pagination.pageSizes || [10, 20, 50, 100]"
      :layout="pagination.layout || 'total, sizes, prev, pager, next, jumper'"
      :background="pagination.background !== false"
      :auto-scroll="pagination.autoScroll !== false"
      @pagination="handlePaginationChange"
    />
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import StatusTag from '@/components/StatusTag'
import { parseTime } from '@/utils'

export default {
  name: 'BaseTable',
  components: {
    Pagination,
    StatusTag
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
    }
  },
  methods: {
    // 排序事件
    handleSortChange(data) {
      this.$emit('sort-change', data)
    },
    
    // 多选事件
    handleSelectionChange(selection) {
      this.$emit('selection-change', selection)
    },
    
    // 行点击事件
    handleRowClick(row, column, event) {
      this.$emit('row-click', row, column, event)
    },
    
    // 行双击事件
    handleRowDblClick(row, column, event) {
      this.$emit('row-dblclick', row, column, event)
    },
    
    // 分页变动事件
    handlePaginationChange(pagination) {
      this.$emit('pagination-change', pagination)
    },
    
    // 格式化时间
    formatTime(time, format = '{y}-{m}-{d} {h}:{i}:{s}') {
      if (!time) return ''
      return parseTime(time, format)
    },
    
    // 暴露 el-table 的原生方法
    clearSelection() {
      this.$refs.elTable.clearSelection()
    },
    
    toggleRowSelection(row, selected) {
      this.$refs.elTable.toggleRowSelection(row, selected)
    },
    
    toggleAllSelection() {
      this.$refs.elTable.toggleAllSelection()
    },
    
    setCurrentRow(row) {
      this.$refs.elTable.setCurrentRow(row)
    },
    
    clearSort() {
      this.$refs.elTable.clearSort()
    },
    
    clearFilter(columnKey) {
      this.$refs.elTable.clearFilter(columnKey)
    },
    
    doLayout() {
      this.$refs.elTable.doLayout()
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
}
</style> 