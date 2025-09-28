/**
 * 文件名称：params.js
 * 文件描述：设备主数据管理模块查询参数工具函数，提供列表查询参数的统一预处理方法
 * 创建日期：2025-09-28
 * 修改记录：
 *   - 2025-09-28: 初始创建，抽离设备列表查询参数规范化逻辑
 */

/**
 * 规范化设备列表查询参数
 * - 去除字符串首尾空格
 * - 数值字段转换为数字
 * - includeDetails 转为布尔值
 * @param {Object} rawParams 原始查询参数
 * @returns {Object} 处理后的查询参数
 */
export function normalizeEquipmentListParams(rawParams = {}) {
  const {
    equipmentType,
    status,
    equipmentCode,
    name,
    model,
    manufacturer,
    search,
    installationDateFrom,
    installationDateTo,
    nextMaintenanceDateFrom,
    nextMaintenanceDateTo,
    includeDetails,
    sortBy,
    limit,
    page
  } = rawParams

  const booleanValue = parseBooleanLike(includeDetails)

  const normalizedParams = {
    ...(equipmentType ? { equipmentType: equipmentType.trim() } : {}),
    ...(status ? { status: status.trim() } : {}),
    ...(equipmentCode ? { equipmentCode: equipmentCode.trim() } : {}),
    ...(name ? { name: name.trim() } : {}),
    ...(model ? { model: model.trim() } : {}),
    ...(manufacturer ? { manufacturer: manufacturer.trim() } : {}),
    ...(search ? { search: search.trim() } : {}),
    ...(installationDateFrom ? { installationDateFrom: installationDateFrom.trim() } : {}),
    ...(installationDateTo ? { installationDateTo: installationDateTo.trim() } : {}),
    ...(nextMaintenanceDateFrom ? { nextMaintenanceDateFrom: nextMaintenanceDateFrom.trim() } : {}),
    ...(nextMaintenanceDateTo ? { nextMaintenanceDateTo: nextMaintenanceDateTo.trim() } : {}),
    ...(booleanValue !== undefined ? { includeDetails: booleanValue } : {}),
    ...(sortBy ? { sortBy } : {}),
    ...(isValidNumber(limit) ? { limit: Number(limit) } : {}),
    ...(isValidNumber(page) ? { page: Number(page) } : {})
  }

  return normalizedParams
}

/**
 * 将各种布尔语义值转换为布尔类型
 * @param {boolean|string|undefined|null} value 原始值
 * @returns {boolean|undefined} 布尔值或 undefined
 */
export function parseBooleanLike(value) {
  if (typeof value === 'boolean') {
    return value
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    if (normalized === 'true') {
      return true
    }
    if (normalized === 'false') {
      return false
    }
  }

  return undefined
}

/**
 * 判断值是否为合法的数字类型（字符串数字亦支持）
 * @param {number|string|null|undefined} value 待校验值
 * @returns {boolean} 是否为合法数字
 */
export function isValidNumber(value) {
  if (value === 0) {
    return true
  }

  if (value === undefined || value === null || value === '') {
    return false
  }

  const numberValue = Number(value)
  return Number.isFinite(numberValue)
}

