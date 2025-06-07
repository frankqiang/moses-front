# 表格工具栏组件 (TableToolbar)

## 简介

表格工具栏组件是一个用于表格操作的通用工具栏，集成了批量操作、导入/导出、刷新和列设置等功能，为表格提供了统一的操作界面。该组件主要用于增强表格的用户体验和功能性，提供了丰富的配置选项和事件回调。

## 更新日志

- 2024-12-16: 集成表格配置存储服务，实现集中式配置管理、版本控制和自动清理
- 2024-12-15: 重构列设置功能，使用独立的ColumnSettings组件替代内置实现
- 2024-07-21: 增加自定义批量操作功能
- 2023-12-01: 初始版本发布

## 功能特点

- 批量操作功能：删除、启用/禁用等
- 导入/导出功能：支持Excel导入/导出
- 刷新功能：刷新表格数据
- 列设置功能：配置表格显示的列，支持集中式存储和自动清理
- 左右布局：左侧用于新增按钮，右侧用于功能操作
- 丰富的插槽：支持自定义内容

## 使用说明

### 基本使用

```vue
<template>
  <div class="app-container">
    <!-- 表格工具栏 -->
    <table-toolbar
      :column-options="allColumns"
      :default-visible-columns="defaultColumns"
      :storage-key="tableStorageKey"
      :enable-batch-actions="true"
      :selected-rows="selectedRows"
      @refresh="fetchData"
      @column-change="handleColumnChange"
      @batch-delete="handleBatchDelete"
    >
      <!-- 左侧插槽内容 -->
      <template slot="toolbar-left">
        <el-button type="primary" size="mini" @click="handleAdd">新增</el-button>
      </template>
    </table-toolbar>
    
    <!-- 表格 -->
    <el-table
      v-loading="loading"
      :data="tableData"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      
      <template v-for="col in visibleColumns">
        <el-table-column
          :key="col.prop"
          v-bind="col"
        />
      </template>
    </el-table>
  </div>
</template>

<script>
import { fetchList, batchDelete } from '@/api/example'
import columnSettingsMixin from '@/components/TableToolbar/columnSettingsMixin'

export default {
  mixins: [columnSettingsMixin],
  data() {
    return {
      loading: false,
      tableData: [],
      selectedRows: [],
      allColumns: [
        { prop: 'name', label: '名称', width: '120px' },
        { prop: 'code', label: '编码', width: '120px' },
        { prop: 'type', label: '类型', width: '100px' },
        { prop: 'status', label: '状态', width: '80px' },
        { prop: 'createTime', label: '创建时间', width: '150px' },
      ],
      defaultVisibleColumns: ['name', 'code', 'status'],
      // 表格存储键前缀，用于区分不同表格
      columnSettingsKeyPrefix: 'example_table_columns'
    }
  },
  created() {
    this.fetchData()
    // 可选：迁移旧的配置到新的存储服务
    this.migrateOldColumnSettings()
  },
  methods: {
    // 获取表格数据
    fetchData() {
      this.loading = true
      fetchList().then(response => {
        this.tableData = response.data.items
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    
    // 选择行变化
    handleSelectionChange(selection) {
      this.selectedRows = selection
    },
    
    // 批量删除
    handleBatchDelete(rows) {
      const ids = rows.map(row => row.id)
      batchDelete(ids).then(() => {
        this.$message.success('批量删除成功')
        this.fetchData()
      })
    },
    
    // 新增记录
    handleAdd() {
      // 处理新增逻辑
    }
  }
}
</script>
```

## 组件配置

### Props

#### 通用配置
| 属性 | 类型 | 默认值 | 说明 |
|------|------|-------|------|
| size | String | 'mini' | 按钮大小 |

#### 列设置相关
| 属性 | 类型 | 默认值 | 说明 |
|------|------|-------|------|
| enableColumnSettings | Boolean | true | 是否启用列设置 |
| columnOptions | Array | [] | 列选项，每个选项需包含prop和label属性 |
| storageKey | String | 'table_visible_columns' | 存储键名 |
| defaultVisibleColumns | Array | [] | 默认可见列 |

