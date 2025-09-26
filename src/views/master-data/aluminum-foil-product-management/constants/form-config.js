/**
 * 文件名称：form-config.js
 * 文件描述：铝箔产品管理模块搜索与表单配置
 * 创建日期：2025-09-26
 * 修改记录：
 *   - 2025-09-26: 初始创建，提供搜索、表单配置及校验规则
 */

import {
  LIFECYCLE_STATUS_OPTIONS,
  UNIT_WEIGHT_TYPE_OPTIONS,
  THICKNESS_LIMITS,
  WIDTH_LIMITS,
  UNIT_WEIGHT_LIMITS
} from './aluminum-foil-product-management'

// 搜索表单配置
export const SEARCH_FORM_CONFIG = [
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
    prop: 'productName',
    label: '产品名称',
    placeholder: '请输入产品名称',
    clearable: true,
    priority: 'primary'
  },
  {
    type: 'input',
    prop: 'alloyGrade',
    label: '合金牌号',
    placeholder: '请输入合金牌号',
    clearable: true,
    priority: 'primary'
  },
  {
    type: 'input',
    prop: 'temper',
    label: '状态/硬度',
    placeholder: '请输入状态或硬度',
    clearable: true,
    priority: 'primary'
  },
  {
    type: 'select',
    prop: 'lifecycleStatus',
    label: '生命周期状态',
    placeholder: '请选择生命周期状态',
    options: LIFECYCLE_STATUS_OPTIONS,
    clearable: true,
    priority: 'primary'
  },
  {
    type: 'number',
    prop: 'thicknessMin',
    label: '厚度下限 (mm)',
    placeholder: '最小厚度',
    min: THICKNESS_LIMITS.MIN,
    max: THICKNESS_LIMITS.MAX,
    step: THICKNESS_LIMITS.STEP,
    precision: THICKNESS_LIMITS.PRECISION,
    clearable: true,
    priority: 'advanced'
  },
  {
    type: 'number',
    prop: 'thicknessMax',
    label: '厚度上限 (mm)',
    placeholder: '最大厚度',
    min: THICKNESS_LIMITS.MIN,
    max: THICKNESS_LIMITS.MAX,
    step: THICKNESS_LIMITS.STEP,
    precision: THICKNESS_LIMITS.PRECISION,
    clearable: true,
    priority: 'advanced'
  },
  {
    type: 'number',
    prop: 'widthMin',
    label: '宽度下限 (mm)',
    placeholder: '最小宽度',
    min: WIDTH_LIMITS.MIN,
    max: WIDTH_LIMITS.MAX,
    step: WIDTH_LIMITS.STEP,
    precision: WIDTH_LIMITS.PRECISION,
    clearable: true,
    priority: 'advanced'
  },
  {
    type: 'number',
    prop: 'widthMax',
    label: '宽度上限 (mm)',
    placeholder: '最大宽度',
    min: WIDTH_LIMITS.MIN,
    max: WIDTH_LIMITS.MAX,
    step: WIDTH_LIMITS.STEP,
    precision: WIDTH_LIMITS.PRECISION,
    clearable: true,
    priority: 'advanced'
  },
  {
    type: 'input',
    prop: 'search',
    label: '全文检索',
    placeholder: '支持产品编码/名称/备注模糊查询',
    clearable: true,
    priority: 'advanced'
  }
]

