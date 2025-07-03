/**
 * 工序管理模块Mock数据
 */
const Mock = require('mockjs')

/**
 * 生成工序基础数据
 */
const generateOperationsData = () => {
  // 预设真实基础数据
  const baseOperations = [
    {
      id: 'op-001',
      code: 'ROLLING',
      name: '热轧',
      type: 'Production',
      description: '将铝锭热轧成一定厚度的卷材',
      reportingPoint: 'Start/End',
      associatedResourceType: ['Rolling Mill'],
      status: 'Enabled',
      createdBy: 'admin',
      createdAt: '2024-01-15T08:30:00.000Z',
      updatedBy: 'admin',
      updatedAt: '2024-01-15T08:30:00.000Z'
    },
    {
      id: 'op-002',
      code: 'ANNEALING',
      name: '退火',
      type: 'Production',
      description: '铝箔卷热处理，消除加工硬化',
      reportingPoint: 'Automatic',
      associatedResourceType: ['Annealing Furnace'],
      status: 'Enabled',
      createdBy: 'admin',
      createdAt: '2024-01-16T09:15:00.000Z',
      updatedBy: 'manager',
      updatedAt: '2024-02-05T14:20:00.000Z'
    },
    {
      id: 'op-003',
      code: 'QC_ANNEAL_INSPECT',
      name: '退火后检验',
      type: 'Inspection',
      description: '检验退火后产品的力学性能和表面质量',
      reportingPoint: 'End Only',
      associatedResourceType: ['Hardness Tester', 'Tensile Tester'],
      status: 'Enabled',
      createdBy: 'quality_manager',
      createdAt: '2024-01-18T10:45:00.000Z',
      updatedBy: 'quality_manager',
      updatedAt: '2024-01-18T10:45:00.000Z'
    },
    {
      id: 'op-004',
      code: 'SLITTING',
      name: '分切',
      type: 'Production',
      description: '将大母卷分切成客户要求宽度的小卷',
      reportingPoint: 'Start/End',
      associatedResourceType: ['Slitting Machine'],
      status: 'Enabled',
      createdBy: 'admin',
      createdAt: '2024-01-20T13:30:00.000Z',
      updatedBy: 'admin',
      updatedAt: '2024-01-20T13:30:00.000Z'
    },
    {
      id: 'op-005',
      code: 'REWORK_SURFACE',
      name: '表面处理返工',
      type: 'Production',
      description: '对表面不良品进行返工处理',
      reportingPoint: 'Start/End',
      associatedResourceType: [],
      status: 'Disabled',
      createdBy: 'process_engineer',
      createdAt: '2024-02-01T09:00:00.000Z',
      updatedBy: 'manager',
      updatedAt: '2024-02-10T11:20:00.000Z'
    },
    {
      id: 'op-006',
      code: 'PACKING',
      name: '包装',
      type: 'Packing',
      description: '成品卷的最终包装',
      reportingPoint: 'End Only',
      associatedResourceType: ['Packing Line'],
      status: 'Enabled',
      createdBy: 'admin',
      createdAt: '2024-02-05T15:45:00.000Z',
      updatedBy: 'admin',
      updatedAt: '2024-02-05T15:45:00.000Z'
    }
  ]

  // 生成随机数据，基于真实模板
  const additionalData = Mock.mock({
    'items|10': [{
      'id|+1': function() {
        return 'op-' + String(baseOperations.length + this.id).padStart(3, '0')
      },
      'code': function() {
        const prefixes = ['PROC_', 'QC_', 'PACK_', 'MOVE_']
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
        const suffix = Mock.mock('@word(4, 8)').toUpperCase()
        return prefix + suffix
      },
      'name': function() {
        const nameTypes = ['检验', '加工', '包装', '运输', '存储']
        const nameType = nameTypes[Math.floor(Math.random() * nameTypes.length)]
        return Mock.mock('@cword(2, 4)') + nameType
      },
      'type|1': ['Production', 'Inspection', 'Storage', 'Move', 'Packing'],
      'description': Mock.mock('@csentence(10, 20)'),
      'reportingPoint|1': ['Start/End', 'End Only', 'Automatic'],
      'associatedResourceType|0-3': ['@word(5, 10)'],
      'status|1': ['Enabled', 'Disabled'],
      'createdBy|1': ['admin', 'manager', 'process_engineer', 'quality_manager'],
      'createdAt': function() {
        return Mock.mock('@datetime("yyyy-MM-ddTHH:mm:ss.000Z")')
      },
      'updatedBy|1': ['admin', 'manager', 'process_engineer', 'quality_manager'],
      'updatedAt': function() {
        return Mock.mock('@datetime("yyyy-MM-ddTHH:mm:ss.000Z")')
      }
    }]
  }).items

  return [...baseOperations, ...additionalData]
}

module.exports = {
  generateOperationsData,
  data: generateOperationsData()
} 