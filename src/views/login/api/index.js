/**
 * 登录模块API
 * 提供用户登录、获取用户信息、用户登出、token刷新等功能
 * 基于Moses API v1接口文档
 * 创建日期：2024-01-20
 * 修改记录：
 *   - 2024-01-20: 添加token刷新相关功能
 */

import request from '@/utils/request'
import axios from 'axios'

/**
 * 创建一个独立的axios实例用于token刷新
 * 避免与主要的service实例产生循环依赖
 */
const authService = axios.create({
  baseURL: process.env.VUE_APP_BASE_API,
  timeout: 10000 // token刷新使用更长的超时时间
})

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
  return authService({
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
  return authService({
    url: '/v1/auth/logout',
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
