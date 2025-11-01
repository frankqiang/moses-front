# 🚀 API 请求模块 - 模块化架构

## 📂 架构说明

```
src/utils/request.js          ← 统一入口（项目中使用这个）
    ↓ 使用模块化拦截器
src/utils/api/
    ├── interceptors/         ← 请求和响应拦截器
    ├── errorHandler.js       ← 错误处理核心逻辑
    └── errorTypes.js         ← 错误类型判断
```

**重要**：项目中统一使用 `import service from '@/utils/request'`，不要引入其他路径。

## 📋 核心理念

```
拦截器：只处理必须处理的错误（网络、认证、系统错误）
业务层：直接显示后端返回的错误消息，无需复杂判断
```

## 🎯 职责划分

### 拦截器自动处理（静默或轻量级提示）

| 错误类型               | 处理方式              |
| ---------------------- | --------------------- |
| 网络错误（超时、断网） | ✅ 显示通用提示        |
| 认证失效（需要重新登录）| ✅ 自动跳转登录页      |
| Token过期              | ✅ 自动刷新Token       |
| 系统错误（5xx）        | ✅ 显示通用提示        |

### 业务层处理（直接显示后端消息）

**所有其他错误**：验证错误、业务错误、权限错误等

```javascript
catch (error) {
  // 拦截器已处理的不需要再显示
  if (!error.handledByInterceptor) {
    this.$message.error(error.message)  // 直接显示后端消息
  }
}
```

## 🔧 使用方法

### 最简单的用法（95%场景）

```javascript
import service from '@/utils/request'

async function createUser(userData) {
  try {
    const res = await service.post('/v1/users', userData)
    this.$message.success(res.message)
    return res.data
  } catch (error) {
    // 拦截器已处理的不显示，其他直接显示错误消息
    if (!error.handledByInterceptor) {
      this.$message.error(error.message)
    }
  }
}
```

### 使用Mixin（推荐）

```javascript
import service from '@/utils/request'
import errorMixin from '@/mixins/errorMixin'

export default {
  mixins: [errorMixin],

  methods: {
    async handleSubmit() {
      try {
        const res = await service.post('/v1/users', this.formData)
        this.$message.success(res.message)
      } catch (error) {
        this.handleError(error)  // 就这一行！
      }
    }
  }
}
```

### 自定义特定错误码处理（5%场景）

```javascript
import service from '@/utils/request'
import errorMixin from '@/mixins/errorMixin'

export default {
  mixins: [errorMixin],

  methods: {
    async handleSubmit() {
      try {
        const res = await service.post('/v1/users', this.formData)
        this.$message.success(res.message)
      } catch (error) {
        this.handleError(error, {
          // 只对特殊错误码自定义处理
          'USER_EMAIL_ALREADY_EXISTS': () => {
            this.$message.error('邮箱已存在，请更换')
            this.focusField('email')
          }
        })
      }
    }
  }
}
```

## 📊 错误对象结构

```javascript
{
  code: 'USER_001',              // 后端返回的错误码
  message: '用户不存在',          // 后端返回的中文错误消息（直接显示即可）
  status: 404,                   // HTTP状态码
  details: {                     // 错误详情
    field: 'userId',
    requestId: 'req-xxx'
  },
  handledByInterceptor: false    // 是否已被拦截器处理
}
```

## 🎨 后端错误码规范（仅供参考）

| 前缀  | 说明       | 拦截器处理 | 业务层处理 |
| ----- | ---------- | --------- | --------- |
| AUTH_ | 认证相关   | ✅ 部分   | ❌ 部分   |
| VAL_  | 验证相关   | ❌        | ✅        |
| SYS_  | 系统错误   | ✅        | ❌        |
| BIZ_  | 业务错误   | ❌        | ✅        |
| USER_ | 用户管理   | ❌        | ✅        |
| MDM_  | 主数据管理 | ❌        | ✅        |
| PROD_ | 生产管理   | ❌        | ✅        |

**重点**：业务层不需要判断错误码前缀，直接显示 `error.message` 即可！

## ⚡ 优势

1. **简单**：业务层只需要 `this.handleError(error)` 一行代码
2. **灵活**：需要自定义处理时才传入自定义处理器
3. **一致**：所有错误消息来自后端，前后端一致
4. **清晰**：拦截器职责明确，只处理3类错误

## 📝 最佳实践

### ✅ 推荐

```javascript
// 1. 使用 errorMixin
catch (error) {
  this.handleError(error)
}

// 2. 直接显示后端消息
catch (error) {
  if (!error.handledByInterceptor) {
    this.$message.error(error.message)
  }
}
```

### ❌ 不推荐

```javascript
// 不要硬编码前端错误消息
catch (error) {
  this.$message.error('操作失败，请重试')  // ❌ 不要这样
}

// 不要重复判断各种错误码前缀
catch (error) {
  if (error.code.startsWith('VAL_')) { ... }  // ❌ 太复杂
  else if (error.code.startsWith('BIZ_')) { ... }
  // ...
}
```

## 📚 相关文档

- [迁移指南](./MIGRATION_GUIDE.md)
- [错误类型定义](./errorTypes.js)
- [错误处理器](./errorHandler.js)
- [业务层Mixin](../mixins/errorMixin.js)
