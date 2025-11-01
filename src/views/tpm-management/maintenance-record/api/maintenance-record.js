/**
 * 文件名称：maintenance-record.js
 * 文件描述：维护记录管理API接口封装
 * 创建日期：2025-01-20
 * 修改记录：
 *   - 2025-01-20: 初始创建，封装维护记录所有接口
 *   - 2025-01-23: 完善所有接口，添加日志记录和统一错误处理
 */

import request from '@/utils/request'

const BASE_URL = '/mdm/tpm/maintenance-records'

/**
 * 查询维护记录列表
 * @param {Object} params - 查询参数
 * @param {string} params.equipmentId - 设备ID筛选（可选）
 * @param {string} params.taskId - 维护任务ID筛选（可选）
 * @param {string} params.maintenanceType - 维护类型筛选（可选）
 * @param {string} params.executorId - 执行人ID筛选（可选）
 * @param {string} params.search - 搜索关键词（可选，记录编码或维护内容）
 * @param {string} params.startDate - 维护日期起始范围（可选，ISO 8601格式）
 * @param {string} params.endDate - 维护日期结束范围（可选，ISO 8601格式）
 * @param {number} params.page - 页码（默认1）
 * @param {number} params.limit - 每页数量（默认10）
 * @param {string} params.sortBy - 排序字段（默认maintenanceDate:desc）
 * @returns {Promise<Object>} 返回分页的维护记录列表
 */
export function getMaintenanceRecords(params) {
  return request({
    url: BASE_URL,
    method: 'get',
    params
  }).then(response => {
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ [API] 查询维护记录列表成功:', {
        totalResults: response.data?.totalResults,
        page: response.data?.page,
        limit: response.data?.limit
      })
    }
    return response
  })
}

/**
 * 查询单个维护记录详情
 * @param {string} recordId - 维护记录ID
 * @returns {Promise<Object>} 返回维护记录详情
 */
export function getMaintenanceRecordById(recordId) {
  return request({
    url: `${BASE_URL}/${recordId}`,
    method: 'get'
  }).then(response => {
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ [API] 查询维护记录详情成功:', response.data)
    }
    return response
  })
}

/**
 * 创建维护记录
 * @param {Object} data - 维护记录数据
 * @param {string} data.recordCode - 记录编码（可选，不提供则自动生成）
 * @param {string} data.taskId - 关联维护任务ID（可选）
 * @param {string} data.equipmentId - 关联设备ID（必填）
 * @param {string} data.maintenanceDate - 维护日期时间（必填，ISO 8601格式）
 * @param {string} data.maintenanceType - 维护类型（必填）
 * @param {string} data.maintenanceContent - 维护内容详情（必填）
 * @param {string} data.problemFound - 发现问题描述（可选）
 * @param {string} data.solutionApplied - 处理措施（可选）
 * @param {Array} data.sparePartsUsed - 使用备件清单（可选）
 * @param {number} data.workHours - 维护工时（可选，单位：小时）
 * @param {string} data.executorId - 执行人员ID（必填）
 * @param {string} data.confirmerId - 确认人员ID（可选）
 * @param {string} data.equipmentStatusBefore - 维护前设备状态（可选）
 * @param {string} data.equipmentStatusAfter - 维护后设备状态（可选）
 * @param {Array} data.attachmentUrls - 附件URL列表（可选）
 * @param {string} data.nextMaintenanceSuggestion - 下次维护建议（可选）
 * @returns {Promise<Object>} 返回创建的维护记录详情
 */
export function createMaintenanceRecord(data) {
  return request({
    url: BASE_URL,
    method: 'post',
    data
  }).then(response => {
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ [API] 创建维护记录成功:', response.data)
    }
    return response
  })
}

/**
 * 更新维护记录（补充编辑）
 * @param {string} recordId - 维护记录ID
 * @param {Object} data - 更新数据
 * @param {string} data.problemFound - 发现问题描述（可选）
 * @param {string} data.solutionApplied - 处理措施（可选）
 * @param {string} data.nextMaintenanceSuggestion - 下次维护建议（可选）
 * @param {Array} data.sparePartsUsed - 备件使用清单（可选）
 * @param {Array} data.attachmentUrls - 附件URL列表（可选）
 * @param {number} data.workHours - 维护工时（可选）
 * @param {string} data.equipmentStatusAfter - 维护后设备状态（可选）
 * @returns {Promise<Object>} 返回更新后的维护记录详情
 */
