const Mock = require('mockjs')

// 生成炉型数据
const generateFurnaceTypes = () => {
  const types = [
    {
      id: 1,
      furnaceTypeCode: 'FT-STANDARD',
      furnaceTypeName: '标准双区退火炉',
      status: 'enabled',
      description: '标准双区退火炉，支持完整工艺控制',
      maxSegments: 12,
      hasRearCirculationFan: true,
      hasVacuumFan: true,
      hasPurgeValve: true,
      hasCoolingFan: true,
      supportedAtmosphereTypes: ['纯氮气', '氢氮混合气'],
      maxTemperatureLimit: 1000,
      hasPressureControl: true,
      equipmentCount: 5,
      templateCount: 8,
      createdBy: 'admin',
      createdAt: '2024-01-01 10:00:00',
      updatedBy: 'admin',
      updatedAt: '2024-01-01 10:00:00'
    },
    {
      id: 2,
      furnaceTypeCode: 'FT-SINGLE',
      furnaceTypeName: '单区退火炉',
      status: 'enabled',
      description: '单区退火炉，适用于简单工艺',
      maxSegments: 8,
      hasRearCirculationFan: false,
      hasVacuumFan: true,
      hasPurgeValve: true,
      hasCoolingFan: false,
      supportedAtmosphereTypes: ['纯氮气'],
      maxTemperatureLimit: 800,
      hasPressureControl: false,
      equipmentCount: 3,
      templateCount: 5,
      createdBy: 'admin',
      createdAt: '2024-01-02 10:00:00',
      updatedBy: 'admin',
      updatedAt: '2024-01-02 10:00:00'
    },
    {
      id: 3,
      furnaceTypeCode: 'FT-RAPID',
      furnaceTypeName: '快速退火炉',
      status: 'enabled',
      description: '快速退火炉，支持高温和快速升温',
      maxSegments: 12,
      hasRearCirculationFan: true,
      hasVacuumFan: true,
      hasPurgeValve: true,
      hasCoolingFan: true,
      supportedAtmosphereTypes: ['纯氮气', '氢氮混合气', '真空'],
      maxTemperatureLimit: 1200,
      hasPressureControl: true,
      equipmentCount: 2,
      templateCount: 4,
      createdBy: 'admin',
      createdAt: '2024-01-03 10:00:00',
      updatedBy: 'admin',
      updatedAt: '2024-01-03 10:00:00'
    },
    {
      id: 4,
      furnaceTypeCode: 'FT-BASIC',
      furnaceTypeName: '基础型退火炉',
      status: 'disabled',
      description: '基础型退火炉，功能较为简单，适用于简单工艺和培训',
      maxSegments: 5,
      hasRearCirculationFan: false,
      hasVacuumFan: false,
      hasPurgeValve: false,
      hasCoolingFan: false,
      supportedAtmosphereTypes: ['纯氮气'],
      maxTemperatureLimit: 600,
      hasPressureControl: false,
      equipmentCount: 0,
      templateCount: 1,
      createdBy: 'admin',
      createdAt: '2024-01-04 10:00:00',
      updatedBy: 'admin',
      updatedAt: '2024-01-04 10:00:00'
    },
    {
      id: 5,
      furnaceTypeCode: 'FT-HIGH-TEMP',
      furnaceTypeName: '高温退火炉',
      status: 'enabled',
      description: '高温退火炉，支持1500°C极高温工艺',
      maxSegments: 15,
      hasRearCirculationFan: true,
      hasVacuumFan: true,
      hasPurgeValve: true,
      hasCoolingFan: true,
      supportedAtmosphereTypes: ['纯氮气', '氢氮混合气', '真空', '氦气'],
      maxTemperatureLimit: 1500,
      hasPressureControl: true,
      equipmentCount: 1,
      templateCount: 3,
      createdBy: 'admin',
      createdAt: '2024-01-05 10:00:00',
      updatedBy: 'admin',
      updatedAt: '2024-01-05 10:00:00'
    }
  ]

  // 使用Mock.js生成更多数据
  const randomTypes = Mock.mock({
    'items|20': [{
      'id|+1': 6,
      'furnaceTypeCode': () => `FT-${Mock.Random.string('upper', 3, 5)}-${Mock.Random.integer(100, 999)}`,
      'furnaceTypeName': () => `${Mock.Random.ctitle(2, 4)}退火炉`,
      'status|1': ['enabled', 'disabled'],
      'description': '@csentence(10, 20)',
      'maxSegments|5-20': 10,
      'hasRearCirculationFan|1': [true, false],
      'hasVacuumFan|1': [true, false],
      'hasPurgeValve|1': [true, false],
      'hasCoolingFan|1': [true, false],
      'supportedAtmosphereTypes': () => {
        const options = ['纯氮气', '氢氮混合气', '真空', '氦气'];
        const count = Mock.Random.integer(1, 4);
        const selected = [];
        for(let i = 0; i < count; i++) {
          const idx = Mock.Random.integer(0, options.length - 1);
          if (!selected.includes(options[idx])) {
            selected.push(options[idx]);
          }
        }
        return selected;
      },
      'maxTemperatureLimit|600-1500': 1000,
      'hasPressureControl|1': [true, false],
      'equipmentCount|0-5': 0,
      'templateCount|0-8': 0,
      'createdBy': '@cname',
      'createdAt': () => {
        const date = Mock.Random.datetime('yyyy-MM-dd HH:mm:ss');
        return date;
      },
      'updatedBy': '@cname',
      'updatedAt': () => {
        const date = Mock.Random.datetime('yyyy-MM-dd HH:mm:ss');
        return date;
      }
    }]
  }).items

  return [...types, ...randomTypes]
}

