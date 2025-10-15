/**
 * 文件名称：process-parameter-management.js
 * 文件描述：工艺参数管理模块API接口封装 v2.0，涵盖模板及版本的CRUD与审批操作
 * 创建日期：2025-10-15
 * 修改记录：
 *   - 2025-10-15: 重构为v2.0版本，严格遵循v2.0接口文档规范
 *   - 移除不需要的currentStatus参数
 *   - 修正响应数据格式处理
 *   - 添加完整的JSDoc注释
 */

import service from '@/utils/request'
import { formatQueryParams } from '@/utils'

// API基础路径
const BASE_URL = '/mdm/process-templates'

/**
 * 1. 创建工艺模板及首个版本
 * @param {Object} payload - 创建模板参数
 * @param {string} payload.templateCode - 工艺模板编码（必填，大写字母数字横线）
 * @param {string} payload.templateName - 工艺模板名称（必填，最大200字符）
 * @param {string} payload.description - 工艺模板描述（可选，最大2000字符）
 * @param {string} payload.versionNumber - 版本号（必填，格式：v1.0或1.0）
 * @param {string} payload.versionDescription - 版本描述（可选，最大2000字符）
 * @param {Array<string>} payload.applicableProductIds - 适用产品ID列表（可选，UUID数组）
 * @param {string} payload.applicableAlloyGrades - 适用合金牌号（可选，逗号分隔）
 * @param {string} payload.applicableThicknessRange - 适用厚度范围（可选，格式：0.005-0.1）
 * @param {string} payload.applicableWidthRange - 适用宽度范围（可选，格式：500-1500）
 * @param {Array<Object>} payload.segments - 12段工艺参数配置（可选，若为空则使用presetTemplate）
 * @param {string} payload.presetTemplate - 预设模板名称（可选，standard/quick/blank，默认blank）
 * @returns {Promise<Object>} 返回创建的工艺模板完整信息
 */
export async function createProcessTemplate(payload) {
  const response = await service({
    url: BASE_URL,
    method: 'post',
    data: payload
  })

  return {
    data: response.data,
    message: response.message,
    meta: response.meta
  }
}

/**
 * 2. 分页查询工艺模板列表
 * @param {Object} params - 查询参数
 * @param {string} params.keyword - 关键词模糊搜索（模板编码/名称）
 * @param {string} params.status - 模板状态筛选（草稿/待审批/生效/历史）
 * @param {string} params.applicableProductId - 适用产品ID筛选（UUID格式）
 * @param {number} params.page - 页码（默认1）
 * @param {number} params.limit - 每页条数（默认10）
 * @param {string} params.sortBy - 排序字段（格式：field:asc或field:desc）
 * @returns {Promise<Object>} 返回模板列表和分页信息
 */
export async function fetchProcessTemplateList(params = {}) {
  const queryParams = formatQueryParams({
    keyword: params.keyword,
    status: params.status,
    applicableProductId: params.applicableProductId,
    page: params.page,
    limit: params.limit,
    sortBy: params.sortBy
  })

  const response = await service({
    url: BASE_URL,
    method: 'get',
    params: queryParams
  })

  const { data, message, meta } = response

  // 根据v2.0接口文档，后端返回格式为：data.results
  return {
    data: {
      templates: data?.results || [],
      pagination: {
        page: data?.page ?? params.page ?? 1,
        limit: data?.limit ?? params.limit ?? 10,
        totalPages: data?.totalPages ?? 0,
        totalResults: data?.totalResults ?? 0
      }
    },
    message,
    meta
  }
}

/**
 * 3. 获取工艺模板详情
 * @param {string} templateId - 模板ID（UUID）
 * @returns {Promise<Object>} 返回工艺模板完整详情
 */
export async function getProcessTemplateDetail(templateId) {
  const response = await service({
    url: `${BASE_URL}/${templateId}`,
    method: 'get'
  })

  return {
    data: response.data,
    message: response.message,
    meta: response.meta
  }
}

/**
 * 4. 更新工艺模板草稿/驳回版本
 * @param {string} templateId - 模板ID（UUID）
 * @param {string} versionId - 版本ID（UUID）
 * @param {Object} payload - 更新参数
 * @param {string} payload.templateName - 工艺模板名称（可选）
 * @param {string} payload.description - 工艺模板描述（可选）
 * @param {string} payload.versionDescription - 版本描述（可选）
 * @param {Array<string>} payload.applicableProductIds - 适用产品ID列表（可选）
 * @param {string} payload.applicableAlloyGrades - 适用合金牌号（可选）
 * @param {string} payload.applicableThicknessRange - 适用厚度范围（可选）
 * @param {string} payload.applicableWidthRange - 适用宽度范围（可选）
 * @param {Array<Object>} payload.segments - 12段工艺参数配置（可选，完整替换）
 * @returns {Promise<Object>} 返回更新后的版本详情
 */
