/**
 * 文件名称：constants/user-management.js
 * 文件描述：用户管理模块的常量定义，包括状态、选项等配置
 * 创建日期：2024-01-15
 * 修改记录：
 *   - 2024-01-15: 初始创建，定义基础常量
 */

// 用户状态常量
export const USER_STATUS = {
  ACTIVE: 'active', // 正常
  INACTIVE: 'inactive', // 禁用
  LOCKED: 'locked' // 锁定
}

// 用户状态选项
export const USER_STATUS_OPTIONS = [
  { label: '正常', value: USER_STATUS.ACTIVE },
  { label: '禁用', value: USER_STATUS.INACTIVE },
  { label: '锁定', value: USER_STATUS.LOCKED }
]

// 性别选项
export const GENDER_OPTIONS = [
  { label: '男', value: 'male' },
  { label: '女', value: 'female' }
]

// 部门选项（示例数据，实际应从API获取）
export const DEPARTMENT_OPTIONS = [
  { label: '技术部', value: 'tech' },
  { label: '产品部', value: 'product' },
  { label: '运营部', value: 'operation' },
  { label: '市场部', value: 'marketing' },
  { label: '人事部', value: 'hr' },
  { label: '财务部', value: 'finance' },
  { label: '行政部', value: 'admin' }
]

// 用户角色选项
export const USER_ROLE_OPTIONS = [
  { label: '超级管理员', value: 'super_admin' },
  { label: '管理员', value: 'admin' },
  { label: '普通用户', value: 'user' },
  { label: '访客', value: 'guest' }
]

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

// 表格默认配置
export const TABLE_CONFIG = {
  PAGE_SIZE: 20,
  PAGE_SIZES: [10, 20, 50, 100],
  MAX_SELECTION: 100
}

// 表单验证规则常量
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

// 错误消息常量
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '网络连接失败，请检查网络设置',
  SERVER_ERROR: '服务器错误，请稍后重试',
  PERMISSION_DENIED: '权限不足，无法执行此操作',
  USER_NOT_FOUND: '用户不存在',
  USERNAME_EXISTS: '用户名已存在',
  EMAIL_EXISTS: '邮箱已被使用',
  PHONE_EXISTS: '手机号已被使用',
  INVALID_CREDENTIALS: '用户名或密码错误',
  ACCOUNT_LOCKED: '账户已被锁定',
  ACCOUNT_DISABLED: '账户已被禁用',
  PASSWORD_TOO_WEAK: '密码强度不足',
  VALIDATION_FAILED: '数据验证失败'
}

// 成功消息常量
export const SUCCESS_MESSAGES = {
  USER_CREATED: '用户创建成功',
  USER_UPDATED: '用户信息更新成功',
  USER_DELETED: '用户删除成功',
  USER_ENABLED: '用户启用成功',
  USER_DISABLED: '用户禁用成功',
  PASSWORD_RESET: '密码重置成功',
  BATCH_OPERATION_SUCCESS: '批量操作成功',
  DATA_EXPORTED: '数据导出成功',
  DATA_IMPORTED: '数据导入成功'
}

// 确认消息常量
export const CONFIRM_MESSAGES = {
  DELETE_USER: '确定要删除用户 "{name}" 吗？',
  DELETE_USERS: '确定要删除选中的 {count} 个用户吗？',
  ENABLE_USER: '确定要启用用户 "{name}" 吗？',
  DISABLE_USER: '确定要禁用用户 "{name}" 吗？',
  RESET_PASSWORD: '确定要重置用户 "{name}" 的密码吗？',
  BATCH_ENABLE: '确定要启用选中的 {count} 个用户吗？',
  BATCH_DISABLE: '确定要禁用选中的 {count} 个用户吗？'
}

// 默认值常量
export const DEFAULT_VALUES = {
  USER: {
    status: USER_STATUS.ACTIVE,
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
    limit: TABLE_CONFIG.PAGE_SIZE,
    total: 0
  }
}

// 导出所有常量
export default {
  USER_STATUS,
  USER_STATUS_OPTIONS,
  GENDER_OPTIONS,
  DEPARTMENT_OPTIONS,
  USER_ROLE_OPTIONS,
  OPERATION_TYPE,
  TABLE_CONFIG,
  VALIDATION_RULES,
  API_PATHS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  CONFIRM_MESSAGES,
  DEFAULT_VALUES
}
