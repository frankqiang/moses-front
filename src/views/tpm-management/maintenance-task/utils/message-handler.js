/**
 * 文件名称：message-handler.js
 * 文件描述：维护任务管理消息提示工具类
 * 创建日期：2024-01-20
 * 修改记录：
 *   - 2024-01-20: 初始创建
 */

import { showSuccessMessage, showWarningMessage, showConfirm } from './error-handler'

/**
 * 操作成功消息映射
 */
const SUCCESS_MESSAGE_MAP = {
  create: '创建维护任务成功',
  assign: '任务派工成功',
  accept: '任务接单成功',
  start: '开始执行任务成功',
  complete: '任务完成成功',
  postpone: '任务延期成功',
  cancel: '任务取消成功',
  delete: '删除任务成功',
  update: '更新任务成功'
}

/**
 * 显示操作成功消息
 * @param {string} operation - 操作类型（create/assign/accept/start/complete/postpone/cancel）
 * @param {string} customMessage - 自定义消息（可选，优先使用后端返回的消息）
 * @returns {Object} Message实例
 */
function showOperationSuccess(operation, customMessage = null) {
  const message = customMessage || SUCCESS_MESSAGE_MAP[operation] || '操作成功'
  return showSuccessMessage(message)
}

/**
 * 显示创建成功消息
 * @param {string} customMessage - 自定义消息（可选）
 * @returns {Object} Message实例
 */
function showCreateSuccess(customMessage = null) {
  return showOperationSuccess('create', customMessage)
}

/**
 * 显示派工成功消息
 * @param {string} customMessage - 自定义消息（可选）
 * @returns {Object} Message实例
 */
function showAssignSuccess(customMessage = null) {
  return showOperationSuccess('assign', customMessage)
}

/**
 * 显示接单成功消息
 * @param {string} customMessage - 自定义消息（可选）
 * @returns {Object} Message实例
 */
function showAcceptSuccess(customMessage = null) {
  return showOperationSuccess('accept', customMessage)
}

/**
 * 显示开始执行成功消息
 * @param {string} customMessage - 自定义消息（可选）
 * @returns {Object} Message实例
 */
function showStartSuccess(customMessage = null) {
  return showOperationSuccess('start', customMessage)
}

/**
 * 显示完成任务成功消息
 * @param {string} customMessage - 自定义消息（可选）
 * @returns {Object} Message实例
 */
function showCompleteSuccess(customMessage = null) {
  return showOperationSuccess('complete', customMessage)
}

/**
 * 显示延期成功消息
 * @param {string} customMessage - 自定义消息（可选）
 * @returns {Object} Message实例
 */
function showPostponeSuccess(customMessage = null) {
  return showOperationSuccess('postpone', customMessage)
}

/**
 * 显示取消成功消息
 * @param {string} customMessage - 自定义消息（可选）
 * @returns {Object} Message实例
 */
function showCancelSuccess(customMessage = null) {
  return showOperationSuccess('cancel', customMessage)
}

/**
 * 显示删除成功消息
 * @param {string} customMessage - 自定义消息（可选）
 * @returns {Object} Message实例
 */
function showDeleteSuccess(customMessage = null) {
  return showOperationSuccess('delete', customMessage)
}

/**
 * 显示更新成功消息
 * @param {string} customMessage - 自定义消息（可选）
 * @returns {Object} Message实例
 */
function showUpdateSuccess(customMessage = null) {
  return showOperationSuccess('update', customMessage)
}

/**
 * 确认派工操作
 * @param {string} assigneeName - 执行人姓名
 * @returns {Promise} 确认Promise
 */
function confirmAssignTask(assigneeName) {
  return showConfirm(
    `确认将任务派发给 "${assigneeName}" 吗？`,
    '确认派工',
    { type: 'info' }
  )
}

/**
 * 确认接单操作
 * @returns {Promise} 确认Promise
 */
