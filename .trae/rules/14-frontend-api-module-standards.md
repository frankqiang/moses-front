# 前端API模块开发规范

## 1. 统一错误处理机制

### 1.1 错误码和错误消息解析

```javascript
/**
 * 统一错误处理函数
 * 优先级：后端消息 > 错误码分类 > 默认消息
 */
export function handleApiError(error) {
  if (!error) {
    return '操作失败，请稍后重试'
  }

  // 优先使用后端返回的错误消息
  if (error.message && error.message.trim()) {
    return error.message
  }

  // 根据错误码前缀进行分类处理
  if (error.code) {
    if (error.code.startsWith('VAL_')) {
      return '请检查输入信息是否正确'
    }
    if (error.code.startsWith('BIZ_')) {
      return '业务处理失败，请检查数据后重试'
    }
    if (error.code.startsWith('AUTH_')) {
      return '权限验证失败，请重新登录'
    }
    if (error.code.includes('NETWORK') || error.code.includes('TIMEOUT')) {
      return '网络连接异常，请检查网络后重试'
    }
  }

  return '操作失败，请稍后重试'
}
```

### 1.2 全局错误提示展示规则

```javascript
// 错误提示类型映射
const ERROR_TYPES = {
  VAL_: 'warning',    // 验证错误 - 警告提示
  BIZ_: 'error',      // 业务错误 - 错误提示
  AUTH_: 'error',     // 权限错误 - 错误提示
  NETWORK: 'error'    // 网络错误 - 错误提示
}

// 统一错误提示函数
export function showErrorMessage(error) {
  const message = handleApiError(error)
  const type = getErrorType(error.code)
  
  this.$message({
    message,
    type,
    duration: type === 'error' ? 5000 : 3000
  })
}
```

## 2. API模块开发标准

### 2.1 请求参数格式规范

```javascript
/**
 * 请求数据验证函数
 * @param {Object} data - 请求数据
 * @param {Object} rules - 验证规则
 * @returns {Object} 验证结果
 */
export function validateRequestData(data, rules) {
  const errors = []
  
  // 必填字段验证
  if (rules.required) {
    rules.required.forEach(field => {
      if (!data[field] || data[field].toString().trim() === '') {
        errors.push(`${field}为必填项`)
      }
    })
  }
  
  // 格式验证
  if (rules.format) {
    Object.keys(rules.format).forEach(field => {
      if (data[field] && !rules.format[field].test(data[field])) {
        errors.push(`${field}格式不正确`)
      }
    })
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// 使用示例
const validation = validateRequestData(data, {
  required: ['username', 'email', 'password'],
  format: {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^1[3-9]\d{9}$/
  }
})
```

### 2.2 响应数据处理流程

```javascript
/**
 * 统一响应数据处理
 * @param {Object} response - 原始响应数据
 * @returns {Object} 格式化后的响应数据
 */
export function formatResponse(response) {
  return {
    success: response.success || false,
    data: response.data || null,
    message: response.message || '',
    code: response.code || '',
    timestamp: response.timestamp || Date.now()
  }
}

// API调用标准模板
export async function apiCall(apiFunction, data, options = {}) {
  try {
    const response = await apiFunction(data)
    const formattedResponse = formatResponse(response)
    
    if (!formattedResponse.success) {
      throw new Error(formattedResponse.message || '请求失败')
    }
    
    return formattedResponse.data
  } catch (error) {
    if (options.showError !== false) {
      showErrorMessage(error)
    }
    throw error
  }
}
```

### 2.3 接口状态码映射规则

```javascript
// HTTP状态码处理
const HTTP_STATUS_HANDLERS = {
  200: (response) => response,
  400: (response) => ({ code: 'VAL_001', message: '请求参数错误' }),
  401: (response) => ({ code: 'AUTH_001', message: '未授权访问' }),
  403: (response) => ({ code: 'AUTH_002', message: '权限不足' }),
  404: (response) => ({ code: 'BIZ_001', message: '资源不存在' }),
  500: (response) => ({ code: 'SYS_001', message: '服务器内部错误' })
}

// 业务状态码映射
const BUSINESS_CODE_MAP = {
  'VAL_': '数据验证错误',
  'BIZ_': '业务逻辑错误', 
  'AUTH_': '权限认证错误',
  'SYS_': '系统错误',
  'NETWORK_': '网络错误'
}
```

