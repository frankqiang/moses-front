<!--
  文件名称：ScheduleGanttChart.vue
  文件描述：排程甘特图可视化组件，展示排程方案的炉次分配和时间安排
  创建日期：2025-10-23
  修改记录：
    - 2025-10-23: 初始创建
-->

<template>
  <div class="schedule-gantt-chart">
    <!-- 工具栏 -->
    <div class="gantt-toolbar">
      <!-- 时间范围筛选 -->
      <div class="toolbar-section">
        <span class="toolbar-label">时间范围：</span>
        <el-date-picker
          v-model="timeRange"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          value-format="yyyy-MM-dd HH:mm:ss"
          :picker-options="pickerOptions"
          size="small"
          @change="handleTimeRangeChange"
        />
      </div>

      <!-- 时间刻度切换 -->
      <div class="toolbar-section">
        <span class="toolbar-label">时间刻度：</span>
        <el-radio-group v-model="timeScale" size="small" @change="handleTimeScaleChange">
          <el-radio-button label="hour">小时</el-radio-button>
          <el-radio-button label="day">天</el-radio-button>
          <el-radio-button label="week">周</el-radio-button>
        </el-radio-group>
      </div>

      <!-- 炉子筛选 -->
      <div class="toolbar-section">
        <span class="toolbar-label">炉子筛选：</span>
        <el-select
          v-model="selectedFurnaces"
          multiple
          collapse-tags
          placeholder="全部炉子"
          size="small"
          style="width: 200px"
          @change="handleFurnaceFilterChange"
        >
          <el-option
            v-for="furnace in allFurnaces"
            :key="furnace.furnaceCode"
            :label="`${furnace.furnaceCode} - ${furnace.furnaceName}`"
            :value="furnace.furnaceCode"
          />
        </el-select>
      </div>

      <!-- 图层控制 -->
      <div class="toolbar-section">
        <el-checkbox-group v-model="visibleLayers" size="small" @change="handleLayerChange">
          <el-checkbox label="tasks">任务块</el-checkbox>
          <el-checkbox label="maintenance">维护计划</el-checkbox>
          <el-checkbox label="currentTime">当前时间线</el-checkbox>
        </el-checkbox-group>
      </div>

      <!-- 操作按钮 -->
      <div class="toolbar-section toolbar-actions">
        <el-button icon="el-icon-refresh" size="small" @click="refreshGanttData">刷新</el-button>
        <el-button icon="el-icon-download" size="small" @click="handleExport">导出</el-button>
        <el-button
          v-if="showFullscreenButton"
          :icon="isFullscreen ? 'el-icon-crop' : 'el-icon-full-screen'"
          size="small"
          @click="toggleFullscreen"
        >
          {{ isFullscreen ? '退出全屏' : '全屏' }}
        </el-button>
      </div>
    </div>

    <!-- 甘特图容器 -->
    <div
      ref="ganttContainer"
      v-loading="loading"
      class="gantt-container"
      :class="{ 'is-fullscreen': isFullscreen }"
      element-loading-text="加载甘特图数据中..."
    >
      <div
        v-if="!ganttData"
        class="empty-state"
      >
        <i class="el-icon-s-data" />
        <p>暂无甘特图数据</p>
      </div>
      <div
        v-else
        ref="ganttChart"
        class="gantt-chart"
      />
    </div>

    <!-- 任务详情侧边栏 -->
    <el-drawer
      :visible.sync="taskDetailVisible"
      title="任务详情"
      size="500px"
      :before-close="handleCloseTaskDetail"
    >
      <div v-if="selectedTask" class="task-detail-content">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="任务编号">
            {{ selectedTask.taskCode }}
          </el-descriptions-item>
          <el-descriptions-item label="炉号">
            {{ selectedTask.furnaceCode }}
          </el-descriptions-item>
          <el-descriptions-item label="产品编码">
            {{ selectedTask.task ? selectedTask.task.productCode : selectedTask.productCode || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="合金牌号">
            {{ selectedTask.task ? selectedTask.task.alloyGrade : selectedTask.alloyGrade || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="重量">
            {{ selectedTask.weight }} 吨
          </el-descriptions-item>
          <el-descriptions-item label="优先级">
            <el-tag :type="getPriorityTagType(selectedTask.priority)">
              {{ getPriorityText(selectedTask.priority) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusTagType(selectedTask.status)">
              {{ getStatusText(selectedTask.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="计划装炉时间">
            {{ formatDateTime(selectedTask.startTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="计划出炉时间">
            {{ formatDateTime(selectedTask.endTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="预计时长">
            {{ calculateDuration(selectedTask.startTime, selectedTask.endTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="是否混炉">
            <el-tag :type="selectedTask.isMixed ? 'warning' : 'info'">
              {{ selectedTask.isMixed ? '是' : '否' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="冲突状态">
            <el-tag :type="selectedTask.hasConflict ? 'danger' : 'success'">
              {{ selectedTask.hasConflict ? '存在冲突' : '无冲突' }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <!-- 手动调整按钮 -->
        <div v-if="canAdjust" class="task-actions">
          <el-button type="primary" @click="handleAdjustTask">
            手动调整
          </el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import dayjs from 'dayjs'
import { fetchScheduleGanttData } from '../api'

export default {
  name: 'ScheduleGanttChart',

  props: {
    // 排程方案ID
    planId: {
      type: String,
      required: true
    },
    // 是否可以调整任务
    canAdjust: {
      type: Boolean,
      default: false
    },
    // 是否显示全屏按钮
    showFullscreenButton: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      loading: false,
      ganttData: null,
      chartInstance: null,
      timeRange: [],
      timeScale: 'day',
      selectedFurnaces: [],
      allFurnaces: [],
      visibleLayers: ['tasks', 'maintenance', 'currentTime'],
      taskDetailVisible: false,
      selectedTask: null,
      isFullscreen: false,
      pickerOptions: {
        shortcuts: [{
          text: '今天',
          onClick(picker) {
            const start = dayjs().startOf('day').toDate()
            const end = dayjs().endOf('day').toDate()
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '本周',
          onClick(picker) {
            const start = dayjs().startOf('week').toDate()
            const end = dayjs().endOf('week').toDate()
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '本月',
          onClick(picker) {
            const start = dayjs().startOf('month').toDate()
            const end = dayjs().endOf('month').toDate()
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '全部',
          onClick(picker) {
            picker.$emit('pick', [])
          }
        }]
      }
    }
  },

  computed: {
    // 过滤后的任务块
    filteredTaskBlocks() {
      if (!this.ganttData || !this.ganttData.taskBlocks) {
        return []
      }
      let tasks = this.ganttData.taskBlocks

      // 炉子筛选
      if (this.selectedFurnaces.length > 0) {
        tasks = tasks.filter(task => this.selectedFurnaces.includes(task.furnaceCode))
      }

      // 图层筛选
      if (!this.visibleLayers.includes('tasks')) {
        return []
      }

      return tasks
    },

    // 过滤后的维护计划块
    filteredMaintenanceBlocks() {
      if (!this.ganttData || !this.ganttData.maintenanceBlocks) {
        return []
      }
      let blocks = this.ganttData.maintenanceBlocks

      // 炉子筛选
      if (this.selectedFurnaces.length > 0) {
        blocks = blocks.filter(block => this.selectedFurnaces.includes(block.furnaceCode))
      }

      // 图层筛选
      if (!this.visibleLayers.includes('maintenance')) {
        return []
      }

      return blocks
    },

    // 过滤后的炉子列表
    filteredFurnaces() {
      if (!this.ganttData || !this.ganttData.furnaces) {
        return []
      }

      if (this.selectedFurnaces.length > 0) {
        return this.ganttData.furnaces.filter(f => this.selectedFurnaces.includes(f.furnaceCode))
      }

      return this.ganttData.furnaces
    }
  },

  mounted() {
    this.initGanttChart()
    this.loadGanttData()
  },

  beforeDestroy() {
    if (this.chartInstance) {
      this.chartInstance.dispose()
    }
    window.removeEventListener('resize', this.handleResize)
  },

  methods: {
    // 初始化甘特图
    initGanttChart() {
      this.chartInstance = echarts.init(this.$refs.ganttChart)
      window.addEventListener('resize', this.handleResize)
    },

    // 加载甘特图数据
    async loadGanttData() {
      try {
        this.loading = true

        const params = {
          timeScale: this.timeScale
        }

        // 添加时间范围参数
        if (this.timeRange && this.timeRange.length === 2) {
          params.startTime = dayjs(this.timeRange[0]).toISOString()
          params.endTime = dayjs(this.timeRange[1]).toISOString()
        }

        const response = await fetchScheduleGanttData(this.planId, params)
        this.ganttData = response.data

        // 初始化炉子列表
        this.allFurnaces = this.ganttData.furnaces || []

        // 渲染甘特图
        this.renderGanttChart()
      } catch (error) {
        console.error('加载甘特图数据失败:', error)
        this.$message.error(error.message || '加载甘特图数据失败')
      } finally {
        this.loading = false
      }
    },

    // 渲染甘特图
    renderGanttChart() {
      if (!this.ganttData || !this.chartInstance) {
        return
      }

      const { timeline, furnaces } = this.ganttData

      // 构建 Y 轴数据（炉子列表）
      const yAxisData = this.filteredFurnaces.map(f => ({
        value: f.furnaceCode,
        textStyle: {
          color: this.getFurnaceStatusColor(f.status)
        }
      }))

      // 构建任务块系列数据
      const taskSeriesData = this.filteredTaskBlocks.map(task => {
        const furnaceIndex = this.filteredFurnaces.findIndex(f => f.furnaceCode === task.furnaceCode)
        return {
          name: task.taskCode,
          value: [
            furnaceIndex,
            new Date(task.startTime).getTime(),
            new Date(task.endTime).getTime(),
            task.weight
          ],
          itemStyle: {
            color: task.color
          },
          task: task
        }
      })

      // 构建维护计划系列数据
      const maintenanceSeriesData = this.filteredMaintenanceBlocks.map(block => {
        const furnaceIndex = this.filteredFurnaces.findIndex(f => f.furnaceCode === block.furnaceCode)
        return {
          name: `维护-${block.maintenanceType}`,
          value: [
            furnaceIndex,
            new Date(block.startTime).getTime(),
            new Date(block.endTime).getTime(),
            0
          ],
          itemStyle: {
            color: block.color,
            borderColor: '#FFA726',
            borderWidth: 2,
            borderType: 'dashed'
          },
          block: block
        }
      })

      // 当前时间线标记
      const currentTimeLine = this.visibleLayers.includes('currentTime')
        ? [{
          xAxis: new Date().getTime(),
          lineStyle: {
            color: '#F44336',
            type: 'dashed',
            width: 2
          },
          label: {
            show: true,
            formatter: '当前时间',
            color: '#F44336'
          }
        }]
        : []

      // ECharts 配置
      const option = {
        title: {
          text: '排程甘特图',
          left: 'center',
          textStyle: {
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        tooltip: {
          formatter: (params) => {
            if (params.data.task) {
              return params.data.task.tooltip.replace(/\n/g, '<br/>')
            }
            if (params.data.block) {
              const block = params.data.block
              return `${block.maintenanceType}<br/>开始: ${this.formatDateTime(block.startTime)}<br/>结束: ${this.formatDateTime(block.endTime)}<br/>${block.description}`
            }
            return ''
          }
        },
        dataZoom: [
          {
            type: 'slider',
            xAxisIndex: 0,
            filterMode: 'weakFilter',
            height: 20,
            bottom: 10,
            start: 0,
            end: 100,
            handleIcon: 'path://M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
            handleSize: '80%'
          },
          {
            type: 'inside',
            xAxisIndex: 0,
            filterMode: 'weakFilter',
            zoomOnMouseWheel: true,
            moveOnMouseMove: true
          }
        ],
        grid: {
          left: 150,
          right: 50,
          top: 80,
          bottom: 80
        },
        xAxis: {
          type: 'time',
          min: new Date(timeline.startTime).getTime(),
          max: new Date(timeline.endTime).getTime(),
          axisLabel: {
            formatter: (value) => {
              return this.formatTimeLabel(value, this.timeScale)
            },
            rotate: 45
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: '#E0E0E0'
            }
          }
        },
        yAxis: {
          type: 'category',
          data: yAxisData,
          axisLabel: {
            formatter: (value) => {
              const furnace = this.filteredFurnaces.find(f => f.furnaceCode === value)
              return furnace ? `${furnace.furnaceCode}\n${furnace.furnaceName}` : value
            }
          }
        },
        series: [
          {
            name: '任务块',
            type: 'custom',
            renderItem: this.renderTaskBlock,
            encode: {
              x: [1, 2],
              y: 0
            },
            data: taskSeriesData
          },
          {
            name: '维护计划',
            type: 'custom',
            renderItem: this.renderMaintenanceBlock,
            encode: {
              x: [1, 2],
              y: 0
            },
            data: maintenanceSeriesData
          }
        ],
        markLine: {
          silent: true,
          data: currentTimeLine
        }
      }

      this.chartInstance.setOption(option, true)

      // 绑定点击事件
      this.chartInstance.off('click')
      this.chartInstance.on('click', this.handleTaskBlockClick)
    },

    // 自定义渲染任务块
    renderTaskBlock(params, api) {
      const categoryIndex = api.value(0)
      const start = api.coord([api.value(1), categoryIndex])
      const end = api.coord([api.value(2), categoryIndex])
      const height = api.size([0, 1])[1] * 0.6
      const rectShape = echarts.graphic.clipRectByRect(
        {
          x: start[0],
          y: start[1] - height / 2,
          width: end[0] - start[0],
          height: height
        },
        {
          x: params.coordSys.x,
          y: params.coordSys.y,
          width: params.coordSys.width,
          height: params.coordSys.height
        }
      )

      if (!rectShape) {
        return
      }

      const task = params.data.task
      const hasConflict = task && task.hasConflict

      return {
        type: 'rect',
        transition: ['shape'],
        shape: rectShape,
        style: {
          ...api.style(),
          stroke: hasConflict ? '#F44336' : '#fff',
          lineWidth: hasConflict ? 3 : 1
        }
      }
    },

    // 自定义渲染维护计划块
    renderMaintenanceBlock(params, api) {
      const categoryIndex = api.value(0)
      const start = api.coord([api.value(1), categoryIndex])
      const end = api.coord([api.value(2), categoryIndex])
      const height = api.size([0, 1])[1] * 0.4
      const rectShape = echarts.graphic.clipRectByRect(
        {
          x: start[0],
          y: start[1] - height / 2,
          width: end[0] - start[0],
          height: height
        },
        {
          x: params.coordSys.x,
          y: params.coordSys.y,
          width: params.coordSys.width,
          height: params.coordSys.height
        }
      )

      if (!rectShape) {
        return
      }

      return {
        type: 'rect',
        transition: ['shape'],
        shape: rectShape,
        style: api.style()
      }
    },

    // 处理任务块点击
    handleTaskBlockClick(params) {
      if (params.data && params.data.task) {
        this.selectedTask = params.data.task
        this.taskDetailVisible = true
      }
    },

    // 时间范围变化
    handleTimeRangeChange(value) {
      this.loadGanttData()
    },

    // 时间刻度变化
    handleTimeScaleChange(value) {
      this.loadGanttData()
    },

    // 炉子筛选变化
    handleFurnaceFilterChange() {
      this.renderGanttChart()
    },

    // 图层变化
    handleLayerChange() {
      this.renderGanttChart()
    },

    // 刷新甘特图数据
    refreshGanttData() {
      this.loadGanttData()
    },

    // 导出甘特图
    handleExport() {
      if (!this.chartInstance) {
        return
      }

      const url = this.chartInstance.getDataURL({
        type: 'png',
        pixelRatio: 2,
        backgroundColor: '#fff'
      })

      const link = document.createElement('a')
      link.href = url
      link.download = `排程甘特图_${dayjs().format('YYYYMMDDHHmmss')}.png`
      link.click()
    },

    // 切换全屏
    toggleFullscreen() {
      this.isFullscreen = !this.isFullscreen
      this.$nextTick(() => {
        this.handleResize()
      })
    },

    // 窗口大小变化
    handleResize() {
      if (this.chartInstance) {
        this.chartInstance.resize()
      }
    },

    // 关闭任务详情
    handleCloseTaskDetail() {
      this.taskDetailVisible = false
      this.selectedTask = null
    },

    // 手动调整任务
    handleAdjustTask() {
      this.$emit('adjust-task', this.selectedTask)
    },

    // 格式化时间标签
    formatTimeLabel(timestamp, scale) {
      const date = dayjs(timestamp)
      switch (scale) {
        case 'hour':
          return date.format('MM-DD HH:mm')
        case 'day':
          return date.format('MM-DD')
        case 'week':
          return `第${date.week()}周`
        default:
          return date.format('MM-DD')
      }
    },

    // 格式化日期时间
    formatDateTime(datetime) {
      return dayjs(datetime).format('YYYY-MM-DD HH:mm:ss')
    },

    // 计算时长
    calculateDuration(startTime, endTime) {
      const start = dayjs(startTime)
      const end = dayjs(endTime)
      const hours = end.diff(start, 'hour')
      const minutes = end.diff(start, 'minute') % 60
      return `${hours}小时${minutes}分钟`
    },

    // 获取优先级文本
    // 注意：必须严格按照接口文档中的枚举值定义
    getPriorityText(priority) {
      const map = {
        emergency: '紧急',
        high: '高',
        normal: '普通',
        low: '低'
      }
      return map[priority] || priority
    },

    // 获取优先级标签类型
    // 注意：必须严格按照接口文档中的枚举值定义
    getPriorityTagType(priority) {
      const map = {
        emergency: 'danger',
        high: 'warning',
        normal: '',
        low: 'info'
      }
      return map[priority] || ''
    },

    // 获取状态文本
    getStatusText(status) {
      const map = {
        pending: '待排程',
        scheduled: '已排程',
        loading: '装炉中',
        heating: '加热中',
        annealing: '退火中',
        cooling: '冷却中',
        unloading: '出炉中',
        completed: '已完成',
        cancelled: '已取消'
      }
      return map[status] || status
    },

    // 获取状态标签类型
    getStatusTagType(status) {
      const map = {
        pending: 'info',
        scheduled: '',
        loading: 'warning',
        heating: 'warning',
        annealing: 'warning',
        cooling: 'warning',
        unloading: 'warning',
        completed: 'success',
        cancelled: 'danger'
      }
      return map[status] || ''
    },

    // 获取炉子状态颜色
    getFurnaceStatusColor(status) {
      const map = {
        running: '#4CAF50',
        idle: '#9E9E9E',
        maintenance: '#FFC107',
        fault: '#F44336'
      }
      return map[status] || '#000'
    }
  }
}
</script>

<style lang="scss" scoped>
.schedule-gantt-chart {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
  border-radius: 4px;
  overflow: hidden;

  .gantt-toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 16px;
    padding: 16px;
    background: #f5f7fa;
    border-bottom: 1px solid #e4e7ed;

    .toolbar-section {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .toolbar-label {
      font-size: 14px;
      color: #606266;
      white-space: nowrap;
    }

    .toolbar-actions {
      margin-left: auto;
    }
  }

  .gantt-container {
    flex: 1;
    position: relative;
    overflow: hidden;

    &.is-fullscreen {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 9999;
      background: #fff;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #909399;

      i {
        font-size: 64px;
        margin-bottom: 16px;
      }

      p {
        font-size: 14px;
      }
    }

    .gantt-chart {
      width: 100%;
      height: 100%;
      min-height: 500px;
    }
  }

  .task-detail-content {
    padding: 20px;

    .task-actions {
      margin-top: 20px;
      text-align: center;
    }
  }
}
</style>

