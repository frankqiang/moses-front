<!--
文件名称：MaintenancePlanTable.vue
文件描述：维护计划表格组件
创建日期：2025-10-15
修改记录：
  - 2025-10-15: 初始创建
-->

<template>
  <div class="maintenance-plan-table">
    <!-- 工具栏 -->
    <table-toolbar
      :enable-refresh="true"
      :enable-column-settings="true"
      @refresh="handleRefresh"
    >
      <template #left>
        <el-button
          type="primary"
          size="small"
          icon="el-icon-plus"
          @click="handleCreate"
        >
          新建计划
        </el-button>
      </template>
    </table-toolbar>

    <!-- 表格 -->
    <base-table
      :columns="visibleColumns"
      :data="tableData"
      :loading="loading"
      :total="total"
      :page="queryParams.page"
      :limit="queryParams.limit"
      :enable-pagination="true"
      @sort-change="handleSortChange"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
    >
      <!-- 关联设备 -->
      <template #equipment="{ row }">
        <div v-if="row.equipment" class="equipment-info">
          <div class="equipment-code">{{ row.equipment.equipmentCode }}</div>
          <div class="equipment-name">{{ row.equipment.name }}</div>
          <el-tag
            v-if="row.equipment.equipmentType"
            size="mini"
            type="info"
            style="margin-top: 4px;"
          >
            {{ row.equipment.equipmentType }}
          </el-tag>
        </div>
        <span v-else class="text-muted">-</span>
      </template>

      <!-- 维护类型 -->
      <template #maintenanceType="{ row }">
        <el-tag
          v-if="row && row.maintenanceType"
          :type="MAINTENANCE_TYPE_TAG_CONFIG.typeMap[row.maintenanceType] || 'info'"
          size="small"
        >
          {{ row.maintenanceType }}
        </el-tag>
        <span v-else class="text-muted">-</span>
      </template>

      <!-- 维护周期 -->
      <template #cycleInfo="{ row }">
        <div v-if="row && row.cycleValue && row.cycleUnit" class="cycle-info">
          <div class="cycle-value">
            每{{ row.cycleValue }}{{ row.cycleUnit }}
          </div>
          <el-tag
            :type="CYCLE_TYPE_TAG_CONFIG.typeMap[row.cycleType] || 'info'"
            size="mini"
            style="margin-top: 4px;"
          >
            {{ row.cycleType }}
          </el-tag>
        </div>
        <span v-else class="text-muted">-</span>
      </template>

      <!-- 标准工时 -->
      <template #standardDurationHours="{ row }">
        <span v-if="row && row.standardDurationHours">
          {{ parseFloat(row.standardDurationHours).toFixed(1) }} 小时
        </span>
        <span v-else class="text-muted">-</span>
      </template>

      <!-- 状态 -->
      <template #status="{ row }">
        <status-tag
          v-if="row && row.status"
          :status="row.status"
          :type-map="STATUS_TAG_CONFIG.typeMap"
          :text-map="STATUS_TAG_CONFIG.textMap"
        />
        <span v-else class="text-muted">-</span>
      </template>

      <!-- 操作列 -->
      <template #actions="{ row }">
        <action-buttons
          :buttons="getActionButtons(row)"
          mode="text"
          @action="handleAction"
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
  TABLE_COLUMNS,
  STATUS_TAG_CONFIG,
  MAINTENANCE_TYPE_TAG_CONFIG,
  CYCLE_TYPE_TAG_CONFIG
} from '../constants'

export default {
  name: 'MaintenancePlanTable',

  components: {
    BaseTable,
    TableToolbar,
    StatusTag,
    ActionButtons
  },

  props: {
    // 表格数据
    tableData: {
      type: Array,
      default: () => []
    },
    // 加载状态
    loading: {
      type: Boolean,
      default: false
    },
    // 总记录数
    total: {
      type: Number,
      default: 0
    },
    // 查询参数
    queryParams: {
      type: Object,
      default: () => ({
        page: 1,
        limit: 10
      })
    }
  },

  data() {
    return {
      TABLE_COLUMNS,
      STATUS_TAG_CONFIG,
      MAINTENANCE_TYPE_TAG_CONFIG,
      CYCLE_TYPE_TAG_CONFIG,
      // 可见列
      visibleColumns: TABLE_COLUMNS
    }
  },

  methods: {
    // 获取操作按钮
    getActionButtons(row) {
      // 防御性检查：如果row不存在，返回空数组
      if (!row) {
        return []
      }

      const buttons = [
        {
          type: 'view',
          label: '查看',
          action: 'view',
          data: row
        },
        {
          type: 'edit',
          label: '编辑',
          action: 'edit',
          data: row
        }
      ]

      // 根据状态显示启用/禁用按钮
      if (row.status === '启用') {
        buttons.push({
          type: 'disable',
          label: '禁用',
          action: 'disable',
          data: row
        })
      } else {
        buttons.push({
          type: 'enable',
          label: '启用',
          action: 'enable',
          data: row
        })
      }

      return buttons
    },

    // 处理操作
    handleAction({ action, data }) {
      this.$emit(action, data)
    },

    // 处理刷新
    handleRefresh() {
      this.$emit('refresh')
    },

    // 处理新建
    handleCreate() {
      this.$emit('create')
    },

    // 处理排序
    handleSortChange({ prop, order }) {
      const sortBy = order ? `${prop}:${order === 'ascending' ? 'asc' : 'desc'}` : 'createdAt:desc'
      this.$emit('sort-change', sortBy)
    },

    // 处理分页
    handlePageChange(page) {
      this.$emit('page-change', page)
    },

    // 处理每页大小变化
    handleSizeChange(limit) {
      this.$emit('size-change', limit)
    }
  }
}
</script>

<style lang="scss" scoped>
.maintenance-plan-table {
  .equipment-info {
    .equipment-code {
      font-weight: 500;
      color: #303133;
      margin-bottom: 4px;
    }

    .equipment-name {
      font-size: 12px;
      color: #606266;
      margin-bottom: 4px;
    }
  }

  .cycle-info {
    .cycle-value {
      font-weight: 500;
      color: #303133;
      margin-bottom: 4px;
    }
  }

  .text-muted {
    color: #909399;
  }
}
</style>
