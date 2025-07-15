const { v4: uuidv4 } = require('uuid')
const { data: routingsData } = require('../data/routings.js')

// 数据缓存，模拟数据库行为
let dataCache = [...routingsData]

// 响应工具函数
const success = (data, message = '操作成功', status = 200) => ({
  code: 20000,
  success: true,
  data,
  message,
  timestamp: new Date().getTime(),
  status
})

const error = (code, message, status = 500, details = null) => ({
  success: false,
  error: {
    code,
    message,
    details
  },
  timestamp: new Date().toISOString(),
  status
})

// API基础路径
const BASE_PATH = '/mes/v1/master-data/process-management/routings'

/**
 * API处理函数集合
 */
const handlers = {
  getList(config) {
    const { page = 1, limit = 10, keyword = '', status = '', type = '' } = config.query
    
    let filteredList = [...dataCache]

    // 关键词搜索
    if (keyword) {
      const lowercaseKeyword = keyword.toLowerCase()
      filteredList = filteredList.filter(item =>
        item.code.toLowerCase().includes(lowercaseKeyword) ||
        item.name.toLowerCase().includes(lowercaseKeyword) ||
        (item.applicableProducts && item.applicableProducts.some(p => p.toLowerCase().includes(lowercaseKeyword)))
      )
    }

    // 状态筛选
    if (status) {
      const statuses = Array.isArray(status) ? status : status.split(',')
      if (statuses.length > 0) {
        filteredList = filteredList.filter(item => statuses.includes(item.status))
      }
    }

    // 路线类型筛选
    if (type) {
      const types = Array.isArray(type) ? type : type.split(',')
      if (types.length > 0) {
        filteredList = filteredList.filter(item => types.includes(item.type))
      }
    }

    // 计算分页
    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const total = filteredList.length
    const start = (pageNum - 1) * limitNum
    const end = start + limitNum
    const items = filteredList.slice(start, end)

    return success({
      items,
      total,
      page: pageNum,
      limit: limitNum
    })
  },

  create(config) {
    const newData = config.body
    if (!newData.code || !newData.name) {
      return error('VALIDATION_ERROR', '路线代码和名称不能为空', 400)
    }
    if (dataCache.some(r => r.code === newData.code)) {
      return error('DUPLICATE_CODE', `路线代码 '${newData.code}' 已存在`, 409)
    }

    const newRouting = {
      ...newData,
      id: uuidv4(),
      // 确保 steps 数组中的每个步骤都包含 flowLogic 和 timeStandards 的默认结构
      steps: (newData.steps || []).map(step => ({
        ...step,
        flowLogic: step.flowLogic || { nextStep: 0, onSuccessStep: 0, onFailureStep: 0 },
        timeStandards: {
          setup: step.timeStandards?.setup || { type: 'Fixed', value: 0, unit: 'minute', matrixId: null },
          processing: step.timeStandards?.processing || { type: 'Fixed', value: 0, unit: '分钟/吨', formula: null }
        }
      })),
      changelog: [{ version: newData.version || '1.0', user: 'admin', timestamp: new Date().toISOString(), note: '初始创建' }],
      approvalHistory: [],
      createdBy: 'admin',
      createdAt: new Date().toISOString(),
      updatedBy: 'admin',
      updatedAt: new Date().toISOString()
    }

    dataCache.unshift(newRouting)
    return success(newRouting, '工艺路线创建成功', 201)
  },

  update(config) {
    const updateData = config.body
    const id = config.url.split('/').pop()

    const index = dataCache.findIndex(r => r.id === id)

    if (index === -1) {
      return error('NOT_FOUND', `ID为 '${id}' 的工艺路线未找到`, 404)
    }

    dataCache[index] = { 
      ...dataCache[index], 
      ...updateData,
      updatedBy: 'admin',
      updatedAt: new Date().toISOString()
    }

    return success(dataCache[index], '工艺路线更新成功')
  }
}

module.exports = [
  {
    url: `${BASE_PATH}`,
    type: 'get',
    response: config => handlers.getList(config)
  },
  {
    url: `${BASE_PATH}`,
    type: 'post',
    response: config => handlers.create(config)
  },
  {
    url: `${BASE_PATH}/:id`,
    type: 'put',
    response: config => handlers.update(config)
  }
] 