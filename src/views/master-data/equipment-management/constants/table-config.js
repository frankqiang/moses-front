/**
 * 文件名称：table-config.js
 * 文件描述：设备主数据管理模块表格列配置与辅助常量
 * 创建日期：2025-09-28
 * 修改记录：
 *   - 2025-09-28: 初始创建，补充核心列配置以及状态、列可见性设置
 */

import { EQUIPMENT_STATUS_CONFIG, EQUIPMENT_TYPE_MAP } from './equipment-management'

// 表格列配置 - 对接 BaseTable 组件
export const TABLE_COLUMNS = [
  {
    columnId: 'equipmentCode',
    prop: 'equipmentCode',
    label: '设备编号',
    minWidth: 140,
    sortable: true,
    align: 'left',
    fixed: 'left',
    showOverflowTooltip: true
  },
  {
    columnId: 'name',
    prop: 'name',
    label: '设备名称',
    minWidth: 160,
    sortable: true,
    align: 'left',
    showOverflowTooltip: true
  },
  {
    columnId: 'equipmentType',
    prop: 'equipmentType',
    label: '设备类型',
    minWidth: 140,
    sortable: true,
    align: 'center',
    slotName: 'equipmentType',
    formatter: (row) => EQUIPMENT_TYPE_MAP[row.equipmentType] || row.equipmentType
  },
  {
    columnId: 'status',
    prop: 'status',
    label: '状态',
    minWidth: 120,
    sortable: true,
    align: 'center',
    type: 'status',
    slotName: 'status'
  },
  {
    columnId: 'communicationEndpoint',
    prop: 'communicationEndpoint',
    label: '通讯端点',
    minWidth: 220,
    align: 'left',
    showOverflowTooltip: true
  },
  {
    columnId: 'plcNodeIdMasked',
    prop: 'plcNodeIdMasked',
    label: 'PLC 节点',
    minWidth: 160,
    align: 'left',
    showOverflowTooltip: true
  },
  {
    columnId: 'nextMaintenanceDate',
    prop: 'nextMaintenanceDate',
    label: '下次维护日期',
    minWidth: 160,
    align: 'center',
    sortable: true,
    type: 'date',
    format: 'yyyy-MM-dd'
  },
  {
    columnId: 'equipmentDetail',
    prop: 'detail',
    label: '关键指标',
    minWidth: 220,
    align: 'left',
    slotName: 'detailSummary',
    showOverflowTooltip: true
  },
  {
    columnId: 'updatedAt',
    prop: 'updatedAt',
    label: '更新时间',
    minWidth: 180,
    align: 'center',
    sortable: true,
    type: 'datetime',
    format: '{y}-{m}-{d} {h}:{i}'
  },
  {
    columnId: 'actions',
    prop: 'actions',
    label: '操作',
    minWidth: 200,
    fixed: 'right',
    slotName: 'actions'
  }
]

// 默认可见列配置
export const DEFAULT_VISIBLE_COLUMNS = [
  'equipmentCode',
  'name',
  'equipmentType',
  'status',
  'communicationEndpoint',
  'plcNodeIdMasked',
  'nextMaintenanceDate',
  'equipmentDetail',
  'actions'
]

// 状态配置 - 直接复用基础常量
export const STATUS_CONFIG = EQUIPMENT_STATUS_CONFIG

// 列配置版本（用于 table-config-store 持久化）
export const TABLE_CONFIG_VERSION = 'v1.0.0'
