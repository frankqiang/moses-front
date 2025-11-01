# CalendarSearch 组件使用说明

## 📋 概述

**CalendarSearch** 是维护任务日历视图的搜索组件，基于全局 `SearchForm` 组件实现，提供设备和执行人的筛选功能。

## 🎯 功能特性

- ✅ **设备筛选**：按设备ID筛选维护任务
- ✅ **执行人筛选**：按执行人ID筛选维护任务
- ✅ **快速刷新**：一键刷新日历数据
- ✅ **实时搜索**：支持动态筛选和重置
- ✅ **选项动态加载**：设备和人员选项支持动态注入

## 📦 组件依赖

### 全局组件
- `SearchForm`：基础搜索表单组件

### 配置文件
- `constants/calendar-search-config.js`：搜索表单配置

## 🔧 Props

| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| loading | Boolean | 否 | false | 加载状态 |
| equipmentOptions | Array | 否 | [] | 设备选项列表 |
| personnelOptions | Array | 否 | [] | 人员选项列表 |
| value | Object | 否 | {} | 筛选条件（v-model） |

### equipmentOptions 数据格式

与列表视图保持一致的格式：

```javascript
[
  {
    label: 'EQ001 - 退火炉#1',  // 设备编码 - 设备名称
    value: 'uuid'                // 设备ID
  }
]
```

### personnelOptions 数据格式

与列表视图保持一致的格式：

```javascript
[
  {
    label: '张三 (生产部)',  // 姓名 (部门)
    value: 'uuid'            // 用户ID
  }
]
```

## 📤 Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| search | filters: Object | 搜索事件，返回筛选条件 |
| reset | {} | 重置事件 |
| refresh | - | 刷新事件 |
| input | filters: Object | v-model 更新事件 |

## 📝 使用示例

### 基础用法

```vue
<template>
  <div>
    <CalendarSearch
      v-model="filters"
      :loading="loading"
      :equipment-options="equipmentOptions"
      :personnel-options="personnelOptions"
      @search="handleSearch"
      @reset="handleReset"
      @refresh="handleRefresh"
    />
  </div>
</template>

<script>
import CalendarSearch from './components/CalendarSearch'

export default {
  components: {
    CalendarSearch
  },
  data() {
    return {
      filters: {
        equipmentId: '',
        assignedTo: ''
      },
      loading: false,
      equipmentOptions: [],
      personnelOptions: []
    }
  },
  methods: {
    handleSearch(filters) {
      console.log('搜索条件:', filters)
      // 执行搜索逻辑
      this.refreshCalendar()
    },
    handleReset() {
      console.log('重置筛选')
      this.refreshCalendar()
    },
    handleRefresh() {
      console.log('刷新数据')
      this.refreshCalendar()
    },
    refreshCalendar() {
      // 刷新日历数据
    }
  }
}
</script>
```

### 完整实现（参考 calendar.vue）

```vue
<template>
  <div class="task-calendar-container">
    <!-- 搜索区域 -->
    <el-card class="search-card" shadow="never">
      <CalendarSearch
        v-model="filters"
        :loading="loading"
        :equipment-options="equipmentOptions"
        :personnel-options="personnelOptions"
        @search="handleSearch"
        @reset="handleReset"
        @refresh="handleRefresh"
      />
    </el-card>

    <!-- 日历区域 -->
    <el-card class="calendar-card" shadow="never">
      <div class="calendar-wrapper">
        <FullCalendar ref="fullCalendar" :options="calendarOptions" />
      </div>
    </el-card>
  </div>
</template>

<script>
import FullCalendar from '@fullcalendar/vue'
import CalendarSearch from './components/CalendarSearch'
import { getCalendarTasks } from './api'
import { fetchEquipmentList } from '@/views/master-data/equipment-management/api/equipment-management'
import { getMaintenancePersonnel } from './api'

export default {
  name: 'MaintenanceTaskCalendar',
  components: {
    FullCalendar,
    CalendarSearch
  },
  data() {
    return {
      filters: {
        equipmentId: '',
        assignedTo: ''
      },
      equipmentOptions: [],
      personnelOptions: [],
      loading: false,
      calendarOptions: {
        // FullCalendar 配置
        events: this.fetchEvents
      }
    }
  },
  mounted() {
    this.loadEquipmentOptions()
    this.loadPersonnelOptions()
  },
  methods: {
    async fetchEvents(fetchInfo, successCallback, failureCallback) {
      try {
        this.loading = true
        const params = {
          startDate: fetchInfo.startStr,
          endDate: fetchInfo.endStr,
          ...this.filters
        }
        const response = await getCalendarTasks(params)
        successCallback(response.data || [])
      } catch (error) {
        failureCallback(error)
      } finally {
        this.loading = false
      }
    },
    handleSearch(filters) {
      this.filters = { ...filters }
      this.refreshCalendar()
    },
    handleReset() {
      this.filters = {
        equipmentId: '',
        assignedTo: ''
      }
      this.refreshCalendar()
    },
    handleRefresh() {
      this.refreshCalendar()
      this.$message.success('刷新成功')
    },
    refreshCalendar() {
      if (this.$refs.fullCalendar) {
        const calendarApi = this.$refs.fullCalendar.getApi()
        calendarApi.refetchEvents()
      }
    },
    async loadEquipmentOptions() {
      try {
        const response = await fetchEquipmentList({ limit: 1000 })
        this.equipmentOptions = response.data.results || []
      } catch (error) {
        console.error('加载设备列表失败:', error)
      }
    },
    async loadPersonnelOptions() {
      try {
        const response = await getMaintenancePersonnel({ limit: 1000 })
        this.personnelOptions = response.data || []
      } catch (error) {
        console.error('加载人员列表失败:', error)
      }
    }
  }
}
</script>
```

