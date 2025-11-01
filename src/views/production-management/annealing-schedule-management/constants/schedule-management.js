/**
 * 文件名称：schedule-management.js
 * 文件描述：退火炉排程管理模块基础常量配置
 * 创建日期：2025-10-23
 * 修改记录：
 *   - 2025-10-23: 初始创建，定义方案状态、算法类型等枚举
 *   - 2025-10-28: 标记枚举映射为备用方案，后端甘特图接口已返回 label 字段
 */

// 默认分页配置
export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 20
}

// 默认排序
export const DEFAULT_SORT = 'createdAt:desc'

// 方案状态枚举
export const PLAN_STATUS = {
  DRAFT: 'draft',
  COMPUTING: 'computing',
  GENERATED: 'generated',
  PUBLISHED: 'published',
  CANCELLED: 'cancelled'
}

/**
 * 方案状态配置（备用方案）
 * ✅ 2025-10-28更新：甘特图接口已返回 planStatusLabel 字段
 * 此配置仅在后端未返回 label 时作为备用
 * 前端优先使用：planInfo.planStatusLabel || STATUS_CONFIG.textMap[planInfo.planStatus]
 *
 * 注：typeMap 用于控制标签颜色，继续保留使用
 */
export const PLAN_STATUS_CONFIG = {
  textMap: {
    [PLAN_STATUS.DRAFT]: '草稿',
    [PLAN_STATUS.COMPUTING]: '运算中',
    [PLAN_STATUS.GENERATED]: '已生成',
    [PLAN_STATUS.PUBLISHED]: '已发布',
    [PLAN_STATUS.CANCELLED]: '已取消'
  },
  typeMap: {
    [PLAN_STATUS.DRAFT]: 'info',
    [PLAN_STATUS.COMPUTING]: 'primary',
    [PLAN_STATUS.GENERATED]: 'warning',
    [PLAN_STATUS.PUBLISHED]: 'success',
    [PLAN_STATUS.CANCELLED]: 'danger'
  }
}

// 状态配置别名（向后兼容）
export const STATUS_CONFIG = PLAN_STATUS_CONFIG

// 方案状态选项（用于筛选）
export const PLAN_STATUS_OPTIONS = [
  { label: '草稿', value: PLAN_STATUS.DRAFT },
  { label: '运算中', value: PLAN_STATUS.COMPUTING },
  { label: '已生成', value: PLAN_STATUS.GENERATED },
  { label: '已发布', value: PLAN_STATUS.PUBLISHED },
  { label: '已取消', value: PLAN_STATUS.CANCELLED }
]

// 算法类型枚举
export const ALGORITHM_TYPE = {
  RULE_BASED: 'rule-based',
  CONSTRAINT_PROGRAMMING: 'constraint-programming',
  SIMULATED_ANNEALING: 'simulated-annealing',
  GENETIC_ALGORITHM: 'genetic-algorithm'
}

// 算法类型配置
export const ALGORITHM_TYPE_CONFIG = {
  textMap: {
    [ALGORITHM_TYPE.RULE_BASED]: '基于规则的启发式算法',
    [ALGORITHM_TYPE.CONSTRAINT_PROGRAMMING]: '约束规划算法',
    [ALGORITHM_TYPE.SIMULATED_ANNEALING]: '模拟退火算法',
    [ALGORITHM_TYPE.GENETIC_ALGORITHM]: '遗传算法'
  }
}

// 算法类型映射（向后兼容）
export const ALGORITHM_TYPE_MAP = {
  [ALGORITHM_TYPE.RULE_BASED]: { text: '基于规则的启发式算法' },
  [ALGORITHM_TYPE.CONSTRAINT_PROGRAMMING]: { text: '约束规划算法' },
  [ALGORITHM_TYPE.SIMULATED_ANNEALING]: { text: '模拟退火算法' },
  [ALGORITHM_TYPE.GENETIC_ALGORITHM]: { text: '遗传算法' }
}

// 算法类型选项（用于筛选）
export const ALGORITHM_TYPE_OPTIONS = [
  { label: '全部', value: '' },
  { label: '基于规则的启发式算法', value: ALGORITHM_TYPE.RULE_BASED },
  { label: '约束规划算法', value: ALGORITHM_TYPE.CONSTRAINT_PROGRAMMING },
  { label: '模拟退火算法', value: ALGORITHM_TYPE.SIMULATED_ANNEALING },
  { label: '遗传算法', value: ALGORITHM_TYPE.GENETIC_ALGORITHM }
]

