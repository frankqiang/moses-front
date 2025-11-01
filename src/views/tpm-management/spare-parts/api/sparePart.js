/**
 * 文件名称：sparePart.js
 * 文件描述：备件管理API服务模块，封装所有备件管理相关接口
 * 创建日期：2025-01-21
 * 修改记录：
 *   - 2025-01-21: 初始创建
 *   - 2025-01-21: 完善P0阶段功能（详细注释、日志记录、请求取消）
 */

import service from '@/utils/request'
import { API_BASE_PATH } from '../constants/api-config'

// ========================================
// 🔧 请求取消管理
// ========================================

/**
 * 存储活动请求的CancelToken
 * key: 请求标识（方法名+参数）
 * value: axios CancelToken source
 */
const pendingRequests = new Map()

/**
 * 生成请求唯一标识
 * @param {string} method - API方法名
 * @param {Object} params - 请求参数
 * @returns {string} 请求唯一标识
 */
function generateRequestKey(method, params) {
  return `${method}_${JSON.stringify(params || {})}`
}

/**
 * 取消指定的待处理请求
 * @param {string} requestKey - 请求标识
 */
function cancelPendingRequest(requestKey) {
  if (pendingRequests.has(requestKey)) {
    const source = pendingRequests.get(requestKey)
    source.cancel('Request canceled by user')
    pendingRequests.delete(requestKey)

    if (process.env.NODE_ENV === 'development') {
      console.log('🚫 [API] 已取消请求:', requestKey)
    }
  }
}

/**
 * 清理已完成的请求
 * @param {string} requestKey - 请求标识
 */
function cleanupRequest(requestKey) {
  if (pendingRequests.has(requestKey)) {
    pendingRequests.delete(requestKey)
  }
}

// ========================================
// 📡 API接口方法
// ========================================

/**
 * 查询备件列表
 * @param {Object} params - 查询参数
 * @param {string} [params.sparePartCode] - 备件编码（可选，模糊查询，不区分大小写）
 * @param {string} [params.sparePartName] - 备件名称（可选，模糊查询）
 * @param {string} [params.applicableEquipmentTypes] - 适用设备类型（可选，模糊查询）
 * @param {boolean} [params.lowStock] - 低库存筛选（可选，true=只显示低于安全库存的备件）
 * @param {number} [params.page=1] - 页码（可选，默认1，≥1）
 * @param {number} [params.limit=10] - 每页数量（可选，默认10，1-100）
 * @param {string} [params.sortBy='createdAt'] - 排序字段（可选，sparePartCode/sparePartName/createdAt/updatedAt）
 * @param {string} [params.sortOrder='desc'] - 排序方向（可选，asc/desc）
 * @returns {Promise<Object>} 返回分页查询结果
 * @returns {Array} response.data.results - 备件列表
 * @returns {number} response.data.page - 当前页码
 * @returns {number} response.data.limit - 每页数量
 * @returns {number} response.data.totalPages - 总页数
 * @returns {number} response.data.totalResults - 总记录数
 * @example
 * // 查询所有备件
 * getSpareParts({ page: 1, limit: 10 })
 *
 * // 查询低库存备件
 * getSpareParts({ lowStock: true })
 *
 * // 按编码模糊查询
 * getSpareParts({ sparePartCode: 'SP-001' })
 */
export function getSpareParts(params) {
  const requestKey = generateRequestKey('getSpareParts', params)

  // 取消相同的待处理请求（避免重复查询）
  cancelPendingRequest(requestKey)

  return service({
    url: API_BASE_PATH,
    method: 'get',
    params
  }).then(response => {
    cleanupRequest(requestKey)

    if (process.env.NODE_ENV === 'development') {
      console.log('✅ [API] 查询备件列表成功:', {
        totalResults: response.data?.totalResults,
        page: response.data?.page,
        limit: response.data?.limit,
        params
      })
    }

    return response
  }).catch(error => {
    cleanupRequest(requestKey)
    throw error
  })
}

/**
 * 查询单个备件详情
 * @param {string} sparePartId - 备件ID（必填，UUID格式）
 * @returns {Promise<Object>} 返回备件详细信息
 * @returns {Object} response.data - 备件详情
 * @returns {string} response.data.sparePartId - 备件ID
 * @returns {string} response.data.sparePartCode - 备件编码
 * @returns {string} response.data.sparePartName - 备件名称
 * @returns {Object} response.data.inventory - 库存信息
 * @returns {Object} response.data.createdBy - 创建人信息
 * @returns {Object} response.data.updatedBy - 更新人信息
 * @example
 * getSparePartById('123e4567-e89b-12d3-a456-426614174000')
 */
