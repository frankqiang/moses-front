/**
 * 工艺路线数据
 * 描述：定义铝箔产品的完整工艺路线
 * 创建日期：2024-10-28
 */

const Mock = require('mockjs')

// 生成工艺路线数据
const generateRoutingData = () => {
  // 预设的工艺路线主信息
  const baseRoutings = [
    {
      id: 1,
      routing_code: 'RT-STD-FOIL-01',
      routing_name: '标准双零箔生产路线',
      version: 'v2.1',
      status: '生效',
      applicable_products: ['AF-1100-H18-0.006x1200', 'AF-1100-H18-0.007x1500', 'AF-8011-H18-0.006x1200'],
      description: '适用于标准双零箔产品的完整生产工艺路线',
      create_time: '2024-01-10 08:00:00',
      update_time: '2024-02-15 10:30:00',
      create_user: '工艺工程师01',
      update_user: '工艺工程师02'
    },
    {
      id: 2,
      routing_code: 'RT-STD-FOIL-01',
      routing_name: '标准双零箔生产路线',
      version: 'v2.0',
      status: '历史',
      applicable_products: ['AF-1100-H18-0.006x1200', 'AF-1100-H18-0.007x1500'],
      description: '适用于标准双零箔产品的完整生产工艺路线（历史版本）',
      create_time: '2024-01-10 08:00:00',
      update_time: '2024-01-20 14:20:00',
      create_user: '工艺工程师01',
      update_user: '工艺工程师01'
    },
    {
      id: 3,
      routing_code: 'RT-REWORK-01',
      routing_name: '表面不良返工路线',
      version: 'v1.0',
      status: '草稿',
      applicable_products: ['AF-1100-H18-0.006x1200', 'AF-8011-H18-0.006x1200'],
      description: '用于处理表面质量不合格产品的返工工艺路线',
      create_time: '2024-02-01 09:00:00',
      update_time: '2024-02-05 16:45:00',
      create_user: '工艺工程师02',
      update_user: '工艺工程师02'
    },
    {
      id: 4,
      routing_code: 'RT-SINGLE-FOIL-01',
      routing_name: '单零箔生产路线',
      version: 'v1.5',
      status: '生效',
      applicable_products: ['AF-1100-O-0.012x1200', 'AF-8011-O-0.015x1500'],
      description: '适用于单零箔产品的标准生产工艺路线',
      create_time: '2024-01-15 10:00:00',
      update_time: '2024-02-10 11:15:00',
      create_user: '工艺工程师01',
      update_user: '工艺工程师03'
    }
  ]

  // 使用Mock.js生成额外的工艺路线
  const additionalRoutings = Mock.mock({
    'items|2': [{
      'id|+1': baseRoutings.length + 1,
      'routing_code': function() {
        const codes = ['RT-SPECIAL-01', 'RT-TESTING-01']
        return codes[this.id - baseRoutings.length - 1]
      },
      'routing_name': function() {
        const names = ['特殊合金路线', '试验性工艺路线']
        return names[this.id - baseRoutings.length - 1]
      },
      'version': function() {
        return 'v1.' + Mock.mock('@integer(0, 5)')
      },
      'status|1': ['生效', '草稿', '历史'],
      'applicable_products': function() {
        return Mock.mock({
          'products|2-4': ['AF-@integer(1000,9999)-@pick(["H18","O"])-0.@integer(005,020)x@integer(800,2000)']
        }).products
      },
      'description': '@sentence(15, 25)',
      'create_time': '@datetime("yyyy-MM-dd HH:mm:ss")',
      'update_time': '@datetime("yyyy-MM-dd HH:mm:ss")',
      'create_user': '工艺工程师@integer(1, 5)',
      'update_user': '工艺工程师@integer(1, 5)'
    }]
  }).items

  return [...baseRoutings, ...additionalRoutings]
}

