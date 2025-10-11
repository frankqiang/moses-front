<!--
  文件名称: LocationTable.vue
  文件描述: 库位表格组件
  创建日期: 2025-01-20
  修改记录:
    - 2025-01-20: 初始创建
-->

<template>
  <div class="location-table-container">
    <!-- 表格工具栏 -->
    <TableToolbar
      :enable-refresh="true"
      :enable-column-settings="true"
      :column-options="allTableColumns"
      :storage-key="'storage_location_visible_columns'"
      :default-visible-columns="defaultVisibleColumns"
      :enable-export="false"
      @refresh="handleRefresh"
      @column-change="handleColumnChange"
    >
      <template #toolbar-left>
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="small"
          @click="handleCreate"
        >
          创建库位
        </el-button>
        <slot name="toolbar-buttons" />
      </template>
    </TableToolbar>

    <!-- 表格 -->
    <BaseTable
      :columns="visibleColumns"
      :data="tableData"
      :loading="loading"
      :pagination="pagination"
      :enable-pagination="true"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
      @sort-change="handleSortChange"
    >
      <!-- 所属库区 -->
      <template #storageArea="{ row }">
        <span v-if="row.storageArea">
          {{ row.storageArea.areaCode }} - {{ row.storageArea.areaName }}
        </span>
        <span v-else class="text-muted">-</span>
      </template>

      <!-- 坐标 -->
      <template #coordinates="{ row }">
        <span v-if="hasCoordinates(row)">
          ({{ formatNumber(row.coordinateX) }}, {{ formatNumber(row.coordinateY) }}, {{ formatNumber(row.coordinateZ) }})
        </span>
        <span v-else class="text-muted">-</span>
      </template>

      <!-- 尺寸限制 -->
      <template #dimensions="{ row }">
        <span v-if="hasDimensions(row)">
          {{ formatNumber(row.lengthLimit) }} × {{ formatNumber(row.widthLimit) }} × {{ formatNumber(row.heightLimit) }} cm
        </span>
        <span v-else class="text-muted">-</span>
      </template>

      <!-- 占用状态 -->
      <template #occupancyStatus="{ row }">
        <StatusTag
          :status="row.occupancyStatus"
          :type-map="statusConfig.typeMap"
          :text-map="statusConfig.textMap"
        />
      </template>

      <!-- 最大堆叠高度 -->
      <template #maxStackHeight="{ row }">
        <span v-if="row.locationType === 'ground_stacking' && row.maxStackHeight">
          {{ row.maxStackHeight }} 层
        </span>
        <span v-else class="text-muted">-</span>
      </template>

      <!-- 适用料框规格 -->
      <template #binSpecCodes="{ row }">
        <OverflowTagsPopover
          v-if="row.applicableBinSpecCodes && row.applicableBinSpecCodes.length > 0"
          :tags="row.applicableBinSpecCodes"
          :max-visible="2"
        />
        <span v-else class="text-muted">不限</span>
      </template>

      <!-- 操作列 -->
      <template #actions="{ row }">
        <ActionButtons
          :buttons="getActionButtons(row)"
          @action="handleAction($event, row)"
        />
      </template>
    </BaseTable>
  </div>
</template>

<script>
import BaseTable from '@/components/BaseTable'
import TableToolbar from '@/components/TableToolbar'
import StatusTag from '@/components/StatusTag'
import OverflowTagsPopover from '@/components/OverflowTagsPopover'
import ActionButtons from '@/components/ActionButtons'
import {
  LOCATION_TABLE_COLUMNS,
  OCCUPANCY_STATUS_CONFIG,
  OCCUPANCY_STATUS
} from '../constants'

export default {
  name: 'LocationTable',
  components: {
    BaseTable,
    TableToolbar,
    StatusTag,
    OverflowTagsPopover,
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
      statusConfig: OCCUPANCY_STATUS_CONFIG,
      defaultVisibleColumns: LOCATION_TABLE_COLUMNS.map(col => col.prop),
      visibleColumns: [...LOCATION_TABLE_COLUMNS]
    }
  },
  computed: {
    allTableColumns() {
      return LOCATION_TABLE_COLUMNS
    }
  },
  methods: {
    /**
     * 判断是否有坐标数据
     */
    hasCoordinates(row) {
      return row.coordinateX !== null ||
             row.coordinateY !== null ||
             row.coordinateZ !== null
    },

    /**
     * 判断是否有尺寸数据
     */
    hasDimensions(row) {
      return row.lengthLimit !== null ||
             row.widthLimit !== null ||
             row.heightLimit !== null
    },

    /**
     * 格式化数字
     */
    formatNumber(value) {
      if (value === null || value === undefined) return '-'
      return value
    },

    /**
     * 获取操作按钮配置
     */
    getActionButtons(row) {
      const buttons = [
        {
          key: 'detail',
          label: '详情',
          type: 'text',
          icon: 'el-icon-view'
        },
        {
          key: 'edit',
          label: '编辑',
          type: 'text',
          icon: 'el-icon-edit'
        }
      ]

      // 根据当前占用状态添加状态切换按钮
      if (row.occupancyStatus === OCCUPANCY_STATUS.FREE) {
        buttons.push({
          key: 'occupy',
          label: '占用',
          type: 'text',
          icon: 'el-icon-lock'
        })
      } else if (row.occupancyStatus === OCCUPANCY_STATUS.OCCUPIED) {
        buttons.push({
          key: 'release',
          label: '释放',
          type: 'text',
          icon: 'el-icon-unlock'
        })
      } else {
        buttons.push({
          key: 'changeStatus',
          label: '状态变更',
          type: 'text',
          icon: 'el-icon-refresh'
        })
      }

      return buttons
    },

    /**
     * 处理操作按钮点击
     */
    handleAction(action, row) {
      const actionMap = {
        detail: () => this.$emit('detail', row),
        edit: () => this.$emit('edit', row),
        occupy: () => this.$emit('status-change', row, OCCUPANCY_STATUS.OCCUPIED),
        release: () => this.$emit('status-change', row, OCCUPANCY_STATUS.FREE),
        changeStatus: () => this.$emit('status-change', row)
      }

      const handler = actionMap[action]
      if (handler) {
        handler()
      }
    },

    /**
     * 处理刷新
     */
    handleRefresh() {
      this.$emit('refresh')
    },

    /**
     * 处理创建
     */
    handleCreate() {
      this.$emit('create')
    },

    /**
     * 处理分页变化
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
    handleSortChange(sort) {
      this.$emit('sort-change', sort)
    },

    /**
     * 处理列变化
     */
    handleColumnChange(visibleColumnProps) {
      // 根据可见列属性过滤显示的列
      this.visibleColumns = LOCATION_TABLE_COLUMNS.filter(col =>
        visibleColumnProps.includes(col.prop)
      )
    }
  }
}
</script>

<style lang="scss" scoped>
.location-table-container {
  .text-muted {
    color: #909399;
    font-style: italic;
  }
}
</style>

