/**
 * 文件名称：form-utils.js
 * 文件描述：维护任务管理表单工具函数
 * 创建日期：2024-01-20
 * 修改记录：
 *   - 2024-01-20: 初始创建
 */

/**
 * 构建创建维护任务的提交数据
 * 严格按照接口文档格式构建请求数据
 *
 * 接口要求：
 * - 必填字段：equipmentId, taskType, taskTitle, plannedStartTime
 * - 可选字段：taskCode, planId, plannedEndTime, assignedTo, taskDescription, remark
 * - 时间格式：ISO 8601格式（YYYY-MM-DDTHH:mm:ss.sssZ）
 *
 * @param {Object} formData - 表单数据对象
 * @returns {Object} 符合接口格式的提交数据
 */
export function buildCreateTaskData(formData) {
  // 必填字段
  const submitData = {
    equipmentId: formData.equipmentId,
    taskType: formData.taskType,
    taskTitle: formData.taskTitle,
    plannedStartTime: convertToISOString(formData.plannedStartTime)
  }

  // 可选字段：任务编码
  if (formData.taskCode && formData.taskCode.trim()) {
    submitData.taskCode = formData.taskCode.trim()
  }

  // 可选字段：维护计划ID
  if (formData.planId) {
    submitData.planId = formData.planId
  }

  // 可选字段：计划结束时间
  if (formData.plannedEndTime) {
    submitData.plannedEndTime = convertToISOString(formData.plannedEndTime)
  }

  // 可选字段：执行人员ID
  if (formData.assignedTo) {
    submitData.assignedTo = formData.assignedTo
  }

  // 可选字段：任务描述
  if (formData.taskDescription && formData.taskDescription.trim()) {
    submitData.taskDescription = formData.taskDescription.trim()
  }

  // 可选字段：备注
  if (formData.remark && formData.remark.trim()) {
    submitData.remark = formData.remark.trim()
  }

  return submitData
}

/**
 * 转换日期时间为ISO 8601格式
 * 支持多种输入格式：
 * - Date对象
 * - ISO 8601字符串
 * - YYYY-MM-DD HH:mm:ss格式字符串
 * - 时间戳（毫秒）
 *
 * @param {Date|string|number} dateTime - 日期时间
 * @returns {string} ISO 8601格式字符串（YYYY-MM-DDTHH:mm:ss.sssZ）
 */
export function convertToISOString(dateTime) {
  if (!dateTime) return ''

  // 如果已经是ISO格式字符串，直接返回
  if (typeof dateTime === 'string' && dateTime.includes('T') && dateTime.includes('Z')) {
    return dateTime
  }

  // 转换为Date对象
  let date
  if (dateTime instanceof Date) {
    date = dateTime
  } else if (typeof dateTime === 'string') {
    // 处理 "YYYY-MM-DD HH:mm:ss" 格式
    date = new Date(dateTime)
  } else if (typeof dateTime === 'number') {
    // 处理时间戳
    date = new Date(dateTime)
  } else {
    return ''
  }

  // 转换为ISO 8601格式
  return date.toISOString()
}

/**
 * 验证结束时间是否晚于开始时间
 *
 * @param {Date|string|number} startTime - 开始时间
 * @param {Date|string|number} endTime - 结束时间
 * @returns {boolean} 结束时间是否晚于开始时间
 */
export function isEndTimeAfterStartTime(startTime, endTime) {
  if (!startTime || !endTime) return true

  const start = new Date(startTime).getTime()
  const end = new Date(endTime).getTime()

  return end >= start
}

/**
 * 初始化表单数据
 *
 * @returns {Object} 初始化的表单数据对象
 */
export function initFormData() {
  return {
    taskCode: '',
    equipmentId: '',
    taskType: '',
    taskTitle: '',
    planId: '',
    plannedStartTime: '',
    plannedEndTime: '',
    assignedTo: '',
    taskDescription: '',
    remark: ''
  }
}

/**
 * 表单验证规则
 *
 * @param {Object} context - Vue组件实例（this）
 * @returns {Object} 表单验证规则对象
 */
export function getFormRules(context) {
  // 自定义验证规则：结束时间不能早于开始时间
  const validateEndTime = (rule, value, callback) => {
    if (value && context.formData.plannedStartTime) {
      if (!isEndTimeAfterStartTime(context.formData.plannedStartTime, value)) {
        callback(new Error('结束时间不能早于开始时间'))
      } else {
        callback()
      }
    } else {
      callback()
    }
  }

  return {
    equipmentId: [
      { required: true, message: '请选择设备', trigger: 'change' }
    ],
    taskType: [
      { required: true, message: '请选择任务类型', trigger: 'change' }
    ],
    taskTitle: [
      { required: true, message: '请输入任务标题', trigger: 'blur' },
      { min: 1, max: 200, message: '任务标题长度在 1 到 200 个字符', trigger: 'blur' }
    ],
    plannedStartTime: [
      { required: true, message: '请选择计划开始时间', trigger: 'change' }
    ],
    plannedEndTime: [
      { validator: validateEndTime, trigger: 'change' }
    ],
    taskCode: [
      { max: 100, message: '任务编码长度不能超过 100 个字符', trigger: 'blur' }
    ]
  }
}

export default {
  buildCreateTaskData,
  convertToISOString,
  isEndTimeAfterStartTime,
  initFormData,
  getFormRules
}

