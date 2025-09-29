/**
 * 文件名称：process-parameter-management.js
 * 文件描述：工艺参数管理模块基础常量定义与业务枚举配置
 * 创建日期：2025-09-29
 * 修改记录：
 *   - 2025-09-29: 初始创建，对接TASK002 P0阶段常量定义
 */

// 模板状态枚举 - 与后端 status 字段保持一致
export const TEMPLATE_STATUS = {
  DRAFT: '草稿',
  PENDING: '待审批',
  ACTIVE: '生效',
  HISTORY: '历史'
}

// 模板状态选项 - SearchForm/筛选使用
export const TEMPLATE_STATUS_OPTIONS = [
  { value: TEMPLATE_STATUS.DRAFT, label: '草稿' },
  { value: TEMPLATE_STATUS.PENDING, label: '待审批' },
  { value: TEMPLATE_STATUS.ACTIVE, label: '生效' },
  { value: TEMPLATE_STATUS.HISTORY, label: '历史' }
]

// 模板状态 Tag 配置
export const TEMPLATE_STATUS_CONFIG = {
  textMap: {
    [TEMPLATE_STATUS.DRAFT]: '草稿',
    [TEMPLATE_STATUS.PENDING]: '待审批',
    [TEMPLATE_STATUS.ACTIVE]: '生效',
    [TEMPLATE_STATUS.HISTORY]: '历史'
  },
  typeMap: {
    [TEMPLATE_STATUS.DRAFT]: 'info',
    [TEMPLATE_STATUS.PENDING]: 'warning',
    [TEMPLATE_STATUS.ACTIVE]: 'success',
    [TEMPLATE_STATUS.HISTORY]: 'default'
  }
}

// 版本状态枚举
export const VERSION_STATUS = {
  DRAFT: '草稿',
  PENDING: '待审批',
  ACTIVE: '生效',
  HISTORY: '历史',
  REJECTED: '驳回',
  VOIDED: '作废'
}

// 版本状态选项
export const VERSION_STATUS_OPTIONS = [
  { value: VERSION_STATUS.DRAFT, label: '草稿' },
  { value: VERSION_STATUS.PENDING, label: '待审批' },
  { value: VERSION_STATUS.ACTIVE, label: '生效' },
  { value: VERSION_STATUS.HISTORY, label: '历史' },
  { value: VERSION_STATUS.REJECTED, label: '驳回' },
  { value: VERSION_STATUS.VOIDED, label: '作废' }
]

export const EDITABLE_VERSION_STATUSES = [
  VERSION_STATUS.DRAFT,
  VERSION_STATUS.REJECTED
]

export const READONLY_VERSION_STATUSES = [
  VERSION_STATUS.PENDING,
  VERSION_STATUS.ACTIVE,
  VERSION_STATUS.HISTORY,
  VERSION_STATUS.VOIDED
]

// 版本状态 Tag 配置
export const VERSION_STATUS_CONFIG = {
  textMap: {
    [VERSION_STATUS.DRAFT]: '草稿',
    [VERSION_STATUS.PENDING]: '待审批',
    [VERSION_STATUS.ACTIVE]: '生效',
    [VERSION_STATUS.HISTORY]: '历史',
    [VERSION_STATUS.REJECTED]: '驳回',
    [VERSION_STATUS.VOIDED]: '作废'
  },
  typeMap: {
    [VERSION_STATUS.DRAFT]: 'info',
    [VERSION_STATUS.PENDING]: 'warning',
    [VERSION_STATUS.ACTIVE]: 'success',
    [VERSION_STATUS.HISTORY]: 'default',
    [VERSION_STATUS.REJECTED]: 'danger',
    [VERSION_STATUS.VOIDED]: 'info'
  }
}

// 温度段类型枚举
export const SEGMENT_TYPES = {
  HEATING: '升温',
  HOLDING: '保温',
  COOLING: '降温',
  QUICK_COOLING: '快速冷却'
}

export const SEGMENT_TYPE_OPTIONS = [
  { value: SEGMENT_TYPES.HEATING, label: '升温段' },
  { value: SEGMENT_TYPES.HOLDING, label: '保温段' },
  { value: SEGMENT_TYPES.COOLING, label: '降温段' },
  { value: SEGMENT_TYPES.QUICK_COOLING, label: '快速冷却段' }
]

// 保护气氛类型
export const ATMOSPHERE_TYPES = {
  NITROGEN: '纯氮气',
  HYDROGEN_NITROGEN: '氢氮混合气',
  ARGON: '氩气',
  NITROGEN_HYDROGEN: '氮氢混合气',
  OTHER: '其他'
}

