/**
 * 仓库管理API
 * 描述：提供仓库主数据的CRUD操作
 * 创建日期：2023-11-01
 */
import request from '@/utils/request'

// API基础路径
const baseURL = '/mes/master-data/warehouse'

/**
 * 获取仓库列表（分页）
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getWarehouseList(params) {
  return request({
    url: `${baseURL}/list`,
    method: 'get',
    params
  })
}

/**
 * 获取所有仓库（不分页，用于下拉选择）
 * @returns {Promise}
 */
export function getAllWarehouses() {
  return request({
    url: `${baseURL}/list-all`,
    method: 'get'
  })
}

/**
 * 获取仓库详情
 * @param {String|Number} id - 仓库ID
 * @returns {Promise}
 */
export function getWarehouseDetail(id) {
  return request({
    url: `${baseURL}/detail/${id}`,
    method: 'get'
  })
}

/**
 * 新增仓库
 * @param {Object} data - 仓库数据
 * @returns {Promise}
 */
export function createWarehouse(data) {
  return request({
    url: `${baseURL}/create`,
    method: 'post',
    data
  })
}

/**
 * 更新仓库
 * @param {Object} data - 仓库数据
 * @returns {Promise}
 */
export function updateWarehouse(data) {
  return request({
    url: `${baseURL}/update`,
    method: 'put',
    data
  })
}

/**
 * 删除仓库
 * @param {String|Number} id - 仓库ID
 * @returns {Promise}
 */
export function deleteWarehouse(id) {
  return request({
    url: `${baseURL}/delete/${id}`,
    method: 'delete'
  })
}

/**
 * 批量删除仓库
 * @param {Array} ids - 仓库ID数组
 * @returns {Promise}
 */
export function batchDeleteWarehouse(ids) {
  return request({
    url: `${baseURL}/batch-delete`,
    method: 'delete',
    data: { ids }
  })
}

/**
 * 更新仓库状态
 * @param {String|Number} id - 仓库ID
 * @param {Number} status - 状态值：1-启用，0-禁用
 * @returns {Promise}
 */
export function updateWarehouseStatus(id, status) {
  return request({
    url: `${baseURL}/status`,
    method: 'put',
    data: { id, status }
  })
}

/**
 * 批量更新仓库状态
 * @param {Object} data - 包含ids和status的对象
 * @returns {Promise}
 */
export function batchUpdateWarehouseStatus(data) {
  return request({
    url: `${baseURL}/batch-status`,
    method: 'put',
    data
  })
}

/**
 * 导入仓库数据
 * @param {FormData} formData - 包含Excel文件的FormData
 * @returns {Promise}
 */
export function importWarehouseData(formData) {
  return request({
    url: `${baseURL}/import`,
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 导出仓库数据
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function exportWarehouseData(params) {
  return request({
    url: `${baseURL}/export`,
    method: 'get',
    params,
    responseType: 'blob'
  })
}

/**
 * 下载导入模板
 * @returns {Promise}
 */
export function downloadWarehouseTemplate() {
  return request({
    url: `${baseURL}/template`,
    method: 'get',
    responseType: 'blob'
  })
}
