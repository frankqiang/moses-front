const Mock = require('mockjs')

// 生成随机的铝箔产品数据（模拟大数据量场景）
const data = Mock.mock({
  'items|1000': [{
    'id|+1': 1, // 产品ID
    'code': function() {
      const alloys = ['1100', '8011', '3003', '8021']
      const states = ['H18', 'O', 'H22', 'H24']
      const thickness = (Math.random() * 0.02 + 0.005).toFixed(4) // 厚度 0.005-0.025mm
      const width = Math.floor(Math.random() * 1000 + 500) // 宽度 500-1500mm
      return `AF-${this.alloy}-${this.state}-${thickness}x${width}`
    }, 
    'name': function() {
      const thickness = parseFloat(this.code.match(/\d+\.\d+/)[0])
      return `${this.alloy}合金${this.state}态${thickness < 0.01 ? '双' : '单'}零箔`
    }, 
    'rawMaterialType|1': ['原铝', '再生铝', '混合铝'], // 原材料类型
    'alloy|1': ['1100', '8011', '3003', '8021'], // 合金牌号
    'state|1': ['H18', 'O', 'H22', 'H24'], // 状态/硬度
    'thickness': function() {
      return parseFloat(this.code.match(/\d+\.\d+/)[0])
    }, // 厚度(mm)
    'width': function() {
      return parseInt(this.code.match(/x(\d+)/)[1])
    }, // 宽度(mm)
    'unitWeight|0.5-5.5': 1, // 单位重量(kg/卷或kg/m²)
    'processTemplates': function() { // 关联退火工艺模板ID列表
      const count = Mock.Random.integer(1, 3)
      const templates = []
      for (let i = 0; i < count; i++) {
        templates.push({
          id: `PT${Mock.Random.integer(1, 10).toString().padStart(3, '0')}`,
          name: `${this.alloy}合金${this.state}态退火工艺${i+1}号`
        })
      }
      return templates
    },
    'qualityStandards': function() { // 关联质量标准ID列表
      const count = Mock.Random.integer(1, 2)
      const standards = []
      for (let i = 0; i < count; i++) {
        standards.push({
          id: `QS${Mock.Random.integer(1, 8).toString().padStart(3, '0')}`,
          name: `${this.alloy}系列铝箔质量标准${i+1}号`
        })
      }
      return standards
    },
    'lifecycleStatus|1': ['trial', 'production', 'discontinued'], // 产品生命周期状态
    'createTime': '@datetime', // 创建时间
    'updateTime': '@datetime' // 更新时间
  }]
})

// 深拷贝数组
const deepClone = array => {
  return array.map(item => ({ ...item }))
}

const items = deepClone(data.items)

// 优化产品编码和名称
items.forEach(item => {
  item.code = `AF-${item.alloy}-${item.state}-${item.thickness.toFixed(4)}x${item.width}`
  const foilType = item.thickness < 0.01 ? '双' : '单'
  item.name = `${item.alloy}合金${item.state}态${foilType}零箔`
  // 设置更人性化的生命周期状态显示
  if (item.lifecycleStatus === 'trial') {
    item.lifecycleStatusName = '试产'
  } else if (item.lifecycleStatus === 'production') {
    item.lifecycleStatusName = '量产'
  } else {
    item.lifecycleStatusName = '停产'
  }
})

// 工艺模板列表（用于选择关联工艺模板）
const processTemplateList = []
for (let i = 1; i <= 10; i++) {
  processTemplateList.push({
    id: `PT${i.toString().padStart(3, '0')}`,
    name: `退火工艺模板${i}号`,
    version: '1.0',
    status: 'effective'
  })
}

// 质量标准列表（用于选择关联质量标准）
const qualityStandardList = []
for (let i = 1; i <= 8; i++) {
  qualityStandardList.push({
    id: `QS${i.toString().padStart(3, '0')}`,
    name: `铝箔质量标准${i}号`,
    version: '1.0',
    status: 'effective'
  })
}

