/**
 * 文件名称: form-config.js
 * 文件描述: 库位表单配置
 * 创建日期: 2025-01-20
 * 修改记录:
 *   - 2025-01-20: 初始创建
 */

import { LOCATION_TYPE_OPTIONS } from './storage-location'

// 库位ID格式正则
const LOCATION_ID_PATTERN = /^[A-Z0-9-]+$/

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
  locationId: {
    label: '库位ID',
    required: true,
    rules: [
      { required: true, message: '请输入库位ID', trigger: 'blur' },
      { min: 1, max: 100, message: '库位ID长度为1-100字符', trigger: 'blur' },
      { validator: validateLocationId, trigger: 'blur' }
    ]
  },
  storageAreaId: {
    label: '所属库区',
    required: true,
    rules: [
      { required: true, message: '请选择所属库区', trigger: 'change' }
    ]
  },
  locationType: {
    label: '库位类型',
    required: true,
    options: LOCATION_TYPE_OPTIONS,
    rules: [
      { required: true, message: '请选择库位类型', trigger: 'change' }
    ]
  },
  loadCapacity: {
    label: '承重限制(kg)',
    required: true,
    rules: [
      { required: true, message: '请输入承重限制', trigger: 'blur' },
      { type: 'number', min: 0.01, max: 100000, message: '承重限制范围为0.01-100000kg', trigger: 'blur' }
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

