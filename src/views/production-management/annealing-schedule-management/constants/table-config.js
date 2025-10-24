/**
 * 文件名称：table-config.js
 * 文件描述：排程方案列表表格配置
 * 创建日期：2025-10-23
 * 修改记录：
 *   - 2025-10-23: 初始创建，定义表格列配置
 *   - 2025-10-24: 更新字段名称以匹配后端接口（planNumber→planCode，scheduleItemCount→taskCount）
 */

// 表格列配置
export const TABLE_COLUMNS = [
  {
    prop: 'planCode',
    label: '方案编号',
    width: 200,
    sortable: false,
    slotName: 'planCode'
  },
  {
    prop: 'planName',
    label: '方案名称',
    minWidth: 200,
    sortable: false
  },
  {
    prop: 'statusLabel',
    label: '状态',
    width: 100,
    sortable: false,
    slotName: 'status'
  },
  {
    prop: 'scheduleTimeRange',
    label: '排程时间范围',
    width: 220,
    sortable: false,
    slotName: 'scheduleTimeRange'
  },
  {
    prop: 'algorithmTypeLabel',
    label: '算法类型',
    width: 180,
    sortable: false
  },
  {
    prop: 'utilizationRate',
    label: '利用率',
    width: 100,
    sortable: true,
    slotName: 'utilizationRate'
  },
  {
    prop: 'loadRate',
    label: '装载率',
    width: 100,
    sortable: true,
    slotName: 'loadRate'
  },
  {
    prop: 'deliveryAchievementRate',
    label: '交期达成率',
    width: 120,
    sortable: true,
    slotName: 'deliveryAchievementRate'
  },
  {
    prop: 'taskCount',
    label: '任务数量',
    width: 100,
    sortable: false
  },
  {
    prop: 'conflictCount',
    label: '冲突数',
    width: 90,
    sortable: false,
    slotName: 'conflictCount'
  },
  {
    prop: 'createdAt',
    label: '创建时间',
    width: 160,
    sortable: true
  },
  {
    prop: 'createdBy',
    label: '创建人',
    width: 100,
    sortable: false
  },
  {
    prop: 'publishedAt',
    label: '发布时间',
    width: 160,
    sortable: false
  },
  {
    prop: 'actions',
    label: '操作',
    width: 220,
    fixed: 'right',
    slotName: 'actions',
    showOverflowTooltip: false
  }
]

// 默认可见列
export const DEFAULT_VISIBLE_COLUMNS = [
  'planCode',
  'planName',
  'statusLabel',
  'scheduleTimeRange',
  'algorithmTypeLabel',
  'utilizationRate',
  'loadRate',
  'deliveryAchievementRate',
  'conflictCount',
  'createdAt',
  'actions'
]

// 表格工具栏配置
export const TABLE_TOOLBAR_CONFIG = {
  enableRefresh: true,
  enableExport: true,
  enableColumnSettings: true,
  enableBatchActions: true,
  refreshFeedbackMode: 'error' // 可选值: 'all' | 'error' | 'none'
}

