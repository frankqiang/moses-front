/**
 * 基础工序数据
 * 描述：定义铝箔生产过程中的标准工序库
 * 创建日期：2024-10-28
 */

const Mock = require('mockjs')

// 生成基础工序数据
const generateOperationData = () => {
  // 预设的真实铝箔生产工序
  const baseOperations = [
    {
      id: 1,
      operation_code: 'ANNEALING',
      operation_name: '退火',
      operation_type: '生产加工',
      description: '对铝箔进行热处理，改善其物理性能和加工性能，获得所需的硬度状态',
      status: '启用',
      create_time: '2024-01-15 09:00:00',
      update_time: '2024-01-15 09:00:00'
    },
    {
      id: 2,
      operation_code: 'QC_ANNEAL',
      operation_name: '退火后检验',
      operation_type: '检验',
      description: '对退火后的铝箔进行质量检验，包括硬度、抗拉强度、延伸率等指标检测',
      status: '启用',
      create_time: '2024-01-15 09:30:00',
      update_time: '2024-01-15 09:30:00'
    },
    {
      id: 3,
      operation_code: 'SLITTING',
      operation_name: '分切',
      operation_type: '生产加工',
      description: '将宽幅铝箔按照客户需求分切成指定宽度的产品',
      status: '启用',
      create_time: '2024-01-15 10:00:00',
      update_time: '2024-01-15 10:00:00'
    },
    {
      id: 4,
      operation_code: 'QC_SLITTING',
      operation_name: '分切检验',
      operation_type: '检验',
      description: '对分切后的铝箔进行外观、尺寸精度等质量检验',
      status: '启用',
      create_time: '2024-01-15 10:30:00',
      update_time: '2024-01-15 10:30:00'
    },
    {
      id: 5,
      operation_code: 'PACKAGING',
      operation_name: '包装',
      operation_type: '包装',
      description: '对合格的铝箔产品进行包装，包括内包装和外包装',
      status: '启用',
      create_time: '2024-01-15 11:00:00',
      update_time: '2024-01-15 11:00:00'
    },
    {
      id: 6,
      operation_code: 'WAREHOUSING',
      operation_name: '入库',
      operation_type: '仓储/移动',
      description: '将包装完成的产品移入成品仓库进行存储',
      status: '启用',
      create_time: '2024-01-15 11:30:00',
      update_time: '2024-01-15 11:30:00'
    },
    {
      id: 7,
      operation_code: 'REWORK_SURFACE',
      operation_name: '表面返修',
      operation_type: '生产加工',
      description: '对表面质量不合格的铝箔进行返修处理',
      status: '启用',
      create_time: '2024-01-16 08:00:00',
      update_time: '2024-01-16 08:00:00'
    },
    {
      id: 8,
      operation_code: 'QC_INCOMING',
      operation_name: '来料检验',
      operation_type: '检验',
      description: '对进入退火工序前的铝箔原料进行质量检验',
      status: '启用',
      create_time: '2024-01-16 08:30:00',
      update_time: '2024-01-16 08:30:00'
    },
    {
      id: 9,
      operation_code: 'MATERIAL_PREP',
      operation_name: '备料',
      operation_type: '仓储/移动',
      description: '从原料仓库将待退火的铝箔移至退火车间备料区',
      status: '启用',
      create_time: '2024-01-16 09:00:00',
      update_time: '2024-01-16 09:00:00'
    },
    {
      id: 10,
      operation_code: 'TEMP_STORAGE',
      operation_name: '暂存',
      operation_type: '仓储/移动',
      description: '将半成品临时存放在指定区域等待下道工序',
      status: '启用',
      create_time: '2024-01-16 09:30:00',
      update_time: '2024-01-16 09:30:00'
    },
    {
      id: 11,
      operation_code: 'FINAL_QC',
      operation_name: '最终检验',
      operation_type: '检验',
      description: '产品出厂前的最终质量检验，确保产品符合客户要求',
      status: '启用',
      create_time: '2024-01-16 10:00:00',
      update_time: '2024-01-16 10:00:00'
    },
    {
      id: 12,
      operation_code: 'DEFECT_SORTING',
      operation_name: '不良品分拣',
      operation_type: '仓储/移动',
      description: '将检验不合格的产品分拣出来，单独存放处理',
      status: '启用',
      create_time: '2024-01-16 10:30:00',
      update_time: '2024-01-16 10:30:00'
    }
  ]

  // 使用Mock.js生成额外的随机工序
  const additionalOperations = Mock.mock({
    'items|3': [{
      'id|+1': baseOperations.length + 1,
      'operation_code': function() {
        const codes = ['COATING', 'LAMINATING', 'PUNCHING']
        return codes[this.id - baseOperations.length - 1]
      },
      'operation_name': function() {
        const names = ['涂层', '复合', '冲孔']
        return names[this.id - baseOperations.length - 1]
      },
      'operation_type|1': ['生产加工', '检验', '仓储/移动', '包装'],
      'description': '@sentence(10, 20)',
      'status|1': ['启用', '禁用'],
      'create_time': '@datetime("yyyy-MM-dd HH:mm:ss")',
      'update_time': '@datetime("yyyy-MM-dd HH:mm:ss")'
    }]
  }).items

  return [...baseOperations, ...additionalOperations]
}

module.exports = {
  generateOperationData,
  data: generateOperationData()
} 