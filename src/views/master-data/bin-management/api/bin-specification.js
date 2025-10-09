/**
 * 文件名称：bin-specification.js
 * 文件描述：料框规格管理模块API接口封装，提供CRUD操作和状态管理
 * 创建日期：2025-01-09
 * 修改记录：
 *   - 2025-01-09: 初始创建，实现基础CRUD API方法
 *   - 2025-01-09: P1优化 - 添加请求防抖、取消控制、完善类型定义
 */

import request from '@/utils/request'
import { debounce } from '@/utils'

const BASE_URL = '/mdm/bin-specifications'

// 请求取消令牌存储
const cancelTokens = new Map()

/**
 * 取消指定的待处理请求
 * @param {string} requestKey - 请求唯一标识
 */
export function cancelRequest(requestKey) {
  const cancelToken = cancelTokens.get(requestKey)
  if (cancelToken) {
    cancelToken.cancel('请求已取消')
    cancelTokens.delete(requestKey)
  }
}

/**
 * 取消所有待处理的料框规格请求
 */
export function cancelAllRequests() {
  cancelTokens.forEach((cancelToken) => {
    cancelToken.cancel('批量取消请求')
  })
  cancelTokens.clear()
}

/**
 * @typedef {Object} BinSpecificationListParams
 * @property {string} [specCode] - 规格代码（模糊查询），最多50字符
 * @property {string} [specName] - 规格名称（模糊查询），最多200字符
 * @property {string} [material] - 材质（精确匹配），最多100字符
 * @property {string} [status] - 状态筛选，枚举值：'启用'|'禁用'
 * @property {number} [lengthMin] - 长度最小值(cm)，正数
 * @property {number} [lengthMax] - 长度最大值(cm)，正数
 * @property {number} [widthMin] - 宽度最小值(cm)，正数
 * @property {number} [widthMax] - 宽度最大值(cm)，正数
 * @property {number} [heightMin] - 高度最小值(cm)，正数
 * @property {number} [heightMax] - 高度最大值(cm)，正数
 * @property {string} [search] - 全文搜索关键字（规格代码、规格名称），最多100字符
 * @property {string} [sortBy] - 排序字段，格式：'字段名:(asc|desc)'，默认'createdAt:desc'
 * @property {number} [limit] - 每页条数，默认10，范围1-100
 * @property {number} [page] - 页码，默认1，最小1
 */

/**
 * @typedef {Object} BinSpecification
 * @property {string} id - 规格ID（UUID v4格式）
 * @property {string} specCode - 规格代码（大写字母/数字/中划线）
 * @property {string} specName - 规格名称
 * @property {number} length - 长度(cm)
 * @property {number} width - 宽度(cm)
 * @property {number} height - 高度(cm)
 * @property {number} maxLoadCapacity - 最大载重(kg)
 * @property {string} material - 材质
 * @property {number} maxStackLayers - 最大堆叠层数
 * @property {string[]} [applicableProductTypes] - 适用产品类型ID列表（UUID数组）
 * @property {string} [supplierInfo] - 供应商信息
 * @property {string} status - 状态（'启用'|'禁用'）
 * @property {boolean} isDeleted - 软删除标志
 * @property {string} [createdBy] - 创建人ID（UUID）
 * @property {string} [updatedBy] - 最后更新人ID（UUID）
 * @property {string} createdAt - 创建时间（ISO 8601格式）
 * @property {string} updatedAt - 最后更新时间（ISO 8601格式）
 */

/**
 * @typedef {Object} BinSpecificationListResponse
 * @property {BinSpecification[]} results - 规格列表数据
 * @property {number} page - 当前页码
 * @property {number} limit - 每页条数
 * @property {number} totalPages - 总页数
 * @property {number} totalResults - 总记录数
 */

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success - 请求是否成功
 * @property {*} data - 响应数据
 * @property {string} message - 操作结果消息
 * @property {Object} meta - 元数据
 * @property {string} meta.timestamp - 响应时间戳
 * @property {string} meta.requestId - 请求ID
 * @property {string} meta.version - API版本
 */

