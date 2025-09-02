# 后端消息使用规范

## 概述

本规范定义了前端开发中如何正确使用后端返回的消息，避免硬编码提示信息，确保消息的一致性和可维护性。

## 核心原则

### 1. 优先使用后端消息

**必须遵循：** 所有用户提示消息都应优先使用后端API返回的消息内容，而不是前端硬编码。

```javascript
// ✅ 正确：使用后端返回的消息
const errorMessage = response.error?.message || response.message || '操作失败';

// ❌ 错误：硬编码错误消息
const errorMessage = '用户名或密码错误';
```

### 3. 消息提取优先级

按以下优先级提取消息：

1. **成功消息**：`response.message`
2. **错误消息**：`response.error?.message`
3. **备用消息**：`response.message`（某些情况下错误信息可能在此字段）
4. **默认消息**：仅在前三者都不存在时使用简单的默认消息

```javascript
// 推荐的消息提取模式
function extractMessage(response, defaultMessage = '操作失败') {
  if (response.success) {
    return response.message || '操作成功';
  } else {
    return response.error?.message || response.message || defaultMessage;
  }
}
```