## 🎨 样式定制

组件内置了基础样式，与项目整体风格保持一致：

```scss
.calendar-search {
  margin-bottom: 16px;
}
```

父组件可以通过 `.search-card` 类进行进一步样式定制：

```scss
.search-card {
  margin-bottom: 16px;
  border-radius: 8px;
  border: none;

  ::v-deep .el-card__body {
    padding: 16px 20px;
  }
}
```

## 📊 筛选条件说明

### filters 对象结构

```javascript
{
  equipmentId: 'uuid',  // 设备ID（可选）
  assignedTo: 'uuid'    // 执行人ID（可选）
}
```

### 筛选逻辑

- 所有筛选条件都是可选的
- 空值会被自动过滤（undefined、null、空字符串）
- 支持单独筛选或组合筛选

## 🔍 搜索表单配置

配置文件位于 `constants/calendar-search-config.js`：

```javascript
export const CALENDAR_SEARCH_FORM_CONFIG = [
  {
    prop: 'equipmentId',
    label: '设备',
    component: 'select',
    placeholder: '请选择设备',
    clearable: true,
    filterable: true,
    priority: 'primary',
    options: [],
    props: {
      label: 'name',
      value: 'id'
    }
  },
  {
    prop: 'assignedTo',
    label: '执行人',
    component: 'select',
    placeholder: '请选择执行人',
    clearable: true,
    filterable: true,
    priority: 'primary',
    options: [],
    props: {
      label: 'name',
      value: 'id'
    }
  }
]
```

## 🚀 最佳实践

### 1. 选项数据加载

建议在页面 `mounted` 生命周期中加载选项数据：

```javascript
mounted() {
  this.loadEquipmentOptions()
  this.loadPersonnelOptions()
}
```

### 2. 筛选条件同步

使用 `v-model` 实现双向绑定，确保筛选条件同步：

```vue
<CalendarSearch
  v-model="filters"
  @search="handleSearch"
/>
```

### 3. 加载状态管理

传递 `loading` 状态，提供更好的用户体验：

```vue
<CalendarSearch
  :loading="loading"
/>
```

### 4. 事件处理

合理处理三个关键事件：

```javascript
methods: {
  handleSearch(filters) {
    // 执行搜索
    this.refreshCalendar()
  },
  handleReset() {
    // 重置条件
    this.refreshCalendar()
  },
  handleRefresh() {
    // 刷新数据
    this.refreshCalendar()
    this.$message.success('刷新成功')
  }
}
```

## ⚠️ 注意事项

1. **选项数据格式**：确保 `equipmentOptions` 和 `personnelOptions` 包含正确的 `id` 和 `name` 字段
2. **v-model 使用**：使用 `v-model` 可以自动同步筛选条件
3. **事件监听**：必须监听 `@search`、`@reset`、`@refresh` 事件才能正常工作
4. **空值处理**：组件会自动过滤空值，无需手动处理

## 🔗 相关文档

- [SearchForm 组件文档](../../../components/SearchForm/README.md)
- [日历视图接口文档](../docs/接口文档/单独接口文档/任务日历视图数据接口详细说明_已重构.md)
- [维护任务管理常量](../constants/index.js)

## 📅 更新记录

- 2025-10-31: 初始创建，基于 SearchForm 实现
- 2025-10-31: 添加刷新按钮功能
- 2025-10-31: 优化样式和用户体验


