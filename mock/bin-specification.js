const Mock = require('mockjs')

// 生成随机的料框规格数据
const data = Mock.mock({
  'items|15': [{
    'id|+1': 1, // 规格ID
    'code': /BF[A-Z][0-9]{4}/, // 规格代码
    'name': '@ctitle(4, 8)料框', // 规格名称
    'length|80-200': 100, // 长度(cm)
    'width|60-100': 80, // 宽度(cm)
    'height|50-120': 80, // 高度(cm)
    'maxWeight|500-2000': 1000, // 最大载重(kg)
    'material|1': ['铝合金', '不锈钢', '碳钢', '镀锌钢'], // 材质
    'maxStackLayers|1-5': 3, // 最大堆叠层数
    'applicableProducts': () => { // 适用产品类型列表
      const count = Mock.Random.integer(1, 5)
      const products = []
      for (let i = 0; i < count; i++) {
        products.push({
          id: Mock.Random.integer(1, 20),
          name: Mock.Random.ctitle(2, 6) + '铝箔'
        })
      }
      return products
    },
    'supplier': '@cname()公司', // 供应商信息
    'status|1': [0, 1], // 状态：0-禁用, 1-启用
    'createTime': '@datetime', // 创建时间
    'updateTime': '@datetime' // 更新时间
  }]
})

// 产品类型列表（用于选择）
const productTypeList = Mock.mock({
  'items|20': [{
    'id|+1': 1,
    'name': '@ctitle(2, 6)铝箔'
  }]
})

// 深拷贝数组
const deepClone = array => {
  return array.map(item => ({ ...item }))
}

const items = deepClone(data.items)

// Mock数据列表
const mockItems = []
for (let i = 0; i < 35; i++) {
  mockItems.push({
    id: `BIN${i + 1}`.padStart(6, '0'),
    code: `LK${(i + 1).toString().padStart(3, '0')}`,
    name: `标准料框${i + 1}`,
    length: 100 + i % 5 * 10,
    width: 80 + i % 5 * 5,
    height: 80 + i % 3 * 5,
    maxWeight: 1000 + i % 4 * 200,
    material: ['铝合金', '不锈钢', '碳钢', '镀锌钢'][i % 4],
    maxStackLayers: 1 + i % 5,
    applicableProducts: [
      { id: 'P001', name: '单零铝箔' },
      { id: 'P002', name: '双零铝箔' },
      { id: 'P003', name: '铝合金箔' },
      { id: 'P004', name: '合金铝板' }
    ].slice(0, 1 + i % 4),
    supplier: ['苏州金属制品厂', '无锡工业容器有限公司', '常州金属制造厂', '上海金属容器制造'][i % 4],
    status: i % 5 === 0 ? 0 : 1,
    createTime: new Date(Date.now() - i * 86400000).toISOString()
  })
}

// 提取物料框架可选产品类型列表
const productTypes = [
  { id: 'P001', name: '单零铝箔' },
  { id: 'P002', name: '双零铝箔' },
  { id: 'P003', name: '铝合金箔' },
  { id: 'P004', name: '合金铝板' },
  { id: 'P005', name: '高精度铝带' },
  { id: 'P006', name: '彩涂铝卷' }
]

