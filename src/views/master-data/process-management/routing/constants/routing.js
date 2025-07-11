/**
 * 工艺路线相关的常量
 */

// 路线类型选项
export const ROUTING_TYPE_OPTIONS = [
  { label: '标准路线', value: 'Standard' },
  { label: '返工路线', value: 'Rework' },
  { label: '试验路线', value: 'Trial' }
]

// 路线状态配置
export const ROUTING_STATUS_CONFIG = {
  // 用于StatusTag组件的文本映射
  textMap: {
    Draft: '草稿',
    PendingApproval: '待审批',
    Enabled: '生效',
    Archived: '已归档'
  },
  // 用于StatusTag组件的类型（颜色）映射
  typeMap: {
    Draft: 'info',
    PendingApproval: 'warning',
    Enabled: 'success',
    Archived: 'danger'
  }
}