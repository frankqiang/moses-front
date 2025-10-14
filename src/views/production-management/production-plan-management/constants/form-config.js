/**
 * 文件名称：form-config.js
 * 文件描述：生产计划管理表单配置（搜索表单）
 * 创建日期：2025-01-21
 * 修改记录：
 *   - 2025-01-21: 初始创建
 *   - 2025-01-21: 标记为废弃，已迁移到 PlanSearch.vue 的计算属性中使用字典系统
 *
 * @deprecated 此配置文件已废弃
 * 搜索表单配置已移至 PlanSearch.vue 的 searchFormConfig computed 属性
 * 使用字典系统动态获取选项，确保前后端数据一致性
 */

/* eslint-disable */

/**
 * @deprecated 已废弃：搜索表单配置已迁移到组件内部使用字典系统
 * 请在 PlanSearch.vue 中使用 searchFormConfig computed 属性
 */
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
    options: [], // 已废弃，使用字典系统
    priority: 'primary',
    clearable: true
  },
  {
    prop: 'source',
    label: '来源',
    type: 'select',
    placeholder: '请选择计划来源',
    options: [], // 已废弃，使用字典系统
    priority: 'advanced',
    clearable: true
  },
  {
    prop: 'planPriority',
    label: '优先级',
    type: 'select',
    placeholder: '请选择计划优先级',
    options: [], // 已废弃，使用字典系统
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

