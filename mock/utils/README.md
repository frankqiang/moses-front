# Mock API 响应工具最佳实践

## 概述

本文档提供了Mock API响应函数的最佳实践指南，旨在解决项目中响应函数重复定义的问题，并建立统一的响应格式标准。

## 问题分析

### 当前存在的问题

1. **重复定义**：在多个mock文件中重复定义了`success`和`error`函数
   - `mock/master-data/process-management/operations/index.js`
   - `mock/master-data/process-management/routing/index.js`

2. **响应格式不统一**：项目中存在两种不同的响应格式
   - **新格式**（推荐）：`{ success: boolean, data: any, message: string, timestamp: string, status: number }`
   - **旧格式**：`{ code: number, data: any, message?: string }`

3. **维护困难**：响应函数分散在各个文件中，难以统一维护和更新

## 快速开始

### 基本使用

统一的工具函数现在通过 `mock/utils/index.js` 导出，包含所有响应工具和参数解析功能：

```javascript
// 导入所有工具函数
const { success, error, errors, paginated, batch, ERROR_CODES } = require('../utils/response')
const { param2Obj } = require('../utils/index')

// 或者按需导入
const { success, error, ERROR_CODES } = require('../utils/response')
const { param2Obj } = require('../utils/index')
```

### 2. 响应格式标准化

#### 推荐格式（新项目或重构时使用）

```javascript
// 成功响应
{
  success: true,
  data: any,
  message: string,
  timestamp: string,
  status: number
}

// 错误响应
{
  success: false,
  error: {
    code: string,
    message: string,
    details?: any
  },
  timestamp: string,
  status: number
}
```

#### 兼容格式（现有项目保持兼容）

```javascript
// 成功响应
{
  code: 20000,
  data: any,
  message?: string
}

// 错误响应
{
  code: number, // 非20000
  message: string,
  data?: any
}
```

### 3. 迁移策略

#### 阶段一：新模块使用统一工具
- 所有新创建的mock文件必须使用 `mock/utils/response.js`
- 已迁移的模块：
  - ✅ `process-management/operations`
  - ✅ `process-management/routing`

#### 阶段二：逐步迁移现有模块
- 待迁移的模块：
  - 🔄 `storage-location.js` - 使用旧格式
  - 🔄 `equipment.js` - 使用旧格式
  - 🔄 其他master-data模块

#### 阶段三：前端适配
- 更新前端请求拦截器以支持两种响应格式
- 逐步将前端代码迁移到新格式

## 使用指南

### 基本用法

```javascript
const { success, error, errors, ERROR_CODES } = require('../../utils/response')

// 成功响应
return success(data, '操作成功')

// 错误响应
return error(ERROR_CODES.VALIDATION_ERROR, '参数验证失败', 400)

// 使用预定义错误
return errors.notFound('工序', id)
return errors.duplicate('工序代码', code)
```

### 分页响应

```javascript
const { paginated } = require('../../utils/response')

return paginated(items, total, page, limit, '获取成功')
```

### 批量操作响应

```javascript
const { batch } = require('../../utils/response')

return batch(successIds, failedIds, '删除')
```

## 代码规范

### 1. 导入规范

```javascript
// ✅ 推荐：按需导入
const { success, error, errors, ERROR_CODES } = require('../../utils/response')

// ❌ 避免：全量导入
const response = require('../../utils/response')
```

### 2. 错误处理规范

```javascript
// ✅ 推荐：使用预定义错误
return errors.notFound('工序', id)
return errors.validation('工序代码不能为空')
return errors.duplicate('工序代码', code)

// ✅ 可接受：自定义错误
return error(ERROR_CODES.BUSINESS_ERROR, '自定义错误信息', 400)

// ❌ 避免：硬编码错误
return { success: false, error: { code: 'ERROR', message: '错误' } }
```

### 3. 状态码规范

- `200` - 成功
- `201` - 创建成功
- `204` - 删除成功（无内容）
- `400` - 客户端错误（验证失败、参数错误等）
- `401` - 未授权
- `403` - 禁止访问
- `404` - 资源不存在
- `409` - 冲突（如重复数据）
- `500` - 服务器内部错误

## 兼容性处理

### 前端请求拦截器示例

```javascript
// 响应拦截器 - 处理两种格式
response => {
  const res = response.data
  
  // 新格式
  if (typeof res.success === 'boolean') {
    if (res.success) {
      return res
    } else {
      return Promise.reject(res.error)
    }
  }
  
  // 旧格式兼容
  if (res.code === 20000) {
    return {
      success: true,
      data: res.data,
      message: res.message || '操作成功'
    }
  } else {
    return Promise.reject({
      code: res.code,
      message: res.message || '操作失败'
    })
  }
}
```

## 最佳实践总结

1. **统一工具**：所有新mock文件必须使用 `mock/utils/index.js`
2. **格式一致**：同一个项目内保持响应格式一致
3. **错误标准化**：使用预定义的错误类型和状态码
4. **渐进迁移**：对现有代码采用渐进式迁移策略
5. **文档维护**：及时更新API文档和响应格式说明

## 检查清单

在创建或修改mock文件时，请确认：

- [ ] 是否导入了统一的响应工具函数
- [ ] 是否使用了标准的响应格式
- [ ] 是否使用了合适的HTTP状态码
- [ ] 是否使用了预定义的错误类型
- [ ] 是否添加了适当的错误详情
- [ ] 是否考虑了前端的兼容性

通过遵循这些最佳实践，我们可以确保Mock API的一致性、可维护性和可扩展性。