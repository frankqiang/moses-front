/**
 * 文件名称：messageHandler.js
 * 文件描述：维护计划管理模块统一消息提示工具
 * 创建日期：2024-01-20
 * 修改记录：
 *   - 2024-01-20: 初始创建，实现成功/警告/信息消息提示
 */

import { Message } from 'element-ui'

/**
 * 消息提示工具类
 * 负责显示成功、警告、信息等各类用户提示消息
 */
class MessageHandler {
  /**
   * 显示成功消息
   * @param {string|Object} message - 消息内容或响应对象
   * @param {Object} options - 消息选项
   * @param {number} options.duration - 显示时长（毫秒），默认3000
   * @param {boolean} options.showClose - 是否显示关闭按钮，默认false
   */
  success(message, options = {}) {
    const {
      duration = 3000,
      showClose = false
    } = options

    // 如果message是响应对象，提取message字段
    const displayMessage = typeof message === 'object' && message.message
      ? message.message
      : message

    Message({
      message: displayMessage,
      type: 'success',
      duration,
      showClose
    })

    // 开发环境输出日志
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ 成功消息:', displayMessage)
    }
  }

  /**
   * 显示错误消息
   * @param {string} message - 消息内容
   * @param {Object} options - 消息选项
   * @param {number} options.duration - 显示时长（毫秒），默认5000
   * @param {boolean} options.showClose - 是否显示关闭按钮，默认true
   */
  error(message, options = {}) {
    const {
      duration = 5000,
      showClose = true
    } = options

    Message({
      message,
      type: 'error',
      duration,
      showClose
    })

    // 开发环境输出日志
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ 错误消息:', message)
    }
  }

  /**
   * 显示警告消息
   * @param {string} message - 消息内容
   * @param {Object} options - 消息选项
   * @param {number} options.duration - 显示时长（毫秒），默认4000
   * @param {boolean} options.showClose - 是否显示关闭按钮，默认true
   */
  warning(message, options = {}) {
    const {
      duration = 4000,
      showClose = true
    } = options

    Message({
      message,
      type: 'warning',
      duration,
      showClose
    })

    // 开发环境输出日志
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ 警告消息:', message)
    }
  }

  /**
   * 显示信息消息
   * @param {string} message - 消息内容
   * @param {Object} options - 消息选项
   * @param {number} options.duration - 显示时长（毫秒），默认3000
   * @param {boolean} options.showClose - 是否显示关闭按钮，默认false
   */
  info(message, options = {}) {
    const {
      duration = 3000,
      showClose = false
    } = options

    Message({
      message,
      type: 'info',
      duration,
      showClose
    })

    // 开发环境输出日志
    if (process.env.NODE_ENV === 'development') {
      console.log('ℹ️ 信息消息:', message)
    }
  }

  /**
   * 显示操作成功消息（针对维护计划管理的常见操作）
   * @param {string} operation - 操作类型：create/update/delete/enable/disable
   * @param {Object} response - 响应对象
   */
  showOperationSuccess(operation, response) {
    // 优先使用后端返回的消息
    if (response && response.message) {
      this.success(response.message)
      return
    }

    // 备用消息（后端未返回消息时使用）
    const messages = {
      create: '创建维护计划成功',
      update: '更新维护计划成功',
      delete: '删除维护计划成功',
      enable: '启用维护计划成功',
      disable: '禁用维护计划成功'
    }

    const message = messages[operation] || '操作成功'
    this.success(message)
  }

  /**
   * 显示操作警告消息（针对维护计划管理的特殊场景）
   * @param {string} scenario - 场景类型
   * @param {Object} data - 附加数据
   */
  showOperationWarning(scenario, data = {}) {
    const warnings = {
      'has-unfinished-tasks': '存在未完成的维护任务，无法禁用计划',
      'already-enabled': '维护计划已经是启用状态',
      'already-disabled': '维护计划已经是禁用状态',
      'code-exists': '维护计划编码已存在，请更换编码',
      'equipment-not-found': '设备不存在，请检查设备信息'
    }

    const message = warnings[scenario] || data.message || '操作受限'
    this.warning(message)
  }
}

// 创建单例实例
const messageHandler = new MessageHandler()

// 导出单例实例
export default messageHandler

// 导出类，供需要创建新实例的场景使用
export { MessageHandler }

