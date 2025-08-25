/**
 * 登录模块API
 * 功能描述：提供登录相关的API调用
 * 创建日期：2024-07-24
 */
import request from '@/utils/request'

/**
 * 用户登录
 * @param {Object} data - 登录信息
 * @param {string} data.username - 用户名
 * @param {string} data.password - 密码
 * @returns {Promise} - 返回登录结果
 */
export function login(data) {
  return request({
    url: '/vue-admin-template/user/login',
    method: 'post',
    data
  })
}

/**
 * 获取用户信息
 * @param {string} token - 用户令牌
 * @returns {Promise} - 返回用户信息
 */
export function getInfo(token) {
  return request({
    url: '/vue-admin-template/user/info',
    method: 'get',
    params: { token }
  })
}

/**
 * 用户登出
 * @returns {Promise} - 返回登出结果
 */
export function logout() {
  return request({
    url: '/vue-admin-template/user/logout',
    method: 'post'
  })
}