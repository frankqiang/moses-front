/**
 * 文件名称：version-form-config.js
 * 文件描述：工艺模板版本参数配置（温度段/气氛/风机）表单项定义
 * 创建日期：2025-09-29
 * 修改记录：
 *   - 2025-09-29: 初始创建，完成TASK002 P0版本参数配置定义
 *   - 2025-10-08: 新增"创建新版本"表单配置，完成TASK002 P1-8
 */

import {
  SEGMENT_TYPES,
  SEGMENT_TYPE_OPTIONS,
  FAN_MODE_OPTIONS,
  SEGMENT_FIELD_LIMITS,
  ATMOSPHERE_FIELD_LIMITS,
  FAN_FIELD_LIMITS,
  READONLY_VERSION_STATUSES,
  DEFAULT_SEGMENT_TEMPLATE,
  FAN_FREQUENCY_RECOMMENDATIONS
} from './process-parameter-management'

// 版本基础字段配置
export const VERSION_FORM_FIELDS = [
  {
    type: 'input',
    prop: 'versionNumber',
    label: '版本号',
    placeholder: '如 v1.1',
    required: true,
    clearable: true,
    formatter: value => value?.toLowerCase(),
    dynamicDisabled: ({ status }) => READONLY_VERSION_STATUSES.includes(status),
    rules: [
      { required: true, message: '版本号不能为空', trigger: 'blur' },
      {
        pattern: /^v\d+(\.\d+)?$/,
        message: '版本号需符合 v1 或 v1.1 格式',
        trigger: 'blur'
      }
    ]
  },
  {
    type: 'textarea',
    prop: 'versionDescription',
    label: '版本说明',
    rows: 3,
    maxlength: 2000,
    placeholder: '记录版本变更内容、审批备注等',
    clearable: true,
    dynamicDisabled: ({ status }) => READONLY_VERSION_STATUSES.includes(status)
  }
]

// 温度段表单配置
export const SEGMENT_FORM_FIELDS = [
  {
    type: 'input-number',
    prop: 'segmentOrder',
    label: '段序号',
    required: true,
    min: SEGMENT_FIELD_LIMITS.segmentOrder.min,
    max: SEGMENT_FIELD_LIMITS.segmentOrder.max,
    step: SEGMENT_FIELD_LIMITS.segmentOrder.step,
    dynamicDisabled: ({ status }) => READONLY_VERSION_STATUSES.includes(status),
    rules: [{ required: true, message: '段序号不能为空', trigger: 'change' }]
  },
  {
    type: 'select',
    prop: 'segmentType',
    label: '段类型',
    required: true,
    options: SEGMENT_TYPE_OPTIONS,
    dynamicDisabled: ({ status }) => READONLY_VERSION_STATUSES.includes(status),
    rules: [{ required: true, message: '请选择段类型', trigger: 'change' }]
  },
  {
    type: 'input-number',
    prop: 'targetTemperature',
    label: `目标温度 (${SEGMENT_FIELD_LIMITS.targetTemperature.unit})`,
    required: true,
    min: SEGMENT_FIELD_LIMITS.targetTemperature.min,
    max: SEGMENT_FIELD_LIMITS.targetTemperature.max,
    step: SEGMENT_FIELD_LIMITS.targetTemperature.step,
    dynamicDisabled: ({ status }) => READONLY_VERSION_STATUSES.includes(status),
    rules: [{ required: true, message: '请输入目标温度', trigger: 'change' }]
  },
  {
    type: 'input-number',
    prop: 'duration',
    label: `持续时间 (${SEGMENT_FIELD_LIMITS.duration.unit})`,
    required: true,
    min: SEGMENT_FIELD_LIMITS.duration.min,
    max: SEGMENT_FIELD_LIMITS.duration.max,
    step: SEGMENT_FIELD_LIMITS.duration.step,
    dynamicDisabled: ({ status }) => READONLY_VERSION_STATUSES.includes(status),
    rules: [{ required: true, message: '请输入持续时间', trigger: 'change' }]
  },
  {
    type: 'input-number',
    prop: 'heatingRate',
    label: `升温速率 (${SEGMENT_FIELD_LIMITS.heatingRate.unit})`,
    min: SEGMENT_FIELD_LIMITS.heatingRate.min,
    max: SEGMENT_FIELD_LIMITS.heatingRate.max,
    step: SEGMENT_FIELD_LIMITS.heatingRate.step,
    dynamicDisabled: ({ status }) => READONLY_VERSION_STATUSES.includes(status),
    rules: [
      {
        validator: (_, value, callback, form) => {
          if (form.segmentType === SEGMENT_TYPES.HEATING && !value) {
            callback(new Error('升温段必须填写升温速率'))
            return
          }
          callback()
        },
        trigger: 'change'
      }
    ]
  },
  {
    type: 'input-number',
    prop: 'coolingRate',
    label: `降温速率 (${SEGMENT_FIELD_LIMITS.coolingRate.unit})`,
    min: SEGMENT_FIELD_LIMITS.coolingRate.min,
    max: SEGMENT_FIELD_LIMITS.coolingRate.max,
    step: SEGMENT_FIELD_LIMITS.coolingRate.step,
    dynamicDisabled: ({ status }) => READONLY_VERSION_STATUSES.includes(status),
    rules: [
      {
        validator: (_, value, callback, form) => {
          const needValue = [SEGMENT_TYPES.COOLING, SEGMENT_TYPES.QUICK_COOLING].includes(form.segmentType)
          if (needValue && !value) {
            callback(new Error('降温/快速冷却段必须填写降温速率'))
            return
          }
          callback()
        },
        trigger: 'change'
      }
    ]
  },
  {
    type: 'textarea',
    prop: 'description',
    label: '段说明',
    rows: 2,
    maxlength: 500,
    clearable: true,
    dynamicDisabled: ({ status }) => READONLY_VERSION_STATUSES.includes(status)
  }
]

