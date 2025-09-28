/**
 * 文件名称：equipment-management.js
 * 文件描述：设备主数据管理模块基础常量定义与映射配置
 * 创建日期：2025-09-28
 * 修改记录：
 *   - 2025-09-28: 初始创建，按设备类型拆分常量并补充状态/排序配置
 */

// 设备类型枚举 - 与后端 equipmentType 字段保持一致
export const EQUIPMENT_TYPES = {
  ANNEALING_FURNACE: 'annealing_furnace',
  CRANE: 'crane',
  AUTOMATIC_CART: 'automatic_cart',
  PREPARATION_STATION: 'preparation_station'
}

// 设备类型选项
export const EQUIPMENT_TYPE_OPTIONS = [
  { value: EQUIPMENT_TYPES.ANNEALING_FURNACE, label: '退火炉' },
  { value: EQUIPMENT_TYPES.CRANE, label: '行车' },
  { value: EQUIPMENT_TYPES.AUTOMATIC_CART, label: '自动料车' },
  { value: EQUIPMENT_TYPES.PREPARATION_STATION, label: '备料台' }
]

// 设备状态枚举
export const EQUIPMENT_STATUS = {
  ENABLED: 'enabled',
  DISABLED: 'disabled',
  MAINTENANCE: 'maintenance'
}

// 设备状态选项
export const EQUIPMENT_STATUS_OPTIONS = [
  { value: EQUIPMENT_STATUS.ENABLED, label: '启用' },
  { value: EQUIPMENT_STATUS.DISABLED, label: '禁用' },
  { value: EQUIPMENT_STATUS.MAINTENANCE, label: '维护中' }
]

// 设备状态标签配置
export const EQUIPMENT_STATUS_CONFIG = {
  textMap: {
    [EQUIPMENT_STATUS.ENABLED]: '启用',
    [EQUIPMENT_STATUS.DISABLED]: '禁用',
    [EQUIPMENT_STATUS.MAINTENANCE]: '维护中'
  },
  typeMap: {
    [EQUIPMENT_STATUS.ENABLED]: 'success',
    [EQUIPMENT_STATUS.DISABLED]: 'info',
    [EQUIPMENT_STATUS.MAINTENANCE]: 'warning'
  }
}

// 设备详情字段常量定义 - 用于表单与详情展示
export const EQUIPMENT_DETAIL_FIELDS = {
  [EQUIPMENT_TYPES.ANNEALING_FURNACE]: {
    required: ['ratedCapacityTon', 'maxOperatingTemperatureC', 'ratedPowerKw', 'plcNodeId'],
    optional: ['chamberLengthCm', 'chamberWidthCm', 'chamberHeightCm', 'supportGasType', 'notes']
  },
  [EQUIPMENT_TYPES.CRANE]: {
    required: ['ratedLiftCapacityTon', 'maxSpeedMps', 'controlInterfaceParams'],
    optional: ['minSpeedMps', 'serviceAreaDescription', 'notes']
  },
  [EQUIPMENT_TYPES.AUTOMATIC_CART]: {
    required: [
      'loadCapacityTon',
      'maxSpeedMps',
      'navigationType',
      'batteryCapacityKwh',
      'lowBatteryThresholdPercent',
      'controlInterfaceParams'
    ],
    optional: ['minSpeedMps', 'chargingStrategy', 'notes']
  },
  [EQUIPMENT_TYPES.PREPARATION_STATION]: {
    required: ['maxLoadCapacityTon', 'maxBinCount'],
    optional: ['positionDescription', 'associatedAnnealingFurnaceCode', 'notes']
  }
}

// 设备详情字段显示文本映射
export const EQUIPMENT_DETAIL_LABELS = {
  ratedCapacityTon: '额定容量 (吨)',
  maxOperatingTemperatureC: '最大工作温度 (°C)',
  ratedPowerKw: '额定功率 (kW)',
  chamberLengthCm: '炉膛长度 (cm)',
  chamberWidthCm: '炉膛宽度 (cm)',
  chamberHeightCm: '炉膛高度 (cm)',
  supportGasType: '保护气氛类型',
  ratedLiftCapacityTon: '额定起重量 (吨)',
  maxSpeedMps: '最大速度 (m/s)',
  minSpeedMps: '最小速度 (m/s)',
  controlInterfaceParams: '控制接口参数',
  serviceAreaDescription: '服务范围描述',
  loadCapacityTon: '载重能力 (吨)',
  navigationType: '导航方式',
  batteryCapacityKwh: '电池容量 (kWh)',
  lowBatteryThresholdPercent: '低电量阈值 (%)',
  chargingStrategy: '充电策略',
  maxLoadCapacityTon: '最大承重 (吨)',
  maxBinCount: '最大料框数',
  positionDescription: '位置描述',
  associatedAnnealingFurnaceCode: '关联退火炉编号',
  notes: '备注'
}

// 默认分页设置 - 与后端接口默认值保持一致
export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 10
}

// 默认排序规则
export const DEFAULT_SORT = 'createdAt:desc'

// 支持的排序字段 - 用于校验与前端下拉展示
export const SORTABLE_FIELDS = [
  'equipmentCode',
  'name',
  'equipmentType',
  'status',
  'installationDate',
  'nextMaintenanceDate',
  'createdAt',
  'updatedAt'
]

// API 响应字段名称映射
export const API_RESPONSE_FIELDS = {
  list: 'results',
  page: 'page',
  limit: 'limit',
  totalPages: 'totalPages',
  totalResults: 'totalResults'
}

