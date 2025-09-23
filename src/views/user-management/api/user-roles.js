/**
 * 用户角色分配API
 * 描述：提供用户角色分配相关的API调用方法
 * 创建日期：2024-01-20
 */

import request from '@/utils/request'

// API基础路径
const baseURL = '/users'

/**
 * 为用户分配角色
 * @param {string} userId - 用户ID
 * @param {Object} data - 分配数据
 * @param {Array<string>} data.roleIds - 角色ID列表
 * @returns {Promise}
 */
export function assignRolesToUser(userId, data) {
  return request({
    url: `${baseURL}/${userId}/roles`,
    method: 'post',
    data
  })
}

/**
 * 获取用户已分配的角色
 * @param {string} userId - 用户ID
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getUserRoles(userId, params) {
  return request({
    url: `${baseURL}/${userId}/roles`,
    method: 'get',
    params
  })
}

/**
 * 移除用户角色
 * @param {string} userId - 用户ID
 * @param {string} roleId - 角色ID
 * @returns {Promise}
 */
export function removeUserRole(userId, roleId) {
  return request({
    url: `${baseURL}/${userId}/roles/${roleId}`,
    method: 'delete'
  })
}

/**
 * 批量移除用户角色
 * @param {string} userId - 用户ID
 * @param {Object} data - 移除数据
 * @param {Array<string>} data.roleIds - 要移除的角色ID列表
 * @returns {Promise}
 */
export function removeUserRoles(userId, data) {
  return request({
    url: `${baseURL}/${userId}/roles/batch`,
    method: 'delete',
    data
  })
}

/**
 * 更新用户角色（替换所有角色）
 * @param {string} userId - 用户ID
 * @param {Object} data - 角色数据
 * @param {Array<string>} data.roleIds - 新的角色ID列表
 * @returns {Promise}
 */
export function updateUserRoles(userId, data) {
  return request({
    url: `${baseURL}/${userId}/roles`,
    method: 'put',
    data
  })
}
