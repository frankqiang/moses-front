/**
 * 文件名称：ItemsTable.vue
 * 文件描述：生产计划子批次列表组件
 * 创建日期：2025-01-21
 * 修改记录：
 *   - 2025-01-21: 初始创建
 */

<template>
  <div class="items-table">
    <el-table
      :data="displayItems"
      border
      stripe
      :default-sort="{ prop: 'sequence', order: 'ascending' }"
      @sort-change="handleSortChange"
    >
      <el-table-column
        prop="itemNumber"
        label="子计划编号"
        min-width="150"
        sortable="custom"
      />
      <el-table-column
        prop="sequence"
        label="拆分序号"
        width="100"
        sortable="custom"
        align="center"
      />
      <el-table-column
        prop="plannedWeight"
        label="预计重量(吨)"
        width="120"
        sortable="custom"
        align="right"
      >
        <template slot-scope="{ row }">
          {{ row.plannedWeight ? row.plannedWeight.toFixed(3) : '-' }}
        </template>
      </el-table-column>
      <el-table-column
        prop="plannedQuantity"
        label="预计数量"
        width="100"
        sortable="custom"
        align="right"
      >
        <template slot-scope="{ row }">
          {{ row.plannedQuantity || '-' }}
        </template>
      </el-table-column>
      <el-table-column
        prop="status"
        label="状态"
        width="120"
        align="center"
      >
        <template slot-scope="{ row }">
          <el-tag :type="getStatusType(row.status)" size="small">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="计划装炉时段"
        min-width="180"
      >
        <template slot-scope="{ row }">
          <div v-if="row.expectedFurnaceWindowStart && row.expectedFurnaceWindowEnd">
            {{ formatTime(row.expectedFurnaceWindowStart) }}
            <br>
            至 {{ formatTime(row.expectedFurnaceWindowEnd) }}
          </div>
          <span v-else class="text-muted">-</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="processTemplateName"
        label="工艺模板"
        min-width="150"
      >
        <template slot-scope="{ row }">
          {{ row.processTemplateName || '-' }}
        </template>
      </el-table-column>
      <el-table-column
        prop="assignedEquipmentId"
        label="分配设备"
        min-width="120"
      >
        <template slot-scope="{ row }">
          {{ row.assignedEquipmentId || '-' }}
        </template>
      </el-table-column>
      <el-table-column
        label="时间信息"
        min-width="180"
      >
        <template slot-scope="{ row }">
          <div class="time-info">
            <div>创建：{{ formatTime(row.createdAt) }}</div>
            <div>更新：{{ formatTime(row.updatedAt) }}</div>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 空状态 -->
    <el-empty
      v-if="!items || items.length === 0"
      description="暂无子批次数据"
      :image-size="100"
    />
  </div>
</template>

<script>
import { parseTime } from '@/utils'

export default {
  name: 'ItemsTable',
  props: {
    items: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      sortProp: 'sequence',
      sortOrder: 'ascending',
      // 子批次状态映射
      itemStatusMap: {
        DRAFT: '草稿',
        READY_FOR_SCHEDULING: '待排程',
        SCHEDULED: '已排程',
        READY_FOR_EXECUTION: '待执行',
        IN_PROGRESS: '执行中',
        COMPLETED: '已完成',
        CANCELLED: '已取消'
      },
      itemStatusTypeMap: {
        DRAFT: 'info',
        READY_FOR_SCHEDULING: 'warning',
        SCHEDULED: 'primary',
        READY_FOR_EXECUTION: 'warning',
        IN_PROGRESS: 'success',
        COMPLETED: 'success',
        CANCELLED: 'danger'
      }
    }
  },
  computed: {
    displayItems() {
      if (!this.items || this.items.length === 0) {
        return []
      }
      // 排序
      const sortedItems = [...this.items]
      sortedItems.sort((a, b) => {
        const prop = this.sortProp
        const order = this.sortOrder === 'ascending' ? 1 : -1
        if (a[prop] < b[prop]) return -1 * order
        if (a[prop] > b[prop]) return 1 * order
        return 0
      })
      return sortedItems
    }
  },
  methods: {
    /**
     * 处理排序变化
     */
    handleSortChange({ prop, order }) {
      this.sortProp = prop
      this.sortOrder = order
    },

    /**
     * 获取状态文本
     */
    getStatusText(status) {
      return this.itemStatusMap[status] || status || '-'
    },

    /**
     * 获取状态类型
     */
    getStatusType(status) {
      return this.itemStatusTypeMap[status] || 'info'
    },

    /**
     * 格式化时间
     */
    formatTime(time) {
      return time ? parseTime(time, '{y}-{m}-{d} {h}:{i}') : '-'
    }
  }
}
</script>

<style lang="scss" scoped>
.items-table {
  .time-info {
    font-size: 12px;
    color: #909399;
    line-height: 1.5;

    div {
      margin: 2px 0;
    }
  }

  .text-muted {
    color: #909399;
  }
}
</style>

