const Mock = require('mockjs')

// 生成物料编码规则的模拟数据
const mockCodeRules = [
  {
    id: 1,
    name: '标准料框编码规则',
    type: 'prefix_numeric',
    prefix: 'BIN-',
    sequenceLength: 6,
    currentValue: 1,
    stepValue: 1,
    customRule: '',
    qrCodeContent: 'id_only',
    qrCodeSize: 'medium',
    errorCorrectionLevel: 'M',
    isDefault: true,
    createTime: '2023-10-01T14:00:00.000Z',
    updateTime: '2023-10-01T14:00:00.000Z'
  },
  {
    id: 2,
    name: '数字流水号规则',
    type: 'pure_numeric',
    prefix: '',
    sequenceLength: 8,
    currentValue: 1000,
    stepValue: 1,
    customRule: '',
    qrCodeContent: 'id_only',
    qrCodeSize: 'small',
    errorCorrectionLevel: 'L',
    isDefault: false,
    createTime: '2023-10-05T10:30:00.000Z',
    updateTime: '2023-10-05T10:30:00.000Z'
  },
  {
    id: 3,
    name: '特殊料框编码规则',
    type: 'prefix_numeric',
    prefix: 'SPE-',
    sequenceLength: 4,
    currentValue: 100,
    stepValue: 5,
    customRule: '',
    qrCodeContent: 'id_and_spec',
    qrCodeSize: 'large',
    errorCorrectionLevel: 'Q',
    isDefault: false,
    createTime: '2023-10-10T09:15:00.000Z',
    updateTime: '2023-10-15T11:20:00.000Z'
  },
  {
    id: 4,
    name: '自定义复杂编码规则',
    type: 'custom',
    prefix: '',
    sequenceLength: 0,
    currentValue: 0,
    stepValue: 0,
    customRule: '该规则采用年月日+三位流水号的形式，如：20231025001。每天流水号从001开始，按照使用顺序依次递增。',
    qrCodeContent: 'full_info',
    qrCodeSize: 'medium',
    errorCorrectionLevel: 'H',
    isDefault: false,
    createTime: '2023-10-20T16:45:00.000Z',
    updateTime: '2023-10-20T16:45:00.000Z'
  }
]

const codeRules = [...mockCodeRules]

