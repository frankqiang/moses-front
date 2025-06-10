# BaseTable 表格组件

## 简介

BaseTable 是一个基于 Element UI 的 el-table 封装的配置驱动表格组件。它通过 JavaScript 配置对象来定义表格结构，减少模板中的重复代码，同时集成了加载状态、分页、空状态、状态标签等常用功能。

## 功能特点

- **配置驱动**：通过 `columns` 配置数组来定义表格结构，而不是在模板中编写大量 `el-table-column`
- **高度集成**：内置分页组件、状态标签组件，开箱即用
- **灵活扩展**：支持强大的插槽系统，可以自定义任何列的渲染
- **类型支持**：内置状态列和时间列的默认渲染
- **完整透传**：通过 `$attrs` 完全支持 el-table 的所有原生属性
- **方法暴露**：暴露 el-table 的所有原生方法
- **统一体验**：提供一致的加载状态、空状态和分页体验

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

### 带有自定义插槽的示例

```vue
<template>
  <base-table
    :data="tableData"
    :columns="columns"
    :loading="loading"
    :show-selection="true"
    :pagination="pagination"
    @selection-change="handleSelectionChange"
    @pagination-change="handlePaginationChange"
  >
    <!-- 自定义状态列渲染 -->
    <template v-slot:status="{ row, value }">
      <status-tag
        :status="value"
        :text-map="statusTextMap"
        :type-map="statusTypeMap"
      />
    </template>

    <!-- 自定义操作列 -->
    <template v-slot:actions>
      <el-table-column label="操作" width="150" align="center" fixed="right">
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
      columns: [
        { prop: 'name', label: '名称' },
        { prop: 'code', label: '编码' },
        { prop: 'status', label: '状态', slotName: 'status' } // 使用插槽
      ],
      statusTextMap: {
        1: '启用',
        0: '禁用'
      },
      statusTypeMap: {
        1: 'success',
        0: 'danger'
      }
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
| showSelection | Boolean | false | 是否显示多选框列 |
| showIndex | Boolean | false | 是否显示序号列 |
| indexMethod | Function | null | 序号计算方法，接收参数为当前行的index |
| pagination | Object | null | 分页配置对象，如果传入则显示分页 |
| showPagination | Boolean | true | 当pagination存在时，是否显示分页组件 |

**注意：** BaseTable 通过 `v-bind="$attrs"` 支持 el-table 的所有原生属性，如 `height`、`max-height`、`stripe`、`border`、`row-key` 等。

### Columns 配置详解

每个 `column` 对象可以包含以下属性：

| 属性 | 类型 | 说明 |
|------|------|------|
| prop | String | 对应 data 数组中对象的键名 |
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
| sort-change | { column, prop, order } | 当用户进行排序时触发 |
| selection-change | selection (Array) | 当多选框选择项发生变化时触发 |
| row-click | row, column, event | 当某一行被点击时触发 |
| row-dblclick | row, column, event | 当某一行被双击时触发 |
| pagination-change | { page, limit } | 当分页参数变化时触发 |

### Slots

| 插槽名称 | 作用域 | 说明 |
|---------|-------|------|
| [动态插槽名] | { row, column, $index, value } | **核心功能。** 根据 columns 配置中的 slotName 动态生成 |
| actions | - | 便捷的操作列插槽，通常用于放置操作按钮 |
| empty | - | 自定义表格数据为空时的内容 |
| append | - | 在表格最后追加内容，可用于合计行 |

### 方法

BaseTable 暴露了 el-table 的所有原生方法：

| 方法名 | 参数 | 说明 |
|-------|------|------|
| clearSelection | - | 用于多选表格，清空用户的选择 |
| toggleRowSelection | row, selected | 用于多选表格，切换某一行的选中状态 |
| toggleAllSelection | - | 用于多选表格，切换全选和全不选 |
| setCurrentRow | row | 用于单选表格，设定某一行为选中行 |
| clearSort | - | 用于清空排序条件 |
| clearFilter | columnKey | 用于清空指定列的过滤条件 |
| doLayout | - | 对表格进行重新布局 |

## 使用示例

### 1. 基础表格

```vue
<template>
  <base-table
    :data="tableData"
    :columns="columns"
    :loading="loading"
    border
    stripe
  />
</template>

<script>
export default {
  data() {
    return {
      loading: false,
      tableData: [
        { id: 1, name: '张三', age: 25, email: 'zhangsan@example.com' },
        { id: 2, name: '李四', age: 30, email: 'lisi@example.com' }
      ],
      columns: [
        { prop: 'name', label: '姓名', width: '100' },
        { prop: 'age', label: '年龄', width: '80', align: 'center' },
        { prop: 'email', label: '邮箱', minWidth: '150' }
      ]
    }
  }
}
</script>
```

### 2. 带分页的表格

```vue
<template>
  <base-table
    :data="tableData"
    :columns="columns"
    :loading="loading"
    :pagination="pagination"
    @pagination-change="handlePaginationChange"
  />
</template>

<script>
export default {
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
        { prop: 'name', label: '姓名' },
        { prop: 'code', label: '编码' }
      ]
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      this.loading = true
      try {
        const response = await this.$api.getList({
          page: this.pagination.page,
          limit: this.pagination.limit
        })
        this.tableData = response.data.items
        this.pagination.total = response.data.total
      } finally {
        this.loading = false
      }
    },
    
    handlePaginationChange() {
      this.fetchData()
    }
  }
}
</script>
```

### 3. 带状态和时间列的表格

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

### 4. 排序功能示例

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
    // 处理排序变化
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

### 5. 带多选和操作列的表格

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

### 5. 带自定义插槽的表格

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
      try {
        const response = await this.getListData()
        this.tableData = response.data.items
        this.pagination.total = response.data.total
      } finally {
        this.loading = false
      }
    },
    
    handlePaginationChange() {
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
      :show-selection="true"
      :pagination="pagination"
      @selection-change="selectedRows = $event"
      @pagination-change="handlePaginationChange"
    />
  </div>
</template>
```

## 注意事项

1. **列配置优先级**：插槽 > 内置类型渲染 > 默认渲染
2. **分页配置**：使用 `.sync` 修饰符确保分页状态正确同步
3. **性能优化**：对于大量数据，建议使用后端分页
4. **插槽作用域**：合理使用插槽的作用域数据，避免在模板中进行复杂计算
5. **事件处理**：表格事件统一通过 emit 向上传递，保持组件的单向数据流

## 扩展开发

如果需要扩展 BaseTable 的功能，建议：

1. 优先通过插槽和配置来实现自定义需求
2. 对于通用的列类型，可以在组件内部添加新的 type 支持
3. 复杂的业务逻辑应该在父组件中处理，而不是在 BaseTable 中
4. 保持组件的通用性，避免添加过于具体的业务逻辑 