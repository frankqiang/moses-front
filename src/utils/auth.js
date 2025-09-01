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
 * 清除所有记住的登录状态
 */
export function clearRememberedState() {
  authStorageManager.clearAllAuthState()
  // 清理Cookie
  Cookies.remove(TokenKey)
  Cookies.remove('vue_admin_template_token')
}
