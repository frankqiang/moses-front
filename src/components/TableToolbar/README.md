# 表格工具栏和列设置组件

## 简介

表格工具栏组件(TableToolbar)和列设置混入(columnSettingsMixin)是一套用于增强Element UI表格功能的通用组件。主要功能包括：

1. 提供刷新按钮，方便用户刷新表格数据
2. 提供列设置功能，允许用户自定义显示哪些列
3. 支持列设置的本地持久化存储
4. 提供左右两侧的插槽，便于添加自定义内容

## 组件结构

* `TableToolbar` - 表格工具栏组件
* `columnSettingsMixin` - 表格列设置混入

## 安装和使用

### 基本使用示例

```vue
<template>
  <div class="table-container">
    <!-- 使用表格工具栏组件 -->
    <table-toolbar
      :enable-column-settings="true"
      :column-options="allColumns"
      :storage-key="columnSettingsKey"
      :default-visible-columns="defaultVisibleColumns"
      @refresh="handleRefresh"
      @column-change="handleColumnChange"
    >
      <template #toolbar-left>
        <!-- 左侧自定义内容，如搜索框 -->
      </template>
      
      <template #toolbar-right>
        <!-- 右侧自定义内容，如导出按钮 -->
      </template>
    </table-toolbar>

    <!-- 表格 -->
    <el-table :data="data">
      <template v-for="col in tableColumns">
        <el-table-column
          :key="col.prop"
          v-bind="col"
        >
          <!-- 表格内容 -->
        </el-table-column>
      </template>
    </el-table>
  </div>
</template>

<script>
import TableToolbar from '@/components/TableToolbar'
import columnSettingsMixin from '@/components/TableToolbar/columnSettingsMixin'

export default {
  components: {
    TableToolbar
  },
  mixins: [columnSettingsMixin],
  // ...其他配置
}
</script>
```

### 表格工具栏组件属性

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| enableColumnSettings | Boolean | true | 是否启用列设置功能 |
| columnOptions | Array | [] | 列设置选项，每个选项应包含prop和label属性 |
| storageKey | String | 'table_visible_columns' | 本地存储键名 |
| defaultVisibleColumns | Array | [] | 默认可见列（prop数组） |

### 表格工具栏组件事件

| 事件名称 | 说明 | 参数 |
| --- | --- | --- |
| refresh | 刷新按钮点击时触发 | - |
| column-change | 列设置变更时触发 | visibleColumns: Array (可见列prop数组) |

### 列设置混入提供的属性和方法

| 名称 | 类型 | 说明 |
| --- | --- | --- |
| allColumns | Array | 所有可用列配置 |
| visibleColumns | Array | 当前可见列prop数组 |
| tableColumns | Array | 当前可见列配置（根据visibleColumns过滤allColumns） |
| defaultVisibleColumns | Array | 默认可见列prop数组 |
| columnSettingsKey | String | 本地存储键名 |
| initColumns(columns) | Method | 初始化列配置 |
| loadColumnSettings() | Method | 加载列设置 |
| resetToDefaultColumns() | Method | 重置为默认列配置 |
| handleColumnChange(columns) | Method | 处理列设置变更 |

## 使用步骤

1. 导入组件和混入
   ```js
   import TableToolbar from '@/components/TableToolbar'
   import columnSettingsMixin from '@/components/TableToolbar/columnSettingsMixin'
   ```

2. 添加到组件中
   ```js
   components: {
     TableToolbar
   },
   mixins: [columnSettingsMixin]
   ```

3. 定义列配置
   ```js
   initSomeColumns() {
     const columns = [
       { prop: 'name', label: '名称' },
       { prop: 'code', label: '编码' }
       // ...其他列
     ]
     this.initColumns(columns)
   }
   ```

4. 处理刷新事件
   ```js
   handleRefresh() {
     // 重新加载数据
     this.loadData()
   }
   ```

## 自定义列设置存储键

如果需要为不同的表格设置不同的存储键，可以在data中覆盖columnSettingsKeyPrefix：

```js
data() {
  return {
    // 重写列设置存储键前缀
    columnSettingsKeyPrefix: 'your_module_columns'
  }
}
```

## 注意事项

1. 列配置中可以包含Element UI表格列支持的所有属性
2. 如果需要在列中使用自定义渲染，可以在列配置中添加slotName属性，然后在TableColumn中使用插槽
3. 列设置会保存在浏览器的localStorage中，用户关闭页面后设置仍然保留 