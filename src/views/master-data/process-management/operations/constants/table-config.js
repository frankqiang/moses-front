/**
 * 工序管理表格配置
 * 支持BaseTable组件的完整配置
 */

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
  }
]

// 默认可见列
export const DEFAULT_VISIBLE_COLUMNS = [
  'code', 'name', 'type', 'reportingPoint', 'status', 'associatedResourceType'
]

// 状态配置 - 可以在组件中引用
export const STATUS_CONFIG = {
  textMap: {
    'Enabled': '启用',
    'Disabled': '禁用'
  },
  typeMap: {
    'Enabled': 'success',
    'Disabled': 'info'
  }
}

// 表格行样式配置
export const ROW_CLASS_CONFIG = {
  'Disabled': 'row-disabled'
}
