# 设备管理模块重构说明

本文档描述了对设备管理模块进行的重构，以提高代码复用性和可维护性。

## 重构内容

### 1. 使用ActionButtons组件重构操作列

设备表格中的操作列已重构为使用全局ActionButtons组件，提供了统一的按钮布局和交互方式：

- 实现了`getActionButtons`方法生成按钮配置
- 使用`generateTableButtons`函数生成预设按钮配置
- 实现了`handleActionClick`方法处理按钮点击事件
- 支持编辑、查看和状态切换操作

代码示例：
```vue
<action-buttons
  :buttons="getActionButtons(scope.row)"
  mode="text"
  :row="scope.row"
  @click="handleActionClick"
/>
```

### 2. 使用StatusTag组件重构状态列

状态列已重构为使用全局StatusTag组件，提供了统一的状态显示样式：

- 使用`enabledStatusMap`预设配置状态显示
- 自动根据状态值显示对应的文本和颜色
- 提高了状态展示的一致性

代码示例：
```vue
<status-tag
  :status="scope.row.status"
  :text-map="statusTextMap"
  :type-map="statusTypeMap"
/>
```

### 3. 使用全局SearchForm组件重构搜索表单

搜索表单已重构为使用全局SearchForm组件，提供了统一的表单布局和交互方式：

- 使用配置化的方式生成表单项
- 支持设备类型特定的搜索条件
- 添加了日期范围选择的自定义插槽
- 修复了属性和事件不兼容问题：
  - 将`default-model`改为`value`属性
  - 将`@submit`改为`@search`事件
  - 修改了重置处理逻辑

### 4. 使用DrawerForm组件重构表单抽屉

设备表单抽屉已重构为使用全局DrawerForm组件，提供了更好的代码复用性和一致性：

- 创建了新的`DrawerForm`全局组件，基于`DialogForm`组件的功能
- 使用`el-drawer`替代`el-dialog`，保留了原有的抽屉式布局
- 实现了分段式表单的支持，与原组件布局保持一致
- 支持带单位的数字输入框类型
- 配置化的方式定义表单项，使代码更加清晰和可维护
- 减少了代码重复，组件代码量减少约50%

代码示例：
```vue
<drawer-form
  ref="drawerForm"
  :visible.sync="drawerVisible"
  :title="getDrawerTitle()"
  :mode="type"
  :data="form"
  :rules="rules"
  :form-sections="formSections"
  @submit="handleFormSubmit"
>
  <!-- 表单内容由配置生成 -->
</drawer-form>
```

## 重构优势

1. **代码复用**：通过使用全局组件，减少了重复代码的编写
2. **统一体验**：保持了整个应用的交互和视觉一致性
3. **可维护性**：配置化的组件使代码更加清晰和易于维护
4. **功能增强**：组件提供了更多的功能选项和灵活性
5. **效率提升**：开发新功能时可以更快速地使用已有组件

## 后续优化

1. 可以考虑将其他类似的表单也重构为使用DrawerForm组件
2. 进一步完善DrawerForm组件，增加更多的表单项类型和功能
3. 添加更多的预设配置，简化组件的使用

## 注意事项

1. 在使用全局组件时，需要确保组件属性和事件名称正确匹配
2. 全局组件的样式和布局已经过优化，一般不需要额外的样式调整
3. 使用预设的配置可以减少重复工作，但也可以根据需要自定义配置

## 未来优化

1. 可以考虑将设备类型特定的列配置提取到单独的配置文件中
2. 考虑添加更多的预设操作按钮和状态标签类型
3. 优化表单验证和错误提示功能 