/**
 * 文件名称：bin-management.js
 * 文件描述：料框管理API接口封装
 * 创建日期：2025-01-10
 * 修改记录:
 *   - 2025-01-10: 初始创建，完整封装6个料框管理接口
 */

import service from '@/utils/request'
import { BIN_API_ENDPOINTS } from '../constants/api-config'

/**
 * 料框注册
 * @param {Object} data - 料框注册数据
 * @param {string} [data.binCode] - 料框编号（可选，不提供则自动生成）
 * @param {string} data.binSpecificationId - 料框规格ID（UUID格式，必填）
 * @param {string} data.productId - 铝箔产品ID（UUID格式，必填）
 * @param {string} data.productCode - 产品代码（必填）
 * @param {string} [data.batchNumber] - 批次号（可选）
 * @param {number} data.weight - 重量(kg)（必填，正数，最多3位小数）
 * @param {string} [data.currentLocationId] - 初始位置ID（UUID格式，可选）
 * @param {string} [data.remarks] - 备注（可选，最大500字符）
 * @returns {Promise<Object>} 返回料框完整信息（包含关联的specification、product、currentLocation对象）
 */
export function registerBin(data) {
  return service({
    url: BIN_API_ENDPOINTS.register.url,
    method: BIN_API_ENDPOINTS.register.method,
    data
  })
}

/**
 * 批量注册料框
 * @param {Object} data - 批量注册数据
 * @param {Array<Object>} data.bins - 料框数据数组（至少1条，每条格式同单个注册接口）
 * @returns {Promise<Object>} 返回批量注册结果（包含successCount、failedCount、successRecords、failedRecords）
 */
export function batchRegisterBins(data) {
  return service({
    url: BIN_API_ENDPOINTS.batchRegister.url,
    method: BIN_API_ENDPOINTS.batchRegister.method,
    data
  })
}

/**
 * 料框列表查询
 * @param {Object} params - 查询参数
 * @param {string} [params.status] - 料框状态筛选（枚举值）
 * @param {string} [params.productCode] - 产品代码筛选
 * @param {string} [params.batchNumber] - 批次号筛选
 * @param {string} [params.binSpecificationId] - 料框规格ID筛选（UUID格式）
 * @param {string} [params.currentLocationId] - 当前位置ID筛选（UUID格式）
 * @param {string} [params.stackId] - 料垛ID筛选（UUID格式）
 * @param {string} [params.registeredAtStart] - 注册时间起始（ISO 8601格式）
 * @param {string} [params.registeredAtEnd] - 注册时间结束（ISO 8601格式）
 * @param {string} [params.searchKeyword] - 搜索关键词（料框编号、产品代码模糊匹配）
 * @param {string} [params.sortBy] - 排序字段和顺序（格式：字段名:(asc|desc)，默认：createdAt:desc）
 * @param {number} [params.page=1] - 页码（默认1）
 * @param {number} [params.limit=10] - 每页数量（1-100，默认10）
 * @returns {Promise<Object>} 返回分页结果（包含results、page、limit、totalPages、totalResults）
 */
export function getBinList(params) {
  return service({
    url: BIN_API_ENDPOINTS.list.url,
    method: BIN_API_ENDPOINTS.list.method,
    params
  })
}

/**
 * 料框详情查询
 * @param {string} id - 料框ID（UUID格式，必填）
 * @returns {Promise<Object>} 返回料框完整信息（包含关联的specification、product、currentLocation对象）
 */
export function getBinDetail(id) {
  return service({
    url: BIN_API_ENDPOINTS.detail.url.replace(':id', id),
    method: BIN_API_ENDPOINTS.detail.method
  })
}

/**
 * 更新料框状态
 * @param {string} id - 料框ID（UUID格式，必填）
 * @param {Object} data - 状态更新数据
 * @param {string} data.targetStatus - 目标状态（枚举值，必填）
 * @param {string} data.triggerType - 触发类型（枚举值：SCAN_CONFIRMATION、PLC_SIGNAL、LOGISTICS_TASK、MANUAL_OPERATION、SYSTEM_AUTO，必填）
 * @param {string} [data.newLocationId] - 新位置ID（UUID格式，可选）
 * @param {string} [data.equipmentId] - 设备ID（UUID格式，可选）
 * @param {string} [data.remarks] - 备注（可选，最大500字符）
 * @returns {Promise<Object>} 返回更新后的料框完整信息
 */
export function updateBinStatus(id, data) {
  return service({
    url: BIN_API_ENDPOINTS.updateStatus.url.replace(':id', id),
    method: BIN_API_ENDPOINTS.updateStatus.method,
    data
  })
}

/**
 * 料框状态历史查询
 * @param {string} id - 料框ID（UUID格式，必填）
 * @param {Object} params - 查询参数
 * @param {number} [params.limit] - 每页数量（1-100，可选）
 * @param {number} [params.offset] - 偏移量（最小值0，可选）
 * @param {string} [params.startDate] - 开始时间（ISO 8601格式，可选）
 * @param {string} [params.endDate] - 结束时间（ISO 8601格式，可选）
 * @returns {Promise<Array>} 返回状态历史记录数组（按时间倒序）
 */
export function getBinStatusHistory(id, params) {
  return service({
    url: BIN_API_ENDPOINTS.statusHistory.url.replace(':id', id),
    method: BIN_API_ENDPOINTS.statusHistory.method,
    params
  })
}

