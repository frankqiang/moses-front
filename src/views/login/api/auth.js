/**
 * 用户认证API
 * 文件描述：提供用户登录、获取用户信息等认证相关功能
 * 创建日期：2024-01-20
 * 修改记录：
 *   - 2024-01-20: 从index.js重构分离认证相关功能
 */

import request from '@/utils/request'
import axios from 'axios'

/**
 * 创建一个独立的axios实例用于认证相关请求
 * 避免与主要的service实例产生循环依赖
 */
const authService = axios.create({
  baseURL: process.env.VUE_APP_BASE_API,
  timeout: 10000 // 认证请求使用更长的超时时间
})

// 为authService添加响应拦截器，处理Moses API响应格式
authService.interceptors.response.use(
  response => {
    // 直接返回响应数据，保持与主service一致的行为
    return response.data
  },
  error => {
    // 统一错误处理
    console.error('AuthService请求失败:', error)
    return Promise.reject(error)
  }
)

/**
 * 用户登录
 * @param {Object} data - 登录数据
 * @param {string} [data.username] - 用户名（与email二选一）
 * @param {string} [data.email] - 邮箱（与username二选一）
 * @param {string} data.password - 密码
 * @param {boolean} [data.rememberMe] - 是否记住登录状态，默认false
 * @returns {Promise} 返回包含token的响应
 *
 * 接口信息：
 * - URL: /auth/login
 * - 方法: POST
 * - 入参: { username?: string, email?: string, password: string, rememberMe?: boolean }
 * - 返回: { success: boolean, data: { token: string, refreshToken: string, expiresIn: number }, message: string, meta: object }
 */
export function login(data) {
  return request({
    url: '/auth/login',
    method: 'post',
    data
  })
}

/**
 * 获取用户信息
 * @returns {Promise} 返回用户信息
 *
 * 接口信息：
 * - URL: /auth/user
 * - 方法: GET
 * - 入参: 无（需要Authorization header）
 * - 返回: { success: boolean, data: { id: string, username: string, name: string, email: string, avatar: string, roles: array, permissions: array }, message: string, meta: object }
 */
export function getInfo() {
  return request({
    url: '/auth/user',
    method: 'get'
  })
}

/**
 * 获取当前用户信息（使用独立的authService）
 * @param {string} accessToken - 访问令牌
 * @returns {Promise<Object>} 返回用户信息
 *
 * 接口信息：
 * - URL: /auth/user
 * - 方法: GET
 * - 入参: 无（需要Authorization header）
 * - 返回: { success: boolean, data: { id: string, username: string, name: string, email: string, avatar: string, roles: array, permissions: array }, message: string, meta: object }
 */
export function getUserInfo(accessToken) {
  return authService({
    url: '/auth/user',
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'Authorization': `Bearer ${accessToken}`
    }
  })
}

export default {
  login,
  getInfo,
  getUserInfo
}
