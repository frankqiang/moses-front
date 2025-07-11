/**
 * 工艺路线表格配置
 */

export const TABLE_COLUMNS = [
  {
    prop: 'code',
    label: '路线代码',
    sortable: true,
    minWidth: 180,
    align: 'center',
    showOverflowTooltip: true
  },
  {
    prop: 'name',
    label: '路线名称',
    sortable: true,
    minWidth: 200,
    align: 'left',
    showOverflowTooltip: true
  },
  {
    prop: 'version',
    label: '版本',
    sortable: true,
    minWidth: 80,
    align: 'center',
    formatter: (row) => `v${row.version}`
  },
  {
    prop: 'status',
    label: '状态',
    sortable: true,
    minWidth: 100,
    align: 'center',
    slotName: 'status'
  },
  {
    prop: 'type',
    label: '路线类型',
    sortable: true,
    minWidth: 120,
    align: 'center',
    slotName: 'type'
  },
  {
    prop: 'applicableProducts',
    label: '适用产品',
    minWidth: 250,
    align: 'left',
    slotName: 'applicableProducts'
  },
  {
    prop: 'actions',
    label: '操作',
    minWidth: 230,
    fixed: 'right',
    align: 'center',
    slotName: 'actions'
  }
]

// 默认可见列
export const DEFAULT_VISIBLE_COLUMNS = [
  'code', 'name', 'version', 'status', 'type', 'applicableProducts', 'actions'
] 