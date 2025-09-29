/**
 * 文件名称：detail-config.js
 * 文件描述：设备详情展示相关配置，包含字段别名、工具提示等信息
 * 创建日期：2025-09-29
 * 修改记录：
 *   - 2025-09-29: 初始创建，支撑设备详情抽屉展示逻辑
 */

import {
  EQUIPMENT_FIELD_UNITS,
  EQUIPMENT_DETAIL_LABELS
} from './equipment-management'

// 详情字段工具提示配置
export const EQUIPMENT_DETAIL_TOOLTIPS = {
  ratedCapacityTon: '额定容量用于衡量设备可承载的最大重量，请确保与设备铭牌一致',
  maxOperatingTemperatureC: '最大工作温度超过安全范围会引发设备损坏，需谨慎调整',
  navigationType: '自动料车导航方式直接影响运行精度，切换后需重新校准路径',
  controlInterfaceParams: '控制参数已脱敏显示，敏感字段不会透出，请在编辑时重新填写',
  communicationEndpoint: '与后端 OPC/Modbus 服务保持一致，变更后需同步后端配置',
  plcNodeIdMasked: '展示为脱敏字段，真实值需联系自动化工程师获取',
  controlSystemAddress: '用于REST或RPC控制接口，需保证网络可达',
  maintenanceCycleDays: '根据设备制造商建议填写，单位为天',
  lastMaintenanceDate: '记录最近一次维护完成日期，便于追踪维护周期',
  nextMaintenanceDate: '计划下次维护日期，提醒维护团队准时执行'
}

// 通讯字段展示映射
export const EQUIPMENT_COMMUNICATION_MAPPINGS = [
  {
    key: 'communicationEndpoint',
    label: '通讯端点',
    copyable: true
  },
  {
    key: 'plcNodeIdMasked',
    label: 'PLC 节点'
  },
  {
    key: 'controlSystemAddress',
    label: '控制系统地址',
    copyable: true
  }
]

// 维护字段展示映射
export const EQUIPMENT_MAINTENANCE_MAPPINGS = [
  {
    key: 'maintenanceCycleDays',
    label: '维护周期',
    unit: EQUIPMENT_FIELD_UNITS.maintenanceCycleDays
  },
  {
    key: 'lastMaintenanceDate',
    label: '上次维护日期'
  },
  {
    key: 'nextMaintenanceDate',
    label: '下次维护日期'
  }
]

// 详情字段展示映射
export const EQUIPMENT_DETAIL_SECTION_MAPPINGS = Object.entries(EQUIPMENT_DETAIL_LABELS).reduce(
  (acc, [key, label]) => {
    acc[key] = {
      label,
      unit: EQUIPMENT_FIELD_UNITS[key] || ''
    }
    return acc
  },
  {}
)

