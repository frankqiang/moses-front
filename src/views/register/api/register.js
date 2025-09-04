/**
 * 用户注册管理API
 * 文件描述：提供用户注册申请和状态查询相关的API调用方法
 * 创建日期：2024-01-20
 * 修改记录：
 *   - 2024-01-20: 初始创建，实现注册申请和状态查询接口
 */

import request from '@/utils/request'
import { handleError } from '../utils/errorHandler'

// API基础路径
const baseURL = '/auth'

/**
 * 提交注册申请
 * @param {Object} data - 注册申请数据
 * @param {string} data.applicantName - 申请人姓名（必填）
 * @param {string} data.applicantEmail - 申请人邮箱（必填）
 * @param {string} data.username - 用户名（必填）
 * @param {string} data.password - 密码（必填）
 * @param {string} [data.departmentId] - 部门ID（可选）
 * @param {string} [data.jobTitle] - 职位名称（可选）
 * @param {string} [data.phone] - 手机号码（可选）
 * @param {string} [data.employeeId] - 员工ID（可选）
 * @param {string} [data.applicationReason] - 申请原因（可选）
 * @returns {Promise} 返回申请结果，包含申请ID和基本信息
 * @throws {ApiError} 可能抛出的错误：
 *   - VAL_001: 缺少必填字段
 *   - VAL_004: 邮箱格式不正确
 *   - BIZ_011: 邮箱已被使用
 *   - BIZ_012: 用户名已被使用
 *   - BIZ_020: 该邮箱已有申请记录，请勿重复申请
 *   - BIZ_021: 该用户名已被申请，请更换用户名
 *   - BIZ_022: 所选部门不存在
 */
export function submitRegistration(data) {
  // 请求数据验证
  if (!data) {
    throw new Error('注册申请数据不能为空')
  }

  // 验证必填字段
  const requiredFields = [
    'applicantName',
    'applicantEmail',
    'username',
    'password'
  ]
  for (const field of requiredFields) {
    if (!data[field] || data[field].trim() === '') {
      throw new Error(`${getFieldDisplayName(field)}不能为空`)
    }
  }

  // 基础格式验证
  if (data.applicantEmail && !isValidEmail(data.applicantEmail)) {
    throw new Error('邮箱格式不正确')
  }

  if (data.username && !isValidUsername(data.username)) {
    throw new Error(
      '用户名格式不正确，应为3-50字符，支持字母、数字、下划线，不能以数字开头'
    )
  }

  if (data.password && !isValidPassword(data.password)) {
    throw new Error('密码格式不正确，至少8位，必须包含字母和数字')
  }

  if (data.phone && !isValidPhone(data.phone)) {
    throw new Error('手机号码格式不正确')
  }

  return request({
    url: `${baseURL}/register-application`,
    method: 'post',
    data: {
      applicantName: data.applicantName.trim(),
      applicantEmail: data.applicantEmail.trim(),
      username: data.username.trim(),
      password: data.password,
      departmentId: data.departmentId ? data.departmentId.trim() : undefined,
      jobTitle: data.jobTitle ? data.jobTitle.trim() : undefined,
      phone: data.phone ? data.phone.trim() : undefined,
      employeeId: data.employeeId ? data.employeeId.trim() : undefined,
      applicationReason: data.applicationReason
        ? data.applicationReason.trim()
        : undefined
    }
  })
}

/**
 * 查询申请状态
 * @param {string} id - 申请ID
 * @returns {Promise} 返回申请详细信息和状态
 * @throws {ApiError} 可能抛出的错误：
 *   - VAL_001: 申请ID不能为空
 *   - BIZ_018: 申请记录不存在
 */
export function getApplicationStatus(id) {
  // 参数验证
  if (!id || id.trim() === '') {
    throw new Error('申请ID不能为空')
  }

  return request({
    url: `${baseURL}/register-application/${id.trim()}`,
    method: 'get'
  })
}

/**
 * 获取字段显示名称
 * @param {string} fieldName - 字段名
 * @returns {string} 显示名称
 */
function getFieldDisplayName(fieldName) {
  const fieldMap = {
    applicantName: '申请人姓名',
    applicantEmail: '申请人邮箱',
    username: '用户名',
    password: '密码',
    departmentId: '部门',
    jobTitle: '职位名称',
    phone: '手机号码',
    employeeId: '员工ID',
    applicationReason: '申请原因'
  }
  return fieldMap[fieldName] || fieldName
}

/**
 * 验证邮箱格式
 * @param {string} email - 邮箱地址
 * @returns {boolean} 是否有效
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 验证用户名格式
 * @param {string} username - 用户名
 * @returns {boolean} 是否有效
 */
function isValidUsername(username) {
  // 3-50字符，支持字母、数字、下划线，不能以数字开头
  const usernameRegex = /^[a-zA-Z_][a-zA-Z0-9_]{2,49}$/
  return usernameRegex.test(username)
}

/**
 * 验证密码格式
 * @param {string} password - 密码
 * @returns {boolean} 是否有效
 */
function isValidPassword(password) {
  // 至少8位，必须包含字母和数字
  if (password.length < 8) {
    return false
  }
  const hasLetter = /[a-zA-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  return hasLetter && hasNumber
}

/**
 * 验证手机号码格式
 * @param {string} phone - 手机号码
 * @returns {boolean} 是否有效
 */
function isValidPhone(phone) {
  // 中国大陆手机号码格式
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phone)
}

/**
 * 处理注册相关错误
 *
 * 错误处理最佳实践说明：
 * 1. 优先使用后端返回的错误消息（error.message），保持前后端一致性
 * 2. 仅在后端消息不够用户友好时，才进行前端转换
 * 3. 错误码映射主要用于：
 *    - 国际化支持（根据语言环境显示不同消息）
 *    - 统一错误提示格式
 *    - 特殊业务场景的用户引导
 * 4. 避免硬编码，优先从配置文件或常量中获取错误消息
 *
 * @param {Object} error - 错误对象
 * @param {string} error.code - 错误码
 * @param {string} error.message - 后端返回的错误消息
 * @returns {string} 用户友好的错误消息
 */
export function handleRegistrationError(error, options = {}) {
  // 使用统一错误处理工具
  return handleError(error, {
    context: '注册模块',
    showMessage: options.showMessage !== false, // 默认显示消息
    ...options
  })
}

/**
 * 格式化申请状态显示
 * @param {string} status - 申请状态
 * @returns {Object} 包含显示文本和样式类的对象
 */
export function formatApplicationStatus(status) {
  const statusMap = {
    pending: {
      text: '待审批',
      type: 'warning',
      icon: 'el-icon-time'
    },
    approved: {
      text: '已批准',
      type: 'success',
      icon: 'el-icon-check'
    },
    rejected: {
      text: '已拒绝',
      type: 'danger',
      icon: 'el-icon-close'
    },
    cancelled: {
      text: '已取消',
      type: 'info',
      icon: 'el-icon-minus'
    }
  }

  return (
    statusMap[status] || {
      text: status || '未知状态',
      type: 'info',
      icon: 'el-icon-question'
    }
  )
}

/**
 * 验证申请ID格式
 * @param {string} id - 申请ID
 * @returns {boolean} 是否有效
 */
export function isValidApplicationId(id) {
  if (!id || typeof id !== 'string') {
    return false
  }
  // 申请ID为UUID格式
  const idRegex = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/
  return idRegex.test(id.trim())
}

/**
 * 导出默认配置
 */
export default {
  submitRegistration,
  getApplicationStatus,
  handleRegistrationError,
  formatApplicationStatus,
  isValidApplicationId
}
