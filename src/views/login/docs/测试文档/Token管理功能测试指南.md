# Token管理与自动刷新功能测试指南

## 测试环境准备

### 1. 启动开发服务器
```bash
npm run dev
```

### 2. 打开浏览器开发者工具
- 按F12打开开发者工具
- 切换到Network（网络）标签页
- 切换到Application（应用程序）标签页查看Storage


## 功能测试步骤

### 测试1：用户登录与Token存储

**测试目标**：验证登录成功后Token正确存储

**测试步骤**：
1. 访问登录页面：`http://localhost:9528/login`
2. 输入有效的用户名和密码
3. 勾选"记住我"选项
4. 点击登录按钮
5. 观察Network标签页中的登录请求
6. 检查Application > Local Storage中是否存储了以下数据：
   - `moses_auth_data`（用户认证数据，包含token、用户信息、安全信息等）

**预期结果**：
- 登录成功，跳转到Dashboard页面
- Local Storage中正确存储了moses_auth_data信息
- moses_auth_data.user.rememberMe状态为true
- moses_auth_data.token包含access和refresh令牌

### 测试2：请求拦截器自动添加Authorization头

**测试目标**：验证所有API请求自动携带Authorization头

**测试步骤**：
1. 登录成功后，在Dashboard页面
2. 打开Network标签页
3. 刷新页面或进行任何API操作
4. 观察所有API请求的Headers
5. 检查是否包含`Authorization: Bearer <token>`头

**预期结果**：
- 所有API请求都自动携带Authorization头
- Authorization头格式正确：`Bearer <access_token>`

### 测试3：Token过期自动刷新

**测试目标**：验证Token过期时自动刷新机制

**模拟Token过期的方法**：

#### 方法1：修改Token过期时间（推荐）
1. 在浏览器Console中执行：
```javascript
// 设置一个即将过期的token（1分钟后过期）
const authData = JSON.parse(localStorage.getItem('moses_auth_data') || '{}')
const expiredToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJtb3NlcyIsImF1ZCI6Im1vc2VzIiwiaWF0IjoxNjQwOTk1MjAwLCJleHAiOjE2NDA5OTUyNjAsInVzZXJfaWQiOiIxMjMiLCJ1c2VybmFtZSI6InRlc3QifQ.test'
authData.token = { ...authData.token, access: expiredToken }
localStorage.setItem('moses_auth_data', JSON.stringify(authData))
```

#### 方法2：清空Token模拟过期
1. 在Console中执行：
```javascript
const authData = JSON.parse(localStorage.getItem('moses_auth_data') || '{}')
delete authData.token
localStorage.setItem('moses_auth_data', JSON.stringify(authData))
```

**测试步骤**：
1. 使用上述方法之一模拟Token过期
2. 在页面中进行任何需要认证的操作（如访问用户信息）
3. 观察Network标签页
4. 检查是否发起了刷新Token的请求：`POST /v1/auth/refresh-tokens`
5. 观察刷新成功后是否重新发起原始请求
6. 检查Local Storage中moses_auth_data.token是否更新

**预期结果**：
- 检测到401错误后自动发起Token刷新请求
- 刷新成功后更新Local Storage中moses_auth_data.token
- 自动重新发起原始失败的请求
- 用户无感知，操作正常完成

### 测试4：并发请求时的Token刷新

**测试目标**：验证多个请求同时遇到401时，只发起一次刷新请求

**测试步骤**：
1. 模拟Token过期（使用测试3的方法）
2. 在Console中快速执行多个API请求：
```javascript
// 快速发起多个请求
Promise.all([
  fetch('/api/user/info', { headers: { 'Authorization': 'Bearer invalid_token' } }),
  fetch('/api/dashboard/data', { headers: { 'Authorization': 'Bearer invalid_token' } }),
  fetch('/api/menu/list', { headers: { 'Authorization': 'Bearer invalid_token' } })
])
```
3. 观察Network标签页中的请求
4. 统计刷新Token请求的数量

**预期结果**：
- 只发起一次`POST /v1/auth/refresh-tokens`请求
- 所有失败的请求在Token刷新后都会重新发起
- 避免了重复刷新Token的问题

