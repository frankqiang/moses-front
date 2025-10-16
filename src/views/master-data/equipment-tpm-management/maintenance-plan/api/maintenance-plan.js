/**
 * 文件名称：maintenance-plan.js
 * 文件描述：设备TPM管理-维护计划管理API服务
 * 创建日期：2025-10-15
 * 修改记录：
 *   - 2025-10-15: 初始创建，提供维护计划管理相关接口
 */

import request from '@/utils/request'
import { formatQueryParams } from '@/utils'

// API基础路径
const BASE_URL = '/mdm/tpm/maintenance-plans'

/**
 * 查询维护计划列表
 *
 * @param {Object} params - 查询参数
 * @param {string} [params.equipmentId] - 按设备ID筛选（UUID v4格式）
 * @param {string} [params.maintenanceType] - 按维护类型筛选（枚举：日常保养/定期检查/大修/专项维护）
 * @param {string} [params.cycleType] - 按维护周期类型筛选（枚举：按时间/按运行时长/按生产批次）
 * @param {string} [params.status] - 按计划状态筛选（枚举：启用/禁用）
 * @param {string} [params.search] - 搜索关键词（匹配计划编码或名称，不区分大小写）
 * @param {number} [params.page=1] - 页码，≥1，默认1
 * @param {number} [params.limit=10] - 每页数量，1-100，默认10
 * @param {string} [params.sortBy='createdAt:desc'] - 排序规则，格式：字段名:排序方向，支持多字段（逗号分隔）
 * @returns {Promise<Object>} 返回维护计划列表响应
 *
 * @example
 * // 查询所有启用的维护计划
 * const response = await getMaintenancePlans({ status: '启用', page: 1, limit: 10 })
 *
 * // 查询特定设备的维护计划
 * const response = await getMaintenancePlans({ equipmentId: '550e8400-e29b-41d4-a716-446655440000' })
 *
 * // 搜索包含"退火炉"的维护计划
 * const response = await getMaintenancePlans({ search: '退火炉', sortBy: 'planName:asc' })
 */
export function getMaintenancePlans(params = {}) {
  const {
    equipmentId,
    maintenanceType,
    cycleType,
    status,
    search,
    page = 1,
    limit = 10,
    sortBy = 'createdAt:desc'
  } = params

  // 使用 formatQueryParams 过滤空值参数（空字符串、null、undefined）
  const apiParams = formatQueryParams({
    equipmentId,
    maintenanceType,
    cycleType,
    status,
    search,
    page,
    limit,
    sortBy
  })

  if (process.env.NODE_ENV === 'development') {
    console.log('📋 [API] 查询维护计划列表:', apiParams)
  }

  return request({
    url: BASE_URL,
    method: 'get',
    params: apiParams
  })
}

/**
 * 查询单个维护计划详情
 *
 * @param {string} planId - 维护计划ID（UUID v4格式）
 * @returns {Promise<Object>} 返回维护计划详情响应
 *
 * @example
 * const response = await getMaintenancePlanById('770e8400-e29b-41d4-a716-446655440000')
 * console.log(response.data) // 维护计划详情对象
 */
export function getMaintenancePlanById(planId) {
  if (!planId) {
    return Promise.reject(new Error('维护计划ID不能为空'))
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 [API] 查询维护计划详情:', planId)
  }

  return request({
    url: `${BASE_URL}/${planId}`,
    method: 'get'
  })
}

/**
 * 创建维护计划
 *
 * @param {Object} data - 创建维护计划的数据
 * @param {string} [data.planCode] - 维护计划编码（可选，不提供则自动生成，最大100字符）
 * @param {string} data.planName - 维护计划名称（必填，1-200字符）
 * @param {string} data.equipmentId - 关联设备ID（必填，UUID v4格式）
 * @param {string} data.maintenanceType - 维护类型（必填，枚举：日常保养/定期检查/大修/专项维护）
 * @param {string} data.maintenanceItems - 维护项目和内容描述（必填）
 * @param {string} data.cycleType - 维护周期类型（必填，枚举：按时间/按运行时长/按生产批次）
 * @param {number} data.cycleValue - 周期参数值（必填，≥1）
 * @param {string} data.cycleUnit - 周期单位（必填，枚举：天/周/月/年/小时/批次）
 * @param {number} [data.standardDurationHours] - 标准工时（小时，≥0）
 * @param {Array} [data.requiredSpareParts] - 所需备件清单，数组元素包含sparePartId和quantity
 * @param {string} [data.requiredSkills] - 所需技能/资质要求
 * @param {string} [data.safetyNotes] - 安全注意事项
 * @param {string} [data.instructionAttachmentUrl] - 维护作业指导书附件URL（URL格式，最大500字符）
 * @param {string} [data.status] - 计划状态（枚举：启用/禁用，默认"启用"）
 * @param {number} [data.advanceDays] - 提前生成任务天数（≥0，默认3，仅对按时间周期生效）
 * @returns {Promise<Object>} 返回创建的维护计划响应
 *
 * @example
 * const planData = {
 *   planName: '退火炉月度定期检查计划',
 *   equipmentId: '550e8400-e29b-41d4-a716-446655440000',
 *   maintenanceType: '定期检查',
 *   maintenanceItems: '检查加热元件、清洁炉膛、校验温度传感器',
 *   cycleType: '按时间',
 *   cycleValue: 30,
 *   cycleUnit: '天',
 *   standardDurationHours: 2.5,
 *   advanceDays: 3
 * }
 * const response = await createMaintenancePlan(planData)
 */
