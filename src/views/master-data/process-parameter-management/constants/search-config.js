/**
 * 文件名称：search-config.js
 * 文件描述：工艺参数管理模块搜索表单配置
 * 创建日期：2025-09-29
 * 修改记录：
 *   - 2025-09-29: 初始创建，覆盖TASK002 P0阶段搜索项
 */

import {
  TEMPLATE_STATUS_OPTIONS,
  VERSION_STATUS_OPTIONS,
  DEFAULT_SORT
} from './process-parameter-management'

// 搜索表单配置 - 对接 SearchForm 全局组件
export const SEARCH_FORM_CONFIG = [
  {
    type: 'input',
    prop: 'keyword',
    label: '关键字',
    placeholder: '输入模板编码/名称，自动去除空格',
    clearable: true,
    maxLength: 200,
    trimOnBlur: true,
    priority: 'primary'
  },
  {
    type: 'select',
    prop: 'status',
    label: '模板状态',
    placeholder: '请选择模板状态',
    options: TEMPLATE_STATUS_OPTIONS,
    clearable: true,
    priority: 'primary'
  },
  {
    type: 'select',
    prop: 'versionStatus',
    label: '版本状态',
    placeholder: '请选择版本状态',
    options: VERSION_STATUS_OPTIONS,
    clearable: true,
    priority: 'primary'
  },
  {
    type: 'remote-select',
    prop: 'applicableProductIds',
    label: '适用产品',
    placeholder: '搜索并选择适用产品',
    multiple: true,
    collapseTags: true,
    clearable: true,
    remoteConfig: {
      action: 'fetchProductOptions',
      valueField: 'id',
      labelField: 'productName',
      extraFields: ['productCode', 'lifecycleStatus']
    },
    priority: 'primary'
  },
  {
    type: 'input',
    prop: 'applicableAlloy',
    label: '适用合金',
    placeholder: '输入合金牌号，支持多个以逗号分隔',
    clearable: true,
    formatter: value => value?.toUpperCase(),
    priority: 'advanced'
  },
  {
    type: 'number-range',
    prop: 'thicknessRange',
    label: '厚度范围 (mm)',
    placeholder: '最小值 - 最大值，空表示不限',
    startProp: 'thicknessMin',
    endProp: 'thicknessMax',
    precision: 3,
    min: 0,
    max: 10,
    priority: 'advanced'
  },
  {
    type: 'number-range',
    prop: 'widthRange',
    label: '宽度范围 (mm)',
    placeholder: '最小值 - 最大值，空表示不限',
    startProp: 'widthMin',
    endProp: 'widthMax',
    precision: 1,
    min: 0,
    max: 3000,
    priority: 'advanced'
  },
  {
    type: 'daterange',
    prop: 'createdAtRange',
    label: '创建时间',
    startProp: 'createdAtFrom',
    endProp: 'createdAtTo',
    valueFormat: 'yyyy-MM-ddTHH:mm:ss',
    format: 'yyyy-MM-dd',
    clearable: true,
    priority: 'advanced'
  },
  {
    type: 'daterange',
    prop: 'updatedAtRange',
    label: '更新时间',
    startProp: 'updatedAtFrom',
    endProp: 'updatedAtTo',
    valueFormat: 'yyyy-MM-ddTHH:mm:ss',
    format: 'yyyy-MM-dd',
    clearable: true,
    priority: 'advanced'
  },
  {
    type: 'select',
    prop: 'sortBy',
    label: '排序规则',
    placeholder: '请选择排序字段',
    clearable: true,
    options: [
      { value: 'createdAt:desc', label: '创建时间：最新在前' },
      { value: 'createdAt:asc', label: '创建时间：最早在前' },
      { value: 'templateCode:asc', label: '模板编码：正序' },
      { value: 'templateCode:desc', label: '模板编码：倒序' },
      { value: 'templateName:asc', label: '模板名称：正序' },
      { value: 'templateName:desc', label: '模板名称：倒序' },
      { value: 'status:asc', label: '模板状态：正序' },
      { value: 'status:desc', label: '模板状态：倒序' }
    ],
    defaultValue: DEFAULT_SORT,
    priority: 'advanced'
  }
]

