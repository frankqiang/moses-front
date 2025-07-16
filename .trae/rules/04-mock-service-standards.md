---
description: Mock服务开发规范、数据生成原则和业务逻辑模拟标准
globs: 
alwaysApply: false
---
# Mock服务开发规范

## 规则说明与适用范围
本规则定义了Mock服务的开发标准、数据生成原则和最佳实践。所有Mock开发都需遵循此规范，确保Mock数据的真实性和业务价值。

## Mock系统架构概述

### 技术栈与架构
- **数据生成引擎**：基于[mockjs](mdc:http:/mockjs.com)实现智能数据生成
- **服务架构**：使用Express中间件处理HTTP请求
- **模块系统**：CommonJS模块系统（`require()`/`module.exports`）
- **路由管理**：支持动态路由注册和响应数据配置
- **开发集成**：与Vue开发服务器无缝集成

### 系统特性
- ✅ **真实数据生成**：符合行业标准的业务数据
- ✅ **业务逻辑模拟**：完整的CRUD操作和状态管理
- ✅ **响应时间控制**：可配置的延迟模拟
- ✅ **错误场景模拟**：多种错误情况测试
- ✅ **动态数据更新**：支持数据的增删改查操作

## 项目配置与启用

### 开发环境配置
在[vue.config.js](mdc:vue.config.js)中配置Mock服务：

```javascript
module.exports = {
  devServer: {
    before: require('./mock/mock-server.js')
  }
}
```

### 环境控制
在[src/main.js](mdc:src/main.js)中根据环境启用：

```javascript
// 开发环境启用Mock
if (process.env.NODE_ENV === 'development') {
  require('../mock')
}
```

### Mock服务入口配置
```javascript
// mock/index.js
const Mock = require('mockjs')
const { param2Obj } = require('./utils')

// 导入所有Mock模块
const mocks = [
  ...require('./modules/master-data'),
  ...require('./modules/production'),
  ...require('./modules/system'),
]

// 注册Mock接口
function mockXHR() {
  function XHR2ExpressReqWrap(respond) {
    return function(options) {
      const { body, type, url } = options
      const result = respond({
        method: type,
        body: JSON.parse(body),
        query: param2Obj(url)
      })
      return Mock.mock(result)
    }
  }

  for (const i of mocks) {
    Mock.mock(new RegExp(i.url), i.type || 'get', XHR2ExpressReqWrap(i.response))
  }
}

module.exports = { mocks, mockXHR }
```

## 目录结构规范

### 标准目录结构
Mock系统必须按照以下结构组织：

```
mock/
├── index.js                     # Mock服务入口
├── mock-server.js              # Express服务器配置
├── utils/                      # 工具函数目录
│   ├── index.js                # 工具函数统一导出
│   ├── response.js             # 响应处理工具
│   └── generator.js            # 数据生成工具
└── modules/                    # Mock模块目录
    ├── master-data/            # 主数据模块组
    │   ├── index.js            # 模块组入口
    │   ├── data/               # 基础数据目录
    │   │   ├── equipment.js    # 设备基础数据
    │   │   └── material.js     # 物料基础数据
    │   ├── equipment.js        # 设备管理Mock
    │   └── material.js         # 物料管理Mock
    └── production/             # 生产模块组
        ├── index.js
        ├── data/
        │   └── work-order.js
        └── work-order.js
```

### 模块组织原则
1. **按业务域拆分**：每个业务领域一个模块组
2. **数据与逻辑分离**：基础数据放在`data/`目录，API处理逻辑独立
3. **统一入口管理**：每个模块组提供`index.js`统一导出
4. **命名规范一致**：文件命名使用kebab-case格式

## 数据生成原则与标准

### 真实性原则
【必须】Mock数据必须符合实际业务场景和行业标准：

#### 1. 数据的真实性要求
```javascript
// ✅ 正确 - 使用真实的行业数据
const equipmentTypes = [
  { code: 'CNC-001', name: '数控机床', category: '加工设备' },
  { code: 'ROBOT-002', name: '工业机器人', category: '自动化设备' },
  { code: 'LASER-003', name: '激光切割机', category: '切割设备' }
]

// ❌ 错误 - 使用无意义的测试数据
const badData = [
  { code: 'test123', name: 'aaa', category: 'bbb' }
]
```

