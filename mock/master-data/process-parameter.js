const Mock = require('mockjs')

// 生成随机的工艺模板数据
const data = Mock.mock({
  'items|20': [{
    'id|+1': 1,
    'templateId': function() {
      return 'PROC' + this.id.toString().padStart(3, '0')
    },
    'templateName': function() {
      const alloys = ['1100', '8011', '3003', '8021']
      const states = ['H18', 'O', 'H22', 'H24']
      const alloy = alloys[Math.floor(Math.random() * alloys.length)]
      const state = states[Math.floor(Math.random() * states.length)]
      return `${alloy}${state}退火工艺模板`
    },
    'version': function() {
      return 'v' + (Math.floor(Math.random() * 3) + 1) + '.' + Math.floor(Math.random() * 10)
    },
    'status|1': ['draft', 'pending', 'effective', 'history'],
    'furnaceTypeId|1': ['FT001', 'FT002', 'FT003', 'FT004'],
    'furnaceTypeName|1': ['标准型退火炉', '高温型退火炉', '快速冷却型退火炉', '双区控温退火炉'],
    'applicableProducts|1-5': [{
      'id|+1': 1,
      'code': /AF-[1-8]0[0-9][0-9]-[HO][1-2][0-8]-0\.[0-9]{3}x[1-9][0-9]{2}/,
      'name': /[1-8]0[0-9][0-9]合金[HO][1-2][0-8]态[单双]零箔/
    }],
    'description': '@paragraph(1, 3)',
    'segments|1-12': [{
      'segmentNumber|+1': 1,
      'segmentType|1': ['升温', '保温', '降温', '快速冷却'],
      'targetTemp|200-600': 1,
      'duration|30-360': 1,
      'vfQSet|20-60': 1,
      'vfHSet|20-60': 1,
      'vfFySet|0-30': 1,
      'cvSet|0-1': 1
    }],
    'createdBy': '@name',
    'createdAt': '@datetime',
    'updatedBy': '@name',
    'updatedAt': '@datetime',
    'approvalLog|0-3': [{
      'action|1': ['提交审批', '批准', '驳回'],
      'user': '@name',
      'timestamp': '@datetime',
      'comment': '@sentence(3, 10)'
    }]
  }]
})

// 炉型列表数据
const furnaceTypes = [
  {
    id: 'FT001',
    name: '标准型退火炉',
    capabilities: {
      hasBackZone: true,
      hasNegativePressure: true,
      hasCoolingValve: true,
      maxSegments: 12,
      maxTemperature: 800,
      maxHeatingRate: 10
    }
  },
  {
    id: 'FT002',
    name: '高温型退火炉',
    capabilities: {
      hasBackZone: true,
      hasNegativePressure: true,
      hasCoolingValve: false,
      maxSegments: 12,
      maxTemperature: 1200,
      maxHeatingRate: 8
    }
  },
  {
    id: 'FT003',
    name: '快速冷却型退火炉',
    capabilities: {
      hasBackZone: false,
      hasNegativePressure: true,
      hasCoolingValve: true,
      maxSegments: 8,
      maxTemperature: 700,
      maxHeatingRate: 15
    }
  },
  {
    id: 'FT004',
    name: '双区控温退火炉',
    capabilities: {
      hasBackZone: true,
      hasNegativePressure: false,
      hasCoolingValve: true,
      maxSegments: 10,
      maxTemperature: 900,
      maxHeatingRate: 12
    }
  }
]

// 深拷贝数组
const deepClone = array => {
  return array.map(item => JSON.parse(JSON.stringify(item)))
}

const items = deepClone(data.items)

// 优化状态显示
items.forEach(item => {
  if (item.status === 'draft') {
    item.statusName = '草稿'
  } else if (item.status === 'pending') {
    item.statusName = '待审批'
  } else if (item.status === 'effective') {
    item.statusName = '生效'
  } else {
    item.statusName = '历史'
  }
})

