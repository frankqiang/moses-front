# 批量操作工具栏组件 (BatchActionsToolbar)

## 简介

BatchActionsToolbar是一个专用于表格批量操作的全局组件，提供了统一、灵活的批量操作界面。该组件支持常见的批量删除、批量启用/禁用功能，并可通过配置添加自定义操作按钮，满足不同模块的批量处理需求。

## 功能特点

- 自动显示/隐藏：只有当选中行数达到设定阈值时才显示
- 内置批量删除功能
- 内置批量启用/禁用功能，支持下拉菜单或按钮组两种模式
- 支持自定义批量操作按钮和下拉菜单
- 显示已选择行数量
- 操作前自动确认，防止误操作
- 完全兼容Element UI风格

## 使用方法

### 基本使用

```vue
<template>
  <div>
    <!-- 表格部分 -->
    <el-table
      @selection-change="handleSelectionChange"
      :data="tableData"
    >
      <el-table-column type="selection" width="55" />
      <!-- 其他列定义 -->
    </el-table>
    
    <!-- 批量操作工具栏 -->
    <batch-actions-toolbar
      :selected-rows="selectedRows"
      @batch-delete="handleBatchDelete"
      @batch-status="handleBatchStatus"
    />
  </div>
</template>

<script>
import BatchActionsToolbar from '@/components/BatchActionsToolbar'

export default {
  components: {
    BatchActionsToolbar
  },
  data() {
    return {
      tableData: [], // 表格数据
      selectedRows: [] // 选中的行
    }
  },
  methods: {
    // 处理选择变化
    handleSelectionChange(selection) {
      this.selectedRows = selection
    },
    
    // 处理批量删除
    handleBatchDelete(ids, rows) {
      console.log('批量删除ID:', ids)
      // 调用删除API
      deleteAPI(ids).then(/* ... */)
    },
    
    // 处理批量状态变更
    handleBatchStatus({ ids, status }, rows) {
      console.log('批量变更状态:', status, '的ID:', ids)
      // 调用状态变更API
      changeStatusAPI(ids, status).then(/* ... */)
    }
  }
}
</script>
```

### 自定义操作按钮

```vue
<template>
  <batch-actions-toolbar
    :selected-rows="selectedRows"
    :custom-actions="customActions"
    @batch-delete="handleBatchDelete"
    @batch-status="handleBatchStatus"
    @custom-action="handleCustomAction"
    @custom-dropdown="handleCustomDropdown"
  />
</template>

<script>
export default {
  data() {
    return {
      selectedRows: [],
      customActions: [
        {
          label: '批量审核',
          icon: 'el-icon-check',
          type: 'success',
          needConfirm: true,
          confirmText: '确认批量审核选中项吗？',
          name: 'batchApprove' // 用于识别操作类型
        },
        {
          label: '批量导出',
          icon: 'el-icon-download',
          type: 'primary',
          needConfirm: false
        },
        {
          // 下拉菜单形式的批量操作
          label: '更多操作',
          isDropdown: true,
          items: [
            { label: '批量分配仓库', command: 'assign-warehouse' },
            { label: '批量设置负责人', command: 'set-manager' }
          ]
        }
      ]
    }
  },
  methods: {
    // 处理自定义按钮操作
    handleCustomAction({ action, ids, rows }) {
      console.log('执行自定义操作:', action, ids)
      
      if (action === 'batchApprove') {
        // 处理批量审核逻辑
      } else if (action === '批量导出') {
        // 处理批量导出逻辑
      }
    },
    
    // 处理自定义下拉菜单操作
    handleCustomDropdown({ action, command, ids, rows }) {
      console.log('执行下拉菜单操作:', action, command, ids)
      
      if (command === 'assign-warehouse') {
        // 处理批量分配仓库逻辑
      } else if (command === 'set-manager') {
        // 处理批量设置负责人逻辑
      }
    }
  }
}
</script>
```

### 使用按钮组模式的状态按钮

```vue
<template>
  <batch-actions-toolbar
    :selected-rows="selectedRows"
    status-buttons-mode="buttons"
    enable-text="批量上线"
    disable-text="批量下线"
  />
</template>
```

## Props

| 属性名 | 类型 | 默认值 | 说明 |
|-------|------|-------|------|
| selectedRows | Array | [] | 选中的行数据数组 |
| minSelection | Number | 1 | 显示工具栏的最小选中行数 |
| size | String | 'mini' | 按钮大小，同Element UI Button组件 |
| showSelectedCount | Boolean | true | 是否显示选中行计数 |
| showDefaultActions | Boolean | true | 是否显示默认操作按钮（删除和状态变更） |
| hideDeleteButton | Boolean | false | 隐藏删除按钮 |
| hideStatusButtons | Boolean | false | 隐藏状态按钮 |
| deleteText | String | '' | 删除按钮文本，为空时使用默认文本 |
| deleteIcon | String | 'el-icon-delete' | 删除按钮图标 |
| statusText | String | '' | 状态操作文本，为空时使用默认文本 |
| enableText | String | '' | 启用按钮文本，为空时使用默认文本 |
| enableIcon | String | 'el-icon-check' | 启用按钮图标 |
| disableText | String | '' | 禁用按钮文本，为空时使用默认文本 |
| disableIcon | String | 'el-icon-close' | 禁用按钮图标 |
| statusButtonsMode | String | 'dropdown' | 状态按钮模式：'dropdown'(下拉菜单) 或 'buttons'(按钮组) |
| customActions | Array | [] | 自定义操作按钮数组 |
| deleteConfirm | Boolean | true | 删除操作前是否需要确认 |
| deleteConfirmText | String | '确认批量删除选中项吗？此操作不可恢复' | 删除确认提示文本 |
| deleteConfirmTitle | String | '警告' | 删除确认提示标题 |
| statusConfirm | Boolean | true | 状态变更前是否需要确认 |

