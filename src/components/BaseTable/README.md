# BaseTable 表格组件 (优化版)

## 简介

BaseTable 是一个基于 Element UI 的 el-table 封装的配置驱动表格组件。它通过 JavaScript 配置对象来定义表格结构，减少模板中的重复代码，同时集成了加载状态、分页、空状态、状态标签等常用功能。

**🚀 新版优化特性**：
- **虚拟滚动**：支持大数据量渲染，性能大幅提升
- **错误处理**：完善的错误捕获和降级方案
- **防抖优化**：减少频繁操作带来的性能损耗
- **数据安全**：异常数据保护和类型检查
- **高可用性**：加载失败重试机制

## 功能特点

- **配置驱动**：通过 `columns` 配置数组来定义表格结构，而不是在模板中编写大量 `el-table-column`
- **高度集成**：内置分页组件、状态标签组件，开箱即用
- **灵活扩展**：支持强大的插槽系统，可以自定义任何列的渲染
- **类型支持**：内置状态列和时间列的默认渲染
- **完整透传**：通过 `$attrs` 完全支持 el-table 的所有原生属性
- **方法暴露**：暴露 el-table 的所有原生方法
- **统一体验**：提供一致的加载状态、空状态和分页体验
- **🆕 虚拟滚动**：支持10万+条数据流畅渲染
- **🆕 错误边界**：自动捕获渲染错误，提供降级方案
- **🆕 防抖处理**：优化用户交互响应性能
- **🆕 数据保护**：异常数据自动处理和告警

## 基本使用

### 简单示例

```vue
<template>
  <div class="app-container">
    <base-table
      :data="tableData"
      :columns="columns"
      :loading="loading"
      :pagination="pagination"
      @pagination-change="handlePaginationChange"
    />
  </div>
</template>

<script>
import BaseTable from '@/components/BaseTable'

export default {
  components: { BaseTable },
  data() {
    return {
      loading: false,
      tableData: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0
      },
      columns: [
        { prop: 'name', label: '名称', width: '120' },
        { prop: 'code', label: '编码', width: '100' },
        { prop: 'status', label: '状态', width: '80' }
      ]
    }
  },
  methods: {
    handlePaginationChange() {
      this.fetchData()
    }
  }
}
</script>
```

### 🆕 虚拟滚动示例

```vue
<template>
  <base-table
    :data="largeData"
    :columns="columns"
    :virtual-scroll="true"
    :virtual-threshold="100"
    :virtual-height="400"
    :item-height="48"
    :show-index="true"
  />
</template>

<script>
export default {
  data() {
    return {
      largeData: [], // 10000+ 条数据
      columns: [
        { prop: 'name', label: '姓名' },
        { prop: 'email', label: '邮箱' },
        { prop: 'status', label: '状态', type: 'status' }
      ]
    }
  }
}
</script>
```

### 🆕 错误处理示例

```vue
<template>
  <base-table
    :data="tableData"
    :columns="columns"
    :loading="loading"
    :load-error="loadError"
    :allow-retry="true"
    @retry="handleRetry"
    @data-error="handleDataError"
    @format-error="handleFormatError"
  />
</template>

<script>
export default {
  data() {
    return {
      loadError: false, // 可以是 boolean、string 或 Error 对象
      columns: [
        { prop: 'name', label: '姓名' },
        { prop: 'createTime', label: '创建时间', type: 'datetime' },
        { prop: 'nested.value', label: '嵌套属性' } // 支持嵌套属性
      ]
    }
  },
  methods: {
    handleRetry() {
      // 重新加载数据
      this.fetchData()
    },
    
    handleDataError(error) {
      console.error('数据错误:', error)
    },
    
    handleFormatError(error) {
      console.error('格式化错误:', error)
    }
  }
}
</script>
```

## API 文档

### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|-------|------|
| data | Array | [] | **必需。** 表格要显示的数据数组 |
| columns | Array | [] | **必需。** 表格的列配置数组 |
| loading | Boolean | false | 是否显示加载动画 |
| **🆕 loadError** | Boolean/String/Error | false | **新增。** 加载错误状态，支持错误对象或错误信息 |
| **🆕 allowRetry** | Boolean | true | **新增。** 是否允许重试操作 |
| showSelection | Boolean | false | 是否显示多选框列 |
| showIndex | Boolean | false | 是否显示序号列 |
| indexMethod | Function | null | 序号计算方法，接收参数为当前行的index |
| pagination | Object | null | 分页配置对象，如果传入则显示分页 |
| showPagination | Boolean | true | 当pagination存在时，是否显示分页组件 |
| **🆕 virtualScroll** | Boolean | false | **新增。** 是否启用虚拟滚动 |
| **🆕 virtualThreshold** | Number | 100 | **新增。** 虚拟滚动触发阈值，超过此数量自动启用 |
| **🆕 virtualHeight** | Number | 400 | **新增。** 虚拟滚动容器高度(px) |
| **🆕 itemHeight** | Number | 48 | **新增。** 虚拟滚动每行高度(px) |
| **🆕 bufferSize** | Number | 5 | **新增。** 虚拟滚动缓冲区大小 |

**注意：** BaseTable 通过 `v-bind="$attrs"` 支持 el-table 的所有原生属性，如 `height`、`max-height`、`stripe`、`border`、`row-key` 等。

### Columns 配置详解

每个 `column` 对象可以包含以下属性：

| 属性 | 类型 | 说明 |
|------|------|------|
| prop | String | 对应 data 数组中对象的键名，**🆕 支持嵌套属性** (如 'user.name') |
| label | String | 列的标题 |
| width | String | 列的宽度 |
| minWidth | String | 列的最小宽度 |
| align | String | 对齐方式 (left/center/right)，默认为 left |
| fixed | String/Boolean | 列是否固定 (true/left/right) |
| sortable | Boolean/String | 是否可排序。true 为前端排序，'custom' 为后端排序 |
| formatter | Function | 用来格式化内容，接收 (row, column, cellValue, index) |
| showOverflowTooltip | Boolean | 当内容过长被隐藏时显示 tooltip，默认为 true |
| className | String | 列的 className |
| labelClassName | String | 当前列标题的自定义类名 |
| **slotName** | String | **核心功能。** 如果提供此字段，组件将使用具名插槽来渲染该列 |
| **type** | String | 列类型，支持 'status'（状态列）、'datetime'（时间列） |
| **🆕 errorFallback** | String | **新增。** 列渲染错误时的降级内容，默认为 '-' |
| attrs | Object | 其他 el-table-column 的原生属性 |

#### 状态列专用属性 (type: 'status')

| 属性 | 类型 | 说明 |
|------|------|------|
| textMap | Object | 状态文本映射 {状态值: 显示文本} |
| typeMap | Object | 状态类型映射 {状态值: Element UI tag类型} |
| colorMap | Object | 状态颜色映射 {状态值: 颜色值} |
| defaultText | String | 默认文本 |
| defaultType | String | 默认类型，默认为 'info' |
| tagSize | String | 标签大小，默认为 'small' |
| tagEffect | String | 标签效果，默认为 'light' |

#### 时间列专用属性 (type: 'datetime')

| 属性 | 类型 | 说明 |
|------|------|------|
| format | String | 时间格式化字符串，默认为 '{y}-{m}-{d} {h}:{i}:{s}' |

### Pagination 配置详解

| 属性 | 类型 | 说明 |
|------|------|------|
| page | Number | **必需。** 当前页码 |
| limit | Number | **必需。** 每页显示条数 |
| total | Number | **必需。** 总条目数 |
| pageSizes | Array | 每页显示条数选项，默认为 [10, 20, 50, 100] |
| layout | String | 组件布局，默认为 'total, sizes, prev, pager, next, jumper' |
| background | Boolean | 是否为分页按钮添加背景色，默认为 true |
| autoScroll | Boolean | 分页后是否自动滚动到顶部，默认为 true |

