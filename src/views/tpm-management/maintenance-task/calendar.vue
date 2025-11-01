<!--
  文件名称：calendar.vue
  文件描述：维护任务日历视图页面
  创建日期：2024-01-20
  修改记录：
    - 2024-01-20: 初始创建
    - 2024-01-20: 实现完整日历视图功能（P0阶段）
    - 2024-01-20: 重构以适配后端新接口（标准日历格式响应）
    - 2025-10-31: 重构使用全局组件，优化UI设计
    - 2025-10-31: 优化padding层级，添加返回按钮
-->
<template>
  <div class="task-calendar-container">
    <!-- 顶部操作栏 -->
    <div class="page-header">
      <el-button
        icon="el-icon-arrow-left"
        size="medium"
        @click="handleBack"
      >
        返回列表
      </el-button>
      <h2 class="page-title">任务日历视图</h2>
    </div>

    <!-- 搜索区域 -->
    <el-card class="search-card" shadow="never">
      <CalendarSearch
        v-model="filters"
        :loading="loading"
        :equipment-options="equipmentOptions"
        :personnel-options="personnelOptions"
        @search="handleSearch"
        @reset="handleReset"
        @refresh="handleRefresh"
      />
    </el-card>

    <!-- 日历区域 -->
    <el-card class="calendar-card" shadow="never">
      <div class="calendar-wrapper">
        <FullCalendar ref="fullCalendar" :options="calendarOptions" />
      </div>
    </el-card>

    <!-- 任务详情对话框 -->
    <el-dialog
      :visible.sync="detailDialogVisible"
      :title="selectedTask ? (selectedTask.taskTitle || selectedTask.title) : '任务详情'"
      width="800px"
      :close-on-click-modal="false"
    >
      <div v-if="selectedTask" class="task-detail">
        <!-- 逾期警告 -->
        <el-alert
          v-if="isOverdue(selectedTask)"
          type="error"
          title="任务已逾期"
          :description="getOverdueMessage(selectedTask)"
          :closable="false"
          show-icon
          class="task-detail__overdue-alert"
        />

        <el-descriptions :column="2" border>
          <el-descriptions-item label="任务编码">
            {{ selectedTask.taskCode || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="任务类型">
            <el-tag :type="getTaskTypeTagType(selectedTask.taskType)" size="small">
              {{ selectedTask.taskType }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="任务状态">
            <el-tag :type="getStatusTagType(selectedTask.status)" size="small">
              {{ selectedTask.status }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="设备信息">
            {{ selectedTask.equipment ? (selectedTask.equipment.name || '-') : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="计划开始时间">
            {{ formatDateTime(selectedTask.plannedStartTime || selectedTask.start) }}
          </el-descriptions-item>
          <el-descriptions-item label="计划结束时间">
            {{ formatDateTime(selectedTask.plannedEndTime || selectedTask.end) }}
          </el-descriptions-item>
          <el-descriptions-item label="执行人">
            {{ selectedTask.assignee ? selectedTask.assignee.name : '未分配' }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ formatDateTime(selectedTask.createdAt) || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="任务描述" :span="2">
            {{ selectedTask.taskDescription || '-' }}
          </el-descriptions-item>
          <el-descriptions-item v-if="selectedTask.remark" label="备注" :span="2">
            {{ selectedTask.remark }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleViewDetail">查看详情</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import FullCalendar from '@fullcalendar/vue'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import zhCnLocale from '@fullcalendar/core/locales/zh-cn'
import CalendarSearch from './components/CalendarSearch'
import { getCalendarTasks, getMaintenanceTaskById, getMaintenancePersonnel } from './api'
import { fetchEquipmentList } from '@/views/master-data/equipment-management/api/equipment-management'
import { parseTime } from '@/utils'
import { STATUS_TAG_TYPE_MAP, TASK_TYPE_TAG_TYPE_MAP } from './constants'

export default {
  name: 'MaintenanceTaskCalendar',
  components: {
    FullCalendar,
    CalendarSearch
  },
  data() {
    return {
      // 筛选条件
      filters: {
        equipmentId: '',
        assignedTo: ''
      },
      // 设备选项
      equipmentOptions: [],
      // 人员选项
      personnelOptions: [],
      // 任务详情对话框
      detailDialogVisible: false,
      selectedTask: null,
      // 日历配置
      calendarOptions: {
        plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
        initialView: 'dayGridMonth',
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
        },
        locale: zhCnLocale,
        firstDay: 1, // 周一作为一周的开始
        slotMinTime: '00:00:00',
        slotMaxTime: '24:00:00',
        height: 'auto',
        events: this.fetchEvents,
        eventClick: this.handleEventClick,
        eventTimeFormat: {
          hour: '2-digit',
          minute: '2-digit',
          meridiem: false,
          hour12: false
        },
        eventClassNames: this.getEventClassNames,
        eventContent: this.renderEventContent,
        datesSet: this.handleDatesSet,
        loading: this.handleLoading,
        // 显示周数
        weekNumbers: false,
        // 允许点击事件
        eventDisplay: 'block',
        displayEventTime: true,
        displayEventEnd: false
      },
      // 当前日期范围
      currentDateRange: {
        start: null,
        end: null
      },
      // 加载状态
      loading: false
    }
  },
  mounted() {
    this.loadEquipmentOptions()
    this.loadPersonnelOptions()
  },
  methods: {
    /**
     * 获取日历事件数据
     * 根据接口文档，后端已经返回标准日历格式数据
     */
    async fetchEvents(fetchInfo, successCallback, failureCallback) {
      try {
        this.loading = true

        const params = {
          startDate: fetchInfo.startStr,
          endDate: fetchInfo.endStr
        }

        // 添加筛选条件
        if (this.filters.equipmentId) {
          params.equipmentId = this.filters.equipmentId
        }
        if (this.filters.assignedTo) {
          params.assignedTo = this.filters.assignedTo
        }

        const response = await getCalendarTasks(params)
        // 后端返回的数据已经是标准日历格式，只需要做简单的样式映射
        const events = this.transformToEvents(response.data || [])

        successCallback(events)
      } catch (error) {
        console.error('获取日历数据失败:', error)
        this.$message.error(error.message || '获取日历数据失败')
        failureCallback(error)
      } finally {
        this.loading = false
      }
    },

    /**
     * 转换任务数据为日历事件格式
     * 后端已返回标准日历格式（id, title, start, end, status, taskType, equipment, assignee）
     * 前端添加颜色配置和逾期判断
     */
    transformToEvents(tasks) {
      if (!Array.isArray(tasks)) {
        return []
      }

      return tasks.map(task => {
        // 判断任务是否逾期
        const isOverdue = this.isOverdue(task)

        return {
          // 后端已经提供的标准字段
          id: task.id,
          title: this.getEventTitle(task),
          start: task.start,
          end: task.end,
          // 扩展属性，用于事件点击和详情展示
          extendedProps: {
            task: task,
            status: task.status,
            taskType: task.taskType,
            equipment: task.equipment,
            assignee: task.assignee,
            isOverdue: isOverdue
          },
          // 根据逾期状态和任务状态设置颜色
          backgroundColor: isOverdue ? '#C45656' : this.getEventColor(task.status),
          borderColor: isOverdue ? '#A03C3C' : this.getEventBorderColor(task.status),
          textColor: '#ffffff'
        }
      })
    },

    /**
     * 获取事件标题
     * 后端返回的 title 字段已经包含任务标题，但我们增强显示设备名称
     */
    getEventTitle(task) {
      const equipment = task.equipment ? task.equipment.name : '未知设备'
      const title = task.title || '维护任务'
      return `${equipment} - ${title}`
    },

    /**
     * 获取事件背景颜色（根据状态）
     * 颜色映射参考业务流程文档的前端展示建议
     * 参考：维护任务管理业务流程说明.md 第273-283行
     */
    getEventColor(status) {
      const colorMap = {
        '待执行': '#909399', // 灰色（default）
        '执行中': '#409EFF', // 蓝色（processing）
        '已完成': '#67C23A', // 绿色（success）
        '已延期': '#E6A23C', // 橙色（warning）
        '已取消': '#F56C6C' // 红色（error）- 已取消的任务已被后端过滤，理论上不会出现
      }
      return colorMap[status] || '#909399'
    },

    /**
     * 获取事件边框颜色
     */
    getEventBorderColor(status) {
      return this.getEventColor(status)
    },

    /**
     * 获取事件CSS类名
     */
    getEventClassNames(arg) {
      const status = arg.event.extendedProps.status
      return [`status-${status}`, 'calendar-event']
    },

    /**
     * 自定义事件渲染内容
     */
    renderEventContent(arg) {
      const timeText = arg.timeText
      const title = arg.event.title

      return {
        html: `
          <div class="fc-event-main-frame">
            <div class="fc-event-time">${timeText}</div>
            <div class="fc-event-title-container">
              <div class="fc-event-title">${title}</div>
            </div>
          </div>
        `
      }
    },

    /**
     * 处理事件点击
     * 点击日历事件时获取完整的任务详情
     */
    async handleEventClick(info) {
      try {
        const taskId = info.event.id
        // 调用详情接口获取完整的任务信息
        const response = await getMaintenanceTaskById(taskId)
        this.selectedTask = response.data
        this.detailDialogVisible = true
      } catch (error) {
        console.error('获取任务详情失败:', error)
        this.$message.error(error.message || '获取任务详情失败')
      }
    },

    /**
     * 处理日期范围变化
     */
    handleDatesSet(dateInfo) {
      this.currentDateRange = {
        start: dateInfo.startStr,
        end: dateInfo.endStr
      }
    },

    /**
     * 处理加载状态
     */
    handleLoading(isLoading) {
      this.loading = isLoading
    },

    /**
     * 处理搜索
     */
    handleSearch(filters) {
      this.filters = { ...filters }
      this.refreshCalendar()
    },

    /**
     * 处理重置
     */
    handleReset() {
      this.filters = {
        equipmentId: '',
        assignedTo: ''
      }
      this.refreshCalendar()
    },

    /**
     * 刷新日历
     */
    refreshCalendar() {
      if (this.$refs.fullCalendar) {
        const calendarApi = this.$refs.fullCalendar.getApi()
        calendarApi.refetchEvents()
      }
    },

    /**
     * 处理刷新按钮点击
     */
    handleRefresh() {
      this.refreshCalendar()
      this.$message.success('刷新成功')
    },

    /**
     * 加载设备选项
     * 使用与列表视图相同的格式：设备编码 - 设备名称
     */
    async loadEquipmentOptions() {
      try {
        const response = await fetchEquipmentList({
          page: 1,
          limit: 100,
          sortBy: 'equipmentCode:asc'
        })

        // 从 response.data 中获取结果并转换为下拉选项格式
        const { results } = response.data || {}
        this.equipmentOptions = (results || []).map(equipment => ({
          label: `${equipment.equipmentCode} - ${equipment.name}`,
          value: equipment.id
        }))
      } catch (error) {
        console.error('加载设备选项失败:', error)
        this.equipmentOptions = []
      }
    },

    /**
     * 加载维护人员选项
     * 使用与列表视图相同的格式：人员名称 (部门)
     */
    async loadPersonnelOptions() {
      try {
        const response = await getMaintenancePersonnel({
          limit: 100,
          sortBy: 'name:asc'
        })

        // 转换为下拉选项格式
        this.personnelOptions = (response.data || []).map(user => ({
          label: `${user.name} (${user.profile?.department?.name || '未分配部门'})`,
          value: user.id
        }))
      } catch (error) {
        console.error('加载维护人员选项失败:', error)
        this.personnelOptions = []
      }
    },

    /**
     * 判断任务是否逾期
     * 与列表视图保持一致的判断逻辑
     * @param {Object} task - 任务对象
     * @returns {Boolean} - 是否逾期
     */
    isOverdue(task) {
      // 防护性检查：确保 task 存在
      if (!task) return false

      // 支持两种数据结构：
      // 1. 日历事件数据：使用 task.start
      // 2. 详情数据：使用 task.plannedStartTime
      const startTime = task.start || task.plannedStartTime
      if (!startTime) return false

      const now = new Date()
      const plannedTime = new Date(startTime)
      return (
        plannedTime < now &&
        (task.status === '待执行' || task.status === '执行中')
      )
    },

    /**
     * 获取逾期消息
     * @param {Object} task - 任务对象
     * @returns {String} - 逾期消息
     */
    getOverdueMessage(task) {
      if (!task) return ''

      // 支持两种数据结构：日历事件数据（start）和详情数据（plannedStartTime）
      const startTime = task.start || task.plannedStartTime
      if (!startTime) return ''

      const now = new Date()
      const plannedTime = new Date(startTime)
      const diffMs = now - plannedTime

      // 转换为小时和天
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffDays = Math.floor(diffHours / 24)

      if (diffDays > 0) {
        return `该任务已逾期 ${diffDays} 天，请尽快处理`
      } else if (diffHours > 0) {
        return `该任务已逾期 ${diffHours} 小时，请尽快处理`
      } else {
        return '该任务已逾期，请尽快处理'
      }
    },

    /**
     * 返回列表页面
     */
    handleBack() {
      this.$router.push({
        path: '/equipment-tpm/maintenance-tasks'
      })
    },

    /**
     * 查看任务详情
     */
    handleViewDetail() {
      if (this.selectedTask && this.selectedTask.id) {
        this.$router.push({
          path: `/equipment-tpm/maintenance-tasks/${this.selectedTask.id}`
        })
      }
    },

    /**
     * 获取状态标签类型
     */
    getStatusTagType(status) {
      return STATUS_TAG_TYPE_MAP[status] || 'info'
    },

    /**
     * 获取任务类型标签类型
     */
    getTaskTypeTagType(taskType) {
      return TASK_TYPE_TAG_TYPE_MAP[taskType] || 'primary'
    },

    /**
     * 格式化日期时间
     */
    formatDateTime(dateTime) {
      return parseTime(dateTime, '{y}-{m}-{d} {h}:{i}')
    }
  }
}
</script>

<style lang="scss" scoped>
.task-calendar-container {
  padding: 20px;
  background: #f0f2f5;
  min-height: calc(100vh - 84px);

  // 顶部操作栏
  .page-header {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    gap: 16px;

    .page-title {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #303133;
    }
  }

  // 搜索卡片 - 简化padding，避免嵌套过多
  .search-card {
    margin-bottom: 16px;
    border-radius: 8px;
    border: none;

    ::v-deep .el-card__body {
      padding: 0; // 移除卡片内边距，让SearchForm组件自己控制
    }
  }

  // 日历卡片
  .calendar-card {
    border-radius: 8px;
    border: none;

    ::v-deep .el-card__body {
      padding: 20px;
    }

    .calendar-wrapper {
      min-height: 700px;
      background: #ffffff;
    }
  }

  // 任务详情
  .task-detail {
    // 逾期警告样式
    &__overdue-alert {
      margin-bottom: 20px;

      ::v-deep .el-alert__title {
        font-size: 16px;
        font-weight: 600;
      }

      ::v-deep .el-alert__description {
        font-size: 14px;
        margin-top: 8px;
      }
    }

    ::v-deep .el-descriptions {
      .el-descriptions-item__label {
        width: 140px;
        font-weight: 600;
        color: #606266;
        background: #f5f7fa;
      }

      .el-descriptions-item__content {
        color: #303133;
      }
    }
  }

  // 对话框底部
  .dialog-footer {
    text-align: right;
    padding-top: 20px;
    border-top: 1px solid #ebeef5;
  }
}

// FullCalendar 样式定制
::v-deep .fc {
  // 工具栏样式
  .fc-toolbar {
    margin-bottom: 24px;
    padding: 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(102, 126, 234, 0.15);

    .fc-toolbar-title {
      font-size: 22px;
      font-weight: 700;
      color: #ffffff;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .fc-button {
      background-color: rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 0.3);
      color: #ffffff;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);

      &:hover {
        background-color: rgba(255, 255, 255, 0.3);
        border-color: rgba(255, 255, 255, 0.4);
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
      }

      &:active,
      &.fc-button-active {
        background-color: rgba(255, 255, 255, 0.4);
        border-color: rgba(255, 255, 255, 0.5);
        transform: translateY(0);
      }

      &:disabled {
        background-color: rgba(255, 255, 255, 0.1);
        border-color: rgba(255, 255, 255, 0.15);
        cursor: not-allowed;
        opacity: 0.6;
      }
    }

    .fc-today-button {
      background-color: rgba(103, 194, 58, 0.9);
      border-color: rgba(103, 194, 58, 1);

      &:hover {
        background-color: rgba(133, 206, 97, 0.9);
        border-color: rgba(133, 206, 97, 1);
      }

      &:disabled {
        background-color: rgba(103, 194, 58, 0.4);
        border-color: rgba(103, 194, 58, 0.5);
      }
    }
  }

  // 表头样式
  .fc-col-header {
    background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);
    border-bottom: 2px solid #dee2e6;

    th {
      padding: 14px 0;
      font-weight: 700;
      font-size: 13px;
      color: #495057;
      border-color: #e9ecef;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  }

  // 日期单元格样式
  .fc-daygrid-day {
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background-color: #f8f9fa;
    }

    .fc-daygrid-day-number {
      padding: 10px;
      color: #495057;
      font-size: 14px;
      font-weight: 500;
    }

    &.fc-day-today {
      background-color: rgba(102, 126, 234, 0.05) !important;
      border: 2px solid #667eea;

      .fc-daygrid-day-number {
        color: #667eea;
        font-weight: 700;
        background: rgba(102, 126, 234, 0.1);
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    &.fc-day-other {
      .fc-daygrid-day-number {
        color: #adb5bd;
      }
    }
  }

  // 事件样式
  .fc-event {
    border-radius: 6px;
    padding: 4px 8px;
    margin: 2px 4px;
    cursor: pointer;
    font-size: 12px;
    line-height: 1.5;
    transition: all 0.3s ease;
    border: none;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

    &:hover {
      opacity: 0.95;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .fc-event-main-frame {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .fc-event-time {
      font-weight: 600;
      font-size: 11px;
      opacity: 0.9;
    }

    .fc-event-title {
      font-weight: 500;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1;
    }
  }

  // 逾期任务样式增强
  .fc-event[style*="rgb(196, 86, 86)"] {
    border: 2px solid #A03C3C;
    box-shadow: 0 2px 8px rgba(196, 86, 86, 0.4);
    animation: overdue-pulse 2s ease-in-out infinite;

    &:hover {
      box-shadow: 0 4px 16px rgba(196, 86, 86, 0.6);
      transform: translateY(-2px) scale(1.02);
    }

    .fc-event-title {
      font-weight: 600;
    }
  }

  // 逾期任务脉冲动画
  @keyframes overdue-pulse {
    0%, 100% {
      box-shadow: 0 2px 8px rgba(196, 86, 86, 0.4);
    }
    50% {
      box-shadow: 0 2px 12px rgba(196, 86, 86, 0.6);
    }
  }

  // 时间网格视图样式
  .fc-timegrid {
    .fc-timegrid-slot {
      height: 42px;
      border-color: #e9ecef;
    }

    .fc-timegrid-event {
      border-radius: 6px;
      padding: 6px 8px;
      border: none;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

      .fc-event-time {
        font-weight: 700;
      }

      .fc-event-title {
        font-weight: 500;
      }
    }
  }

  // 列表视图样式
  .fc-list {
    border-color: #e9ecef;
    border-radius: 8px;
    overflow: hidden;

    .fc-list-day {
      background: linear-gradient(90deg, #f8f9fa 0%, #e9ecef 100%);

      th {
        padding: 12px 16px;
        font-weight: 700;
        font-size: 14px;
        color: #495057;
      }
    }

    .fc-list-event {
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background-color: rgba(102, 126, 234, 0.05);
      }

      td {
        padding: 12px 16px;
        border-color: #e9ecef;
      }

      .fc-list-event-dot {
        border-width: 4px;
      }
    }
  }

  // 边框颜色
  td,
  th {
    border-color: #e9ecef;
  }

  // 滚动条样式
  .fc-scroller {
    &::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    &::-webkit-scrollbar-thumb {
      background: linear-gradient(180deg, #cbd5e0 0%, #a0aec0 100%);
      border-radius: 4px;

      &:hover {
        background: linear-gradient(180deg, #a0aec0 0%, #718096 100%);
      }
    }

    &::-webkit-scrollbar-track {
      background-color: #f7fafc;
      border-radius: 4px;
    }
  }

  // 更多链接样式
  .fc-daygrid-more-link {
    color: #667eea;
    font-size: 12px;
    font-weight: 600;
    padding: 2px 6px;
    border-radius: 4px;
    transition: all 0.2s ease;

    &:hover {
      color: #764ba2;
      background-color: rgba(102, 126, 234, 0.1);
      text-decoration: none;
    }
  }

  // Popover 样式
  .fc-more-popover {
    border-radius: 8px;
    box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.12);
    border: 1px solid #e9ecef;

    .fc-popover-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 12px 16px;
      font-weight: 700;
      color: #ffffff;
      border-radius: 8px 8px 0 0;
    }

    .fc-popover-body {
      padding: 12px;
    }
  }
}

// 对话框样式优化
::v-deep .el-dialog {
  border-radius: 8px;

  .el-dialog__header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 20px 24px;
    border-radius: 8px 8px 0 0;

    .el-dialog__title {
      color: #ffffff;
      font-size: 18px;
      font-weight: 700;
    }

    .el-dialog__headerbtn {
      .el-dialog__close {
        color: #ffffff;
        font-size: 20px;

        &:hover {
          color: rgba(255, 255, 255, 0.8);
        }
      }
    }
  }

  .el-dialog__body {
    padding: 24px;
  }

  .el-dialog__footer {
    padding: 16px 24px;
    border-top: 1px solid #e9ecef;
  }
}

</style>
