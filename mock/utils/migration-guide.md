# Mock API 响应格式迁移指南

## 迁移概述

本指南帮助开发者将现有的Mock API从旧的响应格式迁移到新的统一响应格式。

## 迁移前后对比

### 旧格式（需要迁移）

```javascript
// 文件内部定义响应函数
const success = (data, message = '操作成功') => ({
  success: true,
  data,
  message,
  timestamp: new Date().toISOString()
})

const error = (code, message, status = 500) => ({
  success: false,
  error: { code, message },
  timestamp: new Date().toISOString()
})

// 或者使用code格式
return {
  code: 20000,
  data: result,
  message: '操作成功'
}
```

### 新格式（推荐）

```javascript
// 导入统一工具函数
const { success, error, errors } = require('../../utils/index')

// 使用统一函数
return success(result, '操作成功')
return errors.notFound('资源', id)
```

## 逐步迁移步骤

### 步骤1：删除本地响应函数定义

```diff
- // 响应工具函数
- const success = (data, message = '操作成功', status = 200) => ({
-   success: true,
-   data,
-   message,
-   timestamp: new Date().toISOString(),
-   status
- })
- 
- const error = (code, message, status = 500, details = null) => ({
-   success: false,
-   error: {
-     code,
-     message,
-     details
-   },
-   timestamp: new Date().toISOString(),
-   status
- })
```

### 步骤2：导入统一工具函数

```diff
+ // 引入统一的响应工具函数
+ const { success, error, errors, ERROR_CODES } = require('../../utils/response')
```

### 步骤3：更新响应调用

#### 成功响应迁移

```diff
// 基本成功响应
- return success(data, '操作成功')
+ return success(data, '操作成功')

// 创建成功响应
- return success(newItem, '创建成功', 201)
+ return success(newItem, '创建成功', 201)

// 删除成功响应
- return success(null, '删除成功', 204)
+ return success(null, '删除成功', 204)
```

#### 错误响应迁移

```diff
// 基本错误响应
- return error('VALIDATION_ERROR', '参数验证失败', 400)
+ return error(ERROR_CODES.VALIDATION_ERROR, '参数验证失败', 400)

// 使用预定义错误（推荐）
- return error('NOT_FOUND', `ID为${id}的资源未找到`, 404)
+ return errors.notFound('资源', id)

- return error('DUPLICATE_ERROR', `代码${code}已存在`, 409)
+ return errors.duplicate('代码', code)

- return error('VALIDATION_ERROR', '参数验证失败', 400)
+ return errors.validation('参数验证失败')
```

#### 分页响应迁移

```diff
- return success({
-   items,
-   total,
-   page: pageNum,
-   limit: limitNum
- })
+ return paginated(items, total, pageNum, limitNum)
```

#### 批量操作响应迁移

```diff
- return success({
-   successIds,
-   failedIds,
-   successCount: successIds.length,
-   failedCount: failedIds.length
- }, `操作完成：成功${successIds.length}条，失败${failedIds.length}条`)
+ return batch(successIds, failedIds, '操作')
```

## 特殊情况处理

### 1. code格式的响应迁移

如果现有代码使用code格式：

```diff
// 旧格式
- return {
-   code: 20000,
-   data: result,
-   message: '操作成功'
- }

// 新格式
+ return success(result, '操作成功')
```

```diff
// 旧格式错误
- return {
-   code: 50000,
-   message: '操作失败'
- }

// 新格式
+ return error(ERROR_CODES.INTERNAL_ERROR, '操作失败', 500)
```

### 2. 复杂错误详情迁移

```diff
// 旧格式
- return error('OPERATIONS_IN_USE', `有${cannotDeleteIds.length}个工序正在使用中，无法删除`, 400, {
-   cannotDeleteIds
- })

// 新格式（使用ERROR_CODES常量）
+ return error(ERROR_CODES.RESOURCE_IN_USE, `有${cannotDeleteIds.length}个工序正在使用中，无法删除`, 400, {
+   cannotDeleteIds
+ })
```

### 3. 时间戳格式统一

新的响应工具函数统一使用ISO格式的时间戳：

```diff
- timestamp: new Date().getTime()  // 数字时间戳
+ timestamp: new Date().toISOString()  // ISO字符串格式
```

## 验证迁移结果

### 1. 检查导入

确保文件顶部正确导入了响应工具函数：

```javascript
const { success, error, errors } = require('../../utils/index')
```

### 2. 检查响应格式

确保所有响应都使用统一格式：

```javascript
// ✅ 正确
return success(data, '操作成功')
return errors.notFound('资源', id)

// ❌ 错误
return { code: 20000, data: data }
return { success: false, message: '错误' }
```

### 3. 测试API响应

使用Postman或前端应用测试迁移后的API，确保：
- 响应格式正确
- 错误处理正常
- 状态码合适

## 常见问题

### Q: 迁移后前端报错怎么办？

A: 确保前端的请求拦截器支持新的响应格式，参考 `README.md` 中的兼容性处理部分。

### Q: 可以部分迁移吗？

A: 可以，但建议一个模块完整迁移，避免同一模块内格式不一致。

### Q: 旧格式的mock文件需要立即迁移吗？

A: 不需要，可以采用渐进式迁移。新功能使用新格式，旧功能在维护时逐步迁移。

### Q: 如何确保团队成员都使用新格式？

A: 建议在代码审查时检查，并在团队内分享这份迁移指南。

## 迁移检查清单

完成迁移后，请检查：

- [ ] 删除了本地的响应函数定义
- [ ] 正确导入了统一的响应工具函数
- [ ] 所有成功响应使用 `success()` 函数
- [ ] 所有错误响应使用 `error()` 或 `errors.*` 函数
- [ ] 分页响应使用 `paginated()` 函数
- [ ] 批量操作使用 `batch()` 函数
- [ ] 时间戳格式统一为ISO字符串
- [ ] 测试了API的正常和异常情况
- [ ] 前端兼容性正常

通过遵循这个迁移指南，可以确保平滑地将现有Mock API迁移到新的统一响应格式。