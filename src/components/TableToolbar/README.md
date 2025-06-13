# TableToolbar 表格工具栏组件

## 概述

TableToolbar 是一个功能丰富的表格工具栏组件，为数据表格提供完整的操作界面。组件集成了搜索、刷新、导入导出、列设置、批量操作等常用功能，并具备现代化的用户体验特性。

## 功能特性

### 🔍 搜索功能
- **实时搜索**：支持输入即搜索，提升用户体验
- **防抖保护**：300ms 防抖机制，避免频繁API调用
- **搜索历史**：记录用户搜索历史，支持快速重用
- **清空功能**：一键清空搜索条件

### 🔄 刷新功能
- **手动刷新**：支持点击刷新按钮
- **自动刷新**：可配置自动刷新间隔
- **加载状态**：显示刷新进度和加载动画
- **错误重试**：网络错误时提供重试机制

### 📥📤 导入导出功能
- **文件上传**：支持拖拽上传和点击选择
- **模板下载**：提供标准模板下载
- **数据验证**：导入时进行数据格式验证
- **多格式导出**：支持Excel、CSV等多种格式
- **筛选导出**：仅导出当前筛选条件下的数据

### ⚙️ 列设置功能
- **显示/隐藏**：动态控制列的显示状态
- **列排序**：支持拖拽调整列顺序
- **宽度调整**：可调整列宽度
- **配置保存**：用户配置自动保存到本地存储
- **重置功能**：一键重置为默认配置

### ✅ 批量操作功能
- **批量删除**：支持批量删除选中记录
- **批量状态变更**：批量修改记录状态
- **自定义操作**：支持扩展自定义批量操作
- **操作确认**：危险操作提供二次确认

### 📱 响应式设计
- **移动端适配**：自动适配不同屏幕尺寸
- **抽屉式菜单**：移动端使用抽屉式操作面板
- **触摸友好**：优化移动设备触摸交互

### 🛡️ 错误处理
- **错误边界**：组件级错误隔离
- **重试机制**：自动或手动重试失败操作
- **错误提示**：友好的错误消息显示
- **日志记录**：操作日志和错误追踪

### ⚡ 性能优化
- **防抖节流**：用户交互防抖和滚动节流
- **虚拟化支持**：大数据量表格性能优化
- **操作历史**：记录和分析用户操作
- **资源管理**：自动清理事件监听器和定时器

## 使用方法

### 基础用法

```vue
<template>
  <div>
    <table-toolbar
      :columns="columns"
      :selected-rows="selectedRows"
      @search="handleSearch"
      @refresh="handleRefresh"
    />
    
    <el-table
      :data="tableData"
      @selection-change="handleSelectionChange"
    >
      <!-- 表格列定义 -->
    </el-table>
  </div>
</template>

<script>
import TableToolbar from '@/components/TableToolbar'

export default {
  components: {
    TableToolbar
  },
  data() {
    return {
      tableData: [],
      selectedRows: [],
      columns: [
        { prop: 'name', label: '名称', width: 120 },
        { prop: 'status', label: '状态', width: 100 }
      ]
    }
  },
  methods: {
    handleSearch(keyword) {
      // 搜索逻辑
      console.log('搜索关键词:', keyword)
    },
    handleRefresh() {
      // 刷新逻辑
      this.loadData()
    },
    handleSelectionChange(selection) {
      this.selectedRows = selection
    }
  }
}
</script>
```

### 完整配置示例

