/**
 * 待审批申请表单配置
 */

import { GENDER_OPTIONS, POSITION_OPTIONS, DEPARTMENT_OPTIONS, MANAGER_OPTIONS } from './application'

// 表单验证规则
export const FORM_RULES = {
  applicantName: [
    { required: true, message: '请输入申请人姓名', trigger: 'blur' },
    { min: 2, max: 50, message: '姓名长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', trigger: 'blur' }
  ],
  department: [
    { required: true, message: '请输入部门', trigger: 'blur' }
  ],
  position: [
    { required: true, message: '请输入职位', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入电话号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  reason: [
    { required: true, message: '请输入申请原因', trigger: 'blur' },
    { min: 10, max: 500, message: '申请原因长度在 10 到 500 个字符', trigger: 'blur' }
  ]
}

// 搜索表单配置
export const SEARCH_FORM_CONFIG = [
  {
    type: 'input',
    prop: 'search',
    label: '搜索关键词',
    placeholder: '请输入申请人姓名、邮箱或用户名',
    clearable: true,
    span: 6
  },
  {
    type: 'select',
    prop: 'departmentId',
    label: '部门',
    placeholder: '请选择部门',
    clearable: true,
    span: 6,
    options: DEPARTMENT_OPTIONS
  },
  {
    type: 'select',
    prop: 'positionId',
    label: '岗位',
    placeholder: '请选择岗位',
    clearable: true,
    span: 6,
    options: POSITION_OPTIONS
  },
  {
    type: 'select',
    prop: 'gender',
    label: '性别',
    placeholder: '请选择性别',
    clearable: true,
    span: 6,
    options: GENDER_OPTIONS
  },
  {
    type: 'date-range',
    prop: 'hireDateRange',
    label: '入职日期',
    placeholder: ['开始日期', '结束日期'],
    clearable: true,
    span: 8,
    format: 'yyyy-MM-dd',
    valueFormat: 'yyyy-MM-dd'
  },
  {
    type: 'date-range',
    prop: 'birthDateRange',
    label: '出生日期',
    placeholder: ['开始日期', '结束日期'],
    clearable: true,
    span: 8,
    format: 'yyyy-MM-dd',
    valueFormat: 'yyyy-MM-dd'
  },
  {
    type: 'select',
    prop: 'managerId',
    label: '直属上级',
    placeholder: '请选择直属上级',
    clearable: true,
    span: 6,
    options: MANAGER_OPTIONS
  }
]

// 排序字段配置
export const SORT_OPTIONS = [
  { value: 'createdAt', label: '申请时间' },
  { value: 'applicantName', label: '申请人姓名' },
  { value: 'applicantEmail', label: '申请人邮箱' },
  { value: 'status', label: '申请状态' }
]

// 排序方向配置
export const SORT_ORDER_OPTIONS = [
  { value: 'DESC', label: '降序' },
  { value: 'ASC', label: '升序' }
]

// 审批操作配置
export const APPROVAL_ACTIONS = {
  APPROVE: 'approve',
  REJECT: 'reject',
  VIEW: 'view'
}

// 审批操作选项
export const APPROVAL_ACTION_OPTIONS = [
  { value: APPROVAL_ACTIONS.APPROVE, label: '批准', type: 'success', icon: 'el-icon-check' },
  { value: APPROVAL_ACTIONS.REJECT, label: '拒绝', type: 'danger', icon: 'el-icon-close' },
  { value: APPROVAL_ACTIONS.VIEW, label: '查看', type: 'primary', icon: 'el-icon-view' }
]