#### 2. 业务参数的合理性
```javascript
// ✅ 正确 - 符合实际生产参数范围
const processParameters = {
  temperature: Mock.mock('@integer(150, 300)'), // 合理的温度范围
  pressure: Mock.mock('@float(0.5, 2.0, 1, 2)'), // 合理的压力范围
  speed: Mock.mock('@integer(100, 1500)'), // 合理的转速范围
  workTime: Mock.mock('@integer(480, 720)'), // 8-12小时工作时间（分钟）
}
```

#### 3. 时间数据的逻辑性
```javascript
// ✅ 正确 - 符合业务时间逻辑
const generateWorkOrder = () => {
  const startTime = Mock.mock('@datetime("yyyy-MM-dd HH:mm:ss")')
  const startDate = new Date(startTime)
  const endDate = new Date(startDate.getTime() + Mock.mock('@integer(2, 8)') * 60 * 60 * 1000)
  
  return {
    startTime: startTime,
    endTime: endDate.toISOString().slice(0, 19).replace('T', ' '),
    planDuration: Math.floor((endDate - startDate) / (60 * 1000)),
    actualDuration: Mock.mock('@integer(120, 480)')
  }
}
```

### 数据关联性原则
【必须】保持数据间的逻辑关联性：

```javascript
// ✅ 正确 - 保持数据一致性
const generateProduct = (productType) => {
  const typeConfig = {
    '电子产品': {
      materials: ['硅晶', '铝合金', '塑料'],
      processes: ['组装', '测试', '包装'],
      quality: Mock.mock('@float(95, 99.5, 1, 2)')
    },
    '机械产品': {
      materials: ['钢材', '铸铁', '橡胶'],
      processes: ['加工', '热处理', '组装'],
      quality: Mock.mock('@float(92, 98, 1, 2)')
    }
  }
  
  const config = typeConfig[productType]
  return {
    type: productType,
    materials: config.materials,
    processes: config.processes,
    qualityRate: config.quality
  }
}
```

## 基础数据生成规范

### 数据生成器结构
每个基础数据文件应遵循以下结构：

```javascript
// mock/modules/master-data/data/equipment.js
const Mock = require('mockjs')

/**
 * 生成设备基础数据
 */
const generateEquipmentData = () => {
  // 预设真实基础数据
  const baseEquipment = [
    {
      id: 1,
      code: 'CNC-M001',
      name: 'FANUC数控铣床',
      model: 'FANUC-31i',
      manufacturer: '发那科',
      category: '数控设备',
      workshop: '机加车间1',
      status: 'running',
      specifications: {
        maxSpindleSpeed: 8000,
        workTableSize: '1200x800',
        maxLoad: 2000
      },
      purchaseDate: '2020-03-15',
      warrantyExpiry: '2025-03-15'
    }
  ]

  // 生成随机数据，基于真实模板
  const additionalData = Mock.mock({
    'items|18': [{
      'id|+1': baseEquipment.length + 1,
      'code': () => {
        const types = ['CNC', 'ROBOT', 'LASER', 'PRESS', 'FURNACE']
        const type = types[Math.floor(Math.random() * types.length)]
        const num = Mock.mock('@integer(100, 999)')
        return `${type}-${String(num).padStart(3, '0')}`
      },
      'name|1': ['FANUC数控机床', 'ABB机器人', '激光切割机', '冲压设备', '热处理炉'],
      'status|1': ['running', 'idle', 'maintenance', 'fault'],
      'category|1': ['数控设备', '机器人', '激光设备', '压力设备', '热处理设备'],
      'workshop|1': ['机加车间1', '机加车间2', '自动化车间', '热处理车间', '装配车间']
    }]
  }).items

  return [...baseEquipment, ...additionalData]
}

module.exports = {
  generateEquipmentData,
  data: generateEquipmentData()
}
```

