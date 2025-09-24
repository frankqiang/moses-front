/**
 * 角色管理表格配置
 * 支持BaseTable组件的完整配置
 */

// 表格列配置 - 原生支持BaseTable组件
export const TABLE_COLUMNS = [
  {
    prop: 'name',
    label: '角色名称',
    sortable: true,
    minWidth: 150,
    align: 'left',
    slotName: 'name', // 使用插槽自定义渲染
    showOverflowTooltip: true
  },
  {
    prop: 'code',
    label: '角色编码',
    sortable: true,
    minWidth: 120,
    align: 'center',
    showOverflowTooltip: true
  },
  {
    prop: 'type',
    label: '角色类型',
    sortable: true,
    minWidth: 100,
    align: 'center',
    slotName: 'type', // 使用插槽自定义渲染
    showOverflowTooltip: true
  },
  {
    prop: 'status',
    label: '状态',
    sortable: true,
    minWidth: 80,
    align: 'center',
    type: 'status', // BaseTable内置状态类型
    slotName: 'status', // 使用插槽自定义渲染
    showOverflowTooltip: false
  },
  {
    prop: 'level',
    label: '级别',
    sortable: true,
    minWidth: 80,
    align: 'center',
    slotName: 'level', // 使用插槽自定义渲染
    showOverflowTooltip: false
  },
  {
    prop: 'userCount',
    label: '用户数量',
    sortable: true,
    minWidth: 100,
    align: 'center',
    slotName: 'userCount', // 使用插槽自定义渲染
    showOverflowTooltip: false
  },
  {
    prop: 'description',
    label: '描述',
    sortable: false,
    minWidth: 200,
    align: 'left',
    showOverflowTooltip: true
  },
  {
    prop: 'createdAt',
    label: '创建时间',
    sortable: true,
    minWidth: 160,
    align: 'center',
    type: 'datetime', // BaseTable内置时间类型
    format: '{y}-{m}-{d} {h}:{i}', // 时间格式
    slotName: 'createdAt', // 使用插槽自定义渲染
    showOverflowTooltip: true
  },
  {
    prop: 'actions',
    label: '操作',
    minWidth: 200,
    fixed: 'right',
    slotName: 'actions' // 使用插槽自定义渲染
  }
]

// 默认可见列
export const DEFAULT_VISIBLE_COLUMNS = [
  'name',
  'code',
  'type',
  'status',
  'level',
  'userCount',
  'createdAt',
  'actions'
]

// 状态配置 - 兼容StatusTag组件
export const STATUS_CONFIG = {
  textMap: {
    'active': '启用',
    'inactive': '禁用'
  },
  typeMap: {
    'active': 'success',
    'inactive': 'danger'
  }
}

// 角色类型配置
export const TYPE_CONFIG = {
  textMap: {
    'system': '系统角色',
    'custom': '自定义角色'
  },
  typeMap: {
    'system': 'info',
    'custom': 'primary'
  }
}

// 表格行样式配置
export const ROW_CLASS_CONFIG = {
  'inactive': 'row-disabled'
}

