/**
 * 工艺曲线图表组件
 * 功能描述：可视化展示工艺模板的温度曲线，基于ECharts实现
 * 创建日期：2024-11-15
 */
<template>
  <div class="process-curve-chart">
    <div ref="chartContainer" class="chart-container"></div>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'ProcessCurveChart',
  props: {
    // 工艺段数据
    segments: {
      type: Array,
      default: () => []
    },
    // 图表高度
    height: {
      type: [String, Number],
      default: '300px'
    },
    // 图表宽度
    width: {
      type: [String, Number],
      default: '100%'
    },
    // 是否允许交互
    interactive: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      chart: null,
      resizeObserver: null
    }
  },
  computed: {
    // 计算X轴数据（时间点）
    xAxisData() {
      if (!this.segments || !this.segments.length) return [0];
      
      const timePoints = [0] // 起始点为0
      let accumulatedTime = 0
      
      this.segments.forEach(segment => {
        if (!segment) return;
        accumulatedTime += segment.duration || 0
        timePoints.push(accumulatedTime)
      })
      
      return timePoints
    },
    
    // 计算Y轴数据（温度点）
    yAxisData() {
      if (!this.segments || !this.segments.length) return [0];
      
      // 检查第一个段是否存在
      if (!this.segments[0]) return [0];
      
      const tempPoints = [this.segments[0].targetTemp || 0] // 起始点设为第一段的目标温度
      
      this.segments.forEach(segment => {
        if (!segment) return;
        tempPoints.push(segment.targetTemp || 0)
      })
      
      return tempPoints
    },
    
    // 计算工艺段类型标记点
    markPoints() {
      if (!this.segments || !this.segments.length) return [];
      
      const points = []
      let accumulatedTime = 0
      
      this.segments.forEach((segment, index) => {
        if (!segment) return;
        
        // 每段的结束点
        accumulatedTime += segment.duration || 0
        points.push({
          name: `${segment.segmentType || '未知'}-${index + 1}`,
          coord: [accumulatedTime, segment.targetTemp || 0],
          value: segment.targetTemp || 0,
          itemStyle: {
            color: this.getSegmentColor(segment.segmentType)
          },
          label: {
            formatter: `${segment.segmentType || '未知'}\n${segment.targetTemp || 0}°C`,
            position: 'top'
          }
        })
      })
      
      return points
    },
    
    // 计算工艺段区域
    markAreas() {
      if (!this.segments || !this.segments.length) return [];
      
      const areas = []
      let startTime = 0
      
      this.segments.forEach((segment, index) => {
        if (!segment) return;
        
        const endTime = startTime + (segment.duration || 0)
        
        areas.push({
          name: `段${index + 1}: ${segment.segmentType || '未知'}`,
          itemStyle: {
            color: this.getSegmentColor(segment.segmentType, 0.1)
          },
          label: {
            show: true,
            position: 'insideTop',
            formatter: `段${index + 1}`
          },
          coord: [
            [startTime, 0],
            [endTime, 1000] // 使用一个足够大的值覆盖整个Y轴
          ]
        })
        
        startTime = endTime
      })
      
      return areas
    }
  },
  watch: {
    // 监听工艺段数据变化，重新绘制图表
    segments: {
      handler() {
        this.updateChart()
      },
      deep: true
    },
    // 监听尺寸变化，重新绘制图表
    height() {
      this.resizeChart()
    },
    width() {
      this.resizeChart()
    }
  },
  mounted() {
    this.initChart()
    
    // 添加窗口大小变化监听
    this.resizeObserver = new ResizeObserver(() => {
      if (this.chart) {
        this.chart.resize()
      }
    })
    this.resizeObserver.observe(this.$refs.chartContainer)
    
    // 添加额外的窗口大小变化监听
    window.addEventListener('resize', this.handleWindowResize)
    
    // 延迟执行一次resize以确保正确渲染
    this.$nextTick(() => {
      setTimeout(() => {
        if (this.chart) {
          this.chart.resize()
        }
      }, 300)
    })
  },
  beforeDestroy() {
    // 销毁图表实例
    if (this.chart) {
      this.chart.dispose()
      this.chart = null
    }
    
    // 移除窗口大小变化监听
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
      this.resizeObserver = null
    }
    
    // 移除窗口事件监听
    window.removeEventListener('resize', this.handleWindowResize)
  },
  methods: {
    // 处理窗口大小变化
    handleWindowResize() {
      if (this.chart) {
        this.chart.resize()
      }
    },
    
    // 初始化图表
    initChart() {
      // 延迟初始化，确保DOM已经渲染完成
      this.$nextTick(() => {
        // 获取父容器的宽度
        const parentWidth = this.$el.parentNode.clientWidth || 800;
        
        // 设置容器高度和宽度
        const chartHeight = typeof this.height === 'number' ? this.height : parseInt(this.height);
        this.$refs.chartContainer.style.height = `${chartHeight}px`;
        this.$refs.chartContainer.style.width = `${parentWidth}px`;
        
        // 初始化ECharts实例
        this.chart = echarts.init(this.$refs.chartContainer);
        
        // 绘制图表
        this.updateChart();
        
        // 添加点击事件（如果允许交互）
        if (this.interactive) {
          this.chart.on('click', this.handleChartClick);
        }
        
        // 初始化后强制重新调整大小
        this.chart.resize();
      });
    },
    
    // 更新图表
    updateChart() {
      if (!this.chart) return;
      
      // 检查数据是否有效
      if (!this.segments || !this.segments.length) {
        // 设置空图表
        this.chart.setOption({
          title: {
            text: '工艺温度曲线 (无数据)',
            left: 'center'
          },
          xAxis: { type: 'value', name: '时间 (分钟)' },
          yAxis: { type: 'value', name: '温度 (°C)' },
          series: [{ type: 'line', data: [] }]
        });
        return;
      }
      
      // 图表配置项
      const option = {
        title: {
          text: '工艺温度曲线',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          formatter: (params) => {
            const timeValue = params[0].axisValue;
            const tempValue = params[0].data;
            return `时间: ${timeValue} 分钟<br>温度: ${tempValue} °C`;
          }
        },
        legend: {
          data: ['温度曲线'],
          bottom: 10
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          top: '15%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          name: '时间 (分钟)',
          nameLocation: 'middle',
          nameGap: 30,
          axisLabel: {
            formatter: '{value}'
          }
        },
        yAxis: {
          type: 'value',
          name: '温度 (°C)',
          nameLocation: 'middle',
          nameGap: 30,
          axisLabel: {
            formatter: '{value}'
          }
        },
        series: [
          {
            name: '温度曲线',
            type: 'line',
            data: this.yAxisData,
            markPoint: {
              data: this.markPoints
            },
            markArea: {
              data: this.markAreas
            },
            lineStyle: {
              width: 3,
              shadowColor: 'rgba(0,0,0,0.3)',
              shadowBlur: 10,
              shadowOffsetY: 8
            },
            itemStyle: {
              color: '#409EFF'
            },
            smooth: true
          }
        ]
      };
      
      // 应用配置项
      this.chart.setOption(option, true);
      
      // 强制重新调整大小
      this.$nextTick(() => {
        this.chart.resize({
          width: 'auto',
          animation: {
            duration: 300
          }
        });
      });
    },
    
    // 重新调整图表大小
    resizeChart() {
      if (!this.chart) return;
      
      this.$nextTick(() => {
        // 获取父容器的宽度
        const parentWidth = this.$el.parentNode.clientWidth || 800;
        
        // 更新容器高度和宽度
        const chartHeight = typeof this.height === 'number' ? this.height : parseInt(this.height);
        this.$refs.chartContainer.style.height = `${chartHeight}px`;
        this.$refs.chartContainer.style.width = `${parentWidth}px`;
        
        // 重新调整图表大小
        this.chart.resize();
      });
    },
    
    // 处理图表点击事件
    handleChartClick(params) {
      // 触发点击事件
      this.$emit('chart-click', params)
    },
    
    // 根据段类型获取颜色
    getSegmentColor(segmentType, alpha = 1) {
      const colorMap = {
        '升温': `rgba(255, 152, 0, ${alpha})`,
        '保温': `rgba(76, 175, 80, ${alpha})`,
        '降温': `rgba(33, 150, 243, ${alpha})`,
        '快速冷却': `rgba(156, 39, 176, ${alpha})`
      }
      
      return colorMap[segmentType] || `rgba(158, 158, 158, ${alpha})`
    }
  }
}
</script>

<style lang="scss" scoped>
.process-curve-chart {
  padding: 10px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  
  .chart-container {
    width: 100% !important;
    min-height: 300px;
  }
}
</style>
