/**
 * 文件名称：messages-config.js
 * 文件描述：退火任务管理模块消息提示配置
 * 创建日期：2025-10-18
 * 修改记录：
 *   - 2025-10-18: 初始创建，定义成功和错误消息模板
 */

// 成功消息（备用）
export const SUCCESS_MESSAGES = {
  FETCH_LIST: '获取退火任务列表成功',
  FETCH_DETAIL: '获取退火任务详情成功',
  CREATE: '创建退火任务成功',
  UPDATE: '更新退火任务成功',
  DELETE: '删除退火任务成功',
  UPDATE_STATUS: '更新任务状态成功',
  BIND_MATERIALS: '绑定物料成功',
  LOCK: '锁定任务成功',
  UNLOCK: '释放锁定成功',
  APPLY_SCHEDULE: '应用排程结果成功'
}

// 错误消息（备用）
export const ERROR_MESSAGES = {
  FETCH_LIST: '获取退火任务列表失败',
  FETCH_DETAIL: '获取退火任务详情失败',
  CREATE: '创建退火任务失败',
  UPDATE: '更新退火任务失败',
  DELETE: '删除退火任务失败',
  UPDATE_STATUS: '更新任务状态失败',
  BIND_MATERIALS: '绑定物料失败',
  LOCK: '锁定任务失败',
  UNLOCK: '释放锁定失败',
  APPLY_SCHEDULE: '应用排程结果失败',
  NETWORK_ERROR: '网络连接失败，请检查网络后重试',
  TIMEOUT: '请求超时，请稍后重试',
  PERMISSION_DENIED: '无权限执行此操作',
  INVALID_PARAMS: '请求参数不正确',
  RESOURCE_NOT_FOUND: '资源不存在',
  INVALID_STATUS: '当前状态不允许此操作',
  WEIGHT_OUT_OF_RANGE: '重量超出炉容范围（35-42吨）',
  DUPLICATE_MATERIAL: '物料已被其他任务绑定'
}

// 确认消息
export const CONFIRM_MESSAGES = {
  DELETE: '确认删除此退火任务吗？删除后不可恢复。',
  CANCEL: '确认取消此退火任务吗？取消后不可恢复。',
  TERMINATE: '确认异常终止此退火任务吗？终止后不可恢复。'
}

// 警告消息
export const WARNING_MESSAGES = {
  WEIGHT_WARNING: '当前绑定物料总重量不在推荐炉容范围（35-42吨）内',
  NO_MATERIALS: '尚未绑定物料，无法提交排程',
  NO_PROCESS_TEMPLATE: '未关联工艺模板，请先选择工艺模板'
}

