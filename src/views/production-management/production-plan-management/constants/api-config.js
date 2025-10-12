/**
 * 文件名称：api-config.js
 * 文件描述：生产计划管理API配置
 * 创建日期：2025-01-21
 * 修改记录：
 *   - 2025-01-21: 初始创建
 */

// API基础路径
export const API_BASE_PATH = '/v1/production-plans'

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

// 构建完整API路径
export function buildApiPath(endpoint, params = {}) {
  let path = API_BASE_PATH + endpoint
  Object.keys(params).forEach(key => {
    path = path.replace(`:${key}`, params[key])
  })
  return path
}

