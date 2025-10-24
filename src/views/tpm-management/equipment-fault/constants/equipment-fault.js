/**
 * 文件名称：equipment-fault.js
 * 文件描述：设备故障管理模块基础常量
 * 创建日期：2025-01-20
 * 修改记录：
 *   - 2025-01-20: 初始创建
 */

// 故障等级枚举
export const FAILURE_LEVEL = {
  CRITICAL: 'I级-严重',
  MAJOR: 'II级-重大',
  NORMAL: 'III级-一般',
  MINOR: 'IV级-轻微'
}

// 影响程度枚举
export const IMPACT_DEGREE = {
  SHUTDOWN: '停机',
  PERFORMANCE_DEGRADATION: '性能下降',
  NO_IMPACT: '无影响'
}

// 故障类型枚举
export const FAILURE_TYPE = {
  MECHANICAL: '机械',
  ELECTRICAL: '电气',
  HYDRAULIC: '液压',
  CONTROL: '控制',
  OTHER: '其他'
}

// 故障处理状态枚举
export const FAILURE_STATUS = {
  PENDING: '待处理',
  IN_PROGRESS: '处理中',
  RESOLVED: '已解决',
  VERIFIED: '已验证',
  CLOSED: '已关闭'
}

// 默认分页配置
export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 10
}

// 默认排序
export const DEFAULT_SORT = 'failureTime:desc'

// 故障等级选项
export const FAILURE_LEVEL_OPTIONS = [
  { label: 'I级-严重', value: FAILURE_LEVEL.CRITICAL },
  { label: 'II级-重大', value: FAILURE_LEVEL.MAJOR },
  { label: 'III级-一般', value: FAILURE_LEVEL.NORMAL },
  { label: 'IV级-轻微', value: FAILURE_LEVEL.MINOR }
]

// 影响程度选项
export const IMPACT_DEGREE_OPTIONS = [
  { label: '停机', value: IMPACT_DEGREE.SHUTDOWN },
  { label: '性能下降', value: IMPACT_DEGREE.PERFORMANCE_DEGRADATION },
  { label: '无影响', value: IMPACT_DEGREE.NO_IMPACT }
]

// 故障类型选项
export const FAILURE_TYPE_OPTIONS = [
  { label: '机械', value: FAILURE_TYPE.MECHANICAL },
  { label: '电气', value: FAILURE_TYPE.ELECTRICAL },
  { label: '液压', value: FAILURE_TYPE.HYDRAULIC },
  { label: '控制', value: FAILURE_TYPE.CONTROL },
  { label: '其他', value: FAILURE_TYPE.OTHER }
]

// 故障状态选项
export const FAILURE_STATUS_OPTIONS = [
  { label: '待处理', value: FAILURE_STATUS.PENDING },
  { label: '处理中', value: FAILURE_STATUS.IN_PROGRESS },
  { label: '已解决', value: FAILURE_STATUS.RESOLVED },
  { label: '已验证', value: FAILURE_STATUS.VERIFIED },
  { label: '已关闭', value: FAILURE_STATUS.CLOSED }
]

// 是否重复故障选项
export const REPEAT_FAILURE_OPTIONS = [
  { label: '是', value: true },
  { label: '否', value: false }
]

// 故障等级配置
export const FAILURE_LEVEL_CONFIG = {
  textMap: {
    [FAILURE_LEVEL.CRITICAL]: 'I级-严重',
    [FAILURE_LEVEL.MAJOR]: 'II级-重大',
    [FAILURE_LEVEL.NORMAL]: 'III级-一般',
    [FAILURE_LEVEL.MINOR]: 'IV级-轻微'
  },
  typeMap: {
    [FAILURE_LEVEL.CRITICAL]: 'danger',
    [FAILURE_LEVEL.MAJOR]: 'warning',
    [FAILURE_LEVEL.NORMAL]: 'info',
    [FAILURE_LEVEL.MINOR]: 'success'
  },
  colorMap: {
    [FAILURE_LEVEL.CRITICAL]: '#F56C6C',
    [FAILURE_LEVEL.MAJOR]: '#E6A23C',
    [FAILURE_LEVEL.NORMAL]: '#909399',
    [FAILURE_LEVEL.MINOR]: '#67C23A'
  }
}

// 故障状态配置
export const FAILURE_STATUS_CONFIG = {
  textMap: {
    [FAILURE_STATUS.PENDING]: '待处理',
    [FAILURE_STATUS.IN_PROGRESS]: '处理中',
    [FAILURE_STATUS.RESOLVED]: '已解决',
    [FAILURE_STATUS.VERIFIED]: '已验证',
    [FAILURE_STATUS.CLOSED]: '已关闭'
  },
  typeMap: {
    [FAILURE_STATUS.PENDING]: 'info',
    [FAILURE_STATUS.IN_PROGRESS]: 'warning',
    [FAILURE_STATUS.RESOLVED]: 'success',
    [FAILURE_STATUS.VERIFIED]: 'primary',
    [FAILURE_STATUS.CLOSED]: 'info'
  }
}

