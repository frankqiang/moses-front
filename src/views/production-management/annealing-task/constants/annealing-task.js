/**
 * 文件名称：annealing-task.js
 * 文件描述：退火任务管理模块基础常量定义
 * 创建日期：2025-10-18
 * 修改记录：
 *   - 2025-10-18: 初始创建，定义任务状态、优先级、来源等业务枚举
 *   - 2025-11-01: 更新状态流转规则(v1.2)，禁止已排程任务直接回退或取消；移除"标记为待排程"快速操作
 */

// 任务状态
export const TASK_STATUS = {
  DRAFT: 'draft',
  PENDING_SCHEDULE: 'pending-schedule',
  SCHEDULED: 'scheduled',
  WAITING_LOADING: 'waiting-loading',
  LOADING: 'loading',
  WAITING_EXECUTE: 'waiting-execute',
  IN_PROGRESS: 'in-progress',
  WAITING_UNLOAD: 'waiting-unload',
  COMPLETED: 'completed',
  PAUSED: 'paused',
  CANCELLED: 'cancelled',
  TERMINATED: 'terminated'
}

// 任务状态选项
export const TASK_STATUS_OPTIONS = [
  { value: TASK_STATUS.DRAFT, label: '草稿' },
  { value: TASK_STATUS.PENDING_SCHEDULE, label: '待排程' },
  { value: TASK_STATUS.SCHEDULED, label: '已排程' },
  { value: TASK_STATUS.WAITING_LOADING, label: '待装炉' },
  { value: TASK_STATUS.LOADING, label: '装炉中' },
  { value: TASK_STATUS.WAITING_EXECUTE, label: '待执行' },
  { value: TASK_STATUS.IN_PROGRESS, label: '执行中' },
  { value: TASK_STATUS.WAITING_UNLOAD, label: '待出炉' },
  { value: TASK_STATUS.COMPLETED, label: '已完成' },
  { value: TASK_STATUS.PAUSED, label: '已暂停' },
  { value: TASK_STATUS.CANCELLED, label: '已取消' },
  { value: TASK_STATUS.TERMINATED, label: '异常终止' }
]

// 任务优先级
export const TASK_PRIORITY = {
  EMERGENCY: 'emergency',
  HIGH: 'high',
  NORMAL: 'normal',
  LOW: 'low'
}

// 任务优先级选项
export const TASK_PRIORITY_OPTIONS = [
  { value: TASK_PRIORITY.EMERGENCY, label: '紧急' },
  { value: TASK_PRIORITY.HIGH, label: '高' },
  { value: TASK_PRIORITY.NORMAL, label: '普通' },
  { value: TASK_PRIORITY.LOW, label: '低' }
]

// 任务来源
export const TASK_SOURCE = {
  PLAN_SPLIT: 'plan-split',
  MANUAL: 'manual'
}

// 任务来源选项
export const TASK_SOURCE_OPTIONS = [
  { value: TASK_SOURCE.PLAN_SPLIT, label: '计划拆分' },
  { value: TASK_SOURCE.MANUAL, label: '手工创建' }
]

// 排程状态（v1.1新增）
export const SCHEDULING_STATUS = {
  NOT_SCHEDULED: 'not_scheduled',
  PLAN_CREATED: 'plan_created',
  SCHEDULED: 'scheduled'
}

// 排程状态选项
export const SCHEDULING_STATUS_OPTIONS = [
  { value: SCHEDULING_STATUS.NOT_SCHEDULED, label: '未排程' },
  { value: SCHEDULING_STATUS.PLAN_CREATED, label: '已生成方案' },
  { value: SCHEDULING_STATUS.SCHEDULED, label: '已发布排程' }
]

// 物料类型
export const MATERIAL_TYPE = {
  BASKET: 'basket',
  STACK: 'stack'
}

// 物料类型选项
export const MATERIAL_TYPE_OPTIONS = [
  { value: MATERIAL_TYPE.BASKET, label: '料框' },
  { value: MATERIAL_TYPE.STACK, label: '料垛' }
]

// 炉容范围
export const FURNACE_CAPACITY = {
  MIN: 35,
  MAX: 42,
  TARGET: 40,
  TOLERANCE: 0.1
}

// 重量范围（单位：吨）
export const WEIGHT_LIMITS = {
  MIN: 0.001,
  MAX: 50,
  PRECISION: 6,
  STEP: 0.001
}

// 默认排序
export const DEFAULT_SORT = 'createdAt:desc'

// 默认分页参数
export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 20
}

// 待排程任务默认分页（接口基于limit/offset）
export const PENDING_DEFAULT_PAGINATION = {
  limit: 20,
  offset: 0
}

// API 响应字段名称映射
export const API_RESPONSE_FIELDS = {
  list: 'results',
  page: 'page',
  limit: 'limit',
  totalPages: 'totalPages',
  totalResults: 'totalResults'
}

// 搜索支持的排序字段
export const SORTABLE_FIELDS = [
  'taskCode',
  'taskName',
  'status',
  'priority',
  'plannedLoadingAt',
  'plannedUnloadingAt',
  'plannedWeight',
  'actualWeight',
  'createdAt',
  'updatedAt'
]

