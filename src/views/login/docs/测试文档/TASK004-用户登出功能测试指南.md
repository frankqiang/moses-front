# TASK004: 用户登出功能测试指南

## 测试概述

**测试目标:** 验证用户登出功能的完整性和安全性  
**测试范围:** 登出接口调用、本地存储清理、页面跳转、异常处理  
**测试环境:** 开发环境 + Mock数据  
**创建日期:** 2024-01-25  

## 功能描述

用户登出功能实现安全退出登录，包括：
- 调用POST /v1/auth/logout接口
- 清除本地存储的认证信息
- 清除Vuex store中的用户状态
- 跳转到登录页面
- 处理登出过程中的异常情况

## 测试用例

### TC001: 正常登出流程测试

**测试步骤:**
1. 用户已登录系统
2. 点击右上角用户头像，展开下拉菜单
3. 点击"Log Out"菜单项
4. 观察系统响应

**预期结果:**
- 成功调用POST /v1/auth/logout接口
- localStorage中的token、refreshToken被清除
- sessionStorage中的用户信息被清除
- Vuex store中的用户状态被重置
- 自动跳转到登录页面，URL包含redirect参数
- 页面显示登录表单

**验证要点:**
```javascript
// 检查localStorage
console.log('accessToken:', localStorage.getItem('vue_admin_template_token'))
console.log('refreshToken:', localStorage.getItem('vue_admin_template_refresh_token'))

// 检查Vuex store
console.log('用户状态:', this.$store.state.user)

// 检查URL
console.log('当前URL:', window.location.href)
```

### TC002: 登出接口调用验证

**测试步骤:**
1. 打开浏览器开发者工具，切换到Network标签
2. 执行正常登出流程
3. 查看网络请求记录

**预期结果:**
- 发送POST请求到 `/api/v1/auth/logout`
- 请求头包含 `Authorization: Bearer {accessToken}`
- 请求体包含 `{"refreshToken": "xxx"}`
- 请求头包含 `Content-Type: application/json`
- 请求头包含 `X-Requested-With: XMLHttpRequest`

### TC003: 服务端登出成功响应测试

**Mock响应:**
```json
{
  "success": true,
  "data": {},
  "message": "登出成功",
  "meta": {
    "timestamp": "2024-01-25T10:30:00Z",
    "requestId": "req_123456"
  }
}
```

**预期结果:**
- 本地存储被清除
- 用户状态被重置
- 跳转到登录页面

### TC004: 服务端登出失败响应测试

**测试场景1: 400 Bad Request (VAL_002)**
```json
{
  "success": false,
  "error": {
    "code": "VAL_002",
    "message": "缺少必需的参数: refreshToken"
  }
}
```

**测试场景2: 401 Unauthorized (AUTH_001)**
```json
{
  "success": false,
  "error": {
    "code": "AUTH_001",
    "message": "请先登录"
  }
}
```

**测试场景3: 404 Not Found (AUTH_033)**
```json
{
  "success": false,
  "error": {
    "code": "AUTH_033",
    "message": "无效的刷新令牌"
  }
}
```

**预期结果:**
- 即使服务端返回错误，本地存储仍被清除
- 用户状态仍被重置
- 仍跳转到登录页面
- 确保前端安全性

### TC005: 网络异常测试

**测试步骤:**
1. 断开网络连接或设置网络延迟
2. 执行登出操作
3. 观察系统行为

**预期结果:**
- 即使网络请求失败，本地存储仍被清除
- 用户状态仍被重置
- 仍跳转到登录页面
- 不会因网络问题导致用户无法登出

### TC006: 并发登出测试

**测试步骤:**
1. 在多个浏览器标签页中打开同一系统
2. 在其中一个标签页执行登出操作
3. 观察其他标签页的状态

**预期结果:**
- 执行登出的标签页正常跳转到登录页
- 其他标签页在下次操作时会因token失效而跳转到登录页

### TC007: 页面跳转参数测试

**测试步骤:**
1. 在系统内页面（如 `/dashboard`）执行登出操作
2. 检查跳转后的URL

**预期结果:**
- 跳转到 `/login?redirect=/dashboard`
- redirect参数正确保存了登出前的页面路径

## 安全性测试

### ST001: 敏感信息清理验证

**验证项目:**
- [ ] localStorage中的所有token信息被完全清除
- [ ] sessionStorage中的用户信息被完全清除
- [ ] Vuex store中的敏感数据被重置
- [ ] 浏览器内存中不残留敏感信息

### ST002: 登出后访问控制验证

**测试步骤:**
1. 执行登出操作
2. 尝试直接访问需要认证的页面
3. 尝试调用需要认证的API

**预期结果:**
- 直接访问受保护页面时自动跳转到登录页
- API调用返回401未授权错误

## 性能测试

### PT001: 登出响应时间测试

**测试标准:**
- 登出操作响应时间 < 2秒
- 页面跳转时间 < 1秒
- 本地存储清理时间 < 100ms

## 兼容性测试

### CT001: 浏览器兼容性

**测试浏览器:**
- [ ] Chrome (最新版本)
- [ ] Firefox (最新版本)
- [ ] Safari (最新版本)
- [ ] Edge (最新版本)

### CT002: 设备兼容性

**测试设备:**
- [ ] 桌面端
- [ ] 平板端
- [ ] 移动端

## 回归测试检查清单

在每次代码变更后，执行以下检查：

- [ ] TC001: 正常登出流程测试
- [ ] TC004: 服务端登出失败响应测试
- [ ] TC005: 网络异常测试
- [ ] ST001: 敏感信息清理验证
- [ ] ST002: 登出后访问控制验证

## 测试数据

### 测试用户账号
```
用户名: admin
密码: 123456
```

### Mock API配置
```javascript
// 成功响应
{
  url: '/api/v1/auth/logout',
  method: 'post',
  response: {
    success: true,
    data: {},
    message: '登出成功'
  }
}

// 失败响应（用于异常测试）
{
  url: '/api/v1/auth/logout',
  method: 'post',
  response: {
    success: false,
    error: {
      code: 'AUTH_001',
      message: '请先登录'
    }
  }
}
```

## 已知问题

目前无已知问题。

## 测试结论

**P0阶段功能测试结果:**
- ✅ 登出接口集成正常
- ✅ 本地存储清理完整
- ✅ 用户状态重置正确
- ✅ 页面跳转逻辑正确
- ✅ 异常处理安全可靠

**总体评估:** TASK004用户登出功能已满足P0阶段所有验收标准，可以投入使用。

---

**文档版本:** v1.0  
**最后更新:** 2024-01-25  
**测试负责人:** 开发团队