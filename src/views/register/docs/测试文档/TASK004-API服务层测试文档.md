# TASK004: API服务层开发 - 测试文档

## 测试概述

本文档提供了用户注册管理API服务层的完整测试指南，包括功能测试、错误处理测试和数据验证测试。

**测试文件位置:** `src/api/register.js`

**测试范围:** P0阶段所有功能

---

## 1. 环境准备

### 1.1 前置条件

- 确保项目已正确安装依赖：`npm install`
- 确保后端API服务正常运行
- 确保网络连接正常

### 1.2 测试工具

- 浏览器开发者工具（Network面板）
- Vue DevTools（可选）
- Postman或类似API测试工具（用于对比验证）

---

## 2. 功能测试

### 2.1 注册申请API测试 (submitRegistration)

#### 测试步骤：

1. **在浏览器控制台中导入API模块：**
   ```javascript
   // 在项目中任意页面的控制台执行
   import { submitRegistration } from '@/api/register'
   ```

2. **测试正常提交：**
   ```javascript
   const testData = {
     applicantName: '张三',
     applicantEmail: 'zhangsan@example.com',
     username: 'zhangsan2024',
     password: 'Test123456!',
     confirmPassword: 'Test123456!',
     phoneNumber: '13800138000',
     department: 'IT部门',
     position: '软件工程师',
     reason: '申请系统访问权限用于日常工作'
   }
   
   submitRegistration(testData)
     .then(response => {
       console.log('提交成功:', response)
       // 预期结果：返回包含id、status、createdAt等字段的对象
     })
     .catch(error => {
       console.error('提交失败:', error)
     })
   ```

3. **验证响应数据格式：**
   - 检查返回数据是否包含 `id`、`status`、`createdAt` 字段
   - 检查 `status` 是否为 'pending'
   - 检查 `createdAt` 是否为有效的ISO日期格式

#### 预期结果：
```javascript
{
  id: "REG_20240115_001",
  status: "pending",
  createdAt: "2024-01-15T10:30:00.000Z",
  applicantName: "张三",
  applicantEmail: "zhangsan@example.com",
  username: "zhangsan2024"
}
```

### 2.2 状态查询API测试 (getApplicationStatus)

#### 测试步骤：

1. **使用有效的申请ID查询：**
   ```javascript
   import { getApplicationStatus } from '@/api/register'
   
   const applicationId = 'REG_20240115_001' // 使用上一步返回的ID
   
   getApplicationStatus(applicationId)
     .then(response => {
       console.log('查询成功:', response)
       // 预期结果：返回完整的申请信息
     })
     .catch(error => {
       console.error('查询失败:', error)
     })
   ```

2. **验证响应数据格式：**
   - 检查返回数据包含所有申请字段
   - 检查状态格式化是否正确
   - 检查日期格式是否友好显示

#### 预期结果：
```javascript
{
  id: "REG_20240115_001",
  applicantName: "张三",
  applicantEmail: "zhangsan@example.com",
  username: "zhangsan2024",
  department: "IT部门",
  position: "软件工程师",
  reason: "申请系统访问权限用于日常工作",
  status: "pending",
  statusDisplay: "待审核",
  statusIcon: "el-icon-time",
  statusType: "warning",
  createdAt: "2024-01-15T10:30:00.000Z",
  createdAtDisplay: "2024年01月15日 10:30",
  updatedAt: "2024-01-15T10:30:00.000Z",
  updatedAtDisplay: "2024年01月15日 10:30"
}
```

---

## 3. 数据验证测试

### 3.1 必填字段验证

#### 测试步骤：

1. **测试缺少必填字段：**
   ```javascript
   const incompleteData = {
     applicantName: '张三'
     // 缺少其他必填字段
   }
   
   submitRegistration(incompleteData)
     .then(response => {
       console.log('不应该成功:', response)
     })
     .catch(error => {
       console.log('预期的验证错误:', error.message)
       // 预期：显示具体缺少哪些字段
     })
   ```

#### 预期结果：
- 抛出验证错误，明确指出缺少的必填字段

### 3.2 格式验证测试

#### 测试步骤：

1. **测试邮箱格式验证：**
   ```javascript
   const invalidEmailData = {
     applicantName: '张三',
     applicantEmail: 'invalid-email', // 无效邮箱格式
     username: 'zhangsan2024',
     password: 'Test123456!',
     confirmPassword: 'Test123456!'
   }
   
   submitRegistration(invalidEmailData)
     .catch(error => {
       console.log('邮箱格式错误:', error.message)
       // 预期：提示邮箱格式不正确
     })
   ```

2. **测试用户名格式验证：**
   ```javascript
   const invalidUsernameData = {
     applicantName: '张三',
     applicantEmail: 'zhangsan@example.com',
     username: 'ab', // 用户名太短
     password: 'Test123456!',
     confirmPassword: 'Test123456!'
   }
   
   submitRegistration(invalidUsernameData)
     .catch(error => {
       console.log('用户名格式错误:', error.message)
       // 预期：提示用户名长度不符合要求
     })
   ```

3. **测试密码格式验证：**
   ```javascript
   const weakPasswordData = {
     applicantName: '张三',
     applicantEmail: 'zhangsan@example.com',
     username: 'zhangsan2024',
     password: '123456', // 弱密码
     confirmPassword: '123456'
   }
   
   submitRegistration(weakPasswordData)
     .catch(error => {
       console.log('密码强度错误:', error.message)
       // 预期：提示密码强度不够
     })
   ```

