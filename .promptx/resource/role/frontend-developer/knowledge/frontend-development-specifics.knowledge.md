# 前端开发专业知识

## Vue.js 核心技术

### Vue 2.x 核心概念
```javascript
// 1. 响应式原理
// Vue 2使用Object.defineProperty实现响应式
Object.defineProperty(obj, 'key', {
  get() {
    // 依赖收集
    return value
  },
  set(newVal) {
    // 派发更新
    value = newVal
    notify()
  }
})

// 2. 组件通信
// Props Down, Events Up
export default {
  props: ['message'],
  methods: {
    handleClick() {
      this.$emit('custom-event', data)
    }
  }
}

// 3. 生命周期钩子
export default {
  created() {
    // 实例创建完成，数据观测已完成
  },
  mounted() {
    // DOM挂载完成，可以访问$el
  },
  updated() {
    // 数据更新导致虚拟DOM重新渲染
  },
  destroyed() {
    // 实例销毁，清理工作
  }
}
```

### Vue Router 路由管理
```javascript
// 路由配置
const routes = [
  {
    path: '/user/:id',
    component: User,
    props: true,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'profile',
        component: UserProfile
      }
    ]
  }
]

// 路由守卫
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next('/login')
  } else {
    next()
  }
})

// 编程式导航
this.$router.push({ name: 'user', params: { id: 123 }})
this.$router.replace('/home')
this.$router.go(-1)
```

### Vuex 状态管理
```javascript
// Store结构
const store = new Vuex.Store({
  state: {
    user: null,
    loading: false
  },
  getters: {
    isLoggedIn: state => !!state.user,
    userName: state => state.user?.name || 'Guest'
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    }
  },
  actions: {
    async login({ commit }, credentials) {
      commit('SET_LOADING', true)
      try {
        const user = await api.login(credentials)
        commit('SET_USER', user)
        return user
      } finally {
        commit('SET_LOADING', false)
      }
    }
  },
  modules: {
    user: userModule,
    products: productModule
  }
})

// 组件中使用
import { mapState, mapGetters, mapActions } from 'vuex'

export default {
  computed: {
    ...mapState(['user', 'loading']),
    ...mapGetters(['isLoggedIn', 'userName'])
  },
  methods: {
    ...mapActions(['login', 'logout'])
  }
}
```

## Element UI 组件库

### 常用组件使用
```vue
<template>
  <!-- 表格组件 -->
  <el-table
    :data="tableData"
    v-loading="loading"
    @selection-change="handleSelectionChange"
  >
    <el-table-column type="selection" width="55" />
    <el-table-column prop="name" label="姓名" sortable />
    <el-table-column prop="email" label="邮箱" />
    <el-table-column label="操作" width="180">
      <template slot-scope="scope">
        <el-button size="mini" @click="handleEdit(scope.row)">编辑</el-button>
        <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
      </template>
    </el-table-column>
  </el-table>

  <!-- 分页组件 -->
  <el-pagination
    @size-change="handleSizeChange"
    @current-change="handleCurrentChange"
    :current-page="currentPage"
    :page-sizes="[10, 20, 50, 100]"
    :page-size="pageSize"
    layout="total, sizes, prev, pager, next, jumper"
    :total="total"
  />

  <!-- 表单组件 -->
  <el-form :model="form" :rules="rules" ref="form">
    <el-form-item label="用户名" prop="username">
      <el-input v-model="form.username" />
    </el-form-item>
    <el-form-item label="邮箱" prop="email">
      <el-input v-model="form.email" type="email" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="submitForm">提交</el-button>
      <el-button @click="resetForm">重置</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  data() {
    return {
      form: {
        username: '',
        email: ''
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          // 提交表单
        }
      })
    }
  }
}
</script>
```

## JavaScript 高级特性

### ES6+ 语法
```javascript
// 1. 解构赋值
const { name, age, ...rest } = user
const [first, second, ...others] = array

// 2. 箭头函数
const add = (a, b) => a + b
const users = data.map(item => ({ ...item, processed: true }))

// 3. Promise 和 async/await
async function fetchData() {
  try {
    const response = await fetch('/api/data')
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error:', error)
    throw error
  }
}

// 4. 模块化
// 导出
export default class User {}
export { helper, utils }

// 导入
import User from './User'
import { helper, utils } from './utils'
import * as API from './api'

// 5. 类和继承
class Component {
  constructor(props) {
    this.props = props
  }
  
  render() {
    // 渲染逻辑
  }
}

class Button extends Component {
  handleClick = () => {
    this.props.onClick?.()
  }
}
```

### 函数式编程
```javascript
// 高阶函数
const withLoading = (fn) => {
  return async (...args) => {
    setLoading(true)
    try {
      return await fn(...args)
    } finally {
      setLoading(false)
    }
  }
}

// 柯里化
const curry = (fn) => {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args)
    }
    return (...nextArgs) => curried(...args, ...nextArgs)
  }
}

// 组合函数
const compose = (...fns) => (value) => fns.reduceRight((acc, fn) => fn(acc), value)
const pipe = (...fns) => (value) => fns.reduce((acc, fn) => fn(acc), value)
```

## CSS 和样式处理

