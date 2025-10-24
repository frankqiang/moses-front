/**
 * 文件名称：table-config.js
 * 文件描述：维护记录表格配置
 * 创建日期：2025-01-20
 * 修改记录：
 *   - 2025-01-20: 初始创建，定义表格列配置
 */

// 表格列配置
export const TABLE_COLUMNS = [
  {
    prop: 'recordCode',
    label: '记录编码',
    width: 200,
    sortable: 'custom',
    slotName: 'recordCode',
    fixed: 'left'
  },
  {
    prop: 'equipmentCode',
    label: '设备编码',
    width: 140,
    sortable: false,
    slotName: 'equipmentCode'
  },
  {
    prop: 'equipmentName',
    label: '设备名称',
    width: 140,
    sortable: false,
    slotName: 'equipmentName'
  },
  {
    prop: 'maintenanceType',
    label: '维护类型',
    width: 120,
    sortable: 'custom',
    slotName: 'maintenanceType'
  },
  {
    prop: 'maintenanceDate',
    label: '维护日期',
    width: 180,
    sortable: 'custom',
    slotName: 'maintenanceDate'
  },
  {
    prop: 'executorName',
    label: '执行人员',
    width: 120,
    sortable: false,
    slotName: 'executorName'
  },
  {
    prop: 'workHours',
    label: '维护工时',
    width: 120,
    sortable: 'custom',
    slotName: 'workHours',
    align: 'right'
  },
  {
    prop: 'confirmerName',
    label: '确认人员',
    width: 120,
    sortable: false,
    slotName: 'confirmerName'
  },
  {
    prop: 'maintenanceContent',
    label: '维护内容',
    width: 200,
    sortable: false,
    slotName: 'maintenanceContent',
    showOverflowTooltip: true
  },
  {
    prop: 'updatedAt',
    label: '更新时间',
    width: 180,
    sortable: 'custom',
    slotName: 'updatedAt'
  },
  {
    prop: 'actions',
    label: '操作',
    width: 120,
    slotName: 'actions',
    fixed: 'right'
  }
]

// 默认显示列（P0阶段核心字段）
export const DEFAULT_VISIBLE_COLUMNS = [
  'recordCode',
  'equipmentCode',
  'equipmentName',
  'maintenanceType',
  'maintenanceDate',
  'executorName',
  'workHours',
  'actions'
]

// 表格工具栏配置
export const TABLE_TOOLBAR_CONFIG = {
  enableRefresh: true,
  enableExport: false,
  enableColumnSettings: true,
  enableBatchActions: false,
  refreshFeedbackMode: 'message'
}

