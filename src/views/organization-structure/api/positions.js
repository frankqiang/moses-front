/**
 * 文件名称：positions.js
 * 文件描述：岗位管理模块API接口，提供岗位CRUD操作、状态管理、部门关联等功能
 * 创建日期：2024-01-20
 * 修改记录：
 *   - 2024-01-20: 初始创建，实现岗位管理相关的6个API接口
 */

import request from '@/utils/request'

// API基础路径 - 严格按照接口文档路径 /v1/positions
// 注意：VUE_APP_BASE_API已经包含了基础路径，这里直接使用接口路径
const baseURL = '/positions'

/**
 * 创建岗位
 * @param {Object} data - 岗位数据
 * @param {string} data.name - 岗位名称 (必填, 1-100字符)
 * @param {string} data.code - 岗位编码 (必填, 1-50字符, 唯一, 自动转为大写)
 * @param {string} [data.description] - 岗位描述 (可选, 0-1000字符)
 * @param {string} [data.departmentId] - 所属部门ID (可选, UUID格式)
 * @param {number} [data.level=1] - 岗位级别 (可选, 1-10, 默认1)
 * @param {number} [data.sortOrder=0] - 排序顺序 (可选, >=0, 默认0)
 * @param {string} [data.status=active] - 岗位状态 (可选, active/inactive, 默认active)
 * @returns {Promise} 返回创建结果，HTTP 201状态码
 */
export function createPosition(data) {
  return request({
    url: baseURL,
    method: 'post',
    data
  })
}

/**
 * 获取岗位列表
 * @param {Object} params - 查询参数
 * @param {string} [params.name] - 按岗位名称模糊查询 (0-100字符)
 * @param {string} [params.code] - 按岗位编码模糊查询 (0-50字符)
 * @param {string} [params.departmentId] - 按所属部门ID精确筛选 (UUID格式)
 * @param {string} [params.status] - 按岗位状态筛选 (active/inactive)
 * @param {string} [params.sortBy] - 排序选项，多个用逗号分隔 (字段名:方向, 如 level:asc,sortOrder:asc)
 * @param {number} [params.limit=10] - 每页最大结果数 (1-100)
 * @param {number} [params.page=1] - 页码 (>=1)
 * @param {string} [params.populate] - 关联查询字段，多个用逗号分隔 (department,creator)
 * @returns {Promise} 返回岗位列表数据，包含分页信息
 */
export function getPositionList(params = {}) {
  return request({
    url: baseURL,
    method: 'get',
    params
  })
}

/**
 * 获取岗位详情
 * @param {string} id - 岗位ID (必填, UUID格式)
 * @returns {Promise} 返回岗位详细信息
 */
export function getPositionDetail(id) {
  return request({
    url: `${baseURL}/${id}`,
    method: 'get'
  })
}

/**
 * 更新岗位信息
 * @param {string} id - 岗位ID (必填, UUID格式)
 * @param {Object} data - 更新的岗位数据 (至少需要提供一个字段)
 * @param {string} [data.name] - 岗位名称 (1-100字符)
 * @param {string} [data.code] - 岗位编码 (1-50字符, 唯一, 自动转为大写)
 * @param {string} [data.description] - 岗位描述 (0-1000字符)
 * @param {string} [data.departmentId] - 所属部门ID (UUID格式或null)
 * @param {number} [data.level] - 岗位级别 (1-10)
 * @param {number} [data.sortOrder] - 排序顺序 (>=0)
 * @param {string} [data.status] - 岗位状态 (active/inactive)
 * @returns {Promise} 返回更新结果
 */
export function updatePosition(id, data) {
  return request({
    url: `${baseURL}/${id}`,
    method: 'patch', // 按照接口文档使用PATCH方法
    data
  })
}

/**
 * 删除岗位
 * @param {string} id - 岗位ID (必填, UUID格式)
 * @description 删除指定的岗位。删除前会检查岗位是否有关联的员工，如果存在关联员工则不允许删除
 * @returns {Promise} 返回删除结果
 */
export function deletePosition(id) {
  return request({
    url: `${baseURL}/${id}`,
    method: 'delete'
  })
}

/**
 * 变更岗位状态
 * @param {string} id - 岗位ID (必填, UUID格式)
 * @param {Object} data - 状态变更数据
 * @param {string} data.status - 新的岗位状态 (必填, active/inactive)
 * @description 变更岗位状态为活跃或非活跃。当禁用岗位时，系统会检查是否有活跃员工关联到该岗位，如果有则不允许禁用
 * @returns {Promise} 返回状态变更结果
 */
