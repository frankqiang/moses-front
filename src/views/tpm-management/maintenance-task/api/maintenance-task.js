/**
 * 文件名称：maintenance-task.js
 * 文件描述：维护任务管理API服务
 * 创建日期：2024-01-20
 * 修改记录：
 *   - 2024-01-20: 初始创建
 */

import service from '@/utils/request'

/**
 * 查询维护任务列表
 * @param {Object} params - 查询参数
 * @param {string} params.equipmentId - 设备ID筛选
 * @param {string} params.planId - 维护计划ID筛选
 * @param {string} params.taskType - 任务类型筛选
 * @param {string} params.status - 任务状态筛选（支持逗号分隔多个）
 * @param {string} params.assignedTo - 执行人ID筛选
 * @param {string} params.search - 搜索关键词（任务编码或标题）
 * @param {string} params.startDate - 计划开始时间起始范围
 * @param {string} params.endDate - 计划开始时间结束范围
 * @param {number} params.page - 页码
 * @param {number} params.limit - 每页数量
 * @param {string} params.sortBy - 排序字段
 * @returns {Promise}
 */
export function getMaintenanceTasks(params) {
  return service({
    url: '/v1/mdm/tpm/maintenance-tasks',
    method: 'get',
    params
  })
}

/**
 * 查询单个维护任务详情
 * @param {string} taskId - 维护任务ID
 * @returns {Promise}
 */
export function getMaintenanceTaskById(taskId) {
  return service({
    url: `/v1/mdm/tpm/maintenance-tasks/${taskId}`,
    method: 'get'
  })
}

/**
 * 查询我的任务列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getMyTasks(params) {
  return service({
    url: '/v1/mdm/tpm/maintenance-tasks/my-tasks',
    method: 'get',
    params
  })
}

/**
 * 查询逾期任务列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getOverdueTasks(params) {
  return service({
    url: '/v1/mdm/tpm/maintenance-tasks/overdue',
    method: 'get',
    params
  })
}

/**
 * 创建维护任务
 * @param {Object} data - 任务数据
 * @returns {Promise}
 */
export function createMaintenanceTask(data) {
  return service({
    url: '/v1/mdm/tpm/maintenance-tasks',
    method: 'post',
    data
  })
}

/**
 * 任务派工
 * @param {string} taskId - 维护任务ID
 * @param {Object} data - 派工数据
 * @returns {Promise}
 */
export function assignTask(taskId, data) {
  return service({
    url: `/v1/mdm/tpm/maintenance-tasks/${taskId}/assign`,
    method: 'post',
    data
  })
}

/**
 * 任务接单
 * 接口文档：POST /v1/mdm/tpm/maintenance-tasks/:taskId/accept
 *
 * 功能说明：
 * - 执行人员接收派发给自己的维护任务，或自主接单未派工的任务
 * - 只有待执行状态的任务才能接单
 * - 接单后如果任务未派工则自动关联当前用户为执行人
 *
 * 请求参数：无请求体（纯REST操作）
 *
 * 成功响应（HTTP 200）：
 * - 返回更新后的完整任务信息
 * - message: "任务接单成功"
 *
 * 错误响应：
 * - 400 TPM_TASK_011: 只有待执行状态的任务才能接单
 * - 403 TPM_TASK_016: 只能接收派工给自己的任务
 * - 404 TPM_TASK_001: 维护任务不存在
 *
 * @param {string} taskId - 维护任务ID（UUID格式）
 * @returns {Promise} 返回Promise，resolve时包含完整的任务信息
 */
export function acceptTask(taskId) {
  return service({
    url: `/v1/mdm/tpm/maintenance-tasks/${taskId}/accept`,
    method: 'post'
  })
}

