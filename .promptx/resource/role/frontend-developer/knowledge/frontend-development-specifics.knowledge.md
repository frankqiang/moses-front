# 前端开发专业知识

## 知识库标识
- **知识ID**: frontend-development-specifics
- **适用角色**: frontend-developer
- **知识类型**: 技术专业知识
- **应用场景**: 前端开发、技术决策、问题解决

## 项目特定约束

### 技术栈约束
- **Vue版本**: Vue 2.6.14 (不支持Vue 3)
- **UI框架**: Element UI 2.15.x
- **构建工具**: Vue CLI 4.x + Webpack 4.x
- **CSS预处理**: SCSS
- **JavaScript标准**: ES6+
- **包管理器**: npm

### 项目结构约束
```
src/
├── assets/        # 静态资源
├── components/    # 公共组件
├── directive/     # 自定义指令
├── icons/         # 图标资源
├── layout/        # 布局组件
├── router/        # 路由配置
├── store/         # Vuex状态管理
├── styles/        # 全局样式
├── utils/         # 工具函数
└── views/         # 页面组件
```

### 代码规范约束
- **ESLint配置**: 基于Vue官方规范
- **命名规范**: 
  - 组件名: PascalCase (如: UserProfile)
  - 文件名: kebab-case (如: user-profile.vue)
  - 变量名: camelCase (如: userName)
  - 常量名: UPPER_SNAKE_CASE (如: API_BASE_URL)

## Vue.js开发特性

### 组件开发规范
```vue
<template>
  <!-- 模板内容 -->
</template>

<script>
export default {
  name: 'ComponentName',
  components: {},
  props: {},
  data() {
    return {}
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {},
  methods: {}
}
</script>

<style lang="scss" scoped>
/* 组件样式 */
</style>
```

### 状态管理模式
- **Vuex Store结构**:
  ```javascript
  // store/modules/example.js
  const state = {}
  const mutations = {}
  const actions = {}
  const getters = {}
  
  export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
  }
  ```

### 路由配置模式
```javascript
// router/index.js
const routes = [
  {
    path: '/example',
    component: Layout,
    redirect: '/example/list',
    name: 'Example',
    meta: { title: '示例模块', icon: 'example' },
    children: [
      {
        path: 'list',
        name: 'ExampleList',
        component: () => import('@/views/example/list'),
        meta: { title: '示例列表', icon: 'list' }
      }
    ]
  }
]
```

## Element UI使用规范

### 组件使用约束
- **表格组件**: 必须使用BaseTable封装组件
- **表单组件**: 优先使用EnhancedForm组件
- **弹窗组件**: 使用DialogForm或DrawerForm
- **按钮组件**: 遵循ActionButtons规范

### 主题定制
```scss
// styles/element-ui.scss
$--color-primary: #409EFF;
$--color-success: #67C23A;
$--color-warning: #E6A23C;
$--color-danger: #F56C6C;
$--color-info: #909399;

// 导入Element UI样式
@import '~element-ui/packages/theme-chalk/src/index';
```

### 响应式设计
```scss
// 断点定义
$mobile: 768px;
$tablet: 992px;
$desktop: 1200px;

// 媒体查询混入
@mixin mobile {
  @media (max-width: #{$mobile - 1px}) {
    @content;
  }
}

@mixin tablet {
  @media (min-width: #{$mobile}) and (max-width: #{$tablet - 1px}) {
    @content;
  }
}

@mixin desktop {
  @media (min-width: #{$desktop}) {
    @content;
  }
}
```

## 管理后台特性

### 权限系统集成
```javascript
// 路由权限检查
router.beforeEach(async(to, from, next) => {
  const hasToken = getToken()
  
  if (hasToken) {
    if (to.path === '/login') {
      next({ path: '/' })
    } else {
      const hasRoles = store.getters.roles && store.getters.roles.length > 0
      if (hasRoles) {
        next()
      } else {
        try {
          const { roles } = await store.dispatch('user/getInfo')
          const accessRoutes = await store.dispatch('permission/generateRoutes', roles)
          router.addRoutes(accessRoutes)
          next({ ...to, replace: true })
        } catch (error) {
          await store.dispatch('user/resetToken')
          next(`/login?redirect=${to.path}`)
        }
      }
    }
  } else {
    if (whiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      next(`/login?redirect=${to.path}`)
    }
  }
})
```

### 数据表格特性
- **分页处理**: 统一使用Pagination组件
- **搜索功能**: 使用SearchForm或SearchFormV2
- **批量操作**: 集成BatchAction组件
- **导入导出**: 使用ImportButton和ExportButton
- **列设置**: 支持ColumnSettings动态配置

