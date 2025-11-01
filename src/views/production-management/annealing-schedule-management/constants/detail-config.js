/**
 * 文件名称：detail-config.js
 * 文件描述：排程方案详情页面配置常量
 * 创建日期：2025-10-23
 * 修改记录：
 *   - 2025-10-23: 初始创建
 *   - 2025-10-24: 更新注释，说明优先级字段从scheduleContext获取
 *   - 2025-10-27: 更新说明，反映最新接口响应结构变更
 *   - 2025-10-27: 修正重量字段理解，scheduleWeight是算法权重而非物理重量
 *   - 2025-10-28: 标记枚举映射为备用方案，后端已返回 label 字段
 */

/**
 * 重要说明（2025-10-27更新）：
 * 1. 任务优先级从 scheduleContext.priority 获取，而不是 task.urgencyLevel
 * 2. 任务详情简化：只包含 id, taskCode, productCode, plannedWeight, alloyGrade
 * 3. 已移除字段：customerName, urgencyLevel, plannedQuantity, actualWeight
 * 4. 容量信息：每个排程项的 scheduleContext 中包含 furnaceMaxCapacity 和 furnaceMinCapacity
 * 5. 重量字段理解（重要）：
 *    - scheduleWeight: 排程算法的权重值（非物理重量，用于算法计算）
 *    - task.plannedWeight: 任务的计划重量（物理重量，单位：吨）
 *    - scheduleContext.totalWeight: 炉次总重量（物理重量，单位：吨）
 *    表格中显示炉次总重量，tooltip中显示任务重量
 * 6. P0阶段无意义字段：optimizationGoals（空对象）、utilizationRate/loadRate/deliveryAchievementRate/overallScore（null）
 * 7. 约束规则简化：constraintRules 只包含 enableMixing 字段，容量限制由各炉子独立配置
 */

/**
 * 冲突类型映射（备用方案）
 * ✅ 2025-10-28更新：后端已返回 typeLabel 字段
 * 此映射仅在后端未返回 label 时作为备用
 * 前端优先使用：conflict.typeLabel || CONFLICT_TYPE_MAP[conflict.type]
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
 * 冲突严重程度映射（备用方案）
 * ✅ 2025-10-28更新：后端已返回 severityLabel 字段
 * 此映射仅在后端未返回 label 时作为备用
 * 前端优先使用：conflict.severityLabel || SEVERITY_LEVEL_MAP[conflict.severity]
 */
export const SEVERITY_LEVEL_MAP = {
  'low': '低',
  'medium': '中',
  'high': '高',
  'critical': '致命'
}

/**
 * 冲突严重程度颜色映射
 * 注：此映射用于UI颜色展示，不受后端 label 字段影响，继续保留使用
 */
export const SEVERITY_COLOR_MAP = {
  'low': '#909399',
  'medium': '#E6A23C',
  'high': '#F56C6C',
  'critical': '#F56C6C'
}

/**
 * 冲突严重程度类型映射（el-tag的type属性）
 * 注：此映射用于控制标签颜色，不受后端 label 字段影响，继续保留使用
 */
export const SEVERITY_TYPE_MAP = {
  'low': 'info',
  'medium': 'warning',
  'high': 'danger',
  'critical': 'danger'
}

/**
 * 排程结果列表列配置
 * 注意：序号列由 BaseTable 的 show-index 属性自动添加，不需要在这里定义
 * 重要：所有使用自定义渲染（插槽）的列都必须定义 slotName 属性
 */
export const SCHEDULE_ITEMS_COLUMNS = [
  {
    prop: 'taskCode',
    label: '任务编号',
    width: 200,
    sortable: false,
    slotName: 'taskCode' // 自定义：链接跳转
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
    sortable: true,
    slotName: 'plannedLoadingAt' // 自定义：日期格式化
  },
  {
    prop: 'plannedUnloadingAt',
    label: '计划出炉时间',
    width: 180,
    sortable: true,
    slotName: 'plannedUnloadingAt' // 自定义：日期格式化
  },
  {
    prop: 'estimatedDurationMinutes',
    label: '预计时长',
    width: 120,
    sortable: true,
    slotName: 'estimatedDurationMinutes' // 自定义：时长格式化
  },
  {
    prop: 'scheduleWeight',
    label: '炉次总重量(吨)',
    width: 150,
    sortable: true,
    slotName: 'scheduleWeight' // 自定义：显示炉次总重量+容量信息提示
  },
  {
    prop: 'isMixed',
    label: '是否混炉',
    width: 100,
    sortable: false,
    slotName: 'isMixed' // 自定义：标签显示
  },
  {
    prop: 'hasConflict',
    label: '冲突标记',
    width: 100,
    sortable: true,
    slotName: 'hasConflict' // 自定义：标签显示+点击查看冲突
  },
  {
    prop: 'conflictDescription',
    label: '冲突描述',
    minWidth: 200,
    sortable: false,
    showOverflowTooltip: true
  },
  {
    prop: 'actions',
    label: '操作',
    width: 100,
    fixed: 'right',
    slotName: 'actions' // 自定义：操作按钮
  }
]

/**
 * 冲突记录列表列配置
 * 注意：字段名必须与接口文档保持一致
 * 重要：2025-10-27 更新 - 字段名已同步后端最新接口
 */
export const CONFLICTS_COLUMNS = [
  {
    prop: 'conflictType',
    label: '冲突类型',
    width: 140,
    sortable: false,
    slotName: 'conflictType' // 自定义：标签显示
  },
  {
    prop: 'severity',
    label: '严重程度',
    width: 110,
    sortable: true,
    slotName: 'severity' // 自定义：标签显示
  },
  {
    prop: 'furnaceCode',
    label: '涉及炉号',
    width: 120,
    sortable: false,
    slotName: 'furnaceCode' // 自定义：显示炉号或"不涉及"
  },
  {
    prop: 'involvedTaskCodes',
    label: '涉及任务',
    width: 200,
    sortable: false,
    slotName: 'involvedTaskCodes' // 自定义：显示任务编号列表
  },
  {
    prop: 'conflictDescription',
    label: '冲突描述',
    minWidth: 280,
    sortable: false,
    showOverflowTooltip: true
  },
  {
    prop: 'resolutionSuggestion',
    label: '解决建议',
    width: 140,
    sortable: false,
    slotName: 'resolutionSuggestion' // 自定义：弹窗显示
  },
  {
    prop: 'isResolved',
    label: '状态',
    width: 100,
    sortable: true,
    slotName: 'isResolved' // 自定义：已解决/未解决
  },
  {
    prop: 'createdAt',
    label: '检测时间',
    width: 180,
    sortable: true,
    slotName: 'createdAt' // 自定义：日期格式化
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
  }
]

