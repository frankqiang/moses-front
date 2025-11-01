/**
 * 文件名称：spare-part-consumption.js
 * 文件描述：备件消耗分析API接口
 * 创建日期：2024-01-20
 * 修改记录：
 *   - 2024-01-20: 初始创建
 *   - 2025-01-20: 重构API路径，使用BASE_URL常量，移除硬编码的/v1前缀
 */

import service from '@/utils/request'

// API基础路径（/v1已在环境配置VUE_APP_BASE_API中统一配置）
const BASE_URL = '/mdm/tpm/statistics/spare-part-consumption'

/**
 * 获取备件消耗分析统计
 * @param {Object} params - 查询参数
 * @param {string} params.startDate - 开始日期 (YYYY-MM-DD)
 * @param {string} params.endDate - 结束日期 (YYYY-MM-DD)
 * @param {string} [params.sparePartId] - 备件ID (可选)
 * @param {string} [params.equipmentId] - 设备ID (可选)
 * @param {string} [params.equipmentType] - 设备类型 (可选)
 * @param {string} [params.timePeriod='月'] - 时间粒度 (日/周/月/年)
 * @param {string} [params.sortBy='totalQuantity'] - 排序字段 (totalQuantity/totalCost/frequency)
 * @returns {Promise} API响应
 */
export function getSparePartConsumption(params) {
  return service({
    url: BASE_URL,
    method: 'get',
    params
  })
}

