<template>
  <div class="schedule-items-panel">
    <!-- 筛选工具栏 -->
    <div class="filter-toolbar">
      <el-form :inline="true" :model="filterForm" size="small">
        <el-form-item label="炉号">
          <el-select
            v-model="filterForm.furnaceCode"
            placeholder="全部"
            clearable
            @change="handleFilter"
          >
            <el-option
              v-for="furnace in furnaceOptions"
              :key="furnace"
              :label="furnace"
              :value="furnace"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="产品编码">
          <el-input
            v-model="filterForm.productCode"
            placeholder="请输入产品编码"
            clearable
            @clear="handleFilter"
            @keyup.enter.native="handleFilter"
          />
        </el-form-item>
        <el-form-item label="冲突标记">
          <el-select
            v-model="filterForm.hasConflict"
            placeholder="全部"
            clearable
            @change="handleFilter"
          >
            <el-option label="有冲突" :value="true" />
            <el-option label="无冲突" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilter">查询</el-button>
          <el-button @click="handleResetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 排程结果表格 -->
    <base-table
      :data="filteredItems"
      :columns="tableColumns"
      :loading="loading"
      :pagination="tablePagination"
      :show-index="true"
      :row-class-name="getRowClassName"
      @sort-change="handleSortChange"
      @pagination-change="handlePaginationChange"
    >
      <!-- 任务编号列 -->
      <template #taskCode="{ row }">
        <el-link type="primary" @click="handleViewTaskDetail(row.taskId)">
          {{ row.taskCode }}
        </el-link>
      </template>

      <!-- 产品编码列（从task嵌套对象中获取） -->
      <template #productCode="{ row }">
        {{ row.task ? row.task.productCode : '-' }}
      </template>

      <!-- 合金牌号列（从task嵌套对象中获取） -->
      <template #alloyGrade="{ row }">
        {{ row.task ? row.task.alloyGrade : '-' }}
      </template>

      <!-- 计划装炉时间列 -->
      <template #plannedLoadingAt="{ row }">
        {{ formatDate(row.plannedLoadingAt) }}
      </template>

      <!-- 计划出炉时间列 -->
      <template #plannedUnloadingAt="{ row }">
        {{ formatDate(row.plannedUnloadingAt) }}
      </template>

      <!-- 预计时长列 -->
      <template #estimatedDurationMinutes="{ row }">
        {{ formatDuration(row.estimatedDurationMinutes) }}
      </template>

      <!-- 炉次总重量列 -->
      <template #scheduleWeight="{ row }">
        <div style="display: flex; align-items: center;">
          <span>{{ getContextWeight(row) }}</span>
          <el-tooltip v-if="hasCapacityInfo(row)" placement="top">
            <div slot="content">
              <div>任务数量：{{ row.scheduleContext.taskCount || 1 }}个</div>
              <div>炉次总重量：{{ getContextWeight(row) }}吨</div>
              <div>本任务重量：{{ formatTaskWeight(row) }}吨</div>
              <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #ddd;">
                <div>容量利用率：{{ getCapacityUtilization(row) }}%</div>
                <div>炉子最大容量：{{ getFurnaceMaxCapacity(row) }}吨</div>
                <div>炉子最小装载量：{{ getFurnaceMinCapacity(row) }}吨</div>
              </div>
            </div>
            <i class="el-icon-info" style="color: #409EFF; cursor: pointer; margin-left: 4px;" />
          </el-tooltip>
        </div>
      </template>

      <!-- 是否混炉列 -->
      <template #isMixed="{ row }">
        <el-tag
          v-if="row.isMixed"
          type="success"
          size="small"
        >
          混炉
        </el-tag>
        <el-tag
          v-else
          type="info"
          size="small"
        >
          单独
        </el-tag>
      </template>

      <!-- 冲突标记列 -->
      <template #hasConflict="{ row }">
        <el-tag
          v-if="row.hasConflict"
          type="danger"
          size="small"
          style="cursor: pointer;"
          @click="handleViewConflict(row)"
        >
          <i class="el-icon-warning" />
          有冲突
        </el-tag>
        <el-tag
          v-else
          type="success"
          size="small"
        >
          <i class="el-icon-success" />
          正常
        </el-tag>
      </template>

      <!-- 操作列 -->
      <template #actions="{ row }">
        <action-buttons
          :buttons="getActionButtons(row)"
          :row="row"
          mode="text"
          @click="handleActionClick"
        />
      </template>
    </base-table>

    <!-- 手动调整对话框 -->
    <adjust-schedule-item-dialog
      :visible.sync="adjustDialogVisible"
      :plan-id="planId"
      :current-item="currentAdjustItem"
      @success="handleAdjustSuccess"
    />
  </div>
