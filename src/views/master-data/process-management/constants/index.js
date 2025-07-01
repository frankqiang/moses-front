/**
 * 工序管理模块常量定义
 * 描述：定义工序管理相关的枚举值、配置项和验证规则
 * 创建日期：2024-10-28
 */

// ================== 枚举定义 ==================

// 工序类型枚举
export const OPERATION_TYPES = {
  PRODUCTION: '生产加工',
  INSPECTION: '检验',
  STORAGE: '仓储/移动',
  PACKAGING: '包装'
}

// 状态枚举
export const STATUS = {
  ENABLED: '启用',
  DISABLED: '禁用'
}

// 工艺路线状态枚举
export const ROUTING_STATUS = {
  DRAFT: '草稿',
  ACTIVE: '生效',
  HISTORY: '历史'
}

// ================== 状态颜色映射 ==================

// 工序状态颜色映射
export const OPERATION_STATUS_COLORS = {
  [STATUS.ENABLED]: 'success',
  [STATUS.DISABLED]: 'danger'
}

// 工艺路线状态颜色映射
export const ROUTING_STATUS_COLORS = {
  [ROUTING_STATUS.DRAFT]: 'info',
  [ROUTING_STATUS.ACTIVE]: 'success',
  [ROUTING_STATUS.HISTORY]: 'warning'
}

// ================== 默认值定义 ==================

// 基础工序默认值
export const OPERATION_DEFAULT_VALUES = {
  operation_code: '',
  operation_name: '',
  operation_type: OPERATION_TYPES.PRODUCTION,
  description: '',
  status: STATUS.ENABLED
}

// 工艺路线默认值
export const ROUTING_DEFAULT_VALUES = {
  routing_code: '',
  routing_name: '',
  version: 'v1.0',
  status: ROUTING_STATUS.DRAFT,
  applicable_products: [],
  description: ''
}

// 工序步骤默认值
export const ROUTING_STEP_DEFAULT_VALUES = {
  step_number: 10,
  operation_code: '',
  operation_name: '',
  next_step_number: null,
  on_failure_step_number: null,
  description: ''
}

// ================== 选项数据 ==================

// 工序类型选项
export const OPERATION_TYPE_OPTIONS = Object.keys(OPERATION_TYPES).map(key => ({
  value: OPERATION_TYPES[key],
  label: OPERATION_TYPES[key]
}))

// 工艺路线状态选项
export const ROUTING_STATUS_OPTIONS = Object.keys(ROUTING_STATUS).map(key => ({
  value: ROUTING_STATUS[key],
  label: ROUTING_STATUS[key]
})) 