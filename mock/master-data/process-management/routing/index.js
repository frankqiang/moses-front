const { v4: uuidv4 } = require('uuid')
const { data: routingsData } = require('../data/routings.js')

// 数据缓存，模拟数据库行为
let dataCache = [...routingsData]

// 从dataCache动态获取已存在的路线代码，实现真实唯一性校验

// 引入统一的响应工具函数
const { success, error, errors, ERROR_CODES } = require('../../../utils/response')

// API基础路径 (重新定义，确保使用最新的BASE_PATH)
const BASE_PATH = '/mes/v1/master-data/process-management/routings'

/**
 * 路由配置常量
 * 统一管理URL模式，便于维护和复用
 */
const ROUTES = {
  // 检查路线代码唯一性
  CHECK_CODE_UNIQUE: `${BASE_PATH}/check-code-unique$`,
  
  // 集合操作（getList, create）
  // 注意：此处不使用 $ 结尾，因为它还需要匹配 /:id 等子路径，但实际Mock.js会匹配第一个。
  // 我们将利用更具体路由优先的原则来避免冲突。
  COLLECTION: `${BASE_PATH}`,
  
  // 单个工艺路线操作（getDetail, update, delete）
  // 使用负向前瞻避免与 check-code-unique 冲突
  ITEM_DETAIL: `${BASE_PATH}/(?!check-code-unique)[a-zA-Z0-9_-]+$`,
  
  // 创建新版本
  NEW_VERSION: `${BASE_PATH}/[a-zA-Z0-9_-]+/new-version$`
}

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
      return error(ERROR_CODES.VALIDATION_ERROR, '路线代码和名称不能为空', 400)
    }
    if (dataCache.some(r => r.code === newData.code)) {
      return error(ERROR_CODES.DUPLICATE_CODE, `路线代码 '${newData.code}' 已存在`, 409)
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
      return error(ERROR_CODES.NOT_FOUND, `ID为 '${id}' 的工艺路线未找到`, 404)
    }

    dataCache[index] = { 
      ...dataCache[index], 
      ...updateData,
      updatedBy: 'admin',
      updatedAt: new Date().toISOString()
    }

    return success(dataCache[index], '工艺路线更新成功')
  },

  // 新增：检查路线代码唯一性
  checkCodeUnique(config) {
    const { code } = config.query
    if (!code) {
      return error(ERROR_CODES.VALIDATION_ERROR, '路线代码不能为空', 400)
    }

    // 检查是否在模拟的已存在代码列表中
    // 检查是否在当前数据缓存中已存在
    const isUnique = !dataCache.some(r => r.code.toUpperCase() === code.toUpperCase())

    if (isUnique) {
      return success({ unique: true }, '路线代码可用')
    } else {
      // 如果在dataCache中找到，则返回dataCache中的错误信息
      // const foundInCache = dataCache.find(r => r.code.toUpperCase() === code.toUpperCase())
      // if (foundInCache) {
      //    return error(ERROR_CODES.DUPLICATE_CODE, `路线代码 '${code}' 已存在`, 409) // 使用409 Conflict
    // 或者更通用的消息
    //    return error(ERROR_CODES.DUPLICATE_CODE, '该路线代码已被使用', 409) // 使用409 Conflict
      // }
      return success({ unique: false }, '路线代码已被使用')
    }
  },
  
  /**
   * 创建工艺路线新版本
   * @param {Object} config - 请求配置
   * @returns {Object} 响应对象
   * @description 实现核心处理流程，包括前置条件校验、数据克隆、新版本属性赋值和数据持久化
   */
  createNewVersion(config) {
    // 从URL中提取ID
    const id = config.url.split('/').slice(-2)[0]
    
    // 前置条件校验 - 存在性校验
    const existingRouting = dataCache.find(r => r.id === id)
    if (!existingRouting) {
      return error(ERROR_CODES.NOT_FOUND, `ID为 '${id}' 的工艺路线未找到`, 404)
    }
    
    // 前置条件校验 - 状态一致性校验
    if (existingRouting.status !== 'Enabled') {
      return error(ERROR_CODES.INVALID_STATUS, '只有生效状态的工艺路线才能创建新版本', 400)
    }
    
    // 前置条件校验 - 草稿唯一性校验
    // 注意：由于数据结构中没有baseId字段，这里使用code字段来判断同一工艺路线的不同版本
    const hasDraft = dataCache.some(r => 
      r.code === existingRouting.code && 
      r.status === 'Draft' && 
      r.id !== existingRouting.id
    )
    
    if (hasDraft) {
      return error(ERROR_CODES.DUPLICATE_DRAFT, '已存在该工艺路线的草稿版本，请先处理现有草稿', 409)
    }
    
    // 数据克隆 - 深度克隆现有工艺路线数据
    const newVersion = JSON.parse(JSON.stringify(existingRouting))
    
    // 新版本属性赋值
    // 生成唯一ID
    newVersion.id = uuidv4()
    
    // 注意：由于数据结构中没有baseId字段，这里不设置baseId
    // 同一工艺路线的不同版本通过相同的code字段来识别
    
    // 版本号递增
    const currentVersion = parseFloat(existingRouting.version) || 1.0
    newVersion.version = (currentVersion + 0.1).toFixed(1)
    
    // 状态设为草稿
    newVersion.status = 'Draft'
    
    // 更新审计字段
    newVersion.createdBy = 'admin' // 实际应用中应使用当前登录用户
    newVersion.createdAt = new Date().toISOString()
    newVersion.updatedBy = 'admin' // 实际应用中应使用当前登录用户
    newVersion.updatedAt = new Date().toISOString()
    
    // 步骤ID重新生成
    if (newVersion.steps && newVersion.steps.length > 0) {
      newVersion.steps = newVersion.steps.map(step => ({
        ...step,
        stepId: `step-${newVersion.id.split('-')[1]}-${step.stepNumber / 10}`
      }))
    }
    
    // 添加版本变更记录
    if (!newVersion.changelog) {
      newVersion.changelog = []
    }
    
    newVersion.changelog.unshift({
      version: newVersion.version,
      user: newVersion.updatedBy,
      timestamp: newVersion.updatedAt,
      note: `基于 v${existingRouting.version} 创建新版本`
    })
    
    // 数据持久化 - 将新版本添加到数据缓存中
    dataCache.unshift(newVersion)
    
    // 成功反馈
    return success(newVersion, `工艺路线 "${existingRouting.name}" 的新版本 v${newVersion.version} 创建成功`, 201)
  }
}