/**
 * 开始执行任务
 * 接口文档：POST /v1/mdm/tpm/maintenance-tasks/:taskId/start
 *
 * 功能说明：
 * - 执行人员正式开始执行维护任务
 * - 任务状态从"待执行"或"已延期"转变为"执行中"
 * - 系统自动记录任务的实际开始时间（actualStartTime）
 * - 关联设备状态自动更新为"维护中"，防止冲突操作
 * - 严格验证只有任务的执行人才能开始执行
 * - 任务状态更新和设备状态更新在事务中原子执行
 *
 * 业务规则：
 * - 只能开始状态为"待执行"或"已延期"的任务
 * - 执行人必须是当前登录用户（assignedTo == currentUserId）
 * - 开始后任务状态变更为"执行中"
 * - 设备状态自动变更为"维护中"
 * - 系统自动记录实际开始时间
 *
 * 请求参数：无请求体（纯REST操作）
 *
 * 成功响应（HTTP 200）：
 * {
 *   success: true,
 *   data: {
 *     id: "d4e5f6a7-b8c9-0123-def0-234567890123",
 *     taskCode: "MT-EQ001-1729012345678",
 *     status: "执行中",
 *     actualStartTime: "2024-01-20T08:15:00.000Z",
 *     equipment: {
 *       id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
 *       equipmentCode: "EQ001",
 *       name: "退火炉#1",
 *       status: "维护中"
 *     },
 *     // ... 其他完整任务信息
 *   },
 *   message: "开始执行任务成功"
 * }
 *
 * 错误响应：
 * - 400 MAINTENANCE_TASK_006: 只有待执行或已延期状态的任务才能开始执行
 * - 403 MAINTENANCE_TASK_007: 只有任务执行人才能开始执行任务
 * - 404 MAINTENANCE_TASK_002: 维护任务不存在
 * - 401 UNAUTHORIZED: 未授权，Token无效或过期
 * - 403 FORBIDDEN: 无权限操作（缺少 mdm.tpm.maintenance-task.execute 权限）
 *
 * 使用示例：
 * ```javascript
 * // 开始执行任务
 * const response = await startTask('d4e5f6a7-b8c9-0123-def0-234567890123')
 * if (response.success) {
 *   console.log('任务已开始:', response.data)
 *   // 任务状态变为"执行中"
 *   // 设备状态变为"维护中"
 *   // actualStartTime已记录
 * }
 * ```
 *
 * @param {string} taskId - 维护任务ID（UUID格式）
 * @returns {Promise} 返回Promise，resolve时包含完整的任务信息
 */
export function startTask(taskId) {
  return service({
    url: `/v1/mdm/tpm/maintenance-tasks/${taskId}/start`,
    method: 'post'
  })
}

/**
 * 完成任务
 * @param {string} taskId - 维护任务ID
 * @param {Object} data - 完成数据
 * @returns {Promise}
 */
export function completeTask(taskId, data) {
  return service({
    url: `/v1/mdm/tpm/maintenance-tasks/${taskId}/complete`,
    method: 'post',
    data
  })
}

