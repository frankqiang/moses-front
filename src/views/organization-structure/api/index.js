/**
 * 文件名称：index.js
 * 文件描述：组织结构管理模块API统一入口文件，导出所有API接口
 * 创建日期：2024-01-20
 * 修改记录：
 *   - 2024-01-20: 初始创建，提供部门和岗位管理API的统一导出
 */

// 导入部门管理API
import * as departmentApi from './departments'
// 导入岗位管理API
import * as positionApi from './positions'

// 统一导出所有API
export {
  // 部门管理API
  departmentApi,
  // 岗位管理API
  positionApi
}

// 也可以直接导出具体的API函数，便于按需导入
export {
  // === 部门管理API ===
  createDepartment,
  getDepartmentList,
  getDepartmentTree,
  getDepartmentDetail,
  updateDepartment,
  deleteDepartment,
  updateDepartmentStatus,
  updateDepartmentManager,
  getDepartmentOptions,
  batchUpdateDepartmentStatus,
  exportDepartmentList
} from './departments'

export {
  // === 岗位管理API ===
  createPosition,
  getPositionList,
  getPositionDetail,
  updatePosition,
  deletePosition,
  updatePositionStatus,
  getPositionOptions,
  batchUpdatePositionStatus,
  batchDeletePositions,
  exportPositionList,
  getPositionsByDepartment
} from './positions'

/**
 * 组织结构管理API使用说明
 *
 * === 基本使用方式 ===
 *
 * 1. 按模块导入：
 * ```javascript
 * import { departmentApi, positionApi } from '@/views/organization-structure/api'
 *
 * // 使用部门API
 * const departments = await departmentApi.getDepartmentList(params)
 *
 * // 使用岗位API
 * const positions = await positionApi.getPositionList(params)
 * ```
 *
 * 2. 按需导入具体函数：
 * ```javascript
 * import {
 *   getDepartmentList,
 *   createDepartment,
 *   getPositionOptions
 * } from '@/views/organization-structure/api'
 *
 * const departments = await getDepartmentList(params)
 * ```
 *
 * === 错误处理 ===
 *
 * 所有API都使用统一的错误处理机制，返回标准化的ApiError对象：
 *
 * ```javascript
 * try {
 *   const result = await createDepartment(data)
 *   // 成功处理
 *   console.log('创建成功:', result.data)
 * } catch (error) {
 *   // 统一错误处理
 *   if (error.code === 'DUPLICATE_RESOURCE') {
 *     this.$message.error('部门编码已存在，请更换')
 *   } else if (error.code === 'DEPARTMENT_NOT_FOUND') {
 *     this.$message.error('父部门不存在')
 *   } else {
 *     // 使用后端返回的错误消息
 *     this.$message.error(error.message || '操作失败')
 *   }
 * }
 * ```
 *
 * === 常见错误码 ===
 *
 * - DUPLICATE_RESOURCE: 资源已存在（部门编码或岗位编码重复）
 * - DEPARTMENT_NOT_FOUND: 部门不存在
 * - RESOURCE_NOT_FOUND: 资源不存在（部门或岗位不存在）
 * - OPERATION_NOT_ALLOWED: 操作不被允许（存在关联数据或业务逻辑不允许）
 * - USER_NOT_FOUND: 用户不存在（设置部门经理时）
 * - VAL_001: 输入数据验证失败
 * - AUTH_001: 未授权访问
 * - AUTH_009: 权限不足
 *
 * === 数据格式说明 ===
 *
 * 所有API响应都遵循统一格式：
 * ```javascript
 * {
 *   success: true,
 *   data: {
 *     // 具体的业务数据
 *     results: [...], // 列表数据
 *     page: 1,        // 当前页码
 *     limit: 10,      // 每页数量
 *     totalPages: 5,  // 总页数
 *     totalResults: 50 // 总记录数
 *   },
 *   message: "操作成功的描述信息",
 *   meta: {
 *     timestamp: "2024-01-20T10:30:00.000Z",
 *     requestId: "req-1234567890-abcdef",
 *     version: "v1"
 *   }
 * }
 * ```
 *
 * === 分页查询示例 ===
 *
 * ```javascript
 * const params = {
 *   page: 1,
 *   limit: 20,
 *   name: '技术',
 *   status: 'active',
 *   sortBy: 'level:asc,sortOrder:asc'
 * }
 *
 * const response = await getDepartmentList(params)
 *
 * if (response.success) {
 *   this.tableData = response.data.results
 *   this.total = response.data.totalResults
 *   this.currentPage = response.data.page
 * }
 * ```
 *
 * === 选择器数据获取示例 ===
 *
 * ```javascript
 * // 获取部门选项（用于下拉框）
 * const deptResponse = await getDepartmentOptions({ status: 'active' })
 * this.departmentOptions = deptResponse.data.options
 *
 * // 获取岗位选项（按部门筛选）
 * const posResponse = await getPositionOptions({
 *   departmentId: selectedDepartmentId,
 *   status: 'active'
 * })
 * this.positionOptions = posResponse.data.options
 * ```
 */
