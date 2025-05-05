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

module.exports = [
  // 获取料框规格列表
  {
    url: '/vue-admin-template/mes/bin-specification/list',
    type: 'get',
    response: config => {
      const { status, code, name, page = 1, limit = 10 } = config.query

      let mockList = deepClone(items)
      
      if (status !== undefined && status !== '') {
        mockList = mockList.filter(item => item.status.toString() === status)
      }
      
      if (code) {
        mockList = mockList.filter(item => item.code.includes(code))
      }
      
      if (name) {
        mockList = mockList.filter(item => item.name.includes(name))
      }

      // 分页
      const pageList = mockList.filter((item, index) => index < limit * page && index >= limit * (page - 1))

      return {
        code: 20000,
        data: {
          total: mockList.length,
          items: pageList
        }
      }
    }
  },

  // 获取料框规格详情
  {
    url: /\/vue-admin-template\/mes\/bin-specification\/detail\/\d+/,
    type: 'get',
    response: config => {
      const { url } = config
      const id = url.match(/\/detail\/(\d+)/)[1]
      const item = items.find(item => item.id.toString() === id)
      
      return {
        code: 20000,
        data: item
      }
    }
  },

  // 创建料框规格
  {
    url: '/vue-admin-template/mes/bin-specification/create',
    type: 'post',
    response: config => {
      const { code, name } = config.body

      // 检查规格代码是否已存在
      if (items.some(item => item.code === code)) {
        return {
          code: 50000,
          message: '规格代码已存在'
        }
      }

      const newItem = {
        id: Mock.mock('@increment'),
        code,
        name,
        ...config.body,
        status: 1,
        createTime: Mock.mock('@now'),
        updateTime: Mock.mock('@now')
      }

      items.push(newItem)

      return {
        code: 20000,
        data: {
          id: newItem.id
        }
      }
    }
  },

  // 更新料框规格
  {
    url: '/vue-admin-template/mes/bin-specification/update',
    type: 'put',
    response: config => {
      const { id, code } = config.body
      
      // 检查更新的规格代码是否与其他记录冲突
      const exists = items.some(item => item.code === code && item.id !== id)
      if (exists) {
        return {
          code: 50000,
          message: '规格代码已存在'
        }
      }

      const index = items.findIndex(item => item.id === id)
      if (index >= 0) {
        items[index] = {
          ...items[index],
          ...config.body,
          updateTime: Mock.mock('@now')
        }
        return {
          code: 20000,
          data: 'success'
        }
      } else {
        return {
          code: 50000,
          message: '料框规格不存在'
        }
      }
    }
  },

  // 删除料框规格
  {
    url: /\/vue-admin-template\/mes\/bin-specification\/delete\/\d+/,
    type: 'delete',
    response: config => {
      const { url } = config
      const id = parseInt(url.match(/\/delete\/(\d+)/)[1])
      
      const index = items.findIndex(item => item.id === id)
      if (index >= 0) {
        items.splice(index, 1)
        return {
          code: 20000,
          data: 'success'
        }
      } else {
        return {
          code: 50000,
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
      
      const index = items.findIndex(item => item.id === id)
      if (index >= 0) {
        items[index].status = status
        return {
          code: 20000,
          data: 'success'
        }
      } else {
        return {
          code: 50000,
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
          items: productTypeList.items
        }
      }
    }
  }
] 