# 刷新按钮组件 (RefreshButton)

## 简介

RefreshButton是一个简单而功能全面的刷新按钮组件，用于触发表格或其他数据容器的刷新操作。组件支持自定义样式、自动加载状态和刷新前确认等功能。

## 功能特点

- 支持自定义按钮文本和图标
- 支持所有Element UI按钮的样式属性（类型、大小、圆角等）
- 支持自动显示加载状态
- 支持刷新前确认提示
- 提供加载状态管理API

## 使用方法

### 基本使用

```vue
<template>
  <refresh-button @refresh="refreshData" />
</template>

<script>
import RefreshButton from '@/components/RefreshButton'

export default {
  components: {
    RefreshButton
  },
  methods: {
    refreshData() {
      console.log('刷新数据...')
      this.fetchData()
    }
  }
}
</script>
```

### 自定义样式

```vue
<template>
  <refresh-button
    text="重新加载"
    icon="el-icon-refresh-right"
    type="primary"
    size="small"
    plain
    @refresh="refreshData"
  />
</template>
```

### 使用自动加载状态

```vue
<template>
  <refresh-button
    auto-loading
    :auto-loading-duration="800"
    @refresh="refreshData"
  />
</template>
```

### 使用刷新确认

```vue
<template>
  <refresh-button
    confirm-before-refresh
    confirm-text="确定要刷新表格数据吗？当前操作可能会丢失未保存的更改。"
    confirm-title="刷新确认"
    @refresh="refreshData"
    @cancel="handleRefreshCancel"
  />
</template>

<script>
export default {
  methods: {
    refreshData() {
      // 刷新数据逻辑
    },
    handleRefreshCancel() {
      console.log('用户取消了刷新操作')
    }
  }
}
</script>
```

### 圆形按钮样式

```vue
<template>
  <refresh-button
    text=""
    circle
    type="primary"
    @refresh="refreshData"
  />
</template>
```

### 手动控制加载状态

```vue
<template>
  <refresh-button
    ref="refreshButton"
    :loading="isLoading"
    @refresh="refreshWithLoading"
  />
</template>

<script>
export default {
  data() {
    return {
      isLoading: false
    }
  },
  methods: {
    refreshWithLoading() {
      this.isLoading = true
      
      fetchData().then(response => {
        // 处理数据
      }).finally(() => {
        this.isLoading = false
      })
    }
  }
}
</script>
```

### 使用组件引用控制加载状态

```vue
<template>
  <refresh-button
    ref="refreshButton"
    auto-loading
    @refresh="refreshWithAPI"
  />
</template>

<script>
export default {
  methods: {
    refreshWithAPI() {
      // 组件会自动显示短暂的加载状态
      
      // 如果需要更长时间的加载状态，可以手动停止
      fetchData().then(response => {
        // 处理数据
      }).finally(() => {
        // 如果加载时间超过自动加载时间，手动停止
        this.$refs.refreshButton.stopLoading()
      })
    }
  }
}
</script>
```

## Props

| 属性名 | 类型 | 默认值 | 说明 |
|-------|------|-------|------|
| text | String | '刷新' | 按钮文本 |
| icon | String | 'el-icon-refresh' | 按钮图标 |
| hideIcon | Boolean | false | 是否隐藏图标 |
| size | String | 'mini' | 按钮大小，可选值：medium、small、mini |
| type | String | 'default' | 按钮类型，可选值：primary、success、warning、danger、info、text |
| plain | Boolean | false | 是否为朴素按钮 |
| round | Boolean | false | 是否为圆角按钮 |
| circle | Boolean | false | 是否为圆形按钮 |
| title | String | '' | 按钮标题（hover提示文本），为空时使用text值 |
| disabled | Boolean | false | 是否禁用按钮 |
| loading | Boolean | false | 是否显示加载状态 |
| autoLoading | Boolean | false | 点击后是否自动显示加载状态 |
| autoLoadingDuration | Number | 500 | 自动加载状态持续时间（毫秒） |
| confirmBeforeRefresh | Boolean | false | 是否在刷新前显示确认对话框 |
| confirmText | String | '确定刷新数据吗？' | 刷新确认对话框文本 |
| confirmTitle | String | '刷新确认' | 刷新确认对话框标题 |

## 事件

| 事件名 | 说明 | 参数 |
|-------|------|------|
| refresh | 点击刷新按钮时触发 | - |
| cancel | 当启用确认且用户取消刷新时触发 | - |

## 方法

通过给组件添加ref引用，可以调用以下方法：

| 方法名 | 说明 | 参数 |
|-------|------|------|
| stopLoading | 手动停止加载状态 | - |
| startLoading | 手动开始加载状态 | - |
| clearLoadingTimer | 清除加载定时器 | - |

## 与表格组件集成

### 基本集成

```vue
<template>
  <div class="app-container">
    <div class="table-header">
      <refresh-button @refresh="fetchTableData" />
      <!-- 其他操作按钮 -->
    </div>
    
    <el-table
      v-loading="tableLoading"
      :data="tableData"
    >
      <!-- 表格列定义 -->
    </el-table>
  </div>
</template>

<script>
import RefreshButton from '@/components/RefreshButton'

export default {
  components: {
    RefreshButton
  },
  data() {
    return {
      tableData: [],
      tableLoading: false
    }
  },
  created() {
    this.fetchTableData()
  },
  methods: {
    fetchTableData() {
      this.tableLoading = true
      
      getDataAPI().then(response => {
        this.tableData = response.data
      }).finally(() => {
        this.tableLoading = false
      })
    }
  }
}
</script>
```

### 与TableToolbar组件集成

```vue
<template>
  <div class="app-container">
    <div class="table-toolbar">
      <el-button type="primary" icon="el-icon-plus">新增</el-button>
      <refresh-button @refresh="fetchTableData" />
      <el-button icon="el-icon-download">导出</el-button>
    </div>
    
    <el-table :data="tableData">
      <!-- 表格列定义 -->
    </el-table>
  </div>
</template>
```

### 与SearchFilterBar组件集成

```vue
<template>
  <div class="app-container">
    <!-- 搜索筛选栏 -->
    <search-filter-bar
      :filter-fields="filterFields"
      @search="handleSearch"
    >
      <template #actions>
        <refresh-button @refresh="refreshData" />
      </template>
    </search-filter-bar>
    
    <!-- 表格部分 -->
  </div>
</template>
```

## 注意事项

1. 如果设置了`autoLoading`属性，组件会在点击后自动显示一个短暂的加载状态，持续时间由`autoLoadingDuration`控制
2. 如果你的数据加载时间可能超过`autoLoadingDuration`，建议通过`loading`属性手动控制加载状态
3. 当使用`circle`属性时，按钮文本会被隐藏，只显示图标
4. 当组件处于加载状态时，图标会被自动替换为加载动画 