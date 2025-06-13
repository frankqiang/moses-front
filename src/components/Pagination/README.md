# Pagination 分页组件

基于Element UI的增强分页组件，支持防抖、错误处理、性能监控等现代化功能。

## ✨ 特性

### 📦 基础功能
- ✅ 完全兼容Element UI Pagination API
- ✅ 双向数据绑定支持
- ✅ 自动滚动功能
- ✅ 响应式布局适配
- ✅ 自定义布局和样式

### 🚀 现代化增强 (启用 `enableModernFeatures`)
- 🛡️ **错误边界保护** - 自动捕获和处理组件错误
- ⚡ **防抖优化** - 避免快速点击导致的重复请求
- 🔄 **智能重试机制** - 失败后可自动或手动重试
- 📊 **性能监控** - 实时追踪操作性能指标
- 🎯 **状态管理** - 完善的加载、错误、禁用状态处理
- 🎛️ **编程式控制** - 丰富的API方法支持
- ♿ **无障碍优化** - 符合WCAG标准的可访问性
- 📱 **移动端适配** - 更好的移动设备体验

## 📦 安装

该组件已全局注册，可直接使用：

```vue
<template>
  <pagination 
    :total="total"
    :page.sync="page"
    :limit.sync="limit"
    @pagination="handlePagination"
  />
</template>
```

## 🎯 基础用法

### 最简单的分页

```vue
<template>
  <div>
    <!-- 数据列表 -->
    <div v-for="item in data" :key="item.id">
      {{ item.name }}
    </div>
    
    <!-- 分页组件 -->
    <pagination
      :total="total"
      :page.sync="currentPage"
      :limit.sync="pageSize"
      @pagination="loadData"
    />
  </div>
</template>

<script>
export default {
  data() {
    return {
      data: [],
      total: 0,
      currentPage: 1,
      pageSize: 10
    }
  },
  created() {
    this.loadData()
  },
  methods: {
    loadData() {
      // 加载数据的逻辑
      console.log(`加载第${this.currentPage}页，每页${this.pageSize}条`)
    }
  }
}
</script>
```

### 现代化功能示例

```vue
<template>
  <pagination
    :total="total"
    :page.sync="currentPage"
    :limit.sync="pageSize"
    :enable-modern-features="true"
    :loading="loading"
    :debounce-delay="300"
    :allow-retry="true"
    :max-retries="3"
    loading-text="数据加载中..."
    @pagination="handlePagination"
    @error="handleError"
    @retry="handleRetry"
    @performance="handlePerformance"
  />
</template>

<script>
export default {
  data() {
    return {
      total: 100,
      currentPage: 1,
      pageSize: 10,
      loading: false
    }
  },
  methods: {
    async handlePagination({ page, limit }) {
      this.loading = true
      try {
        // 模拟API调用
        const data = await this.fetchData(page, limit)
        // 处理数据...
      } catch (error) {
        console.error('加载失败:', error)
      } finally {
        this.loading = false
      }
    },
    
    handleError(errorInfo) {
      this.$message.error(`分页操作失败: ${errorInfo.error.message}`)
    },
    
    handleRetry(retryInfo) {
      this.$message.info(`正在重试... (${retryInfo.retryCount}/${retryInfo.maxRetries})`)
      this.handlePagination({ page: this.currentPage, limit: this.pageSize })
    },
    
    handlePerformance(metrics) {
      console.log(`分页操作耗时: ${metrics.duration}ms`)
    }
  }
}
</script>
```

## 📋 API 参数

### Props