### 测试5：刷新Token失败处理

**测试目标**：验证刷新Token失败时的处理逻辑

**测试步骤**：
1. 在Console中设置无效的refresh token：
```javascript
const authData = JSON.parse(localStorage.getItem('moses_auth_data') || '{}')
authData.token = {
  access: null,
  refresh: 'invalid_refresh_token',
  expiresAt: null,
  storage: authData.token?.storage || 'localStorage'
}
localStorage.setItem('moses_auth_data', JSON.stringify(authData))
```
2. 进行任何需要认证的操作
3. 观察Network标签页中的刷新请求
4. 检查是否跳转到登录页面
5. 检查Local Storage中的moses_auth_data是否被清空

**预期结果**：
- 刷新Token请求返回401或403错误
- 自动清空所有存储的认证信息
- 跳转到登录页面
- 显示相应的错误提示

### 测试6：记住我功能

**测试目标**：验证记住我功能的存储策略

**测试步骤**：
1. **测试记住我=true**：
   - 登录时勾选"记住我"
   - 检查Application > Local Storage中moses_auth_data.user.rememberMe为true
   - 检查moses_auth_data.token.storage为"localStorage"
   - 检查moses_auth_data.token.access包含有效的token值
   - 关闭浏览器重新打开，检查是否仍然登录

2. **测试记住我=false**：
   - 登录时不勾选"记住我"
   - 检查Application > Session Storage中moses_auth_data.user.rememberMe为false
   - 检查moses_auth_data.token.storage为"sessionStorage"
   - 检查moses_auth_data.token.access包含有效的token值
   - 检查Application > Local Storage中moses_auth_data.token.access为null（只保存用户名等非敏感信息）
   - 关闭浏览器重新打开，检查是否需要重新登录

**预期结果**：
- 记住我=true时，完整的认证数据（包括token）存储在localStorage中，关闭浏览器后仍保持登录
- 记住我=false时，完整的认证数据存储在sessionStorage中，localStorage中只保存不包含token的用户信息，关闭浏览器后需要重新登录

### 测试7：登出功能

**测试目标**：验证登出时正确清理Token

**测试步骤**：
1. 确保已登录状态
2. 点击用户头像或登出按钮
3. 观察Network标签页中的登出请求
4. 检查Local Storage中的moses_auth_data是否被清空
5. 检查是否跳转到登录页面
6. 特别注意：如果发现请求路径为`/v1/v1/auth/logout`（重复路径），需要检查API配置

**预期结果**：
- 发起`POST /v1/auth/logout`请求（注意：如果出现重复路径如/v1/v1/auth/logout，需要检查API配置）
- 清空所有存储的认证信息（moses_auth_data）
- 跳转到登录页面

## 错误场景测试

### 测试8：网络异常处理

**测试步骤**：
1. 在开发者工具中模拟网络异常：
   - Network标签页 > 选择"Offline"模式
2. 尝试进行需要认证的操作
3. 恢复网络连接
4. 检查请求是否正常恢复

**预期结果**：
- 网络异常时显示相应错误提示
- 网络恢复后功能正常

### 测试9：服务器错误处理

**测试步骤**：
1. 在Network标签页中拦截刷新Token请求
2. 模拟服务器返回500错误
3. 观察前端的错误处理

**预期结果**：
- 显示服务器错误提示
- 不会无限重试
- 提供合理的用户反馈

## 性能测试

### 测试10：Token刷新性能

**测试目标**：验证Token刷新的性能表现

**测试步骤**：
1. 使用Performance标签页记录性能
2. 模拟Token过期并触发刷新
3. 分析刷新过程的耗时
4. 检查是否有内存泄漏

**预期结果**：
- Token刷新过程耗时合理（< 2秒）
- 无内存泄漏
- 用户体验流畅

## 总结

通过以上详细的测试步骤，可以全面验证Token管理与自动刷新功能的正确性、稳定性和用户体验。建议在每次代码变更后都执行核心测试用例，确保功能的可靠性。
