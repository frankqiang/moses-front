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
  // TODO: 临时返回模拟数据，工艺模块后端接口实现后恢复以下代码：
  // return request({
  //   url: '/vue-admin-template/mes/process-template/list',
  //   method: 'get',
  //   params: { status: 'effective' } // 只获取生效状态的工艺模板
  // })

  // 临时模拟数据 - 避免调用未实现的后端接口
  return Promise.resolve({
    success: true,
    data: {
      results: [
        { id: '456e4567-e89b-12d3-a456-426614174001', code: 'PT001', name: '退火工艺模板1号', version: '1.0', status: 'effective' },
        { id: '456e4567-e89b-12d3-a456-426614174002', code: 'PT002', name: '退火工艺模板2号', version: '1.0', status: 'effective' },
        { id: '456e4567-e89b-12d3-a456-426614174003', code: 'PT003', name: '退火工艺模板3号', version: '1.0', status: 'effective' }
      ],
      total: 3,
      hasNextPage: false
    },
    message: '获取工艺模板列表成功（临时数据）'
  })
}

// 获取质量标准列表（用于选择关联质量标准）
export function getQualityStandardList() {
  // TODO: 临时返回模拟数据，质量模块后端接口实现后恢复以下代码：
  // return request({
  //   url: '/vue-admin-template/mes/quality-standard/list',
  //   method: 'get',
  //   params: { status: 'effective' } // 只获取生效状态的质量标准
  // })

  // 临时模拟数据 - 避免调用未实现的后端接口
  return Promise.resolve({
    success: true,
    data: {
      results: [
        { id: 'QS001', name: '铝箔质量标准1号', version: '1.0', status: 'effective' },
        { id: 'QS002', name: '铝箔质量标准2号', version: '1.0', status: 'effective' },
        { id: 'QS003', name: '铝箔质量标准3号', version: '1.0', status: 'effective' }
      ],
      total: 3,
      hasNextPage: false
    },
    message: '获取质量标准列表成功（临时数据）'
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