## 事件

| 事件名 | 说明 | 参数 |
|-------|------|------|
| batch-delete | 批量删除时触发 | (ids, rows): ids-选中行ID数组, rows-选中行数据数组 |
| batch-status | 批量状态变更时触发 | ({ ids, status }, rows): ids-选中行ID数组, status-状态值(0或1), rows-选中行数据数组 |
| delete-cancel | 取消删除操作时触发 | - |
| status-cancel | 取消状态变更操作时触发 | { command, status } |
| custom-action | 自定义操作按钮点击时触发 | { action, ids, rows, ...customParams } |
| custom-dropdown | 自定义下拉菜单项点击时触发 | { action, command, ids, rows, ...itemParams } |
| custom-action-cancel | 取消自定义操作时触发 | action-按钮配置对象 |
| custom-dropdown-cancel | 取消自定义下拉菜单操作时触发 | { action, command, item } |

## 插槽

组件提供默认插槽，用于添加其他自定义操作按钮：

```vue
<batch-actions-toolbar :selected-rows="selectedRows">
  <el-button type="primary" size="mini" icon="el-icon-printer">批量打印</el-button>
</batch-actions-toolbar>
```

## 自定义操作配置

自定义操作按钮通过customActions属性配置，每个操作项支持以下属性：

### 普通按钮配置

| 属性名 | 类型 | 说明 |
|-------|------|------|
| label | String | 按钮文本 |
| name | String | 操作标识符，用于事件识别，可选 |
| icon | String | 按钮图标 |
| type | String | 按钮类型，同Element UI Button的type |
| disabled | Boolean | 是否禁用 |
| needConfirm | Boolean | 是否需要确认 |
| confirmText | String | 确认提示文本 |
| confirmTitle | String | 确认提示标题 |
| confirmType | String | 确认类型(success/warning/info/error) |
| minSelection | Number | 此操作的最小选择数，可选 |
| condition | Function | 自定义启用条件函数，接收选中行数组，返回布尔值 |
| params | Object | 附加参数，会传递给事件回调 |

### 下拉菜单配置

| 属性名 | 类型 | 说明 |
|-------|------|------|
| label | String | 按钮文本 |
| name | String | 操作标识符，可选 |
| isDropdown | Boolean | 必须为true，标识为下拉菜单 |
| type | String | 按钮类型 |
| disabled | Boolean | 是否禁用 |
| minSelection | Number | 此操作的最小选择数，可选 |
| condition | Function | 自定义启用条件函数 |
| items | Array | 菜单项数组，每项包含label, command, disabled, needConfirm等属性 |

## 使用条件函数实现高级操作控制

可以使用condition函数实现更精细的操作控制：

```js
customActions: [
  {
    label: '批量作废',
    type: 'danger',
    // 只有当所有选中项都是'待审核'状态时才启用
    condition: (rows) => rows.every(row => row.status === 'pending')
  },
  {
    label: '批量退回',
    type: 'warning',
    // 只有当选中了至少3项且所有项都不是'已退回'状态时才启用
    condition: (rows) => rows.length >= 3 && !rows.some(row => row.status === 'returned')
  }
]
```

## 集成案例

### 与产品管理页面集成

```vue
<template>
  <div class="app-container">
    <!-- 搜索表单部分 -->
    
    <!-- 批量操作工具栏 -->
    <batch-actions-toolbar
      :selected-rows="selectedRows"
      :custom-actions="[
        {
          label: '批量导出',
          icon: 'el-icon-download',
          type: 'primary'
        },
        {
          label: '批量设置',
          isDropdown: true,
          items: [
            { label: '设置类别', command: 'set-category' },
            { label: '设置品牌', command: 'set-brand' }
          ]
        }
      ]"
      delete-text="批量删除"
      status-text="状态管理"
      enable-text="批量上架"
      disable-text="批量下架"
      @batch-delete="handleBatchDelete"
      @batch-status="handleBatchStatus"
      @custom-action="handleCustomAction"
      @custom-dropdown="handleCustomDropdown"
    />
    
    <!-- 表格部分 -->
  </div>
</template>
```

## 注意事项

1. 组件默认期望selectedRows中的每个对象都有一个id属性，用于构建批量操作的ids数组
2. 自定义操作和下拉菜单操作都支持确认对话框，可以防止误操作
3. statusButtonsMode属性决定了状态操作的显示方式，可以根据需要选择下拉菜单或按钮组
4. 可以通过minSelection属性控制工具栏的显示时机，例如设置为2时，只有选中至少2项时才显示工具栏 