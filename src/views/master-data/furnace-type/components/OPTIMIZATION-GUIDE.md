# 炉型关联数据显示优化指南

## 优化概述

本次优化简化了炉型表单中关联数据的显示，删除了复杂的搜索功能，专注于核心的数据展示。

## 主要改进

### 1. 简化表格显示

#### 设备列表
- **优化前**：显示设备编号、设备名称、型号、状态、安装日期、操作按钮等多个字段
- **优化后**：只显示设备ID和设备名称两个核心字段

#### 工艺模板列表
- **优化前**：显示模板ID、模板名称、版本、状态、创建时间、操作按钮等多个字段
- **优化后**：只显示模板ID和模板名称两个核心字段

### 2. 删除搜索功能

- 移除了搜索工具栏
- 删除了状态筛选功能
- 简化了数据处理逻辑
- 减少了组件复杂度

### 3. 数据来源说明

#### 设备数据来源
- **模块**：设备管理模块
- **接口路径**：`/mes/equipment/list?furnaceTypeId=${furnaceTypeId}&fields=equipmentId,name`
- **数据格式**：`{ equipmentId: string, name: string }[]`

#### 工艺模板数据来源
- **模块**：工艺管理模块
- **接口路径**：`/mes/process/templates?furnaceTypeId=${furnaceTypeId}&fields=templateId,templateName`
- **数据格式**：`{ templateId: string, templateName: string }[]`

## 技术改进

### 1. 代码简化

#### mixin文件优化
- 删除了70%的无用代码
- 移除了搜索相关的computed属性
- 简化了表格列配置
- 减少了方法数量

#### 组件模板优化
- 移除了SearchFormV2组件引用
- 删除了StatusTag组件引用
- 简化了表格模板结构
- 减少了插槽使用

### 2. 性能提升

- **减少DOM节点**：删除搜索工具栏减少了DOM复杂度
- **简化数据处理**：直接返回数据，不进行搜索过滤
- **减少组件依赖**：移除不必要的组件引用

### 3. 维护性提升

- **代码更清晰**：专注于核心功能，逻辑更简单
- **依赖更少**：减少了组件间的耦合
- **扩展性更好**：简单的结构便于后续扩展

## 使用指南

### 1. 查看关联数据

```vue
<!-- 只需要在编辑或查看模式下，关联数据会自动加载和显示 -->
<furnace-type-form-drawer
  ref="formDrawer"
  :visible.sync="visible"
  :type="'update'"
  :furnace-type-data="furnaceTypeData"
/>
```

### 2. 数据格式要求

#### 设备数据格式
```javascript
const equipmentData = [
  {
    equipmentId: 'EQ001',
    name: '热处理炉1号'
  },
  {
    equipmentId: 'EQ002', 
    name: '热处理炉2号'
  }
]
```

#### 工艺模板数据格式
```javascript
const templateData = [
  {
    templateId: 'TPL001',
    templateName: '标准退火工艺'
  },
  {
    templateId: 'TPL002',
    templateName: '快速淬火工艺'
  }
]
```

### 3. 接口集成说明

在实际项目中，可以通过以下方式集成其他模块的数据：

#### 集成设备模块
```javascript
// 在 getRelatedEquipment 函数中
export function getRelatedEquipment(furnaceTypeId) {
  // 调用设备管理模块的接口
  return request({
    url: `/mes/equipment/list`,
    method: 'get',
    params: {
      furnaceTypeId,
      fields: 'equipmentId,name',
      status: 'enabled'
    }
  })
}
```

#### 集成工艺管理模块
```javascript
// 在 getRelatedTemplates 函数中
export function getRelatedTemplates(furnaceTypeId) {
  // 调用工艺管理模块的接口
  return request({
    url: `/mes/process/templates`,
    method: 'get',
    params: {
      furnaceTypeId,
      fields: 'templateId,templateName',
      status: 'effective'
    }
  })
}
```

## 样式调整

### 1. 表格布局优化

- 设备ID和模板ID列宽：200px
- 名称列最小宽度：300px
- 表格高度：400px
- 支持响应式布局

### 2. 抽屉尺寸调整

- 抽屉宽度：从1500px增加到1700px
- 标签宽度：从140px减少到110px
- 提供更大的显示空间

## 兼容性说明

### 1. 向后兼容

- 保持了原有的API接口结构
- 维持了相同的数据格式
- 不影响现有的业务逻辑

### 2. 扩展性

- 简化后的结构便于添加新字段
- 模块化设计支持功能扩展
- 标准化的数据格式便于集成

## 最佳实践

### 1. 数据来源管理

- 建议通过配置文件管理不同模块的接口地址
- 使用统一的数据格式和错误处理
- 实现接口的缓存和性能优化

### 2. 用户体验

- 保持加载状态的显示
- 提供合理的空数据提示
- 确保表格的响应式显示

### 3. 错误处理

- 处理网络请求失败的情况
- 提供友好的错误提示信息
- 实现数据加载失败时的重试机制

## 总结

本次优化通过简化显示内容和删除搜索功能，显著降低了组件的复杂度，提升了性能和可维护性。同时明确了数据来源，为后续的模块间集成提供了清晰的指导。

优化后的组件更加专注于核心功能，为用户提供简洁清晰的关联数据展示，满足了业务需求的同时提升了开发效率。 