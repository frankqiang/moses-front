# Token过期机制前后端对接文档

## 📋 文档概述

**目的**：前端已禁用本地会话超时管理，完全依赖后端Token过期机制。本文档用于与后端确认Token管理配置，确保系统安全性和用户体验。

**日期**：2025-01-10
**前端修改人**：[您的名字]
**需要后端确认人**：[后端负责人]

---

## 🎯 前端已完成的修改

### 1. 禁用前端会话超时管理

**修改文件**：
- `src/permission.js` - 注释掉 `sessionManager.init()`
- `src/store/modules/user.js` - 注释掉登录成功后的会话管理器初始化

**原因**：
- ✅ 避免前后端超时时间不同步
- ✅ 简化前端逻辑，减少维护成本
- ✅ 完全依赖后端的Token过期机制

### 2. 保留的Token自动刷新机制

**功能位置**：`src/utils/request.js` (第341-408行)

**工作流程**：
```javascript
1. 前端发起API请求
2. 后端返回 401 + 错误码 AUTH_002 或 TOKEN_EXPIRED
3. 前端自动调用 POST /auth/refresh-tokens
4. 使用新Token重新发起原始请求
5. 刷新失败则跳转登录页
```

**关键特性**：
- ✅ 自动刷新，用户无感知
- ✅ 请求队列机制，避免并发刷新
- ✅ 刷新失败自动跳转登录

---

## ❓ 需要后端确认的配置项

### 🔐 Token配置

请后端确认以下配置参数：

| 配置项 | 建议值 | 当前值 | 确认 |
|--------|--------|--------|------|
| **accessToken 有效期** | 30分钟 | ❓ | [ ] |
| **refreshToken 有效期** | 7天 | ❓ | [ ] |
| **Token加密算法** | HS256/RS256 | ❓ | [ ] |
| **Token存储位置** | Redis/数据库 | ❓ | [ ] |

### 📡 接口确认

请确认以下接口是否已实现：

| 接口 | 路径 | 方法 | 状态 |
|------|------|------|------|
| 用户登录 | `/auth/login` | POST | [ ] 已实现 |
| Token刷新 | `/auth/refresh-tokens` | POST | [ ] 已实现 |
| 用户登出 | `/auth/logout` | POST | [ ] 已实现 |
| 获取用户信息 | `/auth/user` | GET | [ ] 已实现 |

### 🔢 错误码确认

Token过期时，后端应返回以下错误码之一：

```json
{
  "success": false,
  "error": {
    "code": "AUTH_002",  // 或 "TOKEN_EXPIRED"
    "message": "令牌已过期"
  }
}
```

**请确认**：
- [ ] 错误码格式正确
- [ ] HTTP状态码为 401
- [ ] 错误消息用户友好

---

## 💡 推荐的Token配置方案

### 方案A：短期Token + 长期刷新（推荐）⭐

```yaml
配置：
  accessToken:
    有效期: 30分钟
    刷新时机: 过期时自动刷新
  
  refreshToken:
    有效期: 7天
    刷新时机: 登录时获取，过期需重新登录

用户体验：
  - 正常使用：无感知，自动续期
  - 7天内不登录：需重新登录
  - 安全性：高（短期Token降低泄露风险）
```

### 方案B：较长Token（备选）

```yaml
配置：
  accessToken:
    有效期: 2小时
    刷新时机: 过期时自动刷新
  
  refreshToken:
    有效期: 30天
    刷新时机: 登录时获取

用户体验：
  - 正常使用：无感知
  - 30天内不登录：需重新登录
  - 安全性：中（较长Token增加风险）
```

**我们推荐方案A**，理由：
1. ✅ 安全性更高
2. ✅ 符合OAuth2.0最佳实践
3. ✅ 降低Token泄露风险

---

## 🔍 需要后端提供的信息

### 1. Token刷新接口详情

