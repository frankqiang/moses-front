/**
 * 物料编码规则API
 * 描述：该模块包含物料编码规则功能的所有API请求
 * 创建日期：2023-10-01
 * 更新日期：2024-10-28
 */

import request from '@/utils/request'

// API基础路径
const baseURL = '/mes/master-data/material-code'

// 获取物料编码规则列表
export function getMaterialCodeRules(query) {
  return request({
    url: `${baseURL}/list`,
    method: 'get',
    params: query
  })
}

// 获取物料编码规则详情
export function getMaterialCodeRuleDetail(id) {
  return request({
    url: `${baseURL}/detail/${id}`,
    method: 'get'
  })
}

// 创建物料编码规则
export function createMaterialCodeRule(data) {
  return request({
    url: `${baseURL}/create`,
    method: 'post',
    data
  })
}

// 更新物料编码规则
export function updateMaterialCodeRule(data) {
  return request({
    url: `${baseURL}/update`,
    method: 'put',
    data
  })
}

// 设置默认规则
export function setDefaultCodeRule(id) {
  return request({
    url: `${baseURL}/set-default`,
    method: 'put',
    data: { id }
  })
}

// 生成预览编码
export function generatePreviewCode(data) {
  return request({
    url: `${baseURL}/preview`,
    method: 'post',
    data
  })
}

// 批量删除规则
export function batchDeleteRules(ids) {
  return request({
    url: `${baseURL}/batch-delete`,
    method: 'delete',
    data: { ids }
  })
}

// 导出规则
export function exportRules(data) {
  return request({
    url: `${baseURL}/export`,
    method: 'post',
    data,
    responseType: 'blob'
  })
}

// 导入规则
export function importRules(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: `${baseURL}/import`,
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 获取导入模板
export function getImportTemplate() {
  return request({
    url: `${baseURL}/template`,
    method: 'get',
    responseType: 'blob'
  })
}
