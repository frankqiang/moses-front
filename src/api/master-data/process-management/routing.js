/**
 * 工艺路线管理API
 * 描述：工艺路线和步骤明细的增删改查API接口
 * 创建日期：2024-10-28
 */

import request from '@/utils/request'

/**
 * 获取工艺路线列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.limit - 每页数量
 * @param {string} params.keyword - 搜索关键词
 * @param {string} params.status - 状态
 * @param {string} params.routing_code - 路线代码
 * @returns {Promise} 返回工艺路线列表
 */
export function getRoutingList(params) {
  return request({
    url: '/mes/master-data/process-management/routing/list',
    method: 'get',
    params
  })
}

/**
 * 获取工艺路线详情
 * @param {number} id - 路线ID
 * @returns {Promise} 返回工艺路线详情
 */
export function getRoutingDetail(id) {
  return request({
    url: '/mes/master-data/process-management/routing/detail',
    method: 'get',
    params: { id }
  })
}

/**
 * 创建工艺路线
 * @param {Object} data - 路线数据
 * @param {string} data.routing_code - 路线代码
 * @param {string} data.routing_name - 路线名称
 * @param {string} data.version - 版本号
 * @param {string} data.status - 状态
 * @param {Array} data.applicable_products - 适用产品
 * @param {string} data.description - 描述
 * @returns {Promise} 返回创建结果
 */
export function createRouting(data) {
  return request({
    url: '/mes/master-data/process-management/routing',
    method: 'post',
    data
  })
}

/**
 * 更新工艺路线
 * @param {number} id - 路线ID
 * @param {Object} data - 更新数据
 * @returns {Promise} 返回更新结果
 */
export function updateRouting(id, data) {
  return request({
    url: '/mes/master-data/process-management/routing',
    method: 'put',
    params: { id },
    data
  })
}

/**
 * 删除工艺路线
 * @param {number} id - 路线ID
 * @returns {Promise} 返回删除结果
 */
export function deleteRouting(id) {
  return request({
    url: '/mes/master-data/process-management/routing',
    method: 'delete',
    params: { id }
  })
}

/**
 * 更新工艺路线状态
 * @param {number} id - 路线ID
 * @param {string} status - 新状态
 * @returns {Promise} 返回更新结果
 */
export function updateRoutingStatus(id, status) {
  return request({
    url: '/mes/master-data/process-management/routing/status',
    method: 'put',
    params: { id },
    data: { status }
  })
}

/**
 * 获取工艺路线步骤
 * @param {string} routing_code - 路线代码
 * @param {string} version - 版本号
 * @returns {Promise} 返回路线步骤列表
 */
export function getRoutingSteps(routing_code, version) {
  return request({
    url: '/mes/master-data/process-management/routing/steps',
    method: 'get',
    params: { routing_code, version }
  })
}

/**
 * 更新工艺路线步骤
 * @param {Object} data - 步骤数据
 * @param {string} data.routing_code - 路线代码
 * @param {string} data.version - 版本号
 * @param {Array} data.steps - 步骤列表
 * @returns {Promise} 返回更新结果
 */
export function updateRoutingSteps(data) {
  return request({
    url: '/mes/master-data/process-management/routing/steps',
    method: 'put',
    data
  })
} 