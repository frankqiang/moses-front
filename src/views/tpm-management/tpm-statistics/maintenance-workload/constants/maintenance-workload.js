/**
 * 文件名称：maintenance-workload.js
 * 文件描述：维护工作量统计模块常量配置
 * 创建日期：2024-01-20
 * 修改记录：
 *   - 2024-01-20: 初始创建
 */

// 设备类型枚举
export const EQUIPMENT_TYPE_OPTIONS = [
  { label: '全部设备', value: '' },
  { label: '退火炉', value: '退火炉' },
  { label: '行车', value: '行车' },
  { label: '自动料车', value: '自动料车' },
  { label: '备料台', value: '备料台' }
]

// 时间粒度枚举
export const TIME_PERIOD_OPTIONS = [
  { label: '日', value: '日' },
  { label: '周', value: '周' },
  { label: '月', value: '月' },
  { label: '年', value: '年' }
]

// 分组方式枚举
export const GROUP_BY_OPTIONS = [
  { label: '按维护人员', value: 'assignee' },
  { label: '按设备类型', value: 'equipmentType' },
  { label: '按维护类型', value: 'maintenanceType' }
]

// 维护类型枚举
export const MAINTENANCE_TYPE_OPTIONS = [
  { label: '预防性维护', value: '预防性维护' },
  { label: '纠正性维护', value: '纠正性维护' },
  { label: '改善性维护', value: '改善性维护' },
  { label: '预测性维护', value: '预测性维护' },
  { label: '应急维护', value: '应急维护' }
]

// 工作量等级标准（单人月度）
export const WORKLOAD_LEVEL_STANDARDS = {
  OVERLOAD: {
    tasks: 60,
    hours: 200,
    label: '过高',
    color: '#F56C6C',
    suggestion: '调配任务，增加人手'
  },
  HIGH: {
    tasks: 45,
    hours: 150,
    label: '正常偏高',
    color: '#E6A23C',
    suggestion: '维持现状，适当调整'
  },
  NORMAL: {
    tasks: 30,
    hours: 100,
    label: '正常',
    color: '#67C23A',
    suggestion: '继续保持'
  },
  LOW: {
    tasks: 15,
    hours: 50,
    label: '正常偏低',
    color: '#409EFF',
    suggestion: '可适当增加任务'
  },
  UNDERLOAD: {
    tasks: 0,
    hours: 0,
    label: '过低',
    color: '#909399',
    suggestion: '优化任务分配或培训'
  }
}

// 平均工时评估标准
export const AVG_WORK_HOURS_STANDARDS = {
  HIGH_EFFICIENT: {
    max: 3,
    label: '高效',
    color: '#67C23A',
    description: '任务简单或人员经验丰富'
  },
  NORMAL: {
    min: 3,
    max: 6,
    label: '正常',
    color: '#409EFF',
    description: '任务复杂度适中，符合预期'
  },
  SLOW: {
    min: 6,
    max: 10,
    label: '偏慢',
    color: '#E6A23C',
    description: '任务复杂或经验不足'
  },
  INEFFICIENT: {
    min: 10,
    label: '低效',
    color: '#F56C6C',
    description: '任务极其复杂或存在流程问题'
  }
}

// 完成率评价标准
export const COMPLETION_RATE_STANDARDS = {
  EXCELLENT: {
    min: 95,
    label: '优秀',
    color: '#67C23A'
  },
  GOOD: {
    min: 90,
    max: 95,
    label: '良好',
    color: '#409EFF'
  },
  NEED_IMPROVEMENT: {
    max: 90,
    label: '需要改善',
    color: '#F56C6C'
  }
}

// 工作量均衡度标准（与平均值的偏差百分比）
export const BALANCE_THRESHOLD = 30 // 超过30%视为异常

// 排序字段选项
export const SORT_OPTIONS = [
  { label: '按总任务数', value: 'totalTasks' },
  { label: '按总工时', value: 'totalWorkHours' },
  { label: '按完成率', value: 'completionRate' },
  { label: '按平均工时', value: 'avgWorkHours' }
]

// 图表颜色配置
export const CHART_COLORS = {
  primary: '#409EFF',
  success: '#67C23A',
  warning: '#E6A23C',
  danger: '#F56C6C',
  info: '#909399',
  purple: '#9B59B6',
  cyan: '#00BCD4',
  orange: '#FF9800'
}

// 趋势图颜色序列
export const TREND_COLORS = [
  '#409EFF',
  '#67C23A',
  '#E6A23C',
  '#F56C6C',
  '#9B59B6',
  '#00BCD4',
  '#FF9800',
  '#909399'
]