### CSS 预处理器 (Sass/Less)
```scss
// 变量定义
$primary-color: #409eff;
$border-radius: 4px;
$font-size-base: 14px;

// 混合器
@mixin button-style($bg-color, $text-color: #fff) {
  background-color: $bg-color;
  color: $text-color;
  border-radius: $border-radius;
  padding: 8px 16px;
  border: none;
  cursor: pointer;
  
  &:hover {
    background-color: darken($bg-color, 10%);
  }
}

// 嵌套规则
.user-card {
  border: 1px solid #ddd;
  border-radius: $border-radius;
  
  .header {
    padding: 16px;
    border-bottom: 1px solid #eee;
    
    .title {
      font-size: 18px;
      font-weight: bold;
    }
  }
  
  .content {
    padding: 16px;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .user-card {
    margin: 8px;
    
    .header {
      padding: 12px;
    }
  }
}
```

### CSS-in-JS 和 CSS Modules
```javascript
// CSS Modules
import styles from './Button.module.css'

const Button = ({ children, type = 'default' }) => {
  return (
    <button className={`${styles.button} ${styles[type]}`}>
      {children}
    </button>
  )
}

// Styled Components (如果使用)
const StyledButton = styled.button`
  background-color: ${props => props.primary ? '#007bff' : '#6c757d'};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  
  &:hover {
    opacity: 0.8;
  }
`
```

## 构建工具和工程化

### Webpack 配置
```javascript
// webpack.config.js
module.exports = {
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        type: 'asset/resource'
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({
      template: './public/index.html'
    })
  ],
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  }
}
```

### Vite 配置
```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'vuex'],
          ui: ['element-ui']
        }
      }
    }
  }
})
```

## 性能优化技术

### 代码分割和懒加载
```javascript
// 路由懒加载
const routes = [
  {
    path: '/user',
    component: () => import('@/views/User.vue')
  },
  {
    path: '/admin',
    component: () => import(/* webpackChunkName: "admin" */ '@/views/Admin.vue')
  }
]

// 组件懒加载
export default {
  components: {
    HeavyComponent: () => import('@/components/HeavyComponent.vue')
  }
}

// 动态导入
async function loadModule() {
  const { default: utils } = await import('@/utils/heavy-utils.js')
  return utils
}
```

### 虚拟滚动
```vue
<template>
  <div class="virtual-list" @scroll="handleScroll">
    <div class="list-phantom" :style="{ height: totalHeight + 'px' }"></div>
    <div class="list-container" :style="{ transform: `translateY(${offset}px)` }">
      <div
        v-for="item in visibleItems"
        :key="item.id"
        class="list-item"
        :style="{ height: itemHeight + 'px' }"
      >
        {{ item.content }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    items: Array,
    itemHeight: { type: Number, default: 50 },
    containerHeight: { type: Number, default: 300 }
  },
  data() {
    return {
      scrollTop: 0
    }
  },
  computed: {
    totalHeight() {
      return this.items.length * this.itemHeight
    },
    visibleCount() {
      return Math.ceil(this.containerHeight / this.itemHeight)
    },
    startIndex() {
      return Math.floor(this.scrollTop / this.itemHeight)
    },
    endIndex() {
      return Math.min(this.startIndex + this.visibleCount, this.items.length)
    },
    visibleItems() {
      return this.items.slice(this.startIndex, this.endIndex)
    },
    offset() {
      return this.startIndex * this.itemHeight
    }
  },
  methods: {
    handleScroll(e) {
      this.scrollTop = e.target.scrollTop
    }
  }
}
</script>
```

## 测试技术

### 单元测试 (Jest + Vue Test Utils)
```javascript
// Button.spec.js
import { shallowMount } from '@vue/test-utils'
import Button from '@/components/Button.vue'

describe('Button.vue', () => {
  it('renders props.msg when passed', () => {
    const msg = 'Click me'
    const wrapper = shallowMount(Button, {
      propsData: { msg }
    })
    expect(wrapper.text()).toMatch(msg)
  })

  it('emits click event when clicked', async () => {
    const wrapper = shallowMount(Button)
    await wrapper.trigger('click')
    expect(wrapper.emitted().click).toBeTruthy()
  })

  it('applies correct class based on type prop', () => {
    const wrapper = shallowMount(Button, {
      propsData: { type: 'primary' }
    })
    expect(wrapper.classes()).toContain('btn-primary')
  })
})
```

### E2E测试 (Cypress)
```javascript
// cypress/integration/user-flow.spec.js
describe('User Management', () => {
  beforeEach(() => {
    cy.visit('/users')
  })

  it('should display user list', () => {
    cy.get('[data-cy=user-table]').should('be.visible')
    cy.get('[data-cy=user-row]').should('have.length.greaterThan', 0)
  })

  it('should create new user', () => {
    cy.get('[data-cy=add-user-btn]').click()
    cy.get('[data-cy=user-form]').should('be.visible')
    
    cy.get('[data-cy=username-input]').type('testuser')
    cy.get('[data-cy=email-input]').type('test@example.com')
    cy.get('[data-cy=submit-btn]').click()
    
    cy.get('[data-cy=success-message]').should('contain', '用户创建成功')
  })
})
```