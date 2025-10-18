# SessionStorage 配额超出问题修复报告

## 📋 问题描述

**错误信息**：
```
QuotaExceededError: Failed to execute 'setItem' on 'Storage':
Setting the value of 'production-plan-cache' exceeded the quota.
```

**发生位置**：`src/views/production-management/production-plan-management/index.vue:672`

**影响范围**：生产计划列表页面的缓存功能

**问题严重程度**：中等 - 不影响核心功能，但会在控制台产生错误，影响用户体验

---

## 🔍 问题根因分析

### 1. SessionStorage 配额限制

不同浏览器的 SessionStorage 配额限制：

| 浏览器 | 配额大小 |
|--------|----------|
| Chrome/Edge | 5-10 MB |
| Firefox | 10 MB |
| Safari | 5 MB |

### 2. 原有代码问题

**问题代码位置**：`index.vue` 第 665-672 行（修复前）

```javascript
// ❌ 问题代码
handlePageCacheSave() {
  const cache = {
    tableData: this.tableData,      // 🔴 缓存了完整的表格数据！
    pagination: this.pagination,
    searchParams: this.searchParams,
    timestamp: Date.now()
  }
  sessionStorage.setItem('production-plan-cache', JSON.stringify(cache))
}
```

**问题分析**：

1. **缓存了 tableData**：这是最大的问题
   - 生产计划对象非常复杂，包含：
     - 基本信息（计划编号、产品信息、数量等）
     - 子批次列表（可能有多个子批次，每个都包含完整信息）
     - 工艺参数（工艺模板、工艺参数快照）
     - 变更日志（可能有很多条历史记录）
     - 审批信息（审批记录、审批状态）
   - 如果列表有100条记录，每条平均50KB，总共需要 **5MB**

2. **没有错误处理**：
   - 如果 `setItem` 失败，会抛出 `QuotaExceededError`
   - 错误没有被捕获，直接显示在控制台

3. **没有数据大小检查**：
   - 没有检查缓存数据的大小
   - 没有限制缓存的最大大小

4. **没有缓存过期机制**：
   - 旧的缓存数据永远不会被清理
   - 可能累积大量过期数据

### 3. 为什么需要缓存？

**原始意图**：用户从列表页进入详情页，返回时恢复之前的：
- 查询条件（搜索关键词、筛选条件）
- 分页状态（当前页码、每页数量）
- 表格数据（避免重新请求）

**问题**：
- ✅ 缓存查询条件和分页状态 - **有意义**
- ❌ 缓存表格数据 - **没有必要**，且容易超出配额

---

## 🛠️ 修复方案

### 修复原则

1. **只缓存必要的参数**：查询条件和分页信息
2. **不缓存数据**：表格数据从后端重新获取
3. **添加错误处理**：捕获 `QuotaExceededError`
4. **添加大小检查**：限制缓存最大 100KB
5. **添加过期机制**：30分钟后自动清理

### 修复内容

#### 1. 修改 `handlePageCacheSave` 方法

**文件**：`src/views/production-management/production-plan-management/index.vue`

**修复位置**：第 686-741 行

**修复内容**：

```javascript
handlePageCacheSave() {
  try {
    const cache = {
      // ⚠️ 不缓存 tableData，避免超出 sessionStorage 配额
      // tableData 应该从后端重新获取，而不是从缓存恢复
      pagination: this.pagination,
      searchParams: this.searchParams,
      timestamp: Date.now()
    }

    const cacheStr = JSON.stringify(cache)

    // 检查缓存大小（不应超过 100KB）
    const cacheSize = new Blob([cacheStr]).size
    const MAX_CACHE_SIZE = 100 * 1024 // 100KB

    if (cacheSize > MAX_CACHE_SIZE) {
      console.warn('缓存数据过大，跳过保存:', {
        size: cacheSize,
        maxSize: MAX_CACHE_SIZE
      })
      return
    }

    sessionStorage.setItem('production-plan-cache', cacheStr)

    console.log('✅ 页面缓存保存成功:', {
      size: cacheSize,
      cacheKeys: Object.keys(cache)
    })
  } catch (error) {
    // 捕获 QuotaExceededError 或其他存储错误
    console.warn('页面缓存保存失败:', error.message)

    // 如果是配额超出错误，清理所有生产计划相关的缓存
    if (error.name === 'QuotaExceededError') {
      console.log('检测到 QuotaExceededError，清理旧缓存...')
      try {
        sessionStorage.removeItem('production-plan-cache')
      } catch (cleanupError) {
        console.error('清理缓存失败:', cleanupError)
      }
    }

    // ⚠️ 不抛出错误，避免影响主流程
  }
}
```

