/**
 * 文件名称：maintenanceTask.js
 * 文件描述：维护任务管理 API 服务模块
 * 创建日期：2024-01-20
 * 修改记录：
 *   - 2024-01-20: 初始创建，封装所有维护任务管理接口
 */

import request from '@/utils/request'

/**
 * 创建维护任务
 * @param {Object} data - 任务数据
 * @param {string} data.taskCode - 任务编码（可选，不提供则自动生成）
 * @param {string} data.planId - 关联维护计划ID（可选）
 * @param {string} data.equipmentId - 关联设备ID（必填）
 * @param {string} data.taskType - 任务类型（计划维护/应急抢修/状态检修）
 * @param {string} data.taskTitle - 任务标题（必填）
 * @param {string} data.taskDescription - 任务描述（可选）
 * @param {string} data.plannedStartTime - 计划开始时间（ISO 8601格式）
 * @param {string} data.plannedEndTime - 计划结束时间（可选，ISO 8601格式）
 * @param {string} data.assignedTo - 执行人员ID（可选）
 * @param {string} data.remark - 备注（可选）
 * @returns {Promise} 返回创建的任务详情
 */
export function createMaintenanceTask(data) {
  return request({
    url: '/v1/mdm/tpm/maintenance-tasks',
    method: 'post',
    data
  }).then(response => {
    // 统一提取 data 字段作为返回值
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ [API] 创建维护任务成功:', response.data)
    }
    return response
  })
}

/**
 * 查询单个维护任务详情
 * @param {string} taskId - 维护任务ID
 * @returns {Promise} 返回任务详情
 */
export function getMaintenanceTaskById(taskId) {
  return request({
    url: `/v1/mdm/tpm/maintenance-tasks/${taskId}`,
    method: 'get'
  }).then(response => {
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ [API] 查询维护任务详情成功:', response.data)
    }
    return response
  })
}

/**
 * 查询维护任务列表
 * @param {Object} params - 查询参数
 * @param {string} params.equipmentId - 设备ID筛选（可选）
 * @param {string} params.planId - 维护计划ID筛选（可选）
 * @param {string} params.taskType - 任务类型筛选（可选）
 * @param {string} params.status - 任务状态筛选（可选，支持逗号分隔多个状态）
 * @param {string} params.assignedTo - 执行人ID筛选（可选）
 * @param {string} params.search - 搜索关键词（可选，任务编码或标题）
 * @param {string} params.startDate - 计划开始时间起始范围（可选，ISO 8601格式）
 * @param {string} params.endDate - 计划开始时间结束范围（可选，ISO 8601格式）
 * @param {number} params.page - 页码（默认1）
 * @param {number} params.limit - 每页数量（默认10）
 * @param {string} params.sortBy - 排序字段（默认plannedStartTime:asc）
 * @returns {Promise} 返回分页查询结果
 */
export function getMaintenanceTasks(params) {
  return request({
    url: '/v1/mdm/tpm/maintenance-tasks',
    method: 'get',
    params
  }).then(response => {
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ [API] 查询维护任务列表成功:', {
        totalResults: response.data?.totalResults,
        page: response.data?.page,
        limit: response.data?.limit
      })
    }
    return response
  })
}

/**
 * 查询我的任务列表
 * @param {Object} params - 查询参数
 * @param {string} params.status - 任务状态筛选（可选，支持逗号分隔多个状态）
 * @param {string} params.search - 搜索关键词（可选，任务编码或标题）
 * @param {string} params.startDate - 计划开始时间起始范围（可选，ISO 8601格式）
 * @param {string} params.endDate - 计划开始时间结束范围（可选，ISO 8601格式）
 * @param {number} params.page - 页码（默认1）
 * @param {number} params.limit - 每页数量（默认10）
 * @param {string} params.sortBy - 排序字段（默认plannedStartTime:asc）
 * @returns {Promise} 返回分页查询结果
 */
export function getMyTasks(params) {
  return request({
    url: '/v1/mdm/tpm/maintenance-tasks/my-tasks',
    method: 'get',
    params
  }).then(response => {
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ [API] 查询我的任务列表成功:', {
        totalResults: response.data?.totalResults,
        page: response.data?.page,
        limit: response.data?.limit
      })
    }
    return response
  })
}

/**
 * 任务派工
 * @param {string} taskId - 维护任务ID
 * @param {Object} data - 派工数据
 * @param {string} data.assignedTo - 执行人员ID（必填）
 * @returns {Promise} 返回更新后的任务详情
 */
export function assignTask(taskId, data) {
  return request({
    url: `/v1/mdm/tpm/maintenance-tasks/${taskId}/assign`,
    method: 'post',
    data
  }).then(response => {
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ [API] 任务派工成功:', response.data)
    }
    return response
  })
}

/**
 * 任务接单
 * @param {string} taskId - 维护任务ID
 * @returns {Promise} 返回更新后的任务详情
 */
export function acceptTask(taskId) {
  return request({
    url: `/v1/mdm/tpm/maintenance-tasks/${taskId}/accept`,
    method: 'post'
  }).then(response => {
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ [API] 任务接单成功:', response.data)
    }
    return response
  })
}

/**
 * 开始执行任务
 * @param {string} taskId - 维护任务ID
 * @returns {Promise} 返回更新后的任务详情
 */
export function startTask(taskId) {
  return request({
    url: `/v1/mdm/tpm/maintenance-tasks/${taskId}/start`,
    method: 'post'
  }).then(response => {
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ [API] 开始执行任务成功:', response.data)
    }
    return response
  })
}

