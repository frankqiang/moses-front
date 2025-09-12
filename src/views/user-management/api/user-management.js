/**
 * 文件名称：user-management.js
 * 文件描述：用户管理模块API接口，提供用户CRUD操作、状态管理、密码重置等功能
 * 创建日期：2024-01-15
 * 修改记录：
 *   - 2024-01-15: 初始创建，实现基础API架构
 */

import request from '@/utils/request'

// API基础路径
const baseURL = '/v1'

/**
 * 获取用户列表
 * @param {Object} params - 查询参数
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.limit=10] - 每页数量（1-100）
 * @param {string} [params.name] - 按用户姓名模糊查询
 * @param {string} [params.username] - 按用户名模糊查询
 * @param {string} [params.email] - 按邮箱地址模糊查询
 * @param {string} [params.search] - 通用搜索，支持姓名、用户名、邮箱的模糊匹配
 * @param {string} [params.status] - 按用户状态筛选（active, locked, disabled, pending, deleted）
 * @param {string} [params.role] - 按角色筛选
 * @param {string} [params.roleId] - 按角色ID精确筛选（UUID格式）
 * @param {string} [params.roleName] - 按角色名称模糊筛选
 * @param {string} [params.roleCode] - 按角色编码模糊筛选
 * @param {string} [params.department] - 按部门名称模糊查询
 * @param {string} [params.departmentId] - 按部门ID精确筛选（UUID格式）
 * @param {string} [params.position] - 按岗位名称模糊查询
 * @param {string} [params.positionId] - 按岗位ID精确筛选（UUID格式）
 * @param {string} [params.createdFrom] - 创建时间范围起始日期（ISO 8601格式）
 * @param {string} [params.createdTo] - 创建时间范围结束日期（ISO 8601格式）
 * @param {string} [params.lastLoginFrom] - 最后登录时间范围起始日期（ISO 8601格式）
 * @param {string} [params.lastLoginTo] - 最后登录时间范围结束日期（ISO 8601格式）
 * @param {string} [params.sortBy] - 排序选项，如 name:asc, created_at:desc
 * @returns {Promise} 返回用户列表数据
 */
export function getUserList(params = {}) {
  return request({
    url: `${baseURL}/users`,
    method: 'get',
    params
  })
}

/**
 * 获取用户详情
 * @param {string|number} id - 用户ID
 * @returns {Promise} 返回用户详细信息
 */
export function getUserDetail(id) {
  return request({
    url: `${baseURL}/users/${id}`,
    method: 'get'
  })
}

/**
 * 创建用户
 * @param {Object} data - 用户数据
 * @param {string} data.username - 用户名（必填）
 * @param {string} data.realName - 真实姓名（必填）
 * @param {string} data.email - 邮箱（必填）
 * @param {string} data.phone - 手机号（必填）
 * @param {string} data.password - 密码（必填）
 * @param {string} [data.department] - 部门
 * @param {number} [data.gender] - 性别 1-男 2-女
 * @param {string} [data.role] - 角色
 * @param {string} [data.remark] - 备注
 * @returns {Promise} 返回创建结果
 */
export function createUser(data) {
  return request({
    url: `${baseURL}/users`,
    method: 'post',
    data
  })
}

/**
 * 更新用户信息
 * @param {string|number} id - 用户ID
 * @param {Object} data - 更新的用户数据
 * @returns {Promise} 返回更新结果
 */
export function updateUser(id, data) {
  return request({
    url: `${baseURL}/users/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除用户
 * @param {string|number} id - 用户ID
 * @returns {Promise} 返回删除结果
 */
export function deleteUser(id) {
  return request({
    url: `${baseURL}/users/${id}`,
    method: 'delete'
  })
}

/**
 * 批量删除用户
 * @param {Array} ids - 用户ID数组
 * @returns {Promise} 返回批量删除结果
 */
export function batchDeleteUsers(ids) {
  return request({
    url: `${baseURL}/users/batch-delete`,
    method: 'delete',
    data: { ids }
  })
}

/**
 * 更新用户状态
 * @param {string|number} id - 用户ID
 * @param {number} status - 状态值 1-启用 0-禁用
 * @returns {Promise} 返回状态更新结果
 */
export function updateUserStatus(id, status) {
  return request({
    url: `${baseURL}/users/${id}/status`,
    method: 'put',
    data: { status }
  })
}

/**
 * 批量更新用户状态
 * @param {Array} ids - 用户ID数组
 * @param {number} status - 状态值 1-启用 0-禁用
 * @returns {Promise} 返回批量状态更新结果
 */
export function batchUpdateUserStatus(ids, status) {
  return request({
    url: `${baseURL}/users/batch-status`,
    method: 'put',
    data: { ids, status }
  })
}

/**
 * 重置用户密码
 * @param {string|number} id - 用户ID
 * @param {string} newPassword - 新密码
 * @returns {Promise} 返回密码重置结果
 */
export function resetUserPassword(id, newPassword) {
  return request({
    url: `${baseURL}/users/${id}/reset-password`,
    method: 'put',
    data: { newPassword }
  })
}

/**
 * 检查用户名是否可用
 * @param {string} username - 用户名
 * @returns {Promise} 返回可用性检查结果
 */
export function checkUsernameAvailable(username) {
  return request({
    url: `${baseURL}/users/check-username`,
    method: 'get',
    params: { username }
  })
}

/**
 * 检查邮箱是否可用
 * @param {string} email - 邮箱
 * @returns {Promise} 返回可用性检查结果
 */
export function checkEmailAvailable(email) {
  return request({
    url: `${baseURL}/users/check-email`,
    method: 'get',
    params: { email }
  })
}

/**
 * 获取部门列表
 * @returns {Promise} 返回部门列表
 */
export function getDepartmentList() {
  return request({
    url: `${baseURL}/users/departments`,
    method: 'get'
  })
}

/**
 * 获取角色列表
 * @returns {Promise} 返回角色列表
 */
export function getRoleList() {
  return request({
    url: `${baseURL}/users/roles`,
    method: 'get'
  })
}
