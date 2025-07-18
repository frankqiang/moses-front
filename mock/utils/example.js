/**
 * Mock API 响应工具使用示例
 * 
 * 本文件展示了如何正确使用统一的响应工具函数
 * 可以作为新建mock文件的模板参考
 */

// 引入统一的响应工具函数
const { success, error, errors, paginated, batch, param2Obj } = require('./index')

// 模拟数据
let mockData = [
  { id: 1, name: '示例项目1', status: 'active', code: 'DEMO001' },
  { id: 2, name: '示例项目2', status: 'inactive', code: 'DEMO002' },
  { id: 3, name: '示例项目3', status: 'active', code: 'DEMO003' }
]

/**
 * API处理函数示例
 */
const handlers = {
  // 1. 列表查询 - 使用分页响应
  getList(config) {
    const { page = 1, limit = 10, keyword = '', status = '' } = config.query
    
    let filteredData = [...mockData]
    
    // 关键词搜索
    if (keyword) {
      filteredData = filteredData.filter(item => 
        item.name.includes(keyword) || item.code.includes(keyword)
      )
    }
    
    // 状态筛选
    if (status) {
      filteredData = filteredData.filter(item => item.status === status)
    }
    
    // 分页处理
    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const total = filteredData.length
    const start = (pageNum - 1) * limitNum
    const items = filteredData.slice(start, start + limitNum)
    
    // ✅ 使用分页响应函数
    return paginated(items, total, pageNum, limitNum, '获取列表成功')
  },
  
  // 2. 详情查询 - 基本成功/错误响应
  getDetail(config) {
    const { id } = config.params
    const item = mockData.find(item => item.id === parseInt(id))
    
    if (!item) {
      // ✅ 使用预定义错误函数
      return errors.notFound('项目', id)
    }
    
    // ✅ 使用成功响应函数
    return success(item, '获取详情成功')
  },
  
  // 3. 创建 - 带验证的创建响应
  create(config) {
    const { body } = config
    
    // 参数验证
    if (!body.name || !body.code) {
      // ✅ 使用预定义验证错误
      return errors.validation('名称和代码为必填项')
    }
    
    // 唯一性检查
    const codeExists = mockData.some(item => item.code === body.code)
    if (codeExists) {
      // ✅ 使用预定义重复错误
      return errors.duplicate('项目代码', body.code)
    }
    
    // 创建新项目
    const newItem = {
      id: Math.max(...mockData.map(item => item.id)) + 1,
      ...body,
      status: body.status || 'active',
      createdAt: new Date().toISOString()
    }
    
    mockData.push(newItem)
    
    // ✅ 使用创建成功响应（201状态码）
    return success(newItem, '创建成功', 201)
  },
  
  // 4. 更新 - 标准更新响应
  update(config) {
    const { body } = config
    const id = parseInt(config.url.split('/').pop())
    
    const index = mockData.findIndex(item => item.id === id)
    if (index === -1) {
      return errors.notFound('项目', id)
    }
    
    // 如果更新代码，检查唯一性
    if (body.code && body.code !== mockData[index].code) {
      const codeExists = mockData.some(item => item.code === body.code && item.id !== id)
      if (codeExists) {
        return errors.duplicate('项目代码', body.code)
      }
    }
    
    // 更新数据
    mockData[index] = {
      ...mockData[index],
      ...body,
      updatedAt: new Date().toISOString()
    }
    
    return success(mockData[index], '更新成功')
  },
  
  // 5. 删除 - 带业务规则检查的删除
  delete(config) {
    const id = parseInt(config.url.split('/').pop())
    
    const index = mockData.findIndex(item => item.id === id)
    if (index === -1) {
      return errors.notFound('项目', id)
    }
    
    // 业务规则检查：激活状态的项目不能删除
    if (mockData[index].status === 'active') {
      // ✅ 使用预定义的使用中错误
      return errors.inUse('激活状态的项目')
    }
    
    mockData.splice(index, 1)
    
    // ✅ 删除成功使用204状态码
    return success(null, '删除成功', 204)
  },
  
  // 6. 批量删除 - 批量操作响应
  batchDelete(config) {
    const { ids } = config.body
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return errors.validation('请选择要删除的项目')
    }
    
    const successIds = []
    const failedIds = []
    
    ids.forEach(id => {
      const index = mockData.findIndex(item => item.id === parseInt(id))
      if (index === -1) {
        failedIds.push(id)
      } else if (mockData[index].status === 'active') {
        failedIds.push(id) // 激活状态不能删除
      } else {
        mockData.splice(index, 1)
        successIds.push(id)
      }
    })
    
    // ✅ 使用批量操作响应函数
    return batch(successIds, failedIds, '删除')
  },
  
  // 7. 状态更新 - 简单更新响应
  updateStatus(config) {
    const { body } = config
    const id = parseInt(config.url.split('/').slice(-2)[0])
    const { status } = body
    
    if (!status) {
      return errors.validation('状态不能为空')
    }
    
    const index = mockData.findIndex(item => item.id === id)
    if (index === -1) {
      return errors.notFound('项目', id)
    }
    
    mockData[index].status = status
    mockData[index].updatedAt = new Date().toISOString()
    
    return success(mockData[index], `状态已更新为${status}`)
  },
  
  // 8. 代码唯一性检查 - 特殊业务响应
  checkCode(config) {
    const { code, excludeId } = config.query
    
    if (!code) {
      return errors.validation('代码不能为空')
    }
    
    const exists = mockData.some(item => 
      item.code === code && (!excludeId || item.id !== parseInt(excludeId))
    )
    
    return success({ exists: !exists }, exists ? '代码已存在' : '代码可用')
  },
  
  // 9. 自定义错误示例
  customOperation(config) {
    // 模拟特殊业务错误
    const shouldFail = Math.random() > 0.5
    
    if (shouldFail) {
      // ✅ 使用自定义错误（当预定义错误不适用时）
      return error('BUSINESS_RULE_VIOLATION', '违反业务规则：不能在周末执行此操作', 400, {
        allowedDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        currentDay: new Date().toLocaleDateString('en-US', { weekday: 'long' })
      })
    }
    
    return success({ result: 'success' }, '操作成功')
  }
}

/**
 * 路由配置示例
 */
const BASE_PATH = '/api/v1/examples'

module.exports = [
  // 列表查询
  { url: `${BASE_PATH}$`, type: 'get', response: handlers.getList },
  
  // 创建
  { url: `${BASE_PATH}$`, type: 'post', response: handlers.create },
  
  // 代码检查
  { url: `${BASE_PATH}/check-code$`, type: 'get', response: handlers.checkCode },
  
  // 批量删除
  { url: `${BASE_PATH}/batch$`, type: 'delete', response: handlers.batchDelete },
  
  // 状态更新
  { url: `${BASE_PATH}/(?!batch|check-code)[0-9]+/status$`, type: 'put', response: handlers.updateStatus },
  
  // 详情、更新、删除
  { url: `${BASE_PATH}/(?!batch|check-code)[0-9]+$`, type: 'get', response: handlers.getDetail },
  { url: `${BASE_PATH}/(?!batch|check-code)[0-9]+$`, type: 'put', response: handlers.update },
  { url: `${BASE_PATH}/(?!batch|check-code)[0-9]+$`, type: 'delete', response: handlers.delete },
  
  // 自定义操作
  { url: `${BASE_PATH}/custom-operation$`, type: 'post', response: handlers.customOperation }
]