module.exports = [
  // 获取物料编码规则列表
  {
    url: '/mes/master-data/material-code/list',
    type: 'get',
    response: config => {
      const { ruleName, ruleType, page = 1, limit = 10 } = config.query

      // 过滤
      let filteredRules = [...codeRules]
      if (ruleName) {
        filteredRules = filteredRules.filter(item => item.name.includes(ruleName))
      }
      if (ruleType) {
        filteredRules = filteredRules.filter(item => item.type === ruleType)
      }

      // 分页
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + parseInt(limit)
      const pagedRules = filteredRules.slice(startIndex, endIndex)

      return {
        code: 20000,
        data: {
          items: pagedRules,
          total: filteredRules.length
        }
      }
    }
  },

  // 获取物料编码规则详情
  {
    url: /\/mes\/master-data\/material-code\/detail\/\d+/,
    type: 'get',
    response: config => {
      const id = parseInt(config.url.match(/\/detail\/(\d+)/)[1])
      const rule = codeRules.find(item => item.id === id)
      
      if (rule) {
        return {
          code: 20000,
          data: rule
        }
      } else {
        return {
          code: 50404,
          message: '编码规则不存在'
        }
      }
    }
  },

  // 创建物料编码规则
  {
    url: '/mes/master-data/material-code/create',
    type: 'post',
    response: config => {
      const data = config.body
      
      // 如果设置为默认，先将其他规则改为非默认
      if (data.isDefault) {
        codeRules.forEach(item => {
          item.isDefault = false
        })
      }

      const newId = Math.max(...codeRules.map(item => item.id), 0) + 1
      const newRule = {
        ...data,
        id: newId,
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString()
      }

      codeRules.unshift(newRule)
      
      return {
        code: 20000,
        data: {
          id: newId
        }
      }
    }
  },

  // 更新物料编码规则
  {
    url: '/mes/master-data/material-code/update',
    type: 'put',
    response: config => {
      const data = config.body
      const index = codeRules.findIndex(item => item.id === data.id)
      
      if (index === -1) {
        return {
          code: 50404,
          message: '编码规则不存在'
        }
      }

      // 如果设置为默认，先将其他规则改为非默认
      if (data.isDefault) {
        codeRules.forEach(item => {
          item.isDefault = false
        })
      }

      codeRules[index] = {
        ...codeRules[index],
        ...data,
        updateTime: new Date().toISOString()
      }
      
      return {
        code: 20000,
        data: {
          id: data.id
        }
      }
    }
  },

  // 设置默认规则
  {
    url: '/mes/master-data/material-code/set-default',
    type: 'put',
    response: config => {
      const { id } = config.body
      
      if (!id) {
        return {
          code: 50400,
          message: '缺少必要的ID参数'
        }
      }
      
      const rule = codeRules.find(item => item.id === id)
      
      if (!rule) {
        return {
          code: 50404,
          message: '编码规则不存在'
        }
      }

      // 将所有规则设为非默认
      codeRules.forEach(item => {
        item.isDefault = false
      })

      // 将目标规则设为默认
      rule.isDefault = true
      rule.updateTime = new Date().toISOString()
      
      return {
        code: 20000,
        data: {
          id
        }
      }
    }
  },

  // 生成预览编码
  {
    url: '/mes/master-data/material-code/preview',
    type: 'post',
    response: config => {
      const { type, prefix, sequenceLength, currentValue } = config.body
      
      let previewCode = ''
      if (type === 'pure_numeric') {
        previewCode = String(currentValue).padStart(sequenceLength, '0')
      } else if (type === 'prefix_numeric') {
        previewCode = `${prefix}${String(currentValue).padStart(sequenceLength, '0')}`
      } else {
        previewCode = '自定义规则无法预览'
      }
      
      return {
        code: 20000,
        data: {
          previewCode
        }
      }
    }
  },

  // 批量删除规则
  {
    url: '/mes/master-data/material-code/batch-delete',
    type: 'delete',
    response: config => {
      const { ids } = config.body
      
      if (!ids || !ids.length) {
        return {
          code: 50400,
          message: '缺少必要的ID参数'
        }
      }

      // 检查是否有默认规则在删除列表中
      const hasDefault = codeRules.some(rule => rule.isDefault && ids.includes(rule.id))
      if (hasDefault) {
        return {
          code: 50403,
          message: '不能删除默认规则，请先设置其他规则为默认'
        }
      }
      
      // 删除规则
      const initialLength = codeRules.length
      for (let i = codeRules.length - 1; i >= 0; i--) {
        if (ids.includes(codeRules[i].id)) {
          codeRules.splice(i, 1)
        }
      }
      
      const deletedCount = initialLength - codeRules.length
      
      return {
        code: 20000,
        data: {
          count: deletedCount
        }
      }
    }
  },

  // 导出规则
  {
    url: '/mes/master-data/material-code/export',
    type: 'post',
    response: () => {
      return {
        code: 20000,
        data: '导出成功'
      }
    }
  },

  // 导入规则
  {
    url: '/mes/master-data/material-code/import',
    type: 'post',
    response: () => {
      // 模拟导入成功返回
      return {
        code: 20000,
        data: {
          successCount: 3,
          failCount: 1,
          failItems: [
            {
              rowIndex: 2,
              reason: '名称已存在'
            }
          ]
        }
      }
    }
  },

  // 获取导入模板
  {
    url: '/mes/master-data/material-code/template',
    type: 'get',
    response: () => {
      return {
        code: 20000,
        data: '模板下载成功'
      }
    }
  }
]
