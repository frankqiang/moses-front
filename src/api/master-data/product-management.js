import request from '@/utils/request'

// 获取铝箔产品列表
export function getProductList(query) {
  return request({
    url: '/vue-admin-template/mes/product/list',
    method: 'get',
    params: query
  })
}

// 获取铝箔产品详情
export function getProductDetail(id) {
  return request({
    url: `/vue-admin-template/mes/product/detail/${id}`,
    method: 'get'
  })
}

// 创建铝箔产品
export function createProduct(data) {
  return request({
    url: '/vue-admin-template/mes/product/create',
    method: 'post',
    data
  })
}

// 更新铝箔产品
export function updateProduct(data) {
  return request({
    url: '/vue-admin-template/mes/product/update',
    method: 'put',
    data
  })
}

// 删除铝箔产品
export function deleteProduct(id) {
  return request({
    url: `/vue-admin-template/mes/product/delete/${id}`,
    method: 'delete'
  })
}

// 更改铝箔产品状态
export function changeProductStatus(id, lifecycleStatus) {
  return request({
    url: '/vue-admin-template/mes/product/status',
    method: 'put',
    data: { id, lifecycleStatus }
  })
}

// 批量删除铝箔产品
export function batchDeleteProduct(ids) {
  return request({
    url: '/vue-admin-template/mes/product/batch-delete',
    method: 'delete',
    data: { ids }
  })
}

// 批量更改铝箔产品状态
export function batchChangeProductStatus(ids, lifecycleStatus) {
  return request({
    url: '/vue-admin-template/mes/product/batch-status',
    method: 'put',
    data: { ids, lifecycleStatus }
  })
}

// 获取工艺模板列表（用于选择关联工艺模板）
export function getProcessTemplateList() {
  return request({
    url: '/vue-admin-template/mes/process-template/list',
    method: 'get',
    params: { status: 'effective' } // 只获取生效状态的工艺模板
  })
}

// 获取质量标准列表（用于选择关联质量标准）
export function getQualityStandardList() {
  return request({
    url: '/vue-admin-template/mes/quality-standard/list',
    method: 'get',
    params: { status: 'effective' } // 只获取生效状态的质量标准
  })
}

// 导出铝箔产品数据
export function exportProduct(query) {
  return request({
    url: '/vue-admin-template/mes/product/export',
    method: 'get',
    params: query,
    responseType: 'blob'
  })
}

// 下载导入模板
export function downloadTemplate() {
  return request({
    url: '/vue-admin-template/mes/product/download-template',
    method: 'get',
    responseType: 'blob'
  })
}

// 导入铝箔产品数据
export function importProduct(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: '/vue-admin-template/mes/product/import',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 获取所有产品列表（支持搜索，用于下拉选择）
export function getAllProductList(params = {}) {
  return request({
    url: '/vue-admin-template/mes/product/all-list',
    method: 'get',
    params // 支持 search, limit 等参数
  })
}