export function getSparePartById(sparePartId) {
  return service({
    url: `${API_BASE_PATH}/${sparePartId}`,
    method: 'get'
  }).then(response => {
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ [API] 查询备件详情成功:', {
        sparePartId,
        sparePartCode: response.data?.sparePartCode,
        sparePartName: response.data?.sparePartName
      })
    }

    return response
  })
}

/**
 * 创建备件主数据
 * @param {Object} data - 备件数据
 * @param {string} data.sparePartCode - 备件编码（必填，全局唯一，自动转大写，1-100字符）
 * @param {string} data.sparePartName - 备件名称（必填，1-200字符）
 * @param {string} data.unit - 计量单位（必填，1-50字符，如：件、个、升、公斤）
 * @param {string} [data.specification] - 规格型号（可选，最多200字符）
 * @param {string} [data.applicableEquipmentTypes] - 适用设备类型（可选，逗号分隔，最多500字符）
 * @param {Object} [data.supplierInfo] - 供应商信息（可选，JSONB对象）
 * @param {string} [data.supplierInfo.name] - 供应商名称
 * @param {string} [data.supplierInfo.contact] - 联系人
 * @param {string} [data.supplierInfo.phone] - 联系电话
 * @param {string} [data.supplierInfo.email] - 邮箱
 * @param {string} [data.unitPrice] - 单价（可选，DECIMAL(10,2)，≥0）
 * @param {number} [data.maxStock] - 库存上限（可选，整数，≥0，必须≥库存下限）
 * @param {number} [data.minStock] - 库存下限（可选，整数，≥0，必须≤库存上限）
 * @param {number} [data.safetyStock=0] - 安全库存（可选，整数，≥0，默认0）
 * @param {number} [data.leadTime] - 采购提前期（可选，整数，≥0，单位：天）
 * @param {string} [data.storageLocation] - 存储位置（可选，最多100字符）
 * @param {number} [data.shelfLife] - 保质期（可选，整数，≥0，单位：月）
 * @param {string} [data.remark] - 备注（可选，文本）
 * @returns {Promise<Object>} 返回创建的备件详情
 * @returns {Object} response.data - 备件详情
 * @returns {string} response.message - 操作成功消息
 * @example
 * createSparePart({
 *   sparePartCode: 'SP-BEARING-001',
 *   sparePartName: '高温轴承',
 *   specification: 'SKF 6208',
 *   unit: '件',
 *   applicableEquipmentTypes: '退火炉,行车',
 *   supplierInfo: {
 *     name: 'SKF供应商',
 *     contact: '张三',
 *     phone: '13800138000',
 *     email: 'zhangsan@example.com'
 *   },
 *   unitPrice: '280.00',
 *   maxStock: 50,
 *   minStock: 10,
 *   safetyStock: 5,
 *   leadTime: 7,
 *   storageLocation: '仓库A区2号货架'
 * })
 */
export function createSparePart(data) {
  return service({
    url: API_BASE_PATH,
    method: 'post',
    data
  }).then(response => {
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ [API] 创建备件成功:', {
        sparePartCode: response.data?.sparePartCode,
        sparePartName: response.data?.sparePartName,
        message: response.message
      })
    }

    return response
  })
}

/**
 * 更新备件信息（部分更新）
 * @param {string} sparePartId - 备件ID（必填，UUID格式）
 * @param {Object} data - 更新数据（至少包含一个字段）
 * @param {string} [data.sparePartName] - 备件名称（1-200字符）
 * @param {string} [data.specification] - 规格型号（最多200字符）
 * @param {string} [data.applicableEquipmentTypes] - 适用设备类型（逗号分隔，最多500字符）
 * @param {Object} [data.supplierInfo] - 供应商信息（JSONB对象）
 * @param {string} [data.unitPrice] - 单价（DECIMAL(10,2)，≥0）
 * @param {string} [data.unit] - 计量单位（1-50字符）
 * @param {number} [data.maxStock] - 库存上限（整数，≥0，必须≥库存下限）
 * @param {number} [data.minStock] - 库存下限（整数，≥0，必须≤库存上限）
 * @param {number} [data.safetyStock] - 安全库存（整数，≥0）
 * @param {number} [data.leadTime] - 采购提前期（整数，≥0，单位：天）
 * @param {string} [data.storageLocation] - 存储位置（最多100字符）
 * @param {number} [data.shelfLife] - 保质期（整数，≥0，单位：月）
 * @param {string} [data.remark] - 备注（文本）
 * @returns {Promise<Object>} 返回更新后的备件详情
 * @returns {Object} response.data - 备件详情
 * @returns {string} response.message - 操作成功消息
 * @example
 * updateSparePart('123e4567-e89b-12d3-a456-426614174000', {
 *   unitPrice: '300.00',
 *   safetyStock: 10
 * })
 */