// 保护气氛参数表单配置
export const ATMOSPHERE_FORM_FIELDS = [
  {
    type: 'select',
    prop: 'atmosphereType',
    label: '气氛类型',
    required: true,
    options: [], // ⚠️ 需在组件中通过 mixin 的 this.atmosphereTypeOptions 动态赋值
    dynamicDisabled: ({ status }) => READONLY_VERSION_STATUSES.includes(status),
    rules: [{ required: true, message: '请选择气氛类型', trigger: 'change' }]
  },
  {
    type: 'input-number',
    prop: 'flowRate',
    label: `流量 (${ATMOSPHERE_FIELD_LIMITS.flowRate.unit})`,
    required: true,
    min: ATMOSPHERE_FIELD_LIMITS.flowRate.min,
    max: ATMOSPHERE_FIELD_LIMITS.flowRate.max,
    step: ATMOSPHERE_FIELD_LIMITS.flowRate.step,
    dynamicDisabled: ({ status }) => READONLY_VERSION_STATUSES.includes(status),
    rules: [{ required: true, message: '请输入流量设定值', trigger: 'change' }]
  },
  {
    type: 'number-range',
    prop: 'flowRateRange',
    label: `流量范围 (${ATMOSPHERE_FIELD_LIMITS.flowRate.unit})`,
    startProp: 'flowRateMin',
    endProp: 'flowRateMax',
    precision: 1,
    min: ATMOSPHERE_FIELD_LIMITS.flowRate.min,
    max: ATMOSPHERE_FIELD_LIMITS.flowRate.max,
    clearable: true,
    dynamicDisabled: ({ status }) => READONLY_VERSION_STATUSES.includes(status),
    rules: [{ validator: validateRange('流量'), trigger: ['blur', 'change'] }]
  },
  {
    type: 'input-number',
    prop: 'pressure',
    label: `压力 (${ATMOSPHERE_FIELD_LIMITS.pressure.unit})`,
    min: ATMOSPHERE_FIELD_LIMITS.pressure.min,
    max: ATMOSPHERE_FIELD_LIMITS.pressure.max,
    step: ATMOSPHERE_FIELD_LIMITS.pressure.step,
    dynamicDisabled: ({ status }) => READONLY_VERSION_STATUSES.includes(status)
  },
  {
    type: 'number-range',
    prop: 'pressureRange',
    label: `压力范围 (${ATMOSPHERE_FIELD_LIMITS.pressure.unit})`,
    startProp: 'pressureMin',
    endProp: 'pressureMax',
    precision: 0,
    min: ATMOSPHERE_FIELD_LIMITS.pressure.min,
    max: ATMOSPHERE_FIELD_LIMITS.pressure.max,
    clearable: true,
    dynamicDisabled: ({ status }) => READONLY_VERSION_STATUSES.includes(status),
    rules: [{ validator: validateRange('压力'), trigger: ['blur', 'change'] }]
  },
  {
    type: 'switch',
    prop: 'supportsHydrogen',
    label: '是否支持氢气',
    activeValue: true,
    inactiveValue: false,
    tooltip: '氢氮混合气类型必须启用此选项',
    dynamicDisabled: ({ status }) => READONLY_VERSION_STATUSES.includes(status)
  },
  {
    type: 'textarea',
    prop: 'description',
    label: '参数说明',
    rows: 2,
    maxlength: 500,
    clearable: true,
    dynamicDisabled: ({ status }) => READONLY_VERSION_STATUSES.includes(status)
  }
]

