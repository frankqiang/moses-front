/**
 * 文件名称：audit-logs-config.js
 * 文件描述：审计日志查询页面配置
 * 创建日期：2025-10-23
 * 修改记录：
 *   - 2025-10-23: 初始创建，用于审计日志页面重构
 */

import {
  CHANGE_TYPE,
  CHANGE_TYPE_TAG_TYPE_MAP,
  OPERATION_SOURCE,
  OPERATION_SOURCE_MAP,
  OPERATION_SOURCE_OPTIONS
} from './production-plan-management'

// ========== 审计日志表格配置 ==========

/**
 * 审计日志表格列配置
 * 参考接口文档：获取生产计划审计日志接口详细说明_已重构.md
 */
export const AUDIT_LOG_TABLE_COLUMNS = [
  {
    prop: 'createdAt',
    label: '操作时间',
    width: 160,
    sortable: 'custom',
    fixed: false,
    slotName: 'createdAt'
  },
  {
    prop: 'planId',
    label: '主计划ID',
    width: 120,
    showOverflowTooltip: true,
    slotName: 'planId'
  },
  {
    prop: 'planItemId',
    label: '子批次ID',
    width: 120,
    showOverflowTooltip: true,
    slotName: 'planItemId'
  },
  {
    prop: 'changeType',
    label: '变更类型',
    width: 140,
    slotName: 'changeType'
  },
  {
    prop: 'operatorName',
    label: '操作人',
    width: 100,
    slotName: 'operatorName'
  },
  {
    prop: 'operationSource',
    label: '操作来源',
    width: 100,
    slotName: 'operationSource'
  },
  {
    prop: 'operatorIp',
    label: '操作IP',
    width: 130,
    slotName: 'operatorIp'
  },
  {
    prop: 'changeDescription',
    label: '变更说明',
    minWidth: 200,
    showOverflowTooltip: true,
    slotName: 'changeDescription'
  },
  {
    prop: 'actions',
    label: '操作',
    width: 100,
    fixed: 'right',
    slotName: 'actions'
  }
]

/**
 * 默认显示的列
 */
export const AUDIT_LOG_DEFAULT_VISIBLE_COLUMNS = [
  'createdAt',
  'planId',
  'changeType',
  'operatorName',
  'operationSource',
  'changeDescription',
  'actions'
]

/**
 * 表格工具栏配置
 */
export const AUDIT_LOG_TABLE_TOOLBAR_CONFIG = {
  enableColumnSettings: true,
  enableBatchActions: false,
  enableExport: false,
  enableRefresh: true,
  refreshFeedbackMode: 'all'
}

// ========== 审计日志搜索表单配置 ==========

/**
 * 变更类型选项（完全符合接口文档附录的变更类型枚举）
 */
export const CHANGE_TYPE_OPTIONS = [
  { value: CHANGE_TYPE.SPLIT, label: '拆分' },
  { value: CHANGE_TYPE.MERGE, label: '合并' },
  { value: CHANGE_TYPE.ADJUST, label: '调整' },
  { value: CHANGE_TYPE.STATUS_UPDATE, label: '状态更新' },
  { value: CHANGE_TYPE.PROGRESS_SYNC, label: '进度同步' },
  { value: CHANGE_TYPE.STATUS_UPDATE_REQUESTED, label: '状态更新请求' },
  { value: CHANGE_TYPE.STATUS_UPDATE_APPROVED, label: '状态更新批准' },
  { value: CHANGE_TYPE.STATUS_UPDATE_REJECTED, label: '状态更新拒绝' },
  { value: CHANGE_TYPE.STATUS_UPDATE_CANCELLED, label: '状态更新取消' }
]

/**
 * 变更类型文本映射（用于显示）
 */
