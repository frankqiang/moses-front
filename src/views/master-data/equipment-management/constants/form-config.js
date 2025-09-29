/**
 * 文件名称：form-config.js
 * 文件描述：设备主数据管理模块的搜索、表单配置及校验规则
 * 创建日期：2025-09-28
 * 修改记录：
 *   - 2025-09-28: 初始创建，完成搜索与表单配置定义
 */

import {
  EQUIPMENT_TYPES,
  EQUIPMENT_TYPE_OPTIONS,
  EQUIPMENT_STATUS_OPTIONS,
  EQUIPMENT_FIELD_UNITS,
  EQUIPMENT_FIELD_LIMITS,
  EQUIPMENT_DETAIL_FIELDS
} from './equipment-management'

// 搜索表单配置 - 面向 SearchForm 组件
export const SEARCH_FORM_CONFIG = [
  {
    type: 'input',
    prop: 'equipmentCode',
    label: '设备编号',
    placeholder: '支持模糊查询，自动去除空格',
    clearable: true,
    priority: 'primary'
  },
  {
    type: 'input',
    prop: 'name',
    label: '设备名称',
    placeholder: '请输入设备名称关键字',
    clearable: true,
    priority: 'primary'
  },
  {
    type: 'select',
    prop: 'equipmentType',
    label: '设备类型',
    placeholder: '请选择设备类型',
    options: EQUIPMENT_TYPE_OPTIONS,
    clearable: true,
    priority: 'primary'
  },
  {
    type: 'select',
    prop: 'status',
    label: '设备状态',
    placeholder: '请选择设备状态',
    options: EQUIPMENT_STATUS_OPTIONS,
    clearable: true,
    priority: 'primary'
  },
  {
    type: 'input',
    prop: 'communicationEndpoint',
    label: '通讯端点',
    placeholder: '支持IP/URL模糊搜索',
    clearable: true,
    priority: 'advanced'
  },
  {
    type: 'daterange',
    prop: 'installationDateRange',
    label: '安装日期',
    startProp: 'installationDateFrom',
    endProp: 'installationDateTo',
    valueFormat: 'yyyy-MM-dd',
    format: 'yyyy-MM-dd',
    clearable: true,
    priority: 'advanced'
  },
  {
    type: 'daterange',
    prop: 'nextMaintenanceDateRange',
    label: '下次维护',
    startProp: 'nextMaintenanceDateFrom',
    endProp: 'nextMaintenanceDateTo',
    valueFormat: 'yyyy-MM-dd',
    format: 'yyyy-MM-dd',
    clearable: true,
    priority: 'advanced'
  },
  {
    type: 'switch',
    prop: 'includeDetails',
    label: '包含详情',
    activeValue: true,
    inactiveValue: false,
    tooltip: '关闭后可减少详情字段以提升列表性能',
    priority: 'advanced'
  },
  {
    type: 'input',
    prop: 'search',
    label: '全文检索',
    placeholder: '支持编号/名称/型号/备注模糊查询',
    clearable: true,
    priority: 'advanced'
  }
]

