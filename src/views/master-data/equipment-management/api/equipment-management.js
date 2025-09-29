/**
 * 文件名称：equipment-management.js
 * 文件描述：设备主数据管理模块API接口文件，提供设备档案CRUD操作
 * 创建日期：2025-09-29
 * 修改记录：
 *   - 2025-09-29: 初始创建，实现完整的设备管理API接口
 */

import service from '@/utils/request'
import { formatQueryParams } from '@/utils'

/**
 * 获取设备列表
 * @param {Object} params 查询参数
 * @param {string} params.equipmentType - 设备类型筛选
 * @param {string} params.status - 设备状态筛选
 * @param {string} params.equipmentCode - 设备编号（模糊匹配）
 * @param {string} params.name - 设备名称（模糊匹配）
 * @param {string} params.search - 全文搜索关键字
 * @param {string} params.installationDateFrom - 安装日期起始
 * @param {string} params.installationDateTo - 安装日期结束
 * @param {string} params.nextMaintenanceDateFrom - 下次维护起始
 * @param {string} params.nextMaintenanceDateTo - 下次维护结束
 * @param {boolean} params.includeDetails - 是否包含详情
 * @param {string} params.sortBy - 排序规则
 * @param {number} params.page - 页码
 * @param {number} params.limit - 每页数量
 * @returns {Promise} API响应
 */
export function fetchEquipmentList(params = {}) {
  // 格式化查询参数，移除空值
  const queryParams = formatQueryParams(params)

  return service({
    url: '/v1/mdm/equipments',
    method: 'get',
    params: queryParams
  }).then(response => {
    // 统一返回格式处理
    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: response.message
      }
    } else {
      // 错误处理
      throw new Error(response.error?.message || '获取设备列表失败')
    }
  }).catch(error => {
    console.error('Fetch equipment list error:', error)
    throw error
  })
}

/**
 * 获取设备详情
 * @param {string} equipmentId - 设备ID
 * @param {Object} options - 选项参数
 * @param {boolean} options.includeDetails - 是否包含详情，默认true
 * @returns {Promise} API响应
 */
export function getEquipmentDetail(equipmentId, options = {}) {
  if (!equipmentId) {
    return Promise.reject(new Error('设备ID不能为空'))
  }

  const params = {
    includeDetails: options.includeDetails !== false
  }

  return service({
    url: `/v1/mdm/equipments/${equipmentId}`,
    method: 'get',
    params
  }).then(response => {
    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: response.message
      }
    } else {
      throw new Error(response.error?.message || '获取设备详情失败')
    }
  }).catch(error => {
    console.error('Get equipment detail error:', error)
    throw error
  })
}

/**
 * 创建设备档案
 * @param {Object} data - 设备数据
 * @param {string} data.equipmentCode - 设备编号（必填）
 * @param {string} data.name - 设备名称（必填）
 * @param {string} data.equipmentType - 设备类型（必填）
 * @param {string} data.status - 设备状态
 * @param {string} data.communicationEndpoint - 通讯端点（必填）
 * @param {Object} data.communicationParams - 通讯参数（必填）
 * @param {Object} data.detail - 类型化详情（必填）
 * @returns {Promise} API响应
 */
export function createEquipment(data) {
  // 数据验证
  if (!data.equipmentCode) {
    return Promise.reject(new Error('设备编号不能为空'))
  }
  if (!data.name) {
    return Promise.reject(new Error('设备名称不能为空'))
  }
  if (!data.equipmentType) {
    return Promise.reject(new Error('设备类型不能为空'))
  }
  if (!data.communicationEndpoint) {
    return Promise.reject(new Error('通讯端点不能为空'))
  }

  return service({
    url: '/v1/mdm/equipments',
    method: 'post',
    data
  }).then(response => {
    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: response.message || '设备创建成功'
      }
    } else {
      throw new Error(response.error?.message || '创建设备失败')
    }
  }).catch(error => {
    console.error('Create equipment error:', error)
    throw error
  })
}

/**
 * 更新设备信息
 * @param {string} equipmentId - 设备ID
 * @param {Object} data - 更新数据（至少提供一个字段）
 * @returns {Promise} API响应
 */
