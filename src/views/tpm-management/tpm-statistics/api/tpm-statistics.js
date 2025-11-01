/**
 * 文件名称：tpm-statistics.js
 * 文件描述：TPM统计分析模块API接口
 * 创建日期：2024-01-20
 * 修改记录：
 *   - 2024-01-20: 初始创建
 *   - 2025-01-20: 重构API路径，使用BASE_URL常量，移除硬编码的/v1前缀
 */

import request from '@/utils/request'

// API基础路径（/v1已在环境配置VUE_APP_BASE_API中统一配置）
const BASE_URL_DASHBOARD = '/mdm/tpm/dashboard'
const BASE_URL_STATISTICS = '/mdm/tpm/statistics'

/**
 * 获取TPM综合看板数据
 * @param {Object} params - 查询参数
 * @param {string} params.equipmentType - 设备类型（可选）：退火炉/行车/自动料车/备料台
 * @param {string} params.timePeriod - 时间粒度（可选，保留字段）：日/周/月/年
 * @returns {Promise} 返回综合看板数据
 */
export function getDashboardData(params) {
  return request({
    url: BASE_URL_DASHBOARD,
    method: 'get',
    params
  })
}

/**
 * 获取维护计划执行率统计
 * @param {Object} params - 查询参数
 * @returns {Promise} 返回维护计划执行率统计数据
 */
export function getMaintenancePlanRate(params) {
  return request({
    url: `${BASE_URL_STATISTICS}/maintenance-plan-rate`,
    method: 'get',
    params
  })
}

/**
 * 获取故障汇总统计
 * @param {Object} params - 查询参数
 * @returns {Promise} 返回故障汇总统计数据
 */
export function getFailureSummary(params) {
  return request({
    url: `${BASE_URL_STATISTICS}/failure-summary`,
    method: 'get',
    params
  })
}

/**
 * 获取MTTR趋势分析
 * @param {Object} params - 查询参数
 * @returns {Promise} 返回MTTR趋势分析数据
 */
export function getMttrTrend(params) {
  return request({
    url: `${BASE_URL_STATISTICS}/mttr-trend`,
    method: 'get',
    params
  })
}

/**
 * 获取备件消耗分析
 * @param {Object} params - 查询参数
 * @returns {Promise} 返回备件消耗分析数据
 */
export function getSparePartConsumption(params) {
  return request({
    url: `${BASE_URL_STATISTICS}/spare-part-consumption`,
    method: 'get',
    params
  })
}

/**
 * 获取设备健康度评分
 * @param {Object} params - 查询参数
 * @returns {Promise} 返回设备健康度评分数据
 */
export function getEquipmentHealth(params) {
  return request({
    url: `${BASE_URL_STATISTICS}/equipment-health`,
    method: 'get',
    params
  })
}

/**
 * 获取维护工作量统计
 * @param {Object} params - 查询参数
 * @returns {Promise} 返回维护工作量统计数据
 */
export function getMaintenanceWorkload(params) {
  return request({
    url: `${BASE_URL_STATISTICS}/maintenance-workload`,
    method: 'get',
    params
  })
}

