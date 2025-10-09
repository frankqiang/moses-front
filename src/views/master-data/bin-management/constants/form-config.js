/**
 * 文件名称：form-config.js
 * 文件描述：料框规格管理模块表单配置
 * 创建日期：2025-01-09
 * 修改记录：
 *   - 2025-01-09: 初始创建，定义表单验证规则和字段配置
 *   - 2025-01-09: 添加搜索表单配置
 *   - 2025-01-09: TASK008-P1 添加高级验证规则（规格代码重复性检查、尺寸合理性、产品类型有效性）
 */

import {
  LENGTH_LIMITS,
  WIDTH_LIMITS,
  HEIGHT_LIMITS,
  MAX_LOAD_CAPACITY_LIMITS,
  MAX_STACK_LAYERS_LIMITS,
  SPECIFICATION_STATUS_OPTIONS,
  MATERIAL_OPTIONS
} from './bin-specification'

/**
 * 创建表单验证规则的工厂函数
 *
 * @description
 * 动态创建表单验证规则，支持异步验证器和业务规则验证。
 * 部分验证规则（如规格代码重复性检查）需要组件上下文，因此使用工厂函数创建。
 *
 * @param {Object} context - 验证上下文
 * @param {Function} context.checkSpecCodeExists - 规格代码重复性检查函数
 * @param {string} context.currentSpecificationId - 当前编辑的规格ID（编辑模式）
 * @param {Function} context.validateDimensionRationality - 尺寸合理性验证函数
 * @param {Function} context.validateApplicableProductTypes - 产品类型有效性验证函数
 * @param {Function} context.getFormData - 获取表单数据的函数
 * @returns {Object} 验证规则对象
 */
