/**
 * 检验项目管理模块Mock API处理函数
 * 功能描述：提供检验项目的CRUD操作和查询功能
 * 创建日期：2024-12-19
 * 修改记录：
 *   - 2024-12-19: 创建检验项目管理API
 */

const { data: inspectionItemsData, inspectionMethods, applicableProducts } = require('./data/inspection-items')
const Mock = require('mockjs')

// 引入统一的响应工具函数
const { success, error, errors, ERROR_CODES } = require('../../../utils/response')

// 数据缓存和状态管理
let dataCache = [...inspectionItemsData]
let idCounter = Math.max(...dataCache.map(item => item.id)) + 1

// 业务状态转换规则
const statusRules = {
  0: [1], // 禁用 -> 启用
  1: [0]  // 启用 -> 禁用
}

/**
 * API处理函数集合
 */
const handlers = {
  /**
   * 获取检验项目列表
   * @param {Object} config - 请求配置
   * @returns {Object} 响应数据
   */
  getList(config) {
    const { page = 1, limit = 10, keyword = '', inspectionMethod = '', applicableProduct = '', status = '' } = config.query

    // 过滤数据
    let filteredList = [...dataCache]
    
    // 关键词搜索
    if (keyword) {
      const lowercaseKeyword = keyword.toLowerCase()
      filteredList = filteredList.filter(item => 
        item.code.toLowerCase().includes(lowercaseKeyword) || 
        item.name.toLowerCase().includes(lowercaseKeyword) ||
        item.description.toLowerCase().includes(lowercaseKeyword)
      )
    }
    
    // 检验方法过滤
    if (inspectionMethod) {
      filteredList = filteredList.filter(item => item.inspectionMethod === inspectionMethod)
    }
    
    // 适用产品过滤
    if (applicableProduct) {
      filteredList = filteredList.filter(item => item.applicableProduct === applicableProduct)
    }
    
    // 状态过滤
    if (status !== '') {
      filteredList = filteredList.filter(item => item.status === parseInt(status))
    }

    // 分页处理
    const total = filteredList.length
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + parseInt(limit)
    const items = filteredList.slice(startIndex, endIndex)

    return success({
      items,
      total,
      page: parseInt(page),
      size: parseInt(limit),
      pages: Math.ceil(total / limit)
    })
  },

  /**
   * 获取所有检验项目（不分页）
   * @param {Object} config - 请求配置
   * @returns {Object} 响应数据
   */
  getAll(config) {
    return success(dataCache)
  },

  /**
   * 根据ID获取检验项目详情
   * @param {Object} config - 请求配置
   * @returns {Object} 响应数据
   */
  getById(config) {
    const { id } = config.query
    const item = dataCache.find(item => item.id === parseInt(id))
    
    if (!item) {
      return error(ERROR_CODES.NOT_FOUND, '检验项目不存在')
    }
    
    return success(item)
  },

  /**
   * 创建检验项目
   * @param {Object} config - 请求配置
   * @returns {Object} 响应数据
   */
  create(config) {
    const body = JSON.parse(config.body)
    
    // 验证必填字段
    const requiredFields = ['code', 'name', 'inspectionMethod', 'applicableProduct']
    const missingFields = requiredFields.filter(field => !body[field])
    
    if (missingFields.length > 0) {
      return error(ERROR_CODES.VALIDATION_ERROR, `缺少必填字段: ${missingFields.join(', ')}`)
    }
    
    // 检查编码是否重复
    const existingItem = dataCache.find(item => item.code === body.code)
    if (existingItem) {
      return error(ERROR_CODES.DUPLICATE_ERROR, '检验项目编码已存在')
    }
    
    // 创建新检验项目
    const newItem = {
      id: idCounter++,
      code: body.code,
      name: body.name,
      inspectionMethod: body.inspectionMethod,
      inspectionMethodText: getInspectionMethodText(body.inspectionMethod),
      applicableProduct: body.applicableProduct,
      applicableProductText: getApplicableProductText(body.applicableProduct),
      standardValue: body.standardValue || 0,
      toleranceRange: body.toleranceRange || 0,
      unit: body.unit || '',
      description: body.description || '',
      status: body.status !== undefined ? body.status : 1,
      createTime: Mock.mock('@datetime'),
      updateTime: Mock.mock('@datetime'),
      createdBy: body.createdBy || 'admin',
      updatedBy: body.updatedBy || 'admin'
    }
    
    dataCache.push(newItem)
    return success(newItem)
  },

  /**
   * 更新检验项目
   * @param {Object} config - 请求配置
   * @returns {Object} 响应数据
   */
  update(config) {
    const { id } = config.query
    const body = JSON.parse(config.body)
    
    const itemIndex = dataCache.findIndex(item => item.id === parseInt(id))
    if (itemIndex === -1) {
      return error(ERROR_CODES.NOT_FOUND, '检验项目不存在')
    }
    
    // 检查编码是否重复（排除自身）
    if (body.code) {
      const existingItem = dataCache.find(item => item.code === body.code && item.id !== parseInt(id))
      if (existingItem) {
        return error(ERROR_CODES.DUPLICATE_ERROR, '检验项目编码已存在')
      }
    }
    
    // 更新检验项目
    const updatedItem = {
      ...dataCache[itemIndex],
      ...body,
      id: parseInt(id), // 确保ID不被修改
      inspectionMethodText: body.inspectionMethod ? getInspectionMethodText(body.inspectionMethod) : dataCache[itemIndex].inspectionMethodText,
      applicableProductText: body.applicableProduct ? getApplicableProductText(body.applicableProduct) : dataCache[itemIndex].applicableProductText,
      updateTime: Mock.mock('@datetime'),
      updatedBy: body.updatedBy || 'admin'
    }
    
    dataCache[itemIndex] = updatedItem
    return success(updatedItem)
  },

  /**
   * 删除检验项目
   * @param {Object} config - 请求配置
   * @returns {Object} 响应数据
   */
  delete(config) {
    const { id } = config.query
    const itemIndex = dataCache.findIndex(item => item.id === parseInt(id))
    
    if (itemIndex === -1) {
      return error(ERROR_CODES.NOT_FOUND, '检验项目不存在')
    }
    
    dataCache.splice(itemIndex, 1)
    return success({ message: '删除成功' })
  },

  /**
   * 批量删除检验项目
   * @param {Object} config - 请求配置
   * @returns {Object} 响应数据
   */
  batchDelete(config) {
    const { ids } = JSON.parse(config.body)
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return error(ERROR_CODES.VALIDATION_ERROR, '请选择要删除的检验项目')
    }
    
    const deletedCount = ids.reduce((count, id) => {
      const itemIndex = dataCache.findIndex(item => item.id === parseInt(id))
      if (itemIndex !== -1) {
        dataCache.splice(itemIndex, 1)
        return count + 1
      }
      return count
    }, 0)
    
    return success({ message: `成功删除 ${deletedCount} 个检验项目` })
  },

  /**
   * 更新检验项目状态
   * @param {Object} config - 请求配置
   * @returns {Object} 响应数据
   */
  updateStatus(config) {
    const { id } = config.query
    const { status } = JSON.parse(config.body)
    
    const itemIndex = dataCache.findIndex(item => item.id === parseInt(id))
    if (itemIndex === -1) {
      return error(ERROR_CODES.NOT_FOUND, '检验项目不存在')
    }
    
    const currentStatus = dataCache[itemIndex].status
    const allowedStatuses = statusRules[currentStatus] || []
    
    if (!allowedStatuses.includes(status)) {
      return error(ERROR_CODES.BUSINESS_ERROR, '状态转换不允许')
    }
    
    dataCache[itemIndex].status = status
    dataCache[itemIndex].updateTime = Mock.mock('@datetime')
    
    return success(dataCache[itemIndex])
  }
}

