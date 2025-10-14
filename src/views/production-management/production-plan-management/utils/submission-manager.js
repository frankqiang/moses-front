/**
 * 文件名称：submission-manager.js
 * 文件描述：防重复提交管理器
 * 创建日期：2025-10-13
 * 修改记录：
 *   - 2025-10-13: 初始创建，实现防重复提交机制
 */

import { Message } from 'element-ui'

/**
 * 防重复提交管理器
 * 根据审批重复提交修复对接文档实现防重复提交机制
 */
export class SubmissionManager {
  constructor(options = {}) {
    this.SUBMIT_COOLDOWN = options.cooldown || 2000 // 2秒冷却时间
    this.submissionStates = new Map() // 存储提交状态
    this.lastSubmitTimes = new Map() // 存储最后提交时间
  }

  /**
   * 检查是否可以提交
   * @param {string} key - 提交标识符（如planId + operation）
   * @returns {boolean} 是否可以提交
   */
  canSubmit(key) {
    // 检查是否正在提交中
    if (this.submissionStates.get(key)) {
      Message.warning('请求正在处理中，请勿重复提交')
      return false
    }

    // 检查冷却时间
    const lastSubmitTime = this.lastSubmitTimes.get(key) || 0
    const now = Date.now()
    const timeDiff = now - lastSubmitTime

    if (timeDiff < this.SUBMIT_COOLDOWN) {
      const remainingTime = Math.ceil((this.SUBMIT_COOLDOWN - timeDiff) / 1000)
      Message.warning(`请等待 ${remainingTime} 秒后重试`)
      return false
    }

    return true
  }

  /**
   * 开始提交
   * @param {string} key - 提交标识符
   */
  startSubmission(key) {
    this.submissionStates.set(key, true)
    this.lastSubmitTimes.set(key, Date.now())
  }

  /**
   * 结束提交
   * @param {string} key - 提交标识符
   */
  endSubmission(key) {
    this.submissionStates.set(key, false)
  }

  /**
   * 清理指定的提交状态
   * @param {string} key - 提交标识符
   */
  clearSubmission(key) {
    this.submissionStates.delete(key)
    this.lastSubmitTimes.delete(key)
  }

  /**
   * 清理所有提交状态
   */
  clearAll() {
    this.submissionStates.clear()
    this.lastSubmitTimes.clear()
  }

  /**
   * 获取提交状态信息
   * @param {string} key - 提交标识符
   * @returns {Object} 状态信息
   */
  getSubmissionStatus(key) {
    const isSubmitting = this.submissionStates.get(key) || false
    const lastSubmitTime = this.lastSubmitTimes.get(key) || 0
    const timeSinceLastSubmit = Date.now() - lastSubmitTime
    const remainingCooldown = Math.max(0, this.SUBMIT_COOLDOWN - timeSinceLastSubmit)

    return {
      isSubmitting,
      lastSubmitTime,
      timeSinceLastSubmit,
      remainingCooldown,
      canSubmit: !isSubmitting && remainingCooldown === 0
    }
  }
}

/**
 * 全局提交管理器实例
 */
const globalSubmissionManager = new SubmissionManager()

/**
 * 带防重复提交的操作装饰器
 * @param {Function} operation - 要执行的操作函数
 * @param {Object} options - 配置选项
 * @returns {Function} 包装后的函数
 */
export function withSubmissionControl(operation, options = {}) {
  return async function(key, ...args) {
    const manager = options.manager || globalSubmissionManager

    // 检查是否可以提交
    if (!manager.canSubmit(key)) {
      throw new Error('SUBMISSION_BLOCKED')
    }

    // 开始提交
    manager.startSubmission(key)

    try {
      const result = await operation(...args)
      return result
    } finally {
      // 结束提交
      manager.endSubmission(key)
    }
  }
}

/**
 * 生成提交键值
 * @param {string} planId - 计划ID
 * @param {string} operation - 操作类型
 * @returns {string} 提交键值
 */
export function generateSubmissionKey(planId, operation) {
  return `${planId}:${operation}`
}

/**
 * 快速创建防重复提交的计划操作
 * @param {Function} apiCall - API调用函数
 * @param {string} planId - 计划ID
 * @param {string} operation - 操作类型
 * @param {Object} options - 选项
 * @returns {Promise} 操作结果
 */
export async function submitPlanOperation(apiCall, planId, operation, options = {}) {
  const key = generateSubmissionKey(planId, operation)
  const manager = options.manager || globalSubmissionManager

  // 检查提交状态
  if (!manager.canSubmit(key)) {
    throw new Error('SUBMISSION_BLOCKED')
  }

  // 开始提交
  manager.startSubmission(key)

  try {
    console.log(`🚀 开始执行操作: ${operation} for plan ${planId}`)
    const result = await apiCall()
    console.log(`✅ 操作完成: ${operation} for plan ${planId}`)
    return result
  } catch (error) {
    console.error(`❌ 操作失败: ${operation} for plan ${planId}`, error)
    throw error
  } finally {
    // 结束提交
    manager.endSubmission(key)
  }
}

/**
 * 获取全局提交管理器
 * @returns {SubmissionManager} 全局提交管理器实例
 */
export function getGlobalSubmissionManager() {
  return globalSubmissionManager
}

/**
 * 创建新的提交管理器
 * @param {Object} options - 配置选项
 * @returns {SubmissionManager} 新的提交管理器实例
 */
export function createSubmissionManager(options = {}) {
  return new SubmissionManager(options)
}

export default SubmissionManager
