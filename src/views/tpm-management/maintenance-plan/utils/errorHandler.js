/**
 * 文件名称：errorHandler.js
 * 文件描述：维护计划管理模块统一错误处理工具
 * 创建日期：2024-01-20
 * 修改记录：
 *   - 2024-01-20: 初始创建，实现统一错误处理和消息提示
 */

import { Message, MessageBox } from 'element-ui'

/**
 * 错误处理工具类
 * 负责统一处理API错误响应，提供用户友好的错误消息提示
 */
class ErrorHandler {
  /**
   * 处理API错误
   * @param {Error} error - API错误对象
   * @param {Object} options - 处理选项
   * @param {boolean} options.showMessage - 是否显示错误消息，默认true
   * @param {string} options.defaultMessage - 默认错误消息
   * @param {Function} options.onError - 错误回调函数
   * @returns {Object} 错误处理结果
   */
  handleError(error, options = {}) {
    const {
      showMessage = true,
      defaultMessage = '操作失败，请稍后重试',
      onError
    } = options

    // 开发环境输出详细错误日志
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ 维护计划管理 - API错误:', {
        code: error.code,
        message: error.message,
        status: error.status,
        details: error.details,
        stack: error.stack
      })
    }

    // 获取用户友好的错误消息（优先使用后端返回的消息）
    const errorMessage = this.getErrorMessage(error, defaultMessage)

    // 显示错误消息
    if (showMessage) {
      this.showErrorMessage(error, errorMessage)
    }

    // 执行错误回调
    if (onError && typeof onError === 'function') {
      onError(error)
    }

    // 返回错误处理结果
    return {
      code: error.code,
      message: errorMessage,
      handled: true
    }
  }

  /**
   * 获取错误消息
   * @param {Error} error - 错误对象
   * @param {string} defaultMessage - 默认消息
   * @returns {string} 错误消息
   */
  getErrorMessage(error, defaultMessage) {
    // 优先使用后端返回的错误消息
    if (error.message) {
      return error.message
    }

    // 使用默认消息
    return defaultMessage
  }

  /**
   * 显示错误消息
   * @param {Error} error - 错误对象
   * @param {string} message - 错误消息
   */
  showErrorMessage(error, message) {
    const errorCode = error.code

    // 根据错误类型选择不同的消息类型
    if (errorCode === 'MAINTENANCE_PLAN_005') {
      // 警告类型错误：存在未完成任务
      Message({
        message,
        type: 'warning',
        duration: 5000,
        showClose: true
      })
    } else if (this.isValidationError(error)) {
      // 验证错误：警告类型
      Message({
        message,
        type: 'warning',
        duration: 4000,
        showClose: true
      })
    } else if (this.isPermissionError(error)) {
      // 权限错误：警告类型
      Message({
        message,
        type: 'warning',
        duration: 5000,
        showClose: true
      })
    } else {
      // 其他错误：错误类型
      Message({
        message,
        type: 'error',
        duration: 5000,
        showClose: true
      })
    }
  }

  /**
   * 判断是否为验证错误
   * @param {Error} error - 错误对象
   * @returns {boolean} 是否为验证错误
   */
  isValidationError(error) {
    return error.code === 'VALIDATION_ERROR' ||
           error.code?.startsWith('VAL_')
  }

  /**
   * 判断是否为权限错误
   * @param {Error} error - 错误对象
   * @returns {boolean} 是否为权限错误
   */
  isPermissionError(error) {
    return error.code === 'FORBIDDEN' ||
           error.code === 'AUTH_006' ||
           error.status === 403
  }

  /**
   * 判断是否为认证错误
   * @param {Error} error - 错误对象
   * @returns {boolean} 是否为认证错误
   */
  isAuthError(error) {
    return error.code === 'UNAUTHORIZED' ||
           error.code?.startsWith('AUTH_') ||
           error.status === 401
  }

  /**
   * 处理表单验证错误
   * @param {Error} error - 错误对象
   * @param {Object} formRef - 表单引用
   * @returns {Object} 处理结果
   */
  handleFormValidationError(error, formRef) {
    // 开发环境输出日志
    if (process.env.NODE_ENV === 'development') {
      console.log('📋 处理表单验证错误:', error)
    }

    // 如果有字段级别的错误信息
    if (error.details && error.details.field) {
      const { field, message } = error.details

      // 设置表单字段错误
      if (formRef && formRef.fields) {
        const fieldComponent = formRef.fields.find(f => f.prop === field)
        if (fieldComponent) {
          fieldComponent.validateMessage = message
          fieldComponent.validateState = 'error'
        }
      }

      return {
        field,
        message,
        handled: true
      }
    }

    // 显示通用验证错误消息
    this.showErrorMessage(error, error.message || '表单验证失败')

    return {
      handled: true
    }
  }

  /**
   * 显示确认对话框（用于操作前确认）
   * @param {Object} options - 对话框选项
   * @param {string} options.title - 标题
   * @param {string} options.message - 消息内容
   * @param {string} options.type - 类型：warning/info/error
   * @param {string} options.confirmButtonText - 确认按钮文本
   * @param {string} options.cancelButtonText - 取消按钮文本
   * @returns {Promise} 确认结果
   */
  showConfirm(options = {}) {
    const {
      title = '提示',
      message = '确定执行此操作吗？',
      type = 'warning',
      confirmButtonText = '确定',
      cancelButtonText = '取消'
    } = options

    return MessageBox.confirm(message, title, {
      confirmButtonText,
      cancelButtonText,
      type,
      closeOnClickModal: false,
      closeOnPressEscape: false
    })
  }
}

// 创建单例实例
const errorHandler = new ErrorHandler()

// 导出单例实例
export default errorHandler

// 导出类，供需要创建新实例的场景使用
export { ErrorHandler }