export function createFormValidationRules(context = {}) {
  const {
    checkSpecCodeExists,
    currentSpecificationId,
    validateDimensionRationality,
    validateApplicableProductTypes,
    getFormData
  } = context

  return {
    specCode: [
      { required: true, message: '请输入规格代码', trigger: 'blur' },
      { min: 1, max: 50, message: '规格代码长度为1-50个字符', trigger: 'blur' },
      {
        pattern: /^[A-Z0-9-]+$/,
        message: '规格代码只能包含大写字母、数字和中划线',
        trigger: 'blur'
      },
      // TASK008-P1-6: 规格代码重复性的实时检查
      ...(checkSpecCodeExists
        ? [{
          asyncValidator: async(rule, value, callback) => {
            if (!value || !value.trim()) {
              return callback()
            }

            try {
              const normalizedCode = value.trim().toUpperCase()
              const exists = await checkSpecCodeExists(normalizedCode, currentSpecificationId)

              if (exists) {
                callback(new Error(`规格代码"${normalizedCode}"已存在，请使用其他代码`))
              } else {
                callback()
              }
            } catch (error) {
              // 检查失败时不阻止提交，由后端进行最终验证
              console.error('规格代码重复性检查失败:', error)
              callback()
            }
          },
          trigger: 'blur'
        }]
        : [])
    ],
    specName: [
      { required: true, message: '请输入规格名称', trigger: 'blur' },
      { min: 1, max: 200, message: '规格名称长度为1-200个字符', trigger: 'blur' }
    ],
    length: [
      { required: true, message: '请输入长度', trigger: 'blur' },
      {
        type: 'number',
        min: LENGTH_LIMITS.MIN,
        max: LENGTH_LIMITS.MAX,
        message: `长度必须在${LENGTH_LIMITS.MIN}-${LENGTH_LIMITS.MAX}cm之间`,
        trigger: 'blur'
      },
      // TASK008-P1-7: 尺寸参数合理性的业务验证（联动验证）
      ...(validateDimensionRationality && getFormData
        ? [{
          validator: (rule, value, callback) => {
            if (!value) {
              return callback()
            }

            const formData = getFormData()
            if (formData.width && formData.height) {
              const result = validateDimensionRationality(value, formData.width, formData.height)
              if (!result.valid) {
                callback(new Error(result.message))
              } else {
                callback()
              }
            } else {
              callback()
            }
          },
          trigger: 'change'
        }]
        : [])
    ],
    width: [
      { required: true, message: '请输入宽度', trigger: 'blur' },
      {
        type: 'number',
        min: WIDTH_LIMITS.MIN,
        max: WIDTH_LIMITS.MAX,
        message: `宽度必须在${WIDTH_LIMITS.MIN}-${WIDTH_LIMITS.MAX}cm之间`,
        trigger: 'blur'
      },
      // TASK008-P1-7: 尺寸参数合理性的业务验证（联动验证）
      ...(validateDimensionRationality && getFormData
        ? [{
          validator: (rule, value, callback) => {
            if (!value) {
              return callback()
            }

            const formData = getFormData()
            if (formData.length && formData.height) {
              const result = validateDimensionRationality(formData.length, value, formData.height)
              if (!result.valid) {
                callback(new Error(result.message))
              } else {
                callback()
              }
            } else {
              callback()
            }
          },
          trigger: 'change'
        }]
        : [])
    ],
    height: [
      { required: true, message: '请输入高度', trigger: 'blur' },
      {
        type: 'number',
        min: HEIGHT_LIMITS.MIN,
        max: HEIGHT_LIMITS.MAX,
        message: `高度必须在${HEIGHT_LIMITS.MIN}-${HEIGHT_LIMITS.MAX}cm之间`,
        trigger: 'blur'
      },
      // TASK008-P1-7: 尺寸参数合理性的业务验证（联动验证）
      ...(validateDimensionRationality && getFormData
        ? [{
          validator: (rule, value, callback) => {
            if (!value) {
              return callback()
            }

            const formData = getFormData()
            if (formData.length && formData.width) {
              const result = validateDimensionRationality(formData.length, formData.width, value)
              if (!result.valid) {
                callback(new Error(result.message))
              } else {
                callback()
              }
            } else {
              callback()
            }
          },
          trigger: 'change'
        }]
        : [])
    ],
    maxLoadCapacity: [
      { required: true, message: '请输入最大载重', trigger: 'blur' },
      {
        type: 'number',
        min: MAX_LOAD_CAPACITY_LIMITS.MIN,
        max: MAX_LOAD_CAPACITY_LIMITS.MAX,
        message: `最大载重必须在${MAX_LOAD_CAPACITY_LIMITS.MIN}-${MAX_LOAD_CAPACITY_LIMITS.MAX}kg之间`,
        trigger: 'blur'
      }
    ],
    material: [
      { required: true, message: '请输入材质', trigger: 'blur' },
      { min: 1, max: 100, message: '材质长度为1-100个字符', trigger: 'blur' }
    ],
    maxStackLayers: [
      { required: true, message: '请输入最大堆叠层数', trigger: 'blur' },
      {
        type: 'number',
        min: MAX_STACK_LAYERS_LIMITS.MIN,
        max: MAX_STACK_LAYERS_LIMITS.MAX,
        message: `最大堆叠层数必须在${MAX_STACK_LAYERS_LIMITS.MIN}-${MAX_STACK_LAYERS_LIMITS.MAX}之间`,
        trigger: 'blur'
      }
    ],
    applicableProductTypes: [
      // TASK008-P1-9: 适用产品类型的有效性检查
      ...(validateApplicableProductTypes
        ? [{
          validator: (rule, value, callback) => {
            const result = validateApplicableProductTypes(value)
            if (!result.valid) {
              callback(new Error(result.message))
            } else {
              callback()
            }
          },
          trigger: 'change'
        }]
        : [])
    ],
    supplierInfo: [
      { max: 500, message: '供应商信息长度不能超过500个字符', trigger: 'blur' }
    ]
  }
}

