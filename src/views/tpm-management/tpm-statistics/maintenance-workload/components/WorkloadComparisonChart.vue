<!--
  文件名称：WorkloadComparisonChart.vue
  文件描述：分组工作量对比柱状图组件
  创建日期：2024-01-20
  修改记录：
    - 2024-01-20: 初始创建
-->

<template>
  <el-card class="workload-comparison-card" shadow="never">
    <div slot="header" class="card-header">
      <span class="card-title">
        <i class="el-icon-data-analysis" />
        分组工作量对比
      </span>
      <div class="header-actions">
        <el-radio-group v-model="chartType" size="small" @change="renderChart">
          <el-radio-button label="bar">柱状图</el-radio-button>
          <el-radio-button label="horizontal">横向对比</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <div ref="chart" class="chart-container" />
  </el-card>
</template>

<script>
import * as echarts from 'echarts'
import { debounce } from '@/utils'

export default {
  name: 'WorkloadComparisonChart',
  props: {
    workloadData: {
      type: Array,
      default: () => []
    },
    groupBy: {
      type: String,
      default: 'assignee'
    }
  },
  data() {
    return {
      chart: null,
      chartType: 'bar'
    }
  },
  watch: {
    workloadData: {
      handler() {
        this.renderChart()
      },
      deep: true
    },
    groupBy() {
      this.renderChart()
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
      if (!this.chart || !this.workloadData || this.workloadData.length === 0) {
        return
      }

      const data = this.workloadData.slice(0, 15) // 只显示前15条数据
      const names = data.map(item => this.getGroupName(item))
      const totalTasks = data.map(item => item.totalTasks)
      const completedTasks = data.map(item => item.completedTasks)
      const totalWorkHours = data.map(item => parseFloat(item.totalWorkHours))

      const option = this.chartType === 'bar'
        ? this.getBarChartOption(names, totalTasks, completedTasks, totalWorkHours)
        : this.getHorizontalChartOption(names, totalTasks, completedTasks, totalWorkHours)

      this.chart.setOption(option, true)
    },
    getBarChartOption(names, totalTasks, completedTasks, totalWorkHours) {
      return {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: '#E4E7ED',
          borderWidth: 1,
          textStyle: {
            color: '#606266'
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
          data: names,
          axisLabel: {
            rotate: names.length > 8 ? 30 : 0,
            formatter: (value) => {
              return value.length > 8 ? value.substring(0, 8) + '...' : value
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
            }
          }
        ],
        series: [
          {
            name: '总任务数',
            type: 'bar',
            data: totalTasks,
            yAxisIndex: 0,
            itemStyle: {
              color: '#409EFF',
              borderRadius: [4, 4, 0, 0]
            },
            emphasis: {
              itemStyle: {
                color: '#66B1FF'
              }
            }
          },
          {
            name: '已完成任务数',
            type: 'bar',
            data: completedTasks,
            yAxisIndex: 0,
            itemStyle: {
              color: '#67C23A',
              borderRadius: [4, 4, 0, 0]
            },
            emphasis: {
              itemStyle: {
                color: '#85CE61'
              }
            }
          },
          {
            name: '总工时',
            type: 'line',
            data: totalWorkHours,
            yAxisIndex: 1,
            itemStyle: {
              color: '#E6A23C'
            },
            lineStyle: {
              width: 3
            },
            symbol: 'circle',
            symbolSize: 8
          }
        ]
      }
    },
    getHorizontalChartOption(names, totalTasks, completedTasks, totalWorkHours) {
      return {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: '#E4E7ED',
          borderWidth: 1,
          textStyle: {
            color: '#606266'
          }
        },
        legend: {
          data: ['总任务数', '已完成任务数', '总工时'],
          top: 0,
          right: 20
        },
        grid: {
          left: '3%',
          right: '10%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'value',
            name: '任务数（个）',
            position: 'bottom',
            axisLine: {
              show: true,
              lineStyle: {
                color: '#409EFF'
              }
            }
          },
          {
            type: 'value',
            name: '工时（小时）',
            position: 'top',
            axisLine: {
              show: true,
              lineStyle: {
                color: '#E6A23C'
              }
            }
          }
        ],
        yAxis: {
          type: 'category',
          data: names,
          axisLabel: {
            formatter: (value) => {
              return value.length > 10 ? value.substring(0, 10) + '...' : value
            }
          }
        },
        series: [
          {
            name: '总任务数',
            type: 'bar',
            data: totalTasks,
            xAxisIndex: 0,
            itemStyle: {
              color: '#409EFF',
              borderRadius: [0, 4, 4, 0]
            },
            emphasis: {
              itemStyle: {
                color: '#66B1FF'
              }
            }
          },
          {
            name: '已完成任务数',
            type: 'bar',
            data: completedTasks,
            xAxisIndex: 0,
            itemStyle: {
              color: '#67C23A',
              borderRadius: [0, 4, 4, 0]
            },
            emphasis: {
              itemStyle: {
                color: '#85CE61'
              }
            }
          },
          {
            name: '总工时',
            type: 'bar',
            data: totalWorkHours,
            xAxisIndex: 1,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: '#FFB74D' },
                { offset: 1, color: '#E6A23C' }
              ]),
              borderRadius: [0, 4, 4, 0]
            },
            emphasis: {
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                  { offset: 0, color: '#FFCC80' },
                  { offset: 1, color: '#FFB74D' }
                ])
              }
            }
          }
        ]
      }
    },
    getGroupName(item) {
      switch (this.groupBy) {
        case 'assignee':
          return item.assigneeName || '-'
        case 'equipmentType':
          return item.equipmentType || '-'
        case 'maintenanceType':
          return item.maintenanceType || '-'
        default:
          return '-'
      }
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
.workload-comparison-card {
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

    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  }

  .chart-container {
    width: 100%;
    height: 450px;
  }
}
</style>