| 参数 | 说明 | 类型 | 默认值 | 是否必填 |
|------|------|------|--------|----------|
| **基础参数** |
| `total` | 总条目数 | Number | - | 是 |
| `page` | 当前页数，支持 .sync 修饰符 | Number | 1 | 否 |
| `limit` | 每页显示条目个数，支持 .sync 修饰符 | Number | 20 | 否 |
| `pageSizes` | 每页显示个数选择器的选项设置 | Number[] | [10, 20, 30, 50] | 否 |
| `layout` | 组件布局，子组件名用逗号分隔 | String | 'total, sizes, prev, pager, next, jumper' | 否 |
| `background` | 是否为分页按钮添加背景色 | Boolean | true | 否 |
| `autoScroll` | 分页后是否自动滚动到顶部 | Boolean | true | 否 |
| `hidden` | 是否隐藏分页组件 | Boolean | false | 否 |
| **现代化功能参数** |
| `enableModernFeatures` | 是否启用现代化功能 | Boolean | false | 否 |
| `loading` | 加载状态 | Boolean | false | 否 |
| `disabled` | 禁用状态 | Boolean | false | 否 |
| `loadingText` | 加载状态文本 | String | '正在加载...' | 否 |
| `debounceDelay` | 防抖延迟时间(ms) | Number | 300 | 否 |
| `allowRetry` | 是否允许重试 | Boolean | true | 否 |
| `maxRetries` | 最大重试次数 | Number | 3 | 否 |
| `errorDisplayTime` | 错误消息显示时间(ms) | Number | 3000 | 否 |
| `scrollOptions` | 滚动配置 | Object | `{position:0,duration:800,easing:'ease-in-out'}` | 否 |
| `scrollTarget` | 自定义滚动目标 | String\|Element | null | 否 |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| **基础事件** |
| `pagination` | 页码或页面大小改变时触发 | `{page: number, limit: number}` |
| **现代化功能事件** |
| `error` | 分页操作错误时触发 | `{error: Error, action: string, page: number, limit: number, timestamp: number}` |
| `retry` | 重试时触发 | `{retryCount: number, maxRetries: number, page: number, limit: number}` |
| `performance` | 性能监控事件 | `{duration: number, page: number, limit: number, total: number}` |
| `size-change` | 页面大小改变时触发 | `{newSize: number, oldSize: number, page: number, timestamp: number}` |
| `current-change` | 当前页改变时触发 | `{newPage: number, oldPage: number, limit: number, timestamp: number}` |
| `component-error` | 组件错误边界捕获的错误 | `{error: Error, info: string}` |

### Methods

使用 `ref` 获取组件实例后，可调用以下方法：

| 方法名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| `goToPage(page)` | 跳转到指定页 | page: number | - |
| `goToFirst()` | 跳转到第一页 | - | - |
| `goToLast()` | 跳转到最后一页 | - | - |
| `prevPage()` | 上一页 | - | - |
| `nextPage()` | 下一页 | - | - |
| `setPageSize(size)` | 设置每页大小 | size: number | - |
| `getCurrentState()` | 获取当前状态 | - | Object |
| `clearError()` | 清除错误状态 | - | - |

## 🎨 自定义配置

### 布局配置

```vue
<!-- 完整布局 -->
<pagination layout="total, sizes, prev, pager, next, jumper" />

<!-- 简化布局 -->
<pagination layout="prev, pager, next" />

<!-- 无跳转器布局 -->
<pagination layout="total, sizes, prev, pager, next" />

<!-- 移动端布局 -->
<pagination layout="total, prev, pager, next" />
```

### 每页选项配置

```vue
<pagination :page-sizes="[5, 10, 20, 50, 100]" />
```

### 滚动配置

```vue
<pagination 
  :scroll-options="{
    position: 0,
    duration: 1000,
    easing: 'ease-in-out'
  }"
  scroll-target="#table-container"
/>
```

## 🛠️ 编程式控制

```vue
<template>
  <div>
    <pagination ref="pagination" :total="100" />
    
    <div class="controls">
      <el-button @click="goToFirst">第一页</el-button>
      <el-button @click="goToLast">最后一页</el-button>
      <el-button @click="setLargePageSize">100条/页</el-button>
      <el-button @click="showState">显示状态</el-button>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    goToFirst() {
      this.$refs.pagination.goToFirst()
    },
    
    goToLast() {
      this.$refs.pagination.goToLast()
    },
    
    setLargePageSize() {
      this.$refs.pagination.setPageSize(100)
    },
    
    showState() {
      const state = this.$refs.pagination.getCurrentState()
      console.log('当前状态:', state)
    }
  }
}
</script>
```

