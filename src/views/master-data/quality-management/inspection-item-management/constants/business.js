/**
 * 检验项目管理业务常量
 * 创建日期：2024-12-19
 * 修改记录：
 *   - 2024-12-19: 从 inspection-item.js 重构分离业务常量
 */

// 检验类别
export const INSPECTION_CATEGORIES = {
  APPEARANCE: 'Appearance',
  DIMENSION: 'Dimension',
  PERFORMANCE: 'Performance',
  CHEMICAL: 'Chemical',
  PHYSICAL: 'Physical',
  MECHANICAL: 'Mechanical'
}

// 检验类别选项
export const INSPECTION_CATEGORY_OPTIONS = [
  { value: INSPECTION_CATEGORIES.APPEARANCE, label: '外观检验' },
  { value: INSPECTION_CATEGORIES.DIMENSION, label: '尺寸检验' },
  { value: INSPECTION_CATEGORIES.PERFORMANCE, label: '性能检验' },
  { value: INSPECTION_CATEGORIES.CHEMICAL, label: '化学成分' },
  { value: INSPECTION_CATEGORIES.PHYSICAL, label: '物理性能' },
  { value: INSPECTION_CATEGORIES.MECHANICAL, label: '机械性能' }
]

// 数据类型
export const DATA_TYPES = {
  NUMERIC: 'Numeric',
  TEXT: 'Text',
  BOOLEAN: 'Boolean',
  ENUM: 'Enum',
  RANGE: 'Range'
}

// 数据类型选项
export const DATA_TYPE_OPTIONS = [
  { value: DATA_TYPES.NUMERIC, label: '数值型' },
  { value: DATA_TYPES.TEXT, label: '文本型' },
  { value: DATA_TYPES.BOOLEAN, label: '布尔型' },
  { value: DATA_TYPES.ENUM, label: '枚举型' },
  { value: DATA_TYPES.RANGE, label: '范围型' }
]

// 检验项目状态
export const INSPECTION_ITEM_STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  DRAFT: 'Draft'
}

// 检验项目状态选项
export const INSPECTION_ITEM_STATUS_OPTIONS = [
  { value: INSPECTION_ITEM_STATUS.ACTIVE, label: '启用' },
  { value: INSPECTION_ITEM_STATUS.INACTIVE, label: '禁用' },
  { value: INSPECTION_ITEM_STATUS.DRAFT, label: '草稿' }
]

// 状态配置
export const STATUS_CONFIG = {
  textMap: {
    [INSPECTION_ITEM_STATUS.ACTIVE]: '启用',
    [INSPECTION_ITEM_STATUS.INACTIVE]: '禁用',
    [INSPECTION_ITEM_STATUS.DRAFT]: '草稿',
    // 兼容数字状态值
    1: '启用',
    0: '禁用'
  },
  typeMap: {
    [INSPECTION_ITEM_STATUS.ACTIVE]: 'success',
    [INSPECTION_ITEM_STATUS.INACTIVE]: 'danger',
    [INSPECTION_ITEM_STATUS.DRAFT]: 'warning',
    // 兼容数字状态值
    1: 'success',
    0: 'danger'
  }
}

// 适用产品类型
export const APPLICABLE_PRODUCTS = {
  ALUMINUM_FOIL: 'AluminumFoil',
  ALUMINUM_SHEET: 'AluminumSheet',
  ALUMINUM_COIL: 'AluminumCoil',
  ALL: 'All'
}

// 适用产品选项
export const APPLICABLE_PRODUCT_OPTIONS = [
  { value: APPLICABLE_PRODUCTS.ALUMINUM_FOIL, label: '铝箔' },
  { value: APPLICABLE_PRODUCTS.ALUMINUM_SHEET, label: '铝板' },
  { value: APPLICABLE_PRODUCTS.ALUMINUM_COIL, label: '铝卷' },
  { value: APPLICABLE_PRODUCTS.ALL, label: '全部产品' }
]

// 检验方法
export const INSPECTION_METHODS = {
  MANUAL: 'Manual',
  AUTOMATIC: 'Automatic',
  SEMI_AUTOMATIC: 'SemiAutomatic'
}

// 检验方法选项
export const INSPECTION_METHOD_OPTIONS = [
  { value: INSPECTION_METHODS.MANUAL, label: '人工检验' },
  { value: INSPECTION_METHODS.AUTOMATIC, label: '自动检验' },
  { value: INSPECTION_METHODS.SEMI_AUTOMATIC, label: '半自动检验' }
]
