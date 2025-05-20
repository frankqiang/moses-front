# OverflowTagsPopover 溢出标签弹出框组件

## 组件说明
用于在表格单元格中显示多个标签，当标签数量超过设定值时，以弹出框形式显示全部标签。

## 适用场景
- 表格中需要显示多个标签的单元格
- 列表中需要显示有限空间内的多个标签
- 任何需要"更多"展示模式的标签集合

## 基本用法

### 简单字符串数组
```vue
<overflow-tags-popover
  :data="['标签1', '标签2', '标签3', '标签4']"
  :max-show="1"
  title="所有标签"
/>
```

### 对象数组
```vue
<overflow-tags-popover
  :data="products"
  :max-show="1"
  label-key="name"
  title="产品列表"
/>
```

### 在表格中使用
```vue
<template v-slot:default="scope">
  <overflow-tags-popover
    :data="scope.row.tags"
    :max-show="2"
    title="标签列表"
  />
</template>
```

### 自定义弹出框内容
```vue
<overflow-tags-popover
  :data="scope.row.applicableProducts"
  :max-show="1"
  label-key="name"
  title="适用产品范围"
>
  <template #popover-item="{ item, index }">
    <span>{{ index + 1 }}. {{ item.name }} ({{ item.code }})</span>
  </template>
</overflow-tags-popover>
```

## Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| data | 标签数据数组 | Array | [] |
| maxShow | 直接显示的最大标签数量 | Number | 1 |
| labelKey | 对象数组时，用于显示的属性名 | String | null |
| title | 弹出框标题 | String | '' |
| popoverWidth | 弹出框宽度 | Number | 300 |
| placement | 弹出框位置 | String | 'top' |
| trigger | 触发方式 | String | 'click' |
| popoverClass | 弹出框自定义类名 | String | '' |
| size | 标签大小 | String | 'small' |
| type | 标签类型 | String | 'primary' |
| effect | 标签效果 | String | 'light' |
| tagClass | 标签自定义类名 | String | '' |
| emptyText | 无数据时显示的文本 | String | '-' |

## 插槽

| 插槽名 | 说明 | 作用域参数 |
| --- | --- | --- |
| tag | 自定义标签显示 | { item, index } |
| popover-item | 自定义弹出框中的标签项 | { item, index } |
| more-tag | 自定义"更多"标签 | { count } |
| empty | 自定义无数据时的显示 | - |

## 示例

### 气氛类型列表
```vue
<overflow-tags-popover
  :data="scope.row.supported_atmosphere_types"
  :max-show="1"
  title="支持的气氛类型"
/>
```

### 适用产品范围
```vue
<overflow-tags-popover
  :data="scope.row.applicableProducts"
  :max-show="1"
  label-key="name"
  title="适用产品范围"
>
  <template #popover-item="{ item, index }">
    <span>{{ index + 1 }}. {{ item.name }} ({{ item.code }})</span>
  </template>
</overflow-tags-popover>
```

### 自定义标签样式
```vue
<overflow-tags-popover
  :data="scope.row.tags"
  :max-show="2"
  title="标签列表"
  type="success"
  effect="dark"
  tag-class="custom-tag"
/>
```
