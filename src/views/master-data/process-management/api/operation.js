/**
 * 工序管理API
 * 功能描述：提供工序管理相关的API调用方法
 */
import request from '@/utils/request'
import { formatQueryParams } from '@/utils/index'

const BASE_URL = '/mes/v1/master-data/process-management/operations'

/**
 * 获取工序列表
 * @param {Object} params - 查询参数
 * @returns {Promise} - 返回工序列表数据
 */
export function getOperationList(params) {
  return request({
    url: BASE_URL,
    method: 'get',
    params
  })
}

/**
 * 获取工序详情
 * @param {String} id - 工序ID
 * @returns {Promise} - 返回工序详情数据
 */
export function getOperationDetail(id) {
  return request({
    url: `${BASE_URL}/${id}`,
    method: 'get'
  })
}

/**
 * 创建工序
 * @param {Object} data - 工序数据
 * @returns {Promise} - 返回创建结果
 */
export function createOperation(data) {
  return request({
    url: BASE_URL,
    method: 'post',
    data
  })
}

/**
 * 更新工序
 * @param {String} id - 工序ID
 * @param {Object} data - 工序数据
 * @returns {Promise} - 返回更新结果
 */
export function updateOperation(id, data) {
  return request({
    url: `${BASE_URL}/${id}`,
    method: 'put',
    data
  })
}

/**
 * 更新工序状态
 * @param {String} id - 工序ID
 * @param {String} status - 工序状态
 * @returns {Promise} - 返回更新结果
 */
export function updateOperationStatus(id, status) {
  return request({
    url: `${BASE_URL}/${id}/status`,
    method: 'put',
    data: { status }
  })
}

/**
 * 删除工序
 * @param {String} id - 工序ID
 * @returns {Promise} - 返回删除结果
 */
export function deleteOperation(id) {
  return request({
    url: `${BASE_URL}/${id}`,
    method: 'delete'
  })
}

/**
 * 批量更新工序状态
 * @param {Array} ids - 工序ID数组
 * @param {String} status - 工序状态
 * @returns {Promise} - 返回批量更新结果
 */
export function batchUpdateOperationStatus(ids, status) {
  return request({
    url: `${BASE_URL}/batch/status`,
    method: 'put',
    data: { ids, status }
  })
}

/**
 * 批量删除工序
 * @param {Array} ids - 工序ID数组
 * @returns {Promise} - 返回批量删除结果
 */
export function batchDeleteOperations(ids) {
  return request({
    url: `${BASE_URL}/batch`,
    method: 'delete',
    data: { ids }
  })
}

/**
 * 导出工序数据
 * @param {Object} params - 导出参数
 * @returns {Promise} - 返回导出结果
 */
export function exportOperations(params) {
  return request({
    url: `${BASE_URL}/export`,
    method: 'post',
    data: params,
    responseType: 'blob'
  })
}

/**
 * 导入工序数据
 * @param {FormData} formData - 包含文件的表单数据
 * @returns {Promise} - 返回导入结果
 */
export function importOperations(formData) {
  return request({
    url: `${BASE_URL}/import`,
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 下载工序导入模板
 * @returns {Promise} - 返回模板文件
 */
export function downloadOperationTemplate() {
  return request({
    url: `${BASE_URL}/download-template`,
    method: 'get',
    responseType: 'blob'
  })
}

export default {
  getOperationList,
  getOperationDetail,
  createOperation,
  updateOperation,
  deleteOperation,
  updateOperationStatus,
  batchUpdateOperationStatus,
  batchDeleteOperations,
  exportOperations,
  importOperations,
  downloadOperationTemplate
} 