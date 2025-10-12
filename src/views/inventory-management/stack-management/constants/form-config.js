/**
 * 文件名称：form-config.js
 * 文件描述：料垛管理模块表单配置和验证规则
 * 创建日期：2025-01-10
 * 修改记录:
 *   - 2025-01-10: 初始创建，定义料垛的表单配置及验证规则
 */

import {
  STACK_CODE_PATTERN,
  STACK_CODE_FORMAT,
  STACK_STATUS_OPTIONS
} from './stack-management'

// ==================== 料垛搜索表单配置 ====================
export const STACK_SEARCH_FORM_CONFIG = [
  {
    type: 'select',
    prop: 'status',
    label: '料垛状态',
    placeholder: '请选择料垛状态',
    options: STACK_STATUS_OPTIONS, // 使用常量，值为中文
    clearable: true,
    priority: 'primary'
  },
  {
    type: 'input',
    prop: 'specCode',
    label: '规格代码',
    placeholder: '请输入规格代码',
    clearable: true,
    priority: 'primary'
  },
  {
    type: 'input',
    prop: 'productCode',
    label: '产品代码',
    placeholder: '请输入产品代码',
    clearable: true,
    priority: 'primary'
  },
  {
    type: 'input',
    prop: 'batchNumber',
    label: '批次号',
    placeholder: '请输入批次号',
    clearable: true,
    priority: 'primary'
  },
  {
    type: 'input',
    prop: 'searchKeyword',
    label: '关键词搜索',
    placeholder: '支持料垛编号、产品代码模糊查询',
    clearable: true,
    priority: 'primary'
  },
  {
    type: 'daterange',
    prop: 'createdAtRange',
    label: '创建时间',
    placeholder: ['开始时间', '结束时间'],
    clearable: true,
    priority: 'advanced'
  }
]

// ==================== 组垛表单配置 ====================
export const STACK_FORM_CONFIG = [
  {
    type: 'input',
    prop: 'stackCode',
    label: '料垛编号',
    placeholder: `格式：${STACK_CODE_FORMAT}（可选，不填自动生成）`,
    clearable: true,
    formatter: (value) => value?.toUpperCase().trim()
  },
  {
    type: 'textarea',
    prop: 'remarks',
    label: '备注',
    placeholder: '请输入备注信息（可选），最多500字',
    rows: 3,
    showWordLimit: true,
    maxlength: 500,
    clearable: true
  }
]

// 组垛表单验证规则
export const STACK_FORM_RULES = {
  stackCode: [
    {
      pattern: STACK_CODE_PATTERN,
      message: `料垛编号格式应为：${STACK_CODE_FORMAT}`,
      trigger: 'blur'
    }
  ],
  remarks: [
    { max: 500, message: '备注长度不能超过500个字符', trigger: 'blur' }
  ]
}

// ==================== 拆垛表单配置 ====================
export const DESTACK_FORM_CONFIG = [
  {
    type: 'textarea',
    prop: 'remarks',
    label: '拆垛原因',
    placeholder: '请输入拆垛原因（可选），最多500字',
    rows: 3,
    showWordLimit: true,
    maxlength: 500,
    clearable: true
  }
]

// 拆垛表单验证规则
export const DESTACK_FORM_RULES = {
  remarks: [
    { max: 500, message: '拆垛原因长度不能超过500个字符', trigger: 'blur' }
  ]
}

// ==================== 表单初始值 ====================
export const STACK_FORM_DEFAULTS = {
  stackCode: '',
  binIds: [],
  remarks: ''
}

export const DESTACK_FORM_DEFAULTS = {
  remarks: ''
}