export function updatePositionStatus(id, data) {
  return request({
    url: `${baseURL}/${id}/status`,
    method: 'patch',
    data
  })
}

/**
 * 获取岗位选项列表（用于下拉框和选择器组件）
 * @param {Object} params - 查询参数
 * @param {string} [params.name] - 按岗位名称模糊查询 (0-100字符)
 * @param {string} [params.code] - 按岗位编码模糊查询 (0-50字符)
 * @param {string} [params.departmentId] - 按所属部门ID精确筛选 (UUID格式)
 * @param {string} [params.status=active] - 按岗位状态筛选 (active/inactive)
 * @param {string} [params.sortBy=level:asc,sortOrder:asc] - 排序选项，多个用逗号分隔
 * @param {number} [params.limit=100] - 每页最大结果数 (1-100，默认10)
 * @param {number} [params.page=1] - 页码 (>=1，默认1)
 * @param {string} [params.populate] - 关联查询字段，多个用逗号分隔 (如 department,creator)
 * @returns {Promise} 返回格式化后的岗位选项数据，适合下拉框使用
 */
export function getPositionOptions(params = {}) {
  // 设置默认参数，适合选择器使用
  const apiParams = {
    status: 'active', // 只获取激活状态的岗位
    limit: 100, // 获取较多数据用于选择
    page: 1,
    sortBy: 'level:asc,sortOrder:asc', // 按层级和排序顺序排列
    populate: 'department', // 关联查询部门信息，便于显示
    ...params
  }

  return request({
    url: baseURL,
    method: 'get',
    params: apiParams
  }).then(response => {
    // 将API响应转换为适合下拉框使用的格式
    if (response && response.success && response.data && response.data.results) {
      const positions = response.data.results

      // 转换为下拉框选项格式
      const options = positions.map(pos => ({
        value: pos.id,
        label: pos.name,
        code: pos.code,
        description: pos.description,
        departmentId: pos.departmentId,
        department: pos.department ? {
          id: pos.department.id,
          name: pos.department.name,
          code: pos.department.code
        } : null,
        level: pos.level,
        status: pos.status,
        // 完整的显示文本（包含编码和部门）
        fullLabel: pos.department
          ? `${pos.name} (${pos.code}) - ${pos.department.name}`
          : `${pos.name} (${pos.code})`,
        // 带部门信息的标签
        labelWithDepartment: pos.department
          ? `${pos.name} - ${pos.department.name}`
          : pos.name
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
 * 批量更新岗位状态
 * @param {Array} ids - 岗位ID数组 (必填, UUID格式数组)
 * @param {string} status - 新的岗位状态 (必填, active/inactive)
 * @param {string} [reason] - 状态变更原因 (可选)
 * @description 批量变更多个岗位的状态，适用于批量操作场景
 * @returns {Promise} 返回批量操作结果
 */
export function batchUpdatePositionStatus(ids, status, reason = '') {
  return request({
    url: `${baseURL}/batch-status`,
    method: 'patch',
    data: {
      positionIds: ids,
      status,
      ...(reason && { reason })
    }
  })
}

/**
 * 批量删除岗位
 * @param {Array} ids - 岗位ID数组 (必填, UUID格式数组)
 * @description 批量删除多个岗位，删除前会检查岗位是否有关联的员工
 * @returns {Promise} 返回批量删除结果
 */
export function batchDeletePositions(ids) {
  return request({
    url: `${baseURL}/batch-delete`,
    method: 'delete',
    data: {
      positionIds: ids
    }
  })
}

/**
 * 导出岗位列表
 * @param {Object} params - 导出参数（与获取岗位列表相同的筛选条件，但不包含分页）
 * @returns {Promise} 返回导出文件的blob数据
 */
export function exportPositionList(params = {}) {
  // 移除分页参数
  const { page, limit, ...exportParams } = params

  return request({
    url: `${baseURL}/export`,
    method: 'get',
    params: exportParams,
    responseType: 'blob' // 重要：设置响应类型为blob
  })
}

/**
 * 根据部门ID获取岗位选项
 * @param {string} departmentId - 部门ID (必填, UUID格式)
 * @param {Object} params - 其他查询参数
 * @returns {Promise} 返回该部门下的岗位选项
 */
export function getPositionsByDepartment(departmentId, params = {}) {
  return getPositionOptions({
    departmentId,
    ...params
  })
}