/**
 * 分页查询料框规格列表
 *
 * @description
 * 根据规格代码、名称、材质、状态等条件分页查询料框规格列表。
 * 支持模糊查询、精确匹配、范围查询和全文搜索。
 * 默认按创建时间降序排列，支持自定义排序。
 *
 * @param {BinSpecificationListParams} params - 查询参数
 * @returns {Promise<ApiResponse<BinSpecificationListResponse>>} 返回包含规格列表的Promise
 *
 * @throws {ApiError} BIN_SPEC_005 - 查询规格列表失败
 * @throws {ApiError} AUTH_001 - 未认证
 * @throws {ApiError} AUTH_005 - 权限不足（需要mdm.bin-specification.view权限）
 * @throws {ApiError} VAL_001 - 参数验证失败
 *
 * @example
 * // 基础查询
 * const result = await fetchBinSpecificationList({ page: 1, limit: 10 })
 *
 * @example
 * // 条件筛选
 * const result = await fetchBinSpecificationList({
 *   specCode: 'LK',
 *   status: '启用',
 *   material: '钢材',
 *   page: 1,
 *   limit: 20
 * })
 *
 * @example
 * // 尺寸范围查询
 * const result = await fetchBinSpecificationList({
 *   lengthMin: 100,
 *   lengthMax: 150,
 *   sortBy: 'length:asc'
 * })
 *
 * @see {@link https://localhost:3000/v1/docs 接口文档 - 2. 分页查询料框规格列表}
 */
export function fetchBinSpecificationList(params = {}) {
  return request({
    url: BASE_URL,
    method: 'get',
    params
  })
}

/**
 * 获取单个料框规格详情
 *
 * @description
 * 根据规格ID返回料框规格详细信息，包括所有字段及关联的产品类型信息。
 * 返回的详情数据比列表接口更完整，包含供应商信息、适用产品类型列表等。
 *
 * @param {string} specificationId - 规格ID，必须是有效的UUID v4格式
 * @returns {Promise<ApiResponse<BinSpecification>>} 返回包含规格详情的Promise
 *
 * @throws {ApiError} BIN_SPEC_004 - 料框规格不存在
 * @throws {ApiError} BIN_SPEC_005 - 查询规格详情失败
 * @throws {ApiError} AUTH_001 - 未认证
 * @throws {ApiError} AUTH_005 - 权限不足（需要mdm.bin-specification.view权限）
 * @throws {ApiError} VAL_001 - ID格式无效（必须为UUID格式）
 *
 * @example
 * const result = await getBinSpecificationDetail('7a48f12c-8d3e-4f9b-b2e1-6c9a5d8f3b21')
 * console.log(result.data.specCode) // 'LK001'
 *
 * @see {@link https://localhost:3000/v1/docs 接口文档 - 3. 获取料框规格详情}
 */
export function getBinSpecificationDetail(specificationId) {
  return request({
    url: `${BASE_URL}/${specificationId}`,
    method: 'get'
  })
}

/**
 * @typedef {Object} CreateBinSpecificationData
 * @property {string} specCode - 规格代码，全局唯一，1-50字符，大写字母/数字/中划线，自动转换为大写
 * @property {string} specName - 规格名称，1-200字符
 * @property {number} length - 长度(cm)，0.01-10000，最多2位小数
 * @property {number} width - 宽度(cm)，0.01-10000，最多2位小数
 * @property {number} height - 高度(cm)，0.01-10000，最多2位小数
 * @property {number} maxLoadCapacity - 最大载重(kg)，0.01-100000，最多2位小数
 * @property {string} material - 材质，1-100字符
 * @property {number} maxStackLayers - 最大堆叠层数，1-100的整数
 * @property {string[]} [applicableProductTypes] - 适用产品类型ID列表（UUID数组），可选
 * @property {string} [supplierInfo] - 供应商信息，最多500字符，可选
 * @property {string} [status] - 状态，枚举值：'启用'|'禁用'，可选，默认为'启用'
 */

