/**
 * 文件名称：api-config.js
 * 文件描述：铝箔产品管理模块API配置常量
 * 创建日期：2025-09-26
 * 修改记录：
 *   - 2025-09-26: 初始创建，按接口文档定义请求路径与方法
 */

export const API_PREFIX = '/aluminum-foil-products'

export const API_ENDPOINTS = {
  list: {
    method: 'get',
    url: API_PREFIX
  },
  detail: {
    method: 'get',
    url: `${API_PREFIX}/:id`
  },
  create: {
    method: 'post',
    url: API_PREFIX
  },
  update: {
    method: 'patch',
    url: `${API_PREFIX}/:id`
  }
}

export const API_DEFAULT_PARAMS = {
  list: {
    page: 1,
    limit: 20,
    sortBy: 'createdAt:desc'
  }
}

export const API_ERROR_CODES = {
  productCodeExists: 'AFP_001',
  invalidProductCodeFormat: 'AFP_002',
  invalidNumericRange: 'VAL_002',
  productNotFound: 'AFP_004'
}

export const API_RESPONSE_MESSAGES = {
  listSuccess: '查询铝箔产品列表成功',
  detailSuccess: '获取铝箔产品详情成功',
  createSuccess: '铝箔产品创建成功',
  updateSuccess: '铝箔产品更新成功'
}

