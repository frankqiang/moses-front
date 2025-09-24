/**
 * 工序管理常量
 */

// 工序类型
export const OPERATION_TYPES = {
  PRODUCTION: 'Production',
  INSPECTION: 'Inspection',
  STORAGE: 'Storage',
  MOVE: 'Move',
  PACKING: 'Packing'
}

// 工序类型选项
export const OPERATION_TYPE_OPTIONS = [
  { value: OPERATION_TYPES.PRODUCTION, label: '生产加工' },
  { value: OPERATION_TYPES.INSPECTION, label: '检验' },
  { value: OPERATION_TYPES.STORAGE, label: '存储' },
  { value: OPERATION_TYPES.MOVE, label: '移动' },
  { value: OPERATION_TYPES.PACKING, label: '包装' }
]

// 工序状态
export const OPERATION_STATUS = {
  ENABLED: 'Enabled',
  DISABLED: 'Disabled'
}

// 工序状态选项
export const OPERATION_STATUS_OPTIONS = [
  { value: OPERATION_STATUS.ENABLED, label: '启用' },
  { value: OPERATION_STATUS.DISABLED, label: '禁用' }
]

// 报告点类型
export const REPORTING_POINT_TYPES = {
  START_END: 'Start/End',
  END_ONLY: 'End Only',
  AUTOMATIC: 'Automatic'
}

// 报告点类型选项
export const REPORTING_POINT_OPTIONS = [
  { value: REPORTING_POINT_TYPES.START_END, label: '开始/结束' },
  { value: REPORTING_POINT_TYPES.END_ONLY, label: '仅结束' },
  { value: REPORTING_POINT_TYPES.AUTOMATIC, label: '自动' }
]

// 表格列配置 - 原生支持BaseTable组件
export const TABLE_COLUMNS = [
  {
    prop: 'code',
    label: '工序代码',
    sortable: true,
    minWidth: 120,
    align: 'center',
    showOverflowTooltip: true
  },
  {
    prop: 'name',
    label: '工序名称',
    sortable: true,
    minWidth: 120,
    align: 'center',
    showOverflowTooltip: true
  },
  {
    prop: 'type',
    label: '工序类型',
    sortable: true,
    minWidth: 120,
    align: 'center',
    slotName: 'type', // 使用插槽自定义渲染
    showOverflowTooltip: true
  },
  {
    prop: 'reportingPoint',
    label: '报告点',
    sortable: true,
    minWidth: 120,
    align: 'center',
    slotName: 'reportingPoint', // 使用插槽自定义渲染
    showOverflowTooltip: true
  },
  {
    prop: 'status',
    label: '状态',
    sortable: true,
    minWidth: 100,
    align: 'center',
    type: 'status', // BaseTable内置状态类型
    slotName: 'status', // 使用插槽自定义渲染
    showOverflowTooltip: false
  },
  {
    prop: 'associatedResourceType',
    label: '关联资源',
    sortable: false,
    minWidth: 140,
    align: 'center',
    slotName: 'associatedResourceType', // 使用插槽自定义渲染
    showOverflowTooltip: true
  },
  {
    prop: 'description',
    label: '描述',
    sortable: false,
    minWidth: 180,
    align: 'left',
    showOverflowTooltip: true
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
    type: 'datetime', // BaseTable内置时间类型
    format: '{y}-{m}-{d} {h}:{i}', // 时间格式
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
    type: 'datetime', // BaseTable内置时间类型
    format: '{y}-{m}-{d} {h}:{i}', // 时间格式
    showOverflowTooltip: true
  },
  {
    prop: 'actions',
    label: '操作',
    minWidth: 180,
    fixed: 'right',
    slotName: 'actions' // 使用插槽自定义渲染
  }
]

// 状态配置
export const STATUS_CONFIG = {
  textMap: {
    [OPERATION_STATUS.ENABLED]: '启用',
    [OPERATION_STATUS.DISABLED]: '禁用'
  },
  typeMap: {
    [OPERATION_STATUS.ENABLED]: 'success',
    [OPERATION_STATUS.DISABLED]: 'danger'
  }
}

// 默认可见列
export const DEFAULT_VISIBLE_COLUMNS = [
  'code',
  'name',
  'type',
  'reportingPoint',
  'status',
  'associatedResourceType',
  'description',
  'actions'
]
