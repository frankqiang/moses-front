/**
 * 待审批申请表格配置
 * 支持BaseTable组件的完整配置
 */

// 表格列配置 - 原生支持BaseTable组件
export const TABLE_COLUMNS = [
  {
    prop: 'id',
    label: 'ID',
    sortable: true,
    minWidth: 80,
    align: 'center',
    showOverflowTooltip: true
  },
  {
    prop: 'applicantName',
    label: '申请人姓名',
    sortable: 'custom',
    minWidth: 120,
    align: 'center',
    showOverflowTooltip: true
  },
  {
    prop: 'username',
    label: '用户名',
    sortable: false,
    minWidth: 120,
    align: 'center',
    showOverflowTooltip: true
  },
  {
    prop: 'applicantEmail',
    label: '邮箱',
    sortable: 'custom',
    minWidth: 180,
    align: 'center',
    showOverflowTooltip: true
  },
  {
    prop: 'department',
    label: '部门',
    sortable: false,
    minWidth: 120,
    align: 'center',
    showOverflowTooltip: true,
    formatter: (row) => {
      return row.department?.name || '-'
    }
  },
  {
    prop: 'jobTitle',
    label: '职位',
    sortable: false,
    minWidth: 120,
    align: 'center',
    showOverflowTooltip: true
  },
  {
    prop: 'phone',
    label: '电话',
    sortable: false,
    minWidth: 120,
    align: 'center',
    showOverflowTooltip: true
  },
  {
    prop: 'status',
    label: '状态',
    sortable: 'custom',
    minWidth: 100,
    align: 'center',
    type: 'status', // BaseTable内置状态类型
    slotName: 'status', // 使用插槽自定义渲染
    showOverflowTooltip: false
  },
  {
    prop: 'createdAt',
    label: '申请时间',
    sortable: 'custom',
    minWidth: 150,
    align: 'center',
    type: 'datetime', // BaseTable内置时间类型
    format: '{y}-{m}-{d} {h}:{i}', // 时间格式
    showOverflowTooltip: true
  },
  {
    prop: 'applicationReason',
    label: '申请原因',
    sortable: false,
    minWidth: 200,
    align: 'left',
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

// 默认可见列
export const DEFAULT_VISIBLE_COLUMNS = [
  'applicantName', 'username', 'applicantEmail', 'department', 'jobTitle', 'status', 'createdAt', 'actions'
]

// 状态配置 - 可以在组件中引用
export const STATUS_CONFIG = {
  textMap: {
    'pending': '待审批',
    'approved': '已批准',
    'rejected': '已拒绝',
    'unknown': '数据错误'
  },
  typeMap: {
    'pending': 'warning',
    'approved': 'success',
    'rejected': 'danger',
    'unknown': 'info'
  }
}

// 表格行样式配置
export const ROW_CLASS_CONFIG = {
  'rejected': 'row-disabled'
}
