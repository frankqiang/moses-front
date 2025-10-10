/**
 * 文件名称：stack-management.js
 * 文件描述：料垛管理模块基础常量定义
 * 创建日期：2025-01-10
 * 修改记录:
 *   - 2025-01-10: 初始创建，定义料垛状态等业务枚举
 */

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
// 料垛编号格式：LD-YYYYMMDD-XXXX
export const STACK_CODE_PATTERN = /^LD-\d{8}-\d{4}$/
export const STACK_CODE_FORMAT = 'LD-YYYYMMDD-XXXX'

// ==================== 料垛状态配置（统一配置对象） ====================
export const STACK_STATUS_CONFIG = {
  textMap: STACK_STATUS_TEXT_MAP,
  typeMap: STACK_STATUS_TYPE_MAP
}

