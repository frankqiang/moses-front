/**
 * 文件名称：api-config.js
 * 文件描述：设备故障管理模块API配置
 * 创建日期：2025-01-20
 * 修改记录：
 *   - 2025-01-20: 初始创建
 */

// API基础路径
export const API_BASE_PATH = '/mdm/tpm/equipment-failures'

// API端点配置
export const API_ENDPOINTS = {
  LIST: '',
  DETAIL: '/:id',
  CREATE: '',
  UPDATE: '/:id',
  DELETE: '/:id',
  START_REPAIR: '/:id/start-repair',
  COMPLETE_REPAIR: '/:id/complete-repair',
  VERIFY: '/:id/verify',
  CLOSE: '/:id/close',
  ROOT_CAUSE_ANALYSIS: '/:id/root-cause-analysis',
  EQUIPMENT_MTTR: '/by-equipment/:equipmentId/mttr',
  STATISTICS: '/statistics',
  TREND: '/trend',
  REPEAT: '/repeat'
}

// 请求超时配置（毫秒）
export const REQUEST_TIMEOUT = {
  DEFAULT: 15000,
  EXPORT: 60000,
  STATISTICS: 30000
}

// 分页配置
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  PAGE_SIZES: [10, 20, 50, 100],
  MAX_LIMIT: 100
}

