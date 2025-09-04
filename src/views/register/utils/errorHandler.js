/**
 * 注册模块错误处理工具
 * 文件描述：提供注册模块统一的错误处理机制，包括网络错误、业务错误和用户体验优化
 * 创建日期：2024-01-20
 * 修改记录：
 *   - 2024-01-20: 初始创建，实现统一错误处理机制
 */

import { Message, MessageBox } from 'element-ui'
import { ApiError } from '@/utils/request'

// 错误消息缓存，防止重复显示
const errorMessageCache = new Set()
const ERROR_CACHE_DURATION = 3000 // 3秒内相同错误不重复显示

/**
 * 统一错误处理器
 * @param {Error|ApiError} error - 错误对象
 * @param {Object} options - 处理选项
 * @param {boolean} options.showMessage - 是否显示错误消息，默认true
 * @param {string} options.messageType - 消息类型，默认'error'
 * @param {number} options.duration - 消息显示时长，默认5000ms
 * @param {Function} options.onError - 自定义错误处理回调
 * @param {string} options.context - 错误上下文，用于日志记录
 * @returns {Object} 处理结果
 */
export function handleError(error, options = {}) {
  const {
    showMessage = true,
    messageType = 'error',
    duration = 5000,
    onError,
    context = ''
  } = options

  // 错误信息提取
  const errorInfo = extractErrorInfo(error)

  // 记录错误日志
  logError(errorInfo, context)

  // 显示用户友好的错误消息
  if (showMessage && errorInfo.userMessage) {
    showErrorMessage(errorInfo.userMessage, messageType, duration)
  }

  // 执行自定义错误处理
  if (typeof onError === 'function') {
    try {
      onError(errorInfo)
    } catch (callbackError) {
      console.error('错误处理回调执行失败:', callbackError)
    }
  }

  return {
    handled: true,
    errorCode: errorInfo.code,
    errorMessage: errorInfo.message,
    userMessage: errorInfo.userMessage,
    shouldRetry: errorInfo.shouldRetry
  }
}

/**
 * 提取错误信息
 * @param {Error|ApiError} error - 错误对象
 * @returns {Object} 错误信息
 */
function extractErrorInfo(error) {
  // 默认错误信息
  const defaultInfo = {
    code: 'UNKNOWN_ERROR',
    message: '未知错误',
    userMessage: '操作失败，请稍后重试',
    shouldRetry: false,
    status: 500
  }

  if (!error) {
    return defaultInfo
  }

  // 处理ApiError
  if (error instanceof ApiError) {
    return {
      code: error.code || 'API_ERROR',
      message: error.message || '接口调用失败',
      userMessage: getUserFriendlyMessage(error.code, error.message),
      shouldRetry: shouldRetryError(error.code, error.status),
      status: error.status || 500,
      details: error.details
    }
  }

  // 处理网络错误
  if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
    return {
      code: 'NETWORK_ERROR',
      message: '网络连接失败',
      userMessage: '网络连接异常，请检查网络后重试',
      shouldRetry: true,
      status: 0
    }
  }

  // 处理超时错误
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return {
      code: 'TIMEOUT_ERROR',
      message: '请求超时',
      userMessage: '请求超时，请稍后重试',
      shouldRetry: true,
      status: 408
    }
  }

  // 处理取消请求
  if (error.code === 'ERR_CANCELED' || error.message?.includes('canceled')) {
    return {
      code: 'REQUEST_CANCELED',
      message: '请求已取消',
      userMessage: null, // 取消请求不显示错误消息
      shouldRetry: false,
      status: 0
    }
  }

  // 处理普通Error对象
  return {
    code: error.code || 'GENERAL_ERROR',
    message: error.message || '操作失败',
    userMessage: error.message || '操作失败，请稍后重试',
    shouldRetry: false,
    status: error.status || 500
  }
}

/**
 * 获取用户友好的错误消息
 * @param {string} errorCode - 错误码
 * @param {string} originalMessage - 原始错误消息
 * @returns {string} 用户友好的错误消息
 */
function getUserFriendlyMessage(errorCode, originalMessage) {
  // 优先使用后端返回的错误消息
  if (originalMessage && originalMessage.trim()) {
    return originalMessage
  }

  // 只有在后端没有返回错误消息时，才使用默认的通用消息
  return '操作失败，请稍后重试'
}

/**
 * 判断错误是否应该重试
 * @param {string} errorCode - 错误码
 * @param {number} status - HTTP状态码
 * @returns {boolean} 是否应该重试
 */