module.exports = [
  // 获取料框规格列表
  {
    url: '/vue-admin-template/mes/bin-specification/list',
    type: 'get',
    response: config => {
      const { code, name, status, page = 1, limit = 10 } = config.query

      // 过滤
      let filteredItems = [...mockItems]
      if (code) {
        filteredItems = filteredItems.filter(item => item.code.includes(code))
      }
      if (name) {
        filteredItems = filteredItems.filter(item => item.name.includes(name))
      }
      if (status !== undefined && status !== '') {
        filteredItems = filteredItems.filter(item => item.status.toString() === status.toString())
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

  // 获取料框规格详情
  {
    url: /\/vue-admin-template\/mes\/bin-specification\/detail\/[\w\d]+/,
    type: 'get',
    response: config => {
      const id = config.url.match(/\/detail\/(\w+)/)[1]
      const item = mockItems.find(item => item.id === id)
      
      return {
        code: 20000,
        data: item || null
      }
    }
  },

  // 创建料框规格
  {
    url: '/vue-admin-template/mes/bin-specification/create',
    type: 'post',
    response: config => {
      const data = config.body
      const newId = `BIN${mockItems.length + 1}`.padStart(6, '0')
      const newItem = {
        ...data,
        id: newId,
        createTime: new Date().toISOString()
      }
      mockItems.unshift(newItem)
      
      return {
        code: 20000,
        data: {
          id: newId
        }
      }
    }
  },

  // 更新料框规格
  {
    url: '/vue-admin-template/mes/bin-specification/update',
    type: 'put',
    response: config => {
      const data = config.body
      const index = mockItems.findIndex(item => item.id === data.id)
      
      if (index > -1) {
        mockItems[index] = { ...mockItems[index], ...data }
        return {
          code: 20000,
          data: {
            id: data.id
          }
        }
      } else {
        return {
          code: 50404,
          message: '料框规格不存在'
        }
      }
    }
  },

  // 删除料框规格
  {
    url: /\/vue-admin-template\/mes\/bin-specification\/delete\/[\w\d]+/,
    type: 'delete',
    response: config => {
      const id = config.url.match(/\/delete\/(\w+)/)[1]
      const index = mockItems.findIndex(item => item.id === id)
      
      if (index > -1) {
        mockItems.splice(index, 1)
        return {
          code: 20000,
          data: {
            id
          }
        }
      } else {
        return {
          code: 50404,
          message: '料框规格不存在'
        }
      }
    }
  },

  // 更改料框规格状态
  {
    url: '/vue-admin-template/mes/bin-specification/status',
    type: 'put',
    response: config => {
      const { id, status } = config.body
      const index = mockItems.findIndex(item => item.id === id)
      
      if (index > -1) {
        mockItems[index].status = status
        return {
          code: 20000,
          data: {
            id
          }
        }
      } else {
        return {
          code: 50404,
          message: '料框规格不存在'
        }
      }
    }
  },

  // 获取产品类型列表
  {
    url: '/vue-admin-template/mes/product/type-list',
    type: 'get',
    response: () => {
      return {
        code: 20000,
        data: {
          items: productTypes
        }
      }
    }
  },
  
  // 批量删除料框规格
  {
    url: '/vue-admin-template/mes/bin-specification/batch-delete',
    type: 'delete',
    response: config => {
      const { ids } = config.body
      
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return {
          code: 50400,
          message: '无效的请求参数'
        }
      }
      
      let deleteCount = 0
      for (const id of ids) {
        const index = mockItems.findIndex(item => item.id === id)
        if (index > -1) {
          mockItems.splice(index, 1)
          deleteCount++
        }
      }
      
      return {
        code: 20000,
        data: {
          count: deleteCount
        }
      }
    }
  },
  
  // 批量更改料框规格状态
  {
    url: '/vue-admin-template/mes/bin-specification/batch-status',
    type: 'put',
    response: config => {
      const { ids, status } = config.body
      
      if (!ids || !Array.isArray(ids) || ids.length === 0 || status === undefined) {
        return {
          code: 50400,
          message: '无效的请求参数'
        }
      }
      
      let updateCount = 0
      for (const id of ids) {
        const index = mockItems.findIndex(item => item.id === id)
        if (index > -1) {
          mockItems[index].status = status
          updateCount++
        }
      }
      
      return {
        code: 20000,
        data: {
          count: updateCount
        }
      }
    }
  },
  
  // 导出料框规格数据
  {
    url: '/vue-admin-template/mes/bin-specification/export',
    type: 'get',
    response: config => {
      // 实际导出功能需要返回二进制数据，这里仅返回成功状态
      return {
        code: 20000,
        data: 'export-success'
      }
    }
  },
  
  // 下载导入模板
  {
    url: '/vue-admin-template/mes/bin-specification/download-template',
    type: 'get',
    response: () => {
      // 实际导出功能需要返回二进制数据，这里仅返回成功状态
      return {
        code: 20000,
        data: 'template-download-success'
      }
    }
  },
  
  // 导入料框规格数据
  {
    url: '/vue-admin-template/mes/bin-specification/import',
    type: 'post',
    response: config => {
      // 模拟导入结果
      return {
        code: 20000,
        data: {
          total: 10,
          success: 8,
          failed: 2,
          failedItems: [
            { row: 3, reason: '规格代码已存在' },
            { row: 7, reason: '最大载重不能为空' }
          ]
        }
      }
    }
  }
] 