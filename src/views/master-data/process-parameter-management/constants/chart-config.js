/**
 * 文件名称：chart-config.js
 * 文件描述：工艺参数管理温度曲线图表配置
 * 创建日期：2025-09-29
 * 修改记录：
 *   - 2025-09-29: 初始创建，提供TASK002 P0阶段图表配置
 */

import { SEGMENT_TYPES, SEGMENT_COLOR_MAP } from './process-parameter-management'

export const TEMPERATURE_CHART_CONFIG = {
  grid: {
    top: 32,
    left: 40,
    right: 40,
    bottom: 32
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      crossStyle: {
        color: '#999'
      }
    },
    formatter: params => {
      if (!Array.isArray(params) || params.length === 0) {
        return ''
      }
      const point = params[0]
      const data = point.data || {}
      return (
        `段序号：${data.segmentOrder || '-'}<br/>` +
        `段类型：${data.segmentType || '-'}<br/>` +
        `目标温度：${data.targetTemperature ?? '-'} °C<br/>` +
        `持续时间：${data.duration ?? '-'} 分钟`
      )
    }
  },
  xAxis: {
    type: 'value',
    name: '时间 (min)',
    boundaryGap: false,
    min: 0,
    max: null,
    axisLabel: {
      color: '#666'
    }
  },
  yAxis: {
    type: 'value',
    name: '温度 (°C)',
    min: -100,
    max: 1500,
    axisLabel: {
      color: '#666'
    }
  },
  series: {
    type: 'line',
    smooth: false,
    symbol: 'circle',
    symbolSize: 8,
    lineStyle: {
      width: 2
    },
    itemStyle: {
      color: params => SEGMENT_COLOR_MAP[params.data.segmentType] || '#409EFF'
    },
    areaStyle: {
      opacity: 0.08
    }
  }
}

export const SEGMENT_TYPE_STYLE = {
  [SEGMENT_TYPES.HEATING]: {
    color: SEGMENT_COLOR_MAP[SEGMENT_TYPES.HEATING],
    dashed: false
  },
  [SEGMENT_TYPES.HOLDING]: {
    color: SEGMENT_COLOR_MAP[SEGMENT_TYPES.HOLDING],
    dashed: true
  },
  [SEGMENT_TYPES.COOLING]: {
    color: SEGMENT_COLOR_MAP[SEGMENT_TYPES.COOLING],
    dashed: false
  },
  [SEGMENT_TYPES.QUICK_COOLING]: {
    color: SEGMENT_COLOR_MAP[SEGMENT_TYPES.QUICK_COOLING],
    dashed: true
  }
}

export default {
  TEMPERATURE_CHART_CONFIG,
  SEGMENT_TYPE_STYLE
}

