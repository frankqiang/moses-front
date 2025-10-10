# Token自动刷新调试指南

## 📋 文档概述

**目的**：帮助排查Token自动刷新功能未生效的问题

**日期**：2025-01-10

---

## 🔍 问题现象

用户反馈：**在 Network 面板中只看到获取用户信息的接口调用，没有看到 refreshToken 接口调用**

---

## 🎯 排查步骤

### 第一步：检查浏览器控制台日志

打开浏览器开发者工具（F12），查看 Console 面板，按以下顺序检查日志：

#### 1. 查找 API 请求日志

正常情况下应该看到：
```
📥 API Response: {
  url: "/v1/auth/user",
  status: 401,
  success: false,
  errorCode: "AUTH_001" 或 "AUTH_002" 或 "AUTH_004",
  ...
}
```

**关键信息**：记录下 `errorCode` 的值

#### 2. 查找错误拦截器日志

```
❌ Response Interceptor Error: {
  url: "/v1/auth/user",
  status: 401,
  errorCode: "AUTH_001",
  errorMessage: "缺少Authorization头或令牌格式不正确"
}
```

#### 3. 查找认证错误详情日志

```
🔍 认证错误详情: {
  errorCode: "AUTH_001",
  errorMessage: "...",
  currentToken: "存在" 或 "不存在",
  refreshToken: "存在" 或 "不存在"
}
```

#### 4. 查找Token刷新触发日志

**如果看到**：
```
✅ 检测到Token过期错误: AUTH_002，尝试自动刷新...
🔄 Token过期，尝试自动刷新...
```
说明Token刷新逻辑**已触发**

**如果没有看到**：
说明Token刷新逻辑**未触发**，继续排查

---

### 第二步：检查 Network 面板

打开 Network 面板，重点关注以下接口：

#### 1. 获取用户信息接口

- URL: `/v1/auth/user`
- Method: `GET`
- Status: `401`

**查看响应内容**：
```json
{
  "success": false,
  "error": {
    "code": "AUTH_001",  // ← 记录这个错误码
    "message": "缺少Authorization头或令牌格式不正确"
  }
}
```

#### 2. 刷新Token接口（应该被调用）

- URL: `/v1/auth/refresh-tokens`
- Method: `POST`
- 请求体: `{ "refreshToken": "..." }`

**如果没有看到这个请求**，说明刷新逻辑未触发

---

### 第三步：分析错误码

根据后端文档（`Token过期机制后端确认文档.md`），不同错误码的含义：

| 错误码 | 含义 | 是否触发Token刷新 |
|--------|------|-------------------|
| `AUTH_001` | 未授权访问（缺少Token或Token格式错误） | ❌ 不触发（除非有refreshToken） |
| `AUTH_002` | Token过期 | ✅ 触发刷新 |
| `AUTH_004` | Token格式错误 | ⚠️ 仅当消息包含"过期"时触发 |
| `AUTH_032` | RefreshToken过期 | ❌ 不触发（直接跳转登录） |
| `AUTH_033` | RefreshToken无效 | ❌ 不触发（直接跳转登录） |

---

## 🐛 常见问题诊断

### 问题1：返回 `AUTH_001` 而不是 `AUTH_002`

**原因**：
1. **Token已被清除**：在刷新失败后，Token被清除，后续请求没有Token
2. **路由守卫提前触发**：在Token刷新前，路由守卫就调用了 getInfo()

**解决方案**：
```javascript
// 在 request.js 中已添加智能优化
// 对于 AUTH_001，如果 refreshToken 存在，也尝试刷新
if (res.error?.code === 'AUTH_001' && getRefreshToken()) {
  console.log('💡 AUTH_001但存在refreshToken，尝试自动刷新...')
  return handleTokenExpired(response)
}
```

**验证方法**：
查看控制台是否有这条日志：
```
💡 AUTH_001但存在refreshToken，尝试自动刷新...
```

---

### 问题2：Token刷新接口未调用

**可能原因**：

#### 原因A：错误码不匹配
后端返回的错误码不是 `AUTH_002`、`TOKEN_EXPIRED` 或包含"过期"的 `AUTH_004`

**排查方法**：
1. 查看控制台日志中的 `errorCode`
2. 检查 `request.js` 第 297-300 行的判断条件

**临时解决方案**：
如果后端返回其他错误码（如 `AUTH_004`），修改判断条件：
```javascript
const isTokenExpiredError =
  res.error?.code === 'AUTH_002' ||
  res.error?.code === 'TOKEN_EXPIRED' ||
  res.error?.code === 'AUTH_004' || // 兼容后端实际返回的错误码
  (res.error?.code === 'AUTH_004' && res.error?.message?.includes('过期'))
```

#### 原因B：refreshToken不存在
localStorage/sessionStorage 中没有 refreshToken