export async function updateProcessTemplateVersion(templateId, versionId, payload) {
  const response = await service({
    url: `${BASE_URL}/${templateId}/versions/${versionId}`,
    method: 'patch',
    data: payload
  })

  return {
    data: response.data,
    message: response.message,
    meta: response.meta
  }
}

/**
 * 5. 提交工艺模板版本审批
 * @param {string} templateId - 模板ID（UUID）
 * @param {string} versionId - 版本ID（UUID）
 * @param {Object} payload - 提交参数
 * @param {string} payload.approvalComment - 提交审批备注（可选，最大500字符）
 * @returns {Promise<Object>} 返回提交后的版本详情
 */
export async function submitProcessTemplateVersion(templateId, versionId, payload = {}) {
  const response = await service({
    url: `${BASE_URL}/${templateId}/versions/${versionId}/submit-approval`,
    method: 'patch',
    data: payload
  })

  return {
    data: response.data,
    message: response.message,
    meta: response.meta
  }
}

/**
 * 6. 审批通过工艺模板版本
 * @param {string} templateId - 模板ID（UUID）
 * @param {string} versionId - 版本ID（UUID）
 * @param {Object} payload - 审批参数
 * @param {string} payload.approvalComment - 审批意见（可选，最大500字符）
 * @param {string} payload.effectiveDate - 生效日期（可选，ISO 8601格式，默认当前时间）
 * @param {string} payload.expiryDate - 失效日期（可选，ISO 8601格式，必须晚于生效日期）
 * @returns {Promise<Object>} 返回审批后的版本详情
 */
export async function approveProcessTemplateVersion(templateId, versionId, payload = {}) {
  const response = await service({
    url: `${BASE_URL}/${templateId}/versions/${versionId}/approve`,
    method: 'post',
    data: payload
  })

  return {
    data: response.data,
    message: response.message,
    meta: response.meta
  }
}

/**
 * 7. 审批驳回工艺模板版本
 * @param {string} templateId - 模板ID（UUID）
 * @param {string} versionId - 版本ID（UUID）
 * @param {Object} payload - 驳回参数
 * @param {string} payload.approvalComment - 审批意见（必填，驳回原因，最大500字符）
 * @returns {Promise<Object>} 返回驳回后的版本详情
 */
export async function rejectProcessTemplateVersion(templateId, versionId, payload) {
  const response = await service({
    url: `${BASE_URL}/${templateId}/versions/${versionId}/reject`,
    method: 'post',
    data: payload
  })

  return {
    data: response.data,
    message: response.message,
    meta: response.meta
  }
}

/**
 * 8. 撤回工艺模板版本审批
 * @param {string} templateId - 模板ID（UUID）
 * @param {string} versionId - 版本ID（UUID）
 * @param {Object} payload - 撤回参数
 * @param {string} payload.approvalComment - 撤回原因（可选，最大500字符）
 * @returns {Promise<Object>} 返回撤回后的版本详情
 */
export async function withdrawProcessTemplateVersion(templateId, versionId, payload = {}) {
  const response = await service({
    url: `${BASE_URL}/${templateId}/versions/${versionId}/withdraw`,
    method: 'post',
    data: payload
  })

  return {
    data: response.data,
    message: response.message,
    meta: response.meta
  }
}

/**
 * 9. 作废工艺模板版本
 * @param {string} templateId - 模板ID（UUID）
 * @param {string} versionId - 版本ID（UUID）
 * @param {Object} payload - 作废参数
 * @param {string} payload.approvalComment - 作废原因（可选，最大500字符）
 * @returns {Promise<Object>} 返回作废后的版本详情
 */
export async function voidProcessTemplateVersion(templateId, versionId, payload = {}) {
  const response = await service({
    url: `${BASE_URL}/${templateId}/versions/${versionId}/void`,
    method: 'post',
    data: payload
  })

  return {
    data: response.data,
    message: response.message,
    meta: response.meta
  }
}

/**
 * 10. 查询工艺模板版本历史列表
 * @param {string} templateId - 模板ID（UUID）
 * @param {Object} params - 查询参数
 * @param {string} params.status - 版本状态筛选（草稿/待审批/生效/历史/驳回/作废）
 * @param {number} params.page - 页码（默认1）
 * @param {number} params.limit - 每页条数（默认10）
 * @param {string} params.sortBy - 排序字段（格式：field:asc或field:desc）
 * @returns {Promise<Object>} 返回版本历史列表和分页信息
 */
export async function fetchProcessTemplateVersions(templateId, params = {}) {
  const queryParams = formatQueryParams({
    status: params.status,
    page: params.page,
    limit: params.limit,
    sortBy: params.sortBy
  })

  const response = await service({
    url: `${BASE_URL}/${templateId}/versions`,
    method: 'get',
    params: queryParams
  })

  const { data, message, meta } = response

  // 根据v2.0接口文档，后端返回格式为：data.template 和 data.versions（数组）
  return {
    data: {
      template: data?.template || null,
      versions: data?.versions || [],
      pagination: {
        page: data?.page ?? params.page ?? 1,
        limit: data?.limit ?? params.limit ?? 10,
        totalPages: data?.totalPages ?? 0,
        totalResults: data?.totalResults ?? 0
      }
    },
    message,
    meta
  }
}

