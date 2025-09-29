/**
 * 文件名称：template-form-config.js
 * 文件描述：工艺模板基础信息抽屉表单配置与校验规则
 * 创建日期：2025-09-29
 * 修改记录：
 *   - 2025-09-29: 初始创建，完成TASK002 P0模板基础信息配置
 */

import {
  TEMPLATE_STATUS,
  TEMPLATE_STATUS_OPTIONS,
  TEMPLATE_CODE_HINT,
  SEGMENT_TYPES,
  DEFAULT_SEGMENT_TEMPLATE
} from './process-parameter-management'

// 模板基础信息字段配置 - 对接 EnhancedForm 组件
export const TEMPLATE_FORM_FIELDS = [
  {
    type: 'input',
    prop: 'templateCode',
    label: '模板编码',
    placeholder: '请输入模板编码，如 PT-1100-H18-ANNEALING',
    required: true,
    clearable: true,
    maxlength: 100,
    formatter: value => value?.toUpperCase().trim(),
    hint: TEMPLATE_CODE_HINT,
    rules: [
      { required: true, message: '模板编码不能为空', trigger: 'blur' },
      {
        pattern: /^PT-[A-Z0-9-]{3,96}$/,
        message: '编码需以PT-开头，仅包含大写字母、数字、连字符',
        trigger: 'blur'
      }
    ],
    disabledOnEdit: true
  },
  {
    type: 'input',
    prop: 'templateName',
    label: '模板名称',
    placeholder: '请输入模板名称',
    required: true,
    clearable: true,
    maxlength: 200,
    rules: [
      { required: true, message: '模板名称不能为空', trigger: 'blur' },
      { min: 2, max: 200, message: '长度需在2-200字符内', trigger: 'blur' }
    ]
  },
  {
    type: 'textarea',
    prop: 'description',
    label: '模板描述',
    placeholder: '可描述适用场景、退火炉、关键参数说明，最多2000字',
    rows: 3,
    maxlength: 2000,
    clearable: true
  },
  {
    type: 'select',
    prop: 'status',
    label: '模板状态',
    placeholder: '请选择模板状态',
    options: TEMPLATE_STATUS_OPTIONS,
    required: true,
    defaultValue: TEMPLATE_STATUS.DRAFT,
    rules: [{ required: true, message: '请选择模板状态', trigger: 'change' }],
    disabledOnCreate: true
  },
  {
    type: 'remote-select',
    prop: 'applicableProductIds',
    label: '适用产品',
    placeholder: '搜索并选择适用产品，支持多选',
    multiple: true,
    collapseTags: true,
    clearable: true,
    remoteConfig: {
      action: 'fetchProductOptions',
      valueField: 'id',
      labelField: 'productName',
      extraFields: ['productCode', 'lifecycleStatus']
    },
    tooltip: '仅可选择“在产”状态的铝箔产品，后端会校验停产/无质量标准产品',
    rules: [{ type: 'array', max: 20, message: '最多选择20个适用产品', trigger: 'change' }]
  },
  {
    type: 'input',
    prop: 'applicableAlloyGrades',
    label: '适用合金牌号',
    placeholder: '如 1100, 8011，多个以逗号分隔',
    formatter: value => value?.toUpperCase(),
    maxlength: 200,
    clearable: true,
    rules: [
      {
        validator: (_, value, callback) => {
          if (!value) {
            callback()
            return
          }
          const invalid = value
            .split(',')
            .map(item => item.trim())
            .filter(Boolean)
            .some(item => !/^[0-9A-Z.-]{2,10}$/.test(item))
          if (invalid) {
            callback(new Error('合金牌号仅允许大写字母、数字、连字符、点号'))
            return
          }
          callback()
        },
        trigger: 'blur'
      }
    ]
  },
  {
    type: 'number-range',
    prop: 'applicableThicknessRange',
    label: '适用厚度范围 (mm)',
    startProp: 'applicableThicknessMin',
    endProp: 'applicableThicknessMax',
    precision: 3,
    min: 0.001,
    max: 10,
    clearable: true,
    rules: [{ validator: validateRange('厚度'), trigger: ['blur', 'change'] }]
  },
  {
    type: 'number-range',
    prop: 'applicableWidthRange',
    label: '适用宽度范围 (mm)',
    startProp: 'applicableWidthMin',
    endProp: 'applicableWidthMax',
    precision: 1,
    min: 100,
    max: 3000,
    clearable: true,
    rules: [{ validator: validateRange('宽度'), trigger: ['blur', 'change'] }]
  },
  {
    type: 'input',
    prop: 'versionNumber',
    label: '首个版本号',
    placeholder: '如 v1.0，后端统一转为小写',
    required: true,
    clearable: true,
    maxlength: 20,
    formatter: value => value?.toLowerCase(),
    rules: [
      { required: true, message: '版本号不能为空', trigger: 'blur' },
      {
        pattern: /^v\d+(\.\d+)?$/,
        message: '版本号格式如 v1 或 v1.0',
        trigger: 'blur'
      }
    ]
  },
  {
    type: 'textarea',
    prop: 'versionDescription',
    label: '版本描述',
    rows: 3,
    maxlength: 2000,
    placeholder: '描述版本变更背景、核心参数调整等信息',
    clearable: true
  }
]

export const TEMPLATE_FORM_EXTENSIONS = {
  versionPresets: VERSION_PRESETS
}

// 自定义范围校验函数
function validateRange(label) {
  return (_, value, callback) => {
    const { start, end } = value || {}
    if (start && end && Number(start) > Number(end)) {
      callback(new Error(`${label}下限不能大于上限`))
      return
    }
    callback()
  }
}

export const VERSION_PRESETS = [
  {
    value: 'default',
    label: '标准三段退火',
    segments: DEFAULT_SEGMENT_TEMPLATE
  },
  {
    value: 'longHolding',
    label: '长保温退火',
    segments: DEFAULT_SEGMENT_TEMPLATE.map(item => {
      if (item.segmentType === SEGMENT_TYPES.HOLDING) {
        return {
          ...item,
          duration: item.duration + 120,
          description: `${item.description}（延长保温时间以提高组织均匀性）`
        }
      }
      return item
    })
  },
  {
    value: 'rapidCooling',
    label: '快速冷却工艺',
    segments: DEFAULT_SEGMENT_TEMPLATE.map(item => {
      if (item.segmentType === SEGMENT_TYPES.QUICK_COOLING) {
        return {
          ...item,
          coolingRate: 45,
          description: `${item.description}（提高降温速率以满足硬态要求）`
        }
      }
      return item
    })
  }
]

