/**
 * 文件名称：api-config.js
 * 文件描述：生产计划管理API配置
 * 创建日期：2025-01-21
 * 修改记录：
 *   - 2025-01-21: 初始创建
 *   - 2025-10-13: 更新API路径从 /v1/production-plans 到 /v1/prod/plans
 *   - 2025-10-17: 根据接口文档重构，确保API路径完全符合规范
 */

// API基础路径（符合接口文档：/v1/prod/plans）
export const API_BASE_PATH = '/prod/plans'

// API端点（完全符合接口文档规范）
export const API_ENDPOINTS = {
  // 查询生产计划列表：GET /v1/prod/plans
  LIST: '',
  // 创建生产计划：POST /v1/prod/plans
  CREATE: '',
  // 获取生产计划详情：GET /v1/prod/plans/:planId
  DETAIL: '/:planId',
  // 更新生产计划状态：PATCH /v1/prod/plans/:planId/status
  UPDATE_STATUS: '/:planId/status',
  // 拆分生产计划：POST /v1/prod/plans/:planId/split
  SPLIT: '/:planId/split',
  // 合并生产计划：POST /v1/prod/plans/merge
  MERGE: '/merge',
  // 调整生产计划：PATCH /v1/prod/plans/:planId
  ADJUST: '/:planId',
  // 批量导入生产计划：POST /v1/prod/plans/import
  IMPORT: '/import',
  // 导出生产计划：GET /v1/prod/plans/export
  EXPORT: '/export',
  // 获取生产计划进度报表：GET /v1/prod/plans/progress-report
  PROGRESS_REPORT: '/progress-report',
  // 获取生产计划审计日志：GET /v1/prod/plans/audit-logs
  AUDIT_LOGS: '/audit-logs',
  // 评估生产计划可行性：GET /v1/prod/plans/:planId/feasibility
  FEASIBILITY: '/:planId/feasibility',
  // 提交生产计划审批：POST /v1/prod/plans/:planId/approval/submit
  APPROVAL_SUBMIT: '/:planId/approval/submit',
  // 获取生产计划审批记录：GET /v1/prod/plans/:planId/approval/requests
  APPROVAL_REQUESTS: '/:planId/approval/requests',
  // 获取枚举字典：GET /v1/prod/plans/dictionaries
  DICTIONARIES: '/dictionaries',
  // 获取指定类型枚举：GET /v1/prod/plans/dictionaries/:type
  DICTIONARY_BY_TYPE: '/dictionaries/:type'
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

