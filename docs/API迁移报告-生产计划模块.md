# API 迁移报告 - 生产计划管理模块

## 📋 迁移概述

将生产计划管理模块中使用的弃用 mock API 迁移到各业务模块的真实 API。

**迁移日期**：2025-01-21
**迁移原因**：弃用集中式 mock API，使用各业务模块自己的真实 API

## 🔧 修改的文件

### 1. PlanFormDialog.vue - 生产计划创建对话框

**文件路径**：`src/views/production-management/production-plan-management/components/PlanFormDialog.vue`

#### 修改内容

**导入部分：**
```javascript
// ❌ 修改前：使用弃用的 mock API
import { getAllProductList, getProcessTemplateList } from '@/api/master-data/product-management'

// ✅ 修改后：使用各业务模块的真实 API
// 从铝箔产品管理模块获取产品数据
import { fetchFoilProductList } from '@/views/master-data/aluminum-foil-product-management/api/aluminum-foil-product-management'
// 从工艺参数管理模块获取工艺模板数据
import { fetchProcessTemplateList } from '@/views/master-data/process-parameter-management/api/process-parameter-management'
```

**产品列表加载方法：**
```javascript
// ❌ 修改前
async loadProductList(query = '') {
  const response = await getAllProductList({
    search: query,
    limit: 50
  })
  if (response.success && response.data && response.data.results) {
    this.productOptions = response.data.results
  }
}

// ✅ 修改后
async loadProductList(query = '') {
  const response = await fetchFoilProductList({
    search: query,
    limit: 50,
    page: 1
  })
  if (response.data && response.data.results) {
    this.productOptions = response.data.results
  }
}
```

**工艺模板加载方法：**
```javascript
// ❌ 修改前
async loadProcessTemplateList() {
  const response = await getProcessTemplateList()
  if (response.success && response.data && response.data.results) {
    this.processTemplateOptions = response.data.results.filter(
      item => item.status === 'effective'
    )
  }
}

// ✅ 修改后
async loadProcessTemplateList() {
  const response = await fetchProcessTemplateList({
    status: 'EFFECTIVE', // 只获取生效状态的工艺模板
    limit: 100,
    page: 1
  })
  if (response.data && response.data.results) {
    this.processTemplateOptions = response.data.results.map(template => ({
      id: template.id,
      code: template.templateCode,
      name: template.templateName,
      status: template.status
    }))
  }
}
```

### 2. SplitDialog.vue - 生产计划拆分对话框

**文件路径**：`src/views/production-management/production-plan-management/components/SplitDialog.vue`

#### 修改内容

**导入部分：**
```javascript
// ❌ 修改前
import { getProcessTemplateList } from '@/api/master-data/product-management'

// ✅ 修改后
// 从工艺参数管理模块获取工艺模板数据
import { fetchProcessTemplateList } from '@/views/master-data/process-parameter-management/api/process-parameter-management'
```

**工艺模板加载方法：**
```javascript
// ❌ 修改前
async loadProcessTemplates() {
  const response = await getProcessTemplateList()
  if (response.success && response.data && response.data.results) {
    this.processTemplateOptions = response.data.results.filter(
      item => item.status === 'effective'
    )
  }
}

// ✅ 修改后
async loadProcessTemplates() {
  const response = await fetchProcessTemplateList({
    status: 'EFFECTIVE',
    limit: 100,
    page: 1
  })
  if (response.data && response.data.results) {
    this.processTemplateOptions = response.data.results.map(template => ({
      id: template.id,
      code: template.templateCode,
      name: template.templateName,
      status: template.status
    }))
  }
}
```

### 3. RoutingFormDrawer.vue - 工艺路线表单

**文件路径**：`src/views/master-data/process-management/routing/components/RoutingFormDrawer.vue`

#### 修改内容

**导入部分：**
```javascript
// ❌ 修改前
import { getAllProductList } from '@/api/master-data/product-management'

// ✅ 修改后
// 从铝箔产品管理模块获取产品数据
import { fetchFoilProductList } from '@/views/master-data/aluminum-foil-product-management/api/aluminum-foil-product-management'
```

**产品搜索方法：**
```javascript
// ❌ 修改前
async remoteSearchProducts(query) {
  const res = await getAllProductList({
    search: query.trim(),
    limit: 50
  })
  this.productOptions = (res.data && res.data.items) || []
}

// ✅ 修改后
async remoteSearchProducts(query) {
  const res = await fetchFoilProductList({
    search: query.trim(),
    limit: 50,
    page: 1
  })
  this.productOptions = (res.data && res.data.results) || []
}
```

**产品详情加载方法：**
```javascript
// ❌ 修改前
async loadSelectedProducts() {
  const res = await getAllProductList({
    search: searchQuery,
    limit: 100,
    includeInactive: true
  })
  const allProducts = res.data?.items || []
}

// ✅ 修改后
async loadSelectedProducts() {
  const res = await fetchFoilProductList({
    search: searchQuery,
    limit: 100,
    page: 1
  })
  const allProducts = res.data?.results || []
}
```

