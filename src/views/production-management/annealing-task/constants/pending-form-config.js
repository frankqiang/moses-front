/**
 * 文件名称：pending-form-config.js
 * 文件描述：待排程任务管理搜索表单配置
 * 创建日期：2025-10-20
 * 修改记录：
 *   - 2025-10-20: 初始创建，定义待排程任务搜索表单项
 */

import { TASK_PRIORITY_OPTIONS } from './annealing-task'

// 待排程任务搜索表单配置
export const PENDING_SEARCH_FORM_CONFIG = [
  {
    type: 'input',
    prop: 'productCode',
    label: '产品编码',
    placeholder: '请输入产品编码',
    clearable: true,
    priority: 'primary'
  },
  {
    type: 'input',
    prop: 'alloyGrade',
    label: '合金牌号',
    placeholder: '请输入合金牌号',
    clearable: true,
    priority: 'primary'
  },
  {
    type: 'input',
    prop: 'mixingGroupCode',
    label: '混炉分组编码',
    placeholder: '请输入混炉分组编码',
    clearable: true,
    priority: 'primary'
  },
  {
    type: 'select',
    prop: 'priorities',
    label: '任务优先级',
    placeholder: '请选择任务优先级',
    options: TASK_PRIORITY_OPTIONS,
    clearable: true,
    multiple: true,
    collapseTags: true,
    priority: 'primary'
  },
  {
    type: 'datetime',
    prop: 'plannedLoadingFrom',
    label: '计划装炉开始时间',
    placeholder: '请选择开始时间',
    clearable: true,
    dateType: 'datetime',
    valueFormat: "yyyy-MM-dd'T'HH:mm:ssXXX",
    priority: 'advanced'
  },
  {
    type: 'datetime',
    prop: 'plannedLoadingTo',
    label: '计划装炉结束时间',
    placeholder: '请选择结束时间',
    clearable: true,
    dateType: 'datetime',
    valueFormat: "yyyy-MM-dd'T'HH:mm:ssXXX",
    priority: 'advanced'
  },
  {
    type: 'input-number',
    prop: 'minWeight',
    label: '最小重量(吨)',
    placeholder: '请输入最小重量',
    min: 0,
    precision: 3,
    step: 0.1,
    clearable: true,
    priority: 'advanced'
  },
  {
    type: 'input-number',
    prop: 'maxWeight',
    label: '最大重量(吨)',
    placeholder: '请输入最大重量',
    min: 0,
    precision: 3,
    step: 0.1,
    clearable: true,
    priority: 'advanced'
  },
  {
    type: 'slot',
    prop: 'includeScheduleLocked',
    label: '包含已锁定任务',
    slotName: 'includeScheduleLocked',
    priority: 'primary'
  }
]

