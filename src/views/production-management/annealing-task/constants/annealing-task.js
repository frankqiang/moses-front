/**
 * 文件名称：annealing-task.js
 * 文件描述：退火任务管理模块基础常量定义
 * 创建日期：2025-10-18
 * 修改记录：
 *   - 2025-10-18: 初始创建，定义任务状态、优先级、来源等业务枚举
 */

// 任务状态
export const TASK_STATUS = {
  DRAFT: 'draft',
  PENDING_SCHEDULE: 'pending-schedule',
  SCHEDULED: 'scheduled',
  WAITING_LOADING: 'waiting-loading',
  LOADING: 'loading',
  WAITING_EXECUTE: 'waiting-execute',
  IN_PROGRESS: 'in-progress',
  WAITING_UNLOAD: 'waiting-unload',
  COMPLETED: 'completed',
  PAUSED: 'paused',
  CANCELLED: 'cancelled',
  TERMINATED: 'terminated'
}

// 任务状态选项
export const TASK_STATUS_OPTIONS = [
  { value: TASK_STATUS.DRAFT, label: '草稿' },
  { value: TASK_STATUS.PENDING_SCHEDULE, label: '待排程' },
  { value: TASK_STATUS.SCHEDULED, label: '已排程' },
  { value: TASK_STATUS.WAITING_LOADING, label: '待装炉' },
  { value: TASK_STATUS.LOADING, label: '装炉中' },
  { value: TASK_STATUS.WAITING_EXECUTE, label: '待执行' },
  { value: TASK_STATUS.IN_PROGRESS, label: '执行中' },
  { value: TASK_STATUS.WAITING_UNLOAD, label: '待出炉' },
  { value: TASK_STATUS.COMPLETED, label: '已完成' },
  { value: TASK_STATUS.PAUSED, label: '已暂停' },
  { value: TASK_STATUS.CANCELLED, label: '已取消' },
  { value: TASK_STATUS.TERMINATED, label: '异常终止' }
]

// 任务优先级
export const TASK_PRIORITY = {
  EMERGENCY: 'emergency',
  HIGH: 'high',
  NORMAL: 'normal',
  LOW: 'low'
}

// 任务优先级选项
export const TASK_PRIORITY_OPTIONS = [
  { value: TASK_PRIORITY.EMERGENCY, label: '紧急' },
  { value: TASK_PRIORITY.HIGH, label: '高' },
  { value: TASK_PRIORITY.NORMAL, label: '普通' },
  { value: TASK_PRIORITY.LOW, label: '低' }
]

// 任务来源
export const TASK_SOURCE = {
  PLAN_SPLIT: 'plan-split',
  MANUAL: 'manual'
}

// 任务来源选项
export const TASK_SOURCE_OPTIONS = [
  { value: TASK_SOURCE.PLAN_SPLIT, label: '计划拆分' },
  { value: TASK_SOURCE.MANUAL, label: '手工创建' }
]

// 物料类型
export const MATERIAL_TYPE = {
  BASKET: 'basket',
  STACK: 'stack'
}

// 物料类型选项
export const MATERIAL_TYPE_OPTIONS = [
  { value: MATERIAL_TYPE.BASKET, label: '料框' },
  { value: MATERIAL_TYPE.STACK, label: '料垛' }
]

// 炉容范围
export const FURNACE_CAPACITY = {
  MIN: 35,
  MAX: 42,
  TARGET: 40,
  TOLERANCE: 0.1
}

// 重量范围（单位：吨）
export const WEIGHT_LIMITS = {
  MIN: 0.001,
  MAX: 50,
  PRECISION: 6,
  STEP: 0.001
}

// 默认排序
export const DEFAULT_SORT = 'createdAt:desc'

// 默认分页参数
export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 20
}

// API 响应字段名称映射
export const API_RESPONSE_FIELDS = {
  list: 'results',
  page: 'page',
  limit: 'limit',
  totalPages: 'totalPages',
  totalResults: 'totalResults'
}

// 搜索支持的排序字段
export const SORTABLE_FIELDS = [
  'taskCode',
  'taskName',
  'status',
  'priority',
  'plannedLoadingAt',
  'plannedUnloadingAt',
  'plannedWeight',
  'actualWeight',
  'createdAt',
  'updatedAt'
]

