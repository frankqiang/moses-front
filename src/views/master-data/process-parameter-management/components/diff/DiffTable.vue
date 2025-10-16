<!--
文件名称：DiffTable.vue
文件描述：通用差异表格组件，用于展示基础字段的前后差异
创建日期：2025-09-30
修改记录：
  - 2025-09-30: 初始创建，实现字段差异高亮展示
-->

<template>
  <el-table
    :data="computedRows"
    size="small"
    border
    class="diff-table"
  >
    <el-table-column
      v-for="column in columns"
      :key="column.prop"
      :label="column.label"
      :prop="column.prop"
    >
      <template #default="{ row }">
        <span :class="getCellClass(row, column.prop)">
          {{ row[column.prop] === undefined || row[column.prop] === null ? '-' : row[column.prop] }}
        </span>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
export default {
  name: 'DiffTable',
  props: {
    columns: {
      type: Array,
      default: () => []
    },
    rows: {
      type: Array,
      default: () => []
    },
    highlightMode: {
      type: String,
      default: 'diff' // diff | all
    }
  },
  computed: {
    computedRows() {
      if (this.highlightMode === 'diff') {
        return this.rows.filter(row => row.changed)
      }
      return this.rows
    }
  },
  methods: {
    getCellClass(row, prop) {
      // 基础类名
      const baseClass = 'diff-table__cell'

      // 如果该行没有变化，直接返回基础类名
      if (!row.changed) {
        return baseClass
      }

      // 如果该行有变化，只高亮对比版本（compare列）
      if (prop === 'compare') {
        return `${baseClass} diff-table__cell--changed diff-table__cell--${prop}`
      }

      // 其他列（label和current）不高亮
      return baseClass
    }
  }
}
</script>

<style lang="scss" scoped>
.diff-table {
  width: 100%;

  &__cell {
    display: inline-block;
    width: 100%;
    &--changed {
      font-weight: 600;
      color: #e67e22;
    }
  }
}
</style>
