/**
 * 岗位管理常量配置
 * 创建日期：2024-01-20
 * 说明：定义岗位管理相关的常量、配置和映射关系
 */

// 岗位状态
export const POSITION_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive'
}

// 岗位状态选项
export const POSITION_STATUS_OPTIONS = [
  { value: POSITION_STATUS.ACTIVE, label: '启用' },
  { value: POSITION_STATUS.INACTIVE, label: '禁用' }
]

// 岗位类型
export const POSITION_TYPE = {
  MANAGEMENT: 'management',
  TECHNICAL: 'technical',
  OPERATIONAL: 'operational',
  SUPPORT: 'support'
}

// 岗位类型选项
export const POSITION_TYPE_OPTIONS = [
  { value: POSITION_TYPE.MANAGEMENT, label: '管理类' },
  { value: POSITION_TYPE.TECHNICAL, label: '技术类' },
  { value: POSITION_TYPE.OPERATIONAL, label: '业务类' },
  { value: POSITION_TYPE.SUPPORT, label: '支持类' }
]

// 状态配置
export const STATUS_CONFIG = {
  textMap: {
    [POSITION_STATUS.ACTIVE]: '启用',
    [POSITION_STATUS.INACTIVE]: '禁用'
  },
  typeMap: {
    [POSITION_STATUS.ACTIVE]: 'success',
    [POSITION_STATUS.INACTIVE]: 'danger'
  }
}

// 搜索表单配置
export const SEARCH_FORM_CONFIG = [
  {
    type: 'input',
    prop: 'keyword',
    label: '关键词',
    placeholder: '请输入岗位名称或编码',
    clearable: true,
    style: { width: '200px' }
  },
  {
    type: 'select',
    prop: 'status',
    label: '状态',
    placeholder: '请选择状态',
    clearable: true,
    options: [
      { label: '全部', value: '' },
      ...POSITION_STATUS_OPTIONS
    ],
    style: { width: '120px' }
  },
  {
    type: 'select',
    prop: 'type',
    label: '岗位类型',
    placeholder: '请选择类型',
    clearable: true,
    options: [
      { label: '全部', value: '' },
      ...POSITION_TYPE_OPTIONS
    ],
    style: { width: '120px' }
  },
  {
    type: 'select',
    prop: 'departmentId',
    label: '所属部门',
    placeholder: '请选择部门',
    clearable: true,
    filterable: true,
    options: [], // 动态加载
    style: { width: '150px' }
  }
]

// 表格列配置 - 适配BaseTable组件
export const TABLE_COLUMNS = [
  {
    prop: 'name',
    label: '岗位名称',
    sortable: true,
    minWidth: 150,
    align: 'left',
    showOverflowTooltip: true
  },
  {
    prop: 'code',
    label: '岗位编码',
    sortable: true,
    minWidth: 120,
    align: 'center',
    showOverflowTooltip: true
  },
  {
    prop: 'type',
    label: '岗位类型',
    sortable: true,
    minWidth: 100,
    align: 'center',
    slotName: 'type',
    showOverflowTooltip: true
  },
  {
    prop: 'department',
    label: '所属部门',
    sortable: false,
    minWidth: 120,
    align: 'center',
    slotName: 'department',
    showOverflowTooltip: true
  },
  {
    prop: 'level',
    label: '岗位级别',
    sortable: true,
    minWidth: 100,
    align: 'center',
    showOverflowTooltip: false
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
    label: '岗位职责',
    sortable: false,
    minWidth: 200,
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
    minWidth: 180,
    fixed: 'right',
    slotName: 'actions'
  }
]

// 默认可见列
export const DEFAULT_VISIBLE_COLUMNS = [
  'name',
  'code',
  'type',
  'department',
  'level',
  'status',
  'sortOrder',
  'description',
  'actions'
]

// 工具栏按钮配置
export const TOOLBAR_BUTTONS = [
  {
    text: '新增岗位',
    icon: 'el-icon-plus',
    type: 'primary',
    action: 'create',
    permission: 'manageOrganization'
  }
]

