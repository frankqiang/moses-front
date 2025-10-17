/**
 * 文件名称：error-handler.js
 * 文件描述：维护任务管理错误处理工具类
 * 创建日期：2024-01-20
 * 修改记录：
 *   - 2024-01-20: 初始创建
 */

import { Message, MessageBox } from 'element-ui'
import router from '@/router'

/**
 * 备用错误消息
 * 仅在后端未返回消息时使用
 */
const FALLBACK_ERROR_MESSAGE = '操作失败，请稍后重试'

/**
 * 错误消息缓存（防止重复显示）
 */
const errorMessageCache = new Set()
const ERROR_MESSAGE_CACHE_DURATION = 3000 // 3秒内相同错误消息不重复显示

/**
 * 清除错误消息缓存
 * @param {string} message - 错误消息
 */
function clearErrorMessageCache(message) {
  setTimeout(() => {
    errorMessageCache.delete(message)
  }, ERROR_MESSAGE_CACHE_DURATION)
}

/**
 * 显示错误消息（防重复）
 * @param {string} message - 错误消息
 * @param {Object} options - 配置选项
 * @returns {Object} Message实例
 */
function showErrorMessage(message, options = {}) {
  // 检查是否已经显示过相同的错误消息
  if (errorMessageCache.has(message)) {
    return null
  }

  errorMessageCache.add(message)
  clearErrorMessageCache(message)

  const defaultOptions = {
    message,
    type: 'error',
    duration: 5000,
    showClose: true
  }

  return Message({ ...defaultOptions, ...options })
}

/**
 * 显示成功消息
 * @param {string} message - 成功消息
 * @param {Object} options - 配置选项
 * @returns {Object} Message实例
 */
function showSuccessMessage(message, options = {}) {
  const defaultOptions = {
    message,
    type: 'success',
    duration: 3000,
    showClose: false
  }

  return Message({ ...defaultOptions, ...options })
}

/**
 * 显示警告消息
 * @param {string} message - 警告消息
 * @param {Object} options - 配置选项
 * @returns {Object} Message实例
 */
function showWarningMessage(message, options = {}) {
  const defaultOptions = {
    message,
    type: 'warning',
    duration: 4000,
    showClose: true
  }

  return Message({ ...defaultOptions, ...options })
}

/**
 * 显示信息消息
 * @param {string} message - 信息消息
 * @param {Object} options - 配置选项
 * @returns {Object} Message实例
 */
function showInfoMessage(message, options = {}) {
  const defaultOptions = {
    message,
    type: 'info',
    duration: 3000,
    showClose: false
  }

  return Message({ ...defaultOptions, ...options })
}

/**
 * 显示确认对话框
 * @param {string} message - 确认消息
 * @param {string} title - 对话框标题
 * @param {Object} options - 配置选项
 * @returns {Promise} 确认Promise
 */
function showConfirm(message, title = '确认操作', options = {}) {
  const defaultOptions = {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    dangerouslyUseHTMLString: false
  }

  return MessageBox.confirm(message, title, { ...defaultOptions, ...options })
}

/**
 * 处理401未授权错误
 * 自动跳转到登录页
 */
function handle401Error() {
  if (router.currentRoute.path !== '/login') {
    showErrorMessage('登录已过期，请重新登录', { duration: 2000 })
    setTimeout(() => {
      router.push({
        path: '/login',
        query: { redirect: router.currentRoute.fullPath }
      })
    }, 500)
  }
}

/**
 * 处理403权限不足错误
 */
function handle403Error() {
  showErrorMessage('权限不足，无法执行该操作', { duration: 4000 })
}

/**
 * 处理验证错误
 * @param {Object} error - 错误对象
 * @returns {string} 错误消息
 */
function handleValidationError(error) {
  // 直接返回后端提供的错误消息
  return error.message || FALLBACK_ERROR_MESSAGE
}

/**
 * 处理网络错误
 * @param {Object} error - 错误对象
 * @returns {string} 错误消息
 */
function handleNetworkError(error) {
  // 直接返回后端提供的错误消息，如果没有则使用备用消息
  return error.message || error.error?.message || '网络错误，请稍后重试'
}

