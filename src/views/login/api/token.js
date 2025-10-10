/**
 * Token管理API
 * 文件描述：提供token刷新、用户登出等token管理相关功能
 * 创建日期：2024-01-20
 * 修改记录：
 *   - 2024-01-20: 从index.js重构分离token管理相关功能
 */

import axios from 'axios'

/**
 * 创建一个独立的axios实例用于token管理
 * 避免与主要的service实例产生循环依赖
 */
const tokenService = axios.create({
  baseURL: process.env.VUE_APP_BASE_API,
  timeout: 10000 // token管理使用更长的超时时间
})

// 为tokenService添加响应拦截器，处理Moses API响应格式
tokenService.interceptors.response.use(
  response => {
    // 直接返回响应数据，保持与主service一致的行为
    return response.data
  },
  error => {
    // 静默处理错误，由调用方处理（避免重复的console.error）
    return Promise.reject(error)
  }
)

/**
 * 刷新访问令牌
 * @param {string} refreshToken - 刷新令牌
 * @returns {Promise<Object>} 返回新的token信息
 *
 * 接口信息：
 * - URL: /auth/refresh-tokens
 * - 方法: POST
 * - 入参: { refreshToken: string }
 * - 返回: { success: boolean, data: { accessToken: string, refreshToken: string, expiresIn: number }, message: string, meta: object }
 */
export function refreshTokens(refreshToken) {
  return tokenService({
    url: '/auth/refresh-tokens',
    method: 'post',
    data: {
      refreshToken
    },
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    }
  })
}

/**
 * 用户登出
 * @param {string} refreshToken - 刷新令牌
 * @param {string} accessToken - 访问令牌
 * @returns {Promise} 返回登出结果
 *
 * 接口信息：
 * - URL: /auth/logout
 * - 方法: POST
 * - 入参: { refreshToken: string }（需要Authorization header）
 * - 返回: { success: boolean, data: {}, message: string, meta: object }
 */
export function logout(refreshToken, accessToken) {
  return tokenService({
    url: '/auth/logout',
    method: 'post',
    data: {
      refreshToken
    },
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'Authorization': `Bearer ${accessToken}`
    }
  })
}

export default {
  refreshTokens,
  logout
}