#### 批量操作相关
| 属性 | 类型 | 默认值 | 说明 |
|------|------|-------|------|
| enableBatchActions | Boolean | false | 是否启用批量操作 |
| selectedRows | Array | [] | 选中的行数据 |
| minSelection | Number | 1 | 最小选择数量 |
| showSelectedCount | Boolean | true | 是否显示选中数量 |
| showDefaultActions | Boolean | true | 是否显示默认操作 |
| hideDeleteButton | Boolean | false | 是否隐藏删除按钮 |
| hideStatusButtons | Boolean | false | 是否隐藏状态按钮 |
| deleteText | String | '' | 删除按钮文本 |
| deleteIcon | String | 'el-icon-delete' | 删除按钮图标 |
| statusText | String | '' | 状态按钮文本 |
| enableText | String | '' | 启用按钮文本 |
| enableIcon | String | 'el-icon-check' | 启用按钮图标 |
| disableText | String | '' | 禁用按钮文本 |
| disableIcon | String | 'el-icon-close' | 禁用按钮图标 |
| statusButtonsMode | String | 'dropdown' | 状态按钮模式，可选值：'dropdown'、'buttons' |
| customActions | Array | [] | 自定义操作，每项包含name、text和icon属性 |
| deleteConfirm | Boolean | true | 是否需要删除确认 |
| deleteConfirmText | String | '确认批量删除选中项吗？此操作不可恢复' | 删除确认文本 |
| deleteConfirmTitle | String | '警告' | 删除确认标题 |
| statusConfirm | Boolean | true | 是否需要状态变更确认 |

#### 导入按钮相关
| 属性 | 类型 | 默认值 | 说明 |
|------|------|-------|------|
| enableImport | Boolean | false | 是否启用导入 |
| importApi | Function | null | 导入API函数 |
| templateApi | Function | null | 模板下载API函数 |
| importText | String | '导入' | 导入按钮文本 |
| importIcon | String | 'el-icon-upload2' | 导入按钮图标 |
| importType | String | 'default' | 导入按钮类型 |
| importDisabled | Boolean | false | 是否禁用导入按钮 |
| importDialogTitle | String | '导入数据' | 导入对话框标题 |

#### 导出按钮相关
| 属性 | 类型 | 默认值 | 说明 |
|------|------|-------|------|
| enableExport | Boolean | false | 是否启用导出 |
| exportApi | Function | null | 导出API函数 |
| exportParams | Object | {} | 导出参数 |
| exportFilename | String | '导出数据' | 导出文件名 |
| exportText | String | '导出' | 导出按钮文本 |
| exportIcon | String | 'el-icon-download' | 导出按钮图标 |
| exportType | String | 'default' | 导出按钮类型 |
| exportDisabled | Boolean | false | 是否禁用导出按钮 |
| exportConfirm | Boolean | true | 是否需要导出确认 |

### 事件

| 事件名称 | 说明 | 参数 |
|---------|------|------|
| refresh | 刷新按钮点击时触发 | 无 |
| column-change | 列设置变更时触发 | columns: Array (可见列prop数组) |
| batch-delete | 批量删除时触发 | rows: Array (选中的行数据) |
| batch-enable | 批量启用时触发 | rows: Array (选中的行数据) |
| batch-disable | 批量禁用时触发 | rows: Array (选中的行数据) |
| batch-status | 批量状态变更时触发 | rows: Array (选中的行数据), status: String/Number (状态值) |
| custom-action | 自定义批量操作时触发 | action: Object (操作定义), rows: Array (选中的行数据) |
| import-success | 导入成功时触发 | result: Object (导入结果) |
| import-error | 导入失败时触发 | error: Object (错误信息) |
| export-success | 导出成功时触发 | result: Object (导出结果) |
| export-error | 导出失败时触发 | error: Object (错误信息) |

### 插槽

| 插槽名称 | 说明 |
|---------|------|
| toolbar-left | 工具栏左侧内容，通常用于放置新增按钮 |
| toolbar-right | 工具栏右侧内容，在所有功能按钮之后 |
| batch-actions | 批量操作区域的自定义内容 |
| import-tips | 导入对话框中的提示信息 |

## 列设置功能

### 集中式配置存储

从2024-12-16版本开始，表格工具栏组件集成了表格配置存储服务，提供以下增强功能：