### Events

| 事件名称 | 参数 | 说明 |
|---------|------|------|
| sort-change | { column, prop, order } | 当用户进行排序时触发，**🆕 自动防抖处理** |
| selection-change | selection (Array) | 当多选框选择项发生变化时触发 |
| row-click | row, column, event | 当某一行被点击时触发 |
| row-dblclick | row, column, event | 当某一行被双击时触发 |
| pagination-change | { page, limit } | 当分页参数变化时触发，**🆕 自动防抖处理** |
| **🆕 retry** | - | **新增。** 当用户点击重试按钮时触发 |
| **🆕 data-error** | error | **新增。** 当数据格式异常时触发 |
| **🆕 format-error** | error | **新增。** 当格式化失败时触发 |

### Slots

| 插槽名称 | 作用域 | 说明 |
|---------|-------|------|
| [动态插槽名] | { row, column, $index, value } | **核心功能。** 根据 columns 配置中的 slotName 动态生成，**🆕 value已安全处理** |
| actions | - | 便捷的操作列插槽，通常用于放置操作按钮 |
| empty | - | 自定义表格数据为空时的内容 |
| append | - | 在表格最后追加内容，可用于合计行 |

### 方法

BaseTable 暴露了 el-table 的所有原生方法，**🆕 增加了安全检查**：

| 方法名 | 参数 | 说明 |
|-------|------|------|
| clearSelection | - | 用于多选表格，清空用户的选择 |
| toggleRowSelection | row, selected | 用于多选表格，切换某一行的选中状态 |
| toggleAllSelection | - | 用于多选表格，切换全选和全不选 |
| setCurrentRow | row | 用于单选表格，设定某一行为选中行 |
| clearSort | - | 用于清空排序条件 |
| clearFilter | columnKey | 用于清空指定列的过滤条件 |
| doLayout | - | 对表格进行重新布局 |

## 🚀 性能优化特性

### 1. 虚拟滚动

当数据量超过 `virtualThreshold` 时自动启用虚拟滚动：

```vue
<base-table
  :data="largeData"
  :columns="columns"
  :virtual-scroll="true"
  :virtual-threshold="100"  <!-- 超过100条启用 -->
  :virtual-height="400"     <!-- 容器高度 -->
  :item-height="48"         <!-- 行高 -->
/>
```

**优势**：
- 支持 10万+ 条数据流畅渲染
- 内存占用恒定，不随数据量增长
- 滚动流畅，无卡顿

### 2. 列配置优化 (Memoization)

列配置通过 `computed` 属性缓存，避免重复计算：

```javascript
// 优化前：每次渲染都重新处理
:align="column.align || 'left'"

// 优化后：只在配置变化时重新计算
computed: {
  processedColumns() {
    return this.columns.map(column => ({
      ...column,
      align: column.align || 'left'
    }))
  }
}
```

### 3. 防抖处理

自动为频繁操作添加防抖：

```javascript
// 分页和排序操作自动防抖 300ms
@pagination-change="debouncedPaginationChange"
@sort-change="debouncedSortChange"
```

## 🛡️ 错误处理特性

### 1. 数据异常保护

自动检测和处理异常数据：

```javascript
// 自动处理以下情况：
const errorData = [
  null,                    // 空数据
  'invalid-row',          // 非对象数据
  { name: undefined },    // 缺失字段
  { nested: null }        // 嵌套属性异常
]
```

### 2. 渲染错误捕获

使用错误边界组件保护每个单元格：

```vue
<!-- 自动包装每个单元格 -->
<error-boundary :fallback="getCellFallback(scope.row, column)">
  <your-cell-content />
</error-boundary>
```

### 3. 格式化错误处理

安全的时间格式化和属性访问：

```javascript
// 安全的时间格式化
safeFormatTime(time, format) {
  try {
    return parseTime(time, format)
  } catch (error) {
    this.$emit('format-error', { type: 'time', value: time, error })
    return time.toString() // 降级处理
  }
}

// 安全的属性访问（支持嵌套）
safeGetValue(obj, prop) {
  try {
    return prop.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined
    }, obj)
  } catch (error) {
    return undefined
  }
}
```

