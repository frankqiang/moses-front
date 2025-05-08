const Mock = require('mockjs')
// 导入仓库数据
const warehouseModule = require('./warehouse')

// 获取仓库列表数据
// 从warehouse.js模块中提取仓库列表
const warehouseListResponse = warehouseModule.find(api => api.url === '/mes/master-data/warehouse/list-all')
const warehouseList = warehouseListResponse.response().data.items.map(item => ({
  id: item.id,
  name: item.name
}))

// 生成库位模拟数据
const locationList = []
const locationTypes = ['STORAGE', 'RECEIVING', 'SHIPPING', 'STAGING', 'QC']
const locationTypeTextMap = {
  'STORAGE': '存储区',
  'RECEIVING': '收货区',
  'SHIPPING': '发货区',
  'STAGING': '暂存区',
  'QC': '质检区'
}

// 生成模拟数据
for (let i = 1; i <= 50; i++) {
  const warehouseIndex = Math.floor(Math.random() * warehouseList.length)
  const warehouse = warehouseList[warehouseIndex]
  const locationType = locationTypes[Math.floor(Math.random() * locationTypes.length)]
  const capacity = Math.floor(Math.random() * 1500) + 500
  const occupiedCapacity = Math.floor(Math.random() * capacity)
  const lengthDim = 100 + Math.floor(Math.random() * 50)
  const widthDim = 80 + Math.floor(Math.random() * 40)
  const heightDim = 120 + Math.floor(Math.random() * 50)
  
  locationList.push({
    id: i,
    code: `${warehouse.name.charAt(0)}-${String(Math.floor(i/10) + 1).padStart(2, '0')}-${String(i % 10 || 10).padStart(2, '0')}-${String(Math.floor(Math.random() * 5) + 1).padStart(2, '0')}`,
    name: `${warehouse.name}${Math.floor(i/10) + 1}排${i % 10 || 10}列${Math.floor(Math.random() * 5) + 1}层`,
    warehouseId: warehouse.id,
    warehouseName: warehouse.name,
    locationType: locationType,
    locationTypeText: locationTypeTextMap[locationType],
    locationDesc: `${warehouse.name}${Math.floor(i/10) + 1}排${i % 10 || 10}列${Math.floor(Math.random() * 5) + 1}层库位`,
    capacity: capacity,
    occupiedCapacity: occupiedCapacity,
    availableCapacity: capacity - occupiedCapacity,
    dimension: `${lengthDim}x${widthDim}x${heightDim}`,
    length: lengthDim,
    width: widthDim,
    height: heightDim,
    maxWeight: 500 + Math.floor(Math.random() * 1000),
    allowMixed: Math.random() > 0.5,
    remarks: `用于存放${Math.random() > 0.5 ? '原材料' : Math.random() > 0.5 ? '成品' : '半成品'}的库位`,
    status: Math.random() > 0.2 ? 1 : 0 // 80%为启用状态
  })
}