// 状态流转规则（从当前状态到允许的下一状态）
// 注意：pending-schedule → scheduled 的变更必须通过"应用排程结果"接口完成，不能通过简单的状态更新
// v1.2更新：已排程任务禁止直接回退到待排程或取消，需通过排程模块取消排程方案
export const STATE_TRANSITIONS = {
  [TASK_STATUS.DRAFT]: [TASK_STATUS.PENDING_SCHEDULE, TASK_STATUS.CANCELLED],
  [TASK_STATUS.PENDING_SCHEDULE]: [TASK_STATUS.DRAFT, TASK_STATUS.CANCELLED], // 移除SCHEDULED，该操作由排程系统完成
  [TASK_STATUS.SCHEDULED]: [TASK_STATUS.WAITING_LOADING, TASK_STATUS.PAUSED], // v1.2：移除PENDING_SCHEDULE和CANCELLED，防止数据不一致
  [TASK_STATUS.WAITING_LOADING]: [TASK_STATUS.LOADING, TASK_STATUS.PAUSED, TASK_STATUS.CANCELLED],
  [TASK_STATUS.LOADING]: [TASK_STATUS.WAITING_EXECUTE, TASK_STATUS.WAITING_LOADING, TASK_STATUS.PAUSED, TASK_STATUS.TERMINATED],
  [TASK_STATUS.WAITING_EXECUTE]: [TASK_STATUS.IN_PROGRESS, TASK_STATUS.PAUSED, TASK_STATUS.TERMINATED],
  [TASK_STATUS.IN_PROGRESS]: [TASK_STATUS.WAITING_UNLOAD, TASK_STATUS.PAUSED, TASK_STATUS.TERMINATED],
  [TASK_STATUS.WAITING_UNLOAD]: [TASK_STATUS.COMPLETED, TASK_STATUS.PAUSED, TASK_STATUS.TERMINATED],
  [TASK_STATUS.PAUSED]: [
    TASK_STATUS.SCHEDULED,
    TASK_STATUS.WAITING_LOADING,
    TASK_STATUS.LOADING,
    TASK_STATUS.WAITING_EXECUTE,
    TASK_STATUS.IN_PROGRESS,
    TASK_STATUS.WAITING_UNLOAD,
    TASK_STATUS.CANCELLED,
    TASK_STATUS.TERMINATED
  ],
  [TASK_STATUS.COMPLETED]: [],
  [TASK_STATUS.CANCELLED]: [],
  [TASK_STATUS.TERMINATED]: []
}

// 需要原因说明的状态
export const REASON_REQUIRED_STATUSES = [
  TASK_STATUS.PAUSED,
  TASK_STATUS.CANCELLED,
  TASK_STATUS.TERMINATED
]

// 快捷原因选项（用于暂停、取消、异常终止）
export const QUICK_REASON_OPTIONS = {
  [TASK_STATUS.PAUSED]: [
    { label: '设备故障', value: '设备故障' },
    { label: '物料不足', value: '物料不足' },
    { label: '工艺调整', value: '工艺调整' },
    { label: '计划变更', value: '计划变更' },
    { label: '质量问题', value: '质量问题' },
    { label: '人员调配', value: '人员调配' }
  ],
  [TASK_STATUS.CANCELLED]: [
    { label: '生产计划取消', value: '生产计划取消' },
    { label: '客户取消订单', value: '客户取消订单' },
    { label: '物料质量不合格', value: '物料质量不合格' },
    { label: '设备无法使用', value: '设备无法使用' },
    { label: '重复创建', value: '重复创建' }
  ],
  [TASK_STATUS.TERMINATED]: [
    { label: '设备严重故障', value: '设备严重故障' },
    { label: '安全事故', value: '安全事故' },
    { label: '严重质量问题', value: '严重质量问题' },
    { label: '停电停水', value: '停电停水' },
    { label: '其他紧急情况', value: '其他紧急情况' }
  ]
}

// 状态说明（用于帮助用户理解状态含义）
export const STATUS_DESCRIPTIONS = {
  [TASK_STATUS.DRAFT]: '任务初始状态，可继续编辑',
  [TASK_STATUS.PENDING_SCHEDULE]: '任务已确认，等待系统排程',
  [TASK_STATUS.SCHEDULED]: '已分配退火炉和时间窗口（需重新排程或取消请前往排程管理模块）',
  [TASK_STATUS.WAITING_LOADING]: '排程已发布，等待装炉操作',
  [TASK_STATUS.LOADING]: '正在进行装炉操作',
  [TASK_STATUS.WAITING_EXECUTE]: '装炉完成，等待退火工艺执行',
  [TASK_STATUS.IN_PROGRESS]: '退火工艺正在执行',
  [TASK_STATUS.WAITING_UNLOAD]: '退火完成，等待出炉操作',
  [TASK_STATUS.COMPLETED]: '出炉完成，任务终态',
  [TASK_STATUS.PAUSED]: '任务暂停，可恢复到暂停前状态',
  [TASK_STATUS.CANCELLED]: '任务取消，任务终态',
  [TASK_STATUS.TERMINATED]: '任务因异常终止，任务终态'
}

// 常用快速状态更新操作（用于列表页快捷操作）
export const QUICK_STATUS_ACTIONS = [
  {
    label: '开始装炉',
    targetStatus: TASK_STATUS.LOADING,
    allowedFromStatuses: [TASK_STATUS.WAITING_LOADING],
    type: 'success',
    icon: 'el-icon-upload2'
  },
  {
    label: '开始执行',
    targetStatus: TASK_STATUS.IN_PROGRESS,
    allowedFromStatuses: [TASK_STATUS.WAITING_EXECUTE],
    type: 'success',
    icon: 'el-icon-video-play'
  },
  {
    label: '标记完成',
    targetStatus: TASK_STATUS.COMPLETED,
    allowedFromStatuses: [TASK_STATUS.WAITING_UNLOAD],
    type: 'success',
    icon: 'el-icon-check'
  }
]

