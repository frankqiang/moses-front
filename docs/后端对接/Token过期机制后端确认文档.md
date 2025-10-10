# Token过期机制后端确认文档

## 📋 文档概述

**目的**：响应前端提出的Token过期机制对接需求，确认后端当前配置和实现情况。

**日期**：2025-01-10
**后端确认人**：[后端负责人]
**前端对接人**：[前端负责人]

---

## ✅ 后端配置确认

### 1. Token配置 (已确认)

| 配置项                  | 当前值           | 前端建议值   | 状态     | 说明                                       |
| ----------------------- | ---------------- | ------------ | -------- | ------------------------------------------ |
| **accessToken 有效期**  | 30分钟           | 30分钟       | ✅ 一致   | 配置项: `JWT_ACCESS_EXPIRATION_MINUTES=30` |
| **refreshToken 有效期** | 7天              | 7天          | ✅ 已调整 | 已修改为: `JWT_REFRESH_EXPIRATION_DAYS=7`  |
| **Token加密算法**       | HS256            | HS256/RS256  | ✅ 符合   | 使用 jsonwebtoken 库的默认算法             |
| **Token存储位置**       | PostgreSQL数据库 | Redis/数据库 | ✅ 符合   | 使用 Token 模型存储                        |

**已完成调整** ✅：
- ✅ 已将 `refreshToken` 有效期从30天调整为7天，提高安全性
- ✅ 配置文件已修改: `.env.development` / `.env.production`
- ✅ 配置项: `JWT_REFRESH_EXPIRATION_DAYS=7`
- ⚠️ **注意**: 需要重启应用服务才能生效

---

### 2. 接口实现确认

| 接口         | 路径                      | 方法 | 状态     | 实现文件                 |
| ------------ | ------------------------- | ---- | -------- | ------------------------ |
| 用户登录     | `/v1/auth/login`          | POST | ✅ 已实现 | `auth.controller.js:27`  |
| Token刷新    | `/v1/auth/refresh-tokens` | POST | ✅ 已实现 | `auth.controller.js:127` |
| 用户登出     | `/v1/auth/logout`         | POST | ✅ 已实现 | `auth.controller.js:109` |
| 获取用户信息 | `/v1/auth/user`           | GET  | ✅ 已实现 | `auth.controller.js:175` |

**实现细节**：
- 所有接口遵循统一响应格式 (使用 `sendSuccess` 工具函数)
- 集成了登录安全控制机制 (IP限制、账户锁定)
- 包含完整的日志记录和错误处理

---

### 3. 错误码确认

#### Token过期相关错误码

| 错误码                    | 代码       | 消息                       | HTTP状态码 | 使用场景           |
| ------------------------- | ---------- | -------------------------- | ---------- | ------------------ |
| **TOKEN_EXPIRED**         | `AUTH_002` | 登录已过期，请重新登录     | 401        | accessToken过期 ✅  |
| **INVALID_TOKEN**         | `AUTH_003` | 无效的访问令牌             | 401        | Token签名无效      |
| **TOKEN_MALFORMED**       | `AUTH_004` | 访问令牌格式错误           | 401        | Token格式错误      |
| **TOKEN_BLACKLISTED**     | `AUTH_005` | 访问令牌已失效             | 401        | Token被撤销/黑名单 |
| **REFRESH_TOKEN_EXPIRED** | `AUTH_032` | 刷新令牌已过期，请重新登录 | 401        | refreshToken过期   |

**⚠️ 重要说明**：
- Token过期时返回 `AUTH_002` (已修复)
- 之前代码存在Bug，错误返回 `AUTH_004`，现已修正

**错误响应格式**：
```json
{
  "success": false,
  "error": {
    "code": "AUTH_002",
    "message": "登录已过期，请重新登录"
  },
  "meta": {
    "timestamp": "2025-01-10T10:00:00.000Z",
    "requestId": "req-xxx"
  }
}
```

