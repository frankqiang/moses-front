/**
 * 文件名称：messages-config.js
 * 文件描述：生产计划管理消息配置（仅备用场景）
 * 创建日期：2025-01-21
 * 修改记录：
 *   - 2025-01-21: 初始创建
 *   - 2025-10-15: 简化配置，优先使用后端返回的消息
 */

/**
 * ⚠️ 重要说明：
 * 1. 后端接口已返回完整的 message 字段（成功）和 error.message 字段（失败）
 * 2. 前端应优先使用后端返回的消息，不应硬编码
 * 3. 此配置仅用于以下极端场景的备用消息：
 *    - 网络错误（无法到达后端）
 *    - 请求超时
 *    - 响应格式异常
 */

// 仅保留无法从后端获取消息的场景
const FALLBACK_MESSAGES = {
  // 网络层错误（后端无法返回）
  NETWORK_ERROR: '网络连接失败，请检查网络设置',
  TIMEOUT_ERROR: '请求超时，请稍后重试',

  // 响应格式异常
  INVALID_RESPONSE: '服务器响应格式异常，请联系管理员',

  // 兜底消息
  UNKNOWN_ERROR: '操作失败，请稍后重试'
}

/**
 * 获取错误消息
 * 优先级：后端消息 > 本地备用消息
 * @param {Error} error - 错误对象（可能是 ApiError 或 axios 错误）
 * @returns {string} 错误消息
 */
export function getErrorMessage(error) {
  if (!error) {
    return FALLBACK_MESSAGES.UNKNOWN_ERROR
  }

  // ✅ 第一优先级：ApiError 对象（已被 request.js 包装）
  // ApiError 的 message 属性直接包含后端返回的错误消息
  if (error.name === 'ApiError' && error.message) {
    return error.message
  }

  // ✅ 第二优先级：axios 原始错误对象中的后端消息
  if (error.response?.data?.error?.message) {
    return error.response.data.error.message
  }

  // ⚠️ 第三优先级：无法到达后端的场景
  // 网络错误
  if (error.message === 'Network Error' || error.code === 'NETWORK_ERROR') {
    return FALLBACK_MESSAGES.NETWORK_ERROR
  }

  // 请求超时
  if (error.code === 'ECONNABORTED' || error.code === 'NETWORK_TIMEOUT' || error.message.includes('timeout')) {
    return FALLBACK_MESSAGES.TIMEOUT_ERROR
  }

  // 响应格式异常（后端返回但格式不符合预期）
  if (error.response?.data && !error.response.data.error) {
    return FALLBACK_MESSAGES.INVALID_RESPONSE
  }

  // ⚠️ 兜底：使用 error.message 或默认消息
  return error.message || FALLBACK_MESSAGES.UNKNOWN_ERROR
}

/**
 * 获取成功消息
 * 直接使用后端返回的 message 字段
 * @param {Object} response - 响应对象
 * @param {string} fallback - 备用消息（仅在后端未返回时使用）
 * @returns {string} 成功消息
 */
export function getSuccessMessage(response, fallback = '操作成功') {
  return response?.message || response?.data?.message || fallback
}

