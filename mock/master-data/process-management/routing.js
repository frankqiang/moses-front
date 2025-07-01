/**
 * 工艺路线管理Mock API
 * 描述：模拟工艺路线管理的后端API响应
 * 创建日期：2024-10-28
 */

const Mock = require('mockjs')
const { param2Obj } = require('../../utils')
const { routingData, stepsData } = require('./data/routing')

let routingList = [...routingData]
let stepsDatabase = { ...stepsData }

/**
 * 获取工艺路线列表
 */
function getRoutingList(config) {
  const { 
    page = 1, 
    limit = 10, 
    keyword, 
    status, 
    routing_code 
  } = param2Obj(config.url)

  console.log('Mock API - 获取工艺路线列表，参数:', { page, limit, keyword, status, routing_code })

  // 过滤数据
  let filteredData = routingList

  // 关键词搜索
  if (keyword) {
    const keywordLower = keyword.toLowerCase()
    filteredData = filteredData.filter(item => {
      return (
        (item.routing_code && item.routing_code.toLowerCase().includes(keywordLower)) ||
        (item.routing_name && item.routing_name.toLowerCase().includes(keywordLower)) ||
        (item.description && item.description.toLowerCase().includes(keywordLower))
      )
    })
  }

  // 路线代码筛选
  if (routing_code && routing_code !== '') {
    filteredData = filteredData.filter(item => item.routing_code === routing_code)
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
    message: '获取工艺路线列表成功'
  }
}

/**
 * 获取工艺路线详情
 */
function getRoutingDetail(config) {
  const { id } = param2Obj(config.url)
  console.log('Mock API - 获取工艺路线详情，ID:', id)

  const routing = routingList.find(item => item.id === parseInt(id))
  
  if (routing) {
    return {
      code: 20000,
      data: routing,
      message: '获取工艺路线详情成功'
    }
  } else {
    return {
      code: 50000,
      data: null,
      message: '工艺路线不存在'
    }
  }
}

/**
 * 创建工艺路线
 */
function createRouting(config) {
  const requestData = JSON.parse(config.body)
  console.log('Mock API - 创建工艺路线，数据:', requestData)

  // 验证路线代码+版本是否已存在
  const existingRouting = routingList.find(item => 
    item.routing_code === requestData.routing_code && 
    item.version === requestData.version
  )
  
  if (existingRouting) {
    return {
      code: 50001,
      data: null,
      message: '该路线代码的此版本号已存在，请使用其他版本号'
    }
  }

  // 创建新路线
  const newRouting = {
    id: routingList.length > 0 ? Math.max(...routingList.map(item => item.id)) + 1 : 1,
    routing_code: requestData.routing_code,
    routing_name: requestData.routing_name,
    version: requestData.version,
    status: requestData.status || '草稿',
    applicable_products: requestData.applicable_products || [],
    description: requestData.description || '',
    create_time: Mock.mock('@now("yyyy-MM-dd HH:mm:ss")'),
    update_time: Mock.mock('@now("yyyy-MM-dd HH:mm:ss")'),
    create_user: '系统用户',
    update_user: '系统用户'
  }

  routingList.push(newRouting)

  return {
    code: 20000,
    data: newRouting,
    message: '创建工艺路线成功'
  }
}

/**
 * 更新工艺路线
 */
function updateRouting(config) {
  const { id } = param2Obj(config.url)
  const requestData = JSON.parse(config.body)
  console.log('Mock API - 更新工艺路线，ID:', id, '数据:', requestData)

  const routingIndex = routingList.findIndex(item => item.id === parseInt(id))
  
  if (routingIndex === -1) {
    return {
      code: 50000,
      data: null,
      message: '工艺路线不存在'
    }
  }

  const currentRouting = routingList[routingIndex]

  // 如果是生效状态的路线，需要创建新版本而不是直接修改
  if (currentRouting.status === '生效') {
    // 生成新版本号（简化处理：在原版本基础上增加0.1）
    const currentVersionNumber = parseFloat(currentRouting.version.replace('v', ''))
    const newVersionNumber = (currentVersionNumber + 0.1).toFixed(1)
    const newVersion = `v${newVersionNumber}`

    // 创建新版本
    const newVersionRouting = {
      id: routingList.length > 0 ? Math.max(...routingList.map(item => item.id)) + 1 : 1,
      routing_code: currentRouting.routing_code,
      routing_name: requestData.routing_name,
      version: newVersion,
      status: '草稿',
      applicable_products: requestData.applicable_products || [],
      description: requestData.description || '',
      create_time: Mock.mock('@now("yyyy-MM-dd HH:mm:ss")'),
      update_time: Mock.mock('@now("yyyy-MM-dd HH:mm:ss")'),
      create_user: currentRouting.create_user,
      update_user: '系统用户'
    }

    routingList.push(newVersionRouting)

    return {
      code: 20000,
      data: newVersionRouting,
      message: '生效路线已自动创建新版本进行编辑'
    }
  }

  // 非生效状态可以直接修改
  // 如果修改了路线代码或版本，检查是否与其他路线冲突
  if ((requestData.routing_code !== currentRouting.routing_code || 
       requestData.version !== currentRouting.version)) {
    const existingRouting = routingList.find(item => 
      item.routing_code === requestData.routing_code && 
      item.version === requestData.version &&
      item.id !== parseInt(id)
    )
    
    if (existingRouting) {
      return {
        code: 50001,
        data: null,
        message: '该路线代码的此版本号已存在，请使用其他版本号'
      }
    }
  }

  // 更新路线信息
  const updatedRouting = {
    ...currentRouting,
    routing_code: requestData.routing_code,
    routing_name: requestData.routing_name,
    version: requestData.version,
    status: requestData.status,
    applicable_products: requestData.applicable_products || [],
    description: requestData.description || '',
    update_time: Mock.mock('@now("yyyy-MM-dd HH:mm:ss")'),
    update_user: '系统用户'
  }

  routingList[routingIndex] = updatedRouting

  return {
    code: 20000,
    data: updatedRouting,
    message: '更新工艺路线成功'
  }
}