**排查方法**：
1. 打开 Application 面板 → Storage → Local Storage/Session Storage
2. 查找 `refreshToken` 或 `moses_refresh_token` 键
3. 查看控制台日志中的 `refreshToken: "存在" 或 "不存在"`

**解决方案**：
重新登录，确保登录时保存了 refreshToken

#### 原因C：响应格式不匹配
后端响应格式与前端预期不一致

**排查方法**：
查看 Network 面板中的实际响应格式

**预期格式**：
```json
{
  "success": false,
  "error": {
    "code": "AUTH_002",
    "message": "访问令牌已过期"
  },
  "meta": { ... }
}
```

---

### 问题3：刷新Token失败

**现象**：
- 控制台有刷新触发日志
- Network 面板能看到 `/v1/auth/refresh-tokens` 请求
- 但请求返回 401 错误

**可能原因**：
1. RefreshToken 也过期了（返回 `AUTH_032`）
2. RefreshToken 无效或被撤销（返回 `AUTH_033`）

**预期行为**：
- 显示消息提示："登录已过期，请重新登录"
- 延迟500ms后跳转到登录页

**控制台日志**：
```
❌ Token刷新失败: 刷新令牌已过期，请重新登录
🧹 完全清理认证状态，防止路由守卫误判...
🔐 Token刷新失败，跳转到登录页，来源页面: /dashboard
```

---

## 🧪 测试Token刷新功能

### 测试环境准备

1. **修改Token有效期**（开发环境测试用）

编辑后端 `.env.development` 文件：
```env
JWT_ACCESS_EXPIRATION_MINUTES=1  # 设置为1分钟，方便测试
JWT_REFRESH_EXPIRATION_DAYS=7
```

2. **重启后端服务**

```bash
npm run dev
# 或
pm2 restart moses-api
```

### 测试步骤

#### 测试用例1：正常Token刷新

1. 登录系统
2. 等待1分钟（accessToken过期）
3. 点击任意菜单或刷新页面
4. 观察浏览器控制台和 Network 面板

**预期结果**：
```
✅ 检测到Token过期错误: AUTH_002，尝试自动刷新...
🔄 Token过期，尝试自动刷新...
✅ Token刷新成功，更新本地存储
🚀 使用新Token重试原始请求: /v1/auth/user
```

**Network 面板**：
1. 看到 `/v1/auth/user` 返回 401
2. 看到 `/v1/auth/refresh-tokens` 返回 200
3. 看到 `/v1/auth/user` 再次请求并返回 200

#### 测试用例2：RefreshToken也过期

1. 登录系统
2. 手动修改数据库中的 Token 记录，将 `expires` 字段改为过去时间
3. 刷新页面
4. 观察控制台和页面行为

**预期结果**：
- 顶部显示消息提示："登录已过期，请重新登录"
- 延迟500ms后跳转到登录页
- 不会反复调用接口

---

## 🔧 开发环境调试技巧

### 1. 使用详细日志

当前代码已添加详细的调试日志，包括：
- 📥 API Response（所有响应）
- ❌ Response Interceptor Error（错误拦截）
- 🔍 认证错误详情（错误码、Token状态）
- ✅/❌ Token刷新过程（触发、成功、失败）

### 2. 断点调试

在以下位置设置断点：
1. `request.js` 第 283 行：`if (isAuthError(res.error?.code))`
2. `request.js` 第 302 行：`if (isTokenExpiredError)`
3. `request.js` 第 473 行：`async function handleTokenExpired(response)`
4. `request.js` 第 496 行：`const refreshResponse = await refreshTokens(refreshToken)`

### 3. 检查本地存储

在控制台执行：
```javascript
// 查看当前Token
console.log('accessToken:', localStorage.getItem('moses_access_token'))
console.log('refreshToken:', localStorage.getItem('moses_refresh_token'))

// 或使用 auth 工具
import { getToken, getRefreshToken } from '@/utils/auth'
console.log('getToken():', getToken())
console.log('getRefreshToken():', getRefreshToken())
```

---

## 📞 联系支持

如果按照上述步骤仍无法解决问题，请收集以下信息：

1. **控制台完整日志**（特别是包含 🔍、✅、❌ 标记的日志）
2. **Network 面板截图**（显示所有相关请求）
3. **LocalStorage/SessionStorage 内容**
4. **后端返回的完整错误响应**

将这些信息提供给开发团队进行深入排查。

---

## 🔄 快速检查清单

使用此清单快速定位问题：

- [ ] 浏览器控制台有详细的调试日志吗？
- [ ] 获取用户信息接口返回的错误码是什么？
- [ ] `refreshToken` 在 localStorage/sessionStorage 中存在吗？
- [ ] 控制台有"检测到Token过期错误"的日志吗？
- [ ] Network 面板能看到 `/v1/auth/refresh-tokens` 请求吗？
- [ ] 如果能看到刷新请求，返回的状态码是什么？
- [ ] 后端 Token 配置正确吗（特别是有效期）？

根据清单逐项检查，通常能快速定位问题所在。

