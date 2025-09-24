/**
 * 部门管理表单配置
 */
import { DEPARTMENT_STATUS_OPTIONS } from './department'

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
