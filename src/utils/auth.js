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
  // 优先从认证存储管理器获取
  let token = authStorageManager.getToken()
  if (token) {
    return token
  }
  // 从实际存储位置获取（根据rememberMe状态）
  if (authStorageManager.isRememberMe()) {
    token = localStorage.getItem(TokenKey)
  } else {
    token = sessionStorage.getItem(TokenKey)
  }
  if (token) {
    return token
  }

  // 最后从Cookie获取（兼容旧版本）
  return Cookies.get('vue_admin_template_token') || Cookies.get(TokenKey)
}

/**
 * 设置token
 * @param {string} token - token值
 * @param {boolean} rememberMe - 是否记住登录状态
 */
export function setToken(token, rememberMe = false) {
  // 使用统一的认证存储管理器设置token
  authStorageManager.setToken(token, rememberMe)
  // 同时设置Cookie（兼容旧版本）
  Cookies.set(TokenKey, token)
}

/**
 * 移除token
 */
export function removeToken() {
  // 使用统一的认证存储管理器移除token
  authStorageManager.removeTokens()
  // 清理Cookie
  Cookies.remove(TokenKey)
  Cookies.remove('vue_admin_template_token') // 清理旧的cookie
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