**前端对接说明**：
- ✅ 错误码格式正确，符合前端要求
- ✅ HTTP状态码统一为 401
- ✅ 错误消息用户友好，使用中文

---

## 🔍 Token刷新接口详情

### 请求格式

```bash
POST /v1/auth/refresh-tokens
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### 成功响应

```json
{
  "success": true,
  "data": {
    "access": {
      "token": "eyJhbGciOiJIUzI1NiIs...",
      "expires": "2025-01-10T12:30:00.000Z"
    },
    "refresh": {
      "token": "eyJhbGciOiJIUzI1NiIs...",
      "expires": "2025-02-09T11:30:00.000Z"
    }
  },
  "message": "令牌刷新成功",
  "meta": {
    "timestamp": "2025-01-10T11:30:00.000Z",
    "requestId": "req-123456"
  }
}
```

### 错误响应

#### 场景1：refreshToken过期
```json
{
  "success": false,
  "error": {
    "code": "AUTH_032",
    "message": "刷新令牌已过期，请重新登录"
  },
  "meta": {
    "timestamp": "2025-01-10T11:30:00.000Z"
  }
}
```

#### 场景2：refreshToken无效/被撤销
```json
{
  "success": false,
  "error": {
    "code": "AUTH_033",
    "message": "刷新令牌无效，请重新登录"
  },
  "meta": {
    "timestamp": "2025-01-10T11:30:00.000Z"
  }
}
```

**实现逻辑** (位于 `auth.service.js:218`):
1. 验证refreshToken的有效性和类型
2. 检查Token是否在数据库中且未被撤销
3. 验证Token关联的用户是否存在且状态正常
4. 删除旧的refreshToken (实现Token轮换机制)
5. 生成新的accessToken和refreshToken对
6. 返回新Token给前端

**前端关心的问题确认**：
- ✅ 响应格式正确，符合统一响应格式
- ✅ `expires` 字段使用 ISO8601 格式 (例: `2025-01-10T12:30:00.000Z`)
- ✅ 会返回新的 refreshToken (实现Token轮换安全机制)
- ✅ 同时返回 accessToken 和 refreshToken 的过期时间

---

## 📊 Token过期场景处理

**前端需要识别的三种场景** (来自前端文档要求)：

### 场景1：accessToken过期，refreshToken有效

**后端行为**：
- 中间件 `auth.js:110` 检测到Token过期
- 返回 `401 Unauthorized` + 错误码 `AUTH_002` ✅
- 前端自动调用 `/auth/refresh-tokens` 刷新Token

**错误响应**：
```json
{
  "success": false,
  "error": {
    "code": "AUTH_002",
    "message": "访问令牌已过期，请重新登录或刷新令牌"
  }
}
```

**前端处理**: 自动刷新Token并重试请求

---

### 场景2：accessToken和refreshToken都过期

**后端行为**：
- `refreshAuth` 方法验证refreshToken失败
- 返回 `401 Unauthorized` + 错误码 `AUTH_032`
- 前端引导用户重新登录

**错误响应**：
```json
{
  "success": false,
  "error": {
    "code": "AUTH_032",
    "message": "刷新令牌已过期，请重新登录"
  }
}
```

**前端处理**: 跳转登录页

---

### 场景3：refreshToken被撤销 (用户登出/黑名单)

**后端行为**：
- `refreshAuth` 方法在数据库中找不到Token
- 返回 `401 Unauthorized` + 错误码 `AUTH_033` (REFRESH_TOKEN_INVALID)
- 前端清除本地Token并跳转登录

**错误响应**：
```json
{
  "success": false,
  "error": {
    "code": "AUTH_033",
    "message": "刷新令牌无效，请重新登录"
  }
}
```

**前端处理**: 跳转登录页

**✅ 场景确认**：
- 以上三种场景的错误码已全部确认 ✅
- 场景1返回 `AUTH_002` (TOKEN_EXPIRED)
- 场景2返回 `AUTH_032` (REFRESH_TOKEN_EXPIRED)
- 场景3返回 `AUTH_033` (REFRESH_TOKEN_INVALID)
- 没有其他特殊的Token过期场景

---

## 🔐 Token安全机制

### 1. Token黑名单机制

**实现位置**: `tokenBlacklist.js`
**功能**:
- Token撤销后加入黑名单
- 每次请求验证Token是否在黑名单中
- 自动清理过期的黑名单记录

### 2. Token轮换机制

**实现位置**: `auth.service.js:227`
**功能**:
- 刷新Token时删除旧的refreshToken
- 生成全新的refreshToken
- 防止refreshToken被重复使用

### 3. 登录安全控制

**实现位置**: `loginSecurity.service.js`
**功能**:
- IP频率限制 (防止暴力破解)
- 用户账户锁定机制 (多次失败锁定)
- 完整的登录日志记录

### 4. Token验证流程

**实现位置**: `auth.js:51`
**验证步骤**:
1. 提取Token从Authorization头
2. 验证Token格式
3. 检查黑名单
4. 验证JWT签名和过期时间
5. 检查用户状态
6. 注入用户信息到请求对象

---

## 🧪 联调测试方案确认

### 测试用例1：正常Token刷新 ✅

**测试步骤**：
1. 用户通过 `/v1/auth/login` 登录获取Token
2. 修改 `.env.development` 中 `JWT_ACCESS_EXPIRATION_MINUTES=1` (测试用)
3. 等待1分钟后访问任意需要认证的接口
4. 观察前端是否自动调用 `/v1/auth/refresh-tokens`
5. 检查localStorage中的Token是否已更新

**预期结果**：
- ✅ 返回 401 + AUTH_002 (Token过期)
- ✅ 前端自动刷新Token
- ✅ 原始请求使用新Token重试成功

**后端日志**：
```
[INFO] Token verification failed: TokenExpiredError
[WARN] Token verification failed: jwt expired
[INFO] 令牌刷新成功 - 用户ID: xxx
```

---

### 测试用例2：refreshToken过期 ✅

**测试步骤**：
1. 用户登录获取Token
2. 修改数据库中Token记录的 `expires` 字段为过去时间
3. 手动调用 `/v1/auth/refresh-tokens`
4. 观察返回的错误码和消息

**预期结果**：
- ✅ 返回 401 + AUTH_032 (过期) 或 AUTH_033 (无效)
- ✅ 错误消息: "刷新令牌已过期，请重新登录" 或 "刷新令牌无效，请重新登录"
- ✅ 前端跳转登录页

**后端日志**：
```
[WARN] Token verification failed: jwt expired
[ERROR] 令牌无效或已过期，请重新登录
```

---

### 测试用例3：并发请求Token刷新 ✅

**测试步骤**：
1. accessToken设置为1分钟过期
2. 等待Token过期
3. 前端同时发起3个需要认证的API请求
4. 观察网络请求，检查 `/v1/auth/refresh-tokens` 的调用次数

**预期结果**：
- ✅ 前端只发起一次刷新请求 (前端队列机制)
- ✅ 所有请求等待Token刷新完成
- ✅ 刷新成功后，3个请求使用新Token重试并成功

**后端配合**：
- ✅ 后端支持并发刷新 (使用事务和唯一约束)
- ✅ Token轮换机制防止重复使用

---

## 📈 监控和日志

### 1. Token相关日志

**日志级别和内容**：

```javascript
// 登录成功
[INFO] 用户登录成功 - 用户ID: xxx, IP: 192.168.1.1