/**
 * 任务延期申请
 * 接口文档：POST /v1/mdm/tpm/maintenance-tasks/:taskId/postpone
 *
 * 功能说明：
 * - 执行人员申请延期维护任务，需要提供延期原因
 * - 只有待执行或执行中状态的任务才能申请延期
 * - 延期成功后任务状态变更为"已延期"
 * - 支持指定新的计划开始时间（可选）
 * - 执行中任务延期时设备状态保持"维护中"
 *
 * 业务规则：
 * - 只能延期状态为"待执行"或"执行中"的任务
 * - 执行人必须是当前登录用户（assignedTo == currentUserId）
 * - 延期原因为必填项，不能为空
 * - 新计划开始时间为可选项，格式为ISO 8601
 * - 延期后任务状态变更为"已延期"
 *
 * 请求参数：
 * @param {string} taskId - 维护任务ID（UUID格式）
 * @param {Object} data - 延期数据
 * @param {string} data.delayReason - 延期原因（必填，不能为空，最大500字符）
 * @param {string} [data.newPlannedStartTime] - 新的计划开始时间（可选，ISO 8601格式，不能早于当前时间）
 *
 * 成功响应（HTTP 200）：
 * {
 *   success: true,
 *   data: {
 *     id: "d4e5f6a7-b8c9-0123-def0-234567890123",
 *     status: "已延期",
 *     delayReason: "设备配件未到货",
 *     // ... 其他完整任务信息
 *   },
 *   message: "任务延期申请成功"
 * }
 *
 * 错误响应：
 * - 400 VALIDATION_ERROR: 请求参数验证失败
 * - 400 TPM_TASK_014: 只有待执行或执行中状态的任务才能申请延期
 * - 400 TPM_TASK_014: 延期原因不能为空
 * - 401 UNAUTHORIZED: 未授权，Token无效或过期
 * - 403 TPM_TASK_016: 只有任务执行人才能申请延期
 * - 403 FORBIDDEN: 无权限操作（缺少 execute 权限）
 * - 404 TPM_TASK_001: 维护任务不存在
 *
 * 使用示例：
 * ```javascript
 * // 申请延期并指定新的计划时间
 * const response = await postponeTask('d4e5f6a7-b8c9-0123-def0-234567890123', {
 *   delayReason: '设备配件未到货',
 *   newPlannedStartTime: '2024-01-22T08:00:00.000Z'
 * })
 *
 * // 仅申请延期不修改计划时间
 * const response = await postponeTask(taskId, {
 *   delayReason: '维修工具故障，需要时间维修'
 * })
 * ```
 *
 * @returns {Promise} 返回Promise，resolve时包含完整的任务信息
 */
export function postponeTask(taskId, data) {
  return service({
    url: `/v1/mdm/tpm/maintenance-tasks/${taskId}/postpone`,
    method: 'post',
    data
  })
}

/**
 * 取消任务
 * 接口文档：POST /v1/mdm/tpm/maintenance-tasks/:taskId/cancel
 *
 * 功能说明：
 * - 取消维护任务，需要提供取消原因
 * - 只有待执行、执行中或已延期状态的任务才能取消
 * - 取消成功后任务状态变更为"已取消"
 * - 如果任务处于执行中状态，设备状态将恢复为"空闲"
 *
 * 业务规则：
 * - 只能取消状态为"待执行"、"执行中"或"已延期"的任务
 * - 需要管理权限（manage）或是任务执行人（execute权限且是assignedTo）
 * - 取消原因为必填项，不能为空
 * - 执行中的任务取消后设备状态自动恢复为"空闲"
 * - 取消后任务状态变更为"已取消"（终态，不可恢复）
 *
 * 请求参数：
 * @param {string} taskId - 维护任务ID（UUID格式）
 * @param {Object} data - 取消数据
 * @param {string} data.cancelReason - 取消原因（必填，不能为空）
 *
 * 成功响应（HTTP 200）：
 * {
 *   success: true,
 *   data: {
 *     id: "d4e5f6a7-b8c9-0123-def0-234567890123",
 *     status: "已取消",
 *     remark: "取消原因：设备已提前完成维护",
 *     equipment: {
 *       status: "空闲" // 如果任务在执行中，设备状态恢复为空闲
 *     },
 *     // ... 其他完整任务信息
 *   },
 *   message: "任务取消成功"
 * }
 *
 * 错误响应：
 * - 400 VALIDATION_ERROR: 请求参数验证失败
 * - 400 TPM_TASK_015: 只有待执行、执行中或已延期状态的任务才能取消
 * - 400 TPM_TASK_015: 取消原因不能为空
 * - 401 UNAUTHORIZED: 未授权，Token无效或过期
 * - 403 FORBIDDEN: 无权限操作（需要manage权限或是任务执行人）
 * - 404 TPM_TASK_001: 维护任务不存在
 *
 * 使用示例：
 * ```javascript
 * // 取消任务
 * const response = await cancelTask('d4e5f6a7-b8c9-0123-def0-234567890123', {
 *   cancelReason: '设备已提前完成维护'
 * })
 *
 * if (response.success) {
 *   console.log('任务已取消:', response.data)
 *   // 任务状态变为"已取消"
 *   // 如果任务在执行中，设备状态恢复为"空闲"
 * }
 * ```
 *
 * @returns {Promise} 返回Promise，resolve时包含完整的任务信息
 */
