/**
 * 文件名称：permission.js
 * 文件描述：权限检查工具函数，提供统一的权限验证逻辑
 * 创建日期：2024-01-20
 * 修改记录：
 *   - 2024-01-20: 初始创建，实现基于角色和权限的检查功能
 */

import store from '@/store'

/**
 * 检查用户是否拥有指定角色
 * @param {string|Array} roles - 需要检查的角色，可以是字符串或数组
 * @returns {boolean} 是否拥有权限
 */
export function hasRole(roles) {
  if (!roles) return true

  const userRoles = store.getters.roles || []
  if (userRoles.length === 0) return false

  if (typeof roles === 'string') {
    return userRoles.includes(roles)
  }

  if (Array.isArray(roles)) {
    return roles.some(role => userRoles.includes(role))
  }

  return false
}

/**
 * 检查用户是否拥有指定权限
 * @param {string|Array} permissions - 需要检查的权限，可以是字符串或数组
 * @returns {boolean} 是否拥有权限
 */
export function hasPermission(permissions) {
  if (!permissions) return true

  const userPermissions = store.getters.permissions || []
  if (userPermissions.length === 0) return false

  if (typeof permissions === 'string') {
    return userPermissions.includes(permissions)
  }

  if (Array.isArray(permissions)) {
    return permissions.some(permission => userPermissions.includes(permission))
  }

  return false
}

/**
 * 检查用户是否为管理员
 * @returns {boolean} 是否为管理员
 */
export function isAdmin() {
  const userRoles = store.getters.roles || []
  return userRoles.includes('admin') || userRoles.includes('administrator')
}

/**
 * 检查用户是否拥有组织结构管理权限
 * @returns {boolean} 是否拥有组织结构管理权限
 */
export function hasOrganizationPermission() {
  return isAdmin() ||
         hasRole(['organization_manager']) ||
         hasPermission(['manageOrganization', 'getDepartments', 'getPositions'])
}

/**
 * 检查用户是否拥有部门管理权限
 * @returns {boolean} 是否拥有部门管理权限
 */
export function hasDepartmentPermission() {
  return isAdmin() ||
         hasRole(['organization_manager']) ||
         hasPermission(['manageOrganization', 'getDepartments'])
}

/**
 * 检查用户是否拥有岗位管理权限
 * @returns {boolean} 是否拥有岗位管理权限
 */
export function hasPositionPermission() {
  return isAdmin() ||
         hasRole(['organization_manager']) ||
         hasPermission(['manageOrganization', 'getPositions'])
}

/**
 * 检查路由权限
 * @param {Object} route - 路由对象
 * @param {Object} userInfo - 用户信息（可选，默认从store获取）
 * @returns {boolean} 是否有权限访问
 */
export function checkRoutePermission(route, userInfo = null) {
  if (!route || !route.meta) return true

  const { roles: requiredRoles, permissions: requiredPermissions } = route.meta

  // 没有权限要求的路由，默认允许访问
  if (!requiredRoles && !requiredPermissions) return true

  // 检查角色权限
  if (requiredRoles && !hasRole(requiredRoles)) {
    return false
  }

  // 检查功能权限
  if (requiredPermissions && !hasPermission(requiredPermissions)) {
    return false
  }

  return true
}

/**
 * 获取用户可访问的菜单路由
 * @param {Array} routes - 所有路由配置
 * @param {Object} userInfo - 用户信息（可选，默认从store获取）
 * @returns {Array} 过滤后的路由配置
 */
export function getAccessibleRoutes(routes, userInfo = null) {
  return routes.filter(route => {
    if (route.hidden) return false

    // 检查路由权限
    if (!checkRoutePermission(route, userInfo)) return false

    // 递归检查子路由
    if (route.children && route.children.length > 0) {
      route.children = getAccessibleRoutes(route.children, userInfo)
      // 如果所有子路由都被过滤掉，且父路由没有自己的组件，则隐藏父路由
      if (route.children.length === 0 && route.alwaysShow !== true) {
        return false
      }
    }

    return true
  })
}

/**
 * 权限验证装饰器（用于组件方法）
 * @param {string|Array} requiredRoles - 需要的角色
 * @param {string|Array} requiredPermissions - 需要的权限
 * @returns {Function} 装饰器函数
 */
export function requirePermission(requiredRoles = null, requiredPermissions = null) {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value

    descriptor.value = function(...args) {
      // 检查权限
      if (requiredRoles && !hasRole(requiredRoles)) {
        this.$message.error('权限不足，无法执行此操作')
        return
      }

      if (requiredPermissions && !hasPermission(requiredPermissions)) {
        this.$message.error('权限不足，无法执行此操作')
        return
      }

      // 权限验证通过，执行原方法
      return originalMethod.apply(this, args)
    }

    return descriptor
  }
}

/**
 * 权限检查混入对象
 */
export const permissionMixin = {
  methods: {
    // 检查角色权限
    hasRole,
    // 检查功能权限
    hasPermission,
    // 检查是否为管理员
    isAdmin,
    // 检查组织结构管理权限
    hasOrganizationPermission,
    // 检查部门管理权限
    hasDepartmentPermission,
    // 检查岗位管理权限
    hasPositionPermission,
    // 检查路由权限
    checkRoutePermission
  }
}

export default {
  hasRole,
  hasPermission,
  isAdmin,
  hasOrganizationPermission,
  hasDepartmentPermission,
  hasPositionPermission,
  checkRoutePermission,
  getAccessibleRoutes,
  requirePermission,
  permissionMixin
}
