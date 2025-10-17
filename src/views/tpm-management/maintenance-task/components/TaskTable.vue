<!--
  文件名称：TaskTable.vue
  文件描述：维护任务列表表格组件
  创建日期：2024-01-20
  修改记录：
    - 2024-01-20: 初始创建
    - 2024-01-20: 重构，参考铝箔产品管理模块架构
-->
<template>
  <div class="task-table">
    <!-- 表格工具栏 -->
    <table-toolbar
      ref="toolbar"
      class="task-table__toolbar"
      :enable-column-settings="false"
      :enable-batch-actions="false"
      :enable-export="false"
      :enable-import="false"
      :enable-refresh="true"
      :refresh-feedback-mode="'notification'"
      @refresh="handleToolbarRefresh"
    >
      <template #toolbar-left>
        <action-buttons :buttons="toolbarButtons" mode="normal" @click="handleToolbarAction" />
      </template>
    </table-toolbar>

    <!-- 数据表格 -->
    <base-table
      ref="baseTable"
      class="task-table__main"
      :data="data"
      :columns="tableColumns"
      :loading="loading"
      :pagination="pagination"
      :row-class-name="getRowClassName"
      stripe
      border
      highlight-current-row
      @pagination-change="handlePaginationChange"
      @sort-change="handleSortChange"
    >
      <!-- 任务编码列 -->
      <template #taskCode="{ row, value }">
        <el-tooltip
          v-if="value"
          effect="light"
          placement="top"
          :content="copyTooltip"
        >
          <span class="task-table__code" @click="handleCopyTaskCode(value)">
            {{ value }}
            <i class="el-icon-document-copy" aria-hidden="true" />
          </span>
        </el-tooltip>
        <span v-else>-</span>
      </template>

      <!-- 设备信息列 -->
      <template #equipment="{ row }">
        <div v-if="row.equipment" class="task-table__equipment">
          <div class="task-table__equipment-code">{{ row.equipment.equipmentCode }}</div>
          <div class="task-table__equipment-name">{{ row.equipment.name }}</div>
        </div>
        <span v-else>-</span>
      </template>

      <!-- 任务类型列 -->
      <template #taskType="{ value }">
        <status-tag
          v-if="value"
          :status="value"
          :type-map="taskTypeConfig.typeMap"
          effect="light"
          size="small"
        />
        <span v-else>-</span>
      </template>

      <!-- 计划开始时间列 -->
      <template #plannedStartTime="{ value }">
        <span>{{ formatDateTime(value) }}</span>
      </template>

      <!-- 计划结束时间列 -->
      <template #plannedEndTime="{ value }">
        <span>{{ formatDateTime(value) }}</span>
      </template>

      <!-- 执行人列 -->
      <template #assignee="{ row }">
        <span v-if="row.assignee">{{ row.assignee.name }}</span>
        <span v-else class="task-table__text-muted">未分配</span>
      </template>

      <!-- 状态列 -->
      <template #status="{ row, value }">
        <div class="task-table__status">
          <status-tag
            v-if="value"
            :status="value"
            :type-map="statusConfig.typeMap"
            effect="light"
            size="small"
          />
          <el-tag
            v-if="isOverdue(row)"
            type="danger"
            size="mini"
            effect="dark"
            style="margin-left: 8px"
          >
            逾期
          </el-tag>
        </div>
      </template>

      <!-- 创建时间列 -->
      <template #createdAt="{ value }">
        <span>{{ formatDateTime(value) }}</span>
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
import { TABLE_COLUMNS, STATUS_CONFIG, TASK_TYPE_CONFIG } from '../constants'
import { parseTime } from '@/utils'

