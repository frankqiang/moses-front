/**
 * 角色管理核心常量
 */

// 角色类型
export const ROLE_TYPES = {
  SYSTEM: 'system', // 系统角色
  CUSTOM: 'custom' // 自定义角色
}

// 角色类型选项
export const ROLE_TYPE_OPTIONS = [
  { value: ROLE_TYPES.SYSTEM, label: '系统角色' },
  { value: ROLE_TYPES.CUSTOM, label: '自定义角色' }
]

// 角色状态
export const ROLE_STATUS = {
  ACTIVE: 'active', // 启用
  INACTIVE: 'inactive' // 禁用
}

// 角色状态选项
export const ROLE_STATUS_OPTIONS = [
  { value: ROLE_STATUS.ACTIVE, label: '启用' },
  { value: ROLE_STATUS.INACTIVE, label: '禁用' }
]

// 角色级别选项
export const ROLE_LEVEL_OPTIONS = [
  { value: 1, label: '1级（最高级别）' },
  { value: 2, label: '2级' },
  { value: 3, label: '3级' },
  { value: 4, label: '4级' },
  { value: 5, label: '5级（最低级别）' }
]

// 默认角色选项
export const DEFAULT_ROLE_OPTIONS = [
  { value: 'true', label: '是' },
  { value: 'false', label: '否' }
]

// 角色类型显示配置
export const ROLE_TYPE_CONFIG = {
  [ROLE_TYPES.SYSTEM]: {
    text: '系统角色',
    type: 'info',
    description: '系统内置角色，不可编辑删除'
  },
  [ROLE_TYPES.CUSTOM]: {
    text: '自定义角色',
    type: 'primary',
    description: '用户自定义创建的角色'
  }
}

// 角色状态显示配置
export const ROLE_STATUS_CONFIG = {
  [ROLE_STATUS.ACTIVE]: {
    text: '启用',
    type: 'success',
    description: '角色已启用，可以分配给用户'
  },
  [ROLE_STATUS.INACTIVE]: {
    text: '禁用',
    type: 'danger',
    description: '角色已禁用，不能分配给用户'
  }
}

// 角色级别颜色配置
export const ROLE_LEVEL_COLORS = {
  1: 'danger', // 最高级别 - 红色
  2: 'warning', // 第二级别 - 橙色
  3: 'primary', // 第三级别 - 蓝色
  4: 'info', // 第四级别 - 灰色
  5: 'success' // 最低级别 - 绿色
}

// 状态配置 - 兼容StatusTag组件
export const STATUS_CONFIG = {
  textMap: {
    [ROLE_STATUS.ACTIVE]: '启用',
    [ROLE_STATUS.INACTIVE]: '禁用'
  },
  typeMap: {
    [ROLE_STATUS.ACTIVE]: 'success',
    [ROLE_STATUS.INACTIVE]: 'danger'
  }
}

// 角色类型状态配置
export const TYPE_STATUS_CONFIG = {
  textMap: {
    [ROLE_TYPES.SYSTEM]: '系统角色',
    [ROLE_TYPES.CUSTOM]: '自定义角色'
  },
  typeMap: {
    [ROLE_TYPES.SYSTEM]: 'info',
    [ROLE_TYPES.CUSTOM]: 'primary'
  }
}

// 权限验证常量
export const ROLE_PERMISSIONS = {
  VIEW: 'role:view', // 查看角色
  CREATE: 'role:create', // 创建角色
  EDIT: 'role:edit', // 编辑角色
  DELETE: 'role:delete', // 删除角色
  COPY: 'role:copy', // 复制角色
  STATUS: 'role:status', // 状态管理
  PERMISSION: 'role:permission' // 权限配置
}

// 操作按钮配置
export const ACTION_BUTTONS = {
  VIEW: {
    text: '查看',
    icon: 'el-icon-view',
    action: 'view',
    permission: ROLE_PERMISSIONS.VIEW
  },
  EDIT: {
    text: '编辑',
    icon: 'el-icon-edit',
    action: 'edit',
    permission: ROLE_PERMISSIONS.EDIT
  },
  COPY: {
    text: '复制',
    icon: 'el-icon-document-copy',
    action: 'copy',
    permission: ROLE_PERMISSIONS.COPY
  },
  DELETE: {
    text: '删除',
    icon: 'el-icon-delete',
    action: 'delete',
    type: 'danger',
    permission: ROLE_PERMISSIONS.DELETE
  }
}
