/**
 * 用户管理表格配置
 * 文件描述：用户管理模块的表格配置，包括列配置、状态配置、行类配置等
 * 创建日期：2024-12-23
 * 修改记录：
 *   - 2024-12-23: 参考operations模块范式创建，支持BaseTable组件的高级特性
 */
import { USER_STATUS, GENDER } from './user-management'

// 表格列配置 - 原生支持BaseTable组件
export const TABLE_COLUMNS = [
  {
    prop: 'username',
    label: '用户名',
    sortable: true,
    minWidth: 120,
    align: 'center',
    showOverflowTooltip: true
  },
  {
    prop: 'name',
    label: '真实姓名',
    sortable: true,
    minWidth: 120,
    align: 'center',
    showOverflowTooltip: true
  },
  {
    prop: 'email',
    label: '邮箱',
    sortable: true,
    minWidth: 180,
    align: 'center',
    showOverflowTooltip: true
  },
  {
    prop: 'phone',
    label: '手机号',
    sortable: true,
    minWidth: 120,
    align: 'center',
    showOverflowTooltip: true
  },
  {
    prop: 'gender',
    label: '性别',
    sortable: true,
    minWidth: 80,
    align: 'center',
    slotName: 'gender', // 使用插槽自定义渲染
    showOverflowTooltip: false
  },
  {
    prop: 'profile.department.name',
    label: '部门',
    sortable: true,
    minWidth: 120,
    align: 'center',
    showOverflowTooltip: true,
    formatter: (row) => {
      return row.profile?.department?.name || '-'
    }
  },
  {
    prop: 'role',
    label: '角色',
    sortable: true,
    minWidth: 100,
    align: 'center',
    showOverflowTooltip: true
  },
  {
    prop: 'status',
    label: '状态',
    sortable: true,
    minWidth: 100,
    align: 'center',
    type: 'status', // BaseTable内置状态类型
    slotName: 'status', // 使用插槽自定义渲染
    showOverflowTooltip: false
  },
  {
    prop: 'lastLoginAt',
    label: '最后登录',
    sortable: true,
    minWidth: 150,
    align: 'center',
    type: 'datetime', // BaseTable内置时间类型
    format: '{y}-{m}-{d} {h}:{i}', // 时间格式
    showOverflowTooltip: true
  },
  {
    prop: 'createdAt',
    label: '创建时间',
    sortable: true,
    minWidth: 150,
    align: 'center',
    type: 'datetime', // BaseTable内置时间类型
    format: '{y}-{m}-{d} {h}:{i}', // 时间格式
    showOverflowTooltip: true
  },
  {
    prop: 'updatedAt',
    label: '更新时间',
    sortable: true,
    minWidth: 150,
    align: 'center',
    type: 'datetime', // BaseTable内置时间类型
    format: '{y}-{m}-{d} {h}:{i}', // 时间格式
    showOverflowTooltip: true
  },
  {
    prop: 'actions',
    label: '操作',
    minWidth: 200,
    fixed: 'right',
    slotName: 'actions' // 使用插槽自定义渲染
  }
]

// 默认可见列
export const DEFAULT_VISIBLE_COLUMNS = [
  'username',
  'name',
  'email',
  'phone',
  'gender',
  'profile.department.name',
  'status',
  'lastLoginAt',
  'actions'
]

// 状态配置
export const STATUS_CONFIG = {
  textMap: {
    [USER_STATUS.ACTIVE]: '激活',
    [USER_STATUS.LOCKED]: '锁定',
    [USER_STATUS.DISABLED]: '禁用',
    [USER_STATUS.PENDING]: '待激活',
    [USER_STATUS.DELETED]: '已删除'
  },
  typeMap: {
    [USER_STATUS.ACTIVE]: 'success',
    [USER_STATUS.LOCKED]: 'warning',
    [USER_STATUS.DISABLED]: 'danger',
    [USER_STATUS.PENDING]: 'info',
    [USER_STATUS.DELETED]: 'info'
  }
}

// 性别配置
export const GENDER_CONFIG = {
  textMap: {
    [GENDER.MALE]: '男',
    [GENDER.FEMALE]: '女',
    [GENDER.OTHER]: '其他'
  },
  iconMap: {
    [GENDER.MALE]: 'el-icon-male',
    [GENDER.FEMALE]: 'el-icon-female',
    [GENDER.OTHER]: 'el-icon-question'
  }
}

// 行类配置
export const ROW_CLASS_CONFIG = {
  statusField: 'status',
  classMap: {
    [USER_STATUS.ACTIVE]: '',
    [USER_STATUS.LOCKED]: 'row-warning',
    [USER_STATUS.DISABLED]: 'row-danger',
    [USER_STATUS.PENDING]: 'row-info',
    [USER_STATUS.DELETED]: 'row-disabled'
  }
}

// 操作按钮配置
export const ACTION_BUTTONS_CONFIG = {
  view: {
    text: '查看',
    type: 'text',
    icon: 'el-icon-view',
    size: 'mini'
  },
  edit: {
    text: '编辑',
    type: 'text',
    icon: 'el-icon-edit',
    size: 'mini'
  },
  delete: {
    text: '删除',
    type: 'text',
    icon: 'el-icon-delete',
    size: 'mini',
    style: 'color: #f56c6c'
  },
  enable: {
    text: '启用',
    type: 'text',
    icon: 'el-icon-check',
    size: 'mini',
    style: 'color: #67c23a'
  },
  disable: {
    text: '禁用',
    type: 'text',
    icon: 'el-icon-close',
    size: 'mini',
    style: 'color: #f56c6c'
  },
  resetPassword: {
    text: '重置密码',
    type: 'text',
    icon: 'el-icon-key',
    size: 'mini',
    style: 'color: #409eff'
  }
}

// 批量操作配置
export const BATCH_ACTIONS_CONFIG = [
  {
    action: 'enable',
    text: '批量启用',
    type: 'success',
    icon: 'el-icon-check'
  },
  {
    action: 'disable',
    text: '批量禁用',
    type: 'warning',
    icon: 'el-icon-close'
  },
  {
    action: 'delete',
    text: '批量删除',
    type: 'danger',
    icon: 'el-icon-delete'
  }
]

// 表格工具栏配置
export const TOOLBAR_CONFIG = {
  enableColumnSettings: true,
  enableBatchActions: true,
  enableExport: true,
  enableImport: true,
  enableRefresh: true,
  statusButtons: {
    mode: 'dropdown',
    confirm: false,
    smart: true,
    statusField: 'status',
    enabledValue: USER_STATUS.ACTIVE,
    disabledValue: USER_STATUS.DISABLED
  }
}