/**
 * 创建料框规格
 *
 * @description
 * 创建新的料框规格档案，包含规格代码、尺寸、载重、材质等基础信息。
 * 规格代码必须全局唯一，格式为大写字母、数字和中划线组合。
 * 创建成功后，规格默认状态为"启用"。
 * 该接口会进行完整的业务验证，包括规格代码格式验证、唯一性校验和数值范围验证。
 *
 * @param {CreateBinSpecificationData} data - 规格数据
 * @returns {Promise<ApiResponse<BinSpecification>>} 返回包含创建的规格详情的Promise
 *
 * @throws {ApiError} BIN_SPEC_001 - 规格代码已存在
 * @throws {ApiError} BIN_SPEC_002 - 规格代码格式不正确
 * @throws {ApiError} BIN_SPEC_003 - 规格代码不能为空
 * @throws {ApiError} BIN_SPEC_006 - 创建规格失败
 * @throws {ApiError} BIN_SPEC_007-013 - 字段验证失败（名称、长度、宽度、高度、载重、堆叠层数、材质）
 * @throws {ApiError} AUTH_001 - 未认证
 * @throws {ApiError} AUTH_005 - 权限不足（需要mdm.bin-specification.manage权限）
 * @throws {ApiError} VAL_001 - 参数验证失败
 *
 * @example
 * const newSpec = await createBinSpecification({
 *   specCode: 'LK001',
 *   specName: '标准料框',
 *   length: 120.50,
 *   width: 80.00,
 *   height: 60.00,
 *   maxLoadCapacity: 500.00,
 *   material: '钢材',
 *   maxStackLayers: 3,
 *   applicableProductTypes: ['123e4567-e89b-12d3-a456-426614174000'],
 *   supplierInfo: 'XX金属制品有限公司'
 * })
 *
 * @see {@link https://localhost:3000/v1/docs 接口文档 - 1. 创建料框规格}
 */
export function createBinSpecification(data) {
  return request({
    url: BASE_URL,
    method: 'post',
    data
  })
}

/**
 * @typedef {Object} UpdateBinSpecificationData
 * @property {string} [specCode] - 规格代码，1-50字符，大写字母/数字/中划线
 * @property {string} [specName] - 规格名称，1-200字符
 * @property {number} [length] - 长度(cm)，0.01-10000，最多2位小数
 * @property {number} [width] - 宽度(cm)，0.01-10000，最多2位小数
 * @property {number} [height] - 高度(cm)，0.01-10000，最多2位小数
 * @property {number} [maxLoadCapacity] - 最大载重(kg)，0.01-100000，最多2位小数
 * @property {string} [material] - 材质，1-100字符
 * @property {number} [maxStackLayers] - 最大堆叠层数，1-100的整数
 * @property {string[]} [applicableProductTypes] - 适用产品类型ID列表（UUID数组）
 * @property {string} [supplierInfo] - 供应商信息，最多500字符
 */

/**
 * 更新料框规格
 *
 * @description
 * 更新指定规格的信息，支持部分字段更新，包含完整的业务验证。
 * 可以更新规格代码、规格名称、尺寸、载重、材质、堆叠层数、适用产品类型和供应商信息。
 * 如果更新规格代码，会进行格式验证和唯一性校验。
 * 至少需要提供一个要更新的字段。
 *
 * @param {string} specificationId - 规格ID，必须是有效的UUID v4格式
 * @param {UpdateBinSpecificationData} data - 更新字段（至少提供一个字段）
 * @returns {Promise<ApiResponse<BinSpecification>>} 返回包含更新后规格详情的Promise
 *
 * @throws {ApiError} BIN_SPEC_001 - 规格代码已存在（更新时与其他规格重复）
 * @throws {ApiError} BIN_SPEC_004 - 料框规格不存在
 * @throws {ApiError} BIN_SPEC_014 - 更新规格失败
 * @throws {ApiError} AUTH_001 - 未认证
 * @throws {ApiError} AUTH_005 - 权限不足（需要mdm.bin-specification.manage权限）
 * @throws {ApiError} VAL_001 - 至少需要提供一个要更新的字段 或 参数验证失败
 *
 * @example
 * // 更新部分字段
 * const updated = await updateBinSpecification(
 *   '7a48f12c-8d3e-4f9b-b2e1-6c9a5d8f3b21',
 *   {
 *     specName: '标准料框（升级版）',
 *     maxLoadCapacity: 600.00,
 *     supplierInfo: 'YY金属制品有限公司'
 *   }
 * )
 *
 * @see {@link https://localhost:3000/v1/docs 接口文档 - 4. 更新料框规格}
 */