export default {
  name: 'TaskTable',

  components: {
    BaseTable,
    TableToolbar,
    StatusTag,
    ActionButtons
  },

  props: {
    data: {
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
      tableColumns: TABLE_COLUMNS,
      statusConfig: STATUS_CONFIG,
      taskTypeConfig: TASK_TYPE_CONFIG,
      copyTooltip: '点击复制任务编码',
      toolbarButtons: [
        {
          label: '创建任务',
          icon: 'el-icon-plus',
          type: 'primary',
          id: 'create'
        },
        {
          label: '日历视图',
          icon: 'el-icon-date',
          type: 'default',
          id: 'calendar'
        }
      ]
    }
  },

  methods: {
    // 格式化日期时间
    formatDateTime(dateTime) {
      if (!dateTime) return '-'
      return parseTime(dateTime, '{y}-{m}-{d} {h}:{i}')
    },

    // 判断任务是否逾期
    isOverdue(row) {
      if (!row.plannedStartTime) return false
      const now = new Date()
      const plannedTime = new Date(row.plannedStartTime)
      return (
        plannedTime < now &&
        (row.status === '待执行' || row.status === '执行中')
      )
    },

    // 获取行样式类名
    getRowClassName({ row }) {
      if (this.isOverdue(row)) {
        return 'task-table__row--overdue'
      }
      return ''
    },

    // 复制任务编码
    handleCopyTaskCode(taskCode) {
      if (!taskCode) return

      const input = document.createElement('input')
      input.value = taskCode
      document.body.appendChild(input)
      input.select()

      try {
        document.execCommand('copy')
        this.$message.success('任务编码已复制到剪贴板')
      } catch (err) {
        this.$message.error('复制失败，请手动复制')
      }

      document.body.removeChild(input)
    },

    // 获取操作按钮
    getActionButtons(row) {
      const buttons = [
        {
          label: '查看',
          type: 'primary',
          onClick: () => this.handleView(row)
        }
      ]

      // 根据状态显示不同操作
      if (row.status === '待执行') {
        buttons.push({
          label: '派工',
          type: 'warning',
          onClick: () => this.handleAssign(row)
        })
      }

      // 待执行、执行中、已延期状态可以取消
      if (['待执行', '执行中', '已延期'].includes(row.status)) {
        buttons.push({
          label: '取消',
          type: 'danger',
          onClick: () => this.handleCancel(row)
        })
      }

      return buttons
    },

    // 工具栏按钮点击
    handleToolbarAction(button) {
      const actionMap = {
        create: this.handleCreate,
        calendar: this.handleViewCalendar
      }

      const action = actionMap[button.id]
      if (action) {
        action()
      }
    },

    // 工具栏刷新
    handleToolbarRefresh() {
      this.$emit('refresh')
    },

    // 创建任务
    handleCreate() {
      this.$emit('create')
    },

    // 查看日历视图
    handleViewCalendar() {
      this.$router.push('/equipment-tpm/maintenance-tasks/calendar')
    },

    // 查看详情
    handleView(row) {
      this.$emit('view', row)
    },

    // 派工
    handleAssign(row) {
      this.$emit('assign', row)
    },

    // 取消任务
    handleCancel(row) {
      this.$emit('cancel', row)
    },

    // 分页改变
    handlePaginationChange({ page, limit }) {
      this.$emit('pagination-change', { page, limit })
    },

    // 排序改变
    handleSortChange(sortData) {
      this.$emit('sort-change', sortData)
    }
  }
}
</script>

<style lang="scss" scoped>
.task-table {
  &__toolbar {
    margin-bottom: 16px;
  }

  &__code {
    cursor: pointer;
    color: #409eff;
    transition: color 0.2s;

    &:hover {
      color: #66b1ff;
    }

    i {
      margin-left: 4px;
      font-size: 12px;
    }
  }

  &__equipment {
    line-height: 1.5;
  }

  &__equipment-code {
    font-weight: 500;
    color: #303133;
  }

  &__equipment-name {
    font-size: 12px;
    color: #909399;
    margin-top: 2px;
  }

  &__status {
    display: flex;
    align-items: center;
  }

  &__text-muted {
    color: #909399;
  }

  ::v-deep .task-table__row--overdue {
    background-color: #fef0f0;

    &:hover > td {
      background-color: #fde2e2 !important;
    }
  }
}
</style>

