/**
 * 文件名称：messages-config.js
 * 文件描述：料框/料垛管理模块提示消息配置
 * 创建日期：2025-01-10
 * 修改记录:
 *   - 2025-01-10: 初始创建，定义前端交互消息（后端消息直接使用response.message或error.message）
 */

// ==================== 重要说明 ====================
// 根据项目规范和接口文档：
// 1. 所有API成功消息：直接使用后端返回的 response.message
// 2. 所有API错误消息：直接使用后端返回的 error.message
// 3. 本文件仅定义前端自身交互逻辑的消息（确认提示、表单验证等）
// ==========================================

// ==================== 操作确认消息 ====================
export const CONFIRM_MESSAGES = {
  deleteBin: '确定要删除该料框吗？',
  updateBinStatus: '确定要变更料框状态吗？',
  destack: '确定要拆垛吗？拆垛后料框将恢复独立状态',
  batchDestack: '确定要批量拆垛选中的料垛吗？'
}

// ==================== 提示消息 ====================
export const HINT_MESSAGES = {
  selectBinsForStack: '请选择至少2个料框进行组垛',
  binsRuleViolation: '选中的料框不符合组垛规则，请检查规格、产品、批次、状态是否一致',
  stackLayersExceeded: '堆叠层数超过规格限制',
  binAlreadyInStack: '该料框已在其他料垛中，请先拆垛',
  weightExceedsLimit: '料框重量超过规格最大载重',
  invalidStatusTransition: '当前状态不允许转换到目标状态'
}

// ==================== 表单验证消息 ====================
export const VALIDATION_MESSAGES = {
  binCodeRequired: '请输入料框编号',
  binCodeFormat: '料框编号格式不正确（格式：LK-YYYYMMDD-XXXX）',
  stackCodeFormat: '料垛编号格式不正确（格式：LD-YYYYMMDD-XXXX）',
  specificationRequired: '请选择料框规格',
  productRequired: '请选择铝箔产品',
  productCodeRequired: '请输入产品代码',
  weightRequired: '请输入重量',
  weightPositive: '重量必须大于0',
  targetStatusRequired: '请选择目标状态',
  triggerTypeRequired: '请选择触发类型'
}