// Token刷新成功
[INFO] 令牌刷新成功 - 用户ID: xxx

// Token过期
[WARN] Token verification failed: jwt expired

// Token验证失败
[WARN] Blacklisted token access attempt: xxx...

// 刷新失败
[ERROR] 令牌无效或已过期，请重新登录
```

**日志文件位置**：
- 应用日志: `logs/app.log`
- 错误日志: `logs/error.log`
- 数据库监控: `logs/db-monitoring/`

---

### 2. 监控建议

**关键指标**:
- Token刷新频率 (正常: 约2次/小时/用户)
- Token刷新失败率 (正常: < 1%)
- 用户平均会话时长

**监控工具**: 建议使用 Prometheus + Grafana 或数据库日志查询

---

## ✅ 确认清单

### Token配置
- [x] accessToken有效期：**30分钟** ✅
- [x] refreshToken有效期：**7天** ✅ (已从30天调整为7天)
- [x] Token刷新机制已实现 ✅
- [x] Token黑名单/撤销机制已实现 ✅
- [x] Token轮换机制已实现 ✅

### 接口实现
- [x] `/v1/auth/login` 接口返回格式正确 ✅
- [x] `/v1/auth/refresh-tokens` 接口已实现 ✅
- [x] `/v1/auth/logout` 接口已实现 ✅
- [x] `/v1/auth/user` 接口已实现 ✅
- [x] 错误码 `AUTH_002` (TOKEN_EXPIRED) 已配置 ✅
- [x] 错误码 `AUTH_032` (REFRESH_TOKEN_EXPIRED) 已配置 ✅

### 测试验证
- [ ] 本地环境已完成测试用例1 (待前端联调)
- [ ] 本地环境已完成测试用例2 (待前端联调)
- [ ] 本地环境已完成测试用例3 (待前端联调)

### 文档和监控
- [x] Token过期时间已写入配置文档 ✅
- [ ] Token刷新相关监控已配置 (建议添加)
- [x] 异常情况处理已文档化 ✅

---

## 🚀 后续行动项

### 优先级 P0 (必须完成)
1. ~~**调整refreshToken有效期** (建议从30天改为7天)~~ ✅ **已完成**
   - 责任人: 后端开发
   - 预计时间: 5分钟
   - 状态: ✅ 已完成 (2025-01-10)

2. **重启应用服务** ⚠️ **待执行**
   - 使新的Token配置生效
   - 开发环境: `npm run dev` 或 PM2重启
   - 生产环境: 需运维配合重启
   - 责任人: 后端开发/运维
   - 预计时间: 2分钟
   - 状态: 待执行

3. **前后端联调测试**
   - 责任人: 前端 + 后端
   - 预计时间: 2小时
   - 状态: 待开始

### 优先级 P1 (建议完成)
3. **添加Token刷新监控** (可选)
   - 监控刷新频率、失败率、并发情况
   - 责任人: DevOps
   - 状态: 待规划

---

## 📝 更新记录

| 日期       | 修改人       | 修改内容                                     |
| ---------- | ------------ | -------------------------------------------- |
| 2025-01-10 | [后端负责人] | 初始创建，确认后端配置                       |
| 2025-01-10 | [后端负责人] | 调整refreshToken有效期从30天改为7天 ✅        |
| 2025-01-10 | [后端负责人] | 修复Token过期错误码Bug (AUTH_004→AUTH_002) ✅ |
| 2025-01-10 | [后端负责人] | 修复refreshAuth错误码 (AUTH_013→AUTH_033) ✅  |
| 2025-01-10 | [后端负责人] | 完善文档，补充前端关心的所有确认项 ✅         |

---

## 📚 相关文档

- [Token过期机制前后端对接文档](./Token过期机制沟通文档.md) (前端提供)
- [Moses API 设计规范](../docs/重构说明/Moses-API-设计规范.md)
- [认证中间件实现](../src/middlewares/auth.js)
- [认证服务实现](../src/services/modules/auth/auth.service.js)
- [Token服务实现](../src/services/modules/auth/token.service.js)
- [错误码配置](../src/config/errors/auth/index.js)

---

**备注**：本文档由后端团队提供，用于响应前端的Token过期机制对接需求。所有配置和实现已通过代码审查确认。如有任何疑问或需要调整，请及时联系后端团队。