/**
 * 删除工艺路线
 */
function deleteRouting(config) {
  const { id } = param2Obj(config.url)
  console.log('Mock API - 删除工艺路线，ID:', id)

  const routingIndex = routingList.findIndex(item => item.id === parseInt(id))
  
  if (routingIndex === -1) {
    return {
      code: 50000,
      data: null,
      message: '工艺路线不存在'
    }
  }

  const routing = routingList[routingIndex]

  // 检查是否为生效状态（生效状态不能删除）
  if (routing.status === '生效') {
    return {
      code: 50002,
      data: null,
      message: '生效状态的工艺路线不能删除，请先更改状态'
    }
  }

  // 删除对应的步骤数据
  const stepsKey = `${routing.routing_code}_${routing.version}`
  if (stepsDatabase[stepsKey]) {
    delete stepsDatabase[stepsKey]
  }

  routingList.splice(routingIndex, 1)

  return {
    code: 20000,
    data: null,
    message: '删除工艺路线成功'
  }
}

/**
 * 更新工艺路线状态
 */
function updateRoutingStatus(config) {
  const { id } = param2Obj(config.url)
  const requestData = JSON.parse(config.body)
  console.log('Mock API - 更新路线状态，ID:', id, '状态:', requestData.status)

  const routingIndex = routingList.findIndex(item => item.id === parseInt(id))
  
  if (routingIndex === -1) {
    return {
      code: 50000,
      data: null,
      message: '工艺路线不存在'
    }
  }

  const routing = routingList[routingIndex]

  // 如果要设置为生效状态，需要检查同路线代码是否已有生效版本
  if (requestData.status === '生效') {
    const existingActiveRouting = routingList.find(item => 
      item.routing_code === routing.routing_code && 
      item.status === '生效' &&
      item.id !== parseInt(id)
    )
    
    if (existingActiveRouting) {
      return {
        code: 50003,
        data: null,
        message: `路线代码${routing.routing_code}已有生效版本${existingActiveRouting.version}，请先将其设为历史状态`
      }
    }
  }

  // 更新状态
  routingList[routingIndex].status = requestData.status
  routingList[routingIndex].update_time = Mock.mock('@now("yyyy-MM-dd HH:mm:ss")')
  routingList[routingIndex].update_user = '系统用户'

  return {
    code: 20000,
    data: routingList[routingIndex],
    message: `工艺路线状态已更新为${requestData.status}`
  }
}

/**
 * 获取工艺路线步骤
 */
function getRoutingSteps(config) {
  const { routing_code, version } = param2Obj(config.url)
  console.log('Mock API - 获取工艺路线步骤，路线代码:', routing_code, '版本:', version)

  const stepsKey = `${routing_code}_${version}`
  const steps = stepsDatabase[stepsKey] || []

  return {
    code: 20000,
    data: steps.sort((a, b) => a.step_number - b.step_number),
    message: '获取工艺路线步骤成功'
  }
}

/**
 * 更新工艺路线步骤
 */
function updateRoutingSteps(config) {
  const requestData = JSON.parse(config.body)
  const { routing_code, version, steps } = requestData
  console.log('Mock API - 更新工艺路线步骤，路线代码:', routing_code, '版本:', version, '步骤数:', steps.length)

  // 验证步骤数据的完整性
  const stepNumbers = steps.map(step => step.step_number)
  const uniqueStepNumbers = [...new Set(stepNumbers)]
  
  if (stepNumbers.length !== uniqueStepNumbers.length) {
    return {
      code: 50004,
      data: null,
      message: '步骤号不能重复'
    }
  }

  // 验证步骤引用的有效性
  for (const step of steps) {
    if (step.next_step_number && !stepNumbers.includes(step.next_step_number)) {
      return {
        code: 50005,
        data: null,
        message: `步骤${step.step_number}的下一步骤号${step.next_step_number}不存在`
      }
    }
    if (step.on_failure_step_number && !stepNumbers.includes(step.on_failure_step_number)) {
      return {
        code: 50005,
        data: null,
        message: `步骤${step.step_number}的异常跳转步骤号${step.on_failure_step_number}不存在`
      }
    }
  }

  // 更新步骤数据
  const stepsKey = `${routing_code}_${version}`
  const updatedSteps = steps.map((step, index) => ({
    id: step.id || (Date.now() + index), // 新步骤生成临时ID
    routing_id: step.routing_id,
    step_number: step.step_number,
    operation_code: step.operation_code,
    operation_name: step.operation_name,
    next_step_number: step.next_step_number,
    on_failure_step_number: step.on_failure_step_number,
    description: step.description || '',
    create_time: step.create_time || Mock.mock('@now("yyyy-MM-dd HH:mm:ss")'),
    update_time: Mock.mock('@now("yyyy-MM-dd HH:mm:ss")')
  }))

  stepsDatabase[stepsKey] = updatedSteps

  return {
    code: 20000,
    data: updatedSteps.sort((a, b) => a.step_number - b.step_number),
    message: '更新工艺路线步骤成功'
  }
}

module.exports = {
  getRoutingList,
  getRoutingDetail,
  createRouting,
  updateRouting,
  deleteRouting,
  updateRoutingStatus,
  getRoutingSteps,
  updateRoutingSteps
} 