/**
 * 角色管理API
 * 描述：提供角色管理相关的API调用方法
 * 创建日期：2024-01-20
 */

import request from '@/utils/request'

// API基础路径
const baseURL = '/roles'

/**
 * 获取角色列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码，默认为1
 * @param {number} params.limit - 每页数量，默认为10
 * @param {string} params.sortBy - 排序字段，格式为"field:order"
 * @param {string} params.name - 角色名称筛选
 * @param {string} params.code - 角色编码筛选
 * @param {string|Array} params.type - 角色类型筛选
 * @param {string|Array} params.status - 角色状态筛选
 * @param {boolean} params.includeUserCount - 是否包含用户数量统计
 * @returns {Promise}
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
 * @returns {Promise}
 */
export function getRoleDetail(id, params) {
  return request({
    url: `${baseURL}/${id}`,
    method: 'get',
    params
  })
}

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
 * @param {Object} data.permissions - 权限配置
 * @returns {Promise}
 */
export function createRole(data) {
  return request({
    url: baseURL,
    method: 'post',
    data
  })
}

/**
 * 更新角色
 * @param {string} id - 角色ID
 * @param {Object} data - 更新数据
 * @returns {Promise}
 */
export function updateRole(id, data) {
  return request({
    url: `${baseURL}/${id}`,
    method: 'patch',
    data
  })
}

/**
 * 删除角色
 * @param {string} id - 角色ID
 * @returns {Promise}
 */
export function deleteRole(id) {
  return request({
    url: `${baseURL}/${id}`,
    method: 'delete'
  })
}

/**
 * 获取所有可用角色（用于下拉选择）
 * @param {Object} params - 查询参数
 * @returns {Promise}
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
