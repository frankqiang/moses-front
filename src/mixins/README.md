# Mixins 使用指南

## tableRefreshMixin

### 功能描述

`tableRefreshMixin` 是一个用于统一管理表格刷新功能的混入，解决了在每个页面和表格中重复编写类似刷新逻辑的问题。

### 主要功能

- 统一的数据获取和刷新提示处理
- 标准化的搜索、重置、分页处理
- 统一的表单操作成功后处理
- 统一的批量操作成功后处理
- 自动的页面初始化数据加载

### 使用方法

#### 1. 引入并混入

```javascript
import tableRefreshMixin from '@/mixins/tableRefreshMixin'

export default {
  name: 'YourComponent',
  mixins: [tableRefreshMixin],
  // ...
}
```

#### 2. 配置必要的数据属性

```javascript
data() {
  return {
    // 必须：指定表格组件的ref名称
    tableRef: 'yourTableRef',
    
    // 必须：列表数据
    list: [],
    
    // 必须：分页配置
    pagination: {
      page: 1,
      size: 20
    },
    
    // 可选：搜索参数
    searchParams: {},
    
    // 其他数据...
  }
}
```

#### 3. 实现必要的方法

```javascript
methods: {
  /**
   * 必须实现：获取列表数据的方法
   * mixin会自动调用此方法并处理刷新提示
   */
  async fetchList() {
    this.listLoading = true
    
    try {
      const params = {
        page: this.pagination.page,
        size: this.pagination.size,
        ...this.searchParams
      }
      
      const response = await getYourDataList(params)
      
      this.list = response.data.items || []
      this.total = response.data.total || 0
      
      // 更新分页信息
      this.pagination = {
        ...this.pagination,
        total: this.total
      }
    } catch (error) {
      console.error('获取数据失败:', error)
      this.list = []
      this.total = 0
      throw error // 重要：必须重新抛出错误，让mixin处理提示
    } finally {
      this.listLoading = false
    }
  }
}
```

#### 4. 确保表格组件支持刷新提示

表格组件需要实现以下方法：

```javascript
// 在表格组件中
methods: {
  refreshSucceed(message = '刷新成功') {
    this.$message.success(message)
  },
  
  refreshFail(message = '刷新失败') {
    this.$message.error(message)
  },
  
  clearSelection() {
    // 清空选中项的逻辑
  }
}
```

### 可用的方法

mixin提供了以下方法，可以直接在组件中使用：

#### 基础方法

- `fetchListWithRefresh()`: 带刷新提示的数据获取
- `handleRefresh()`: 刷新按钮处理
- `handleSearch()`: 搜索处理
- `handleReset()`: 重置搜索处理
- `handlePaginationChange(paginationData)`: 分页变化处理

#### 操作成功后处理方法

- `handleFormSuccess()`: 表单操作成功后处理
- `handleDeleteSuccess()`: 删除操作成功后处理
- `handleBatchSuccess()`: 批量操作成功后处理
- `handleImportSuccess()`: 导入成功后处理

### 方法覆盖

如果需要在某些方法中添加特殊逻辑，可以覆盖mixin中的方法：

```javascript
methods: {
  /**
   * 覆盖搜索方法，添加搜索参数处理
   */
  handleSearch(searchParams) {
    // 处理搜索参数
    this.searchParams = { ...searchParams }
    
    // 调用mixin中的方法
    this.$options.mixins[0].methods.handleSearch.call(this)
  },
  
  /**
   * 覆盖表单成功方法，添加成功消息
   */
  handleFormSuccess(data) {
    // 调用mixin中的方法
    this.$options.mixins[0].methods.handleFormSuccess.call(this)
    
    // 添加特殊逻辑
    if (this.formMode === 'create') {
      this.$message.success('创建成功')
    } else {
      this.$message.success('更新成功')
    }
  }
}
```

### 完整示例

```javascript
<template>
  <div class="your-management">
    <SearchForm
      ref="searchForm"
      @search="handleSearch"
      @reset="handleReset"
    />
    
    <YourTable
      ref="yourTable"
      :data="list"
      :total="total"
      :loading="listLoading"
      :pagination="pagination"
      @pagination-change="handlePaginationChange"
      @refresh="handleRefresh"
      @delete="handleDelete"
    />
  </div>
</template>

<script>
import tableRefreshMixin from '@/mixins/tableRefreshMixin'
import { getYourDataList, deleteYourData } from './api'

export default {
  name: 'YourManagement',
  mixins: [tableRefreshMixin],
  data() {
    return {
      tableRef: 'yourTable',
      list: [],
      total: 0,
      listLoading: false,
      pagination: {
        page: 1,
        size: 20
      },
      searchParams: {}
    }
  },
  methods: {
    async fetchList() {
      this.listLoading = true
      
      try {
        const params = {
          page: this.pagination.page,
          size: this.pagination.size,
          ...this.searchParams
        }
        
        const response = await getYourDataList(params)
        
        this.list = response.data.items || []
        this.total = response.data.total || 0
        
        this.pagination = {
          ...this.pagination,
          total: this.total
        }
      } catch (error) {
        console.error('获取数据失败:', error)
        this.list = []
        this.total = 0
        throw error
      } finally {
        this.listLoading = false
      }
    },
    
    handleSearch(searchParams) {
      this.searchParams = { ...searchParams }
      this.$options.mixins[0].methods.handleSearch.call(this)
    },
    
    async handleDelete(row) {
      try {
        await this.$confirm('确定要删除吗？')
        await deleteYourData(row.id)
        this.$message.success('删除成功')
        this.handleDeleteSuccess()
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('删除失败')
        }
      }
    }
  }
}
</script>
```

### 注意事项

1. **必须实现 `fetchList` 方法**：这是mixin的核心依赖
2. **必须设置 `tableRef` 属性**：用于调用表格组件的刷新提示方法
3. **错误处理**：在 `fetchList` 中必须重新抛出错误，让mixin处理提示
4. **表格组件兼容**：确保表格组件实现了 `refreshSucceed` 和 `refreshFail` 方法
5. **分页属性名**：使用 `page` 而不是 `currentPage`

### 迁移指南

如果要将现有页面迁移到使用mixin：

1. 引入并混入 `tableRefreshMixin`
2. 添加 `tableRef` 属性
3. 移除重复的刷新处理代码
4. 将 `fetchList().catch()` 调用改为直接调用mixin提供的方法
5. 测试所有功能是否正常工作

这样可以大大减少代码重复，提高维护性和一致性。