// 表单基础字段配置 - 适用于 EnhancedForm
export const FORM_FIELDS = [
  {
    type: 'input',
    prop: 'equipmentCode',
    label: '设备编号',
    placeholder: '请输入设备编号，如 AF-001',
    required: true,
    clearable: true,
    formatter: (value) => value?.toUpperCase().trim(),
    rules: [
      { required: true, message: '请填写设备编号', trigger: 'blur' },
      { min: 1, max: 100, message: '长度需在1-100字符内', trigger: 'blur' }
    ]
  },
  {
    type: 'input',
    prop: 'name',
    label: '设备名称',
    placeholder: '请输入设备名称',
    required: true,
    clearable: true,
    rules: [
      { required: true, message: '请填写设备名称', trigger: 'blur' },
      { min: 1, max: 200, message: '长度需在1-200字符内', trigger: 'blur' }
    ]
  },
  {
    type: 'select',
    prop: 'equipmentType',
    label: '设备类型',
    placeholder: '请选择设备类型',
    options: EQUIPMENT_TYPE_OPTIONS,
    required: true,
    disabledOnEdit: true,
    rules: [{ required: true, message: '请选择设备类型', trigger: 'change' }]
  },
  {
    type: 'select',
    prop: 'status',
    label: '设备状态',
    placeholder: '请选择设备状态',
    options: EQUIPMENT_STATUS_OPTIONS,
    required: true,
    rules: [{ required: true, message: '请选择设备状态', trigger: 'change' }]
  },
  {
    type: 'input',
    prop: 'model',
    label: '设备型号',
    placeholder: '请输入设备型号',
    clearable: true,
    rules: [{ max: 150, message: '长度不能超过150字符', trigger: 'blur' }]
  },
  {
    type: 'input',
    prop: 'manufacturer',
    label: '制造商',
    placeholder: '请输入制造商名称',
    clearable: true,
    rules: [{ max: 150, message: '长度不能超过150字符', trigger: 'blur' }]
  },
  {
    type: 'textarea',
    prop: 'locationDescription',
    label: '位置描述',
    placeholder: '请输入设备所在位置或坐标',
    rows: 2,
    clearable: true,
    rules: [{ max: 255, message: '长度不能超过255字符', trigger: 'blur' }]
  },
  {
    type: 'date',
    prop: 'installationDate',
    label: '安装日期',
    placeholder: '请选择安装日期',
    valueFormat: 'yyyy-MM-dd',
    format: 'yyyy-MM-dd',
    clearable: true
  },
  {
    type: 'input-number',
    prop: 'maintenanceCycleDays',
    label: `维护周期 (${EQUIPMENT_FIELD_UNITS.maintenanceCycleDays})`,
    placeholder: '请输入维护周期天数',
    min: EQUIPMENT_FIELD_LIMITS.maintenanceCycleDays.min,
    max: EQUIPMENT_FIELD_LIMITS.maintenanceCycleDays.max,
    step: 1,
    clearable: true,
    rules: [
      {
        validator: (_, value, callback) => {
          if (value === undefined || value === null || value === '') {
            callback()
            return
          }
          if (value < EQUIPMENT_FIELD_LIMITS.maintenanceCycleDays.min || value > EQUIPMENT_FIELD_LIMITS.maintenanceCycleDays.max) {
            callback(new Error('维护周期需在1-3650天内'))
            return
          }
          callback()
        },
        trigger: 'change'
      }
    ]
  },
  {
    type: 'date',
    prop: 'lastMaintenanceDate',
    label: '上次维护日期',
    valueFormat: 'yyyy-MM-dd',
    format: 'yyyy-MM-dd',
    clearable: true
  },
  {
    type: 'date',
    prop: 'nextMaintenanceDate',
    label: '下次维护日期',
    valueFormat: 'yyyy-MM-dd',
    format: 'yyyy-MM-dd',
    clearable: true
  },
  {
    type: 'input',
    prop: 'communicationEndpoint',
    label: '通讯端点',
    placeholder: '如 opc.tcp://192.168.1.100:4840',
    required: true,
    clearable: true,
    rules: [
      { required: true, message: '请填写通讯端点', trigger: 'blur' },
      { max: 255, message: '长度不能超过255字符', trigger: 'blur' }
    ]
  },
  {
    type: 'key-value-editor',
    prop: 'communicationParams',
    label: '通讯参数',
    required: true,
    tooltip: '敏感字段会自动脱敏，请勿填写真实密码用于演示',
    rules: [{ required: true, message: '请完善通讯参数', trigger: 'change' }]
  },
  {
    type: 'input',
    prop: 'plcNodeId',
    label: 'PLC 节点 ID',
    placeholder: '退火炉必填，如 ns=2;i=1001',
    clearable: true,
    rules: [{ max: 150, message: '长度不能超过150字符', trigger: 'blur' }]
  },
  {
    type: 'input',
    prop: 'controlSystemAddress',
    label: '控制系统地址',
    placeholder: '如 http://192.168.1.101/api',
    clearable: true,
    rules: [{ max: 255, message: '长度不能超过255字符', trigger: 'blur' }]
  },
  {
    type: 'textarea',
    prop: 'remark',
    label: '备注',
    placeholder: '请输入备注信息，最多1000字符',
    rows: 3,
    clearable: true,
    rules: [{ max: 1000, message: '长度不能超过1000字符', trigger: 'blur' }]
  }
]

