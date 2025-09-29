/**
 * 文件名称：index.js
 * 文件描述：设备主数据管理模块API统一导出入口
 * 创建日期：2025-09-29
 * 修改记录：
 *   - 2025-09-29: 初始创建，统一导出所有设备管理API接口
 */
import {
  fetchEquipmentList,
  getEquipmentDetail,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  batchDeleteEquipments,
  exportEquipmentList,
  getEquipmentStatusStats,
  validateEquipmentCode
} from './equipment-management'

export {
  fetchEquipmentList,
  getEquipmentDetail,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  batchDeleteEquipments,
  exportEquipmentList,
  getEquipmentStatusStats,
  validateEquipmentCode
}

// 默认导出主要接口
export default {
  fetchEquipmentList,
  getEquipmentDetail,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  batchDeleteEquipments,
  exportEquipmentList,
  getEquipmentStatusStats,
  validateEquipmentCode
}
