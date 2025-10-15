<!--
文件名称：TemperatureCurveViewer.vue
文件描述：工艺模板参数可视化组件，支持多种图表类型展示（温度曲线、时间分布、风机参数）
创建日期：2025-09-30
修改记录：
  - 2025-09-30: 初始创建，完成TASK007 P0阶段与P1第6-8项需求
  - 2025-10-15: 重构支持多种图表类型切换，完成TASK09 P0+P1第5项需求
-->

<template>
  <section class="temperature-curve-viewer">
    <header class="temperature-curve-viewer__header">
      <div class="temperature-curve-viewer__title">
        <h4>{{ currentChartTitle }}</h4>
        <p>{{ currentChartDescription }}</p>
      </div>
      <div class="temperature-curve-viewer__actions">
        <!-- 图表类型切换 -->
        <el-radio-group
          v-model="chartType"
          size="mini"
          class="temperature-curve-viewer__chart-type"
        >
          <el-radio-button label="temperature">温度曲线</el-radio-button>
          <el-radio-button label="time">时间分布</el-radio-button>
          <el-radio-button label="fan">风机参数</el-radio-button>
        </el-radio-group>

        <el-tooltip
          effect="dark"
          content="导出当前图表截图"
          placement="top"
        >
          <el-button
            size="mini"
            icon="el-icon-camera"
            :disabled="!hasData"
            @click="handleExportImage"
          >
            导出截图
          </el-button>
        </el-tooltip>

        <el-tooltip
          effect="dark"
          content="导出原始段数据(JSON)"
          placement="top"
        >
          <el-button
            size="mini"
            icon="el-icon-download"
            :disabled="!hasData"
            @click="handleExportData"
          >
            导出数据
          </el-button>
        </el-tooltip>

        <el-select
          v-if="comparisonSeries.length && chartType === 'temperature'"
          v-model="activeComparisonId"
          placeholder="选择对比版本"
          size="mini"
          clearable
          class="temperature-curve-viewer__comparison-select"
          @change="handleComparisonChange"
        >
          <el-option
            v-for="item in comparisonSeries"
            :key="item.id"
            :label="item.label"
            :value="item.id"
          />
        </el-select>

        <el-switch
          v-if="chartType === 'temperature'"
          v-model="showAlarmZones"
          active-text="显示报警区"
          inactive-text="隐藏报警区"
          size="mini"
        />
      </div>
    </header>

    <div class="temperature-curve-viewer__body">
      <section class="temperature-curve-viewer__chart-wrapper">
        <div
          v-if="errorMessage"
          class="temperature-curve-viewer__chart-error"
        >
          <i class="el-icon-warning-outline" />
          <p>{{ errorMessage }}</p>
        </div>
        <div
          v-else
          ref="chartRef"
          class="temperature-curve-viewer__chart"
        />
      </section>
      <aside class="temperature-curve-viewer__sidebar">
        <section class="temperature-curve-viewer__section">
          <h5>数据校验</h5>
          <el-timeline>
            <el-timeline-item
              v-for="item in validationMessages"
              :key="item.id"
              :type="item.type"
              :color="item.color"
            >
              <div class="temperature-curve-viewer__validation-item">
                <div class="temperature-curve-viewer__validation-text">{{ item.message }}</div>
                <div v-if="item.suggestion" class="temperature-curve-viewer__validation-suggestion">{{ item.suggestion }}</div>
              </div>
            </el-timeline-item>
          </el-timeline>
          <el-empty
            v-if="!validationMessages.length"
            description="暂无异常"
            :image-size="80"
          />
        </section>

        <section
          v-if="comparisonSeries.length"
          class="temperature-curve-viewer__section"
        >
          <h5>对比版本</h5>
          <ul class="temperature-curve-viewer__comparison-list">
            <li v-for="item in comparisonSeries" :key="item.id">
              <span class="comparison-dot" :style="{ backgroundColor: item.color }" />
              <span class="comparison-label" :title="item.label">{{ item.label }}</span>
            </li>
          </ul>
        </section>
      </aside>
    </div>
  </section>
