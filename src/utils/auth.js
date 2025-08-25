import Cookies from 'js-cookie'

const TokenKey = 'vue_admin_template_token'
const RememberMeKey = 'vue_admin_template_remember_me'
const RememberedUserKey = 'vue_admin_template_remembered_user'

/**
 * 获取token
 * 优先从localStorage获取（记住登录状态），其次从sessionStorage获取
 * @returns {string|null} token值
 */
export function getToken() {
  // 优先从localStorage获取（持久化存储）
  let token = localStorage.getItem(TokenKey)
  if (token) {
    return token
  }
  
  // 其次从sessionStorage获取（临时存储）
  token = sessionStorage.getItem(TokenKey)
  if (token) {
    return token
  }
  
  // 最后从Cookie获取（兼容旧版本）
  return Cookies.get(TokenKey)
}

/**
 * 设置token
 * @param {string} token - token值
 * @param {boolean} rememberMe - 是否记住登录状态
 */
export function setToken(token, rememberMe = false) {
  if (rememberMe) {
    // 记住登录状态：使用localStorage持久化存储
    localStorage.setItem(TokenKey, token)
    localStorage.setItem(RememberMeKey, 'true')
    // 清除sessionStorage中的token
    sessionStorage.removeItem(TokenKey)
  } else {
    // 不记住登录状态：使用sessionStorage临时存储
    sessionStorage.setItem(TokenKey, token)
    // 清除localStorage中的token和记住状态
    localStorage.removeItem(TokenKey)
    localStorage.removeItem(RememberMeKey)
  }
  
  // 同时设置Cookie（兼容旧版本）
  Cookies.set(TokenKey, token)
}

/**
 * 移除token
 */
export function removeToken() {
  localStorage.removeItem(TokenKey)
  sessionStorage.removeItem(TokenKey)
  localStorage.removeItem(RememberMeKey)
  return Cookies.remove(TokenKey)
}

/**
 * 检查是否记住登录状态
 * @returns {boolean} 是否记住登录状态
 */
export function isRememberMe() {
  return localStorage.getItem(RememberMeKey) === 'true'
}

/**
 * 保存记住的用户信息
 * @param {Object} userInfo - 用户信息对象
 * @param {string} userInfo.username - 用户名
 */
export function saveRememberedUser(userInfo) {
  if (userInfo && userInfo.username) {
    localStorage.setItem(RememberedUserKey, JSON.stringify({
      username: userInfo.username,
      savedAt: Date.now()
    }))
  }
}

/**
 * 获取记住的用户信息
 * @returns {Object|null} 用户信息对象或null
 */
export function getRememberedUser() {
  try {
    const rememberedUser = localStorage.getItem(RememberedUserKey)
    if (rememberedUser) {
      const userInfo = JSON.parse(rememberedUser)
      // 检查保存时间，超过30天则清除
      const thirtyDays = 30 * 24 * 60 * 60 * 1000
      if (Date.now() - userInfo.savedAt > thirtyDays) {
        removeRememberedUser()
        return null
      }
      return userInfo
    }
  } catch (e) {
    // 解析失败，清除可能损坏的数据
    removeRememberedUser()
  }
  return null
}

/**
 * 移除记住的用户信息
 */
export function removeRememberedUser() {
  localStorage.removeItem(RememberedUserKey)
}

/**
 * 清除所有记住的登录状态
 */
export function clearRememberedState() {
  removeToken()
  removeRememberedUser()
  localStorage.removeItem(RememberMeKey)
}
