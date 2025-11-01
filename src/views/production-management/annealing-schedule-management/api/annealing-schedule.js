/**
 * 文件名称：annealing-schedule.js
 * 文件描述：退火炉排程管理模块API接口具体实现
 * 创建日期：2025-10-23
 * 修改记录：
 *   - 2025-10-23: 初始创建，实现排程方案相关接口
 */

import request from '@/utils/request'

const BASE_URL = '/prod/schedule-plans'

/**
 * 获取排程方案列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.limit - 每页记录数
 * @param {string} params.status - 方案状态
 * @param {string} params.algorithmType - 算法类型
 * @param {string} params.scheduleStartTimeFrom - 排程开始时间起始
 * @param {string} params.scheduleStartTimeTo - 排程开始时间结束
 * @param {string} params.createdAtStart - 创建时间起始
 * @param {string} params.createdAtEnd - 创建时间结束
 * @param {string} params.createdBy - 创建人ID
 * @param {string} params.sortBy - 排序字段，格式为 field:order
 * @param {string} params.search - 搜索关键词
 * @returns {Promise} 排程方案列表响应
 */
export function fetchSchedulePlanList(params) {
  return request({
    url: BASE_URL,
    method: 'get',
    params
  })
}

/**
 * 获取排程方案详情
 * @param {string} id - 排程方案ID
 * @returns {Promise} 排程方案详情响应
 */
export function fetchSchedulePlanDetail(id) {
  return request({
    url: `${BASE_URL}/${id}`,
    method: 'get'
  })
}

/**
 * 创建排程方案
 * @param {Object} data - 排程方案配置数据
 * @param {string} data.scheduleStartTime - 排程开始时间（ISO 8601格式）
 * @param {string} data.scheduleEndTime - 排程结束时间（ISO 8601格式）
 * @param {string} data.algorithmType - 排程算法类型
 * @param {string} data.planName - 方案名称（可选）
 * @param {Object} data.optimizationGoals - 优化目标配置（可选）
 * @param {Object} data.constraintRules - 约束规则配置（可选）
 * @param {Object} data.taskFilters - 任务筛选条件（可选）
 * @param {string} data.remarks - 备注说明（可选）
 * @returns {Promise} 创建响应
 */
export function createSchedulePlan(data) {
  return request({
    url: BASE_URL,
    method: 'post',
    data
  })
}

/**
 * 发布排程方案
 * @param {string} id - 排程方案ID
 * @param {Object} data - 发布参数
 * @param {boolean} data.forcePublish - 是否强制发布
 * @param {string} data.remarks - 备注
 * @returns {Promise<{
 *   success: boolean,
 *   data: {
 *     plan: Object,           // 完整的排程方案信息
 *     syncResults: {
 *       success: Array<{taskId: string, taskCode: string}>, // 成功同步的任务列表
 *       failed: Array          // 同步失败的任务列表
 *     }
 *   },
 *   message: string,
 *   meta: Object
 * }>} 发布响应，包含方案信息和任务同步结果
 */
export function publishSchedulePlan(id, data) {
  return request({
    url: `${BASE_URL}/${id}/publish`,
    method: 'post',
    data
  })
}

/**
 * 取消排程方案
 * @param {string} id - 排程方案ID
 * @param {Object} data - 取消参数
 * @param {string} data.reason - 取消原因
 * @returns {Promise} 取消响应
 */
export function cancelSchedulePlan(id, data) {
  return request({
    url: `${BASE_URL}/${id}/cancel`,
    method: 'post',
    data
  })
}

/**
 * 导出排程方案列表
 * @param {Object} params - 导出参数
 * @returns {Promise} 导出响应（Blob格式）
 */
export function exportSchedulePlans(params) {
  return request({
    url: `${BASE_URL}/export`,
    method: 'post',
    data: params,
    responseType: 'blob'
  })
}

/**
 * 获取排程冲突列表
 * @param {string} id - 排程方案ID
 * @param {Object} params - 查询参数
 * @param {string} params.severityLevel - 严重程度筛选
 * @param {string} params.conflictType - 冲突类型筛选
 * @returns {Promise} 冲突列表响应
 */
export function fetchScheduleConflicts(id, params) {
  return request({
    url: `${BASE_URL}/${id}/conflicts`,
    method: 'get',
    params
  })
}

/**
 * 获取排程甘特图数据
 * @param {string} id - 排程方案ID
 * @param {Object} params - 查询参数
 * @param {string} params.startTime - 甘特图显示的时间范围起始时间（ISO 8601格式）
 * @param {string} params.endTime - 甘特图显示的时间范围结束时间（ISO 8601格式）
 * @param {string} params.timeScale - 时间刻度粒度（hour/day/week）
 * @returns {Promise} 甘特图数据响应
 */
export function fetchScheduleGanttData(id, params) {
  return request({
    url: `${BASE_URL}/${id}/gantt`,
    method: 'get',
    params
  })
}

/**
 * 手动调整排程结果
 * @param {string} planId - 排程方案ID
 * @param {string} itemId - 排程结果项ID
 * @param {Object} data - 调整数据
 * @param {string} data.furnaceCode - 目标炉号（可选）
 * @param {string} data.plannedLoadTime - 计划装炉时间（可选，ISO 8601格式）
 * @param {string} data.plannedUnloadTime - 计划出炉时间（可选，ISO 8601格式）
 * @param {string} data.remarks - 调整原因或备注（可选）
 * @returns {Promise} 调整响应
 */
export function adjustScheduleItem(planId, itemId, data) {
  return request({
    url: `${BASE_URL}/${planId}/items/${itemId}`,
    method: 'patch',
    data
  })
}

/**
 * 获取待排程任务列表（用于预览和筛选）
 * @param {Object} params - 查询参数
 * @param {string} params.productCode - 产品编码（可选）
 * @param {string} params.alloyGrade - 合金牌号（可选）
 * @param {string} params.mixingGroupCode - 混炉分组编码（可选）
 * @param {number} params.minWeight - 最小重量（可选，单位：吨）
 * @param {number} params.maxWeight - 最大重量（可选，单位：吨）
 * @param {string} params.priorities - 优先级筛选，逗号分隔（可选，如"emergency,high"）
 * @param {boolean} params.includeScheduleLocked - 是否包含已锁定任务（可选，默认false）
 * @param {number} params.limit - 每页数量（可选，1-500）
 * @param {number} params.offset - 分页偏移量（可选，≥0）
 * @returns {Promise} 待排程任务列表响应
 * @note plannedLoadingFrom和plannedLoadingTo已废弃，待排程任务的plannedLoadingAt为null
 */
export function fetchPendingTasks(params) {
  return request({
    url: '/prod/annealing-tasks/scheduling/pending',
    method: 'get',
    params
  })
}