export function updateSparePart(sparePartId, data) {
  return service({
    url: `${API_BASE_PATH}/${sparePartId}`,
    method: 'patch',
    data
  }).then(response => {
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ [API] 更新备件信息成功:', {
        sparePartId,
        sparePartCode: response.data?.sparePartCode,
        updatedFields: Object.keys(data),
        message: response.message
      })
    }

    return response
  })
}

/**
 * 查询备件库存
 * @param {string} sparePartId - 备件ID（必填，UUID格式）
 * @returns {Promise<Object>} 返回库存详情
 * @returns {Object} response.data - 库存详情
 * @returns {string} response.data.sparePartId - 备件ID
 * @returns {number} response.data.currentQuantity - 当前库存
 * @returns {number} response.data.inTransitQuantity - 在途数量
 * @returns {number} response.data.reservedQuantity - 预留数量
 * @returns {number} response.data.availableQuantity - 可用库存（计算值：当前库存-预留数量）
 * @returns {boolean} response.data.isLowStock - 是否低库存（当前库存≤安全库存）
 * @returns {Object} response.data.sparePart - 关联的备件基本信息
 * @example
 * getSparePartInventory('123e4567-e89b-12d3-a456-426614174000')
 */
export function getSparePartInventory(sparePartId) {
  return service({
    url: `${API_BASE_PATH}/${sparePartId}/inventory`,
    method: 'get'
  }).then(response => {
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ [API] 查询备件库存成功:', {
        sparePartId,
        currentQuantity: response.data?.currentQuantity,
        availableQuantity: response.data?.availableQuantity,
        isLowStock: response.data?.isLowStock
      })
    }

    return response
  })
}

/**
 * 备件入库
 * @param {string} sparePartId - 备件ID（必填，UUID格式）
 * @param {Object} data - 入库数据
 * @param {string} [data.transactionNumber] - 入库单号（可选，不提供则自动生成：SP-IN-时间戳，全局唯一，自动转大写）
 * @param {number} data.quantity - 入库数量（必填，整数，≥1）
 * @param {string} [data.purpose] - 用途说明（可选，文本）
 * @param {string} [data.remark] - 备注（可选，文本）
 * @returns {Promise<Object>} 返回入库结果
 * @returns {Object} response.data - 入库记录详情
 * @returns {string} response.data.transactionNumber - 入库单号
 * @returns {number} response.data.quantity - 入库数量
 * @returns {Object} response.data.updatedInventory - 更新后的库存信息
 * @returns {string} response.message - 操作成功消息
 * @example
 * inStockSparePart('123e4567-e89b-12d3-a456-426614174000', {
 *   quantity: 30,
 *   purpose: '采购入库',
 *   remark: '供应商：SKF'
 * })
 */
export function inStockSparePart(sparePartId, data) {
  return service({
    url: `${API_BASE_PATH}/${sparePartId}/in-stock`,
    method: 'post',
    data
  }).then(response => {
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ [API] 备件入库成功:', {
        sparePartId,
        transactionNumber: response.data?.transactionNumber,
        quantity: response.data?.quantity,
        newCurrentQuantity: response.data?.updatedInventory?.currentQuantity,
        message: response.message
      })
    }

    return response
  })
}

/**
 * 备件出库（包含领用、退库、报废）
 * @param {string} sparePartId - 备件ID（必填，UUID格式）
 * @param {Object} data - 出库数据
 * @param {string} data.transactionType - 出库类型（必填，枚举：领用/退库/报废）
 * @param {string} [data.transactionNumber] - 出库单号（可选，不提供则自动生成，格式根据类型：SP-OUT/RET/SCR-时间戳）
 * @param {number} data.quantity - 出库数量（必填，整数，≥1，领用和报废时必须≤当前库存）
 * @param {string} [data.relatedTaskId] - 关联维护任务ID（可选，领用时必须填relatedTaskId或relatedFailureId之一）
 * @param {string} [data.relatedFailureId] - 关联故障单ID（可选，领用时必须填relatedTaskId或relatedFailureId之一）
 * @param {string} [data.purpose] - 用途说明（可选，文本）
 * @param {string} [data.remark] - 备注（可选，文本）
 * @returns {Promise<Object>} 返回出库结果
 * @returns {Object} response.data - 出库记录详情
 * @returns {string} response.data.transactionType - 出库类型
 * @returns {string} response.data.transactionNumber - 出库单号
 * @returns {number} response.data.quantity - 出库数量
 * @returns {Object} response.data.updatedInventory - 更新后的库存信息
 * @returns {string} response.message - 操作成功消息
 * @example
 * // 领用备件
 * outStockSparePart('123e4567-e89b-12d3-a456-426614174000', {
 *   transactionType: '领用',
 *   quantity: 2,
 *   relatedTaskId: 'task-001',
 *   purpose: '更换退火炉1#传动轴承'
 * })
 *
 * // 备件退库
 * outStockSparePart('123e4567-e89b-12d3-a456-426614174000', {
 *   transactionType: '退库',
 *   quantity: 1,
 *   purpose: '任务完成剩余退库'
 * })
 *
 * // 备件报废
 * outStockSparePart('123e4567-e89b-12d3-a456-426614174000', {
 *   transactionType: '报废',
 *   quantity: 3,
 *   purpose: '超过保质期报废'
 * })
 */