export function updateBinSpecification(specificationId, data) {
  return request({
    url: `${BASE_URL}/${specificationId}`,
    method: 'patch',
    data
  })
}

/**
 * 切换料框规格状态
 *
 * @description
 * 启用或禁用料框规格。
 * 禁用前会检查是否被料框实例引用，若已引用则阻止禁用（该检查功能将在料框实例模块完成后实现）。
 * 如果当前状态已经是目标状态，则直接返回成功。
 * 启用后该规格可在料框注册时被引用，禁用后将阻止该规格在后续料框注册时被引用。
 *
 * @param {string} specificationId - 规格ID，必须是有效的UUID v4格式
 * @param {('启用'|'禁用')} status - 目标状态，枚举值：'启用' 或 '禁用'
 * @returns {Promise<ApiResponse<BinSpecification>>} 返回包含更新后规格详情的Promise
 *
 * @throws {ApiError} BIN_SPEC_004 - 料框规格不存在
 * @throws {ApiError} BIN_SPEC_014 - 切换规格状态失败
 * @throws {ApiError} BIN_SPEC_018 - 规格状态无效（状态值不在允许范围内）
 * @throws {ApiError} BIN_SPEC_019 - 该规格正在被料框实例引用，无法禁用（预留，当前版本暂不执行实际检查）
 * @throws {ApiError} AUTH_001 - 未认证
 * @throws {ApiError} AUTH_005 - 权限不足（需要mdm.bin-specification.manage权限）
 * @throws {ApiError} VAL_001 - 状态不能为空 或 参数验证失败
 *
 * @example
 * // 禁用规格
 * const result = await toggleBinSpecificationStatus(
 *   '7a48f12c-8d3e-4f9b-b2e1-6c9a5d8f3b21',
 *   '禁用'
 * )
 * console.log(result.message) // '禁用料框规格成功'
 *
 * @example
 * // 启用规格
 * const result = await toggleBinSpecificationStatus(
 *   '7a48f12c-8d3e-4f9b-b2e1-6c9a5d8f3b21',
 *   '启用'
 * )
 * console.log(result.message) // '启用料框规格成功'
 *
 * @see {@link https://localhost:3000/v1/docs 接口文档 - 5. 切换料框规格状态}
 */
export function toggleBinSpecificationStatus(specificationId, status) {
  return request({
    url: `${BASE_URL}/${specificationId}/status`,
    method: 'patch',
    data: { status }
  })
}

/**
 * 格式化列表请求参数，确保符合后端要求
 *
 * @description
 * 对查询参数进行标准化处理，包括：
 * - 规格代码自动转换为大写
 * - 字符串参数去除首尾空格
 * - 数值参数转换为Number类型
 * - 过滤掉空值和undefined参数
 *
 * @param {BinSpecificationListParams} params - 原始查询参数
 * @returns {BinSpecificationListParams} 已处理的参数对象
 *
 * @example
 * const normalized = normalizeBinSpecificationListParams({
 *   specCode: ' lk001 ',
 *   lengthMin: '100',
 *   page: '1'
 * })
 * // 返回: { specCode: 'LK001', lengthMin: 100, page: 1 }
 */
export function normalizeBinSpecificationListParams(params = {}) {
  const {
    specCode,
    specName,
    material,
    status,
    lengthMin,
    lengthMax,
    widthMin,
    widthMax,
    heightMin,
    heightMax,
    search,
    sortBy,
    limit,
    page
  } = params

  const normalizedParams = {
    ...(specCode ? { specCode: specCode.trim().toUpperCase() } : {}),
    ...(specName ? { specName: specName.trim() } : {}),
    ...(material ? { material: material.trim() } : {}),
    ...(status ? { status } : {}),
    ...(lengthMin !== undefined && lengthMin !== null ? { lengthMin: Number(lengthMin) } : {}),
    ...(lengthMax !== undefined && lengthMax !== null ? { lengthMax: Number(lengthMax) } : {}),
    ...(widthMin !== undefined && widthMin !== null ? { widthMin: Number(widthMin) } : {}),
    ...(widthMax !== undefined && widthMax !== null ? { widthMax: Number(widthMax) } : {}),
    ...(heightMin !== undefined && heightMin !== null ? { heightMin: Number(heightMin) } : {}),
    ...(heightMax !== undefined && heightMax !== null ? { heightMax: Number(heightMax) } : {}),
    ...(search ? { search: search.trim() } : {}),
    ...(sortBy ? { sortBy } : {}),
    ...(limit ? { limit: Number(limit) } : {}),
    ...(page ? { page: Number(page) } : {})
  }

  return normalizedParams
}

