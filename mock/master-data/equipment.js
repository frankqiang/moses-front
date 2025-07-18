/**
 * 设备主数据管理Mock数据
 * 描述：模拟设备主数据管理的后端API响应
 * 创建日期：2023-11-05
 */

const Mock = require('mockjs')
const { param2Obj } = require('../utils/index')

// 退火炉数据
const furnaceData = Mock.mock({
  'items|12': [{
    id: '@increment',
    'equipmentId|+1': function() {
      return 'FURN-' + String(this.id).padStart(3, '0')
    },
    name: function() {
      return this.id + '号退火炉'
    },
    model: function() {
      const models = ['HX-T40A', 'HX-T35B', 'HX-T50C', 'HX-T30D']
      return models[this.id % models.length]
    },
    furnaceTypeCode: function() {
      return ['FT-STANDARD', 'FT-SINGLE', 'FT-RAPID', 'FT-BASIC'][this.id % 4]
    },
    furnaceTypeName: function() {
      const names = ['标准双区退火炉', '单区退火炉', '快速退火炉', '基础型退火炉']
      return names[this.id % 4]
    },
    capacity: function() {
      return [35, 40, 45, 50][this.id % 4]
    },
    maxTemperature: function() {
      return [800, 950, 1050, 1150][this.id % 4]
    },
    ratedPower: function() {
      return [300, 350, 400, 450][this.id % 4]
    },
    plcAddress: function() {
      return '192.168.1.' + (10 + this.id) + ':502'
    },
    maintenanceCycle: function() {
      return [60, 90, 120][this.id % 3]
    },
    installDate: '@date("yyyy-MM-dd")',
    supplier: '设备供应商@integer(1, 5)',
    remarks: '@sentence(5, 10)',
    status: '@integer(0, 1)',
    createTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
    updateTime: '@datetime("yyyy-MM-dd HH:mm:ss")'
  }]
})

// 行车数据
const craneData = Mock.mock({
  'items|5': [{
    id: '@increment(100)',
    'equipmentId|+1': function() {
      return 'CRANE-' + String(this.id - 100).padStart(3, '0')
    },
    name: function() {
      return this.id - 100 + '号行车'
    },
    model: function() {
      const models = ['QD-10T', 'QD-15T', 'QD-20T', 'QD-5T']
      return models[(this.id - 100) % models.length]
    },
    liftCapacity: function() {
      return [5, 10, 15, 20][(this.id - 100) % 4]
    },
    movingSpeed: function() {
      return '主0-' + ([20, 25, 30][(this.id - 100) % 3]) + ' / 副0-' + ([40, 50, 60][(this.id - 100) % 3])
    },
    serviceArea: function() {
      const areas = ['A区1-5炉', 'B区缓存位', 'C区装车位', 'D区检查台']
      return [areas[(this.id - 100) % 4], areas[((this.id - 100) + 1) % 4]].join(',')
    },
    controlInterface: function() {
      return 'TCP:192.168.1.' + (20 + (this.id - 100)) + ':10001'
    },
    installDate: '@date("yyyy-MM-dd")',
    supplier: '行车供应商@integer(1, 3)',
    remarks: '@sentence(5, 10)',
    status: '@integer(0, 1)',
    createTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
    updateTime: '@datetime("yyyy-MM-dd HH:mm:ss")'
  }]
})

// 自动料车数据
const autoCartData = Mock.mock({
  'items|8': [{
    id: '@increment(200)',
    'equipmentId|+1': function() {
      return 'CART-' + String(this.id - 200).padStart(3, '0')
    },
    name: function() {
      return this.id - 200 + '号自动料车'
    },
    model: function() {
      const models = ['AGV-5T', 'AGV-8T', 'AGV-3T', 'AGV-10T']
      return models[(this.id - 200) % models.length]
    },
    loadCapacity: function() {
      return [3, 5, 8, 10][(this.id - 200) % 4]
    },
    movingSpeed: function() {
      return [20, 25, 30, 15][(this.id - 200) % 4]
    },
    navigationMode: function() {
      return ['LASER', 'MAGNETIC', 'VISION', 'INERTIAL'][(this.id - 200) % 4]
    },
    chargingType: function() {
      return ['AUTO', 'MANUAL', 'BATTERY_SWAP'][(this.id - 200) % 3]
    },
    installDate: '@date("yyyy-MM-dd")',
    supplier: '料车供应商@integer(1, 3)',
    remarks: '@sentence(5, 10)',
    status: '@integer(0, 1)',
    createTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
    updateTime: '@datetime("yyyy-MM-dd HH:mm:ss")'
  }]
})