```vue
<template>
  <table-toolbar
    v-bind="toolbarProps"
    @search="handleSearch"
    @refresh="handleRefresh"
    @import="handleImport"
    @export="handleExport"
    @batch-action="handleBatchAction"
    @column-change="handleColumnChange"
  />
</template>

<script>
export default {
  computed: {
    toolbarProps() {
      return {
        // 基础配置
        columns: this.columns,
        selectedRows: this.selectedRows,
        
        // 功能开关
        enableRefresh: true,
        enableImport: true,
        enableExport: true,
        enableColumnSettings: true,
        enableBatchActions: true,
        
        // 搜索配置
        searchPlaceholder: '请输入搜索关键词',
        searchDebounce: 300,
        
        // 刷新配置
        refreshInterval: 0, // 0表示禁用自动刷新
        refreshTooltip: '刷新数据',
        
        // 导入配置
        importAccept: '.xlsx,.xls,.csv',
        importMaxSize: 10, // MB
        importTemplateUrl: '/api/template/download',
        
        // 导出配置
        exportFormats: ['excel', 'csv'],
        exportFilename: '数据导出',
        
        // 批量操作配置
        batchActions: [
          { key: 'delete', label: '批量删除', type: 'danger' },
          { key: 'enable', label: '批量启用', type: 'success' },
          { key: 'disable', label: '批量禁用', type: 'warning' }
        ],
        
        // 列设置配置
        columnStorageKey: 'table-columns-config',
        
        // 主题配置
        theme: 'default', // default | compact | minimal
        
        // 移动端配置
        mobileBreakpoint: 768,
        
        // 性能配置
        enableVirtualization: this.tableData.length > 1000,
        
        // 错误处理配置
        enableErrorBoundary: true,
        maxRetries: 3,
        
        // 无障碍配置
        enableA11y: true
      }
    }
  },
  
  methods: {
    async handleSearch(keyword) {
      try {
        this.loading = true
        const response = await this.api.search({ keyword })
        this.tableData = response.data
      } catch (error) {
        this.$message.error('搜索失败: ' + error.message)
      } finally {
        this.loading = false
      }
    },
    
    async handleRefresh() {
      await this.loadData()
      this.$message.success('数据已刷新')
    },
    
    async handleImport(file) {
      try {
        const formData = new FormData()
        formData.append('file', file)
        
        const response = await this.api.import(formData)
        this.$message.success(`导入成功，共${response.count}条记录`)
        await this.loadData()
      } catch (error) {
        this.$message.error('导入失败: ' + error.message)
      }
    },
    
    async handleExport(format) {
      try {
        const response = await this.api.export({
          format,
          query: this.query
        })
        
        // 下载文件
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const a = document.createElement('a')
        a.href = url
        a.download = `数据导出.${format}`
        a.click()
        window.URL.revokeObjectURL(url)
        
        this.$message.success('导出完成')
      } catch (error) {
        this.$message.error('导出失败: ' + error.message)
      }
    },
    
    async handleBatchAction({ action, rows }) {
      const confirm = await this.$confirm(
        `确定要${action.label}选中的${rows.length}条记录吗？`,
        '确认操作',
        { type: 'warning' }
      )
      
      if (confirm) {
        try {
          const ids = rows.map(row => row.id)
          await this.api.batchAction(action.key, ids)
          this.$message.success(`${action.label}成功`)
          await this.loadData()
        } catch (error) {
          this.$message.error(`${action.label}失败: ` + error.message)
        }
      }
    },
    
    handleColumnChange(columns) {
      this.columns = columns
      // 可选：保存到服务器
      // this.api.saveColumnConfig(columns)
    }
  }
}
</script>
```

## Props 属性

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| columns | Array | [] | 表格列配置 |
| selectedRows | Array | [] | 选中的行数据 |
| enableRefresh | Boolean | true | 是否启用刷新功能 |
| enableImport | Boolean | false | 是否启用导入功能 |
| enableExport | Boolean | false | 是否启用导出功能 |
| enableColumnSettings | Boolean | false | 是否启用列设置功能 |
| enableBatchActions | Boolean | false | 是否启用批量操作功能 |
| searchPlaceholder | String | '请输入搜索关键词' | 搜索框占位符 |
| searchDebounce | Number | 300 | 搜索防抖延迟(ms) |
| refreshInterval | Number | 0 | 自动刷新间隔(ms)，0表示禁用 |
| refreshTooltip | String | '刷新' | 刷新按钮提示文本 |
| importAccept | String | '.xlsx,.xls,.csv' | 导入文件类型限制 |
| importMaxSize | Number | 10 | 导入文件最大大小(MB) |
| importTemplateUrl | String | '' | 导入模板下载地址 |
| exportFormats | Array | ['excel'] | 支持的导出格式 |
| exportFilename | String | '数据导出' | 导出文件名 |
| batchActions | Array | [] | 批量操作配置 |
| columnStorageKey | String | 'table-columns' | 列配置存储键名 |
| theme | String | 'default' | 主题样式 |
| mobileBreakpoint | Number | 768 | 移动端断点(px) |
| enableVirtualization | Boolean | false | 是否启用虚拟化 |
| enableErrorBoundary | Boolean | true | 是否启用错误边界 |
| maxRetries | Number | 3 | 最大重试次数 |
| enableA11y | Boolean | true | 是否启用无障碍功能 |

## Events 事件

