/**
 * 文件名称：dictionary.js
 * 文件描述：TPM模块枚举字典API（整个TPM模块共用）
 * 创建日期：2025-10-15
 * 修改记录：
 *   - 2025-10-15: 初始创建
 *
 * 说明：
 * - 该API提供TPM模块所有子模块的枚举字典
 * - 包括：维护计划、维护任务、维护记录、设备故障等模块的枚举
 * - 所有TPM子模块共用此接口
 */

import request from '@/utils/request'

/**
 * 获取所有TPM模块枚举字典
 * @returns {Promise} 返回所有字典数据
 *
 * @example
 * const response = await getAllDictionaries()
 * // 返回数据包含：
 * // - maintenanceTypes: 维护类型
 * // - cycleTypes: 维护周期类型
 * // - cycleUnits: 周期单位
 * // - planStatuses: 维护计划状态
 * // - taskTypes: 维护任务类型
 * // - taskStatuses: 维护任务状态
 * // - failureLevels: 故障等级
 * // - impactDegrees: 影响程度
 * // - failureTypes: 故障类型
 * // - failureStatuses: 故障处理状态
 */
export function getAllDictionaries() {
  return request({
    url: '/mdm/tpm/dictionaries',
    method: 'get'
  })
}

/**
 * 获取特定类型的枚举字典
 * @param {string} type - 字典类型
 * @returns {Promise} 返回指定类型的字典数据
 *
 * @example
 * // 获取维护类型字典
 * const response = await getDictionaryByType('maintenanceTypes')
 */
export function getDictionaryByType(type) {
  return request({
    url: `/mdm/tpm/dictionaries/${type}`,
    method: 'get'
  })
}