**修复效果**：
- ✅ 不再缓存 `tableData`，缓存大小从可能的 5MB 降低到几KB
- ✅ 添加了大小检查，超过 100KB 自动跳过保存
- ✅ 捕获 `QuotaExceededError`，不会在控制台报错
- ✅ 失败时自动清理旧缓存，释放空间

#### 2. 修改 `handlePageCacheRestore` 方法

**修复位置**：第 645-684 行

**修复内容**：

```javascript
handlePageCacheRestore() {
  const cachedData = sessionStorage.getItem('production-plan-cache')
  if (cachedData) {
    try {
      const cache = JSON.parse(cachedData)

      // 检查缓存是否过期（30分钟）
      const cacheAge = Date.now() - (cache.timestamp || 0)
      const MAX_CACHE_AGE = 30 * 60 * 1000 // 30分钟

      if (cacheAge > MAX_CACHE_AGE) {
        console.log('缓存已过期，清理缓存')
        sessionStorage.removeItem('production-plan-cache')
        return
      }

      // 只恢复查询参数和分页信息
      // ⚠️ 不恢复 tableData，避免缓存大量数据
      this.pagination = cache.pagination || this.pagination
      this.searchParams = cache.searchParams || this.searchParams

      console.log('✅ 页面缓存恢复成功:', {
        pagination: this.pagination,
        searchParams: this.searchParams
      })
    } catch (error) {
      console.warn('页面缓存恢复失败:', error)
      // 清理损坏的缓存
      sessionStorage.removeItem('production-plan-cache')
    }
  }
}
```

**修复效果**：
- ✅ 不再恢复 `tableData`
- ✅ 添加了30分钟的过期时间检查
- ✅ 恢复失败时自动清理损坏的缓存

#### 3. 修改 `created` 钩子

**修复位置**：第 137-148 行

**修复内容**：

```javascript
created() {
  // 创建防抖搜索函数
  this.debouncedFetchList = debounce(this.fetchListSafe, 300)
  // 加载枚举字典
  this.loadDictionaries()
  // 恢复页面缓存（查询参数和分页信息）
  this.handlePageCacheRestore()  // 🔑 添加这一行
  // 从路由查询参数恢复搜索状态（路由参数优先级更高，会覆盖缓存）
  this.restoreSearchFromRoute()
  // 页面初始化时加载列表
  this.fetchListSafe()
}
```

**修复效果**：
- ✅ 页面加载时自动恢复缓存的查询参数和分页信息
- ✅ 恢复后调用 `fetchListSafe()` 重新请求数据

---

## ✅ 修复验证

### 测试场景 1：正常使用（缓存成功）

**操作步骤**：
1. 打开生产计划列表页面
2. 设置搜索条件（如搜索"计划001"）
3. 切换到第3页
4. 进入某个计划的详情页
5. 点击返回列表

**预期结果**：
- ✅ 返回后仍在第3页
- ✅ 搜索条件仍为"计划001"
- ✅ 控制台没有 `QuotaExceededError` 错误
- ✅ 控制台显示：`✅ 页面缓存保存成功`
- ✅ 数据自动重新加载（不是从缓存恢复）

### 测试场景 2：缓存过期（30分钟后）

**操作步骤**：
1. 打开生产计划列表页面
2. 等待30分钟（或修改代码中的 `MAX_CACHE_AGE` 为10秒进行快速测试）
3. 刷新页面

**预期结果**：
- ✅ 控制台显示：`缓存已过期，清理缓存`
- ✅ 恢复为默认的查询参数和分页状态

### 测试场景 3：缓存数据过大（理论测试）

**操作步骤**：
1. 修改代码，临时缓存一个超大的对象（如循环生成10000个项）
2. 离开页面

**预期结果**：
- ✅ 控制台显示：`缓存数据过大，跳过保存`
- ✅ 不会尝试保存到 sessionStorage

### 测试场景 4：SessionStorage 已满

**操作步骤**：
1. 在控制台中手动填满 sessionStorage：
   ```javascript
   for (let i = 0; i < 1000; i++) {
     sessionStorage.setItem(`test-${i}`, 'x'.repeat(10000))
   }
   ```
2. 打开生产计划列表页面
3. 离开页面

**预期结果**：
- ✅ 控制台显示：`检测到 QuotaExceededError，清理旧缓存...`
- ✅ 不会抛出错误，不影响页面正常使用

### 测试场景 5：损坏的缓存数据

**操作步骤**：
1. 在控制台中手动设置损坏的缓存：
   ```javascript
   sessionStorage.setItem('production-plan-cache', '{invalid json}')
   ```
