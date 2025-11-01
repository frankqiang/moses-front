/**
 * 文件名称：form-config.js
 * 文件描述：退火任务管理模块搜索表单配置
 * 创建日期：2025-10-18
 * 修改记录：
 *   - 2025-10-18: 初始创建，提供搜索表单配置
 */

import {
  TASK_STATUS_OPTIONS,
  TASK_PRIORITY_OPTIONS,
  TASK_SOURCE_OPTIONS,
  SCHEDULING_STATUS_OPTIONS
} from './annealing-task'

// 搜索表单配置
export const SEARCH_FORM_CONFIG = [
  {
    type: 'input',
    prop: 'taskCode',
    label: '任务编号',
    placeholder: '请输入任务编号',
    clearable: true,
    priority: 'primary'
  },
  {
    type: 'select',
    prop: 'status',
    label: '任务状态',
    placeholder: '请选择任务状态',
    options: TASK_STATUS_OPTIONS,
    clearable: true,
    multiple: true,
    collapseTags: true,
    priority: 'primary'
  },
  {
    type: 'input',
    prop: 'plannedFurnaceCode',
    label: '计划执行炉号',
    placeholder: '请输入炉号',
    clearable: true,
    priority: 'primary'
  },
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
    priority: 'advanced'
  },
  {
    type: 'select',
    prop: 'priority',
    label: '任务优先级',
    placeholder: '请选择优先级',
    options: TASK_PRIORITY_OPTIONS,
    clearable: true,
    priority: 'advanced'
  },
  {
    type: 'select',
    prop: 'source',
    label: '任务来源',
    placeholder: '请选择任务来源',
    options: TASK_SOURCE_OPTIONS,
    clearable: true,
    priority: 'advanced'
  },
  {
    type: 'input',
    prop: 'planNumber',
    label: '生产计划编号',
    placeholder: '请输入计划编号',
    clearable: true,
    priority: 'advanced'
  },
  {
    type: 'datetime',
    prop: 'plannedLoadingDateStart',
    label: '计划装炉开始时间',
    placeholder: '请选择开始时间',
    clearable: true,
    priority: 'advanced'
  },
  {
    type: 'datetime',
    prop: 'plannedLoadingDateEnd',
    label: '计划装炉结束时间',
    placeholder: '请选择结束时间',
    clearable: true,
    priority: 'advanced'
  },
  {
    type: 'input',
    prop: 'search',
    label: '关键词搜索',
    placeholder: '支持任务编号/任务名称模糊查询',
    clearable: true,
    priority: 'advanced'
  },
  {
    type: 'select',
    prop: 'schedulingStatus',
    label: '排程状态',
    placeholder: '请选择排程状态',
    options: SCHEDULING_STATUS_OPTIONS,
    clearable: true,
    priority: 'advanced'
  }
]