### 数据生成工具函数
```javascript
// mock/utils/generator.js
const Mock = require('mockjs')

/**
 * 生成符合规范的编码
 */
const generateCode = (prefix, length = 3) => {
  const number = Mock.mock(`@integer(1, ${Math.pow(10, length) - 1})`)
  return `${prefix}-${String(number).padStart(length, '0')}`
}

/**
 * 生成合理的时间范围
 */
const generateTimeRange = (baseDate = new Date(), daysBefore = 30, daysAfter = 30) => {
  const base = new Date(baseDate)
  const startTime = new Date(base.getTime() - daysBefore * 24 * 60 * 60 * 1000)
  const endTime = new Date(base.getTime() + daysAfter * 24 * 60 * 60 * 1000)
  
  return {
    start: startTime.toISOString().slice(0, 19).replace('T', ' '),
    end: endTime.toISOString().slice(0, 19).replace('T', ' ')
  }
}

/**
 * 生成符合业务规则的状态流转
 */
const generateNextStatus = (currentStatus, stateRules) => {
  const allowedNext = stateRules[currentStatus] || []
  if (allowedNext.length === 0) return currentStatus
  
  const randomIndex = Math.floor(Math.random() * allowedNext.length)
  return allowedNext[randomIndex]
}

module.exports = {
  generateCode,
  generateTimeRange,
  generateNextStatus
}
```

## API处理函数设计

### 标准API处理结构
每个API处理文件应遵循以下结构：

```javascript
// mock/modules/master-data/equipment.js
const { data: equipmentData } = require('./data/equipment')
const { success, error, paginate } = require('../../utils/response')

// 数据缓存和状态管理
let dataCache = [...equipmentData]
let idCounter = Math.max(...dataCache.map(item => item.id)) + 1

// 业务状态转换规则
const statusRules = {
  'idle': ['running', 'maintenance'],
  'running': ['idle', 'fault'],
  'maintenance': ['idle'],
  'fault': ['maintenance', 'idle']
}

/**
 * API处理函数集合
 */
const handlers = {
  getList(config) {
    // 实现列表查询、搜索、过滤、分页逻辑
    const { page = 1, limit = 10, keyword = '', status = '' } = config.query
    // ... 具体实现
    return success(paginatedResult)
  },

  getDetail(config) {
    // 实现详情查询逻辑
    const { id } = config.query
    // ... 具体实现
    return success(equipment)
  },

  create(config) {
    // 实现创建逻辑：验证 -> 检查唯一性 -> 创建
    // ... 具体实现
    return success(newEquipment, '创建成功', 201)
  },

  update(config) {
    // 实现更新逻辑：验证 -> 状态转换检查 -> 更新
    // ... 具体实现
    return success(updatedEquipment, '更新成功')
  },

  delete(config) {
    // 实现删除逻辑：存在性检查 -> 业务规则验证 -> 删除
    // ... 具体实现
    return success(null, '删除成功', 204)
  }
}

/**
 * 导出Mock路由配置
 */
module.exports = [
  { url: '/mes/master-data/equipment/list', type: 'get', response: handlers.getList },
  { url: '/mes/master-data/equipment/detail', type: 'get', response: handlers.getDetail },
  { url: '/mes/master-data/equipment', type: 'post', response: handlers.create },
  { url: '/mes/master-data/equipment', type: 'put', response: handlers.update },
  { url: '/mes/master-data/equipment', type: 'delete', response: handlers.delete }
]
```

### API处理规范
- **数据缓存**：使用内存数组缓存数据，支持运行时增删改查
- **状态管理**：定义业务状态转换规则，验证状态变更合法性
- **参数验证**：检查必填参数、数据格式、业务规则
- **错误处理**：返回统一的错误格式和适当的HTTP状态码
- **业务逻辑**：模拟真实的业务验证和处理流程

## 响应工具与格式规范

### 统一响应工具
```javascript
// mock/utils/response.js

/**
 * 成功响应
 */
const success = (data, message = '操作成功', status = 200) => ({
  success: true,
  data,
  message,
  timestamp: new Date().toISOString(),
  status
})

/**
 * 错误响应
 */
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

/**
 * 分页处理工具
 */
const paginate = (data, page = 1, limit = 10) => {
  const pageNum = parseInt(page)
  const limitNum = parseInt(limit)
  const offset = (pageNum - 1) * limitNum
  
  const items = data.slice(offset, offset + limitNum)
  const total = data.length
  const totalPages = Math.ceil(total / limitNum)
  
  return {
    items,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages,
    hasNext: pageNum < totalPages,
    hasPrev: pageNum > 1
  }
}

/**
 * 延迟响应（用于模拟网络延迟）
 */
const delayResponse = (responseFn, delay = 500) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(responseFn())
    }, delay)
  })
}

module.exports = {
  success,
  error,
  paginate,
  delayResponse
}
```

