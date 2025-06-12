import request from '@/utils/request'
import { getAllFurnaceTypes } from '@/api/master-data/furnace-type'

// API基础路径
const baseURL = '/mes/master-data/process-parameter'

// 获取工艺模板列表
export function getProcessTemplateList(query) {
  console.log('API请求参数:', query)

  return request({
    url: `${baseURL}/list`,
    method: 'get',
    params: query
  })
}

// 获取工艺模板详情
export function getProcessTemplateDetail(id) {
  return request({
    url: `${baseURL}/detail/${id}`,
    method: 'get'
  })
}

// 创建工艺模板
export function createProcessTemplate(data) {
  return request({
    url: `${baseURL}/create`,
    method: 'post',
    data
  })
}

// 更新工艺模板
export function updateProcessTemplate(data) {
  return request({
    url: `${baseURL}/update`,
    method: 'put',
    data
  })
}

// 删除工艺模板
export function deleteProcessTemplate(id) {
  return request({
    url: `${baseURL}/delete/${id}`,
    method: 'delete'
  })
}

// 更改工艺模板状态
export function changeProcessTemplateStatus(id, status) {
  return request({
    url: `${baseURL}/status`,
    method: 'put',
    data: { id, status }
  })
}

// 批量删除工艺模板
export function batchDeleteProcessTemplate(ids) {
  return request({
    url: `${baseURL}/batch-delete`,
    method: 'delete',
    data: { ids }
  })
}

// 批量更改工艺模板状态
export function batchChangeProcessTemplateStatus(ids, status) {
  return request({
    url: `${baseURL}/batch-status`,
    method: 'put',
    data: { ids, status }
  })
}

// 导出工艺模板数据
export function exportProcessTemplate(query) {
  return request({
    url: `${baseURL}/export`,
    method: 'get',
    params: query,
    responseType: 'blob'
  })
}

// 下载导入模板
export function downloadTemplate() {
  return request({
    url: `${baseURL}/download-template`,
    method: 'get',
    responseType: 'blob'
  })
}

// 导入工艺模板数据
export function importProcessTemplate(file) {
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

// 提交工艺模板审批
export function submitProcessTemplateForApproval(id) {
  return request({
    url: `${baseURL}/submit-approval`,
    method: 'put',
    data: { id }
  })
}

// 审批工艺模板
export function approveProcessTemplate(id, approved, comment) {
  return request({
    url: `${baseURL}/approve`,
    method: 'put',
    data: { id, approved, comment }
  })
}

// 创建工艺模板新版本
export function createNewVersion(id) {
  return request({
    url: `${baseURL}/new-version`,
    method: 'post',
    data: { id }
  })
}