export function createMaintenancePlan(data) {
  if (!data) {
    return Promise.reject(new Error('创建数据不能为空'))
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('✨ [API] 创建维护计划:', data)
  }

  return request({
    url: BASE_URL,
    method: 'post',
    data
  })
}

/**
 * 更新维护计划
 *
 * @param {string} planId - 维护计划ID（必填，UUID v4格式）
 * @param {Object} data - 更新数据（至少提供一个要更新的字段）
 * @param {string} [data.planCode] - 维护计划编码（最大100字符）
 * @param {string} [data.planName] - 维护计划名称（1-200字符）
 * @param {string} [data.equipmentId] - 关联设备ID（UUID v4格式）
 * @param {string} [data.maintenanceType] - 维护类型（枚举：日常保养/定期检查/大修/专项维护）
 * @param {string} [data.maintenanceItems] - 维护项目和内容描述
 * @param {string} [data.cycleType] - 维护周期类型（枚举：按时间/按运行时长/按生产批次）
 * @param {number} [data.cycleValue] - 周期参数值（≥1）
 * @param {string} [data.cycleUnit] - 周期单位（枚举：天/周/月/年/小时/批次）
 * @param {number} [data.standardDurationHours] - 标准工时（小时，≥0）
 * @param {Array} [data.requiredSpareParts] - 所需备件清单
 * @param {string} [data.requiredSkills] - 所需技能/资质要求
 * @param {string} [data.safetyNotes] - 安全注意事项
 * @param {string} [data.instructionAttachmentUrl] - 维护作业指导书附件URL（URL格式，最大500字符）
 * @param {number} [data.advanceDays] - 提前生成任务天数（≥0）
 * @returns {Promise<Object>} 返回更新后的维护计划响应
 *
 * @example
 * const updateData = {
 *   planName: '退火炉月度定期检查计划（已更新）',
 *   cycleValue: 45,
 *   advanceDays: 5
 * }
 * const response = await updateMaintenancePlan('770e8400-e29b-41d4-a716-446655440000', updateData)
 */
export function updateMaintenancePlan(planId, data) {
  if (!planId) {
    return Promise.reject(new Error('维护计划ID不能为空'))
  }

  if (!data || Object.keys(data).length === 0) {
    return Promise.reject(new Error('更新数据不能为空，至少提供一个要更新的字段'))
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('🔄 [API] 更新维护计划:', { planId, data })
  }

  return request({
    url: `${BASE_URL}/${planId}`,
    method: 'patch',
    data
  })
}

/**
 * 启用维护计划
 *
 * @param {string} planId - 维护计划ID（必填，UUID v4格式）
 * @returns {Promise<Object>} 返回启用后的维护计划响应
 *
 * @example
 * const response = await enableMaintenancePlan('770e8400-e29b-41d4-a716-446655440000')
 * console.log(response.data.status) // "启用"
 */
export function enableMaintenancePlan(planId) {
  if (!planId) {
    return Promise.reject(new Error('维护计划ID不能为空'))
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('✅ [API] 启用维护计划:', planId)
  }

  return request({
    url: `${BASE_URL}/${planId}/enable`,
    method: 'post'
  })
}

/**
 * 禁用维护计划
 *
 * @param {string} planId - 维护计划ID（必填，UUID v4格式）
 * @returns {Promise<Object>} 返回禁用后的维护计划响应
 *
 * @example
 * const response = await disableMaintenancePlan('770e8400-e29b-41d4-a716-446655440000')
 * console.log(response.data.status) // "禁用"
 */
export function disableMaintenancePlan(planId) {
  if (!planId) {
    return Promise.reject(new Error('维护计划ID不能为空'))
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('⛔ [API] 禁用维护计划:', planId)
  }

  return request({
    url: `${BASE_URL}/${planId}/disable`,
    method: 'post'
  })
}

/**
 * API方法导出说明
 *
 * 本模块提供以下6个核心API方法：
 *
 * 1. getMaintenancePlans(params) - 查询维护计划列表
 *    - 支持多条件筛选：设备ID、维护类型、周期类型、状态
 *    - 支持关键词搜索：计划编码或名称
 *    - 支持分页和排序
 *
 * 2. getMaintenancePlanById(planId) - 查询单个维护计划详情
 *    - 获取完整的维护计划信息
 *    - 包含关联的设备、创建人、更新人信息
 *
 * 3. createMaintenancePlan(data) - 创建维护计划
 *    - 支持自动生成计划编码
 *    - 支持三种维护周期类型：按时间、按运行时长、按生产批次
 *
 * 4. updateMaintenancePlan(planId, data) - 更新维护计划
 *    - 支持部分字段更新（PATCH语义）
 *    - 不支持更新状态字段（使用启用/禁用接口）
 *
 * 5. enableMaintenancePlan(planId) - 启用维护计划
 *    - 启用后系统将自动生成维护任务
 *
 * 6. disableMaintenancePlan(planId) - 禁用维护计划
 *    - 禁用前检查是否有未完成的维护任务
 *    - 禁用后停止生成新的维护任务
 *
 * 统一错误处理：
 * - 所有接口错误由request.js统一处理
 * - 错误响应格式：{ success: false, error: { code, message, details } }
 * - 业务层可通过error.code进行错误分类处理
 *
 * 开发环境日志：
 * - 所有接口调用在开发环境会输出日志
 * - 便于调试和问题排查
 */
