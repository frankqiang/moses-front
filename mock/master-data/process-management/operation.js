/**
 * 基础工序管理Mock API
 * 描述：模拟基础工序管理的后端API响应
 * 创建日期：2024-10-28
 */

const Mock = require('mockjs')
const { param2Obj } = require('../../utils')
const { data: operationData } = require('./data/operation')

let operationList = [...operationData]

/**
 * 获取基础工序列表
 */
function getOperationList(config) {
  const { 
    page = 1, 
    limit = 10, 
    keyword, 
    operation_type, 
    status 
  } = param2Obj(config.url)

  console.log('Mock API - 获取基础工序列表，参数:', { page, limit, keyword, operation_type, status })

  // 过滤数据
  let filteredData = operationList

  // 关键词搜索
  if (keyword) {
    const keywordLower = keyword.toLowerCase()
    filteredData = filteredData.filter(item => {
      return (
        (item.operation_code && item.operation_code.toLowerCase().includes(keywordLower)) ||
        (item.operation_name && item.operation_name.toLowerCase().includes(keywordLower)) ||
        (item.description && item.description.toLowerCase().includes(keywordLower))
      )
    })
  }

  // 工序类型筛选
  if (operation_type && operation_type !== '') {
    filteredData = filteredData.filter(item => item.operation_type === operation_type)
  }

  // 状态筛选
  if (status && status !== '') {
    filteredData = filteredData.filter(item => item.status === status)
  }

  // 分页
  const pageNum = parseInt(page)
  const pageSize = parseInt(limit)
  const startIndex = (pageNum - 1) * pageSize
  const endIndex = startIndex + pageSize
  const items = filteredData.slice(startIndex, endIndex)

  return {
    code: 20000,
    data: {
      items,
      total: filteredData.length,
      page: pageNum,
      limit: pageSize
    },
    message: '获取基础工序列表成功'
  }
}

/**
 * 获取基础工序详情
 */
function getOperationDetail(config) {
  const { id } = param2Obj(config.url)
  console.log('Mock API - 获取基础工序详情，ID:', id)

  const operation = operationList.find(item => item.id === parseInt(id))
  
  if (operation) {
    return {
      code: 20000,
      data: operation,
      message: '获取基础工序详情成功'
    }
  } else {
    return {
      code: 50000,
      data: null,
      message: '基础工序不存在'
    }
  }
}

/**
 * 创建基础工序
 */
function createOperation(config) {
  const requestData = JSON.parse(config.body)
  console.log('Mock API - 创建基础工序，数据:', requestData)

  // 验证工序代码是否已存在
  const existingOperation = operationList.find(item => 
    item.operation_code === requestData.operation_code
  )
  
  if (existingOperation) {
    return {
      code: 50001,
      data: null,
      message: '工序代码已存在，请使用其他代码'
    }
  }

  // 创建新工序
  const newOperation = {
    id: operationList.length > 0 ? Math.max(...operationList.map(item => item.id)) + 1 : 1,
    operation_code: requestData.operation_code,
    operation_name: requestData.operation_name,
    operation_type: requestData.operation_type,
    description: requestData.description || '',
    status: requestData.status || '启用',
    create_time: Mock.mock('@now("yyyy-MM-dd HH:mm:ss")'),
    update_time: Mock.mock('@now("yyyy-MM-dd HH:mm:ss")')
  }

  operationList.push(newOperation)

  return {
    code: 20000,
    data: newOperation,
    message: '创建基础工序成功'
  }
}

/**
 * 更新基础工序
 */
