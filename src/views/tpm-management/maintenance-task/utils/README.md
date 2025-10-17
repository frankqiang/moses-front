# 维护任务管理工具类说明文档

## 概述

本目录包含维护任务管理模块的工具类，提供统一的错误处理和消息提示功能。

## ⚠️ 重要说明

**本工具类遵循"零硬编码"原则：**
- ✅ **完全使用后端返回的错误消息**：不在前端维护任何错误码到消息的映射
- ✅ **后端响应优先**：直接使用接口返回的 `error.message` 和 `response.message` 字段
- ✅ **特殊处理最小化**：仅对需要特殊交互的错误（401/403）进行必要处理

## 文件结构

```
utils/
├── error-handler.js      # 错误处理工具类
├── message-handler.js    # 消息提示工具类
├── index.js             # 统一导出入口
└── README.md            # 说明文档
```

## 错误处理工具（error-handler.js）

### 功能特性

- ✅ 统一API错误响应处理
- ✅ **直接使用后端返回的错误消息（无硬编码）**
- ✅ 自动处理401/403等特殊错误
- ✅ 防重复错误消息机制
- ✅ 开发环境错误日志输出
- ✅ 表单验证错误提示
- ✅ 网络错误处理

### 使用示例

#### 1. 基础错误处理

```javascript
import { handleError } from '../utils/error-handler'

async function loadData() {
  try {
    const response = await getMaintenanceTasks()
    // 处理成功响应
  } catch (error) {
    // 统一错误处理：自动显示错误消息、处理401/403等
    handleError(error)
  }
}
```

#### 2. 自定义错误处理回调

```javascript
import { handleError } from '../utils/error-handler'

async function assignTaskHandler(taskId, assigneeId) {
  try {
    await assignTask(taskId, { assignedTo: assigneeId })
  } catch (error) {
    handleError(error, {
      showMessage: true,
      onAuthError: () => {
        console.log('认证失败，需要重新登录')
      },
      onPermissionError: () => {
        console.log('权限不足')
      },
      onValidationError: () => {
        console.log('验证失败')
      }
    })
  }
}
```

#### 3. 显示各类错误消息

```javascript
import {
  showErrorMessage,
  showSuccessMessage,
  showWarningMessage,
  showInfoMessage
} from '../utils/error-handler'

// 错误消息（红色，5秒自动关闭）
showErrorMessage('操作失败')

// 成功消息（绿色，3秒自动关闭）
showSuccessMessage('操作成功')

// 警告消息（橙色，4秒自动关闭）
showWarningMessage('请注意')

// 信息消息（蓝色，3秒自动关闭）
showInfoMessage('提示信息')
```

#### 4. 确认对话框

```javascript
import { showConfirm } from '../utils/error-handler'

async function deleteTask() {
  try {
    await showConfirm('确认删除此任务吗？', '确认删除', { type: 'warning' })
    // 用户点击确定后执行
    await deleteMaintenanceTask(taskId)
  } catch {
    // 用户点击取消
    console.log('已取消删除')
  }
}
```

### 错误处理原则

**核心原则：直接使用后端返回的错误消息，不维护前端错误码映射**

- ✅ **后端消息优先**：直接使用 `error.message` 字段
- ✅ **无硬编码**：不在前端维护错误码到消息的映射
- ✅ **特殊处理**：仅对 401/403 等需要特殊交互的错误进行处理

#### 特殊处理的错误

| 错误类型 | 处理方式 |
|---------|---------|
| 认证错误 (UNAUTHORIZED / AUTH_*) | 自动跳转登录页 |
| 权限错误 (FORBIDDEN / ACCESS_DENIED) | 显示权限不足提示 |
| 验证错误 (VALIDATION_ERROR) | 显示验证失败消息 |
| 网络错误 (NETWORK_*) | 显示网络错误提示 |

## 消息提示工具（message-handler.js）

### 功能特性

- ✅ 标准化的操作成功消息提示
- ✅ 操作确认对话框
- ✅ 逾期任务警告提示

### 使用示例

#### 1. 显示操作成功消息

```javascript
import {
  showCreateSuccess,
  showAssignSuccess,
  showAcceptSuccess,
  showStartSuccess,
  showCompleteSuccess,
  showPostponeSuccess,
  showCancelSuccess
} from '../utils/message-handler'

// 创建成功
async function createTask(data) {
  const response = await createMaintenanceTask(data)
  // 优先使用后端返回的消息
  showCreateSuccess(response.message)
}

// 派工成功
async function assign(taskId, assigneeId) {
  const response = await assignTask(taskId, { assignedTo: assigneeId })
  showAssignSuccess(response.message)
}

// 接单成功
async function accept(taskId) {
  const response = await acceptTask(taskId)
  showAcceptSuccess(response.message)
}
```

