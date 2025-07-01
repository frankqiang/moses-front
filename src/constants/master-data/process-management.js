/**
 * 工序管理模块常量定义
 * 描述：定义工序管理相关的枚举值、配置项和验证规则
 * 创建日期：2024-10-28
 */

// ================== 枚举定义 ==================

// 工序类型枚举
export const OPERATION_TYPES = {
  PRODUCTION: '生产加工',
  INSPECTION: '检验',
  STORAGE: '仓储/移动',
  PACKAGING: '包装'
}

// 状态枚举
export const STATUS = {
  ENABLED: '启用',
  DISABLED: '禁用'
}

// 工艺路线状态枚举
export const ROUTING_STATUS = {
  DRAFT: '草稿',
  ACTIVE: '生效',
  HISTORY: '历史'
}

// ================== 表格列配置 ==================

// 基础工序表格列配置
export const OPERATION_TABLE_COLUMNS = [
  {
    prop: 'operation_code',
    label: '工序代码',
    width: 140,
    fixed: 'left',
    sortable: true
  },
  {
    prop: 'operation_name',
    label: '工序名称',
    width: 150,
    showOverflowTooltip: true
  },
  {
    prop: 'operation_type',
    label: '工序类型',
    width: 120,
    formatter: (row) => OPERATION_TYPES[row.operation_type] || row.operation_type
  },
  {
    prop: 'description',
    label: '工序描述',
    minWidth: 200,
    showOverflowTooltip: true
  },
  {
    prop: 'status',
    label: '状态',
    width: 80,
    align: 'center'
  },
  {
    prop: 'create_time',
    label: '创建时间',
    width: 150,
    sortable: true
  },
  {
    prop: 'update_time',
    label: '更新时间',
    width: 150,
    sortable: true
  }
]

// 工艺路线表格列配置
export const ROUTING_TABLE_COLUMNS = [
  {
    prop: 'routing_code',
    label: '路线代码',
    width: 150,
    fixed: 'left',
    sortable: true
  },
  {
    prop: 'routing_name',
    label: '路线名称',
    width: 180,
    showOverflowTooltip: true
  },
  {
    prop: 'version',
    label: '版本号',
    width: 90,
    align: 'center',
    sortable: true
  },
  {
    prop: 'status',
    label: '状态',
    width: 80,
    align: 'center'
  },
  {
    prop: 'applicable_products',
    label: '适用产品',
    minWidth: 200,
    showOverflowTooltip: true,
    formatter: (row) => Array.isArray(row.applicable_products) 
      ? row.applicable_products.join(', ') 
      : row.applicable_products
  },
  {
    prop: 'description',
    label: '描述',
    minWidth: 150,
    showOverflowTooltip: true
  },
  {
    prop: 'create_user',
    label: '创建人',
    width: 100
  },
  {
    prop: 'create_time',
    label: '创建时间',
    width: 150,
    sortable: true
  },
  {
    prop: 'update_user',
    label: '更新人',
    width: 100
  },
  {
    prop: 'update_time',
    label: '更新时间',
    width: 150,
    sortable: true
  }
]

// 工序步骤表格列配置
export const ROUTING_STEPS_TABLE_COLUMNS = [
  {
    prop: 'step_number',
    label: '步骤号',
    width: 80,
    align: 'center',
    sortable: true
  },
  {
    prop: 'operation_code',
    label: '工序代码',
    width: 140
  },
  {
    prop: 'operation_name',
    label: '工序名称',
    width: 150,
    showOverflowTooltip: true
  },
  {
    prop: 'next_step_number',
    label: '下一步骤',
    width: 90,
    align: 'center',
    formatter: (row) => row.next_step_number || '-'
  },
  {
    prop: 'on_failure_step_number',
    label: '异常跳转',
    width: 90,
    align: 'center',
    formatter: (row) => row.on_failure_step_number || '-'
  },
  {
    prop: 'description',
    label: '步骤描述',
    minWidth: 200,
    showOverflowTooltip: true
  }
]

// ================== 表单验证规则 ==================

