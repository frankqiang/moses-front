---
description: API接口开发、Mock服务配置、数据生成和接口管理规范
globs: 
alwaysApply: false
---
# API设计与开发规范

## 规则说明与适用范围
本规则定义了项目中API接口的设计标准、开发规范和最佳实践。所有API相关开发都需遵循此规范，确保接口的一致性、安全性和可维护性。

## RESTful API设计原则

### 核心设计原则
【必须】遵循REST架构风格：
- **资源导向**：使用名词表示资源，HTTP动词表示操作
- **无状态**：每个请求包含完整的处理信息
- **统一接口**：标准化的HTTP方法和状态码
- **可缓存**：明确标识可缓存的响应

### HTTP方法使用规范
```javascript
const HTTP_METHODS = {
  GET: '获取资源，幂等，无副作用',
  POST: '创建资源或执行操作',
  PUT: '完整更新资源，幂等',
  PATCH: '部分更新资源，幂等',
  DELETE: '删除资源，幂等',
} as const;
```

### URL路径设计规范
项目特定路径规范：
1. 所有API路径必须以`/mes`作为前缀
2. 【必须】在前缀后添加版本号，如`/mes/v1`，`/mes/v2`
3. 路径按业务模块组织：`/mes/v1/master-data/xxx`、`/mes/v1/production/xxx`
4. 使用复数名词表示资源：`/mes/v1/users`、`/mes/v1/orders`
5. 使用嵌套路径表示关系：`/mes/v1/users/:id/orders`

```javascript
// ✅ 正确的URL设计
const API_ROUTES = {
  users: '/mes/v1/users',
  userDetail: '/mes/v1/users/:id',
  equipmentTypes: '/mes/v1/master-data/equipment-types',
  workOrders: '/mes/v1/production/work-orders',
  processOperations: '/mes/v1/process-management/operations/:id/work-orders',
}
```

### API版本控制规范
【必须】遵循以下版本控制原则：
1. 在URL路径中明确标识API版本，如`/mes/v1/users`
2. 主版本号(v1, v2)表示不兼容的API变更
3. 次版本号变更通过响应头部`X-API-Version`标识，不在URL中体现
4. 新功能应在新版本中实现，保持旧版本稳定性
5. 版本升级时提供完整的迁移文档

```javascript
// API版本管理示例
const API_VERSIONS = {
  V1: 'v1', // 当前稳定版本
  V2: 'v2'  // 开发中的新版本
};

// 构建带版本的API路径
export function buildApiPath(resource, version = API_VERSIONS.V1) {
  return `/mes/${version}/${resource}`;
}
```

## 统一响应格式规范

### 标准响应结构
【必须】使用一致的响应结构：

```javascript
// 基础响应格式
interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
}

// 分页响应格式
interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// 错误响应格式
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    field?: string;
    details?: any;
  };
  timestamp: string;
}
```

### 响应构建器工具
```javascript
export const createResponse = {
  success: (data, message = '操作成功') => ({
    success: true, data, message, timestamp: new Date().toISOString()
  }),
  error: (code, message, field?, details?) => ({
    success: false, error: { code, message, field, details }, timestamp: new Date().toISOString()
  }),
};
```

## HTTP状态码规范

【必须】正确使用HTTP状态码：
- **2xx 成功**：200(OK)、201(Created)、204(No Content)
- **4xx 客户端错误**：400(Bad Request)、401(Unauthorized)、403(Forbidden)、404(Not Found)、422(Validation Error)
- **5xx 服务器错误**：500(Internal Error)、502(Bad Gateway)、503(Service Unavailable)

## 请求验证与安全规范

### 输入验证标准
【必须】验证所有输入数据，推荐使用第三方验证库如`zod`：

```javascript
import { z } from 'zod';

const CreateUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  role: z.enum(['admin', 'user']).default('user'),
});

export function validateData(schema, data) {
  try {
    return { success: true, data: schema.parse(data), error: null };
  } catch (error) {
    return { success: false, data: null, error: error.errors };
  }
}
```

### 安全防护措施
```javascript
// 请求参数清理和验证
import { formatQueryParams } from '@/utils/formatter'

export function secureApiCall(url, params = {}) {
  return request({
    url,
    params: formatQueryParams(params),
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    }
  });
}
```