// 操作按钮配置
export const ACTION_BUTTONS = {
  view: {
    text: '查看',
    icon: 'el-icon-view',
    type: 'text',
    permission: 'getPositions'
  },
  edit: {
    text: '编辑',
    icon: 'el-icon-edit',
    type: 'text',
    permission: 'manageOrganization'
  },
  toggleStatus: {
    text: '切换状态',
    icon: 'el-icon-switch-button',
    type: 'text',
    permission: 'manageOrganization'
  },
  delete: {
    text: '删除',
    icon: 'el-icon-delete',
    type: 'text',
    style: { color: '#f56c6c' },
    permission: 'manageOrganization'
  }
}

// 表单验证规则
export const FORM_RULES = {
  name: [
    { required: true, message: '请输入岗位名称', trigger: 'blur' },
    { min: 1, max: 100, message: '岗位名称长度在 1 到 100 个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入岗位编码', trigger: 'blur' },
    { min: 1, max: 50, message: '岗位编码长度在 1 到 50 个字符', trigger: 'blur' },
    { pattern: /^[A-Z0-9_-]+$/, message: '岗位编码只能包含大写字母、数字、下划线和连字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择岗位类型', trigger: 'change' }
  ],
  departmentId: [
    { required: true, message: '请选择所属部门', trigger: 'change' }
  ],
  level: [
    { type: 'number', min: 1, max: 20, message: '岗位级别必须在 1 到 20 之间', trigger: 'blur' }
  ],
  description: [
    { max: 1000, message: '岗位职责不能超过 1000 个字符', trigger: 'blur' }
  ],
  sortOrder: [
    { type: 'number', min: 0, max: 9999, message: '排序顺序必须在 0 到 9999 之间', trigger: 'blur' }
  ]
}

// 表单字段配置
export const FORM_SECTIONS = [
  {
    title: '基本信息',
    icon: 'el-icon-info',
    fields: [
      {
        prop: 'name',
        label: '岗位名称',
        type: 'input',
        placeholder: '请输入岗位名称',
        maxlength: 100,
        showWordLimit: true,
        required: true
      },
      {
        prop: 'code',
        label: '岗位编码',
        type: 'input',
        placeholder: '请输入岗位编码，将自动转为大写',
        maxlength: 50,
        showWordLimit: true,
        required: true,
        transform: 'uppercase'
      },
      {
        prop: 'type',
        label: '岗位类型',
        type: 'select',
        placeholder: '请选择岗位类型',
        options: POSITION_TYPE_OPTIONS,
        required: true
      },
      {
        prop: 'description',
        label: '岗位职责',
        type: 'textarea',
        placeholder: '请输入岗位职责描述（可选）',
        maxlength: 1000,
        showWordLimit: true,
        rows: 4
      }
    ]
  },
  {
    title: '组织关系',
    icon: 'el-icon-connection',
    fields: [
      {
        prop: 'departmentId',
        label: '所属部门',
        type: 'select',
        placeholder: '请选择所属部门',
        clearable: false,
        filterable: true,
        options: [], // 动态加载
        required: true
      },
      {
        prop: 'level',
        label: '岗位级别',
        type: 'number',
        placeholder: '岗位级别',
        min: 1,
        max: 20,
        tip: '数值越小级别越高，用于岗位层级管理'
      },
      {
        prop: 'sortOrder',
        label: '排序顺序',
        type: 'number',
        placeholder: '排序顺序',
        min: 0,
        max: 9999,
        tip: '数值越小排序越靠前，用于同部门岗位的显示顺序'
      }
    ]
  },
  {
    title: '状态设置',
    icon: 'el-icon-setting',
    fields: [
      {
        prop: 'status',
        label: '岗位状态',
        type: 'radio',
        options: POSITION_STATUS_OPTIONS,
        tip: '禁用的岗位将不能分配员工，也不会在选择器中显示'
      }
    ]
  }
]

// 导出API配置
export const EXPORT_CONFIG = {
  api: '/v1/positions/export',
  filename: '岗位列表',
  headers: [
    { key: 'name', label: '岗位名称' },
    { key: 'code', label: '岗位编码' },
    { key: 'type', label: '岗位类型' },
    { key: 'department.name', label: '所属部门' },
    { key: 'level', label: '岗位级别' },
    { key: 'status', label: '状态' },
    { key: 'sortOrder', label: '排序' },
    { key: 'description', label: '岗位职责' },
    { key: 'createdAt', label: '创建时间' }
  ]
}