export function cancelTask(taskId, data) {
  return service({
    url: `/v1/mdm/tpm/maintenance-tasks/${taskId}/cancel`,
    method: 'post',
    data
  })
}

/**
 * 查询任务日历视图数据
 * 接口文档：GET /v1/mdm/tpm/maintenance-tasks/calendar
 *
 * 功能说明：
 * - 获取维护任务的日历视图数据，将任务数据转换为适合日历组件展示的格式
 * - 支持按时间范围、设备、执行人等维度进行筛选
 * - 自动排除已取消的任务
 * - 结果按计划开始时间升序排列
 *
 * 业务规则：
 * - 已取消的任务自动过滤，不在日历中显示
 * - 所有查询参数都是可选的
 * - 时间范围使用计划开始时间进行筛选
 * - 返回的数据已经是标准日历格式，可直接用于 FullCalendar 等日历组件
 *
 * 请求参数：
 * @param {Object} params - 查询参数
 * @param {string} [params.startDate] - 开始日期（计划开始时间），ISO 8601格式，例如："2024-01-01T00:00:00.000Z"
 * @param {string} [params.endDate] - 结束日期（计划开始时间），ISO 8601格式，例如："2024-01-31T23:59:59.999Z"
 * @param {string} [params.equipmentId] - 设备ID筛选（UUID格式）
 * @param {string} [params.assignedTo] - 执行人ID筛选（UUID格式）
 *
 * 成功响应（HTTP 200）：
 * {
 *   success: true,
 *   data: [
 *     {
 *       id: "d4e5f6a7-b8c9-0123-def0-234567890123",
 *       title: "退火炉日常维护",
 *       start: "2024-01-20T08:00:00.000Z",
 *       end: "2024-01-20T12:00:00.000Z",
 *       status: "待执行",
 *       taskType: "计划维护",
 *       equipment: {
 *         id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
 *         code: "EQ001",
 *         name: "退火炉#1"
 *       },
 *       assignee: {
 *         id: "c3d4e5f6-a7b8-9012-cdef-123456789012",
 *         name: "张三"
 *       }
 *     }
 *   ],
 *   message: "获取任务日历数据成功"
 * }
 *
 * 响应字段说明：
 * - id: 维护任务ID
 * - title: 任务标题
 * - start: 日历事件开始时间（计划开始时间）
 * - end: 日历事件结束时间（计划结束时间或计划开始时间）
 * - status: 任务状态（待执行、执行中、已完成、已延期）
 * - taskType: 任务类型（计划维护、应急抢修、状态检修）
 * - equipment: 设备信息（id、code、name）
 * - assignee: 执行人信息（id、name），未分配时为 null
 *
 * 错误响应：
 * - 400 VALIDATION_ERROR: 请求参数验证失败（日期格式错误、UUID格式错误）
 * - 401 UNAUTHORIZED: 未授权，Token无效或过期
 * - 403 FORBIDDEN: 无权限操作（缺少 mdm.tpm.maintenance-task.view 权限）
 * - 500 INTERNAL_ERROR: 服务器内部错误
 *
 * 使用示例：
 * ```javascript
 * // 获取当月的所有任务
 * const response = await getCalendarTasks({
 *   startDate: '2024-01-01T00:00:00.000Z',
 *   endDate: '2024-01-31T23:59:59.999Z'
 * })
 *
 * // 获取特定设备的任务
 * const response = await getCalendarTasks({
 *   equipmentId: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
 *   startDate: '2024-01-01T00:00:00.000Z',
 *   endDate: '2024-03-31T23:59:59.999Z'
 * })
 *
 * // 获取当前用户的任务
 * const response = await getCalendarTasks({
 *   assignedTo: currentUserId,
 *   startDate: '2024-01-01T00:00:00.000Z',
 *   endDate: '2024-01-31T23:59:59.999Z'
 * })
 * ```
 *
 * @returns {Promise} 返回Promise，resolve时包含日历事件数组
 */
