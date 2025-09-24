/**
 * 文件名称：departments.js
 * 文件描述：部门管理模块API接口，提供部门CRUD操作、状态管理、层级关系维护等功能
 * 创建日期：2024-01-20
 * 修改记录：
 *   - 2024-01-20: 初始创建，实现部门管理相关的8个API接口
 */

import request from '@/utils/request'

// API基础路径 - 严格按照接口文档路径 /v1/departments
// 注意：VUE_APP_BASE_API = 'http://localhost:3000/v1'，这里使用相对路径
const baseURL = '/departments'

/**
 * 创建部门
 * @param {Object} data - 部门数据
 * @param {string} data.name - 部门名称 (必填, 1-100字符)
 * @param {string} data.code - 部门编码 (必填, 1-50字符, 唯一, 自动转为大写)
 * @param {string} [data.description] - 部门描述 (可选, 0-1000字符)
 * @param {string} [data.parentId] - 父部门ID (可选, UUID格式, 用于构建部门层级关系)
 * @param {string} [data.managerId] - 部门经理ID (可选, UUID格式)
 * @param {number} [data.level] - 部门层级 (可选, 1-10, 系统自动计算)
 * @param {number} [data.sortOrder] - 排序顺序 (可选, >=0, 用于同级部门排序)
 * @param {string} [data.status] - 部门状态 (可选, active/inactive, 默认为active)
 * @returns {Promise} 返回创建结果，HTTP 201状态码
 */
export function createDepartment(data) {
  return request({
    url: baseURL,
    method: 'post',
    data
  })
}

/**
 * 获取部门列表
 * @param {Object} params - 查询参数
 * @param {string} [params.name] - 按部门名称模糊查询 (0-100字符)
 * @param {string} [params.code] - 按部门编码模糊查询 (0-50字符)
 * @param {string} [params.parentId] - 按父部门ID精确筛选 (UUID格式)
 * @param {string} [params.managerId] - 按部门经理ID精确筛选 (UUID格式)
 * @param {string} [params.status] - 按部门状态筛选 (active/inactive)
 * @param {number} [params.level] - 按部门层级精确筛选 (1-10)
 * @param {string} [params.sortBy] - 排序选项，多个用逗号分隔 (字段名:方向, 如 level:asc,sortOrder:asc)
 * @param {number} [params.limit=10] - 每页最大结果数 (1-100)
 * @param {number} [params.page=1] - 页码 (>=1)
 * @param {string} [params.populate] - 关联查询字段，多个用逗号分隔 (manager,parent,children)
 * @returns {Promise} 返回部门列表数据，包含分页信息
 */
export function getDepartmentList(params = {}) {
  return request({
    url: baseURL,
    method: 'get',
    params
  })
}

/**
 * 获取部门树形结构
 * @description 获取完整的部门树形结构，用于层级展示。返回所有活跃部门的完整树形结构，包含父子关系
 * @returns {Promise} 返回部门树形结构数据，按部门层级和排序顺序排列
 */
export function getDepartmentTree() {
  return request({
    url: `${baseURL}/tree`,
    method: 'get'
  })
}

/**
 * 获取部门详情
 * @param {string} id - 部门ID (必填, UUID格式)
 * @param {Object} params - 查询参数
 * @param {string} [params.populate] - 关联查询字段，多个用逗号分隔 (manager,parent,children,employees)
 * @returns {Promise} 返回部门详细信息
 */
export function getDepartmentDetail(id, params = {}) {
  return request({
    url: `${baseURL}/${id}`,
    method: 'get',
    params
  })
}

/**
 * 更新部门信息
 * @param {string} id - 部门ID (必填, UUID格式)
 * @param {Object} data - 更新的部门数据 (至少需要提供一个字段)
 * @param {string} [data.name] - 部门名称 (1-100字符)
 * @param {string} [data.code] - 部门编码 (1-50字符, 唯一, 自动转为大写)
 * @param {string} [data.description] - 部门描述 (0-1000字符)
 * @param {string} [data.parentId] - 父部门ID (UUID格式或null)
 * @param {string} [data.managerId] - 部门经理ID (UUID格式或null)
 * @param {number} [data.level] - 部门层级 (1-10, 系统会自动计算)
 * @param {number} [data.sortOrder] - 排序顺序 (>=0)
 * @param {string} [data.status] - 部门状态 (active/inactive)
 * @returns {Promise} 返回更新结果
 */
