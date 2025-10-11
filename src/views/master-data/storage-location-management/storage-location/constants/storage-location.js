/**
 * 文件名称: storage-location.js
 * 文件描述: 库位管理基础常量配置
 * 创建日期: 2025-01-20
 * 修改记录:
 *   - 2025-01-20: 初始创建
 */

// 库位类型枚举
export const LOCATION_TYPE = {
  GROUND_STACKING: 'ground_stacking',
  FIXED_RACK: 'fixed_rack',
  PREPARATION_STATION: 'preparation_station',
  FURNACE_PORT_VIRTUAL: 'furnace_port_virtual'
}

// 库位类型选项
export const LOCATION_TYPE_OPTIONS = [
  { label: '地面堆垛区', value: LOCATION_TYPE.GROUND_STACKING },
  { label: '固定货架', value: LOCATION_TYPE.FIXED_RACK },
  { label: '备料台工位', value: LOCATION_TYPE.PREPARATION_STATION },
  { label: '炉口虚拟位', value: LOCATION_TYPE.FURNACE_PORT_VIRTUAL }
]

// 占用状态枚举
export const OCCUPANCY_STATUS = {
  FREE: 'free',
  OCCUPIED: 'occupied',
  RESERVED: 'reserved',
  DISABLED: 'disabled',
  MAINTENANCE: 'maintenance'
}

// 占用状态选项
export const OCCUPANCY_STATUS_OPTIONS = [
  { label: '空闲', value: OCCUPANCY_STATUS.FREE },
  { label: '占用', value: OCCUPANCY_STATUS.OCCUPIED },
  { label: '预留', value: OCCUPANCY_STATUS.RESERVED },
  { label: '禁用', value: OCCUPANCY_STATUS.DISABLED },
  { label: '维护', value: OCCUPANCY_STATUS.MAINTENANCE }
]

// 占用状态映射
export const OCCUPANCY_STATUS_MAP = {
  [OCCUPANCY_STATUS.FREE]: '空闲',
  [OCCUPANCY_STATUS.OCCUPIED]: '占用',
  [OCCUPANCY_STATUS.RESERVED]: '预留',
  [OCCUPANCY_STATUS.DISABLED]: '禁用',
  [OCCUPANCY_STATUS.MAINTENANCE]: '维护'
}

// 占用状态颜色标记
export const OCCUPANCY_STATUS_COLORS = {
  [OCCUPANCY_STATUS.FREE]: 'success',
  [OCCUPANCY_STATUS.OCCUPIED]: 'danger',
  [OCCUPANCY_STATUS.RESERVED]: 'warning',
  [OCCUPANCY_STATUS.DISABLED]: 'info',
  [OCCUPANCY_STATUS.MAINTENANCE]: 'primary'
}

// 状态转换规则
export const STATUS_TRANSITION_RULES = {
  [OCCUPANCY_STATUS.FREE]: [
    OCCUPANCY_STATUS.OCCUPIED,
    OCCUPANCY_STATUS.RESERVED,
    OCCUPANCY_STATUS.DISABLED,
    OCCUPANCY_STATUS.MAINTENANCE
  ],
  [OCCUPANCY_STATUS.OCCUPIED]: [
    OCCUPANCY_STATUS.FREE,
    OCCUPANCY_STATUS.DISABLED,
    OCCUPANCY_STATUS.MAINTENANCE
  ],
  [OCCUPANCY_STATUS.RESERVED]: [
    OCCUPANCY_STATUS.OCCUPIED,
    OCCUPANCY_STATUS.FREE,
    OCCUPANCY_STATUS.DISABLED
  ],
  [OCCUPANCY_STATUS.DISABLED]: [
    OCCUPANCY_STATUS.FREE,
    OCCUPANCY_STATUS.MAINTENANCE
  ],
  [OCCUPANCY_STATUS.MAINTENANCE]: [
    OCCUPANCY_STATUS.FREE,
    OCCUPANCY_STATUS.DISABLED
  ]
}

