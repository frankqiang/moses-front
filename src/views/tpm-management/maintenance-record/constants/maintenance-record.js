/**
 * 文件名称：maintenance-record.js
 * 文件描述：维护记录管理基础常量定义
 * 创建日期：2025-01-20
 * 修改记录：
 *   - 2025-01-20: 初始创建，定义维护类型、状态配置等常量
 */

// 维护类型枚举
export const MAINTENANCE_TYPE = {
  DAILY: '日常保养',
  PERIODIC: '定期检查',
  OVERHAUL: '大修',
  SPECIAL: '专项维护'
}

// 维护类型选项
export const MAINTENANCE_TYPE_OPTIONS = [
  { label: '日常保养', value: '日常保养' },
  { label: '定期检查', value: '定期检查' },
  { label: '大修', value: '大修' },
  { label: '专项维护', value: '专项维护' }
]

// 维护类型配置（用于StatusTag）
export const MAINTENANCE_TYPE_CONFIG = {
  textMap: {
    [MAINTENANCE_TYPE.DAILY]: '日常保养',
    [MAINTENANCE_TYPE.PERIODIC]: '定期检查',
    [MAINTENANCE_TYPE.OVERHAUL]: '大修',
    [MAINTENANCE_TYPE.SPECIAL]: '专项维护'
  },
  typeMap: {
    [MAINTENANCE_TYPE.DAILY]: 'info',
    [MAINTENANCE_TYPE.PERIODIC]: 'primary',
    [MAINTENANCE_TYPE.OVERHAUL]: 'warning',
    [MAINTENANCE_TYPE.SPECIAL]: 'success'
  }
}

// 默认分页参数
export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 10
}

// 默认排序（按维护日期降序）
export const DEFAULT_SORT = 'maintenanceDate:desc'

// 工时格式化精度
export const WORK_HOURS_PRECISION = 2

