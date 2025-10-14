/**
 * 文件名称：approval-error-handler.js
 * 文件描述：审批相关错误处理工具
 * 创建日期：2025-10-13
 * 修改记录：
 *   - 2025-10-13: 初始创建，实现审批冲突错误的处理逻辑
 */

import { MessageBox, Message } from 'element-ui'
import { ERROR_MESSAGES } from '../constants'

/**
 * 延迟函数
 * @param {number} ms - 延迟毫秒数
 * @returns {Promise} Promise对象
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 审批错误处理器
 * 根据不同的错误码提供不同的处理策略
 */
export class ApprovalErrorHandler {
  constructor(options = {}) {
    this.maxRetries = options.maxRetries || 3
    this.baseDelay = options.baseDelay || 1000
    this.onApprovalDetailsView = options.onApprovalDetailsView || null
    this.onRefreshData = options.onRefreshData || null
    this.onCancelApproval = options.onCancelApproval || null
  }

  /**
   * 处理审批相关错误
   * @param {Object} error - 错误对象
   * @param {Object} context - 上下文信息
   * @returns {Promise} 处理结果
   */
  async handleError(error, context = {}) {
    if (!error?.response?.data?.error) {
      // 非标准错误格式，使用默认处理
      return this.handleGenericError(error)
    }

    const { code, message, details } = error.response.data.error

    switch (code) {
      case 'BIZ_030':
        return this.handlePendingApprovalExists(message, details, context)

      case 'BIZ_031':
        return this.handleSubmitFailed(message, details, context)

      case 'BIZ_032':
        return this.handleAlreadyApproved(message, details, context)

      default:
        return this.handleGenericError(error)
    }
  }

  /**
   * 处理"存在待处理审批"错误
   * @param {string} message - 错误消息
   * @param {Object} details - 错误详情
   * @param {Object} context - 上下文信息
   */
  async handlePendingApprovalExists(message, details, context) {
    const { approvalId } = details || {}

    try {
      const action = await MessageBox({
        title: '审批请求处理中',
        message: `
          <div style="padding: 10px 0;">
            <p style="margin-bottom: 10px;">🔍 ${message || '该计划有审批请求正在处理中'}</p>
            <p style="margin-bottom: 15px; color: #909399; font-size: 13px;">
              请等待当前审批完成，或者查看详情了解审批进度。您也可以选择撤销当前审批。
            </p>
            ${approvalId ? `<p style="margin: 0; color: #666; font-size: 12px;">审批ID: ${approvalId}</p>` : ''}
            <div style="margin-top: 15px; padding: 8px; background-color: #f0f9ff; border-radius: 4px;">
              <p style="margin: 0; color: #1890ff; font-size: 12px;">💡 提示：如果您需要修改审批内容，可以先撤销当前审批，然后重新提交。</p>
            </div>
          </div>
        `,
        dangerouslyUseHTMLString: true,
        showCancelButton: true,
        showClose: true,
        confirmButtonText: '查看审批详情',
        cancelButtonText: '撤销审批',
        closeButtonText: '我知道了',
        distinguishCancelAndClose: true,
        type: 'warning'
      })

      if (action === 'confirm' && this.onApprovalDetailsView) {
        // 查看审批详情
        this.onApprovalDetailsView(approvalId, context)
      } else if (action === 'cancel' && this.onCancelApproval) {
        // 撤销审批
        this.onCancelApproval(approvalId, context)
      }

      return { handled: true, retry: false }
    } catch (closeAction) {
      return { handled: true, retry: false }
    }
  }

  /**
   * 处理"提交失败"错误（并发冲突）- 现在很少见
   * @param {string} message - 错误消息
   * @param {Object} details - 错误详情
   * @param {Object} context - 上下文信息
   */
  async handleSubmitFailed(message, details, context) {
    try {
      const action = await MessageBox({
        title: '操作冲突（罕见）',
        message: `
          <div style="padding: 10px 0;">
            <p style="margin-bottom: 10px;">⚠️ ${message || '检测到并发操作冲突'}</p>
            <p style="margin-bottom: 15px; color: #909399; font-size: 13px;">
              这是一个罕见的并发冲突情况。系统已经优化了审批重试逻辑，这种错误应该很少出现。
            </p>
            <p style="margin-bottom: 10px; color: #666; font-size: 12px;">💡 建议：刷新页面获取最新状态，然后重试操作</p>
            <div style="margin-top: 10px; padding: 8px; background-color: #fff7e6; border-radius: 4px;">
              <p style="margin: 0; color: #fa8c16; font-size: 12px;">⚠️ 如果问题持续出现，请联系技术支持</p>
            </div>
          </div>
        `,
        dangerouslyUseHTMLString: true,
        showCancelButton: true,
        confirmButtonText: '刷新页面',
        cancelButtonText: '稍后重试',
        distinguishCancelAndClose: true,
        type: 'warning'
      })

      if (action === 'confirm') {
        // 刷新页面数据
        if (this.onRefreshData) {
          this.onRefreshData(context)
        } else {
          window.location.reload()
        }
        return { handled: true, retry: false }
      } else if (action === 'cancel') {
        return { handled: true, retry: true }
      }
    } catch (closeAction) {
      return { handled: true, retry: false }
    }

    return { handled: true, retry: false }
  }

