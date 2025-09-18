/**
 * 用户管理表单配置
 * 文件描述：用户管理模块的表单配置，包括搜索表单、新增表单、编辑表单的字段配置
 * 创建日期：2024-12-23
 * 修改记录：
 *   - 2024-12-23: 参考operations模块范式创建，统一表单配置管理
 */
import { USER_STATUS_OPTIONS, GENDER_OPTIONS, DEPARTMENT_OPTIONS, ROLE_OPTIONS } from './user-management'

// 搜索表单配置 - 支持高级筛选功能
export const SEARCH_FORM_CONFIG = [
  {
    type: 'input',
    prop: 'username',
    label: '用户名',
    placeholder: '请输入用户名',
    clearable: true
  },
  {
    type: 'input',
    prop: 'name',
    label: '姓名',
    placeholder: '请输入姓名',
    clearable: true
  },
  {
    type: 'input',
    prop: 'email',
    label: '邮箱',
    placeholder: '请输入邮箱',
    clearable: true
  },
  {
    type: 'input',
    prop: 'search',
    label: '通用搜索',
    placeholder: '搜索姓名、用户名或邮箱',
    clearable: true
  },
  {
    type: 'select',
    prop: 'department',
    label: '部门',
    placeholder: '请选择部门',
    clearable: true,
    multiple: false,
    options: DEPARTMENT_OPTIONS
  },
  {
    type: 'select',
    prop: 'status',
    label: '状态',
    placeholder: '请选择状态',
    clearable: true,
    multiple: true, // 支持多选
    options: USER_STATUS_OPTIONS
  },
  {
    type: 'select',
    prop: 'role',
    label: '角色',
    placeholder: '请选择角色',
    clearable: true,
    multiple: false,
    options: ROLE_OPTIONS
  },
  {
    type: 'select',
    prop: 'gender',
    label: '性别',
    placeholder: '请选择性别',
    clearable: true,
    multiple: false,
    options: GENDER_OPTIONS
  },
  {
    type: 'date',
    prop: 'createdTimeRange',
    label: '创建时间',
    dateType: 'datetimerange',
    placeholder: '选择时间范围',
    startPlaceholder: '开始时间',
    endPlaceholder: '结束时间',
    valueFormat: 'yyyy-MM-dd HH:mm:ss',
    clearable: true
  },
  {
    type: 'date',
    prop: 'lastLoginTimeRange',
    label: '最后登录时间',
    dateType: 'datetimerange',
    placeholder: '选择时间范围',
    startPlaceholder: '开始时间',
    endPlaceholder: '结束时间',
    valueFormat: 'yyyy-MM-dd HH:mm:ss',
    clearable: true
  }
]

// 用户表单字段配置
export const USER_FORM_FIELDS = [
  {
    prop: 'username',
    label: '用户名',
    type: 'input',
    placeholder: '请输入用户名',
    required: true,
    maxlength: 30,
    showWordLimit: true,
    section: 'basic'
  },
  {
    prop: 'realName',
    label: '真实姓名',
    type: 'input',
    placeholder: '请输入真实姓名',
    required: true,
    maxlength: 20,
    showWordLimit: true,
    section: 'basic'
  },
  {
    prop: 'email',
    label: '邮箱',
    type: 'input',
    placeholder: '请输入邮箱地址',
    required: true,
    maxlength: 100,
    section: 'basic'
  },
  {
    prop: 'phone',
    label: '手机号',
    type: 'input',
    placeholder: '请输入手机号',
    required: true,
    maxlength: 11,
    section: 'basic'
  },
  {
    prop: 'password',
    label: '密码',
    type: 'password',
    placeholder: '请输入密码',
    required: true,
    maxlength: 50,
    showPassword: true,
    section: 'security',
    showInCreate: true,
    showInUpdate: false
  },
  {
    prop: 'confirmPassword',
    label: '确认密码',
    type: 'password',
    placeholder: '请再次输入密码',
    required: true,
    maxlength: 50,
    showPassword: true,
    section: 'security',
    showInCreate: true,
    showInUpdate: false
  },
  {
    prop: 'gender',
    label: '性别',
    type: 'select',
    placeholder: '请选择性别',
    options: GENDER_OPTIONS,
    section: 'profile'
  },
  {
    prop: 'department',
    label: '部门',
    type: 'select',
    placeholder: '请选择部门',
    options: DEPARTMENT_OPTIONS,
    section: 'profile'
  },
  {
    prop: 'role',
    label: '角色',
    type: 'select',
    placeholder: '请选择角色',
    options: ROLE_OPTIONS,
    section: 'profile'
  },
  {
    prop: 'status',
    label: '状态',
    type: 'select',
    placeholder: '请选择状态',
    options: USER_STATUS_OPTIONS,
    section: 'profile'
  },
  {
    prop: 'remark',
    label: '备注',
    type: 'textarea',
    placeholder: '请输入备注信息',
    rows: 3,
    maxlength: 500,
    showWordLimit: true,
    section: 'profile'
  }
]

// 表单验证规则
export const USER_FORM_RULES = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 30, message: '用户名长度在 3 到 30 个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', trigger: 'blur' }
  ],
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 50, message: '密码长度在 6 到 50 个字符', trigger: 'blur' },
    { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/, message: '密码必须包含大小写字母和数字', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' }
  ]
}

// 表单分组配置
export const FORM_SECTIONS = {
  basic: {
    title: '基础信息',
    order: 1
  },
  security: {
    title: '安全设置',
    order: 2
  },
  profile: {
    title: '个人资料',
    order: 3
  }
}

// 密码重置表单配置
export const PASSWORD_RESET_FORM_CONFIG = [
  {
    prop: 'newPassword',
    label: '新密码',
    type: 'password',
    placeholder: '请输入新密码',
    required: true,
    maxlength: 50,
    showPassword: true
  },
  {
    prop: 'confirmPassword',
    label: '确认密码',
    type: 'password',
    placeholder: '请再次输入新密码',
    required: true,
    maxlength: 50,
    showPassword: true
  }
]

// 密码重置验证规则
export const PASSWORD_RESET_RULES = {
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 50, message: '密码长度在 6 到 50 个字符', trigger: 'blur' },
    { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/, message: '密码必须包含大小写字母和数字', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' }
  ]
}
