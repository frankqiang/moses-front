/**
 * 文件名称：detail-config.js
 * 文件描述：排程方案详情页面配置常量
 * 创建日期：2025-10-23
 * 修改记录：
 *   - 2025-10-23: 初始创建
 *   - 2025-10-24: 更新注释，说明优先级字段从scheduleContext获取
 */

/**
 * 重要说明：
 * 1. 任务优先级从 scheduleContext.priority 获取，而不是 task.urgencyLevel
 * 2. 任务详情简化：只包含 id, taskCode, productCode, plannedWeight, alloyGrade
 * 3. 已移除字段：customerName, urgencyLevel, plannedQuantity, actualWeight
 */

/**
 * 冲突类型映射
 */
export const CONFLICT_TYPE_MAP = {
  'time-conflict': '时间冲突',
  'capacity-exceeded': '容量超限',
  'process-incompatible': '工艺不兼容',
  'material-not-ready': '物料未就绪',
  'maintenance-conflict': '维护冲突',
  'equipment-abnormal': '设备状态异常',
  'deadline-risk': '交期风险',
  'high-energy-consumption': '能耗过高'
}

/**
 * 冲突严重程度映射
 */
export const SEVERITY_LEVEL_MAP = {
  'low': '低',
  'medium': '中',
  'high': '高',
  'critical': '致命'
}

/**
 * 冲突严重程度颜色映射
 */
export const SEVERITY_COLOR_MAP = {
  'low': '#909399',
  'medium': '#E6A23C',
  'high': '#F56C6C',
  'critical': '#F56C6C'
}

/**
 * 冲突严重程度类型映射
 */
export const SEVERITY_TYPE_MAP = {
  'low': 'info',
  'medium': 'warning',
  'high': 'danger',
  'critical': 'danger'
}

/**
 * 操作日志类型映射
 */
export const LOG_ACTION_MAP = {
  'plan-created': '方案创建',
  'algorithm-run': '算法运行',
  'item-adjusted': '结果调整',
  'plan-published': '方案发布',
  'plan-cancelled': '方案取消',
  'conflict-detected': '冲突检测',
  'conflict-resolved': '冲突解决'
}

/**
 * 操作日志图标映射
 */
export const LOG_ICON_MAP = {
  'plan-created': 'el-icon-plus',
  'algorithm-run': 'el-icon-refresh',
  'item-adjusted': 'el-icon-edit',
  'plan-published': 'el-icon-check',
  'plan-cancelled': 'el-icon-close',
  'conflict-detected': 'el-icon-warning',
  'conflict-resolved': 'el-icon-success'
}

/**
 * 排程结果列表列配置
 */
export const SCHEDULE_ITEMS_COLUMNS = [
  {
    prop: 'sequenceNumber',
    label: '序号',
    width: 80,
    sortable: true
  },
  {
    prop: 'taskCode',
    label: '任务编号',
    width: 200,
    sortable: false
  },
  {
    prop: 'furnaceCode',
    label: '炉号',
    width: 120,
    sortable: true
  },
  {
    prop: 'productCode',
    label: '产品编码',
    width: 150,
    sortable: false,
    slotName: 'productCode' // 从task嵌套对象中获取
  },
  {
    prop: 'alloyGrade',
    label: '合金牌号',
    width: 120,
    sortable: false,
    slotName: 'alloyGrade' // 从task嵌套对象中获取
  },
  {
    prop: 'plannedLoadingAt',
    label: '计划装炉时间',
    width: 180,
    sortable: true
  },
  {
    prop: 'plannedUnloadingAt',
    label: '计划出炉时间',
    width: 180,
    sortable: true
  },
  {
    prop: 'estimatedDurationMinutes',
    label: '预计时长',
    width: 120,
    sortable: true
  },
  {
    prop: 'scheduleWeight',
    label: '计划重量(吨)',
    width: 120,
    sortable: true
  },
  {
    prop: 'priority',
    label: '优先级',
    width: 100,
    sortable: true
  },
  {
    prop: 'isMixed',
    label: '是否混炉',
    width: 100,
    sortable: false
  },
  {
    prop: 'hasConflict',
    label: '冲突标记',
    width: 100,
    sortable: true
  },
  {
    prop: 'actions',
    label: '操作',
    width: 180,
    fixed: 'right'
  }
]

/**
 * 冲突记录列表列配置
 */
export const CONFLICTS_COLUMNS = [
  {
    prop: 'conflictType',
    label: '冲突类型',
    width: 120
  },
  {
    prop: 'severityLevel',
    label: '严重程度',
    width: 100
  },
  {
    prop: 'description',
    label: '冲突描述',
    minWidth: 300
  },
  {
    prop: 'affectedTaskIds',
    label: '涉及任务',
    width: 150
  },
  {
    prop: 'suggestion',
    label: '解决建议',
    minWidth: 250
  },
  {
    prop: 'detectedAt',
    label: '检测时间',
    width: 180
  }
]

/**
 * 操作日志列表列配置
 */
export const LOGS_COLUMNS = [
  {
    prop: 'action',
    label: '操作类型',
    width: 120
  },
  {
    prop: 'operatorName',
    label: '操作人',
    width: 120
  },
  {
    prop: 'changeDescription',
    label: '变更描述',
    minWidth: 300
  },
  {
    prop: 'operatedAt',
    label: '操作时间',
    width: 180
  },
  {
    prop: 'actions',
    label: '操作',
    width: 100
  }
]

/**
 * Tab标签页配置
 */
export const DETAIL_TABS = [
  {
    name: 'basic',
    label: '基本信息'
  },
  {
    name: 'items',
    label: '排程结果'
  },
  {
    name: 'conflicts',
    label: '冲突记录'
  },
  {
    name: 'logs',
    label: '操作日志'
  }
]