function shouldRetryError(errorCode, status) {
  // 网络相关错误可以重试
  const retryableErrors = [
    'NETWORK_ERROR',
    'TIMEOUT_ERROR',
    'SYS_001', // 服务器繁忙
    'SYS_005' // 服务不可用
  ]

  // HTTP状态码判断
  const retryableStatus = [408, 429, 502, 503, 504]

  return retryableErrors.includes(errorCode) || retryableStatus.includes(status)
}

/**
 * 显示错误消息（防重复）
 * @param {string} message - 错误消息
 * @param {string} type - 消息类型
 * @param {number} duration - 显示时长
 */
function showErrorMessage(message, type = 'error', duration = 5000) {
  if (!message || errorMessageCache.has(message)) {
    return
  }

  errorMessageCache.add(message)

  Message({
    message,
    type,
    duration,
    showClose: true
  })

  // 清除缓存
  setTimeout(() => {
    errorMessageCache.delete(message)
  }, ERROR_CACHE_DURATION)
}

/**
 * 记录错误日志
 * @param {Object} errorInfo - 错误信息
 * @param {string} context - 错误上下文
 */
function logError(errorInfo, context) {
  const logData = {
    timestamp: new Date().toISOString(),
    context,
    code: errorInfo.code,
    message: errorInfo.message,
    status: errorInfo.status,
    userAgent: navigator.userAgent,
    url: window.location.href
  }

  // 开发环境下在控制台输出详细错误信息
  if (process.env.NODE_ENV === 'development') {
    console.group(`🚨 错误日志 [${context}]`)
    console.error('错误码:', errorInfo.code)
    console.error('错误消息:', errorInfo.message)
    console.error('用户消息:', errorInfo.userMessage)
    console.error('状态码:', errorInfo.status)
    console.error('是否可重试:', errorInfo.shouldRetry)
    console.error('完整信息:', logData)
    console.groupEnd()
  }

  // 生产环境下可以发送到日志服务
  // TODO: 集成日志服务，如Sentry、LogRocket等
}

/**
 * 显示确认对话框
 * @param {string} title - 标题
 * @param {string} message - 消息内容
 * @param {Object} options - 选项
 * @returns {Promise} 用户选择结果
 */
export function showConfirmDialog(title, message, options = {}) {
  const {
    confirmButtonText = '确定',
    cancelButtonText = '取消',
    type = 'warning'
  } = options

  return MessageBox.confirm(message, title, {
    confirmButtonText,
    cancelButtonText,
    type,
    center: true
  })
}

/**
 * 显示成功消息
 * @param {string} message - 成功消息
 * @param {number} duration - 显示时长
 */
export function showSuccessMessage(message, duration = 3000) {
  Message({
    message,
    type: 'success',
    duration,
    showClose: true
  })
}

/**
 * 显示警告消息
 * @param {string} message - 警告消息
 * @param {number} duration - 显示时长
 */
export function showWarningMessage(message, duration = 4000) {
  Message({
    message,
    type: 'warning',
    duration,
    showClose: true
  })
}

/**
 * 显示信息消息
 * @param {string} message - 信息消息
 * @param {number} duration - 显示时长
 */
export function showInfoMessage(message, duration = 3000) {
  Message({
    message,
    type: 'info',
    duration,
    showClose: true
  })
}

/**
 * 清除错误消息缓存
 */
export function clearErrorCache() {
  errorMessageCache.clear()
}

/**
 * 显示操作成功对话框
 * @param {Object} options - 成功提示选项
 * @param {string} options.title - 对话框标题
 * @param {string} options.successTitle - 成功标题
 * @param {string} options.successMessage - 成功消息
 * @param {Array} options.details - 详细信息列表
 * @param {Array} options.tips - 提示信息列表
 * @param {Array} options.actions - 操作按钮列表
 * @returns {Promise} 返回用户操作结果
 */
export function showSuccessDialog(options = {}) {
  return new Promise((resolve) => {
    const {
      title = '操作成功',
      successTitle = '操作成功！',
      successMessage = '您的操作已成功完成',
      details = [],
      tips = [],
      actions = [
        {
          text: '确定',
          type: 'primary',
          action: 'confirm'
        }
      ]
    } = options

    // 创建成功对话框实例
    const successDialog = {
      visible: true,
      title,
      successTitle,
      successMessage,
      details,
      tips,
      actions,
      onAction: (action) => {
        successDialog.visible = false
        resolve(action)
      }
    }

    // 触发全局事件，让组件监听
    if (typeof window !== 'undefined' && window.eventBus) {
      window.eventBus.$emit('show-success-dialog', successDialog)
    }
  })
}