export function updateMaintenanceRecord(recordId, data) {
  return request({
    url: `${BASE_URL}/${recordId}`,
    method: 'patch',
    data
  }).then(response => {
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ [API] 更新维护记录成功:', response.data)
    }
    return response
  })
}

/**
 * 查询设备维护历史
 * @param {string} equipmentId - 设备ID
 * @param {Object} params - 查询参数
 * @param {string} params.maintenanceType - 维护类型筛选（可选）
 * @param {string} params.startDate - 维护日期起始范围（可选，ISO 8601格式）
 * @param {string} params.endDate - 维护日期结束范围（可选，ISO 8601格式）
 * @param {number} params.page - 页码（默认1）
 * @param {number} params.limit - 每页数量（默认10）
 * @param {string} params.sortBy - 排序字段（默认maintenanceDate:desc）
 * @returns {Promise<Object>} 返回设备的维护历史记录列表
 */
export function getEquipmentMaintenanceHistory(equipmentId, params) {
  return request({
    url: `${BASE_URL}/by-equipment/${equipmentId}`,
    method: 'get',
    params
  }).then(response => {
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ [API] 查询设备维护历史成功:', {
        equipmentId,
        totalResults: response.data?.totalResults,
        page: response.data?.page,
        limit: response.data?.limit
      })
    }
    return response
  })
}

/**
 * 查询维护记录统计数据
 * @param {Object} params - 查询参数
 * @param {string} params.startDate - 统计开始日期（可选，ISO 8601格式）
 * @param {string} params.endDate - 统计结束日期（可选，ISO 8601格式）
 * @param {string} params.equipmentId - 设备ID筛选（可选）
 * @param {string} params.maintenanceType - 维护类型筛选（可选）
 * @param {string} params.groupBy - 分组方式（equipment/type/executor，默认type）
 * @returns {Promise<Object>} 返回统计数据，包含总记录数、总工时、问题记录数、按类型统计、按设备统计等
 */
export function getMaintenanceStatistics(params) {
  return request({
    url: `${BASE_URL}/statistics`,
    method: 'get',
    params
  }).then(response => {
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ [API] 查询维护记录统计成功:', response.data)
    }
    return response
  })
}

/**
 * 上传维护记录附件
 * @param {string} recordId - 维护记录ID
 * @param {Object} data - 附件数据
 * @param {Array} data.attachments - 附件列表（必填）
 * @param {string} data.attachments[].url - 附件URL（必填）
 * @param {string} data.attachments[].fileName - 文件名（必填）
 * @param {string} data.attachments[].fileType - 文件类型（必填）
 * @returns {Promise<Object>} 返回更新后的维护记录详情
 */
export function uploadAttachments(recordId, data) {
  return request({
    url: `${BASE_URL}/${recordId}/attachments`,
    method: 'post',
    data
  }).then(response => {
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ [API] 上传维护记录附件成功:', {
        recordId,
        attachmentsCount: data.attachments?.length
      })
    }
    return response
  })
}

/**
 * 查询维护记录附件列表
 * @param {string} recordId - 维护记录ID
 * @returns {Promise<Object>} 返回附件列表
 */
export function getAttachments(recordId) {
  return request({
    url: `${BASE_URL}/${recordId}/attachments`,
    method: 'get'
  }).then(response => {
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ [API] 查询维护记录附件列表成功:', {
        recordId,
        attachmentsCount: response.data?.attachments?.length
      })
    }
    return response
  })
}

/**
 * 删除维护记录附件
 * @param {string} recordId - 维护记录ID
 * @param {number} attachmentId - 附件索引（从0开始）
 * @returns {Promise<Object>} 返回更新后的维护记录详情
 */
export function deleteAttachment(recordId, attachmentId) {
  return request({
    url: `${BASE_URL}/${recordId}/attachments/${attachmentId}`,
    method: 'delete'
  }).then(response => {
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ [API] 删除维护记录附件成功:', {
        recordId,
        attachmentId
      })
    }
    return response
  })
}

/**
 * API服务模块导出
 * 说明：所有接口已实现统一的响应格式处理和错误处理
 */
export default {
  getMaintenanceRecords,
  getMaintenanceRecordById,
  createMaintenanceRecord,
  updateMaintenanceRecord,
  getEquipmentMaintenanceHistory,
  getMaintenanceStatistics,
  uploadAttachments,
  getAttachments,
  deleteAttachment
}

