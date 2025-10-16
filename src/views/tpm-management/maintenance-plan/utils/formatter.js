/**
 * 文件名称：formatter.js
 * 文件描述：维护计划管理模块数据格式化工具函数
 * 创建日期：2024-01-20
 * 修改记录：
 *   - 2024-01-20: 初始创建，实现数据格式化和转换函数
 */

import { parseTime } from '@/utils'

/**
 * 日期时间格式化函数
 * 将ISO 8601格式的日期时间转换为本地时间格式
 *
 * @param {string|Date} datetime - ISO 8601格式的日期时间字符串或Date对象
 * @param {string} format - 格式化模板，默认为'{y}-{m}-{d} {h}:{i}:{s}'
 * @returns {string|null} 格式化后的日期时间字符串
 *
 * @example
 * formatDateTime('2024-01-20T10:30:00.000Z')
 * // => '2024-01-20 18:30:00' (假设本地时区为UTC+8)
 *
 * formatDateTime('2024-01-20T10:30:00.000Z', '{y}-{m}-{d}')
 * // => '2024-01-20'
 */
export function formatDateTime(datetime, format = '{y}-{m}-{d} {h}:{i}:{s}') {
  if (!datetime) {
    return null
  }

  try {
    return parseTime(datetime, format)
  } catch (error) {
    console.error('日期时间格式化失败:', error)
    return null
  }
}

/**
 * 周期信息格式化函数
 * 将周期类型、值、单位组合为可读的周期描述
 *
 * @param {Object} cycleInfo - 周期信息对象
 * @param {string} cycleInfo.cycleType - 周期类型（按时间/按运行时长/按生产批次）
 * @param {number} cycleInfo.cycleValue - 周期值
 * @param {string} cycleInfo.cycleUnit - 周期单位（天/周/月/年/小时/批次）
 * @returns {string} 格式化后的周期描述
 *
 * @example
 * formatCycleInfo({ cycleType: '按时间', cycleValue: 30, cycleUnit: '天' })
 * // => '每30天'
 *
 * formatCycleInfo({ cycleType: '按运行时长', cycleValue: 2, cycleUnit: '小时' })
 * // => '每2小时'
 *
 * formatCycleInfo({ cycleType: '按生产批次', cycleValue: 100, cycleUnit: '批次' })
 * // => '每100批次'
 */
export function formatCycleInfo(cycleInfo) {
  if (!cycleInfo || !cycleInfo.cycleValue || !cycleInfo.cycleUnit) {
    return '-'
  }

  const { cycleValue, cycleUnit } = cycleInfo

  return `每${cycleValue}${cycleUnit}`
}

/**
 * 标准工时格式化函数
 * 将DECIMAL字符串类型的工时转换为数值类型并格式化显示
 *
 * @param {string|number} duration - 标准工时（可能是字符串或数值）
 * @param {number} precision - 小数精度，默认1位
 * @param {boolean} withUnit - 是否添加单位，默认true
 * @returns {string|number} 格式化后的工时
 *
 * @example
 * formatStandardDuration('2.50')
 * // => '2.5 小时'
 *
 * formatStandardDuration('2.50', 2)
 * // => '2.50 小时'
 *
 * formatStandardDuration('2.50', 1, false)
 * // => 2.5
 *
 * formatStandardDuration(null)
 * // => '-'
 */
export function formatStandardDuration(duration, precision = 1, withUnit = true) {
  if (!duration && duration !== 0) {
    return '-'
  }

  try {
    const numValue = parseFloat(duration)

    if (isNaN(numValue)) {
      return '-'
    }

    const formattedValue = numValue.toFixed(precision)

    return withUnit ? `${formattedValue} 小时` : parseFloat(formattedValue)
  } catch (error) {
    console.error('标准工时格式化失败:', error)
    return '-'
  }
}

/**
 * 状态枚举转换函数
 * 将维护计划状态值转换为StatusTag组件所需的类型
 *
 * @param {string} status - 状态值（启用/禁用）
 * @returns {string} StatusTag类型（success/info）
 *
 * @example
 * getStatusTagType('启用')
 * // => 'success'
 *
 * getStatusTagType('禁用')
 * // => 'info'
 */
export function getStatusTagType(status) {
  const statusMap = {
    '启用': 'success',
    '禁用': 'info'
  }

  return statusMap[status] || 'info'
}

/**
 * 状态枚举转换为中文显示
 * @param {string} status - 状态值
 * @returns {string} 中文显示文本
 */
export function getStatusText(status) {
  const statusTextMap = {
    '启用': '启用',
    '禁用': '禁用'
  }

  return statusTextMap[status] || status || '-'
}

/**
 * 维护类型枚举转换函数
 * 将维护类型值转换为中文显示（实际上后端已经返回中文，此函数保持兼容性）
 *
 * @param {string} maintenanceType - 维护类型值
 * @returns {string} 中文显示文本
 *
 * @example
 * getMaintenanceTypeText('日常保养')
 * // => '日常保养'
 *
 * getMaintenanceTypeText('定期检查')
 * // => '定期检查'
 */
export function getMaintenanceTypeText(maintenanceType) {
  const typeTextMap = {
    '日常保养': '日常保养',
    '定期检查': '定期检查',
    '大修': '大修',
    '专项维护': '专项维护'
  }

  return typeTextMap[maintenanceType] || maintenanceType || '-'
}

