/**
 * 设备主数据管理API
 * 描述：该模块包含设备主数据管理的所有API请求
 * 创建日期：2023-11-05
 */

import request from '@/utils/request'

// API基础路径
const baseURL = '/mes/master-data/equipment'

/**
 * 获取设备列表
 * @param {Object} query - 查询参数
 * @returns {Promise} 返回API响应
 */
export function getEquipmentList(query) {
  return request({
    url: `${baseURL}/list`,
    method: 'get',
    params: query
  })
}

/**
 * 获取设备详情
 * @param {String|Number} id - 设备ID
 * @returns {Promise} 返回API响应
 */
export function getEquipmentDetail(id) {
  return request({
    url: `${baseURL}/detail/${id}`,
    method: 'get'
  })
}

/**
 * 创建设备
 * @param {Object} data - 设备数据
 * @returns {Promise} 返回API响应
 */
export function createEquipment(data) {
  return request({
    url: `${baseURL}/create`,
    method: 'post',
    data
  })
}

/**
 * 更新设备
 * @param {Object} data - 设备数据
 * @returns {Promise} 返回API响应
 */
export function updateEquipment(data) {
  return request({
    url: `${baseURL}/update`,
    method: 'put',
    data
  })
}

/**
 * 更新设备状态
 * @param {String|Number} id - 设备ID
 * @param {Number} status - 状态值：1-启用，0-禁用
 * @returns {Promise} 返回API响应
 */
export function updateEquipmentStatus(id, status) {
  return request({
    url: `${baseURL}/status`,
    method: 'put',
    data: { id, status }
  })
}

/**
 * 批量删除设备
 * @param {Array} ids - 设备ID数组
 * @returns {Promise} 返回API响应
 */
export function batchDeleteEquipment(ids) {
  return request({
    url: `${baseURL}/batch-delete`,
    method: 'delete',
    data: { ids }
  })
}

/**
 * 批量更新设备状态
 * @param {Object} data - 包含ids和status的对象
 * @param {Array} data.ids - 设备ID数组
 * @param {Number} data.status - 状态值：1-启用，0-禁用
 * @returns {Promise} 返回API响应
 */
export function batchUpdateEquipmentStatus(data) {
  return request({
    url: `${baseURL}/batch-status`,
    method: 'put',
    data
  })
}
