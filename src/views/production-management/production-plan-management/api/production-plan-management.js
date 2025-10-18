/**
 * 文件名称：production-plan-management.js
 * 文件描述：生产计划管理API接口
 * 创建日期：2025-01-21
 * 修改记录：
 *   - 2025-01-21: 初始创建
 */

import service from '@/utils/request'
import { buildApiPath, API_ENDPOINTS, buildApprovalCenterPath, APPROVAL_CENTER_ENDPOINTS } from '../constants/api-config'

/**
 * 查询生产计划列表
 * @param {Object} params - 查询参数
 * @returns {Promise} 返回Promise对象
 */
export function fetchPlanList(params = {}) {
  // 处理日期范围参数
  const queryParams = { ...params }

  // 处理计划交期范围
  if (params.deliveryDateRange && Array.isArray(params.deliveryDateRange)) {
    queryParams.plannedDeliveryDateStart = params.deliveryDateRange[0]
      ? `${params.deliveryDateRange[0]}T00:00:00.000Z`
      : undefined
    queryParams.plannedDeliveryDateEnd = params.deliveryDateRange[1]
      ? `${params.deliveryDateRange[1]}T23:59:59.999Z`
      : undefined
    delete queryParams.deliveryDateRange
  }

  // 处理创建时间范围
  if (params.createdDateRange && Array.isArray(params.createdDateRange)) {
    queryParams.createdAtStart = params.createdDateRange[0]
      ? `${params.createdDateRange[0]}T00:00:00.000Z`
      : undefined
    queryParams.createdAtEnd = params.createdDateRange[1]
      ? `${params.createdDateRange[1]}T23:59:59.999Z`
      : undefined
    delete queryParams.createdDateRange
  }

  return service({
    url: buildApiPath(API_ENDPOINTS.LIST),
    method: 'get',
    params: queryParams
  })
}

/**
 * 获取生产计划详情
 * @param {string} planId - 计划ID
 * @returns {Promise} 返回Promise对象
 */
export function fetchPlanDetail(planId) {
  return service({
    url: buildApiPath(API_ENDPOINTS.DETAIL, { planId }),
    method: 'get'
  })
}

/**
 * 更新生产计划状态
 * @param {string} planId - 计划ID
 * @param {Object} data - 更新数据
 * @returns {Promise} 返回Promise对象
 */
export function updatePlanStatus(planId, data) {
  return service({
    url: buildApiPath(API_ENDPOINTS.UPDATE_STATUS, { planId }),
    method: 'patch',
    data
  })
}

/**
 * 创建生产计划
 * @param {Object} data - 计划数据
 * @returns {Promise} 返回Promise对象
 */
export function createPlan(data) {
  return service({
    url: buildApiPath(API_ENDPOINTS.CREATE),
    method: 'post',
    data
  })
}

/**
 * 拆分生产计划
 * @param {string} planId - 计划ID
 * @param {Object} data - 拆分数据
 * @returns {Promise} 返回Promise对象
 */
export function splitPlan(planId, data) {
  return service({
    url: buildApiPath(API_ENDPOINTS.SPLIT, { planId }),
    method: 'post',
    data
  })
}

/**
 * 合并生产计划
 * @param {Object} data - 合并数据
 * @returns {Promise} 返回Promise对象
 */
export function mergePlans(data) {
  return service({
    url: buildApiPath(API_ENDPOINTS.MERGE),
    method: 'post',
    data
  })
}

/**
 * 调整生产计划
 * @param {string} planId - 计划ID
 * @param {Object} data - 调整数据
 * @returns {Promise} 返回Promise对象
 */
export function adjustPlan(planId, data) {
  return service({
    url: buildApiPath(API_ENDPOINTS.ADJUST, { planId }),
    method: 'patch',
    data
  })
}

/**
 * 批量导入生产计划
 * @param {Object} data - 导入数据
 * @returns {Promise} 返回Promise对象
 */
export function importPlans(data) {
  return service({
    url: buildApiPath(API_ENDPOINTS.IMPORT),
    method: 'post',
    data
  })
}

/**
 * 导出生产计划
 * @param {Object} params - 导出参数
 * @returns {Promise} 返回Promise对象
 */
export function exportPlans(params = {}) {
  return service({
    url: buildApiPath(API_ENDPOINTS.EXPORT),
    method: 'get',
    params,
    responseType: 'blob'
  })
}

/**
 * 获取生产计划进度报表
 * @param {Object} params - 查询参数
 * @param {string} [params.format='json'] - 导出格式：json 或 csv
 * @param {string} [params.fileName] - CSV文件名（不含扩展名）
 * @param {number} [params.offset=0] - 分页偏移量
 * @param {number} [params.limit=1000] - 每页数量（1-5000）
 * @param {string} [params.sortBy] - 排序规则，格式：field:asc,field2:desc
 * @returns {Promise} 返回Promise对象
 */
