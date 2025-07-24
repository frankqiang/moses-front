/**
 * 工艺路线表格配置
 */
import { parseTime } from '@/utils'

// 局部日期格式化工具函数，以处理无效日期
const formatTableDate = (cellValue) => {
  if (!cellValue) return ''
  const date = new Date(cellValue)
  if (isNaN(date.getTime())) {
    return 'invalid-date'
  }
  return parseTime(cellValue, '{y}-{m}-{d} {h}:{i}')
}

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
    prop: 'createdBy',
    label: '创建人',
    sortable: true,
    minWidth: 120,
    align: 'center'
  },
  {
    prop: 'createdAt',
    label: '创建时间',
    sortable: true,
    minWidth: 160,
    align: 'center',
    type: 'datetime',
    format: '{y}-{m}-{d} {h}:{i}'
  },
  {
    prop: 'updatedBy',
    label: '更新人',
    sortable: true,
    minWidth: 120,
    align: 'center'
  },
  {
    prop: 'updatedAt',
    label: '更新时间',
    sortable: true,
    minWidth: 160,
    align: 'center',
    type: 'datetime',
    format: '{y}-{m}-{d} {h}:{i}'
  },
  {
    prop: 'actions',
    label: '操作',
    minWidth: 230,
    fixed: 'right',
    align: 'center',
    slotName: 'actions',
    showOverflowTooltip: false
  }
]

// 默认可见列
export const DEFAULT_VISIBLE_COLUMNS = [
  'code', 'name', 'version', 'status', 'type', 'applicableProducts', 'createdBy', 'createdAt', 'actions'
]