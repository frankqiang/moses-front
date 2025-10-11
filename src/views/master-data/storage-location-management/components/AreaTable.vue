<!--
文件名称: AreaTable.vue
文件描述: 库区表格组件
创建日期: 2025-01-20
修改记录:
  - 2025-01-20: 初始创建
-->

<template>
  <div class="area-table">
    <!-- 工具栏 -->
    <table-toolbar
      :enable-create="true"
      :enable-refresh="true"
      :enable-column-settings="true"
      :enable-export="false"
      @create="handleCreate"
      @refresh="handleRefresh"
    >
      <template #custom-buttons>
        <slot name="toolbar-buttons" />
      </template>
    </table-toolbar>

    <!-- 表格 -->
    <base-table
      ref="baseTable"
      :columns="visibleColumns"
      :data="tableData"
      :loading="loading"
      :pagination="pagination"
      :default-sort="defaultSort"
      @sort-change="handleSortChange"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
    >
      <!-- 状态列 -->
      <template #status="{ row }">
        <status-tag
          :status="row.status"
          :type-map="statusConfig.typeMap"
          :text-map="statusConfig.textMap"
        />
      </template>

      <!-- 操作列 -->
      <template #actions="{ row }">
        <action-buttons
          :buttons="getActionButtons(row)"
          mode="text"
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
import {
  STORAGE_AREA_TABLE_COLUMNS,
  STORAGE_AREA_STATUS_CONFIG
} from '../constants'
import { parseTime } from '@/utils'

export default {
  name: 'AreaTable',
  components: {
    BaseTable,
    TableToolbar,
    StatusTag,
    ActionButtons
  },
  props: {
    tableData: {
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
        limit: 10,
        total: 0
      })
    }
  },
  data() {
    return {
      columns: STORAGE_AREA_TABLE_COLUMNS,
      statusConfig: STORAGE_AREA_STATUS_CONFIG,
      defaultSort: {
        prop: 'createdAt',
        order: 'descending'
      },
      visibleColumns: []
    }
  },
  created() {
    // 初始化可见列(添加格式化处理)
    this.visibleColumns = this.columns.map(col => {
      if (col.prop === 'createdAt' || col.prop === 'updatedAt') {
        return {
          ...col,
          formatter: (row, column, cellValue) => {
            return cellValue ? parseTime(cellValue, '{y}-{m}-{d} {h}:{i}:{s}') : '-'
          }
        }
      }
      return col
    })
  },
  methods: {
    handleCreate() {
      this.$emit('create')
    },
    handleRefresh() {
      this.$emit('refresh')
    },
    handleSortChange({ prop, order }) {
      // 转换排序格式: descending -> desc, ascending -> asc
      let sortBy = ''
      if (prop && order) {
        const sortOrder = order === 'descending' ? 'desc' : 'asc'
        sortBy = `${prop}:${sortOrder}`
      }
      this.$emit('sort-change', sortBy)
    },
    handlePageChange(page) {
      this.$emit('page-change', page)
    },
    handleSizeChange(limit) {
      this.$emit('size-change', limit)
    },
    getActionButtons(row) {
      const buttons = []

      // 查看详情按钮
      buttons.push({
        text: '详情',
        type: 'primary',
        onClick: () => this.handleView(row)
      })

      // 编辑按钮
      buttons.push({
        text: '编辑',
        type: 'primary',
        onClick: () => this.handleEdit(row)
      })

      // 状态切换按钮
      const statusButton = {
        text: row.status === 'enabled' ? '禁用' : '启用',
        type: row.status === 'enabled' ? 'warning' : 'success',
        onClick: () => this.handleStatusChange(row)
      }
      buttons.push(statusButton)

      return buttons
    },
    handleView(row) {
      this.$emit('view', row)
    },
    handleEdit(row) {
      this.$emit('edit', row)
    },
    handleStatusChange(row) {
      this.$emit('status-change', row)
    }
  }
}
</script>

<style lang="scss" scoped>
.area-table {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>

