/**
 * 工艺路线表单配置
 */
import { ROUTING_STATUS_OPTIONS, ROUTING_TYPE_OPTIONS } from './routing'

// 搜索表单配置
export const SEARCH_FORM_CONFIG = [
  {
    type: 'input',
    prop: 'keyword',
    label: '关键词',
    placeholder: '路线代码/名称/适用产品',
    clearable: true
  },
  {
    type: 'select',
    prop: 'status',
    label: '状态',
    placeholder: '请选择状态',
    clearable: true,
    multiple: true,
    options: ROUTING_STATUS_OPTIONS
  },
    {
    type: 'select',
    prop: 'type',
    label: '路线类型',
    placeholder: '请选择路线类型',
    clearable: true,
    multiple: true,
    options: ROUTING_TYPE_OPTIONS
  }
] 