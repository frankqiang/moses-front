/**
 * 文件名称：production-plan-management.js
 * 文件描述：生产计划管理模块基础常量配置
 * 创建日期：2025-01-21
 * 修改记录：
 *   - 2025-01-21: 初始创建
 *   - 2025-01-21: 废弃中文映射和选项，改用字典系统
 *
 * ⚠️ 重要说明：
 * - 枚举值常量（PLAN_STATUS等）保留用于代码判断
 * - 中文映射（*_MAP）和选项（*_OPTIONS）已废弃
 * - 请使用字典系统获取中文标签和选项：
 *   import dictionaryMixin from '../mixins/dictionary'
 *   然后使用 this.getPlanStatusLabel(status) 和 this.planStatusOptions
 */

// ========== 枚举值常量（保留用于代码判断） ==========

// 计划来源
export const PLAN_SOURCE = {
  ERP: 'ERP',
  MANUAL: 'MANUAL'
}

// 计划状态
export const PLAN_STATUS = {
  RECEIVED: 'RECEIVED',
  CONFIRMED: 'CONFIRMED',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  PARTIALLY_RELEASED: 'PARTIALLY_RELEASED',
  RELEASED: 'RELEASED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
}

// 计划优先级
export const PLAN_PRIORITY = {
  LOW: 'LOW',
  NORMAL: 'NORMAL',
  HIGH: 'HIGH',
  URGENT: 'URGENT'
}

// 子批次状态
export const ITEM_STATUS = {
  DRAFT: 'DRAFT',
  READY_FOR_SCHEDULING: 'READY_FOR_SCHEDULING',
  SCHEDULED: 'SCHEDULED',
  RELEASED: 'RELEASED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
}

// 审批状态
export const APPROVAL_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
  WITHDRAWN: 'WITHDRAWN',
  EXPIRED: 'EXPIRED'
}

// 变更类型（用于审计日志，完全符合接口文档规范）
export const CHANGE_TYPE = {
  SPLIT: 'SPLIT',
  MERGE: 'MERGE',
  ADJUST: 'ADJUST',
  STATUS_UPDATE: 'STATUS_UPDATE',
  PROGRESS_SYNC: 'PROGRESS_SYNC',
  STATUS_UPDATE_REQUESTED: 'STATUS_UPDATE_REQUESTED',
  STATUS_UPDATE_APPROVED: 'STATUS_UPDATE_APPROVED',
  STATUS_UPDATE_REJECTED: 'STATUS_UPDATE_REJECTED',
  STATUS_UPDATE_CANCELLED: 'STATUS_UPDATE_CANCELLED'
}

// 操作来源（用于审计日志）
export const OPERATION_SOURCE = {
  ERP_SYNC: 'ERP_SYNC',
  MANUAL: 'MANUAL',
  SYSTEM: 'SYSTEM'
}

// ========== UI样式映射（保留用于前端展示） ==========

// 计划状态颜色映射
export const PLAN_STATUS_TYPE_MAP = {
  RECEIVED: 'info',
  CONFIRMED: 'primary',
  PENDING_APPROVAL: 'warning',
  PARTIALLY_RELEASED: '',
  RELEASED: 'success',
  IN_PROGRESS: 'primary',
  COMPLETED: 'success',
  CANCELLED: 'danger'
}

// 计划优先级颜色映射
export const PLAN_PRIORITY_TYPE_MAP = {
  LOW: 'info',
  NORMAL: 'primary',
  HIGH: 'warning',
  URGENT: 'danger'
}

// 子批次状态颜色映射
export const ITEM_STATUS_TYPE_MAP = {
  DRAFT: 'info',
  READY_FOR_SCHEDULING: 'warning',
  SCHEDULED: 'primary',
  RELEASED: 'success',
  IN_PROGRESS: '',
  COMPLETED: 'success',
  CANCELLED: 'danger'
}

// 审批状态颜色映射
export const APPROVAL_STATUS_TYPE_MAP = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
  CANCELLED: 'info',
  WITHDRAWN: 'info',
  EXPIRED: 'danger'
}

// 变更类型颜色映射（用于审计日志，完全符合接口文档规范）
export const CHANGE_TYPE_COLOR_MAP = {
  SPLIT: '#409EFF',
  MERGE: '#67C23A',
  ADJUST: '#E6A23C',
  STATUS_UPDATE: '#909399',
  PROGRESS_SYNC: '#409EFF',
  STATUS_UPDATE_REQUESTED: '#E6A23C',
  STATUS_UPDATE_APPROVED: '#67C23A',
  STATUS_UPDATE_REJECTED: '#F56C6C',
  STATUS_UPDATE_CANCELLED: '#909399'
}

