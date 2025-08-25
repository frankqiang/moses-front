# API设计与开发规范

## 规则说明与适用范围
本规则定义了项目中API接口的设计标准、开发规范和最佳实践。所有API相关开发都需遵循此规范，确保接口的一致性、安全性和可维护性。

## 标准化注释模板

### API文档注释规范
【必须】每个API接口文件头部使用以下标准化注释模板：

```javascript
/**
 * 接口名称
 * 功能描述：详细说明接口的业务功能和使用场景
 * 入参说明：
 *   @param {类型} 参数名 - 参数说明，是否必填，取值范围等
 *   @param {类型} [可选参数] - 可选参数说明，默认值等
 * 返回参数说明：
 *   @returns {类型} 字段名 - 字段说明
 *   @returns {类型} 对象.子字段 - 嵌套对象字段说明
 *   @returns {类型[]} 数组字段 - 数组字段说明
 *     @returns {类型} 数组字段[].子字段 - 数组元素的子字段说明
 * url地址：完整的API路径
 * 请求方式：HTTP方法（GET/POST/PUT/DELETE等）
 */
```

### 字段注释格式规范
【必须】参数和返回值字段必须包含以下信息：
- **数据类型**：string、number、boolean、object、array等
- **字段说明**：清晰描述字段的含义和用途
- **是否必填**：使用[]表示可选参数
- **取值范围**：枚举值、数值范围、字符串长度等
- **默认值**：可选参数的默认值
- **特殊说明**：格式要求、业务规则等

### 具体示例
```javascript
/**
 * 获取检验项目列表
 * 功能描述：查询检验项目数据，支持分页和条件筛选
 * 入参说明：
 *   @param {number} page - 页码，从1开始
 *   @param {number} limit - 每页数量，建议10-100
 *   @param {string} [keyword] - 搜索关键词，支持项目名称模糊查询
 *   @param {string} [status] - 状态筛选，可选值：active|inactive|all
 * 返回参数说明：
 *   @returns {boolean} success - 请求是否成功
 *   @returns {InspectionItem[]} data - 检验项目列表
 *     @returns {string} data[].id - 项目ID
 *     @returns {string} data[].name - 项目名称
 *     @returns {string} data[].code - 项目编码
 *     @returns {string} data[].status - 项目状态
 *     @returns {string} data[].createdAt - 创建时间
 *   @returns {PaginationInfo} pagination - 分页信息
 *     @returns {number} pagination.page - 当前页码
 *     @returns {number} pagination.limit - 每页数量
 *     @returns {number} pagination.total - 总记录数
 *     @returns {boolean} pagination.hasNext - 是否有下一页
 *     @returns {boolean} pagination.hasPrev - 是否有上一页
 * url地址：/api/v1/quality/inspection-items
 * 请求方式：GET
 */
export function getInspectionItemList(params) {
  return request({
    url: '/api/v1/quality/inspection-items',
    method: 'get',
    params: formatQueryParams(params)
  });
}
```

## RESTful API设计原则

### 核心设计原则
【必须】遵循REST架构风格：
- **资源导向**：使用名词表示资源，HTTP动词表示操作
- **无状态**：每个请求包含完整的处理信息
- **统一接口**：标准化的HTTP方法和状态码
- **可缓存**：明确标识可缓存的响应

### HTTP方法使用规范
- **GET**：获取资源，幂等，无副作用
- **POST**：创建资源或执行操作
- **PUT**：完整更新资源，幂等
- **PATCH**：部分更新资源，幂等
- **DELETE**：删除资源，幂等

### URL路径设计规范

#### 基础路径结构
【推荐】采用更简洁的API路径设计：
```
/api/v{version}/{module}/{resource}
```

#### 具体规范
1. **API前缀**：使用`/api`作为统一前缀，简洁明了
2. **版本控制**：紧跟版本号`/v1`、`/v2`，便于版本管理
3. **模块分组**：按业务领域分组，使用简短英文名称
   - `/api/v1/quality` - 质量管理模块
   - `/api/v1/production` - 生产管理模块
   - `/api/v1/master` - 主数据模块
   - `/api/v1/users` - 用户管理模块
4. **资源命名**：使用复数名词表示资源集合
5. **层级关系**：合理使用嵌套路径表示资源关系

#### 路径设计最佳实践
- **简洁性**：路径层级不超过4层，避免过深嵌套
- **语义化**：路径能清晰表达资源含义和操作意图
- **一致性**：同类资源使用统一的命名规范
- **可读性**：使用连字符分隔多个单词，如`inspection-items`

#### 示例对比
```javascript
// ❌ 旧版本（过于冗长）
/mes/v1/quality-management/inspection-items
/mes/v1/master-data/material-codes

// ✅ 推荐版本（简洁明了）
/api/v1/quality/inspection-items
/api/v1/master/material-codes
```

### API版本控制规范
【必须】遵循以下版本控制原则：
1. **URL版本标识**：在URL路径中明确标识API版本，如`/api/v1/users`
2. **版本号规则**：
   - 主版本号(v1, v2)：表示不兼容的API变更
   - 次版本号：通过HTTP头部`API-Version: 1.1`表示兼容性更新
3. **版本策略**：
   - 新功能优先在新版本中实现
   - 保持旧版本的稳定性和向后兼容
   - 同时维护不超过3个主版本
4. **版本生命周期**：
   - 新版本发布后，旧版本至少维护6个月
   - 提前3个月通知版本废弃计划
   - 提供完整的版本迁移文档和工具

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


```

### API命名规范
- **获取列表**：`getList`
- **获取详情**：`getDetail`
- **创建资源**：`create`
- **更新资源**：`update`
- **删除资源**：`remove`
- **批量操作**：`batchUpdate`、`batchDelete`