/**
 * 获取检验方法文本
 * @param {string} method - 检验方法代码
 * @returns {string} 检验方法文本
 */
function getInspectionMethodText(method) {
  const { inspectionMethodTextMap } = require('./data/inspection-items')
  return inspectionMethodTextMap[method] || method
}

/**
 * 获取适用产品文本
 * @param {string} product - 适用产品代码
 * @returns {string} 适用产品文本
 */
function getApplicableProductText(product) {
  const { applicableProductTextMap } = require('./data/inspection-items')
  return applicableProductTextMap[product] || product
}

// 基础路径常量
const BASE_PATH = '/mes/v1/master-data/quality-management/inspection-items'

// 定义路由模式
const ROUTES = {
  // 集合操作
  COLLECTION: `${BASE_PATH}$`,
  
  // 特殊功能路由
  ALL: `${BASE_PATH}/all$`,
  DETAIL: `${BASE_PATH}/detail$`,
  UPDATE: `${BASE_PATH}/update$`,
  DELETE: `${BASE_PATH}/delete$`,
  BATCH_DELETE: `${BASE_PATH}/batch-delete$`,
  STATUS: `${BASE_PATH}/status$`
}

// 路由配置
const routes = [
  // 集合操作
  { url: ROUTES.COLLECTION, type: 'get', response: handlers.getList },
  { url: ROUTES.COLLECTION, type: 'post', response: handlers.create },
  
  // 特殊功能
  { url: ROUTES.ALL, type: 'get', response: handlers.getAll },
  { url: ROUTES.DETAIL, type: 'get', response: handlers.getById },
  { url: ROUTES.UPDATE, type: 'put', response: handlers.update },
  { url: ROUTES.DELETE, type: 'delete', response: handlers.delete },
  { url: ROUTES.BATCH_DELETE, type: 'post', response: handlers.batchDelete },
  { url: ROUTES.STATUS, type: 'put', response: handlers.updateStatus }
]

module.exports = routes