/**
 * 提取接口响应中的料框规格列表数据
 *
 * @description
 * 从API响应中安全提取规格列表数据，包含分页信息。
 * 如果响应为空或数据不存在，返回默认的空列表结构。
 *
 * @param {ApiResponse<BinSpecificationListResponse>} response - API响应对象
 * @returns {BinSpecificationListResponse} 规格列表数据和分页信息
 *
 * @example
 * const response = await fetchBinSpecificationList({ page: 1 })
 * const { results, totalResults } = extractBinSpecificationList(response)
 * console.log(`共 ${totalResults} 条记录`)
 */
export function extractBinSpecificationList(response) {
  if (!response || !response.data) {
    return {
      results: [],
      page: 1,
      limit: 10,
      totalPages: 0,
      totalResults: 0
    }
  }

  return response.data
}

/**
 * 提取接口响应中的料框规格详情数据
 *
 * @description
 * 从API响应中安全提取规格详情数据。
 * 如果响应为空或数据不存在，返回null。
 *
 * @param {ApiResponse<BinSpecification>} response - API响应对象
 * @returns {BinSpecification|null} 规格详情对象，若不存在则返回null
 *
 * @example
 * const response = await getBinSpecificationDetail('7a48f12c-...')
 * const spec = extractBinSpecificationDetail(response)
 * if (spec) {
 *   console.log(spec.specCode)
 * }
 */
export function extractBinSpecificationDetail(response) {
  return response?.data || null
}

// ==================== 防抖和高级功能（P1阶段） ====================

/**
 * 创建防抖版本的分页查询函数
 *
 * @description
 * 为列表查询创建防抖版本，避免用户快速输入时频繁请求。
 * 默认延迟300ms，适用于搜索框输入场景。
 *
 * @param {number} wait - 防抖延迟时间（毫秒），默认300ms
 * @returns {Function} 防抖后的查询函数
 *
 * @example
 * // 在组件中创建防抖查询函数
 * const debouncedFetch = createDebouncedFetchList(500)
 *
 * // 在搜索框输入时调用
 * debouncedFetch({ specCode: 'LK', page: 1 }).then(result => {
 *   console.log(result.data.results)
 * })
 */
export function createDebouncedFetchList(wait = 300) {
  return debounce(fetchBinSpecificationList, wait)
}

// ==================== 验证和业务规则（TASK008-P1） ====================

/**
 * 检查规格代码是否已存在
 *
 * @description
 * 实时检查规格代码是否已被使用，用于表单验证时的唯一性检查。
 * 通过查询接口搜索指定规格代码，如果找到结果则说明代码已存在。
 * 编辑模式下会排除当前编辑的规格ID。
 *
 * @param {string} specCode - 规格代码（大写）
 * @param {string} [excludeId] - 排除的规格ID（编辑模式下传入当前规格ID）
 * @returns {Promise<boolean>} 返回是否存在：true-已存在，false-不存在
 *
 * @example
 * // 创建模式检查
 * const exists = await checkSpecCodeExists('LK001')
 * if (exists) {
 *   console.log('规格代码已存在')
 * }
 *
 * @example
 * // 编辑模式检查（排除当前规格）
 * const exists = await checkSpecCodeExists('LK001', '7a48f12c-...')
 * if (exists) {
 *   console.log('规格代码与其他规格重复')
 * }
 */
export async function checkSpecCodeExists(specCode, excludeId = null) {
  try {
    if (!specCode || !specCode.trim()) {
      return false
    }

    const normalizedCode = specCode.trim().toUpperCase()

    // 使用精确查询检查代码是否存在
    const response = await fetchBinSpecificationList({
      specCode: normalizedCode,
      limit: 10,
      page: 1
    })

    const { results } = extractBinSpecificationList(response)

    // 没有结果，代码可用
    if (!results || results.length === 0) {
      return false
    }

    // 检查是否有精确匹配的规格代码
    const exactMatch = results.find(spec =>
      spec.specCode === normalizedCode &&
      (!excludeId || spec.id !== excludeId)
    )

    return !!exactMatch
  } catch (error) {
    console.error('检查规格代码重复性失败:', error)
    // 检查失败时不阻止提交，由后端进行最终验证
    return false
  }
}

