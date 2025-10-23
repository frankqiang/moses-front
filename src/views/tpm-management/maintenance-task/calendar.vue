<!--
  文件名称：calendar.vue
  文件描述：维护任务日历视图页面
  创建日期：2024-01-20
  修改记录：
    - 2024-01-20: 初始创建
    - 2024-01-20: 实现完整日历视图功能（P0阶段）
    - 2024-01-20: 重构以适配后端新接口（标准日历格式响应）
-->
<template>
  <div class="task-calendar-container">
    <!-- 筛选区域 -->
    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="filters" class="filter-form">
        <el-form-item label="设备">
          <el-select
            v-model="filters.equipmentId"
            placeholder="请选择设备"
            clearable
            filterable
            style="width: 200px"
            @change="handleFilterChange"
          >
            <el-option
              v-for="item in equipmentOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="执行人">
          <el-select
            v-model="filters.assignedTo"
            placeholder="请选择执行人"
            clearable
            filterable
            style="width: 200px"
            @change="handleFilterChange"
          >
            <el-option
              v-for="item in personnelOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" icon="el-icon-refresh" @click="handleRefresh">刷新</el-button>
        </el-form-item>
      </el-form>
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
import { getCalendarTasks, getMaintenanceTaskById, getMaintenancePersonnel } from './api'
import { fetchEquipmentList } from '@/views/master-data/equipment-management/api/equipment-management'
import { parseTime } from '@/utils'
import { STATUS_TAG_TYPE_MAP, TASK_TYPE_TAG_TYPE_MAP } from './constants'

export default {
  name: 'MaintenanceTaskCalendar',
  components: {
    FullCalendar
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
     * 前端只需要添加颜色配置
     */
    transformToEvents(tasks) {
      if (!Array.isArray(tasks)) {
        return []
      }

      return tasks.map(task => ({
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
          assignee: task.assignee
        },
        // 根据状态设置颜色
        backgroundColor: this.getEventColor(task.status),
        borderColor: this.getEventBorderColor(task.status),
        textColor: '#ffffff'
      }))
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
     * 处理筛选条件变化
     */
    handleFilterChange() {
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
     */
    async loadEquipmentOptions() {
      try {
        const response = await fetchEquipmentList({ limit: 1000 })
        this.equipmentOptions = response.data.results || []
      } catch (error) {
        console.error('加载设备列表失败:', error)
      }
    },

    /**
     * 加载人员选项
     */
    async loadPersonnelOptions() {
      try {
        const response = await getMaintenancePersonnel({ limit: 1000 })
        this.personnelOptions = response.data || []
      } catch (error) {
        console.error('加载人员列表失败:', error)
      }
    },

    /**
     * 查看任务详情
     */
    handleViewDetail() {
      if (this.selectedTask && this.selectedTask.id) {
        this.$router.push({
          path: `/tpm-management/maintenance-task/detail/${this.selectedTask.id}`
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

  .filter-card {
    margin-bottom: 20px;

    .filter-form {
      margin-bottom: 0;

      ::v-deep .el-form-item {
        margin-bottom: 0;
      }
    }
  }

  .calendar-card {
    .calendar-wrapper {
      min-height: 600px;
    }
  }

  .task-detail {
    ::v-deep .el-descriptions {
      .el-descriptions-item__label {
        width: 120px;
        font-weight: 500;
      }
    }
  }

  .dialog-footer {
    text-align: right;
  }
}

// FullCalendar 样式定制
::v-deep .fc {
  // 工具栏样式
  .fc-toolbar {
    margin-bottom: 20px;
    padding: 10px;
    background: #f5f7fa;
    border-radius: 4px;

    .fc-toolbar-title {
      font-size: 20px;
      font-weight: 600;
      color: #303133;
    }

    .fc-button {
      background-color: #409eff;
      border-color: #409eff;
      color: #ffffff;
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 14px;

      &:hover {
        background-color: #66b1ff;
        border-color: #66b1ff;
      }

      &:active,
      &.fc-button-active {
        background-color: #3a8ee6;
        border-color: #3a8ee6;
      }

      &:disabled {
        background-color: #a0cfff;
        border-color: #a0cfff;
        cursor: not-allowed;
      }
    }

    .fc-today-button {
      background-color: #67c23a;
      border-color: #67c23a;

      &:hover {
        background-color: #85ce61;
        border-color: #85ce61;
      }

      &:disabled {
        background-color: #b3e19d;
        border-color: #b3e19d;
      }
    }
  }

  // 表头样式
  .fc-col-header {
    background: #f5f7fa;

    th {
      padding: 12px 0;
      font-weight: 600;
      color: #606266;
      border-color: #ebeef5;
    }
  }

  // 日期单元格样式
  .fc-daygrid-day {
    cursor: pointer;

    &:hover {
      background-color: #f5f7fa;
    }

    .fc-daygrid-day-number {
      padding: 8px;
      color: #606266;
      font-size: 14px;
    }

    &.fc-day-today {
      background-color: #ecf5ff !important;

      .fc-daygrid-day-number {
        color: #409eff;
        font-weight: 600;
      }
    }

    &.fc-day-other {
      .fc-daygrid-day-number {
        color: #c0c4cc;
      }
    }
  }

  // 事件样式
  .fc-event {
    border-radius: 4px;
    padding: 2px 6px;
    margin: 2px 0;
    cursor: pointer;
    font-size: 12px;
    line-height: 1.4;
    transition: all 0.3s;

    &:hover {
      opacity: 0.9;
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }

    .fc-event-main-frame {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .fc-event-time {
      font-weight: 500;
      font-size: 11px;
    }

    .fc-event-title {
      font-weight: 400;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  // 时间网格视图样式
  .fc-timegrid {
    .fc-timegrid-slot {
      height: 40px;
    }

    .fc-timegrid-event {
      border-radius: 4px;
      padding: 4px 6px;

      .fc-event-time {
        font-weight: 600;
      }
    }
  }

  // 列表视图样式
  .fc-list {
    border-color: #ebeef5;

    .fc-list-day {
      background-color: #f5f7fa;

      th {
        padding: 10px;
        font-weight: 600;
        color: #303133;
      }
    }

    .fc-list-event {
      cursor: pointer;

      &:hover {
        background-color: #ecf5ff;
      }

      td {
        padding: 10px;
        border-color: #ebeef5;
      }
    }
  }

  // 边框颜色
  td,
  th {
    border-color: #ebeef5;
  }

  // 滚动条样式
  .fc-scroller {
    &::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: #dcdfe6;
      border-radius: 3px;

      &:hover {
        background-color: #c0c4cc;
      }
    }

    &::-webkit-scrollbar-track {
      background-color: #f5f7fa;
    }
  }

  // 更多链接样式
  .fc-daygrid-more-link {
    color: #409eff;
    font-size: 12px;

    &:hover {
      color: #66b1ff;
      text-decoration: underline;
    }
  }

  // Popover 样式
  .fc-more-popover {
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    border-color: #ebeef5;

    .fc-popover-header {
      background-color: #f5f7fa;
      padding: 10px;
      font-weight: 600;
      color: #303133;
    }

    .fc-popover-body {
      padding: 10px;
    }
  }
}
</style>
