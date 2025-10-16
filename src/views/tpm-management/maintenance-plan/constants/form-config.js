/**
 * 文件名称：form-config.js
 * 文件描述：维护计划管理模块的搜索、表单配置及校验规则
 * 创建日期：2025-10-15
 * 修改记录：
 *   - 2025-10-15: 初始创建，完成搜索与表单配置定义
 */

// 搜索表单配置 - 面向 SearchForm 组件
export const SEARCH_FORM_CONFIG = [
  {
    type: 'input',
    prop: 'search',
    label: '关键词搜索',
    placeholder: '请输入计划编码或名称',
    clearable: true,
    priority: 'primary'
  },
  {
    type: 'select',
    prop: 'equipmentId',
    label: '关联设备',
    placeholder: '请选择设备',
    clearable: true,
    priority: 'primary',
    // 设备选项需要通过远程搜索获取
    remote: true,
    remoteMethod: 'searchEquipment'
  },
  {
    type: 'dict-select',
    prop: 'maintenanceType',
    label: '维护类型',
    placeholder: '请选择维护类型',
    clearable: true,
    priority: 'primary',
    dictModule: 'tpm',
    dictKey: 'maintenanceTypes'
  },
  {
    type: 'dict-select',
    prop: 'cycleType',
    label: '周期类型',
    placeholder: '请选择周期类型',
    clearable: true,
    priority: 'secondary',
    dictModule: 'tpm',
    dictKey: 'cycleTypes'
  },
  {
    type: 'dict-select',
    prop: 'status',
    label: '计划状态',
    placeholder: '请选择状态',
    clearable: true,
    priority: 'secondary',
    dictModule: 'tpm',
    dictKey: 'planStatuses'
  }
]