| 事件名 | 参数 | 说明 |
|--------|------|------|
| search | keyword: String | 搜索事件 |
| refresh | - | 刷新事件 |
| import | file: File | 导入文件事件 |
| export | format: String | 导出事件 |
| batch-action | { action: Object, rows: Array } | 批量操作事件 |
| column-change | columns: Array | 列配置变更事件 |
| error | error: Error | 错误事件 |

## 插槽 Slots

| 插槽名 | 说明 |
|--------|------|
| left | 左侧自定义内容 |
| right | 右侧自定义内容 |
| search | 自定义搜索区域 |
| actions | 自定义操作区域 |

## 样式变量

```scss
// 主题颜色
$toolbar-primary-color: #409EFF;
$toolbar-success-color: #67C23A;
$toolbar-warning-color: #E6A23C;
$toolbar-danger-color: #F56C6C;

// 尺寸
$toolbar-height: 56px;
$toolbar-padding: 16px;
$toolbar-border-radius: 4px;

// 字体
$toolbar-font-size: 14px;
$toolbar-font-weight: 400;

// 间距
$toolbar-gap: 8px;
$toolbar-button-gap: 12px;

// 阴影
$toolbar-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

// 移动端
$toolbar-mobile-height: 48px;
$toolbar-mobile-padding: 12px;
```

## 最佳实践

### 1. 性能优化

```javascript
// 使用防抖处理搜索
created() {
  this.debouncedSearch = debounce(this.handleSearch, 300)
},

// 大数据量时启用虚拟化
computed: {
  enableVirtualization() {
    return this.tableData.length > 1000
  }
}
```

### 2. 错误处理

```javascript
// 统一错误处理
async handleOperation(operation) {
  try {
    await operation()
  } catch (error) {
    this.$message.error(this.getErrorMessage(error))
    this.$emit('error', error)
  }
},

getErrorMessage(error) {
  if (error.response?.data?.message) {
    return error.response.data.message
  }
  return error.message || '操作失败'
}
```

### 3. 响应式设计

```javascript
// 检测移动端
computed: {
  isMobile() {
    return window.innerWidth < this.mobileBreakpoint
  }
},

// 移动端优化
methods: {
  handleMobileAction() {
    if (this.isMobile) {
      // 使用抽屉式菜单
      this.showMobileDrawer = true
    }
  }
}
```

### 4. 无障碍支持

```vue
<template>
  <!-- 添加ARIA属性 -->
  <div
    class="table-toolbar"
    role="toolbar"
    :aria-label="$t('toolbar.label')"
  >
    <el-input
      v-model="searchKeyword"
      :placeholder="searchPlaceholder"
      :aria-label="$t('search.label')"
      @input="debouncedSearch"
    />
  </div>
</template>
```

## 常见问题

### Q: 如何自定义批量操作？

A: 通过 `batchActions` 属性配置：

```javascript
batchActions: [
  {
    key: 'custom-action',
    label: '自定义操作',
    type: 'primary',
    icon: 'el-icon-setting',
    disabled: (rows) => rows.length === 0
  }
]
```

### Q: 如何保存列配置到服务器？

A: 监听 `column-change` 事件：

```javascript
async handleColumnChange(columns) {
  try {
    await this.api.saveColumnConfig({
      key: this.columnStorageKey,
      columns
    })
  } catch (error) {
    console.error('保存列配置失败:', error)
  }
}
```

### Q: 如何集成第三方导入导出库？

A: 可以通过事件监听器集成：

```javascript
async handleExport(format) {
  if (format === 'excel') {
    // 使用 xlsx 库
    const XLSX = await import('xlsx')
    const wb = XLSX.utils.json_to_sheet(this.tableData)
    XLSX.writeFile(wb, 'export.xlsx')
  }
}
```

## 更新日志

### v1.2.0 (2024-01-15)
- ✨ 新增批量操作功能
- ✨ 新增列设置功能
- 🎨 优化移动端响应式设计
- 🛡️ 增强错误处理机制
- ⚡ 性能优化和虚拟化支持

### v1.1.0 (2024-01-10)
- ✨ 新增导入导出功能
- 🎨 改进搜索体验
- 🐛 修复刷新状态问题
- 📱 移动端适配优化

### v1.0.0 (2024-01-05)
- 🎉 初始版本发布
- ✨ 基础搜索和刷新功能
- 📱 响应式设计
- 🛡️ 错误边界保护

## 许可证

MIT License 