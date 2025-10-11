/**
 * 文件名称: storage-area.js
 * 文件描述: 库区管理基础常量配置
 * 创建日期: 2025-01-20
 * 修改记录:
 *   - 2025-01-20: 初始创建
 */

// 库区类型选项
export const AREA_TYPE_OPTIONS = [
  { label: '待退火区', value: 'DA' },
  { label: '已退火区', value: 'YA' },
  { label: '缓存区', value: 'HC' },
  { label: '质检区', value: 'ZJ' },
  { label: '备料台区域', value: 'BLT' }
]

// 库区类型映射
export const AREA_TYPE_MAP = {
  DA: '待退火区',
  YA: '已退火区',
  HC: '缓存区',
  ZJ: '质检区',
  BLT: '备料台区域'
}

// 库区状态选项
export const AREA_STATUS_OPTIONS = [
  { label: '启用', value: 'enabled' },
  { label: '禁用', value: 'disabled' }
]

// 库区状态映射
export const AREA_STATUS_MAP = {
  enabled: '启用',
  disabled: '禁用'
}

// 库区状态标签类型映射
export const AREA_STATUS_TAG_TYPE_MAP = {
  enabled: 'success',
  disabled: 'info'
}

// 表单验证规则
export const AREA_FORM_RULES = {
  areaCode: [
    { required: true, message: '请输入库区代码', trigger: 'blur' },
    { min: 1, max: 50, message: '库区代码长度为1-50个字符', trigger: 'blur' },
    { pattern: /^[A-Z0-9-]+$/, message: '库区代码只能包含大写字母、数字和中划线', trigger: 'blur' }
  ],
  areaName: [
    { required: true, message: '请输入库区名称', trigger: 'blur' },
    { min: 1, max: 200, message: '库区名称长度为1-200个字符', trigger: 'blur' }
  ],
  areaType: [
    { required: true, message: '请选择库区类型', trigger: 'change' }
  ],
  description: [
    { max: 500, message: '描述最多500个字符', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择库区状态', trigger: 'change' }
  ]
}

