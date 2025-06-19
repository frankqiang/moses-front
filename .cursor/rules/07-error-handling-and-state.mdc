---
description: 
globs: 
alwaysApply: true
---
# 错误处理、状态管理与工具函数

## 规则说明与适用范围
本规则定义了错误处理模式、消息提示规范、状态管理最佳实践和工具函数开发标准。所有业务逻辑处理都需遵循此规范。

## 错误处理与消息提示

### 现代化错误处理模式
基于[src/utils/request.js](mdc:src/utils/request.js)，项目采用分层错误处理：

#### 标准错误处理模式
```javascript
import { ApiError } from '@/utils/request'

async submitForm() {
  try {
    this.loading = true
    await this.$refs.form.validate()
    const res = await api.create(this.form)
    this.$message.success(res.message || '创建成功')
    this.dialogVisible = false
    this.$emit('refresh')
  } catch (error) {
    if (error === false) {
      this.$message.warning('请检查表单填写是否正确')
    } else if (error instanceof ApiError) {
      this.handleApiError(error)
    } else {
      this.$message.error('操作失败，请稍后重试')
    }
  } finally {
    this.loading = false
  }
}

// 标准化API错误处理方法
handleApiError(error) {
  switch(error.code) {
    case 'VALIDATION_ERROR':
      this.$message.warning(`数据验证失败: ${error.message}`)
      break
    case 'PERMISSION_DENIED':
      this.$message.error('权限不足')
      this.$router.push('/403')
      break
    case 'RESOURCE_EXISTS':
      this.$message.error('资源已存在')
      break
    default:
      this.$message.error(error.message || '操作失败')
  }
}
```

### 消息提示规范

#### 基本原则
- **一致性**: 全系统保持统一的消息提示方式
- **精确性**: 消息内容应准确传达操作结果
- **层次性**: 区分不同级别的消息（成功、警告、错误等）
- **简洁性**: 消息内容应简明扼要

#### 消息类型与使用场景
1. **成功消息(`success`)**: 数据创建/更新/删除成功，批量操作完成
2. **警告消息(`warning`)**: 数据验证失败，操作可能导致不可恢复的结果
3. **错误消息(`error`)**: API请求失败，系统异常或网络错误
4. **信息消息(`info`)**: 操作状态通知，中性提示信息

#### 分层错误处理设计

**🔐 全局处理层（request.js中自动处理）**：
- 网络错误：连接失败、超时 → 自动显示通用错误提示
- 认证错误：token过期、未授权 → 自动弹出重新登录对话框
- 格式转换：业务错误 → 转换为ApiError对象传递给业务组件

**🎯 业务处理层（组件中必须处理）**：
- 业务逻辑错误：用户不存在、权限不足、数据验证失败
- 用户界面反馈：根据错误类型显示具体提示信息
- 业务流程控制：执行错误对应的业务逻辑（如跳转、重试等）

## 状态管理

### Vuex模块设计
1. **模块化设计**: 按功能模块划分store，使用命名空间避免命名冲突
2. **状态更新原则**: 只在mutations中修改state，actions处理异步操作
3. **错误状态管理**: 在store中统一管理全局错误状态

### 状态管理最佳实践

#### 模块化状态管理
```javascript
// store/modules/example.js
import { ApiError } from '@/utils/request'

const state = {
  list: [],
  loading: false,
  error: null
}

const mutations = {
  SET_LIST(state, list) { state.list = list },
  SET_LOADING(state, loading) { state.loading = loading },
  SET_ERROR(state, error) { state.error = error },
  CLEAR_ERROR(state) { state.error = null }
}

const actions = {
  async fetchList({ commit }, params) {
    commit('SET_LOADING', true)
    commit('CLEAR_ERROR')
    try {
      const response = await api.getList(params)
      commit('SET_LIST', response.data.items || response.data)
    } catch (error) {
      commit('SET_ERROR', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  }
}

const getters = {
  isLoading: state => state.loading,
  hasError: state => !!state.error,
  errorMessage: state => state.error?.message || ''
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
```

## 工具函数开发

### 工具函数设计原则
- **单一职责**: 每个工具函数只做一件事
- **参数校验**: 函数开头验证参数有效性
- **纯函数优先**: 尽量使用纯函数，减少副作用
- **文档完善**: 详细的JSDoc注释

### 推荐第三方库
优先使用成熟的第三方库：

```javascript
// ✅ 推荐：使用成熟的第三方库
import { debounce, throttle } from 'lodash-es'
import dayjs from 'dayjs'

// ❌ 避免：自实现已有的工具函数
```

### 示例：防抖函数使用
```javascript
import { debounce } from 'lodash-es'

export default {
  created() {
    this.debouncedSearch = debounce(this.handleSearch, 300)
  },
  methods: {
    handleSearch() {
      // 搜索逻辑
    }
  }
}
```

## 常量管理

### 常量定义标准
```javascript
// constants/master-data.js
export const STATUS = {
  ENABLED: 'enabled',
  DISABLED: 'disabled',
  PENDING: 'pending'
}

export const STATUS_TEXT = {
  [STATUS.ENABLED]: '启用',
  [STATUS.DISABLED]: '禁用',
  [STATUS.PENDING]: '待审核'
}

export const API_ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  RESOURCE_EXISTS: 'RESOURCE_EXISTS'
}
```



## 数据加载模式

### 标准数据加载流程
```javascript
export default {
  data() {
    return {
      loading: false,
      list: [],
      total: 0,
      listQuery: { page: 1, limit: 10 }
    }
  },
  
  created() {
    this.debouncedGetList = debounce(this.getList, 300)
    this.getList()
  },
  
  methods: {
    async getList() {
      try {
        this.loading = true
        const res = await api.getList(this.listQuery)
        this.list = res.data.items
        this.total = res.data.total
      } catch (error) {
        if (error instanceof ApiError) {
          this.handleApiError(error)
        } else {
          this.$message.error('获取数据失败，请稍后重试')
        }
      } finally {
        this.loading = false
      }
    },
    
    handleSearch() {
      this.listQuery.page = 1
      this.debouncedGetList()
    }
  }
}
```

## 最佳实践检查清单

### ✅ 错误处理检查清单
- [ ] 使用ApiError类进行错误类型判断
- [ ] 实现统一的handleApiError方法
- [ ] 区分表单验证错误、API错误和网络错误
- [ ] 使用常量管理错误码和错误消息

### ✅ 组件开发规范
- [ ] 数据加载使用防抖保护
- [ ] 错误处理覆盖所有异步操作
- [ ] 状态管理遵循模块化设计
- [ ] 常量和工具函数统一管理
- [ ] 优先使用第三方库而非自实现工具函数
