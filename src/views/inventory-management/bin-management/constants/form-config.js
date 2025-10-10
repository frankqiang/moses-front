/**
 * 文件名称：form-config.js
 * 文件描述：料框/料垛管理模块表单配置和验证规则
 * 创建日期：2025-01-10
 * 修改记录:
 *   - 2025-01-10: 初始创建，定义料框和料垛的表单配置及验证规则
 */

import {
  BIN_STATUS_OPTIONS,
  TRIGGER_TYPE_OPTIONS,
  WEIGHT_LIMITS,
  BIN_CODE_PATTERN,
  BIN_CODE_FORMAT,
  STACK_CODE_PATTERN,
  STACK_CODE_FORMAT
} from './bin-management'

// ==================== 料框搜索表单配置 ====================
export const BIN_SEARCH_FORM_CONFIG = [
  {
    type: 'select',
    prop: 'status',
    label: '料框状态',
    placeholder: '请选择料框状态',
    options: BIN_STATUS_OPTIONS,
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
    placeholder: '支持料框编号、产品代码模糊查询',
    clearable: true,
    priority: 'primary'
  },
  {
    type: 'select',
    prop: 'binSpecificationId',
    label: '料框规格',
    placeholder: '请选择料框规格',
    options: [], // 动态选项，由组件加载
    clearable: true,
    filterable: true,
    priority: 'advanced'
  },
  {
    type: 'daterange',
    prop: 'registeredAtRange',
    label: '注册时间',
    placeholder: ['开始时间', '结束时间'],
    clearable: true,
    priority: 'advanced'
  }
]

// ==================== 料垛搜索表单配置 ====================
export const STACK_SEARCH_FORM_CONFIG = [
  {
    type: 'select',
    prop: 'status',
    label: '料垛状态',
    placeholder: '请选择料垛状态',
    options: [
      { value: 'ACTIVE', label: '活动中' },
      { value: 'DESTACKED', label: '已拆垛' }
    ],
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

// ==================== 料框表单配置 ====================
export const BIN_FORM_CONFIG = [
  {
    type: 'input',
    prop: 'binCode',
    label: '料框编号',
    placeholder: `格式：${BIN_CODE_FORMAT}（可选，不填自动生成）`,
    clearable: true,
    formatter: (value) => value?.toUpperCase().trim()
  },
  {
    type: 'select',
    prop: 'binSpecificationId',
    label: '料框规格',
    placeholder: '请选择料框规格',
    required: true,
    clearable: true,
    filterable: true
  },
  {
    type: 'select',
    prop: 'productId',
    label: '铝箔产品',
    placeholder: '请选择铝箔产品',
    required: true,
    clearable: true,
    filterable: true
  },
  {
    type: 'input',
    prop: 'productCode',
    label: '产品代码',
    placeholder: '请输入产品代码',
    required: true,
    clearable: true,
    formatter: (value) => value?.toUpperCase().trim()
  },
  {
    type: 'input',
    prop: 'batchNumber',
    label: '批次号',
    placeholder: '请输入批次号（可选）',
    clearable: true
  },
  {
    type: 'number',
    prop: 'weight',
    label: '重量 (kg)',
    placeholder: '请输入重量',
    required: true,
    min: WEIGHT_LIMITS.MIN,
    max: WEIGHT_LIMITS.MAX,
    step: WEIGHT_LIMITS.STEP,
    precision: WEIGHT_LIMITS.PRECISION
  },
  {
    type: 'select',
    prop: 'currentLocationId',
    label: '初始位置',
    placeholder: '请选择初始位置（可选）',
    clearable: true,
    filterable: true
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

// ==================== 料框表单验证规则 ====================
export const BIN_FORM_RULES = {
  binCode: [
    {
      pattern: BIN_CODE_PATTERN,
      message: `料框编号格式应为：${BIN_CODE_FORMAT}`,
      trigger: 'blur'
    }
  ],
  binSpecificationId: [
    { required: true, message: '请选择料框规格', trigger: 'change' }
  ],
  productId: [
    { required: true, message: '请选择铝箔产品', trigger: 'change' }
  ],
  productCode: [
    { required: true, message: '请输入产品代码', trigger: 'blur' },
    { min: 1, max: 100, message: '产品代码长度为1-100个字符', trigger: 'blur' }
  ],
  batchNumber: [
    { max: 100, message: '批次号长度不能超过100个字符', trigger: 'blur' }
  ],
  weight: [
    { required: true, message: '请输入重量', trigger: 'change' },
    {
      validator: (_, value, callback) => {
        if (value === undefined || value === null) {
          callback(new Error('请输入重量'))
          return
        }
        if (value <= 0) {
          callback(new Error('重量必须大于0'))
          return
        }
        callback()
      },
      trigger: 'change'
    }
  ],
  remarks: [
    { max: 500, message: '备注长度不能超过500个字符', trigger: 'blur' }
  ]
}

// ==================== 料框状态变更表单配置 ====================
export const BIN_STATUS_FORM_CONFIG = [
  {
    type: 'select',
    prop: 'targetStatus',
    label: '目标状态',
    placeholder: '请选择目标状态',
    options: BIN_STATUS_OPTIONS,
    required: true,
    clearable: false
  },
  {
    type: 'select',
    prop: 'triggerType',
    label: '触发类型',
    placeholder: '请选择触发类型',
    options: TRIGGER_TYPE_OPTIONS,
    required: true,
    clearable: false
  },
  {
    type: 'select',
    prop: 'newLocationId',
    label: '新位置',
    placeholder: '请选择新位置（可选）',
    clearable: true,
    filterable: true
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

// 料框状态变更表单验证规则
export const BIN_STATUS_FORM_RULES = {
  targetStatus: [
    { required: true, message: '请选择目标状态', trigger: 'change' }
  ],
  triggerType: [
    { required: true, message: '请选择触发类型', trigger: 'change' }
  ],
  remarks: [
    { max: 500, message: '备注长度不能超过500个字符', trigger: 'blur' }
  ]
}

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
export const BIN_FORM_DEFAULTS = {
  binCode: '',
  binSpecificationId: '',
  productId: '',
  productCode: '',
  batchNumber: '',
  weight: null,
  currentLocationId: '',
  remarks: ''
}

export const BIN_STATUS_FORM_DEFAULTS = {
  targetStatus: '',
  triggerType: '',
  newLocationId: '',
  remarks: ''
}

export const STACK_FORM_DEFAULTS = {
  stackCode: '',
  binIds: [],
  remarks: ''
}

export const DESTACK_FORM_DEFAULTS = {
  remarks: ''
}