**请求示例**：
```bash
POST /auth/refresh-tokens
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**响应示例**：
```json
{
  "success": true,
  "data": {
    "access": {
      "token": "新的accessToken",
      "expires": "2025-01-10T12:00:00.000Z"
    },
    "refresh": {
      "token": "新的refreshToken", 
      "expires": "2025-01-17T11:30:00.000Z"
    }
  },
  "message": "令牌刷新成功"
}
```

**请确认**：
- [ ] 响应格式是否正确？
- [ ] expires字段是ISO8601格式？
- [ ] 是否会返回新的refreshToken？

### 2. Token过期的具体行为

**场景1：accessToken过期，refreshToken有效**
```
预期：返回 401 + AUTH_002
前端：自动刷新Token
```

**场景2：accessToken和refreshToken都过期**
```
预期：返回 401 + REFRESH_TOKEN_EXPIRED
前端：跳转登录页
```

**场景3：refreshToken无效（被撤销/黑名单）**
```
预期：返回 401 + REFRESH_TOKEN_INVALID
前端：跳转登录页
```

**请确认**：
- [ ] 以上三种场景的错误码是否正确？
- [ ] 是否还有其他Token过期场景？

---

## 🧪 联调测试方案

### 测试用例1：正常Token刷新

**步骤**：
1. 用户登录获取Token
2. 等待accessToken过期（或手动修改过期时间）
3. 发起任意API请求
4. 观察是否自动刷新Token

**预期结果**：
- ✅ 请求成功
- ✅ 控制台显示 "🔄 Token过期，尝试自动刷新..."
- ✅ 控制台显示 "✅ Token刷新成功"
- ✅ localStorage中的Token已更新

### 测试用例2：refreshToken过期

**步骤**：
1. 用户登录
2. 手动将refreshToken改为过期的Token
3. 发起API请求

**预期结果**：
- ✅ 显示"登录已过期，请重新登录"
- ✅ 自动跳转到登录页
- ✅ localStorage中的Token被清除

### 测试用例3：并发请求Token刷新

**步骤**：
1. accessToken过期
2. 同时发起多个API请求

**预期结果**：
- ✅ 只发起一次 `/auth/refresh-tokens` 请求
- ✅ 所有请求都等待Token刷新完成
- ✅ 刷新成功后，所有请求使用新Token重试

---

## 📊 性能和监控建议

### 后端应监控的指标

1. **Token刷新频率**
   - 正常值：每个用户每30分钟刷新一次
   - 异常值：频繁刷新（可能是时间配置问题）

2. **Token刷新失败率**
   - 正常值：< 1%
   - 异常值：> 5%（需排查原因）

3. **并发刷新请求**
   - 正常值：每次刷新只有1个请求
   - 异常值：同一用户多个并发刷新（前端队列失效）

### 日志记录建议

建议后端记录以下日志：
```
[INFO] Token刷新成功: userId=123, ip=192.168.1.1
[WARN] Token刷新失败: userId=123, reason=REFRESH_TOKEN_EXPIRED
[ERROR] 无效的刷新Token: userId=123, token=xxx...
```

---

## ✅ 确认清单

请后端开发人员确认以下事项：

### Token配置
- [ ] accessToken有效期：____ 分钟
- [ ] refreshToken有效期：____ 天
- [ ] Token刷新机制已实现
- [ ] Token黑名单/撤销机制已实现

### 接口实现
- [ ] `/auth/login` 接口返回格式正确
- [ ] `/auth/refresh-tokens` 接口已实现
- [ ] `/auth/logout` 接口已实现
- [ ] 错误码 AUTH_002 或 TOKEN_EXPIRED 已配置

### 测试验证
- [ ] 本地环境已完成测试用例1
- [ ] 本地环境已完成测试用例2
- [ ] 本地环境已完成测试用例3

### 文档和监控
- [ ] Token过期时间已写入配置文档
- [ ] Token刷新相关监控已配置
- [ ] 异常情况处理已文档化

---

## 📞 联系方式

**前端负责人**：[您的名字]
- 邮箱：[your.email@company.com]
- 企微：[您的企微]

**后端负责人**：[后端负责人]
- 邮箱：[backend@company.com]
- 企微：[后端企微]

**问题反馈**：
- 有任何疑问请直接联系前端负责人
- 联调问题请在开发群讨论

---

## 📝 更新记录

| 日期 | 修改人 | 修改内容 |
|------|--------|----------|
| 2025-01-10 | [您的名字] | 初始创建 |
| | | |

---

**备注**：本文档由前端团队提供，请后端团队审阅并确认相关配置。如有任何疑问或建议，请及时反馈。

