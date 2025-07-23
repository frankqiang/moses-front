import request from '@/utils/request'

const BASE_URL = '/mes/v1/master-data/process-management/routings'

/**
 * 获取工艺路线列表
 * @param {object} params 查询参数
 */
export function getRoutingList(params) {
  return request({
    url: BASE_URL,
    method: 'get',
    params
  })
}

/**
 * 创建新的工艺路线
 * @param {object} data 工艺路线数据
 */
export function createRouting(data) {
  return request({
    url: BASE_URL,
    method: 'post',
    data
  })
}

/**
 * 更新工艺路线
 * @param {object} data 工艺路线数据
 */
export function updateRouting(data) {
  return request({
    url: `${BASE_URL}/${data.id}`,
    method: 'put',
    data
  })
}

/**
 * 删除工艺路线
 * @param {string} id 工艺路线ID
 */
export function deleteRouting(id) {
  return request({
    url: `${BASE_URL}/${id}`,
    method: 'delete'
  })
}

/**
 * 检查路线代码唯一性
 * @param {string} code 要检查的路线代码
 */
export function checkRoutingCodeUnique(code) {
  return request({
    url: `${BASE_URL}/check-code-unique`,
    method: 'get',
    params: { code }
  })
}

/**
 * 创建工艺路线的新版本
 * @param {string} id 源工艺路线ID
 * @description 基于现有的工艺路线创建一个新的草稿版本
 */
export function createNewVersion(id) {
  return request({
    url: `${BASE_URL}/${id}/new-version`,
    method: 'post'
  })
}

/**
 * 提交工艺路线审批
 * @param {string} id 工艺路线ID
 * @param {object} data 提交审批的附加数据（如备注等）
 * @description 将草稿状态的工艺路线提交审批，状态变更为待审批
 */
export function submitRoutingApproval(id, data = {}) {
  return request({
    url: `${BASE_URL}/${id}/submit-approval`,
    method: 'post',
    data
  })
}

/**
 * 批准工艺路线
 * @param {string} id 工艺路线ID
 * @param {object} data 批准的附加数据（如审批意见等）
 * @description 批准待审批状态的工艺路线，状态变更为生效
 */
export function approveRouting(id, data = {}) {
  return request({
    url: `${BASE_URL}/${id}/approve`,
    method: 'post',
    data
  })
}

/**
 * 驳回工艺路线
 * @param {string} id 工艺路线ID
 * @param {object} data 驳回的附加数据（如驳回原因等）
 * @description 驳回待审批状态的工艺路线，状态变更为草稿
 */
export function rejectRouting(id, data = {}) {
  return request({
    url: `${BASE_URL}/${id}/reject`,
    method: 'post',
    data
  })
}

/**
 * 归档工艺路线
 * @param {string} id 工艺路线ID
 * @param {object} data 归档的附加数据（如归档原因等）
 * @description 将生效状态的工艺路线归档，状态变更为已归档
 */
export function archiveRouting(id, data = {}) {
  return request({
    url: `${BASE_URL}/${id}/archive`,
    method: 'post',
    data
  })
}

/**
 * 获取工艺路线的历史记录
 * @param {string} id 工艺路线ID
 * @param {object} params 查询参数（如分页、筛选条件等）
 * @description 获取工艺路线的变更历史和审批历史记录
 */
export function getRoutingHistory(id, params = {}) {
  return request({
    url: `${BASE_URL}/${id}/history`,
    method: 'get',
    params
  })
}

/**
 * 获取工艺路线的审批历史
 * @param {string} id 工艺路线ID
 * @param {object} params 查询参数
 * @description 获取工艺路线的审批历史记录
 */
export function getRoutingApprovalHistory(id, params = {}) {
  return request({
    url: `${BASE_URL}/${id}/approval-history`,
    method: 'get',
    params
  })
}

export default {
  getRoutingList,
  createRouting,
  updateRouting,
  deleteRouting,
  checkRoutingCodeUnique,
  createNewVersion,
  submitRoutingApproval,
  approveRouting,
  rejectRouting,
  archiveRouting,
  getRoutingHistory,
  getRoutingApprovalHistory
}