export function fetchProgressReport(params = {}) {
  // 处理日期范围参数
  const queryParams = { ...params }

  // 处理计划交期范围
  if (params.deliveryDateRange && Array.isArray(params.deliveryDateRange)) {
    queryParams.plannedDeliveryDateStart = params.deliveryDateRange[0]
      ? `${params.deliveryDateRange[0]}T00:00:00.000Z`
      : undefined
    queryParams.plannedDeliveryDateEnd = params.deliveryDateRange[1]
      ? `${params.deliveryDateRange[1]}T23:59:59.999Z`
      : undefined
    delete queryParams.deliveryDateRange
  }

  // 处理创建时间范围
  if (params.createdDateRange && Array.isArray(params.createdDateRange)) {
    queryParams.createdAtStart = params.createdDateRange[0]
      ? `${params.createdDateRange[0]}T00:00:00.000Z`
      : undefined
    queryParams.createdAtEnd = params.createdDateRange[1]
      ? `${params.createdDateRange[1]}T23:59:59.999Z`
      : undefined
    delete queryParams.createdDateRange
  }

  // CSV格式需要特殊处理响应类型
  const requestConfig = {
    url: buildApiPath(API_ENDPOINTS.PROGRESS_REPORT),
    method: 'get',
    params: queryParams
  }

  // CSV格式返回blob，用于文件下载
  if (params.format === 'csv') {
    requestConfig.responseType = 'blob'
  }

  return service(requestConfig)
}

/**
 * 获取生产计划审计日志
 * @param {Object} params - 查询参数
 * @returns {Promise} 返回Promise对象
 */
export function fetchAuditLogs(params = {}) {
  return service({
    url: buildApiPath(API_ENDPOINTS.AUDIT_LOGS),
    method: 'get',
    params
  })
}

/**
 * 评估生产计划可行性
 * @param {string} planId - 计划ID
 * @param {Object} params - 评估参数
 * @returns {Promise} 返回Promise对象
 */
export function fetchFeasibility(planId, params = {}) {
  return service({
    url: buildApiPath(API_ENDPOINTS.FEASIBILITY, { planId }),
    method: 'get',
    params
  })
}

/**
 * 提交生产计划审批
 * @param {string} planId - 计划ID
 * @param {Object} data - 审批数据
 * @returns {Promise} 返回Promise对象
 */
export function submitApproval(planId, data) {
  return service({
    url: buildApiPath(API_ENDPOINTS.APPROVAL_SUBMIT, { planId }),
    method: 'post',
    data
  })
}

/**
 * 获取生产计划审批记录
 * @param {string} planId - 计划ID
 * @param {Object} params - 查询参数
 * @returns {Promise} 返回Promise对象
 */
export function fetchApprovalRequests(planId, params = {}) {
  return service({
    url: buildApiPath(API_ENDPOINTS.APPROVAL_REQUESTS, { planId }),
    method: 'get',
    params
  })
}

/**
 * 批准审批请求
 * @param {string} approvalId - 审批请求ID
 * @param {Object} data - 审批数据
 * @param {string} [data.decisionRemarks] - 审批意见
 * @param {Array<string>} data.requiredPermissions - 审批所需权限
 * @returns {Promise} 返回Promise对象
 */
export function approveApproval(approvalId, data) {
  return service({
    url: buildApprovalCenterPath(APPROVAL_CENTER_ENDPOINTS.APPROVE, { approvalId }),
    method: 'post',
    data
  })
}

/**
 * 驳回审批请求
 * @param {string} approvalId - 审批请求ID
 * @param {Object} data - 审批数据
 * @param {string} data.decisionRemarks - 驳回原因（必填）
 * @param {Array<string>} data.requiredPermissions - 审批所需权限
 * @returns {Promise} 返回Promise对象
 */
export function rejectApproval(approvalId, data) {
  return service({
    url: buildApprovalCenterPath(APPROVAL_CENTER_ENDPOINTS.REJECT, { approvalId }),
    method: 'post',
    data
  })
}

/**
 * 取消审批请求
 * @param {string} approvalId - 审批请求ID
 * @param {Object} data - 取消数据
 * @param {string} [data.cancelRemarks] - 取消原因
 * @returns {Promise} 返回Promise对象
 */
export function cancelApproval(approvalId, data = {}) {
  return service({
    url: buildApprovalCenterPath(APPROVAL_CENTER_ENDPOINTS.CANCEL, { approvalId }),
    method: 'post',
    data
  })
}

