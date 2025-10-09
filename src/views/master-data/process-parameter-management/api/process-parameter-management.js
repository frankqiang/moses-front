/**
 * 文件名称：process-parameter-management.js
 * 文件描述：工艺参数管理模块API接口封装，涵盖模板及版本的CRUD与审批操作
 * 创建日期：2025-09-29
 * 修改记录：
 *   - 2025-09-29: 初始创建，完成TASK001 P0阶段全部接口封装
 *   - 2025-10-08: 新增createNewVersion接口封装，完成TASK001 P0-6
 *   - 2025-10-09: 修复分页和搜索问题，按接口文档正确解析响应数据和过滤查询参数
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
  // 参数转换：根据接口文档，只支持以下查询参数
  // - keyword: 按模板编码/名称模糊搜索
  // - status: 模板状态
  // - applicableProductId: 适用产品 ID (单个)
  // - page: 页码
  // - limit: 每页条数
  // - sortBy: 排序字段
  const queryParams = {}

  // 基础搜索参数
  if (params.keyword) {
    queryParams.keyword = params.keyword
  }
  if (params.status) {
    queryParams.status = params.status
  }
  if (params.page) {
    queryParams.page = params.page
  }
  if (params.limit) {
    queryParams.limit = params.limit
  }
  if (params.sortBy) {
    queryParams.sortBy = params.sortBy
  }

  // 处理适用产品ID参数：接口文档期望单个产品ID，如果前端传递数组，则只取第一个
  if (params.applicableProductIds && Array.isArray(params.applicableProductIds)) {
    if (params.applicableProductIds.length > 0) {
      // 如果是多个产品，暂时只支持单个产品过滤（取第一个）
      queryParams.applicableProductId = params.applicableProductIds[0]
    }
  } else if (params.applicableProductId) {
    queryParams.applicableProductId = params.applicableProductId
  }

  // 注意：以下参数接口文档暂不支持，前端收集但不传递给后端
  // - versionStatus: 版本状态
  // - applicableAlloy: 适用合金
  // - thicknessMin/thicknessMax: 厚度范围
  // - widthMin/widthMax: 宽度范围
  // - createdAtFrom/createdAtTo: 创建时间范围
  // - updatedAtFrom/updatedAtTo: 更新时间范围

  const formattedParams = formatQueryParams(queryParams)

  const response = await service({
    url: BASE_URL,
    method: 'get',
    params: formattedParams
  })

  const { data, message, meta } = response

  // 根据接口文档，后端返回格式为：
  // {
  //   "data": {
  //     "results": [...],
  //     "page": 1,
  //     "limit": 10,
  //     "totalPages": 1,
  //     "totalResults": 1
  //   }
  // }
  const rawTemplates = data?.results || data?.templates || []

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

export async function createNewVersion(templateId, payload) {
  assertTemplateId(templateId)
  if (!payload || !payload.newVersionNumber) {
    throw new ApiError('PTM_CLIENT_009', '创建新版本缺少必填字段：newVersionNumber', 400)
  }

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
  createNewVersion,
  activateProcessTemplateVersion,
  getProcessTemplateUsage,
  deleteProcessTemplate
}

