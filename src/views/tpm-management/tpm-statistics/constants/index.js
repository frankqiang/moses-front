/**
 * 文件名称：index.js
 * 文件描述：TPM统计分析模块常量配置
 * 创建日期：2024-01-20
 * 修改记录：
 *   - 2024-01-20: 初始创建
 */

// 设备类型枚举
export const EQUIPMENT_TYPES = [
  { label: '全部设备', value: '' },
  { label: '退火炉', value: '退火炉' },
  { label: '行车', value: '行车' },
  { label: '自动料车', value: '自动料车' },
  { label: '备料台', value: '备料台' }
]

// 设备类型图标映射
export const EQUIPMENT_TYPE_ICONS = {
  '退火炉': 'el-icon-s-order',
  '行车': 'el-icon-truck',
  '自动料车': 'el-icon-shopping-cart-2',
  '备料台': 'el-icon-box'
}

// 设备状态枚举
export const EQUIPMENT_STATUS = {
  RUNNING: '运行',
  IDLE: '停机',
  MAINTENANCE: '维护',
  FAULT: '故障'
}

// 设备状态颜色映射
export const EQUIPMENT_STATUS_COLORS = {
  '运行': '#67C23A',
  '停机': '#909399',
  '维护': '#E6A23C',
  '故障': '#F56C6C'
}

// 维护任务状态枚举
export const MAINTENANCE_TASK_STATUS = {
  PENDING: '待执行',
  IN_PROGRESS: '执行中',
  COMPLETED: '已完成',
  OVERDUE: '已延期',
  CANCELLED: '已取消'
}

// 维护任务状态颜色映射
export const MAINTENANCE_STATUS_COLORS = {
  '待执行': '#909399',
  '执行中': '#409EFF',
  '已完成': '#67C23A',
  '已延期': '#F56C6C',
  '已取消': '#C0C4CC'
}

// 故障等级枚举
export const FAILURE_LEVELS = {
  SEVERE: 'I级-严重',
  MAJOR: 'II级-重大',
  GENERAL: 'III级-一般',
  MINOR: 'IV级-轻微'
}

// 故障等级颜色映射
export const FAILURE_LEVEL_COLORS = {
  'I级-严重': '#F56C6C',
  'II级-重大': '#E6A23C',
  'III级-一般': '#409EFF',
  'IV级-轻微': '#909399'
}

// 故障处理状态枚举
export const FAILURE_STATUS = {
  PENDING: '待处理',
  IN_PROGRESS: '处理中',
  RESOLVED: '已解决',
  CLOSED: '已关闭'
}

// KPI指标标准值
export const KPI_STANDARDS = {
  AVAILABILITY_RATE: {
    excellent: 95, // 优秀
    good: 85, // 良好
    warning: 75 // 警告
  },
  COMPLETION_RATE: {
    excellent: 98,
    good: 90,
    warning: 80
  },
  RESOLUTION_RATE: {
    excellent: 99,
    good: 95,
    warning: 85
  }
}

// 时间粒度枚举
export const TIME_PERIODS = [
  { label: '日', value: '日' },
  { label: '周', value: '周' },
  { label: '月', value: '月' },
  { label: '年', value: '年' }
]

// 自动刷新间隔选项（分钟）
export const REFRESH_INTERVALS = [
  { label: '5分钟', value: 5 },
  { label: '10分钟', value: 10 },
  { label: '15分钟', value: 15 },
  { label: '30分钟', value: 30 },
  { label: '不自动刷新', value: 0 }
]

// 默认刷新间隔（分钟）
export const DEFAULT_REFRESH_INTERVAL = 10

// 故障类型枚举
export const FAILURE_TYPES = [
  { label: '机械', value: '机械' },
  { label: '电气', value: '电气' },
  { label: '液压', value: '液压' },
  { label: '控制', value: '控制' },
  { label: '其他', value: '其他' }
]

// 故障类型颜色映射
export const FAILURE_TYPE_COLORS = {
  '机械': '#409EFF',
  '电气': '#E6A23C',
  '液压': '#67C23A',
  '控制': '#F56C6C',
  '其他': '#909399'
}

