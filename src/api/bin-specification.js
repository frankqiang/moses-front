import request from '@/utils/request'

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
  return request({
    url: '/vue-admin-template/mes/product/type-list',
    method: 'get'
  })
}
