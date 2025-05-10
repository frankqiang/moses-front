# 全局组件使用指南

本文档介绍了项目中开发的全局组件的使用方法和示例。这些组件已在`main.js`中全局注册，可以在任何Vue组件中直接使用，无需导入。

## 1. 状态标签 (StatusTag)

`StatusTag`组件用于展示各种状态信息，支持自定义文本、类型和颜色。

### 基本用法

```vue
<StatusTag 
  :status="1" 
  :textMap="{ 0: '禁用', 1: '启用' }" 
  :typeMap="{ 0: 'info', 1: 'success' }"
/>
```

### 属性

| 属性名 | 说明 | 类型 | 默认值 |
|------|------|------|------|
| status | 状态值 | String/Number/Boolean | - |
| textMap | 状态文本映射 | Object | {} |
| typeMap | 状态类型映射 | Object | {} |
| colorMap | 状态颜色映射 | Object | {} |
| effect | 标签效果 | String | 'light' |
| size | 标签大小 | String | 'small' |
| hit | 是否有边框描边 | Boolean | false |
| defaultText | 默认文本 | String | '' |
| defaultType | 默认类型 | String | 'info' |

### 预设配置

项目中提供了多种状态预设配置，可以直接引入使用：

```vue
<template>
  <StatusTag 
    :status="'trial'" 
    :textMap="productLifecycle.textMap" 
    :typeMap="productLifecycle.typeMap" 
  />
</template>

<script>
import { productLifecycleMap } from '@/components/StatusTag/types'

export default {
  data() {
    return {
      productLifecycle: productLifecycleMap
    }
  }
}
</script>
```

## 2. 操作按钮 (ActionButtons)

`ActionButtons`组件用于统一表格操作按钮的布局和样式，支持权限控制和条件显示。

### 基本用法

```vue
<ActionButtons 
  :buttons="buttons" 
  mode="text" 
  @click="handleButtonClick" 
/>
```

### 属性

| 属性名 | 说明 | 类型 | 默认值 |
|------|------|------|------|
| buttons | 按钮配置数组 | Array | [] |
| size | 按钮尺寸 | String | 'mini' |
| mode | 按钮模式 | String | 'normal' |
| row | 行数据(表格中使用) | Object | null |
| maxVisible | 最大可见按钮数 | Number | 3 |

### 按钮配置对象属性

| 属性名 | 说明 | 类型 | 默认值 |
|------|------|------|------|
| text | 按钮文本 | String | - |
| icon | 图标类名 | String | - |
| action | 操作类型 | String | - |
| type | 按钮类型 | String | 取决于mode |
| tooltip | 提示文本 | String | - |
| showText | 是否显示文本 | Boolean | - |
| disabled | 是否禁用 | Boolean | false |
| class | 自定义类名 | String | - |
| permission | 权限标识 | String | - |
| condition | 显示条件函数 | Function | - |
| onClick | 点击回调函数 | Function | - |

### 预设按钮

项目中提供了多种预设按钮配置，可以直接引入使用：

```vue
<template>
  <ActionButtons 
    :buttons="buttons" 
    mode="text" 
    @click="handleButtonClick" 
  />
</template>

<script>
import { CommonButtons, generateTableButtons } from '@/components/ActionButtons/presets'

export default {
  data() {
    return {
      buttons: [
        CommonButtons.VIEW,
        CommonButtons.EDIT,
        CommonButtons.DELETE
      ]
    }
  },
  methods: {
    handleButtonClick({ action, row }) {
      console.log('点击了按钮:', action, row)
    }
  }
}
</script>
```

还可以使用工具函数快速生成按钮配置：

```js
// 生成包含查看、编辑、删除的按钮配置
const buttons = generateTableButtons(['view', 'edit', 'delete'])

// 生成状态切换按钮
const statusButtons = createStatusButtons(row => row.id !== 1)
```

## 3. 高级搜索表单 (SearchForm)

