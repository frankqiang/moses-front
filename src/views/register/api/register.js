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
 * @param {string} data.applicantName - 申请人姓名（必填，1-255字符）
 * @param {string} data.applicantEmail - 申请人邮箱（必填，有效邮箱格式）
 * @param {string} data.username - 用户名（必填，3-50字符，支持字母、数字、下划线，不能以数字开头）
 * @param {string} data.password - 密码（必填，至少8位，必须包含字母和数字）
 * @param {string} [data.departmentId] - 部门ID（可选，UUID格式）
 * @param {string} [data.jobTitle] - 职位名称（可选，最多100字符）
 * @param {string} [data.phone] - 手机号码（可选，有效的手机号码格式）
 * @param {string} [data.employeeId] - 员工ID（可选，最多50字符）
 * @param {string} [data.positionId] - 岗位ID（可选，UUID格式）
 * @param {string} [data.hireDate] - 预期入职日期（可选，日期格式YYYY-MM-DD）
 * @param {string} [data.birthDate] - 出生日期（可选，日期格式YYYY-MM-DD，不能是未来时间）
 * @param {string} [data.gender] - 性别（可选，male/female/other）
 * @param {string} [data.address] - 家庭住址（可选，最多500字符）
 * @param {string} [data.emergencyContact] - 紧急联系人姓名（可选，最多100字符）
 * @param {string} [data.emergencyPhone] - 紧急联系人电话（可选，有效的手机号码格式）
 * @param {string} [data.managerId] - 直属上级用户ID（可选，UUID格式）
 * @param {Object} [data.customFields] - 自定义字段（可选，JSON对象格式）
 * @param {string} [data.applicationReason] - 申请原因（可选）
 * @param {string} [data.notes] - 备注信息（可选）
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

  if (data.emergencyPhone && !isValidPhone(data.emergencyPhone)) {
    throw new Error('紧急联系人手机号码格式不正确')
  }

  if (data.positionId && !isValidUUID(data.positionId)) {
    throw new Error('岗位ID格式不正确')
  }

  if (data.departmentId && !isValidUUID(data.departmentId)) {
    throw new Error('部门ID格式不正确')
  }

  if (data.managerId && !isValidUUID(data.managerId)) {
    throw new Error('直属上级ID格式不正确')
  }

  if (data.gender && !['male', 'female', 'other'].includes(data.gender)) {
    throw new Error('性别选择无效')
  }

  if (data.birthDate && !isValidDate(data.birthDate)) {
    throw new Error('出生日期格式不正确')
  }

  if (data.hireDate && !isValidDate(data.hireDate)) {
    throw new Error('预期入职日期格式不正确')
  }

  return request({
    url: `${baseURL}/register-application`,
    method: 'post',
    data: {
      // 必填字段
      applicantName: data.applicantName.trim(),
      applicantEmail: data.applicantEmail.trim(),
      username: data.username.trim(),
      password: data.password,

      // 可选字段 - 基本信息
      departmentId: data.departmentId ? data.departmentId.trim() : undefined,
      jobTitle: data.jobTitle ? data.jobTitle.trim() : undefined,
      phone: data.phone ? data.phone.trim() : undefined,
      employeeId: data.employeeId ? data.employeeId.trim() : undefined,
      positionId: data.positionId ? data.positionId.trim() : undefined,
      hireDate: data.hireDate ? data.hireDate : undefined,
      birthDate: data.birthDate ? data.birthDate : undefined,
      gender: data.gender ? data.gender : undefined,
      address: data.address ? data.address.trim() : undefined,

      // 可选字段 - 联系人信息
      emergencyContact: data.emergencyContact ? data.emergencyContact.trim() : undefined,
      emergencyPhone: data.emergencyPhone ? data.emergencyPhone.trim() : undefined,
      managerId: data.managerId ? data.managerId.trim() : undefined,

      // 可选字段 - 其他信息
      customFields: data.customFields && Object.keys(data.customFields).length > 0 ? data.customFields : undefined,
      applicationReason: data.applicationReason ? data.applicationReason.trim() : undefined,
      notes: data.notes ? data.notes.trim() : undefined
    }
  })
}