export function updateEquipment(equipmentId, data) {
  if (!equipmentId) {
    return Promise.reject(new Error('设备ID不能为空'))
  }

  // 检查是否提供了更新字段
  const hasUpdateFields = Object.keys(data).some(key =>
    data[key] !== undefined && data[key] !== null && data[key] !== ''
  )

  if (!hasUpdateFields) {
    return Promise.reject(new Error('至少需要提供一个需更新的字段'))
  }

  return service({
    url: `/v1/mdm/equipments/${equipmentId}`,
    method: 'patch',
    data
  }).then(response => {
    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: response.message || '设备更新成功'
      }
    } else {
      throw new Error(response.error?.message || '更新设备失败')
    }
  }).catch(error => {
    console.error('Update equipment error:', error)
    throw error
  })
}

/**
 * 删除设备（逻辑删除）
 * @param {string} equipmentId - 设备ID
 * @returns {Promise} API响应
 */
export function deleteEquipment(equipmentId) {
  if (!equipmentId) {
    return Promise.reject(new Error('设备ID不能为空'))
  }

  return service({
    url: `/v1/mdm/equipments/${equipmentId}`,
    method: 'delete'
  }).then(response => {
    if (response.success) {
      return {
        success: true,
        message: response.message || '设备删除成功'
      }
    } else {
      throw new Error(response.error?.message || '删除设备失败')
    }
  }).catch(error => {
    console.error('Delete equipment error:', error)
    throw error
  })
}

/**
 * 批量删除设备
 * @param {Array<string>} equipmentIds - 设备ID数组
 * @returns {Promise} API响应
 */
export function batchDeleteEquipments(equipmentIds) {
  if (!Array.isArray(equipmentIds) || equipmentIds.length === 0) {
    return Promise.reject(new Error('请选择要删除的设备'))
  }

  return service({
    url: '/v1/mdm/equipments/batch',
    method: 'delete',
    data: { equipmentIds }
  }).then(response => {
    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: response.message || `成功删除${equipmentIds.length}个设备`
      }
    } else {
      throw new Error(response.error?.message || '批量删除设备失败')
    }
  }).catch(error => {
    console.error('Batch delete equipments error:', error)
    throw error
  })
}

/**
 * 导出设备列表
 * @param {Object} params - 筛选参数（同fetchEquipmentList）
 * @param {Object} options - 导出选项
 * @param {string} options.format - 导出格式，默认'excel'
 * @returns {Promise} 文件流
 */
export function exportEquipmentList(params = {}, options = {}) {
  const queryParams = formatQueryParams({
    ...params,
    export: true,
    format: options.format || 'excel'
  })

  return service({
    url: '/v1/mdm/equipments/export',
    method: 'get',
    params: queryParams,
    responseType: 'blob',
    timeout: 60000 // 导出可能较慢，设置较长超时
  }).then(response => {
    return {
      success: true,
      data: response,
      message: '导出成功'
    }
  }).catch(error => {
    console.error('Export equipment list error:', error)
    throw error
  })
}

/**
 * 获取设备状态统计
 * @param {Object} filters - 筛选条件
 * @returns {Promise} 统计数据
 */
export function getEquipmentStatusStats(filters = {}) {
  return service({
    url: '/v1/mdm/equipments/stats/status',
    method: 'get',
    params: formatQueryParams(filters)
  }).then(response => {
    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: response.message
      }
    } else {
      throw new Error(response.error?.message || '获取设备统计失败')
    }
  }).catch(error => {
    console.error('Get equipment stats error:', error)
    throw error
  })
}

/**
 * 验证设备编号唯一性
 * @param {string} equipmentCode - 设备编号
 * @param {string} excludeId - 排除的设备ID（编辑时使用）
 * @returns {Promise} 验证结果
 */
export function validateEquipmentCode(equipmentCode, excludeId = null) {
  if (!equipmentCode || !equipmentCode.trim()) {
    return Promise.reject(new Error('设备编号不能为空'))
  }

  const params = {
    equipmentCode: equipmentCode.trim().toUpperCase(),
    ...(excludeId && { excludeId })
  }

  return service({
    url: '/v1/mdm/equipments/validate/code',
    method: 'get',
    params
  }).then(response => {
    if (response.success) {
      return {
        success: true,
        data: response.data, // { isUnique: boolean }
        message: response.message
      }
    } else {
      throw new Error(response.error?.message || '验证设备编号失败')
    }
  }).catch(error => {
    console.error('Validate equipment code error:', error)
    throw error
  })
}
