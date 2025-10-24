<!--
  文件名称：StatisticsPage.vue
  文件描述：设备故障统计分析页面
  创建日期：2025-01-20
  修改记录：
    - 2025-01-20: 初始创建
-->

<template>
  <div class="statistics-page">
    <!-- 筛选条件区域 -->
    <el-card class="filter-card" shadow="never">
      <div class="filter-form">
        <el-form ref="filterForm" :model="filters" inline>
          <el-form-item label="时间范围">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="yyyy-MM-dd"
              :picker-options="pickerOptions"
              @change="handleDateChange"
            />
          </el-form-item>

          <el-form-item label="设备">
            <el-select
              v-model="filters.equipmentId"
              placeholder="请选择设备"
              clearable
              filterable
              style="width: 200px"
            >
              <el-option
                v-for="item in equipmentOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="故障等级">
            <el-select
              v-model="filters.failureLevel"
              placeholder="请选择故障等级"
              clearable
              style="width: 150px"
            >
              <el-option
                v-for="item in FAILURE_LEVEL_OPTIONS"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="故障类型">
            <el-select
              v-model="filters.failureType"
              placeholder="请选择故障类型"
              clearable
              style="width: 150px"
            >
              <el-option
                v-for="item in FAILURE_TYPE_OPTIONS"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" icon="el-icon-search" @click="handleQuery">查询</el-button>
            <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <!-- 统计数据卡片区域 -->
    <el-row :gutter="16" class="stats-cards">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-card-content">
            <div class="stat-icon total">
              <i class="el-icon-document" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.totalFailures || 0 }}</div>
              <div class="stat-label">故障总数</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-card-content">
            <div class="stat-icon repeat">
              <i class="el-icon-warning" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.repeatFailures || 0 }}</div>
              <div class="stat-label">重复故障数</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-card-content">
            <div class="stat-icon mttr">
              <i class="el-icon-time" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.averageMTTRHours ? statistics.averageMTTRHours.toFixed(2) : 0 }}</div>
              <div class="stat-label">平均MTTR(小时)</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-card-content">
            <div class="stat-icon pending">
              <i class="el-icon-bell" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ getPendingCount() }}</div>
              <div class="stat-label">待处理故障</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="16" class="charts-row">
      <!-- 按故障等级统计 -->
      <el-col :xs="24" :sm="24" :md="12">
        <el-card shadow="never" class="chart-card">
          <div slot="header" class="card-header">
            <span class="card-title">按故障等级统计</span>
          </div>
          <div v-loading="loading" class="chart-container">
            <div ref="levelChart" class="chart" />
          </div>
        </el-card>
      </el-col>

      <!-- 按故障类型统计 -->
      <el-col :xs="24" :sm="24" :md="12">
        <el-card shadow="never" class="chart-card">
          <div slot="header" class="card-header">
            <span class="card-title">按故障类型统计</span>
          </div>
          <div v-loading="loading" class="chart-container">
            <div ref="typeChart" class="chart" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 故障趋势图表 -->
    <el-card shadow="never" class="chart-card trend-card">
      <div slot="header" class="card-header">
        <span class="card-title">故障趋势分析</span>
        <div class="header-actions">
          <el-radio-group v-model="trendGranularity" size="small" @change="handleGranularityChange">
            <el-radio-button label="day">日</el-radio-button>
            <el-radio-button label="week">周</el-radio-button>
            <el-radio-button label="month">月</el-radio-button>
            <el-radio-button label="year">年</el-radio-button>
          </el-radio-group>
        </div>
      </div>
      <div v-loading="trendLoading" class="chart-container trend-container">
        <div ref="trendChart" class="chart trend-chart" />
      </div>
    </el-card>

    <!-- 按设备统计排行榜 -->
    <el-card shadow="never" class="ranking-card">
      <div slot="header" class="card-header">
        <span class="card-title">设备故障排行榜</span>
      </div>
      <div v-loading="loading" class="ranking-content">
        <el-empty v-if="!equipmentRanking || equipmentRanking.length === 0" description="暂无数据" />
        <el-table
          v-else
          :data="equipmentRanking"
          style="width: 100%"
          :default-sort="{prop: 'failureCount', order: 'descending'}"
        >
          <el-table-column type="index" label="排名" width="80" align="center" />
          <el-table-column prop="equipmentCode" label="设备编码" min-width="120" />
          <el-table-column prop="equipmentName" label="设备名称" min-width="150" />
          <el-table-column prop="failureCount" label="故障次数" width="120" align="center" sortable>
            <template slot-scope="{ row }">
              <el-tag type="danger">{{ row.failureCount }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="averageMTTR" label="平均MTTR(小时)" width="150" align="center" sortable>
            <template slot-scope="{ row }">
              <span>{{ row.averageMTTR ? row.averageMTTR.toFixed(2) : '-' }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <!-- 重复故障列表 -->
    <el-card shadow="never" class="repeat-failures-card">
      <div slot="header" class="card-header">
        <span class="card-title">重复故障列表</span>
      </div>
      <div v-loading="repeatLoading" class="repeat-content">
        <el-empty v-if="!repeatFailures || repeatFailures.length === 0" description="暂无重复故障" />
        <el-table
          v-else
          :data="repeatFailures"
          style="width: 100%"
        >
          <el-table-column prop="failureCode" label="故障编码" width="180">
            <template slot-scope="{ row }">
              <el-link type="primary" @click="handleViewDetail(row.failureId)">
                {{ row.failureCode }}
              </el-link>
            </template>
          </el-table-column>
          <el-table-column prop="equipmentInfo" label="设备信息" min-width="180">
            <template slot-scope="{ row }">
              <div>{{ row.equipment.equipmentCode }} - {{ row.equipment.equipmentName }}</div>
            </template>
          </el-table-column>
          <el-table-column prop="failureDescription" label="故障描述" min-width="200" show-overflow-tooltip />
          <el-table-column prop="failureLevel" label="故障等级" width="120" align="center">
            <template slot-scope="{ row }">
              <el-tag :type="FAILURE_LEVEL_CONFIG.typeMap[row.failureLevel]">
                {{ row.failureLevel }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="failureType" label="故障类型" width="100" align="center" />
          <el-table-column prop="failureTime" label="故障时间" width="180">
            <template slot-scope="{ row }">
              {{ formatDateTime(row.failureTime) }}
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          v-if="repeatFailures && repeatFailures.length > 0"
          :current-page.sync="repeatPagination.page"
          :page-size.sync="repeatPagination.limit"
          :total="repeatTotal"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          style="margin-top: 16px; text-align: right"
          @size-change="fetchRepeatFailures"
          @current-change="fetchRepeatFailures"
        />
      </div>
    </el-card>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import * as echarts from 'echarts'
import { getFailureStatistics, getFailureTrend, getRepeatFailures } from '@/api/mdm/tpm/equipmentFailure'
import { formatDateTime, formatMTTR } from '../utils'
import {
  FAILURE_LEVEL_OPTIONS,
  FAILURE_TYPE_OPTIONS,
  FAILURE_LEVEL_CONFIG
} from '../constants/equipment-fault'

export default {
  name: 'StatisticsPage',
  data() {
    return {
      // 常量
      FAILURE_LEVEL_OPTIONS,
      FAILURE_TYPE_OPTIONS,
      FAILURE_LEVEL_CONFIG,

      // 筛选条件
      filters: {
        equipmentId: null,
        failureLevel: null,
        failureType: null,
        startDate: null,
        endDate: null
      },
      dateRange: [],

      // 设备选项
      equipmentOptions: [],

      // 统计数据
      statistics: {
        totalFailures: 0,
        repeatFailures: 0,
        averageMTTRHours: 0,
        byLevel: {},
        byType: {},
        byStatus: {}
      },

      // 趋势数据
      trendData: [],
      trendGranularity: 'month',

      // 设备排行榜
      equipmentRanking: [],

      // 重复故障列表
      repeatFailures: [],
      repeatTotal: 0,
      repeatPagination: {
        page: 1,
        limit: 10
      },

      // 加载状态
      loading: false,
      trendLoading: false,
      repeatLoading: false,

      // 图表实例
      levelChart: null,
      typeChart: null,
      trendChart: null,

      // 日期选择器配置
      pickerOptions: {
        shortcuts: [
          {
            text: '最近一周',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
              picker.$emit('pick', [start, end])
            }
          }
        ]
      }
    }
  },
  mounted() {
    // 初始化日期范围（默认最近30天）
    this.initDateRange()
    // 加载设备选项
    this.loadEquipmentOptions()
    // 加载统计数据
    this.loadStatistics()
    // 加载趋势数据
    this.loadTrendData()
    // 加载重复故障列表
    this.fetchRepeatFailures()
    // 初始化图表
    this.initCharts()
    // 监听窗口大小变化
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    // 销毁图表实例
    if (this.levelChart) {
      this.levelChart.dispose()
    }
    if (this.typeChart) {
      this.typeChart.dispose()
    }
    if (this.trendChart) {
      this.trendChart.dispose()
    }
    // 移除事件监听
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    // 初始化日期范围
    initDateRange() {
      const end = dayjs().format('YYYY-MM-DD')
      const start = dayjs().subtract(30, 'day').format('YYYY-MM-DD')
      this.dateRange = [start, end]
      this.filters.startDate = start + 'T00:00:00.000Z'
      this.filters.endDate = end + 'T23:59:59.999Z'
    },

    // 加载设备选项
    async loadEquipmentOptions() {
      // TODO: 从设备管理API获取设备列表
      // 暂时使用模拟数据
      this.equipmentOptions = []
    },

    // 加载统计数据
    async loadStatistics() {
      this.loading = true
      try {
        const params = this.buildQueryParams()
        const response = await getFailureStatistics(params)
        this.statistics = response.data || {}

        // 提取设备排行榜数据（从byEquipment中提取前10名）
        if (this.statistics.byEquipment && Array.isArray(this.statistics.byEquipment)) {
          this.equipmentRanking = this.statistics.byEquipment
            .sort((a, b) => b.failureCount - a.failureCount)
            .slice(0, 10)
        }

        // 更新图表
        this.updateLevelChart()
        this.updateTypeChart()
      } catch (error) {
        console.error('加载统计数据失败:', error)
        this.$message.error(error.message || '加载统计数据失败')
      } finally {
        this.loading = false
      }
    },

    // 加载趋势数据
    async loadTrendData() {
      this.trendLoading = true
      try {
        const params = {
          ...this.buildQueryParams(),
          granularity: this.trendGranularity
        }
        const response = await getFailureTrend(params)
        this.trendData = (response.data && response.data.timeSeries) || []
        this.updateTrendChart()
      } catch (error) {
        console.error('加载趋势数据失败:', error)
        this.$message.error(error.message || '加载趋势数据失败')
      } finally {
        this.trendLoading = false
      }
    },

    // 加载重复故障列表
    async fetchRepeatFailures() {
      this.repeatLoading = true
      try {
        const params = {
          ...this.buildQueryParams(),
          page: this.repeatPagination.page,
          limit: this.repeatPagination.limit
        }
        const response = await getRepeatFailures(params)
        this.repeatFailures = (response.data && response.data.results) || []
        this.repeatTotal = (response.data && response.data.totalResults) || 0
      } catch (error) {
        console.error('加载重复故障列表失败:', error)
        this.$message.error(error.message || '加载重复故障列表失败')
      } finally {
        this.repeatLoading = false
      }
    },

    // 构建查询参数
    buildQueryParams() {
      const params = {}
      if (this.filters.startDate) {
        params.startDate = this.filters.startDate
      }
      if (this.filters.endDate) {
        params.endDate = this.filters.endDate
      }
      if (this.filters.equipmentId) {
        params.equipmentId = this.filters.equipmentId
      }
      if (this.filters.failureLevel) {
        params.failureLevel = this.filters.failureLevel
      }
      if (this.filters.failureType) {
        params.failureType = this.filters.failureType
      }
      return params
    },

    // 处理日期变化
    handleDateChange(value) {
      if (value && value.length === 2) {
        this.filters.startDate = value[0] + 'T00:00:00.000Z'
        this.filters.endDate = value[1] + 'T23:59:59.999Z'
      } else {
        this.filters.startDate = null
        this.filters.endDate = null
      }
    },

    // 处理查询
    handleQuery() {
      this.loadStatistics()
      this.loadTrendData()
      this.repeatPagination.page = 1
      this.fetchRepeatFailures()
    },

    // 处理重置
    handleReset() {
      this.filters = {
        equipmentId: null,
        failureLevel: null,
        failureType: null,
        startDate: null,
        endDate: null
      }
      this.initDateRange()
      this.handleQuery()
    },

    // 处理粒度变化
    handleGranularityChange() {
      this.loadTrendData()
    },

    // 获取待处理故障数量
    getPendingCount() {
      return (this.statistics.byStatus && this.statistics.byStatus['待处理']) || 0
    },

    // 初始化图表
    initCharts() {
      this.levelChart = echarts.init(this.$refs.levelChart)
      this.typeChart = echarts.init(this.$refs.typeChart)
      this.trendChart = echarts.init(this.$refs.trendChart)
    },

    // 更新故障等级图表
    updateLevelChart() {
      if (!this.levelChart) return

      const data = []
      const byLevel = this.statistics.byLevel || {}

      Object.keys(byLevel).forEach(level => {
        data.push({
          name: level,
          value: byLevel[level]
        })
      })

      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          right: '10%',
          top: 'center'
        },
        series: [
          {
            name: '故障等级',
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['40%', '50%'],
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
                fontSize: '20',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: data,
            color: ['#F56C6C', '#E6A23C', '#909399', '#67C23A']
          }
        ]
      }

      this.levelChart.setOption(option)
    },

    // 更新故障类型图表
    updateTypeChart() {
      if (!this.typeChart) return

      const data = []
      const byType = this.statistics.byType || {}

      Object.keys(byType).forEach(type => {
        data.push({
          name: type,
          value: byType[type]
        })
      })

      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          right: '10%',
          top: 'center'
        },
        series: [
          {
            name: '故障类型',
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['40%', '50%'],
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
                fontSize: '20',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: data,
            color: ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399']
          }
        ]
      }

      this.typeChart.setOption(option)
    },

    // 更新趋势图表
    updateTrendChart() {
      if (!this.trendChart) return

      const dates = []
      const totalData = []

      this.trendData.forEach(item => {
        dates.push(item.period)
        totalData.push(item.totalFailures)
      })

      const option = {
        tooltip: {
          trigger: 'axis'
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
          data: dates
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '故障总数',
            type: 'line',
            smooth: true,
            data: totalData,
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(64, 158, 255, 0.5)' },
                { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
              ])
            },
            itemStyle: {
              color: '#409EFF'
            }
          }
        ]
      }

      this.trendChart.setOption(option)
    },

    // 处理窗口大小变化
    handleResize() {
      if (this.levelChart) {
        this.levelChart.resize()
      }
      if (this.typeChart) {
        this.typeChart.resize()
      }
      if (this.trendChart) {
        this.trendChart.resize()
      }
    },

    // 查看故障详情
    handleViewDetail(failureId) {
      // 跳转到故障详情页面
      this.$router.push({
        name: 'EquipmentFaultDetail',
        params: { id: failureId }
      })
    },

    formatDateTime,
    formatMTTR
  }
}
</script>

