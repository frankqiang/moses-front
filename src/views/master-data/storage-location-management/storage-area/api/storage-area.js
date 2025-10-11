/**
 * 文件名称: storage-area.js
 * 文件描述: 库区管理API接口
 * 创建日期: 2025-01-20
 * 修改记录:
 *   - 2025-01-20: 初始创建
 */

import service from '@/utils/request'

const BASE_URL = '/mdm/storage-areas'

/**
 * 创建库区
 * @param {Object} data - 库区数据
 * @returns {Promise}
 */
export function createStorageArea(data) {
  return service({
    url: BASE_URL,
    method: 'post',
    data
  })
}

/**
 * 查询库区列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getStorageAreas(params) {
  return service({
    url: BASE_URL,
    method: 'get',
    params
  })
}

/**
 * 获取库区详情
 * @param {string} areaId - 库区ID
 * @returns {Promise}
 */
export function getStorageAreaById(areaId) {
  return service({
    url: `${BASE_URL}/${areaId}`,
    method: 'get'
  })
}

/**
 * 更新库区信息
 * @param {string} areaId - 库区ID
 * @param {Object} data - 更新数据
 * @returns {Promise}
 */
export function updateStorageArea(areaId, data) {
  return service({
    url: `${BASE_URL}/${areaId}`,
    method: 'patch',
    data
  })
}

