/**
 * 文件名称：messages-config.js
 * 文件描述：备件管理消息提示配置
 * 创建日期：2025-01-21
 * 修改记录：
 *   - 2025-01-21: 初始创建
 *   - 2025-01-21: 简化配置，只保留必要的备用消息
 *
 * 使用说明：
 * 1. API成功消息：使用 response.message || SUCCESS_MESSAGES.XXX
 * 2. API错误消息：由 src/utils/request.js 自动处理和显示（使用后端返回的 error.message）
 * 3. 前端业务逻辑消息：使用 WARNING_MESSAGES.XXX
 */

/**
 * 成功消息配置（备用）
 * 仅在后端未返回 response.message 时使用
 */
export const SUCCESS_MESSAGES = {
  // API操作备用消息
  CREATE: '创建备件成功',
  UPDATE: '更新备件成功',
  IN_STOCK: '备件入库成功',
  OUT_STOCK: '备件出库成功',
  REFRESH_LIST: '备件列表刷新成功',

  // 前端操作消息
  COPY_CODE: '备件编码已复制'
}

/**
 * 错误消息配置（备用）
 * 注意：API错误消息由 request.js 自动处理，这里只保留特殊场景
 */
export const ERROR_MESSAGES = {
  // 前端操作失败
  COPY_CODE_FAILED: '复制失败，请手动复制',

  // 数据加载失败（仅在特殊情况下使用，如 response 格式异常）
  LOAD_LIST_FAILED: '获取备件列表失败',
  REFRESH_LIST_FAILED: '备件列表刷新失败',

  // HTTP状态码错误（由 request.js 处理，这里仅作参考）
  UNAUTHORIZED: '未授权，请重新登录',
  FORBIDDEN: '权限不足'
}

/**
 * 警告消息配置
 * 用于前端业务逻辑的警告提示
 */
export const WARNING_MESSAGES = {
  // 表单验证警告
  INVALID_PARAMS: '请检查输入参数',
  UNSAVED_CHANGES: '您有未保存的更改，确定要离开吗？',

  // 业务逻辑警告
  LOW_STOCK: '当前库存不足，请及时补充',
  NO_PERMISSION: '您没有执行此操作的权限'
}

