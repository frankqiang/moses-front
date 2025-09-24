/**
 * 部门管理基础常量
 * 创建日期：2024-01-20
 * 说明：定义部门管理相关的基础常量和枚举值
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

// 工具栏按钮配置
export const TOOLBAR_BUTTONS = [
  {
    text: '新增部门',
    icon: 'el-icon-plus',
    type: 'primary',
    action: 'create'
  }
]

// 操作按钮配置
export const ACTION_BUTTONS = {
  view: {
    text: '查看',
    icon: 'el-icon-view',
    type: 'text'
  },
  edit: {
    text: '编辑',
    icon: 'el-icon-edit',
    type: 'text'
  },
  createChild: {
    text: '新增子部门',
    icon: 'el-icon-plus',
    type: 'text'
  },
  toggleStatus: {
    text: '切换状态',
    icon: 'el-icon-switch-button',
    type: 'text'
  },
  setManager: {
    text: '设置经理',
    icon: 'el-icon-user',
    type: 'text'
  },
  delete: {
    text: '删除',
    icon: 'el-icon-delete',
    type: 'text',
    style: { color: '#f56c6c' }
  }
}

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