4. **测试手机号格式验证：**
   ```javascript
   const invalidPhoneData = {
     applicantName: '张三',
     applicantEmail: 'zhangsan@example.com',
     username: 'zhangsan2024',
     password: 'Test123456!',
     confirmPassword: 'Test123456!',
     phoneNumber: '123' // 无效手机号
   }
   
   submitRegistration(invalidPhoneData)
     .catch(error => {
       console.log('手机号格式错误:', error.message)
       // 预期：提示手机号格式不正确
     })
   ```

---

## 4. 错误处理测试

### 4.1 业务错误测试

#### 测试步骤：

1. **测试用户名已存在错误：**
   ```javascript
   // 使用已存在的用户名
   const duplicateUsernameData = {
     applicantName: '李四',
     applicantEmail: 'lisi@example.com',
     username: 'existinguser', // 已存在的用户名
     password: 'Test123456!',
     confirmPassword: 'Test123456!'
   }
   
   submitRegistration(duplicateUsernameData)
     .catch(error => {
       console.log('用户名冲突错误:', error)
       // 预期：显示"用户名已被使用，请更换用户名"
     })
   ```

2. **测试邮箱已存在错误：**
   ```javascript
   // 使用已存在的邮箱
   const duplicateEmailData = {
     applicantName: '王五',
     applicantEmail: 'existing@example.com', // 已存在的邮箱
     username: 'wangwu2024',
     password: 'Test123456!',
     confirmPassword: 'Test123456!'
   }
   
   submitRegistration(duplicateEmailData)
     .catch(error => {
       console.log('邮箱冲突错误:', error)
       // 预期：显示"邮箱已被使用，请更换邮箱"
     })
   ```

3. **测试申请记录不存在错误：**
   ```javascript
   getApplicationStatus('INVALID_ID')
     .catch(error => {
       console.log('记录不存在错误:', error)
       // 预期：显示"申请记录不存在"
     })
   ```

### 4.2 网络错误测试

#### 测试步骤：

1. **模拟网络断开：**
   - 断开网络连接
   - 执行API调用
   - 观察错误处理

2. **模拟服务器错误：**
   - 在Network面板中模拟500错误
   - 观察错误处理和用户提示

---

## 5. 性能测试

### 5.1 响应时间测试

#### 测试步骤：

1. **测量API响应时间：**
   ```javascript
   const startTime = performance.now()
   
   submitRegistration(testData)
     .then(response => {
       const endTime = performance.now()
       console.log(`API响应时间: ${endTime - startTime}ms`)
       // 预期：响应时间应在合理范围内（通常<2000ms）
     })
   ```

### 5.2 并发请求测试

#### 测试步骤：

1. **测试多个并发请求：**
   ```javascript
   const promises = []
   for (let i = 0; i < 5; i++) {
     const data = { ...testData, username: `user${i}` }
     promises.push(submitRegistration(data))
   }
   
   Promise.allSettled(promises)
     .then(results => {
       console.log('并发请求结果:', results)
       // 检查是否所有请求都正确处理
     })
   ```

---

## 6. 验收标准检查清单

### ✅ P0阶段功能验收

- [ ] **submitRegistration API**
  - [ ] 正常提交返回正确的响应格式
  - [ ] 包含所有必需的响应字段
  - [ ] 请求数据验证正常工作
  - [ ] 错误处理正确显示用户友好消息

- [ ] **getApplicationStatus API**
  - [ ] 正常查询返回完整申请信息
  - [ ] 状态格式化正确显示
  - [ ] 日期格式化用户友好
  - [ ] 无效ID处理正确

- [ ] **数据验证功能**
  - [ ] 必填字段验证生效
  - [ ] 邮箱格式验证正确
  - [ ] 用户名格式验证正确
  - [ ] 密码强度验证正确
  - [ ] 手机号格式验证正确

- [ ] **错误处理功能**
  - [ ] 业务错误正确分类和显示
  - [ ] 网络错误正确处理
  - [ ] 错误消息用户友好
  - [ ] 错误码映射正确

- [ ] **响应格式化功能**
  - [ ] 状态显示格式化正确
  - [ ] 日期显示格式化正确
  - [ ] 图标和样式类型正确

---

## 7. 常见问题排查

### 7.1 API调用失败

**问题现象：** API调用返回错误或无响应

**排查步骤：**
1. 检查网络连接
2. 检查后端服务是否运行
3. 检查API基础URL配置
4. 检查请求头配置
5. 查看浏览器Network面板的详细错误信息

### 7.2 数据验证失败

**问题现象：** 数据验证不生效或验证错误

**排查步骤：**
1. 检查输入数据格式
2. 检查验证规则配置
3. 查看控制台错误信息
4. 确认验证函数逻辑

### 7.3 错误处理不正确

**问题现象：** 错误消息显示不正确或不友好

**排查步骤：**
1. 检查错误码映射配置
2. 检查错误处理函数逻辑
3. 确认后端返回的错误格式
4. 查看错误处理流程

---

## 8. 测试报告模板

### 测试执行记录

**测试日期：** ___________
**测试人员：** ___________
**测试环境：** ___________

| 测试项目 | 测试结果 | 问题描述 | 备注 |
|---------|---------|---------|------|
| submitRegistration正常提交 | ☐ 通过 ☐ 失败 | | |
| getApplicationStatus正常查询 | ☐ 通过 ☐ 失败 | | |
| 数据验证功能 | ☐ 通过 ☐ 失败 | | |
| 错误处理功能 | ☐ 通过 ☐ 失败 | | |
| 响应格式化功能 | ☐ 通过 ☐ 失败 | | |

**总体评价：** ☐ 通过 ☐ 需要修复

**问题汇总：**
1. ___________
2. ___________
3. ___________

**建议：**
1. ___________
2. ___________
3. ___________