/**
 * 文件名称：api-config.js
 * 文件描述：料框规格管理模块API配置
 * 创建日期：2025-01-09
 * 修改记录：
 *   - 2025-01-09: 初始创建，定义API路径和默认参数
 */

// API基础路径
export const API_BASE_URL = '/mdm/bin-specifications'

// API路径配置
export const API_PATHS = {
  LIST: API_BASE_URL,
  DETAIL: `${API_BASE_URL}/:id`,
  CREATE: API_BASE_URL,
  UPDATE: `${API_BASE_URL}/:id`,
  TOGGLE_STATUS: `${API_BASE_URL}/:id/status`
}

// API默认请求配置
export const API_DEFAULT_CONFIG = {
  timeout: 30000,
  withCredentials: true
}