// 表单配置
export const FORM_CONFIG = [
  {
    type: 'input',
    prop: 'productCode',
    label: '产品编码',
    placeholder: '如：AF-1100-H18-0.006x1200',
    required: true,
    clearable: true,
    formatter: (value) => value?.toUpperCase().trim(),
    rules: [
      { required: true, message: '请填写产品编码', trigger: 'blur' },
      {
        pattern: /^AF-[A-Z0-9]+-[A-Z0-9]+-[0-9]*\.?[0-9]+x[0-9]*\.?[0-9]+$/,
        message: '格式应为AF-合金-硬度-厚度x宽度',
        trigger: 'blur'
      }
    ]
  },
  {
    type: 'input',
    prop: 'productName',
    label: '产品名称',
    placeholder: '请输入产品名称',
    required: true,
    clearable: true,
    rules: [
      { required: true, message: '请填写产品名称', trigger: 'blur' },
      { min: 1, max: 200, message: '长度需在1-200字符内', trigger: 'blur' }
    ]
  },
  {
    type: 'input',
    prop: 'rawMaterialType',
    label: '原材料类型',
    placeholder: '请输入原材料类型',
    required: true,
    clearable: true,
    rules: [
      { required: true, message: '请填写原材料类型', trigger: 'blur' },
      { min: 1, max: 100, message: '长度需在1-100字符内', trigger: 'blur' }
    ]
  },
  {
    type: 'input',
    prop: 'alloyGrade',
    label: '合金牌号',
    placeholder: '请输入合金牌号',
    required: true,
    clearable: true,
    formatter: (value) => value?.toUpperCase().trim(),
    rules: [
      { required: true, message: '请填写合金牌号', trigger: 'blur' },
      { pattern: /^[A-Z0-9]+$/, message: '合金牌号需为字母或数字', trigger: 'blur' }
    ]
  },
  {
    type: 'input',
    prop: 'temper',
    label: '状态/硬度',
    placeholder: '请输入状态或硬度',
    required: true,
    clearable: true,
    formatter: (value) => value?.toUpperCase().trim(),
    rules: [
      { required: true, message: '请填写状态或硬度', trigger: 'blur' },
      { pattern: /^[A-Z0-9]+$/, message: '状态/硬度需为字母或数字', trigger: 'blur' }
    ]
  },
  {
    type: 'number',
    prop: 'thickness',
    label: '厚度 (mm)',
    placeholder: '请输入厚度',
    required: true,
    min: THICKNESS_LIMITS.MIN,
    max: THICKNESS_LIMITS.MAX,
    step: THICKNESS_LIMITS.STEP,
    precision: THICKNESS_LIMITS.PRECISION,
    rules: [
      { required: true, message: '请填写厚度', trigger: 'change' },
      {
        validator: (_, value, callback) => {
          if (value === undefined || value === null) {
            callback(new Error('请填写厚度'))
            return
          }
          if (value <= 0) {
            callback(new Error('厚度需为正数'))
            return
          }
          callback()
        },
        trigger: 'change'
      }
    ]
  },
  {
    type: 'number',
    prop: 'width',
    label: '宽度 (mm)',
    placeholder: '请输入宽度',
    required: true,
    min: WIDTH_LIMITS.MIN,
    max: WIDTH_LIMITS.MAX,
    step: WIDTH_LIMITS.STEP,
    precision: WIDTH_LIMITS.PRECISION,
    rules: [
      { required: true, message: '请填写宽度', trigger: 'change' },
      {
        validator: (_, value, callback) => {
          if (value === undefined || value === null) {
            callback(new Error('请填写宽度'))
            return
          }
          if (value <= 0) {
            callback(new Error('宽度需为正数'))
            return
          }
          callback()
        },
        trigger: 'change'
      }
    ]
  },
  {
    type: 'number',
    prop: 'unitWeight',
    label: '单位重量 (kg)',
    placeholder: '请输入单位重量',
    required: true,
    min: UNIT_WEIGHT_LIMITS.MIN,
    max: UNIT_WEIGHT_LIMITS.MAX,
    step: UNIT_WEIGHT_LIMITS.STEP,
    precision: UNIT_WEIGHT_LIMITS.PRECISION,
    rules: [
      { required: true, message: '请填写单位重量', trigger: 'change' },
      {
        validator: (_, value, callback) => {
          if (value === undefined || value === null) {
            callback(new Error('请填写单位重量'))
            return
          }
          if (value <= 0) {
            callback(new Error('单位重量需为正数'))
            return
          }
          callback()
        },
        trigger: 'change'
      }
    ]
  },
  {
    type: 'select',
    prop: 'unitWeightType',
    label: '单位重量类型',
    placeholder: '请选择单位重量类型',
    required: true,
    options: UNIT_WEIGHT_TYPE_OPTIONS,
    clearable: true,
    rules: [
      { required: true, message: '请选择单位重量类型', trigger: 'change' }
    ]
  },
  {
    type: 'select',
    prop: 'processTemplateIds',
    label: '关联工艺模板',
    placeholder: '请选择工艺模板',
    multiple: true,
    filterable: true,
    collapseTags: true,
    rules: [
      { required: true, message: '请选择至少一个工艺模板', trigger: 'change' }
    ]
  },
  {
    type: 'select',
    prop: 'qualityStandardId',
    label: '质量标准',
    placeholder: '请选择质量标准',
    filterable: true,
    rules: [
      { required: true, message: '请选择质量标准', trigger: 'change' }
    ]
  },
  {
    type: 'select',
    prop: 'lifecycleStatus',
    label: '生命周期状态',
    placeholder: '请选择生命周期状态',
    options: LIFECYCLE_STATUS_OPTIONS,
    required: true,
    rules: [
      { required: true, message: '请选择生命周期状态', trigger: 'change' }
    ]
  },
  {
    type: 'textarea',
    prop: 'description',
    label: '产品描述',
    placeholder: '请输入产品描述，最多500字',
    rows: 3,
    showWordLimit: true,
    maxlength: 500,
    clearable: true
  }
]

// 表单初始值
export const FORM_DEFAULTS = {
  productCode: '',
  productName: '',
  rawMaterialType: '',
  alloyGrade: '',
  temper: '',
  thickness: null,
  width: null,
  unitWeight: null,
  unitWeightType: UNIT_WEIGHT_TYPE_OPTIONS[0]?.value || '',
  processTemplateIds: [],
  qualityStandardId: '',
  lifecycleStatus: LIFECYCLE_STATUS_OPTIONS[0]?.value || '',
  description: ''
}

// 表单分组配置（可扩展）
export const FORM_GROUPS = [
  {
    title: '基础信息',
    fields: [
      'productCode',
      'productName',
      'rawMaterialType',
      'alloyGrade',
      'temper'
    ]
  },
  {
    title: '规格参数',
    fields: ['thickness', 'width', 'unitWeight', 'unitWeightType']
  },
  {
    title: '关联配置',
    fields: ['processTemplateIds', 'qualityStandardId', 'lifecycleStatus']
  },
  {
    title: '其他信息',
    fields: ['description']
  }
]