// 指标颜色阈值
export const METRIC_THRESHOLD = {
  HIGH: 90, // >= 90% 绿色
  MEDIUM: 70 // 70%-90% 黄色，< 70% 红色
}

// 自动刷新间隔（毫秒）
export const AUTO_REFRESH_INTERVAL = 3000

// 排序字段选项
export const SORT_FIELD_OPTIONS = [
  { label: '创建时间', value: 'createdAt' },
  { label: '排程开始时间', value: 'scheduleStartTime' },
  { label: '利用率', value: 'utilizationRate' },
  { label: '装载率', value: 'loadRate' },
  { label: '交期达成率', value: 'deliveryAchievementRate' }
]

// 排序方向选项
export const SORT_ORDER_OPTIONS = [
  { label: '升序', value: 'asc' },
  { label: '降序', value: 'desc' }
]

// 权限代码（开发阶段不使用，生产环境时启用）
// export const PERMISSIONS = {
//   VIEW: 'prod.scheduling.view',
//   CREATE: 'prod.scheduling.create',
//   ADJUST: 'prod.scheduling.adjust',
//   PUBLISH: 'prod.scheduling.publish',
//   CANCEL: 'prod.scheduling.cancel'
// }

// 冲突类型枚举
export const CONFLICT_TYPE = {
  TIME_CONFLICT: 'time-conflict',
  CAPACITY_EXCEEDED: 'capacity-exceeded',
  PROCESS_INCOMPATIBLE: 'process-incompatible',
  MATERIAL_NOT_READY: 'material-not-ready',
  MAINTENANCE_CONFLICT: 'maintenance-conflict'
}

/**
 * 冲突类型映射（备用方案）
 * ✅ 2025-10-28更新：甘特图接口已返回 typeLabel 字段
 * 此映射仅在后端未返回 label 时作为备用
 * 前端优先使用：conflict.typeLabel || CONFLICT_TYPE_MAP[conflict.type].text
 */
export const CONFLICT_TYPE_MAP = {
  [CONFLICT_TYPE.TIME_CONFLICT]: { text: '时间冲突' },
  [CONFLICT_TYPE.CAPACITY_EXCEEDED]: { text: '容量超限' },
  [CONFLICT_TYPE.PROCESS_INCOMPATIBLE]: { text: '工艺不兼容' },
  [CONFLICT_TYPE.MATERIAL_NOT_READY]: { text: '物料未就绪' },
  [CONFLICT_TYPE.MAINTENANCE_CONFLICT]: { text: '维护冲突' }
}

// 严重程度枚举
export const SEVERITY_LEVEL = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
}

/**
 * 严重程度映射（备用方案）
 * ✅ 2025-10-28更新：甘特图接口已返回 severityLabel 字段
 * 此映射仅在后端未返回 label 时作为备用
 * 前端优先使用：conflict.severityLabel || SEVERITY_LEVEL_MAP[conflict.severity].text
 */
export const SEVERITY_LEVEL_MAP = {
  [SEVERITY_LEVEL.LOW]: { text: '低' },
  [SEVERITY_LEVEL.MEDIUM]: { text: '中' },
  [SEVERITY_LEVEL.HIGH]: { text: '高' },
  [SEVERITY_LEVEL.CRITICAL]: { text: '致命' }
}

// 方案状态映射（向后兼容）
export const PLAN_STATUS_MAP = {
  [PLAN_STATUS.DRAFT]: { text: '草稿' },
  [PLAN_STATUS.COMPUTING]: { text: '运算中' },
  [PLAN_STATUS.GENERATED]: { text: '已生成' },
  [PLAN_STATUS.PUBLISHED]: { text: '已发布' },
  [PLAN_STATUS.CANCELLED]: { text: '已取消' }
}

// 错误码配置
export const ERROR_CODES = {
  SPM_001: { message: '排程方案不存在' },
  SPM_002: { message: '方案编号已存在' },
  SPM_003: { message: '创建排程方案失败' },
  SPM_004: { message: '更新排程方案失败' },
  SPM_005: { message: '查询排程方案失败' },
  SPM_006: { message: '方案状态不允许此操作' },
  SPM_007: { message: '排程算法执行失败' },
  SPM_008: { message: '发布排程方案失败' },
  SPM_009: { message: '取消排程方案失败' },
  SPM_010: { message: '检测到致命冲突，无法发布' }
}

