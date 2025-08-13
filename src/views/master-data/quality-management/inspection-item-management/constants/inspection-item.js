/**
 * 检验项目管理常量
 * 创建日期：2024-12-19
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

// 表格列配置
export const TABLE_COLUMNS = [
  {
    prop: 'code',
    label: '检验项目编码',
    sortable: true,
    minWidth: 140,
    align: 'center',
    showOverflowTooltip: true
  },
  {
    prop: 'name',
    label: '检验项目名称',
    sortable: true,
    minWidth: 160,
    align: 'center',
    showOverflowTooltip: true
  },
  {
    prop: 'category',
    label: '检验类别',
    sortable: true,
    minWidth: 120,
    align: 'center',
    slotName: 'category',
    showOverflowTooltip: true
  },
  {
    prop: 'dataType',
    label: '数据类型',
    sortable: true,
    minWidth: 100,
    align: 'center',
    slotName: 'dataType',
    showOverflowTooltip: true
  },
  {
    prop: 'unit',
    label: '单位',
    sortable: false,
    minWidth: 80,
    align: 'center',
    showOverflowTooltip: true
  },
  {
    prop: 'standardValue',
    label: '标准值',
    sortable: false,
    minWidth: 120,
    align: 'center',
    showOverflowTooltip: true
  },
  {
    prop: 'toleranceRange',
    label: '公差范围',
    sortable: false,
    minWidth: 120,
    align: 'center',
    showOverflowTooltip: true
  },
  {
    prop: 'inspectionMethod',
    label: '检验方法',
    sortable: true,
    minWidth: 120,
    align: 'center',
    slotName: 'inspectionMethod',
    showOverflowTooltip: true
  },
  {
    prop: 'applicableProduct',
    label: '适用产品',
    sortable: true,
    minWidth: 120,
    align: 'center',
    slotName: 'applicableProduct',
    showOverflowTooltip: true
  },
  {
    prop: 'status',
    label: '状态',
    sortable: true,
    minWidth: 100,
    align: 'center',
    type: 'status',
    slotName: 'status',
    showOverflowTooltip: false
  },
  {
    prop: 'createdBy',
    label: '创建人',
    sortable: true,
    minWidth: 100,
    align: 'center',
    showOverflowTooltip: true
  },
  {
    prop: 'createdAt',
    label: '创建时间',
    sortable: true,
    minWidth: 150,
    align: 'center',
    type: 'datetime',
    format: '{y}-{m}-{d} {h}:{i}',
    showOverflowTooltip: true
  },
  {
    prop: 'updatedBy',
    label: '更新人',
    sortable: true,
    minWidth: 100,
    align: 'center',
    showOverflowTooltip: true
  },
  {
    prop: 'updatedAt',
    label: '更新时间',
    sortable: true,
    minWidth: 150,
    align: 'center',
    type: 'datetime',
    format: '{y}-{m}-{d} {h}:{i}',
    showOverflowTooltip: true
  },
  {
    prop: 'actions',
    label: '操作',
    minWidth: 200,
    fixed: 'right',
    slotName: 'actions'
  }
]

// 状态配置
export const STATUS_CONFIG = {
  textMap: {
    [INSPECTION_ITEM_STATUS.ACTIVE]: '启用',
    [INSPECTION_ITEM_STATUS.INACTIVE]: '禁用',
    [INSPECTION_ITEM_STATUS.DRAFT]: '草稿'
  },
  typeMap: {
    [INSPECTION_ITEM_STATUS.ACTIVE]: 'success',
    [INSPECTION_ITEM_STATUS.INACTIVE]: 'danger',
    [INSPECTION_ITEM_STATUS.DRAFT]: 'warning'
  }
}

// 默认显示列
export const DEFAULT_VISIBLE_COLUMNS = [
  'code',
  'name',
  'category',
  'dataType',
  'unit',
  'standardValue',
  'toleranceRange',
  'inspectionMethod',
  'applicableProduct',
  'status',
  'actions'
]

// 搜索表单配置
export const SEARCH_FORM_CONFIG = [
  {
    prop: 'keyword',
    label: '关键词',
    type: 'input',
    placeholder: '搜索检验项目编码、名称...',
    class: 'search-item-keyword'
  },
  {
    prop: 'category',
    label: '检验类别',
    type: 'select',
    placeholder: '请选择检验类别',
    options: [
      { value: '', label: '全部' },
      ...INSPECTION_CATEGORY_OPTIONS
    ]
  },
  {
    prop: 'dataType',
    label: '数据类型',
    type: 'select',
    placeholder: '请选择数据类型',
    options: [
      { value: '', label: '全部' },
      ...DATA_TYPE_OPTIONS
    ]
  },
  {
    prop: 'applicableProduct',
    label: '适用产品',
    type: 'select',
    placeholder: '请选择适用产品',
    options: [
      { value: '', label: '全部' },
      ...APPLICABLE_PRODUCT_OPTIONS
    ]
  },
  {
    prop: 'status',
    label: '状态',
    type: 'select',
    placeholder: '请选择状态',
    options: [
      { value: '', label: '全部' },
      ...INSPECTION_ITEM_STATUS_OPTIONS
    ]
  }
]