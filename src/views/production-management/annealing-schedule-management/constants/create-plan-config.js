/**
 * 文件名称：create-plan-config.js
 * 文件描述：创建排程方案相关配置常量
 * 创建日期：2025-10-23
 * 修改记录：
 *   - 2025-10-23: 初始创建，定义创建排程方案的配置选项
 */

import { ALGORITHM_TYPE } from './schedule-management'

// 算法类型选项（用于创建表单）
// ⚠️ P0阶段说明：当前只有 rule-based 算法已实现，其他算法计划在后续版本实现
export const ALGORITHM_TYPE_SELECT_OPTIONS = [
  {
    label: '基于规则的启发式算法',
    value: ALGORITHM_TYPE.RULE_BASED,
    description: '快速、可解释性强，适合日常排程【当前唯一可用算法】',
    recommended: 5, // ⭐⭐⭐⭐⭐
    disabled: false // P0阶段：已实现 ✅
  },
  {
    label: '约束规划算法',
    value: ALGORITHM_TYPE.CONSTRAINT_PROGRAMMING,
    description: '精确、保证最优解，适合复杂约束场景【P1阶段实现】',
    recommended: 4, // ⭐⭐⭐⭐
    disabled: true // P0阶段：未实现 ❌
  },
  {
    label: '模拟退火算法',
    value: ALGORITHM_TYPE.SIMULATED_ANNEALING,
    description: '全局优化、避免局部最优，适合大规模排程【P2阶段实现】',
    recommended: 3, // ⭐⭐⭐
    disabled: true // P0阶段：未实现 ❌
  },
  {
    label: '遗传算法',
    value: ALGORITHM_TYPE.GENETIC_ALGORITHM,
    description: '多目标优化，适合科研优化【P2阶段实现】',
    recommended: 2, // ⭐⭐
    disabled: true // P0阶段：未实现 ❌
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

// ⚠️ P0阶段说明：优化目标配置和约束规则配置已移除
// - optimizationGoals: 该参数仅用于计算综合评分，不影响排程算法的执行和结果
//   当前版本使用后端默认权重：40%交期 + 30%利用率 + 30%装载率
// - constraintRules: 容量和混炉规则由后端算法自动决定
//   当前版本混炉规则：按 mixingGroupCode → productCode → alloyGrade 分组
// P1阶段如需自定义这些配置，可重新启用

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

