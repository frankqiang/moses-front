# 🔄 API请求模块迁移指南（简化版）

## 为什么要迁移？

| 问题           | 旧版本                   | 新版本（简化版）   |
| -------------- | ------------------------ | ------------------ |
| 错误重复提示   | ❌ 拦截器 + 业务层都显示  | ✅ 职责清晰，不重复 |
| 业务层代码复杂 | ❌ 需要判断各种错误码前缀 | ✅ 一行代码搞定     |
| 错误消息不一致 | ❌ 前后端各自维护错误消息 | ✅ 统一使用后端消息 |

## 🚀 迁移步骤（3步）

### 步骤1：引入errorMixin

```javascript
// Before（旧版本）
import service from '@/utils/request'

// After（新版本 - 添加errorMixin）
import service from '@/utils/request'
import errorMixin from '@/mixins/errorMixin'
```

### 步骤2：引入errorMixin

```javascript
export default {
  mixins: [errorMixin],  // 添加这一行

  // ...
}
```

### 步骤3：简化错误处理

```javascript
// Before（旧版本）
async handleSubmit() {
  try {
    await service.post('/v1/users', this.formData)
    this.$message.success('创建成功')
  } catch (error) {
    // 错误已经被拦截器显示过了
    // 或者需要复杂的判断各种错误码
  }
}

// After（新版本）
async handleSubmit() {
  try {
    const res = await service.post('/v1/users', this.formData)
    this.$message.success(res.message)
  } catch (error) {
    this.handleError(error)  // 就这一行！
  }
}
```

## 📋 迁移对照表

### 普通请求

```javascript
// Before
try {
  const res = await service.get('/v1/users')
  this.list = res.data
} catch (error) {
  // 通常为空或重复处理
}

// After
try {
  const res = await service.get('/v1/users')
  this.list = res.data
} catch (error) {
  this.handleError(error)
}
```

### 表单提交

```javascript
// Before
try {
  await service.post('/v1/users', this.formData)
  this.$message.success('创建成功')
} catch (error) {
  // 空的或复杂的错误码判断
}

// After
try {
  const res = await service.post('/v1/users', this.formData)
  this.$message.success(res.message)
} catch (error) {
  this.handleError(error)
}
```

### 需要自定义错误处理

```javascript
// Before
try {
  await service.post('/v1/users', this.formData)
} catch (error) {
  if (error.code === 'USER_EMAIL_ALREADY_EXISTS') {
    this.$message.error('邮箱已存在')
  } else if (error.code?.startsWith('VAL_')) {
    // 验证错误处理
  }
  // ...更多判断
}

// After
try {
  const res = await service.post('/v1/users', this.formData)
} catch (error) {
  this.handleError(error, {
    'USER_EMAIL_ALREADY_EXISTS': () => {
      this.$message.error('邮箱已存在')
      this.focusField('email')
    }
  })
}
```

## 🎯 完整示例

### Before（旧版本）

```javascript
import service from '@/request'

export default {
  data() {
    return {
      formData: {},
      loading: false
    }
  },

  methods: {
    async handleSubmit() {
      this.loading = true
      try {
        await service.post('/v1/users', this.formData)
        this.$message.success('创建成功')
        this.dialogVisible = false
      } catch (error) {
        // 错误已经被拦截器显示过了
        // 或者需要写一堆if-else判断
      } finally {
        this.loading = false
      }
    }
  }
}
```

### After（新版本）

```javascript
import service from '@/utils/request'
import errorMixin from '@/mixins/errorMixin'

export default {
  mixins: [errorMixin],

  data() {
    return {
      formData: {},
      loading: false
    }
  },

  methods: {
    async handleSubmit() {
      this.loading = true
      try {
        const res = await service.post('/v1/users', this.formData)
        this.$message.success(res.message)
        this.dialogVisible = false
      } catch (error) {
        this.handleError(error)  // 就这一行！
      } finally {
        this.loading = false
      }
    }
  }
}
```

## ✅ 迁移检查清单

- [ ] 在组件中引入 `errorMixin`
- [ ] 将 catch 块中的错误处理改为 `this.handleError(error)`
- [ ] 测试验证错误提示是否正常
- [ ] 测试网络错误提示是否正常
- [ ] 测试Token刷新是否正常

## 🐛 常见问题

### Q1: 错误没有显示？

```javascript
// 检查是否被拦截器处理
catch (error) {
  console.log('拦截器已处理:', error.handledByInterceptor)
  this.handleError(error)
}
```

### Q2: 想要静默处理错误？

```javascript
catch (error) {
  // 不调用 handleError，自己处理
  if (error.code === 'USER_NOT_FOUND') {
    // 静默处理
    return
  }
  this.handleError(error)
}
```

### Q3: 想要自定义所有验证错误？

```javascript
// 不需要！直接显示后端消息即可
catch (error) {
  this.handleError(error)  // 后端会返回友好的中文消息
}
```

## 📊 迁移优先级

### 高优先级
- 登录/注册模块
- 表单提交功能
- 核心业务功能

### 中优先级
- 列表查询
- 详情查看

### 低优先级
- 静态页面
- 只读功能

## 🎓 核心原则

1. **简单第一**：业务层只需要 `this.handleError(error)` 一行代码
2. **信任后端**：错误消息由后端提供，前端直接显示
3. **按需定制**：只在必要时才自定义错误处理
4. **职责清晰**：拦截器只处理3类错误（网络、认证、系统）

搞定！就是这么简单 🎉
