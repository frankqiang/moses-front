/**
 * 文件名称：messages-config.js
 * 文件描述：设备主数据管理模块操作消息提示配置
 * 创建日期：2025-09-28
 * 修改记录：
 *   - 2025-09-28: 初始创建，提供后端未返回 message 时的兜底提示
 */

export const MESSAGE_FALLBACKS = {
  fetchList: '设备列表加载成功',
  fetchListError: '设备列表加载失败，请稍后重试',
  fetchDetailError: '设备详情获取失败，请检查网络或稍后重试',
  createSuccess: '设备创建成功',
  createError: '设备创建失败，请稍后重试',
  updateSuccess: '设备更新成功',
  updateError: '设备更新失败，请稍后重试'
}

export const MESSAGE_TIPS = {
  includeDetailsDisabled: '已关闭详情字段，返回数据将仅包含基础信息',
  includeDetailsEnabled: '已启用详情字段，返回数据将包含类型化详情',
  communicationSensitive: '敏感通讯参数已自动脱敏，如需修改请重新填写'
}
