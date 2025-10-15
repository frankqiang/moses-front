/**
 * 文件名称：validation-rules.js
 * 文件描述：工艺参数管理模块统一校验规则配置（与后端Joi验证规则保持一致）
 * 创建日期：2025-10-15
 * 修改记录：
 *   - 2025-10-15: 初始创建，实现TASK11 P0阶段校验规则
 */

import { CIRCULATION_FAN_SPEED } from './process-parameter-management'

// ==================== 通用校验规则 ====================

/**
 * 模板编码格式校验
 * 规则：仅包含大写字母、数字、横线
 */
export const validateTemplateCode = (rule, value, callback) => {
  if (!value) {
    return callback(new Error('请输入模板编码'))
  }
  const pattern = /^[A-Z0-9-]+$/
  if (!pattern.test(value)) {
    return callback(new Error('模板编码仅允许包含大写字母、数字、横线'))
  }
  if (value.length < 3 || value.length > 100) {
    return callback(new Error('模板编码长度应为3-100个字符'))
  }
  callback()
}

/**
 * 版本号格式校验
 * 规则：v1.0 或 1.0 格式
 */
export const validateVersionNumber = (rule, value, callback) => {
  if (!value) {
    return callback(new Error('请输入版本号'))
  }
  const pattern = /^v?\d+\.\d+$/
  if (!pattern.test(value)) {
    return callback(new Error('版本号格式应为 v1.0 或 1.0'))
  }
  callback()
}

/**
 * 温度范围格式校验
 * 规则：0.005-0.1 格式，最小值必须小于最大值
 */
export const validateRangeFormat = (rule, value, callback) => {
  if (!value) {
    return callback()
  }
  const pattern = /^(\d+\.?\d*)-(\d+\.?\d*)$/
  if (!pattern.test(value)) {
    return callback(new Error('范围格式应为 最小值-最大值，如：0.005-0.1'))
  }
  const [min, max] = value.split('-').map(Number)
  if (min >= max) {
    return callback(new Error('最小值必须小于最大值'))
  }
  callback()
}

/**
 * 合金牌号格式校验
 * 规则：逗号分隔的数字或字母组合
 */
export const validateAlloyGrades = (rule, value, callback) => {
  if (!value) {
    return callback()
  }
  if (value.length > 500) {
    return callback(new Error('合金牌号总长度不能超过500个字符'))
  }
  const grades = value.split(',').map(g => g.trim()).filter(g => g)
  const pattern = /^[A-Za-z0-9]+$/
  const invalidGrades = grades.filter(g => !pattern.test(g))
  if (invalidGrades.length > 0) {
    return callback(new Error(`合金牌号格式错误：${invalidGrades.join(', ')}`))
  }
  callback()
}

/**
 * 料温不能高于炉温
 */
export const validateMaterialTemperature = (furnaceTemp) => {
  return (rule, value, callback) => {
    if (value === null || value === undefined || value === '') {
      return callback(new Error('请输入料温设置'))
    }
    const materialTemp = Number(value)
    const furnTemp = Number(furnaceTemp)
    if (isNaN(materialTemp) || isNaN(furnTemp)) {
      return callback()
    }
    if (materialTemp > furnTemp) {
      return callback(new Error(`料温(${materialTemp}℃)不能高于炉温(${furnTemp}℃)`))
    }
    callback()
  }
}

/**
 * 循环风机速度枚举值校验
 */
export const validateCirculationFanSpeed = (rule, value, callback) => {
  if (!value) {
    return callback(new Error('请选择循环风机速度'))
  }
  const validValues = Object.values(CIRCULATION_FAN_SPEED)
  if (!validValues.includes(value)) {
    return callback(new Error('循环风机速度必须为：低速、中速、高速'))
  }
  callback()
}

// ==================== 工艺模板基本信息校验规则 ====================

/**
 * 工艺模板基本信息表单校验规则
 */
export const TEMPLATE_BASIC_RULES = {
  // 模板编码（必填）
  templateCode: [
    { required: true, message: '请输入模板编码', trigger: 'blur' },
    { validator: validateTemplateCode, trigger: 'blur' }
  ],
  // 模板名称（必填）
  templateName: [
    { required: true, message: '请输入模板名称', trigger: 'blur' },
    { min: 2, max: 200, message: '模板名称长度应为2-200个字符', trigger: 'blur' }
  ],
  // 模板描述（可选）
  description: [
    { max: 2000, message: '模板描述不能超过2000个字符', trigger: 'blur' }
  ],
  // 版本号（必填）
  versionNumber: [
    { required: true, message: '请输入版本号', trigger: 'blur' },
    { validator: validateVersionNumber, trigger: 'blur' }
  ],
  // 版本描述（可选）
  versionDescription: [
    { max: 2000, message: '版本描述不能超过2000个字符', trigger: 'blur' }
  ],
  // 适用产品ID（可选）
  applicableProductIds: [
    { type: 'array', message: '适用产品应为数组格式', trigger: 'change' }
  ],
  // 适用合金牌号（可选）
  applicableAlloyGrades: [
    { validator: validateAlloyGrades, trigger: 'blur' }
  ],
  // 适用厚度范围（可选）
  applicableThicknessRange: [
    { validator: validateRangeFormat, trigger: 'blur' }
  ],
  // 适用宽度范围（可选）
  applicableWidthRange: [
    { validator: validateRangeFormat, trigger: 'blur' }
  ]
}

