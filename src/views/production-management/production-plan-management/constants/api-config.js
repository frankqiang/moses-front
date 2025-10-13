/**
 * 文件名称：api-config.js
 * 文件描述：生产计划管理API配置
 * 创建日期：2025-01-21
 * 修改记录：
 *   - 2025-01-21: 初始创建
 *   - 2025-10-13: 更新API路径从 /v1/production-plans 到 /v1/prod/plans
 */

// API基础路径
export const API_BASE_PATH = '/prod/plans'

// API端点
export const API_ENDPOINTS = {
  LIST: '',
  CREATE: '',
  DETAIL: '/:planId',
  UPDATE_STATUS: '/:planId/status',
  SPLIT: '/:planId/split',
  MERGE: '/merge',
  ADJUST: '/:planId',
  IMPORT: '/import',
  EXPORT: '/export',
  PROGRESS_REPORT: '/progress-report',
  AUDIT_LOGS: '/audit-logs',
  FEASIBILITY: '/:planId/feasibility',
  APPROVAL_SUBMIT: '/:planId/approval/submit',
  APPROVAL_REQUESTS: '/:planId/approval/requests'
}

// 审批中心 API 基础路径
export const APPROVAL_CENTER_BASE_PATH = '/approval-center/requests'

// 审批中心 API 端点
export const APPROVAL_CENTER_ENDPOINTS = {
  APPROVE: '/:approvalId/approve',
  REJECT: '/:approvalId/reject',
  CANCEL: '/:approvalId/cancel'
}

// 构建审批中心 API 路径
export function buildApprovalCenterPath(endpoint, params = {}) {
  let path = APPROVAL_CENTER_BASE_PATH + endpoint
  Object.keys(params).forEach(key => {
    path = path.replace(`:${key}`, params[key])
  })
  return path
}

// 构建完整API路径
export function buildApiPath(endpoint, params = {}) {
  let path = API_BASE_PATH + endpoint
  Object.keys(params).forEach(key => {
    path = path.replace(`:${key}`, params[key])
  })
  return path
}

