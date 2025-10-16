# 维护计划管理 - 错误处理和消息提示工具

## 概述

本目录包含维护计划管理模块专用的错误处理和消息提示工具，提供统一的API错误处理、表单验证错误处理和用户友好的消息提示功能。

## 文件结构

```
utils/
├── errorHandler.js      # 错误处理工具类
├── messageHandler.js    # 消息提示工具类
├── formatter.js         # 数据格式化工具函数
├── index.js            # 统一导出入口
└── README.md           # 使用说明文档
```

## 核心功能

### 1. 错误处理 (errorHandler.js)

#### 主要功能
- 统一处理API错误响应
- 优先使用后端返回的错误消息
- 根据错误类型选择合适的消息样式
- 开发环境输出详细错误日志
- 支持表单验证错误的字段级处理

#### 错误分类
- **验证错误**：`VALIDATION_ERROR` 或 `VAL_` 开头 → 警告样式
- **权限错误**：`FORBIDDEN`、`AUTH_006`、HTTP 403 → 警告样式
- **认证错误**：`UNAUTHORIZED`、`AUTH_` 开头、HTTP 401 → 自动跳转登录（由request.js处理）
- **特殊业务错误**：如 `MAINTENANCE_PLAN_005`（存在未完成任务） → 警告样式
- **其他错误**：错误样式

### 2. 消息提示 (messageHandler.js)

#### 主要功能
- 成功消息提示（绿色，3秒）
- 错误消息提示（红色，5秒，可关闭）
- 警告消息提示（橙色，4秒，可关闭）
- 信息消息提示（蓝色，3秒）
- 操作成功快捷方法
- 操作警告快捷方法

### 3. 数据格式化 (formatter.js)

#### 主要功能
- 日期时间格式化（ISO 8601转本地时间）
- 周期信息格式化（如"每30天"）
- 标准工时格式化（DECIMAL转数值）
- 状态枚举转换（状态值转Tag类型）
- 维护类型枚举转换（中文显示和Tag类型）
- 周期类型枚举转换（中文显示和Tag类型）
- 查询参数构建（过滤空值）
- 分页参数构建（标准分页格式）
- 备件清单格式化

### 4. 统一导出 (index.js)

提供便捷的函数导出，简化组件中的使用。

## 使用方法

### 基础导入

```javascript
// 错误处理和消息提示
import {
  handleApiError,        // API错误处理
  handleFormValidationError, // 表单验证错误处理
  showSuccess,          // 成功消息
  showError,            // 错误消息
  showWarning,          // 警告消息
  showOperationSuccess, // 操作成功消息
  showConfirm          // 确认对话框
} from './utils'

// 数据格式化
import {
  formatDateTime,           // 日期时间格式化
  formatCycleInfo,         // 周期信息格式化
  formatStandardDuration,  // 标准工时格式化
  getStatusTagType,        // 状态Tag类型
  getMaintenanceTypeText,  // 维护类型文本
  getCycleTypeText,        // 周期类型文本
  buildQueryParams,        // 构建查询参数
  buildPaginationParams,   // 构建分页参数
  formatSpareParts         // 备件清单格式化
} from './utils'
```

### 场景1：API调用错误处理

```javascript
// 在组件方法中
async fetchData() {
  try {
    await this.getList()
  } catch (error) {
    handleApiError(error, {
      defaultMessage: '获取维护计划列表失败'
    })
  }
}
```

### 场景2：成功操作提示

```javascript
// 方式1：使用操作成功快捷方法（优先使用后端返回的消息）
const response = await this.enable(row.id)
showOperationSuccess('enable', response)

// 方式2：直接显示成功消息
showSuccess('操作成功')

// 方式3：显示后端返回的消息
showSuccess(response)  // 会自动提取response.message
```

### 场景3：警告提示

```javascript
// 方式1：使用警告快捷方法
showWarning('请完善表单信息')

// 方式2：使用操作警告快捷方法
showOperationWarning('has-unfinished-tasks')
```

### 场景4：确认对话框

```javascript
try {
  await showConfirm({
    message: '确认启用该维护计划？启用后系统将自动生成维护任务。',
    title: '启用确认',
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  })

  // 用户确认后的操作
  const result = await this.enable(row.id)
  showOperationSuccess('enable', result)
} catch (error) {
  if (error !== 'cancel') {
    handleApiError(error)
  }
}
```

### 场景5：表单验证错误处理

```javascript
async createPlan() {
  try {
    const response = await createMaintenancePlan(submitData)
    showOperationSuccess('create', response)
  } catch (error) {
    // 如果是验证错误，进行字段级别的处理
    if (error.code === 'VALIDATION_ERROR' && error.details?.field) {
      handleFormValidationError(error, this.$refs.form)
    } else {
      handleApiError(error, {
        defaultMessage: '创建维护计划失败'
      })
    }
  }
}
```

