/**
 * 炉型管理API
 * 功能描述：提供炉型管理相关的API调用方法
 * 创建日期：2024-11-16
 */
import request from '@/utils/request'

// API基础路径
const baseURL = '/mes/master-data/furnace-type'

// 获取炉型列表
export function getFurnaceTypeList(query) {
  return request({
    url: `${baseURL}/list`,
    method: 'get',
    params: query
  })
}

// 获取炉型详情
export function getFurnaceTypeDetail(id) {
  return request({
    url: `${baseURL}/detail/${id}`,
    method: 'get'
  })
}

// 创建炉型
export function createFurnaceType(data) {
  return request({
    url: `${baseURL}/create`,
    method: 'post',
    data
  })
}

// 更新炉型
export function updateFurnaceType(data) {
  return request({
    url: `${baseURL}/update`,
    method: 'put',
    data
  })
}

// 删除炉型
export function deleteFurnaceType(id) {
  return request({
    url: `${baseURL}/batch-delete`,
    method: 'delete',
    data: { ids: [id] }
  })
}

// 更改炉型状态
export function changeFurnaceTypeStatus(id, status) {
  return request({
    url: `${baseURL}/status`,
    method: 'put',
    data: { id, status }
  })
}

// 批量删除炉型
export function batchDeleteFurnaceType(ids) {
  return request({
    url: `${baseURL}/batch-delete`,
    method: 'delete',
    data: { ids }
  })
}

// 批量更改炉型状态
export function batchChangeFurnaceTypeStatus(ids, status) {
  return request({
    url: `${baseURL}/batch-status`,
    method: 'put',
    data: { ids, status }
  })
}

// 导出炉型数据
export function exportFurnaceType(query) {
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

// 导入炉型数据
export function importFurnaceType(file) {
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

// 获取关联设备列表
export function getRelatedEquipment(furnaceTypeId) {
  return request({
    url: `${baseURL}/related-equipment/${furnaceTypeId}`,
    method: 'get'
  })
}

// 获取关联工艺模板列表
export function getRelatedTemplates(furnaceTypeId) {
  return request({
    url: `${baseURL}/related-templates/${furnaceTypeId}`,
    method: 'get'
  })
} 