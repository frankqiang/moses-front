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

// API配置
export const DEPARTMENT_API_CONFIG = {
  BASE: '/departments',
  TREE: '/departments/tree',
  DETAIL: (id) => `/departments/${id}`,
  STATUS: (id) => `/departments/${id}/status`,
  MANAGER: (id) => `/departments/${id}/manager`,
  BATCH_STATUS: '/departments/batch-status',
  BATCH_DELETE: '/departments/batch-delete',
  EXPORT: '/departments/export'
}

// 默认查询参数
export const DEPARTMENT_DEFAULT_QUERY = Object.freeze({
  limit: 10,
  page: 1,
  sortBy: 'level:asc,sortOrder:asc',
  populate: 'manager,parent'
})

// 成功消息配置
export const DEPARTMENT_SUCCESS_MESSAGES = Object.freeze({
  create: '创建部门成功',
  update: '更新部门信息成功',
  delete: '删除部门成功',
  batchDelete: '批量删除部门成功',
  activate: '部门启用成功',
  deactivate: '部门禁用成功',
  batchActivate: '批量启用部门成功',
  batchDeactivate: '批量禁用部门成功',
  setManager: '设置部门负责人成功'
})

// 错误消息配置
export const DEPARTMENT_ERROR_MESSAGES = Object.freeze({
  DUPLICATE_RESOURCE: '部门编码已存在，请更换后重试',
  DEPARTMENT_NOT_FOUND: '指定的父部门不存在或已被删除',
  RESOURCE_NOT_FOUND: '部门不存在或已被删除',
  OPERATION_NOT_ALLOWED: '当前操作不被允许，请检查关联数据或层级关系',
  USER_NOT_FOUND: '指定的部门负责人不存在或已被禁用',
  DEFAULT: '操作失败，请稍后重试'
})

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
  api: DEPARTMENT_API_CONFIG.EXPORT,
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
