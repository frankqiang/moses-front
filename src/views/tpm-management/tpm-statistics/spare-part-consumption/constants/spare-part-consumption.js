/**
 * 文件名称：spare-part-consumption.js
 * 文件描述：备件消耗分析常量配置
 * 创建日期：2024-01-20
 * 修改记录：
 *   - 2024-01-20: 初始创建
 */

// 时间粒度选项
export const TIME_PERIOD_OPTIONS = [
  { label: '日', value: '日' },
  { label: '周', value: '周' },
  { label: '月', value: '月' },
  { label: '年', value: '年' }
]

// 排序字段选项
export const SORT_BY_OPTIONS = [
  { label: '按消耗量', value: 'totalQuantity' },
  { label: '按成本', value: 'totalCost' },
  { label: '按频次', value: 'frequency' }
]

// 设备类型选项
export const EQUIPMENT_TYPE_OPTIONS = [
  { label: '退火炉', value: '退火炉' },
  { label: '行车', value: '行车' },
  { label: '自动料车', value: '自动料车' },
  { label: '备料台', value: '备料台' }
]

// 高消耗预警阈值（TOP N）
export const HIGH_CONSUMPTION_THRESHOLD = 5

// 成本格式化配置
export const COST_FORMAT_CONFIG = {
  prefix: '¥',
  decimalPlaces: 2,
  thousandsSeparator: ','
}

// 图表颜色配置
export const CHART_COLORS = {
  primary: '#1976D2', // 主色调 - 深蓝
  success: '#4CAF50', // 成功 - 绿色
  warning: '#FF9800', // 警告 - 橙色
  danger: '#F44336', // 危险 - 红色
  info: '#00BCD4', // 信息 - 青色
  secondary: '#9E9E9E' // 次要 - 灰色
}

// 趋势图表配置
export const TREND_CHART_SERIES = [
  {
    name: '消耗量',
    dataKey: 'totalQuantity',
    color: CHART_COLORS.primary,
    yAxisIndex: 0
  },
  {
    name: '交易次数',
    dataKey: 'transactionCount',
    color: CHART_COLORS.info,
    yAxisIndex: 0
  },
  {
    name: '备件种类',
    dataKey: 'uniquePartCount',
    color: CHART_COLORS.success,
    yAxisIndex: 0
  }
]

// 排名图表方向选项
export const RANKING_CHART_ORIENTATION = {
  HORIZONTAL: 'horizontal',
  VERTICAL: 'vertical'
}

// 表格列配置
export const TABLE_COLUMNS = [
  {
    prop: 'sparePartCode',
    label: '备件编码',
    minWidth: 120,
    sortable: false,
    fixed: 'left'
  },
  {
    prop: 'sparePartName',
    label: '备件名称',
    minWidth: 150,
    sortable: false,
    showOverflowTooltip: true
  },
  {
    prop: 'unit',
    label: '单位',
    width: 80,
    sortable: false,
    align: 'center'
  },
  {
    prop: 'unitPrice',
    label: '单价（元）',
    width: 120,
    sortable: false,
    align: 'right'
  },
  {
    prop: 'totalQuantity',
    label: '总消耗量',
    width: 120,
    sortable: false,
    align: 'right'
  },
  {
    prop: 'frequency',
    label: '使用频次',
    width: 120,
    sortable: false,
    align: 'right'
  },
  {
    prop: 'totalCost',
    label: '总成本（元）',
    width: 140,
    sortable: false,
    align: 'right'
  }
]

// 默认查询参数
export const DEFAULT_QUERY_PARAMS = {
  timePeriod: '月',
  sortBy: 'totalQuantity'
}