// 风机参数表单配置
export const FAN_FORM_FIELDS = [
  {
    type: 'input-number',
    prop: 'frequency',
    label: `频率设定 (${FAN_FIELD_LIMITS.frequency.unit})`,
    required: true,
    min: FAN_FIELD_LIMITS.frequency.min,
    max: FAN_FIELD_LIMITS.frequency.max,
    step: FAN_FIELD_LIMITS.frequency.step,
    tooltip: FAN_FREQUENCY_RECOMMENDATIONS.default.suggestion,
    dynamicDisabled: ({ status }) => READONLY_VERSION_STATUSES.includes(status),
    rules: [{ required: true, message: '请输入风机频率', trigger: 'change' }]
  },
  {
    type: 'number-range',
    prop: 'frequencyRange',
    label: `频率范围 (${FAN_FIELD_LIMITS.frequency.unit})`,
    startProp: 'frequencyMin',
    endProp: 'frequencyMax',
    precision: 1,
    min: FAN_FIELD_LIMITS.frequency.min,
    max: FAN_FIELD_LIMITS.frequency.max,
    clearable: true,
    dynamicDisabled: ({ status }) => READONLY_VERSION_STATUSES.includes(status),
    rules: [{ validator: validateRange('频率'), trigger: ['blur', 'change'] }]
  },
  {
    type: 'select',
    prop: 'mode',
    label: '运行模式',
    options: FAN_MODE_OPTIONS,
    defaultValue: '变频',
    dynamicDisabled: ({ status }) => READONLY_VERSION_STATUSES.includes(status)
  },
  {
    type: 'select',
    prop: 'frequencyRecommendation',
    label: '频率推荐',
    options: [
      { value: 'default', label: '标准模式 (30-55Hz)' },
      { value: 'highAirflow', label: '高流量模式 (45-70Hz)' },
      { value: 'lowAirflow', label: '低流量模式 (20-35Hz)' }
    ],
    tooltip: '选择推荐模式以快速应用频率范围',
    onChange: ({ value, setFieldValue }) => {
      const config = FAN_FREQUENCY_RECOMMENDATIONS[value] || FAN_FREQUENCY_RECOMMENDATIONS.default
      setFieldValue('frequency', config.min)
      setFieldValue('frequencyRange', { start: config.min, end: config.max })
      setFieldValue('frequencySuggestion', config.suggestion)
    },
    dynamicDisabled: ({ status }) => READONLY_VERSION_STATUSES.includes(status)
  },
  {
    type: 'textarea',
    prop: 'frequencySuggestion',
    label: '推荐说明',
    rows: 2,
    readonly: true,
    placeholder: '选择频率推荐后将自动填充说明',
    clearable: true
  },
  {
    type: 'input-number',
    prop: 'segmentOrder',
    label: '适用段序号',
    min: SEGMENT_FIELD_LIMITS.segmentOrder.min,
    max: SEGMENT_FIELD_LIMITS.segmentOrder.max,
    step: SEGMENT_FIELD_LIMITS.segmentOrder.step,
    tooltip: '留空表示整个版本通用，填写数字则仅对特定段生效',
    dynamicDisabled: ({ status }) => READONLY_VERSION_STATUSES.includes(status)
  },
  {
    type: 'textarea',
    prop: 'description',
    label: '备注说明',
    rows: 2,
    maxlength: 500,
    clearable: true,
    dynamicDisabled: ({ status }) => READONLY_VERSION_STATUSES.includes(status)
  }
]

export const SEGMENT_FORM_PRESETS = {
  default: DEFAULT_SEGMENT_TEMPLATE,
  heatingOnly: DEFAULT_SEGMENT_TEMPLATE.filter(item => item.segmentType !== SEGMENT_TYPES.QUICK_COOLING),
  rapidCooling: DEFAULT_SEGMENT_TEMPLATE.map(item => {
    if (item.segmentType === SEGMENT_TYPES.QUICK_COOLING) {
      return {
        ...item,
        duration: 120,
        coolingRate: 40
      }
    }
    return item
  })
}

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

// 创建新版本表单配置
export const CREATE_NEW_VERSION_FORM_FIELDS = [
  {
    type: 'input',
    prop: 'newVersionNumber',
    label: '新版本号',
    placeholder: '请输入版本号，格式如 v1.1 或 1.1',
    required: true,
    clearable: true,
    rules: [
      { required: true, message: '新版本号不能为空', trigger: 'blur' },
      {
        pattern: /^(v?\d+(\.\d+)?)$/,
        message: '版本号格式应为 v1.0 或 1.0',
        trigger: 'blur'
      }
    ]
  },
  {
    type: 'textarea',
    prop: 'versionDescription',
    label: '版本说明',
    rows: 3,
    maxlength: 2000,
    placeholder: '请描述新版本的主要变更内容、优化点等（选填）',
    clearable: true
  },
  {
    type: 'select',
    prop: 'copyFromVersionId',
    label: '源版本',
    placeholder: '请选择要复制的源版本',
    clearable: true,
    tooltip: '选择一个已有版本作为新版本的基础，默认为最新版本'
  }
]

