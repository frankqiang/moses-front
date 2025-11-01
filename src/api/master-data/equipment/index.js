/**
 * 文件名称：index.js
 * 文件描述：设备主数据公共API
 * 创建日期：2025-01-21
 * 修改记录：
 *   - 2025-01-21: 初始创建，提供设备类型选项接口
 */

import service from '@/utils/request'

/**
 * 获取设备类型选项列表
 * @returns {Promise} 返回设备类型选项列表
 */
export function getEquipmentTypes() {
  return service({
    url: '/v1/mdm/equipment/types',
    method: 'get'
  })
}

/**
 * 获取设备选项列表
 * @param {Object} params - 查询参数
 * @param {string} params.keyword - 关键词搜索
 * @param {string} params.equipmentType - 设备类型筛选
 * @param {number} params.limit - 返回数量限制
 * @returns {Promise} 返回设备选项列表
 */
export function getEquipmentOptions(params) {
  return service({
    url: '/v1/mdm/equipment/options',
    method: 'get',
    params
  })
}