1. **集中式配置管理** - 所有表格配置存储在统一的JSON对象中，避免localStorage碎片化
2. **配置版本控制** - 支持配置格式升级和向下兼容
3. **自动清理机制** - 定期清理过期的配置和不常用配置
4. **配置访问跟踪** - 记录配置使用情况，优化存储策略

更多详细信息请参考[表格配置存储服务文档](mdc:src/utils/table-config-store.md)。

### 组件集成

从2024-12-15版本开始，表格工具栏组件使用了独立的`ColumnSettings`组件来提供列设置功能，通过以下方式集成：

1. 表格组件应使用`columnSettingsMixin`混入，该混入提供了列设置相关的基础方法
2. 表格工具栏组件内部使用`ColumnSettings`组件处理列设置UI和交互
3. 通过`column-change`事件将列设置变更通知给表格组件

### 列设置配置和用法

```vue
<template>
  <div>
    <!-- 表格工具栏 -->
    <table-toolbar
      :column-options="allColumns"
      :storage-key="columnSettingsKey" 
      :default-visible-columns="defaultVisibleColumns"
      @column-change="handleColumnChange"
    />
    
    <!-- 表格 -->
    <el-table :data="tableData">
      <template v-for="col in visibleColumnsConfig">
        <el-table-column
          :key="col.prop"
          v-bind="col"
        />
      </template>
    </el-table>
  </div>
</template>

<script>
import columnSettingsMixin from '@/components/TableToolbar/columnSettingsMixin'

export default {
  mixins: [columnSettingsMixin],
  data() {
    return {
      // 设置特定的存储键前缀，区分不同模块
      columnSettingsKeyPrefix: 'your_module_columns'
    }
  },
  mounted() {
    // 可选：迁移旧配置
    this.migrateOldColumnSettings()
  }
}
</script>
```

通过`columnSettingsMixin`，表格组件会自动获得：

1. 存储键的生成和管理
2. 列设置的初始化和加载
3. 列设置变更的处理
4. 列配置的过滤和应用
5. 旧配置迁移工具方法

### 自定义存储键

默认情况下，存储键会基于`columnSettingsKeyPrefix`和组件名自动生成。您可以通过以下方式自定义存储键：

```javascript
export default {
  mixins: [columnSettingsMixin],
  data() {
    return {
      columnSettingsKeyPrefix: 'custom_module'
    }
  },
  computed: {
    // 自定义存储键
    columnSettingsKey() {
      return `${this.columnSettingsKeyPrefix}_${this.someId || 'default'}`
    }
  }
}
```

### 表格配置存储服务

表格工具栏组件和列设置组件现在使用统一的配置存储服务，提供以下好处：

1. **减少存储碎片** - 所有配置集中在一个localStorage键中
2. **自动过期清理** - 长期未使用的配置会被自动清理
3. **智能存储管理** - 当存储空间接近上限时，会优先清理不常用配置
4. **配置版本控制** - 在配置结构变更时能够平滑迁移

配置存储服务可单独使用：

```javascript
import tableConfigStore from '@/utils/table-config-store'

// 获取配置
const columns = tableConfigStore.getColumnConfig('your_key', defaultColumns)

// 保存配置
tableConfigStore.saveColumnConfig('your_key', columns)

// 获取统计信息
const stats = tableConfigStore.getStats()
```

## 最佳实践

1. **使用mixin** - 始终在表格组件中使用`columnSettingsMixin`
2. **合理命名** - 为每个表格设置唯一的`columnSettingsKeyPrefix`
3. **默认列** - 设置合理的`defaultVisibleColumns`，避免初次使用时显示过多或过少列
4. **自定义存储键** - 对于动态表格，根据上下文定制`columnSettingsKey`
5. **迁移旧配置** - 在组件挂载时调用`migrateOldColumnSettings()`，确保用户配置不丢失
6. **及时处理变更** - 监听`column-change`事件，及时更新表格显示

## 注意事项

1. 组件会自动将列设置保存到localStorage中，用户关闭页面后设置仍然保留
2. 对于有多个表格的页面，应通过storageKeySuffix区分不同表格的设置
3. 批量操作需要表格开启selection功能
4. 导入/导出功能需要提供对应的API函数 