export function getCalendarTasks(params) {
  return service({
    url: '/v1/mdm/tpm/maintenance-tasks/calendar',
    method: 'get',
    params
  })
}

/**
 * 查询任务负载分析
 * 接口文档：GET /v1/mdm/tpm/maintenance-tasks/workload
 *
 * 功能说明：
 * - 统计分析维护任务的负载情况，支持按维护人员或设备分组统计各类型任务的分布
 * - 用于工作量分析、资源配置优化和性能评估
 * - 返回总任务数、待执行、执行中、已完成、已延期等各状态任务的数量
 *
 * 业务规则：
 * - groupBy参数默认为"assignee"（按人员分组）
 * - 按人员分组时，未分配任务显示为"未分配"（assigneeId: "unassigned"）
 * - 时间参数格式为ISO 8601日期格式（YYYY-MM-DD）
 * - 统计不包含已取消的任务
 *
 * 请求参数：
 * @param {Object} params - 查询参数
 * @param {string} [params.startDate] - 开始日期，ISO 8601日期格式（YYYY-MM-DD），用于过滤计划开始时间在此日期之后的任务
 * @param {string} [params.endDate] - 结束日期，ISO 8601日期格式（YYYY-MM-DD），用于过滤计划开始时间在此日期之前的任务，不能早于startDate
 * @param {string} [params.groupBy] - 分组方式，"assignee"（按人员分组）或"equipment"（按设备分组），默认值为"assignee"
 *
 * 成功响应（HTTP 200）：
 * {
 *   success: true,
 *   data: {
 *     groupBy: "assignee" | "equipment",
 *     data: [
 *       // 按人员分组时
 *       {
 *         assigneeId: "c3d4e5f6-a7b8-9012-cdef-123456789012",
 *         assigneeName: "张三",
 *         totalTasks: 15,
 *         pendingTasks: 5,
 *         inProgressTasks: 8,
 *         completedTasks: 2,
 *         delayedTasks: 0
 *       },
 *       // 按设备分组时
 *       {
 *         equipmentId: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
 *         equipmentCode: "EQ001",
 *         equipmentName: "退火炉",
 *         totalTasks: 10,
 *         pendingTasks: 2,
 *         inProgressTasks: 5,
 *         completedTasks: 3,
 *         delayedTasks: 0
 *       }
 *     ]
 *   },
 *   message: "获取任务负载分析成功"
 * }
 *
 * 错误响应：
 * - 400 BAD_REQUEST: 参数验证失败（日期格式错误、endDate早于startDate、groupBy参数不合法）
 * - 401 UNAUTHORIZED: 未授权，Token无效或过期
 * - 403 FORBIDDEN: 无权限操作（缺少 mdm.tpm.maintenance-task.view 权限）
 * - 500 INTERNAL_ERROR: 服务器内部错误
 *
 * 使用示例：
 * ```javascript
 * // 按人员分组查询当月负载
 * const response = await getWorkloadAnalysis({
 *   startDate: '2024-01-01',
 *   endDate: '2024-01-31',
 *   groupBy: 'assignee'
 * })
 *
 * // 按设备分组查询指定时间范围的负载
 * const response = await getWorkloadAnalysis({
 *   startDate: '2024-01-01',
 *   endDate: '2024-03-31',
 *   groupBy: 'equipment'
 * })
 *
 * // 不指定时间范围，查询所有历史数据
 * const response = await getWorkloadAnalysis({
 *   groupBy: 'assignee'
 * })
 * ```
 *
 * @returns {Promise} 返回Promise，resolve时包含负载分析数据
 */