### API接口规范
```javascript
// api/example.js
import request from '@/utils/request'

export function getList(params) {
  return request({
    url: '/example/list',
    method: 'get',
    params
  })
}

export function createItem(data) {
  return request({
    url: '/example',
    method: 'post',
    data
  })
}

export function updateItem(id, data) {
  return request({
    url: `/example/${id}`,
    method: 'put',
    data
  })
}

export function deleteItem(id) {
  return request({
    url: `/example/${id}`,
    method: 'delete'
  })
}
```

## 性能优化策略

### 代码分割
```javascript
// 路由懒加载
const Example = () => import('@/views/example/index')

// 组件懒加载
const LazyComponent = () => import('@/components/LazyComponent')
```

### 图片优化
```javascript
// 图片懒加载
<img v-lazy="imageUrl" alt="description">

// 图片压缩
const compressImage = (file, quality = 0.8) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      
      canvas.toBlob(resolve, 'image/jpeg', quality)
    }
    
    img.src = URL.createObjectURL(file)
  })
}
```

### 缓存策略
```javascript
// HTTP缓存
axios.interceptors.request.use(config => {
  if (config.method === 'get' && config.cache) {
    const cacheKey = `${config.url}_${JSON.stringify(config.params)}`
    const cachedData = localStorage.getItem(cacheKey)
    
    if (cachedData) {
      return Promise.resolve(JSON.parse(cachedData))
    }
  }
  
  return config
})

// 组件缓存
<keep-alive :include="cachedViews">
  <router-view :key="key" />
</keep-alive>
```

## 错误处理机制

### 全局错误处理
```javascript
// main.js
Vue.config.errorHandler = (err, vm, info) => {
  console.error('Vue Error:', err)
  console.error('Component:', vm)
  console.error('Info:', info)
  
  // 发送错误报告
  reportError(err, vm, info)
}

// 异步错误处理
window.addEventListener('unhandledrejection', event => {
  console.error('Unhandled Promise Rejection:', event.reason)
  reportError(event.reason)
})
```

### API错误处理
```javascript
// utils/request.js
service.interceptors.response.use(
  response => {
    const res = response.data
    
    if (res.code !== 20000) {
      Message({
        message: res.message || 'Error',
        type: 'error',
        duration: 5 * 1000
      })
      
      return Promise.reject(new Error(res.message || 'Error'))
    } else {
      return res
    }
  },
  error => {
    console.log('err' + error)
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)
```

## 测试策略

### 单元测试
```javascript
// tests/unit/components/Example.spec.js
import { shallowMount } from '@vue/test-utils'
import Example from '@/components/Example.vue'

describe('Example.vue', () => {
  it('renders props.msg when passed', () => {
    const msg = 'new message'
    const wrapper = shallowMount(Example, {
      propsData: { msg }
    })
    expect(wrapper.text()).toMatch(msg)
  })
})
```

### E2E测试
```javascript
// tests/e2e/specs/login.js
describe('Login', () => {
  it('should login successfully', () => {
    cy.visit('/login')
    cy.get('[data-cy=username]').type('admin')
    cy.get('[data-cy=password]').type('password')
    cy.get('[data-cy=login-btn]').click()
    cy.url().should('include', '/dashboard')
  })
})
```

## 部署和构建

### 构建配置
```javascript
// vue.config.js
module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? '/admin/' : '/',
  outputDir: 'dist',
  assetsDir: 'static',
  lintOnSave: process.env.NODE_ENV === 'development',
  productionSourceMap: false,
  
  configureWebpack: {
    resolve: {
      alias: {
        '@': resolve('src')
      }
    }
  },
  
  chainWebpack(config) {
    config.plugins.delete('preload')
    config.plugins.delete('prefetch')
    
    // 代码分割
    config.optimization.splitChunks({
      chunks: 'all',
      cacheGroups: {
        libs: {
          name: 'chunk-libs',
          test: /[\\/]node_modules[\\/]/,
          priority: 10,
          chunks: 'initial'
        },
        elementUI: {
          name: 'chunk-elementUI',
          priority: 20,
          test: /[\\/]node_modules[\\/]_?element-ui(.*)/
        }
      }
    })
  }
}
```

### 环境配置
```bash
# .env.development
ENV = 'development'
VUE_APP_BASE_API = '/dev-api'
VUE_APP_MOCK = true

# .env.production
ENV = 'production'
VUE_APP_BASE_API = '/prod-api'
VUE_APP_MOCK = false
```

---

*此知识库为前端开发工程师提供项目特定的技术约束和专业知识指导*