// 变更类型标签类型映射（用于审计日志，完全符合接口文档规范）
export const CHANGE_TYPE_TAG_TYPE_MAP = {
  SPLIT: 'primary',
  MERGE: 'success',
  ADJUST: 'warning',
  STATUS_UPDATE: 'info',
  PROGRESS_SYNC: 'primary',
  STATUS_UPDATE_REQUESTED: 'warning',
  STATUS_UPDATE_APPROVED: 'success',
  STATUS_UPDATE_REJECTED: 'danger',
  STATUS_UPDATE_CANCELLED: 'info'
}

// 操作来源映射（用于审计日志，前端展示用）
export const OPERATION_SOURCE_MAP = {
  ERP_SYNC: 'ERP同步',
  MANUAL: '手动操作',
  SYSTEM: '系统自动'
}

// 操作来源选项
export const OPERATION_SOURCE_OPTIONS = [
  { value: 'ERP_SYNC', label: 'ERP同步' },
  { value: 'MANUAL', label: '手动操作' },
  { value: 'SYSTEM', label: '系统自动' }
]

// 默认分页配置
export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 20
}

// 默认排序
export const DEFAULT_SORT = 'createdAt:desc'

// 输出格式
export const OUTPUT_FORMAT = {
  TABLE: 'table',
  GANTT: 'gantt'
}

// 输出格式选项
export const OUTPUT_FORMAT_OPTIONS = [
  { value: OUTPUT_FORMAT.TABLE, label: '表格视图', icon: 'el-icon-s-grid' },
  { value: OUTPUT_FORMAT.GANTT, label: '甘特图', icon: 'el-icon-data-line' }
]

// 自动刷新间隔（毫秒）
export const AUTO_REFRESH_INTERVAL = 30000 // 30秒

// ========== 业务规则配置（保留用于业务逻辑） ==========

// 状态流转规则 - 定义从当前状态可以转换到哪些目标状态
// 基于生产计划业务流程说明.md中的状态转换规则
export const STATUS_TRANSITION_RULES = {
  RECEIVED: ['CONFIRMED', 'PENDING_APPROVAL', 'CANCELLED'],
  CONFIRMED: ['PARTIALLY_RELEASED', 'PENDING_APPROVAL', 'RELEASED', 'CANCELLED'],
  PENDING_APPROVAL: ['RELEASED', 'CANCELLED', 'CONFIRMED', 'RECEIVED', 'PARTIALLY_RELEASED', 'IN_PROGRESS'],
  PARTIALLY_RELEASED: ['RELEASED', 'IN_PROGRESS', 'PENDING_APPROVAL', 'CANCELLED'],
  RELEASED: ['IN_PROGRESS', 'PENDING_APPROVAL', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED', 'PENDING_APPROVAL', 'CANCELLED'],
  COMPLETED: [], // 终态,不可转换
  CANCELLED: [] // 终态,不可转换
}

// 关键状态变更（需要审批）
export const CRITICAL_STATUS_CHANGES = ['RELEASED', 'CANCELLED']

// ========== 说明：已废弃的常量 ==========

/**
 * ⚠️ 以下常量已全部废弃，请使用字典系统替代
 *
 * 使用方式：
 * 1. 在组件中引入 mixin
 *    import dictionaryMixin from '../mixins/dictionary'
 *
 * 2. 注册 mixin
 *    export default {
 *      mixins: [dictionaryMixin],
 *      async created() {
 *        await this.loadProductionPlanDictionary()
 *      }
 *    }
 *
 * 3. 使用字典方法
 *    - 获取标签：this.getPlanStatusLabel(status)
 *    - 获取选项：this.planStatusOptions
 *    - 获取审批状态标签：this.getApprovalStatusLabel(status)
 *    - 获取审批状态选项：this.approvalStatusOptions
 *
 * 📋 已废弃常量列表（已移除）：
 * - PLAN_STATUS_MAP → 使用 this.getPlanStatusLabel(status)
 * - PLAN_STATUS_OPTIONS → 使用 this.planStatusOptions
 * - PLAN_SOURCE_MAP → 使用 this.getPlanSourceLabel(source)
 * - PLAN_SOURCE_OPTIONS → 使用 this.planSourceOptions
 * - PLAN_PRIORITY_MAP → 使用 this.getPlanPriorityLabel(priority)
 * - PLAN_PRIORITY_OPTIONS → 使用 this.planPriorityOptions
 * - ITEM_STATUS_MAP → 使用 this.getPlanItemStatusLabel(status)
 * - ITEM_STATUS_OPTIONS → 使用 this.planItemStatusOptions
 * - APPROVAL_STATUS_MAP → 使用 this.getApprovalStatusLabel(status)
 * - APPROVAL_STATUS_OPTIONS → 使用 this.approvalStatusOptions
 */