export function getWorkloadAnalysis(params) {
  return service({
    url: '/v1/mdm/tpm/maintenance-tasks/workload',
    method: 'get',
    params
  })
}

/**
 * 按组织架构筛选维护人员
 * 接口文档：GET /v1/mdm/tpm/maintenance-tasks/personnel
 *
 * 功能说明：
 * - 根据部门、岗位、角色等组织架构信息筛选可用的维护人员
 * - 只返回状态为活跃（active）的用户
 * - 返回完整的用户信息和组织架构信息（部门、岗位）
 * - 用于任务派工时选择执行人员
 *
 * 业务规则：
 * - 所有筛选条件都是可选的
 * - 支持按部门、岗位、角色等多维度组合筛选
 * - 角色ID支持逗号分隔的多个角色（用户拥有其中任意一个即返回）
 * - 默认返回50条记录，最多100条
 * - 默认按姓名升序排列
 *
 * 请求参数：
 * @param {Object} params - 查询参数
 * @param {string} [params.departmentId] - 部门ID筛选（UUID格式）
 * @param {string} [params.positionId] - 岗位ID筛选（UUID格式）
 * @param {string} [params.roleIds] - 角色ID列表，逗号分隔（如："role-id-1,role-id-2"）
 * @param {number} [params.limit=50] - 返回结果数量限制（1-100）
 * @param {string} [params.sortBy='name:asc'] - 排序字段和方向（如："name:asc"）
 *
 * 成功响应（HTTP 200）：
 * {
 *   success: true,
 *   data: [
 *     {
 *       id: "c3d4e5f6-a7b8-9012-cdef-123456789012",
 *       name: "张三",
 *       username: "zhangsan",
 *       email: "zhangsan@example.com",
 *       status: "active",
 *       profile: {
 *         id: "profile-id-123",
 *         userId: "c3d4e5f6-a7b8-9012-cdef-123456789012",
 *         department: {
 *           id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
 *           name: "设备维护部",
 *           code: "DEPT001"
 *         },
 *         position: {
 *           id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
 *           name: "维护工程师",
 *           code: "POS001"
 *         }
 *       }
 *     }
 *   ],
 *   message: "查询维护人员成功"
 * }
 *
 * 错误响应：
 * - 400 VALIDATION_ERROR: 请求参数验证失败（UUID格式错误等）
 * - 401 UNAUTHORIZED: 未授权，Token无效或过期
 * - 500 INTERNAL_ERROR: 服务器内部错误
 *
 * 使用示例：
 * ```javascript
 * // 查询指定部门的维护人员
 * const response = await getMaintenancePersonnel({
 *   departmentId: 'dept-maintenance-001',
 *   limit: 50,
 *   sortBy: 'name:asc'
 * })
 *
 * // 按岗位筛选人员
 * const response = await getMaintenancePersonnel({
 *   positionId: 'pos-senior-engineer-001'
 * })
 *
 * // 按角色筛选（支持多个角色）
 * const response = await getMaintenancePersonnel({
 *   roleIds: 'role-maintenance-approver,role-maintenance-supervisor',
 *   limit: 20
 * })
 *
 * // 组合条件筛选
 * const response = await getMaintenancePersonnel({
 *   departmentId: 'dept-maintenance-001',
 *   positionId: 'pos-engineer-001',
 *   limit: 30
 * })
 * ```
 *
 * @returns {Promise} 返回Promise，resolve时包含维护人员列表
 */
export function getMaintenancePersonnel(params) {
  return service({
    url: '/v1/mdm/tpm/maintenance-tasks/personnel',
    method: 'get',
    params
  })
}