// 备料台数据
const stagingTableData = Mock.mock({
  'items|3': [{
    id: '@increment(300)',
    'equipmentId|+1': function() {
      return 'TABLE-' + String(this.id - 300).padStart(3, '0')
    },
    name: function() {
      return this.id - 300 + '号备料台'
    },
    model: function() {
      const models = ['ST-10T', 'ST-15T', 'ST-20T']
      return models[(this.id - 300) % models.length]
    },
    bearingCapacity: function() {
      return [10, 15, 20][(this.id - 300) % 3]
    },
    dimensions: function() {
      return ['3.5×2.0×0.8', '4.0×2.5×0.9', '3.0×2.0×0.7'][(this.id - 300) % 3]
    },
    surfaceMaterial: function() {
      return ['CARBON_STEEL', 'STAINLESS_STEEL', 'ALLOY_STEEL'][(this.id - 300) % 3]
    },
    functionType: function() {
      return ['FIXED', 'MOVABLE', 'ADJUSTABLE_HEIGHT', 'MULTI_FUNCTION'][(this.id - 300) % 4]
    },
    installDate: '@date("yyyy-MM-dd")',
    supplier: '备料台供应商@integer(1, 2)',
    remarks: '@sentence(5, 10)',
    status: '@integer(0, 1)',
    createTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
    updateTime: '@datetime("yyyy-MM-dd HH:mm:ss")'
  }]
})

// 获取设备列表
function getEquipmentList(config) {
  const { equipmentType, page = 1, limit = 10, keyword, status } = param2Obj(config.url)
  
  let sourceData = []
  
  // 根据设备类型选择对应的数据
  if (equipmentType === 'FURNACE') {
    sourceData = furnaceData.items
  } else if (equipmentType === 'CRANE') {
    sourceData = craneData.items
  } else if (equipmentType === 'AUTO_CART') {
    sourceData = autoCartData.items
  } else if (equipmentType === 'STAGING_TABLE') {
    sourceData = stagingTableData.items
  } else {
    // 如果未指定类型，则返回所有数据
    sourceData = [
      ...furnaceData.items,
      ...craneData.items,
      ...autoCartData.items,
      ...stagingTableData.items
    ]
  }
  
  // 过滤数据
  let filteredData = sourceData
  
  if (keyword) {
    const keywordLower = keyword.toLowerCase()
    filteredData = filteredData.filter(item => {
      return (
        (item.equipmentId && item.equipmentId.toLowerCase().includes(keywordLower)) ||
        (item.name && item.name.toLowerCase().includes(keywordLower)) ||
        (item.model && item.model.toLowerCase().includes(keywordLower))
      )
    })
  }
  
  if (status !== undefined && status !== '') {
    filteredData = filteredData.filter(item => item.status === parseInt(status))
  }
  
  // 统计各类型设备数量
  const countByType = {
    FURNACE: furnaceData.items.length,
    CRANE: craneData.items.length,
    AUTO_CART: autoCartData.items.length,
    STAGING_TABLE: stagingTableData.items.length
  }
  
  // 分页
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + parseInt(limit)
  const pageData = filteredData.slice(startIndex, endIndex)
  
  return {
    code: 20000,
    data: {
      total: filteredData.length,
      items: pageData,
      countByType
    }
  }
}

// 获取设备详情
function getEquipmentDetail(config) {
  const id = config.url.match(/\/detail\/(\d+)/)[1]
  
  // 所有设备数据
  const allData = [
    ...furnaceData.items,
    ...craneData.items,
    ...autoCartData.items,
    ...stagingTableData.items
  ]
  
  // 将ID转换为数字进行比较
  const equipment = allData.find(item => item.id == id)
  
  if (!equipment) {
    return {
      code: 50000,
      message: '设备不存在'
    }
  }
  
  return {
    code: 20000,
    data: equipment
  }
}

// 创建设备
function createEquipment(config) {
  const { body } = config
  
  console.log('创建设备请求体:', body)
  
  // 根据设备类型，确定ID起始值和数据数组
  let startId = 1;
  let targetData;
  
  if (body.equipmentType === 'FURNACE') {
    startId = 1;
    targetData = furnaceData.items;
    
  } else if (body.equipmentType === 'CRANE') {
    startId = 100;
    targetData = craneData.items;
  } else if (body.equipmentType === 'AUTO_CART') {
    startId = 200;
    targetData = autoCartData.items;
  } else if (body.equipmentType === 'STAGING_TABLE') {
    startId = 300;
    targetData = stagingTableData.items;
  } else {
    return {
      code: 50000,
      message: '无效的设备类型'
    };
  }
  
  // 如果未提供设备ID，则自动生成
  if (!body.equipmentId) {
    const prefix = {
      FURNACE: 'FURN-',
      CRANE: 'CRANE-',
      AUTO_CART: 'CART-',
      STAGING_TABLE: 'TABLE-'
    }[body.equipmentType]
    
    const newId = startId + targetData.length;
    body.equipmentId = prefix + String(newId).padStart(3, '0')
  }
  
  // 创建时间和更新时间
  const now = new Date()
  body.createTime = now.toISOString()
  body.updateTime = now.toISOString()
  
  // 分配ID (确保ID唯一)
  body.id = startId + targetData.length;
  
  // 添加到对应的数据数组中
  targetData.push(body);
  
  return {
    code: 20000,
    data: body
  }
}

