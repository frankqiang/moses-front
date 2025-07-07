/**
 * 工序管理模块Mock API处理函数
 */
const { data: operationsData } = require('./data/operations')
const Mock = require('mockjs')

// 引入响应工具函数
// 由于我们没有看到mock/utils/response.js的具体实现，这里假设它提供了success和error函数
// 如果实际项目中没有这些函数，需要自行实现
const success = (data, message = '操作成功', status = 200) => ({
  success: true,
  data,
  message,
  timestamp: new Date().toISOString(),
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

// 数据缓存和状态管理
let dataCache = [...operationsData]
let idCounter = Math.max(...dataCache.map(item => parseInt(item.id.replace('op-', '')))) + 1

// 业务状态转换规则
const statusRules = {
  'Enabled': ['Disabled'],
  'Disabled': ['Enabled']
}

/**
 * API处理函数集合
 */
const handlers = {
  getList(config) {
    const { page = 1, limit = 10, keyword = '', type = '', status = '' } = config.query

    // 过滤数据
    let filteredList = [...dataCache]
    
    // 关键词搜索
    if (keyword) {
      const lowercaseKeyword = keyword.toLowerCase()
      filteredList = filteredList.filter(item => 
        item.code.toLowerCase().includes(lowercaseKeyword) || 
        item.name.toLowerCase().includes(lowercaseKeyword)
      )
    }
    
    // 类型筛选
    if (type) {
      let types
      if (Array.isArray(type)) {
        types = type
      } else if (typeof type === 'string') {
        types = type.split(',')
      } else {
        types = [type]
      }
      filteredList = filteredList.filter(item => types.includes(item.type))
    }
    
    // 状态筛选
    if (status) {
      let statuses
      if (Array.isArray(status)) {
        statuses = status
      } else if (typeof status === 'string') {
        statuses = status.split(',')
      } else {
        statuses = [status]
      }
      filteredList = filteredList.filter(item => statuses.includes(item.status))
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

  getDetail(config) {
    const { id } = config.params
    const operation = dataCache.find(item => item.id === id)
    
    if (!operation) {
      return error('OPERATION_NOT_FOUND', `未找到ID为${id}的工序`, 404)
    }
    
    return success(operation)
  },

  create(config) {
    const { body } = config
    
    // 验证必填字段
    if (!body.code || !body.name || !body.type) {
      return error('VALIDATION_ERROR', '工序代码、名称和类型为必填项', 400)
    }
    
    // 检查代码唯一性
    const codeExists = dataCache.some(item => item.code === body.code)
    if (codeExists) {
      return error('CODE_EXISTS', `工序代码 ${body.code} 已存在`, 400)
    }
    
    // 创建新工序
    const newOperation = {
      id: `op-${String(idCounter++).padStart(3, '0')}`,
      code: body.code,
      name: body.name,
      type: body.type,
      description: body.description || '',
      reportingPoint: body.reportingPoint || 'End Only',
      associatedResourceType: body.associatedResourceType || [],
      status: body.status || 'Enabled',
      createdBy: 'admin',
      createdAt: new Date().toISOString(),
      updatedBy: 'admin',
      updatedAt: new Date().toISOString()
    }
    
    dataCache.push(newOperation)
    
    return success(newOperation, '工序创建成功', 201)
  },

  update(config) {
    const { body } = config
    const id = config.url.split('/').pop()
    

    
    // 验证必填字段
    if (!body.name || !body.type) {
      return error('VALIDATION_ERROR', '工序名称和类型为必填项', 400)
    }
    
    // 查找工序
    const index = dataCache.findIndex(item => item.id === id)
    if (index === -1) {
      return error('OPERATION_NOT_FOUND', `未找到ID为${id}的工序`, 404)
    }
    
    // 更新工序 - 保留创建信息，更新业务字段
    const updatedOperation = {
      ...dataCache[index],  // 保留原有数据
      // 更新所有业务字段
      code: body.code,
      name: body.name,
      type: body.type,
      description: body.description,
      reportingPoint: body.reportingPoint,
      associatedResourceType: body.associatedResourceType,
      status: body.status,
      // 更新时间信息
      updatedBy: 'admin',
      updatedAt: new Date().toISOString()
    }
    
    dataCache[index] = updatedOperation
    
    return success(updatedOperation, '工序更新成功')
  },

  updateStatus(config) {
    const { body } = config
    const id = config.url.split('/').slice(-2)[0]
    const { status } = body
    
    // 验证必填字段
    if (!status) {
      return error('VALIDATION_ERROR', '状态为必填项', 400)
    }
    
    // 查找工序
    const index = dataCache.findIndex(item => item.id === id)
    if (index === -1) {
      return error('OPERATION_NOT_FOUND', `未找到ID为${id}的工序`, 404)
    }
    
    // 验证状态转换
    const currentStatus = dataCache[index].status
    const allowedStatuses = statusRules[currentStatus] || []
    if (!allowedStatuses.includes(status)) {
      return error('INVALID_STATUS_TRANSITION', `不允许从 ${currentStatus} 转换为 ${status}`, 400)
    }
    
    // 更新状态
    dataCache[index].status = status
    dataCache[index].updatedBy = 'admin'
    dataCache[index].updatedAt = new Date().toISOString()
    
    return success(dataCache[index], `工序状态已更新为 ${status}`)
  },

  delete(config) {
    const id = config.url.split('/').pop()
    
    // 查找工序
    const index = dataCache.findIndex(item => item.id === id)
    if (index === -1) {
      return error('OPERATION_NOT_FOUND', `未找到ID为${id}的工序`, 404)
    }
    
    // 模拟检查工序是否被工艺路线使用
    // 这里假设有一个工艺路线使用了ID为op-001和op-002的工序
    const usedOperations = ['op-001', 'op-002']
    if (usedOperations.includes(id)) {
      return error('OPERATION_IN_USE', `该工序正在工艺路线中使用，无法删除`, 400)
    }
    
    // 删除工序
    dataCache.splice(index, 1)
    
    return success(null, '工序删除成功', 204)
  },

  batchUpdateStatus(config) {
    const { body } = config
    const { ids, status } = body
    
    // 验证必填字段
    if (!ids || !ids.length || !status) {
      return error('VALIDATION_ERROR', 'ID列表和状态为必填项', 400)
    }
    
    // 更新状态
    const updatedIds = []
    const failedIds = []
    
    ids.forEach(id => {
      const index = dataCache.findIndex(item => item.id === id)
      if (index !== -1) {
        dataCache[index].status = status
        dataCache[index].updatedBy = 'admin'
        dataCache[index].updatedAt = new Date().toISOString()
        updatedIds.push(id)
      } else {
        failedIds.push(id)
      }
    })
    
    return success({
      updatedIds,
      failedIds,
      totalUpdated: updatedIds.length,
      totalFailed: failedIds.length
    }, `已成功更新${updatedIds.length}条记录的状态`)
  },

  batchDelete(config) {
    const { body } = config
    const { ids } = body
    
    // 验证必填字段
    if (!ids || !ids.length) {
      return error('VALIDATION_ERROR', 'ID列表为必填项', 400)
    }
    
    // 检查是否有不可删除的工序
    const usedOperations = ['op-001', 'op-002']
    const cannotDeleteIds = ids.filter(id => usedOperations.includes(id))
    
    if (cannotDeleteIds.length > 0) {
      return error('OPERATIONS_IN_USE', `有${cannotDeleteIds.length}个工序正在使用中，无法删除`, 400, {
        cannotDeleteIds
      })
    }
    
    // 删除工序
    const deletedIds = []
    const notFoundIds = []
    
    ids.forEach(id => {
      const index = dataCache.findIndex(item => item.id === id)
      if (index !== -1) {
        dataCache.splice(index, 1)
        deletedIds.push(id)
      } else {
        notFoundIds.push(id)
      }
    })
    
    return success({
      deletedIds,
      notFoundIds,
      totalDeleted: deletedIds.length,
      totalNotFound: notFoundIds.length
    }, `已成功删除${deletedIds.length}条记录`)
  },

  export(config) {
    // 模拟导出功能，实际上应该返回一个文件流
    return {
      type: 'application/vnd.ms-excel',
      data: Buffer.from('模拟的Excel数据'),
      filename: '工序列表.xlsx'
    }
  },

  import(config) {
    // 模拟导入功能
    return success({
      totalImported: 5,
      totalFailed: 1,
      failedRows: [
        { rowIndex: 3, reason: '工序代码已存在' }
      ]
    }, '导入成功，共导入5条记录，1条失败')
  },

  downloadTemplate(config) {
    // 模拟下载模板功能，实际上应该返回一个文件流
    return {
      type: 'application/vnd.ms-excel',
      data: Buffer.from('模拟的Excel模板数据'),
      filename: '工序导入模板.xlsx'
    }
  },

  checkCode(config) {
    const { code, excludeId } = config.query
    
    if (!code) {
      return error('VALIDATION_ERROR', '工序代码不能为空', 400)
    }
    
    // 检查代码是否已存在
    const exists = dataCache.some(item => 
      item.code === code && (!excludeId || item.id !== excludeId)
    )
    
    return success({ exists }, '检查完成')
  }
}

/**
 * 导出Mock路由配置
 */
module.exports = [
  // 获取工序列表
  { url: '/mes/v1/master-data/process-management/operations', type: 'get', response: handlers.getList },
  
  // 获取工序详情
  { url: '/mes/v1/master-data/process-management/operations/[^/]+$', type: 'get', response: handlers.getDetail },
  
  // 创建工序
  { url: '/mes/v1/master-data/process-management/operations', type: 'post', response: handlers.create },
  
  // 更新工序
  { url: '/mes/v1/master-data/process-management/operations/[^/]+$', type: 'put', response: handlers.update },
  
  // 更新工序状态
  { url: '/mes/v1/master-data/process-management/operations/[^/]+/status$', type: 'put', response: handlers.updateStatus },
  
  // 删除工序
  { url: '/mes/v1/master-data/process-management/operations/[^/]+$', type: 'delete', response: handlers.delete },
  
  // 批量更新状态
  { url: '/mes/v1/master-data/process-management/operations/batch/status', type: 'put', response: handlers.batchUpdateStatus },
  
  // 批量删除
  { url: '/mes/v1/master-data/process-management/operations/batch', type: 'delete', response: handlers.batchDelete },
  
  // 导出
  { url: '/mes/v1/master-data/process-management/operations/export', type: 'post', response: handlers.export },
  
  // 导入
  { url: '/mes/v1/master-data/process-management/operations/import', type: 'post', response: handlers.import },
  
  // 下载模板
  { url: '/mes/v1/master-data/process-management/operations/download-template', type: 'get', response: handlers.downloadTemplate },
  
  // 检查工序代码是否存在
  { url: '/mes/v1/master-data/process-management/operations/check-code', type: 'get', response: handlers.checkCode }
] 