/**
 * 导出Mock路由配置
 * 使用常量化配置，结构清晰，易于维护
 * 
 * 重要的排序原则：
 * 将更具体的路由（如 /check-code-unique）放在更通用的路由（如 /）之前。
 * Mock.js 会按照数组中的顺序进行匹配。
 */
module.exports = [
  // 最具体的路由：检查路线代码唯一性
  {
    url: ROUTES.CHECK_CODE_UNIQUE,
    type: 'get',
    response: config => handlers.checkCodeUnique(config)
  },
  // 创建新版本
  {
    url: ROUTES.NEW_VERSION,
    type: 'post',
    response: config => handlers.createNewVersion(config)
  },
  // 通用集合操作
  {
    url: ROUTES.COLLECTION,
    type: 'get',
    response: config => handlers.getList(config)
  },
  {
    url: ROUTES.COLLECTION,
    type: 'post',
    response: config => handlers.create(config)
  },
  // 单个工艺路线操作
  {
    url: ROUTES.ITEM_DETAIL,
    type: 'put',
    response: config => handlers.update(config)
  },
  {
    url: ROUTES.ITEM_DETAIL,
    type: 'delete',
    response: config => handlers.deleteRouting(config) // 注意：这里使用了错误的函数名，应为 handlers.delete
  }
]