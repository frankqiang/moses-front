/**
 * 文件名称：table-config.js
 * 文件描述：料垛管理模块表格配置
 * 创建日期：2025-01-10
 * 修改记录:
 *   - 2025-01-10: 初始创建，定义料垛表格的列配置
 */

import {
  STACK_STATUS_CONFIG
} from './stack-management'

// ==================== 料垛表格列配置 ====================
export const STACK_TABLE_COLUMNS = [
  {
    prop: 'stackCode',
    label: '料垛编号',
    sortable: true,
    minWidth: 180,
    fixed: 'left',
    align: 'center',
    showOverflowTooltip: true,
    slotName: 'stackCode'
  },
  {
    prop: 'binSpecificationCode',
    label: '规格代码',
    sortable: true,
    minWidth: 140,
    align: 'center',
    showOverflowTooltip: true
  },
  {
    prop: 'productCode',
    label: '产品代码',
    sortable: true,
    minWidth: 180,
    align: 'left',
    showOverflowTooltip: true
  },
  {
    prop: 'batchNumber',
    label: '批次号',
    sortable: true,
    minWidth: 160,
    align: 'center',
    showOverflowTooltip: true
  },
  {
    prop: 'totalWeight',
    label: '总重量 (kg)',
    sortable: true,
    minWidth: 120,
    align: 'right',
    showOverflowTooltip: true,
    formatter: (row) => (row.totalWeight ? row.totalWeight.toFixed(3) : '-')
  },
  {
    prop: 'binCount',
    label: '料框数量',
    sortable: true,
    minWidth: 100,
    align: 'center',
    showOverflowTooltip: true
  },
  {
    prop: 'stackLayers',
    label: '堆叠层数',
    sortable: true,
    minWidth: 100,
    align: 'center',
    showOverflowTooltip: true
  },
  {
    prop: 'status',
    label: '状态',
    sortable: true,
    minWidth: 120,
    align: 'center',
    slotName: 'status',
    showOverflowTooltip: false
  },
  {
    prop: 'currentLocationId',
    label: '当前位置',
    sortable: false,
    minWidth: 140,
    align: 'center',
    showOverflowTooltip: true,
    slotName: 'currentLocation'
  },
  {
    prop: 'stackedAt',
    label: '组垛时间',
    sortable: true,
    minWidth: 180,
    align: 'center',
    type: 'datetime',
    format: '{y}-{m}-{d} {h}:{i}:{s}',
    showOverflowTooltip: true
  },
  {
    prop: 'updatedAt',
    label: '更新时间',
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
    minWidth: 240,
    fixed: 'right',
    slotName: 'actions',
    showOverflowTooltip: false
  }
]

// 料垛表格默认可见列
export const STACK_DEFAULT_VISIBLE_COLUMNS = [
  'stackCode',
  'binSpecificationCode',
  'productCode',
  'batchNumber',
  'totalWeight',
  'binCount',
  'stackLayers',
  'status',
  'currentLocation',
  'stackedAt',
  'actions'
]

// ==================== 料垛状态配置（用于StatusTag组件） ====================
export const STACK_STATUS_TAG_CONFIG = STACK_STATUS_CONFIG

// ==================== 表格工具栏配置 ====================
export const STACK_TABLE_TOOLBAR_CONFIG = {
  enableColumnSettings: true,
  enableBatchActions: false,
  enableExport: true,
  enableImport: false,
  enableRefresh: true,
  refreshFeedbackMode: 'all',
  enableDensity: true,
  columnSettings: {
    cacheKey: 'stackManagementTableColumns'
  }
}

