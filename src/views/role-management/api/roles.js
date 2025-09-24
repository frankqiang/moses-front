/**
 * 文件名称：roles.js
 * 文件描述：角色管理相关API接口
 * 创建日期：2024-01-20
 * 修改记录：
 *   - 2024-01-20: 初始创建，定义角色管理API接口
 */

import request from '@/utils/request'

// API基础路径
const baseURL = '/roles'

/**
 * 创建角色
 * @param {Object} data - 角色数据
 * @param {string} data.name - 角色名称
 * @param {string} data.code - 角色编码
 * @param {string} data.description - 角色描述
 * @param {string} data.type - 角色类型
 * @param {number} data.level - 角色级别
 * @param {string} data.status - 角色状态
 * @param {boolean} data.isDefault - 是否为默认角色
 * @returns {Promise} API响应
 */
export function createRole(data) {
  return request({
    url: baseURL,
    method: 'post',
    data
  })
}

/**
 * 获取角色列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码，默认为1
 * @param {number} params.limit - 每页数量，默认为10
 * @param {string} params.sortBy - 排序字段，格式为"field:order"
 * @param {string} params.search - 全文搜索关键词
 * @param {string} params.name - 角色名称筛选
 * @param {string} params.code - 角色编码筛选
 * @param {string|Array} params.type - 角色类型筛选
 * @param {string|Array} params.status - 角色状态筛选
 * @param {number|Object} params.level - 角色级别筛选
 * @param {boolean} params.isDefault - 是否为默认角色
 * @param {string} params.createdFrom - 创建时间起始
 * @param {string} params.createdTo - 创建时间结束
 * @param {string|Array} params.createdBy - 创建者筛选
 * @param {string} params.populate - 关联查询字段
 * @param {boolean} params.includeUserCount - 是否包含用户数量统计
 * @param {boolean} params.hasUsers - 是否有关联用户
 * @returns {Promise} API响应
 */
export function getRoleList(params) {
  return request({
    url: baseURL,
    method: 'get',
    params
  })
}

/**
 * 获取单个角色详情
 * @param {string} id - 角色ID
 * @param {Object} params - 查询参数
 * @param {string} params.populate - 关联查询字段
 * @returns {Promise} API响应
 */
export function getRoleById(id, params = {}) {
  return request({
    url: `${baseURL}/${id}`,
    method: 'get',
    params
  })
}

/**
 * 更新角色信息
 * @param {string} id - 角色ID
 * @param {Object} data - 更新数据
 * @returns {Promise} API响应
 */
export function updateRole(id, data) {
  return request({
    url: `${baseURL}/${id}`,
    method: 'put',
    data
  })
}

/**
 * 复制角色
 * @param {string} id - 源角色ID
 * @param {Object} data - 复制配置
 * @param {string} data.name - 新角色名称
 * @param {string} data.code - 新角色编码
 * @param {boolean} data.copyPermissions - 是否复制权限配置
 * @returns {Promise} API响应
 */
export function copyRole(id, data) {
  return request({
    url: `${baseURL}/${id}/copy`,
    method: 'post',
    data
  })
}

/**
 * 删除角色
 * @param {string} id - 角色ID
 * @returns {Promise} API响应
 */
export function deleteRole(id) {
  return request({
    url: `${baseURL}/${id}`,
    method: 'delete'
  })
}

/**
 * 切换角色状态
 * @param {string} id - 角色ID
 * @param {Object} data - 状态数据
 * @param {string} data.status - 目标状态
 * @returns {Promise} API响应
 */
export function updateRoleStatus(id, data) {
  return request({
    url: `${baseURL}/${id}/status`,
    method: 'patch',
    data
  })
}

/**
 * 批量删除角色
 * @param {Array} ids - 角色ID数组
 * @returns {Promise} API响应
 */
export function batchDeleteRoles(ids) {
  return request({
    url: `${baseURL}/batch`,
    method: 'delete',
    data: { ids }
  })
}

/**
 * 批量更新角色状态
 * @param {Array} ids - 角色ID数组
 * @param {Object} data - 状态数据
 * @param {string} data.status - 目标状态
 * @returns {Promise} API响应
 */
export function batchUpdateRoleStatus(ids, data) {
  return request({
    url: `${baseURL}/batch/status`,
    method: 'patch',
    data: { ids, ...data }
  })
}

/**
 * 获取角色权限配置
 * @param {string} id - 角色ID
 * @returns {Promise} API响应
 */
export function getRolePermissions(id) {
  return request({
    url: `${baseURL}/${id}/permissions`,
    method: 'get'
  })
}

/**
 * 更新角色权限配置
 * @param {string} id - 角色ID
 * @param {Object} data - 权限配置数据
 * @returns {Promise} API响应
 */
export function updateRolePermissions(id, data) {
  return request({
    url: `${baseURL}/${id}/permissions`,
    method: 'put',
    data
  })
}

/**
 * 获取所有可用角色（用于下拉选择）
 * @param {Object} params - 查询参数
 * @returns {Promise} API响应
 */
export function getAvailableRoles(params = {}) {
  return request({
    url: baseURL,
    method: 'get',
    params: {
      status: 'active',
      limit: 1000, // 获取所有可用角色
      ...params
    }
  })
}


