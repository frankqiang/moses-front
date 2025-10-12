/**
 * 文件名称：form-config.js
 * 文件描述：生产计划管理表单配置（搜索表单）
 * 创建日期：2025-01-21
 * 修改记录：
 *   - 2025-01-21: 初始创建
 */

import {
  PLAN_STATUS_OPTIONS,
  PLAN_SOURCE_OPTIONS,
  PLAN_PRIORITY_OPTIONS
} from './production-plan-management'

// 搜索表单配置
export const SEARCH_FORM_CONFIG = [
  {
    prop: 'search',
    label: '关键词',
    type: 'input',
    placeholder: '计划编号、产品编码、客户名称',
    priority: 'primary',
    clearable: true
  },
  {
    prop: 'status',
    label: '状态',
    type: 'select',
    placeholder: '请选择计划状态',
    options: PLAN_STATUS_OPTIONS,
    priority: 'primary',
    clearable: true
  },
  {
    prop: 'source',
    label: '来源',
    type: 'select',
    placeholder: '请选择计划来源',
    options: PLAN_SOURCE_OPTIONS,
    priority: 'advanced',
    clearable: true
  },
  {
    prop: 'planPriority',
    label: '优先级',
    type: 'select',
    placeholder: '请选择计划优先级',
    options: PLAN_PRIORITY_OPTIONS,
    priority: 'advanced',
    clearable: true
  },
  {
    prop: 'productCode',
    label: '产品编码',
    type: 'input',
    placeholder: '请输入产品编码',
    priority: 'advanced',
    clearable: true
  },
  {
    prop: 'planNumber',
    label: '计划编号',
    type: 'input',
    placeholder: '请输入计划编号',
    priority: 'advanced',
    clearable: true
  },
  {
    prop: 'externalOrderNumber',
    label: '外部订单号',
    type: 'input',
    placeholder: '请输入外部订单号',
    priority: 'advanced',
    clearable: true
  },
  {
    prop: 'deliveryDateRange',
    label: '计划交期',
    type: 'daterange',
    placeholder: ['开始日期', '结束日期'],
    priority: 'advanced',
    clearable: true,
    format: 'yyyy-MM-dd',
    valueFormat: 'yyyy-MM-dd'
  },
  {
    prop: 'createdDateRange',
    label: '创建时间',
    type: 'daterange',
    placeholder: ['开始日期', '结束日期'],
    priority: 'advanced',
    clearable: true,
    format: 'yyyy-MM-dd',
    valueFormat: 'yyyy-MM-dd'
  }
]

