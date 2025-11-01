<template>
  <div class="consumption-ranking">
    <el-card shadow="hover">
      <div slot="header" class="card-header">
        <span class="card-title">
          <i class="el-icon-s-data" />
          备件消耗排名 TOP 20
        </span>
        <el-radio-group v-model="orientation" size="small" @change="renderChart">
          <el-radio-button label="horizontal">
            <i class="el-icon-s-operation" />
            横向
          </el-radio-button>
          <el-radio-button label="vertical">
            <i class="el-icon-menu" />
            纵向
          </el-radio-button>
        </el-radio-group>
      </div>
      <div v-loading="loading" class="chart-container">
        <div v-if="!hasData" class="empty-state">
          <i class="el-icon-warning-outline" />
          <p>暂无排名数据</p>
        </div>
        <div v-else ref="chartRef" class="chart" />
      </div>
    </el-card>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { CHART_COLORS, HIGH_CONSUMPTION_THRESHOLD, RANKING_CHART_ORIENTATION } from '../constants/spare-part-consumption'

export default {
  name: 'ConsumptionRanking',
  props: {
    partStatistics: {
      type: Array,
      default: () => []
    },
    sortBy: {
      type: String,
      default: 'totalQuantity'
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      chart: null,
      orientation: RANKING_CHART_ORIENTATION.HORIZONTAL
    }
  },
  computed: {
    hasData() {
      return this.partStatistics && this.partStatistics.length > 0
    },
    chartData() {
      if (!this.hasData) return []
      // 对于横向图，需要反转数据顺序
      return this.orientation === RANKING_CHART_ORIENTATION.HORIZONTAL
        ? [...this.partStatistics].reverse()
        : this.partStatistics
    },
    valueField() {
      const fieldMap = {
        totalQuantity: { field: 'totalQuantity', name: '消耗量', unit: '' },
        totalCost: { field: 'totalCost', name: '总成本', unit: '元' },
        frequency: { field: 'frequency', name: '使用频次', unit: '次' }
      }
      return fieldMap[this.sortBy] || fieldMap.totalQuantity
    }
  },
  watch: {
    partStatistics: {
      handler() {
        this.$nextTick(() => {
          this.renderChart()
        })
      },
      deep: true
    },
    sortBy() {
      this.$nextTick(() => {
        this.renderChart()
      })
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

      const isHorizontal = this.orientation === RANKING_CHART_ORIENTATION.HORIZONTAL
      const names = this.chartData.map(item => item.sparePartName || item.sparePartCode)
      const values = this.chartData.map(item => {
        const value = item[this.valueField.field]
        return this.sortBy === 'totalCost' ? parseFloat(value || 0) : value
      })

      // 判断是否为高消耗备件（TOP 5）
      const highConsumptionIndices = isHorizontal
        ? Array.from({ length: HIGH_CONSUMPTION_THRESHOLD }, (_, i) => this.chartData.length - 1 - i)
        : Array.from({ length: HIGH_CONSUMPTION_THRESHOLD }, (_, i) => i)

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
            type: 'shadow',
            shadowStyle: {
              color: 'rgba(25, 118, 210, 0.1)'
            }
          },
          formatter: (params) => {
            const data = params[0]
            const item = this.chartData[isHorizontal ? this.chartData.length - 1 - data.dataIndex : data.dataIndex]
            return `
              <div style="font-weight: 600; margin-bottom: 8px;">${item.sparePartName}</div>
              <div style="color: #909399; font-size: 12px; margin-bottom: 6px;">编码：${item.sparePartCode}</div>
              <div style="display: flex; justify-content: space-between; gap: 16px;">
                <span>消耗量：</span>
                <span style="font-weight: 600;">${item.totalQuantity}</span>
              </div>
              <div style="display: flex; justify-content: space-between; gap: 16px;">
                <span>使用频次：</span>
                <span style="font-weight: 600;">${item.frequency}次</span>
              </div>
              <div style="display: flex; justify-content: space-between; gap: 16px;">
                <span>总成本：</span>
                <span style="font-weight: 600; color: #FF9800;">¥${item.totalCost}</span>
              </div>
            `
          }
        },
        grid: {
          left: isHorizontal ? 120 : '3%',
          right: isHorizontal ? '8%' : '4%',
          top: 20,
          bottom: isHorizontal ? '3%' : 80,
          containLabel: true
        },
        [isHorizontal ? 'yAxis' : 'xAxis']: {
          type: 'category',
          data: names,
          axisLine: {
            lineStyle: {
              color: '#E4E7ED'
            }
          },
          axisLabel: {
            color: '#606266',
            fontSize: 12,
            margin: 12,
            rotate: isHorizontal ? 0 : 45,
            formatter: (value) => {
              return value.length > 8 ? value.substring(0, 8) + '...' : value
            }
          },
          axisTick: {
            show: false
          }
        },
        [isHorizontal ? 'xAxis' : 'yAxis']: {
          type: 'value',
          name: `${this.valueField.name}${this.valueField.unit ? `（${this.valueField.unit}）` : ''}`,
          nameTextStyle: {
            color: '#909399',
            fontSize: 12
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
        series: [{
          type: 'bar',
          data: values.map((value, index) => {
            const isHighConsumption = highConsumptionIndices.includes(index)
            return {
              value,
              itemStyle: {
                color: isHighConsumption
                  ? new echarts.graphic.LinearGradient(0, 0, isHorizontal ? 1 : 0, isHorizontal ? 0 : 1, [
                    { offset: 0, color: '#F44336' },
                    { offset: 1, color: '#FF9800' }
                  ])
                  : new echarts.graphic.LinearGradient(0, 0, isHorizontal ? 1 : 0, isHorizontal ? 0 : 1, [
                    { offset: 0, color: CHART_COLORS.primary },
                    { offset: 1, color: CHART_COLORS.info }
                  ]),
                borderRadius: isHorizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]
              },
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowColor: isHighConsumption ? '#F44336' : CHART_COLORS.primary
                }
              }
            }
          }),
          barWidth: '60%',
          label: {
            show: false
          }
        }]
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
.consumption-ranking {
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
    min-height: 500px;
    position: relative;
  }

  .chart {
    width: 100%;
    height: 500px;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 500px;
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

  ::v-deep .el-radio-button__inner {
    padding: 8px 15px;
    display: flex;
    align-items: center;
    gap: 4px;
  }
}
</style>

