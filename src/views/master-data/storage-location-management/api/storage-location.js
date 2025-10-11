/**
 * 文件名称: storage-location.js
 * 文件描述: 库位管理API接口
 * 创建日期: 2025-01-20
 * 修改记录:
 *   - 2025-01-20: 初始创建
 */

import service from '@/utils/request'

/**
 * 创建库位
 * @param {Object} data 库位数据
 * @returns {Promise}
 */
export function createLocation(data) {
  return service({
    url: '/v1/mdm/storage-locations',
    method: 'post',
    data
  })
}

/**
 * 查询库位列表
 * @param {Object} params 查询参数
 * @returns {Promise}
 */
export function getLocationList(params) {
  return service({
    url: '/v1/mdm/storage-locations',
    method: 'get',
    params
  })
}

/**
 * 获取库位详情
 * @param {string} locationId 库位ID
 * @returns {Promise}
 */
export function getLocationDetail(locationId) {
  return service({
    url: `/v1/mdm/storage-locations/${locationId}`,
    method: 'get'
  })
}

/**
 * 更新库位信息
 * @param {string} locationId 库位ID
 * @param {Object} data 更新数据
 * @returns {Promise}
 */
export function updateLocation(locationId, data) {
  return service({
    url: `/v1/mdm/storage-locations/${locationId}`,
    method: 'patch',
    data
  })
}

/**
 * 更改库位占用状态
 * @param {string} locationId 库位ID
 * @param {Object} data 状态数据
 * @returns {Promise}
 */
export function updateLocationOccupancy(locationId, data) {
  return service({
    url: `/v1/mdm/storage-locations/${locationId}/occupancy`,
    method: 'patch',
    data
  })
}

