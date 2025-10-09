/**
 * 文件名称：bin-specification.js
 * 文件描述：料框规格管理模块基础常量定义
 * 创建日期：2025-01-09
 * 修改记录：
 *   - 2025-01-09: 初始创建，定义规格状态、尺寸范围等业务枚举
 */

// 规格状态
export const SPECIFICATION_STATUS = {
  ENABLED: '启用',
  DISABLED: '禁用'
}

// 规格状态选项
export const SPECIFICATION_STATUS_OPTIONS = [
  { value: SPECIFICATION_STATUS.ENABLED, label: '启用' },
  { value: SPECIFICATION_STATUS.DISABLED, label: '禁用' }
]

// 规格状态配置（用于StatusTag组件）
export const STATUS_CONFIG = {
  textMap: {
    [SPECIFICATION_STATUS.ENABLED]: '启用',
    [SPECIFICATION_STATUS.DISABLED]: '禁用'
  },
  typeMap: {
    [SPECIFICATION_STATUS.ENABLED]: 'success',
    [SPECIFICATION_STATUS.DISABLED]: 'info'
  }
}

// 长度范围（单位cm）
export const LENGTH_LIMITS = {
  MIN: 0.01,
  MAX: 10000,
  PRECISION: 2,
  STEP: 0.01
}

// 宽度范围（单位cm）
export const WIDTH_LIMITS = {
  MIN: 0.01,
  MAX: 10000,
  PRECISION: 2,
  STEP: 0.01
}

// 高度范围（单位cm）
export const HEIGHT_LIMITS = {
  MIN: 0.01,
  MAX: 10000,
  PRECISION: 2,
  STEP: 0.01
}

// 最大载重范围（单位kg）
export const MAX_LOAD_CAPACITY_LIMITS = {
  MIN: 0.01,
  MAX: 100000,
  PRECISION: 2,
  STEP: 0.01
}

// 最大堆叠层数范围
export const MAX_STACK_LAYERS_LIMITS = {
  MIN: 1,
  MAX: 100,
  STEP: 1
}

// 数值字段的国际化单位描述
export const UNIT_DISPLAY = {
  length: 'cm',
  width: 'cm',
  height: 'cm',
  maxLoadCapacity: 'kg',
  maxStackLayers: '层'
}

// 默认排序
export const DEFAULT_SORT = 'createdAt:desc'

// 默认分页参数
export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 20
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
  'specCode',
  'specName',
  'material',
  'status',
  'createdAt',
  'updatedAt'
]

// 是否支持多规格区间筛选
export const SPEC_RANGE_FIELDS = {
  length: true,
  width: true,
  height: true
}

// 常用材质选项（实际应从后端获取或从已有数据中提取）
export const MATERIAL_OPTIONS = [
  { value: '钢材', label: '钢材' },
  { value: '不锈钢', label: '不锈钢' },
  { value: '塑料', label: '塑料' },
  { value: '木材', label: '木材' },
  { value: '铝合金', label: '铝合金' }
]

