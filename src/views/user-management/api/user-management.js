/**
 * 文件名称：user-management.js
 * 文件描述：用户管理模块API接口，提供用户CRUD操作、状态管理、密码重置等功能
 * 创建日期：2024-01-15
 * 修改记录：
 *   - 2024-01-15: 初始创建，实现基础API架构
 */

import request from '@/utils/request'

// API基础路径 - 注意：VUE_APP_BASE_API已经包含了/v1，所以这里不需要重复
const baseURL = ''

/**
 * 获取用户列表
 * @param {Object} params - 查询参数
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.limit=10] - 每页数量（1-100）
 * @param {string} [params.name] - 按用户姓名模糊查询
 * @param {string} [params.username] - 按用户名模糊查询
 * @param {string} [params.email] - 按邮箱地址模糊查询
 * @param {string} [params.search] - 通用搜索，支持姓名、用户名、邮箱的模糊匹配
 * @param {string} [params.status] - 按用户状态筛选（active, locked, inactive, pending, deleted）
 * @param {string} [params.role] - 按角色筛选
 * @param {string} [params.roleId] - 按角色ID精确筛选（UUID格式）
 * @param {string} [params.roleName] - 按角色名称模糊筛选
 * @param {string} [params.roleCode] - 按角色编码模糊筛选
 * @param {string} [params.department] - 按部门名称模糊查询
 * @param {string} [params.departmentId] - 按部门ID精确筛选（UUID格式）
 * @param {string} [params.position] - 按岗位名称模糊查询
 * @param {string} [params.positionId] - 按岗位ID精确筛选（UUID格式）
 * @param {string} [params.createdFrom] - 创建时间范围起始日期（ISO 8601格式）
 * @param {string} [params.createdTo] - 创建时间范围结束日期（ISO 8601格式）
 * @param {string} [params.lastLoginFrom] - 最后登录时间范围起始日期（ISO 8601格式）
 * @param {string} [params.lastLoginTo] - 最后登录时间范围结束日期（ISO 8601格式）
 * @param {string} [params.sortBy] - 排序选项，如 name:asc, created_at:desc
 * @returns {Promise} 返回用户列表数据
 */
export function getUserList(params = {}) {
  return request({
    url: '/users',
    method: 'get',
    params
  })
}

/**
 * 获取用户详情
 * @param {string|number} id - 用户ID
 * @returns {Promise} 返回用户详细信息
 */
export function getUserDetail(id) {
  return request({
    url: `/users/${id}`,
    method: 'get'
  })
}

/**
 * 创建用户
 * @param {Object} data - 用户数据
 * @param {string} data.username - 用户名（必填）
 * @param {string} data.realName - 真实姓名（必填）
 * @param {string} data.email - 邮箱（必填）
 * @param {string} data.phone - 手机号（必填）
 * @param {string} data.password - 密码（必填）
 * @param {string} [data.department] - 部门
 * @param {number} [data.gender] - 性别 1-男 2-女
 * @param {string} [data.role] - 角色
 * @param {string} [data.remark] - 备注
 * @returns {Promise} 返回创建结果
 */
export function createUser(data) {
  return request({
    url: '/users',
    method: 'post',
    data
  })
}

/**
 * 更新用户信息 - 严格按照接口文档 PATCH /v1/users/{userId} 实现
 * @param {string} id - 用户ID (UUID格式)
 * @param {Object} data - 更新的用户数据
 *
 * 用户基本信息:
 * @param {string} [data.name] - 用户姓名 (1-255字符)
 * @param {string} [data.email] - 邮箱地址 (有效邮箱格式，全局唯一)
 * @param {string} [data.password] - 密码 (至少8位，必须包含字母和数字)
 * @param {string} [data.username] - 用户名 (3-50字符，字母数字下划线，全局唯一)
 * @param {string} [data.phone] - 手机号码 (最大20字符，国际电话格式)
 * @param {string} [data.status] - 用户状态 (active/locked/inactive/pending/deleted)
 *
 * 组织架构信息:
 * @param {string} [data.departmentId] - 部门ID (UUID格式或null)
 * @param {string} [data.positionId] - 岗位ID (UUID格式或null)
 * @param {Array} [data.roleIds] - 角色ID列表 (UUID数组)
 *
 * 用户档案信息:
 * @param {string} [data.employeeId] - 员工工号 (最大50字符，全局唯一)
 * @param {string} [data.jobTitle] - 职位名称 (最大100字符)
 * @param {string} [data.managerId] - 直属上级ID (UUID格式或null)
 * @param {string} [data.hireDate] - 入职日期 (日期格式，不能是未来时间)
 * @param {string} [data.birthDate] - 出生日期 (日期格式，年龄16-100岁)
 * @param {string} [data.gender] - 性别 (male/female/other)
 * @param {string} [data.address] - 家庭住址 (最大500字符)
 * @param {string} [data.emergencyContact] - 紧急联系人 (最大100字符)
 * @param {string} [data.emergencyPhone] - 紧急联系电话 (最大20字符，国际电话格式)
 * @param {string} [data.notes] - 备注信息 (最大1000字符)
 * @param {Object} [data.customFields] - 自定义字段 (JSON对象格式)
 *
 * @returns {Promise} 返回更新结果
 */
