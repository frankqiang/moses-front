/**
 * 文件名称：create-plan-config.js
 * 文件描述：创建排程方案相关配置常量
 * 创建日期：2025-10-23
 * 修改记录：
 *   - 2025-10-23: 初始创建，定义创建排程方案的配置选项
 */

import { ALGORITHM_TYPE } from './schedule-management'

// 算法类型选项（用于创建表单）
export const ALGORITHM_TYPE_SELECT_OPTIONS = [
  {
    label: '基于规则的启发式算法',
    value: ALGORITHM_TYPE.RULE_BASED,
    description: '快速、可解释性强，适合日常排程',
    recommended: 5 // ⭐⭐⭐⭐⭐
  },
  {
    label: '约束规划算法',
    value: ALGORITHM_TYPE.CONSTRAINT_PROGRAMMING,
    description: '精确、保证最优解，适合复杂约束场景',
    recommended: 4 // ⭐⭐⭐⭐
  },
  {
    label: '模拟退火算法',
    value: ALGORITHM_TYPE.SIMULATED_ANNEALING,
    description: '全局优化、避免局部最优，适合大规模排程',
    recommended: 3 // ⭐⭐⭐
  },
  {
    label: '遗传算法',
    value: ALGORITHM_TYPE.GENETIC_ALGORITHM,
    description: '多目标优化，适合科研优化',
    recommended: 2 // ⭐⭐
  }
]

// 优先级选项（用于任务筛选）
// 注意：必须严格按照接口文档中的枚举值定义
// 参考：获取待排程任务列表接口详细说明.md - 任务优先级枚举
export const PRIORITY_OPTIONS = [
  { label: '紧急', value: 'emergency' },
  { label: '高', value: 'high' },
  { label: '普通', value: 'normal' },
  { label: '低', value: 'low' }
]

// 预设配置模板
export const OPTIMIZATION_PRESETS = {
  DEADLINE_SENSITIVE: {
    name: '交期敏感型',
    description: '优先保证按时交付，适合订单生产模式',
    goals: {
      meetDeadlineWeight: 0.5,
      utilizationWeight: 0.2,
      loadRateWeight: 0.2,
      energySavingWeight: 0.1
    }
  },
  EFFICIENCY_FIRST: {
    name: '效率优先型',
    description: '优先提高设备利用率和装载率',
    goals: {
      meetDeadlineWeight: 0.2,
      utilizationWeight: 0.4,
      loadRateWeight: 0.3,
      energySavingWeight: 0.1
    }
  },
  BALANCED: {
    name: '平衡型',
    description: '各项目标均衡，适合常规生产',
    goals: {
      meetDeadlineWeight: 0.4,
      utilizationWeight: 0.3,
      loadRateWeight: 0.2,
      energySavingWeight: 0.1
    }
  },
  ENERGY_SAVING: {
    name: '节能型',
    description: '注重能源节约，适合低峰期生产',
    goals: {
      meetDeadlineWeight: 0.3,
      utilizationWeight: 0.3,
      loadRateWeight: 0.2,
      energySavingWeight: 0.2
    }
  }
}

// 优化目标默认配置
export const DEFAULT_OPTIMIZATION_GOALS = {
  meetDeadlineWeight: 0.4,
  utilizationWeight: 0.3,
  loadRateWeight: 0.2,
  energySavingWeight: 0.1
}

// 约束规则默认配置
export const DEFAULT_CONSTRAINT_RULES = {
  minCapacity: 35,
  maxCapacity: 42,
  allowMixing: true
}

// 混炉规则配置选项
export const MIXING_RULES_CONFIG = {
  sameProductOnly: {
    label: '仅相同产品',
    description: '只允许相同产品编码的任务混炉'
  },
  sameAlloyGradeRequired: {
    label: '要求相同合金牌号',
    description: '混炉任务必须具有相同的合金牌号'
  },
  maxTemperatureDiff: {
    label: '最大温度差',
    description: '混炉任务的工艺温度差不超过指定值',
    unit: '℃'
  }
}

// 配置表单验证规则
export const CREATE_PLAN_VALIDATION_RULES = {
  scheduleStartTime: [
    { required: true, message: '请选择排程开始时间', trigger: 'change' }
  ],
  scheduleEndTime: [
    { required: true, message: '请选择排程结束时间', trigger: 'change' }
  ],
  algorithmType: [
    { required: true, message: '请选择排程算法类型', trigger: 'change' }
  ],
  planName: [
    { max: 200, message: '方案名称不能超过200个字符', trigger: 'blur' }
  ],
  remarks: [
    { max: 1000, message: '备注说明不能超过1000个字符', trigger: 'blur' }
  ]
}

// 时间范围快捷选项
export const TIME_RANGE_SHORTCUTS = [
  {
    text: '未来7天',
    value: () => {
      const start = new Date()
      start.setHours(0, 0, 0, 0)
      const end = new Date()
      end.setTime(end.getTime() + 3600 * 1000 * 24 * 7)
      end.setHours(23, 59, 59, 999)
      return [start, end]
    }
  },
  {
    text: '未来14天',
    value: () => {
      const start = new Date()
      start.setHours(0, 0, 0, 0)
      const end = new Date()
      end.setTime(end.getTime() + 3600 * 1000 * 24 * 14)
      end.setHours(23, 59, 59, 999)
      return [start, end]
    }
  },
  {
    text: '未来30天',
    value: () => {
      const start = new Date()
      start.setHours(0, 0, 0, 0)
      const end = new Date()
      end.setTime(end.getTime() + 3600 * 1000 * 24 * 30)
      end.setHours(23, 59, 59, 999)
      return [start, end]
    }
  }
]

