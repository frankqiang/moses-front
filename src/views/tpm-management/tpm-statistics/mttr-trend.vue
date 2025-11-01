<!--
文件名称：mttr-trend.vue
文件描述：MTTR趋势分析页面
创建日期：2024-01-20
修改记录：
  - 2024-01-20: 初始创建
-->

<template>
  <div class="mttr-trend-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2 class="page-title">MTTR趋势分析</h2>
      <p class="page-description">分析设备平均修复时间变化趋势，评估维修效率和能力</p>
    </div>

    <!-- 查询条件区域 -->
    <el-card class="query-card" shadow="never">
      <el-form
        ref="queryForm"
        :model="queryParams"
        :rules="queryRules"
        label-width="100px"
        class="query-form"
      >
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="6">
            <el-form-item label="开始日期" prop="startDate">
              <el-date-picker
                v-model="queryParams.startDate"
                type="date"
                placeholder="请选择开始日期"
                value-format="yyyy-MM-dd"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12" :md="6">
            <el-form-item label="结束日期" prop="endDate">
              <el-date-picker
                v-model="queryParams.endDate"
                type="date"
                placeholder="请选择结束日期"
                value-format="yyyy-MM-dd"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12" :md="6">
            <el-form-item label="设备类型" prop="equipmentType">
              <el-select
                v-model="queryParams.equipmentType"
                placeholder="请选择设备类型"
                clearable
                style="width: 100%"
              >
                <el-option
                  v-for="item in equipmentTypes"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12" :md="6">
            <el-form-item label="时间粒度" prop="timePeriod">
              <el-select
                v-model="queryParams.timePeriod"
                placeholder="请选择时间粒度"
                style="width: 100%"
              >
                <el-option
                  v-for="item in timePeriods"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="24" class="query-actions">
            <el-button
              type="primary"
              icon="el-icon-search"
              :loading="loading"
              @click="handleQuery"
            >
              查询
            </el-button>
            <el-button icon="el-icon-refresh" @click="handleReset">
              重置
            </el-button>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- MTTR总体摘要 -->
    <el-card v-if="statisticsData.summary" class="summary-card" shadow="never">
      <div class="summary-header">
        <h3 class="summary-title">MTTR总体摘要</h3>
        <el-tag :type="getMttrHealthType(parseOverallMttr())" size="medium">
          当前粒度：{{ queryParams.timePeriod }}
        </el-tag>
      </div>

      <el-row :gutter="20" class="summary-content">
        <el-col :xs="24" :sm="8" :md="8">
          <div class="summary-item">
            <div class="summary-icon" style="background-color: #ecf5ff;">
              <i class="el-icon-warning" style="color: #409eff;" />
            </div>
            <div class="summary-info">
              <div class="summary-label">总故障数</div>
              <div class="summary-value">{{ statisticsData.summary.totalFailures }}</div>
            </div>
          </div>
        </el-col>

        <el-col :xs="24" :sm="8" :md="8">
          <div class="summary-item highlight">
            <div class="summary-icon" :style="{ backgroundColor: getMttrHealthColor(parseOverallMttr(), 0.1) }">
              <i class="el-icon-time" :style="{ color: getMttrHealthColor(parseOverallMttr()) }" />
            </div>
            <div class="summary-info">
              <div class="summary-label">总体平均MTTR</div>
              <div
                class="summary-value mttr-value"
                :style="{ color: getMttrHealthColor(parseOverallMttr()) }"
              >
                {{ statisticsData.summary.overallMTTR }}
              </div>
            </div>
          </div>
        </el-col>

        <el-col :xs="24" :sm="8" :md="8">
          <div class="summary-item">
            <div class="summary-icon" :style="{ backgroundColor: getMttrHealthColor(parseOverallMttr(), 0.1) }">
              <i class="el-icon-data-analysis" :style="{ color: getMttrHealthColor(parseOverallMttr()) }" />
            </div>
            <div class="summary-info">
              <div class="summary-label">健康度评估</div>
              <div
                class="summary-value health-badge"
                :style="{ color: getMttrHealthColor(parseOverallMttr()) }"
              >
                {{ getMttrHealthLabel(parseOverallMttr()) }}
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- MTTR趋势图表 -->
    <el-card v-if="statisticsData.trendData && statisticsData.trendData.length > 0" class="chart-card" shadow="never">
      <div class="chart-header">
        <h3 class="chart-title">MTTR趋势分析</h3>
      </div>

      <div class="chart-container">
        <div ref="trendChartContainer" class="mttr-trend-chart" />
      </div>
    </el-card>

    <!-- 故障等级MTTR对比 -->
    <el-row v-if="statisticsData.levelStatistics && statisticsData.levelStatistics.length > 0" :gutter="20">
      <el-col :xs="24" :md="12">
        <el-card class="level-chart-card" shadow="never">
          <div class="chart-header">
            <h3 class="chart-title">故障等级MTTR对比</h3>
          </div>

          <div class="chart-container">
            <div ref="levelChartContainer" class="level-mttr-chart" />
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="12">
        <el-card class="level-table-card" shadow="never">
          <div class="table-header">
            <h3 class="table-title">故障等级MTTR统计</h3>
          </div>

          <el-table
            :data="sortedLevelStatistics"
            stripe
            style="width: 100%"
          >
            <el-table-column
              prop="failureLevel"
              label="故障等级"
              width="120"
            >
              <template slot-scope="scope">
                <el-tag
                  :color="FAILURE_LEVEL_COLORS[scope.row.failureLevel]"
                  effect="dark"
                  size="small"
                >
                  {{ scope.row.failureLevel }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column
              prop="failureCount"
              label="故障数量"
              width="100"
              align="center"
            />

            <el-table-column
              prop="avgMTTR"
              label="平均MTTR(小时)"
              align="center"
              sortable
            >
              <template slot-scope="scope">
                <span :style="{ color: getMttrHealthColor(parseFloat(scope.row.avgMTTR)) }">
                  {{ scope.row.avgMTTR }}
                </span>
              </template>
            </el-table-column>

            <el-table-column
              label="健康度"
              width="100"
              align="center"
            >
              <template slot-scope="scope">
                <el-tag
                  :type="getMttrHealthType(parseFloat(scope.row.avgMTTR))"
                  effect="plain"
                  size="small"
                >
                  {{ getMttrHealthLabel(parseFloat(scope.row.avgMTTR)) }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- MTTR趋势数据表格 -->
    <el-card v-if="statisticsData.trendData && statisticsData.trendData.length > 0" class="table-card" shadow="never">
      <div class="table-header">
        <h3 class="table-title">MTTR趋势详细数据</h3>
      </div>

      <el-table
        :data="trendDataWithComparison"
        stripe
        border
        style="width: 100%"
      >
        <el-table-column
          prop="period"
          label="时间段"
          min-width="150"
          :formatter="formatPeriod"
        />

        <el-table-column
          prop="failureCount"
          label="故障数量"
          width="100"
          align="center"
        />

        <el-table-column
          prop="avgMTTR"
          label="平均MTTR(小时)"
          width="140"
          align="center"
        >
          <template slot-scope="scope">
            <span :style="{ color: getMttrHealthColor(parseFloat(scope.row.avgMTTR)) }">
              {{ scope.row.avgMTTR }}
            </span>
          </template>
        </el-table-column>

        <el-table-column
          prop="minMTTR"
          label="最短MTTR(小时)"
          width="140"
          align="center"
        />

        <el-table-column
          prop="maxMTTR"
          label="最长MTTR(小时)"
          width="140"
          align="center"
        />

        <el-table-column
          label="环比变化"
          width="120"
          align="center"
        >
          <template slot-scope="scope">
            <span v-if="scope.row.monthOnMonthChange !== null" :class="getTrendClass(scope.row.monthOnMonthChange)">
              <i :class="getTrendIcon(scope.row.monthOnMonthChange)" />
              {{ Math.abs(scope.row.monthOnMonthChange).toFixed(1) }}%
            </span>
            <span v-else class="no-data">-</span>
          </template>
        </el-table-column>

        <el-table-column
          label="健康度"
          width="100"
          align="center"
        >
          <template slot-scope="scope">
            <el-tag
              :type="getMttrHealthType(parseFloat(scope.row.avgMTTR))"
              effect="plain"
              size="small"
            >
              {{ getMttrHealthLabel(parseFloat(scope.row.avgMTTR)) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 空状态 -->
    <el-empty
      v-if="!loading && (!statisticsData.trendData || statisticsData.trendData.length === 0)"
      description="暂无数据，请调整查询条件后重新查询"
      :image-size="200"
    />
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { getMttrTrend } from './api/tpm-statistics'
import { EQUIPMENT_TYPES, TIME_PERIODS, FAILURE_LEVEL_COLORS } from './constants'

export default {
  name: 'MttrTrend',

  data() {
    // 自定义日期验证规则
    const validateDateRange = (rule, value, callback) => {
      if (this.queryParams.startDate && this.queryParams.endDate) {
        const start = new Date(this.queryParams.startDate)
        const end = new Date(this.queryParams.endDate)
        if (end < start) {
          callback(new Error('结束日期不能早于开始日期'))
        } else {
          callback()
        }
      } else {
        callback()
      }
    }

    return {
      loading: false,
      equipmentTypes: EQUIPMENT_TYPES.filter(item => item.value !== ''), // 过滤掉"全部设备"
      timePeriods: TIME_PERIODS,
      FAILURE_LEVEL_COLORS,
      queryParams: {
        startDate: '',
        endDate: '',
        equipmentType: '',
        timePeriod: '月'
      },
      queryRules: {
        startDate: [
          { required: true, message: '请选择开始日期', trigger: 'change' }
        ],
        endDate: [
          { required: true, message: '请选择结束日期', trigger: 'change' },
          { validator: validateDateRange, trigger: 'change' }
        ]
      },
      statisticsData: {
        summary: null,
        trendData: [],
        levelStatistics: []
      },
      trendChartInstance: null,
      levelChartInstance: null
    }
  },

  computed: {
    /**
     * 按MTTR排序的故障等级统计
     */
    sortedLevelStatistics() {
      if (!this.statisticsData.levelStatistics) return []
      return [...this.statisticsData.levelStatistics].sort((a, b) => {
        return parseFloat(b.avgMTTR) - parseFloat(a.avgMTTR)
      })
    },

    /**
     * 带环比数据的趋势数据
     */
    trendDataWithComparison() {
      if (!this.statisticsData.trendData || this.statisticsData.trendData.length === 0) {
        return []
      }

      return this.statisticsData.trendData.map((item, index) => {
        let monthOnMonthChange = null

        if (index > 0) {
          const currentMttr = parseFloat(item.avgMTTR)
          const previousMttr = parseFloat(this.statisticsData.trendData[index - 1].avgMTTR)

          if (previousMttr > 0) {
            monthOnMonthChange = ((currentMttr - previousMttr) / previousMttr) * 100
          }
        }

        return {
          ...item,
          monthOnMonthChange
        }
      })
    }
  },

  mounted() {
    // 设置默认日期范围（最近3个月）
    this.initDefaultDateRange()
  },

  beforeDestroy() {
    if (this.trendChartInstance) {
      this.trendChartInstance.dispose()
      this.trendChartInstance = null
    }
    if (this.levelChartInstance) {
      this.levelChartInstance.dispose()
      this.levelChartInstance = null
    }
    window.removeEventListener('resize', this.handleChartResize)
  },

  methods: {
    /**
     * 初始化默认日期范围
     */
    initDefaultDateRange() {
      const end = new Date()
      const start = new Date()
      start.setMonth(start.getMonth() - 3)

      this.queryParams.endDate = this.formatDate(end)
      this.queryParams.startDate = this.formatDate(start)
    },

    /**
     * 格式化日期
     */
    formatDate(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },

    /**
     * 查询统计数据
     */
    async handleQuery() {
      this.$refs.queryForm.validate(async(valid) => {
        if (!valid) {
          return
        }

        this.loading = true
        try {
          const params = {
            startDate: this.queryParams.startDate,
            endDate: this.queryParams.endDate,
            timePeriod: this.queryParams.timePeriod
          }

          if (this.queryParams.equipmentType) {
            params.equipmentType = this.queryParams.equipmentType
          }

          const response = await getMttrTrend(params)

          if (response.success) {
            this.statisticsData = {
              summary: response.data.summary,
              trendData: response.data.trendData || [],
              levelStatistics: response.data.levelStatistics || []
            }

            // 更新图表
            this.$nextTick(() => {
              this.initTrendChart()
              this.initLevelChart()
            })

            this.$message.success(response.message || '查询成功')
          }
        } catch (error) {
          console.error('查询MTTR趋势分析失败:', error)
          this.$message.error(error.message || '查询失败')
        } finally {
          this.loading = false
        }
      })
    },

    /**
     * 重置查询条件
     */
    handleReset() {
      this.$refs.queryForm.resetFields()
      this.initDefaultDateRange()
      this.statisticsData = {
        summary: null,
        trendData: [],
        levelStatistics: []
      }
      if (this.trendChartInstance) {
        this.trendChartInstance.clear()
      }
      if (this.levelChartInstance) {
        this.levelChartInstance.clear()
      }
    },

    /**
     * 初始化MTTR趋势图表
     */
    initTrendChart() {
      if (!this.$refs.trendChartContainer) {
        return
      }

      // 销毁已存在的图表实例
      if (this.trendChartInstance) {
        this.trendChartInstance.dispose()
      }

      // 创建新的图表实例
      this.trendChartInstance = echarts.init(this.$refs.trendChartContainer)

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          },
          formatter: (params) => {
            let html = `<div style="font-weight: 600; margin-bottom: 8px;">${this.formatPeriod({ period: params[0].axisValue })}</div>`
            params.forEach(param => {
              html += `
                <div style="display: flex; align-items: center; margin-bottom: 4px;">
                  <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: ${param.color}; margin-right: 8px;"></span>
                  <span style="flex: 1;">${param.seriesName}:</span>
                  <span style="font-weight: 600; margin-left: 12px;">${param.value}小时</span>
                </div>
              `
            })
            return html
          }
        },
        legend: {
          data: ['平均MTTR', '最小MTTR', '最大MTTR'],
          top: '0',
          left: 'center'
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
          data: this.statisticsData.trendData.map(item => item.period),
          axisLabel: {
            formatter: (value) => this.formatPeriodShort(value)
          }
        },
        yAxis: {
          type: 'value',
          name: 'MTTR(小时)',
          min: 0,
          axisLabel: {
            formatter: '{value}h'
          }
        },
        series: [
          {
            name: '平均MTTR',
            type: 'line',
            data: this.statisticsData.trendData.map(item => parseFloat(item.avgMTTR)),
            smooth: true,
            itemStyle: {
              color: '#409EFF'
            },
            lineStyle: {
              width: 3
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
                { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
              ])
            },
            markLine: {
              silent: true,
              data: [
                {
                  yAxis: 8,
                  label: {
                    formatter: '优秀线: 8小时',
                    position: 'end'
                  },
                  lineStyle: {
                    color: '#67C23A',
                    type: 'dashed'
                  }
                },
                {
                  yAxis: 24,
                  label: {
                    formatter: '警戒线: 24小时',
                    position: 'end'
                  },
                  lineStyle: {
                    color: '#F56C6C',
                    type: 'dashed'
                  }
                }
              ]
            }
          },
          {
            name: '最小MTTR',
            type: 'line',
            data: this.statisticsData.trendData.map(item => parseFloat(item.minMTTR)),
            smooth: true,
            itemStyle: {
              color: '#67C23A'
            },
            lineStyle: {
              width: 2,
              type: 'dashed'
            }
          },
          {
            name: '最大MTTR',
            type: 'line',
            data: this.statisticsData.trendData.map(item => parseFloat(item.maxMTTR)),
            smooth: true,
            itemStyle: {
              color: '#F56C6C'
            },
            lineStyle: {
              width: 2,
              type: 'dashed'
            }
          }
        ]
      }

      this.trendChartInstance.setOption(option)

      // 自适应窗口大小
      window.addEventListener('resize', this.handleChartResize)
    },

    /**
     * 初始化故障等级MTTR对比图表
     */
    initLevelChart() {
      if (!this.$refs.levelChartContainer) {
        return
      }

      // 销毁已存在的图表实例
      if (this.levelChartInstance) {
        this.levelChartInstance.dispose()
      }

      // 创建新的图表实例
      this.levelChartInstance = echarts.init(this.$refs.levelChartContainer)

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: (params) => {
            const param = params[0]
            return `
              <div style="font-weight: 600; margin-bottom: 8px;">${param.name}</div>
              <div style="display: flex; align-items: center;">
                <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: ${param.color}; margin-right: 8px;"></span>
                <span style="flex: 1;">平均MTTR:</span>
                <span style="font-weight: 600; margin-left: 12px;">${param.value}小时</span>
              </div>
            `
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
          data: this.statisticsData.levelStatistics.map(item => item.failureLevel),
          axisLabel: {
            interval: 0,
            rotate: 0
          }
        },
        yAxis: {
          type: 'value',
          name: 'MTTR(小时)',
          min: 0,
          axisLabel: {
            formatter: '{value}h'
          }
        },
        series: [
          {
            name: '平均MTTR',
            type: 'bar',
            data: this.statisticsData.levelStatistics.map(item => ({
              value: parseFloat(item.avgMTTR),
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: this.FAILURE_LEVEL_COLORS[item.failureLevel] },
                  { offset: 1, color: this.adjustColorBrightness(this.FAILURE_LEVEL_COLORS[item.failureLevel], 30) }
                ])
              }
            })),
            barWidth: '50%',
            label: {
              show: true,
              position: 'top',
              formatter: '{c}h'
            }
          }
        ]
      }

      this.levelChartInstance.setOption(option)
    },

    /**
     * 处理图表窗口大小变化
     */
    handleChartResize() {
      if (this.trendChartInstance) {
        this.trendChartInstance.resize()
      }
      if (this.levelChartInstance) {
        this.levelChartInstance.resize()
      }
    },

    /**
     * 格式化时间段显示
     */
    formatPeriod({ period }) {
      if (!period) return ''
      const date = new Date(period)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')

      const timePeriod = this.statisticsData.summary?.timePeriod || this.queryParams.timePeriod

      switch (timePeriod) {
        case '日':
          return `${year}年${month}月${day}日`
        case '周':
          return `${year}年第${this.getWeekNumber(date)}周`
        case '月':
          return `${year}年${month}月`
        case '年':
          return `${year}年`
        default:
          return `${year}-${month}-${day}`
      }
    },

    /**
     * 格式化时间段显示（简短版）
     */
    formatPeriodShort(period) {
      if (!period) return ''
      const date = new Date(period)
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')

      const timePeriod = this.statisticsData.summary?.timePeriod || this.queryParams.timePeriod

      switch (timePeriod) {
        case '日':
          return `${month}-${day}`
        case '周':
          return `第${this.getWeekNumber(date)}周`
        case '月':
          return `${month}月`
        case '年':
          return `${date.getFullYear()}年`
        default:
          return `${month}-${day}`
      }
    },

    /**
     * 获取周数
     */
    getWeekNumber(date) {
      const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
      const dayNum = d.getUTCDay() || 7
      d.setUTCDate(d.getUTCDate() + 4 - dayNum)
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
      return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
    },

    /**
     * 解析总体平均MTTR
     */
    parseOverallMttr() {
      if (!this.statisticsData.summary || !this.statisticsData.summary.overallMTTR) {
        return 0
      }
      // 移除"小时"后缀并转换为数字
      return parseFloat(this.statisticsData.summary.overallMTTR.replace('小时', ''))
    },

    /**
     * 获取MTTR健康度类型
     */
    getMttrHealthType(mttr) {
      if (mttr <= 8) return 'success'
      if (mttr <= 24) return 'warning'
      return 'danger'
    },

    /**
     * 获取MTTR健康度颜色
     */
    getMttrHealthColor(mttr, opacity = 1) {
      let color = ''
      if (mttr <= 8) {
        color = '#67C23A'
      } else if (mttr <= 24) {
        color = '#E6A23C'
      } else {
        color = '#F56C6C'
      }

      if (opacity < 1) {
        // 转换为rgba
        const r = parseInt(color.slice(1, 3), 16)
        const g = parseInt(color.slice(3, 5), 16)
        const b = parseInt(color.slice(5, 7), 16)
        return `rgba(${r}, ${g}, ${b}, ${opacity})`
      }

      return color
    },

    /**
     * 获取MTTR健康度标签
     */
    getMttrHealthLabel(mttr) {
      if (mttr <= 8) return '优秀'
      if (mttr <= 24) return '良好'
      return '差'
    },

    /**
     * 获取趋势类样式
     */
    getTrendClass(change) {
      if (change < 0) return 'trend-down' // MTTR下降是好事
      if (change > 0) return 'trend-up' // MTTR上升是坏事
      return 'trend-stable'
    },

    /**
     * 获取趋势图标
     */
    getTrendIcon(change) {
      if (change < 0) return 'el-icon-bottom'
      if (change > 0) return 'el-icon-top'
      return 'el-icon-minus'
    },

    /**
     * 调整颜色亮度
     */
    adjustColorBrightness(color, amount) {
      const r = parseInt(color.slice(1, 3), 16)
      const g = parseInt(color.slice(3, 5), 16)
      const b = parseInt(color.slice(5, 7), 16)

      const newR = Math.min(255, Math.max(0, r + amount))
      const newG = Math.min(255, Math.max(0, g + amount))
      const newB = Math.min(255, Math.max(0, b + amount))

      return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`
    }
  }
}
</script>

<style lang="scss" scoped>
.mttr-trend-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 84px);

  .page-header {
    margin-bottom: 20px;

    .page-title {
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 600;
      color: #303133;
    }

    .page-description {
      margin: 0;
      font-size: 14px;
      color: #909399;
    }
  }

  .query-card {
    margin-bottom: 20px;

    ::v-deep .el-card__body {
      padding: 20px;
    }

    .query-form {
      .el-form-item {
        margin-bottom: 16px;
      }

      .query-actions {
        text-align: right;
        padding-top: 4px;
      }
    }
  }

  .summary-card {
    margin-bottom: 20px;

    ::v-deep .el-card__body {
      padding: 24px;
    }

    .summary-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;

      .summary-title {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #303133;
      }
    }

    .summary-content {
      .summary-item {
        display: flex;
        align-items: center;
        padding: 20px;
        background-color: #fafafa;
        border-radius: 8px;
        transition: all 0.3s;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        &.highlight {
          background: linear-gradient(135deg, #e8f4fd 0%, #fff 100%);
          border: 1px solid #409eff;
        }

        .summary-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 56px;
          height: 56px;
          border-radius: 12px;
          margin-right: 16px;

          i {
            font-size: 28px;
          }
        }

        .summary-info {
          flex: 1;

          .summary-label {
            font-size: 14px;
            color: #606266;
            margin-bottom: 8px;
          }

          .summary-value {
            font-size: 28px;
            font-weight: 600;
            color: #303133;

            &.mttr-value {
              font-size: 32px;
            }

            &.health-badge {
              font-size: 24px;
            }
          }
        }
      }
    }
  }

  .chart-card {
    margin-bottom: 20px;

    ::v-deep .el-card__body {
      padding: 24px;
    }

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      .chart-title {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #303133;
      }
    }

    .chart-container {
      .mttr-trend-chart {
        width: 100%;
        height: 450px;
      }
    }
  }

  .level-chart-card,
  .level-table-card {
    margin-bottom: 20px;

    ::v-deep .el-card__body {
      padding: 24px;
    }

    .chart-header,
    .table-header {
      margin-bottom: 20px;

      .chart-title,
      .table-title {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #303133;
      }
    }

    .chart-container {
      .level-mttr-chart {
        width: 100%;
        height: 350px;
      }
    }
  }

  .table-card {
    ::v-deep .el-card__body {
      padding: 24px;
    }

    .table-header {
      margin-bottom: 20px;

      .table-title {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #303133;
      }
    }

    .trend-up {
      color: #f56c6c;
      font-weight: 600;
    }

    .trend-down {
      color: #67c23a;
      font-weight: 600;
    }

    .trend-stable {
      color: #909399;
    }

    .no-data {
      color: #c0c4cc;
    }
  }
}

// 响应式布局
@media screen and (max-width: 768px) {
  .mttr-trend-container {
    .summary-content {
      .el-col {
        margin-bottom: 16px;
      }
    }

    .chart-container {
      .mttr-trend-chart,
      .level-mttr-chart {
        height: 300px;
      }
    }
  }
}
</style>