### 4. 加载失败处理

完善的加载失败和重试机制：

```vue
<template>
  <base-table
    :load-error="loadError"
    :allow-retry="true"
    @retry="handleRetry"
  />
</template>

<script>
export default {
  data() {
    return {
      loadError: false  // 可以是 boolean、string 或 Error 对象
    }
  },
  methods: {
    async fetchData() {
      try {
        const data = await api.getData()
        this.loadError = false
      } catch (error) {
        this.loadError = error.message || '加载失败'
      }
    },
    
    handleRetry() {
      this.fetchData()
    }
  }
}
</script>
```

## 使用示例

### 🆕 虚拟滚动大数据表格

```vue
<template>
  <base-table
    :data="largeData"
    :columns="columns"
    :virtual-scroll="true"
    :virtual-threshold="100"
    :virtual-height="400"
    :item-height="48"
    :show-index="true"
    :loading="loading"
  />
</template>

<script>
export default {
  data() {
    return {
      loading: false,
      largeData: [], // 可以是10000+条数据
      columns: [
        { prop: 'name', label: '姓名', width: '120' },
        { prop: 'email', label: '邮箱', minWidth: '180' },
        { prop: 'status', label: '状态', width: '100', type: 'status', textMap: {1: '在职', 0: '离职'}, typeMap: {1: 'success', 0: 'info'} }
      ]
    }
  },
  created() {
    this.generateLargeData()
  },
  methods: {
    generateLargeData() {
      this.loading = true
      
      // 模拟生成大量数据
      setTimeout(() => {
        const data = []
        for (let i = 1; i <= 10000; i++) {
          data.push({
            id: i,
            name: `用户${i}`,
            email: `user${i}@company.com`,
            status: Math.random() > 0.3 ? 1 : 0
          })
        }
        this.largeData = data
        this.loading = false
      }, 1000)
    }
  }
}
</script>
```

### 🆕 带错误处理的表格

```vue
<template>
  <base-table
    :data="tableData"
    :columns="columns"
    :loading="loading"
    :load-error="loadError"
    :allow-retry="true"
    @retry="handleRetry"
    @data-error="handleDataError"
    @format-error="handleFormatError"
  />
</template>

<script>
export default {
  data() {
    return {
      loading: false,
      loadError: false,
      tableData: [],
      columns: [
        { prop: 'name', label: '姓名' },
        { prop: 'createTime', label: '创建时间', type: 'datetime' },
        { prop: 'user.profile.email', label: '邮箱' }, // 嵌套属性
        { prop: 'status', label: '状态', type: 'status', textMap: {1: '正常', 0: '异常'}, typeMap: {1: 'success', 0: 'danger'} }
      ]
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      this.loading = true
      this.loadError = false
      
      try {
        const response = await api.getData()
        this.tableData = response.data
      } catch (error) {
        this.loadError = error.message || '数据加载失败，请重试'
      } finally {
        this.loading = false
      }
    },
    
    handleRetry() {
      this.fetchData()
    },
    
    handleDataError(error) {
      console.error('数据错误:', error)
      this.$message.warning(`数据第${error.index}行格式异常`)
    },
    
    handleFormatError(error) {
      console.error('格式化错误:', error)
    }
  }
}
</script>
```

### 带状态和时间列的表格

```vue
<template>
  <base-table
    :data="tableData"
    :columns="columns"
    :loading="loading"
  />
</template>

<script>
export default {
  data() {
    return {
      columns: [
        { prop: 'name', label: '名称' },
        { 
          prop: 'status', 
          label: '状态',
          type: 'status',
          textMap: { 1: '启用', 0: '禁用' },
          typeMap: { 1: 'success', 0: 'danger' }
        },
        { 
          prop: 'createTime', 
          label: '创建时间',
          type: 'datetime',
          format: '{y}-{m}-{d} {h}:{i}'
        }
      ]
    }
  }
}
</script>
```

