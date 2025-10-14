/**
 * 文件名称：approval-status-checker.js
 * 文件描述：审批状态检查工具
 * 创建日期：2025-10-13
 * 修改记录：
 *   - 2025-10-13: 初始创建，提供审批状态检查功能
 */

import { fetchApprovalRequests } from '../api'
import { Notification } from 'element-ui'

/**
 * 审批状态检查器
 */
export class ApprovalStatusChecker {
  constructor(options = {}) {
    this.checkInterval = options.checkInterval || 30000 // 30秒
    this.showNotification = options.showNotification !== false
    this.onPendingFound = options.onPendingFound || null
  }

  /**
   * 检查计划的审批状态
   * @param {string} planId - 计划ID
   * @returns {Promise<Object>} 检查结果
   */
  async checkApprovalStatus(planId) {
    try {
      const response = await fetchApprovalRequests(planId, {
        status: 'PENDING',
        limit: 10
      })

      const pendingApprovals = response.data?.approvals?.filter(
        approval => approval.status === 'PENDING'
      ) || []

      return {
        hasPending: pendingApprovals.length > 0,
        pendingCount: pendingApprovals.length,
        approvals: pendingApprovals
      }
    } catch (error) {
      console.warn('检查审批状态失败:', error)
      return {
        hasPending: false,
        pendingCount: 0,
        approvals: [],
        error
      }
    }
  }

  /**
   * 批量检查多个计划的审批状态
   * @param {Array<string>} planIds - 计划ID数组
   * @returns {Promise<Object>} 检查结果
   */
  async batchCheckApprovalStatus(planIds) {
    const results = {}

    for (const planId of planIds) {
      results[planId] = await this.checkApprovalStatus(planId)
    }

    return results
  }

  /**
   * 显示审批状态通知
   * @param {Object} statusResult - 状态检查结果
   * @param {string} planNumber - 计划编号
   */
  showApprovalStatusNotification(statusResult, planNumber = '') {
    if (!this.showNotification || !statusResult.hasPending) {
      return
    }

    const { pendingCount, approvals } = statusResult
    const title = `${planNumber ? `${planNumber} - ` : ''}审批处理中`

    let message = `该计划有 ${pendingCount} 个审批请求正在处理中`

    if (approvals.length > 0) {
      const approvalDetails = approvals.map(approval => {
        const actionText = this.getActionText(approval.requestedAction)
        const requesterName = approval.requesterName || '未知'
        return `• ${actionText} (申请人: ${requesterName})`
      }).join('\n')

      message += `:\n${approvalDetails}`
    }

    Notification({
      title,
      message,
      type: 'warning',
      duration: 0, // 不自动关闭
      dangerouslyUseHTMLString: true,
      customClass: 'approval-status-notification'
    })

    // 触发回调
    if (this.onPendingFound) {
      this.onPendingFound(statusResult, planNumber)
    }
  }

  /**
   * 获取操作类型文本
   * @param {string} action - 操作类型
   * @returns {string} 操作文本
   */
  getActionText(action) {
    const actionMap = {
      RELEASED: '下达',
      CANCELLED: '取消',
      CONFIRMED: '确认',
      ADJUST: '调整',
      SPLIT: '拆分',
      MERGE: '合并'
    }
    return actionMap[action] || action || '-'
  }

  /**
   * 操作前检查审批状态
   * @param {string} planId - 计划ID
   * @param {string} operation - 操作类型
   * @param {string} planNumber - 计划编号（可选）
   * @returns {Promise<boolean>} 是否可以继续操作
   */
  async checkBeforeOperation(planId, operation, planNumber = '') {
    const statusResult = await this.checkApprovalStatus(planId)

    if (statusResult.hasPending) {
      this.showApprovalStatusNotification(statusResult, planNumber)

      // 对于某些操作，如果有待处理的审批，不允许继续
      const blockedOperations = ['submitApproval', 'updateStatus']
      if (blockedOperations.includes(operation)) {
        return false
      }
    }

    return true
  }
}

/**
 * 创建审批状态检查器实例
 * @param {Object} options - 配置选项
 * @returns {ApprovalStatusChecker} 检查器实例
 */
export function createApprovalStatusChecker(options = {}) {
  return new ApprovalStatusChecker(options)
}

/**
 * 快速检查单个计划的审批状态
 * @param {string} planId - 计划ID
 * @param {string} planNumber - 计划编号（可选）
 * @returns {Promise<Object>} 检查结果
 */
export async function quickCheckApprovalStatus(planId, planNumber = '') {
  const checker = createApprovalStatusChecker()
  const result = await checker.checkApprovalStatus(planId)

  if (result.hasPending) {
    checker.showApprovalStatusNotification(result, planNumber)
  }

  return result
}

/**
 * 在操作前进行审批状态检查的装饰器函数
 * @param {Function} operation - 要执行的操作函数
 * @param {Object} context - 上下文信息
 * @returns {Function} 包装后的函数
 */
export function withApprovalCheck(operation, context = {}) {
  return async function(...args) {
    const { planId, planNumber, operationType } = context

    if (planId) {
      const checker = createApprovalStatusChecker()
      const canProceed = await checker.checkBeforeOperation(
        planId,
        operationType,
        planNumber
      )

      if (!canProceed) {
        throw new Error('存在待处理的审批请求，无法执行此操作')
      }
    }

    return await operation.apply(this, args)
  }
}
