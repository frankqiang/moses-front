<!--
 * 文件名称: HealthCharts.vue
 * 文件描述: 设备健康度评分图表组件
 * 创建日期: 2024-01-20
 * 修改记录:
 *   - 2024-01-20: 初始创建
-->
<template>
  <div class="health-charts">
    <el-row :gutter="16">
      <!-- 健康度分布饼图 -->
      <el-col :span="12">
        <el-card shadow="never">
          <div slot="header" class="card-header">
            <span class="card-title">健康度等级分布</span>
          </div>
          <div ref="pieChart" class="chart-container" />
        </el-card>
      </el-col>

      <!-- 健康度评分排名柱状图 -->
      <el-col :span="12">
        <el-card shadow="never">
          <div slot="header" class="card-header">
            <span class="card-title">健康度评分排名（TOP 10）</span>
          </div>
          <div ref="barChart" class="chart-container" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { HEALTH_LEVEL_CONFIG } from '../constants'

export default {
  name: 'HealthCharts',
  props: {
    summary: {
      type: Object,
      default: () => ({})
    },
    equipmentHealth: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      pieChart: null,
      barChart: null
    }
  },
  watch: {
    summary: {
      handler() {
        this.$nextTick(() => {
          this.initPieChart()
        })
      },
      deep: true
    },
    equipmentHealth: {
      handler() {
        this.$nextTick(() => {
          this.initBarChart()
        })
      },
      deep: true
    }
  },
  mounted() {
    this.initCharts()
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
    if (this.pieChart) {
      this.pieChart.dispose()
    }
    if (this.barChart) {
      this.barChart.dispose()
    }
  },
  methods: {
    initCharts() {
      this.initPieChart()
      this.initBarChart()
    },
    initPieChart() {
      if (!this.$refs.pieChart) return

      if (!this.pieChart) {
        this.pieChart = echarts.init(this.$refs.pieChart)
      }

      const levelStats = this.summary.levelStats || {}
      const data = Object.keys(levelStats).map(level => ({
        name: level,
        value: levelStats[level],
        itemStyle: {
          color: HEALTH_LEVEL_CONFIG[level]?.color || '#909399'
        }
      }))

      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c}台 ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          data: Object.keys(levelStats),
          textStyle: {
            fontSize: 14
          }
        },
        series: [
          {
            name: '健康度等级',
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['60%', '50%'],
            avoidLabelOverlap: false,
            label: {
              show: true,
              formatter: '{b}\n{c}台 ({d}%)',
              fontSize: 12
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 14,
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: true
            },
            data
          }
        ]
      }

      this.pieChart.setOption(option)
    },
    initBarChart() {
      if (!this.$refs.barChart) return

      if (!this.barChart) {
        this.barChart = echarts.init(this.$refs.barChart)
      }

      // 取前10台设备
      const top10 = this.equipmentHealth.slice(0, 10)
      const xData = top10.map(item => item.equipmentCode)
      const yData = top10.map(item => ({
        value: item.healthScore,
        itemStyle: {
          color: this.getScoreColor(item.healthScore)
        }
      }))

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: params => {
            const data = params[0]
            const equipment = top10[data.dataIndex]
            return `${equipment.equipmentName}<br/>
                   健康度评分: ${equipment.healthScore}分<br/>
                   健康等级: ${equipment.healthLevel}`
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          max: 100,
          axisLabel: {
            formatter: '{value}分'
          }
        },
        yAxis: {
          type: 'category',
          data: xData,
          axisLabel: {
            fontSize: 12
          }
        },
        series: [
          {
            name: '健康度评分',
            type: 'bar',
            barWidth: '60%',
            data: yData,
            label: {
              show: true,
              position: 'right',
              formatter: '{c}分',
              fontSize: 12
            }
          }
        ]
      }

      this.barChart.setOption(option)
    },
    getScoreColor(score) {
      if (score >= 90) return '#67C23A'
      if (score >= 75) return '#409EFF'
      if (score >= 60) return '#E6A23C'
      return '#F56C6C'
    },
    handleResize() {
      if (this.pieChart) {
        this.pieChart.resize()
      }
      if (this.barChart) {
        this.barChart.resize()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.health-charts {
  margin-bottom: 16px;

  .card-header {
    .card-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
  }

  .chart-container {
    width: 100%;
    height: 400px;
  }
}
</style>

