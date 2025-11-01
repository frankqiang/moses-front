/**
 * 文件名称：table-config.js
 * 文件描述：退火任务管理模块表格配置
 * 创建日期：2025-10-18
 * 修改记录：
 *   - 2025-10-18: 初始创建，定义表格列、状态配置及工具栏配置
 *   - 2025-10-31: 更新待排程任务表格列配置，新增工艺模板、生产计划等相关列，删除重复的"要求完成日期"列
 *   - 2025-11-01: 新增排程状态（schedulingStatus）列配置，并添加到默认可见列中
 */

import { TASK_STATUS } from './annealing-task'

// 表格列配置（按业务优先级排序）
export const TABLE_COLUMNS = [
  {
    prop: 'taskCode',
    label: '任务编号',
    sortable: true,
    minWidth: 200,
    fixed: 'left',
    align: 'left',
    showOverflowTooltip: true,
    slotName: 'taskCode'
  },
  {
    prop: 'taskName',
    label: '任务名称',
    sortable: true,
    minWidth: 180,
    align: 'left',
    showOverflowTooltip: true
  },
  {
    prop: 'productCode',
    label: '产品编码',
    sortable: true,
    minWidth: 180,
    align: 'left',
    showOverflowTooltip: true
  },
  {
    prop: 'alloyGrade',
    label: '合金牌号',
    sortable: true,
    minWidth: 120,
    align: 'center',
    showOverflowTooltip: true
  },
  {
    prop: 'processTemplateName',
    label: '工艺模板',
    sortable: false,
    minWidth: 160,
    align: 'left',
    showOverflowTooltip: true,
    slotName: 'processTemplateName'
  },
  {
    prop: 'status',
    label: '任务状态',
    sortable: true,
    minWidth: 120,
    align: 'center',
    slotName: 'status',
    showOverflowTooltip: false
  },
  {
    prop: 'priority',
    label: '优先级',
    sortable: true,
    minWidth: 100,
    align: 'center',
    slotName: 'priority',
    showOverflowTooltip: false
  },
  {
    prop: 'schedulingStatus',
    label: '排程状态',
    sortable: false,
    minWidth: 120,
    align: 'center',
    slotName: 'schedulingStatus',
    showOverflowTooltip: false
  },
  {
    prop: 'isLocked',
    label: '锁定状态',
    sortable: false,
    minWidth: 100,
    align: 'center',
    slotName: 'isLocked',
    showOverflowTooltip: false
  },
  {
    prop: 'plannedWeight',
    label: '计划重量 (吨)',
    sortable: true,
    minWidth: 140,
    align: 'right',
    showOverflowTooltip: true,
    slotName: 'plannedWeight'
  },
  {
    prop: 'plannedQuantity',
    label: '计划数量',
    sortable: true,
    minWidth: 120,
    align: 'center',
    showOverflowTooltip: true,
    slotName: 'plannedQuantity'
  },
  {
    prop: 'actualWeight',
    label: '实际重量 (吨)',
    sortable: true,
    minWidth: 140,
    align: 'right',
    showOverflowTooltip: true,
    slotName: 'actualWeight'
  },
  {
    prop: 'materialCount',
    label: '物料数量',
    sortable: true,
    minWidth: 120,
    align: 'center',
    showOverflowTooltip: true
  },
  {
    prop: 'expectedDurationMinutes',
    label: '预计执行时长',
    sortable: true,
    minWidth: 140,
    align: 'center',
    showOverflowTooltip: true,
    slotName: 'expectedDurationMinutes'
  },
  {
    prop: 'plannedFurnaceCode',
    label: '计划执行炉号',
    sortable: true,
    minWidth: 140,
    align: 'center',
    showOverflowTooltip: true
  },
  {
    prop: 'plannedLoadingAt',
    label: '计划装炉时间',
    sortable: true,
    minWidth: 180,
    align: 'center',
    type: 'datetime',
    format: '{y}-{m}-{d} {h}:{i}',
    showOverflowTooltip: true
  },
  {
    prop: 'plannedUnloadingAt',
    label: '计划出炉时间',
    sortable: true,
    minWidth: 180,
    align: 'center',
    type: 'datetime',
    format: '{y}-{m}-{d} {h}:{i}',
    showOverflowTooltip: true
  },
  {
    prop: 'remarks',
    label: '备注',
    sortable: false,
    minWidth: 200,
    align: 'left',
    showOverflowTooltip: true
  },
  {
    prop: 'scheduleContextTaskCount',
    label: '同炉任务数',
    sortable: false,
    minWidth: 120,
    align: 'center',
    showOverflowTooltip: true,
    slotName: 'scheduleContextTaskCount'
  },
  {
    prop: 'scheduleContextTotalWeight',
    label: '同炉总重量 (吨)',
    sortable: false,
    minWidth: 150,
    align: 'right',
    showOverflowTooltip: true,
    slotName: 'scheduleContextTotalWeight'
  },
  {
    prop: 'scheduleContextCapacityUtilization',
    label: '容量利用率',
    sortable: false,
    minWidth: 120,
    align: 'center',
    showOverflowTooltip: true,
    slotName: 'scheduleContextCapacityUtilization'
  },
  {
    prop: 'planNumber',
    label: '生产计划编号',
    sortable: false,
    minWidth: 180,
    align: 'left',
    showOverflowTooltip: true,
    slotName: 'planNumber'
  },
  {
    prop: 'source',
    label: '任务来源',
    sortable: true,
    minWidth: 120,
    align: 'center',
    slotName: 'source',
    showOverflowTooltip: false
  },
  {
    prop: 'createdAt',
    label: '创建时间',
    sortable: true,
    minWidth: 180,
    align: 'center',
    type: 'datetime',
    format: '{y}-{m}-{d} {h}:{i}:{s}',
    showOverflowTooltip: true
  },
  {
    prop: 'updatedAt',
    label: '最后更新时间',
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
    minWidth: 280,
    fixed: 'right',
    slotName: 'actions',
    showOverflowTooltip: false
  }
]

