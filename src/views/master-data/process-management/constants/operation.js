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

// 表格列配置
export const TABLE_COLUMNS = [
  { prop: 'code', label: '工序代码', sortable: true, minWidth: 120 },
  { prop: 'name', label: '工序名称', sortable: true, minWidth: 120 },
  { prop: 'type', label: '工序类型', sortable: true, minWidth: 120 },
  { prop: 'reportingPoint', label: '报告点', sortable: true, minWidth: 120 },
  { prop: 'status', label: '状态', sortable: true, minWidth: 100 },
  { prop: 'actions', label: '操作', minWidth: 180, fixed: 'right' }
]

// 搜索表单配置
export const SEARCH_FORM_CONFIG = [
  {
    type: 'input',
    prop: 'keyword',
    label: '工序名称/代码',
    placeholder: '请输入工序名称或代码',
    clearable: true
  },
  {
    type: 'select',
    prop: 'type',
    label: '工序类型',
    placeholder: '请选择工序类型',
    clearable: true,
    multiple: true,
    options: OPERATION_TYPE_OPTIONS
  },
  {
    type: 'select',
    prop: 'status',
    label: '状态',
    placeholder: '请选择状态',
    clearable: true,
    multiple: true,
    options: OPERATION_STATUS_OPTIONS
  }
] 