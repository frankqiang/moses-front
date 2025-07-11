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
      "version": "1.2",
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
          "onSuccessStep": 20,
          "onFailureStep": 50,
          "standardSetupTime": 60,
          "standardProcessingTime": 120
        },
        {
          "stepId": "step-001-2",
          "stepNumber": 20,
          "operationId": "op-003",
          "operationCode": "QC_ANNEAL_INSPECT",
          "operationName": "退火后检验",
          "onSuccessStep": 30,
          "onFailureStep": 50,
          "standardSetupTime": 10,
          "standardProcessingTime": 15
        }
      ],
      "changelog": [
        { "version": "1.0", "user": "admin", "timestamp": "2023-10-01T10:00:00Z", "note": "初始创建" },
        { "version": "1.2", "user": "li_guan", "timestamp": "2023-10-20T11:00:00Z", "note": "增加返工流程并审批通过" }
      ],
      "approvalHistory": [
        { "version": "1.2", "approver": "wang_director", "timestamp": "2023-10-21T09:00:00Z", "result": "Approved", "comment": "同意发布" }
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
      "changelog": [],
      "approvalHistory": [],
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
          "onSuccessStep": 20,
          "onFailureStep": null,
          "standardSetupTime": 120,
          "standardProcessingTime": 180
        }
      ],
      "changelog": [
        { "version": "1.0", "user": "admin", "timestamp": "2024-01-05T10:00:00Z", "note": "初始创建并提交审批" }
      ],
      "approvalHistory": [],
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
      'steps': [],
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

module.exports = {
  generateRoutingsData,
  data: generateRoutingsData()
} 