// 详情字段分类 - 用于表单折叠或展示分组
export const DETAIL_FIELD_GROUPS = {
  BASIC: {
    label: '基础信息',
    fields: ['equipmentCode', 'name', 'equipmentType', 'status', 'model', 'manufacturer', 'locationDescription']
  },
  COMMUNICATION: {
    label: '通讯参数',
    fields: ['communicationEndpoint', 'communicationParams', 'plcNodeId', 'controlSystemAddress']
  },
  MAINTENANCE: {
    label: '维护计划',
    fields: ['installationDate', 'maintenanceCycleDays', 'lastMaintenanceDate', 'nextMaintenanceDate']
  }
}

// 设备类型到详情标题映射
export const EQUIPMENT_TYPE_DETAIL_TITLES = {
  [EQUIPMENT_TYPES.ANNEALING_FURNACE]: '退火炉详情',
  [EQUIPMENT_TYPES.CRANE]: '行车详情',
  [EQUIPMENT_TYPES.AUTOMATIC_CART]: '自动料车详情',
  [EQUIPMENT_TYPES.PREPARATION_STATION]: '备料台详情'
}

// 设备类型与图标映射（P1扩展保留）
export const EQUIPMENT_TYPE_ICONS = {
  [EQUIPMENT_TYPES.ANNEALING_FURNACE]: 'icon-furnace',
  [EQUIPMENT_TYPES.CRANE]: 'icon-crane',
  [EQUIPMENT_TYPES.AUTOMATIC_CART]: 'icon-automatic-cart',
  [EQUIPMENT_TYPES.PREPARATION_STATION]: 'icon-preparation-station'
}

// 设备类型颜色配置（P1扩展 - 用于Tag或卡片展示）
export const EQUIPMENT_TYPE_COLORS = {
  [EQUIPMENT_TYPES.ANNEALING_FURNACE]: '#FF7043',
  [EQUIPMENT_TYPES.CRANE]: '#42A5F5',
  [EQUIPMENT_TYPES.AUTOMATIC_CART]: '#66BB6A',
  [EQUIPMENT_TYPES.PREPARATION_STATION]: '#AB47BC'
}

// 设备状态排序权重（用于前端排序增强）
export const EQUIPMENT_STATUS_WEIGHTS = {
  [EQUIPMENT_STATUS.MAINTENANCE]: 1,
  [EQUIPMENT_STATUS.DISABLED]: 2,
  [EQUIPMENT_STATUS.ENABLED]: 3
}

// 设备类型映射 - 方便快速获取标签（P1-#9）
export const EQUIPMENT_TYPE_MAP = {
  [EQUIPMENT_TYPES.ANNEALING_FURNACE]: '退火炉',
  [EQUIPMENT_TYPES.CRANE]: '行车',
  [EQUIPMENT_TYPES.AUTOMATIC_CART]: '自动料车',
  [EQUIPMENT_TYPES.PREPARATION_STATION]: '备料台'
}

// 设备状态映射 - 方便快速获取标签（P1-#9）
export const EQUIPMENT_STATUS_MAP = {
  [EQUIPMENT_STATUS.ENABLED]: '启用',
  [EQUIPMENT_STATUS.DISABLED]: '禁用',
  [EQUIPMENT_STATUS.MAINTENANCE]: '维护中'
}

// 数值型字段单位配置（P1-#8）
export const EQUIPMENT_FIELD_UNITS = {
  ratedCapacityTon: '吨',
  ratedPowerKw: 'kW',
  maxOperatingTemperatureC: '°C',
  chamberLengthCm: 'cm',
  chamberWidthCm: 'cm',
  chamberHeightCm: 'cm',
  ratedLiftCapacityTon: '吨',
  maxSpeedMps: 'm/s',
  minSpeedMps: 'm/s',
  loadCapacityTon: '吨',
  batteryCapacityKwh: 'kWh',
  lowBatteryThresholdPercent: '%',
  maxLoadCapacityTon: '吨',
  maintenanceCycleDays: '天'
}

// 数值型字段精度与范围配置（P1-#8）
export const EQUIPMENT_FIELD_LIMITS = {
  ratedCapacityTon: { min: 0.01, max: 1000, precision: 2 },
  ratedPowerKw: { min: 0.01, max: 5000, precision: 2 },
  maxOperatingTemperatureC: { min: 0, max: 2000, precision: 0 },
  chamberLengthCm: { min: 0, max: 10000, precision: 0 },
  chamberWidthCm: { min: 0, max: 10000, precision: 0 },
  chamberHeightCm: { min: 0, max: 10000, precision: 0 },
  ratedLiftCapacityTon: { min: 0.01, max: 200, precision: 2 },
  maxSpeedMps: { min: 0, max: 20, precision: 2 },
  minSpeedMps: { min: 0, max: 20, precision: 2 },
  loadCapacityTon: { min: 0.01, max: 200, precision: 2 },
  batteryCapacityKwh: { min: 0.1, max: 2000, precision: 1 },
  lowBatteryThresholdPercent: { min: 0, max: 100, precision: 0 },
  maxLoadCapacityTon: { min: 0.01, max: 200, precision: 2 },
  maintenanceCycleDays: { min: 1, max: 3650, precision: 0 }
}

// 通讯参数敏感字段列表（用于前端兜底提示）
export const COMMUNICATION_SENSITIVE_KEYS = ['password', 'secret', 'token', 'apiKey']