// 待排程任务表格列配置
// 注意：排序由后端自动固定（优先级 > 计划装炉时间 > 任务编号），不支持前端自定义排序
export const PENDING_TABLE_COLUMNS = [
  {
    prop: 'taskCode',
    label: '任务编号',
    sortable: false,
    minWidth: 200,
    fixed: 'left',
    align: 'left',
    showOverflowTooltip: true,
    slotName: 'taskCode'
  },
  {
    prop: 'taskName',
    label: '任务名称',
    sortable: false,
    minWidth: 180,
    align: 'left',
    showOverflowTooltip: true
  },
  {
    prop: 'productCode',
    label: '产品编码',
    sortable: false,
    minWidth: 160,
    align: 'left',
    showOverflowTooltip: true
  },
  {
    prop: 'productName',
    label: '产品名称',
    sortable: false,
    minWidth: 180,
    align: 'left',
    showOverflowTooltip: true
  },
  {
    prop: 'alloyGrade',
    label: '合金牌号',
    sortable: false,
    minWidth: 120,
    align: 'center',
    showOverflowTooltip: true
  },
  {
    prop: 'mixingGroupCode',
    label: '混炉分组',
    sortable: false,
    minWidth: 140,
    align: 'center',
    showOverflowTooltip: true
  },
  {
    prop: 'processTemplateName',
    label: '工艺模板',
    sortable: false,
    minWidth: 160,
    align: 'left',
    showOverflowTooltip: true
  },
  {
    prop: 'processTemplateVersionNumber',
    label: '工艺版本',
    sortable: false,
    minWidth: 100,
    align: 'center',
    showOverflowTooltip: true
  },
  {
    prop: 'priority',
    label: '优先级',
    sortable: false,
    minWidth: 100,
    align: 'center',
    slotName: 'priority',
    showOverflowTooltip: false
  },
  {
    prop: 'schedulingStatus',
    label: '排程状态',
    sortable: false,
    minWidth: 120,
    align: 'center',
    slotName: 'schedulingStatus',
    showOverflowTooltip: false
  },
  {
    prop: 'plannedWeight',
    label: '计划重量 (吨)',
    sortable: false,
    minWidth: 140,
    align: 'right',
    showOverflowTooltip: true,
    slotName: 'plannedWeight'
  },
  {
    prop: 'actualWeight',
    label: '实际重量 (吨)',
    sortable: false,
    minWidth: 140,
    align: 'right',
    showOverflowTooltip: true,
    slotName: 'actualWeight'
  },
  {
    prop: 'materialCount',
    label: '物料数量',
    sortable: false,
    minWidth: 120,
    align: 'center',
    showOverflowTooltip: true
  },
  {
    prop: 'plannedLoadingAt',
    label: '计划装炉时间',
    sortable: false,
    minWidth: 180,
    align: 'center',
    type: 'datetime',
    format: '{y}-{m}-{d} {h}:{i}',
    showOverflowTooltip: true
  },
  {
    prop: 'plannedUnloadingAt',
    label: '计划出炉时间',
    sortable: false,
    minWidth: 180,
    align: 'center',
    type: 'datetime',
    format: '{y}-{m}-{d} {h}:{i}',
    showOverflowTooltip: true
  },
  {
    prop: 'scheduleLockedUntil',
    label: '锁定截止时间',
    sortable: false,
    minWidth: 180,
    align: 'center',
    type: 'datetime',
    format: '{y}-{m}-{d} {h}:{i}',
    showOverflowTooltip: true,
    slotName: 'scheduleLockedUntil'
  },
  {
    prop: 'schedulePlanId',
    label: '排程方案ID',
    sortable: false,
    minWidth: 200,
    align: 'left',
    showOverflowTooltip: true
  },
  {
    prop: 'expectedDurationMinutes',
    label: '预计执行时长',
    sortable: false,
    minWidth: 140,
    align: 'center',
    slotName: 'expectedDurationMinutes'
  },
  {
    prop: 'estimatedEnergyConsumption',
    label: '预计能耗 (kWh)',
    sortable: false,
    minWidth: 140,
    align: 'center',
    slotName: 'estimatedEnergyConsumption'
  },
  {
    prop: 'planNumber',
    label: '生产计划编号',
    sortable: false,
    minWidth: 180,
    align: 'left',
    showOverflowTooltip: true
  },
  {
    prop: 'customerName',
    label: '客户名称',
    sortable: false,
    minWidth: 180,
    align: 'left',
    showOverflowTooltip: true
  },
  {
    prop: 'deliveryDate',
    label: '交货日期',
    sortable: false,
    minWidth: 140,
    align: 'center',
    type: 'date',
    format: '{y}-{m}-{d}',
    showOverflowTooltip: true,
    slotName: 'deliveryDate'
  },
  {
    prop: 'actions',
    label: '操作',
    minWidth: 280,
    fixed: 'right',
    slotName: 'actions',
    showOverflowTooltip: false
  }
]