// 生成关联设备数据
const generateRelatedEquipment = (furnaceTypeId) => {
  return Mock.mock({
    'items|1-5': [{
      'equipmentId': /EQ[0-9]{4}/,
      'name': () => `${Mock.Random.ctitle(2, 4)}退火炉设备`,
      'model': () => `Model-${Mock.Random.string('upper', 2)}-${Mock.Random.integer(100, 999)}`,
      'status|1': ['enabled', 'disabled', 'maintenance'],
      'installDate': '@date("yyyy-MM-dd")'
    }]
  }).items
}

// 生成关联工艺模板数据
const generateRelatedTemplates = (furnaceTypeId) => {
  return Mock.mock({
    'items|1-8': [{
      'templateId': /TPL[0-9]{4}/,
      'templateName': () => `${Mock.Random.ctitle(2, 6)}工艺`,
      'version': /[1-9]\.[0-9]/,
      'status|1': ['draft', 'pending', 'effective', 'history'],
      'createdAt': () => {
        const date = Mock.Random.datetime('yyyy-MM-dd HH:mm:ss');
        return date;
      }
    }]
  }).items
}

// 初始化炉型数据
const furnaceTypes = generateFurnaceTypes()
console.log('Mock服务初始化了', furnaceTypes.length, '条炉型数据')

// 生成关联数据缓存
const relatedEquipmentCache = new Map()
const relatedTemplatesCache = new Map()

// 将ISO格式时间转换为易读格式
function formatDatetime(isoTime) {
  if (!isoTime) return '';
  // 处理ISO时间格式
  if (isoTime.includes('T')) {
    return isoTime.replace('T', ' ').split('.')[0];
  }
  return isoTime;
}

