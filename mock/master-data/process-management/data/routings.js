/**
 * 工艺路线管理模块Mock数据
 */
const Mock = require('mockjs')

/**
 * 生成工艺路线基础数据
 */
const generateRoutingsData = () => {
  // 预设真实基础数据
  const baseRoutings = [
    {
      "id": "rt-001",
      "code": "RT_STD_DOUBLE_ZERO",
      "name": "标准双零箔生产工艺路线",
      "version": "2.0", // 更新版本号以匹配文档
      "status": "Enabled",
      "type": "Standard",
      "applicableProducts": ["P-1100-DZ", "P-8011-DZ"],
      "steps": [
        {
          "stepId": "step-001-1",
          "stepNumber": 10,
          "operationId": "op-002",
          "operationCode": "ANNEALING",
          "operationName": "退火",
          "operationType": "Production",
          "flowLogic": { "nextStep": 20, "onSuccessStep": 20, "onFailureStep": null },
          "timeStandards": {
            "setup": { "type": "Fixed", "value": 60, "unit": "minute", "matrixId": null },
            "processing": { "type": "Fixed", "value": 120, "unit": "分钟/吨", "formula": null }
          }
        },
        {
          "stepId": "step-001-2",
          "stepNumber": 20,
          "operationId": "op-003",
          "operationCode": "QC_ANNEAL_INSPECT",
          "operationName": "退火后检验",
          "operationType": "Inspection",
          "flowLogic": { "nextStep": null, "onSuccessStep": 30, "onFailureStep": 50 },
          "timeStandards": {
            "setup": { "type": "Fixed", "value": 10, "unit": "minute", "matrixId": null },
            "processing": { "type": "Fixed", "value": 15, "unit": "分钟/卷", "formula": null }
          }
        },
        {
          "stepId": "step-001-3",
          "stepNumber": 30,
          "operationId": "op-004",
          "operationCode": "SLITTING",
          "operationName": "分切",
          "operationType": "Production",
          "flowLogic": { "nextStep": 40, "onSuccessStep": 40, "onFailureStep": null },
          "timeStandards": {
            "setup": { "type": "Matrix", "value": 30, "unit": "minute", "matrixId": "SM-SPEC-02" },
            "processing": { "type": "Fixed", "value": 45, "unit": "分钟/吨", "formula": null }
          }
        },
        {
          "stepId": "step-001-5",
          "stepNumber": 40,
          "operationId": "op-006",
          "operationCode": "PACKING",
          "operationName": "包装",
          "operationType": "Packing",
          "flowLogic": { "nextStep": null, "onSuccessStep": null, "onFailureStep": null },
          "timeStandards": {
            "setup": { "type": "Fixed", "value": 5, "unit": "minute", "matrixId": null },
            "processing": { "type": "Formula", "value": 0, "unit": "分钟/卷", "formula": "5 * [width_m] + 2" }
          }
        },
        {
          "stepId": "step-001-4",
          "stepNumber": 50,
          "operationId": "op-005",
          "operationCode": "REWORK_SURFACE",
          "operationName": "表面处理返工",
          "operationType": "Production",
          "flowLogic": { "nextStep": 20, "onSuccessStep": 20, "onFailureStep": null },
          "timeStandards": {
            "setup": { "type": "Fixed", "value": 0, "unit": "minute", "matrixId": null },
            "processing": { "type": "Fixed", "value": 60, "unit": "分钟/卷", "formula": null }
          }
        }
      ],
      "changelog": [
        { "type": "create", "version": "1.0", "user": "admin", "timestamp": "2023-10-01T10:00:00Z", "note": "初始创建工艺路线" },
        { "type": "update", "version": "1.2", "user": "li_guan", "timestamp": "2023-10-20T11:00:00Z", "note": "增加返工流程并审批通过" },
        { "type": "version", "version": "2.0", "user": "admin", "timestamp": "2024-05-18T16:00:00Z", "note": "升级至新版数据结构，支持动态时间配置" }
      ],
      "approvalHistory": [
        { 
          "id": "ah-001-1",
          "action": "submit", 
          "actionBy": "admin", 
          "actionAt": "2024-05-18T15:30:00Z", 
          "status": "PendingApproval", 
          "remarks": "提交v2.0版本审批，增加动态时间配置功能" 
        },
        { 
          "id": "ah-001-2",
          "action": "approve", 
          "actionBy": "system_arch", 
          "actionAt": "2024-05-18T17:00:00Z", 
          "status": "Enabled", 
          "remarks": "模型升级通过，新功能测试正常" 
        }
      ],
      "createdBy": "admin",
      "createdAt": "2023-10-01T10:00:00Z",
      "updatedBy": "li_guan",
      "updatedAt": "2023-10-20T11:00:00Z"
    },
    {
      "id": "rt-002",
      "code": "RT_DRAFT_SINGLE_ZERO",
      "name": "单零箔工艺路线草稿",
      "version": "0.1",
      "status": "Draft",
      "type": "Standard",
      "applicableProducts": ["P-1235-DZ"],
      "steps": [],
      "changelog": [
        { "type": "create", "version": "1.0", "user": "system", "timestamp": "2022-01-01T00:00:00Z", "note": "初始创建" },
        { "type": "update", "version": "2.0", "user": "process_engineer", "timestamp": "2022-03-15T09:00:00Z", "note": "更新工艺参数" },
        { "type": "version", "version": "2.5", "user": "quality_manager", "timestamp": "2022-06-20T14:00:00Z", "note": "优化质检流程" },
        { "type": "delete", "version": "2.6", "user": "admin", "timestamp": "2022-12-31T15:30:00Z", "note": "删除过时的工序步骤" }
      ],
      "approvalHistory": [
        { 
          "id": "ah-004-1",
          "action": "submit", 
          "actionBy": "process_engineer", 
          "actionAt": "2022-03-15T09:30:00Z", 
          "status": "PendingApproval", 
          "remarks": "提交v2.0版本审批" 
        },
        { 
          "id": "ah-004-2",
          "action": "approve", 
          "actionBy": "manager", 
          "actionAt": "2022-03-16T11:00:00Z", 
          "status": "Enabled", 
          "remarks": "参数更新合理，同意生效" 
        },
        { 
          "id": "ah-004-3",
          "action": "submit", 
          "actionBy": "quality_manager", 
          "actionAt": "2022-06-20T14:30:00Z", 
          "status": "PendingApproval", 
          "remarks": "提交v2.5版本审批，优化质检流程" 
        },
        { 
          "id": "ah-004-4",
          "action": "approve", 
          "actionBy": "director", 
          "actionAt": "2022-06-21T09:00:00Z", 
          "status": "Enabled", 
          "remarks": "质检流程优化合理，同意生效" 
        },
        { 
          "id": "ah-004-5",
          "action": "archive", 
          "actionBy": "admin", 
          "actionAt": "2022-12-31T16:00:00Z", 
          "status": "Archived", 
          "remarks": "产品已停产，归档相关工艺路线" 
        }
      ],
      "createdBy": "admin",
      "createdAt": "2023-11-01T10:00:00Z",
      "updatedBy": "admin",
      "updatedAt": "2023-11-01T10:00:00Z"
    },
    {
      "id": "rt-003",
      "code": "RT_PENDING_APPROVAL",
      "name": "待审批的特殊合金工艺",
      "version": "1.0",
      "status": "PendingApproval",
      "type": "Trial",
      "applicableProducts": ["P-5052-ALLOY"],
      "steps": [
         {
          "stepId": "step-003-1",
          "stepNumber": 10,
          "operationId": "op-001",
          "operationCode": "ROLLING",
          "operationName": "热轧",
          "operationType": "Production",
          "flowLogic": { "nextStep": 20, "onSuccessStep": 20, "onFailureStep": null },
          "timeStandards": {
            "setup": { "type": "Fixed", "value": 120, "unit": "minute", "matrixId": null },
            "processing": { "type": "Fixed", "value": 180, "unit": "分钟/吨", "formula": null }
          }
        }
      ],
      "changelog": [
        { "type": "create", "version": "1.0", "user": "admin", "timestamp": "2024-01-05T10:00:00Z", "note": "初始创建并提交审批" }
      ],
      "approvalHistory": [
        { 
          "id": "ah-003-1",
          "action": "submit", 
          "actionBy": "admin", 
          "actionAt": "2024-01-05T10:30:00Z", 
          "status": "PendingApproval", 
          "remarks": "提交特殊合金工艺路线审批，请重点关注热轧工序参数" 
        }
      ],
      "createdBy": "admin",
      "createdAt": "2024-01-05T10:00:00Z",
      "updatedBy": "admin",
      "updatedAt": "2024-01-05T10:00:00Z"
    },
    {
      "id": "rt-004",
      "code": "RT_ARCHIVED_OLD_PROCESS",
      "name": "已归档的旧版工艺",
      "version": "2.5",
      "status": "Archived",
      "type": "Standard",
      "applicableProducts": ["P-OLD-PRODUCT"],
      "steps": [],
      "changelog": [],
      "approvalHistory": [],
      "createdBy": "system",
      "createdAt": "2022-01-01T00:00:00Z",
      "updatedBy": "system",
      "updatedAt": "2022-01-01T00:00:00Z"
    }
  ]

  // 生成随机数据，基于真实模板
  const additionalData = Mock.mock({
    'items|15': [{
      'id|+1': function() {
        return 'rt-' + String(baseRoutings.length + this.id).padStart(3, '0')
      },
      'code': function() {
        const prefixes = ['RT_STD_', 'RT_CUSTOM_', 'RT_TRIAL_']
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
        const suffix = Mock.mock('@word(4, 8)').toUpperCase()
        return prefix + suffix
      },
      'name': function() {
        return '随机生成工艺路线 - ' + Mock.mock('@ctitle(5, 10)')
      },
      'version': '1.0',
      'status|1': ['Enabled', 'Draft', 'PendingApproval', 'Archived'],
      'type|1': ['Standard', 'Rework', 'Trial'],
      'applicableProducts|1-3': [function() {
        return 'P-' + Mock.mock('@word(4, 8)').toUpperCase()
      }],
      'steps|0-5': [
        {
          'stepId': () => uuidv4(),
          'stepNumber': '@integer(10, 50, 10)',
          'operationId|1': ['op-001', 'op-002', 'op-003', 'op-004', 'op-005', 'op-006'],
          'operationCode': function() {
            const opMap = {
              'op-001': 'ROLLING',
              'op-002': 'ANNEALING',
              'op-003': 'QC_ANNEAL_INSPECT',
              'op-004': 'SLITTING',
              'op-005': 'REWORK_SURFACE',
              'op-006': 'PACKING'
            }
            return opMap[this.operationId]
          },
          'operationName': function() {
            const opMap = {
              'op-001': '热轧',
              'op-002': '退火',
              'op-003': '退火后检验',
              'op-004': '分切',
              'op-005': '表面处理返工',
              'op-006': '包装'
            }
            return opMap[this.operationId]
          },
          'operationType|1': ['Production', 'Inspection', 'Packing', 'Storage', 'Move'],
          'flowLogic': function() {
            if (this.operationType === 'Inspection') {
              return { "nextStep": null, "onSuccessStep": '@integer(10, 100, 10)', "onFailureStep": '@integer(10, 100, 10)' }
            } else {
              const next = '@integer(10, 100, 10)'
              return { "nextStep": next, "onSuccessStep": next, "onFailureStep": null }
            }
          },
          'timeStandards': {
            'setup': function() {
              const setupType = Mock.mock('@pick(["Fixed", "Matrix"])')
              return {
                "type": setupType,
                "value": '@integer(0, 60)',
                "unit": "minute",
                "matrixId": setupType === 'Matrix' ? Mock.mock('@pick(["SM-SPEC-02", "SM-SIZE-01"])') : null
              }
            },
            'processing': function() {
              const processingType = Mock.mock('@pick(["Fixed", "Formula"])')
              return {
                "type": processingType,
                "value": processingType === 'Fixed' ? '@integer(10, 200)' : 0,
                "unit": Mock.mock('@pick(["分钟/吨", "分钟/卷", "分钟/批次", "分钟/米"])'),
                "formula": processingType === 'Formula' ? "@pick([\"10 * [thickness] + 5\", \"[length] * [width] / 100\"])" : null
              }
            }
          }
        }
      ],
      'changelog': [],
      'approvalHistory': [],
      'createdBy|1': ['admin', 'manager', 'process_engineer', 'quality_manager'],
      'createdAt': function() {
        return Mock.mock('@datetime("yyyy-MM-ddTHH:mm:ss.000Z")')
      },
      'updatedBy|1': ['admin', 'manager', 'process_engineer', 'quality_manager'],
      'updatedAt': function() {
        return this.createdAt
      }
    }]
  }).items
  
  return [...baseRoutings, ...additionalData]
}

const { v4: uuidv4 } = require('uuid') // 确保 uuidv4 在这里被引入

module.exports = {
  generateRoutingsData,
  data: generateRoutingsData()
}