2. 刷新页面

**预期结果**：
- ✅ 控制台显示：`页面缓存恢复失败`
- ✅ 自动清理损坏的缓存
- ✅ 使用默认参数加载列表

---

## 📊 修复前后对比

| 项目 | 修复前 | 修复后 |
|------|--------|--------|
| **缓存内容** | tableData + pagination + searchParams | pagination + searchParams |
| **缓存大小** | 可能5MB（100条记录） | 约2-5KB |
| **超出配额风险** | 高 | 极低 |
| **错误处理** | 无，直接抛出错误 | 完整的 try-catch，自动清理 |
| **大小检查** | 无 | 有（最大100KB） |
| **过期机制** | 无 | 有（30分钟自动清理） |
| **用户体验** | 错误会显示在控制台 | 静默处理，不影响使用 |
| **返回列表速度** | 快（使用缓存） | 正常（重新请求，但有参数恢复） |

---

## 🎯 技术要点

### 1. 为什么不缓存表格数据？

**原因**：
1. **数据量大**：生产计划对象复杂，包含子批次、工艺参数等
2. **容易过期**：数据可能在后台被其他用户修改
3. **不必要**：用户返回列表时，重新请求数据只需几百毫秒
4. **风险高**：很容易超出 sessionStorage 配额

**替代方案**：
- 只缓存查询参数和分页信息
- 用户返回时，根据缓存的参数重新请求数据
- 这样既能保持用户的浏览状态，又不会超出配额

### 2. 为什么使用 sessionStorage 而不是 localStorage？

**sessionStorage 优势**：
- 会话级别：关闭标签页后自动清理，不会累积垃圾数据
- 适合临时数据：页面缓存属于临时数据，不需要长期保存

**localStorage 风险**：
- 持久化存储：数据永久保存，容易累积
- 需要手动清理：否则会一直占用空间

### 3. 缓存大小计算

```javascript
const cacheStr = JSON.stringify(cache)
const cacheSize = new Blob([cacheStr]).size
```

**为什么使用 Blob？**
- `Blob` 可以准确计算字符串的字节大小
- `string.length` 只能计算字符数量，对于多字节字符（如中文）不准确

### 4. 错误处理最佳实践

```javascript
try {
  sessionStorage.setItem('key', value)
} catch (error) {
  if (error.name === 'QuotaExceededError') {
    // 配额超出，清理旧数据
  }
  // 不抛出错误，避免影响主流程
}
```

**关键点**：
- 捕获 `QuotaExceededError`
- 失败时不影响主流程
- 自动清理旧数据

---

## 📚 相关文档和规范

1. **Web Storage API**：https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API
2. **SessionStorage 配额限制**：各浏览器的存储限制说明
3. **错误处理最佳实践**：项目的错误处理规范

---

## 🔗 相关文件

- `src/views/production-management/production-plan-management/index.vue`（主要修复文件）
- `src/utils/table-config-store.js`（表格列配置存储，使用 localStorage）

---

## 💡 未来优化建议

1. **使用 IndexedDB**：
   - 如果确实需要缓存大量数据，可以考虑使用 IndexedDB
   - IndexedDB 的配额通常是几百MB甚至更大
   - 但复杂度也更高，需要权衡

2. **压缩数据**：
   - 可以使用 LZ-String 等库压缩 JSON 数据
   - 可以减少 50-70% 的存储空间
   - 但会增加 CPU 开销

3. **统一缓存管理**：
   - 创建一个统一的缓存管理工具
   - 自动处理配额超出、过期清理等
   - 提供统一的 API

4. **监控缓存使用**：
   - 添加缓存使用情况的监控
   - 定期清理过期缓存
   - 记录缓存命中率

---

## 📝 开发者注意事项

1. **不要缓存大量数据到 Storage**：
   - sessionStorage/localStorage 配额很小（5-10MB）
   - 只缓存必要的参数，不缓存数据
   - 大量数据应该使用 IndexedDB 或不缓存

2. **始终添加错误处理**：
   - Storage 操作可能失败（配额超出、权限问题等）
   - 使用 try-catch 捕获错误
   - 失败时不应该影响主流程

3. **添加过期机制**：
   - 缓存数据应该有过期时间
   - 定期清理过期数据
   - 避免累积垃圾数据

4. **定期检查缓存大小**：
   - 使用浏览器开发者工具检查 Storage 使用情况
   - Chrome DevTools → Application → Storage
   - 确保缓存大小合理

---

**修复完成日期**：2025-10-18
**修复负责人**：AI Assistant
**审核状态**：待测试验证
**优先级**：P1（影响用户体验）