## 业务逻辑模拟规范

### 状态管理模拟
```javascript
// 工单状态流转示例
const workOrderStates = {
  'draft': ['submitted', 'cancelled'],
  'submitted': ['approved', 'rejected'],
  'approved': ['in_progress', 'cancelled'],
  'in_progress': ['completed', 'paused', 'cancelled'],
  'paused': ['in_progress', 'cancelled'],
  'completed': ['archived'],
  'rejected': ['draft'],
  'cancelled': [],
  'archived': []
}

const validateStateTransition = (currentState, newState) => {
  const allowedStates = workOrderStates[currentState] || []
  return allowedStates.includes(newState)
}
```

### 业务规则验证
```javascript
// 业务规则验证示例
const businessRules = {
  // 设备使用规则
  canUseEquipment: (equipment, workOrder) => {
    if (equipment.status !== 'idle') {
      return { valid: false, message: '设备不在空闲状态' }
    }
    
    if (equipment.category !== workOrder.requiredEquipmentType) {
      return { valid: false, message: '设备类型不匹配' }
    }
    
    return { valid: true }
  },
  
  // 物料库存检查
  checkMaterialStock: (material, requiredQuantity) => {
    if (material.stock < requiredQuantity) {
      return { 
        valid: false, 
        message: `物料库存不足，需要${requiredQuantity}，现有${material.stock}` 
      }
    }
    
    return { valid: true }
  }
}
```

## Mock调试与开发工具

### 调试技巧
```javascript
// 控制台输出调试
response: (config) => {
  console.log('🔍 Mock请求调试:', config.method, config.url, config.query)
  const result = handlers.getList(config)
  console.log('🔍 Mock响应调试:', result)
  return result
}

// 延迟响应测试
response: (config) => {
  return delayResponse(() => handlers.getList(config), 1000) // 1秒延迟
}

// 随机错误模拟
response: (config) => {
  // 10% 概率返回错误
  if (Math.random() < 0.1) {
    return error('RANDOM_ERROR', '模拟随机错误', 500)
  }
  
  return handlers.getList(config)
}
```

### 性能监控
```javascript
// 性能监控工具
const performanceMonitor = {
  start() {
    this.startTime = Date.now()
  },
  
  end() {
    const duration = Date.now() - this.startTime
    console.log(`⏱️ Mock响应耗时: ${duration}ms`)
    return duration
  }
}

// 在处理函数中使用
response: (config) => {
  performanceMonitor.start()
  const result = handlers.getList(config)
  performanceMonitor.end()
  return result
}
```

## 🔍 Mock服务质量检查清单

### 数据质量 [P0]
- [ ] **数据真实性**：Mock数据是否符合实际业务场景和行业标准？
- [ ] **数据关联性**：相关数据之间是否保持逻辑一致性？
- [ ] **参数合理性**：数值参数是否在合理范围内？
- [ ] **时间逻辑性**：时间数据是否符合实际业务时间规律？
- [ ] **状态流转**：状态变更是否遵循真实业务流程规则？

### API功能 [P1] 
- [ ] **完整CRUD**：是否实现了完整的增删改查功能？
- [ ] **业务验证**：是否模拟了真实的业务验证规则？
- [ ] **错误处理**：是否覆盖了各种错误场景？
- [ ] **分页功能**：列表接口是否正确实现分页逻辑？
- [ ] **搜索过滤**：是否支持关键词搜索和条件过滤？

### 开发体验 [P2]
- [ ] **响应格式**：是否使用统一的响应格式？
- [ ] **调试支持**：是否提供了充分的调试信息？
- [ ] **性能模拟**：是否模拟了合理的响应延迟？
- [ ] **错误模拟**：是否提供了错误场景测试能力？


- [ ] **文档完整**：是否有完整的API使用文档？