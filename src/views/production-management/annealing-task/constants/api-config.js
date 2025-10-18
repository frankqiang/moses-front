/**
 * 文件名称：api-config.js
 * 文件描述：退火任务管理模块 API 配置
 * 创建日期：2025-10-18
 * 修改记录：
 *   - 2025-10-18: 初始创建，定义API端点路径
 */

// API 基础路径
export const API_BASE_PATH = '/prod/annealing-tasks'

// API 端点路径
export const API_ENDPOINTS = {
  // 任务列表
  LIST: `${API_BASE_PATH}`,
  // 任务详情
  DETAIL: (taskId) => `${API_BASE_PATH}/${taskId}`,
  // 创建任务
  CREATE: `${API_BASE_PATH}`,
  // 更新任务状态
  UPDATE_STATUS: (taskId) => `${API_BASE_PATH}/${taskId}/status`,
  // 绑定物料
  BIND_MATERIALS: (taskId) => `${API_BASE_PATH}/${taskId}/materials`,
  // 模拟装炉方案
  SIMULATE: `${API_BASE_PATH}/simulate`,
  // 获取待排程任务列表
  PENDING_SCHEDULE: `${API_BASE_PATH}/scheduling/pending`,
  // 锁定任务用于排程
  LOCK: `${API_BASE_PATH}/scheduling/lock`,
  // 释放任务排程锁定
  UNLOCK: `${API_BASE_PATH}/scheduling/unlock`,
  // 应用排程结果
  APPLY_SCHEDULE: (taskId) => `${API_BASE_PATH}/${taskId}/schedule`,
  // 获取任务执行进度
  PROGRESS: (taskId) => `${API_BASE_PATH}/${taskId}/progress`
}

// 请求超时配置（毫秒）
export const API_TIMEOUT = {
  DEFAULT: 10000,
  UPLOAD: 60000,
  DOWNLOAD: 60000
}

// HTTP 方法
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE'
}