## 📊 性能监控

启用现代化功能后，组件会自动监控性能指标：

```vue
<template>
  <pagination
    enable-modern-features
    @performance="handlePerformance"
  />
</template>

<script>
export default {
  methods: {
    handlePerformance(metrics) {
      // 记录性能指标
      console.log({
        duration: metrics.duration,    // 操作耗时(ms)
        page: metrics.page,           // 当前页
        limit: metrics.limit,         // 每页条数
        total: metrics.total          // 总条数
      })
      
      // 可以发送到性能监控服务
      if (metrics.duration > 1000) {
        console.warn('分页操作耗时过长:', metrics.duration + 'ms')
      }
    }
  }
}
</script>
```

## 🔄 错误处理与重试

```vue
<template>
  <pagination
    enable-modern-features
    :allow-retry="true"
    :max-retries="3"
    @error="handleError"
    @retry="handleRetry"
  />
</template>

<script>
export default {
  methods: {
    handleError(errorInfo) {
      // 错误处理逻辑
      this.$message.error(`分页失败: ${errorInfo.error.message}`)
      
      // 错误上报
      this.reportError(errorInfo)
    },
    
    handleRetry(retryInfo) {
      // 重试逻辑
      this.$message.info(`正在重试 (${retryInfo.retryCount}/${retryInfo.maxRetries})`)
      
      // 重新加载数据
      this.loadData()
    },
    
    reportError(errorInfo) {
      // 发送错误信息到监控服务
      console.error('分页错误:', errorInfo)
    }
  }
}
</script>
```

## 📱 响应式设计

组件自动适配不同屏幕尺寸：

```css
/* 移动端样式会自动应用 */
@media (max-width: 768px) {
  .pagination-container {
    padding: 8px 12px;
  }
  
  .pagination-container ::v-deep .el-pagination {
    text-align: center;
  }
}
```

对于移动端，建议使用简化布局：

```vue
<pagination 
  layout="total, prev, pager, next"
  :page-sizes="[10, 20, 50]"
/>
```

## ⚡ 最佳实践

### 1. 防抖配置

```vue
<!-- 搜索场景：较短防抖时间 -->
<pagination :debounce-delay="200" />

<!-- 数据保存场景：较长防抖时间 -->
<pagination :debounce-delay="500" />
```

### 2. 错误处理策略

```javascript
export default {
  methods: {
    async handlePagination({ page, limit }) {
      try {
        this.loading = true
        const response = await api.getData({ page, limit })
        this.data = response.data
        this.total = response.total
      } catch (error) {
        // 区分不同错误类型
        if (error.code === 'NETWORK_ERROR') {
          this.$message.error('网络连接失败，请检查网络')
        } else if (error.code === 'AUTH_ERROR') {
          this.$message.error('登录已过期，请重新登录')
          this.$router.push('/login')
        } else {
          this.$message.error('数据加载失败，请稍后重试')
        }
      } finally {
        this.loading = false
      }
    }
  }
}
```

### 3. 性能优化

```javascript
export default {
  data() {
    return {
      // 使用防抖的搜索
      debouncedSearch: null
    }
  },
  
  created() {
    // 创建防抖搜索函数
    this.debouncedSearch = this.debounce(this.search, 300)
  },
  
  methods: {
    handlePagination() {
      // 如果有搜索条件，使用防抖搜索
      if (this.searchKeyword) {
        this.debouncedSearch()
      } else {
        this.loadData()
      }
    }
  }
}
```

### 4. 状态管理

