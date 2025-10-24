/**
 * 文件名称：index.js
 * 文件描述：设备故障管理模块工具函数
 * 创建日期：2025-01-20
 * 修改记录：
 *   - 2025-01-20: 初始创建
 */

import { parseTime, formatQueryParams } from '@/utils'
import {
  FAILURE_LEVEL_CONFIG,
  FAILURE_STATUS_CONFIG,
  IMPACT_DEGREE,
  FAILURE_TYPE
} from '../constants/equipment-fault'

/**
 * 格式化日期时间为 YYYY-MM-DD HH:mm:ss
 * @param {string|Date} dateTime - ISO 8601格式的日期时间字符串或Date对象
 * @returns {string} 格式化后的日期时间字符串
 */
export function formatDateTime(dateTime) {
  if (!dateTime) {
    return '-'
  }

  // 使用项目通用的 parseTime 函数
  const result = parseTime(dateTime, '{y}-{m}-{d} {h}:{i}:{s}')
  return result === 'invalid-date' ? '-' : (result || '-')
}

/**
 * 格式化MTTR为 "X.X小时"
 * @param {number} mttr - MTTR值（单位：小时）
 * @returns {string} 格式化后的MTTR字符串
 */
export function formatMTTR(mttr) {
  if (mttr === null || mttr === undefined || isNaN(mttr)) {
    return '-'
  }

  // 保留1位小数
  return `${Number(mttr).toFixed(1)}小时`
}

/**
 * 获取故障等级的标签类型
 * @param {string} level - 故障等级值
 * @returns {string} Element UI标签类型（danger/warning/info/success）
 */
export function getFailureLevelType(level) {
  return FAILURE_LEVEL_CONFIG.typeMap[level] || 'info'
}

/**
 * 获取故障等级的文本显示
 * @param {string} level - 故障等级值
 * @returns {string} 故障等级文本
 */
export function getFailureLevelText(level) {
  return FAILURE_LEVEL_CONFIG.textMap[level] || level
}

/**
 * 获取故障等级的颜色
 * @param {string} level - 故障等级值
 * @returns {string} 颜色值
 */
export function getFailureLevelColor(level) {
  return FAILURE_LEVEL_CONFIG.colorMap[level] || '#909399'
}

/**
 * 获取处理状态的标签类型
 * @param {string} status - 处理状态值
 * @returns {string} Element UI标签类型
 */
export function getFailureStatusType(status) {
  return FAILURE_STATUS_CONFIG.typeMap[status] || 'info'
}

/**
 * 获取处理状态的文本显示
 * @param {string} status - 处理状态值
 * @returns {string} 处理状态文本
 */
export function getFailureStatusText(status) {
  return FAILURE_STATUS_CONFIG.textMap[status] || status
}

/**
 * 获取影响程度的文本显示
 * @param {string} impact - 影响程度值
 * @returns {string} 影响程度文本
 */
export function getImpactDegreeText(impact) {
  return impact || '-'
}

/**
 * 获取影响程度的图标
 * @param {string} impact - 影响程度值
 * @returns {string} 图标类名
 */
export function getImpactDegreeIcon(impact) {
  const iconMap = {
    [IMPACT_DEGREE.SHUTDOWN]: 'el-icon-error',
    [IMPACT_DEGREE.PERFORMANCE_DEGRADATION]: 'el-icon-warning',
    [IMPACT_DEGREE.NO_IMPACT]: 'el-icon-success'
  }
  return iconMap[impact] || 'el-icon-info'
}

/**
 * 获取故障类型的文本显示
 * @param {string} type - 故障类型值
 * @returns {string} 故障类型文本
 */
export function getFailureTypeText(type) {
  return type || '-'
}

/**
 * 获取故障类型的图标
 * @param {string} type - 故障类型值
 * @returns {string} 图标类名
 */
export function getFailureTypeIcon(type) {
  const iconMap = {
    [FAILURE_TYPE.MECHANICAL]: 'el-icon-setting',
    [FAILURE_TYPE.ELECTRICAL]: 'el-icon-connection',
    [FAILURE_TYPE.HYDRAULIC]: 'el-icon-s-data',
    [FAILURE_TYPE.CONTROL]: 'el-icon-cpu',
    [FAILURE_TYPE.OTHER]: 'el-icon-question'
  }
  return iconMap[type] || 'el-icon-info'
}

/**
 * 构建查询参数（过滤空值）
 * 复用项目通用的 formatQueryParams 函数
 * @param {Object} params - 原始参数对象
 * @returns {Object} 过滤后的参数对象
 */
export function buildQueryParams(params) {
  return formatQueryParams(params)
}

/**
 * 构建分页参数
 * @param {number} page - 页码
 * @param {number} limit - 每页数量
 * @param {string} sortBy - 排序字段（格式：字段名:排序方向）
 * @returns {Object} 分页参数对象
 */
export function buildPaginationParams(page = 1, limit = 10, sortBy = 'failureTime:desc') {
  return {
    page,
    limit,
    sortBy
  }
}

/**
 * 格式化备件清单
 * @param {Array} sparePartsList - 备件清单数组
 * @returns {string} 格式化后的备件清单字符串
 */
export function formatSparePartsList(sparePartsList) {
  if (!sparePartsList || !Array.isArray(sparePartsList) || sparePartsList.length === 0) {
    return '无'
  }

  return sparePartsList
    .map(item => `${item.sparePartName || item.sparePartCode}(×${item.quantity})`)
    .join('、')
}

/**
 * 处理时间范围参数
 * @param {Array} dateRange - 时间范围数组 [startDate, endDate]
 * @returns {Object} 包含 startTime 和 endTime 的对象
 */
export function processTimeRange(dateRange) {
  if (!dateRange || !Array.isArray(dateRange) || dateRange.length !== 2) {
    return {}
  }

  const [startDate, endDate] = dateRange

  return {
    startTime: startDate ? new Date(startDate).toISOString() : undefined,
    endTime: endDate ? new Date(endDate).toISOString() : undefined
  }
}

