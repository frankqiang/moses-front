/**
 * 文件名称：formatters.js
 * 文件描述：备件管理数据格式化和工具函数
 * 创建日期：2025-01-21
 * 修改记录：
 *   - 2025-01-21: 初始创建，实现P0阶段所有格式化函数
 */

import { parseTime } from '@/utils'

/**
 * 格式化日期时间为标准格式
 * @param {string|Date|number} datetime - ISO 8601格式日期字符串、Date对象或时间戳
 * @param {string} format - 日期格式，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns {string} 格式化后的日期时间字符串
 */
export function formatDateTime(datetime, format = '{y}-{m}-{d} {h}:{i}:{s}') {
  if (!datetime) {
    return '-'
  }
  return parseTime(datetime, format) || '-'
}

/**
 * 格式化价格为货币格式
 * @param {string|number} price - 价格（DECIMAL字符串或数字）
 * @param {string} currency - 货币符号，默认 '¥'
 * @returns {string} 格式化后的价格字符串
 */
export function formatPrice(price, currency = '¥') {
  if (price === null || price === undefined || price === '') {
    return '-'
  }

  // 转换为数字
  const numPrice = typeof price === 'string' ? parseFloat(price) : price

  // 验证是否为有效数字
  if (isNaN(numPrice)) {
    return '-'
  }

  // 格式化为两位小数
  return `${currency}${numPrice.toFixed(2)}`
}

/**
 * 判断库存状态
 * @param {number} currentQuantity - 当前库存数量
 * @param {number} safetyStock - 安全库存数量
 * @returns {Object} 库存状态对象 { status, label, type, color }
 */
export function getInventoryStatus(currentQuantity, safetyStock = 0) {
  // 缺货：库存为0
  if (currentQuantity === 0 || currentQuantity === null || currentQuantity === undefined) {
    return {
      status: 'out-of-stock',
      label: '缺货',
      type: 'danger',
      color: '#F56C6C'
    }
  }

  // 低库存：当前库存 <= 安全库存
  if (currentQuantity <= safetyStock) {
    return {
      status: 'low-stock',
      label: '低库存',
      type: 'warning',
      color: '#E6A23C'
    }
  }

  // 正常：当前库存 > 安全库存
  return {
    status: 'normal',
    label: '正常',
    type: 'success',
    color: '#67C23A'
  }
}

/**
 * 判断是否为低库存
 * @param {number} currentQuantity - 当前库存数量
 * @param {number} safetyStock - 安全库存数量
 * @returns {boolean} 是否为低库存
 */
export function isLowStock(currentQuantity, safetyStock = 0) {
  const status = getInventoryStatus(currentQuantity, safetyStock)
  return status.status === 'low-stock' || status.status === 'out-of-stock'
}

/**
 * 出入库类型映射配置
 */
const TRANSACTION_TYPE_MAP = {
  '入库': {
    type: 'success',
    color: '#67C23A',
    icon: 'el-icon-upload2'
  },
  '领用': {
    type: 'primary',
    color: '#409EFF',
    icon: 'el-icon-download'
  },
  '退库': {
    type: 'warning',
    color: '#E6A23C',
    icon: 'el-icon-refresh-left'
  },
  '报废': {
    type: 'danger',
    color: '#F56C6C',
    icon: 'el-icon-delete'
  }
}

/**
 * 获取出入库类型的标签配置
 * @param {string} transactionType - 出入库类型（入库、领用、退库、报废）
 * @returns {Object} 标签配置对象 { type, color, icon }
 */
export function getTransactionTypeTag(transactionType) {
  return TRANSACTION_TYPE_MAP[transactionType] || {
    type: 'info',
    color: '#909399',
    icon: 'el-icon-question'
  }
}

/**
 * 格式化供应商信息
 * @param {Object} supplierInfo - 供应商信息对象（JSONB）
 * @param {string} supplierInfo.name - 供应商名称
 * @param {string} supplierInfo.contact - 联系人
 * @param {string} supplierInfo.phone - 联系电话
 * @param {string} supplierInfo.email - 联系邮箱
 * @returns {string} 格式化后的供应商信息字符串
 */
export function formatSupplierInfo(supplierInfo) {
  if (!supplierInfo) {
    return '-'
  }

  const { name, contact, phone, email } = supplierInfo

  // 如果所有字段都为空
  if (!name && !contact && !phone && !email) {
    return '-'
  }

  // 格式化为"供应商名称（联系人）"
  if (name && contact) {
    return `${name}（${contact}）`
  }

  // 只有供应商名称
  if (name) {
    return name
  }

  // 只有联系人
  if (contact) {
    return contact
  }

  return '-'
}