```javascript
// 使用Vuex管理分页状态
export default {
  computed: {
    ...mapState('user', ['list', 'total', 'loading']),
    ...mapGetters('user', ['currentPage', 'pageSize'])
  },
  
  methods: {
    ...mapActions('user', ['fetchUsers']),
    
    handlePagination({ page, limit }) {
      this.$store.dispatch('user/fetchUsers', { page, limit })
    }
  }
}
```

## 🎯 常见场景

### 表格分页

```vue
<template>
  <div>
    <el-table :data="tableData" v-loading="loading">
      <!-- 表格列定义 -->
    </el-table>
    
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="currentPage"
      :limit.sync="pageSize"
      :enable-modern-features="true"
      :loading="loading"
      @pagination="fetchData"
    />
  </div>
</template>
```

### 列表分页

```vue
<template>
  <div>
    <div v-for="item in listData" :key="item.id" class="list-item">
      <!-- 列表项内容 -->
    </div>
    
    <pagination
      :total="total"
      :page.sync="currentPage"
      :limit.sync="pageSize"
      :enable-modern-features="true"
      :page-sizes="[12, 24, 48]"
      layout="total, sizes, prev, pager, next"
      @pagination="fetchData"
    />
  </div>
</template>
```

### 搜索结果分页

```vue
<template>
  <div>
    <el-input 
      v-model="searchKeyword" 
      placeholder="搜索..."
      @input="handleSearch"
    />
    
    <div v-for="item in searchResults" :key="item.id">
      <!-- 搜索结果项 -->
    </div>
    
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="currentPage"
      :limit.sync="pageSize"
      :enable-modern-features="true"
      :debounce-delay="500"
      @pagination="search"
    />
  </div>
</template>

<script>
export default {
  data() {
    return {
      searchKeyword: '',
      searchResults: [],
      currentPage: 1,
      pageSize: 10,
      total: 0
    }
  },
  
  methods: {
    handleSearch() {
      this.currentPage = 1  // 重置到第一页
      this.search()
    },
    
    async search() {
      if (!this.searchKeyword.trim()) {
        this.searchResults = []
        this.total = 0
        return
      }
      
      try {
        const response = await api.search({
          keyword: this.searchKeyword,
          page: this.currentPage,
          limit: this.pageSize
        })
        
        this.searchResults = response.data
        this.total = response.total
      } catch (error) {
        this.$message.error('搜索失败')
      }
    }
  }
}
</script>
```

## 🔧 故障排除

### 常见问题

1. **分页不触发**
   - 检查是否正确使用 `.sync` 修饰符
   - 确认 `@pagination` 事件是否正确绑定

2. **防抖不生效**
   - 确认是否启用了 `enableModernFeatures`
   - 检查 `debounceDelay` 设置是否合理

3. **性能问题**
   - 启用现代化功能进行性能监控
   - 考虑使用虚拟滚动（对于大数据集）

4. **移动端适配问题**
   - 使用简化的 `layout` 配置
   - 减少 `pageSizes` 选项

### 调试技巧

```javascript
// 启用性能监控和事件日志
export default {
  methods: {
    handlePerformance(metrics) {
      console.log('分页性能:', metrics)
    },
    
    handleError(errorInfo) {
      console.error('分页错误:', errorInfo)
    },
    
    // 查看组件状态
    debugPagination() {
      const state = this.$refs.pagination.getCurrentState()
      console.table(state)
    }
  }
}
```

## 📝 更新日志

### v2.0.0 (2024-12-19)
- ✨ 新增现代化功能支持
- ✨ 防抖优化机制
- ✨ 错误边界保护
- ✨ 性能监控功能
- ✨ 智能重试机制
- ✨ 编程式控制API
- ✨ 响应式设计优化
- ♿ 无障碍访问改进
- 🐛 修复若干已知问题

### v1.0.0
- 🎉 基础分页功能
- ✅ Element UI兼容性
- ✅ 双向数据绑定
- ✅ 自动滚动支持

## 📄 许可证

MIT License

---

更多示例和最佳实践，请查看 [演示页面](./demo.vue)。