function updateOperation(config) {
  const { id } = param2Obj(config.url)
  const requestData = JSON.parse(config.body)
  console.log('Mock API - 更新基础工序，ID:', id, '数据:', requestData)

  const operationIndex = operationList.findIndex(item => item.id === parseInt(id))
  
  if (operationIndex === -1) {
    return {
      code: 50000,
      data: null,
      message: '基础工序不存在'
    }
  }

  // 如果修改了工序代码，检查是否与其他工序冲突
  if (requestData.operation_code !== operationList[operationIndex].operation_code) {
    const existingOperation = operationList.find(item => 
      item.operation_code === requestData.operation_code && item.id !== parseInt(id)
    )
    
    if (existingOperation) {
      return {
        code: 50001,
        data: null,
        message: '工序代码已存在，请使用其他代码'
      }
    }
  }

  // 更新工序信息
  const updatedOperation = {
    ...operationList[operationIndex],
    operation_code: requestData.operation_code,
    operation_name: requestData.operation_name,
    operation_type: requestData.operation_type,
    description: requestData.description || '',
    status: requestData.status,
    update_time: Mock.mock('@now("yyyy-MM-dd HH:mm:ss")')
  }

  operationList[operationIndex] = updatedOperation

  return {
    code: 20000,
    data: updatedOperation,
    message: '更新基础工序成功'
  }
}

/**
 * 更新工序状态（启用/禁用）
 */
function updateOperationStatus(config) {
  const { id } = param2Obj(config.url)
  const requestData = JSON.parse(config.body)
  console.log('Mock API - 更新工序状态，ID:', id, '状态:', requestData.status)

  const operationIndex = operationList.findIndex(item => item.id === parseInt(id))
  
  if (operationIndex === -1) {
    return {
      code: 50000,
      data: null,
      message: '基础工序不存在'
    }
  }

  // 更新状态
  operationList[operationIndex].status = requestData.status
  operationList[operationIndex].update_time = Mock.mock('@now("yyyy-MM-dd HH:mm:ss")')

  return {
    code: 20000,
    data: operationList[operationIndex],
    message: `${requestData.status === '启用' ? '启用' : '禁用'}工序成功`
  }
}

/**
 * 删除基础工序
 */
function deleteOperation(config) {
  const { id } = param2Obj(config.url)
  console.log('Mock API - 删除基础工序，ID:', id)

  const operationIndex = operationList.findIndex(item => item.id === parseInt(id))
  
  if (operationIndex === -1) {
    return {
      code: 50000,
      data: null,
      message: '基础工序不存在'
    }
  }

  // 检查工序是否被工艺路线使用（这里简化处理，实际应该检查关联关系）
  // const isInUse = checkOperationInUse(operationList[operationIndex].operation_code)
  // if (isInUse) {
  //   return {
  //     code: 50002,
  //     data: null,
  //     message: '该工序正在被工艺路线使用，无法删除'
  //   }
  // }

  operationList.splice(operationIndex, 1)

  return {
    code: 20000,
    data: null,
    message: '删除基础工序成功'
  }
}

/**
 * 批量删除基础工序
 */
function batchDeleteOperation(config) {
  const requestData = JSON.parse(config.body)
  const { ids } = requestData
  console.log('Mock API - 批量删除基础工序，IDs:', ids)

  const deletedIds = []
  const failedIds = []

  ids.forEach(id => {
    const operationIndex = operationList.findIndex(item => item.id === parseInt(id))
    if (operationIndex !== -1) {
      operationList.splice(operationIndex, 1)
      deletedIds.push(id)
    } else {
      failedIds.push(id)
    }
  })

  return {
    code: 20000,
    data: {
      success_count: deletedIds.length,
      failed_count: failedIds.length,
      deleted_ids: deletedIds,
      failed_ids: failedIds
    },
    message: `批量删除完成，成功${deletedIds.length}个，失败${failedIds.length}个`
  }
}

/**
 * 获取所有启用的工序（供工艺路线使用）
 */
function getEnabledOperations(config) {
  console.log('Mock API - 获取启用的工序列表')

  const enabledOperations = operationList
    .filter(item => item.status === '启用')
    .map(item => ({
      operation_code: item.operation_code,
      operation_name: item.operation_name,
      operation_type: item.operation_type,
      description: item.description
    }))

  return {
    code: 20000,
    data: enabledOperations,
    message: '获取启用工序列表成功'
  }
}

module.exports = {
  getOperationList,
  getOperationDetail,
  createOperation,
  updateOperation,
  updateOperationStatus,
  deleteOperation,
  batchDeleteOperation,
  getEnabledOperations
} 