// 基础工序表单验证规则
export const OPERATION_FORM_RULES = {
  operation_code: [
    { required: true, message: '请输入工序代码', trigger: 'blur' },
    { min: 2, max: 20, message: '工序代码长度在2到20个字符', trigger: 'blur' },
    { pattern: /^[A-Z][A-Z0-9_]*$/, message: '工序代码必须以大写字母开头，只能包含大写字母、数字和下划线', trigger: 'blur' }
  ],
  operation_name: [
    { required: true, message: '请输入工序名称', trigger: 'blur' },
    { min: 2, max: 50, message: '工序名称长度在2到50个字符', trigger: 'blur' }
  ],
  operation_type: [
    { required: true, message: '请选择工序类型', trigger: 'change' }
  ],
  description: [
    { max: 500, message: '工序描述不能超过500个字符', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择工序状态', trigger: 'change' }
  ]
}

// 工艺路线表单验证规则
export const ROUTING_FORM_RULES = {
  routing_code: [
    { required: true, message: '请输入路线代码', trigger: 'blur' },
    { min: 3, max: 30, message: '路线代码长度在3到30个字符', trigger: 'blur' },
    { pattern: /^RT-[A-Z0-9-]+$/, message: '路线代码必须以RT-开头，只能包含大写字母、数字和连字符', trigger: 'blur' }
  ],
  routing_name: [
    { required: true, message: '请输入路线名称', trigger: 'blur' },
    { min: 2, max: 100, message: '路线名称长度在2到100个字符', trigger: 'blur' }
  ],
  version: [
    { required: true, message: '请输入版本号', trigger: 'blur' },
    { pattern: /^v\d+\.\d+$/, message: '版本号格式应为v1.0形式', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择路线状态', trigger: 'change' }
  ],
  description: [
    { max: 500, message: '路线描述不能超过500个字符', trigger: 'blur' }
  ]
}

// ================== 状态颜色映射 ==================

// 工序状态颜色映射
export const OPERATION_STATUS_COLORS = {
  [STATUS.ENABLED]: 'success',
  [STATUS.DISABLED]: 'danger'
}

// 工艺路线状态颜色映射
export const ROUTING_STATUS_COLORS = {
  [ROUTING_STATUS.DRAFT]: 'info',
  [ROUTING_STATUS.ACTIVE]: 'success',
  [ROUTING_STATUS.HISTORY]: 'warning'
}

// ================== 默认值定义 ==================

// 基础工序默认值
export const OPERATION_DEFAULT_VALUES = {
  operation_code: '',
  operation_name: '',
  operation_type: OPERATION_TYPES.PRODUCTION,
  description: '',
  status: STATUS.ENABLED
}

// 工艺路线默认值
export const ROUTING_DEFAULT_VALUES = {
  routing_code: '',
  routing_name: '',
  version: 'v1.0',
  status: ROUTING_STATUS.DRAFT,
  applicable_products: [],
  description: ''
}

// 工序步骤默认值
export const ROUTING_STEP_DEFAULT_VALUES = {
  step_number: 10,
  operation_code: '',
  operation_name: '',
  next_step_number: null,
  on_failure_step_number: null,
  description: ''
}

// ================== 选项数据 ==================

// 工序类型选项
export const OPERATION_TYPE_OPTIONS = Object.keys(OPERATION_TYPES).map(key => ({
  value: OPERATION_TYPES[key],
  label: OPERATION_TYPES[key]
}))

// 状态选项
export const STATUS_OPTIONS = Object.keys(STATUS).map(key => ({
  value: STATUS[key],
  label: STATUS[key]
}))

// 工艺路线状态选项
export const ROUTING_STATUS_OPTIONS = Object.keys(ROUTING_STATUS).map(key => ({
  value: ROUTING_STATUS[key],
  label: ROUTING_STATUS[key]
}))

// ================== 业务配置 ==================

// 分页配置
export const PAGINATION_CONFIG = {
  page: 1,
  limit: 10,
  pageSizes: [10, 20, 50, 100],
  layout: 'total, sizes, prev, pager, next, jumper'
}

// 搜索配置
export const SEARCH_CONFIG = {
  placeholder: {
    operation: '请输入工序代码或名称',
    routing: '请输入路线代码或名称'
  },
  debounceTime: 300
}

// 导出配置
export const EXPORT_CONFIG = {
  operation: {
    filename: '基础工序数据',
    headers: ['工序代码', '工序名称', '工序类型', '工序描述', '状态', '创建时间', '更新时间']
  },
  routing: {
    filename: '工艺路线数据',
    headers: ['路线代码', '路线名称', '版本号', '状态', '适用产品', '描述', '创建人', '创建时间']
  }
} 