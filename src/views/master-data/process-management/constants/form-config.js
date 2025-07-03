/**
 * 工序管理表单配置
 */
import { OPERATION_TYPE_OPTIONS, OPERATION_STATUS_OPTIONS } from './enums'

// 搜索表单配置
export const SEARCH_FORM_CONFIG = [
  {
    type: 'input',
    prop: 'keyword',
    label: '工序名称/代码',
    placeholder: '请输入工序名称或代码',
    clearable: true
  },
  {
    type: 'select',
    prop: 'type',
    label: '工序类型',
    placeholder: '请选择工序类型',
    clearable: true,
    multiple: true,
    options: OPERATION_TYPE_OPTIONS
  },
  {
    type: 'select',
    prop: 'status',
    label: '状态',
    placeholder: '请选择状态',
    clearable: true,
    multiple: true,
    options: OPERATION_STATUS_OPTIONS
  }
] 