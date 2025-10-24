/**
 * 文件名称：table-config.js
 * 文件描述：设备故障管理模块表格配置
 * 创建日期：2025-01-20
 * 修改记录：
 *   - 2025-01-20: 初始创建
 */

import {
  FAILURE_LEVEL_CONFIG,
  FAILURE_STATUS_CONFIG
} from './equipment-fault'

// 表格列配置（按业务优先级排序）
export const TABLE_COLUMNS = [
  {
    prop: 'failureCode',
    label: '故障编码',
    sortable: true,
    minWidth: 180,
    fixed: 'left',
    align: 'left',
    showOverflowTooltip: true,
    slotName: 'failureCode'
  },
  {
    prop: 'equipmentCode',
    label: '设备编码',
    sortable: false,
    minWidth: 140,
    align: 'left',
    showOverflowTooltip: true
  },
  {
    prop: 'equipmentName',
    label: '设备名称',
    sortable: false,
    minWidth: 160,
    align: 'left',
    showOverflowTooltip: true
  },
  {
    prop: 'failureDescription',
    label: '故障描述',
    sortable: false,
    minWidth: 240,
    align: 'left',
    showOverflowTooltip: true
  },
  {
    prop: 'failureLevel',
    label: '故障等级',
    sortable: true,
    minWidth: 120,
    align: 'center',
    slotName: 'failureLevel',
    showOverflowTooltip: false
  },
  {
    prop: 'impactDegree',
    label: '影响程度',
    sortable: false,
    minWidth: 120,
    align: 'center',
    showOverflowTooltip: true
  },
  {
    prop: 'failureType',
    label: '故障类型',
    sortable: true,
    minWidth: 120,
    align: 'center',
    showOverflowTooltip: true
  },
  {
    prop: 'status',
    label: '处理状态',
    sortable: true,
    minWidth: 120,
    align: 'center',
    slotName: 'status',
    showOverflowTooltip: false
  },
  {
    prop: 'isRepeatFailure',
    label: '重复故障',
    sortable: false,
    minWidth: 100,
    align: 'center',
    slotName: 'isRepeatFailure',
    showOverflowTooltip: false
  },
  {
    prop: 'mttrHours',
    label: 'MTTR(小时)',
    sortable: true,
    minWidth: 120,
    align: 'center',
    showOverflowTooltip: true,
    slotName: 'mttrHours'
  },
  {
    prop: 'reporterName',
    label: '报告人',
    sortable: false,
    minWidth: 120,
    align: 'center',
    showOverflowTooltip: true
  },
  {
    prop: 'repairerName',
    label: '处理人',
    sortable: false,
    minWidth: 120,
    align: 'center',
    showOverflowTooltip: true
  },
  {
    prop: 'failureTime',
    label: '故障时间',
    sortable: true,
    minWidth: 180,
    align: 'center',
    type: 'datetime',
    format: '{y}-{m}-{d} {h}:{i}:{s}',
    showOverflowTooltip: true
  },
  {
    prop: 'actions',
    label: '操作',
    minWidth: 220,
    fixed: 'right',
    slotName: 'actions',
    showOverflowTooltip: false
  }
]

// 默认可见列
export const DEFAULT_VISIBLE_COLUMNS = [
  'failureCode',
  'equipmentCode',
  'equipmentName',
  'failureDescription',
  'failureLevel',
  'impactDegree',
  'failureType',
  'status',
  'isRepeatFailure',
  'mttrHours',
  'reporterName',
  'failureTime',
  'actions'
]

// 表格工具栏配置
export const TABLE_TOOLBAR_CONFIG = {
  enableColumnSettings: true,
  enableBatchActions: false,
  enableExport: false,
  enableImport: false,
  enableRefresh: true,
  refreshFeedbackMode: 'all',
  enableDensity: true,
  columnSettings: {
    cacheKey: 'equipmentFaultTableColumns'
  }
}

// 导出配置
export { FAILURE_LEVEL_CONFIG, FAILURE_STATUS_CONFIG }