// 维护计划表单字段配置 - 面向 MaintenancePlanFormDrawer 组件
export const MAINTENANCE_PLAN_FORM_FIELDS = [
  // 一、基础信息
  {
    section: '基础信息',
    sectionKey: 'basic',
    fields: [
      {
        type: 'input',
        prop: 'planCode',
        label: '计划编码',
        placeholder: '留空则自动生成',
        required: false,
        clearable: true,
        maxlength: 100,
        showWordLimit: true,
        formatter: value => value?.toUpperCase().trim(),
        hint: '不填写时系统将根据设备编码自动生成',
        span: 12,
        rules: [
          { max: 100, message: '计划编码最大长度为100个字符', trigger: 'blur' }
        ]
      },
      {
        type: 'input',
        prop: 'planName',
        label: '计划名称',
        placeholder: '请输入计划名称',
        required: true,
        clearable: true,
        maxlength: 200,
        showWordLimit: true,
        span: 12,
        rules: [
          { required: true, message: '请输入计划名称', trigger: 'blur' },
          { min: 1, max: 200, message: '长度在 1 到 200 个字符', trigger: 'blur' }
        ]
      },
      {
        type: 'remote-select',
        prop: 'equipmentId',
        label: '关联设备',
        placeholder: '请选择设备',
        required: true,
        clearable: true,
        filterable: true,
        remote: true,
        remoteMethod: 'searchEquipment',
        loading: 'equipmentLoading',
        optionLabel: 'name',
        optionValue: 'id',
        optionFormat: item => `${item.equipmentCode} - ${item.name}`,
        span: 12,
        rules: [
          { required: true, message: '请选择关联设备', trigger: 'change' }
        ]
      },
      {
        type: 'dict-select',
        prop: 'maintenanceType',
        label: '维护类型',
        placeholder: '请选择维护类型',
        required: true,
        clearable: true,
        dictModule: 'tpm',
        dictKey: 'maintenanceTypes',
        span: 12,
        rules: [
          { required: true, message: '请选择维护类型', trigger: 'change' }
        ]
      }
    ]
  },

  // 二、维护周期配置
  {
    section: '维护周期配置',
    sectionKey: 'cycle',
    fields: [
      {
        type: 'dict-select',
        prop: 'cycleType',
        label: '周期类型',
        placeholder: '请选择周期类型',
        required: true,
        clearable: true,
        dictModule: 'tpm',
        dictKey: 'cycleTypes',
        span: 8,
        onChange: 'handleCycleTypeChange',
        rules: [
          { required: true, message: '请选择周期类型', trigger: 'change' }
        ]
      },
      {
        type: 'input-number',
        prop: 'cycleValue',
        label: '周期值',
        placeholder: '请输入周期值',
        required: true,
        min: 1,
        max: 9999,
        controlsPosition: 'right',
        span: 8,
        rules: [
          { required: true, message: '请输入周期值', trigger: 'blur' },
          { type: 'number', min: 1, message: '周期值必须大于等于1', trigger: 'blur' }
        ]
      },
      {
        type: 'dynamic-select',
        prop: 'cycleUnit',
        label: '周期单位',
        placeholder: '请选择单位',
        required: true,
        clearable: true,
        options: 'cycleUnitOptions',
        disabled: '!formData.cycleType',
        span: 8,
        rules: [
          { required: true, message: '请选择周期单位', trigger: 'change' }
        ]
      },
      {
        type: 'input-number',
        prop: 'advanceDays',
        label: '提前生成任务天数',
        placeholder: '请输入提前天数',
        required: false,
        min: 0,
        max: 365,
        controlsPosition: 'right',
        span: 12,
        hint: '仅对"按时间"周期类型生效，默认3天',
        rules: [
          { type: 'number', min: 0, message: '提前天数必须大于等于0', trigger: 'blur' }
        ]
      },
      {
        type: 'input-number',
        prop: 'standardDurationHours',
        label: '标准工时(小时)',
        placeholder: '请输入标准工时',
        required: false,
        min: 0,
        max: 999,
        precision: 2,
        controlsPosition: 'right',
        span: 12,
        rules: [
          { type: 'number', min: 0, message: '标准工时必须大于等于0', trigger: 'blur' }
        ]
      }
    ]
  },

  // 三、维护内容
  {
    section: '维护内容',
    sectionKey: 'content',
    fields: [
      {
        type: 'textarea',
        prop: 'maintenanceItems',
        label: '维护项目',
        placeholder: '请输入维护项目和内容描述',
        required: true,
        rows: 4,
        maxlength: 1000,
        showWordLimit: true,
        span: 24,
        rules: [
          { required: true, message: '请输入维护项目', trigger: 'blur' }
        ]
      },
      {
        type: 'textarea',
        prop: 'requiredSkills',
        label: '所需技能/资质',
        placeholder: '请输入所需技能或资质要求',
        required: false,
        rows: 2,
        maxlength: 500,
        showWordLimit: true,
        span: 24
      },
      {
        type: 'textarea',
        prop: 'safetyNotes',
        label: '安全注意事项',
        placeholder: '请输入安全注意事项',
        required: false,
        rows: 2,
        maxlength: 500,
        showWordLimit: true,
        span: 24
      },
      {
        type: 'input',
        prop: 'instructionAttachmentUrl',
        label: '作业指导书附件',
        placeholder: '请输入附件URL',
        required: false,
        clearable: true,
        maxlength: 500,
        showWordLimit: true,
        span: 24,
        hint: '请输入维护作业指导书的URL地址',
        rules: [
          { type: 'url', message: '请输入正确的URL格式', trigger: 'blur' }
        ]
      }
    ]
  },

  // 四、备件清单（特殊处理，使用表格组件）
  {
    section: '备件清单',
    sectionKey: 'spareParts',
    type: 'spare-parts-table',
    prop: 'requiredSpareParts',
    fields: [
      {
        type: 'input',
        prop: 'sparePartId',
        label: '备件ID',
        placeholder: '请输入备件ID（UUID格式）',
        required: true,
        rules: [
          { required: true, message: '备件ID不能为空', trigger: 'blur' }
        ]
      },
      {
        type: 'input-number',
        prop: 'quantity',
        label: '数量',
        required: true,
        min: 1,
        max: 9999,
        controlsPosition: 'right',
        rules: [
          { required: true, message: '数量不能为空', trigger: 'blur' },
          { type: 'number', min: 1, message: '数量必须大于等于1', trigger: 'blur' }
        ]
      }
    ]
  },

  // 五、计划状态（仅创建模式显示）
  {
    section: '计划状态',
    sectionKey: 'status',
    visibleWhen: 'create',
    fields: [
      {
        type: 'dict-radio-group',
        prop: 'status',
        label: '计划状态',
        required: false,
        dictModule: 'tpm',
        dictKey: 'planStatuses',
        span: 24,
        hint: '启用后将自动按周期生成维护任务'
      }
    ]
  }
]

// 表单默认值配置
export const FORM_DEFAULT_VALUES = {
  planCode: '',
  planName: '',
  equipmentId: '',
  maintenanceType: '',
  maintenanceItems: '',
  cycleType: '',
  cycleValue: null,
  cycleUnit: '',
  standardDurationHours: null,
  requiredSpareParts: [],
  requiredSkills: '',
  safetyNotes: '',
  instructionAttachmentUrl: '',
  status: '启用',
  advanceDays: 3
}

