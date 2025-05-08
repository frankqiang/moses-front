import request from '@/utils/request'

// API基础路径
const baseURL = '/mes/master-data/storage-location'

/**
 * 获取库位列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getLocationList(params) {
  return request({
    url: `${baseURL}/list`,
    method: 'get',
    params
  })
}

/**
 * 获取库位详情
 * @param {String|Number} id - 库位ID
 * @returns {Promise}
 */
export function getLocationDetail(id) {
  return request({
    url: `${baseURL}/detail/${id}`,
    method: 'get'
  })
}

/**
 * 新增库位
 * @param {Object} data - 库位数据
 * @returns {Promise}
 */
export function createLocation(data) {
  return request({
    url: `${baseURL}/create`,
    method: 'post',
    data
  })
}

/**
 * 更新库位
 * @param {Object} data - 库位数据
 * @returns {Promise}
 */
export function updateLocation(data) {
  return request({
    url: `${baseURL}/update`,
    method: 'put',
    data
  })
}

/**
 * 删除库位
 * @param {String|Number} id - 库位ID
 * @returns {Promise}
 */
export function deleteLocation(id) {
  return request({
    url: `${baseURL}/delete/${id}`,
    method: 'delete'
  })
}

/**
 * 批量删除库位
 * @param {Array} ids - 库位ID数组
 * @returns {Promise}
 */
export function batchDeleteLocation(ids) {
  return request({
    url: `${baseURL}/batch-delete`,
    method: 'delete',
    data: { ids }
  })
}

/**
 * 更新库位状态
 * @param {String|Number} id - 库位ID
 * @param {Number} status - 状态值：1-启用，0-禁用
 * @returns {Promise}
 */
export function updateLocationStatus(id, status) {
  return request({
    url: `${baseURL}/status`,
    method: 'put',
    data: { id, status }
  })
}

/**
 * 批量更新库位状态
 * @param {Object} data - 包含ids和status的对象
 * @returns {Promise}
 */
export function batchUpdateLocationStatus(data) {
  return request({
    url: `${baseURL}/batch-status`,
    method: 'put',
    data
  })
}

/**
 * 导入库位数据
 * @param {FormData} formData - 包含Excel文件的FormData
 * @returns {Promise}
 */
export function importLocationData(formData) {
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
 * 导出库位数据
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function exportLocationData(params) {
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
export function downloadLocationTemplate() {
  return request({
    url: `${baseURL}/template`,
    method: 'get',
    responseType: 'blob'
  })
}

/**
 * 获取仓库列表（用于下拉选择）
 * @returns {Promise}
 */
export function getWarehouseList() {
  return request({
    url: '/mes/master-data/warehouse/list-all',
    method: 'get'
  })
} 