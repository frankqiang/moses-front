/**
 * 仓库管理Mock数据
 * 描述：模拟仓库管理相关API响应
 * 创建日期：2023-11-01
 */

const Mock = require('mockjs')
const { param2Obj } = require('../utils')

// 仓库类型
const warehouseTypes = ['RAW', 'FINISHED', 'SEMI', 'CONSUMABLE', 'SPARE_PARTS']
const warehouseTypeTextMap = {
  'RAW': '原材料仓库',
  'FINISHED': '成品仓库',
  'SEMI': '半成品仓库',
  'CONSUMABLE': '耗材仓库',
  'SPARE_PARTS': '备件仓库'
}

// 生成仓库模拟数据
const warehouseList = []

// 预设一些基础仓库
const baseWarehouses = [
  { id: 1, code: 'WH-RAW-001', name: '原材料仓库', type: 'RAW', address: '厂区东侧1号楼' },
  { id: 2, code: 'WH-FIN-001', name: '成品仓库', type: 'FINISHED', address: '厂区西侧2号楼' },
  { id: 3, code: 'WH-SEMI-001', name: '半成品仓库', type: 'SEMI', address: '厂区中部3号楼' },
]

// 添加预设仓库
baseWarehouses.forEach(warehouse => {
  warehouseList.push({
    id: warehouse.id,
    code: warehouse.code,
    name: warehouse.name,
    warehouseType: warehouse.type,
    warehouseTypeText: warehouseTypeTextMap[warehouse.type],
    address: warehouse.address,
    area: Math.floor(Math.random() * 5000) + 3000,
    manager: Mock.mock('@cname'),
    contact: Mock.mock(/^1[3-9]\d{9}$/),
    maxCapacity: Math.floor(Math.random() * 10000) + 5000,
    currentUsage: Math.floor(Math.random() * 5000),
    description: `${warehouseTypeTextMap[warehouse.type]}，用于存放${warehouse.type === 'RAW' ? '原材料' : warehouse.type === 'FINISHED' ? '成品' : '半成品'}`,
    status: 1,
    createTime: Mock.mock('@datetime'),
    updateTime: Mock.mock('@datetime')
  })
})

// 生成更多随机仓库数据
for (let i = 4; i <= 20; i++) {
  const warehouseType = warehouseTypes[Math.floor(Math.random() * warehouseTypes.length)]
  const area = Math.floor(Math.random() * 5000) + 1000
  const maxCapacity = Math.floor(Math.random() * 10000) + 3000
  const currentUsage = Math.floor(Math.random() * maxCapacity)
  
  warehouseList.push({
    id: i,
    code: `WH-${warehouseType}-${String(i).padStart(3, '0')}`,
    name: `${warehouseTypeTextMap[warehouseType]}-${i}`,
    warehouseType: warehouseType,
    warehouseTypeText: warehouseTypeTextMap[warehouseType],
    address: `厂区${Math.random() > 0.5 ? '东' : Math.random() > 0.5 ? '南' : Math.random() > 0.5 ? '西' : '北'}区${Math.floor(Math.random() * 5) + 1}号楼`,
    area: area,
    manager: Mock.mock('@cname'),
    contact: Mock.mock(/^1[3-9]\d{9}$/),
    maxCapacity: maxCapacity,
    currentUsage: currentUsage,
    description: `${warehouseTypeTextMap[warehouseType]}，主要用于存放${warehouseType === 'RAW' ? '原材料' : warehouseType === 'FINISHED' ? '成品' : warehouseType === 'SEMI' ? '半成品' : warehouseType === 'CONSUMABLE' ? '生产耗材' : '机器备件'}`,
    status: Math.random() > 0.2 ? 1 : 0, // 80%为启用状态
    createTime: Mock.mock('@datetime'),
    updateTime: Mock.mock('@datetime')
  })
}