export const ATMOSPHERE_TYPE_OPTIONS = [
  { value: ATMOSPHERE_TYPES.NITROGEN, label: '纯氮气' },
  { value: ATMOSPHERE_TYPES.HYDROGEN_NITROGEN, label: '氢氮混合气' },
  { value: ATMOSPHERE_TYPES.ARGON, label: '氩气' },
  { value: ATMOSPHERE_TYPES.NITROGEN_HYDROGEN, label: '氮氢混合气' },
  { value: ATMOSPHERE_TYPES.OTHER, label: '其他' }
]

// 风机运行模式（预留与后端对齐）
export const FAN_MODES = {
  VARIABLE_FREQUENCY: '变频',
  LINKAGE: '联动',
  CONSTANT_SPEED: '恒速'
}

export const FAN_MODE_OPTIONS = [
  { value: FAN_MODES.VARIABLE_FREQUENCY, label: '变频' },
  { value: FAN_MODES.LINKAGE, label: '联动' },
  { value: FAN_MODES.CONSTANT_SPEED, label: '恒速' }
]

// 数值型字段范围配置（与接口文档保持一致）
export const SEGMENT_FIELD_LIMITS = {
  segmentOrder: { min: 1, max: 1000, step: 1 },
  targetTemperature: { min: -100, max: 1500, step: 1, unit: '°C' },
  duration: { min: 1, max: 10080, step: 1, unit: '分钟' },
  heatingRate: { min: 0.1, max: 500, step: 0.1, unit: '°C/h' },
  coolingRate: { min: 0.1, max: 500, step: 0.1, unit: '°C/h' }
}

export const ATMOSPHERE_FIELD_LIMITS = {
  flowRate: { min: 0.1, max: 1000, step: 0.1, unit: 'm³/h' },
  pressure: { min: 0, max: 100000, step: 1, unit: 'Pa' }
}

export const FAN_FIELD_LIMITS = {
  frequency: { min: 0.1, max: 100, step: 0.1, unit: 'Hz' }
}

// 模板筛选默认配置
export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 10
}

export const DEFAULT_SORT = 'createdAt:desc'

// 列配置元数据
export const COLUMN_SETTINGS_ID = 'process-parameter-template-columns'

// 适用产品展示配置（tags 超出时使用 OverflowTagsPopover）
export const APPLICABLE_PRODUCT_DISPLAY_LIMIT = 2

// 模板编码格式提示
export const TEMPLATE_CODE_HINT = '建议采用“PT-合金-状态-特性”格式，如 PT-1100-H18-ANNEALING'

// 温度曲线基础颜色映射（供图表与表格重用）
export const SEGMENT_COLOR_MAP = {
  [SEGMENT_TYPES.HEATING]: '#FF7043',
  [SEGMENT_TYPES.HOLDING]: '#42A5F5',
  [SEGMENT_TYPES.COOLING]: '#26A69A',
  [SEGMENT_TYPES.QUICK_COOLING]: '#7E57C2'
}

// 默认温度段模板（可用于初始化版本）
export const DEFAULT_SEGMENT_TEMPLATE = [
  {
    segmentOrder: 1,
    segmentType: SEGMENT_TYPES.HEATING,
    targetTemperature: 450,
    duration: 180,
    heatingRate: 35,
    description: '升温至目标退火温度，控制升温速率保证材料稳定'
  },
  {
    segmentOrder: 2,
    segmentType: SEGMENT_TYPES.HOLDING,
    targetTemperature: 450,
    duration: 240,
    description: '保持恒温以均匀组织，确保应力释放充足'
  },
  {
    segmentOrder: 3,
    segmentType: SEGMENT_TYPES.COOLING,
    targetTemperature: 120,
    duration: 160,
    coolingRate: 25,
    description: '受控降温避免材质脆化，可根据产品要求调整速率'
  }
]

// 风机频率推荐值 - 便于表单提示与校验
export const FAN_FREQUENCY_RECOMMENDATIONS = {
  default: {
    min: 30,
    max: 55,
    suggestion: '大多数退火炉建议将频率控制在30-55Hz之间'
  },
  highAirflow: {
    min: 45,
    max: 70,
    suggestion: '高流量模式下可将频率调高至45-70Hz，但需监控风机负载'
  },
  lowAirflow: {
    min: 20,
    max: 35,
    suggestion: '薄料或低流量工况可降低至20-35Hz以减少能耗'
  }
}

// 审批动作排序（供操作按钮参考）
export const APPROVAL_ACTIONS = [
  'viewDetail',
  'editTemplate',
  'createVersion',
  'submitApproval',
  'approve',
  'reject',
  'withdraw',
  'activate',
  'void',
  'copy',
  'delete'
]

// 版本比较配置
export const VERSION_COMPARE_SECTIONS = [
  { key: 'basicInfo', label: '基础信息差异' },
  { key: 'segments', label: '温度段差异' },
  { key: 'atmosphereSettings', label: '保护气氛差异' },
  { key: 'fanSettings', label: '循环风机差异' }
]