module.exports = [
  // 获取铝箔产品列表
  {
    url: '/vue-admin-template/mes/product/list',
    type: 'get',
    response: config => {
      const { code, name, alloy, lifecycleStatus, page = 1, limit = 10 } = config.query

      // 过滤
      let filteredItems = [...items]
      if (code) {
        filteredItems = filteredItems.filter(item => item.code.includes(code))
      }
      if (name) {
        filteredItems = filteredItems.filter(item => item.name.includes(name))
      }
      if (alloy) {
        filteredItems = filteredItems.filter(item => item.alloy === alloy)
      }
      if (lifecycleStatus) {
        filteredItems = filteredItems.filter(item => item.lifecycleStatus === lifecycleStatus)
      }

      // 分页
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + parseInt(limit)
      const pageItems = filteredItems.slice(startIndex, endIndex)

      return {
        code: 20000,
        data: {
          total: filteredItems.length,
          items: pageItems
        }
      }
    }
  },

  // 获取铝箔产品详情
  {
    url: /\/vue-admin-template\/mes\/product\/detail\/[\w\d]+/,
    type: 'get',
    response: config => {
      const id = config.url.match(/\/detail\/(\w+)/)[1]
      const item = items.find(item => item.id.toString() === id)
      
      return {
        code: 20000,
        data: item || null
      }
    }
  },

  // 创建铝箔产品
  {
    url: '/vue-admin-template/mes/product/create',
    type: 'post',
    response: config => {
      const data = config.body
      const newId = items.length + 1
      
      // 设置生命周期状态显示名称
      let lifecycleStatusName = ''
      if (data.lifecycleStatus === 'trial') {
        lifecycleStatusName = '试产'
      } else if (data.lifecycleStatus === 'production') {
        lifecycleStatusName = '量产'
      } else {
        lifecycleStatusName = '停产'
      }
      
      const newItem = {
        ...data,
        id: newId,
        lifecycleStatusName,
        createTime: Mock.mock('@datetime'),
        updateTime: Mock.mock('@datetime')
      }
      items.unshift(newItem)
      
      return {
        code: 20000,
        data: {
          id: newId
        }
      }
    }
  },

  // 更新铝箔产品
  {
    url: '/vue-admin-template/mes/product/update',
    type: 'put',
    response: config => {
      const data = config.body
      const index = items.findIndex(item => item.id === data.id)
      
      if (index > -1) {
        // 设置生命周期状态显示名称
        let lifecycleStatusName = ''
        if (data.lifecycleStatus === 'trial') {
          lifecycleStatusName = '试产'
        } else if (data.lifecycleStatus === 'production') {
          lifecycleStatusName = '量产'
        } else {
          lifecycleStatusName = '停产'
        }
        
        items[index] = { 
          ...items[index], 
          ...data, 
          lifecycleStatusName,
          updateTime: Mock.mock('@datetime')
        }
        
        return {
          code: 20000,
          data: {
            id: data.id
          }
        }
      } else {
        return {
          code: 50404,
          message: '铝箔产品不存在'
        }
      }
    }
  },

  // 删除铝箔产品
  {
    url: /\/vue-admin-template\/mes\/product\/delete\/[\w\d]+/,
    type: 'delete',
    response: config => {
      const id = parseInt(config.url.match(/\/delete\/(\w+)/)[1])
      const index = items.findIndex(item => item.id === id)
      
      if (index > -1) {
        items.splice(index, 1)
        return {
          code: 20000,
          data: {
            id
          }
        }
      } else {
        return {
          code: 50404,
          message: '铝箔产品不存在'
        }
      }
    }
  },

  // 更改铝箔产品状态
  {
    url: '/vue-admin-template/mes/product/status',
    type: 'put',
    response: config => {
      const { id, lifecycleStatus } = config.body
      const index = items.findIndex(item => item.id === id)
      
      if (index > -1) {
        // 设置生命周期状态显示名称
        let lifecycleStatusName = ''
        if (lifecycleStatus === 'trial') {
          lifecycleStatusName = '试产'
        } else if (lifecycleStatus === 'production') {
          lifecycleStatusName = '量产'
        } else {
          lifecycleStatusName = '停产'
        }
        
        items[index].lifecycleStatus = lifecycleStatus
        items[index].lifecycleStatusName = lifecycleStatusName
        items[index].updateTime = Mock.mock('@datetime')
        
        return {
          code: 20000,
          data: {
            id
          }
        }
      } else {
        return {
          code: 50404,
          message: '铝箔产品不存在'
        }
      }
    }
  },

  // 批量删除铝箔产品
  {
    url: '/vue-admin-template/mes/product/batch-delete',
    type: 'delete',
    response: config => {
      const { ids } = config.body
      let successCount = 0
      
      ids.forEach(id => {
        const index = items.findIndex(item => item.id === id)
        if (index > -1) {
          items.splice(index, 1)
          successCount++
        }
      })
      
      return {
        code: 20000,
        data: {
          count: successCount
        }
      }
    }
  },

  // 批量更改铝箔产品状态
  {
    url: '/vue-admin-template/mes/product/batch-status',
    type: 'put',
    response: config => {
      const { ids, lifecycleStatus } = config.body
      let successCount = 0
      
      // 设置生命周期状态显示名称
      let lifecycleStatusName = ''
      if (lifecycleStatus === 'trial') {
        lifecycleStatusName = '试产'
      } else if (lifecycleStatus === 'production') {
        lifecycleStatusName = '量产'
      } else {
        lifecycleStatusName = '停产'
      }
      
      ids.forEach(id => {
        const index = items.findIndex(item => item.id === id)
        if (index > -1) {
          items[index].lifecycleStatus = lifecycleStatus
          items[index].lifecycleStatusName = lifecycleStatusName
          items[index].updateTime = Mock.mock('@datetime')
          successCount++
        }
      })
      
      return {
        code: 20000,
        data: {
          count: successCount
        }
      }
    }
  },

  // 获取工艺模板列表
  {
    url: '/vue-admin-template/mes/process-template/list',
    type: 'get',
    response: () => {
      return {
        code: 20000,
        data: {
          items: processTemplateList
        }
      }
    }
  },

  // 获取质量标准列表
  {
    url: '/vue-admin-template/mes/quality-standard/list',
    type: 'get',
    response: config => {
      return {
        code: 20000,
        data: {
          items: qualityStandardList
        }
      }
    }
  },

  // 导出铝箔产品数据和下载模板（简单模拟返回文件）
  {
    url: /\/vue-admin-template\/mes\/product\/(export|download-template)/,
    type: 'get',
    response: config => {
      return {
        code: 20000,
        data: 'mock-file'
      }
    }
  },

  // 导入铝箔产品数据
  {
    url: '/vue-admin-template/mes/product/import',
    type: 'post',
    response: config => {
      return {
        code: 20000,
        data: {
          total: 5,
          success: 4,
          fail: 1,
          errors: [
            {
              row: 3,
              message: '产品编码格式不符合要求'
            }
          ]
        }
      }
    }
  },

  // 获取所有产品列表（支持搜索和限制数量，用于下拉选择）
  {
    url: '/vue-admin-template/mes/product/all-list',
    type: 'get',
    response: config => {
      const { search, limit = 50 } = config.query || {}
      
      // 过滤产品数据
      let filteredItems = items.map(item => ({
        id: item.id,
        name: item.name,
        code: item.code,
        alloy: item.alloy,
        state: item.state
      }))
      
      // 根据搜索关键词过滤
      if (search) {
        const searchLower = search.toLowerCase()
        filteredItems = filteredItems.filter(item => 
          item.code.toLowerCase().includes(searchLower) ||
          item.name.toLowerCase().includes(searchLower)
        )
      }
      
      // 限制返回数量
      const limitedItems = filteredItems.slice(0, parseInt(limit))
      
      return {
        code: 20000,
        data: {
          items: limitedItems,
          total: filteredItems.length
        }
      }
    }
  }
]