/**
 * 转换备件编码为大写
 * @param {string} code - 备件编码
 * @returns {string} 大写的备件编码
 */
export function toUpperCaseCode(code) {
  if (!code || typeof code !== 'string') {
    return ''
  }
  return code.toUpperCase()
}

/**
 * 构建查询参数（过滤空值）
 * @param {Object} params - 原始查询参数对象
 * @returns {Object} 过滤后的查询参数对象
 */
export function buildQueryParams(params = {}) {
  const result = {}

  Object.keys(params).forEach(key => {
    const value = params[key]

    // 过滤 undefined、null、空字符串
    if (value !== undefined && value !== null && value !== '') {
      // 特殊处理布尔值
      if (typeof value === 'boolean') {
        result[key] = value
      } else if (typeof value === 'number') {
        // 数字0也要保留
        result[key] = value
      } else if (typeof value === 'string' && value.trim()) {
        // 字符串去除首尾空格后保留
        result[key] = value.trim()
      } else if (Array.isArray(value) && value.length > 0) {
        // 非空数组保留
        result[key] = value
      } else if (typeof value === 'object') {
        // 对象保留（如日期对象）
        result[key] = value
      }
    }
  })

  return result
}

/**
 * 构建分页参数
 * @param {number} page - 页码（≥1）
 * @param {number} limit - 每页数量（1-100）
 * @param {string} sortBy - 排序字段
 * @param {string} sortOrder - 排序方向（asc/desc）
 * @returns {Object} 分页参数对象
 */
export function buildPaginationParams(page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc') {
  return {
    page: Math.max(1, parseInt(page, 10) || 1),
    limit: Math.min(100, Math.max(1, parseInt(limit, 10) || 10)),
    sortBy: sortBy || 'createdAt',
    sortOrder: sortOrder === 'asc' ? 'asc' : 'desc'
  }
}

/**
 * 格式化库存单位显示
 * @param {number} quantity - 数量
 * @param {string} unit - 单位
 * @returns {string} 格式化后的字符串（如"15 件"）
 */
export function formatQuantityUnit(quantity, unit) {
  if (quantity === null || quantity === undefined) {
    return '-'
  }

  if (!unit) {
    return String(quantity)
  }

  return `${quantity} ${unit}`
}

/**
 * 格式化库存显示（当前库存/安全库存 单位）
 * @param {number} currentQuantity - 当前库存
 * @param {number} safetyStock - 安全库存
 * @param {string} unit - 单位
 * @returns {string} 格式化后的字符串
 */
export function formatInventoryDisplay(currentQuantity, safetyStock, unit) {
  const current = currentQuantity ?? 0
  const safety = safetyStock ?? 0

  if (!unit) {
    return `${current}/${safety}`
  }

  return `${current}/${safety} ${unit}`
}

/**
 * 计算可用库存
 * @param {number} currentQuantity - 当前库存
 * @param {number} reservedQuantity - 预留数量
 * @returns {number} 可用库存
 */
export function calculateAvailableQuantity(currentQuantity, reservedQuantity = 0) {
  const current = currentQuantity ?? 0
  const reserved = reservedQuantity ?? 0
  return Math.max(0, current - reserved)
}

/**
 * 验证备件编码格式（可选功能）
 * @param {string} code - 备件编码
 * @returns {boolean} 是否有效
 */
export function validateSparePartCode(code) {
  if (!code || typeof code !== 'string') {
    return false
  }

  // 基本验证：非空且长度在合理范围内
  const trimmedCode = code.trim()
  return trimmedCode.length > 0 && trimmedCode.length <= 100
}

/**
 * 格式化出入库单号
 * @param {string} transactionCode - 出入库单号
 * @returns {string} 格式化后的单号
 */
export function formatTransactionCode(transactionCode) {
  if (!transactionCode) {
    return '-'
  }
  return transactionCode.toUpperCase()
}

/**
 * 解析设备类型字符串为数组
 * @param {string} equipmentTypes - 逗号分隔的设备类型字符串
 * @returns {Array<string>} 设备类型数组
 */
export function parseEquipmentTypes(equipmentTypes) {
  if (!equipmentTypes || typeof equipmentTypes !== 'string') {
    return []
  }

  return equipmentTypes
    .split(',')
    .map(type => type.trim())
    .filter(type => type.length > 0)
}

/**
 * 格式化设备类型数组为字符串
 * @param {Array<string>} equipmentTypesArray - 设备类型数组
 * @returns {string} 逗号分隔的字符串
 */
export function formatEquipmentTypes(equipmentTypesArray) {
  if (!Array.isArray(equipmentTypesArray) || equipmentTypesArray.length === 0) {
    return ''
  }

  return equipmentTypesArray
    .filter(type => type && type.trim())
    .join(',')
}