/**
 * 获取待审批申请列表
 * @param {Object} params - 查询参数
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.limit=10] - 每页数量
 * @param {string} [params.search] - 搜索关键词（申请人姓名、邮箱或用户名）
 * @param {string} [params.startDate] - 申请开始时间
 * @param {string} [params.endDate] - 申请结束时间
 * @param {string} [params.sortBy] - 排序字段
 * @param {string} [params.sortOrder] - 排序方式，'ASC'或'DESC'
 * @returns {Promise} 返回待审批申请列表数据
 * @throws {ApiError} 可能抛出的错误：
 *   - VAL_001: 分页参数无效
 *   - AUTH_001: 权限不足，需要管理员权限
 */
export function getPendingApplications(params = {}) {
  // 参数验证
  const queryParams = {
    page: params.page || 1,
    limit: params.limit || 10
  }

  // 可选参数
  if (params.search && params.search.trim()) {
    queryParams.search = params.search.trim()
  }
  if (params.startDate) {
    queryParams.startDate = params.startDate
  }
  if (params.endDate) {
    queryParams.endDate = params.endDate
  }
  // 添加排序参数
  if (params.sortBy) {
    queryParams.sortBy = params.sortBy
  }
  if (params.sortOrder) {
    queryParams.sortOrder = params.sortOrder
  }

  return request({
    url: `${baseURL}/register-applications/pending`,
    method: 'get',
    params: queryParams
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
 * 验证UUID格式
 * @param {string} uuid - UUID字符串
 * @returns {boolean} 是否有效
 */
function isValidUUID(uuid) {
  const uuidRegex = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/
  return uuidRegex.test(uuid)
}

/**
 * 验证日期格式
 * @param {string} dateString - 日期字符串
 * @returns {boolean} 是否有效
 */
function isValidDate(dateString) {
  // 验证 YYYY-MM-DD 格式
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(dateString)) {
    return false
  }

  // 验证日期是否真实存在
  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date) && date.toISOString().slice(0, 10) === dateString
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
 * 批准注册申请
 * @param {string} id - 申请ID
 * @param {Object} data - 批准数据
 * @param {string} [data.notes] - 审批备注（可选）
 * @returns {Promise} 返回批准结果
 * @throws {ApiError} 可能抛出的错误：
 *   - VAL_001: 申请ID不能为空
 *   - BIZ_018: 申请记录不存在
 *   - AUTH_001: 权限不足，需要管理员权限
 */
export function approveApplication(id, data = {}) {
  // 参数验证
  if (!id || id.trim() === '') {
    throw new Error('申请ID不能为空')
  }

  return request({
    url: `${baseURL}/register-applications/${id.trim()}/approve`,
    method: 'put',
    data: {
      notes: data.notes ? data.notes.trim() : undefined
    }
  })
}

/**
 * 拒绝注册申请
 * @param {string} id - 申请ID
 * @param {Object} data - 拒绝数据
 * @param {string} data.reason - 拒绝理由（必填）
 * @param {string} [data.notes] - 审批备注（可选）
 * @returns {Promise} 返回拒绝结果
 * @throws {ApiError} 可能抛出的错误：
 *   - VAL_001: 申请ID不能为空
 *   - VAL_001: 拒绝理由不能为空
 *   - BIZ_018: 申请记录不存在
 *   - AUTH_001: 权限不足，需要管理员权限
 */
export function rejectApplication(id, data) {
  // 参数验证
  if (!id || id.trim() === '') {
    throw new Error('申请ID不能为空')
  }

  if (!data || !data.reason || data.reason.trim() === '') {
    throw new Error('拒绝理由不能为空')
  }

  return request({
    url: `${baseURL}/register-applications/${id.trim()}/reject`,
    method: 'put',
    data: {
      reason: data.reason.trim(),
      notes: data.notes ? data.notes.trim() : undefined
    }
  })
}

/**
 * 导出默认配置
 */

/**
 * 批量批准申请
 * @param {Object} data - 批量批准数据
 * @param {Array} data.applicationIds - 申请ID数组
 * @param {string} [data.notes] - 审批备注
 * @returns {Promise} 返回批量操作结果
 */
export function batchApproveApplications(data) {
  if (!data || !data.applicationIds || !Array.isArray(data.applicationIds)) {
    throw new Error('申请ID列表不能为空')
  }

  if (data.applicationIds.length === 0) {
    throw new Error('请选择要批准的申请')
  }

  return request({
    url: `${baseURL}/register-applications/batch`,
    method: 'post',
    data: {
      action: 'approve',
      applicationIds: data.applicationIds,
      notes: data.notes || ''
    }
  })
}

/**
 * 批量拒绝申请
 * @param {Object} data - 批量拒绝数据
 * @param {Array} data.applicationIds - 申请ID数组
 * @param {string} data.reason - 拒绝理由
 * @param {string} [data.notes] - 审批备注
 * @returns {Promise} 返回批量操作结果
 */
export function batchRejectApplications(data) {
  if (!data || !data.applicationIds || !Array.isArray(data.applicationIds)) {
    throw new Error('申请ID列表不能为空')
  }

  if (data.applicationIds.length === 0) {
    throw new Error('请选择要拒绝的申请')
  }

  if (!data.reason || data.reason.trim() === '') {
    throw new Error('拒绝理由不能为空')
  }

  return request({
    url: `${baseURL}/register-applications/batch`,
    method: 'post',
    data: {
      action: 'reject',
      applicationIds: data.applicationIds,
      reason: data.reason.trim(),
      notes: data.notes || ''
    }
  })
}

/**
 * 获取申请历史记录
 * @param {string} id - 申请ID
 * @returns {Promise} 返回申请的完整审批历史和时间线
 * @throws {ApiError} 可能抛出的错误：
 *   - VAL_001: 申请ID不能为空
 *   - BIZ_018: 申请记录不存在
 *   - AUTH_003: 权限不足，需要管理员权限
 */
export function getApplicationHistory(id) {
  // 验证申请ID
  if (!id || typeof id !== 'string' || id.trim() === '') {
    throw new Error('申请ID不能为空')
  }

  return request({
    url: `${baseURL}/register-applications/${id.trim()}/history`,
    method: 'get'
  }).catch(error => {
    throw handleError(error, {
      context: 'getApplicationHistory',
      showNotification: true
    })
  })
}

/**
 * 获取审批统计数据
 * @param {Object} params - 查询参数
 * @param {string} [params.dateRange] - 统计日期范围：today/week/month/year
 * @param {string} [params.approverId] - 指定审批人ID
 * @returns {Promise} 返回审批统计信息
 * @throws {ApiError} 可能抛出的错误：
 *   - AUTH_003: 权限不足，需要管理员权限
 */
export function getApplicationStats(params = {}) {
  const queryParams = {}

  // 处理日期范围参数
  if (params.dateRange && ['today', 'week', 'month', 'year'].includes(params.dateRange)) {
    queryParams.dateRange = params.dateRange
  }

  // 处理审批人ID参数
  if (params.approverId && typeof params.approverId === 'string' && params.approverId.trim() !== '') {
    queryParams.approverId = params.approverId.trim()
  }

  return request({
    url: `${baseURL}/register-applications/stats`,
    method: 'get',
    params: queryParams
  }).catch(error => {
    throw handleError(error, {
      context: 'getApplicationStats',
      showNotification: true
    })
  })
}

export default {
  submitRegistration,
  getPendingApplications,
  getApplicationStatus,
  approveApplication,
  rejectApplication,
  batchApproveApplications,
  batchRejectApplications,
  getApplicationHistory,
  getApplicationStats,
  handleRegistrationError,
  formatApplicationStatus,

  isValidApplicationId
}
