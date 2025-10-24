/**
 * 文件名称：form-config.js
 * 文件描述：设备故障管理模块表单配置
 * 创建日期：2025-01-20
 * 修改记录：
 *   - 2025-01-20: 初始创建
 */

import {
  FAILURE_LEVEL_OPTIONS,
  FAILURE_TYPE_OPTIONS,
  FAILURE_STATUS_OPTIONS,
  REPEAT_FAILURE_OPTIONS
} from './equipment-fault'

// 搜索表单配置
export const SEARCH_FORM_CONFIG = [
  {
    prop: 'equipmentId',
    label: '设备',
    component: 'el-select',
    priority: 'primary',
    placeholder: '请选择设备',
    clearable: true,
    filterable: true,
    options: [],
    optionLabel: 'equipmentName',
    optionValue: 'id'
  },
  {
    prop: 'failureLevel',
    label: '故障等级',
    component: 'el-select',
    priority: 'primary',
    placeholder: '请选择故障等级',
    clearable: true,
    options: FAILURE_LEVEL_OPTIONS
  },
  {
    prop: 'failureType',
    label: '故障类型',
    component: 'el-select',
    priority: 'primary',
    placeholder: '请选择故障类型',
    clearable: true,
    options: FAILURE_TYPE_OPTIONS
  },
  {
    prop: 'status',
    label: '处理状态',
    component: 'el-select',
    priority: 'primary',
    placeholder: '请选择处理状态',
    clearable: true,
    multiple: true,
    collapseTags: true,
    options: FAILURE_STATUS_OPTIONS
  },
  {
    prop: 'reporterId',
    label: '报告人',
    component: 'el-select',
    priority: 'advanced',
    placeholder: '请选择报告人',
    clearable: true,
    filterable: true,
    options: [],
    optionLabel: 'name',
    optionValue: 'id'
  },
  {
    prop: 'repairerId',
    label: '处理人',
    component: 'el-select',
    priority: 'advanced',
    placeholder: '请选择处理人',
    clearable: true,
    filterable: true,
    options: [],
    optionLabel: 'name',
    optionValue: 'id'
  },
  {
    prop: 'isRepeatFailure',
    label: '重复故障',
    component: 'el-select',
    priority: 'advanced',
    placeholder: '请选择',
    clearable: true,
    options: REPEAT_FAILURE_OPTIONS
  },
  {
    prop: 'dateRange',
    label: '故障时间',
    component: 'el-date-picker',
    priority: 'advanced',
    type: 'datetimerange',
    startPlaceholder: '开始时间',
    endPlaceholder: '结束时间',
    rangeSeparator: '至',
    clearable: true,
    valueFormat: 'yyyy-MM-ddTHH:mm:ss.sssZ'
  },
  {
    prop: 'search',
    label: '关键词',
    component: 'el-input',
    priority: 'advanced',
    placeholder: '搜索故障编码或描述',
    clearable: true
  }
]