// ==================== 12段参数校验规则 ====================

/**
 * 段序号校验
 */
export const validateSegmentOrder = (rule, value, callback) => {
  if (value === null || value === undefined) {
    return callback(new Error('请输入段序号'))
  }
  const order = Number(value)
  if (!Number.isInteger(order) || order < 1 || order > 12) {
    return callback(new Error('段序号必须为1-12的整数'))
  }
  callback()
}

/**
 * 炉温校验
 */
export const validateFurnaceTemperature = (rule, value, callback) => {
  if (value === null || value === undefined || value === '') {
    return callback(new Error('请输入炉温设置'))
  }
  const temp = Number(value)
  if (isNaN(temp)) {
    return callback(new Error('炉温必须为数字'))
  }
  if (temp < 0 || temp > 1500) {
    return callback(new Error('炉温范围应为0-1500℃'))
  }
  callback()
}

/**
 * 时间设置校验
 */
export const validateTimeSet = (rule, value, callback) => {
  if (value === null || value === undefined || value === '') {
    return callback(new Error('请输入时间设置'))
  }
  const time = Number(value)
  if (isNaN(time)) {
    return callback(new Error('时间设置必须为数字'))
  }
  if (time < 0 || time > 999) {
    return callback(new Error('时间设置范围应为0-999小时'))
  }
  callback()
}

/**
 * 风机频率校验
 */
export const validateFanFrequency = (rule, value, callback) => {
  if (value === null || value === undefined || value === '') {
    return callback(new Error('请输入风机频率'))
  }
  const freq = Number(value)
  if (isNaN(freq)) {
    return callback(new Error('风机频率必须为数字'))
  }
  if (freq < 0 || freq > 100) {
    return callback(new Error('风机频率范围应为0-100Hz'))
  }
  callback()
}

/**
 * 吹洗时间校验
 */
export const validateCleaningTime = (rule, value, callback) => {
  if (value === null || value === undefined || value === '') {
    return callback(new Error('请输入吹洗时间'))
  }
  const time = Number(value)
  if (isNaN(time)) {
    return callback(new Error('吹洗时间必须为数字'))
  }
  if (time < 0 || time > 999) {
    return callback(new Error('吹洗时间范围应为0-999分钟'))
  }
  callback()
}

/**
 * 单个段参数校验规则
 * 注意：料温校验需要动态传入炉温值
 */
export const getSegmentValidationRules = (furnaceTemperature) => {
  return {
    segmentOrder: [
      { required: true, validator: validateSegmentOrder, trigger: 'blur' }
    ],
    controlMode: [
      { required: true, message: '请选择控温方式', trigger: 'change' }
    ],
    furnaceTemperature: [
      { required: true, validator: validateFurnaceTemperature, trigger: 'blur' }
    ],
    materialTemperature: [
      { required: true, validator: validateMaterialTemperature(furnaceTemperature), trigger: 'blur' }
    ],
    timeSet: [
      { required: true, validator: validateTimeSet, trigger: 'blur' }
    ],
    circulationFanSpeed: [
      { required: true, validator: validateCirculationFanSpeed, trigger: 'change' }
    ],
    negativePressureFan: [
      { required: true, validator: validateFanFrequency, trigger: 'blur' }
    ],
    cleaningFan: [
      { required: true, validator: validateFanFrequency, trigger: 'blur' }
    ],
    cleaningTime: [
      { required: true, validator: validateCleaningTime, trigger: 'blur' }
    ]
  }
}

// ==================== 审批操作校验规则 ====================

/**
 * 审批意见校验规则
 */
export const APPROVAL_RULES = {
  // 提交审批备注（可选）
  approvalComment: [
    { max: 500, message: '审批意见不能超过500个字符', trigger: 'blur' }
  ],
  // 审批驳回原因（必填）
  rejectComment: [
    { required: true, message: '请填写驳回原因', trigger: 'blur' },
    { min: 5, max: 500, message: '驳回原因应为5-500个字符', trigger: 'blur' }
  ],
  // 生效日期（可选）
  effectiveDate: [
    { type: 'date', message: '请选择有效的日期', trigger: 'change' }
  ],
  // 失效日期（可选，但必须晚于生效日期）
  expiryDate: [
    { type: 'date', message: '请选择有效的日期', trigger: 'change' }
  ]
}

/**
 * 失效日期必须晚于生效日期
 */
