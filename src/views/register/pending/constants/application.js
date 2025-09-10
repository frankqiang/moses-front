/**
 * 待审批申请常量
 */

// 申请状态
export const APPLICATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
}

// 申请状态选项
export const APPLICATION_STATUS_OPTIONS = [
  { value: APPLICATION_STATUS.PENDING, label: '待审批' },
  { value: APPLICATION_STATUS.APPROVED, label: '已批准' },
  { value: APPLICATION_STATUS.REJECTED, label: '已拒绝' }
]

// 申请类型
export const APPLICATION_TYPES = {
  ACCOUNT: 'account',
  PERMISSION: 'permission',
  RESOURCE: 'resource'
}

// 申请类型选项
export const APPLICATION_TYPE_OPTIONS = [
  { value: APPLICATION_TYPES.ACCOUNT, label: '账户申请' },
  { value: APPLICATION_TYPES.PERMISSION, label: '权限申请' },
  { value: APPLICATION_TYPES.RESOURCE, label: '资源申请' }
]

// 状态配置 - 可以在组件中引用
export const STATUS_CONFIG = {
  textMap: {
    [APPLICATION_STATUS.PENDING]: '待审批',
    [APPLICATION_STATUS.APPROVED]: '已批准',
    [APPLICATION_STATUS.REJECTED]: '已拒绝'
  },
  typeMap: {
    [APPLICATION_STATUS.PENDING]: 'warning',
    [APPLICATION_STATUS.APPROVED]: 'success',
    [APPLICATION_STATUS.REJECTED]: 'danger'
  }
}

// 表格行样式配置
export const ROW_CLASS_CONFIG = {
  [APPLICATION_STATUS.REJECTED]: 'row-disabled'
}
