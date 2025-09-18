/**
 * 用户管理消息配置
 * 文件描述：用户管理模块的错误消息、成功消息、确认消息等配置
 * 创建日期：2024-12-23
 * 修改记录：
 *   - 2024-12-23: 从user-management.js中拆分消息相关配置
 */

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
