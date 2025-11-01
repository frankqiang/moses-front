/**
 * 文件名称：errorTypes.js
 * 文件描述：前端错误类型判断（极简版）
 * 创建日期：2025-10-27
 *
 * 设计原则：只定义拦截器需要判断的错误类型
 */

/**
 * 认证失效错误码（需要重新登录的）
 */
const AUTH_FAILURE_CODES = [
  'AUTH_001', // 未授权
  'AUTH_002', // Token过期（会尝试自动刷新）
  'AUTH_003', // Token无效
  'AUTH_004', // Token格式错误
  'AUTH_005', // Token黑名单
  'AUTH_007', // 用户未激活
  'AUTH_008', // 账户临时锁定
  'AUTH_030', // 会话过期
  'AUTH_031', // 会话无效
  'AUTH_032', // RefreshToken过期
  'AUTH_033' // RefreshToken无效
]

/**
 * 检查是否为认证失效错误（需要重新登录）
 */
export function isAuthFailure(errorCode) {
  return AUTH_FAILURE_CODES.includes(errorCode)
}

/**
 * 检查是否为Token过期（可以尝试刷新）
 */
export function isTokenExpired(errorCode) {
  return errorCode === 'AUTH_002' || errorCode === 'TOKEN_EXPIRED'
}

/**
 * 检查是否为RefreshToken失效
 */
export function isRefreshTokenError(errorCode) {
  return errorCode === 'AUTH_032' || errorCode === 'AUTH_033'
}

/**
 * 检查是否为系统错误
 */
export function isSystemError(errorCode) {
  return errorCode?.startsWith('SYS_')
}

// 别名函数（兼容性）
export const isTokenExpiredError = isTokenExpired

// 就这么简单！其他错误都交给业务层处理
export default {
  isAuthFailure,
  isTokenExpired,
  isTokenExpiredError,
  isRefreshTokenError,
  isSystemError
}