module.exports = [
  // 获取炉型列表
  {
    url: '/mes/master-data/furnace-type/list',
    type: 'get',
    response: config => {
      const { page = 1, limit = 10, keyword, status } = config.query

      console.log('Mock服务接收到请求参数:', config.query)
      let filteredData = [...furnaceTypes]

      // 关键词过滤
      if (keyword) {
        const lowerKeyword = keyword.toLowerCase()
        filteredData = filteredData.filter(
          item => (item.furnaceTypeCode && item.furnaceTypeCode.toLowerCase().includes(lowerKeyword)) || 
                 (item.furnaceTypeName && item.furnaceTypeName.toLowerCase().includes(lowerKeyword))
        )
      }

      // 状态过滤
      if (status) {
        filteredData = filteredData.filter(item => item.status === status)
      }

      // 分页
      const pageList = filteredData.slice((page - 1) * limit, page * limit)   

     

      return {
        code: 20000,
        data: {
          total: filteredData.length,
          items: pageList
        }
      }
    }
  },

  // 获取炉型详情
  {
    url: '/mes/master-data/furnace-type/detail/:id',
    type: 'get',
    response: config => {
      const { id } = config.params
      const furnaceType = furnaceTypes.find(item => item.furnaceTypeCode === id)

      if (!furnaceType) {
        return {
          code: 40004,
          message: '炉型不存在'
        }
      }

      return {
        code: 20000,
        data: furnaceType
      }
    }
  },

  // 创建炉型
  {
    url: '/mes/master-data/furnace-type/create',
    type: 'post',
    response: config => {
      const { furnaceTypeCode } = config.body

      // 检查编码是否重复
      if (furnaceTypes.some(item => item.furnaceTypeCode === furnaceTypeCode)) {
        return {
          code: 40001,
          message: '炉型编码已存在'
        }
      }

      const newId = furnaceTypes.length > 0 ? Math.max(...furnaceTypes.map(item => item.id)) + 1 : 1
      const now = new Date();
      const formattedTime = now.toISOString().replace('T', ' ').split('.')[0];
      
      const newFurnaceType = {
        id: newId,
        ...config.body,
        equipmentCount: 0,
        templateCount: 0,
        createdBy: 'admin',
        createdAt: formattedTime,
        updatedBy: 'admin',
        updatedAt: formattedTime
      }

      furnaceTypes.push(newFurnaceType)

      return {
        code: 20000,
        data: {
          id: furnaceTypeCode,
          message: '创建成功'
        }
      }
    }
  },

  // 更新炉型
  {
    url: '/mes/master-data/furnace-type/update',
    type: 'put',
    response: config => {
      const { id, furnaceTypeCode } = config.body
      const index = furnaceTypes.findIndex(item => item.furnaceTypeCode === id)

      if (index === -1) {
        return {
          code: 40004,
          message: '炉型不存在'
        }
      }

      // 检查编码是否与其他记录重复
      if (furnaceTypeCode !== id && 
          furnaceTypes.some(item => item.furnaceTypeCode === furnaceTypeCode)) {
        return {
          code: 40001,
          message: '炉型编码已存在'
        }
      }

      // 保留原有不可修改的字段
      const { id: originalId, equipmentCount, templateCount, createdBy, createdAt } = furnaceTypes[index]
      const now = new Date();
      const formattedTime = now.toISOString().replace('T', ' ').split('.')[0];
      
      // 更新记录
      furnaceTypes[index] = {
        ...config.body,
        id: originalId,
        equipmentCount,
        templateCount,
        createdBy,
        createdAt,
        updatedBy: 'admin',
        updatedAt: formattedTime
      }

      return {
        code: 20000,
        data: {
          message: '更新成功'
        }
      }
    }
  },

  // 删除炉型
  {
    url: '/mes/master-data/furnace-type/delete/:id',
    type: 'delete',
    response: config => {
      const { id } = config.params || {}
      // 如果是路径参数，从URL中获取ID
      const pathId = config.url.split('/').pop()
      const furnaceTypeId = id || pathId
      
      const index = furnaceTypes.findIndex(item => item.furnaceTypeCode === furnaceTypeId)

      if (index === -1) {
        return {
          code: 40004,
          message: '炉型不存在'
        }
      }

      // 检查是否有关联设备或模板
      if (furnaceTypes[index].equipmentCount > 0 || furnaceTypes[index].templateCount > 0) {
        return {
          code: 40003,
          message: '该炉型已关联设备或工艺模板，无法删除'
        }
      }

      // 删除炉型
      furnaceTypes.splice(index, 1)

      return {
        code: 20000,
        data: {
          message: '删除成功'
        }
      }
    }
  },

  // 更改炉型状态
  {
    url: '/mes/master-data/furnace-type/status',
    type: 'put',
    response: config => {
      const { id, status } = config.body
      const index = furnaceTypes.findIndex(item => item.furnaceTypeCode === id)

      if (index === -1) {
        return {
          code: 40004,
          message: '炉型不存在'
        }
      }

      furnaceTypes[index].status = status
      furnaceTypes[index].updatedBy = 'admin'
      const now = new Date();
      furnaceTypes[index].updatedAt = now.toISOString().replace('T', ' ').split('.')[0];

      return {
        code: 20000,
        data: {
          message: '状态更新成功'
        }
      }
    }
  },

  // 批量删除炉型
  {
    url: '/mes/master-data/furnace-type/batch-delete',
    type: 'delete',
    response: config => {
      const { ids } = config.body

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return {
          code: 40001,
          message: '参数错误'
        }
      }

      // 检查是否有关联设备或模板
      const hasRelations = furnaceTypes.some(item => 
        ids.includes(item.furnaceTypeCode) && (item.equipmentCount > 0 || item.templateCount > 0)
      )

      if (hasRelations) {
        return {
          code: 40003,
          message: '部分炉型已关联设备或工艺模板，无法删除'
        }
      }

      // 记录初始长度
      const initialLength = furnaceTypes.length

      // 删除炉型
      for (let i = furnaceTypes.length - 1; i >= 0; i--) {
        if (ids.includes(furnaceTypes[i].furnaceTypeCode)) {
          furnaceTypes.splice(i, 1)
        }
      }

      // 计算删除的数量
      const deletedCount = initialLength - furnaceTypes.length

      return {
        code: 20000,
        data: {
          count: deletedCount,
          message: `成功删除 ${deletedCount} 条记录`
        }
      }
    }
  },

  // 批量更改炉型状态
  {
    url: '/mes/master-data/furnace-type/batch-status',
    type: 'put',
    response: config => {
      const { ids, status } = config.body

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return {
          code: 40001,
          message: '参数错误'
        }
      }

      const now = new Date();
      const formattedTime = now.toISOString().replace('T', ' ').split('.')[0];
      let count = 0
      
      furnaceTypes.forEach(item => {
        if (ids.includes(item.furnaceTypeCode)) {
          item.status = status
          item.updatedBy = 'admin'
          item.updatedAt = formattedTime
          count++
        }
      })

      return {
        code: 20000,
        data: {
          count,
          message: `成功更新 ${count} 条记录状态`
        }
      }
    }
  },

  // 导出炉型数据
  {
    url: '/mes/master-data/furnace-type/export',
    type: 'get',
    response: config => {
      return {
        code: 20000,
        data: {
          message: '导出成功'
        }
      }
    }
  },

  // 下载导入模板
  {
    url: '/mes/master-data/furnace-type/download-template',
    type: 'get',
    response: config => {
      return {
        code: 20000,
        data: {
          message: '模板下载成功'
        }
      }
    }
  },

  // 导入炉型数据
  {
    url: '/mes/master-data/furnace-type/import',
    type: 'post',
    response: config => {
      return {
        code: 20000,
        data: {
          success: 5,
          failed: 1,
          message: '导入完成',
          failedItems: [
            { row: 3, reason: '炉型编码已存在' }
          ]
        }
      }
    }
  },

  // 获取关联设备列表
  {
    url: '/mes/master-data/furnace-type/related-equipment/:id',
    type: 'get',
    response: config => {
      const { id } = config.params

      // 检查炉型是否存在
      const furnaceType = furnaceTypes.find(item => item.furnaceTypeCode === id)
      if (!furnaceType) {
        return {
          code: 40004,
          message: '炉型不存在'
        }
      }

      // 如果没有关联设备，返回空数组
      if (furnaceType.equipmentCount === 0) {
        return {
          code: 20000,
          data: []
        }
      }

      // 从缓存获取或生成关联设备
      if (!relatedEquipmentCache.has(id)) {
        relatedEquipmentCache.set(id, generateRelatedEquipment(id))
      }

      return {
        code: 20000,
        data: relatedEquipmentCache.get(id)
      }
    }
  },

  // 获取关联工艺模板列表
  {
    url: '/mes/master-data/furnace-type/related-templates/:id',
    type: 'get',
    response: config => {
      const { id } = config.params

      // 检查炉型是否存在
      const furnaceType = furnaceTypes.find(item => item.furnaceTypeCode === id)
      if (!furnaceType) {
        return {
          code: 40004,
          message: '炉型不存在'
        }
      }

      // 如果没有关联工艺模板，返回空数组
      if (furnaceType.templateCount === 0) {
        return {
          code: 20000,
          data: []
        }
      }

      // 从缓存获取或生成关联模板
      if (!relatedTemplatesCache.has(id)) {
        relatedTemplatesCache.set(id, generateRelatedTemplates(id))
      }

      return {
        code: 20000,
        data: relatedTemplatesCache.get(id)
      }
    }
  }
] 