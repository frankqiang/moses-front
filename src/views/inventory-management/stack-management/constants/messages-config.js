/**
 * 文件名称：messages-config.js
 * 文件描述：料垛管理模块消息提示配置
 * 创建日期：2025-01-10
 * 修改记录:
 *   - 2025-01-10: 初始创建，定义各类操作的备用消息文本
 */

// ==================== 料垛操作消息配置 ====================
// 注意：根据项目规范，应优先使用后端返回的response.message和error.message
// 本配置仅作为备用，当后端未返回消息时使用

export const STACK_MESSAGES = {
  // 组垛操作
  create: {
    success: '组垛成功',
    failed: '组垛失败'
  },
  // 拆垛操作
  destack: {
    success: '拆垛成功',
    failed: '拆垛失败',
    confirm: '确定要拆垛吗？拆垛后料框将恢复独立状态。'
  },
  // 查询操作
  query: {
    success: '查询成功',
    failed: '查询失败',
    empty: '暂无数据'
  },
  // 删除操作
  delete: {
    success: '删除成功',
    failed: '删除失败',
    confirm: '确定要删除该料垛吗？'
  },
  // 导出操作
  export: {
    success: '导出成功',
    failed: '导出失败'
  },
  // 刷新操作
  refresh: {
    success: '刷新成功',
    failed: '刷新失败'
  }
}

// ==================== 验证消息配置 ====================
export const VALIDATION_MESSAGES = {
  required: '该字段为必填项',
  stackCodeFormat: '料垛编号格式不正确',
  binIdsRequired: '请选择至少2个料框',
  binIdsMin: '至少需要选择2个料框进行组垛'
}

