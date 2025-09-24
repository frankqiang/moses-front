/**
 * 部门管理表格配置
 * 支持BaseTable组件的完整配置
 */

// 表格列配置 - 适配BaseTable组件的树形结构显示
export const TABLE_COLUMNS = [
  {
    prop: 'name',
    label: '部门名称',
    sortable: true,
    minWidth: 200,
    align: 'left',
    showOverflowTooltip: true,
    slotName: 'name' // 使用插槽显示树形结构
  },
  {
    prop: 'code',
    label: '部门编码',
    sortable: true,
    minWidth: 120,
    align: 'center',
    showOverflowTooltip: true
  },
  {
    prop: 'level',
    label: '层级',
    sortable: true,
    minWidth: 80,
    align: 'center',
    showOverflowTooltip: false
  },
  {
    prop: 'manager',
    label: '部门经理',
    sortable: false,
    minWidth: 120,
    align: 'center',
    slotName: 'manager',
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
    prop: 'sortOrder',
    label: '排序',
    sortable: true,
    minWidth: 80,
    align: 'center',
    showOverflowTooltip: false
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
    prop: 'actions',
    label: '操作',
    minWidth: 200,
    fixed: 'right',
    slotName: 'actions'
  }
]

// 默认可见列
export const DEFAULT_VISIBLE_COLUMNS = [
  'name',
  'code',
  'level',
  'manager',
  'status',
  'sortOrder',
  'description',
  'actions'
]

export const TABLE_COLUMN_KEYS = Object.freeze({
  NAME: 'name',
  CODE: 'code',
  LEVEL: 'level',
  MANAGER: 'manager',
  STATUS: 'status',
  SORT_ORDER: 'sortOrder',
  DESCRIPTION: 'description',
  CREATED_AT: 'createdAt',
  ACTIONS: 'actions'
})