### 排序功能示例

BaseTable 支持前端排序和后端排序两种方式：

#### 前端排序
适用于数据量较小的场景，由 Element UI 在前端进行排序：

```vue
<template>
  <base-table
    :data="tableData"
    :columns="columns"
    :loading="loading"
  />
</template>

<script>
export default {
  data() {
    return {
      columns: [
        { prop: 'name', label: '姓名' },
        { prop: 'age', label: '年龄', sortable: true }, // 前端排序
        { prop: 'salary', label: '薪资', sortable: true }, // 前端排序
        { prop: 'score', label: '评分', sortable: true } // 前端排序
      ]
    }
  }
}
</script>
```

#### 后端排序
适用于大数据量分页场景，排序在后端进行：

```vue
<template>
  <base-table
    :data="tableData"
    :columns="columns"
    :loading="loading"
    :pagination="pagination"
    @sort-change="handleSortChange"
    @pagination-change="handlePaginationChange"
  />
</template>

<script>
export default {
  data() {
    return {
      columns: [
        { prop: 'name', label: '产品名称' },
        { prop: 'price', label: '价格', sortable: 'custom' }, // 后端排序
        { prop: 'sales', label: '销量', sortable: 'custom' }, // 后端排序
        { prop: 'updateTime', label: '更新时间', sortable: 'custom' } // 后端排序
      ],
      currentSort: {
        prop: '',
        order: ''
      }
    }
  },
  methods: {
    // 处理排序变化 (自动防抖)
    handleSortChange({ column, prop, order }) {
      this.currentSort = {
        prop: prop || '',
        order: order || ''
      }
      
      // 重置到第一页
      this.pagination.page = 1
      
      // 重新请求数据
      this.fetchData()
    },
    
    async fetchData() {
      this.loading = true
      try {
        const params = {
          page: this.pagination.page,
          limit: this.pagination.limit,
          sortBy: this.currentSort.prop,
          sortOrder: this.currentSort.order
        }
        const response = await this.$api.getList(params)
        this.tableData = response.data.items
        this.pagination.total = response.data.total
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
```

### 带多选和操作列的表格

```vue
<template>
  <base-table
    :data="tableData"
    :columns="columns"
    :loading="loading"
    :show-selection="true"
    @selection-change="handleSelectionChange"
  >
    <!-- 操作列 -->
    <template v-slot:actions>
      <el-table-column label="操作" width="180" align="center" fixed="right">
        <template v-slot="{ row }">
          <el-button type="primary" size="mini" @click="handleEdit(row)">编辑</el-button>
          <el-button type="danger" size="mini" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </template>
  </base-table>
</template>

<script>
export default {
  data() {
    return {
      selectedRows: [],
      columns: [
        { prop: 'name', label: '名称' },
        { prop: 'code', label: '编码' }
      ]
    }
  },
  methods: {
    handleSelectionChange(selection) {
      this.selectedRows = selection
      console.log('选中行：', selection)
    },
    
    handleEdit(row) {
      console.log('编辑：', row)
    },
    
    handleDelete(row) {
      this.$confirm('确定要删除这条记录吗？', '提示', {
        type: 'warning'
      }).then(() => {
        console.log('删除：', row)
      })
    }
  }
}
</script>
```

### 带自定义插槽的表格

```vue
<template>
  <base-table
    :data="tableData"
    :columns="columns"
    :loading="loading"
  >
    <!-- 自定义头像列 -->
    <template v-slot:avatar="{ row }">
      <el-avatar :src="row.avatar" size="small">
        {{ row.name.charAt(0) }}
      </el-avatar>
    </template>
    
    <!-- 自定义操作列 -->
    <template v-slot:operation="{ row }">
      <el-dropdown>
        <span class="el-dropdown-link">
          操作<i class="el-icon-arrow-down el-icon--right"></i>
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item @click.native="handleEdit(row)">编辑</el-dropdown-item>
          <el-dropdown-item @click.native="handleDelete(row)">删除</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </template>
  </base-table>
</template>

<script>
export default {
  data() {
    return {
      columns: [
        { prop: 'avatar', label: '头像', slotName: 'avatar', width: '80', align: 'center' },
        { prop: 'name', label: '姓名' },
        { prop: 'email', label: '邮箱' },
        { label: '操作', slotName: 'operation', width: '120', align: 'center' }
      ]
    }
  }
}
</script>
```

