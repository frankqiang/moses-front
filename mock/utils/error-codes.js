/**
 * 文件名称：error-codes.js
 * 文件描述：统一错误码常量定义，遵循API设计标准
 * 创建日期：2024-01-01
 * 修改记录：
 *   - 2024-01-01: 初始创建，定义统一错误码格式
 */

/**
 * 统一错误码系统
 * 格式：Exxxx
 * 分类：
 * - 1xxx: 通用错误
 * - 2xxx: 验证错误
 * - 3xxx: 业务错误
 * - 4xxx: 权限错误
 * - 5xxx: 系统错误
 */
const ERROR_CODES = {
  // 1xxx 通用错误
  INTERNAL_ERROR: 'E1000',
  INVALID_REQUEST: 'E1001',
  UNAUTHORIZED: 'E1002',
  FORBIDDEN: 'E1003',
  NOT_FOUND: 'E1004',
  METHOD_NOT_ALLOWED: 'E1005',
  TIMEOUT: 'E1006',
  
  // 2xxx 验证错误
  VALIDATION_ERROR: 'E2000',
  REQUIRED_FIELD_MISSING: 'E2001',
  INVALID_FORMAT: 'E2002',
  INVALID_VALUE: 'E2003',
  FIELD_TOO_LONG: 'E2004',
  FIELD_TOO_SHORT: 'E2005',
  
  // 3xxx 业务错误
  USER_NOT_FOUND: 'E3000',
  USER_ALREADY_EXISTS: 'E3001',
  DUPLICATE_DRAFT: 'E3002',
  DUPLICATE_CODE: 'E3003',
  INVALID_STATUS: 'E3004',
  RESOURCE_IN_USE: 'E3005',
  OPERATION_NOT_ALLOWED: 'E3006',
  INSUFFICIENT_STOCK: 'E3007',
  EQUIPMENT_UNAVAILABLE: 'E3008',
  WORKFLOW_VIOLATION: 'E3009',
  
  // 4xxx 权限错误
  ACCESS_DENIED: 'E4000',
  INSUFFICIENT_PERMISSIONS: 'E4001',
  TOKEN_EXPIRED: 'E4002',
  TOKEN_INVALID: 'E4003',
  
  // 5xxx 系统错误
  DATABASE_ERROR: 'E5000',
  NETWORK_ERROR: 'E5001',
  SERVICE_UNAVAILABLE: 'E5002',
  CONFIGURATION_ERROR: 'E5003'
}

/**
 * 错误码描述映射
 * 用于开发调试和文档生成
 */
const ERROR_DESCRIPTIONS = {
  [ERROR_CODES.INTERNAL_ERROR]: '服务器内部错误',
  [ERROR_CODES.INVALID_REQUEST]: '无效请求',
  [ERROR_CODES.UNAUTHORIZED]: '未授权访问',
  [ERROR_CODES.FORBIDDEN]: '禁止访问',
  [ERROR_CODES.NOT_FOUND]: '资源未找到',
  [ERROR_CODES.METHOD_NOT_ALLOWED]: '请求方法不允许',
  [ERROR_CODES.TIMEOUT]: '请求超时',
  
  [ERROR_CODES.VALIDATION_ERROR]: '数据验证失败',
  [ERROR_CODES.REQUIRED_FIELD_MISSING]: '必填字段缺失',
  [ERROR_CODES.INVALID_FORMAT]: '数据格式无效',
  [ERROR_CODES.INVALID_VALUE]: '数据值无效',
  [ERROR_CODES.FIELD_TOO_LONG]: '字段长度超出限制',
  [ERROR_CODES.FIELD_TOO_SHORT]: '字段长度不足',
  
  [ERROR_CODES.USER_NOT_FOUND]: '用户不存在',
  [ERROR_CODES.USER_ALREADY_EXISTS]: '用户已存在',
  [ERROR_CODES.DUPLICATE_DRAFT]: '草稿版本已存在',
  [ERROR_CODES.DUPLICATE_CODE]: '代码重复',
  [ERROR_CODES.INVALID_STATUS]: '状态无效',
  [ERROR_CODES.RESOURCE_IN_USE]: '资源正在使用中',
  [ERROR_CODES.OPERATION_NOT_ALLOWED]: '操作不被允许',
  [ERROR_CODES.INSUFFICIENT_STOCK]: '库存不足',
  [ERROR_CODES.EQUIPMENT_UNAVAILABLE]: '设备不可用',
  [ERROR_CODES.WORKFLOW_VIOLATION]: '违反工作流规则',
  
  [ERROR_CODES.ACCESS_DENIED]: '访问被拒绝',
  [ERROR_CODES.INSUFFICIENT_PERMISSIONS]: '权限不足',
  [ERROR_CODES.TOKEN_EXPIRED]: '令牌已过期',
  [ERROR_CODES.TOKEN_INVALID]: '令牌无效',
  
  [ERROR_CODES.DATABASE_ERROR]: '数据库错误',
  [ERROR_CODES.NETWORK_ERROR]: '网络错误',
  [ERROR_CODES.SERVICE_UNAVAILABLE]: '服务不可用',
  [ERROR_CODES.CONFIGURATION_ERROR]: '配置错误'
}

/**
 * 获取错误码描述
 * @param {string} code - 错误码
 * @returns {string} 错误描述
 */
function getErrorDescription(code) {
  return ERROR_DESCRIPTIONS[code] || '未知错误'
}

/**
 * 验证错误码格式
 * @param {string} code - 错误码
 * @returns {boolean} 是否为有效格式
 */
function isValidErrorCode(code) {
  return /^E\d{4}$/.test(code)
}

module.exports = {
  ERROR_CODES,
  ERROR_DESCRIPTIONS,
  getErrorDescription,
  isValidErrorCode
}