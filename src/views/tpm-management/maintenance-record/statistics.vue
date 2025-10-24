<!--
  文件名称：statistics.vue
  文件描述：维护记录统计分析页面
  创建日期：2025-01-20
  修改记录：
    - 2025-01-20: 初始创建，实现维护记录统计分析功能
-->
<template>
  <div class="app-container maintenance-statistics">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">维护记录统计分析</h2>
      <p class="page-description">通过多维度统计分析，掌握设备维护情况和趋势</p>
    </div>

    <!-- 筛选条件 -->
    <el-card class="filter-card" shadow="never">
      <el-form ref="filterForm" :model="filterParams" :inline="true" label-width="100px">
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
            :picker-options="pickerOptions"
            @change="handleDateRangeChange"
          />
        </el-form-item>

        <el-form-item label="设备筛选">
          <el-select
            v-model="filterParams.equipmentId"
            placeholder="全部设备"
            clearable
            filterable
            style="width: 200px"
            @change="handleFilterChange"
          >
            <el-option
              v-for="item in equipmentList"
              :key="item.id"
              :label="`${item.code} - ${item.name}`"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="维护类型">
          <el-select
            v-model="filterParams.maintenanceType"
            placeholder="全部类型"
            clearable
            style="width: 150px"
            @change="handleFilterChange"
          >
            <el-option
              v-for="item in maintenanceTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="统计维度">
          <el-select
            v-model="groupBy"
            placeholder="选择统计维度"
            style="width: 150px"
            @change="handleGroupByChange"
          >
            <el-option label="按维护类型" value="type" />
            <el-option label="按设备" value="equipment" />
            <el-option label="按时间趋势" value="trend" />
          </el-select>
        </el-form-item>

        <el-form-item label="趋势周期">
          <el-select
            v-model="trendPeriod"
            placeholder="选择周期"
            style="width: 120px"
            :disabled="groupBy !== 'trend'"
            @change="handleFilterChange"
          >
            <el-option label="按月" value="month" />
            <el-option label="按周" value="week" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" icon="el-icon-search" :loading="loading" @click="loadStatistics">查询</el-button>
          <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
          <el-button icon="el-icon-download" @click="handleExport">导出数据</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 关键指标卡片 -->
    <el-row :gutter="20" class="kpi-row">
      <el-col :xs="24" :sm="12" :md="6">
        <div class="kpi-card primary">
          <div class="kpi-icon">
            <i class="el-icon-document" />
          </div>
          <div class="kpi-content">
            <div class="kpi-label">总维护次数</div>
            <div class="kpi-value">{{ statisticsData.totalRecords || 0 }}</div>
            <div class="kpi-desc">{{ dateRangeText }}</div>
          </div>
        </div>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <div class="kpi-card success">
          <div class="kpi-icon">
            <i class="el-icon-time" />
          </div>
          <div class="kpi-content">
            <div class="kpi-label">总维护工时</div>
            <div class="kpi-value">{{ formatWorkHours(statisticsData.totalWorkHours) }}</div>
            <div class="kpi-desc">单位：小时</div>
          </div>
        </div>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <div class="kpi-card warning">
          <div class="kpi-icon">
            <i class="el-icon-warning-outline" />
          </div>
          <div class="kpi-content">
            <div class="kpi-label">发现问题记录</div>
            <div class="kpi-value">{{ statisticsData.recordsWithProblems || 0 }}</div>
            <div class="kpi-desc">
              占比：{{ problemPercentage }}
            </div>
          </div>
        </div>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <div class="kpi-card info">
          <div class="kpi-icon">
            <i class="el-icon-s-data" />
          </div>
          <div class="kpi-content">
            <div class="kpi-label">平均单次工时</div>
            <div class="kpi-value">{{ averageWorkHours }}</div>
            <div class="kpi-desc">{{ topMaintenanceEquipment }}</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 图表展示区域 -->
    <el-row :gutter="20" class="chart-row">
      <!-- 维护类型分布饼图 -->
      <el-col :xs="24" :md="8">
        <el-card shadow="never" class="chart-card">
          <div slot="header" class="card-header">
            <span class="card-title">维护类型分布</span>
            <el-tag size="small" type="info">饼图</el-tag>
          </div>
          <div ref="typeChart" class="chart-container" />
        </el-card>
      </el-col>

      <!-- 维护次数统计柱状图 -->
      <el-col :xs="24" :md="8">
        <el-card shadow="never" class="chart-card">
          <div slot="header" class="card-header">
            <span class="card-title">维护次数统计</span>
            <el-tag size="small" type="primary">柱状图</el-tag>
          </div>
          <div ref="countChart" class="chart-container" />
        </el-card>
      </el-col>

      <!-- 维护工时统计柱状图 -->
      <el-col :xs="24" :md="8">
        <el-card shadow="never" class="chart-card">
          <div slot="header" class="card-header">
            <span class="card-title">维护工时统计</span>
            <el-tag size="small" type="success">柱状图</el-tag>
          </div>
          <div ref="workHoursChart" class="chart-container" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 趋势分析图表 -->
    <el-row v-if="groupBy === 'trend'" :gutter="20" class="chart-row">
      <el-col :span="24">
        <el-card shadow="never" class="chart-card">
          <div slot="header" class="card-header">
            <span class="card-title">维护趋势分析</span>
            <el-tag size="small" type="warning">折线图</el-tag>
          </div>
          <div ref="trendChart" class="chart-container-large" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 同比环比分析 -->
    <el-row v-if="groupBy === 'trend'" :gutter="20" class="chart-row">
      <el-col :xs="24" :md="12">
        <el-card shadow="never" class="chart-card">
          <div slot="header" class="card-header">
            <span class="card-title">同比分析</span>
            <el-tag size="small" type="danger">对比</el-tag>
          </div>
          <div ref="yoyChart" class="chart-container" />
        </el-card>
      </el-col>

      <el-col :xs="24" :md="12">
        <el-card shadow="never" class="chart-card">
          <div slot="header" class="card-header">
            <span class="card-title">环比分析</span>
            <el-tag size="small" type="warning">对比</el-tag>
          </div>
          <div ref="momChart" class="chart-container" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 统计数据表格 -->
    <el-card shadow="never" class="table-card">
      <div slot="header" class="card-header">
        <span class="card-title">详细统计数据</span>
        <el-button size="small" type="text" icon="el-icon-download" @click="handleExport">导出表格</el-button>
      </div>

      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column
          v-if="groupBy === 'equipment'"
          prop="equipmentCode"
          label="设备编码"
          width="120"
          align="center"
        />
        <el-table-column
          v-if="groupBy === 'equipment'"
          prop="equipmentName"
          label="设备名称"
          min-width="150"
        />
        <el-table-column
          v-if="groupBy === 'type'"
          prop="maintenanceType"
          label="维护类型"
          width="120"
          align="center"
        >
          <template slot-scope="scope">
            <status-tag
              :value="scope.row.maintenanceType"
              :config="maintenanceTypeConfig"
            />
          </template>
        </el-table-column>
        <el-table-column
          v-if="groupBy === 'trend'"
          prop="period"
          label="时间周期"
          width="150"
          align="center"
        />
        <el-table-column
          prop="count"
          label="维护次数"
          width="120"
          align="center"
          sortable
        >
          <template slot-scope="scope">
            <span class="count-badge">{{ scope.row.count }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="totalWorkHours"
          label="总工时(小时)"
          width="150"
          align="center"
          sortable
        >
          <template slot-scope="scope">
            <span class="work-hours-text">{{ formatWorkHours(scope.row.totalWorkHours) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="averageWorkHours"
          label="平均工时(小时)"
          width="150"
          align="center"
          sortable
        >
          <template slot-scope="scope">
            <span class="work-hours-text">{{ formatWorkHours(scope.row.averageWorkHours) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          v-if="groupBy === 'trend'"
          prop="yoyGrowth"
          label="同比增长"
          width="120"
          align="center"
        >
          <template slot-scope="scope">
            <span :class="getGrowthClass(scope.row.yoyGrowth)">
              {{ formatGrowthRate(scope.row.yoyGrowth) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          v-if="groupBy === 'trend'"
          prop="momGrowth"
          label="环比增长"
          width="120"
          align="center"
        >
          <template slot-scope="scope">
            <span :class="getGrowthClass(scope.row.momGrowth)">
              {{ formatGrowthRate(scope.row.momGrowth) }}
            </span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import dayjs from 'dayjs'
import * as XLSX from 'xlsx'
import { getMaintenanceStatistics } from './api/maintenance-record'
import { MAINTENANCE_TYPE_OPTIONS, MAINTENANCE_TYPE_CONFIG } from './constants/maintenance-record'
import StatusTag from '@/components/StatusTag'

export default {
  name: 'MaintenanceStatistics',

  components: {
    StatusTag
  },

  data() {
    return {
      loading: false,
      // 筛选参数
      filterParams: {
        startDate: null,
        endDate: null,
        equipmentId: null,
        maintenanceType: null
      },
      dateRange: [],
      groupBy: 'type', // type, equipment, trend
      trendPeriod: 'month', // month, week
      // 统计数据
      statisticsData: {
        totalRecords: 0,
        totalWorkHours: 0,
        recordsWithProblems: 0,
        byType: {},
        byEquipment: [],
        dateRange: {}
      },
      // 图表实例
      charts: {
        typeChart: null,
        countChart: null,
        workHoursChart: null,
        trendChart: null,
        yoyChart: null,
        momChart: null
      },
      // 表格数据
      tableData: [],
      // 设备列表（模拟数据，实际应从后端获取）
      equipmentList: [],
      // 维护类型选项
      maintenanceTypeOptions: MAINTENANCE_TYPE_OPTIONS,
      maintenanceTypeConfig: MAINTENANCE_TYPE_CONFIG,
      // 日期选择器配置
      pickerOptions: {
        shortcuts: [
          {
            text: '本月',
            onClick(picker) {
              const start = dayjs().startOf('month').toDate()
              const end = dayjs().endOf('month').toDate()
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '上月',
            onClick(picker) {
              const start = dayjs().subtract(1, 'month').startOf('month').toDate()
              const end = dayjs().subtract(1, 'month').endOf('month').toDate()
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近3个月',
            onClick(picker) {
              const start = dayjs().subtract(3, 'month').startOf('month').toDate()
              const end = dayjs().endOf('month').toDate()
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '本年',
            onClick(picker) {
              const start = dayjs().startOf('year').toDate()
              const end = dayjs().endOf('year').toDate()
              picker.$emit('pick', [start, end])
            }
          }
        ]
      },
      // 趋势数据
      trendData: []
    }
  },

  computed: {
    // 时间范围文本
    dateRangeText() {
      if (!this.statisticsData.dateRange) return '全部时间'
      const { startDate, endDate } = this.statisticsData.dateRange
      if (!startDate && !endDate) return '全部时间'
      if (startDate && endDate) {
        return `${dayjs(startDate).format('YYYY-MM-DD')} 至 ${dayjs(endDate).format('YYYY-MM-DD')}`
      }
      if (startDate) return `自 ${dayjs(startDate).format('YYYY-MM-DD')}`
      if (endDate) return `至 ${dayjs(endDate).format('YYYY-MM-DD')}`
      return '全部时间'
    },

    // 问题记录占比
    problemPercentage() {
      const total = this.statisticsData.totalRecords
      const problems = this.statisticsData.recordsWithProblems
      if (!total) return '0%'
      return `${((problems / total) * 100).toFixed(1)}%`
    },

    // 平均单次工时
    averageWorkHours() {
      const total = this.statisticsData.totalRecords
      const hours = this.statisticsData.totalWorkHours
      if (!total) return '0小时'
      return `${(hours / total).toFixed(2)}小时`
    },

    // 维护最多的设备
    topMaintenanceEquipment() {
      const byEquipment = this.statisticsData.byEquipment || []
      if (!byEquipment.length) return '暂无数据'
      const top = byEquipment.reduce((max, item) =>
        item.count > max.count ? item : max
      , byEquipment[0])
      return `${top.equipmentName || '未知'}(${top.count}次)`
    }
  },

  mounted() {
    // 初始化默认时间范围为本月
    this.initDefaultDateRange()
    // 加载设备列表
    this.loadEquipmentList()
    // 加载统计数据
    this.loadStatistics()
    // 监听窗口大小变化
    window.addEventListener('resize', this.handleResize)
  },

  beforeDestroy() {
    // 销毁图表实例
    Object.values(this.charts).forEach(chart => {
      if (chart) chart.dispose()
    })
    // 移除事件监听
    window.removeEventListener('resize', this.handleResize)
  },

  methods: {
    // 初始化默认时间范围
    initDefaultDateRange() {
      const start = dayjs().startOf('month').format('YYYY-MM-DD')
      const end = dayjs().endOf('month').format('YYYY-MM-DD')
      this.dateRange = [start, end]
      this.filterParams.startDate = `${start}T00:00:00.000Z`
      this.filterParams.endDate = `${end}T23:59:59.999Z`
    },

    // 加载设备列表
    async loadEquipmentList() {
      // TODO: 从后端获取设备列表
      // 这里使用模拟数据
      this.equipmentList = [
        { id: '1', code: 'AF001', name: '退火炉1号' },
        { id: '2', code: 'AF002', name: '退火炉2号' },
        { id: '3', code: 'CR001', name: '行车1号' }
      ]
    },

    // 加载统计数据
    async loadStatistics() {
      this.loading = true
      try {
        const params = {
          ...this.filterParams
        }
        // 移除空值
        Object.keys(params).forEach(key => {
          if (!params[key]) delete params[key]
        })

        const response = await getMaintenanceStatistics(params)
        this.statisticsData = response.data

        // 根据分组方式处理表格数据
        this.processTableData()

        // 如果是趋势分析，加载趋势数据
        if (this.groupBy === 'trend') {
          await this.loadTrendData()
        }

        // 渲染图表
        this.$nextTick(() => {
          this.renderCharts()
        })
      } catch (error) {
        console.error('加载统计数据失败:', error)
        this.$message.error(error.message || '加载统计数据失败')
      } finally {
        this.loading = false
      }
    },

    // 处理表格数据
    processTableData() {
      if (this.groupBy === 'type') {
        // 按维护类型分组
        const byType = this.statisticsData.byType || {}
        this.tableData = Object.keys(byType).map(type => {
          const count = byType[type]
          // 从 byEquipment 中计算该类型的总工时
          const totalWorkHours = this.calculateTypeWorkHours(type)
          return {
            maintenanceType: type,
            count: count,
            totalWorkHours: totalWorkHours,
            averageWorkHours: count > 0 ? totalWorkHours / count : 0
          }
        })
      } else if (this.groupBy === 'equipment') {
        // 按设备分组
        this.tableData = (this.statisticsData.byEquipment || []).map(item => ({
          equipmentCode: item.equipmentCode,
          equipmentName: item.equipmentName,
          count: item.count,
          totalWorkHours: item.totalWorkHours,
          averageWorkHours: item.count > 0 ? item.totalWorkHours / item.count : 0
        }))
      } else if (this.groupBy === 'trend') {
        // 趋势数据将在 loadTrendData 中处理
        this.tableData = this.trendData
      }
    },

    // 计算某个类型的总工时
    calculateTypeWorkHours(type) {
      // 这里需要从原始数据中计算，暂时返回估算值
      const totalRecords = this.statisticsData.totalRecords || 1
      const typeCount = this.statisticsData.byType[type] || 0
      const ratio = typeCount / totalRecords
      return (this.statisticsData.totalWorkHours || 0) * ratio
    },

    // 加载趋势数据
    async loadTrendData() {
      // 模拟生成趋势数据
      const { startDate, endDate } = this.filterParams
      if (!startDate || !endDate) {
        this.trendData = []
        return
      }

      const start = dayjs(startDate)
      const end = dayjs(endDate)
      const periods = []

      if (this.trendPeriod === 'month') {
        let current = start.startOf('month')
        while (current.isBefore(end) || current.isSame(end, 'month')) {
          periods.push({
            period: current.format('YYYY-MM'),
            label: current.format('YYYY年MM月'),
            start: current.startOf('month').format('YYYY-MM-DD'),
            end: current.endOf('month').format('YYYY-MM-DD')
          })
          current = current.add(1, 'month')
        }
      } else {
        let current = start.startOf('week')
        while (current.isBefore(end) || current.isSame(end, 'week')) {
          periods.push({
            period: current.format('YYYY-WW'),
            label: `${current.format('YYYY年')}第${current.week()}周`,
            start: current.startOf('week').format('YYYY-MM-DD'),
            end: current.endOf('week').format('YYYY-MM-DD')
          })
          current = current.add(1, 'week')
        }
      }

      // 为每个周期生成模拟数据
      this.trendData = periods.map((p, index) => {
        const baseCount = Math.floor(Math.random() * 20) + 10
        const baseHours = baseCount * (Math.random() * 3 + 2)
        const yoyGrowth = index > 0 ? (Math.random() - 0.5) * 0.3 : 0
        const momGrowth = index > 0 ? (Math.random() - 0.5) * 0.2 : 0

        return {
          period: p.label,
          periodKey: p.period,
          count: baseCount,
          totalWorkHours: parseFloat(baseHours.toFixed(2)),
          averageWorkHours: parseFloat((baseHours / baseCount).toFixed(2)),
          yoyGrowth: parseFloat((yoyGrowth * 100).toFixed(1)),
          momGrowth: parseFloat((momGrowth * 100).toFixed(1))
        }
      })
    },

    // 渲染图表
    renderCharts() {
      this.renderTypeChart()
      this.renderCountChart()
      this.renderWorkHoursChart()
      if (this.groupBy === 'trend') {
        this.renderTrendChart()
        this.renderYoyChart()
        this.renderMomChart()
      }
    },

    // 渲染维护类型饼图
    renderTypeChart() {
      if (this.charts.typeChart) {
        this.charts.typeChart.dispose()
      }

      const chartDom = this.$refs.typeChart
      if (!chartDom) return

      this.charts.typeChart = echarts.init(chartDom)

      const byType = this.statisticsData.byType || {}
      const data = Object.keys(byType).map(key => ({
        name: key,
        value: byType[key]
      }))

      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c}次 ({d}%)'
        },
        legend: {
          orient: 'vertical',
          right: 10,
          top: 'center',
          data: data.map(item => item.name)
        },
        series: [
          {
            name: '维护类型',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 20,
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: data
          }
        ]
      }

      this.charts.typeChart.setOption(option)
    },

    // 渲染维护次数柱状图
    renderCountChart() {
      if (this.charts.countChart) {
        this.charts.countChart.dispose()
      }

      const chartDom = this.$refs.countChart
      if (!chartDom) return

      this.charts.countChart = echarts.init(chartDom)

      let xAxisData = []
      let seriesData = []

      if (this.groupBy === 'type') {
        const byType = this.statisticsData.byType || {}
        xAxisData = Object.keys(byType)
        seriesData = Object.values(byType)
      } else if (this.groupBy === 'equipment') {
        const byEquipment = this.statisticsData.byEquipment || []
        xAxisData = byEquipment.map(item => item.equipmentName || '未知')
        seriesData = byEquipment.map(item => item.count)
      }

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: xAxisData,
          axisLabel: {
            rotate: 30,
            interval: 0
          }
        },
        yAxis: {
          type: 'value',
          name: '次数'
        },
        series: [
          {
            name: '维护次数',
            type: 'bar',
            data: seriesData,
            itemStyle: {
              color: '#409EFF'
            },
            barWidth: '60%'
          }
        ]
      }

      this.charts.countChart.setOption(option)
    },

    // 渲染维护工时柱状图
    renderWorkHoursChart() {
      if (this.charts.workHoursChart) {
        this.charts.workHoursChart.dispose()
      }

      const chartDom = this.$refs.workHoursChart
      if (!chartDom) return

      this.charts.workHoursChart = echarts.init(chartDom)

      let xAxisData = []
      let seriesData = []

      if (this.groupBy === 'type') {
        const byType = this.statisticsData.byType || {}
        xAxisData = Object.keys(byType)
        seriesData = Object.keys(byType).map(type => this.calculateTypeWorkHours(type))
      } else if (this.groupBy === 'equipment') {
        const byEquipment = this.statisticsData.byEquipment || []
        xAxisData = byEquipment.map(item => item.equipmentName || '未知')
        seriesData = byEquipment.map(item => item.totalWorkHours)
      }

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: '{b}: {c}小时'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: xAxisData,
          axisLabel: {
            rotate: 30,
            interval: 0
          }
        },
        yAxis: {
          type: 'value',
          name: '工时(小时)'
        },
        series: [
          {
            name: '维护工时',
            type: 'bar',
            data: seriesData,
            itemStyle: {
              color: '#67C23A'
            },
            barWidth: '60%'
          }
        ]
      }

      this.charts.workHoursChart.setOption(option)
    },

    // 渲染趋势折线图
    renderTrendChart() {
      if (this.charts.trendChart) {
        this.charts.trendChart.dispose()
      }

      const chartDom = this.$refs.trendChart
      if (!chartDom) return

      this.charts.trendChart = echarts.init(chartDom)

      const xAxisData = this.trendData.map(item => item.period)
      const countData = this.trendData.map(item => item.count)
      const hoursData = this.trendData.map(item => item.totalWorkHours)

      const option = {
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['维护次数', '维护工时']
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: xAxisData
        },
        yAxis: [
          {
            type: 'value',
            name: '维护次数',
            position: 'left'
          },
          {
            type: 'value',
            name: '维护工时(小时)',
            position: 'right'
          }
        ],
        series: [
          {
            name: '维护次数',
            type: 'line',
            data: countData,
            smooth: true,
            itemStyle: {
              color: '#409EFF'
            }
          },
          {
            name: '维护工时',
            type: 'line',
            yAxisIndex: 1,
            data: hoursData,
            smooth: true,
            itemStyle: {
              color: '#67C23A'
            }
          }
        ]
      }

      this.charts.trendChart.setOption(option)
    },

    // 渲染同比分析图表
    renderYoyChart() {
      if (this.charts.yoyChart) {
        this.charts.yoyChart.dispose()
      }

      const chartDom = this.$refs.yoyChart
      if (!chartDom) return

      this.charts.yoyChart = echarts.init(chartDom)

      const xAxisData = this.trendData.map(item => item.period)
      const yoyData = this.trendData.map(item => item.yoyGrowth)

      const option = {
        tooltip: {
          trigger: 'axis',
          formatter: '{b}<br/>{a}: {c}%'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: xAxisData,
          axisLabel: {
            rotate: 30
          }
        },
        yAxis: {
          type: 'value',
          name: '增长率(%)',
          axisLabel: {
            formatter: '{value}%'
          }
        },
        series: [
          {
            name: '同比增长率',
            type: 'bar',
            data: yoyData,
            itemStyle: {
              color: (params) => {
                return params.value >= 0 ? '#67C23A' : '#F56C6C'
              }
            }
          }
        ]
      }

      this.charts.yoyChart.setOption(option)
    },

    // 渲染环比分析图表
    renderMomChart() {
      if (this.charts.momChart) {
        this.charts.momChart.dispose()
      }

      const chartDom = this.$refs.momChart
      if (!chartDom) return

      this.charts.momChart = echarts.init(chartDom)

      const xAxisData = this.trendData.map(item => item.period)
      const momData = this.trendData.map(item => item.momGrowth)

      const option = {
        tooltip: {
          trigger: 'axis',
          formatter: '{b}<br/>{a}: {c}%'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: xAxisData,
          axisLabel: {
            rotate: 30
          }
        },
        yAxis: {
          type: 'value',
          name: '增长率(%)',
          axisLabel: {
            formatter: '{value}%'
          }
        },
        series: [
          {
            name: '环比增长率',
            type: 'bar',
            data: momData,
            itemStyle: {
              color: (params) => {
                return params.value >= 0 ? '#67C23A' : '#F56C6C'
              }
            }
          }
        ]
      }

      this.charts.momChart.setOption(option)
    },

    // 处理日期范围变化
    handleDateRangeChange(value) {
      if (value && value.length === 2) {
        this.filterParams.startDate = `${value[0]}T00:00:00.000Z`
        this.filterParams.endDate = `${value[1]}T23:59:59.999Z`
      } else {
        this.filterParams.startDate = null
        this.filterParams.endDate = null
      }
    },

    // 处理筛选条件变化
    handleFilterChange() {
      // 不自动加载，等待用户点击查询按钮
    },

    // 处理分组方式变化
    handleGroupByChange() {
      this.loadStatistics()
    },

    // 处理重置
    handleReset() {
      this.filterParams = {
        startDate: null,
        endDate: null,
        equipmentId: null,
        maintenanceType: null
      }
      this.dateRange = []
      this.groupBy = 'type'
      this.trendPeriod = 'month'
      this.initDefaultDateRange()
      this.loadStatistics()
    },

    // 处理导出
    handleExport() {
      try {
        // 准备导出数据
        const exportData = this.tableData.map(item => {
          const row = {}
          if (this.groupBy === 'equipment') {
            row['设备编码'] = item.equipmentCode
            row['设备名称'] = item.equipmentName
          } else if (this.groupBy === 'type') {
            row['维护类型'] = item.maintenanceType
          } else if (this.groupBy === 'trend') {
            row['时间周期'] = item.period
          }
          row['维护次数'] = item.count
          row['总工时(小时)'] = item.totalWorkHours
          row['平均工时(小时)'] = item.averageWorkHours
          if (this.groupBy === 'trend') {
            row['同比增长(%)'] = item.yoyGrowth
            row['环比增长(%)'] = item.momGrowth
          }
          return row
        })

        // 创建工作簿
        const ws = XLSX.utils.json_to_sheet(exportData)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, '统计数据')

        // 生成文件名
        const fileName = `维护记录统计_${dayjs().format('YYYYMMDDHHmmss')}.xlsx`

        // 导出文件
        XLSX.writeFile(wb, fileName)

        this.$message.success('导出成功')
      } catch (error) {
        console.error('导出失败:', error)
        this.$message.error('导出失败，请重试')
      }
    },

    // 处理窗口大小变化
    handleResize() {
      Object.values(this.charts).forEach(chart => {
        if (chart) chart.resize()
      })
    },

    // 格式化工时
    formatWorkHours(hours) {
      if (!hours && hours !== 0) return '0小时'
      return `${parseFloat(hours).toFixed(2)}小时`
    },

    // 格式化增长率
    formatGrowthRate(rate) {
      if (!rate && rate !== 0) return '-'
      const sign = rate >= 0 ? '+' : ''
      return `${sign}${rate}%`
    },

    // 获取增长率样式类
    getGrowthClass(rate) {
      if (!rate && rate !== 0) return ''
      return rate >= 0 ? 'growth-positive' : 'growth-negative'
    }
  }
}
</script>

<style lang="scss" scoped>
.maintenance-statistics {
  padding: 20px;

  .page-header {
    margin-bottom: 20px;

    .page-title {
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 500;
      color: #303133;
    }

    .page-description {
      margin: 0;
      font-size: 14px;
      color: #909399;
    }
  }

  .filter-card {
    margin-bottom: 20px;

    ::v-deep .el-card__body {
      padding: 20px 20px 0;
    }
  }

  .kpi-row {
    margin-bottom: 20px;

    .kpi-card {
      display: flex;
      align-items: center;
      padding: 20px;
      border-radius: 8px;
      background: #fff;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
      transition: all 0.3s;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.1);
      }

      .kpi-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 60px;
        height: 60px;
        margin-right: 16px;
        border-radius: 8px;

        i {
          font-size: 28px;
          color: #fff;
        }
      }

      .kpi-content {
        flex: 1;

        .kpi-label {
          margin-bottom: 4px;
          font-size: 14px;
          color: #909399;
        }

        .kpi-value {
          margin-bottom: 4px;
          font-size: 28px;
          font-weight: 600;
          color: #303133;
        }

        .kpi-desc {
          font-size: 12px;
          color: #C0C4CC;
        }
      }

      &.primary .kpi-icon {
        background: linear-gradient(135deg, #409EFF 0%, #66B1FF 100%);
      }

      &.success .kpi-icon {
        background: linear-gradient(135deg, #67C23A 0%, #85CE61 100%);
      }

      &.warning .kpi-icon {
        background: linear-gradient(135deg, #E6A23C 0%, #EBB563 100%);
      }

      &.info .kpi-icon {
        background: linear-gradient(135deg, #909399 0%, #A6A9AD 100%);
      }
    }
  }

  .chart-row {
    margin-bottom: 20px;

    .chart-card {
      .card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .card-title {
          font-size: 16px;
          font-weight: 500;
          color: #303133;
        }
      }

      .chart-container {
        width: 100%;
        height: 300px;
      }

      .chart-container-large {
        width: 100%;
        height: 400px;
      }
    }
  }

  .table-card {
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .card-title {
        font-size: 16px;
        font-weight: 500;
        color: #303133;
      }
    }

    .count-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      background: #E1F3D8;
      color: #67C23A;
      font-weight: 500;
    }

    .work-hours-text {
      color: #409EFF;
      font-weight: 500;
    }

    .growth-positive {
      color: #67C23A;
      font-weight: 500;
    }

    .growth-negative {
      color: #F56C6C;
      font-weight: 500;
    }
  }
}
</style>