// 待排程任务默认可见列
export const PENDING_DEFAULT_VISIBLE_COLUMNS = [
  'taskCode',
  'taskName',
  'productCode',
  'alloyGrade',
  'mixingGroupCode',
  'processTemplateName',
  'priority',
  'schedulingStatus',
  'plannedWeight',
  'materialCount',
  'plannedLoadingAt',
  'scheduleLockedUntil',
  'planNumber',
  'deliveryDate',
  'actions'
]

// 默认可见列
export const DEFAULT_VISIBLE_COLUMNS = [
  'taskCode',
  'taskName',
  'productCode',
  'alloyGrade',
  'processTemplateName',
  'status',
  'priority',
  'schedulingStatus',
  'isLocked',
  'plannedWeight',
  'plannedQuantity',
  'actualWeight',
  'expectedDurationMinutes',
  'plannedFurnaceCode',
  'plannedLoadingAt',
  'plannedUnloadingAt',
  'actions'
]

// 任务状态标签配置
export const STATUS_CONFIG = {
  textMap: {
    [TASK_STATUS.DRAFT]: '草稿',
    [TASK_STATUS.PENDING_SCHEDULE]: '待排程',
    [TASK_STATUS.SCHEDULED]: '已排程',
    [TASK_STATUS.WAITING_LOADING]: '待装炉',
    [TASK_STATUS.LOADING]: '装炉中',
    [TASK_STATUS.WAITING_EXECUTE]: '待执行',
    [TASK_STATUS.IN_PROGRESS]: '执行中',
    [TASK_STATUS.WAITING_UNLOAD]: '待出炉',
    [TASK_STATUS.COMPLETED]: '已完成',
    [TASK_STATUS.PAUSED]: '已暂停',
    [TASK_STATUS.CANCELLED]: '已取消',
    [TASK_STATUS.TERMINATED]: '异常终止'
  },
  typeMap: {
    [TASK_STATUS.DRAFT]: 'info',
    [TASK_STATUS.PENDING_SCHEDULE]: 'primary',
    [TASK_STATUS.SCHEDULED]: 'success',
    [TASK_STATUS.WAITING_LOADING]: 'primary',
    [TASK_STATUS.LOADING]: 'warning',
    [TASK_STATUS.WAITING_EXECUTE]: 'primary',
    [TASK_STATUS.IN_PROGRESS]: 'warning',
    [TASK_STATUS.WAITING_UNLOAD]: 'primary',
    [TASK_STATUS.COMPLETED]: 'success',
    [TASK_STATUS.PAUSED]: 'warning',
    [TASK_STATUS.CANCELLED]: 'danger',
    [TASK_STATUS.TERMINATED]: 'danger'
  }
}

// 任务优先级标签配置
export const PRIORITY_CONFIG = {
  textMap: {
    emergency: '紧急',
    high: '高',
    normal: '普通',
    low: '低'
  },
  typeMap: {
    emergency: 'danger',
    high: 'warning',
    normal: '',
    low: 'info'
  }
}

// 任务来源标签配置
export const SOURCE_CONFIG = {
  textMap: {
    'plan-split': '计划拆分',
    'manual': '手工创建'
  },
  typeMap: {
    'plan-split': 'success',
    'manual': 'primary'
  }
}

// 排程状态标签配置（v1.1新增）
export const SCHEDULING_STATUS_CONFIG = {
  textMap: {
    'not_scheduled': '未排程',
    'plan_created': '已生成方案',
    'scheduled': '已发布排程'
  },
  typeMap: {
    'not_scheduled': 'info',
    'plan_created': 'warning',
    'scheduled': 'success'
  }
}

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
    cacheKey: 'annealingTaskTableColumns'
  }
}

