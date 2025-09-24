/**
 * 角色管理表单配置
 */
import {
  ROLE_TYPE_OPTIONS,
  ROLE_STATUS_OPTIONS,
  ROLE_LEVEL_OPTIONS,
  DEFAULT_ROLE_OPTIONS
} from './role'

// 搜索表单配置
export const SEARCH_FORM_CONFIG = [
  {
    type: 'input',
    prop: 'search',
    label: '关键词搜索',
    placeholder: '请输入角色名称或编码',
    clearable: true,
    span: 6
  },
  {
    type: 'select',
    prop: 'type',
    label: '角色类型',
    placeholder: '请选择角色类型',
    clearable: true,
    options: ROLE_TYPE_OPTIONS,
    span: 4
  },
  {
    type: 'select',
    prop: 'status',
    label: '角色状态',
    placeholder: '请选择角色状态',
    clearable: true,
    options: ROLE_STATUS_OPTIONS,
    span: 4
  },
  {
    type: 'select',
    prop: 'level',
    label: '角色级别',
    placeholder: '请选择角色级别',
    clearable: true,
    options: ROLE_LEVEL_OPTIONS,
    span: 4
  },
  {
    type: 'select',
    prop: 'isDefault',
    label: '默认角色',
    placeholder: '是否默认角色',
    clearable: true,
    options: DEFAULT_ROLE_OPTIONS,
    span: 4
  },
  {
    type: 'date',
    prop: 'dateRange',
    label: '创建时间',
    'start-placeholder': '开始日期',
    'end-placeholder': '结束日期',
    clearable: true,
    span: 6,
    dateType: 'datetimerange',
    format: 'yyyy-MM-dd HH:mm:ss',
    'value-format': 'yyyy-MM-dd HH:mm:ss'
  }
]

// 角色表单字段配置
export const ROLE_FORM_CONFIG = [
  {
    prop: 'name',
    label: '角色名称',
    type: 'input',
    placeholder: '请输入角色名称',
    required: true,
    maxlength: 50,
    showWordLimit: true,
    rules: [
      { required: true, message: '请输入角色名称', trigger: 'blur' },
      { min: 2, max: 50, message: '角色名称长度为2-50个字符', trigger: 'blur' }
    ]
  },
  {
    prop: 'code',
    label: '角色编码',
    type: 'input',
    placeholder: '请输入角色编码（字母、数字、下划线、中划线）',
    required: true,
    maxlength: 50,
    showWordLimit: true,
    rules: [
      { required: true, message: '请输入角色编码', trigger: 'blur' },
      { min: 2, max: 50, message: '角色编码长度为2-50个字符', trigger: 'blur' },
      {
        pattern: /^[a-zA-Z0-9_-]+$/,
        message: '角色编码只能包含字母、数字、下划线、中划线',
        trigger: 'blur'
      }
    ]
  },
  {
    prop: 'type',
    label: '角色类型',
    type: 'select',
    placeholder: '请选择角色类型',
    required: true,
    options: ROLE_TYPE_OPTIONS,
    rules: [
      { required: true, message: '请选择角色类型', trigger: 'change' }
    ]
  },
  {
    prop: 'level',
    label: '角色级别',
    type: 'select',
    placeholder: '请选择角色级别',
    required: true,
    options: ROLE_LEVEL_OPTIONS,
    rules: [
      { required: true, message: '请选择角色级别', trigger: 'change' }
    ]
  },
  {
    prop: 'status',
    label: '角色状态',
    type: 'radio-group',
    required: true,
    options: ROLE_STATUS_OPTIONS,
    rules: [
      { required: true, message: '请选择角色状态', trigger: 'change' }
    ]
  },
  {
    prop: 'isDefault',
    label: '默认角色',
    type: 'switch',
    activeText: '是',
    inactiveText: '否'
  },
  {
    prop: 'description',
    label: '角色描述',
    type: 'textarea',
    placeholder: '请输入角色描述',
    rows: 4,
    maxlength: 200,
    showWordLimit: true
  }
]

// 表单验证规则
export const FORM_RULES = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 50, message: '角色名称长度为2-50个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入角色编码', trigger: 'blur' },
    { min: 2, max: 50, message: '角色编码长度为2-50个字符', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z0-9_-]+$/,
      message: '角色编码只能包含字母、数字、下划线、中划线',
      trigger: 'blur'
    }
  ],
  type: [
    { required: true, message: '请选择角色类型', trigger: 'change' }
  ],
  level: [
    { required: true, message: '请选择角色级别', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择角色状态', trigger: 'change' }
  ]
}