/**
 * 11. 对比工艺模板版本差异
 * @param {string} templateId - 模板ID（UUID）
 * @param {Object} params - 对比参数
 * @param {string} params.baseVersionId - 基准版本ID（必填，UUID格式）
 * @param {string} params.compareVersionId - 对比版本ID（必填，UUID格式）
 * @returns {Promise<Object>} 返回版本差异对比结果
 */
export async function compareProcessTemplateVersions(templateId, params) {
  const queryParams = formatQueryParams({
    baseVersionId: params.baseVersionId,
    compareVersionId: params.compareVersionId
  })

  const response = await service({
    url: `${BASE_URL}/${templateId}/versions/compare`,
    method: 'get',
    params: queryParams
  })

  return {
    data: response.data,
    message: response.message,
    meta: response.meta
  }
}

/**
 * 12. 复制工艺模板
 * @param {string} templateId - 源模板ID（UUID）
 * @param {Object} payload - 复制参数
 * @param {string} payload.newTemplateCode - 新模板编码（必填，大写字母数字横线）
 * @param {string} payload.newTemplateName - 新模板名称（可选，默认使用源模板名称+"-副本"）
 * @param {string} payload.newVersionNumber - 新版本号（必填，格式：v1.0或1.0）
 * @param {string} payload.copyFromVersionId - 要复制的源版本ID（必填，UUID格式）
 * @returns {Promise<Object>} 返回新创建的模板完整信息
 */
export async function copyProcessTemplate(templateId, payload) {
  const response = await service({
    url: `${BASE_URL}/${templateId}/copy`,
    method: 'post',
    data: payload
  })

  return {
    data: response.data,
    message: response.message,
    meta: response.meta
  }
}

/**
 * 13. 创建工艺模板新版本
 * @param {string} templateId - 模板ID（UUID）
 * @param {Object} payload - 创建参数
 * @param {string} payload.newVersionNumber - 新版本号（必填，格式：v1.0或1.0）
 * @param {string} payload.versionDescription - 版本说明（可选，最大2000字符）
 * @param {string} payload.copyFromVersionId - 要复制的源版本ID（可选，UUID格式，默认为最新版本）
 * @returns {Promise<Object>} 返回新创建的版本详情
 */
export async function createNewVersion(templateId, payload) {
  const response = await service({
    url: `${BASE_URL}/${templateId}/versions/create`,
    method: 'post',
    data: payload
  })

  return {
    data: response.data,
    message: response.message,
    meta: response.meta
  }
}

/**
 * 14. 快速生效工艺模板版本
 * @param {string} templateId - 模板ID（UUID）
 * @param {string} versionId - 版本ID（UUID）
 * @param {Object} payload - 生效参数
 * @param {string} payload.effectiveDate - 生效日期（可选，ISO 8601格式，默认当前时间）
 * @param {string} payload.expiryDate - 失效日期（可选，ISO 8601格式，必须晚于生效日期）
 * @param {string} payload.comment - 操作备注（可选，最大500字符）
 * @returns {Promise<Object>} 返回生效后的版本详情
 */
export async function activateProcessTemplateVersion(templateId, versionId, payload = {}) {
  const response = await service({
    url: `${BASE_URL}/${templateId}/versions/${versionId}/activate`,
    method: 'post',
    data: payload
  })

  return {
    data: response.data,
    message: response.message,
    meta: response.meta
  }
}

/**
 * 15. 查询工艺模板引用情况
 * @param {string} templateId - 模板ID（UUID）
 * @returns {Promise<Object>} 返回引用统计信息
 */
export async function getProcessTemplateUsage(templateId) {
  const response = await service({
    url: `${BASE_URL}/${templateId}/usage`,
    method: 'get'
  })

  return {
    data: response.data,
    message: response.message,
    meta: response.meta
  }
}

/**
 * 16. 删除工艺模板
 * @param {string} templateId - 模板ID（UUID）
 * @returns {Promise<Object>} 返回删除结果
 */
export async function deleteProcessTemplate(templateId) {
  const response = await service({
    url: `${BASE_URL}/${templateId}`,
    method: 'delete'
  })

  return {
    data: response.data,
    message: response.message,
    meta: response.meta
  }
}

// 默认导出所有接口方法
export default {
  createProcessTemplate,
  fetchProcessTemplateList,
  getProcessTemplateDetail,
  updateProcessTemplateVersion,
  submitProcessTemplateVersion,
  approveProcessTemplateVersion,
  rejectProcessTemplateVersion,
  withdrawProcessTemplateVersion,
  voidProcessTemplateVersion,
  fetchProcessTemplateVersions,
  compareProcessTemplateVersions,
  copyProcessTemplate,
  createNewVersion,
  activateProcessTemplateVersion,
  getProcessTemplateUsage,
  deleteProcessTemplate
}

