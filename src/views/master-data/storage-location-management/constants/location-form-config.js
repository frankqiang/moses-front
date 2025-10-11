/**
 * 文件名称: location-form-config.js
 * 文件描述: 库位表单配置
 * 创建日期: 2025-01-20
 * 修改记录:
 *   - 2025-01-20: 初始创建
 */

import {
  LOCATION_TYPE_OPTIONS,
  COORDINATE_LIMITS,
  SIZE_LIMITS,
  LOAD_CAPACITY_LIMITS,
  STACK_HEIGHT_LIMITS,
  LOCATION_ID_PATTERN
} from './storage-location'

// 验证库位ID格式
const validateLocationId = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入库位ID'))
  } else if (!LOCATION_ID_PATTERN.test(value)) {
    callback(new Error('库位ID只能包含大写字母、数字和中划线'))
  } else {
    callback()
  }
}

// 库位表单字段配置
export const LOCATION_FORM_FIELDS = {
  // 基本信息
  locationId: {
    label: '库位ID',
    placeholder: '请输入库位ID(自动转大写)',
    type: 'text',
    required: true,
    maxLength: 100,
    rules: [
      { required: true, message: '请输入库位ID', trigger: 'blur' },
      { min: 1, max: 100, message: '库位ID长度为1-100字符', trigger: 'blur' },
      { validator: validateLocationId, trigger: 'blur' }
    ]
  },
  storageAreaId: {
    label: '所属库区',
    placeholder: '请选择所属库区',
    type: 'select',
    required: true,
    rules: [
      { required: true, message: '请选择所属库区', trigger: 'change' }
    ]
  },
  locationType: {
    label: '库位类型',
    placeholder: '请选择库位类型',
    type: 'select',
    required: true,
    options: LOCATION_TYPE_OPTIONS,
    rules: [
      { required: true, message: '请选择库位类型', trigger: 'change' }
    ]
  },
  loadCapacity: {
    label: '承重限制(kg)',
    placeholder: `请输入承重限制(${LOAD_CAPACITY_LIMITS.min}-${LOAD_CAPACITY_LIMITS.max})`,
    type: 'number',
    required: true,
    min: LOAD_CAPACITY_LIMITS.min,
    max: LOAD_CAPACITY_LIMITS.max,
    precision: 2,
    rules: [
      { required: true, message: '请输入承重限制', trigger: 'blur' },
      { type: 'number', min: LOAD_CAPACITY_LIMITS.min, max: LOAD_CAPACITY_LIMITS.max, message: `承重限制范围为${LOAD_CAPACITY_LIMITS.min}-${LOAD_CAPACITY_LIMITS.max}kg`, trigger: 'blur' }
    ]
  },
  // 空间坐标
  coordinateX: {
    label: 'X坐标(cm)',
    placeholder: `请输入X坐标(${COORDINATE_LIMITS.X.min}~${COORDINATE_LIMITS.X.max})`,
    type: 'number',
    required: false,
    min: COORDINATE_LIMITS.X.min,
    max: COORDINATE_LIMITS.X.max,
    precision: 2,
    rules: [
      { type: 'number', min: COORDINATE_LIMITS.X.min, max: COORDINATE_LIMITS.X.max, message: `X坐标范围为${COORDINATE_LIMITS.X.min}~${COORDINATE_LIMITS.X.max}cm`, trigger: 'blur' }
    ]
  },
  coordinateY: {
    label: 'Y坐标(cm)',
    placeholder: `请输入Y坐标(${COORDINATE_LIMITS.Y.min}~${COORDINATE_LIMITS.Y.max})`,
    type: 'number',
    required: false,
    min: COORDINATE_LIMITS.Y.min,
    max: COORDINATE_LIMITS.Y.max,
    precision: 2,
    rules: [
      { type: 'number', min: COORDINATE_LIMITS.Y.min, max: COORDINATE_LIMITS.Y.max, message: `Y坐标范围为${COORDINATE_LIMITS.Y.min}~${COORDINATE_LIMITS.Y.max}cm`, trigger: 'blur' }
    ]
  },
  coordinateZ: {
    label: 'Z坐标(cm)',
    placeholder: `请输入Z坐标(${COORDINATE_LIMITS.Z.min}~${COORDINATE_LIMITS.Z.max})`,
    type: 'number',
    required: false,
    min: COORDINATE_LIMITS.Z.min,
    max: COORDINATE_LIMITS.Z.max,
    precision: 2,
    rules: [
      { type: 'number', min: COORDINATE_LIMITS.Z.min, max: COORDINATE_LIMITS.Z.max, message: `Z坐标范围为${COORDINATE_LIMITS.Z.min}~${COORDINATE_LIMITS.Z.max}cm`, trigger: 'blur' }
    ]
  },
  // 尺寸限制
  lengthLimit: {
    label: '长度限制(cm)',
    placeholder: `请输入长度限制(${SIZE_LIMITS.LENGTH.min}-${SIZE_LIMITS.LENGTH.max})`,
    type: 'number',
    required: false,
    min: SIZE_LIMITS.LENGTH.min,
    max: SIZE_LIMITS.LENGTH.max,
    precision: 2,
    rules: [
      { type: 'number', min: SIZE_LIMITS.LENGTH.min, max: SIZE_LIMITS.LENGTH.max, message: `长度限制范围为${SIZE_LIMITS.LENGTH.min}-${SIZE_LIMITS.LENGTH.max}cm`, trigger: 'blur' }
    ]
  },
  widthLimit: {
    label: '宽度限制(cm)',
    placeholder: `请输入宽度限制(${SIZE_LIMITS.WIDTH.min}-${SIZE_LIMITS.WIDTH.max})`,
    type: 'number',
    required: false,
    min: SIZE_LIMITS.WIDTH.min,
    max: SIZE_LIMITS.WIDTH.max,
    precision: 2,
    rules: [
      { type: 'number', min: SIZE_LIMITS.WIDTH.min, max: SIZE_LIMITS.WIDTH.max, message: `宽度限制范围为${SIZE_LIMITS.WIDTH.min}-${SIZE_LIMITS.WIDTH.max}cm`, trigger: 'blur' }
    ]
  },
  heightLimit: {
    label: '高度限制(cm)',
    placeholder: `请输入高度限制(${SIZE_LIMITS.HEIGHT.min}-${SIZE_LIMITS.HEIGHT.max})`,
    type: 'number',
    required: false,
    min: SIZE_LIMITS.HEIGHT.min,
    max: SIZE_LIMITS.HEIGHT.max,
    precision: 2,
    rules: [
      { type: 'number', min: SIZE_LIMITS.HEIGHT.min, max: SIZE_LIMITS.HEIGHT.max, message: `高度限制范围为${SIZE_LIMITS.HEIGHT.min}-${SIZE_LIMITS.HEIGHT.max}cm`, trigger: 'blur' }
    ]
  },
  // 其他参数
  applicableBinSpecCodes: {
    label: '适用料框规格',
    placeholder: '请输入料框规格代码，按回车添加',
    type: 'tags',
    required: false,
    maxTags: 100
  },
  maxStackHeight: {
    label: '最大堆叠高度(层)',
    placeholder: `请输入最大堆叠高度(${STACK_HEIGHT_LIMITS.min}-${STACK_HEIGHT_LIMITS.max})`,
    type: 'number',
    required: false,
    min: STACK_HEIGHT_LIMITS.min,
    max: STACK_HEIGHT_LIMITS.max,
    rules: [
      { type: 'number', min: STACK_HEIGHT_LIMITS.min, max: STACK_HEIGHT_LIMITS.max, message: `堆叠高度范围为${STACK_HEIGHT_LIMITS.min}-${STACK_HEIGHT_LIMITS.max}层`, trigger: 'blur' }
    ]
  }
}

// 创建时的表单初始值
export const CREATE_FORM_DEFAULT = {
  locationId: '',
  storageAreaId: '',
  locationType: '',
  coordinateX: null,
  coordinateY: null,
  coordinateZ: null,
  lengthLimit: null,
  widthLimit: null,
  heightLimit: null,
  loadCapacity: null,
  applicableBinSpecCodes: [],
  maxStackHeight: null
}

// 编辑时不可编辑的字段
export const EDIT_DISABLED_FIELDS = ['locationId', 'storageAreaId', 'locationType']

