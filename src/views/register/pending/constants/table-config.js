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
    showOverflowTooltip: true,
    group: 'basic', // 基本信息分组
    priority: 1 // 最高优先级
  },
  {
    prop: 'username',
    label: '用户名',
    sortable: false,
    minWidth: 120,
    align: 'center',
    showOverflowTooltip: true,
    group: 'basic', // 基本信息分组
    priority: 1 // 最高优先级
  },
  {
    prop: 'applicantEmail',
    label: '邮箱',
    sortable: 'custom',
    minWidth: 180,
    align: 'center',
    showOverflowTooltip: true,
    group: 'basic', // 基本信息分组
    priority: 1 // 最高优先级
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
    },
    group: 'work', // 工作信息分组
    priority: 1 // 最高优先级
  },
  {
    prop: 'jobTitle',
    label: '职位',
    sortable: false,
    minWidth: 120,
    align: 'center',
    showOverflowTooltip: true,
    group: 'work', // 工作信息分组
    priority: 1 // 最高优先级
  },
  {
    prop: 'positionId',
    label: '岗位',
    sortable: false,
    minWidth: 120,
    align: 'center',
    showOverflowTooltip: true,
    formatter: (row) => {
      return row.position?.name || '-'
    },
    group: 'work', // 工作信息分组
    priority: 2 // 显示优先级
  },
  {
    prop: 'phone',
    label: '电话',
    sortable: false,
    minWidth: 120,
    align: 'center',
    showOverflowTooltip: true,
    group: 'basic', // 基本信息分组
    priority: 1 // 最高优先级
  },
  {
    prop: 'hireDate',
    label: '入职日期',
    sortable: false,
    minWidth: 120,
    align: 'center',
    type: 'date', // BaseTable内置日期类型
    format: '{y}-{m}-{d}', // 日期格式
    showOverflowTooltip: true,
    group: 'work', // 工作信息分组
    priority: 2 // 显示优先级
  },
  {
    prop: 'birthDate',
    label: '出生日期',
    sortable: false,
    minWidth: 120,
    align: 'center',
    type: 'date', // BaseTable内置日期类型
    format: '{y}-{m}-{d}', // 日期格式
    showOverflowTooltip: true,
    group: 'personal', // 个人信息分组
    priority: 3 // 显示优先级较低
  },
  {
    prop: 'gender',
    label: '性别',
    sortable: false,
    minWidth: 80,
    align: 'center',
    showOverflowTooltip: true,
    formatter: (row) => {
      const genderMap = {
        'male': '男',
        'female': '女',
        'other': '其他'
      }
      return genderMap[row.gender] || '-'
    },
    group: 'personal', // 个人信息分组
    priority: 3 // 显示优先级较低
  },
  {
    prop: 'address',
    label: '家庭住址',
    sortable: false,
    minWidth: 200,
    align: 'left',
    showOverflowTooltip: true,
    group: 'personal', // 个人信息分组
    priority: 4 // 显示优先级最低
  },
  {
    prop: 'emergencyContact',
    label: '紧急联系人',
    sortable: false,
    minWidth: 120,
    align: 'center',
    showOverflowTooltip: true,
    group: 'emergency', // 紧急联系信息分组
    priority: 3 // 显示优先级较低
  },
  {
    prop: 'emergencyPhone',
    label: '紧急联系电话',
    sortable: false,
    minWidth: 130,
    align: 'center',
    showOverflowTooltip: true,
    group: 'emergency', // 紧急联系信息分组
    priority: 3 // 显示优先级较低
  },
  {
    prop: 'managerId',
    label: '直属上级',
    sortable: false,
    minWidth: 120,
    align: 'center',
    showOverflowTooltip: true,
    formatter: (row) => {
      return row.manager?.name || '-'
    },
    group: 'work', // 工作信息分组
    priority: 2 // 显示优先级
  },
  {
    prop: 'status',
    label: '状态',
    sortable: 'custom',
    minWidth: 100,
    align: 'center',
    type: 'status', // BaseTable内置状态类型
    slotName: 'status', // 使用插槽自定义渲染
    showOverflowTooltip: false,
    group: 'status', // 状态信息分组
    priority: 1 // 最高优先级
  },
  {
    prop: 'createdAt',
    label: '申请时间',
    sortable: 'custom',
    minWidth: 150,
    align: 'center',
    type: 'datetime', // BaseTable内置时间类型
    format: '{y}-{m}-{d} {h}:{i}', // 时间格式
    showOverflowTooltip: true,
    group: 'status', // 状态信息分组
    priority: 1 // 最高优先级
  },
  {
    prop: 'applicationReason',
    label: '申请原因',
    sortable: false,
    minWidth: 200,
    align: 'left',
    showOverflowTooltip: true,
    group: 'other', // 其他信息分组
    priority: 2 // 显示优先级
  },
  {
    prop: 'actions',
    label: '操作',
    minWidth: 180,
    fixed: 'right',
    slotName: 'actions', // 使用插槽自定义渲染
    group: 'actions', // 操作分组
    priority: 1 // 最高优先级
  }
]

// 默认可见列（优先显示业务关键信息）
export const DEFAULT_VISIBLE_COLUMNS = [
  'applicantName', 'username', 'applicantEmail', 'department', 'jobTitle', 'phone', 'status', 'createdAt', 'actions'
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

// 列分组配置
export const COLUMN_GROUPS = {
  basic: {
    label: '基本信息',
    description: '申请人的姓名、用户名、邮箱、电话等基础联系信息'
  },
  work: {
    label: '工作信息',
    description: '部门、职位、岗位、入职日期、直属上级等工作相关信息'
  },
  personal: {
    label: '个人信息',
    description: '性别、出生日期、家庭住址等个人详细信息'
  },
  emergency: {
    label: '紧急联系',
    description: '紧急联系人及联系方式'
  },
  status: {
    label: '状态信息',
    description: '申请状态、申请时间等流程相关信息'
  },
  other: {
    label: '其他信息',
    description: '申请原因等补充信息'
  },
  actions: {
    label: '操作',
    description: '审批操作按钮'
  }
}

// 列优先级配置
export const COLUMN_PRIORITIES = {
  1: '高优先级（默认显示）',
  2: '中优先级（可选显示）',
  3: '低优先级（按需显示）',
  4: '最低优先级（详细信息）'
}