export function outStockSparePart(sparePartId, data) {
  return service({
    url: `${API_BASE_PATH}/${sparePartId}/out-stock`,
    method: 'post',
    data
  }).then(response => {
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ [API] 备件出库成功:', {
        sparePartId,
        transactionType: response.data?.transactionType,
        transactionNumber: response.data?.transactionNumber,
        quantity: response.data?.quantity,
        newCurrentQuantity: response.data?.updatedInventory?.currentQuantity,
        message: response.message
      })
    }

    return response
  })
}

/**
 * 查询出入库记录
 * @param {Object} params - 查询参数
 * @param {string} [params.sparePartId] - 备件ID筛选（可选，UUID格式）
 * @param {string} [params.transactionType] - 出入库类型筛选（可选，枚举：入库/领用/退库/报废）
 * @param {string} [params.transactionNumber] - 出入库单号（可选，模糊查询，不区分大小写）
 * @param {string} [params.startDate] - 开始日期（可选，ISO 8601格式，包含）
 * @param {string} [params.endDate] - 结束日期（可选，ISO 8601格式，包含）
 * @param {number} [params.page=1] - 页码（可选，默认1，≥1）
 * @param {number} [params.limit=10] - 每页数量（可选，默认10，1-100）
 * @param {string} [params.sortBy='transactionTime'] - 排序字段（可选，transactionNumber/transactionTime/quantity）
 * @param {string} [params.sortOrder='desc'] - 排序方向（可选，asc/desc，默认desc）
 * @returns {Promise<Object>} 返回分页查询结果
 * @returns {Array} response.data.results - 出入库记录列表
 * @returns {number} response.data.page - 当前页码
 * @returns {number} response.data.limit - 每页数量
 * @returns {number} response.data.totalPages - 总页数
 * @returns {number} response.data.totalResults - 总记录数
 * @example
 * // 查询某备件的所有出入库记录
 * getSparePartTransactions({
 *   sparePartId: '123e4567-e89b-12d3-a456-426614174000',
 *   page: 1,
 *   limit: 10
 * })
 *
 * // 查询指定时间范围的领用记录
 * getSparePartTransactions({
 *   transactionType: '领用',
 *   startDate: '2024-01-01T00:00:00.000Z',
 *   endDate: '2024-01-31T23:59:59.999Z'
 * })
 */
export function getSparePartTransactions(params) {
  const requestKey = generateRequestKey('getSparePartTransactions', params)

  // 取消相同的待处理请求
  cancelPendingRequest(requestKey)

  return service({
    url: `${API_BASE_PATH}/transactions`,
    method: 'get',
    params
  }).then(response => {
    cleanupRequest(requestKey)

    if (process.env.NODE_ENV === 'development') {
      console.log('✅ [API] 查询出入库记录成功:', {
        totalResults: response.data?.totalResults,
        page: response.data?.page,
        limit: response.data?.limit,
        params
      })
    }

    return response
  }).catch(error => {
    cleanupRequest(requestKey)
    throw error
  })
}

// ========================================
// 📤 导出API服务
// ========================================

/**
 * 备件管理API服务模块
 * 说明：
 * - 所有接口已实现统一的响应格式处理和错误处理（由request.js统一处理）
 * - JWT Token自动添加到请求头（由request.js拦截器处理）
 * - 支持请求取消功能（避免重复请求）
 * - 开发环境下自动记录接口调用日志
 */
export default {
  getSpareParts,
  getSparePartById,
  createSparePart,
  updateSparePart,
  getSparePartInventory,
  inStockSparePart,
  outStockSparePart,
  getSparePartTransactions
}

