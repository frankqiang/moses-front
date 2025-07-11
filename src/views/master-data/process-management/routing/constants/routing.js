/**
 * 工艺路线管理常量
 */

// 工艺路线状态
export const ROUTING_STATUS = {
  DRAFT: 'Draft',
  PENDING_APPROVAL: 'PendingApproval',
  ENABLED: 'Enabled',
  ARCHIVED: 'Archived'
}

// 工艺路线状态选项
export const ROUTING_STATUS_OPTIONS = [
  { value: ROUTING_STATUS.DRAFT, label: '草稿' },
  { value: ROUTING_STATUS.PENDING_APPROVAL, label: '待审批' },
  { value: ROUTING_STATUS.ENABLED, label: '生效' },
  { value: ROUTING_STATUS.ARCHIVED, label: '已归档' }
]

// 工艺路线类型
export const ROUTING_TYPES = {
  STANDARD: 'Standard',
  REWORK: 'Rework',
  TRIAL: 'Trial'
}

// 工艺路线类型选项
export const ROUTING_TYPE_OPTIONS = [
  { value: ROUTING_TYPES.STANDARD, label: '标准路线' },
  { value: ROUTING_TYPES.REWORK, label: '返工路线' },
  { value: ROUTING_TYPES.TRIAL, label: '试制路线' }
]

// 状态配置 (用于StatusTag组件)
export const STATUS_CONFIG = {
  textMap: {
    [ROUTING_STATUS.ENABLED]: '生效',
    [ROUTING_STATUS.DRAFT]: '草稿',
    [ROUTING_STATUS.PENDING_APPROVAL]: '待审批',
    [ROUTING_STATUS.ARCHIVED]: '已归档'
  },
  typeMap: {
    [ROUTING_STATUS.ENABLED]: 'success',
    [ROUTING_STATUS.DRAFT]: 'info',
    [ROUTING_STATUS.PENDING_APPROVAL]: 'warning',
    [ROUTING_STATUS.ARCHIVED]: 'danger'
  }
} 