## 📊 API 对照表

### 产品管理 API

| 功能 | 弃用 API | 新 API | 响应数据字段 |
|------|---------|--------|-------------|
| 获取产品列表 | `getAllProductList` | `fetchFoilProductList` | `data.results` |
| 基础路径 | `/vue-admin-template/mes/product/*` | `/mdm/aluminum-foil-products` | - |

### 工艺模板 API

| 功能 | 弃用 API | 新 API | 响应数据字段 |
|------|---------|--------|-------------|
| 获取工艺模板列表 | `getProcessTemplateList` | `fetchProcessTemplateList` | `data.results` |
| 基础路径 | `/vue-admin-template/mes/process-template/*` | `/mdm/process-templates` | - |

## 🎯 API 调用差异说明

### 1. 响应数据结构变化

**弃用 API 响应：**
```javascript
{
  success: true,
  data: {
    results: [...],
    items: [...],  // 部分 API 使用 items
    total: 100
  },
  message: '操作成功'
}
```

**新 API 响应：**
```javascript
{
  data: {
    results: [...],  // 统一使用 results
    page: 1,
    limit: 10,
    totalPages: 10,
    totalResults: 100
  },
  message: '操作成功',
  meta: {
    timestamp: '...',
    requestId: '...'
  }
}
```

### 2. 参数变化

**产品列表查询：**
```javascript
// 弃用 API
{ search: 'keyword', limit: 50 }

// 新 API（必须包含 page）
{ search: 'keyword', limit: 50, page: 1 }
```

**工艺模板查询：**
```javascript
// 弃用 API（状态过滤在前端）
await getProcessTemplateList()
// 前端过滤：results.filter(item => item.status === 'effective')

// 新 API（后端直接过滤）
await fetchProcessTemplateList({ status: 'EFFECTIVE', limit: 100, page: 1 })
```

### 3. 工艺模板字段映射

```javascript
// 新 API 返回的字段需要映射
{
  id: template.id,
  code: template.templateCode,    // 字段名变化
  name: template.templateName,     // 字段名变化
  status: template.status
}
```

## ✅ 迁移验证清单

- [x] PlanFormDialog.vue - 产品选择功能
- [x] PlanFormDialog.vue - 工艺模板选择功能
- [x] SplitDialog.vue - 工艺模板选择功能
- [x] RoutingFormDrawer.vue - 产品搜索功能
- [x] RoutingFormDrawer.vue - 产品详情加载功能
- [x] 所有文件无 ESLint 错误
- [x] 清除所有对 `@/api/master-data/product-management` 的引用

## 🔍 兼容性说明

### 1. 数据字段兼容

- ✅ `productCode` - 产品编码（兼容）
- ✅ `productName` - 产品名称（兼容）
- ✅ `id` - 产品/模板ID（兼容）
- ⚠️ `templateCode` - 需映射为 `code`
- ⚠️ `templateName` - 需映射为 `name`

### 2. 参数兼容

- ✅ `search` - 搜索关键字（兼容）
- ✅ `limit` - 每页数量（兼容）
- ✅ `page` - 页码（新增必填）
- ✅ `status` - 状态过滤（改为后端过滤）
- ❌ `includeInactive` - 铝箔产品API不支持此参数

## 🚨 注意事项

### 1. 必须添加 page 参数

新 API 要求必须传递 `page` 参数，即使不需要分页：
```javascript
// ✅ 正确
await fetchFoilProductList({ search: '', limit: 50, page: 1 })

// ❌ 错误（会导致请求失败）
await fetchFoilProductList({ search: '', limit: 50 })
```

### 2. 响应数据字段变化

统一使用 `response.data.results` 访问数据：
```javascript
// ✅ 正确
const products = response.data.results || []

// ❌ 错误（旧 API 有些用 items）
const products = response.data.items || []
```

### 3. 工艺模板字段映射

必须进行字段映射，保证下拉选择组件正常工作：
```javascript
this.processTemplateOptions = response.data.results.map(template => ({
  id: template.id,
  code: template.templateCode,  // 映射字段名
  name: template.templateName,  // 映射字段名
  status: template.status
}))
```

### 4. 错误处理

新 API 的错误消息通过 `error.message` 访问：
```javascript
catch (error) {
  this.$message.error(error.message || '操作失败')
}
```

## 📚 相关文档

- [铝箔产品管理 API 文档](../views/master-data/aluminum-foil-product-management/api/aluminum-foil-product-management.js)
- [工艺参数管理 API 文档](../views/master-data/process-parameter-management/api/process-parameter-management.js)
- [工艺路线管理 API 文档](../views/master-data/process-management/routing/api/routing.js)

## 🎯 后续计划

- [ ] 完全移除 `src/api/master-data/product-management.js` 中的弃用 API
- [ ] 更新其他模块中可能使用弃用 API 的地方
- [ ] 统一所有模块的 API 响应格式
- [ ] 完善 API 文档和使用说明

---

**迁移人员**：AI Assistant
**审核状态**：待审核
**测试状态**：待测试