## 3. 最佳实践要求

### 3.1 模块化组织方式

```
src/views/[module]/api/
├── index.js          # API入口文件
├── [module].js       # 主要API方法
├── types.js          # TypeScript类型定义
└── constants.js      # 常量定义
```

**index.js 模板：**
```javascript
// API模块入口文件
export * from './[module]'
export { default as [module]Api } from './[module]'
```

**[module].js 模板：**
```javascript
import request from '@/utils/request'
import { validateRequestData, handleApiError } from '@/utils/api-helpers'

// API基础路径
const API_BASE = '/api/[module]'

/**
 * 模块API方法
 * @param {Object} data - 请求数据
 * @returns {Promise} API响应
 */
export async function methodName(data) {
  // 数据验证
  const validation = validateRequestData(data, VALIDATION_RULES)
  if (!validation.isValid) {
    throw new Error(validation.errors.join(', '))
  }

  try {
    const response = await request({
      url: `${API_BASE}/endpoint`,
      method: 'post',
      data
    })
    return formatResponse(response)
  } catch (error) {
    throw new Error(handleApiError(error))
  }
}
```

### 3.2 统一的请求封装方法

```javascript
// 通用请求封装
export class ApiService {
  constructor(baseURL, options = {}) {
    this.baseURL = baseURL
    this.options = options
  }

  async request(config) {
    const finalConfig = {
      ...this.options,
      ...config,
      url: `${this.baseURL}${config.url}`
    }

    try {
      const response = await request(finalConfig)
      return this.handleResponse(response)
    } catch (error) {
      return this.handleError(error)
    }
  }

  handleResponse(response) {
    return formatResponse(response)
  }

  handleError(error) {
    const errorMessage = handleApiError(error)
    throw new Error(errorMessage)
  }

  // 便捷方法
  get(url, params) {
    return this.request({ url, method: 'get', params })
  }

  post(url, data) {
    return this.request({ url, method: 'post', data })
  }

  put(url, data) {
    return this.request({ url, method: 'put', data })
  }

  delete(url) {
    return this.request({ url, method: 'delete' })
  }
}
```

### 3.3 类型安全处理方案

```javascript
// JSDoc类型注释规范
/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success - 请求是否成功
 * @property {*} data - 响应数据
 * @property {string} message - 响应消息
 * @property {string} code - 响应码
 */

/**
 * @typedef {Object} RequestConfig
 * @property {string} url - 请求URL
 * @property {string} method - 请求方法
 * @property {Object} [data] - 请求数据
 * @property {Object} [params] - 查询参数
 */

// 运行时类型检查
export function validateApiResponse(response) {
  const requiredFields = ['success', 'data', 'message', 'code']
  const missingFields = requiredFields.filter(field => !(field in response))
  
  if (missingFields.length > 0) {
    console.warn(`API响应缺少字段: ${missingFields.join(', ')}`)
  }
  
  return response
}
```

## 4. 开发检查清单

### 4.1 代码质量检查
- [ ] 通过ESLint检查
- [ ] 添加完整的JSDoc注释
- [ ] 实现错误处理机制
- [ ] 添加数据验证逻辑

### 4.2 功能完整性检查
- [ ] API方法命名规范
- [ ] 请求参数验证
- [ ] 响应数据格式化
- [ ] 错误状态处理

### 4.3 性能优化检查
- [ ] 避免重复请求
- [ ] 实现请求缓存（如需要）
- [ ] 添加加载状态管理
- [ ] 优化错误提示体验

## 5. 使用示例

```javascript
// 完整的API模块使用示例
import { ApiService } from '@/utils/api-service'
import { validateRequestData, handleApiError } from '@/utils/api-helpers'

const userApi = new ApiService('/api/user')

export async function createUser(userData) {
  // 数据验证
  const validation = validateRequestData(userData, {
    required: ['username', 'email'],
    format: {
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    }
  })
  
  if (!validation.isValid) {
    throw new Error(validation.errors.join(', '))
  }

  try {
    const response = await userApi.post('/create', userData)
    return response.data
  } catch (error) {
    throw new Error(handleApiError(error))
  }
}
```

---

**注意事项：**
1. 所有API方法必须包含错误处理
2. 优先使用后端返回的错误消息
3. 保持代码简洁，避免过度封装
4. 遵循项目的命名规范和代码风格
5. 定期更新和维护API文档