</template>

<script>
import * as echarts from 'echarts/core'
import { LineChart, PieChart, BarChart } from 'echarts/charts'
import {
  TooltipComponent,
  GridComponent,
  LegendComponent,
  MarkLineComponent,
  MarkAreaComponent,
  DataZoomComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import debounce from 'lodash/debounce'
import cloneDeep from 'lodash/cloneDeep'
import {
  TEMPERATURE_CHART_CONFIG,
  SEGMENT_COLOR_MAP,
  TEMPERATURE_COMPARISON_COLORS,
  TEMPERATURE_ALARM_ZONES,
  DEVICE_CAPABILITY_ZONES,
  TEMPERATURE_SUDDEN_DROP_THRESHOLD
} from '../constants/chart-config'

echarts.use([
  LineChart,
  PieChart,
  BarChart,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  MarkLineComponent,
  MarkAreaComponent,
  DataZoomComponent,
  CanvasRenderer
])

export default {
  name: 'TemperatureCurveViewer',
  props: {
    segments: {
      type: Array,
      default: () => []
    },
    comparisonVersions: {
      type: Array,
      default: () => []
    },
    templateId: {
      type: String,
      default: ''
    },
    versionId: {
      type: String,
      default: ''
    },
    deviceCapability: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      chartInstance: null,
      chartType: 'temperature', // temperature, time, fan
      showAlarmZones: true,
      activeComparisonId: '',
      errorMessage: '',
      resizeHandler: null
    }
  },
  computed: {
    currentChartTitle() {
      const titles = {
        temperature: '温度曲线',
        time: '时间分布图',
        fan: '风机参数图'
      }
      return titles[this.chartType] || '工艺参数图'
    },
    currentChartDescription() {
      const descriptions = {
        temperature: '展示12段工艺参数的炉温和料温变化趋势',
        time: '展示各段时间占比和分布情况',
        fan: '展示循环风机、负压风机、吹洗风机的频率变化'
      }
      return descriptions[this.chartType] || ''
    },
    hasData() {
      return Array.isArray(this.segments) && this.segments.length > 0
    },
    computedDeviceZones() {
      if (this.deviceCapability && (this.deviceCapability.min || this.deviceCapability.max)) {
        return [
          {
            id: 'custom-device-range',
            label: '设备安全运行区',
            min: this.deviceCapability.min ?? 0,
            max: this.deviceCapability.max ?? 1200,
            color: 'rgba(103, 194, 58, 0.08)'
          }
        ]
      }
      return DEVICE_CAPABILITY_ZONES
    },
    comparisonSeries() {
      if (!Array.isArray(this.comparisonVersions)) {
        return []
      }
      return this.comparisonVersions.slice(0, TEMPERATURE_COMPARISON_COLORS.length).map((item, index) => ({
        id: item.id,
        label: `${item.versionNumber || '版本'}（${item.status || '未知状态'}）`,
        color: TEMPERATURE_COMPARISON_COLORS[index],
        segments: cloneDeep(item.segments || [])
      }))
    },
    validationMessages() {
      if (!this.hasData) {
        return [
          {
            id: 'no-data',
            type: 'warning',
            color: '#E6A23C',
            message: '尚未配置温度段，无法生成曲线',
            suggestion: '请在版本参数中至少配置一个温度段'
          }
        ]
      }

      const messages = []
      const sortedSegments = [...this.segments].sort((a, b) => (a.segmentOrder || 0) - (b.segmentOrder || 0))

      sortedSegments.forEach((segment, index) => {
        if (!segment.segmentType) {
          messages.push({
            id: `segment-${index}-type`,
            type: 'danger',
            color: '#F56C6C',
            message: `温度段#${index + 1} 未指定段类型`,
            suggestion: '请在“段类型”列选择升温/保温/降温/快速冷却'
          })
        }
        if (segment.targetTemperature === null || segment.targetTemperature === undefined) {
          messages.push({
            id: `segment-${index}-temperature`,
            type: 'danger',
            color: '#F56C6C',
            message: `温度段#${index + 1} 缺少目标温度`,
            suggestion: '目标温度为必填项，请补充精确值'
          })
        }
        if (!segment.duration) {
          messages.push({
            id: `segment-${index}-duration`,
            type: 'warning',
            color: '#E6A23C',
            message: `温度段#${index + 1} 未填写持续时间`,
            suggestion: '建议根据工艺要求指定持续时间（分钟）'
          })
        }

        if (index > 0) {
          const prev = sortedSegments[index - 1]
          const delta = Math.abs((segment.targetTemperature || 0) - (prev.targetTemperature || 0))
          if (delta >= TEMPERATURE_SUDDEN_DROP_THRESHOLD) {
            messages.push({
              id: `segment-${index}-jump`,
              type: 'warning',
              color: '#E6A23C',
              message: `温度段#${index} 与 #${index + 1} 之间温度变化幅度为 ${delta}°C`,
              suggestion: '请确认是否符合设备能力与材料安全要求'
            })
          }
        }
      })

      return messages
    }
  },
  watch: {
    chartType() {
      this.renderChart()
    },
    segments: {
      deep: true,
      handler() {
        this.renderChart()
      }
    },
    comparisonVersions: {
      deep: true,
      handler() {
        const series = this.comparisonSeries
        if (this.activeComparisonId && !series.some(item => item.id === this.activeComparisonId)) {
          this.activeComparisonId = ''
        }
        if (!this.activeComparisonId && series.length) {
          this.activeComparisonId = series[0].id
        }
        this.renderChart()
      }
    },
    deviceCapability: {
      deep: true,
      handler() {
        this.renderChart()
      }
    },
    showAlarmZones() {
      this.renderChart()
    },
    activeComparisonId() {
      this.renderChart()
    }
  },
  mounted() {
    this.initChart()
    this.renderChart()

    this.resizeHandler = debounce(() => {
      if (this.chartInstance) {
        this.chartInstance.resize()
      }
    }, 200)
    window.addEventListener('resize', this.resizeHandler)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeHandler)
    if (this.chartInstance) {
      this.chartInstance.dispose()
      this.chartInstance = null
    }
  },
  methods: {
    initChart() {
      if (this.chartInstance || !this.$refs.chartRef) {
        return
      }
      this.chartInstance = echarts.init(this.$refs.chartRef)
    },

    forceResize() {
      if (this.chartInstance) {
        this.$nextTick(() => {
          this.chartInstance.resize()
        })
      }
    },

    buildSeriesData(segmentList, color) {
      if (!Array.isArray(segmentList) || !segmentList.length) {
        return []
      }
      const sorted = [...segmentList].sort((a, b) => (a.segmentOrder || 0) - (b.segmentOrder || 0))
      let accumulatedMinutes = 0
      const points = []
      sorted.forEach(segment => {
        const duration = Number(segment.duration) || 0
        const targetTemp = Number(segment.targetTemperature)
        if (points.length === 0) {
          points.push({
            time: accumulatedMinutes,
            value: targetTemp,
            ...segment
          })
        }

        accumulatedMinutes += duration
        points.push({
          time: accumulatedMinutes,
          value: targetTemp,
          ...segment
        })
      })

      return points.map(point => ({
        name: `段#${point.segmentOrder}`,
        value: [point.time, point.value],
        segmentOrder: point.segmentOrder,
        segmentType: point.segmentType,
        targetTemperature: point.targetTemperature,
        duration: point.duration,
        color: color || SEGMENT_COLOR_MAP[point.segmentType] || '#409EFF'
      }))
    },

    buildMarkAreas() {
      if (!this.showAlarmZones) {
        return []
      }
      const zones = [...TEMPERATURE_ALARM_ZONES, ...this.computedDeviceZones]
      return zones.map(zone => [{
        name: zone.label,
        yAxis: zone.min,
        itemStyle: {
          color: zone.color
        },
        label: {
          show: true,
          position: 'insideTop',
          color: '#606266',
          formatter: zone.label
        }
      }, {
        yAxis: zone.max
      }])
    },

    buildComparisonSeries() {
      if (!this.activeComparisonId) {
        return []
      }
      const target = this.comparisonSeries.find(item => item.id === this.activeComparisonId)
      if (!target) {
        return []
      }
      return [
        {
          name: target.label,
          type: 'line',
          smooth: false,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: {
            width: 2,
            color: target.color,
            type: 'dashed'
          },
          itemStyle: {
            color: target.color
          },
          data: this.buildSeriesData(target.segments, target.color)
        }
      ]
    },

    renderChart() {
      if (!this.chartInstance) {
        this.initChart()
      }
      if (!this.chartInstance) {
        return
      }

      try {
        let option = null
        switch (this.chartType) {
          case 'temperature':
            option = this.buildTemperatureOption()
            break
          case 'time':
            option = this.buildTimeOption()
            break
          case 'fan':
            option = this.buildFanOption()
            break
          default:
            option = this.buildTemperatureOption()
        }
        this.chartInstance.setOption(option, true)
        this.errorMessage = ''
      } catch (error) {
        console.error('[TemperatureCurveViewer] render chart failed', error)
        this.errorMessage = '图表渲染失败，请检查输入数据'
      }
    },

    // 构建温度曲线图配置
    buildTemperatureOption() {
      const baseSeriesData = this.buildSeriesData(this.segments)
      return this.composeOption(baseSeriesData)
    },

    // 构建时间分布图配置
    buildTimeOption() {
      if (!this.hasData) {
        return this.buildEmptyOption()
      }

      const sorted = [...this.segments].sort((a, b) => (a.segmentOrder || 0) - (b.segmentOrder || 0))
      const totalTime = sorted.reduce((sum, seg) => sum + (Number(seg.timeSet) || 0), 0)

      const pieData = sorted.map(seg => ({
        name: `段${seg.segmentOrder}`,
        value: Number(seg.timeSet) || 0,
        segmentOrder: seg.segmentOrder,
        percentage: totalTime > 0 ? ((Number(seg.timeSet) || 0) / totalTime * 100).toFixed(1) : 0
      }))

      return {
        grid: {
          left: 60,
          right: 60,
          top: 60,
          bottom: 60
        },
        tooltip: {
          trigger: 'item',
          formatter: params => {
            const data = params.data || {}
            return [
              `${params.marker}${params.name}`,
              `时间：${data.value}小时`,
              `占比：${data.percentage}%`
            ].join('<br/>')
          }
        },
        legend: {
          orient: 'vertical',
          right: 10,
          top: 'center',
          data: pieData.map(item => item.name)
        },
        series: [
          {
            name: '时间分布',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: true,
              formatter: '{b}\n{d}%'
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
            data: pieData,
            color: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc', '#d4ec59', '#8dc1a9', '#759aa0']
          }
        ]
      }
    },

    // 构建风机参数图配置
    buildFanOption() {
      if (!this.hasData) {
        return this.buildEmptyOption()
      }

      const sorted = [...this.segments].sort((a, b) => (a.segmentOrder || 0) - (b.segmentOrder || 0))
      const xData = sorted.map(seg => `段${seg.segmentOrder}`)

      // 循环风机速度转换为数值（低速=30, 中速=50, 高速=70）
      const circulationFanData = sorted.map(seg => {
        const speed = seg.circulationFanSpeed || '低速'
        const speedMap = { '低速': 30, '中速': 50, '高速': 70 }
        return speedMap[speed] || 30
      })

      const negativePressureFanData = sorted.map(seg => Number(seg.negativePressureFan) || 0)
      const cleaningFanData = sorted.map(seg => Number(seg.cleaningFan) || 0)

      return {
        grid: {
          left: 60,
          right: 60,
          top: 80,
          bottom: 60
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: params => {
            if (!Array.isArray(params) || params.length === 0) {
              return ''
            }
            const segmentIndex = params[0].dataIndex
            const segment = sorted[segmentIndex]
            const lines = params.map(item => {
              let valueStr = `${item.value}`
              if (item.seriesName === '循环风机速度') {
                valueStr = segment.circulationFanSpeed || '低速'
              } else {
                valueStr = `${item.value} Hz`
              }
              return `${item.marker}${item.seriesName}：${valueStr}`
            })
            return `${params[0].name}<br/>${lines.join('<br/')}`
          }
        },
        legend: {
          top: 10,
          data: ['循环风机速度', '负压风机', '吹洗风机']
        },
        xAxis: {
          type: 'category',
          data: xData,
          axisLabel: {
            color: '#666'
          }
        },
        yAxis: {
          type: 'value',
          name: '频率 (Hz)',
          min: 0,
          max: 100,
          axisLabel: {
            color: '#666',
            formatter: '{value} Hz'
          }
        },
        dataZoom: [
          {
            type: 'slider',
            show: true,
            xAxisIndex: [0],
            start: 0,
            end: 100,
            bottom: 10
          }
        ],
        series: [
          {
            name: '循环风机速度',
            type: 'bar',
            data: circulationFanData,
            itemStyle: {
              color: '#5470c6'
            },
            barGap: 0
          },
          {
            name: '负压风机',
            type: 'bar',
            data: negativePressureFanData,
            itemStyle: {
              color: '#91cc75'
            }
          },
          {
            name: '吹洗风机',
            type: 'bar',
            data: cleaningFanData,
            itemStyle: {
              color: '#fac858'
            }
          }
        ]
      }
    },

    // 构建空数据提示配置
    buildEmptyOption() {
      return {
        title: {
          text: '暂无数据',
          left: 'center',
          top: 'middle',
          textStyle: {
            color: '#909399',
            fontSize: 16
          }
        }
      }
    },

    composeOption(seriesData) {
      const legendItems = ['当前版本']
      const comparisonLabel = this.getActiveComparisonLabel()
      if (comparisonLabel) {
        legendItems.push(comparisonLabel)
      }

      const option = {
        grid: { ...TEMPERATURE_CHART_CONFIG.grid },
        tooltip: {
          ...TEMPERATURE_CHART_CONFIG.tooltip,
          formatter: params => {
            if (!Array.isArray(params) || params.length === 0) {
              return ''
            }
            const lines = params.map(item => {
              const data = item.data || {}
              return [
                `${item.marker}${item.seriesName}`,
                `段序号：${data.segmentOrder || '-'}`,
                `段类型：${data.segmentType || '-'}`,
                `目标温度：${data.targetTemperature ?? '-'} °C`,
                `累计时间：${data.value ? data.value[0] : '-'} 分钟`
              ].join('<br/>')
            })
            return lines.join('<br/><br/>')
          }
        },
        legend: {
          top: 0,
          data: legendItems
        },
        xAxis: { ...TEMPERATURE_CHART_CONFIG.xAxis },
        yAxis: { ...TEMPERATURE_CHART_CONFIG.yAxis }
      }

      const baseSeries = {
        name: '当前版本',
        type: 'line',
        smooth: false,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          width: 3
        },
        itemStyle: {
          color: params => params.data?.color || '#409EFF'
        },
        areaStyle: TEMPERATURE_CHART_CONFIG.series.areaStyle,
        data: seriesData
      }

      const markAreas = this.buildMarkAreas()
      if (markAreas.length) {
        baseSeries.markArea = {
          silent: true,
          data: markAreas
        }
      }

      const comparisonSeries = this.buildComparisonSeries()

      option.series = [baseSeries, ...comparisonSeries]

      const times = seriesData.map(item => Number(item.value?.[0] || 0))
      const temps = seriesData.map(item => Number(item.value?.[1] || 0))

      const xMax = times.length ? Math.max(...times) : 0
      option.xAxis.max = xMax > 0 ? xMax : TEMPERATURE_CHART_CONFIG.xAxis.max

      const yValues = temps.length ? temps : [TEMPERATURE_CHART_CONFIG.yAxis.min]
      const yMax = Math.max(...yValues)
      option.yAxis.max = Math.min(Math.max(yMax + 50, 200), TEMPERATURE_CHART_CONFIG.yAxis.max)

      return option
    },

    handleExportImage() {
      if (!this.chartInstance) return
      const dataUrl = this.chartInstance.getDataURL({
        pixelRatio: 2,
        backgroundColor: '#fff'
      })
      const link = document.createElement('a')
      link.href = dataUrl
      const fileName = [
        'temperature-curve',
        this.templateId || 'template',
        this.versionId || 'version',
        Date.now()
      ].join('-')
      link.download = `${fileName}.png`
      link.click()
      this.$message.success('曲线截图导出成功')
    },

    handleExportData() {
      const payload = {
        templateId: this.templateId,
        versionId: this.versionId,
        segments: this.segments,
        comparison: this.activeComparisonId
          ? this.comparisonSeries.find(item => item.id === this.activeComparisonId)
          : null
      }
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `temperature-curve-data-${Date.now()}.json`
      link.click()
      URL.revokeObjectURL(url)
      this.$message.success('曲线数据导出成功')
    },

    handleComparisonChange() {
      this.$emit('comparison-change', this.activeComparisonId)
    },

    getActiveComparisonLabel() {
      const target = this.comparisonSeries.find(item => item.id === this.activeComparisonId)
      return target ? target.label : ''
    }
  }
}
</script>

