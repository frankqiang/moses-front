/**
 * 文件名称：public-organization.js
 * 文件描述：公开组织架构API模块，提供无需认证的组织架构数据获取接口
 * 创建日期：2024-09-25
 * 修改记录：
 *   - 2024-09-25: 初始创建，用于支持用户注册流程中的组织架构数据获取
 */

import request from '@/utils/request'

/**
 * 获取公开部门列表
 * @param {Object} params - 查询参数
 * @param {boolean} [params.includeInactive=false] - 是否包含非活跃部门，默认只返回活跃部门
 * @returns {Promise} 返回包含部门基础信息的接口响应
 */
export function getPublicDepartments(params = {}) {
  const apiParams = {
    includeInactive: false,
    ...params
  }

  return request({
    url: '/public/departments',
    method: 'get',
    params: apiParams
  }).then(response => {
    // 将API响应转换为适合下拉框使用的格式
    if (response && response.success && response.data && Array.isArray(response.data)) {
      const departments = response.data

      // 转换为下拉框选项格式
      const options = departments.map(dept => ({
        value: dept.id,
        label: dept.name,
        code: dept.code,
        description: dept.description
      }))

      return {
        ...response,
        data: {
          departments: response.data,
          options // 添加格式化后的选项数据
        }
      }
    }

    return response
  })
}

/**
 * 获取公开部门树形结构
 * @returns {Promise} 返回完整的部门树形结构
 */
export function getPublicDepartmentTree() {
  return request({
    url: '/public/departments/tree',
    method: 'get'
  }).then(response => {
    // 将树形结构转换为扁平的选项列表，保持层级信息
    if (response && response.success && response.data && Array.isArray(response.data)) {
      const tree = response.data
      const options = []

      // 递归遍历树形结构，生成带层级的选项
      const flattenTree = (nodes, level = 1) => {
        nodes.forEach(node => {
          options.push({
            value: node.id,
            label: node.name,
            code: node.code,
            parentId: node.parentId,
            level: node.level || level,
            labelWithLevel: `${'  '.repeat((node.level || level) - 1)}${node.name}`,
            fullLabel: `${node.name} (${node.code})`
          })

          if (node.children && Array.isArray(node.children) && node.children.length > 0) {
            flattenTree(node.children, level + 1)
          }
        })
      }

      flattenTree(tree)

      return {
        ...response,
        data: {
          tree: response.data,
          options // 添加格式化后的选项数据
        }
      }
    }

    return response
  })
}

/**
 * 获取公开岗位列表
 * @param {Object} params - 查询参数
 * @param {string} [params.departmentId] - 部门ID，用于筛选特定部门的岗位
 * @returns {Promise} 返回包含岗位基础信息和关联部门信息的接口响应
 */
export function getPublicPositions(params = {}) {
  const apiParams = {}

  if (params.departmentId) {
    apiParams.departmentId = params.departmentId
  }

  return request({
    url: '/public/positions',
    method: 'get',
    params: apiParams
  }).then(response => {
    // 将API响应转换为适合下拉框使用的格式
    if (response && response.success && response.data && Array.isArray(response.data)) {
      const positions = response.data

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
          positions: response.data,
          options // 添加格式化后的选项数据
        }
      }
    }

    return response
  })
}

/**
 * 获取公开管理者列表
 * @param {Object} params - 查询参数
 * @param {string} [params.departmentId] - 部门ID，用于筛选特定部门的管理者
 * @returns {Promise} 返回可作为直属上级的用户基本信息
 */
export function getPublicManagers(params = {}) {
  const apiParams = {}

  if (params.departmentId) {
    apiParams.departmentId = params.departmentId
  }

  return request({
    url: '/public/managers',
    method: 'get',
    params: apiParams
  }).then(response => {
    // 将API响应转换为适合下拉框使用的格式
    if (response && response.success && response.data && Array.isArray(response.data)) {
      const managers = response.data

      // 转换为下拉框选项格式
      const options = managers.map(manager => ({
        value: manager.id,
        label: `${manager.name} (${manager.email})`, // 显示姓名和邮箱
        name: manager.name,
        email: manager.email
      }))

      return {
        ...response,
        data: {
          managers: response.data,
          options // 添加格式化后的选项数据
        }
      }
    }

    return response
  })
}