/**
 * 验证尺寸参数的合理性
 *
 * @description
 * 对料框的长、宽、高尺寸进行业务合理性验证，包括：
 * 1. 长度应该是最大尺寸
 * 2. 宽度不应大于长度
 * 3. 高度通常小于长度和宽度
 * 4. 尺寸比例应在合理范围内
 *
 * @param {number} length - 长度(cm)
 * @param {number} width - 宽度(cm)
 * @param {number} height - 高度(cm)
 * @returns {{ valid: boolean, message: string }} 验证结果和提示信息
 *
 * @example
 * const result = validateDimensionRationality(120, 80, 60)
 * if (!result.valid) {
 *   console.log(result.message)
 * }
 */
export function validateDimensionRationality(length, width, height) {
  // 检查是否所有参数都有效
  if (!length || !width || !height) {
    return { valid: true, message: '' }
  }

  // 业务规则1: 宽度不应大于长度
  if (width > length) {
    return {
      valid: false,
      message: '宽度不应大于长度，请检查尺寸设置是否合理'
    }
  }

  // 业务规则2: 高度通常不应大于长度
  if (height > length) {
    return {
      valid: false,
      message: '高度不应大于长度，请检查尺寸设置是否合理'
    }
  }

  // 业务规则3: 极端比例检查（长宽比不应超过10:1）
  const lengthWidthRatio = length / width
  if (lengthWidthRatio > 10) {
    return {
      valid: false,
      message: '长宽比过大（超过10:1），请检查尺寸设置是否合理'
    }
  }

  // 业务规则4: 最小尺寸合理性检查（任何一个尺寸不应小于5cm）
  const MIN_REASONABLE_DIMENSION = 5
  if (length < MIN_REASONABLE_DIMENSION || width < MIN_REASONABLE_DIMENSION || height < MIN_REASONABLE_DIMENSION) {
    return {
      valid: false,
      message: `料框尺寸过小（建议不小于${MIN_REASONABLE_DIMENSION}cm），请检查是否输入正确`
    }
  }

  return { valid: true, message: '' }
}

/**
 * 验证适用产品类型的有效性
 *
 * @description
 * 验证选择的产品类型ID列表是否有效，包括：
 * 1. 检查是否为有效的UUID格式
 * 2. 检查是否有重复的产品类型
 * 3. 数量合理性检查（不应超过50个）
 *
 * @param {string[]} productTypes - 产品类型ID数组
 * @returns {{ valid: boolean, message: string }} 验证结果和提示信息
 *
 * @example
 * const result = validateApplicableProductTypes(['123e4567-...', '456e7890-...'])
 * if (!result.valid) {
 *   console.log(result.message)
 * }
 */
export function validateApplicableProductTypes(productTypes) {
  // 允许为空或未选择
  if (!productTypes || productTypes.length === 0) {
    return { valid: true, message: '' }
  }

  // UUID v4 格式验证正则
  const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

  // 检查每个ID是否为有效的UUID格式
  const invalidIds = productTypes.filter(id => !uuidV4Regex.test(id))
  if (invalidIds.length > 0) {
    return {
      valid: false,
      message: '适用产品类型包含无效的ID格式，请重新选择'
    }
  }

  // 检查是否有重复
  const uniqueIds = new Set(productTypes)
  if (uniqueIds.size !== productTypes.length) {
    return {
      valid: false,
      message: '适用产品类型存在重复选择，请检查'
    }
  }

  // 数量合理性检查（不应超过50个）
  const MAX_PRODUCT_TYPES = 50
  if (productTypes.length > MAX_PRODUCT_TYPES) {
    return {
      valid: false,
      message: `适用产品类型数量不应超过${MAX_PRODUCT_TYPES}个，当前已选择${productTypes.length}个`
    }
  }

  return { valid: true, message: '' }
}