<style lang="scss" scoped>
.temperature-curve-viewer {
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 6px 18px rgba(31, 45, 61, 0.06);
  min-height: 420px;
}

.temperature-curve-viewer__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.temperature-curve-viewer__title h4 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2d3d;
}

.temperature-curve-viewer__title p {
  margin: 4px 0 0;
  font-size: 12px;
  color: #909399;
}

.temperature-curve-viewer__actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.temperature-curve-viewer__chart-type {
  ::v-deep .el-radio-button__inner {
    padding: 7px 15px;
  }
}

.temperature-curve-viewer__comparison-select {
  width: 220px;
}

.temperature-curve-viewer__body {
  display: flex;
  gap: 20px;
}

.temperature-curve-viewer__chart-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 360px;
}

.temperature-curve-viewer__chart {
  flex: 1;
  height: 360px;
}

.temperature-curve-viewer__chart-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #f56c6c;
  background: #fef0f0;
  border-radius: 10px;
  padding: 24px;
  text-align: center;

  i {
    font-size: 32px;
    margin-bottom: 12px;
  }

  p {
    margin: 0;
    font-size: 14px;
    color: #f56c6c;
  }
}

.temperature-curve-viewer__sidebar {
  width: 280px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.temperature-curve-viewer__section {
  background: #f9fafc;
  border-radius: 10px;
  padding: 12px 16px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

.temperature-curve-viewer__section h5 {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 600;
  color: #1f2d3d;
}

.temperature-curve-viewer__validation-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.temperature-curve-viewer__validation-text {
  font-size: 13px;
  color: #303133;
}

.temperature-curve-viewer__validation-suggestion {
  font-size: 12px;
  color: #606266;
}

.temperature-curve-viewer__comparison-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.temperature-curve-viewer__comparison-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #303133;
}

.comparison-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.comparison-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 1440px) {
  .temperature-curve-viewer__body {
    flex-direction: column;
  }

  .temperature-curve-viewer__sidebar {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
  }

  .temperature-curve-viewer__section {
    flex: 1;
  }
}
</style>