/**
 * 获取部门选项列表（用于注册页面下拉框）
 * 基于公开部门接口的封装，提供与原有API相同的格式
 * @param {Object} params - 查询参数
 * @param {boolean} [params.includeInactive=false] - 是否包含非活跃部门
 * @param {boolean} [params.useTree=false] - 是否使用树形结构，显示层级关系
 * @returns {Promise} 返回格式化的部门选项数据
 */
export function getPublicDepartmentOptions(params = {}) {
  // 根据参数决定使用普通列表还是树形结构
  if (params.useTree) {
    return getPublicDepartmentTree().then(response => {
      if (response && response.success && response.data && response.data.options) {
        return {
          ...response,
          data: {
            ...response.data,
            // 保持与原有API相同的数据结构
            options: response.data.options
          }
        }
      }
      return response
    })
  } else {
    return getPublicDepartments(params).then(response => {
      if (response && response.success && response.data && response.data.options) {
        return {
          ...response,
          data: {
            ...response.data,
            // 保持与原有API相同的数据结构
            options: response.data.options
          }
        }
      }
      return response
    })
  }
}

/**
 * 获取岗位选项列表（用于注册页面下拉框）
 * 基于公开岗位接口的封装，提供与原有API相同的格式
 * @param {Object} params - 查询参数
 * @param {string} [params.departmentId] - 部门ID，用于筛选特定部门的岗位
 * @returns {Promise} 返回格式化的岗位选项数据
 */
export function getPublicPositionOptions(params = {}) {
  return getPublicPositions(params).then(response => {
    if (response && response.success && response.data && response.data.options) {
      return {
        ...response,
        data: {
          ...response.data,
          // 保持与原有API相同的数据结构
          options: response.data.options
        }
      }
    }
    return response
  })
}

/**
 * 获取管理者选项列表（用于注册页面下拉框）
 * 基于公开管理者接口的封装，提供与原有API相同的格式
 * @param {Object} params - 查询参数
 * @param {string} [params.departmentId] - 部门ID，用于筛选特定部门的管理者
 * @returns {Promise} 返回格式化的管理者选项数据
 */
export function getPublicManagerOptions(params = {}) {
  return getPublicManagers(params).then(response => {
    if (response && response.success && response.data && response.data.options) {
      return {
        ...response,
        data: {
          ...response.data,
          // 保持与原有API相同的数据结构
          options: response.data.options
        }
      }
    }
    return response
  })
}

/**
 * 批量获取注册所需的所有选项数据
 * @param {Object} params - 查询参数
 * @param {boolean} [params.includeInactive=false] - 是否包含非活跃部门
 * @param {boolean} [params.useTree=true] - 部门数据是否使用树形结构
 * @returns {Promise} 返回包含所有选项数据的对象
 */
export function getRegistrationOptions(params = {}) {
  const { includeInactive = false, useTree = true } = params

  // 并行获取所有选项数据
  return Promise.all([
    getPublicDepartmentOptions({ includeInactive, useTree }),
    getPublicPositionOptions(),
    getPublicManagerOptions()
  ]).then(([departmentResponse, positionResponse, managerResponse]) => {
    return {
      success: true,
      data: {
        departments: departmentResponse.success ? departmentResponse.data.options : [],
        positions: positionResponse.success ? positionResponse.data.options : [],
        managers: managerResponse.success ? managerResponse.data.options : []
      },
      message: '获取注册选项数据成功'
    }
  }).catch(error => {
    console.error('批量获取注册选项数据失败:', error)
    throw error
  })
}