module.exports = [
  // 获取工艺模板列表
  {
    url: '/mes/master-data/process-parameter/list',
    type: 'get',
    response: config => {
      const { templateId, templateName, status, furnaceTypeId, page = 1, limit = 10 } = config.query

      // 过滤
      let filteredItems = [...items]
      if (templateId) {
        filteredItems = filteredItems.filter(item => item.templateId.includes(templateId))
      }
      if (templateName) {
        filteredItems = filteredItems.filter(item => item.templateName.includes(templateName))
      }
      if (status) {
        filteredItems = filteredItems.filter(item => item.status === status)
      }
      if (furnaceTypeId) {
        filteredItems = filteredItems.filter(item => item.furnaceTypeId === furnaceTypeId)
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

  // 获取工艺模板详情
  {
    url: /\/mes\/master-data\/process-parameter\/detail\/[\w\d]+/,
    type: 'get',
    response: config => {
      const id = config.url.match(/\/detail\/(\w+)/)[1]
      const item = items.find(item => item.templateId === id || item.id.toString() === id)
      
      return {
        code: 20000,
        data: item || null
      }
    }
  },

  // 创建工艺模板
  {
    url: '/mes/master-data/process-parameter/create',
    type: 'post',
    response: config => {
      const data = config.body
      const newId = items.length + 1
      const templateId = 'PROC' + newId.toString().padStart(3, '0')
      
      const newItem = {
        ...data,
        id: newId,
        templateId,
        status: 'draft',
        statusName: '草稿',
        version: 'v1.0',
        createdBy: 'admin',
        createdAt: Mock.mock('@datetime'),
        updatedBy: 'admin',
        updatedAt: Mock.mock('@datetime')
      }
      items.unshift(newItem)
      
      return {
        code: 20000,
        data: {
          id: newId,
          templateId
        }
      }
    }
  },

  // 更新工艺模板
  {
    url: '/mes/master-data/process-parameter/update',
    type: 'put',
    response: config => {
      const data = config.body
      const index = items.findIndex(item => item.id === data.id || item.templateId === data.templateId)
      
      if (index > -1) {
        items[index] = {
          ...items[index],
          ...data,
          updatedBy: 'admin',
          updatedAt: Mock.mock('@datetime')
        }
        
        return {
          code: 20000,
          data: 'success'
        }
      }
      
      return {
        code: 50000,
        message: '未找到对应的工艺模板'
      }
    }
  },

  // 删除工艺模板
  {
    url: /\/mes\/master-data\/process-parameter\/delete\/[\w\d]+/,
    type: 'delete',
    response: config => {
      const id = config.url.match(/\/delete\/(\w+)/)[1]
      const index = items.findIndex(item => item.templateId === id || item.id.toString() === id)
      
      if (index > -1) {
        items.splice(index, 1)
        return {
          code: 20000,
          data: 'success'
        }
      }
      
      return {
        code: 50000,
        message: '未找到对应的工艺模板'
      }
    }
  },

  // 更改工艺模板状态
  {
    url: '/mes/master-data/process-parameter/status',
    type: 'put',
    response: config => {
      const { id, status } = config.body
      const index = items.findIndex(item => item.id === id || item.templateId === id)
      
      if (index > -1) {
        items[index].status = status
        
        if (status === 'draft') {
          items[index].statusName = '草稿'
        } else if (status === 'pending') {
          items[index].statusName = '待审批'
        } else if (status === 'effective') {
          items[index].statusName = '生效'
        } else if (status === 'history') {
          items[index].statusName = '历史'
        }
        
        return {
          code: 20000,
          data: 'success'
        }
      }
      
      return {
        code: 50000,
        message: '未找到对应的工艺模板'
      }
    }
  },

  // 批量删除工艺模板
  {
    url: '/mes/master-data/process-parameter/batch-delete',
    type: 'delete',
    response: config => {
      const { ids } = config.body
      let deleteCount = 0
      
      for (const id of ids) {
        const index = items.findIndex(item => item.id === id || item.templateId === id)
        if (index > -1) {
          items.splice(index, 1)
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

  // 批量更改工艺模板状态
  {
    url: '/mes/master-data/process-parameter/batch-status',
    type: 'put',
    response: config => {
      const { ids, status } = config.body
      let count = 0
      
      ids.forEach(id => {
        const index = items.findIndex(item => item.templateId === id || item.id.toString() === id)
        if (index > -1) {
          items[index].status = status
          
          if (status === 'draft') {
            items[index].statusName = '草稿'
          } else if (status === 'pending') {
            items[index].statusName = '待审批'
          } else if (status === 'effective') {
            items[index].statusName = '生效'
          } else {
            items[index].statusName = '历史'
          }
          
          count++
        }
      })
      
      return {
        code: 20000,
        data: {
          count
        }
      }
    }
  },


  // 提交工艺模板审批
  {
    url: '/mes/master-data/process-parameter/submit-approval',
    type: 'put',
    response: config => {
      const { id } = config.body
      const index = items.findIndex(item => item.id === id || item.templateId === id)
      
      if (index > -1) {
        items[index].status = 'pending'
        items[index].statusName = '待审批'
        
        // 添加审批记录
        if (!items[index].approvalLog) {
          items[index].approvalLog = []
        }
        
        items[index].approvalLog.push({
          action: '提交审批',
          user: 'admin',
          timestamp: Mock.mock('@datetime'),
          comment: '请审批'
        })
        
        return {
          code: 20000,
          data: 'success'
        }
      }
      
      return {
        code: 50000,
        message: '未找到对应的工艺模板'
      }
    }
  },

  // 审批工艺模板
  {
    url: '/mes/master-data/process-parameter/approve',
    type: 'put',
    response: config => {
      const { id, approved, comment } = config.body
      const index = items.findIndex(item => item.id === id || item.templateId === id)
      
      if (index > -1) {
        if (approved) {
          items[index].status = 'effective'
          items[index].statusName = '生效'
          
          // 将同一个模板的其他生效版本改为历史
          const templateIdToMatch = items[index].templateId.split('-v')[0]
          items.forEach((item, idx) => {
            if (idx !== index && 
                item.templateId.startsWith(templateIdToMatch) && 
                item.status === 'effective') {
              item.status = 'history'
              item.statusName = '历史'
            }
          })
        } else {
          items[index].status = 'draft'
          items[index].statusName = '草稿'
        }
        
        // 添加审批记录
        if (!items[index].approvalLog) {
          items[index].approvalLog = []
        }
        
        items[index].approvalLog.push({
          action: approved ? '批准' : '驳回',
          user: 'approver',
          timestamp: Mock.mock('@datetime'),
          comment: comment || (approved ? '同意' : '需要修改')
        })
        
        return {
          code: 20000,
          data: 'success'
        }
      }
      
      return {
        code: 50000,
        message: '未找到对应的工艺模板'
      }
    }
  },

  // 创建工艺模板新版本
  {
    url: '/mes/master-data/process-parameter/new-version',
    type: 'post',
    response: config => {
      const { id } = config.body
      const sourceItem = items.find(item => item.id === id || item.templateId === id)
      
      if (sourceItem) {
        // 解析当前版本号并增加
        const currentVersion = sourceItem.version
        const versionNum = parseFloat(currentVersion.substring(1))
        const newVersionNum = Math.floor(versionNum) + 0.1
        const newVersion = 'v' + newVersionNum.toFixed(1)
        
        const newId = items.length + 1
        const baseTemplateId = sourceItem.templateId.split('-v')[0] || sourceItem.templateId
        const newTemplateId = baseTemplateId + '-' + newVersion
        
        const newItem = {
          ...JSON.parse(JSON.stringify(sourceItem)),
          id: newId,
          templateId: newTemplateId,
          version: newVersion,
          status: 'draft',
          statusName: '草稿',
          createdBy: 'admin',
          createdAt: Mock.mock('@datetime'),
          updatedBy: 'admin',
          updatedAt: Mock.mock('@datetime'),
          approvalLog: []
        }
        
        items.unshift(newItem)
        
        return {
          code: 20000,
          data: {
            id: newId,
            templateId: newTemplateId
          }
        }
      }
      
      return {
        code: 50000,
        message: '未找到对应的工艺模板'
      }
    }
  },

  // 导出工艺模板数据 - 这里只是模拟，实际不会返回数据
  {
    url: '/mes/master-data/process-parameter/export',
    type: 'get',
    response: () => {
      return {
        code: 20000,
        message: '导出成功'
      }
    }
  },

  // 下载导入模板 - 这里只是模拟，实际不会返回数据
  {
    url: '/mes/master-data/process-parameter/download-template',
    type: 'get',
    response: () => {
      return {
        code: 20000,
        message: '下载成功'
      }
    }
  },

  // 导入工艺模板数据 - 这里只是模拟，实际不会处理文件
  {
    url: '/mes/master-data/process-parameter/import',
    type: 'post',
    response: () => {
      return {
        code: 20000,
        data: {
          total: 5,
          success: 4,
          failed: 1,
          errors: [
            {
              row: 3,
              message: '模板名称不能为空'
            }
          ]
        }
      }
    }
  }
]