// 基础表单验证规则（不包含异步验证，用于不需要高级验证的场景）
export const FORM_VALIDATION_RULES = {
  specCode: [
    { required: true, message: '请输入规格代码', trigger: 'blur' },
    { min: 1, max: 50, message: '规格代码长度为1-50个字符', trigger: 'blur' },
    {
      pattern: /^[A-Z0-9-]+$/,
      message: '规格代码只能包含大写字母、数字和中划线',
      trigger: 'blur'
    }
  ],
  specName: [
    { required: true, message: '请输入规格名称', trigger: 'blur' },
    { min: 1, max: 200, message: '规格名称长度为1-200个字符', trigger: 'blur' }
  ],
  length: [
    { required: true, message: '请输入长度', trigger: 'blur' },
    {
      type: 'number',
      min: LENGTH_LIMITS.MIN,
      max: LENGTH_LIMITS.MAX,
      message: `长度必须在${LENGTH_LIMITS.MIN}-${LENGTH_LIMITS.MAX}cm之间`,
      trigger: 'blur'
    }
  ],
  width: [
    { required: true, message: '请输入宽度', trigger: 'blur' },
    {
      type: 'number',
      min: WIDTH_LIMITS.MIN,
      max: WIDTH_LIMITS.MAX,
      message: `宽度必须在${WIDTH_LIMITS.MIN}-${WIDTH_LIMITS.MAX}cm之间`,
      trigger: 'blur'
    }
  ],
  height: [
    { required: true, message: '请输入高度', trigger: 'blur' },
    {
      type: 'number',
      min: HEIGHT_LIMITS.MIN,
      max: HEIGHT_LIMITS.MAX,
      message: `高度必须在${HEIGHT_LIMITS.MIN}-${HEIGHT_LIMITS.MAX}cm之间`,
      trigger: 'blur'
    }
  ],
  maxLoadCapacity: [
    { required: true, message: '请输入最大载重', trigger: 'blur' },
    {
      type: 'number',
      min: MAX_LOAD_CAPACITY_LIMITS.MIN,
      max: MAX_LOAD_CAPACITY_LIMITS.MAX,
      message: `最大载重必须在${MAX_LOAD_CAPACITY_LIMITS.MIN}-${MAX_LOAD_CAPACITY_LIMITS.MAX}kg之间`,
      trigger: 'blur'
    }
  ],
  material: [
    { required: true, message: '请输入材质', trigger: 'blur' },
    { min: 1, max: 100, message: '材质长度为1-100个字符', trigger: 'blur' }
  ],
  maxStackLayers: [
    { required: true, message: '请输入最大堆叠层数', trigger: 'blur' },
    {
      type: 'number',
      min: MAX_STACK_LAYERS_LIMITS.MIN,
      max: MAX_STACK_LAYERS_LIMITS.MAX,
      message: `最大堆叠层数必须在${MAX_STACK_LAYERS_LIMITS.MIN}-${MAX_STACK_LAYERS_LIMITS.MAX}之间`,
      trigger: 'blur'
    }
  ],
  supplierInfo: [
    { max: 500, message: '供应商信息长度不能超过500个字符', trigger: 'blur' }
  ]
}

// 表单字段初始值
export const FORM_INITIAL_VALUES = {
  specCode: '',
  specName: '',
  length: null,
  width: null,
  height: null,
  maxLoadCapacity: null,
  material: '',
  maxStackLayers: null,
  applicableProductTypes: [],
  supplierInfo: '',
  status: '启用'
}

// 搜索表单配置（用于SearchForm组件）
export const SEARCH_FORM_CONFIG = [
  {
    prop: 'specCode',
    label: '规格代码',
    type: 'input',
    placeholder: '请输入规格代码',
    clearable: true,
    priority: 'primary'
  },
  {
    prop: 'specName',
    label: '规格名称',
    type: 'input',
    placeholder: '请输入规格名称',
    clearable: true,
    priority: 'primary'
  },
  {
    prop: 'material',
    label: '材质',
    type: 'select',
    placeholder: '请选择材质',
    options: MATERIAL_OPTIONS,
    clearable: true,
    priority: 'primary'
  },
  {
    prop: 'status',
    label: '状态',
    type: 'select',
    placeholder: '请选择状态',
    options: SPECIFICATION_STATUS_OPTIONS,
    clearable: true,
    priority: 'primary'
  }
]