export function updateDepartment(id, data) {
  return request({
    url: `${baseURL}/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除部门
 * @param {string} id - 部门ID (必填, UUID格式)
 * @description 删除指定的部门。删除前会检查部门是否有子部门、关联的员工和岗位，如果存在关联数据则不允许删除
 * @returns {Promise} 返回删除结果
 */
export function deleteDepartment(id) {
  return request({
    url: `${baseURL}/${id}`,
    method: 'delete'
  })
}

/**
 * 变更部门状态
 * @param {string} id - 部门ID (必填, UUID格式)
 * @param {Object} data - 状态变更数据
 * @param {string} data.status - 新的部门状态 (必填, active/inactive)
 * @description 专门用于变更部门状态的API，支持启用/禁用部门。这是一个专门的状态管理接口，比完整更新接口更加安全和明确
 * @returns {Promise} 返回状态变更结果
 */
export function updateDepartmentStatus(id, data) {
  return request({
    url: `${baseURL}/${id}/status`,
    method: 'patch',
    data
  })
}

/**
 * 设置部门负责人
 * @param {string} id - 部门ID (必填, UUID格式)
 * @param {Object} data - 负责人设置数据
 * @param {string} [data.managerId] - 部门经理ID (UUID格式或null, null表示取消负责人)
 * @description 设置或取消部门负责人。支持更换部门经理，每个用户只能管理一个部门。如果managerId为null则表示取消当前部门的负责人
 * @returns {Promise} 返回设置结果，包含部门经理信息
 */
export function updateDepartmentManager(id, data) {
  return request({
    url: `${baseURL}/${id}/manager`,
    method: 'patch',
    data
  })
}

/**
 * 获取部门选项列表（用于下拉框和选择器组件）
 * @param {Object} params - 查询参数
 * @param {string} [params.status=active] - 部门状态筛选 (active/inactive)
 * @param {string} [params.name] - 按部门名称模糊查询
 * @param {number} [params.level] - 按部门层级筛选
 * @param {string} [params.parentId] - 按父部门ID筛选
 * @param {number} [params.limit=100] - 每页最大结果数 (1-100)
 * @param {number} [params.page=1] - 页码 (>=1)
 * @param {string} [params.sortBy=level:asc,sortOrder:asc] - 排序选项
 * @returns {Promise} 返回格式化后的部门选项数据，适合下拉框使用
 */
export function getDepartmentOptions(params = {}) {
  // 设置默认参数，适合选择器使用
  const apiParams = {
    status: 'active', // 只获取激活状态的部门
    limit: 100, // 获取较多数据用于选择
    page: 1,
    sortBy: 'level:asc,sortOrder:asc', // 按层级和排序顺序排列
    ...params
  }

  return request({
    url: baseURL,
    method: 'get',
    params: apiParams
  }).then(response => {
    // 将API响应转换为适合下拉框使用的格式
    if (response && response.success && response.data && response.data.results) {
      const departments = response.data.results

      // 转换为下拉框选项格式
      const options = departments.map(dept => ({
        value: dept.id,
        label: dept.name,
        code: dept.code,
        description: dept.description,
        level: dept.level,
        parentId: dept.parentId,
        status: dept.status,
        // 用于显示层级结构的标签
        labelWithLevel: `${'  '.repeat((dept.level || 1) - 1)}${dept.name}`,
        // 完整的显示文本（包含编码）
        fullLabel: `${dept.name} (${dept.code})`
      }))

      return {
        ...response,
        data: {
          ...response.data,
          options // 添加格式化后的选项数据
        }
      }
    }

    return response
  })
}

/**
 * 批量更新部门状态
 * @param {Array} ids - 部门ID数组 (必填, UUID格式数组)
 * @param {string} status - 新的部门状态 (必填, active/inactive)
 * @param {string} [reason] - 状态变更原因 (可选)
 * @description 批量变更多个部门的状态，适用于批量操作场景
 * @returns {Promise} 返回批量操作结果
 */
export function batchUpdateDepartmentStatus(ids, status, reason = '') {
  return request({
    url: `${baseURL}/batch-status`,
    method: 'patch',
    data: {
      departmentIds: ids,
      status,
      ...(reason && { reason })
    }
  })
}

/**
 * 批量删除部门
 * @param {Array} ids - 部门ID数组 (必填, UUID格式数组)
 * @param {string} [reason] - 删除原因 (可选)
 * @description 批量删除多个部门，删除前会检查每个部门是否有子部门、关联的员工和岗位
 * @returns {Promise} 返回批量删除结果
 */
export function batchDeleteDepartments(ids, reason = '') {
  return request({
    url: `${baseURL}/batch-delete`,
    method: 'delete',
    data: {
      departmentIds: ids,
      ...(reason && { reason })
    }
  })
}

/**
 * 导出部门列表
 * @param {Object} params - 导出参数（与获取部门列表相同的筛选条件，但不包含分页）
 * @returns {Promise} 返回导出文件的blob数据
 */
export function exportDepartmentList(params = {}) {
  // 移除分页参数
  const { page, limit, ...exportParams } = params

  return request({
    url: `${baseURL}/export`,
    method: 'get',
    params: exportParams,
    responseType: 'blob' // 重要：设置响应类型为blob
  })
}
