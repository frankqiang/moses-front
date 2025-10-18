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
      :column-options="TABLE_COLUMNS"
      storage-key="maintenance_plan_columns"
      :default-visible-columns="defaultVisibleColumns"
      @refresh="handleRefresh"
      @column-change="handleColumnChange"
    >
      <template #toolbar-left>
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
      border
      stripe
      highlight-current-row
      @sort-change="handleSortChange"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
    >
      <!-- 关联设备 -->
      <template #equipment="{ row }">
        <div v-if="row.equipment" class="equipment-info">
          <span class="equipment-code">{{ row.equipment.equipmentCode }}</span>
          <span class="equipment-divider">-</span>
          <span class="equipment-name">{{ row.equipment.name }}</span>
          <el-tag
            v-if="row.equipment.equipmentType"
            size="mini"
            type="warning"
            class="equipment-tag"
          >
            {{ getEquipmentTypeText(row.equipment.equipmentType) }}
          </el-tag>
          <status-tag
            v-if="row.equipment.status"
            :status="row.equipment.status"
            :type-map="equipmentStatusConfig.typeMap"
            :text-map="equipmentStatusConfig.textMap"
            size="mini"
            class="equipment-tag"
          />
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
          <span class="cycle-value">每{{ row.cycleValue }}{{ row.cycleUnit }}</span>
          <el-tag
            :type="CYCLE_TYPE_TAG_CONFIG.typeMap[row.cycleType] || 'info'"
            size="mini"
            class="cycle-tag"
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
          :row="row"
          mode="text"
          size="small"
          @click="handleAction"
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
import {
  EQUIPMENT_TYPE_MAP,
  EQUIPMENT_STATUS_MAP,
  EQUIPMENT_STATUS_CONFIG
} from '@/views/master-data/equipment-management/constants/equipment-management'

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
      // 设备相关配置
      equipmentStatusConfig: EQUIPMENT_STATUS_CONFIG,
      // 可见列的 prop 数组（从列设置接收）
      visibleColumnProps: TABLE_COLUMNS.map(col => col.prop),
      // 默认可见列（所有列的prop）
      defaultVisibleColumns: TABLE_COLUMNS.map(col => col.prop)
    }
  },

  computed: {
    /**
     * 可见的列配置对象数组
     * 根据 visibleColumnProps 从 TABLE_COLUMNS 中筛选
     */
    visibleColumns() {
      const props = this.visibleColumnProps.length > 0
        ? this.visibleColumnProps
        : this.defaultVisibleColumns

      return TABLE_COLUMNS.filter(column => props.includes(column.prop))
    }
  },

  methods: {
    /**
     * 获取设备类型的中文显示文本
     * @param {string} equipmentType - 设备类型枚举值
     * @returns {string} 中文显示文本
     */
    getEquipmentTypeText(equipmentType) {
      return EQUIPMENT_TYPE_MAP[equipmentType] || equipmentType || '-'
    },

    /**
     * 获取设备状态的中文显示文本
     * @param {string} status - 设备状态枚举值
     * @returns {string} 中文显示文本
     */
    getEquipmentStatusText(status) {
      return EQUIPMENT_STATUS_MAP[status] || status || '-'
    },

    // 获取操作按钮
    getActionButtons(row) {
      // 防御性检查：如果row不存在，返回空数组
      if (!row) {
        return []
      }

      const buttons = [
        {
          text: '查看',
          action: 'view',
          icon: 'el-icon-view'
        },
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
          icon: 'el-icon-close'
        })
      } else {
        buttons.push({
          text: '启用',
          action: 'enable',
          icon: 'el-icon-check'
        })
      }

      return buttons
    },

    // 处理操作
    handleAction(event) {
      // ActionButtons组件传递的事件对象：{ action, data, row }
      const { action, row } = event
      this.$emit(action, row)
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
    },

    /**
     * 处理列设置变更
     * @param {Array} columns - 可见列的 prop 数组（字符串数组）
     */
    handleColumnChange(columns) {
      // columns 是一个 prop 字符串数组，如：['planCode', 'planName', ...]
      this.visibleColumnProps = columns
      this.$emit('column-change', columns)
    }
  }
}
</script>

<style lang="scss" scoped>
.maintenance-plan-table {
  .equipment-info {
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    white-space: nowrap;

    .equipment-code {
      font-weight: 500;
      color: #303133;
    }

    .equipment-divider {
      margin: 0 6px;
      color: #DCDFE6;
    }

    .equipment-name {
      color: #606266;
      margin-right: 6px;
    }

    .equipment-tag {
      margin-left: 4px;
      flex-shrink: 0;
    }
  }

  .cycle-info {
    display: flex;
    align-items: center;
    white-space: nowrap;

    .cycle-value {
      font-weight: 500;
      color: #303133;
      margin-right: 8px;
    }

    .cycle-tag {
      flex-shrink: 0;
    }
  }

  .text-muted {
    color: #909399;
  }
}
</style>
