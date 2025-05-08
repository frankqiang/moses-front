import request from '@/utils/request'
import { getAllProductList } from './product-management'

// 获取料框规格列表
export function getBinSpecList(query) {
  return request({
    url: '/vue-admin-template/mes/bin-specification/list',
    method: 'get',
    params: query
  })
}

// 获取料框规格详情
export function getBinSpecDetail(id) {
  return request({
    url: `/vue-admin-template/mes/bin-specification/detail/${id}`,
    method: 'get'
  })
}

// 创建料框规格
export function createBinSpec(data) {
  return request({
    url: '/vue-admin-template/mes/bin-specification/create',
    method: 'post',
    data
  })
}

// 更新料框规格
export function updateBinSpec(data) {
  return request({
    url: '/vue-admin-template/mes/bin-specification/update',
    method: 'put',
    data
  })
}

// 删除料框规格
export function deleteBinSpec(id) {
  return request({
    url: `/vue-admin-template/mes/bin-specification/delete/${id}`,
    method: 'delete'
  })
}

// 更改料框规格状态（启用/禁用）
export function changeBinSpecStatus(id, status) {
  return request({
    url: '/vue-admin-template/mes/bin-specification/status',
    method: 'put',
    data: { id, status }
  })
}

// 获取产品类型列表（用于选择适用产品类型）
export function getProductTypeList() {
  return getAllProductList()
}

// 批量删除料框规格
export function batchDeleteBinSpec(ids) {
  return request({
    url: '/vue-admin-template/mes/bin-specification/batch-delete',
    method: 'delete',
    data: { ids }
  })
}

// 批量更改料框规格状态
export function batchChangeBinSpecStatus(ids, status) {
  return request({
    url: '/vue-admin-template/mes/bin-specification/batch-status',
    method: 'put',
    data: { ids, status }
  })
}

// 导出料框规格数据
export function exportBinSpec(query) {
  return request({
    url: '/vue-admin-template/mes/bin-specification/export',
    method: 'get',
    params: query,
    responseType: 'blob'
  })
}

// 下载导入模板
export function downloadTemplate() {
  return request({
    url: '/vue-admin-template/mes/bin-specification/download-template',
    method: 'get',
    responseType: 'blob'
  })
}

// 导入料框规格数据
export function importBinSpec(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: '/vue-admin-template/mes/bin-specification/import',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
} 