`SearchForm`组件用于统一搜索表单的布局和功能，支持表单项配置、折叠展开、重置等功能。

### 基本用法

```vue
<SearchForm
  :items="searchItems"
  :value="searchForm"
  @search="handleSearch"
  @reset="handleReset"
/>
```

### 属性

| 属性名 | 说明 | 类型 | 默认值 |
|------|------|------|------|
| items | 表单项配置数组 | Array | - |
| value | 表单数据对象 | Object | {} |
| inline | 是否为行内表单 | Boolean | true |
| labelWidth | 标签宽度 | String | '100px' |
| expandable | 是否可展开收起 | Boolean | true |
| visibleItemCount | 始终可见的表单项数量 | Number | 3 |
| loading | 加载状态 | Boolean | false |

### 事件

| 事件名 | 说明 | 回调参数 |
|------|------|------|
| search | 点击查询按钮时触发 | formData: 表单数据对象 |
| reset | 点击重置按钮时触发 | - |
| input | 表单数据变化时触发 | formData: 表单数据对象 |

### 插槽

| 插槽名 | 说明 |
|------|------|
| buttons | 表单按钮区域插槽 |
| [prop] | 自定义表单项插槽，名称为表单项的prop |

## 4. 弹窗表单 (DialogForm)

`DialogForm`组件用于封装弹窗表单的常用功能，支持新增、编辑、查看等操作。

### 基本用法

```vue
<DialogForm
  v-model="dialogVisible"
  :mode="'add'"
  :title="'新增用户'"
  :data="formData"
  :rules="formRules"
  :formItems="formItems"
  @submit="handleFormSubmit"
/>
```

### 属性

| 属性名 | 说明 | 类型 | 默认值 |
|------|------|------|------|
| visible | 弹窗是否可见 | Boolean | false |
| title | 弹窗标题 | String | '' |
| mode | 表单模式(add/edit/view) | String | 'add' |
| data | 表单数据 | Object | {} |
| rules | 表单验证规则 | Object | {} |
| formItems | 表单项配置 | Array | [] |
| width | 弹窗宽度 | String | '500px' |
| labelWidth | 表单标签宽度 | String | '100px' |
| size | 表单尺寸 | String | 'small' |
| confirmButtonText | 确认按钮文本 | String | '确 定' |
| closeOnPressEscape | 是否按Esc关闭 | Boolean | true |
| loading | 加载状态 | Boolean | false |

### 事件

| 事件名 | 说明 | 回调参数 |
|------|------|------|
| submit | 表单提交时触发 | formData: 表单数据对象 |
| cancel | 点击取消按钮时触发 | - |
| open | 弹窗打开时触发 | - |
| close | 弹窗关闭时触发 | - |
| before-close | 弹窗关闭前触发 | - |
| closed | 弹窗关闭动画结束后触发 | - |
| update:visible | 弹窗可见状态变化时触发 | visible: 弹窗是否可见 |

### 插槽

| 插槽名 | 说明 |
|------|------|
| default | 默认插槽，用于自定义表单内容 |
| footer | 底部按钮区域插槽 |
| [prop] | 自定义表单项插槽，名称为表单项的prop |

## 使用建议

1. **推荐在何处使用全局组件：**
   - `StatusTag`: 用于任何需要展示状态的地方，特别是表格中的状态列
   - `ActionButtons`: 用于表格的操作列，统一操作按钮的展示和处理
   - `SearchForm`: 用于列表页面的搜索区域
   - `DialogForm`: 用于新增/编辑/查看详情的弹窗表单

2. **组件组合**：这些组件可以互相组合使用，例如在`DialogForm`中使用`StatusTag`。

3. **自定义样式**：所有组件都支持通过CSS自定义样式，可以通过覆盖相应的类名来实现。

4. **扩展性**：如果组件不满足需求，可以通过插槽或继承的方式进行扩展。 