/**
 * 显示成功Toast提示
 * @param {string|Object} message - 提示消息或选项对象
 * @param {Object} options - 提示选项
 */
export function showSuccessToast(message, options = {}) {
  const {
    position = 'top',
    duration = 3000
  } = options

  const toastOptions = {
    message: typeof message === 'string' ? message : message.message || '操作成功',
    position,
    duration
  }

  // 触发全局事件，让组件监听
  if (typeof window !== 'undefined' && window.eventBus) {
    window.eventBus.$emit('show-success-toast', toastOptions)
  }
}

/**
 * 显示注册申请成功提示
 * @param {Object} applicationData - 申请数据
 */
export function showRegistrationSuccess(applicationData = {}) {
  const {
    applicationId,
    applicantName,
    submittedAt
  } = applicationData

  const details = []
  if (applicationId) {
    details.push({
      label: '申请编号',
      value: applicationId
    })
  }
  if (applicantName) {
    details.push({
      label: '申请人',
      value: applicantName
    })
  }
  if (submittedAt) {
    details.push({
      label: '提交时间',
      value: submittedAt
    })
  }

  const tips = [
    '请妥善保存您的申请编号，以便后续查询申请状态',
    '我们将在1-3个工作日内完成审核，请耐心等待',
    '如有疑问，请联系客服或查看帮助文档'
  ]

  const actions = [
    {
      text: '查看申请状态',
      type: 'primary',
      action: 'view-status'
    },
    {
      text: '继续申请',
      type: 'default',
      action: 'continue'
    },
    {
      text: '完成',
      type: 'default',
      action: 'finish'
    }
  ]

  return showSuccessDialog({
    title: '申请提交成功',
    successTitle: '申请已成功提交！',
    successMessage: '您的注册申请已成功提交，我们将尽快处理',
    details,
    tips,
    actions
  })
}

/**
 * 显示状态查询成功提示
 * @param {Object} statusData - 状态数据
 */
export function showStatusQuerySuccess(statusData = {}) {
  const message = `申请状态查询成功：${statusData.statusText || '未知状态'}`
  showSuccessToast(message, {
    position: 'top',
    duration: 2000
  })
}

/**
 * 表单验证错误处理
 * @param {Object|Array} validationErrors - 验证错误
 * @param {Object} options - 处理选项
 */
export function handleValidationErrors(validationErrors, options = {}) {
  const {
    showMessage = true,
    showSummary = false,
    context = 'form_validation'
  } = options

  // 标准化验证错误格式
  const errors = normalizeValidationErrors(validationErrors)

  // 记录验证错误
  logError({
    type: 'validation_error',
    context,
    errors,
    timestamp: new Date().toISOString()
  })

  // 显示验证消息
  if (showMessage && errors.length > 0) {
    if (errors.length === 1) {
      // 单个错误直接显示
      showValidationMessage(errors[0])
    } else {
      // 多个错误显示摘要或列表
      if (showSummary) {
        showValidationSummary(errors)
      } else {
        showValidationList(errors)
      }
    }
  }

  return errors
}

/**
 * 标准化验证错误格式
 * @param {Object|Array} validationErrors - 原始验证错误
 * @returns {Array} 标准化后的错误列表
 */
function normalizeValidationErrors(validationErrors) {
  if (!validationErrors) return []

  // 如果是数组，直接处理
  if (Array.isArray(validationErrors)) {
    return validationErrors.map(error => normalizeValidationError(error))
  }

  // 如果是对象，可能是字段错误映射
  if (typeof validationErrors === 'object') {
    const errors = []

    // Element UI 表单验证格式
    if (validationErrors.errors) {
      Object.keys(validationErrors.errors).forEach(field => {
        const fieldErrors = validationErrors.errors[field]
        if (Array.isArray(fieldErrors)) {
          fieldErrors.forEach(error => {
            errors.push(normalizeValidationError(error, field))
          })
        } else {
          errors.push(normalizeValidationError(fieldErrors, field))
        }
      })
    } else {
      // 简单的字段-错误映射
      Object.keys(validationErrors).forEach(field => {
        const error = validationErrors[field]
        errors.push(normalizeValidationError(error, field))
      })
    }

    return errors
  }

  // 单个错误
  return [normalizeValidationError(validationErrors)]
}

/**
 * 标准化单个验证错误
 * @param {Object|string} error - 错误对象或消息
 * @param {string} field - 字段名
 * @returns {Object} 标准化后的错误对象
 */
