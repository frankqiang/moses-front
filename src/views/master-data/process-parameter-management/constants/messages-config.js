/**
 * 文件名称：messages-config.js
 * 文件描述：工艺参数管理模块操作提示兜底文案
 * 创建日期：2025-09-29
 * 修改记录：
 *   - 2025-09-29: 初始创建，提供与后端消息对齐的兜底文案
 */

export const MESSAGE_FALLBACKS = {
  createTemplate: '创建工艺模板成功',
  updateTemplate: '更新工艺模板成功',
  deleteTemplate: '删除工艺模板成功',
  submitApproval: '提交审批成功',
  approveVersion: '审批通过成功',
  rejectVersion: '审批已驳回',
  withdrawApproval: '撤回审批成功',
  voidVersion: '版本作废成功',
  activateVersion: '版本已快速生效',
  copyTemplate: '复制模板成功',
  createVersion: '创建新版本成功',
  saveSegments: '温度段参数保存成功',
  saveAtmosphere: '保护气氛参数保存成功',
  saveFanSettings: '循环风机参数保存成功'
}

export const ERROR_MESSAGES = {
  fetchList: '查询工艺模板列表失败，请稍后重试',
  fetchDetail: '获取模板详情失败，请稍后重试',
  fetchVersions: '获取版本列表失败，请稍后重试',
  compareVersions: '版本对比失败，请检查选择的版本',
  fetchUsage: '查询引用情况失败，请稍后重试'
}

export default {
  MESSAGE_FALLBACKS,
  ERROR_MESSAGES
}

