/**
 * 文件名称：index.js
 * 文件描述：维护计划管理模块工具函数统一导出
 * 创建日期：2024-01-20
 * 修改记录：
 *   - 2024-01-20: 初始创建，导出错误处理和消息提示工具
 *   - 2024-01-20: 新增数据格式化工具函数导出
 */

import errorHandler from './errorHandler'
import messageHandler from './messageHandler'
import formatter from './formatter'

/**
 * 统一的API调用错误处理函数
 * @param {Error} error - API错误对象
 * @param {Object} options - 处理选项
 * @returns {Object} 错误处理结果
 */
export function handleApiError(error, options = {}) {
  return errorHandler.handleError(error, options)
}

/**
 * 统一的成功消息提示函数
 * @param {string|Object} message - 消息内容或响应对象
 * @param {Object} options - 消息选项
 */
export function showSuccess(message, options = {}) {
  messageHandler.success(message, options)
}

/**
 * 统一的错误消息提示函数
 * @param {string} message - 消息内容
 * @param {Object} options - 消息选项
 */
export function showError(message, options = {}) {
  messageHandler.error(message, options)
}

/**
 * 统一的警告消息提示函数
 * @param {string} message - 消息内容
 * @param {Object} options - 消息选项
 */
export function showWarning(message, options = {}) {
  messageHandler.warning(message, options)
}

/**
 * 显示操作成功消息
 * @param {string} operation - 操作类型
 * @param {Object} response - 响应对象
 */
export function showOperationSuccess(operation, response) {
  messageHandler.showOperationSuccess(operation, response)
}

/**
 * 显示操作警告消息
 * @param {string} scenario - 场景类型
 * @param {Object} data - 附加数据
 */
export function showOperationWarning(scenario, data = {}) {
  messageHandler.showOperationWarning(scenario, data)
}

/**
 * 显示确认对话框
 * @param {Object} options - 对话框选项
 * @returns {Promise} 确认结果
 */
export function showConfirm(options = {}) {
  return errorHandler.showConfirm(options)
}

/**
 * 处理表单验证错误
 * @param {Error} error - 错误对象
 * @param {Object} formRef - 表单引用
 * @returns {Object} 处理结果
 */
export function handleFormValidationError(error, formRef) {
  return errorHandler.handleFormValidationError(error, formRef)
}

// 导出数据格式化函数
export {
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
} from './formatter'

// 导出错误处理器、消息处理器和格式化器实例（供需要直接使用的场景）
export { errorHandler, messageHandler, formatter }

