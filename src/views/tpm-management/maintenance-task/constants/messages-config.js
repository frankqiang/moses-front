/**
 * 文件名称：messages-config.js
 * 文件描述：维护任务管理消息配置
 * 创建日期：2024-01-20
 * 修改记录：
 *   - 2024-01-20: 初始创建
 */

/**
 * 成功消息配置
 * 作为后端未返回消息时的备用消息
 */
export const SUCCESS_MESSAGES = {
  CREATE_TASK: '创建维护任务成功',
  ASSIGN_TASK: '任务派工成功',
  ACCEPT_TASK: '任务接单成功',
  START_TASK: '开始执行任务成功',
  COMPLETE_TASK: '完成任务成功',
  POSTPONE_TASK: '任务延期申请成功',
  CANCEL_TASK: '任务取消成功',
  EXPORT_TASKS: '导出任务列表成功'
}

/**
 * 确认消息配置
 */
export const CONFIRM_MESSAGES = {
  ACCEPT_TASK: '确认接收此任务？',
  START_TASK: '确认开始执行此任务？设备状态将变更为"维护中"。',
  CANCEL_TASK: '确认取消此任务？取消后任务将无法恢复。',
  DELETE_SPARE_PART: '确认删除此备件记录？'
}

/**
 * 警告消息配置
 */
export const WARNING_MESSAGES = {
  TASK_STATUS_INVALID: '当前任务状态不允许此操作',
  TASK_NOT_ASSIGNED: '任务未派工，无法执行此操作',
  NOT_TASK_ASSIGNEE: '您不是此任务的执行人，无法执行此操作',
  EQUIPMENT_NOT_SELECTED: '请先选择设备',
  PERSONNEL_NOT_SELECTED: '请先选择执行人员',
  MAINTENANCE_PLAN_NOT_SELECTED: '请先选择维护计划',
  NO_TASKS_SELECTED: '请先选择要操作的任务',
  PLANNED_END_TIME_INVALID: '计划结束时间必须晚于计划开始时间',
  NEW_PLANNED_START_TIME_INVALID: '新的计划开始时间不能早于当前时间'
}

/**
 * 错误消息配置
 * 仅在后端未返回详细错误信息时使用
 */
export const ERROR_MESSAGES = {
  LOAD_TASKS_FAILED: '加载任务列表失败',
  LOAD_TASK_DETAIL_FAILED: '加载任务详情失败',
  CREATE_TASK_FAILED: '创建任务失败',
  ASSIGN_TASK_FAILED: '任务派工失败',
  ACCEPT_TASK_FAILED: '任务接单失败',
  START_TASK_FAILED: '开始执行任务失败',
  COMPLETE_TASK_FAILED: '完成任务失败',
  POSTPONE_TASK_FAILED: '任务延期申请失败',
  CANCEL_TASK_FAILED: '任务取消失败',
  LOAD_EQUIPMENT_FAILED: '加载设备列表失败',
  LOAD_PERSONNEL_FAILED: '加载人员列表失败',
  LOAD_MAINTENANCE_PLAN_FAILED: '加载维护计划列表失败',
  EXPORT_TASKS_FAILED: '导出任务列表失败'
}

/**
 * 状态操作限制配置
 * 定义每种状态下允许的操作
 */
export const STATUS_OPERATION_MAP = {
  '待执行': {
    allowedOperations: ['view', 'assign', 'accept', 'start', 'postpone', 'cancel'],
    disallowedMessage: '待执行状态的任务可以派工、接单、开始执行、延期或取消'
  },
  '执行中': {
    allowedOperations: ['view', 'complete', 'postpone', 'cancel'],
    disallowedMessage: '执行中状态的任务可以完成、延期或取消'
  },
  '已完成': {
    allowedOperations: ['view'],
    disallowedMessage: '已完成的任务不能修改'
  },
  '已延期': {
    allowedOperations: ['view', 'start', 'cancel'],
    disallowedMessage: '已延期状态的任务可以重新开始或取消'
  },
  '已取消': {
    allowedOperations: ['view'],
    disallowedMessage: '已取消的任务不能修改'
  }
}