export const validateExpiryDate = (effectiveDate) => {
  return (rule, value, callback) => {
    if (!value || !effectiveDate) {
      return callback()
    }
    const effective = new Date(effectiveDate)
    const expiry = new Date(value)
    if (expiry <= effective) {
      return callback(new Error('失效日期必须晚于生效日期'))
    }
    callback()
  }
}

// ==================== 复制模板校验规则 ====================

/**
 * 复制模板表单校验规则
 */
export const COPY_TEMPLATE_RULES = {
  newTemplateCode: [
    { required: true, message: '请输入新模板编码', trigger: 'blur' },
    { validator: validateTemplateCode, trigger: 'blur' }
  ],
  newTemplateName: [
    { min: 2, max: 200, message: '新模板名称长度应为2-200个字符', trigger: 'blur' }
  ],
  newVersionNumber: [
    { required: true, message: '请输入新版本号', trigger: 'blur' },
    { validator: validateVersionNumber, trigger: 'blur' }
  ]
}

// ==================== 创建新版本校验规则 ====================

/**
 * 创建新版本表单校验规则
 */
export const CREATE_VERSION_RULES = {
  newVersionNumber: [
    { required: true, message: '请输入新版本号', trigger: 'blur' },
    { validator: validateVersionNumber, trigger: 'blur' }
  ],
  versionDescription: [
    { max: 2000, message: '版本描述不能超过2000个字符', trigger: 'blur' }
  ]
}

// ==================== 12段参数完整性校验 ====================

/**
 * 校验12段参数完整性和合理性
 * @param {Array} segments - 12段参数数组
 * @returns {Object} { valid: boolean, errors: Array }
 */
export const validateSegmentsCompleteness = (segments) => {
  const errors = []

  // 1. 校验段数必须为12
  if (!segments || segments.length !== 12) {
    errors.push('工艺参数必须包含完整的12段')
    return { valid: false, errors }
  }

  // 2. 校验段序号连续性（1-12不跳号）
  const orders = segments.map(s => s.segmentOrder).sort((a, b) => a - b)
  const expectedOrders = Array.from({ length: 12 }, (_, i) => i + 1)
  const isOrderValid = orders.every((order, index) => order === expectedOrders[index])
  if (!isOrderValid) {
    errors.push('段序号必须从1到12连续，不能跳号或重复')
  }

  // 3. 校验每段的必填字段
  segments.forEach((segment, index) => {
    const order = segment.segmentOrder || index + 1
    const requiredFields = [
      { field: 'furnaceTemperature', label: '炉温设置' },
      { field: 'materialTemperature', label: '料温设置' },
      { field: 'timeSet', label: '时间设置' },
      { field: 'circulationFanSpeed', label: '循环风机速度' },
      { field: 'negativePressureFan', label: '负压风机频率' },
      { field: 'cleaningFan', label: '吹洗风机频率' },
      { field: 'cleaningTime', label: '吹洗时间' }
    ]

    requiredFields.forEach(({ field, label }) => {
      const value = segment[field]
      if (value === null || value === undefined || value === '') {
        errors.push(`第${order}段的${label}不能为空`)
      }
    })
  })

  // 4. 校验料温不高于炉温
  segments.forEach((segment, index) => {
    const order = segment.segmentOrder || index + 1
    const furnaceTemp = Number(segment.furnaceTemperature)
    const materialTemp = Number(segment.materialTemperature)
    if (!isNaN(furnaceTemp) && !isNaN(materialTemp) && materialTemp > furnaceTemp) {
      errors.push(`第${order}段的料温(${materialTemp}℃)不能高于炉温(${furnaceTemp}℃)`)
    }
  })

  // 5. 校验控温方式固定值
  segments.forEach((segment, index) => {
    const order = segment.segmentOrder || index + 1
    if (segment.controlMode && segment.controlMode !== '定时定温') {
      errors.push(`第${order}段的控温方式必须为"定时定温"`)
    }
  })

  // 6. 校验循环风机速度枚举值
  const validFanSpeeds = Object.values(CIRCULATION_FAN_SPEED)
  segments.forEach((segment, index) => {
    const order = segment.segmentOrder || index + 1
    if (segment.circulationFanSpeed && !validFanSpeeds.includes(segment.circulationFanSpeed)) {
      errors.push(`第${order}段的循环风机速度必须为：低速、中速、高速`)
    }
  })

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * 显示段参数校验错误
 * @param {Array} errors - 错误信息数组
 * @param {Object} $message - Element UI Message组件
 */
export const showSegmentValidationErrors = (errors, $message) => {
  if (errors.length === 0) return

  const errorMessage = errors.slice(0, 3).join('；')
  const moreCount = errors.length > 3 ? errors.length - 3 : 0
  const fullMessage = moreCount > 0
    ? `${errorMessage}（还有${moreCount}个错误）`
    : errorMessage

  $message.error(fullMessage)
}

