/**
 * 文件名称：annealing-task.js
 * 文件描述：退火任务管理模块 API 接口
 * 创建日期：2025-10-18
 * 修改记录：
 *   - 2025-10-18: 初始创建，实现退火任务相关接口
 */

import service from '@/utils/request'
import { API_ENDPOINTS } from '../constants/api-config'

/**
 * 获取退火任务列表
 * @param {Object} params - 查询参数
 * @param {string} params.status - 任务状态筛选
 * @param {string} params.plannedFurnaceCode - 计划执行炉号筛选
 * @param {string} params.productCode - 产品编码筛选
 * @param {string} params.alloyGrade - 合金牌号筛选
 * @param {string} params.taskCode - 任务编号筛选（支持模糊匹配）
 * @param {string} params.planNumber - 生产计划编号筛选
 * @param {string} params.priority - 任务优先级筛选
 * @param {string} params.source - 任务来源筛选
 * @param {string} params.plannedLoadingDateStart - 计划装炉开始时间（ISO 8601格式）
 * @param {string} params.plannedLoadingDateEnd - 计划装炉结束时间（ISO 8601格式）
 * @param {string} params.createdAtStart - 创建开始时间（ISO 8601格式）
 * @param {string} params.createdAtEnd - 创建结束时间（ISO 8601格式）
 * @param {string} params.search - 关键词搜索（任务编号或名称模糊匹配）
 * @param {string} params.sortBy - 排序规则（字段名:asc/desc）
 * @param {number} params.limit - 每页返回的记录数量（默认10）
 * @param {number} params.page - 当前页码（默认1）
 * @returns {Promise<Object>} 返回任务列表数据
 */
export function fetchAnnealingTaskList(params) {
  return service({
    url: API_ENDPOINTS.LIST,
    method: 'get',
    params
  })
}

/**
 * 获取退火任务详情
 * @param {string} taskId - 任务ID
 * @returns {Promise<Object>} 返回任务详情数据
 */
export function fetchAnnealingTaskDetail(taskId) {
  return service({
    url: API_ENDPOINTS.DETAIL(taskId),
    method: 'get'
  })
}

/**
 * 创建退火任务
 * @param {Object} data - 任务数据
 * @returns {Promise<Object>} 返回创建结果
 */
export function createAnnealingTask(data) {
  return service({
    url: API_ENDPOINTS.CREATE,
    method: 'post',
    data
  })
}

/**
 * 更新退火任务状态
 * @param {string} taskId - 任务ID
 * @param {Object} data - 状态数据
 * @returns {Promise<Object>} 返回更新结果
 */
export function updateAnnealingTaskStatus(taskId, data) {
  return service({
    url: API_ENDPOINTS.UPDATE_STATUS(taskId),
    method: 'patch',
    data
  })
}

/**
 * 绑定物料到退火任务
 * @param {string} taskId - 任务ID
 * @param {Object} data - 物料数据
 * @returns {Promise<Object>} 返回绑定结果
 */
export function bindMaterialsToTask(taskId, data) {
  return service({
    url: API_ENDPOINTS.BIND_MATERIALS(taskId),
    method: 'post',
    data
  })
}

/**
 * 模拟装炉方案（预览）
 * @param {Object} data - 模拟参数
 * @returns {Promise<Object>} 返回模拟结果
 */
export function simulateLoadingPlan(data) {
  return service({
    url: API_ENDPOINTS.SIMULATE,
    method: 'post',
    data
  })
}

/**
 * 获取待排程任务列表
 * @param {Object} params - 查询参数
 * @returns {Promise<Object>} 返回待排程任务列表
 */
export function fetchPendingScheduleTasks(params) {
  return service({
    url: API_ENDPOINTS.PENDING_SCHEDULE,
    method: 'get',
    params
  })
}

/**
 * 锁定任务用于排程
 * @param {Object} data - 锁定数据
 * @returns {Promise<Object>} 返回锁定结果
 */
export function lockTasksForSchedule(data) {
  return service({
    url: API_ENDPOINTS.LOCK,
    method: 'post',
    data
  })
}

/**
 * 释放任务排程锁定
 * @param {Object} data - 释放数据
 * @returns {Promise<Object>} 返回释放结果
 */
export function unlockTasksFromSchedule(data) {
  return service({
    url: API_ENDPOINTS.UNLOCK,
    method: 'post',
    data
  })
}

/**
 * 应用排程结果
 * @param {string} taskId - 任务ID
 * @param {Object} data - 排程数据
 * @returns {Promise<Object>} 返回应用结果
 */
export function applyScheduleResult(taskId, data) {
  return service({
    url: API_ENDPOINTS.APPLY_SCHEDULE(taskId),
    method: 'post',
    data
  })
}

/**
 * 获取任务执行进度
 * @param {string} taskId - 任务ID
 * @returns {Promise<Object>} 返回进度数据
 */
export function fetchTaskProgress(taskId) {
  return service({
    url: API_ENDPOINTS.PROGRESS(taskId),
    method: 'get'
  })
}