/**
 * 维护类型转换为Tag类型
 * @param {string} maintenanceType - 维护类型
 * @returns {string} Tag类型
 */
export function getMaintenanceTypeTagType(maintenanceType) {
  const typeMap = {
    '日常保养': 'primary',
    '定期检查': 'success',
    '大修': 'warning',
    '专项维护': 'danger'
  }

  return typeMap[maintenanceType] || 'info'
}

/**
 * 周期类型枚举转换函数
 * 将周期类型值转换为中文显示（实际上后端已经返回中文，此函数保持兼容性）
 *
 * @param {string} cycleType - 周期类型值
 * @returns {string} 中文显示文本
 *
 * @example
 * getCycleTypeText('按时间')
 * // => '按时间'
 *
 * getCycleTypeText('按运行时长')
 * // => '按运行时长'
 */
export function getCycleTypeText(cycleType) {
  const typeTextMap = {
    '按时间': '按时间',
    '按运行时长': '按运行时长',
    '按生产批次': '按生产批次'
  }

  return typeTextMap[cycleType] || cycleType || '-'
}

/**
 * 周期类型转换为Tag类型
 * @param {string} cycleType - 周期类型
 * @returns {string} Tag类型
 */
export function getCycleTypeTagType(cycleType) {
  const typeMap = {
    '按时间': 'primary',
    '按运行时长': 'success',
    '按生产批次': 'warning'
  }

  return typeMap[cycleType] || 'info'
}

/**
 * 构建查询参数
 * 过滤掉空值（null、undefined、空字符串）的参数
 *
 * @param {Object} params - 原始查询参数对象
 * @returns {Object} 过滤后的查询参数对象
 *
 * @example
 * buildQueryParams({
 *   page: 1,
 *   limit: 10,
 *   search: '',
 *   status: '启用',
 *   equipmentId: undefined
 * })
 * // => { page: 1, limit: 10, status: '启用' }
 */
export function buildQueryParams(params = {}) {
  const result = {}

  Object.keys(params).forEach(key => {
    const value = params[key]
    // 过滤掉空字符串、null、undefined
    // 但保留数字0和布尔值false
    if (value !== '' && value !== null && value !== undefined) {
      result[key] = value
    }
  })

  return result
}

/**
 * 构建分页参数
 * 构建标准的分页查询参数
 *
 * @param {Object} pagination - 分页信息对象
 * @param {number} pagination.page - 页码，默认1
 * @param {number} pagination.limit - 每页数量，默认10
 * @param {string} pagination.sortBy - 排序规则，默认'createdAt:desc'
 * @returns {Object} 分页参数对象
 *
 * @example
 * buildPaginationParams({ page: 2, limit: 20, sortBy: 'planName:asc' })
 * // => { page: 2, limit: 20, sortBy: 'planName:asc' }
 *
 * buildPaginationParams({ page: 1 })
 * // => { page: 1, limit: 10, sortBy: 'createdAt:desc' }
 */
export function buildPaginationParams(pagination = {}) {
  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt:desc'
  } = pagination

  return {
    page,
    limit,
    sortBy
  }
}

/**
 * 合并查询参数和分页参数
 * 将筛选条件和分页信息合并为完整的查询参数
 *
 * @param {Object} filters - 筛选条件对象
 * @param {Object} pagination - 分页信息对象
 * @returns {Object} 合并后的查询参数对象
 *
 * @example
 * buildListParams(
 *   { search: '退火炉', status: '启用' },
 *   { page: 2, limit: 20 }
 * )
 * // => { search: '退火炉', status: '启用', page: 2, limit: 20, sortBy: 'createdAt:desc' }
 */
export function buildListParams(filters = {}, pagination = {}) {
  const queryParams = buildQueryParams(filters)
  const paginationParams = buildPaginationParams(pagination)

  return {
    ...queryParams,
    ...paginationParams
  }
}

/**
 * 格式化备件清单
 * 格式化显示备件清单信息
 *
 * @param {Array} spareParts - 备件清单数组
 * @returns {string} 格式化后的备件清单文本
 *
 * @example
 * formatSpareParts([
 *   { sparePartId: 'xxx', quantity: 2, name: '轴承' },
 *   { sparePartId: 'yyy', quantity: 1, name: '密封圈' }
 * ])
 * // => '轴承(2)、密封圈(1)'
 */
export function formatSpareParts(spareParts) {
  if (!spareParts || !Array.isArray(spareParts) || spareParts.length === 0) {
    return '-'
  }

  return spareParts
    .map(part => {
      const name = part.name || part.sparePartId
      const quantity = part.quantity || 0
      return `${name}(${quantity})`
    })
    .join('、')
}

/**
 * 导出所有格式化函数
 */
export default {
  formatDateTime,
  formatCycleInfo,
  formatStandardDuration,
  getStatusTagType,
  getStatusText,
  getMaintenanceTypeText,
  getMaintenanceTypeTagType,
  getCycleTypeText,
  getCycleTypeTagType,
  buildQueryParams,
  buildPaginationParams,
  buildListParams,
  formatSpareParts
}

