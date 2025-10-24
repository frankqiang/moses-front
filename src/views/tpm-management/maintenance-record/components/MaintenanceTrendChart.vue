<!--
  文件名称: MaintenanceTrendChart.vue
  文件描述: 维护趋势图表组件 - 展示维护频率和工时趋势
  创建日期: 2025-01-20
  修改记录:
    - 2025-01-20: 初始创建，实现维护频率和工时趋势图表
-->

<template>
  <div class="maintenance-trend-chart">
    <!-- 维护频率趋势 -->
    <div class="chart-container">
      <div class="chart-title">维护频率趋势</div>
      <div ref="frequencyChart" class="chart" />
    </div>

    <!-- 维护工时趋势 -->
    <div class="chart-container">
      <div class="chart-title">维护工时趋势</div>
      <div ref="workHoursChart" class="chart" />
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'MaintenanceTrendChart',
  props: {
    equipmentId: {
      type: String,
      required: true
    },
    records: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      frequencyChartInstance: null,
      workHoursChartInstance: null
    }
  },
  watch: {
    records: {
      handler() {
        this.$nextTick(() => {
          this.renderCharts()
        })
      },
      immediate: true
    }
  },
  mounted() {
    this.initCharts()
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    this.destroyCharts()
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    /**
     * 初始化图表实例
     */
    initCharts() {
      if (this.$refs.frequencyChart) {
        this.frequencyChartInstance = echarts.init(this.$refs.frequencyChart)
      }
      if (this.$refs.workHoursChart) {
        this.workHoursChartInstance = echarts.init(this.$refs.workHoursChart)
      }
    },

    /**
     * 渲染图表
     */
    renderCharts() {
      if (!this.records || this.records.length === 0) {
        return
      }

      // 按月份分组统计数据
      const monthlyData = this.processMonthlyData(this.records)

      // 渲染维护频率图表
      if (this.frequencyChartInstance) {
        this.renderFrequencyChart(monthlyData)
      }

      // 渲染维护工时图表
      if (this.workHoursChartInstance) {
        this.renderWorkHoursChart(monthlyData)
      }
    },

    /**
     * 处理月度数据
     */
    processMonthlyData(records) {
      const monthlyMap = new Map()

      records.forEach(record => {
        const date = new Date(record.maintenanceDate)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

        if (!monthlyMap.has(monthKey)) {
          monthlyMap.set(monthKey, {
            month: monthKey,
            totalCount: 0,
            dailyCount: 0,
            periodicCount: 0,
            overhaulCount: 0,
            specialCount: 0,
            totalWorkHours: 0
          })
        }

        const monthData = monthlyMap.get(monthKey)
        monthData.totalCount++

        // 按类型统计
        switch (record.maintenanceType) {
          case '日常保养':
            monthData.dailyCount++
            break
          case '定期检查':
            monthData.periodicCount++
            break
          case '大修':
            monthData.overhaulCount++
            break
          case '专项维护':
            monthData.specialCount++
            break
        }

        // 累加工时
        if (record.workHours) {
          monthData.totalWorkHours += parseFloat(record.workHours)
        }
      })

      // 转换为数组并排序
      const monthlyData = Array.from(monthlyMap.values()).sort((a, b) => {
        return a.month.localeCompare(b.month)
      })

      return monthlyData
    },

    /**
     * 渲染维护频率图表
     */
    renderFrequencyChart(monthlyData) {
      const months = monthlyData.map(item => item.month)
      const dailyCounts = monthlyData.map(item => item.dailyCount)
      const periodicCounts = monthlyData.map(item => item.periodicCount)
      const overhaulCounts = monthlyData.map(item => item.overhaulCount)
      const specialCounts = monthlyData.map(item => item.specialCount)

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          }
        },
        legend: {
          data: ['日常保养', '定期检查', '大修', '专项维护'],
          bottom: 0
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '12%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: months,
          axisLabel: {
            rotate: 45
          }
        },
        yAxis: {
          type: 'value',
          name: '维护次数',
          minInterval: 1
        },
        series: [
          {
            name: '日常保养',
            type: 'line',
            smooth: true,
            data: dailyCounts,
            itemStyle: {
              color: '#409EFF'
            }
          },
          {
            name: '定期检查',
            type: 'line',
            smooth: true,
            data: periodicCounts,
            itemStyle: {
              color: '#67C23A'
            }
          },
          {
            name: '大修',
            type: 'line',
            smooth: true,
            data: overhaulCounts,
            itemStyle: {
              color: '#E6A23C'
            }
          },
          {
            name: '专项维护',
            type: 'line',
            smooth: true,
            data: specialCounts,
            itemStyle: {
              color: '#F56C6C'
            }
          }
        ]
      }

      this.frequencyChartInstance.setOption(option)
    },

    /**
     * 渲染维护工时图表
     */
    renderWorkHoursChart(monthlyData) {
      const months = monthlyData.map(item => item.month)
      const workHours = monthlyData.map(item => item.totalWorkHours.toFixed(2))

      const option = {
        tooltip: {
          trigger: 'axis',
          formatter: '{b}<br/>{a}: {c} 小时'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '8%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: months,
          axisLabel: {
            rotate: 45
          }
        },
        yAxis: {
          type: 'value',
          name: '工时（小时）'
        },
        series: [
          {
            name: '总维护工时',
            type: 'bar',
            data: workHours,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#83bff6' },
                { offset: 0.5, color: '#188df0' },
                { offset: 1, color: '#188df0' }
              ])
            },
            emphasis: {
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#2378f7' },
                  { offset: 0.7, color: '#2378f7' },
                  { offset: 1, color: '#83bff6' }
                ])
              }
            }
          }
        ]
      }

      this.workHoursChartInstance.setOption(option)
    },

    /**
     * 处理窗口大小变化
     */
    handleResize() {
      if (this.frequencyChartInstance) {
        this.frequencyChartInstance.resize()
      }
      if (this.workHoursChartInstance) {
        this.workHoursChartInstance.resize()
      }
    },

    /**
     * 销毁图表实例
     */
    destroyCharts() {
      if (this.frequencyChartInstance) {
        this.frequencyChartInstance.dispose()
        this.frequencyChartInstance = null
      }
      if (this.workHoursChartInstance) {
        this.workHoursChartInstance.dispose()
        this.workHoursChartInstance = null
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.maintenance-trend-chart {
  .chart-container {
    margin-bottom: 32px;

    &:last-child {
      margin-bottom: 0;
    }

    .chart-title {
      margin-bottom: 16px;
      font-size: 15px;
      font-weight: 500;
      color: #303133;
    }

    .chart {
      width: 100%;
      height: 400px;
    }
  }
}
</style>