function normalizeValidationError(error, field = null) {
  if (typeof error === 'string') {
    return {
      id: generateErrorId(),
      field,
      message: error,
      type: 'error'
    }
  }

  return {
    id: error.id || generateErrorId(),
    field: error.field || field,
    message: error.message || error.msg || '验证失败',
    type: error.type || 'error',
    code: error.code
  }
}

/**
 * 生成错误ID
 * @returns {string} 错误ID
 */
function generateErrorId() {
  return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 显示单个验证消息
 * @param {Object} error - 错误对象
 */
function showValidationMessage(error) {
  const message = error.field ? `${error.field}: ${error.message}` : error.message

  if (error.type === 'warning') {
    showWarningMessage(message)
  } else {
    showErrorMessage(message)
  }
}

/**
 * 显示验证错误列表
 * @param {Array} errors - 错误列表
 */
function showValidationList(errors) {
  // 触发全局事件，让ValidationMessage组件监听
  if (typeof window !== 'undefined' && window.eventBus) {
    window.eventBus.$emit('show-validation-list', {
      messageList: errors,
      showSummary: false
    })
  }
}

/**
 * 显示验证错误摘要
 * @param {Array} errors - 错误列表
 */
function showValidationSummary(errors) {
  // 触发全局事件，让ValidationMessage组件监听
  if (typeof window !== 'undefined' && window.eventBus) {
    window.eventBus.$emit('show-validation-summary', {
      messageList: errors,
      showSummary: true,
      summaryTitle: `表单验证失败 (${errors.length}个错误)`
    })
  }
}

/**
 * 获取字段友好名称
 * @param {string} field - 字段名
 * @returns {string} 友好名称
 */
export function getFieldFriendlyName(field) {
  const fieldNameMap = {
    // 基本信息
    applicantName: '申请人姓名',
    idNumber: '身份证号',
    phone: '手机号码',
    email: '邮箱地址',

    // 申请信息
    applicationType: '申请类型',
    department: '申请部门',
    reason: '申请原因',
    description: '详细描述',

    // 登录信息
    username: '用户名',
    password: '密码',
    confirmPassword: '确认密码',

    // 查询信息
    applicationId: '申请编号'
  }

  return fieldNameMap[field] || field
}

/**
 * 验证单个字段
 * @param {string} field - 字段名
 * @param {any} value - 字段值
 * @param {Object} rules - 验证规则
 * @returns {Object|null} 验证结果
 */
export function validateField(field, value, rules = {}) {
  const errors = []

  // 必填验证
  if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
    errors.push({
      field,
      message: `${getFieldFriendlyName(field)}不能为空`,
      type: 'error',
      code: 'REQUIRED'
    })
    return errors[0] // 必填验证失败，不继续其他验证
  }

  // 如果值为空且非必填，跳过其他验证
  if (!value || (typeof value === 'string' && !value.trim())) {
    return null
  }

  // 长度验证
  if (rules.minLength && value.length < rules.minLength) {
    errors.push({
      field,
      message: `${getFieldFriendlyName(field)}长度不能少于${rules.minLength}个字符`,
      type: 'error',
      code: 'MIN_LENGTH'
    })
  }

  if (rules.maxLength && value.length > rules.maxLength) {
    errors.push({
      field,
      message: `${getFieldFriendlyName(field)}长度不能超过${rules.maxLength}个字符`,
      type: 'error',
      code: 'MAX_LENGTH'
    })
  }

  // 格式验证
  if (rules.pattern && !rules.pattern.test(value)) {
    errors.push({
      field,
      message: rules.patternMessage || `${getFieldFriendlyName(field)}格式不正确`,
      type: 'error',
      code: 'PATTERN'
    })
  }

  // 自定义验证
  if (rules.validator && typeof rules.validator === 'function') {
    const result = rules.validator(value)
    if (result !== true) {
      errors.push({
        field,
        message: typeof result === 'string' ? result : `${getFieldFriendlyName(field)}验证失败`,
        type: 'error',
        code: 'CUSTOM'
      })
    }
  }

  return errors.length > 0 ? errors[0] : null
}

/**
 * 导出默认配置
 */
export default {
  handleError,
  showErrorMessage,
  showConfirmDialog,
  showSuccessMessage,
  showWarningMessage,
  showInfoMessage,
  showSuccessDialog,
  showSuccessToast,
  showRegistrationSuccess,
  showStatusQuerySuccess,
  handleValidationErrors,
  getFieldFriendlyName,
  validateField,
  clearErrorCache
}
