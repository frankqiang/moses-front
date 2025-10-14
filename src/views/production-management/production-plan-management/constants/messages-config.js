/**
 * 文件名称：messages-config.js
 * 文件描述：生产计划管理消息配置
 * 创建日期：2025-01-21
 * 修改记录：
 *   - 2025-01-21: 初始创建
 */

// 成功消息（备用，优先使用后端返回的message）
export const SUCCESS_MESSAGES = {
  FETCH_LIST: '获取生产计划列表成功',
  UPDATE_STATUS: '更新计划状态成功',
  CONFIRM: '确认计划成功',
  CANCEL: '取消计划成功',
  SUBMIT_APPROVAL: '提交审批成功'
}

// 错误消息映射（根据错误码）
export const ERROR_MESSAGES = {
  // 验证错误
  VALIDATION_ERROR: '请求参数验证失败',

  // 生产计划相关错误
  PRODUCTION_PLAN_NOT_FOUND: '生产计划不存在',
  PRODUCTION_PLAN_STATUS_INVALID: '计划状态不合法',
  PRODUCTION_PLAN_OPERATION_NOT_ALLOWED: '当前状态不允许此操作',
  PRODUCTION_PLAN_QUERY_FAILED: '查询生产计划失败，请稍后重试',
  PRODUCTION_PLAN_TRANSACTION_FAILED: '操作失败，请稍后重试',

  // 审批相关错误 - 2025年10月13日新增（更新为实际错误码）
  BIZ_030: '该资源存在待处理的审批请求',
  BIZ_031: '审批请求提交冲突，可能有其他用户同时操作，请稍后重试',
  BIZ_032: '操作已被批准，无需重复提交',

  // 权限错误
  UNAUTHORIZED: '未授权，请重新登录',
  FORBIDDEN: '无权限执行此操作',

  // 通用错误
  NETWORK_ERROR: '网络错误，请检查网络连接',
  UNKNOWN_ERROR: '未知错误，请稍后重试'
}

// 根据错误响应获取友好的错误消息
export function getErrorMessage(error) {
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

