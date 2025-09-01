/**
 * 登录模块API
 * 提供用户登录、获取用户信息、用户登出等功能
 * 基于Moses API v1接口文档
 */

import request from '@/utils/request'

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
 * 用户登出
 * @param {Object} data - 登出数据
 * @param {string} data.refreshToken - 刷新令牌
 * @returns {Promise} 返回登出结果
 *
 * 接口信息：
 * - URL: /auth/logout
 * - 方法: POST
 * - 入参: { refreshToken: string }（需要Authorization header）
 * - 返回: { success: boolean, data: {}, message: string, meta: object }
 */
export function logout(data) {
  return request({
    url: '/auth/logout',
    method: 'post',
    data
  })
}