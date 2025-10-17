/**
 * 文件名称：format-utils.js
 * 文件描述：维护任务管理数据格式化和工具函数
 * 创建日期：2024-01-20
 * 修改记录：
 *   - 2024-01-20: 初始创建
 */

import { parseTime } from '@/utils'

/**
 * 日期时间格式化函数
 * 将ISO 8601格式的日期时间转换为本地时间格式 "YYYY-MM-DD HH:mm:ss"
 * @param {string|Date|number} time - 时间（ISO 8601字符串、Date对象或时间戳）
 * @param {string} format - 格式化模板，默认 '{y}-{m}-{d} {h}:{i}:{s}'
 * @returns {string} 格式化后的时间字符串
 */
export function formatDateTime(time, format = '{y}-{m}-{d} {h}:{i}:{s}') {
  if (!time) return ''
  return parseTime(time, format)
}

/**
 * 任务状态枚举映射为StatusTag类型
 * @param {string} status - 任务状态（待执行/执行中/已完成/已取消/已延期）
 * @returns {string} StatusTag类型（success/warning/info/danger）
 */
export function getTaskStatusType(status) {
  const statusTypeMap = {
    '待执行': 'info',
    '执行中': 'warning',
    '已完成': 'success',
    '已取消': 'danger',
    '已延期': 'warning'
  }
  return statusTypeMap[status] || 'info'
}

/**
 * 任务类型枚举转换为中文显示
 * @param {string} taskType - 任务类型（计划维护/应急抢修/状态检修）
 * @returns {string} 中文显示文本
 */
export function getTaskTypeLabel(taskType) {
  const taskTypeMap = {
    '计划维护': '计划维护',
    '应急抢修': '应急抢修',
    '状态检修': '状态检修'
  }
  return taskTypeMap[taskType] || taskType
}

/**
 * 逾期判断函数
 * 判断任务是否逾期：计划开始时间 < 当前时间 且 状态为待执行或执行中
 * @param {Object} task - 维护任务对象
 * @param {string} task.plannedStartTime - 计划开始时间（ISO 8601格式）
 * @param {string} task.status - 任务状态
 * @returns {boolean} 是否逾期
 */
export function isTaskOverdue(task) {
  if (!task || !task.plannedStartTime) return false

  const plannedStartTime = new Date(task.plannedStartTime)
  const currentTime = new Date()

  const isOverdueStatus = task.status === '待执行' || task.status === '执行中'

  return plannedStartTime < currentTime && isOverdueStatus
}

/**
 * 任务时长计算函数
 * 根据实际开始时间和实际结束时间计算任务时长（小时数，保留2位小数）
 * @param {string} actualStartTime - 实际开始时间（ISO 8601格式）
 * @param {string} actualEndTime - 实际结束时间（ISO 8601格式）
 * @returns {number} 任务时长（小时数，保留2位小数）
 */
export function calculateTaskDuration(actualStartTime, actualEndTime) {
  if (!actualStartTime || !actualEndTime) return 0

  const startTime = new Date(actualStartTime)
  const endTime = new Date(actualEndTime)

  // 计算时长（毫秒）
  const durationMs = endTime - startTime

  // 转换为小时数，保留2位小数
  const durationHours = durationMs / 1000 / 3600

  return Math.max(0, Number(durationHours.toFixed(2)))
}

/**
 * 执行人负载计算函数
 * 计算执行人的任务负载：待执行 + 执行中 + 已延期
 * @param {Array} tasks - 任务列表
 * @returns {number} 任务负载数量
 */
export function calculateAssigneeWorkload(tasks) {
  if (!Array.isArray(tasks)) return 0

  const workloadStatuses = ['待执行', '执行中', '已延期']

  return tasks.filter(task => workloadStatuses.includes(task.status)).length
}

/**
 * 查询参数构建函数
 * 过滤空值（undefined、null、空字符串）
 * @param {Object} params - 原始查询参数对象
 * @returns {Object} 过滤后的查询参数对象
 */
export function buildQueryParams(params) {
  if (!params || typeof params !== 'object') return {}

  const filteredParams = {}

  Object.keys(params).forEach(key => {
    const value = params[key]
    // 过滤 undefined、null、空字符串
    if (value !== undefined && value !== null && value !== '') {
      filteredParams[key] = value
    }
  })

  return filteredParams
}

/**
 * 分页参数构建函数
 * 构建标准的分页参数（page、limit、sortBy）
 * @param {Object} options - 分页选项
 * @param {number} options.page - 页码（最小值1，默认1）
 * @param {number} options.limit - 每页数量（最小值1，最大值100，默认10）
 * @param {string} options.sortBy - 排序字段（格式：字段名:asc/desc，默认plannedStartTime:asc）
 * @returns {Object} 标准化的分页参数对象
 */
export function buildPaginationParams(options = {}) {
  const {
    page = 1,
    limit = 10,
    sortBy = 'plannedStartTime:asc'
  } = options

  return {
    page: Math.max(1, Number(page) || 1),
    limit: Math.min(100, Math.max(1, Number(limit) || 10)),
    sortBy: sortBy || 'plannedStartTime:asc'
  }
}

/**
 * 合并查询参数和分页参数
 * @param {Object} queryParams - 查询参数
 * @param {Object} paginationParams - 分页参数
 * @returns {Object} 合并后的参数对象
 */
export function mergeParams(queryParams, paginationParams) {
  const filteredQuery = buildQueryParams(queryParams)
  const pagination = buildPaginationParams(paginationParams)

  return {
    ...filteredQuery,
    ...pagination
  }
}

export default {
  formatDateTime,
  getTaskStatusType,
  getTaskTypeLabel,
  isTaskOverdue,
  calculateTaskDuration,
  calculateAssigneeWorkload,
  buildQueryParams,
  buildPaginationParams,
  mergeParams
}