### 场景6：数据格式化

```javascript
// 日期时间格式化
const formattedDate = formatDateTime('2024-01-20T10:30:00.000Z')
// => '2024-01-20 18:30:00' (假设本地时区为UTC+8)

// 周期信息格式化
const cycleText = formatCycleInfo({
  cycleType: '按时间',
  cycleValue: 30,
  cycleUnit: '天'
})
// => '每30天'

// 标准工时格式化
const durationText = formatStandardDuration('2.50')
// => '2.5 小时'

// 状态Tag类型转换
const tagType = getStatusTagType('启用')
// => 'success'

// 维护类型文本
const typeText = getMaintenanceTypeText('定期检查')
// => '定期检查'

// 构建查询参数（自动过滤空值）
const params = buildQueryParams({
  page: 1,
  limit: 10,
  search: '',      // 会被过滤
  status: '启用',
  equipmentId: undefined  // 会被过滤
})
// => { page: 1, limit: 10, status: '启用' }

// 备件清单格式化
const sparePartsText = formatSpareParts([
  { sparePartId: 'xxx', quantity: 2, name: '轴承' },
  { sparePartId: 'yyy', quantity: 1, name: '密封圈' }
])
// => '轴承(2)、密封圈(1)'
```

## API参考

### handleApiError(error, options)

处理API错误

**参数：**
- `error` (Error): API错误对象
- `options` (Object): 处理选项
  - `showMessage` (Boolean): 是否显示错误消息，默认true
  - `defaultMessage` (String): 默认错误消息
  - `onError` (Function): 错误回调函数

**返回：**
- `Object`: 错误处理结果 `{ code, message, handled }`

### handleFormValidationError(error, formRef)

处理表单验证错误

**参数：**
- `error` (Error): 验证错误对象
- `formRef` (Object): 表单引用对象

**返回：**
- `Object`: 处理结果 `{ field?, message?, handled }`

### showSuccess(message, options)

显示成功消息

**参数：**
- `message` (String|Object): 消息内容或响应对象
- `options` (Object): 消息选项
  - `duration` (Number): 显示时长（毫秒），默认3000
  - `showClose` (Boolean): 是否显示关闭按钮，默认false

### showError(message, options)

显示错误消息

**参数：**
- `message` (String): 消息内容
- `options` (Object): 消息选项
  - `duration` (Number): 显示时长（毫秒），默认5000
  - `showClose` (Boolean): 是否显示关闭按钮，默认true

### showWarning(message, options)

显示警告消息

**参数：**
- `message` (String): 消息内容
- `options` (Object): 消息选项
  - `duration` (Number): 显示时长（毫秒），默认4000
  - `showClose` (Boolean): 是否显示关闭按钮，默认true

### showOperationSuccess(operation, response)

显示操作成功消息

**参数：**
- `operation` (String): 操作类型 - 'create' | 'update' | 'delete' | 'enable' | 'disable'
- `response` (Object): 响应对象（优先使用response.message）

### showConfirm(options)

显示确认对话框

**参数：**
- `options` (Object): 对话框选项
  - `title` (String): 标题，默认"提示"
  - `message` (String): 消息内容
  - `type` (String): 类型 - 'warning' | 'info' | 'error'，默认'warning'
  - `confirmButtonText` (String): 确认按钮文本，默认"确定"
  - `cancelButtonText` (String): 取消按钮文本，默认"取消"

**返回：**
- `Promise`: 确认结果，用户取消时reject 'cancel'

### formatDateTime(datetime, format)

日期时间格式化

**参数：**
- `datetime` (String|Date): ISO 8601格式的日期时间字符串或Date对象
- `format` (String): 格式化模板，默认'{y}-{m}-{d} {h}:{i}:{s}'

**返回：**
- `String|null`: 格式化后的日期时间字符串

### formatCycleInfo(cycleInfo)

周期信息格式化

**参数：**
- `cycleInfo` (Object): 周期信息对象
  - `cycleType` (String): 周期类型
  - `cycleValue` (Number): 周期值
  - `cycleUnit` (String): 周期单位

**返回：**
- `String`: 格式化后的周期描述，如"每30天"

### formatStandardDuration(duration, precision, withUnit)

标准工时格式化

**参数：**
- `duration` (String|Number): 标准工时
- `precision` (Number): 小数精度，默认1
- `withUnit` (Boolean): 是否添加单位，默认true

**返回：**
- `String|Number`: 格式化后的工时

### getStatusTagType(status)

获取状态Tag类型

**参数：**
- `status` (String): 状态值（启用/禁用）

**返回：**
- `String`: StatusTag类型（success/info）

### buildQueryParams(params)

构建查询参数（过滤空值）

**参数：**
- `params` (Object): 原始查询参数对象

**返回：**
- `Object`: 过滤后的查询参数对象

