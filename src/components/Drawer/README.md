# BaseDrawer 抽屉组件

## 组件概述

BaseDrawer 是一个纯粹的抽屉容器组件，专注于抽屉的显示和交互，不耦合任何表单逻辑。此组件基于 Element UI 的 Drawer 组件进行封装，增强了插槽能力和交互事件。

## 主要特点

1. **专注容器功能**：组件专注于提供抽屉容器功能，不包含任何业务逻辑
2. **增强插槽能力**：提供标题、内容和底部按钮插槽，方便自定义
3. **丰富的事件**：提供完整的生命周期事件，方便控制抽屉行为
4. **双向绑定**：支持 visible.sync 实现抽屉显示状态的双向绑定

## 基本用法

```vue
<template>
  <div>
    <el-button @click="drawerVisible = true">打开抽屉</el-button>
    
    <base-drawer
      :visible.sync="drawerVisible"
      title="抽屉标题"
      width="500px"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    >
      <div>抽屉内容</div>
    </base-drawer>
  </div>
</template>

<script>
import BaseDrawer from '@/components/Drawer/index.vue'

export default {
  components: {
    BaseDrawer
  },
  data() {
    return {
      drawerVisible: false
    }
  },
  methods: {
    handleConfirm() {
      // 确认按钮点击处理
      this.$message.success('确认')
      this.drawerVisible = false
    },
    handleCancel() {
      // 取消按钮点击处理
      this.$message.info('取消')
      this.drawerVisible = false
    }
  }
}
</script>
```

## 属性

| 属性名          | 类型    | 默认值   | 说明                                   |
|----------------|---------|---------|---------------------------------------|
| visible        | Boolean | false   | 抽屉是否可见（支持.sync修饰符）           |
| title          | String  | '抽屉'   | 抽屉标题                               |
| width          | String  | '550px' | 抽屉宽度                               |
| direction      | String  | 'rtl'   | 抽屉方向，可选值：ltr/rtl/ttb/btt       |
| customClass    | String  | 'base-drawer' | 自定义类名                       |
| wrapperClosable| Boolean | false   | 是否点击遮罩关闭抽屉                     |
| showFooter     | Boolean | true    | 是否显示底部区域                        |
| confirmButtonText| String | '确 定' | 确认按钮文本                           |
| cancelButtonText | String | '取 消' | 取消按钮文本                           |
| loading        | Boolean | false   | 加载状态（影响确认按钮）                 |

## 事件

| 事件名        | 参数    | 说明                      |
|--------------|---------|--------------------------|
| update:visible| 新的visible值 | 抽屉显示状态变化时触发 |
| confirm      | 无      | 点击确认按钮时触发         |
| cancel       | 无      | 点击取消按钮时触发         |
| before-close | 无      | 抽屉关闭前触发             |
| close        | 无      | 抽屉关闭时触发             |
| open         | 无      | 抽屉打开时触发             |
| closed       | 无      | 抽屉关闭动画结束后触发      |

## 插槽

| 插槽名   | 说明                     | 作用域变量           |
|---------|--------------------------|---------------------|
| default | 抽屉内容区域              | visible: 抽屉显示状态 |
| title   | 自定义标题区域            | 无                  |
| footer  | 自定义底部按钮区域         | 无                  |

## 方法

| 方法名   | 参数   | 说明         |
|---------|-------|--------------|
| close   | 无    | 关闭抽屉      |

## 示例

### 自定义标题

```vue
<base-drawer :visible.sync="visible">
  <template #title>
    <div class="custom-title">
      <i class="el-icon-star-on"></i>
      <span>自定义标题</span>
    </div>
  </template>
  
  <div>抽屉内容</div>
</base-drawer>
```

### 自定义底部按钮

```vue
<base-drawer :visible.sync="visible">
  <div>抽屉内容</div>
  
  <template #footer>
    <el-button size="mini" @click="visible = false">取消</el-button>
    <el-button size="mini" type="danger" @click="handleDelete">删除</el-button>
    <el-button size="mini" type="primary" @click="handleSave">保存</el-button>
  </template>
</base-drawer>
```

### 不显示底部区域

```vue
<base-drawer :visible.sync="visible" :show-footer="false">
  <div>抽屉内容（无底部按钮）</div>
</base-drawer>
```

## 与其他组件组合使用

BaseDrawer 组件可以与其他组件自由组合使用，特别是与 EnhancedForm 组件组合可以实现抽屉表单功能。具体示例请参考 `src/components/Drawer/example.vue`。 