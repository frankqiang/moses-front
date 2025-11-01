<template>
  <div class="consumption-trend">
    <el-card shadow="hover">
      <div slot="header" class="card-header">
        <span class="card-title">
          <i class="el-icon-data-line" />
          备件消耗趋势
        </span>
      </div>
      <div v-loading="loading" class="chart-container">
        <div v-if="!hasData" class="empty-state">
          <i class="el-icon-warning-outline" />
          <p>暂无趋势数据</p>
        </div>
        <div v-else ref="chartRef" class="chart" />
      </div>
    </el-card>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { parseTime } from '@/utils'
import { TREND_CHART_SERIES } from '../constants/spare-part-consumption'

export default {
  name: 'ConsumptionTrend',
  props: {
    trendData: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      chart: null
    }
  },
  computed: {
    hasData() {
      return this.trendData && this.trendData.length > 0
    }
  },
  watch: {
    trendData: {
      handler() {
        this.$nextTick(() => {
          this.renderChart()
        })
      },
      deep: true
    }
  },
  mounted() {
    this.initChart()
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
      if (!this.$refs.chartRef) return
      this.chart = echarts.init(this.$refs.chartRef)
      this.renderChart()
    },
    renderChart() {
      if (!this.chart || !this.hasData) return

      const xAxisData = this.trendData.map(item => parseTime(item.period, '{y}-{m}-{d}'))
      const series = TREND_CHART_SERIES.map(config => ({
        name: config.name,
        type: 'line',
        data: this.trendData.map(item => item[config.dataKey]),
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          width: 3,
          color: config.color
        },
        itemStyle: {
          color: config.color,
          borderWidth: 2,
          borderColor: '#fff'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: config.color + '20' },
            { offset: 1, color: config.color + '05' }
          ])
        },
        emphasis: {
          focus: 'series',
          itemStyle: {
            borderWidth: 3,
            borderColor: '#fff',
            shadowBlur: 10,
            shadowColor: config.color
          }
        }
      }))

      const option = {
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: '#E4E7ED',
          borderWidth: 1,
          textStyle: {
            color: '#606266',
            fontSize: 13
          },
          padding: [12, 16],
          axisPointer: {
            type: 'cross',
            lineStyle: {
              type: 'dashed',
              color: '#909399'
            },
            crossStyle: {
              color: '#909399'
            }
          }
        },
        legend: {
          data: TREND_CHART_SERIES.map(s => s.name),
          top: 10,
          right: 20,
          icon: 'roundRect',
          itemWidth: 12,
          itemHeight: 12,
          textStyle: {
            color: '#606266',
            fontSize: 13
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: 60,
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: xAxisData,
          axisLine: {
            lineStyle: {
              color: '#E4E7ED'
            }
          },
          axisLabel: {
            color: '#606266',
            fontSize: 12,
            margin: 12
          },
          axisTick: {
            show: false
          }
        },
        yAxis: {
          type: 'value',
          name: '数量',
          nameTextStyle: {
            color: '#909399',
            fontSize: 12,
            padding: [0, 0, 0, 40]
          },
          axisLine: {
            show: false
          },
          axisLabel: {
            color: '#606266',
            fontSize: 12
          },
          splitLine: {
            lineStyle: {
              color: '#E4E7ED',
              type: 'dashed'
            }
          }
        },
        series
      }

      this.chart.setOption(option, true)
    },
    handleResize() {
      if (this.chart) {
        this.chart.resize()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.consumption-trend {
  margin-bottom: 24px;

  ::v-deep .el-card__header {
    padding: 16px 20px;
    border-bottom: 1px solid #E4E7ED;
  }

  ::v-deep .el-card__body {
    padding: 20px;
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .card-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    display: flex;
    align-items: center;
    gap: 8px;

    i {
      font-size: 18px;
      color: #1976D2;
    }
  }

  .chart-container {
    min-height: 400px;
    position: relative;
  }

  .chart {
    width: 100%;
    height: 400px;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 400px;
    color: #909399;

    i {
      font-size: 64px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    p {
      font-size: 14px;
      margin: 0;
    }
  }
}
</style>

