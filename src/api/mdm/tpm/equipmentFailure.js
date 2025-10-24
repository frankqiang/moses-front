/**
 * 文件名称：equipmentFailure.js
 * 文件描述：设备故障管理API接口
 * 创建日期：2025-01-20
 * 修改记录：
 *   - 2025-01-20: 初始创建
 */

import service from '@/utils/request'

const BASE_URL = '/v1/mdm/tpm/equipment-failures'

/**
 * 查询故障列表
 * @param {Object} params - 查询参数
 * @returns {Promise} 故障列表数据
 */
export function getEquipmentFailures(params) {
  return service({
    url: BASE_URL,
    method: 'get',
    params
  })
}

/**
 * 查询单个故障详情
 * @param {string} failureId - 故障ID
 * @returns {Promise} 故障详情数据
 */
export function getEquipmentFailureById(failureId) {
  return service({
    url: `${BASE_URL}/${failureId}`,
    method: 'get'
  })
}

/**
 * 创建故障报告
 * @param {Object} data - 故障数据
 * @returns {Promise} 创建结果
 */
export function createEquipmentFailure(data) {
  return service({
    url: BASE_URL,
    method: 'post',
    data
  })
}

/**
 * 更新故障信息
 * @param {string} failureId - 故障ID
 * @param {Object} data - 更新数据
 * @returns {Promise} 更新结果
 */
export function updateEquipmentFailure(failureId, data) {
  return service({
    url: `${BASE_URL}/${failureId}`,
    method: 'patch',
    data
  })
}

/**
 * 开始处理故障
 * @param {string} failureId - 故障ID
 * @param {Object} data - 处理数据
 * @returns {Promise} 处理结果
 */
export function startRepair(failureId, data) {
  return service({
    url: `${BASE_URL}/${failureId}/start-repair`,
    method: 'post',
    data
  })
}

/**
 * 完成故障处理
 * @param {string} failureId - 故障ID
 * @param {Object} data - 处理结果数据
 * @returns {Promise} 处理结果
 */
export function completeRepair(failureId, data) {
  return service({
    url: `${BASE_URL}/${failureId}/complete-repair`,
    method: 'post',
    data
  })
}

/**
 * 验证故障处理
 * @param {string} failureId - 故障ID
 * @param {Object} data - 验证数据
 * @returns {Promise} 验证结果
 */
export function verifyRepair(failureId, data) {
  return service({
    url: `${BASE_URL}/${failureId}/verify`,
    method: 'post',
    data
  })
}

/**
 * 关闭故障单
 * @param {string} failureId - 故障ID
 * @param {Object} data - 关闭数据
 * @returns {Promise} 关闭结果
 */
export function closeFailure(failureId, data) {
  return service({
    url: `${BASE_URL}/${failureId}/close`,
    method: 'post',
    data
  })
}

/**
 * 提交根本原因分析
 * @param {string} failureId - 故障ID
 * @param {Object} data - 分析数据
 * @returns {Promise} 提交结果
 */
export function submitRootCauseAnalysis(failureId, data) {
  return service({
    url: `${BASE_URL}/${failureId}/root-cause-analysis`,
    method: 'post',
    data
  })
}

/**
 * 查询设备MTTR
 * @param {string} equipmentId - 设备ID
 * @param {Object} params - 查询参数
 * @returns {Promise} MTTR数据
 */
export function getEquipmentMTTR(equipmentId, params) {
  return service({
    url: `${BASE_URL}/by-equipment/${equipmentId}/mttr`,
    method: 'get',
    params
  })
}

/**
 * 故障统计分析
 * @param {Object} params - 统计参数
 * @returns {Promise} 统计数据
 */
export function getFailureStatistics(params) {
  return service({
    url: `${BASE_URL}/statistics`,
    method: 'get',
    params
  })
}

/**
 * 故障趋势分析
 * @param {Object} params - 趋势参数
 * @returns {Promise} 趋势数据
 */
export function getFailureTrend(params) {
  return service({
    url: `${BASE_URL}/trend`,
    method: 'get',
    params
  })
}

/**
 * 查询重复故障
 * @param {Object} params - 查询参数
 * @returns {Promise} 重复故障列表
 */
export function getRepeatFailures(params) {
  return service({
    url: `${BASE_URL}/repeat`,
    method: 'get',
    params
  })
}

