/**
 * 基础工序管理API
 * 描述：基础工序的增删改查API接口
 * 创建日期：2024-10-28
 */

import request from '@/utils/request'

/**
 * 获取基础工序列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.limit - 每页数量
 * @param {string} params.keyword - 搜索关键词
 * @param {string} params.operation_type - 工序类型
 * @param {string} params.status - 状态
 * @returns {Promise} 返回基础工序列表
 */
export function getOperationList(params) {
  return request({
    url: '/mes/master-data/process-management/operation/list',
    method: 'get',
    params
  })
}

/**
 * 获取基础工序详情
 * @param {number} id - 工序ID
 * @returns {Promise} 返回基础工序详情
 */
export function getOperationDetail(id) {
  return request({
    url: '/mes/master-data/process-management/operation/detail',
    method: 'get',
    params: { id }
  })
}

/**
 * 创建基础工序
 * @param {Object} data - 工序数据
 * @param {string} data.operation_code - 工序代码
 * @param {string} data.operation_name - 工序名称
 * @param {string} data.operation_type - 工序类型
 * @param {string} data.description - 描述
 * @param {string} data.status - 状态
 * @returns {Promise} 返回创建结果
 */
export function createOperation(data) {
  return request({
    url: '/mes/master-data/process-management/operation',
    method: 'post',
    data
  })
}

/**
 * 更新基础工序
 * @param {number} id - 工序ID
 * @param {Object} data - 更新数据
 * @returns {Promise} 返回更新结果
 */
export function updateOperation(id, data) {
  return request({
    url: '/mes/master-data/process-management/operation',
    method: 'put',
    params: { id },
    data
  })
}

/**
 * 更新工序状态
 * @param {number} id - 工序ID
 * @param {string} status - 新状态
 * @returns {Promise} 返回更新结果
 */
export function updateOperationStatus(id, status) {
  return request({
    url: '/mes/master-data/process-management/operation/status',
    method: 'put',
    params: { id },
    data: { status }
  })
}

/**
 * 删除基础工序
 * @param {number} id - 工序ID
 * @returns {Promise} 返回删除结果
 */
export function deleteOperation(id) {
  return request({
    url: '/mes/master-data/process-management/operation',
    method: 'delete',
    params: { id }
  })
}

/**
 * 批量删除基础工序
 * @param {Array} ids - 工序ID数组
 * @returns {Promise} 返回批量删除结果
 */
export function batchDeleteOperation(ids) {
  return request({
    url: '/mes/master-data/process-management/operation/batch',
    method: 'delete',
    data: { ids }
  })
}

/**
 * 获取启用的工序列表（供工艺路线使用）
 * @returns {Promise} 返回启用的工序列表
 */
export function getEnabledOperations() {
  return request({
    url: '/mes/master-data/process-management/operation/enabled',
    method: 'get'
  })
} 