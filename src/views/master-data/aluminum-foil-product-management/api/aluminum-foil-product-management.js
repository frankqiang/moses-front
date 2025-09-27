/**
 * 文件名称：aluminum-foil-product-management.js
 * 文件描述：铝箔产品管理模块API接口封装，提供列表查询、详情获取、创建与更新等方法
 * 创建日期：2025-09-26
 * 修改记录：
 *   - 2025-09-26: 初始创建，实现基础CRUD API方法
 */

import request from '@/utils/request'

const BASE_URL = '/mdm/aluminum-foil-products'

/**
 * 分页查询铝箔产品列表
 * @param {Object} params - 查询参数，参考接口文档 GET /v1/mdm/aluminum-foil-products
 * @param {string} [params.productCode] - 产品编码（模糊查询）
 * @param {string} [params.productName] - 产品名称（模糊查询）
 * @param {string} [params.alloyGrade] - 合金牌号（精确匹配）
 * @param {string} [params.temper] - 状态/硬度（精确匹配）
 * @param {string} [params.lifecycleStatus] - 生命周期状态（试产/量产/停产）
 * @param {number} [params.thicknessMin] - 厚度最小值
 * @param {number} [params.thicknessMax] - 厚度最大值
 * @param {number} [params.widthMin] - 宽度最小值
 * @param {number} [params.widthMax] - 宽度最大值
 * @param {string} [params.search] - 全文搜索关键字
 * @param {string} [params.sortBy] - 排序字段，格式 field:asc/desc，默认 createdAt:desc
 * @param {number} [params.limit] - 每页条数，默认10，范围1-100
 * @param {number} [params.page] - 页码，默认1，最小1
 * @returns {Promise} Promise resolving API响应，包含 data.results 等字段
 */
export function fetchFoilProductList(params = {}) {
  return request({
    url: BASE_URL,
    method: 'get',
    params
  })
}

/**
 * 获取单个铝箔产品详情
 * @param {string} id - 产品ID（UUID）
 * @returns {Promise} Promise resolving API响应，包含 data 为产品详情
 */
export function getFoilProductDetail(id) {
  return request({
    url: `${BASE_URL}/${id}`,
    method: 'get'
  })
}

/**
 * 创建铝箔产品
 * @param {Object} data - 产品数据，参考接口文档 POST /v1/aluminum-foil-products
 * @param {string} data.productCode - 产品编码，格式 AF-合金-硬度-厚度x宽度
 * @param {string} data.productName - 产品名称
 * @param {string} data.rawMaterialType - 原材料类型
 * @param {string} data.alloyGrade - 合金牌号
 * @param {string} data.temper - 状态/硬度
 * @param {number} data.thickness - 厚度(mm)
 * @param {number} data.width - 宽度(mm)
 * @param {number} data.unitWeight - 单位重量
 * @param {string} data.unitWeightType - 单位重量类型，kg/卷 或 kg/m²
 * @param {Array<string>} [data.processTemplateIds] - 工艺模板ID列表
 * @param {string} [data.qualityStandardId] - 质量标准ID
 * @param {string} [data.lifecycleStatus] - 生命周期状态
 * @param {string} [data.description] - 产品描述
 * @returns {Promise} Promise resolving API响应，成功后 message 为后端返回提示
 */
export function createFoilProduct(data) {
  return request({
    url: BASE_URL,
    method: 'post',
    data
  })
}

/**
 * 更新铝箔产品
 * @param {string} id - 产品ID（UUID）
 * @param {Object} data - 更新字段，参考接口文档 PATCH /v1/aluminum-foil-products/{id}
 * @returns {Promise} Promise resolving API响应
 */
export function updateFoilProduct(id, data) {
  return request({
    url: `${BASE_URL}/${id}`,
    method: 'patch',
    data
  })
}

/**
 * 格式化列表请求参数，确保符合后端要求
 * @param {Object} params - 原始查询参数
 * @returns {Object} 已处理的参数对象
 */
export function normalizeFoilProductListParams(params = {}) {
  const {
    productCode,
    productName,
    alloyGrade,
    temper,
    lifecycleStatus,
    thicknessMin,
    thicknessMax,
    widthMin,
    widthMax,
    search,
    sortBy,
    limit,
    page
  } = params

  const normalizedParams = {
    ...(productCode ? { productCode: productCode.trim() } : {}),
    ...(productName ? { productName: productName.trim() } : {}),
    ...(alloyGrade ? { alloyGrade: alloyGrade.trim().toUpperCase() } : {}),
    ...(temper ? { temper: temper.trim().toUpperCase() } : {}),
    ...(lifecycleStatus ? { lifecycleStatus } : {}),
    ...(thicknessMin !== undefined && thicknessMin !== null ? { thicknessMin: Number(thicknessMin) } : {}),
    ...(thicknessMax !== undefined && thicknessMax !== null ? { thicknessMax: Number(thicknessMax) } : {}),
    ...(widthMin !== undefined && widthMin !== null ? { widthMin: Number(widthMin) } : {}),
    ...(widthMax !== undefined && widthMax !== null ? { widthMax: Number(widthMax) } : {}),
    ...(search ? { search: search.trim() } : {}),
    ...(sortBy ? { sortBy } : {}),
    ...(limit ? { limit: Number(limit) } : {}),
    ...(page ? { page: Number(page) } : {})
  }

  return normalizedParams
}

/**
 * 提取接口响应中的铝箔产品列表数据
 * @param {Object} response - API响应对象
 * @returns {{ results: Array, page: number, limit: number, totalPages: number, totalResults: number, hasNextPage: boolean, hasPrevPage: boolean }}
 */
export function extractFoilProductList(response) {
  if (!response || !response.data) {
    return {
      results: [],
      page: 1,
      limit: 10,
      totalPages: 0,
      totalResults: 0,
      hasNextPage: false,
      hasPrevPage: false
    }
  }

  return response.data
}

/**
 * 提取接口响应中的铝箔产品详情数据
 * @param {Object} response - API响应对象
 * @returns {Object|null} 产品详情对象，若不存在则返回null
 */
export function extractFoilProductDetail(response) {
  return response?.data || null
}