function confirmAcceptTask() {
  return showConfirm(
    '确认接收此任务吗？接单后将成为任务执行人。',
    '确认接单',
    { type: 'info' }
  )
}

/**
 * 确认开始执行操作
 * @returns {Promise} 确认Promise
 */
function confirmStartTask() {
  return showConfirm(
    '确认开始执行此任务吗？任务开始后设备状态将变为"维护中"。',
    '确认开始执行',
    { type: 'info' }
  )
}

/**
 * 确认延期操作
 * @param {string} delayReason - 延期原因
 * @returns {Promise} 确认Promise
 */
function confirmPostponeTask(delayReason) {
  const message = delayReason
    ? `确认延期此任务吗？<br/>延期原因：${delayReason}`
    : '确认延期此任务吗？'

  return showConfirm(
    message,
    '确认延期',
    {
      type: 'warning',
      dangerouslyUseHTMLString: !!delayReason
    }
  )
}

/**
 * 确认取消操作
 * @param {string} cancelReason - 取消原因
 * @returns {Promise} 确认Promise
 */
function confirmCancelTask(cancelReason) {
  const message = cancelReason
    ? `确认取消此任务吗？<br/>取消原因：${cancelReason}`
    : '确认取消此任务吗？任务取消后无法恢复。'

  return showConfirm(
    message,
    '确认取消',
    {
      type: 'warning',
      dangerouslyUseHTMLString: !!cancelReason
    }
  )
}

/**
 * 确认删除操作
 * @param {string} taskTitle - 任务标题
 * @returns {Promise} 确认Promise
 */
function confirmDeleteTask(taskTitle) {
  const message = taskTitle
    ? `确认删除任务 "${taskTitle}" 吗？此操作无法恢复。`
    : '确认删除此任务吗？此操作无法恢复。'

  return showConfirm(
    message,
    '确认删除',
    { type: 'warning' }
  )
}

/**
 * 警告：任务即将逾期
 * @param {string} taskTitle - 任务标题
 * @param {string} plannedStartTime - 计划开始时间
 */
function warnTaskOverdue(taskTitle, plannedStartTime) {
  const message = `任务 "${taskTitle}" 计划开始时间为 ${plannedStartTime}，即将逾期，请尽快处理！`
  return showWarningMessage(message, { duration: 6000 })
}

/**
 * 警告：任务已逾期
 * @param {string} taskTitle - 任务标题
 */
function warnTaskAlreadyOverdue(taskTitle) {
  const message = `任务 "${taskTitle}" 已逾期，请立即处理！`
  return showWarningMessage(message, { duration: 6000 })
}

/**
 * 消息处理工具类导出
 */
export default {
  // 成功消息
  showOperationSuccess,
  showCreateSuccess,
  showAssignSuccess,
  showAcceptSuccess,
  showStartSuccess,
  showCompleteSuccess,
  showPostponeSuccess,
  showCancelSuccess,
  showDeleteSuccess,
  showUpdateSuccess,

  // 确认对话框
  confirmAssignTask,
  confirmAcceptTask,
  confirmStartTask,
  confirmPostponeTask,
  confirmCancelTask,
  confirmDeleteTask,

  // 警告消息
  warnTaskOverdue,
  warnTaskAlreadyOverdue
}

/**
 * 导出独立函数（便于按需导入）
 */
export {
  // 成功消息
  showOperationSuccess,
  showCreateSuccess,
  showAssignSuccess,
  showAcceptSuccess,
  showStartSuccess,
  showCompleteSuccess,
  showPostponeSuccess,
  showCancelSuccess,
  showDeleteSuccess,
  showUpdateSuccess,

  // 确认对话框
  confirmAssignTask,
  confirmAcceptTask,
  confirmStartTask,
  confirmPostponeTask,
  confirmCancelTask,
  confirmDeleteTask,

  // 警告消息
  warnTaskOverdue,
  warnTaskAlreadyOverdue
}

