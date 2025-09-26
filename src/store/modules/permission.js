/**
 * 文件名称：permission.js
 * 文件描述：权限路由管理模块，实现动态路由生成
 * 创建日期：2024-01-20
 * 修改记录：
 *   - 2024-01-20: 初始创建，实现基于角色的动态路由生成
 */

import { constantRoutes } from '@/router'
import Layout from '@/layout'

/**
 * 开发阶段：暂时注释掉权限过滤函数，生产环境时恢复
 * 根据角色权限过滤异步路由表
 * @param routes asyncRoutes
 * @param roles
 */
// function filterAsyncRoutes(routes, roles) {
//   const res = []

//   routes.forEach(route => {
//     const tmp = { ...route }
//     if (hasPermission(roles, tmp)) {
//       if (tmp.children) {
//         tmp.children = filterAsyncRoutes(tmp.children, roles)
//       }
//       res.push(tmp)
//     }
//   })

//   return res
// }

/**
 * 开发阶段：暂时注释掉权限检查函数，生产环境时恢复
 * 判断是否有权限访问该路由
 * @param roles
 * @param route
 */
// function hasPermission(roles, route) {
//   if (route.meta && route.meta.roles) {
//     return roles.some(role => route.meta.roles.includes(role))
//   } else {
//     return true
//   }
// }

/**
 * 异步路由表 - 需要根据用户角色动态加载的路由
 */
export const asyncRoutes = [
  // 普通用户工作区
  {
    path: '/workspace',
    component: Layout,
    redirect: '/workspace/overview',
    name: 'Workspace',
    meta: {
      title: '工作台',
      icon: 'el-icon-s-home'
      // 开发阶段：移除 roles 限制
    },
    children: [
      {
        path: 'overview',
        name: 'WorkspaceOverview',
        component: () => import('@/views/dashboard/index'),
        meta: {
          title: '工作概览',
          icon: 'el-icon-pie-chart'
          // 开发阶段：移除 roles 限制
        }
      }
    ]
  },

  // 用户权限管理模块
  {
    path: '/user-management',
    component: Layout,
    redirect: '/user-management/users',
    name: 'UserPermissionManagement',
    meta: {
      title: '用户权限',
      icon: 'el-icon-user'
      // 开发阶段：移除 roles 限制
    },
    children: [
      {
        path: 'users',
        name: 'UserManagementIndex',
        component: () => import('@/views/user-management/index'),
        meta: {
          title: '用户管理',
          icon: 'el-icon-user'
          // 开发阶段：移除 roles 限制
        }
      },
      {
        path: 'roles',
        name: 'RoleManagement',
        component: () => import('@/views/role-management/index'),
        meta: {
          title: '角色管理',
          icon: 'el-icon-s-custom'
          // 开发阶段：移除 roles 限制
        }
      },
      {
        path: 'departments',
        name: 'DepartmentManagement',
        component: () => import('@/views/organization-structure/departments/index'),
        meta: {
          title: '部门管理',
          icon: 'el-icon-office-building'
          // 开发阶段：移除 roles 限制
        }
      },
      {
        path: 'positions',
        name: 'PositionManagement',
        component: () => import('@/views/organization-structure/positions/index'),
        meta: {
          title: '岗位管理',
          icon: 'el-icon-suitcase'
          // 开发阶段：移除 roles 限制
        }
      },
      {
        path: 'pending-applications',
        name: 'PendingApplications',
        component: () => import('@/views/register/pending'),
        meta: {
          title: '待审批申请',
          icon: 'el-icon-s-check'
          // 开发阶段：移除 roles 限制
        }
      },
      {
        path: 'detail/:id',
        name: 'UserDetail',
        component: () => import('@/views/user-management/detail'),
        meta: { title: '用户详情', activeMenu: '/user-management/users' },
        hidden: true
      }
    ]
  },

  // 主数据管理模块
  {
    path: '/master-data',
    component: Layout,
    redirect: '/master-data/equipment',
    name: 'MasterData',
    meta: {
      title: '主数据管理',
      icon: 'el-icon-folder'
      // 开发阶段：移除 roles 限制
    },
    children: [
      {
        path: 'equipment',
        name: 'Equipment',
        component: () => import('@/views/master-data/equipment/index'),
        meta: {
          title: '设备管理',
          icon: 'el-icon-cpu'
          // 开发阶段：移除 roles 限制
        }
      },
      {
        path: 'process-parameter',
        name: 'ProcessParameter',
        component: () => import('@/views/master-data/process-parameter/index'),
        meta: {
          title: '工艺参数',
          icon: 'el-icon-setting'
          // 开发阶段：移除 roles 限制
        }
      }
      // 可以继续添加其他主数据管理路由...
    ]
  },

  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const state = {
  routes: [],
  addRoutes: [],
  routesGenerated: false, // 标记路由是否已生成
  lastRoles: [] // 缓存上次生成路由的角色
}

const mutations = {
  SET_ROUTES: (state, { routes, roles = [] }) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
    state.routesGenerated = true
    state.lastRoles = [...roles]
  },

  RESET_ROUTES: (state) => {
    state.routes = []
    state.addRoutes = []
    state.routesGenerated = false
    state.lastRoles = []
  }
}

const actions = {
  generateRoutes({ commit }, roles) {
    return new Promise((resolve, reject) => {
      try {
        // 开发阶段：忽略所有权限检查，返回所有路由
        console.log('开发阶段：忽略权限检查，加载所有路由')

        const accessedRoutes = [...asyncRoutes] || []

        // 确保404路由总是在最后
        const notFoundRoute = { path: '*', redirect: '/404', hidden: true }
        if (!accessedRoutes.find(route => route.path === '*')) {
          accessedRoutes.push(notFoundRoute)
        }

        commit('SET_ROUTES', { routes: accessedRoutes, roles: roles || [] })
        resolve(accessedRoutes)
      } catch (error) {
        console.error('生成路由时发生错误:', error)
        reject(error)
      }
    })
  },

  /**
   * 重置路由状态
   */
  resetRoutes({ commit }) {
    commit('RESET_ROUTES')
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
