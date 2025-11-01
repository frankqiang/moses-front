/**
 * 文件名称：api-config.js
 * 文件描述：备件管理API配置
 * 创建日期：2025-01-21
 * 修改记录：
 *   - 2025-01-21: 初始创建
 */

// API 基础路径
export const API_BASE_PATH = '/v1/mdm/tpm/spare-parts'

// API 端点配置
export const API_ENDPOINTS = {
  LIST: '', // GET /v1/mdm/tpm/spare-parts
  DETAIL: '/:id', // GET /v1/mdm/tpm/spare-parts/:id
  CREATE: '', // POST /v1/mdm/tpm/spare-parts
  UPDATE: '/:id', // PATCH /v1/mdm/tpm/spare-parts/:id
  INVENTORY: '/:id/inventory', // GET /v1/mdm/tpm/spare-parts/:id/inventory
  IN_STOCK: '/:id/in-stock', // POST /v1/mdm/tpm/spare-parts/:id/in-stock
  OUT_STOCK: '/:id/out-stock', // POST /v1/mdm/tpm/spare-parts/:id/out-stock
  TRANSACTIONS: '/transactions' // GET /v1/mdm/tpm/spare-parts/transactions
}

// 权限代码配置
export const PERMISSION_CODES = {
  VIEW: 'mdm.tpm.spare-part.view',
  CREATE: 'mdm.tpm.spare-part.create',
  MANAGE: 'mdm.tpm.spare-part.manage'
}

