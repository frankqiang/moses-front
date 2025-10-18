/**
 * 文件名称：table-config.js
 * 文件描述：维护计划管理表格配置
 * 创建日期：2025-10-15
 * 修改记录：
 *   - 2025-10-15: 初始创建
 */

// 表格列配置
export const TABLE_COLUMNS = [
  {
    prop: 'planCode',
    label: '计划编码',
    minWidth: 180,
    sortable: 'custom',
    fixed: 'left',
    showOverflowTooltip: true
  },
  {
    prop: 'planName',
    label: '计划名称',
    minWidth: 200,
    sortable: 'custom',
    showOverflowTooltip: true
  },
  {
    prop: 'equipment',
    label: '关联设备',
    minWidth: 200,
    sortable: false,
    slotName: 'equipment'
  },
  {
    prop: 'maintenanceType',
    label: '维护类型',
    width: 120,
    sortable: 'custom',
    slotName: 'maintenanceType'
  },
  {
    prop: 'cycleInfo',
    label: '维护周期',
    minWidth: 150,
    sortable: false,
    slotName: 'cycleInfo'
  },
  {
    prop: 'standardDurationHours',
    label: '标准工时',
    width: 120,
    sortable: 'custom',
    slotName: 'standardDurationHours'
  },
  {
    prop: 'status',
    label: '状态',
    width: 100,
    sortable: 'custom',
    fixed: 'right',
    slotName: 'status'
  },
  {
    prop: 'actions',
    label: '操作',
    width: 250,
    fixed: 'right',
    slotName: 'actions',
    showOverflowTooltip: false
  }
]
