/**
 * 文件名称: storage-area.js
 * 文件描述: 库区管理API接口
 * 创建日期: 2025-01-20
 * 修改记录:
 *   - 2025-01-20: 初始创建
 *   - 2025-01-20: 添加BASE_URL常量
 */

import service from '@/utils/request'

const BASE_URL = '/mdm/storage-areas'

/**
 * 创建库区
 * @param {Object} data - 库区数据
 * @param {string} data.areaCode - 库区代码(必填,1-50字符,自动转大写)
 * @param {string} data.areaName - 库区名称(必填,1-200字符)
 * @param {string} data.areaType - 库区类型(必填,枚举:DA/YA/HC/ZJ/BLT)
 * @param {string} data.description - 库区描述(选填,最大500字符)
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
 * @param {string} params.keyword - 关键词搜索(库区代码或名称)
 * @param {string} params.status - 库区状态筛选(enabled/disabled)
 * @param {string} params.areaType - 库区类型筛选(DA/YA/HC/ZJ/BLT)
 * @param {number} params.page - 页码(默认:1)
 * @param {number} params.limit - 每页数量(默认:10)
 * @param {string} params.sortBy - 排序字段(默认:createdAt:desc)
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
 * @param {string} areaId - 库区ID(UUID格式)
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
 * @param {string} areaId - 库区ID(UUID格式)
 * @param {Object} data - 更新数据
 * @param {string} data.areaName - 库区名称(选填,1-200字符)
 * @param {string} data.description - 库区描述(选填,最大500字符)
 * @param {string} data.status - 库区状态(选填,enabled/disabled)
 * @returns {Promise}
 */
export function updateStorageArea(areaId, data) {
  return service({
    url: `${BASE_URL}/${areaId}`,
    method: 'patch',
    data
  })
}

/**
 * 获取启用状态的库区列表(用于下拉选择)
 * @returns {Promise}
 */
export function getEnabledStorageAreas() {
  return service({
    url: BASE_URL,
    method: 'get',
    params: {
      status: 'enabled',
      limit: 100
    }
  })
}

