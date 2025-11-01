/**
 * 文件名称：table-config.js
 * 文件描述：备件列表表格配置
 * 创建日期：2025-01-21
 * 修改记录：
 *   - 2025-01-21: 初始创建
 */

import { INVENTORY_STATUS_CONFIG } from './spare-part-management'

// 表格列配置
export const TABLE_COLUMNS = [
  {
    prop: 'sparePartCode',
    label: '备件编码',
    minWidth: 140,
    sortable: true,
    fixed: 'left',
    showOverflowTooltip: true
  },
  {
    prop: 'sparePartName',
    label: '备件名称',
    minWidth: 150,
    sortable: true,
    showOverflowTooltip: true
  },
  {
    prop: 'specification',
    label: '规格型号',
    minWidth: 130,
    showOverflowTooltip: true
  },
  {
    prop: 'applicableEquipmentTypes',
    label: '适用设备类型',
    minWidth: 150,
    showOverflowTooltip: true
  },
  {
    prop: 'unitPrice',
    label: '单价（元）',
    minWidth: 110,
    align: 'right',
    slotName: 'unitPrice'
  },
  {
    prop: 'unit',
    label: '计量单位',
    minWidth: 100
  },
  {
    prop: 'currentQuantity',
    label: '当前库存',
    minWidth: 110,
    align: 'right',
    slotName: 'currentQuantity'
  },
  {
    prop: 'safetyStock',
    label: '安全库存',
    minWidth: 100,
    align: 'right'
  },
  {
    prop: 'inventoryStatus',
    label: '库存状态',
    minWidth: 100,
    slotName: 'inventoryStatus'
  },
  {
    prop: 'storageLocation',
    label: '存储位置',
    minWidth: 130,
    showOverflowTooltip: true
  },
  {
    prop: 'supplierName',
    label: '供应商',
    minWidth: 140,
    showOverflowTooltip: true,
    slotName: 'supplierName'
  },
  {
    prop: 'createdAt',
    label: '创建时间',
    minWidth: 160,
    sortable: true
  },
  {
    prop: 'updatedAt',
    label: '更新时间',
    minWidth: 160,
    sortable: true
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
  'sparePartCode',
  'sparePartName',
  'specification',
  'applicableEquipmentTypes',
  'unitPrice',
  'unit',
  'currentQuantity',
  'safetyStock',
  'inventoryStatus',
  'actions'
]

// 库存状态配置（重新导出）
export const STATUS_CONFIG = INVENTORY_STATUS_CONFIG

// 表格工具栏配置
export const TABLE_TOOLBAR_CONFIG = {
  enableRefresh: true,
  enableExport: false,
  enableColumnSettings: true,
  enableBatchActions: false,
  refreshFeedbackMode: 'message'
}

