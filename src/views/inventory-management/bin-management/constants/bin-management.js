/**
 * 文件名称：bin-stack-management.js
 * 文件描述：料框/料垛管理模块基础常量定义
 * 创建日期：2025-01-10
 * 修改记录:
 *   - 2025-01-10: 初始创建，定义料框状态、料垛状态、触发类型等业务枚举
 */

// ==================== 料框状态枚举 ====================
// 料框14种状态（基于接口文档：料框管理接口文档.md 第744-759行）
export const BIN_STATUS = {
  IDLE: 'IDLE', // 闲置
  PENDING_ANNEALING_STORAGE: 'PENDING_ANNEALING_STORAGE', // 待入库退火
  WAITING_ANNEALING: 'WAITING_ANNEALING', // 待退火
  WAITING_PREPARATION: 'WAITING_PREPARATION', // 待备料
  WAITING_LOADING: 'WAITING_LOADING', // 待装炉
  LOADING: 'LOADING', // 装炉中
  ANNEALING: 'ANNEALING', // 退火中
  WAITING_UNLOAD: 'WAITING_UNLOAD', // 待出炉
  ANNEALED: 'ANNEALED', // 已退火
  WAITING_INSPECTION: 'WAITING_INSPECTION', // 待检验
  INSPECTED_QUALIFIED: 'INSPECTED_QUALIFIED', // 已检验-合格
  INSPECTED_UNQUALIFIED: 'INSPECTED_UNQUALIFIED', // 已检验-不合格
  WAITING_OUTBOUND: 'WAITING_OUTBOUND', // 待出库
  OUTBOUND: 'OUTBOUND' // 已出库
}

// 料框状态显示文本映射
export const BIN_STATUS_TEXT_MAP = {
  [BIN_STATUS.IDLE]: '闲置',
  [BIN_STATUS.PENDING_ANNEALING_STORAGE]: '待入库退火',
  [BIN_STATUS.WAITING_ANNEALING]: '待退火',
  [BIN_STATUS.WAITING_PREPARATION]: '待备料',
  [BIN_STATUS.WAITING_LOADING]: '待装炉',
  [BIN_STATUS.LOADING]: '装炉中',
  [BIN_STATUS.ANNEALING]: '退火中',
  [BIN_STATUS.WAITING_UNLOAD]: '待出炉',
  [BIN_STATUS.ANNEALED]: '已退火',
  [BIN_STATUS.WAITING_INSPECTION]: '待检验',
  [BIN_STATUS.INSPECTED_QUALIFIED]: '已检验-合格',
  [BIN_STATUS.INSPECTED_UNQUALIFIED]: '已检验-不合格',
  [BIN_STATUS.WAITING_OUTBOUND]: '待出库',
  [BIN_STATUS.OUTBOUND]: '已出库'
}

// 料框状态标签类型映射（符合Element UI规范）
export const BIN_STATUS_TYPE_MAP = {
  [BIN_STATUS.IDLE]: 'info', // 闲置-信息
  [BIN_STATUS.PENDING_ANNEALING_STORAGE]: 'warning', // 待入库退火-警告
  [BIN_STATUS.WAITING_ANNEALING]: 'warning', // 待退火-警告
  [BIN_STATUS.WAITING_PREPARATION]: 'warning', // 待备料-警告
  [BIN_STATUS.WAITING_LOADING]: 'warning', // 待装炉-警告
  [BIN_STATUS.LOADING]: '', // 装炉中-默认
  [BIN_STATUS.ANNEALING]: '', // 退火中-默认
  [BIN_STATUS.WAITING_UNLOAD]: 'warning', // 待出炉-警告
  [BIN_STATUS.ANNEALED]: 'success', // 已退火-成功
  [BIN_STATUS.WAITING_INSPECTION]: 'warning', // 待检验-警告
  [BIN_STATUS.INSPECTED_QUALIFIED]: 'success', // 已检验-合格-成功
  [BIN_STATUS.INSPECTED_UNQUALIFIED]: 'danger', // 已检验-不合格-危险
  [BIN_STATUS.WAITING_OUTBOUND]: 'warning', // 待出库-警告
  [BIN_STATUS.OUTBOUND]: 'info' // 已出库-信息
}

