/**
 * 文件名称：process-parameter-management.js
 * 文件描述：工艺参数管理模块API接口封装，涵盖模板及版本的CRUD与审批操作
 * 创建日期：2025-09-29
 * 修改记录：
 *   - 2025-09-29: 初始创建，完成TASK001 P0阶段全部接口封装
 */

import service, { ApiError } from '@/utils/request'
import { formatQueryParams } from '@/utils'

const BASE_URL = '/mdm/process-templates'
const PRODUCT_URL = '/mdm/aluminum-foil-products'

function assertTemplateId(templateId) {
  if (!templateId) {
    throw new ApiError('PTM_CLIENT_001', '模板ID不能为空', 400, { templateId })
  }
}

function assertVersionId(versionId) {
  if (!versionId) {
    throw new ApiError('PTM_CLIENT_002', '版本ID不能为空', 400, { versionId })
  }
}

function assertCurrentStatus(payload) {
  if (!payload || !payload.currentStatus) {
    throw new ApiError('PTM_CLIENT_003', 'currentStatus为必填字段', 400)
  }
}

export async function fetchProductOptions(params = {}) {
  const {
    keyword = '',
    limit = 20,
    lifecycleStatus = '量产',
    page = 1,
    sortBy = 'productCode:asc'
  } = params

  const queryParams = formatQueryParams({
    search: keyword ? keyword.trim() : undefined,
    lifecycleStatus,
    limit,
    page,
    sortBy
  })

  const response = await service({
    url: PRODUCT_URL,
    method: 'get',
    params: queryParams
  })

  const results = response.data?.results || []

  return {
    data: {
      options: results.map(item => ({
        id: item.id,
        productCode: item.productCode,
        productName: item.productName,
        lifecycleStatus: item.lifecycleStatus
      })),
      pagination: {
        page: response.data?.page ?? page,
        limit: response.data?.limit ?? limit,
        totalPages: response.data?.totalPages ?? 0,
        totalResults: response.data?.totalResults ?? results.length
      }
    },
    message: response.message,
    meta: response.meta
  }
}

export async function fetchProcessTemplateList(params = {}) {
  const queryParams = formatQueryParams(params)
  const response = await service({
    url: BASE_URL,
    method: 'get',
    params: queryParams
  })

  const { data, message, meta } = response

  // 适配后端实际返回结构（与接口文档不一致）
  // 实际返回：data.templates 和 data.pagination
  // 文档描述：data.results 和 data.page/limit 等直接在 data 下
  const rawTemplates = data?.templates || data?.results || []
  const pagination = data?.pagination || {
    page: data?.page ?? params.page ?? 1,
    limit: data?.limit ?? params.limit ?? 10,
    totalPages: data?.totalPages ?? 0,
    totalResults: data?.totalResults ?? 0
  }

  // 标准化数据：确保每个模板都有latestVersion字段（即使是null）
  const templates = rawTemplates.map(template => {
    console.log('[API] Processing template:', template.templateCode, 'latestVersion:', template.latestVersion)
    return {
      ...template,
      latestVersion: template.latestVersion || null
    }
  })

  return {
    data: {
      templates,
      pagination: {
        page: pagination.page ?? params.page ?? 1,
        limit: pagination.limit ?? params.limit ?? 10,
        totalPages: pagination.totalPages ?? 0,
        totalResults: pagination.totalResults ?? 0
      }
    },
    message,
    meta
  }
}

export async function createProcessTemplate(payload) {
  if (!payload || !payload.templateCode || !payload.templateName || !payload.versionNumber) {
    throw new ApiError('PTM_CLIENT_004', '创建模板缺少必填字段', 400)
  }

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

export async function getProcessTemplateDetail(templateId) {
  assertTemplateId(templateId)

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

export async function updateProcessTemplateVersion(templateId, versionId, payload) {
  assertTemplateId(templateId)
  assertVersionId(versionId)

  if (!payload || typeof payload !== 'object') {
    throw new ApiError('PTM_CLIENT_005', '更新模板版本参数无效', 400)
  }

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

export async function submitProcessTemplateVersion(templateId, versionId, payload) {
  assertTemplateId(templateId)
  assertVersionId(versionId)
  assertCurrentStatus(payload)

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

export async function approveProcessTemplateVersion(templateId, versionId, payload) {
  assertTemplateId(templateId)
  assertVersionId(versionId)
  assertCurrentStatus(payload)

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

export async function rejectProcessTemplateVersion(templateId, versionId, payload) {
  assertTemplateId(templateId)
  assertVersionId(versionId)
  assertCurrentStatus(payload)

  if (!payload.approvalComment) {
    throw new ApiError('PTM_CLIENT_006', '驳回操作必须提供审批意见', 400)
  }

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

export async function withdrawProcessTemplateVersion(templateId, versionId, payload) {
  assertTemplateId(templateId)
  assertVersionId(versionId)
  assertCurrentStatus(payload)

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

export async function voidProcessTemplateVersion(templateId, versionId, payload) {
  assertTemplateId(templateId)
  assertVersionId(versionId)
  assertCurrentStatus(payload)

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

export async function fetchProcessTemplateVersions(templateId, params = {}) {
  assertTemplateId(templateId)
  const queryParams = formatQueryParams(params)

  const response = await service({
    url: `${BASE_URL}/${templateId}/versions`,
    method: 'get',
    params: queryParams
  })

  return {
    data: {
      template: response.data?.template || null,
      versions: {
        list: response.data?.versions?.results || [],
        pagination: {
          page: response.data?.versions?.page ?? params.page ?? 1,
          limit: response.data?.versions?.limit ?? params.limit ?? 10,
          totalPages: response.data?.versions?.totalPages ?? 0,
          totalResults: response.data?.versions?.totalResults ?? 0
        }
      }
    },
    message: response.message,
    meta: response.meta
  }
}

export async function compareProcessTemplateVersions(templateId, params = {}) {
  assertTemplateId(templateId)
  if (!params.baseVersionId || !params.compareVersionId) {
    throw new ApiError('PTM_CLIENT_007', '对比操作需要提供baseVersionId和compareVersionId', 400)
  }

  const queryParams = formatQueryParams(params)

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

export async function copyProcessTemplate(templateId, payload) {
  assertTemplateId(templateId)
  if (!payload || !payload.newTemplateCode || !payload.newVersionNumber || !payload.copyFromVersionId) {
    throw new ApiError('PTM_CLIENT_008', '复制模板缺少必填字段', 400)
  }

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

export async function activateProcessTemplateVersion(templateId, versionId, payload = {}) {
  assertTemplateId(templateId)
  assertVersionId(versionId)

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

export async function getProcessTemplateUsage(templateId) {
  assertTemplateId(templateId)

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

export async function deleteProcessTemplate(templateId) {
  assertTemplateId(templateId)

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

export default {
  fetchProcessTemplateList,
  createProcessTemplate,
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
  activateProcessTemplateVersion,
  getProcessTemplateUsage,
  deleteProcessTemplate
}

