/**
 * 用户管理API配置
 * 文件描述：用户管理模块的API接口路径和相关配置
 * 创建日期：2024-12-23
 * 修改记录：
 *   - 2024-12-23: 从user-management.js中拆分API相关配置
 */

// API 接口路径常量
export const API_PATHS = {
  USER_LIST: '/api/users',
  USER_DETAIL: '/api/users/:id',
  USER_CREATE: '/api/users',
  USER_UPDATE: '/api/users/:id',
  USER_DELETE: '/api/users/:id',
  USER_BATCH_DELETE: '/api/users/batch-delete',
  USER_STATUS_UPDATE: '/api/users/:id/status',
  USER_BATCH_STATUS_UPDATE: '/api/users/batch-status',
  USER_PASSWORD_RESET: '/api/users/:id/reset-password',
  USER_EXPORT: '/api/users/export',
  USER_IMPORT: '/api/users/import',
  USER_TEMPLATE: '/api/users/template'
}

// 操作类型常量
export const OPERATION_TYPE = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  VIEW: 'view',
  ENABLE: 'enable',
  DISABLE: 'disable',
  RESET_PASSWORD: 'reset_password'
}

// 表格配置常量
export const TABLE_CONFIG = {
  PAGE_SIZE: 20,
  PAGE_SIZES: [10, 20, 50, 100],
  MAX_SELECTION: 100
}

// 验证规则常量
export const VALIDATION_RULES = {
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 20,
    PATTERN: /^[a-zA-Z0-9_]+$/
  },
  PASSWORD: {
    MIN_LENGTH: 6,
    MAX_LENGTH: 20,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/
  },
  REAL_NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 10
  },
  PHONE: {
    PATTERN: /^1[3-9]\d{9}$/
  },
  EMAIL: {
    PATTERN: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  }
}

// 默认值常量
export const DEFAULT_VALUES = {
  USER: {
    status: 'active',
    gender: 'male',
    department: '',
    role: 'user'
  },
  SEARCH: {
    username: '',
    realName: '',
    email: '',
    phone: '',
    department: '',
    status: '',
    createTimeRange: []
  },
  PAGINATION: {
    page: 1,
    limit: 20,
    total: 0
  }
}