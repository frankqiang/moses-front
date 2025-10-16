/**
 * 文件名称：index.js
 * 文件描述：主数据-产品公共API模块，提供产品选项数据获取接口
 * 创建日期：2025-10-15
 * 修改记录：
 *   - 2025-10-15: 初始创建，提供产品选项公共接口
 *   - 2025-10-15: 添加BASE_URL常量，使用formatQueryParams过滤空值参数
 *   - 2025-10-15: 修复字段名不匹配问题，后端返回results而非products，修正分页字段映射
 */

import request from '@/utils/request'
import { formatQueryParams } from '@/utils'

// API基础路径
const BASE_URL = '/mdm/aluminum-foil-products'

/**
 * 获取产品选项列表（供多个模块使用）
 *
 * 使用场景：
 * - 工艺参数管理：关联适用产品
 * - 生产计划管理：选择生产产品
 * - 质量管理：关联检验产品
 *
 * @param {Object} params - 查询参数
 * @param {string} [params.keyword] - 搜索关键词（支持产品编码、产品名称）
 * @param {string} [params.lifecycleStatus] - 生命周期状态过滤（如：'量产'）
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.limit=30] - 每页数量
 * @returns {Promise<Object>} 返回包含产品选项的响应
 *
 * @example
 * // 获取所有量产产品
 * const response = await getProductOptions({ lifecycleStatus: '量产', limit: 100 })
 * this.productOptions = response.data.options
 *
 * // 搜索产品
 * const response = await getProductOptions({ keyword: '1060', limit: 30 })
 *
 * // 分页加载
 * const response = await getProductOptions({ page: 2, limit: 30 })
 */
export function getProductOptions(params = {}) {
  const { keyword, lifecycleStatus, page = 1, limit = 30 } = params

  // 使用 formatQueryParams 过滤空值参数（空字符串、null、undefined）
  const apiParams = formatQueryParams({
    keyword,
    lifecycleStatus,
    page,
    limit
  })

  return request({
    url: BASE_URL,
    method: 'get',
    params: apiParams
  }).then(response => {
    // 转换为选项格式（后端返回的字段是 results）
    const products = response.data?.results || []
    const options = products.map(product => ({
      id: product.id,
      value: product.id,
      label: `${product.productCode} - ${product.productName}`,
      productCode: product.productCode,
      productName: product.productName,
      lifecycleStatus: product.lifecycleStatus,
      // 额外的产品信息（可选）
      alloyGrade: product.alloyGrade,
      thickness: product.thickness,
      width: product.width
    }))

    return {
      ...response,
      data: {
        options,
        pagination: {
          page: response.data?.page || page,
          limit: response.data?.limit || limit,
          total: response.data?.totalResults || 0,
          totalPages: response.data?.totalPages || 0
        }
      }
    }
  })
}

/**
 * 获取量产状态的产品选项（快捷方法）
 * @param {Object} params - 查询参数
 * @returns {Promise<Object>} 返回量产产品选项
 */
export function getProductionProductOptions(params = {}) {
  return getProductOptions({
    ...params,
    lifecycleStatus: '量产'
  })
}

/**
 * 搜索产品选项（带防抖的快捷方法）
 * @param {string} keyword - 搜索关键词
 * @param {Object} options - 其他选项
 * @returns {Promise<Object>} 返回搜索结果
 */
export function searchProductOptions(keyword, options = {}) {
  return getProductOptions({
    keyword,
    limit: 30,
    ...options
  })
}

