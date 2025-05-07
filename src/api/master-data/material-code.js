import request from '@/utils/request'

// 获取物料编码规则列表
export function getMaterialCodeRules(query) {
  return request({
    url: '/vue-admin-template/mes/material-code/list',
    method: 'get',
    params: query
  })
}

// 获取物料编码规则详情
export function getMaterialCodeRuleDetail(id) {
  return request({
    url: `/vue-admin-template/mes/material-code/detail/${id}`,
    method: 'get'
  })
}

// 创建物料编码规则
export function createMaterialCodeRule(data) {
  return request({
    url: '/vue-admin-template/mes/material-code/create',
    method: 'post',
    data
  })
}

// 更新物料编码规则
export function updateMaterialCodeRule(data) {
  return request({
    url: '/vue-admin-template/mes/material-code/update',
    method: 'put',
    data
  })
}

// 设置默认规则
export function setDefaultCodeRule(id) {
  return request({
    url: '/vue-admin-template/mes/material-code/set-default',
    method: 'put',
    data: { id }
  })
}

// 生成预览编码
export function generatePreviewCode(data) {
  return request({
    url: '/vue-admin-template/mes/material-code/preview',
    method: 'post',
    data
  })
} 