// 生成工艺路线步骤数据
const generateRoutingStepsData = () => {
  return {
    // 标准双零箔生产路线v2.1的步骤
    'RT-STD-FOIL-01_v2.1': [
      {
        id: 1,
        routing_id: 1,
        step_number: 10,
        operation_code: 'QC_INCOMING',
        operation_name: '来料检验',
        next_step_number: 20,
        on_failure_step_number: null,
        description: '检验原料铝箔质量',
        create_time: '2024-01-10 08:00:00',
        update_time: '2024-02-15 10:30:00'
      },
      {
        id: 2,
        routing_id: 1,
        step_number: 20,
        operation_code: 'MATERIAL_PREP',
        operation_name: '备料',
        next_step_number: 30,
        on_failure_step_number: null,
        description: '将原料移至退火车间备料区',
        create_time: '2024-01-10 08:00:00',
        update_time: '2024-02-15 10:30:00'
      },
      {
        id: 3,
        routing_id: 1,
        step_number: 30,
        operation_code: 'ANNEALING',
        operation_name: '退火',
        next_step_number: 40,
        on_failure_step_number: null,
        description: '执行退火热处理工艺',
        create_time: '2024-01-10 08:00:00',
        update_time: '2024-02-15 10:30:00'
      },
      {
        id: 4,
        routing_id: 1,
        step_number: 40,
        operation_code: 'QC_ANNEAL',
        operation_name: '退火后检验',
        next_step_number: 50,
        on_failure_step_number: 80,
        description: '检验退火后产品质量',
        create_time: '2024-01-10 08:00:00',
        update_time: '2024-02-15 10:30:00'
      },
      {
        id: 5,
        routing_id: 1,
        step_number: 50,
        operation_code: 'SLITTING',
        operation_name: '分切',
        next_step_number: 60,
        on_failure_step_number: null,
        description: '按客户要求分切宽度',
        create_time: '2024-01-10 08:00:00',
        update_time: '2024-02-15 10:30:00'
      },
      {
        id: 6,
        routing_id: 1,
        step_number: 60,
        operation_code: 'QC_SLITTING',
        operation_name: '分切检验',
        next_step_number: 70,
        on_failure_step_number: 90,
        description: '检验分切质量和尺寸精度',
        create_time: '2024-01-10 08:00:00',
        update_time: '2024-02-15 10:30:00'
      },
      {
        id: 7,
        routing_id: 1,
        step_number: 70,
        operation_code: 'PACKAGING',
        operation_name: '包装',
        next_step_number: 100,
        on_failure_step_number: null,
        description: '产品包装作业',
        create_time: '2024-01-10 08:00:00',
        update_time: '2024-02-15 10:30:00'
      },
      {
        id: 8,
        routing_id: 1,
        step_number: 80,
        operation_code: 'DEFECT_SORTING',
        operation_name: '不良品分拣',
        next_step_number: null,
        on_failure_step_number: null,
        description: '分拣退火不合格品',
        create_time: '2024-01-10 08:00:00',
        update_time: '2024-02-15 10:30:00'
      },
      {
        id: 9,
        routing_id: 1,
        step_number: 90,
        operation_code: 'DEFECT_SORTING',
        operation_name: '不良品分拣',
        next_step_number: null,
        on_failure_step_number: null,
        description: '分拣分切不合格品',
        create_time: '2024-01-10 08:00:00',
        update_time: '2024-02-15 10:30:00'
      },
      {
        id: 10,
        routing_id: 1,
        step_number: 100,
        operation_code: 'WAREHOUSING',
        operation_name: '入库',
        next_step_number: null,
        on_failure_step_number: null,
        description: '成品入库',
        create_time: '2024-01-10 08:00:00',
        update_time: '2024-02-15 10:30:00'
      }
    ],

    // 表面不良返工路线v1.0的步骤
    'RT-REWORK-01_v1.0': [
      {
        id: 11,
        routing_id: 3,
        step_number: 10,
        operation_code: 'QC_ANNEAL',
        operation_name: '退火后检验',
        next_step_number: 30,
        on_failure_step_number: 20,
        description: '重新检验退火后产品',
        create_time: '2024-02-01 09:00:00',
        update_time: '2024-02-05 16:45:00'
      },
      {
        id: 12,
        routing_id: 3,
        step_number: 20,
        operation_code: 'REWORK_SURFACE',
        operation_name: '表面返修',
        next_step_number: 10,
        on_failure_step_number: null,
        description: '对表面不良进行返修处理',
        create_time: '2024-02-01 09:00:00',
        update_time: '2024-02-05 16:45:00'
      },
      {
        id: 13,
        routing_id: 3,
        step_number: 30,
        operation_code: 'SLITTING',
        operation_name: '分切',
        next_step_number: null,
        on_failure_step_number: null,
        description: '合格品继续分切工序',
        create_time: '2024-02-01 09:00:00',
        update_time: '2024-02-05 16:45:00'
      }
    ],

    // 单零箔生产路线v1.5的步骤
    'RT-SINGLE-FOIL-01_v1.5': [
      {
        id: 14,
        routing_id: 4,
        step_number: 10,
        operation_code: 'QC_INCOMING',
        operation_name: '来料检验',
        next_step_number: 20,
        on_failure_step_number: null,
        description: '单零箔原料检验',
        create_time: '2024-01-15 10:00:00',
        update_time: '2024-02-10 11:15:00'
      },
      {
        id: 15,
        routing_id: 4,
        step_number: 20,
        operation_code: 'ANNEALING',
        operation_name: '退火',
        next_step_number: 30,
        on_failure_step_number: null,
        description: '单零箔退火处理',
        create_time: '2024-01-15 10:00:00',
        update_time: '2024-02-10 11:15:00'
      },
      {
        id: 16,
        routing_id: 4,
        step_number: 30,
        operation_code: 'QC_ANNEAL',
        operation_name: '退火后检验',
        next_step_number: 40,
        on_failure_step_number: 50,
        description: '单零箔退火质量检验',
        create_time: '2024-01-15 10:00:00',
        update_time: '2024-02-10 11:15:00'
      },
      {
        id: 17,
        routing_id: 4,
        step_number: 40,
        operation_code: 'PACKAGING',
        operation_name: '包装',
        next_step_number: 60,
        on_failure_step_number: null,
        description: '单零箔产品包装',
        create_time: '2024-01-15 10:00:00',
        update_time: '2024-02-10 11:15:00'
      },
      {
        id: 18,
        routing_id: 4,
        step_number: 50,
        operation_code: 'DEFECT_SORTING',
        operation_name: '不良品分拣',
        next_step_number: null,
        on_failure_step_number: null,
        description: '不合格单零箔分拣',
        create_time: '2024-01-15 10:00:00',
        update_time: '2024-02-10 11:15:00'
      },
      {
        id: 19,
        routing_id: 4,
        step_number: 60,
        operation_code: 'WAREHOUSING',
        operation_name: '入库',
        next_step_number: null,
        on_failure_step_number: null,
        description: '单零箔成品入库',
        create_time: '2024-01-15 10:00:00',
        update_time: '2024-02-10 11:15:00'
      }
    ]
  }
}

module.exports = {
  generateRoutingData,
  generateRoutingStepsData,
  routingData: generateRoutingData(),
  stepsData: generateRoutingStepsData()
} 