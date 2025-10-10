/**
 * 文件名称：api-config.js
 * 文件描述：料框/料垛管理模块API配置常量
 * 创建日期：2025-01-10
 * 修改记录:
 *   - 2025-01-10: 初始创建，定义API路径与方法（严格基于接口文档）
 */

// ==================== 料框管理API配置 ====================
export const BIN_API_PREFIX = '/inv/bins'

// 料框管理API端点配置（基于接口文档：料框管理接口文档.md）
export const BIN_API_ENDPOINTS = {
  // 料框注册（POST /v1/inv/bins）
  register: {
    method: 'post',
    url: BIN_API_PREFIX
  },
  // 批量注册料框（POST /v1/inv/bins/batch）
  batchRegister: {
    method: 'post',
    url: `${BIN_API_PREFIX}/batch`
  },
  // 料框列表查询（GET /v1/inv/bins）
  list: {
    method: 'get',
    url: BIN_API_PREFIX
  },
  // 料框详情查询（GET /v1/inv/bins/:id）
  detail: {
    method: 'get',
    url: `${BIN_API_PREFIX}/:id`
  },
  // 更新料框状态（PATCH /v1/inv/bins/:id/status）
  updateStatus: {
    method: 'patch',
    url: `${BIN_API_PREFIX}/:id/status`
  },
  // 料框状态历史查询（GET /v1/inv/bins/:id/status-history）
  statusHistory: {
    method: 'get',
    url: `${BIN_API_PREFIX}/:id/status-history`
  }
}

// 料框管理API默认参数
export const BIN_API_DEFAULT_PARAMS = {
  list: {
    page: 1,
    limit: 20,
    sortBy: 'createdAt:desc'
  },
  statusHistory: {
    limit: 10,
    offset: 0
  }
}

// ==================== 料垛管理API配置 ====================
export const STACK_API_PREFIX = '/inv/stacks'

// 料垛管理API端点配置（基于接口文档：料垛管理接口文档.md）
export const STACK_API_ENDPOINTS = {
  // 组垛（POST /v1/inv/stacks）
  create: {
    method: 'post',
    url: STACK_API_PREFIX
  },
  // 料垛列表查询（GET /v1/inv/stacks）
  list: {
    method: 'get',
    url: STACK_API_PREFIX
  },
  // 料垛详情查询（GET /v1/inv/stacks/:id）
  detail: {
    method: 'get',
    url: `${STACK_API_PREFIX}/:id`
  },
  // 拆垛（POST /v1/inv/stacks/:id/destack）
  destack: {
    method: 'post',
    url: `${STACK_API_PREFIX}/:id/destack`
  },
  // 料垛成员料框列表查询（GET /v1/inv/stacks/:id/bins）
  bins: {
    method: 'get',
    url: `${STACK_API_PREFIX}/:id/bins`
  }
}

// 料垛管理API默认参数
export const STACK_API_DEFAULT_PARAMS = {
  list: {
    page: 1,
    limit: 20,
    sortBy: 'createdAt:desc'
  }
}

// ==================== 重要说明 ====================
// 根据项目规范和接口文档的统一响应格式：
// 1. 所有API成功响应都包含 response.message 字段，前端直接使用该字段展示成功消息
// 2. 所有API错误响应都包含 error.message 字段，前端直接使用该字段展示错误消息
// 3. 不应在前端硬编码API响应消息，确保消息的统一性和可维护性
// ==========================================