### buildPaginationParams(pagination)

构建分页参数

**参数：**
- `pagination` (Object): 分页信息对象
  - `page` (Number): 页码，默认1
  - `limit` (Number): 每页数量，默认10
  - `sortBy` (String): 排序规则，默认'createdAt:desc'

**返回：**
- `Object`: 分页参数对象

### formatSpareParts(spareParts)

格式化备件清单

**参数：**
- `spareParts` (Array): 备件清单数组

**返回：**
- `String`: 格式化后的备件清单文本

## 错误码映射

### 维护计划管理错误码
- `MAINTENANCE_PLAN_001`: 维护计划编码已存在 → 错误提示
- `MAINTENANCE_PLAN_002`: 维护计划不存在 → 错误提示
- `MAINTENANCE_PLAN_003`: 维护计划已经是启用状态 → 警告提示
- `MAINTENANCE_PLAN_004`: 维护计划已经是禁用状态 → 警告提示
- `MAINTENANCE_PLAN_005`: 存在未完成的维护任务，无法禁用计划 → 警告提示
- `MAINTENANCE_PLAN_006`: 仅支持按时间周期的维护计划生成任务 → 错误提示

### 设备相关错误码
- `EQUIPMENT_001`: 设备不存在 → 错误提示

### 通用错误码
- `VALIDATION_ERROR`: 请求参数验证失败 → 警告提示
- `UNAUTHORIZED`: 未授权 → 自动跳转登录（由request.js处理）
- `FORBIDDEN`: 无权限 → 警告提示
- `INTERNAL_SERVER_ERROR`: 服务器内部错误 → 错误提示

## 最佳实践

### 1. 优先使用后端返回的消息

```javascript
// ✅ 推荐：使用后端返回的消息
const response = await createMaintenancePlan(data)
showOperationSuccess('create', response)

// ❌ 不推荐：硬编码消息
const response = await createMaintenancePlan(data)
showSuccess('创建维护计划成功')
```

### 2. 统一错误处理方式

```javascript
// ✅ 推荐：使用统一的错误处理工具
catch (error) {
  handleApiError(error, {
    defaultMessage: '操作失败'
  })
}

// ❌ 不推荐：手动判断错误码
catch (error) {
  if (error.code === 'XXX') {
    this.$message.error('...')
  } else {
    this.$message.error('...')
  }
}
```

### 3. 提供默认消息作为后备

```javascript
// ✅ 推荐：提供默认消息
handleApiError(error, {
  defaultMessage: '获取数据失败'  // 后端未返回消息时使用
})

// ❌ 不推荐：不提供默认消息
handleApiError(error)  // 可能显示"操作失败，请稍后重试"
```

### 4. 处理特殊错误场景

```javascript
// ✅ 推荐：针对特殊错误码进行额外处理
catch (error) {
  if (error.code === 'VALIDATION_ERROR' && error.details?.field) {
    handleFormValidationError(error, this.$refs.form)
  } else {
    handleApiError(error, { defaultMessage: '操作失败' })
  }
}
```

## 开发环境调试

在开发环境中，所有错误处理都会输出详细的控制台日志：

```javascript
// 错误日志格式
console.error('❌ 维护计划管理 - API错误:', {
  code: error.code,
  message: error.message,
  status: error.status,
  details: error.details,
  stack: error.stack
})

// 成功消息日志
console.log('✅ 成功消息:', displayMessage)

// 警告消息日志
console.warn('⚠️ 警告消息:', message)

// 错误消息日志
console.error('❌ 错误消息:', message)
```

## 与全局错误处理的关系

本工具是对全局 `request.js` 错误处理的补充和增强：

1. **全局错误处理** (`request.js`)
   - 处理认证错误（401自动跳转登录）
   - 处理权限错误（403）
   - 处理网络错误和超时
   - 处理系统错误（500系列）

2. **模块级错误处理** (本工具)
   - 处理业务逻辑错误（维护计划相关错误码）
   - 提供用户友好的错误消息
   - 支持表单验证错误的字段级处理
   - 提供统一的成功/警告消息提示

3. **配合使用**
   - request.js已处理的错误（如401、403、500）不会传递到业务层
   - 业务层主要处理未被request.js处理的错误
   - 通过 `error.details.handledByRequestLayer` 判断是否已被处理

## 注意事项

1. **错误消息优先级**：后端返回的消息 > 默认消息 > 通用错误消息
2. **401/403错误**：已在全局request.js中处理，业务层无需关注
3. **表单验证错误**：需要提供formRef引用才能实现字段级错误显示
4. **确认对话框**：用户取消时会reject 'cancel'，需要在catch中判断
5. **开发环境日志**：所有错误处理都会输出详细日志，便于调试

---

**文档版本**: v1.0.0
**最后更新**: 2024-01-20
**维护团队**: Moses 前端开发团队

