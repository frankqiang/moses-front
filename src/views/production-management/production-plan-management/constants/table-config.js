/**
 * 文件名称：table-config.js
 * 文件描述：生产计划管理表格配置
 * 创建日期：2025-01-21
 * 修改记录：
 *   - 2025-01-21: 初始创建
 */

import {
  PLAN_STATUS_MAP,
  PLAN_STATUS_TYPE_MAP,
  PLAN_SOURCE_MAP,
  PLAN_PRIORITY_MAP,
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
    minWidth: 100,
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
    minWidth: 200,
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
  'createdAt'
]

// 状态配置
export const STATUS_CONFIG = {
  textMap: PLAN_STATUS_MAP,
  typeMap: PLAN_STATUS_TYPE_MAP
}

// 来源配置
export const SOURCE_CONFIG = {
  textMap: PLAN_SOURCE_MAP
}

// 优先级配置
export const PRIORITY_CONFIG = {
  textMap: PLAN_PRIORITY_MAP,
  typeMap: PLAN_PRIORITY_TYPE_MAP
}

// 表格工具栏配置
export const TABLE_TOOLBAR_CONFIG = {
  enableRefresh: true,
  enableExport: false,
  enableColumnSettings: true,
  enableBatchActions: false,
  refreshFeedbackMode: 'silent'
}

