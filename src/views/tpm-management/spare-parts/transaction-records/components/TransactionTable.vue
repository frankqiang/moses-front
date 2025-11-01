<!--
 * 文件名称：TransactionTable.vue
 * 文件描述：出入库记录表格组件
 * 创建日期：2025-10-25
 * 修改记录：
 *   - 2025-10-25: 初始创建
-->

<template>
  <div class="transaction-table">
    <base-table
      :columns="tableColumns"
      :data="tableData"
      :loading="loading"
      :pagination="pagination"
      :enable-column-settings="true"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
      @sort-change="handleSortChange"
    >
      <!-- 出入库类型 -->
      <template #transactionType="{ row }">
        <el-tag :type="getTransactionTypeTag(row.transactionType)">
          {{ row.transactionType }}
        </el-tag>
      </template>

      <!-- 出入库时间 -->
      <template #transactionTime="{ row }">
        {{ formatDateTime(row.transactionTime) }}
      </template>

      <!-- 关联任务 -->
      <template #maintenanceTask="{ row }">
        <el-link
          v-if="row.maintenanceTask"
          type="primary"
          :underline="false"
          @click="handleViewTask(row.maintenanceTask)"
        >
          {{ row.maintenanceTask.taskCode }}
        </el-link>
        <span v-else>-</span>
      </template>

      <!-- 关联故障单 -->
      <template #equipmentFailure="{ row }">
        <el-link
          v-if="row.equipmentFailure"
          type="primary"
          :underline="false"
          @click="handleViewFailure(row.equipmentFailure)"
        >
          {{ row.equipmentFailure.failureCode }}
        </el-link>
        <span v-else>-</span>
      </template>

      <!-- 操作列 -->
      <template #actions="{ row }">
        <el-button
          type="text"
          size="small"
          @click="handleViewDetail(row)"
        >
          详情
        </el-button>
      </template>
    </base-table>
  </div>
</template>

<script>
import BaseTable from '@/components/BaseTable'
import { TABLE_COLUMNS } from '../constants'

export default {
  name: 'TransactionTable',

  components: {
    BaseTable
  },

  props: {
    tableData: {
      type: Array,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    },
    pagination: {
      type: Object,
      required: true
    }
  },

  data() {
    return {
      tableColumns: TABLE_COLUMNS
    }
  },

  methods: {
    /**
     * 查看详情
     */
    handleViewDetail(row) {
      this.$emit('view-detail', row)
    },

    /**
     * 查看关联任务
     */
    handleViewTask(task) {
      this.$emit('view-task', task)
    },

    /**
     * 查看关联故障单
     */
    handleViewFailure(failure) {
      this.$emit('view-failure', failure)
    },

    /**
     * 处理页码变化
     */
    handlePageChange(page) {
      this.$emit('page-change', page)
    },

    /**
     * 处理每页数量变化
     */
    handleSizeChange(size) {
      this.$emit('size-change', size)
    },

    /**
     * 处理排序变化
     */
    handleSortChange({ column, prop, order }) {
      const sortBy = prop
      const sortOrder = order === 'ascending' ? 'asc' : 'desc'
      this.$emit('sort-change', { sortBy, sortOrder })
    }
  }
}
</script>

<style lang="scss" scoped>
.transaction-table {
  ::v-deep .el-link {
    font-size: 14px;
  }
}
</style>

