/**
 * 文件名称：production-plan-management.js
 * 文件描述：生产计划管理模块基础常量配置
 * 创建日期：2025-01-21
 * 修改记录：
 *   - 2025-01-21: 初始创建
 */

// 计划来源
export const PLAN_SOURCE = {
  ERP: 'ERP',
  MANUAL: 'MANUAL'
}

// 计划来源映射（中文）
export const PLAN_SOURCE_MAP = {
  ERP: 'ERP系统',
  MANUAL: '手工创建'
}

// 计划状态
export const PLAN_STATUS = {
  RECEIVED: 'RECEIVED',
  CONFIRMED: 'CONFIRMED',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  PARTIALLY_RELEASED: 'PARTIALLY_RELEASED',
  RELEASED: 'RELEASED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
}

// 计划状态映射（中文）
export const PLAN_STATUS_MAP = {
  RECEIVED: '已接收',
  CONFIRMED: '已确认',
  PENDING_APPROVAL: '待审批',
  PARTIALLY_RELEASED: '部分下达',
  RELEASED: '已下达',
  IN_PROGRESS: '执行中',
  COMPLETED: '已完成',
  CANCELLED: '已取消'
}

// 计划状态颜色映射
export const PLAN_STATUS_TYPE_MAP = {
  RECEIVED: 'info',
  CONFIRMED: 'primary',
  PENDING_APPROVAL: 'warning',
  PARTIALLY_RELEASED: '',
  RELEASED: 'success',
  IN_PROGRESS: 'primary',
  COMPLETED: 'success',
  CANCELLED: 'danger'
}

// 计划优先级
export const PLAN_PRIORITY = {
  LOW: 'LOW',
  NORMAL: 'NORMAL',
  HIGH: 'HIGH',
  URGENT: 'URGENT'
}

// 计划优先级映射（中文）
export const PLAN_PRIORITY_MAP = {
  LOW: '低',
  NORMAL: '普通',
  HIGH: '高',
  URGENT: '紧急'
}

// 计划优先级颜色映射
export const PLAN_PRIORITY_TYPE_MAP = {
  LOW: 'info',
  NORMAL: 'primary',
  HIGH: 'warning',
  URGENT: 'danger'
}

// 计划状态选项（用于筛选）
export const PLAN_STATUS_OPTIONS = Object.entries(PLAN_STATUS_MAP).map(([value, label]) => ({
  value,
  label
}))

// 计划来源选项（用于筛选）
export const PLAN_SOURCE_OPTIONS = Object.entries(PLAN_SOURCE_MAP).map(([value, label]) => ({
  value,
  label
}))

// 计划优先级选项（用于筛选）
export const PLAN_PRIORITY_OPTIONS = Object.entries(PLAN_PRIORITY_MAP).map(([value, label]) => ({
  value,
  label
}))

// 默认分页配置
export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 20
}

// 默认排序
export const DEFAULT_SORT = 'createdAt:desc'

// 输出格式
export const OUTPUT_FORMAT = {
  TABLE: 'table',
  GANTT: 'gantt'
}

// 输出格式选项
export const OUTPUT_FORMAT_OPTIONS = [
  { value: OUTPUT_FORMAT.TABLE, label: '表格视图', icon: 'el-icon-s-grid' },
  { value: OUTPUT_FORMAT.GANTT, label: '甘特图', icon: 'el-icon-data-line' }
]

// 自动刷新间隔（毫秒）
export const AUTO_REFRESH_INTERVAL = 30000 // 30秒

// 子批次状态
export const ITEM_STATUS = {
  DRAFT: 'DRAFT',
  READY_FOR_SCHEDULING: 'READY_FOR_SCHEDULING',
  SCHEDULED: 'SCHEDULED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
}

// 子批次状态映射（中文）
export const ITEM_STATUS_MAP = {
  DRAFT: '草稿',
  READY_FOR_SCHEDULING: '待排程',
  SCHEDULED: '已排程',
  IN_PROGRESS: '执行中',
  COMPLETED: '已完成',
  CANCELLED: '已取消'
}

// 子批次状态颜色映射
export const ITEM_STATUS_TYPE_MAP = {
  DRAFT: 'info',
  READY_FOR_SCHEDULING: 'warning',
  SCHEDULED: 'primary',
  IN_PROGRESS: '',
  COMPLETED: 'success',
  CANCELLED: 'danger'
}

// 子批次状态选项（用于筛选）
export const ITEM_STATUS_OPTIONS = Object.entries(ITEM_STATUS_MAP).map(([value, label]) => ({
  value,
  label
}))

// 状态流转规则 - 定义从当前状态可以转换到哪些目标状态
export const STATUS_TRANSITION_RULES = {
  RECEIVED: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PENDING_APPROVAL', 'CANCELLED'],
  PENDING_APPROVAL: ['RELEASED', 'CONFIRMED', 'CANCELLED'],
  RELEASED: ['PARTIALLY_RELEASED', 'IN_PROGRESS', 'CANCELLED'],
  PARTIALLY_RELEASED: ['IN_PROGRESS', 'RELEASED', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: []
}

// 关键状态变更（需要审批）
export const CRITICAL_STATUS_CHANGES = ['RELEASED', 'CANCELLED']

// 审批状态
export const APPROVAL_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED'
}

// 审批状态映射（中文）
export const APPROVAL_STATUS_MAP = {
  PENDING: '待审批',
  APPROVED: '已通过',
  REJECTED: '已驳回',
  CANCELLED: '已取消'
}

// 审批状态颜色映射
export const APPROVAL_STATUS_TYPE_MAP = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
  CANCELLED: 'info'
}

// 审批状态选项（用于筛选）
export const APPROVAL_STATUS_OPTIONS = Object.entries(APPROVAL_STATUS_MAP).map(([value, label]) => ({
  value,
  label
}))

