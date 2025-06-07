# 列设置组件 (ColumnSettings)

## 简介

列设置组件是一个用于配置表格列显示/隐藏的通用组件，它提供了一个下拉菜单界面，允许用户选择要显示的列，并可以一键全选、应用和重置设置。该组件主要用于增强表格的用户体验，让用户可以根据自己的需求自定义表格显示内容。

## 功能特点

- 支持表格列的显示/隐藏配置
- 提供全选/取消全选功能
- 使用集中式配置存储服务，实现配置的统一管理
- 支持配置版本控制和自动迁移
- 实现过期配置的自动清理
- 提供重置为默认设置的功能
- 完全兼容Element UI风格

## 更新历史

- **2024-12-16**: 集成表格配置存储服务，实现集中式配置管理、版本控制和自动清理
- **2024-12-15**: 初始版本发布

## 安装和使用

### 基本使用示例

```vue
<template>
  <div class="table-container">
    <!-- 列设置组件 -->
    <column-settings
      :column-options="allColumns"
      :storage-key="storageKey"
      :default-visible-columns="defaultVisibleColumns"
      @change="handleColumnChange"
    />
    
    <!-- 表格 -->
    <el-table :data="tableData">
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
import ColumnSettings from '@/components/ColumnSettings'
import tableConfigStore from '@/utils/table-config-store'

export default {
  components: {
    ColumnSettings
  },
  data() {
    return {
      storageKey: 'my_table_columns',
      allColumns: [
        { prop: 'name', label: '名称', width: '120px' },
        { prop: 'code', label: '编码', width: '120px' },
        { prop: 'type', label: '类型', width: '100px' },
        { prop: 'status', label: '状态', width: '80px' },
        { prop: 'createTime', label: '创建时间', width: '150px' }
      ],
      defaultVisibleColumns: ['name', 'code', 'status'],
      visibleColumns: [],
      tableData: []
    }
  },
  created() {
    // 初始化可见列
    this.loadVisibleColumns()
  },
  methods: {
    // 加载可见列
    loadVisibleColumns() {
      // 从表格配置存储服务获取配置
      this.visibleColumns = tableConfigStore.getColumnConfig(
        this.storageKey,
        this.defaultVisibleColumns
      )
      
      // 转换为表格需要的列配置
      this.visibleColumns = this.allColumns.filter(col => 
        this.visibleColumns.includes(col.prop)
      )
    },
    
    // 处理列变更
    handleColumnChange(columns) {
      // 转换为表格需要的列配置
      this.visibleColumns = this.allColumns.filter(col => 
        columns.includes(col.prop)
      )
    }
  }
}
</script>
```

## 组件属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|-------|------|
| columnOptions | Array | 必填 | 列选项数组，每个选项应包含prop和label属性 |
| storageKey | String | 必填 | 配置存储键名 |
| defaultVisibleColumns | Array | [] | 默认可见列（prop数组） |
| visibleColumns | Array | [] | 当前可见列（prop数组） |
| size | String | 'mini' | 按钮大小 |
| type | String | 'default' | 按钮类型 |
| plain | Boolean | false | 是否为朴素按钮 |
| text | String | '列设置' | 按钮文本 |

## 组件事件

| 事件名称 | 说明 | 参数 |
|---------|------|------|
| change | 列设置变更时触发 | columns: Array (可见列prop数组) |

## 集中式配置存储

自2024-12-16版本起，列设置组件使用集中式表格配置存储服务(`TableConfigStore`)来管理所有表格的列配置。这提供了以下好处：

1. **统一管理** - 所有表格配置存储在一个JSON对象中，避免localStorage碎片化
2. **版本控制** - 支持配置格式升级和自动迁移旧配置
3. **智能清理** - 自动清理长期未使用的配置，避免存储空间浪费
4. **访问跟踪** - 记录配置的更新和访问时间，优化存储策略

更多详细信息请参考[表格配置存储服务文档](mdc:src/utils/table-config-store.md)。

## 使用注意事项

1. 组件会使用表格配置存储服务保存设置，用户关闭页面后设置仍然保留
2. 列设置的存储键(storageKey)应该是唯一的，避免不同表格的设置相互覆盖
3. defaultVisibleColumns应该是columnOptions中prop的子集
4. 如果需要完全控制列设置，可以不提供visibleColumns属性，组件会自动从存储服务或defaultVisibleColumns初始化
5. 旧版本使用的localStorage直接存储方式的配置会自动迁移到新的存储服务中

## 与TableToolbar集成

该组件可以作为TableToolbar的一部分使用，通过columnSettingsMixin提供更完整的功能：

```vue
<template>
  <div class="table-toolbar">
    <div class="toolbar-left">
      <!-- 左侧按钮 -->
    </div>
    
    <div class="toolbar-right">
      <!-- 刷新按钮 -->
      <refresh-button @refresh="handleRefresh" />
      
      <!-- 列设置组件 -->
      <column-settings
        :column-options="columnOptions"
        :storage-key="columnSettingsKey"
        :default-visible-columns="defaultVisibleColumns"
        @change="handleColumnChange"
      />
      
      <!-- 其他按钮 -->
    </div>
  </div>
</template>

<script>
import columnSettingsMixin from '@/components/TableToolbar/columnSettingsMixin'

export default {
  mixins: [columnSettingsMixin],
  data() {
    return {
      columnSettingsKeyPrefix: 'your_module_columns'
    }
  },
  mounted() {
    // 可以手动迁移旧配置
    this.migrateOldColumnSettings()
  }
}
</script>
``` 