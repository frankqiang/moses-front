import router from './router'
import store from './store'
// import { Message } from 'element-ui' // 不再使用弹窗提示，改为静默跳转
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken } from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'
import sessionManager from '@/utils/sessionManager'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['/login', '/register', '/register/apply', '/register/status'] // no redirect whitelist

router.beforeEach(async(to, from, next) => {
  // start progress bar
  NProgress.start()

  // set page title
  document.title = getPageTitle(to.meta.title)

  // determine whether the user has logged in
  const hasToken = getToken()

  if (hasToken) {
    if (to.path === '/login') {
      // if is logged in, redirect to the home page
      next({ path: '/' })
      NProgress.done()
    } else {
      const hasGetUserInfo = store.getters.name
      if (hasGetUserInfo) {
        // 用户信息已存在，确保会话管理器已启动
        // 已禁用前端会话超时管理，完全依赖后端Token过期机制
        // if (!sessionManager.isActive) {
        //   sessionManager.init()
        // }

        // 字典数据采用按需加载策略：
        // 每个模块在自己的页面中通过 mixin 或 created 钩子加载所需字典
        // 不再在全局路由守卫中预加载，避免不必要的请求

        // 检查是否已经生成动态路由，并且角色没有变化
        const hasRoutes = store.getters.routesGenerated
        const currentRoles = store.getters.roles
        const lastRoles = store.getters.lastRoles
        const rolesChanged = JSON.stringify(currentRoles) !== JSON.stringify(lastRoles)

        if (hasRoutes && !rolesChanged) {
          next()
        } else {
          try {
            // 根据用户角色重新生成路由
            const { roles } = store.getters
            const accessRoutes = await store.dispatch('permission/generateRoutes', roles)
            // 兼容Vue Router 3.x的addRoutes方法
            if (router.addRoutes) {
              router.addRoutes(accessRoutes)
            } else {
              // Vue Router 4.x使用addRoute方法
              accessRoutes.forEach(route => {
                router.addRoute(route)
              })
            }
            next({ ...to, replace: true })
          } catch (error) {
            // ✅ 静默处理：路由生成失败，不弹出错误提示
            console.error('❌ 路由生成失败:', error)
            await store.dispatch('user/resetToken')

            // 不再显示错误提示，静默跳转
            // Message.error('路由生成失败，请重新登录')

            next(`/login?redirect=${to.path}`)
            NProgress.done()
          }
        }
      } else {
        try {
          // get user info
          await store.dispatch('user/getInfo')

          // 根据用户角色生成可访问的路由
          const { roles } = store.getters
          const accessRoutes = await store.dispatch('permission/generateRoutes', roles)

          // 动态添加可访问路由
          // 兼容Vue Router 3.x的addRoutes方法
          if (router.addRoutes) {
            router.addRoutes(accessRoutes)
          } else {
            // Vue Router 4.x使用addRoute方法
            accessRoutes.forEach(route => {
              router.addRoute(route)
            })
          }

          // 获取用户信息成功后启动会话管理器
          sessionManager.init()

          // 字典数据在用户信息获取成功后会在上面的逻辑中加载，这里不重复调用

          // hack method to ensure that addRoutes is complete
          // set the replace: true, so the navigation will not leave a history record
          next({ ...to, replace: true })
        } catch (error) {
          // ✅ 静默处理：移除 token 并跳转登录页，不弹出错误提示
          console.error('❌ 获取用户信息失败:', error)
          await store.dispatch('user/resetToken')

          // 不再显示错误提示，静默跳转
          // Message.error(error || 'Has Error')

          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      }
    }
  } else {
    /* has no token*/

    if (whiteList.indexOf(to.path) !== -1) {
      // in the free login whitelist, go directly
      next()
    } else {
      // other pages that do not have permission to access are redirected to the login page.
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})
