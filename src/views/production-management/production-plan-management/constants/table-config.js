/**
 * 文件名称：table-config.js
 * 文件描述：生产计划管理表格配置
 * 创建日期：2025-01-21
 * 修改记录：
 *   - 2025-01-21: 初始创建
 *   - 2025-01-21: STATUS_CONFIG等配置已废弃，请使用字典系统
 */

import {
  PLAN_STATUS_TYPE_MAP,
  PLAN_PRIORITY_TYPE_MAP
} from './production-plan-management'

// 表格列配置
export const TABLE_COLUMNS = [
  {
    prop: 'planNumber',
    label: '计划编号',
    minWidth: 140,
    sortable: 'custom',
    fixed: 'left',
    slotName: 'planNumber',
    showOverflowTooltip: true
  },
  {
    prop: 'externalOrderNumber',
    label: '外部订单号',
    minWidth: 140,
    sortable: false,
    showOverflowTooltip: true
  },
  {
    prop: 'source',
    label: '来源',
    minWidth: 100,
    sortable: false,
    slotName: 'source'
  },
  {
    prop: 'productCode',
    label: '产品编码',
    minWidth: 140,
    sortable: false,
    showOverflowTooltip: true
  },
  {
    prop: 'productName',
    label: '产品名称',
    minWidth: 150,
    sortable: false,
    showOverflowTooltip: true
  },
  {
    prop: 'demandQuantity',
    label: '需求数量',
    minWidth: 120,
    sortable: 'custom',
    align: 'right',
    slotName: 'demandQuantity'
  },
  {
    prop: 'demandUnit',
    label: '需求单位',
    minWidth: 80,
    sortable: false
  },
  {
    prop: 'plannedDeliveryDate',
    label: '计划交期',
    minWidth: 160,
    sortable: 'custom',
    slotName: 'plannedDeliveryDate'
  },
  {
    prop: 'customerName',
    label: '客户名称',
    minWidth: 140,
    sortable: false,
    showOverflowTooltip: true
  },
  {
    prop: 'planPriority',
    label: '优先级',
    minWidth: 90,
    sortable: 'custom',
    slotName: 'planPriority'
  },
  {
    prop: 'status',
    label: '状态',
    minWidth: 100,
    sortable: false,
    slotName: 'status'
  },
  {
    prop: 'isFrozen',
    label: '冻结状态',
    minWidth: 90,
    sortable: false,
    slotName: 'isFrozen'
  },
  {
    prop: 'currentProgressPercentage',
    label: '完成进度',
    minWidth: 150,
    sortable: 'custom',
    slotName: 'progress'
  },
  {
    prop: 'createdAt',
    label: '创建时间',
    minWidth: 160,
    sortable: 'custom',
    slotName: 'createdAt'
  },
  {
    prop: 'actions',
    label: '操作',
    minWidth: 300,
    fixed: 'right',
    slotName: 'actions'
  }
]

// 默认显示的列
export const DEFAULT_VISIBLE_COLUMNS = [
  'planNumber',
  'externalOrderNumber',
  'source',
  'productCode',
  'productName',
  'demandQuantity',
  'demandUnit',
  'plannedDeliveryDate',
  'customerName',
  'planPriority',
  'status',
  'currentProgressPercentage',
  'createdAt',
  'actions' // 操作列默认显示，但用户可以通过列设置隐藏
]

/**
 * @deprecated 已废弃：请使用字典系统
 * 在组件中使用: this.getPlanStatusLabel(status) 获取文本
 * 使用 PLAN_STATUS_TYPE_MAP 获取颜色类型
 */
export const STATUS_CONFIG = {
  textMap: {}, // 废弃，使用字典系统
  typeMap: PLAN_STATUS_TYPE_MAP
}

/**
 * @deprecated 已废弃：请使用字典系统
 * 在组件中使用: this.getPlanSourceLabel(source)
 */
export const SOURCE_CONFIG = {
  textMap: {} // 废弃，使用字典系统
}

/**
 * @deprecated 已废弃：请使用字典系统
 * 在组件中使用: this.getPlanPriorityLabel(priority) 获取文本
 * 使用 PLAN_PRIORITY_TYPE_MAP 获取颜色类型
 */
export const PRIORITY_CONFIG = {
  textMap: {}, // 废弃，使用字典系统
  typeMap: PLAN_PRIORITY_TYPE_MAP
}

// 表格工具栏配置
export const TABLE_TOOLBAR_CONFIG = {
  enableRefresh: true,
  enableExport: false,
  enableColumnSettings: true,
  enableBatchActions: false,
  refreshFeedbackMode: 'none' // 静默模式：不显示任何反馈提示
}