#### 2. 操作确认对话框

```javascript
import {
  confirmAssignTask,
  confirmAcceptTask,
  confirmStartTask,
  confirmPostponeTask,
  confirmCancelTask
} from '../utils/message-handler'

// 派工确认
async function handleAssign(assigneeName) {
  try {
    await confirmAssignTask(assigneeName)
    // 用户确认后执行派工
    await assignTask(taskId, { assignedTo: assigneeId })
  } catch {
    // 用户取消
  }
}

// 延期确认
async function handlePostpone(delayReason) {
  try {
    await confirmPostponeTask(delayReason)
    await postponeTask(taskId, { delayReason })
  } catch {
    // 用户取消
  }
}

// 取消任务确认
async function handleCancel(cancelReason) {
  try {
    await confirmCancelTask(cancelReason)
    await cancelTask(taskId, { cancelReason })
  } catch {
    // 用户取消
  }
}
```

#### 3. 逾期警告提示

```javascript
import {
  warnTaskOverdue,
  warnTaskAlreadyOverdue
} from '../utils/message-handler'

// 即将逾期警告
warnTaskOverdue('退火炉日常维护', '2024-01-20 08:00')

// 已逾期警告
warnTaskAlreadyOverdue('退火炉日常维护')
```

## 完整使用示例

### 在Vue组件中使用

```vue
<template>
  <div>
    <el-button @click="handleAssign">派工</el-button>
  </div>
</template>

<script>
import { assignTask } from '../api/maintenance-task'
import { handleError } from '../utils/error-handler'
import { showAssignSuccess, confirmAssignTask } from '../utils/message-handler'

export default {
  methods: {
    async handleAssign() {
      try {
        // 显示确认对话框
        await confirmAssignTask('张三')

        // 调用API
        const response = await assignTask(this.taskId, {
          assignedTo: this.assigneeId
        })

        // 显示成功消息（优先使用后端返回的消息）
        showAssignSuccess(response.message)

        // 刷新数据
        await this.loadData()
      } catch (error) {
        // 统一错误处理
        // - 自动显示错误消息
        // - 401自动跳转登录页
        // - 403显示权限不足提示
        handleError(error)
      }
    }
  }
}
</script>
```

## 最佳实践

### 1. 始终使用后端返回的消息

```javascript
// ✅ 推荐：使用后端返回的消息
const response = await createMaintenanceTask(data)
showCreateSuccess(response.message)

// ❌ 不推荐：硬编码消息
showCreateSuccess('创建成功')
```

### 2. 统一的错误处理模式

```javascript
// ✅ 推荐：使用handleError统一处理
try {
  await someApiCall()
} catch (error) {
  handleError(error)
}

// ❌ 不推荐：手动处理每个错误
try {
  await someApiCall()
} catch (error) {
  if (error.code === 'UNAUTHORIZED') {
    // ...
  } else if (error.code === 'FORBIDDEN') {
    // ...
  }
  // ...
}
```

### 3. 重要操作需要确认

```javascript
// ✅ 推荐：重要操作前确认
async function handleDelete() {
  try {
    await confirmDeleteTask(taskTitle)
    await deleteTask(taskId)
  } catch {
    // 用户取消
  }
}

// ❌ 不推荐：直接执行
async function handleDelete() {
  await deleteTask(taskId)
}
```

### 4. 防止重复错误消息

工具类已内置防重复机制，3秒内相同的错误消息不会重复显示。

## 注意事项

1. **错误消息来源**：**完全使用后端返回的 `error.message` 字段**，不维护前端错误码映射
2. **自动关闭时间**：
   - 成功消息：3秒
   - 错误消息：5秒
   - 警告消息：4秒
   - 信息消息：3秒
3. **401错误处理**：自动跳转到登录页，无需手动处理
4. **403错误处理**：自动显示"权限不足"提示
5. **开发环境**：所有错误会在控制台输出详细日志

## 更新日志

- **2024-01-20**: 初始创建，实现统一错误处理和消息提示功能
- **2024-01-20**: **重要修正**：移除所有硬编码的错误码映射，完全使用后端返回的 `error.message` 字段