/**
 * 完成任务
 * @param {string} taskId - 维护任务ID
 * @param {Object} data - 完成任务数据
 * @param {string} data.maintenanceContent - 维护内容详情（必填）
 * @param {string} data.problemFound - 发现问题描述（可选）
 * @param {string} data.solutionApplied - 处理措施（可选）
 * @param {Array} data.sparePartsUsed - 使用备件清单（可选）
 * @param {number} data.workHours - 维护工时（可选，单位：小时）
 * @param {string} data.equipmentStatusBefore - 维护前设备状态（可选）
 * @param {string} data.equipmentStatusAfter - 维护后设备状态（可选）
 * @param {string} data.nextMaintenanceSuggestion - 下次维护建议（可选）
 * @param {string} data.remark - 任务备注（可选）
 * @param {string} data.recordRemark - 维护记录备注（可选）
 * @returns {Promise} 返回更新后的任务详情
 */
export function completeTask(taskId, data) {
  return request({
    url: `/v1/mdm/tpm/maintenance-tasks/${taskId}/complete`,
    method: 'post',
    data
  }).then(response => {
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ [API] 完成任务成功:', response.data)
    }
    return response
  })
}

/**
 * 任务延期申请
 * @param {string} taskId - 维护任务ID
 * @param {Object} data - 延期数据
 * @param {string} data.delayReason - 延期原因（必填）
 * @param {string} data.newPlannedStartTime - 新的计划开始时间（可选，ISO 8601格式）
 * @returns {Promise} 返回更新后的任务详情
 */
export function postponeTask(taskId, data) {
  return request({
    url: `/v1/mdm/tpm/maintenance-tasks/${taskId}/postpone`,
    method: 'post',
    data
  }).then(response => {
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ [API] 任务延期成功:', response.data)
    }
    return response
  })
}

/**
 * 取消任务
 * @param {string} taskId - 维护任务ID
 * @param {Object} data - 取消数据
 * @param {string} data.cancelReason - 取消原因（必填）
 * @returns {Promise} 返回更新后的任务详情
 */
export function cancelTask(taskId, data) {
  return request({
    url: `/v1/mdm/tpm/maintenance-tasks/${taskId}/cancel`,
    method: 'post',
    data
  }).then(response => {
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ [API] 取消任务成功:', response.data)
    }
    return response
  })
}

/**
 * 查询逾期任务
 * @param {Object} params - 查询参数
 * @param {string} params.equipmentId - 设备ID筛选（可选）
 * @param {string} params.assignedTo - 执行人ID筛选（可选）
 * @param {number} params.page - 页码（默认1）
 * @param {number} params.limit - 每页数量（默认10）
 * @returns {Promise} 返回分页查询结果
 */
export function getOverdueTasks(params) {
  return request({
    url: '/v1/mdm/tpm/maintenance-tasks/overdue',
    method: 'get',
    params
  }).then(response => {
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ [API] 查询逾期任务成功:', {
        totalResults: response.data?.totalResults,
        page: response.data?.page,
        limit: response.data?.limit
      })
    }
    return response
  })
}

/**
 * 获取任务日历视图数据
 * @param {Object} params - 查询参数
 * @param {string} params.startDate - 开始日期（可选，ISO 8601格式）
 * @param {string} params.endDate - 结束日期（可选，ISO 8601格式）
 * @param {string} params.equipmentId - 设备ID筛选（可选）
 * @param {string} params.assignedTo - 执行人ID筛选（可选）
 * @returns {Promise} 返回日历视图数据
 */
export function getCalendarTasks(params) {
  return request({
    url: '/v1/mdm/tpm/maintenance-tasks/calendar',
    method: 'get',
    params
  }).then(response => {
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ [API] 获取任务日历数据成功:', {
        count: response.data?.length
      })
    }
    return response
  })
}

/**
 * 获取任务负载分析
 * @param {Object} params - 查询参数
 * @param {string} params.startDate - 开始日期（可选，ISO 8601格式）
 * @param {string} params.endDate - 结束日期（可选，ISO 8601格式）
 * @param {string} params.groupBy - 分组方式（assignee/equipment，默认assignee）
 * @returns {Promise} 返回负载分析数据
 */
export function getWorkloadAnalysis(params) {
  return request({
    url: '/v1/mdm/tpm/maintenance-tasks/workload',
    method: 'get',
    params
  }).then(response => {
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ [API] 获取任务负载分析成功:', {
        groupBy: response.data?.groupBy,
        count: response.data?.data?.length
      })
    }
    return response
  })
}

/**
 * 按组织架构筛选维护人员
 * @param {Object} params - 查询参数
 * @param {string} params.departmentId - 部门ID筛选（可选）
 * @param {string} params.positionId - 岗位ID筛选（可选）
 * @param {string} params.roleIds - 角色ID列表（可选，逗号分隔）
 * @param {number} params.limit - 限制数量（默认50）
 * @param {string} params.sortBy - 排序字段（默认name:asc）
 * @returns {Promise} 返回维护人员列表
 */
export function getPersonnel(params) {
  return request({
    url: '/v1/mdm/tpm/maintenance-tasks/personnel',
    method: 'get',
    params
  }).then(response => {
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ [API] 查询维护人员成功:', {
        count: response.data?.length
      })
    }
    return response
  })
}

/**
 * API服务模块导出
 * 说明：所有接口已实现统一的响应格式处理和错误处理
 */
export default {
  createMaintenanceTask,
  getMaintenanceTaskById,
  getMaintenanceTasks,
  getMyTasks,
  assignTask,
  acceptTask,
  startTask,
  completeTask,
  postponeTask,
  cancelTask,
  getOverdueTasks,
  getCalendarTasks,
  getWorkloadAnalysis,
  getPersonnel
}

