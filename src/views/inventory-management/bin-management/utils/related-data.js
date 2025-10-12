/**
 * 文件名称：related-data.js
 * 文件描述：料框管理模块关联数据获取工具
 * 创建日期：2025-10-12
 * 修改记录：
 *   - 2025-10-12: 初始创建，统一管理料框规格、产品、位置等关联数据获取
 */

import { fetchBinSpecificationList } from '@/views/master-data/bin-management/api/bin-specification'
import { fetchFoilProductList } from '@/views/master-data/aluminum-foil-product-management/api/aluminum-foil-product-management'
import { getLocationList } from '@/views/master-data/storage-location-management/storage-location/api/storage-location'

/**
 * 获取料框规格选项列表
 * @param {Object} params - 查询参数
 * @param {string} [params.status='启用'] - 状态筛选
 * @param {number} [params.limit=100] - 每页数量（最大100）
 * @returns {Promise<Array>} 料框规格选项数组
 */
export async function getBinSpecificationOptions(params = {}) {
  try {
    const response = await fetchBinSpecificationList({
      status: '启用',
      limit: 100, // 接口最大限制为100
      ...params
    })

    if (response && response.data && response.data.results) {
      return response.data.results.map(item => ({
        id: item.id,
        value: item.id,
        label: `${item.specCode} - ${item.specName}`,
        specCode: item.specCode,
        specName: item.specName,
        maxLoadCapacity: item.maxLoadCapacity,
        maxStackLayers: item.maxStackLayers,
        length: item.length,
        width: item.width,
        height: item.height,
        material: item.material
      }))
    }
    return []
  } catch (error) {
    console.error('获取料框规格选项失败:', error)
    return []
  }
}

/**
 * 获取铝箔产品选项列表
 * @param {Object} params - 查询参数
 * @param {string} [params.lifecycleStatus] - 生命周期状态
 * @param {number} [params.limit=100] - 每页数量（最大100）
 * @returns {Promise<Array>} 铝箔产品选项数组
 */
export async function getProductOptions(params = {}) {
  try {
    const response = await fetchFoilProductList({
      limit: 100, // 接口最大限制为100
      ...params
    })

    if (response && response.data && response.data.results) {
      return response.data.results.map(item => ({
        id: item.id,
        value: item.id,
        label: `${item.productCode} - ${item.productName}`,
        productCode: item.productCode,
        productName: item.productName,
        alloyGrade: item.alloyGrade,
        temper: item.temper,
        thickness: item.thickness,
        width: item.width,
        lifecycleStatus: item.lifecycleStatus
      }))
    }
    return []
  } catch (error) {
    console.error('获取铝箔产品选项失败:', error)
    return []
  }
}

/**
 * 根据ID获取料框规格详情
 * @param {string} id - 料框规格ID
 * @param {Array} options - 料框规格选项数组
 * @returns {Object|null} 料框规格详情对象
 */
export function getSpecificationById(id, options) {
  if (!id || !options || !Array.isArray(options)) {
    return null
  }
  return options.find(item => item.id === id) || null
}

/**
 * 根据ID获取产品详情
 * @param {string} id - 产品ID
 * @param {Array} options - 产品选项数组
 * @returns {Object|null} 产品详情对象
 */
export function getProductById(id, options) {
  if (!id || !options || !Array.isArray(options)) {
    return null
  }
  return options.find(item => item.id === id) || null
}

/**
 * 获取库位选项列表
 * @param {Object} params - 查询参数
 * @param {string} [params.status] - 状态筛选
 * @param {number} [params.limit=100] - 每页数量（最大100）
 * @returns {Promise<Array>} 库位选项数组
 */
export async function getLocationOptions(params = {}) {
  try {
    const response = await getLocationList({
      limit: 100, // 接口最大限制为100
      ...params
    })

    if (response && response.data && response.data.results) {
      return response.data.results.map(item => ({
        id: item.id,
        value: item.id,
        label: `${item.locationId} - ${item.locationTypeName || ''} (${item.storageArea?.areaName || ''})`,
        locationId: item.locationId,
        locationTypeName: item.locationTypeName,
        locationType: item.locationType,
        storageArea: item.storageArea,
        occupancyStatus: item.occupancyStatus,
        occupancyStatusName: item.occupancyStatusName
      }))
    }
    return []
  } catch (error) {
    console.error('获取库位选项失败:', error)
    return []
  }
}

/**
 * 根据ID获取库位详情
 * @param {string} id - 库位ID
 * @param {Array} options - 库位选项数组
 * @returns {Object|null} 库位详情对象
 */
export function getLocationById(id, options) {
  if (!id || !options || !Array.isArray(options)) {
    return null
  }
  return options.find(item => item.id === id) || null
}