## 最佳实践

### 1. 列配置管理

将复杂的列配置抽取到单独的文件中：

```javascript
// columns/userColumns.js
export const userColumns = [
  { prop: 'name', label: '姓名', width: '120' },
  { prop: 'email', label: '邮箱', minWidth: '180' },
  { 
    prop: 'status', 
    label: '状态',
    type: 'status',
    textMap: { 1: '正常', 0: '禁用' },
    typeMap: { 1: 'success', 0: 'danger' }
  },
  { 
    prop: 'createTime', 
    label: '创建时间',
    type: 'datetime',
    width: '160'
  }
]
```

### 2. 使用混入简化代码

```javascript
// mixins/tableMixin.js
export default {
  data() {
    return {
      loading: false,
      tableData: [],
      loadError: false,
      pagination: {
        page: 1,
        limit: 10,
        total: 0
      }
    }
  },
  methods: {
    async fetchData() {
      this.loading = true
      this.loadError = false
      
      try {
        const response = await this.getListData()
        this.tableData = response.data.items
        this.pagination.total = response.data.total
      } catch (error) {
        this.loadError = error.message || '加载失败'
      } finally {
        this.loading = false
      }
    },
    
    handlePaginationChange() {
      this.fetchData()
    },
    
    handleRetry() {
      this.fetchData()
    }
  }
}
```

### 3. 结合 TableToolbar 使用

```vue
<template>
  <div class="app-container">
    <!-- 表格工具栏 -->
    <table-toolbar
      :selected-rows="selectedRows"
      :enable-batch-actions="true"
      @refresh="fetchData"
      @batch-delete="handleBatchDelete"
    >
      <template slot="toolbar-left">
        <el-button type="primary" @click="handleAdd">新增</el-button>
      </template>
    </table-toolbar>
    
    <!-- 表格 -->
    <base-table
      :data="tableData"
      :columns="columns"
      :loading="loading"
      :load-error="loadError"
      :show-selection="true"
      :pagination="pagination"
      @selection-change="selectedRows = $event"
      @pagination-change="handlePaginationChange"
      @retry="handleRetry"
    />
  </div>
</template>
```

## 🚧 注意事项

### 性能相关
1. **虚拟滚动**：启用虚拟滚动时，请确保每行高度一致
2. **列配置**：频繁变化的列配置会触发重新计算，建议保持稳定
3. **防抖延迟**：默认300ms，可根据实际需求调整

### 数据安全
1. **数据格式**：确保传入的data是数组格式
2. **嵌套属性**：使用点号分隔，如 'user.profile.name'
3. **错误监听**：建议监听 `data-error` 和 `format-error` 事件

### 兼容性
1. **Vue版本**：支持Vue 2.6+
2. **Element UI**：需要Element UI 2.x
3. **浏览器**：现代浏览器，IE11+

### 升级指南
1. **向后兼容**：所有原有API保持兼容
2. **新增属性**：可选择性使用新功能
3. **错误处理**：建议添加错误监听处理

## 扩展开发

如果需要扩展 BaseTable 的功能，建议：

1. 优先通过插槽和配置来实现自定义需求
2. 对于通用的列类型，可以在组件内部添加新的 type 支持
3. 复杂的业务逻辑应该在父组件中处理，而不是在 BaseTable 中
4. 保持组件的通用性，避免添加过于具体的业务逻辑
5. **🆕 新增错误边界**：可以自定义 ErrorBoundary 组件来处理特殊错误情况 