/**
 * 工序管理枚举常量
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