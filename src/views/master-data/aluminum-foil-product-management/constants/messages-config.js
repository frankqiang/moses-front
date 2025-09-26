/**
 * 文件名称：messages-config.js
 * 文件描述：铝箔产品管理模块提示消息配置
 * 创建日期：2025-09-26
 * 修改记录：
 *   - 2025-09-26: 初始创建，提供后端消息兜底文案
 */

export const MESSAGE_KEYS = {
  createSuccess: 'aluminumFoilProduct.create.success',
  updateSuccess: 'aluminumFoilProduct.update.success',
  listError: 'aluminumFoilProduct.list.error',
  detailError: 'aluminumFoilProduct.detail.error'
}

export const DEFAULT_MESSAGES = {
  [MESSAGE_KEYS.createSuccess]: '创建铝箔产品成功',
  [MESSAGE_KEYS.updateSuccess]: '更新铝箔产品成功',
  [MESSAGE_KEYS.listError]: '查询铝箔产品失败，请稍后重试',
  [MESSAGE_KEYS.detailError]: '获取铝箔产品详情失败，请稍后重试'
}