// 更新设备
function updateEquipment(config) {
  const { body } = config
  
  console.log('更新设备请求体:', body)
  
  // 所有设备数据
  const allData = [
    ...furnaceData.items,
    ...craneData.items,
    ...autoCartData.items,
    ...stagingTableData.items
  ]
  
  // 使用非严格相等来比较ID
  const equipment = allData.find(item => item.id == body.id)
  
  if (!equipment) {
    return {
      code: 50000,
      message: '设备不存在'
    }
  }
  
  // 更新时间
  body.updateTime = new Date().toISOString()
  

  
  // 更新数据
  Object.assign(equipment, body)
  
  console.log('设备更新后:', equipment)
  
  return {
    code: 20000,
    data: equipment
  }
}

// 更新设备状态
function updateEquipmentStatus(config) {
  const { body } = config
  const { id, status } = body
  
  // 所有设备数据
  const allData = [
    ...furnaceData.items,
    ...craneData.items,
    ...autoCartData.items,
    ...stagingTableData.items
  ]
  
  // 使用非严格相等来比较ID
  const equipment = allData.find(item => item.id == id)
  
  if (!equipment) {
    return {
      code: 50000,
      message: '设备不存在'
    }
  }
  
  // 更新状态
  equipment.status = parseInt(status)
  equipment.updateTime = new Date().toISOString()
  
  return {
    code: 20000,
    data: equipment
  }
}

// 批量删除设备
function batchDeleteEquipment(config) {
  const { body } = config
  const { ids } = body
  
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return {
      code: 50000,
      message: '无效的删除请求'
    }
  }
  
  // 实际从数据中删除
  const deleteFromArray = (array, idsToDelete) => {
    let count = 0;
    for (let i = array.length - 1; i >= 0; i--) {
      if (idsToDelete.includes(array[i].id)) {
        array.splice(i, 1);
        count++;
      }
    }
    return count;
  };
  
  // 从各个数据数组中删除
  const deletedCount = 
    deleteFromArray(furnaceData.items, ids) +
    deleteFromArray(craneData.items, ids) +
    deleteFromArray(autoCartData.items, ids) +
    deleteFromArray(stagingTableData.items, ids);
  
  return {
    code: 20000,
    data: {
      success: true,
      message: `成功删除${deletedCount}个设备`
    }
  }
}

// 批量更新设备状态
function batchUpdateEquipmentStatus(config) {
  const { body } = config
  const { ids, status } = body
  
  // 所有设备数据
  const allData = [
    ...furnaceData.items,
    ...craneData.items,
    ...autoCartData.items,
    ...stagingTableData.items
  ]
  
  // 筛选符合条件的设备
  const equipments = allData.filter(item => ids.includes(item.id))
  
  // 更新状态
  equipments.forEach(equipment => {
    equipment.status = parseInt(status)
    equipment.updateTime = new Date().toISOString()
  })
  
  return {
    code: 20000,
    data: {
      success: true,
      message: `成功更新${equipments.length}个设备的状态`
    }
  }
}

module.exports = [
  // 获取设备列表
  {
    url: '/mes/master-data/equipment/list',
    type: 'get',
    response: getEquipmentList
  },
  // 获取设备详情
  {
    url: '/mes/master-data/equipment/detail/\\d+',
    type: 'get',
    response: getEquipmentDetail
  },
  // 创建设备
  {
    url: '/mes/master-data/equipment/create',
    type: 'post',
    response: createEquipment
  },
  // 更新设备
  {
    url: '/mes/master-data/equipment/update',
    type: 'put',
    response: updateEquipment
  },
  // 更新设备状态
  {
    url: '/mes/master-data/equipment/status',
    type: 'put',
    response: updateEquipmentStatus
  },
  // 批量删除设备
  {
    url: '/mes/master-data/equipment/batch-delete',
    type: 'delete',
    response: batchDeleteEquipment
  },
  // 批量更新设备状态
  {
    url: '/mes/master-data/equipment/batch-status',
    type: 'put',
    response: batchUpdateEquipmentStatus
  }
]