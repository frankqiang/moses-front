# 表格配置存储服务

## 功能概述

表格配置存储服务(`TableConfigStore`)是一个用于集中管理表格列配置的工具，它提供了以下核心功能：

1. **集中式配置存储** - 将所有表格的列配置存储在一个统一的JSON对象中
2. **配置版本控制** - 支持配置格式版本更新和自动迁移
3. **定期清理机制** - 自动清理长期未使用的配置
4. **存储空间优化** - 当存储空间不足时，自动清理不常用配置

## 实现原理

表格配置存储服务使用localStorage作为持久化存储，但与直接使用localStorage相比，它提供了更多的功能和优势：

1. **单一存储键** - 所有表格配置存储在同一个localStorage键下，减少碎片化
2. **存储结构优化** - 配置以JSON对象形式存储，包含版本、最后清理时间和所有表格配置
3. **自动数据迁移** - 在初始化时自动检测并迁移旧版本的配置
4. **访问时间记录** - 记录每个配置的更新时间和访问时间，用于智能清理
5. **定期清理机制** - 基于配置的访问频率和时间，自动清理不常用配置

## 使用方法

### 基本用法

```javascript
import tableConfigStore from '@/utils/table-config-store'

// 获取表格列配置
const columns = tableConfigStore.getColumnConfig('your_table_key', defaultColumns)

// 保存表格列配置
tableConfigStore.saveColumnConfig('your_table_key', columns)

// 删除表格列配置
tableConfigStore.removeColumnConfig('your_table_key')

// 获取所有配置键
const allKeys = tableConfigStore.getAllKeys()

// 获取配置统计信息
const stats = tableConfigStore.getStats()
```

### 与组件集成

本服务已经与`ColumnSettings`组件和`columnSettingsMixin`集成，使用这些组件时会自动使用表格配置存储服务。

#### 在表格组件中使用

```javascript
import columnSettingsMixin from '@/components/TableToolbar/columnSettingsMixin'

export default {
  name: 'YourTableComponent',
  mixins: [columnSettingsMixin],
  data() {
    return {
      // 设置表格特有的存储键前缀
      columnSettingsKeyPrefix: 'your_module_columns'
    }
  },
  computed: {
    // 可以根据需要自定义存储键
    columnSettingsKey() {
      return `${this.columnSettingsKeyPrefix}_${this.someId}`
    }
  },
  mounted() {
    // 可以迁移旧的配置
    this.migrateOldColumnSettings()
  }
}
```

#### 在工具栏组件中使用

```vue
<template>
  <column-settings
    :column-options="columnOptions"
    :storage-key="columnSettingsKey"
    :default-visible-columns="defaultVisibleColumns"
    @change="handleColumnChange"
  />
</template>

<script>
import ColumnSettings from '@/components/ColumnSettings'

export default {
  components: {
    ColumnSettings
  },
  props: {
    columnOptions: Array,
    columnSettingsKey: String,
    defaultVisibleColumns: Array
  },
  methods: {
    handleColumnChange(columns) {
      this.$emit('column-change', columns)
    }
  }
}
</script>
```

## 配置选项

表格配置存储服务提供了以下默认配置，可以根据需要进行调整：

```javascript
const DEFAULT_CONFIG = {
  // 存储在localStorage中的键名
  STORAGE_KEY: 'vue_admin_table_configs',
  // 配置当前版本
  CURRENT_VERSION: 1,
  // 最大存储数量
  MAX_CONFIGS: 50,
  // 配置过期时间（毫秒），默认30天
  EXPIRY_TIME: 30 * 24 * 60 * 60 * 1000,
  // 清理间隔（毫秒），默认每7天
  CLEANUP_INTERVAL: 7 * 24 * 60 * 60 * 1000
}
```

## 版本控制和迁移

当前实现的版本控制系统支持以下版本：

- **版本1** - 基础版本，支持集中式配置存储、自动清理和定期维护

未来版本升级时，服务会自动检测版本差异并执行相应的迁移逻辑。

## 清理策略

表格配置存储服务使用两种清理策略：

1. **定期清理** - 根据`CLEANUP_INTERVAL`定义的间隔，清理过期的配置
2. **强制清理** - 当存储数量超过`MAX_CONFIGS`或存储空间不足时，会按以下策略清理：
   - 按最后访问时间排序
   - 保留70%的最常用配置
   - 删除剩余30%的不常用配置

## 存储结构

配置在localStorage中的存储结构如下：

```json
{
  "version": 1,
  "lastCleanup": 1639651735463,
  "configs": {
    "table_key_1": {
      "columns": ["col1", "col2", "col3"],
      "updatedAt": 1639651735463,
      "accessedAt": 1639651735463
    },
    "table_key_2": {
      "columns": ["colA", "colB"],
      "updatedAt": 1639651735463,
      "accessedAt": 1639651735463
    }
  }
}
```

## 未来扩展

表格配置存储服务可以在未来扩展以支持更多功能：

1. **同步到服务器** - 将用户配置同步到服务器，实现跨设备共享
2. **更复杂的配置** - 支持更多表格配置项，如排序、筛选条件等
3. **用户配置方案** - 支持用户保存多套配置方案并切换
4. **配置导入/导出** - 允许用户导出配置并在其他环境导入
5. **权限控制** - 基于用户角色的配置管理

## 常见问题解答

### Q: 如何迁移现有的表格配置？

A: 服务会自动检测和迁移旧的配置，但也可以手动调用`migrateOldColumnSettings`方法：

```javascript
// 在表格组件中
this.migrateOldColumnSettings()
```

### Q: 如何处理存储空间不足的问题？

A: 当存储空间不足时，服务会自动执行强制清理，删除不常用的配置。如果仍然不足，会输出错误日志。

### Q: 如何查看当前的配置统计信息？

A: 使用`getStats`方法获取当前配置的统计信息：

```javascript
const stats = tableConfigStore.getStats()
console.log(stats)
// 输出: { total: 10, version: 1, lastCleanup: '2023-12-15T10:00:00.000Z', ... }
``` 