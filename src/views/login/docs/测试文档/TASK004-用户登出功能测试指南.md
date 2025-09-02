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