export function updateUser(id, data) {
  return request({
    url: `/users/${id}`,
    method: 'patch', // 按照接口文档使用PATCH方法
    data
  })
}

/**
 * 删除用户
 * @param {string|number} id - 用户ID
 * @returns {Promise} 返回删除结果
 */
export function deleteUser(id) {
  return request({
    url: `/users/${id}`,
    method: 'delete'
  })
}

/**
 * 批量删除用户
 * @param {Array} ids - 用户ID数组
 * @returns {Promise} 返回批量删除结果
 */
export function batchDeleteUsers(ids) {
  return request({
    url: '/users/batch-delete',
    method: 'delete',
    data: { ids }
  })
}

/**
 * 更新用户状态 - 按照接口文档使用PATCH方法
 * @param {string|number} id - 用户ID
 * @param {string} status - 状态值（active, locked, inactive, pending, deleted）
 * @returns {Promise} 返回状态更新结果
 */
export function updateUserStatus(id, status) {
  return request({
    url: `/users/${id}/status`,
    method: 'patch',
    data: { status }
  })
}

/**
 * 批量更新用户状态 - 按照接口文档使用PATCH方法
 * @param {Array} ids - 用户ID数组
 * @param {string} status - 状态值（active, locked, inactive, pending, deleted）
 * @returns {Promise} 返回批量状态更新结果
 */
export function batchUpdateUserStatus(ids, status) {
  return request({
    url: '/users/batch/status',
    method: 'patch',
    data: { userIds: ids, status }
  })
}

/**
 * 重置用户密码 - 按照接口文档规范
 * @param {string|number} id - 用户ID
 * @param {string} newPassword - 新密码
 * @returns {Promise} 返回密码重置结果
 */
export function resetUserPassword(id, newPassword) {
  return request({
    url: `/users/${id}/reset-password`,
    method: 'post',
    data: { newPassword }
  })
}



/**
 * 导出用户列表
 * @param {Object} params - 导出参数（与获取用户列表相同的筛选条件，但不包含分页）
 * @returns {Promise} 返回导出文件的blob数据
 */
export function exportUserList(params = {}) {
  // 移除分页参数
  const { page, limit, ...exportParams } = params

  return request({
    url: '/users/export',
    method: 'get',
    params: exportParams,
    responseType: 'blob' // 重要：设置响应类型为blob
  })
}

/**
 * 上传用户头像
 * @param {string|number} id - 用户ID
 * @param {FormData} formData - 包含头像文件的FormData对象
 * @returns {Promise} 返回上传结果
 */
