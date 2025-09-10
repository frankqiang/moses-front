import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },

  // 用户注册页面（独立页面，不使用Layout）
  {
    path: '/register',
    component: () => import('@/views/register/index'),
    redirect: '/register/apply',
    hidden: true,
    name: 'Register',
    meta: { title: '用户注册' }
  },
  {
    path: '/register/apply',
    component: () => import('@/views/register/apply'),
    hidden: true,
    name: 'RegisterApply',
    meta: { title: '注册申请' }
  },
  {
    path: '/register/status',
    component: () => import('@/views/register/status'),
    hidden: true,
    name: 'RegisterStatus',
    meta: { title: '申请状态查询' }
  },

  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [{
      path: 'dashboard',
      name: 'Dashboard',
      component: () => import('@/views/dashboard/index'),
      meta: { title: 'Dashboard', icon: 'dashboard' }
    }]
  },

  // 用户管理模块
  {
    path: '/user-management',
    component: Layout,
    redirect: '/user-management/pending-applications',
    name: 'UserManagement',
    meta: {
      title: '用户管理',
      icon: 'el-icon-user'
    },
    children: [
      {
        path: 'pending-applications',
        name: 'PendingApplications',
        component: () => import('@/views/register/pending'),
        meta: { title: '待审批申请', icon: 'el-icon-s-check' }
      },
      {
        path: 'application-stats',
        name: 'ApplicationStats',
        component: () => import('@/views/register/stats'),
        meta: { title: '申请统计', icon: 'el-icon-data-analysis' }
      }
    ]
  },

  // 主数据管理模块
  {
    path: '/master-data',
    component: Layout,
    redirect: '/master-data/bin-specification',
    name: 'MasterData',
    meta: {
      title: '主数据管理',
      icon: 'el-icon-s-order'
    },
    children: [
      {
        path: 'bin-specification',
        name: 'BinSpecification',
        component: () => import('@/views/master-data/bin-specification/index'),
        meta: { title: '料框规格管理' }
      },
      {
        path: 'warehouse',
        name: 'Warehouse',
        component: () => import('@/views/master-data/warehouse/index'),
        meta: { title: '仓库管理' }
      },
      {
        path: 'storage-location',
        name: 'StorageLocation',
        component: () => import('@/views/master-data/storage-location/index'),
        meta: { title: '库位主数据管理' }
      },
      {
        path: 'product-management',
        name: 'ProductManagement',
        component: () => import('@/views/master-data/product-management/index'),
        meta: { title: '铝箔产品管理' }
      },
      {
        path: 'material-code',
        name: 'MaterialCode',
        component: () => import('@/views/master-data/material-code/index'),
        meta: { title: '料框编码管理' }
      },
      {
        path: 'equipment',
        name: 'Equipment',
        component: () => import('@/views/master-data/equipment/index'),
        meta: { title: '设备管理' }
      },
      {
        path: 'process-parameter',
        component: () => import('@/views/master-data/process-parameter/index'),
        name: 'ProcessParameter',
        meta: { title: '工艺参数管理' }
      },
      {
        path: 'furnace-type',
        component: () => import('@/views/master-data/furnace-type/index'),
        name: 'FurnaceType',
        meta: { title: '炉型管理' }
      },
      {
        path: 'process-management',
        name: 'ProcessManagement',
        component: { render: h => h('router-view') },
        meta: { title: '工序管理', icon: 'el-icon-setting' },
        redirect: '/master-data/process-management/operations',
        children: [
          {
            path: 'operations',
            component: () => import('@/views/master-data/process-management/operations/index'),
            name: 'Operations',
            meta: { title: '基础工序定义' }
          },
          {
            path: 'routing',
            name: 'RoutingManagement',
            component: () => import('@/views/master-data/process-management/routing/index'),
            meta: { title: '工艺路线编排' }
          }
        ]
      },
      {
        path: 'quality-management',
        name: 'QualityManagement',
        component: { render: h => h('router-view') },
        meta: { title: '质量管理', icon: 'el-icon-medal' },
        alwaysShow: true,
        redirect: '/master-data/quality-management/inspection-item-management',
        children: [
          {
            path: 'inspection-item-management',
            component: () => import('@/views/master-data/quality-management/inspection-item-management/index'),
            name: 'InspectionItemManagement',
            meta: { title: '检验项目管理' }
          }
        ]
      }
      // 后续可以在这里添加其他主数据管理的子页面
    ]
  },

  // 组件演示路由
  {
    path: '/components',
    component: Layout,
    redirect: '/components/global',
    name: 'Components',
    meta: {
      title: '组件演示',
      icon: 'el-icon-s-grid'
    },
    children: [
      {
        path: 'global',
        name: 'GlobalComponents',
        component: () => import('@/views/global-components-demo/index'),
        meta: { title: '全局组件演示' }
      },
      {
        path: 'more',
        name: 'MoreComponents',
        component: () => import('@/views/components-examples/index'),
        meta: { title: '更多组件示例' }
      },
      {
        path: 'base-table',
        name: 'BaseTableDemo',
        component: () => import('@/views/base-table-demo/index'),
        meta: { title: 'BaseTable 表格组件' }
      },
      {
        path: 'overflow-tags',
        name: 'OverflowTagsDemo',
        component: () => import('@/components/OverflowTagsPopover/example.vue'),
        meta: { title: 'OverflowTagsPopover 溢出标签组件' }
      },
      {
        path: 'pagination',
        name: 'PaginationDemo',
        component: () => import('@/components/Pagination/demo.vue'),
        meta: { title: 'Pagination 分页组件' }
      },
      {
        path: 'refresh-button',
        name: 'RefreshButtonDemo',
        component: () => import('@/components/RefreshButton/demo.vue'),
        meta: { title: 'RefreshButton 刷新按钮组件' }
      },
      {
        path: 'status-tag',
        name: 'StatusTagDemo',
        component: () => import('@/components/StatusTag/demo.vue'),
        meta: { title: 'StatusTag 状态标签组件' }
      },
      {
        path: 'table-toolbar',
        name: 'TableToolbarDemo',
        component: () => import('@/components/TableToolbar/demo.vue'),
        meta: { title: 'TableToolbar 表格工具栏组件' }
      }
    ]
  },

  {
    path: '/example',
    component: Layout,
    redirect: '/example/table',
    name: 'Example',
    meta: { title: 'Example', icon: 'el-icon-s-help' },
    children: [

    ]
  },

  {
    path: '/form',
    component: Layout,
    children: [

    ]
  },

  {
    path: '/nested',
    component: Layout,
    redirect: '/nested/menu1',
    name: 'Nested',
    meta: {
      title: 'Nested',
      icon: 'nested'
    },
    children: [
      {
        path: 'menu1',
        component: () => import('@/views/nested/menu1/index'), // Parent router-view
        name: 'Menu1',
        meta: { title: 'Menu1' },
        children: [
          {
            path: 'menu1-1',
            component: () => import('@/views/nested/menu1/menu1-1'),
            name: 'Menu1-1',
            meta: { title: 'Menu1-1' }
          },
          {
            path: 'menu1-2',
            component: () => import('@/views/nested/menu1/menu1-2'),
            name: 'Menu1-2',
            meta: { title: 'Menu1-2' },
            children: [
              {
                path: 'menu1-2-1',
                component: () => import('@/views/nested/menu1/menu1-2/menu1-2-1'),
                name: 'Menu1-2-1',
                meta: { title: 'Menu1-2-1' }
              },
              {
                path: 'menu1-2-2',
                component: () => import('@/views/nested/menu1/menu1-2/menu1-2-2'),
                name: 'Menu1-2-2',
                meta: { title: 'Menu1-2-2' }
              }
            ]
          },
          {
            path: 'menu1-3',
            component: () => import('@/views/nested/menu1/menu1-3'),
            name: 'Menu1-3',
            meta: { title: 'Menu1-3' }
          }
        ]
      }
    ]
  },

  {
    path: 'external-link',
    component: Layout,
    children: [
      {
        path: 'https://panjiachen.github.io/vue-element-admin-site/#/',
        meta: { title: 'External Link', icon: 'link' }
      }
    ]
  },
  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
