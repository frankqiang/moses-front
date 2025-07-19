/**
 * 工艺路线相关的常量
 */

// 路线类型选项
export const ROUTING_TYPE_OPTIONS = [
  { label: '标准路线', value: 'Standard' },
  { label: '返工路线', value: 'Rework' },
  { label: '试验路线', value: 'Trial' }
]

// 路线状态配置
export const ROUTING_STATUS_CONFIG = {
  // 用于StatusTag组件的文本映射
  textMap: {
    Draft: '草稿',
    PendingApproval: '待审批',
    Enabled: '生效',
    Archived: '已归档'
  },
  // 用于StatusTag组件的类型（颜色）映射
  typeMap: {
    Draft: 'info',
    PendingApproval: 'warning',
    Enabled: 'success',
    Archived: 'danger'
  }
}

// 路线状态选项（用于选择器）
export const ROUTING_STATUS_OPTIONS = Object.keys(ROUTING_STATUS_CONFIG.textMap).map(key => ({
  value: key,
  label: ROUTING_STATUS_CONFIG.textMap[key]
}))

// 路线类型业务规则配置
export const ROUTING_TYPE_RULES = {
  Standard: {
    name: '标准路线',
    description: '标准生产工艺路线',
    requiredFields: ['code', 'name', 'type', 'applicableProducts'],
    stepConstraints: {
      minSteps: 1,
      maxSteps: null,
      requiredOperationTypes: [],
      forbiddenOperationTypes: []
    },
    validationRules: {
      // 标准路线的特殊验证规则
    }
  },
  Rework: {
    name: '返工路线',
    description: '产品返工处理工艺路线',
    requiredFields: ['code', 'name', 'type', 'applicableProducts'],
    stepConstraints: {
      minSteps: 2,
      maxSteps: null,
      requiredOperationTypes: ['Inspection'], // 返工路线必须包含检验工序
      forbiddenOperationTypes: []
    },
    validationRules: {
      // 返工路线的特殊验证规则
      firstStepMustBeInspection: true
    }
  },
  Trial: {
    name: '试验路线',
    description: '试验性生产工艺路线',
    requiredFields: ['code', 'name', 'type', 'applicableProducts'],
    stepConstraints: {
      minSteps: 1,
      maxSteps: 10, // 试验路线限制最多10个步骤
      requiredOperationTypes: [],
      forbiddenOperationTypes: []
    },
    validationRules: {
      // 试验路线的特殊验证规则
    }
  }
}

// 获取路线类型规则
export function getRoutingTypeRule(type) {
  return ROUTING_TYPE_RULES[type] || ROUTING_TYPE_RULES.Standard
}