## 错误处理与错误码规范

### 统一错误码系统
【必须】使用统一的错误码：

```javascript
export const ERROR_CODES = {
  // 1xxx 通用错误
  INTERNAL_ERROR: 'E1000',
  INVALID_REQUEST: 'E1001',
  UNAUTHORIZED: 'E1002',
  FORBIDDEN: 'E1003',
  NOT_FOUND: 'E1004',
  
  // 2xxx 验证错误
  VALIDATION_ERROR: 'E2000',
  REQUIRED_FIELD_MISSING: 'E2003',
  
  // 3xxx 业务错误
  USER_NOT_FOUND: 'E3000',
  USER_ALREADY_EXISTS: 'E3001',
} as const;
```

## API模块设计标准

### 模块文件结构
每个API模块文件应遵循以下结构：

```javascript
/**
 * 模块名称API
 * 功能描述：提供模块相关的API调用方法
 */
import request from '@/utils/request'
import { formatQueryParams } from '@/utils/formatter'

const BASE_URL = '/mes/module-path'

/**
 * 获取列表数据
 */
export async function getList(query = {}) {
  try {
    const response = await request({
      url: `${BASE_URL}/list`,
      method: 'get',
      params: formatQueryParams(query)
    });
    return createResponse.success(response.data);
  } catch (error) {
    return handleApiError(error);
  }
}

// 其他API方法...
export default { getList, getDetail, create, update, remove }
```

### API命名规范
- **获取列表**：`getList`
- **获取详情**：`getDetail`
- **创建记录**：`create`
- **更新记录**：`update`
- **删除记录**：`remove`
- **批量操作**：`batchXxx`
- **特殊操作**：动词+名词结构

### 目录结构规范
```
src/api/
├── modules/
│   ├── master-data/
│   │   ├── index.js          # 模块统一导出
│   │   ├── equipment.js      # 设备管理API
│   │   └── material.js       # 物料管理API
│   └── production/
├── index.js                  # API总入口
└── base.js                   # 基础API配置
```

## 性能优化与最佳实践

### 请求优化
```javascript
// 使用防抖避免频繁请求
import { debounce } from 'lodash-es';
export const debouncedSearch = debounce(searchApi, 300);

// 请求缓存
const cache = new Map();
export async function getCachedData(key, fetcher, ttl = 5 * 60 * 1000) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }
  const data = await fetcher();
  cache.set(key, { data, timestamp: Date.now() });
  return data;
}
```

### 安全最佳实践
在[src/utils/request.js](mdc:src/utils/request.js)中配置拦截器：
- 请求拦截器：添加认证令牌和安全头
- 响应拦截器：统一处理业务错误和网络错误

## 🔍 API设计质量检查清单

### 核心设计 [P0]
- [ ] **RESTful设计**：是否遵循资源导向原则，正确使用HTTP方法？
- [ ] **统一响应**：所有API响应是否遵循统一格式？
- [ ] **HTTP状态码**：是否根据操作结果正确使用状态码？
- [ ] **输入验证**：所有输入参数是否都经过严格验证？
- [ ] **错误处理**：是否定义并使用统一的错误码规范？
- [ ] **路径规范**：是否使用`/mes/v1`前缀和正确的资源路径？
- [ ] **版本控制**：是否在URL中包含版本信息（如`/mes/v1/...`）？

### 质量与安全 [P1]
- [ ] **参数清理**：是否使用`formatQueryParams`清理查询参数？
- [ ] **认证授权**：是否实施了适当的认证和授权机制？
- [ ] **分页实现**：列表接口是否正确实现分页逻辑？
- [ ] **错误边界**：是否有完整的错误处理和用户友好的错误提示？
- [ ] **API文档**：是否有完整的JSDoc注释说明？
- [ ] **版本兼容性**：新版本API是否考虑了与旧版本的兼容性问题？

### 性能与维护 [P2]
- [ ] **防抖节流**：搜索等频繁操作是否添加了防抖处理？
- [ ] **请求缓存**：是否为适当的接口添加了缓存机制？
- [ ] **版本迁移**：是否提供了版本升级的迁移文档？
- [ ] **代码复用**：是否充分利用了基础工具函数和通用组件？