/**
 * 统一错误处理入口
 * @param {Object} error - 错误对象
 * @param {Object} options - 配置选项
 * @param {boolean} options.showMessage - 是否显示错误消息（默认true）
 * @param {Function} options.onAuthError - 认证错误回调
 * @param {Function} options.onPermissionError - 权限错误回调
 * @param {Function} options.onValidationError - 验证错误回调
 * @returns {Object} 处理后的错误对象
 */
function handleError(error, options = {}) {
  const {
    showMessage = true,
    onAuthError,
    onPermissionError,
    onValidationError
  } = options

  // 开发环境输出详细错误日志
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ [错误处理]', {
      error,
      code: error.code || error.error?.code,
      message: error.message || error.error?.message,
      details: error.details || error.error?.details
    })
  }

  // 提取错误信息
  const errorCode = error.code || error.error?.code
  const errorMessage = error.message || error.error?.message
  const errorDetails = error.details || error.error?.details

  // 直接使用后端返回的错误消息，如果没有则使用备用消息
  const displayMessage = errorMessage || FALLBACK_ERROR_MESSAGE

  // 根据错误码进行特殊处理（仅处理需要特殊交互的错误）
  if (errorCode) {
    // 1. 认证错误 (401) - 需要跳转到登录页
    if (errorCode === 'UNAUTHORIZED' || errorCode === 'AUTH_TOKEN_EXPIRED' || errorCode === 'AUTH_TOKEN_INVALID') {
      if (showMessage) {
        showErrorMessage(displayMessage)
      }
      handle401Error()
      if (onAuthError) {
        onAuthError(error)
      }
      return { code: errorCode, message: displayMessage, details: errorDetails }
    }

    // 2. 权限错误 (403) - 需要特殊提示
    if (errorCode === 'FORBIDDEN' || errorCode === 'ACCESS_DENIED' || errorCode === 'TPM_TASK_016') {
      if (showMessage) {
        handle403Error()
      }
      if (onPermissionError) {
        onPermissionError(error)
      }
      return { code: errorCode, message: displayMessage, details: errorDetails }
    }

    // 3. 验证错误 (400) - 可能需要字段级提示
    if (errorCode === 'VALIDATION_ERROR' || errorCode.startsWith('VAL_')) {
      const validationMessage = handleValidationError(error.error || error)
      if (showMessage) {
        showErrorMessage(validationMessage, { duration: 4000 })
      }
      if (onValidationError) {
        onValidationError(error)
      }
      return { code: errorCode, message: validationMessage, details: errorDetails }
    }

    // 4. 网络错误 - 使用备用消息
    if (errorCode && errorCode.startsWith('NETWORK_')) {
      const networkMessage = handleNetworkError(error)
      if (showMessage) {
        showErrorMessage(networkMessage)
      }
      return { code: errorCode, message: networkMessage, details: errorDetails }
    }
  }

  // 显示错误消息（使用后端返回的消息）
  if (showMessage) {
    showErrorMessage(displayMessage)
  }

  return {
    code: errorCode || 'UNKNOWN_ERROR',
    message: displayMessage,
    details: errorDetails
  }
}

/**
 * 处理API响应错误
 * @param {Object} response - API响应对象
 * @param {Object} options - 配置选项
 * @returns {Object} 处理后的错误对象
 */
function handleApiError(response, options = {}) {
  // 如果响应成功，直接返回数据
  if (response && response.success) {
    return response.data
  }

  // 提取错误信息
  const error = response?.error || {}

  return handleError(error, options)
}

/**
 * 错误处理工具类导出
 */
export default {
  handleError,
  handleApiError,
  showErrorMessage,
  showSuccessMessage,
  showWarningMessage,
  showInfoMessage,
  showConfirm,
  handle401Error,
  handle403Error
}

/**
 * 导出独立函数（便于按需导入）
 */
export {
  handleError,
  handleApiError,
  showErrorMessage,
  showSuccessMessage,
  showWarningMessage,
  showInfoMessage,
  showConfirm,
  handle401Error,
  handle403Error
}