// 根据设备类型追加的详情字段配置
export const DETAIL_FORM_FIELDS = {
  [EQUIPMENT_TYPES.ANNEALING_FURNACE]: [
    {
      type: 'input-number',
      prop: 'detail.ratedCapacityTon',
      label: `额定容量 (${EQUIPMENT_FIELD_UNITS.ratedCapacityTon})`,
      required: true,
      min: EQUIPMENT_FIELD_LIMITS.ratedCapacityTon.min,
      max: EQUIPMENT_FIELD_LIMITS.ratedCapacityTon.max,
      precision: EQUIPMENT_FIELD_LIMITS.ratedCapacityTon.precision,
      rules: [{ required: true, message: '请填写额定容量', trigger: 'change' }]
    },
    {
      type: 'input-number',
      prop: 'detail.maxOperatingTemperatureC',
      label: `最大工作温度 (${EQUIPMENT_FIELD_UNITS.maxOperatingTemperatureC})`,
      required: true,
      min: EQUIPMENT_FIELD_LIMITS.maxOperatingTemperatureC.min,
      max: EQUIPMENT_FIELD_LIMITS.maxOperatingTemperatureC.max,
      precision: EQUIPMENT_FIELD_LIMITS.maxOperatingTemperatureC.precision,
      rules: [{ required: true, message: '请填写最大工作温度', trigger: 'change' }]
    },
    {
      type: 'input-number',
      prop: 'detail.ratedPowerKw',
      label: `额定功率 (${EQUIPMENT_FIELD_UNITS.ratedPowerKw})`,
      required: true,
      min: EQUIPMENT_FIELD_LIMITS.ratedPowerKw.min,
      max: EQUIPMENT_FIELD_LIMITS.ratedPowerKw.max,
      precision: EQUIPMENT_FIELD_LIMITS.ratedPowerKw.precision,
      rules: [{ required: true, message: '请填写额定功率', trigger: 'change' }]
    },
    {
      type: 'input',
      prop: 'detail.plcNodeId',
      label: 'PLC 节点 ID',
      required: true,
      placeholder: '退火炉详情必填，与主字段保持一致',
      rules: [{ required: true, message: '请填写PLC节点ID', trigger: 'blur' }]
    },
    {
      type: 'input-number',
      prop: 'detail.chamberLengthCm',
      label: `炉膛长度 (${EQUIPMENT_FIELD_UNITS.chamberLengthCm})`,
      min: EQUIPMENT_FIELD_LIMITS.chamberLengthCm.min,
      max: EQUIPMENT_FIELD_LIMITS.chamberLengthCm.max,
      precision: EQUIPMENT_FIELD_LIMITS.chamberLengthCm.precision,
      clearable: true
    },
    {
      type: 'input-number',
      prop: 'detail.chamberWidthCm',
      label: `炉膛宽度 (${EQUIPMENT_FIELD_UNITS.chamberWidthCm})`,
      min: EQUIPMENT_FIELD_LIMITS.chamberWidthCm.min,
      max: EQUIPMENT_FIELD_LIMITS.chamberWidthCm.max,
      precision: EQUIPMENT_FIELD_LIMITS.chamberWidthCm.precision,
      clearable: true
    },
    {
      type: 'input-number',
      prop: 'detail.chamberHeightCm',
      label: `炉膛高度 (${EQUIPMENT_FIELD_UNITS.chamberHeightCm})`,
      min: EQUIPMENT_FIELD_LIMITS.chamberHeightCm.min,
      max: EQUIPMENT_FIELD_LIMITS.chamberHeightCm.max,
      precision: EQUIPMENT_FIELD_LIMITS.chamberHeightCm.precision,
      clearable: true
    },
    {
      type: 'input',
      prop: 'detail.supportGasType',
      label: '保护气氛类型',
      clearable: true,
      rules: [{ max: 100, message: '长度不能超过100字符', trigger: 'blur' }]
    },
    {
      type: 'textarea',
      prop: 'detail.notes',
      label: '备注',
      rows: 3,
      clearable: true
    }
  ],
  [EQUIPMENT_TYPES.CRANE]: [
    {
      type: 'input-number',
      prop: 'detail.ratedLiftCapacityTon',
      label: `额定起重量 (${EQUIPMENT_FIELD_UNITS.ratedLiftCapacityTon})`,
      required: true,
      min: EQUIPMENT_FIELD_LIMITS.ratedLiftCapacityTon.min,
      max: EQUIPMENT_FIELD_LIMITS.ratedLiftCapacityTon.max,
      precision: EQUIPMENT_FIELD_LIMITS.ratedLiftCapacityTon.precision,
      rules: [{ required: true, message: '请填写额定起重量', trigger: 'change' }]
    },
    {
      type: 'input-number',
      prop: 'detail.maxSpeedMps',
      label: `最大速度 (${EQUIPMENT_FIELD_UNITS.maxSpeedMps})`,
      required: true,
      min: EQUIPMENT_FIELD_LIMITS.maxSpeedMps.min,
      max: EQUIPMENT_FIELD_LIMITS.maxSpeedMps.max,
      precision: EQUIPMENT_FIELD_LIMITS.maxSpeedMps.precision,
      rules: [{ required: true, message: '请填写最大速度', trigger: 'change' }]
    },
    {
      type: 'key-value-editor',
      prop: 'detail.controlInterfaceParams',
      label: '控制接口参数',
      required: true,
      tooltip: '请填写与控制系统对接所需的参数，如协议、端口等',
      rules: [{ required: true, message: '请完善控制接口参数', trigger: 'change' }]
    },
    {
      type: 'input-number',
      prop: 'detail.minSpeedMps',
      label: `最小速度 (${EQUIPMENT_FIELD_UNITS.minSpeedMps})`,
      min: EQUIPMENT_FIELD_LIMITS.minSpeedMps.min,
      max: EQUIPMENT_FIELD_LIMITS.minSpeedMps.max,
      precision: EQUIPMENT_FIELD_LIMITS.minSpeedMps.precision,
      clearable: true
    },
    {
      type: 'textarea',
      prop: 'detail.serviceAreaDescription',
      label: '服务范围描述',
      rows: 2,
      clearable: true
    },
    {
      type: 'textarea',
      prop: 'detail.notes',
      label: '备注',
      rows: 3,
      clearable: true
    }
  ],
  [EQUIPMENT_TYPES.AUTOMATIC_CART]: [
    {
      type: 'input-number',
      prop: 'detail.loadCapacityTon',
      label: `载重能力 (${EQUIPMENT_FIELD_UNITS.loadCapacityTon})`,
      required: true,
      min: EQUIPMENT_FIELD_LIMITS.loadCapacityTon.min,
      max: EQUIPMENT_FIELD_LIMITS.loadCapacityTon.max,
      precision: EQUIPMENT_FIELD_LIMITS.loadCapacityTon.precision,
      rules: [{ required: true, message: '请填写载重能力', trigger: 'change' }]
    },
    {
      type: 'input-number',
      prop: 'detail.maxSpeedMps',
      label: `最大速度 (${EQUIPMENT_FIELD_UNITS.maxSpeedMps})`,
      required: true,
      min: EQUIPMENT_FIELD_LIMITS.maxSpeedMps.min,
      max: EQUIPMENT_FIELD_LIMITS.maxSpeedMps.max,
      precision: EQUIPMENT_FIELD_LIMITS.maxSpeedMps.precision,
      rules: [{ required: true, message: '请填写最大速度', trigger: 'change' }]
    },
    {
      type: 'select',
      prop: 'detail.navigationType',
      label: '导航方式',
      required: true,
      options: [
        { label: '激光导航', value: 'laser' },
        { label: '磁导导航', value: 'magnetic' },
        { label: '视觉导航', value: 'vision' },
        { label: '惯性导航', value: 'inertial' }
      ],
      rules: [{ required: true, message: '请选择导航方式', trigger: 'change' }]
    },
    {
      type: 'input-number',
      prop: 'detail.batteryCapacityKwh',
      label: `电池容量 (${EQUIPMENT_FIELD_UNITS.batteryCapacityKwh})`,
      required: true,
      min: EQUIPMENT_FIELD_LIMITS.batteryCapacityKwh.min,
      max: EQUIPMENT_FIELD_LIMITS.batteryCapacityKwh.max,
      precision: EQUIPMENT_FIELD_LIMITS.batteryCapacityKwh.precision,
      rules: [{ required: true, message: '请填写电池容量', trigger: 'change' }]
    },
    {
      type: 'input-number',
      prop: 'detail.lowBatteryThresholdPercent',
      label: `低电量阈值 (${EQUIPMENT_FIELD_UNITS.lowBatteryThresholdPercent})`,
      required: true,
      min: EQUIPMENT_FIELD_LIMITS.lowBatteryThresholdPercent.min,
      max: EQUIPMENT_FIELD_LIMITS.lowBatteryThresholdPercent.max,
      precision: EQUIPMENT_FIELD_LIMITS.lowBatteryThresholdPercent.precision,
      rules: [{ required: true, message: '请填写低电量阈值', trigger: 'change' }]
    },
    {
      type: 'key-value-editor',
      prop: 'detail.controlInterfaceParams',
      label: '控制接口参数',
      required: true,
      tooltip: '请填写自动料车控制系统的接口参数',
      rules: [{ required: true, message: '请完善控制接口参数', trigger: 'change' }]
    },
    {
      type: 'input-number',
      prop: 'detail.minSpeedMps',
      label: `最小速度 (${EQUIPMENT_FIELD_UNITS.minSpeedMps})`,
      min: EQUIPMENT_FIELD_LIMITS.minSpeedMps.min,
      max: EQUIPMENT_FIELD_LIMITS.minSpeedMps.max,
      precision: EQUIPMENT_FIELD_LIMITS.minSpeedMps.precision,
      clearable: true
    },
    {
      type: 'textarea',
      prop: 'detail.chargingStrategy',
      label: '充电策略',
      rows: 2,
      clearable: true
    },
    {
      type: 'textarea',
      prop: 'detail.notes',
      label: '备注',
      rows: 3,
      clearable: true
    }
  ],
  [EQUIPMENT_TYPES.PREPARATION_STATION]: [
    {
      type: 'input-number',
      prop: 'detail.maxLoadCapacityTon',
      label: `最大承重 (${EQUIPMENT_FIELD_UNITS.maxLoadCapacityTon})`,
      required: true,
      min: EQUIPMENT_FIELD_LIMITS.maxLoadCapacityTon.min,
      max: EQUIPMENT_FIELD_LIMITS.maxLoadCapacityTon.max,
      precision: EQUIPMENT_FIELD_LIMITS.maxLoadCapacityTon.precision,
      rules: [{ required: true, message: '请填写最大承重', trigger: 'change' }]
    },
    {
      type: 'input-number',
      prop: 'detail.maxBinCount',
      label: '最大料框数',
      required: true,
      min: 1,
      max: 100,
      precision: 0,
      rules: [{ required: true, message: '请填写最大料框数', trigger: 'change' }]
    },
    {
      type: 'textarea',
      prop: 'detail.positionDescription',
      label: '位置描述',
      rows: 2,
      clearable: true
    },
    {
      type: 'input',
      prop: 'detail.associatedAnnealingFurnaceCode',
      label: '关联退火炉编号',
      placeholder: '如需绑定退火炉，请输入其编号',
      formatter: (value) => value?.toUpperCase().trim(),
      clearable: true
    },
    {
      type: 'textarea',
      prop: 'detail.notes',
      label: '备注',
      rows: 3,
      clearable: true
    }
  ]
}

// 详情字段拓展定义 - 便于父组件动态渲染（P1-#6）
export const EQUIPMENT_DETAIL_FIELD_CONFIG = EQUIPMENT_DETAIL_FIELDS

