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
        <el-form-item label="优先级">
          <el-select
            v-model="filterForm.priority"
            placeholder="全部"
            clearable
            @change="handleFilter"
          >
            <el-option label="紧急" value="emergency" />
            <el-option label="高" value="high" />
            <el-option label="普通" value="normal" />
            <el-option label="低" value="low" />
          </el-select>
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
      :pagination="false"
      :row-class-name="getRowClassName"
      @sort-change="handleSortChange"
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

      <!-- 计划重量列 -->
      <template #scheduleWeight="{ row }">
        {{ formatWeight(row.scheduleWeight) }}
      </template>

      <!-- 优先级列 -->
      <template #priority="{ row }">
        <el-tag
          :type="getPriorityType(getTaskPriority(row))"
          size="small"
        >
          {{ getPriorityText(getTaskPriority(row)) }}
        </el-tag>
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
          mode="text"
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
        priority: '',
        hasConflict: ''
      },
      sortProp: '',
      sortOrder: '',
      adjustDialogVisible: false,
      currentAdjustItem: {}
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
    filteredItems() {
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
      if (this.filterForm.priority) {
        result = result.filter(item => {
          const priority = item.scheduleContext && item.scheduleContext.priority
          return priority === this.filterForm.priority
        })
      }
      if (this.filterForm.hasConflict !== '') {
        result = result.filter(item => item.hasConflict === this.filterForm.hasConflict)
      }

      // 排序
      if (this.sortProp) {
        result = result.sort((a, b) => {
          let aVal = a[this.sortProp]
          let bVal = b[this.sortProp]

          // 处理嵌套属性
          if (this.sortProp === 'priority') {
            // 注意：优先级顺序按照业务重要性排序
            const priorityOrder = { low: 1, normal: 2, high: 3, emergency: 4 }
            const aPriority = (a.scheduleContext && a.scheduleContext.priority) || 'normal'
            const bPriority = (b.scheduleContext && b.scheduleContext.priority) || 'normal'
            aVal = priorityOrder[aPriority]
            bVal = priorityOrder[bPriority]
          }

          if (this.sortOrder === 'ascending') {
            return aVal > bVal ? 1 : -1
          } else {
            return aVal < bVal ? 1 : -1
          }
        })
      }

      return result
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
     * 格式化重量
     */
    formatWeight(weight) {
      if (weight === null || weight === undefined) return '-'
      return Number(weight).toFixed(2)
    },

    /**
     * 获取任务优先级
     * 从排程上下文中获取优先级，而不是从任务对象
     */
    getTaskPriority(row) {
      return (row.scheduleContext && row.scheduleContext.priority) || 'normal'
    },

    /**
     * 获取优先级类型
     * 注意：必须严格按照接口文档中的枚举值定义
     */
    getPriorityType(priority) {
      const typeMap = {
        emergency: 'danger', // 紧急 - 红色
        high: 'warning', // 高 - 橙色
        normal: '', // 普通 - 默认
        low: 'info' // 低 - 灰色
      }
      return typeMap[priority] || ''
    },

    /**
     * 获取优先级文本
     * 注意：必须严格按照接口文档中的枚举值定义
     */
    getPriorityText(priority) {
      const textMap = {
        emergency: '紧急',
        high: '高',
        normal: '普通',
        low: '低'
      }
      return textMap[priority] || '普通'
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
      // 筛选逻辑在computed中处理
    },

    /**
     * 重置筛选
     */
    handleResetFilter() {
      this.filterForm = {
        furnaceCode: '',
        productCode: '',
        priority: '',
        hasConflict: ''
      }
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
      const relatedConflicts = this.conflicts.filter(conflict =>
        conflict.affectedTaskIds.includes(row.taskId)
      )

      if (relatedConflicts.length > 0) {
        this.$emit('highlight-conflict', relatedConflicts[0].affectedTaskIds)
      }
    },

    /**
     * 获取操作按钮
     */
    getActionButtons(row) {
      return [
        {
          label: '查看详情',
          type: 'primary',
          onClick: () => this.handleViewTaskDetail(row.taskId)
        },
        {
          label: '手动调整',
          type: 'warning',
          onClick: () => this.handleAdjustItem(row),
          show: this.canAdjust()
        }
      ]
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

