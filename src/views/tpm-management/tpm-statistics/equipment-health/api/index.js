/**
 * 文件名称: api/index.js
 * 文件描述: 设备健康度评分API接口
 * 创建日期: 2024-01-20
 * 修改记录:
 *   - 2024-01-20: 初始创建
 *   - 2025-01-20: 重构API路径，使用BASE_URL常量，移除硬编码的/v1前缀
 */

import request from '@/utils/request'

// API基础路径（/v1已在环境配置VUE_APP_BASE_API中统一配置）
const BASE_URL = '/mdm/tpm/statistics/equipment-health'

/**
 * 获取设备健康度评分
 * @param {Object} params - 查询参数
 * @param {string} params.equipmentId - 设备ID（可选）
 * @param {string} params.equipmentType - 设备类型（可选）
 * @param {number} params.limit - 返回数量限制（默认20，最大100）
 * @param {string} params.sortBy - 排序字段（healthScore/equipmentCode/lastMaintenance）
 * @param {string} params.sortOrder - 排序方式（asc/desc）
 * @returns {Promise} 健康度评分数据
 */
export function getEquipmentHealth(params) {
  return request({
    url: BASE_URL,
    method: 'get',
    params
  })
}