<style lang="scss" scoped>
.statistics-page {
  padding: 16px;

  .filter-card {
    margin-bottom: 16px;

    .filter-form {
      ::v-deep .el-form-item {
        margin-bottom: 0;
      }
    }
  }

  .stats-cards {
    margin-bottom: 16px;

    .stat-card {
      margin-bottom: 16px;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .stat-card-content {
        display: flex;
        align-items: center;
        padding: 8px 0;

        .stat-icon {
          width: 64px;
          height: 64px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          margin-right: 16px;

          &.total {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #fff;
          }

          &.repeat {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: #fff;
          }

          &.mttr {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            color: #fff;
          }

          &.pending {
            background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
            color: #fff;
          }
        }

        .stat-info {
          flex: 1;

          .stat-value {
            font-size: 32px;
            font-weight: bold;
            color: #303133;
            line-height: 1.2;
          }

          .stat-label {
            font-size: 14px;
            color: #909399;
            margin-top: 4px;
          }
        }
      }
    }
  }

  .charts-row {
    margin-bottom: 16px;
  }

  .chart-card {
    margin-bottom: 16px;

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .card-title {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }

      .header-actions {
        display: flex;
        align-items: center;
      }
    }

    .chart-container {
      min-height: 300px;

      .chart {
        width: 100%;
        height: 300px;
      }
    }

    &.trend-card {
      .trend-container {
        min-height: 400px;

        .trend-chart {
          height: 400px;
        }
      }
    }
  }

  .ranking-card,
  .repeat-failures-card {
    margin-bottom: 16px;

    .card-header {
      .card-title {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }
    }

    .ranking-content,
    .repeat-content {
      min-height: 200px;
    }
  }
}
</style>

