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

// ========================================
// ⚠️ 注意：模板状态和版本状态的选项已迁移到字典API
// 使用方式：mixins: [dictionaryMixin]
// 可用属性：this.templateStatusOptions, this.templateVersionStatusOptions
// ========================================

// 模板状态 Tag 配置（样式映射，保留前端定义）
export const TEMPLATE_STATUS_CONFIG = {
  textMap: {}, // 已废弃，使用字典API的labels
  typeMap: {
    '草稿': 'info',
    '待审批': 'warning',
    '生效': 'success',
    '历史': 'default'
  }
}

// 版本状态枚举（业务逻辑常量，保留）
export const VERSION_STATUS = {
  DRAFT: '草稿',
  PENDING: '待审批',
  ACTIVE: '生效',
  HISTORY: '历史',
  REJECTED: '驳回',
  VOIDED: '作废'
}

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

// 版本状态 Tag 配置（样式映射，保留前端定义）
export const VERSION_STATUS_CONFIG = {
  textMap: {}, // 已废弃，使用字典API的labels
  typeMap: {
    '草稿': 'info',
    '待审批': 'warning',
    '生效': 'success',
    '历史': 'default',
    '驳回': 'danger',
    '作废': 'info'
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

// ⚠️ ATMOSPHERE_TYPE_OPTIONS 已迁移到字典API
// 使用方式：mixins: [dictionaryMixin]，可用属性：this.atmosphereTypeOptions

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

// ==================== v2.0 架构：12段工艺参数配置 ====================

// 循环风机速度枚举 (v2.0)
export const CIRCULATION_FAN_SPEED = {
  LOW: '低速',
  MEDIUM: '中速',
  HIGH: '高速'
}

export const CIRCULATION_FAN_SPEED_OPTIONS = [
  { value: CIRCULATION_FAN_SPEED.LOW, label: '低速' },
  { value: CIRCULATION_FAN_SPEED.MEDIUM, label: '中速' },
  { value: CIRCULATION_FAN_SPEED.HIGH, label: '高速' }
]

// 预设模板类型标签
export const PRESET_TEMPLATE_LABELS = {
  standard: '标准退火模板',
  quick: '快速退火模板',
  blank: '空白模板'
}

/**
 * 生成12段工艺参数的辅助函数
 * @param {Object} config - 配置对象，包含各段的参数
 * @returns {Array} 12段参数数组
 */
function generate12Segments(config) {
  return Array.from({ length: 12 }, (_, index) => {
    const order = index + 1
    const segment = config[order] || {}
    return {
      segmentOrder: order,
      controlMode: '定时定温',
      furnaceTemperature: segment.furnaceTemperature || 0,
      materialTemperature: segment.materialTemperature || 0,
      timeSet: segment.timeSet || 0,
      runTime: null,
      circulationFanSpeed: segment.circulationFanSpeed || CIRCULATION_FAN_SPEED.LOW,
      negativePressureFan: segment.negativePressureFan || 0,
      cleaningFan: segment.cleaningFan || 0,
      cleaningTime: segment.cleaningTime || 0
    }
  })
}

// 预设模板：标准退火工艺（适用于1100/8011合金）
const STANDARD_ANNEALING_CONFIG = {
  1: { furnaceTemperature: 100, materialTemperature: 90, timeSet: 0.5, circulationFanSpeed: CIRCULATION_FAN_SPEED.LOW, negativePressureFan: 10, cleaningFan: 5, cleaningTime: 10 },
  2: { furnaceTemperature: 200, materialTemperature: 180, timeSet: 1.0, circulationFanSpeed: CIRCULATION_FAN_SPEED.LOW, negativePressureFan: 15, cleaningFan: 10, cleaningTime: 15 },
  3: { furnaceTemperature: 300, materialTemperature: 280, timeSet: 1.5, circulationFanSpeed: CIRCULATION_FAN_SPEED.MEDIUM, negativePressureFan: 20, cleaningFan: 15, cleaningTime: 20 },
  4: { furnaceTemperature: 400, materialTemperature: 380, timeSet: 2.0, circulationFanSpeed: CIRCULATION_FAN_SPEED.MEDIUM, negativePressureFan: 25, cleaningFan: 20, cleaningTime: 25 },
  5: { furnaceTemperature: 450, materialTemperature: 430, timeSet: 2.5, circulationFanSpeed: CIRCULATION_FAN_SPEED.MEDIUM, negativePressureFan: 30, cleaningFan: 25, cleaningTime: 30 },
  6: { furnaceTemperature: 450, materialTemperature: 430, timeSet: 3.0, circulationFanSpeed: CIRCULATION_FAN_SPEED.MEDIUM, negativePressureFan: 30, cleaningFan: 25, cleaningTime: 30 },
  7: { furnaceTemperature: 400, materialTemperature: 380, timeSet: 2.5, circulationFanSpeed: CIRCULATION_FAN_SPEED.MEDIUM, negativePressureFan: 25, cleaningFan: 20, cleaningTime: 25 },
  8: { furnaceTemperature: 350, materialTemperature: 330, timeSet: 2.0, circulationFanSpeed: CIRCULATION_FAN_SPEED.MEDIUM, negativePressureFan: 20, cleaningFan: 15, cleaningTime: 20 },
  9: { furnaceTemperature: 300, materialTemperature: 280, timeSet: 1.5, circulationFanSpeed: CIRCULATION_FAN_SPEED.LOW, negativePressureFan: 15, cleaningFan: 10, cleaningTime: 15 },
  10: { furnaceTemperature: 250, materialTemperature: 230, timeSet: 1.0, circulationFanSpeed: CIRCULATION_FAN_SPEED.LOW, negativePressureFan: 10, cleaningFan: 10, cleaningTime: 10 },
  11: { furnaceTemperature: 150, materialTemperature: 140, timeSet: 0.5, circulationFanSpeed: CIRCULATION_FAN_SPEED.LOW, negativePressureFan: 10, cleaningFan: 5, cleaningTime: 10 },
  12: { furnaceTemperature: 80, materialTemperature: 75, timeSet: 0.5, circulationFanSpeed: CIRCULATION_FAN_SPEED.LOW, negativePressureFan: 5, cleaningFan: 5, cleaningTime: 5 }
}

// 预设模板：快速退火工艺（缩短保温时间）
const QUICK_ANNEALING_CONFIG = {
  1: { furnaceTemperature: 150, materialTemperature: 140, timeSet: 0.3, circulationFanSpeed: CIRCULATION_FAN_SPEED.MEDIUM, negativePressureFan: 15, cleaningFan: 10, cleaningTime: 10 },
  2: { furnaceTemperature: 250, materialTemperature: 230, timeSet: 0.5, circulationFanSpeed: CIRCULATION_FAN_SPEED.MEDIUM, negativePressureFan: 20, cleaningFan: 15, cleaningTime: 15 },
  3: { furnaceTemperature: 350, materialTemperature: 330, timeSet: 0.8, circulationFanSpeed: CIRCULATION_FAN_SPEED.HIGH, negativePressureFan: 25, cleaningFan: 20, cleaningTime: 20 },
  4: { furnaceTemperature: 420, materialTemperature: 400, timeSet: 1.0, circulationFanSpeed: CIRCULATION_FAN_SPEED.HIGH, negativePressureFan: 30, cleaningFan: 25, cleaningTime: 25 },
  5: { furnaceTemperature: 450, materialTemperature: 430, timeSet: 1.5, circulationFanSpeed: CIRCULATION_FAN_SPEED.HIGH, negativePressureFan: 35, cleaningFan: 30, cleaningTime: 30 },
  6: { furnaceTemperature: 450, materialTemperature: 430, timeSet: 1.5, circulationFanSpeed: CIRCULATION_FAN_SPEED.HIGH, negativePressureFan: 35, cleaningFan: 30, cleaningTime: 30 },
  7: { furnaceTemperature: 420, materialTemperature: 400, timeSet: 1.2, circulationFanSpeed: CIRCULATION_FAN_SPEED.HIGH, negativePressureFan: 30, cleaningFan: 25, cleaningTime: 25 },
  8: { furnaceTemperature: 350, materialTemperature: 330, timeSet: 1.0, circulationFanSpeed: CIRCULATION_FAN_SPEED.MEDIUM, negativePressureFan: 25, cleaningFan: 20, cleaningTime: 20 },
  9: { furnaceTemperature: 280, materialTemperature: 260, timeSet: 0.8, circulationFanSpeed: CIRCULATION_FAN_SPEED.MEDIUM, negativePressureFan: 20, cleaningFan: 15, cleaningTime: 15 },
  10: { furnaceTemperature: 200, materialTemperature: 185, timeSet: 0.5, circulationFanSpeed: CIRCULATION_FAN_SPEED.MEDIUM, negativePressureFan: 15, cleaningFan: 10, cleaningTime: 10 },
  11: { furnaceTemperature: 120, materialTemperature: 110, timeSet: 0.3, circulationFanSpeed: CIRCULATION_FAN_SPEED.LOW, negativePressureFan: 10, cleaningFan: 5, cleaningTime: 10 },
  12: { furnaceTemperature: 60, materialTemperature: 55, timeSet: 0.2, circulationFanSpeed: CIRCULATION_FAN_SPEED.LOW, negativePressureFan: 5, cleaningFan: 5, cleaningTime: 5 }
}

// 预设模板集合
export const PRESET_TEMPLATES = {
  standard: generate12Segments(STANDARD_ANNEALING_CONFIG),
  quick: generate12Segments(QUICK_ANNEALING_CONFIG),
  blank: generate12Segments({}) // 空白模板：所有段初始值为0
}

// v2.0 12段参数字段限制
export const SEGMENT_V2_FIELD_LIMITS = {
  segmentOrder: { min: 1, max: 12, step: 1 },
  furnaceTemperature: { min: 0, max: 1500, step: 10, precision: 2, unit: '℃' },
  materialTemperature: { min: 0, max: 1500, step: 10, precision: 2, unit: '℃' },
  timeSet: { min: 0, max: 999, step: 0.5, precision: 2, unit: 'h' },
  negativePressureFan: { min: 0, max: 100, step: 5, precision: 2, unit: 'Hz' },
  cleaningFan: { min: 0, max: 100, step: 5, precision: 2, unit: 'Hz' },
  cleaningTime: { min: 0, max: 999, step: 5, precision: 2, unit: 'min' }
}

// v2.0 12段参数字段中文标签（用于版本对比）
export const SEGMENT_FIELD_LABELS = {
  controlMode: '控温方式',
  furnaceTemperature: '炉温设置',
  materialTemperature: '料温设置',
  timeSet: '时间设置',
  runTime: '运行时间',
  circulationFanSpeed: '循环风机速度',
  negativePressureFan: '负压风机频率',
  cleaningFan: '吹洗风机频率',
  cleaningTime: '吹洗时间'
}

