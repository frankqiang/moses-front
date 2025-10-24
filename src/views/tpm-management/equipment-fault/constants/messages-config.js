/**
 * 文件名称：messages-config.js
 * 文件描述：设备故障管理模块消息提示配置
 * 创建日期：2025-01-20
 * 修改记录：
 *   - 2025-01-20: 初始创建
 */

// 成功消息
export const SUCCESS_MESSAGES = {
  QUERY_SUCCESS: '查询成功',
  CREATE_SUCCESS: '创建成功',
  UPDATE_SUCCESS: '更新成功',
  DELETE_SUCCESS: '删除成功',
  CLOSE_SUCCESS: '关闭成功',
  START_REPAIR_SUCCESS: '开始处理成功',
  COMPLETE_REPAIR_SUCCESS: '完成处理成功',
  VERIFY_SUCCESS: '验证成功',
  SUBMIT_ROOT_CAUSE_SUCCESS: '提交根本原因分析成功',
  EXPORT_SUCCESS: '导出成功',
  COPY_SUCCESS: '复制成功'
}

// 错误消息
export const ERROR_MESSAGES = {
  QUERY_FAILED: '查询失败',
  CREATE_FAILED: '创建失败',
  UPDATE_FAILED: '更新失败',
  DELETE_FAILED: '删除失败',
  CLOSE_FAILED: '关闭失败',
  START_REPAIR_FAILED: '开始处理失败',
  COMPLETE_REPAIR_FAILED: '完成处理失败',
  VERIFY_FAILED: '验证失败',
  SUBMIT_ROOT_CAUSE_FAILED: '提交根本原因分析失败',
  EXPORT_FAILED: '导出失败',
  COPY_FAILED: '复制失败',
  NETWORK_ERROR: '网络错误，请稍后重试',
  PERMISSION_DENIED: '权限不足',
  VALIDATION_FAILED: '数据验证失败'
}

// 确认消息
export const CONFIRM_MESSAGES = {
  CLOSE_CONFIRM: '确认要关闭此故障单吗？',
  DELETE_CONFIRM: '确认要删除此故障记录吗？'
}

// 警告消息
export const WARNING_MESSAGES = {
  NO_SELECTION: '请选择至少一条记录',
  INVALID_DATE_RANGE: '结束时间不能早于开始时间',
  REQUIRED_FIELD: '请填写必填项'
}

