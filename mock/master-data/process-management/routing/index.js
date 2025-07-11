const { data: routingsData } = require('../data/routings.js')

const success = (data, message = '操作成功') => ({
  code: 20000,
  success: true,
  data,
  message,
  timestamp: new Date().getTime()
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

const handlers = {
  getList(config) {
    const { page = 1, limit = 10, keyword = '', status = '' } = config.query
    
    let filteredList = [...routingsData]

    // 关键词搜索
    if (keyword) {
      const lowercaseKeyword = keyword.toLowerCase()
      filteredList = filteredList.filter(item =>
        item.code.toLowerCase().includes(lowercaseKeyword) ||
        item.name.toLowerCase().includes(lowercaseKeyword) ||
        item.applicableProducts.some(p => p.toLowerCase().includes(lowercaseKeyword))
      )
    }

    // 状态筛选
    if (status) {
      const statuses = Array.isArray(status) ? status : status.split(',')
      if (statuses.length > 0) {
        filteredList = filteredList.filter(item => statuses.includes(item.status))
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
  }
}

module.exports = [
  {
    url: '/mes/process-management/routings',
    type: 'get',
    response: config => handlers.getList(config)
  }
] 