module.exports = [
  // 获取库位列表
  {
    url: '/mes/master-data/storage-location/list',
    type: 'get',
    response: config => {
      const { page = 1, limit = 10, code, name, warehouseId, locationType, status } = config.query

      let mockList = locationList.filter(item => {
        // 按条件过滤
        if (code && !item.code.toLowerCase().includes(code.toLowerCase())) return false
        if (name && !item.name.toLowerCase().includes(name.toLowerCase())) return false
        if (warehouseId && item.warehouseId !== parseInt(warehouseId)) return false
        if (locationType && item.locationType !== locationType) return false
        if (status !== undefined && status !== '' && item.status !== parseInt(status)) return false
        return true
      })

      // 分页处理
      const pageList = mockList.filter((item, index) => {
        const start = (page - 1) * limit
        const end = page * limit
        return index >= start && index < end
      })

      return {
        code: 20000,
        data: {
          total: mockList.length,
          items: pageList
        }
      }
    }
  },

  // 获取库位详情
  {
    url: /\/mes\/master-data\/storage-location\/detail\/\d+/,
    type: 'get',
    response: config => {
      const id = parseInt(config.url.match(/\/detail\/(\d+)/)[1])
      const item = locationList.find(location => location.id === id)

      if (!item) {
        return {
          code: 50004,
          message: '库位不存在'
        }
      }

      return {
        code: 20000,
        data: item
      }
    }
  },

  // 新增库位
  {
    url: '/mes/master-data/storage-location/create',
    type: 'post',
    response: config => {
      const data = config.body
      
      // 生成ID
      const newId = Math.max(...locationList.map(item => item.id)) + 1
      data.id = newId
      
      // 设置其他计算字段
      if (data.warehouseId) {
        const warehouse = warehouseList.find(w => w.id === data.warehouseId)
        if (warehouse) {
          data.warehouseName = warehouse.name
        }
      }
      
      if (data.locationType) {
        data.locationTypeText = locationTypeTextMap[data.locationType] || data.locationType
      }
      
      if (data.capacity !== undefined && data.occupiedCapacity !== undefined) {
        data.availableCapacity = data.capacity - data.occupiedCapacity
      } else if (data.capacity !== undefined) {
        data.occupiedCapacity = 0
        data.availableCapacity = data.capacity
      }
      
      locationList.push(data)
      
      return {
        code: 20000,
        data: {
          id: newId,
          message: '新增成功'
        }
      }
    }
  },

  // 更新库位
  {
    url: '/mes/master-data/storage-location/update',
    type: 'put',
    response: config => {
      const data = config.body
      const index = locationList.findIndex(item => item.id === data.id)
      
      if (index === -1) {
        return {
          code: 50004,
          message: '库位不存在'
        }
      }
      
      // 设置其他计算字段
      if (data.warehouseId) {
        const warehouse = warehouseList.find(w => w.id === data.warehouseId)
        if (warehouse) {
          data.warehouseName = warehouse.name
        }
      }
      
      if (data.locationType) {
        data.locationTypeText = locationTypeTextMap[data.locationType] || data.locationType
      }
      
      if (data.capacity !== undefined && data.occupiedCapacity !== undefined) {
        data.availableCapacity = data.capacity - data.occupiedCapacity
      }
      
      // 更新数据
      locationList.splice(index, 1, {...locationList[index], ...data})
      
      return {
        code: 20000,
        data: {
          message: '更新成功'
        }
      }
    }
  },

  // 删除库位
  {
    url: /\/mes\/master-data\/storage-location\/delete\/\d+/,
    type: 'delete',
    response: config => {
      const id = parseInt(config.url.match(/\/delete\/(\d+)/)[1])
      const index = locationList.findIndex(item => item.id === id)
      
      if (index === -1) {
        return {
          code: 50004,
          message: '库位不存在'
        }
      }
      
      locationList.splice(index, 1)
      
      return {
        code: 20000,
        data: {
          message: '删除成功'
        }
      }
    }
  },

  // 批量删除库位
  {
    url: '/mes/master-data/storage-location/batch-delete',
    type: 'delete',
    response: config => {
      const { ids } = config.body
      
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return {
          code: 40001,
          message: '参数错误'
        }
      }
      
      // 过滤保留未被删除的记录
      const beforeLength = locationList.length
      const idSet = new Set(ids.map(id => parseInt(id)))
      
      for (let i = locationList.length - 1; i >= 0; i--) {
        if (idSet.has(locationList[i].id)) {
          locationList.splice(i, 1)
        }
      }
      
      return {
        code: 20000,
        data: {
          message: `成功删除 ${beforeLength - locationList.length} 条记录`
        }
      }
    }
  },

  // 更新库位状态
  {
    url: '/mes/master-data/storage-location/status',
    type: 'put',
    response: config => {
      // 从请求体中获取ID和状态
      const { id, status } = config.body
      
      const index = locationList.findIndex(item => item.id === parseInt(id))
      
      if (index === -1) {
        return {
          code: 50004,
          message: '库位不存在'
        }
      }
      
      locationList[index].status = parseInt(status)
      
      return {
        code: 20000,
        data: {
          message: `状态更新成功`
        }
      }
    }
  },

  // 批量更新库位状态
  {
    url: '/mes/master-data/storage-location/batch-status',
    type: 'put',
    response: config => {
      const { ids, status } = config.body
      
      if (!ids || !Array.isArray(ids) || ids.length === 0 || status === undefined) {
        return {
          code: 40001,
          message: '参数错误'
        }
      }
      
      let count = 0
      const idSet = new Set(ids.map(id => parseInt(id)))
      
      locationList.forEach(item => {
        if (idSet.has(item.id)) {
          item.status = parseInt(status)
          count++
        }
      })
      
      return {
        code: 20000,
        data: {
          message: `成功更新 ${count} 条记录的状态`
        }
      }
    }
  },

  // 导入数据
  {
    url: '/mes/master-data/storage-location/import',
    type: 'post',
    response: config => {
      // 模拟导入成功
      return {
        code: 20000,
        data: {
          success: true,
          totalCount: 15,
          message: '数据导入成功'
        }
      }
    }
  },

  // 导出数据
  {
    url: '/mes/master-data/storage-location/export',
    type: 'get',
    response: config => {
      // Mock不支持二进制响应，实际上这个API会返回Excel文件
      // 这里只是模拟API调用成功
      return {
        code: 20000
      }
    }
  },

  // 下载模板
  {
    url: '/mes/master-data/storage-location/template',
    type: 'get',
    response: config => {
      // Mock不支持二进制响应，实际上这个API会返回Excel文件
      // 这里只是模拟API调用成功
      return {
        code: 20000
      }
    }
  }
] 