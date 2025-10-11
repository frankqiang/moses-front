/**
 * 文件名称: form-config.js
 * 文件描述: 库区表单配置
 * 创建日期: 2025-01-20
 * 修改记录:
 *   - 2025-01-20: 初始创建
 */

import {
  AREA_TYPE_OPTIONS,
  AREA_STATUS_OPTIONS,
  AREA_FORM_RULES
} from './storage-area'

// 创建库区表单默认值
export const CREATE_STORAGE_AREA_FORM = {
  areaCode: '',
  areaName: '',
  areaType: '',
  description: ''
}

// 编辑库区表单默认值
export const EDIT_STORAGE_AREA_FORM = {
  areaName: '',
  description: '',
  status: 'enabled'
}

// 库区表单配置
export const STORAGE_AREA_FORM_CONFIG = {
  areaType: {
    label: '库区类型',
    type: 'select',
    prop: 'areaType',
    options: AREA_TYPE_OPTIONS,
    placeholder: '请选择库区类型',
    rules: AREA_FORM_RULES.areaType
  },
  status: {
    label: '库区状态',
    type: 'select',
    prop: 'status',
    options: AREA_STATUS_OPTIONS,
    placeholder: '请选择库区状态',
    rules: AREA_FORM_RULES.status
  }
}

