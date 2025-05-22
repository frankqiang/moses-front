/**
 * 工艺曲线图表组件
 * 功能描述：可视化展示工艺模板的温度曲线，基于ECharts实现
 * 创建日期：2024-11-15
 */
<template>
  <div class="process-curve-chart">
    <div class="chart-header">
      <div class="chart-title">工艺温度曲线</div>
      <div class="chart-actions">
        <el-button v-if="downloadable" type="text" icon="el-icon-download" @click="downloadChart" title="下载图表"></el-button>
      </div>
    </div>
    
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
    },
    // 是否允许下载
    downloadable: {
      type: Boolean,
      default: true
    },
    // 起始温度（通常为环境温度）
    initialTemp: {
      type: Number,
      default: 25
    },
    // 主题
    theme: {
      type: String,
      default: 'light' // 'light' 或 'dark'
    }
  },
  data() {
    return {
      chart: null,
      resizeObserver: null,
      lineColor: '#409EFF',
      yAxisMax: 1200,
      // 图表数据
      currentData: {
        xAxis: [],
        yAxis: [],
        markPoints: [],
        markAreas: []
      }
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
      if (!this.segments || !this.segments.length) return [this.initialTemp];
      
      // 起始点为初始温度
      const tempPoints = [this.initialTemp]
      
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
      
      // 添加起始点
      points.push({
        name: `起始点`,
        coord: [0, this.initialTemp],
        value: this.initialTemp,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: {
          color: '#67C23A'
        },
        label: {
          formatter: `起始\n${this.initialTemp}°C`,
          position: 'top'
        }
      })
      
      this.segments.forEach((segment, index) => {
        if (!segment) return;
        
        // 每段的结束点
        accumulatedTime += segment.duration || 0
        
        // 根据段类型确定标记颜色
        const color = this.getSegmentColor(segment.segmentType)
        
        points.push({
          name: `${segment.segmentType || '未知'}-${index + 1}`,
          coord: [accumulatedTime, segment.targetTemp || 0],
          value: segment.targetTemp || 0,
          symbol: 'circle',
          symbolSize: 8,
          itemStyle: {
            color
          },
          label: {
            formatter: `${segment.segmentType || '未知'}\n${segment.targetTemp || 0}°C`,
            position: 'top',
            backgroundColor: 'rgba(255,255,255,0.7)',
            padding: [3, 5],
            borderRadius: 2
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
            color: this.getSegmentColor(segment.segmentType, 0.15), // 增加透明度使区域更明显
            borderColor: this.getSegmentColor(segment.segmentType, 0.5),
            borderWidth: 1
          },
          label: {
            show: true,
            position: 'insideTop',
            formatter: `段${index + 1}: ${segment.segmentType}`,
            fontSize: 12,
            color: '#606266',
            backgroundColor: 'rgba(255,255,255,0.8)',
            padding: [2, 4],
            borderRadius: 2
          },
          coord: [
            [startTime, 0],
            [endTime, this.yAxisMax] // 覆盖整个Y轴
          ]
        })
        
        startTime = endTime
      })
      
      return areas
    },
    
    // X轴名称
    xAxisName() {
      return `时间 (小时)`
    }
  },
  watch: {
    // 监听工艺段数据变化，重新绘制图表
    segments: {
      handler() {
        this.updateChartData()
        this.updateChart()
      },
      deep: true,
      immediate: true
    },
    // 监听尺寸变化，重新绘制图表
    height() {
      this.resizeChart()
    },
    width() {
      this.resizeChart()
    },
    // 监听主题变化
    theme() {
      this.updateChart()
    },
    // 监听初始温度变化
    initialTemp() {
      this.updateChartData()
      this.updateChart()
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
        
        // 更新图表数据
        this.updateChartData();
        
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
    
    // 更新图表数据
    updateChartData() {
      this.currentData = {
        xAxis: this.xAxisData,
        yAxis: this.yAxisData,
        markPoints: this.markPoints,
        markAreas: this.markAreas
      }
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
          xAxis: { type: 'value', name: this.xAxisName },
          yAxis: { type: 'value', name: '温度 (°C)' },
          series: [{ type: 'line', data: [] }]
        });
        return;
      }
      
      // 计算温度最大值和最小值以适应Y轴刻度
      const maxTemp = Math.max(...this.currentData.yAxis, this.initialTemp)
      const minTemp = Math.min(...this.currentData.yAxis, this.initialTemp)
      const yAxisMin = Math.max(0, Math.floor(minTemp / 100) * 100)
      const yAxisMax = Math.min(this.yAxisMax, Math.ceil(maxTemp / 100) * 100 + 100)
      
      // 图表配置项
      const option = {
        backgroundColor: this.theme === 'dark' ? '#1f2d3d' : '#ffffff',
        grid: {
          left: '5%',
          right: '5%',
          bottom: '15%',
          top: '15%',
          containLabel: true
        },
        tooltip: {
          trigger: 'axis',
          formatter: (params) => {
            const timeValue = params[0].axisValue;
            const tempValue = params[0].data[1]; // 访问Y值
            return `${this.xAxisName}: ${timeValue}<br>温度: ${tempValue} °C`;
          },
          axisPointer: {
            animation: false,
            type: 'cross',
            lineStyle: {
              color: '#999',
              width: 1,
              type: 'dashed'
            }
          },
          backgroundColor: 'rgba(50,50,50,0.8)',
          borderColor: 'rgba(255,255,255,0.3)',
          borderWidth: 1,
          padding: [8, 12],
          textStyle: {
            color: '#fff',
            fontSize: 12
          }
        },
        legend: {
          data: ['温度曲线'],
          bottom: 10,
          selectedMode: false,
          textStyle: {
            color: this.theme === 'dark' ? '#e6e6e6' : '#333',
            fontSize: 12,
            fontWeight: 'bold'
          },
          icon: 'roundRect',
          itemWidth: 24,
          itemHeight: 12,
          itemGap: 20
        },
        xAxis: {
          type: 'value',
          name: this.xAxisName,
          nameLocation: 'middle',
          nameGap: 30,
          nameTextStyle: {
            fontSize: 12,
            color: this.theme === 'dark' ? '#ccc' : '#333',
            fontWeight: 'bold'
          },
          axisLabel: {
            formatter: '{value}',
            color: this.theme === 'dark' ? '#e6e6e6' : '#333',
            fontSize: 11
          },
          axisLine: {
            lineStyle: {
              color: this.theme === 'dark' ? '#555' : '#ccc',
              width: 2
            }
          },
          splitLine: {
            lineStyle: {
              color: this.theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              type: 'dashed'
            }
          }
        },
        yAxis: {
          type: 'value',
          name: '温度 (°C)',
          nameLocation: 'middle',
          nameGap: 40,
          nameTextStyle: {
            fontSize: 12,
            color: this.theme === 'dark' ? '#ccc' : '#333',
            fontWeight: 'bold'
          },
          min: yAxisMin,
          max: yAxisMax,
          axisLabel: {
            formatter: '{value}',
            color: this.theme === 'dark' ? '#e6e6e6' : '#333',
            fontSize: 11
          },
          axisLine: {
            lineStyle: {
              color: this.theme === 'dark' ? '#555' : '#ccc',
              width: 2
            }
          },
          splitLine: {
            lineStyle: {
              color: this.theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              type: 'dashed'
            }
          }
        },
        series: [
          {
            name: '温度曲线',
            type: 'line',
            data: this.combineXY(this.currentData.xAxis, this.currentData.yAxis),
            markPoint: {
              data: this.currentData.markPoints,
              symbol: 'pin',
              symbolSize: 40
            },
            markArea: {
              data: this.currentData.markAreas,
              silent: true
            },
            lineStyle: {
              width: 4,
              shadowColor: 'rgba(0,0,0,0.3)',
              shadowBlur: 10,
              shadowOffsetY: 8,
              color: this.lineColor
            },
            itemStyle: {
              color: this.lineColor,
              borderWidth: 2,
              borderColor: '#fff',
              shadowColor: 'rgba(0,0,0,0.3)',
              shadowBlur: 4
            },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [{
                  offset: 0,
                  color: this.adjustColorAlpha(this.lineColor, 0.3)
                }, {
                  offset: 1,
                  color: this.adjustColorAlpha(this.lineColor, 0)
                }]
              }
            },
            smooth: true,
            emphasis: {
              focus: 'series',
              blurScope: 'coordinateSystem',
              lineStyle: {
                width: 6,
                shadowBlur: 15
              },
              itemStyle: {
                borderWidth: 3,
                borderColor: '#fff',
                shadowBlur: 10
              }
            },
            symbol: 'circle',
            symbolSize: 8,
            connectNulls: true,
            animation: true,
            animationDuration: 1000,
            animationEasing: 'cubicOut'
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
    
    // 下载图表
    downloadChart() {
      if (!this.chart) return
      
      // 获取图片base64数据
      const imgData = this.chart.getDataURL({
        pixelRatio: 2,
        backgroundColor: '#fff'
      })
      
      // 创建下载链接
      const a = document.createElement('a')
      a.href = imgData
      a.download = `工艺温度曲线_${new Date().toISOString().slice(0, 10)}.png`
      a.click()
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
    },
    
    // 将X和Y轴数据转换为坐标点数组
    combineXY(xData, yData) {
      if (!xData || !xData.length || !yData || !yData.length) return []
      
      return xData.map((x, index) => {
        return [x, yData[index]]
      })
    },
    
    // 设置色彩透明度的辅助方法
    adjustColorAlpha(color, alpha) {
      // 如果已经是rgba格式
      if (color.startsWith('rgba')) {
        return color.replace(/rgba\((.+?),\s*[\d\.]+\)/, `rgba($1, ${alpha})`);
      }
      
      // 如果是十六进制格式，先转成rgb
      if (color.startsWith('#')) {
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      }
      
      // 如果是rgb格式
      if (color.startsWith('rgb')) {
        return color.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
      }
      
      // 默认返回
      return `rgba(0, 0, 0, ${alpha})`;
    }
  }
}
</script>

<style lang="scss" scoped>
.process-curve-chart {
  padding: 10px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  
  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    
    .chart-title {
      font-size: 18px;
      font-weight: bold;
      color: #303133;
    }
    
    .chart-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .el-button {
        margin-left: 10px;
        padding: 6px;
      }
    }
  }
  
  .chart-container {
    width: 100% !important;
    min-height: 300px;
    border-radius: 4px;
    overflow: hidden;
    background-color: #fafafa;
    border: 1px solid #ebeef5;
  }
}
</style>