export const CHANGE_TYPE_TEXT_MAP = {
  [CHANGE_TYPE.SPLIT]: '拆分',
  [CHANGE_TYPE.MERGE]: '合并',
  [CHANGE_TYPE.ADJUST]: '调整',
  [CHANGE_TYPE.STATUS_UPDATE]: '状态更新',
  [CHANGE_TYPE.PROGRESS_SYNC]: '进度同步',
  [CHANGE_TYPE.STATUS_UPDATE_REQUESTED]: '状态更新请求',
  [CHANGE_TYPE.STATUS_UPDATE_APPROVED]: '状态更新批准',
  [CHANGE_TYPE.STATUS_UPDATE_REJECTED]: '状态更新拒绝',
  [CHANGE_TYPE.STATUS_UPDATE_CANCELLED]: '状态更新取消'
}

/**
 * 操作来源标签类型映射
 */
export const OPERATION_SOURCE_TYPE_MAP = {
  [OPERATION_SOURCE.ERP_SYNC]: 'warning',
  [OPERATION_SOURCE.MANUAL]: 'primary',
  [OPERATION_SOURCE.SYSTEM]: 'success'
}

/**
 * 搜索表单配置（用于SearchForm组件）
 */
export const AUDIT_LOG_SEARCH_FORM_CONFIG = [
  {
    type: 'input',
    prop: 'planId',
    label: '生产计划',
    placeholder: '请输入计划ID',
    clearable: true,
    priority: 'primary',
    prefixIcon: 'el-icon-search'
  },
  {
    type: 'input',
    prop: 'planItemId',
    label: '子批次ID',
    placeholder: '请输入子批次ID',
    clearable: true,
    priority: 'advanced',
    prefixIcon: 'el-icon-search'
  },
  {
    type: 'input',
    prop: 'operatorId',
    label: '操作人',
    placeholder: '请输入操作人ID或姓名',
    clearable: true,
    priority: 'primary',
    prefixIcon: 'el-icon-user'
  },
  {
    type: 'select',
    prop: 'changeType',
    label: '变更类型',
    placeholder: '请选择变更类型',
    clearable: true,
    priority: 'primary',
    options: CHANGE_TYPE_OPTIONS
  },
  {
    type: 'select',
    prop: 'operationSource',
    label: '操作来源',
    placeholder: '请选择操作来源',
    clearable: true,
    priority: 'advanced',
    options: OPERATION_SOURCE_OPTIONS
  },
  {
    type: 'date',
    prop: 'timeRange',
    label: '操作时间',
    startPlaceholder: '开始时间',
    endPlaceholder: '结束时间',
    clearable: true,
    priority: 'primary',
    dateType: 'datetimerange',
    rangeSeparator: '至',
    valueFormat: 'yyyy-MM-dd HH:mm:ss',
    defaultTime: ['00:00:00', '23:59:59']
  }
]

// ========== 默认配置 ==========

/**
 * 默认分页配置
 */
export const AUDIT_LOG_DEFAULT_PAGINATION = {
  page: 1,
  limit: 20
}

/**
 * 默认排序
 */
export const AUDIT_LOG_DEFAULT_SORT = 'createdAt:desc'

/**
 * 列配置存储Key
 */
export const AUDIT_LOG_COLUMN_SETTINGS_KEY = 'productionPlanAuditLogsColumns'

// ========== 状态配置 ==========

/**
 * 变更类型状态配置（用于StatusTag组件）
 */
export const CHANGE_TYPE_STATUS_CONFIG = {
  textMap: CHANGE_TYPE_TEXT_MAP,
  typeMap: CHANGE_TYPE_TAG_TYPE_MAP
}

/**
 * 操作来源状态配置（用于StatusTag组件）
 */
export const OPERATION_SOURCE_STATUS_CONFIG = {
  textMap: OPERATION_SOURCE_MAP,
  typeMap: OPERATION_SOURCE_TYPE_MAP
}

// ========== 导出配置 ==========

export {
  CHANGE_TYPE,
  CHANGE_TYPE_TAG_TYPE_MAP,
  OPERATION_SOURCE,
  OPERATION_SOURCE_MAP,
  OPERATION_SOURCE_OPTIONS
}

