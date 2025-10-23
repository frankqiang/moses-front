/**
 * 文件名称：stack-management.js
 * 文件描述：料垛管理API接口封装
 * 创建日期：2025-01-10
 * 修改记录:
 *   - 2025-01-10: 初始创建，完整封装5个料垛管理接口
 */

import service from '@/utils/request'
import { STACK_API_ENDPOINTS } from '../constants'

/**
 * 组垛
 * @param {Object} data - 组垛数据
 * @param {string} [data.stackCode] - 料垛编号（格式：LD-YYYYMMDD-XXXX，可选，不提供则自动生成）
 * @param {Array<string>} data.binIds - 料框ID列表（UUID数组，至少2个，元素唯一，必填）
 * @param {string} [data.currentLocationId] - 料垛位置ID（UUID格式，可选）
 *   - 不传：使用第一个料框的位置（就地组垛）
 *   - 传入库位ID：指定新位置
 *   - 传入null：暂无位置
 * @param {string} [data.remarks] - 备注（可选，最大500字符）
 * @returns {Promise<Object>} 返回料垛完整信息（包含id、stackCode、totalWeight、binCount、currentLocationId等字段）
 */
export function createStack(data) {
  return service({
    url: STACK_API_ENDPOINTS.create.url,
    method: STACK_API_ENDPOINTS.create.method,
    data
  })
}

/**
 * 料垛列表查询
 * @param {Object} params - 查询参数
 * @param {string} [params.status] - 料垛状态筛选（枚举值：ACTIVE、DESTACKED）
 * @param {string} [params.specCode] - 料框规格代码筛选
 * @param {string} [params.productCode] - 产品代码筛选
 * @param {string} [params.batchNumber] - 批次号筛选
 * @param {string} [params.currentLocationId] - 当前位置ID筛选（UUID格式）
 * @param {string} [params.createdAtStart] - 创建时间起始（ISO 8601格式）
 * @param {string} [params.createdAtEnd] - 创建时间结束（ISO 8601格式）
 * @param {string} [params.searchKeyword] - 搜索关键词（料垛编号、产品代码模糊匹配）
 * @param {string} [params.sortBy] - 排序字段和顺序（格式：字段名:(asc|desc)，默认：createdAt:desc）
 * @param {number} [params.page=1] - 页码（默认1）
 * @param {number} [params.limit=10] - 每页数量（1-100，默认10）
 * @returns {Promise<Object>} 返回分页结果（包含results、page、limit、totalPages、totalResults）
 */
export function getStackList(params) {
  return service({
    url: STACK_API_ENDPOINTS.list.url,
    method: STACK_API_ENDPOINTS.list.method,
    params
  })
}

/**
 * 料垛详情查询
 * @param {string} id - 料垛ID（UUID格式，必填）
 * @returns {Promise<Object>} 返回料垛完整信息（包含关联的currentLocation对象）
 */
export function getStackDetail(id) {
  return service({
    url: STACK_API_ENDPOINTS.detail.url.replace(':id', id),
    method: STACK_API_ENDPOINTS.detail.method
  })
}

/**
 * 拆垛
 * @param {string} id - 料垛ID（UUID格式，必填）
 * @param {Object} data - 拆垛数据
 * @param {string} [data.remarks] - 拆垛原因（可选，最大500字符）
 * @returns {Promise<Object>} 返回拆垛结果
 * @returns {Object} response.data - 拆垛结果数据
 * @returns {string} response.data.stackId - 料垛ID
 * @returns {string} response.data.stackCode - 料垛编号
 * @returns {number} response.data.destackedBinCount - 本次拆垛的料框数量
 * @returns {number} response.data.remainingBinCount - 剩余的料框数量（部分拆垛时）
 * @returns {Array<string>} response.data.destackedBinCodes - 拆垛的料框编号列表
 * @returns {boolean} response.data.isFullDestack - 是否完全拆垛
 */
export function destackStack(id, data) {
  return service({
    url: STACK_API_ENDPOINTS.destack.url.replace(':id', id),
    method: STACK_API_ENDPOINTS.destack.method,
    data
  })
}

/**
 * 料垛成员料框列表查询
 * @param {string} id - 料垛ID（UUID格式，必填）
 * @returns {Promise<Array>} 返回料框列表（按堆叠顺序）
 */
export function getStackBins(id) {
  return service({
    url: STACK_API_ENDPOINTS.bins.url.replace(':id', id),
    method: STACK_API_ENDPOINTS.bins.method
  })
}

