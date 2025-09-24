/**
 * 角色管理表单配置
 */
import {
  ROLE_TYPE_OPTIONS,
  ROLE_STATUS_OPTIONS,
  ROLE_LEVEL_OPTIONS,
  DEFAULT_ROLE_OPTIONS
} from './role'

// 搜索表单配置 - 严格按照接口文档参数优化
export const SEARCH_FORM_CONFIG = [
  {
    type: 'input',
    prop: 'search',
    label: '关键词搜索',
    placeholder: '在名称、编码、描述中搜索（最大100字符）',
    clearable: true,
    maxlength: 100,
    span: 8,
    tip: '支持在角色名称、编码、描述中进行模糊搜索'
  },
  {
    type: 'input',
    prop: 'name',
    label: '角色名称',
    placeholder: '请输入角色名称进行模糊查询',
    clearable: true,
    maxlength: 100,
    span: 6,
    tip: '按角色名称精确筛选'
  },
  {
    type: 'input',
    prop: 'code',
    label: '角色编码',
    placeholder: '请输入角色编码进行模糊查询',
    clearable: true,
    maxlength: 50,
    span: 6,
    tip: '按角色编码精确筛选'
  },
  {
    type: 'select',
    prop: 'type',
    label: '角色类型',
    placeholder: '请选择角色类型',
    clearable: true,
    multiple: true,
    options: ROLE_TYPE_OPTIONS,
    span: 6,
    tip: '支持多选角色类型'
  },
  {
    type: 'select',
    prop: 'status',
    label: '角色状态',
    placeholder: '请选择角色状态',
    clearable: true,
    multiple: true,
    options: ROLE_STATUS_OPTIONS,
    span: 6,
    tip: '支持多选角色状态'
  },
  {
    type: 'select',
    prop: 'level',
    label: '角色级别',
    placeholder: '请选择角色级别',
    clearable: true,
    multiple: true,
    options: ROLE_LEVEL_OPTIONS,
    span: 6,
    tip: '支持多选角色级别'
  },
  {
    type: 'select',
    prop: 'isDefault',
    label: '默认角色',
    placeholder: '是否默认角色',
    clearable: true,
    options: DEFAULT_ROLE_OPTIONS,
    span: 6,
    tip: '筛选默认角色'
  },
  {
    type: 'select',
    prop: 'hasUsers',
    label: '用户关联',
    placeholder: '是否有关联用户',
    clearable: true,
    options: [
      { value: true, label: '有关联用户' },
      { value: false, label: '无关联用户' }
    ],
    span: 6,
    tip: '筛选是否有用户使用此角色'
  },
  {
    type: 'date',
    prop: 'dateRange',
    label: '创建时间',
    'start-placeholder': '开始日期',
    'end-placeholder': '结束日期',
    clearable: true,
    span: 12,
    dateType: 'datetimerange',
    format: 'yyyy-MM-dd HH:mm:ss',
    'value-format': 'yyyy-MM-dd HH:mm:ss',
    tip: '按创建时间范围筛选'
  }
]

// 角色表单字段配置
export const ROLE_FORM_CONFIG = [
  {
    prop: 'name',
    label: '角色名称',
    type: 'input',
    placeholder: '请输入角色名称（1-100字符）',
    required: true,
    maxlength: 100,
    showWordLimit: true,
    rules: [
      { required: true, message: '请输入角色名称', trigger: 'blur' },
      { min: 1, max: 100, message: '角色名称长度为1-100个字符', trigger: 'blur' },
      {
        pattern: /^[\u4e00-\u9fa5a-zA-Z0-9\s()（）]+$/,
        message: '角色名称只能包含中文、英文、数字、空格、括号',
        trigger: 'blur'
      }
    ]
  },
  {
    prop: 'code',
    label: '角色编码',
    type: 'input',
    placeholder: '请输入角色编码（1-50字符）',
    required: true,
    maxlength: 50,
    showWordLimit: true,
    rules: [
      { required: true, message: '请输入角色编码', trigger: 'blur' },
      { min: 1, max: 50, message: '角色编码长度为1-50个字符', trigger: 'blur' },
      {
        pattern: /^[a-zA-Z][a-zA-Z0-9_-]*[a-zA-Z0-9]$|^[a-zA-Z]$/,
        message: '角色编码只能包含字母、数字、下划线、中划线，不能以数字、下划线或中划线开头或结尾',
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
    placeholder: '请选择角色级别（1-999）',
    required: true,
    options: ROLE_LEVEL_OPTIONS,
    rules: [
      { required: true, message: '请选择角色级别', trigger: 'change' },
      {
        type: 'number',
        min: 1,
        max: 999,
        message: '角色级别必须在1-999之间',
        trigger: 'change'
      }
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
    placeholder: '请输入角色描述（最大1000字符）',
    rows: 4,
    maxlength: 1000,
    showWordLimit: true,
    rules: [
      { max: 1000, message: '角色描述不能超过1000个字符', trigger: 'blur' }
    ]
  }
]

// 表单验证规则 - 严格按照接口文档要求
export const FORM_RULES = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 1, max: 100, message: '角色名称长度为1-100个字符', trigger: 'blur' },
    {
      pattern: /^[\u4e00-\u9fa5a-zA-Z0-9\s()（）]+$/,
      message: '角色名称只能包含中文、英文、数字、空格、括号',
      trigger: 'blur'
    }
  ],
  code: [
    { required: true, message: '请输入角色编码', trigger: 'blur' },
    { min: 1, max: 50, message: '角色编码长度为1-50个字符', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z][a-zA-Z0-9_-]*[a-zA-Z0-9]$|^[a-zA-Z]$/,
      message: '角色编码只能包含字母、数字、下划线、中划线，不能以数字、下划线或中划线开头或结尾',
      trigger: 'blur'
    }
  ],
  type: [
    { required: true, message: '请选择角色类型', trigger: 'change' }
  ],
  level: [
    { required: true, message: '请选择角色级别', trigger: 'change' },
    {
      type: 'number',
      min: 1,
      max: 999,
      message: '角色级别必须在1-999之间',
      trigger: 'change'
    }
  ],
  status: [
    { required: true, message: '请选择角色状态', trigger: 'change' }
  ],
  description: [
    { max: 1000, message: '角色描述不能超过1000个字符', trigger: 'blur' }
  ]
}