// 料框状态选项（用于下拉选择）
export const BIN_STATUS_OPTIONS = Object.keys(BIN_STATUS).map(key => ({
  value: BIN_STATUS[key],
  label: BIN_STATUS_TEXT_MAP[BIN_STATUS[key]]
}))

// ==================== 料垛状态枚举 ====================
// 料垛2种状态（基于接口文档：料垛管理接口文档.md 第487-489行）
export const STACK_STATUS = {
  ACTIVE: 'ACTIVE', // 活动中
  DESTACKED: 'DESTACKED' // 已拆垛
}

// 料垛状态显示文本映射
export const STACK_STATUS_TEXT_MAP = {
  [STACK_STATUS.ACTIVE]: '活动中',
  [STACK_STATUS.DESTACKED]: '已拆垛'
}

// 料垛状态标签类型映射
export const STACK_STATUS_TYPE_MAP = {
  [STACK_STATUS.ACTIVE]: 'success', // 活动中-成功
  [STACK_STATUS.DESTACKED]: 'info' // 已拆垛-信息
}

// 料垛状态选项（用于下拉选择）
export const STACK_STATUS_OPTIONS = Object.keys(STACK_STATUS).map(key => ({
  value: STACK_STATUS[key],
  label: STACK_STATUS_TEXT_MAP[STACK_STATUS[key]]
}))

// ==================== 触发类型枚举 ====================
// 料框状态变更触发类型（基于接口文档：料框管理接口文档.md 第1060-1065行）
export const TRIGGER_TYPE = {
  SCAN_CONFIRMATION: 'SCAN_CONFIRMATION', // 扫码确认
  PLC_SIGNAL: 'PLC_SIGNAL', // PLC信号
  LOGISTICS_TASK: 'LOGISTICS_TASK', // 物流任务
  MANUAL_OPERATION: 'MANUAL_OPERATION', // 人工操作
  SYSTEM_AUTO: 'SYSTEM_AUTO' // 系统自动
}

// 触发类型显示文本映射
export const TRIGGER_TYPE_TEXT_MAP = {
  [TRIGGER_TYPE.SCAN_CONFIRMATION]: '扫码确认',
  [TRIGGER_TYPE.PLC_SIGNAL]: 'PLC信号',
  [TRIGGER_TYPE.LOGISTICS_TASK]: '物流任务',
  [TRIGGER_TYPE.MANUAL_OPERATION]: '人工操作',
  [TRIGGER_TYPE.SYSTEM_AUTO]: '系统自动'
}

// 触发类型选项（用于下拉选择）
export const TRIGGER_TYPE_OPTIONS = Object.keys(TRIGGER_TYPE).map(key => ({
  value: TRIGGER_TYPE[key],
  label: TRIGGER_TYPE_TEXT_MAP[TRIGGER_TYPE[key]]
}))

// ==================== 数值范围限制 ====================
// 重量范围（单位：kg）
export const WEIGHT_LIMITS = {
  MIN: 0.001,
  MAX: 100000,
  PRECISION: 3,
  STEP: 0.1
}

// ==================== 默认分页参数 ====================
export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 20
}

// 默认排序
export const DEFAULT_SORT = 'createdAt:desc'

// ==================== API 响应字段名称映射 ====================
export const API_RESPONSE_FIELDS = {
  list: 'results',
  page: 'page',
  limit: 'limit',
  totalPages: 'totalPages',
  totalResults: 'totalResults'
}

// ==================== 编号格式规则 ====================
// 料框编号格式：LK-YYYYMMDD-XXXX
export const BIN_CODE_PATTERN = /^LK-\d{8}-\d{4}$/
export const BIN_CODE_FORMAT = 'LK-YYYYMMDD-XXXX'

// 料垛编号格式：LD-YYYYMMDD-XXXX
export const STACK_CODE_PATTERN = /^LD-\d{8}-\d{4}$/
export const STACK_CODE_FORMAT = 'LD-YYYYMMDD-XXXX'

// ==================== 料框状态配置（统一配置对象） ====================
export const BIN_STATUS_CONFIG = {
  textMap: BIN_STATUS_TEXT_MAP,
  typeMap: BIN_STATUS_TYPE_MAP
}

// ==================== 料垛状态配置（统一配置对象） ====================
export const STACK_STATUS_CONFIG = {
  textMap: STACK_STATUS_TEXT_MAP,
  typeMap: STACK_STATUS_TYPE_MAP
}