  /**
   * 处理"操作已被批准"错误（新增）
   * @param {string} message - 错误消息
   * @param {Object} details - 错误详情
   * @param {Object} context - 上下文信息
   */
  async handleAlreadyApproved(message, details, context) {
    try {
      await MessageBox({
        title: '操作已完成',
        message: `
          <div style="padding: 10px 0;">
            <p style="margin-bottom: 10px;">✅ ${message || '该操作已被批准，无需重复提交'}</p>
            <p style="margin-bottom: 15px; color: #909399; font-size: 13px;">
              系统检测到该操作已经被批准并完成，无需重复提交审批请求。
            </p>
            <div style="margin-top: 15px; padding: 8px; background-color: #f6ffed; border-radius: 4px;">
              <p style="margin: 0; color: #52c41a; font-size: 12px;">💡 建议：刷新页面查看最新状态</p>
            </div>
          </div>
        `,
        dangerouslyUseHTMLString: true,
        confirmButtonText: '刷新页面',
        type: 'success'
      })

      // 自动刷新页面数据
      if (this.onRefreshData) {
        this.onRefreshData(context)
      } else {
        window.location.reload()
      }

      return { handled: true, retry: false }
    } catch (closeAction) {
      return { handled: true, retry: false }
    }
  }

  /**
   * 处理通用错误
   * @param {Object} error - 错误对象
   */
  handleGenericError(error) {
    const errorMessage = this.getErrorMessage(error)
    Message.error(errorMessage)
    return { handled: true, retry: false }
  }

  /**
   * 获取错误消息
   * @param {Object} error - 错误对象
   * @returns {string} 错误消息
   */
  getErrorMessage(error) {
    if (!error) {
      return ERROR_MESSAGES.UNKNOWN_ERROR
    }

    // 优先使用后端返回的错误消息
    if (error.response?.data?.error?.message) {
      return error.response.data.error.message
    }

    // 根据错误码匹配
    if (error.response?.data?.error?.code) {
      const errorCode = error.response.data.error.code
      return ERROR_MESSAGES[errorCode] || ERROR_MESSAGES.UNKNOWN_ERROR
    }

    // 根据HTTP状态码处理
    if (error.response?.status) {
      const status = error.response.status
      if (status === 401) {
        return ERROR_MESSAGES.UNAUTHORIZED
      }
      if (status === 403) {
        return ERROR_MESSAGES.FORBIDDEN
      }
      if (status === 404) {
        return ERROR_MESSAGES.PRODUCTION_PLAN_NOT_FOUND
      }
    }

    // 网络错误
    if (error.message === 'Network Error') {
      return ERROR_MESSAGES.NETWORK_ERROR
    }

    // 使用错误消息或默认消息
    return error.message || ERROR_MESSAGES.UNKNOWN_ERROR
  }
}

/**
 * 带重试机制的API调用函数
 * @param {Function} apiCall - API调用函数
 * @param {Object} options - 选项
 * @returns {Promise} API调用结果
 */
export async function withRetry(apiCall, options = {}) {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    onRetry = null,
    context = {}
  } = options

  const errorHandler = new ApprovalErrorHandler({
    maxRetries,
    baseDelay,
    ...options
  })

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall()
    } catch (error) {
      const isLastAttempt = attempt === maxRetries

      // 如果是审批相关错误，使用专门的处理器
      if (error?.response?.data?.error?.code) {
        const result = await errorHandler.handleError(error, {
          ...context,
          attempt,
          isLastAttempt
        })

        if (result.handled && !result.retry) {
          // 错误已处理且不需重试
          throw error
        }

        if (result.handled && result.retry && !isLastAttempt) {
          // 需要重试且不是最后一次尝试
          if (onRetry) {
            onRetry(attempt, error)
          }
          // 指数退避策略
          await delay(baseDelay * Math.pow(2, attempt - 1))
          continue
        }
      }

      // 如果是最后一次尝试或不是审批相关错误，直接抛出
      if (isLastAttempt) {
        throw error
      }

      // 对于其他错误，也实施重试策略（适用于BIZ_031）
      if (error?.response?.data?.error?.code === 'BIZ_031' && !isLastAttempt) {
        if (onRetry) {
          onRetry(attempt, error)
        }
        await delay(baseDelay * Math.pow(2, attempt - 1))
        continue
      }

      // 其他错误直接抛出
      throw error
    }
  }
}

/**
 * 创建审批错误处理实例的便利函数
 * @param {Object} options - 配置选项
 * @returns {ApprovalErrorHandler} 错误处理实例
 */
export function createApprovalErrorHandler(options = {}) {
  return new ApprovalErrorHandler(options)
}