// 表单模式配置
export const FORM_MODE_CONFIG = {
  create: {
    title: '创建维护计划',
    submitText: '创建',
    excludeSections: [] // 创建模式显示所有部分
  },
  update: {
    title: '编辑维护计划',
    submitText: '保存',
    excludeSections: ['status'] // 编辑模式不显示状态部分
  },
  view: {
    title: '查看维护计划',
    submitText: null, // 查看模式无提交按钮
    excludeSections: []
  }
}

// 字段变更检测配置
export const CHANGE_DETECTION_CONFIG = {
  // 需要检测变更的字段
  trackedFields: [
    'planCode', 'planName', 'equipmentId', 'maintenanceType',
    'maintenanceItems', 'cycleType', 'cycleValue', 'cycleUnit',
    'standardDurationHours', 'requiredSkills', 'safetyNotes',
    'instructionAttachmentUrl', 'advanceDays', 'requiredSpareParts'
  ],

  // 周期相关字段（变更时需要特殊提示）
  cycleFields: ['cycleType', 'cycleValue', 'cycleUnit'],

  // 需要特殊处理的字段（如数组对比）
  specialFields: {
    requiredSpareParts: {
      type: 'array',
      compareKeys: ['sparePartId', 'quantity']
    }
  }
}

// 表单验证规则配置（用于 el-form 的 rules 属性）
export const FORM_RULES = {
  planCode: [
    { max: 100, message: '计划编码最大长度为100个字符', trigger: 'blur' }
  ],
  planName: [
    { required: true, message: '请输入计划名称', trigger: 'blur' },
    { min: 1, max: 200, message: '长度在 1 到 200 个字符', trigger: 'blur' }
  ],
  equipmentId: [
    { required: true, message: '请选择关联设备', trigger: 'change' }
  ],
  maintenanceType: [
    { required: true, message: '请选择维护类型', trigger: 'change' }
  ],
  maintenanceItems: [
    { required: true, message: '请输入维护项目', trigger: 'blur' }
  ],
  cycleType: [
    { required: true, message: '请选择周期类型', trigger: 'change' }
  ],
  cycleValue: [
    { required: true, message: '请输入周期值', trigger: 'blur' },
    { type: 'number', min: 1, message: '周期值必须大于等于1', trigger: 'blur' }
  ],
  cycleUnit: [
    { required: true, message: '请选择周期单位', trigger: 'change' }
  ],
  standardDurationHours: [
    { type: 'number', min: 0, message: '标准工时必须大于等于0', trigger: 'blur' }
  ],
  advanceDays: [
    { type: 'number', min: 0, message: '提前天数必须大于等于0', trigger: 'blur' }
  ],
  instructionAttachmentUrl: [
    { type: 'url', message: '请输入正确的URL格式', trigger: 'blur' }
  ]
}

// 表单验证配置
export const FORM_VALIDATION_CONFIG = {
  // 自定义验证规则
  customRules: {
    sparePartsValidation: (rule, value, callback) => {
      if (value && value.length > 0) {
        const hasEmpty = value.some(item => !item.sparePartId || !item.quantity)
        if (hasEmpty) {
          callback(new Error('请完善备件清单信息'))
        } else {
          callback()
        }
      } else {
        callback()
      }
    }
  },

  // 条件验证规则
  conditionalRules: {
    cycleUnit: {
      condition: 'formData.cycleType',
      message: '请先选择周期类型'
    }
  }
}

// 表单提示信息配置
export const FORM_HINTS_CONFIG = {
  planCode: '不填写时系统将根据设备编码自动生成',
  advanceDays: '仅对"按时间"周期类型生效，默认3天',
  instructionAttachmentUrl: '请输入维护作业指导书的URL地址',
  status: '启用后将自动按周期生成维护任务',
  cycleTypeChange: '修改维护周期参数可能会影响未来任务的生成时间和频率'
}

// 导出所有配置
export {
  SEARCH_FORM_CONFIG as searchFormConfig,
  MAINTENANCE_PLAN_FORM_FIELDS as formFields,
  FORM_DEFAULT_VALUES as defaultValues,
  FORM_MODE_CONFIG as modeConfig,
  CHANGE_DETECTION_CONFIG as changeDetectionConfig,
  FORM_RULES as formRules,
  FORM_VALIDATION_CONFIG as validationConfig,
  FORM_HINTS_CONFIG as hintsConfig
}