module.exports = [
  // 获取仓库列表（分页）
  {
    url: '/mes/master-data/warehouse/list',
    type: 'get',
    response: config => {
      const { page = 1, limit = 10, code, name, warehouseType, status } = config.query

      let mockList = warehouseList.filter(item => {
        // 按条件过滤
        if (code && !item.code.toLowerCase().includes(code.toLowerCase())) return false
        if (name && !item.name.toLowerCase().includes(name.toLowerCase())) return false
        if (warehouseType && item.warehouseType !== warehouseType) return false
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

  // 获取所有仓库（不分页，用于下拉选择）
  {
    url: '/mes/master-data/warehouse/list-all',
    type: 'get',
    response: () => {
      return {
        code: 20000,
        data: {
          items: warehouseList.map(item => ({
            id: item.id,
            code: item.code,
            name: item.name,
            warehouseType: item.warehouseType,
            warehouseTypeText: item.warehouseTypeText,
            status: item.status
          }))
        }
      }
    }
  },

  // 获取仓库详情
  {
    url: /\/mes\/master-data\/warehouse\/detail\/\d+/,
    type: 'get',
    response: config => {
      const id = parseInt(config.url.match(/\/detail\/(\d+)/)[1])
      const item = warehouseList.find(warehouse => warehouse.id === id)

      if (!item) {
        return {
          code: 50004,
          message: '仓库不存在'
        }
      }

      return {
        code: 20000,
        data: item
      }
    }
  },

  // 新增仓库
  {
    url: '/mes/master-data/warehouse/create',
    type: 'post',
    response: config => {
      const data = config.body
      
      // 生成ID
      const newId = Math.max(...warehouseList.map(item => item.id)) + 1
      data.id = newId
      
      // 设置其他计算字段
      if (data.warehouseType) {
        data.warehouseTypeText = warehouseTypeTextMap[data.warehouseType] || data.warehouseType
      }
      
      // 添加创建时间和更新时间
      data.createTime = new Date().toISOString()
      data.updateTime = new Date().toISOString()
      
      // 添加到列表
      warehouseList.push(data)
      
      // 获取当前查询参数，确保返回最新的数据
      const { page = 1, limit = 10 } = config.query || { page: 1, limit: 10 }
      
      // 返回最新的列表数据
      const mockList = [...warehouseList]
      
      // 分页处理
      const pageList = mockList.filter((item, index) => {
        const start = (page - 1) * limit
        const end = page * limit
        return index >= start && index < end
      })
      
      return {
        code: 20000,
        data: {
          id: newId,
          message: '新增成功',
          total: mockList.length,
          items: pageList
        }
      }
    }
  },

  // 更新仓库
  {
    url: '/mes/master-data/warehouse/update',
    type: 'put',
    response: config => {
      const data = config.body
      const index = warehouseList.findIndex(item => item.id === data.id)
      
      if (index === -1) {
        return {
          code: 50004,
          message: '仓库不存在'
        }
      }
      
      // 设置其他计算字段
      if (data.warehouseType) {
        data.warehouseTypeText = warehouseTypeTextMap[data.warehouseType] || data.warehouseType
      }
      
      // 更新时间
      data.updateTime = new Date().toISOString()
      
      // 更新数据
      warehouseList.splice(index, 1, {...warehouseList[index], ...data})
      
      // 获取当前查询参数，确保返回最新的数据
      const { page = 1, limit = 10 } = config.query || { page: 1, limit: 10 }
      
      // 返回最新的列表数据
      const mockList = [...warehouseList]
      
      // 分页处理
      const pageList = mockList.filter((item, index) => {
        const start = (page - 1) * limit
        const end = page * limit
        return index >= start && index < end
      })
      
      return {
        code: 20000,
        data: {
          message: '更新成功',
          total: mockList.length,
          items: pageList
        }
      }
    }
  },

  // 删除仓库
  {
    url: /\/mes\/master-data\/warehouse\/delete\/\d+/,
    type: 'delete',
    response: config => {
      const id = parseInt(config.url.match(/\/delete\/(\d+)/)[1])
      const index = warehouseList.findIndex(item => item.id === id)
      
      if (index === -1) {
        return {
          code: 50004,
          message: '仓库不存在'
        }
      }
      
      warehouseList.splice(index, 1)
      
      return {
        code: 20000,
        data: {
          message: '删除成功'
        }
      }
    }
  },

  // 批量删除仓库
  {
    url: '/mes/master-data/warehouse/batch-delete',
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
      const beforeLength = warehouseList.length
      const idSet = new Set(ids.map(id => parseInt(id)))
      
      for (let i = warehouseList.length - 1; i >= 0; i--) {
        if (idSet.has(warehouseList[i].id)) {
          warehouseList.splice(i, 1)
        }
      }
      
      return {
        code: 20000,
        data: {
          message: `成功删除 ${beforeLength - warehouseList.length} 条记录`
        }
      }
    }
  },

  // 更新仓库状态
  {
    url: '/mes/master-data/warehouse/status',
    type: 'put',
    response: config => {
      const { id, status } = config.body
      const item = warehouseList.find(warehouse => warehouse.id === id)
      
      if (!item) {
        return {
          code: 50004,
          message: '仓库不存在'
        }
      }
      
      item.status = status
      item.updateTime = new Date().toISOString()
      
      return {
        code: 20000,
        data: {
          message: '状态更新成功'
        }
      }
    }
  },

  // 批量更新仓库状态
  {
    url: '/mes/master-data/warehouse/batch-status',
    type: 'put',
    response: config => {
      const { ids, status } = config.body
      
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return {
          code: 40001,
          message: '参数错误'
        }
      }
      
      const idSet = new Set(ids.map(id => parseInt(id)))
      let count = 0
      
      warehouseList.forEach(item => {
        if (idSet.has(item.id)) {
          item.status = status
          item.updateTime = new Date().toISOString()
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

  // 导入仓库数据（模拟）
  {
    url: '/mes/master-data/warehouse/import',
    type: 'post',
    response: () => {
      // 模拟导入成功
      return {
        code: 20000,
        data: {
          message: '导入成功',
          total: 5,
          success: 4,
          fail: 1,
          errors: [
            { row: 3, message: '仓库编码已存在' }
          ]
        }
      }
    }
  },

  // 导出仓库数据（模拟）
  {
    url: '/mes/master-data/warehouse/export',
    type: 'get',
    response: () => {
      // 模拟导出成功
      return {
        code: 20000,
        data: {
          message: '导出成功'
        }
      }
    }
  },

  // 下载导入模板（模拟）
  {
    url: '/mes/master-data/warehouse/template',
    type: 'get',
    response: () => {
      // 模拟下载成功
      return {
        code: 20000,
        data: {
          message: '模板下载成功'
        }
      }
    }
  }
] 