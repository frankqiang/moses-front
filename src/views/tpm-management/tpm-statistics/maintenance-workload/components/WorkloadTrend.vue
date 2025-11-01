<!--
  文件名称：WorkloadTrend.vue
  文件描述：工作量趋势图表组件
  创建日期：2024-01-20
  修改记录：
    - 2024-01-20: 初始创建
-->

<template>
  <el-card class="workload-trend-card" shadow="never">
    <div slot="header" class="card-header">
      <span class="card-title">
        <i class="el-icon-trend-charts" />
        工作量趋势分析
      </span>
    </div>

    <div ref="chart" class="chart-container" />
  </el-card>
</template>

<script>
import * as echarts from 'echarts'
import { debounce } from '@/utils'

export default {
  name: 'WorkloadTrend',
  props: {
    trendData: {
      type: Array,
      default: () => []
    },
    timePeriod: {
      type: String,
      default: '月'
    }
  },
  data() {
    return {
      chart: null
    }
  },
  watch: {
    trendData: {
      handler() {
        this.renderChart()
      },
      deep: true
    }
  },
  mounted() {
    this.initChart()
    this.renderChart()
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    if (this.chart) {
      this.chart.dispose()
      this.chart = null
    }
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$refs.chart)
    },
    renderChart() {
      if (!this.chart || !this.trendData || this.trendData.length === 0) {
        return
      }

      const xAxisData = this.trendData.map(item => {
        return this.formatPeriod(item.period)
      })

      const totalTasksData = this.trendData.map(item => item.totalTasks)
      const completedTasksData = this.trendData.map(item => item.completedTasks)
      const totalWorkHoursData = this.trendData.map(item => parseFloat(item.totalWorkHours))

      const option = {
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: '#E4E7ED',
          borderWidth: 1,
          textStyle: {
            color: '#606266'
          },
          formatter: (params) => {
            let result = `<div style="font-weight: 600; margin-bottom: 8px;">${params[0].axisValue}</div>`
            params.forEach(param => {
              const value = param.seriesName.includes('工时')
                ? `${param.value} 小时`
                : `${param.value} 个`
              result += `
                <div style="display: flex; justify-content: space-between; margin: 4px 0;">
                  <span>
                    <span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;background:${param.color};"></span>
                    ${param.seriesName}:
                  </span>
                  <span style="margin-left: 16px; font-weight: 600;">${value}</span>
                </div>
              `
            })
            return result
          }
        },
        legend: {
          data: ['总任务数', '已完成任务数', '总工时'],
          top: 0,
          right: 20
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
          data: xAxisData,
          axisLabel: {
            rotate: this.trendData.length > 12 ? 45 : 0,
            formatter: (value) => {
              return value.length > 10 ? value.substring(0, 10) + '...' : value
            }
          }
        },
        yAxis: [
          {
            type: 'value',
            name: '任务数（个）',
            position: 'left',
            axisLine: {
              show: true,
              lineStyle: {
                color: '#409EFF'
              }
            },
            axisLabel: {
              formatter: '{value}'
            }
          },
          {
            type: 'value',
            name: '工时（小时）',
            position: 'right',
            axisLine: {
              show: true,
              lineStyle: {
                color: '#E6A23C'
              }
            },
            axisLabel: {
              formatter: '{value}'
            }
          }
        ],
        series: [
          {
            name: '总任务数',
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            yAxisIndex: 0,
            itemStyle: {
              color: '#409EFF'
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
                { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
              ])
            },
            data: totalTasksData
          },
          {
            name: '已完成任务数',
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            yAxisIndex: 0,
            itemStyle: {
              color: '#67C23A'
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(103, 194, 58, 0.3)' },
                { offset: 1, color: 'rgba(103, 194, 58, 0.05)' }
              ])
            },
            data: completedTasksData
          },
          {
            name: '总工时',
            type: 'line',
            smooth: true,
            symbol: 'diamond',
            symbolSize: 7,
            yAxisIndex: 1,
            itemStyle: {
              color: '#E6A23C'
            },
            lineStyle: {
              width: 3
            },
            data: totalWorkHoursData
          }
        ]
      }

      this.chart.setOption(option, true)
    },
    formatPeriod(periodStr) {
      if (!periodStr) return '-'

      try {
        const date = new Date(periodStr)
        if (isNaN(date.getTime())) return periodStr

        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')

        switch (this.timePeriod) {
          case '日':
            return `${year}-${month}-${day}`
          case '周':
            return `${year}年第${this.getWeekNumber(date)}周`
          case '月':
            return `${year}-${month}`
          case '年':
            return `${year}年`
          default:
            return `${year}-${month}-${day}`
        }
      } catch (e) {
        return periodStr
      }
    },
    getWeekNumber(date) {
      const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
      const pastDaysOfYear = (date - firstDayOfYear) / 86400000
      return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
    },
    handleResize: debounce(function() {
      if (this.chart) {
        this.chart.resize()
      }
    }, 300)
  }
}
</script>

<style scoped lang="scss">
.workload-trend-card {
  margin-bottom: 16px;

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .card-title {
      font-size: 16px;
      font-weight: 500;
      color: #303133;

      i {
        margin-right: 8px;
        font-size: 18px;
        vertical-align: middle;
      }
    }
  }

  .chart-container {
    width: 100%;
    height: 400px;
  }
}
</style>

