/**
 * 检验项目管理表单配置
 * 创建日期：2024-12-19
 * 修改记录：
 *   - 2024-12-19: 从 inspection-item.js 重构分离表单配置
 */
import {
  INSPECTION_CATEGORY_OPTIONS,
  DATA_TYPE_OPTIONS,
  APPLICABLE_PRODUCT_OPTIONS,
  INSPECTION_ITEM_STATUS_OPTIONS
} from './business'

// 搜索表单配置
export const SEARCH_FORM_CONFIG = [
  {
    prop: 'keyword',
    label: '关键词',
    type: 'input',
    placeholder: '搜索检验项目编码、名称...',
    class: 'search-item-keyword'
  },
  {
    prop: 'category',
    label: '检验类别',
    type: 'select',
    placeholder: '请选择检验类别',
    options: [
      { value: '', label: '全部' },
      ...INSPECTION_CATEGORY_OPTIONS
    ]
  },
  {
    prop: 'dataType',
    label: '数据类型',
    type: 'select',
    placeholder: '请选择数据类型',
    options: [
      { value: '', label: '全部' },
      ...DATA_TYPE_OPTIONS
    ]
  },
  {
    prop: 'applicableProduct',
    label: '适用产品',
    type: 'select',
    placeholder: '请选择适用产品',
    options: [
      { value: '', label: '全部' },
      ...APPLICABLE_PRODUCT_OPTIONS
    ]
  },
  {
    prop: 'status',
    label: '状态',
    type: 'select',
    placeholder: '请选择状态',
    options: [
      { value: '', label: '全部' },
      ...INSPECTION_ITEM_STATUS_OPTIONS
    ]
  }
]