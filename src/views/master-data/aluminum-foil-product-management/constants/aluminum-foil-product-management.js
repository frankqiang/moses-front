/**
 * 文件名称：aluminum-foil-product-management.js
 * 文件描述：铝箔产品管理模块基础常量定义
 * 创建日期：2025-09-26
 * 修改记录：
 *   - 2025-09-26: 初始创建，定义生命周期状态、单位类型等业务枚举
 */

// 产品生命周期状态
export const LIFECYCLE_STATUS = {
  TRIAL: '试产',
  MASS: '量产',
  RETIRED: '停产'
}

// 产品生命周期状态选项
export const LIFECYCLE_STATUS_OPTIONS = [
  { value: LIFECYCLE_STATUS.TRIAL, label: '试产' },
  { value: LIFECYCLE_STATUS.MASS, label: '量产' },
  { value: LIFECYCLE_STATUS.RETIRED, label: '停产' }
]

// 单位重量类型
export const UNIT_WEIGHT_TYPES = {
  PER_COIL: 'kg/卷',
  PER_SQUARE_METER: 'kg/m²'
}

// 单位重量类型选项
export const UNIT_WEIGHT_TYPE_OPTIONS = [
  { value: UNIT_WEIGHT_TYPES.PER_COIL, label: 'kg/卷' },
  { value: UNIT_WEIGHT_TYPES.PER_SQUARE_METER, label: 'kg/m²' }
]

// 厚度范围（单位mm）
export const THICKNESS_LIMITS = {
  MIN: 0.001,
  MAX: 100,
  PRECISION: 6,
  STEP: 0.001
}

// 宽度范围（单位mm）
export const WIDTH_LIMITS = {
  MIN: 1,
  MAX: 10000,
  PRECISION: 3,
  STEP: 1
}

// 单位重量范围（单位kg）
export const UNIT_WEIGHT_LIMITS = {
  MIN: 0.001,
  MAX: 10000,
  PRECISION: 6,
  STEP: 0.1
}

// 数值字段的国际化单位描述
export const UNIT_DISPLAY = {
  thickness: 'mm',
  width: 'mm',
  unitWeight: 'kg'
}

export const LIFECYCLE_STATUS_CONFIG = {
  textMap: {
    [LIFECYCLE_STATUS.TRIAL]: '试产',
    [LIFECYCLE_STATUS.MASS]: '量产',
    [LIFECYCLE_STATUS.RETIRED]: '停产'
  },
  typeMap: {
    [LIFECYCLE_STATUS.TRIAL]: 'warning',
    [LIFECYCLE_STATUS.MASS]: 'success',
    [LIFECYCLE_STATUS.RETIRED]: 'info'
  }
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
  'productCode',
  'productName',
  'lifecycleStatus',
  'thickness',
  'width',
  'unitWeight',
  'createdAt',
  'updatedAt'
]

// 是否支持多规格区间筛选
export const SPEC_RANGE_FIELDS = {
  thickness: true,
  width: true
}

