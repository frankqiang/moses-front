/**
 * Mock API 响应工具函数
 * 
 * 提供统一的响应格式和错误处理，确保所有Mock API返回一致的数据结构
 * 
 * 使用示例：
 * ```javascript
 * const { success, error, errors, ERROR_CODES } = require('../utils/response')
 * 
 * // 成功响应
 * return success(data, '操作成功')
 * 
 * // 错误响应（推荐使用错误码常量）
 * return error(ERROR_CODES.VALIDATION_ERROR, '参数验证失败', 400)
 * 
 * // 快捷错误响应
 * return errors.validation('参数验证失败')
 * ```
 */

/**
 * 创建成功响应
 * @param {*} data - 响应数据
 * @param {string} message - 响应消息，默认为'操作成功'
 * @param {number} status - HTTP状态码，默认为200
 * @returns {Object} 标准化的成功响应对象
 */
const success = (data, message = '操作成功', status = 200) => ({
  success: true,
  data,
  message,
  timestamp: new Date().toISOString(),
  status
})

/**
 * 创建错误响应
 * @param {string} code - 错误代码
 * @param {string} message - 错误消息
 * @param {number} status - HTTP状态码，默认为500
 * @param {*} details - 错误详情，可选
 * @returns {Object} 标准化的错误响应对象
 */
const error = (code, message, status = 500, details = null) => ({
  success: false,
  error: {
    code,
    message,
    details
  },
  timestamp: new Date().toISOString(),
  status
})

/**
 * 创建分页响应
 * @param {Array} items - 数据项数组
 * @param {number} total - 总数
 * @param {number} page - 当前页码
 * @param {number} limit - 每页数量
 * @param {string} message - 响应消息，默认为'获取成功'
 * @returns {Object} 标准化的分页响应对象
 */
const paginated = (items, total, page, limit, message = '获取成功') => success({
  items,
  total,
  page: parseInt(page),
  limit: parseInt(limit),
  totalPages: Math.ceil(total / limit)
}, message)

/**
 * 创建批量操作响应
 * @param {Array} successIds - 成功处理的ID数组
 * @param {Array} failedIds - 失败的ID数组
 * @param {string} operation - 操作类型（如'删除'、'更新'等）
 * @param {*} details - 额外详情
 * @returns {Object} 标准化的批量操作响应对象
 */
const batch = (successIds, failedIds, operation = '操作', details = null) => {
  const successCount = successIds.length
  const failedCount = failedIds.length
  const total = successCount + failedCount
  
  return success({
    successIds,
    failedIds,
    successCount,
    failedCount,
    total,
    details
  }, `${operation}完成：成功${successCount}条，失败${failedCount}条`)
}

// 引入统一错误码
const { ERROR_CODES, getErrorDescription } = require('./error-codes')

/**
 * 常用错误响应快捷方法
 * 使用统一的错误码格式
 */
const errors = {
  notFound: (resource = '资源', id = '') => 
    error(ERROR_CODES.NOT_FOUND, `${resource}${id ? `(ID: ${id})` : ''}未找到`, 404),
  
  validation: (message = '参数验证失败') => 
    error(ERROR_CODES.VALIDATION_ERROR, message, 400),
  
  duplicate: (field = '数据', value = '') => 
    error(ERROR_CODES.DUPLICATE_CODE, `${field}${value ? `'${value}'` : ''}已存在`, 409),
  
  duplicateDraft: (message = '草稿版本已存在') => 
    error(ERROR_CODES.DUPLICATE_DRAFT, message, 409),
  
  invalidStatus: (message = '状态无效') => 
    error(ERROR_CODES.INVALID_STATUS, message, 400),
  
  inUse: (resource = '资源', details = null) => 
    error(ERROR_CODES.RESOURCE_IN_USE, `${resource}正在使用中，无法删除`, 400, details),
  
  unauthorized: (message = '未授权访问') => 
    error(ERROR_CODES.UNAUTHORIZED, message, 401),
  
  forbidden: (message = '禁止访问') => 
    error(ERROR_CODES.FORBIDDEN, message, 403),
  
  internal: (message = '服务器内部错误') => 
    error(ERROR_CODES.INTERNAL_ERROR, message, 500),
  
  requiredField: (field = '字段') => 
    error(ERROR_CODES.REQUIRED_FIELD_MISSING, `${field}不能为空`, 400)
}

module.exports = {
  success,
  error,
  paginated,
  batch,
  errors,
  ERROR_CODES,
  getErrorDescription
}