</template>

<script>
import { parseTime } from '@/utils'
import BaseTable from '@/components/BaseTable'
import ActionButtons from '@/components/ActionButtons'
import AdjustScheduleItemDialog from '../AdjustScheduleItemDialog'
import { SCHEDULE_ITEMS_COLUMNS } from '../../constants'

export default {
  name: 'ScheduleItemsPanel',
  components: {
    BaseTable,
    ActionButtons,
    AdjustScheduleItemDialog
  },
  props: {
    planId: {
      type: String,
      required: true
    },
    planStatus: {
      type: String,
      required: true
    },
    items: {
      type: Array,
      default: () => []
    },
    conflicts: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      loading: false,
      filterForm: {
        furnaceCode: '',
        productCode: '',
        hasConflict: ''
      },
      sortProp: '',
      sortOrder: '',
      adjustDialogVisible: false,
      currentAdjustItem: {},
      currentPage: 1,
      pageSize: 20
    }
  },
  computed: {
    tableColumns() {
      return SCHEDULE_ITEMS_COLUMNS
    },
    furnaceOptions() {
      const furnaces = [...new Set(this.items.map(item => item.furnaceCode))]
      return furnaces.sort()
    },
    allFilteredItems() {
      let result = [...this.items]

      // 筛选
      if (this.filterForm.furnaceCode) {
        result = result.filter(item => item.furnaceCode === this.filterForm.furnaceCode)
      }
      if (this.filterForm.productCode) {
        result = result.filter(item => {
          const productCode = item.task && item.task.productCode
          return productCode && productCode.includes(this.filterForm.productCode)
        })
      }
      if (this.filterForm.hasConflict !== '') {
        result = result.filter(item => item.hasConflict === this.filterForm.hasConflict)
      }

      // 排序
      if (this.sortProp) {
        result = result.sort((a, b) => {
          const aVal = a[this.sortProp]
          const bVal = b[this.sortProp]

          if (this.sortOrder === 'ascending') {
            return aVal > bVal ? 1 : -1
          } else {
            return aVal < bVal ? 1 : -1
          }
        })
      }

      return result
    },
    filteredItems() {
      // 客户端分页：从 allFilteredItems 中截取当前页数据
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.allFilteredItems.slice(start, end)
    },
    tablePagination() {
      return {
        page: this.currentPage,
        limit: this.pageSize,
        total: this.allFilteredItems.length,
        pageSizes: [10, 20, 50, 100],
        layout: 'total, sizes, prev, pager, next, jumper',
        background: true
      }
    }
  },
  methods: {
    /**
     * 格式化日期
     */
    formatDate(date) {
      if (!date) return '-'
      return parseTime(date, '{y}-{m}-{d} {h}:{i}')
    },

    /**
     * 格式化时长
     */
    formatDuration(minutes) {
      if (!minutes) return '-'
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      return `${hours}小时${mins}分钟`
    },

    /**
     * 格式化重量（通用方法）
     * 注意：接口文档2025-10-25更新，weight字段改为字符串格式
     */
    formatWeight(weight) {
      if (weight === null || weight === undefined) return '-'
      // 兼容字符串和数值格式
      const numWeight = typeof weight === 'string' ? parseFloat(weight) : weight
      return numWeight.toFixed(2)
    },

    /**
     * 格式化任务重量
     * 优先使用实际重量（actualWeight），如果没有则使用计划重量（plannedWeight）
     */
    formatTaskWeight(row) {
      // 优先使用实际重量
      const actualWeight = row.task?.actualWeight
      if (actualWeight !== null && actualWeight !== undefined) {
        return this.formatWeight(actualWeight)
      }

      // 备用：计划重量
      const plannedWeight = row.task?.plannedWeight
      if (plannedWeight !== null && plannedWeight !== undefined) {
        return this.formatWeight(plannedWeight)
      }

      return '-'
    },

    /**
     * 是否有容量信息
     */
    hasCapacityInfo(row) {
      return row.scheduleContext &&
             row.scheduleContext.furnaceMaxCapacity !== undefined &&
             row.scheduleContext.furnaceMinCapacity !== undefined
    },

    /**
     * 获取炉次总重量
     */
    getContextWeight(row) {
      return row.scheduleContext?.totalWeight || '-'
    },

    /**
     * 获取容量利用率
     */
    getCapacityUtilization(row) {
      return row.scheduleContext?.capacityUtilization || '-'
    },

    /**
     * 获取炉子最大容量
     */
    getFurnaceMaxCapacity(row) {
      return row.scheduleContext?.furnaceMaxCapacity || '-'
    },

    /**
     * 获取炉子最小装载量
     */
    getFurnaceMinCapacity(row) {
      return row.scheduleContext?.furnaceMinCapacity || '-'
    },

    /**
     * 获取行类名（用于高亮冲突行）
     */
    getRowClassName({ row }) {
      if (row.hasConflict) {
        return 'conflict-row'
      }
      return ''
    },

    /**
     * 处理筛选
     */
    handleFilter() {
      // 筛选后重置到第一页
      this.currentPage = 1
    },

    /**
     * 重置筛选
     */
    handleResetFilter() {
      this.filterForm = {
        furnaceCode: '',
        productCode: '',
        hasConflict: ''
      }
      this.currentPage = 1
    },

    /**
     * 处理分页变化
     */
    handlePaginationChange({ page, limit }) {
      this.currentPage = page
      this.pageSize = limit
    },

    /**
     * 处理排序变化
     */
    handleSortChange({ prop, order }) {
      this.sortProp = prop
      this.sortOrder = order
    },

    /**
     * 查看任务详情
     */
    handleViewTaskDetail(taskId) {
      this.$router.push({
        name: 'AnnealingTaskDetail',
        params: { id: taskId }
      })
    },

    /**
     * 查看冲突详情
     */
    handleViewConflict(row) {
      // 获取与该任务相关的冲突
      // 注意：接口文档中冲突记录使用 relatedTaskIds 字段
      const relatedConflicts = this.conflicts.filter(conflict =>
        conflict.relatedTaskIds && conflict.relatedTaskIds.includes(row.taskId)
      )

      if (relatedConflicts.length > 0) {
        this.$emit('highlight-conflict', relatedConflicts[0].relatedTaskIds)
      }
    },

    /**
     * 获取操作按钮
     * 注意：任务编号已经可以点击查看详情，所以这里不再重复显示"查看详情"按钮
     */
    getActionButtons(row) {
      const buttons = []

      // 仅已生成状态的方案允许调整
      if (this.canAdjust()) {
        buttons.push({
          text: '手动调整',
          action: 'adjust',
          type: 'warning'
        })
      }

      return buttons
    },

    /**
     * 是否可以调整
     */
    canAdjust() {
      // 仅已生成状态的方案允许调整
      return this.planStatus === 'generated'
    },

    /**
     * 手动调整排程结果
     */
    handleAdjustItem(row) {
      this.currentAdjustItem = { ...row }
      this.adjustDialogVisible = true
    },

    /**
     * 处理操作按钮点击
     */
    handleActionClick({ action, row }) {
      switch (action) {
        case 'adjust':
          this.handleAdjustItem(row)
          break
        default:
          console.warn('未处理的操作:', action)
      }
    },

    /**
     * 调整成功后刷新
     */
    handleAdjustSuccess() {
      this.$emit('refresh')
    }
  }
}
</script>

<style lang="scss" scoped>
.schedule-items-panel {
  .filter-toolbar {
    margin-bottom: 16px;
    padding: 16px;
    background: #f5f7fa;
    border-radius: 4px;

    .el-form {
      margin-bottom: 0;
    }
  }

  ::v-deep .conflict-row {
    background-color: #fef0f0;

    &:hover > td {
      background-color: #fde2e2 !important;
    }
  }
}
</style>

