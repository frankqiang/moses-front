/**
 * 检验项目管理API
 * 功能描述：提供检验项目管理相关的API调用方法
 * 创建日期：2024-12-19
 */
import request from '@/utils/request'

const BASE_URL = '/mes/v1/master-data/quality-management/inspection-items'

/**
 * 获取检验项目列表
 * @param {Object} params - 查询参数
 * @param {Number} params.page - 页码
 * @param {Number} params.limit - 每页数量
 * @param {String} params.keyword - 关键词搜索
 * @param {String} params.category - 检验类别
 * @param {String} params.status - 状态
 * @param {String} params.dataType - 数据类型
 * @param {String} params.applicableProduct - 适用产品
 * @returns {Promise} - 返回检验项目列表数据
 */
export function getInspectionItemList(params) {
  return request({
    url: BASE_URL,
    method: 'get',
    params
  })
}

/**
 * 获取检验项目详情
 * @param {String} id - 检验项目ID
 * @returns {Promise} - 返回检验项目详情数据
 */
export function getInspectionItemDetail(id) {
  return request({
    url: `${BASE_URL}/${id}`,
    method: 'get'
  })
}

/**
 * 创建检验项目
 * @param {Object} data - 检验项目数据
 * @returns {Promise} - 返回创建结果
 */
export function createInspectionItem(data) {
  return request({
    url: BASE_URL,
    method: 'post',
    data
  })
}

/**
 * 更新检验项目
 * @param {String} id - 检验项目ID
 * @param {Object} data - 检验项目数据
 * @returns {Promise} - 返回更新结果
 */
export function updateInspectionItem(id, data) {
  return request({
    url: `${BASE_URL}/${id}`,
    method: 'put',
    data
  })
}

/**
 * 更新检验项目状态
 * @param {String} id - 检验项目ID
 * @param {String} status - 检验项目状态
 * @returns {Promise} - 返回更新结果
 */
export function updateInspectionItemStatus(id, status) {
  return request({
    url: `${BASE_URL}/${id}/status`,
    method: 'put',
    data: { status }
  })
}

/**
 * 删除检验项目
 * @param {String} id - 检验项目ID
 * @returns {Promise} - 返回删除结果
 */
export function deleteInspectionItem(id) {
  return request({
    url: `${BASE_URL}/${id}`,
    method: 'delete'
  })
}

/**
 * 批量更新检验项目状态
 * @param {Array} ids - 检验项目ID数组
 * @param {String} status - 检验项目状态
 * @returns {Promise} - 返回批量更新结果
 */
export function batchUpdateInspectionItemStatus(ids, status) {
  return request({
    url: `${BASE_URL}/batch/status`,
    method: 'put',
    data: { ids, status }
  })
}

/**
 * 批量删除检验项目
 * @param {Array} ids - 检验项目ID数组
 * @returns {Promise} - 返回批量删除结果
 */
export function batchDeleteInspectionItems(ids) {
  return request({
    url: `${BASE_URL}/batch`,
    method: 'delete',
    data: { ids }
  })
}

/**
 * 导出检验项目
 * @param {Object} params - 导出参数
 * @returns {Promise} - 返回导出结果
 */
export function exportInspectionItems(params) {
  return request({
    url: `${BASE_URL}/export`,
    method: 'get',
    params,
    responseType: 'blob'
  })
}

/**
 * 导入检验项目
 * @param {FormData} formData - 包含文件的表单数据
 * @returns {Promise} - 返回导入结果
 */
export function importInspectionItems(formData) {
  return request({
    url: `${BASE_URL}/import`,
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 下载检验项目导入模板
 * @returns {Promise} - 返回模板文件
 */
export function downloadInspectionItemTemplate() {
  return request({
    url: `${BASE_URL}/template`,
    method: 'get',
    responseType: 'blob'
  })
}

/**
 * 检查检验项目编码是否重复
 * @param {Object} params - 检查参数
 * @param {String} params.code - 检验项目编码
 * @param {String} [params.excludeId] - 排除的ID（编辑时使用）
 * @returns {Promise} - 返回检查结果
 */
export function checkInspectionItemCode(params) {
  return request({
    url: `${BASE_URL}/check-code`,
    method: 'get',
    params
  })
}

export default {
  getInspectionItemList,
  getInspectionItemDetail,
  createInspectionItem,
  updateInspectionItem,
  deleteInspectionItem,
  updateInspectionItemStatus,
  batchUpdateInspectionItemStatus,
  batchDeleteInspectionItems,
  exportInspectionItems,
  importInspectionItems,
  downloadInspectionItemTemplate,
  checkInspectionItemCode
}
