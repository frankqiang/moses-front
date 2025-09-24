/**
 * 部门管理常量配置
 * 创建日期：2024-01-20
 * 说明：定义部门管理相关的常量、配置和映射关系
 */

// 部门状态
export const DEPARTMENT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive'
}

// 部门状态选项
export const DEPARTMENT_STATUS_OPTIONS = [
  { value: DEPARTMENT_STATUS.ACTIVE, label: '启用' },
  { value: DEPARTMENT_STATUS.INACTIVE, label: '禁用' }
]

// 状态配置
export const STATUS_CONFIG = {
  textMap: {
    [DEPARTMENT_STATUS.ACTIVE]: '启用',
    [DEPARTMENT_STATUS.INACTIVE]: '禁用'
  },
  typeMap: {
    [DEPARTMENT_STATUS.ACTIVE]: 'success',
    [DEPARTMENT_STATUS.INACTIVE]: 'danger'
  }
}

// 搜索表单配置
export const SEARCH_FORM_CONFIG = [
  {
    type: 'input',
    prop: 'keyword',
    label: '关键词',
    placeholder: '请输入部门名称或编码',
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
      ...DEPARTMENT_STATUS_OPTIONS
    ],
    style: { width: '120px' }
  },
  {
    type: 'select',
    prop: 'parentId',
    label: '上级部门',
    placeholder: '请选择上级部门',
    clearable: true,
    filterable: true,
    options: [], // 动态加载
    style: { width: '150px' }
  }
]

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

// 工具栏按钮配置
export const TOOLBAR_BUTTONS = [
  {
    text: '新增部门',
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
    permission: 'getDepartments'
  },
  edit: {
    text: '编辑',
    icon: 'el-icon-edit',
    type: 'text',
    permission: 'manageOrganization'
  },
  createChild: {
    text: '新增子部门',
    icon: 'el-icon-plus',
    type: 'text',
    permission: 'manageOrganization'
  },
  toggleStatus: {
    text: '切换状态',
    icon: 'el-icon-switch-button',
    type: 'text',
    permission: 'manageOrganization'
  },
  setManager: {
    text: '设置经理',
    icon: 'el-icon-user',
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
    { required: true, message: '请输入部门名称', trigger: 'blur' },
    { min: 1, max: 100, message: '部门名称长度在 1 到 100 个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入部门编码', trigger: 'blur' },
    { min: 1, max: 50, message: '部门编码长度在 1 到 50 个字符', trigger: 'blur' },
    { pattern: /^[A-Z0-9_-]+$/, message: '部门编码只能包含大写字母、数字、下划线和连字符', trigger: 'blur' }
  ],
  description: [
    { max: 1000, message: '部门描述不能超过 1000 个字符', trigger: 'blur' }
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
        label: '部门名称',
        type: 'input',
        placeholder: '请输入部门名称',
        maxlength: 100,
        showWordLimit: true,
        required: true
      },
      {
        prop: 'code',
        label: '部门编码',
        type: 'input',
        placeholder: '请输入部门编码，将自动转为大写',
        maxlength: 50,
        showWordLimit: true,
        required: true,
        transform: 'uppercase'
      },
      {
        prop: 'description',
        label: '部门描述',
        type: 'textarea',
        placeholder: '请输入部门描述（可选）',
        maxlength: 1000,
        showWordLimit: true,
        rows: 3
      }
    ]
  },
  {
    title: '层级关系',
    icon: 'el-icon-connection',
    fields: [
      {
        prop: 'parentId',
        label: '上级部门',
        type: 'select',
        placeholder: '请选择上级部门（可选）',
        clearable: true,
        filterable: true,
        options: [] // 动态加载
      },
      {
        prop: 'sortOrder',
        label: '排序顺序',
        type: 'number',
        placeholder: '排序顺序',
        min: 0,
        max: 9999,
        tip: '数值越小排序越靠前，用于同级部门的显示顺序'
      }
    ]
  },
  {
    title: '管理信息',
    icon: 'el-icon-user',
    fields: [
      {
        prop: 'managerId',
        label: '部门经理',
        type: 'select',
        placeholder: '请选择部门经理（可选）',
        clearable: true,
        filterable: true,
        remote: true,
        options: [], // 动态加载
        tip: '每个用户只能管理一个部门，选择后该用户将成为此部门的负责人'
      },
      {
        prop: 'status',
        label: '部门状态',
        type: 'radio',
        options: DEPARTMENT_STATUS_OPTIONS,
        tip: '禁用的部门将不能分配员工，也不会在选择器中显示'
      }
    ]
  }
]

// 导出API配置
export const EXPORT_CONFIG = {
  api: '/v1/departments/export',
  filename: '部门列表',
  headers: [
    { key: 'name', label: '部门名称' },
    { key: 'code', label: '部门编码' },
    { key: 'level', label: '层级' },
    { key: 'manager.name', label: '部门经理' },
    { key: 'status', label: '状态' },
    { key: 'sortOrder', label: '排序' },
    { key: 'description', label: '描述' },
    { key: 'createdAt', label: '创建时间' }
  ]
}
