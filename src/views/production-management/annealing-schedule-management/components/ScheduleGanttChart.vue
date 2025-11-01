<!--
  文件名称：ScheduleGanttChart.vue
  文件描述：排程甘特图可视化组件，展示排程方案的炉次分配和时间安排
  创建日期：2025-10-23
  修改记录：
    - 2025-10-23: 初始创建
    - 2025-10-28: 重构以适配后端接口更新，优先使用后端返回的 label 字段
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
          <!-- 维护计划功能暂未实现，需要集成TPM模块 -->
          <!-- <el-checkbox label="maintenance">维护计划</el-checkbox> -->
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
        v-if="!ganttData && !loading"
        class="empty-state"
      >
        <i class="el-icon-s-data" />
        <p>暂无甘特图数据</p>
      </div>
      <!-- 甘特图容器始终渲染，确保 ECharts 能正确计算尺寸 -->
      <div
        ref="ganttChart"
        class="gantt-chart"
        :style="{ visibility: ganttData ? 'visible' : 'hidden' }"
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
            {{ selectedTask.productCode || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="合金牌号">
            {{ selectedTask.alloyGrade || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="重量">
            {{ formatWeight(selectedTask.totalWeight) }} 吨
          </el-descriptions-item>
          <el-descriptions-item label="优先级">
            <el-tag :type="getPriorityTagType(selectedTask.priority)">
              {{ selectedTask.priorityLabel || getPriorityText(selectedTask.priority) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusTagType(selectedTask.status)">
              {{ selectedTask.statusLabel || getStatusText(selectedTask.status) }}
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
      </div>
    </el-drawer>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import { fetchScheduleGanttData } from '../api'

// 注册 dayjs 插件
dayjs.extend(weekOfYear)

export default {
  name: 'ScheduleGanttChart',

  props: {
    // 排程方案ID
    planId: {
      type: String,
      required: true
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
      visibleLayers: ['tasks', 'currentTime'], // 维护计划功能暂未实现
      taskDetailVisible: false,
      selectedTask: null,
      isFullscreen: false,
      // 存储系列数据供 renderItem 访问
      currentTaskSeriesData: [],
      currentMaintenanceSeriesData: [],
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
    // 使用 $nextTick 确保 DOM 完全渲染后再初始化
    this.$nextTick(() => {
      // 先初始化 ECharts 实例（DOM 现在始终存在）
      this.initGanttChart()
      // 然后加载数据
      this.loadGanttData()
    })
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
      // 确保 DOM 元素存在
      if (!this.$refs.ganttChart) {
        console.error('甘特图容器 DOM 元素不存在')
        return
      }

      try {
        this.chartInstance = echarts.init(this.$refs.ganttChart)
        window.addEventListener('resize', this.handleResize)
      } catch (error) {
        console.error('初始化甘特图失败:', error)
      }
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

    // 根据任务优先级获取边框颜色（后备方案）
    // 后端会在 priority='emergency' 或 'high' 时返回 borderColor
    // 此方法作为后备，处理后端未返回或其他优先级的情况
    getPriorityBorderColor(task) {
      // 冲突任务：红色边框
      if (task.hasConflict) {
        return '#F44336'
      }
      // 紧急任务：深红色边框（后端应该返回此值）
      if (task.priority === 'emergency') {
        return '#d32f2f'
      }
      // 高优先级：橙色边框（后端应该返回此值）
      if (task.priority === 'high') {
        return '#f57c00'
      }
      // normal/low 优先级：透明边框（无边框效果）
      return 'transparent'
    },

    // 根据任务优先级获取边框宽度（后备方案）
    // 后端会在 priority='emergency' 或 'high' 时返回 borderWidth
    // 此方法作为后备，处理后端未返回或其他优先级的情况
    getPriorityBorderWidth(task) {
      // 冲突任务：粗边框
      if (task.hasConflict) {
        return 3
      }
      // 紧急任务：粗边框（后端应该返回 3）
      if (task.priority === 'emergency') {
        return 3
      }
      // 高优先级：中等边框（后端应该返回 2）
      if (task.priority === 'high') {
        return 2
      }
      // normal/low 优先级：0 或 1（无边框效果）
      return 0
    },

    // 渲染甘特图
    renderGanttChart() {
      if (!this.ganttData || !this.chartInstance) {
        return
      }

      const { timeline } = this.ganttData

      // 🔍 调试：输出关键数据
      // 🔍 精简调试信息
      console.log('=== 甘特图渲染 ===')
      console.log('任务数:', this.ganttData.taskBlocks?.length || 0, '炉子数:', this.ganttData.furnaces?.length || 0)

      // 构建 Y 轴数据（炉子列表）
      // ✅ 优先使用后端返回的 statusLabel
      const yAxisData = this.filteredFurnaces.map(f => ({
        value: f.furnaceCode,
        textStyle: {
          color: this.getFurnaceStatusColor(f.status)
        },
        // 存储完整的炉子信息，供格式化器使用
        _furnace: f
      }))

      // 构建任务块系列数据
      const taskSeriesData = this.filteredTaskBlocks.map(task => {
        const furnaceIndex = this.filteredFurnaces.findIndex(f => f.furnaceCode === task.furnaceCode)

        // ✅ 确保 totalWeight 是数字类型（后端可能返回字符串）
        const weight = typeof task.totalWeight === 'string'
          ? parseFloat(task.totalWeight) || 0
          : (task.totalWeight || 0)

        return {
          name: task.taskCode,
          value: [
            furnaceIndex,
            new Date(task.startTime).getTime(),
            new Date(task.endTime).getTime(),
            weight
          ],
          itemStyle: {
            color: task.color,
            // ✅ 优先级边框设置：紧急任务深红色粗边框，高优先级橙色中等边框
            borderColor: task.borderColor || this.getPriorityBorderColor(task),
            borderWidth: task.borderWidth || this.getPriorityBorderWidth(task)
          },
          task: task
        }
      })

      // ✅ 存储系列数据供 renderItem 访问
      this.currentTaskSeriesData = taskSeriesData

      // 🔍 调试：检查任务样式和后端返回值
      console.log('=== 任务样式检查 ===')
      const colorStats = {}
      const priorityStats = {}
      const borderStats = { fromBackend: 0, fromFrontend: 0, noBorder: 0 }

      taskSeriesData.forEach((task, index) => {
        const color = task.itemStyle.color
        colorStats[color] = (colorStats[color] || 0) + 1
        priorityStats[task.task.priority] = (priorityStats[task.task.priority] || 0) + 1

        // 统计边框来源
        if (task.task.borderColor) {
          borderStats.fromBackend++
        } else if (task.task.priority === 'emergency' || task.task.priority === 'high') {
          borderStats.fromFrontend++
        } else {
          borderStats.noBorder++
        }

        if (index < 5) {
          console.log(`任务 ${index + 1}:`, {
            code: task.name,
            priority: task.task.priority,
            priorityLabel: task.task.priorityLabel,
            color: task.itemStyle.color,
            borderColor: task.itemStyle.borderColor,
            borderWidth: task.itemStyle.borderWidth,
            borderSource: task.task.borderColor ? '后端返回' : '前端计算',
            hasConflict: task.task.hasConflict,
            colorClass: task.task.colorClass
          })
        }
      })

      console.log('颜色统计:', colorStats)
      console.log('优先级统计:', priorityStats)
      console.log('边框数据来源:', {
        '后端返回': borderStats.fromBackend,
        '前端计算': borderStats.fromFrontend,
        '无边框': borderStats.noBorder,
        '总数': taskSeriesData.length
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

      // ✅ 存储维护计划系列数据供 renderItem 访问
      this.currentMaintenanceSeriesData = maintenanceSeriesData

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
            // ✅ 从组件实例获取任务数据
            if (params.seriesIndex === 0 && params.dataIndex != null) {
              const taskData = this.currentTaskSeriesData[params.dataIndex]
              if (taskData && taskData.task) {
                const tooltipContent = taskData.task.tooltipText || taskData.task.tooltip
                if (Array.isArray(tooltipContent)) {
                  return tooltipContent.join('<br/>')
                }
                return tooltipContent ? tooltipContent.replace(/\n/g, '<br/>') : ''
              }
            }
            // ✅ 维护计划数据
            if (params.seriesIndex === 1 && params.dataIndex != null) {
              const maintenanceData = this.currentMaintenanceSeriesData[params.dataIndex]
              if (maintenanceData && maintenanceData.block) {
                const block = maintenanceData.block
                return `${block.maintenanceType}<br/>开始: ${this.formatDateTime(block.startTime)}<br/>结束: ${this.formatDateTime(block.endTime)}<br/>${block.description}`
              }
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
              if (!furnace) return value
              // ✅ 优先显示 statusLabel（如果存在）
              const statusText = furnace.statusLabel ? `(${furnace.statusLabel})` : ''
              return `${furnace.furnaceCode}\n${furnace.furnaceName}${statusText}`
            }
          }
        },
        series: [
          {
            name: '任务块',
            type: 'custom',
            renderItem: (params, api) => this.renderTaskBlock(params, api), // ✅ 使用箭头函数确保 this 绑定
            encode: {
              x: [1, 2],
              y: 0
            },
            data: taskSeriesData,
            // ✅ 当前时间线标记（markLine必须在series内部）
            markLine: {
              silent: true,
              symbol: 'none',
              data: currentTimeLine
            }
          },
          {
            name: '维护计划',
            type: 'custom',
            renderItem: (params, api) => this.renderMaintenanceBlock(params, api), // ✅ 使用箭头函数确保 this 绑定
            encode: {
              x: [1, 2],
              y: 0
            },
            data: maintenanceSeriesData
          }
        ]
      }

      this.chartInstance.setOption(option, true)

      // 绑定点击事件
      this.chartInstance.off('click')
      this.chartInstance.on('click', this.handleTaskBlockClick)

      // 确保图表尺寸正确
      this.$nextTick(() => {
        if (this.chartInstance) {
          this.chartInstance.resize()
        }
      })
    },

    // 自定义渲染任务块
    renderTaskBlock(params, api) {
      // ✅ 数据检查
      if (!params || !params.coordSys || params.dataIndex == null) {
        return null
      }

      // ✅ 从组件实例获取数据
      const taskData = this.currentTaskSeriesData[params.dataIndex]
      if (!taskData || !taskData.task) {
        return null
      }

      try {
        const categoryIndex = api.value(0)
        const start = api.coord([api.value(1), categoryIndex])
        const end = api.coord([api.value(2), categoryIndex])

        // 检查坐标是否有效
        if (!start || !end || start.some(isNaN) || end.some(isNaN)) {
          return null
        }

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
          return null
        }

        // ✅ 使用从组件实例获取的任务数据和样式
        return {
          type: 'rect',
          transition: ['shape'],
          shape: rectShape,
          style: {
            fill: taskData.itemStyle.color,
            stroke: taskData.itemStyle.borderColor,
            lineWidth: taskData.itemStyle.borderWidth
          }
        }
      } catch (error) {
        return null
      }
    },

    // 自定义渲染维护计划块
    renderMaintenanceBlock(params, api) {
      // ✅ 数据检查
      if (!params || !params.coordSys || params.dataIndex == null) {
        return null
      }

      // ✅ 从组件实例获取维护计划数据
      const maintenanceData = this.currentMaintenanceSeriesData[params.dataIndex]
      if (!maintenanceData || !maintenanceData.block) {
        return null
      }

      try {
        const categoryIndex = api.value(0)
        const start = api.coord([api.value(1), categoryIndex])
        const end = api.coord([api.value(2), categoryIndex])

        if (!start || !end || start.some(isNaN) || end.some(isNaN)) {
          return null
        }

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
          return null
        }

        // ✅ 使用 itemStyle 中的样式数据
        return {
          type: 'rect',
          transition: ['shape'],
          shape: rectShape,
          style: {
            fill: maintenanceData.itemStyle.color,
            stroke: maintenanceData.itemStyle.borderColor || '#FFA726',
            lineWidth: maintenanceData.itemStyle.borderWidth || 2,
            lineDash: [5, 5] // 虚线效果
          }
        }
      } catch (error) {
        return null
      }
    },

    // 处理任务块点击
    handleTaskBlockClick(params) {
      // ✅ 从组件实例获取任务数据
      if (params.seriesIndex === 0 && params.dataIndex != null) {
        const taskData = this.currentTaskSeriesData[params.dataIndex]
        if (taskData && taskData.task) {
          this.selectedTask = taskData.task
          this.taskDetailVisible = true
        }
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

    // 格式化时间标签
    formatTimeLabel(timestamp, scale) {
      const date = dayjs(timestamp)
      switch (scale) {
        case 'hour':
          return date.format('MM-DD HH:mm')
        case 'day':
          return date.format('MM-DD')
        case 'week':
          // 显示年份和周数，避免跨年混淆
          return `${date.format('YYYY')}年第${date.week()}周`
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

    // 格式化重量（处理字符串类型）
    formatWeight(weight) {
      const numWeight = typeof weight === 'string' ? parseFloat(weight) : weight
      return (numWeight || 0).toFixed(2)
    },

    /**
     * 获取优先级文本（备用方案）
     * ✅ 优先使用后端返回的 priorityLabel 字段
     * 此方法仅在后端未返回 label 时作为备用
     * 注意：必须严格按照接口文档中的枚举值定义
     */
    getPriorityText(priority) {
      const map = {
        emergency: '紧急',
        high: '高',
        normal: '普通',
        low: '低'
      }
      return map[priority] || priority
    },

    /**
     * 获取优先级标签类型
     * 用于 el-tag 的 type 属性，控制颜色
     */
    getPriorityTagType(priority) {
      const map = {
        emergency: 'danger',
        high: 'warning',
        normal: '',
        low: 'info'
      }
      return map[priority] || ''
    },

    /**
     * 获取状态文本（备用方案）
     * ✅ 优先使用后端返回的 statusLabel 字段
     * 此方法仅在后端未返回 label 时作为备用
     */
    getStatusText(status) {
      const map = {
        'pending-schedule': '待排程',
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

    /**
     * 获取状态标签类型
     * 用于 el-tag 的 type 属性，控制颜色
     */
    getStatusTagType(status) {
      const map = {
        'pending-schedule': 'info',
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

    /**
     * 获取炉子状态颜色
     * ✅ 后端已返回 statusLabel，此方法用于控制 Y 轴炉子名称的颜色显示
     * 根据炉子状态返回对应的颜色值
     */
    getFurnaceStatusColor(status) {
      const map = {
        running: '#4CAF50', // 运行中 - 绿色
        idle: '#9E9E9E', // 空闲 - 灰色
        maintenance: '#FFC107', // 维护中 - 黄色
        fault: '#F44336', // 故障 - 红色
        enabled: '#4CAF50', // 启用 - 绿色（兼容后端返回值）
        disabled: '#9E9E9E' // 禁用 - 灰色（兼容后端返回值）
      }
      return map[status] || '#607D8B' // 默认蓝灰色
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
  }
}
</style>

