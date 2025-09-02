import Cookies from 'js-cookie'
import authStorageManager from './auth-storage'

// 保留旧的键名用于Cookie兼容
const TokenKey = 'moses_token'

/**
 * 获取token
 * 使用统一的认证存储管理器获取token
 * @returns {string|null} token值
 */
export function getToken() {
  // 从认证存储管理器获取
  let token = authStorageManager.getToken()
  if (token) {
    return token
  }

  // 兼容旧版本：从Cookie获取
  token = Cookies.get('vue_admin_template_token') || Cookies.get(TokenKey)
  if (token) {
    // 如果从Cookie获取到token，迁移到新的存储系统
    authStorageManager.setToken(token, false)
    // 清理旧的Cookie
    Cookies.remove('vue_admin_template_token')
    Cookies.remove(TokenKey)
  }

  return token
}

/**
 * 设置token
 * @param {string} token - token值
 * @param {boolean} rememberMe - 是否记住登录状态
 */
export function setToken(token, rememberMe = false) {
  // 使用统一的认证存储管理器设置token
  authStorageManager.setToken(token, rememberMe)
}

/**
 * 移除token
 */
export function removeToken() {
  // 使用统一的认证存储管理器移除token
  authStorageManager.removeTokens()
  // 清理可能存在的旧Cookie
  Cookies.remove(TokenKey)
  Cookies.remove('vue_admin_template_token')
}

/**
 * 检查是否记住登录状态
 * @returns {boolean} 是否记住登录状态
 */
export function isRememberMe() {
  return authStorageManager.isRememberMe()
}

/**
 * 保存记住的用户信息
 * @param {Object} userInfo - 用户信息对象
 * @param {string} userInfo.username - 用户名
 */
export function saveRememberedUser(userInfo) {
  authStorageManager.saveRememberedUser(userInfo)
}

/**
 * 获取记住的用户信息
 * @returns {Object|null} 用户信息对象或null
 */
export function getRememberedUser() {
  return authStorageManager.getRememberedUser()
}

/**
 * 移除记住的用户信息
 */
export function removeRememberedUser() {
  authStorageManager.removeRememberedUser()
}

/**
 * 获取refresh token
 * @returns {string|null} refresh token值
 */
export function getRefreshToken() {
  return authStorageManager.getRefreshToken()
}

/**
 * 设置refresh token
 * @param {string} refreshToken - refresh token值
 */
export function setRefreshToken(refreshToken) {
  authStorageManager.setRefreshToken(refreshToken)
}

/**
 * 设置完整的token信息（包括access token和refresh token）
 * @param {Object} tokenData - token数据对象
 * @param {string} tokenData.accessToken - 访问token
 * @param {string} tokenData.refreshToken - 刷新token
 * @param {string|number} tokenData.expiresIn - 过期时间（秒）或过期时间戳
 * @param {boolean} rememberMe - 是否记住登录状态
 */
export function setTokens(tokenData, rememberMe = false) {
  const { accessToken, refreshToken, expiresIn } = tokenData

  // 设置access token（这会设置storage策略并保存一次）
  authStorageManager.setToken(accessToken, rememberMe)

  // 设置refresh token（不自动保存，避免重复保存）
  if (refreshToken) {
    authStorageManager.setRefreshToken(refreshToken, false)
  }

  // 设置过期时间
  if (expiresIn) {
    let expiresAt
    if (typeof expiresIn === 'number') {
      // 如果是秒数，转换为时间戳
      expiresAt = Date.now() + (expiresIn * 1000)
    } else {
      // 如果是时间字符串，转换为时间戳
      expiresAt = new Date(expiresIn).getTime()
    }
    authStorageManager.authData.token.expiresAt = expiresAt
  }

  // 统一保存一次（确保所有数据都已更新）
  authStorageManager.saveAuthData()
}

/**
 * 检查token是否即将过期（5分钟内）
 * @returns {boolean} 是否即将过期
 */
export function isTokenExpiringSoon() {
  const expiresAt = authStorageManager.authData.token.expiresAt
  if (!expiresAt) return false

  const now = Date.now()
  const fiveMinutes = 5 * 60 * 1000 // 5分钟
  return (expiresAt - now) <= fiveMinutes
}

/**
 * 检查token是否已过期
 * @returns {boolean} 是否已过期
 */
export function isTokenExpired() {
  const expiresAt = authStorageManager.authData.token.expiresAt
  if (!expiresAt) return false

  return Date.now() >= expiresAt
}

/**
 * 清除所有记住的登录状态
 */
export function clearRememberedState() {
  authStorageManager.clearAllAuthState()
  // 清理Cookie
  Cookies.remove(TokenKey)
  Cookies.remove('vue_admin_template_token')
}
