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
    redirect: '/master-data/aluminum-foil-product-management',
    name: 'MasterData',
    alwaysShow: true, // 确保即使只有一个子路由也显示父级菜单
    meta: {
      title: '主数据管理',
      icon: 'el-icon-folder'
      // 开发阶段：移除 roles 限制
    },
    children: [
      {
        path: 'aluminum-foil-product-management',
        name: 'AluminumFoilProductManagement',
        component: () => import('@/views/master-data/aluminum-foil-product-management/index'),
        meta: {
          title: '铝箔产品管理',
          icon: 'el-icon-box'
          // 开发阶段：移除 roles 限制
        }
      },
      {
        path: 'equipment-management',
        name: 'EquipmentManagement',
        component: () => import('@/views/master-data/equipment-management/index'),
        meta: {
          title: '设备管理',
          icon: 'el-icon-cpu'
          // 开发阶段：移除 roles 限制
        }
      },
      {
        path: 'process-parameter-management',
        name: 'ProcessParameterManagement',
        component: () => import('@/views/master-data/process-parameter-management/index'),
        meta: {
          title: '工艺参数管理',
          icon: 'el-icon-setting'
          // 开发阶段：移除 roles 限制
        }
      },
      {
        path: 'bin-specification-management',
        name: 'BinSpecificationManagement',
        component: () => import('@/views/master-data/bin-management/index'),
        meta: {
          title: '料框规格管理',
          icon: 'el-icon-goods'
          // 开发阶段：移除 roles 限制
        }
      },
      {
        path: 'storage-area-management',
        name: 'StorageAreaManagement',
        component: () => import('@/views/master-data/storage-location-management/storage-area'),
        meta: {
          title: '库区管理',
          icon: 'el-icon-office-building'
          // 开发阶段：移除 roles 限制
        }
      },
      {
        path: 'storage-location-management',
        name: 'StorageLocationManagement',
        component: () => import('@/views/master-data/storage-location-management/storage-location'),
        meta: {
          title: '库位管理',
          icon: 'el-icon-map-location'
          // 开发阶段：移除 roles 限制
        }
      }
      // 可以继续添加其他主数据管理路由...
    ]
  },

  // 设备TPM管理模块（独立菜单）
  {
    path: '/equipment-tpm',
    component: Layout,
    redirect: '/equipment-tpm/maintenance-plans',
    name: 'EquipmentTPM',
    alwaysShow: true,
    meta: {
      title: '设备TPM管理',
      icon: 'el-icon-s-tools'
      // 开发阶段：移除 roles 限制
    },
    children: [
      {
        path: 'maintenance-plans',
        name: 'MaintenancePlanList',
        component: () => import('@/views/tpm-management/maintenance-plan/index'),
        meta: {
          title: '维护计划管理',
          icon: 'el-icon-date'
          // 开发阶段：移除 roles 限制
          // 生产环境权限：mdm.tpm.maintenance-plan.view
        }
      },
      {
        path: 'maintenance-plans/create',
        name: 'MaintenancePlanCreate',
        component: () => import('@/views/tpm-management/maintenance-plan/create'),
        meta: {
          title: '创建维护计划',
          activeMenu: '/equipment-tpm/maintenance-plans'
          // 开发阶段：移除 roles 限制
          // 生产环境权限：mdm.tpm.maintenance-plan.manage
        },
        hidden: true
      },
      {
        path: 'maintenance-plans/:id',
        name: 'MaintenancePlanDetail',
        component: () => import('@/views/tpm-management/maintenance-plan/detail'),
        meta: {
          title: '维护计划详情',
          activeMenu: '/equipment-tpm/maintenance-plans'
          // 开发阶段：移除 roles 限制
          // 生产环境权限：mdm.tpm.maintenance-plan.view
        },
        hidden: true
      },
      {
        path: 'maintenance-plans/:id/edit',
        name: 'MaintenancePlanEdit',
        component: () => import('@/views/tpm-management/maintenance-plan/edit'),
        meta: {
          title: '编辑维护计划',
          activeMenu: '/equipment-tpm/maintenance-plans'
          // 开发阶段：移除 roles 限制
          // 生产环境权限：mdm.tpm.maintenance-plan.manage
        },
        hidden: true
      },
      // 维护任务管理
      {
        path: 'maintenance-tasks',
        name: 'MaintenanceTaskList',
        component: () => import('@/views/tpm-management/maintenance-task/index'),
        meta: {
          title: '维护任务管理',
          icon: 'el-icon-s-order'
          // 开发阶段：移除 roles 限制
          // 生产环境权限：mdm.tpm.maintenance-task.view
        }
      },
      {
        path: 'my-tasks',
        name: 'MyMaintenanceTasks',
        component: () => import('@/views/tpm-management/maintenance-task/my-tasks'),
        meta: {
          title: '我的任务',
          icon: 'el-icon-s-check'
          // 开发阶段：移除 roles 限制
          // 生产环境权限：mdm.tpm.maintenance-task.execute
        }
      },
      {
        path: 'maintenance-tasks/calendar',
        name: 'MaintenanceTaskCalendar',
        component: () => import('@/views/tpm-management/maintenance-task/calendar'),
        meta: {
          title: '任务日历',
          activeMenu: '/equipment-tpm/maintenance-tasks'
          // 开发阶段：移除 roles 限制
          // 生产环境权限：mdm.tpm.maintenance-task.view
        },
        hidden: true
      },
      {
        path: 'maintenance-tasks/workload',
        name: 'MaintenanceTaskWorkload',
        component: () => import('@/views/tpm-management/maintenance-task/workload'),
        meta: {
          title: '任务负载分析',
          activeMenu: '/equipment-tpm/maintenance-tasks'
          // 开发阶段：移除 roles 限制
          // 生产环境权限：mdm.tpm.maintenance-task.view
        },
        hidden: true
      },
      {
        path: 'maintenance-tasks/:id',
        name: 'MaintenanceTaskDetail',
        component: () => import('@/views/tpm-management/maintenance-task/detail'),
        meta: {
          title: '维护任务详情',
          activeMenu: '/equipment-tpm/maintenance-tasks'
          // 开发阶段：移除 roles 限制
          // 生产环境权限：mdm.tpm.maintenance-task.view
        },
        hidden: true
      },
      // 维护记录管理
      {
        path: 'maintenance-records',
        name: 'MaintenanceRecordList',
        component: () => import('@/views/tpm-management/maintenance-record/index'),
        meta: {
          title: '维护记录管理',
          icon: 'el-icon-document',
          breadcrumb: true
          // 开发阶段：移除 roles 限制
          // 生产环境权限：mdm.tpm.maintenance-record.view
        }
      },
      {
        path: 'maintenance-records/equipment-history',
        name: 'EquipmentMaintenanceHistory',
        component: () => import('@/views/tpm-management/maintenance-record/equipment-history'),
        meta: {
          title: '设备维护历史',
          icon: 'el-icon-data-line',
          breadcrumb: true
          // 开发阶段：移除 roles 限制
          // 生产环境权限：mdm.tpm.maintenance-record.view
        }
      },
      {
        path: 'maintenance-records/statistics',
        name: 'MaintenanceRecordStatistics',
        component: () => import('@/views/tpm-management/maintenance-record/statistics'),
        meta: {
          title: '维护记录统计分析',
          icon: 'el-icon-s-data',
          breadcrumb: true
          // 开发阶段：移除 roles 限制
          // 生产环境权限：mdm.tpm.maintenance-record.view
        }
      },
      {
        path: 'maintenance-records/:id',
        name: 'MaintenanceRecordDetail',
        component: () => import('@/views/tpm-management/maintenance-record/detail'),
        meta: {
          title: '维护记录详情',
          activeMenu: '/equipment-tpm/maintenance-records',
          breadcrumb: true
          // 开发阶段：移除 roles 限制
          // 生产环境权限：mdm.tpm.maintenance-record.view
        },
        hidden: true
      },
      // 设备故障管理
      {
        path: 'equipment-fault',
        name: 'EquipmentFaultList',
        component: () => import('@/views/tpm-management/equipment-fault/index'),
        meta: {
          title: '设备故障管理',
          icon: 'el-icon-warning-outline',
          breadcrumb: true
          // 开发阶段：移除 roles 限制
          // 生产环境权限：mdm.tpm.equipment-failure.view
        }
      },
      {
        path: 'equipment-fault/statistics',
        name: 'EquipmentFaultStatistics',
        component: () => import('@/views/tpm-management/equipment-fault/components/StatisticsPage'),
        meta: {
          title: '故障统计分析',
          activeMenu: '/equipment-tpm/equipment-fault',
          breadcrumb: true
          // 开发阶段：移除 roles 限制
          // 生产环境权限：mdm.tpm.equipment-failure.view
        },
        hidden: true
      },
      {
        path: 'equipment-fault/:id',
        name: 'EquipmentFaultDetail',
        component: () => import('@/views/tpm-management/equipment-fault/components/FaultDetail'),
        meta: {
          title: '故障详情',
          activeMenu: '/equipment-tpm/equipment-fault',
          breadcrumb: true
          // 开发阶段：移除 roles 限制
          // 生产环境权限：mdm.tpm.equipment-failure.view
        },
        hidden: true
      },
      // 备件管理
      {
        path: 'spare-parts',
        name: 'SparePartList',
        component: () => import(/* webpackChunkName: "spare-parts" */ '@/views/tpm-management/spare-parts/index'),
        meta: {
          title: '备件管理',
          icon: 'el-icon-s-goods',
          breadcrumb: true
          // 开发阶段：移除 roles 限制
          // 生产环境权限：mdm.tpm.spare-part.view
        }
      },
      {
        path: 'spare-parts/transactions',
        name: 'SparePartTransactionRecords',
        component: () => import(/* webpackChunkName: "spare-parts" */ '@/views/tpm-management/spare-parts/transaction-records/index'),
        meta: {
          title: '出入库记录',
          icon: 'el-icon-tickets',
          breadcrumb: true
          // 开发阶段：移除 roles 限制
          // 生产环境权限：mdm.tpm.spare-part.view
        }
      },
      {
        path: 'spare-parts/:id',
        name: 'SparePartDetail',
        component: () => import(/* webpackChunkName: "spare-parts" */ '@/views/tpm-management/spare-parts/detail'),
        meta: {
          title: '备件详情',
          activeMenu: '/equipment-tpm/spare-parts',
          breadcrumb: true
          // 开发阶段：移除 roles 限制
          // 生产环境权限：mdm.tpm.spare-part.view
        },
        hidden: true
      },
      // TPM统计分析
      {
        path: 'tpm-statistics',
        name: 'TpmStatistics',
        component: () => import('@/views/tpm-management/tpm-statistics/index'),
        meta: {
          title: 'TPM综合看板',
          icon: 'el-icon-data-board',
          breadcrumb: true
          // 开发阶段：移除 roles 限制
          // 生产环境权限：mdm.tpm.statistics.view
        }
      },
      {
        path: 'maintenance-plan-rate',
        name: 'MaintenancePlanRate',
        component: () => import('@/views/tpm-management/tpm-statistics/maintenance-plan-rate'),
        meta: {
          title: '维护计划执行率统计',
          icon: 'el-icon-s-data',
          breadcrumb: true
          // 开发阶段：移除 roles 限制
          // 生产环境权限：mdm.tpm.statistics.view
        }
      },
      {
        path: 'equipment-health',
        name: 'EquipmentHealth',
        component: () => import('@/views/tpm-management/tpm-statistics/equipment-health'),
        meta: {
          title: '设备健康度评分',
          icon: 'el-icon-trophy',
          breadcrumb: true
          // 开发阶段：移除 roles 限制
          // 生产环境权限：mdm.tpm.statistics.view
        }
      },
      {
        path: 'failure-summary',
        name: 'FailureSummary',
        component: () => import('@/views/tpm-management/tpm-statistics/failure-summary'),
        meta: {
          title: '故障汇总统计',
          icon: 'el-icon-warning',
          breadcrumb: true
          // 开发阶段：移除 roles 限制
          // 生产环境权限：mdm.tpm.statistics.view
        }
      },
      {
        path: 'mttr-trend',
        name: 'MttrTrend',
        component: () => import('@/views/tpm-management/tpm-statistics/mttr-trend'),
        meta: {
          title: 'MTTR趋势分析',
          icon: 'el-icon-data-line',
          breadcrumb: true
          // 开发阶段：移除 roles 限制
          // 生产环境权限：mdm.tpm.statistics.view
        }
      },
      {
        path: 'spare-part-consumption',
        name: 'SparePartConsumption',
        component: () => import('@/views/tpm-management/tpm-statistics/spare-part-consumption'),
        meta: {
          title: '备件消耗分析',
          icon: 'el-icon-coin',
          breadcrumb: true
          // 开发阶段：移除 roles 限制
          // 生产环境权限：mdm.tpm.statistics.view
        }
      },
      {
        path: 'maintenance-workload',
        name: 'MaintenanceWorkload',
        component: () => import('@/views/tpm-management/tpm-statistics/maintenance-workload'),
        meta: {
          title: '维护工作量统计',
          icon: 'el-icon-s-data',
          breadcrumb: true
          // 开发阶段：移除 roles 限制
          // 生产环境权限：mdm.tpm.statistics.view
        }
      }
    ]
  },

  // 库存管理模块
  {
    path: '/inventory-management',
    component: Layout,
    redirect: '/inventory-management/bin-management',
    name: 'InventoryManagement',
    alwaysShow: true,
    meta: {
      title: '库存管理',
      icon: 'el-icon-s-grid'
      // 开发阶段：移除 roles 限制
    },
    children: [
      {
        path: 'bin-management',
        name: 'BinManagement',
        component: () => import('@/views/inventory-management/bin-management/index'),
        meta: {
          title: '料框管理',
          icon: 'el-icon-box'
          // 开发阶段：移除 roles 限制
        }
      },
      {
        path: 'stack-management',
        name: 'StackManagement',
        component: () => import('@/views/inventory-management/stack-management/index'),
        meta: {
          title: '料垛管理',
          icon: 'el-icon-postcard'
          // 开发阶段：移除 roles 限制
        }
      }
      // 可以继续添加其他库存管理路由...
    ]
  },

  // 生产管理模块
  {
    path: '/production-management',
    component: Layout,
    redirect: '/production-management/production-plan',
    name: 'ProductionManagement',
    alwaysShow: true,
    meta: {
      title: '生产管理',
      icon: 'el-icon-s-operation'
      // 开发阶段：移除 roles 限制
    },
    children: [
      {
        path: 'production-plan',
        name: 'ProductionPlan',
        component: () => import('@/views/production-management/production-plan-management/index'),
        meta: {
          title: '生产计划管理',
          icon: 'el-icon-document'
          // 开发阶段：移除 roles 限制
        }
      },
      {
        path: 'production-plan/:id',
        name: 'ProductionPlanDetail',
        component: () => import('@/views/production-management/production-plan-management/detail'),
        meta: {
          title: '生产计划详情',
          activeMenu: '/production-management/production-plan'
        },
        hidden: true
      },
      {
        path: 'production-plan-progress',
        name: 'ProductionPlanProgress',
        component: () => import('@/views/production-management/production-plan-management/progress-report'),
        meta: {
          title: '生产进度报表',
          icon: 'el-icon-data-line'
          // 开发阶段：移除 roles 限制
        }
      },
      {
        path: 'production-plan-audit-logs',
        name: 'ProductionPlanAuditLogs',
        component: () => import('@/views/production-management/production-plan-management/audit-logs'),
        meta: {
          title: '审计日志查询',
          icon: 'el-icon-document-copy'
          // 开发阶段：移除 roles 限制
          // 生产环境权限：prod.production-plan.view
        }
      },
      {
        path: 'annealing-task',
        name: 'AnnealingTaskManagement',
        component: () => import('@/views/production-management/annealing-task/index'),
        meta: {
          title: '退火任务管理',
          icon: 'el-icon-s-order'
          // 开发阶段：移除 roles 限制
          // 生产环境权限：prod.annealing-task.view
        }
      },
      {
        path: 'annealing-task/pending',
        name: 'PendingTaskManagement',
        component: () => import('@/views/production-management/annealing-task/pending-tasks'),
        meta: {
          title: '待排程任务',
          icon: 'el-icon-time'
          // 开发阶段：移除 roles 限制
          // 生产环境权限：prod.annealing-task.schedule
        }
      },
      {
        path: 'annealing-task/:id',
        name: 'AnnealingTaskDetail',
        component: () => import('@/views/production-management/annealing-task/detail'),
        meta: {
          title: '退火任务详情',
          activeMenu: '/production-management/annealing-task'
        },
        hidden: true
      },
      {
        path: 'annealing-schedule',
        name: 'AnnealingScheduleManagement',
        component: () => import('@/views/production-management/annealing-schedule-management/index'),
        meta: {
          title: '退火炉排程',
          icon: 'el-icon-date'
          // 开发阶段：移除 roles 限制
          // 生产环境权限：prod.scheduling.view
        }
      },
      {
        path: 'annealing-schedule/:id',
        name: 'SchedulePlanDetail',
        component: () => import('@/views/production-management/annealing-schedule-management/detail'),
        meta: {
          title: '排程方案详情',
          activeMenu: '/production-management/annealing-schedule'
        },
        hidden: true
      },
      {
        path: 'annealing-schedule/:id/gantt',
        name: 'ScheduleGanttChart',
        component: () => import('@/views/production-management/annealing-schedule-management/gantt'),
        meta: {
          title: '排程甘特图',
          activeMenu: '/production-management/annealing-schedule'
        },
        hidden: true
      }
      // 可以继续添加其他生产管理路由...
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