export function uploadUserAvatar(id, formData) {
  return request({
    url: `/users/${id}/avatar`,
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}


/**
 * 获取部门选项列表（用于下拉框）
 * 严格按照接口文档 GET /v1/departments 规范调用
 * @param {Object} params - 查询参数
 * @param {string} [params.status=active] - 部门状态筛选 (active/inactive)
 * @returns {Promise} API响应，返回格式化后的选项数据
 */
export function getDepartmentOptions(params = {}) {
  // 严格按照接口文档设置参数，不使用不支持的字段
  const apiParams = {
    status: 'active', // 只获取激活状态的部门
    limit: 100, // 接口文档规定最大值为100
    page: 1, // 从第一页开始
    sortBy: 'level:asc,sortOrder:asc', // 按层级和排序顺序排列
    ...params
  }

  // 移除不支持的参数
  delete apiParams.includeDisabled

  return request({
    url: '/departments',
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
        code: dept.code
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
 * 获取岗位选项列表（用于下拉框）
 * 严格按照接口文档 GET /v1/positions 规范调用
 * @param {Object} params - 查询参数
 * @param {string} [params.name] - 按岗位名称模糊查询 (0-100字符)
 * @param {string} [params.code] - 按岗位编码模糊查询 (0-50字符)
 * @param {string} [params.departmentId] - 按所属部门ID精确筛选 (UUID格式)
 * @param {string} [params.status=active] - 按岗位状态筛选 (active/inactive)
 * @param {string} [params.sortBy=level:asc,sortOrder:asc] - 排序选项，多个用逗号分隔
 * @param {number} [params.limit=100] - 每页最大结果数 (1-100，默认10)
 * @param {number} [params.page=1] - 页码 (>=1，默认1)
 * @param {string} [params.populate] - 关联查询字段，多个用逗号分隔 (如 department,creator)
 * @returns {Promise} API响应，返回格式化后的选项数据
 */
export function getPositionOptions(params = {}) {
  // 严格按照接口文档设置参数
  const apiParams = {
    status: 'active', // 只获取激活状态的岗位
    limit: 100, // 接口文档规定最大值为100
    page: 1, // 从第一页开始
    sortBy: 'level:asc,sortOrder:asc', // 按层级和排序顺序排列
    populate: 'department', // 关联查询部门信息，便于显示
    ...params
  }

  return request({
    url: '/positions',
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
        status: pos.status
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
 * 获取角色选项列表（用于下拉框）
 * 严格按照接口文档 GET /v1/roles 规范调用
 * @param {Object} params - 查询参数
 * @param {number} [params.page=1] - 页码 (最小为1，默认为1)
 * @param {number} [params.limit=100] - 每页数量 (1-100，默认为10)
 * @param {string} [params.sortBy] - 排序字段，格式为"field:order"，如"name:asc,createdAt:desc"
 * @param {string} [params.name] - 角色名称筛选 (最大100字符，支持模糊查询)
 * @param {string} [params.code] - 角色编码筛选 (最大50字符，支持模糊查询)
 * @param {string|Array} [params.type] - 角色类型筛选 (system|custom，支持多选)
 * @param {string|Array} [params.status=active] - 角色状态筛选 (active|inactive，支持多选)
 * @param {number|Object} [params.level] - 角色级别筛选 (单值或范围对象{min: 1, max: 5})
 * @param {boolean} [params.isDefault] - 是否为默认角色
 * @param {string} [params.search] - 全文搜索 (最大100字符，在名称、编码、描述中搜索)
 * @param {string} [params.createdFrom] - 创建时间起始 (ISO日期格式)
 * @param {string} [params.createdTo] - 创建时间结束 (ISO日期格式)
 * @param {string|Array} [params.createdBy] - 创建者筛选 (用户ID，支持多选)
 * @param {string} [params.populate] - 关联查询字段 (creator,updater,users)
 * @param {boolean} [params.includeUserCount] - 是否包含用户数量统计
 * @param {boolean} [params.hasUsers] - 是否有关联用户
 * @returns {Promise} API响应，返回格式化后的选项数据
 */
export function getRoleOptions(params = {}) {
  // 严格按照接口文档设置参数
  const apiParams = {
    status: 'active', // 只获取激活状态的角色
    limit: 100, // 接口文档规定最大值为100
    page: 1, // 从第一页开始
    sortBy: 'level:asc,name:asc', // 按级别和名称排序
    includeUserCount: false, // 用户表单不需要统计用户数量
    ...params
  }

  return request({
    url: '/roles',
    method: 'get',
    params: apiParams
  }).then(response => {
    // 将API响应转换为适合下拉框使用的格式
    if (response && response.success && response.data && response.data.results) {
      const roles = response.data.results

      // 转换为下拉框选项格式
      const options = roles.map(role => ({
        value: role.id,
        label: role.name,
        description: role.description,
        code: role.code,
        type: role.type,
        level: role.level,
        status: role.status,
        isDefault: role.isDefault
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
 * 获取直属上级选项列表（用于下拉框）
 * 严格按照接口文档 GET /v1/users 规范调用
 * @param {Object} params - 查询参数
 * @param {string} [params.excludeUserId] - 排除的用户ID（编辑时排除自身）
 * @param {string} [params.status=active] - 用户状态筛选，只获取激活用户
 * @param {string} [params.search] - 通用搜索，支持姓名、用户名、邮箱的模糊匹配
 * @param {string} [params.department] - 按部门名称模糊查询
 * @param {string} [params.departmentId] - 按部门ID精确筛选
 * @param {string} [params.role] - 按角色筛选
 * @param {string} [params.sortBy=name:asc] - 排序选项，默认按姓名排序
 * @param {number} [params.limit=100] - 每页最大结果数 (1-100)
 * @param {number} [params.page=1] - 页码 (≥1)
 * @returns {Promise} API响应，返回格式化后的选项数据
 */
export function getManagerOptions(params = {}) {
  // 严格按照接口文档设置参数
  const apiParams = {
    status: 'active', // 只获取激活状态的用户
    limit: 100, // 接口文档规定最大值为100
    page: 1, // 从第一页开始
    sortBy: 'name:asc', // 按姓名排序，便于查找
    ...params
  }

  // 如果有排除的用户ID，需要在后端处理或前端过滤
  // 这里先调用API，然后在前端过滤
  const excludeUserId = apiParams.excludeUserId
  delete apiParams.excludeUserId

  return request({
    url: '/users',
    method: 'get',
    params: apiParams
  }).then(response => {
    // 将API响应转换为适合下拉框使用的格式
    if (response && response.success && response.data && response.data.results) {
      let users = response.data.results

      // 如果需要排除特定用户，在前端进行过滤
      if (excludeUserId) {
        users = users.filter(user => user.id !== excludeUserId)
      }

      // 转换为下拉框选项格式
      const options = users.map(user => ({
        value: user.id,
        label: `${user.name} (${user.username})`, // 显示姓名和用户名
        email: user.email,
        username: user.username,
        name: user.name,
        department: user.profile?.department ? {
          id: user.profile.department.id,
          name: user.profile.department.name,
          code: user.profile.department.code
        } : null,
        jobTitle: user.profile?.jobTitle || '',
        status: user.status
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

