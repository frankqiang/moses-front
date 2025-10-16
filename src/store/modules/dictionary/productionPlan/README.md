# 生产计划字典模块

## 📋 模块说明

本模块管理生产计划管理相关的所有枚举字典数据。

## 📦 包含的字典

| 字典名称 | 字段名 | 说明 |
|---------|--------|------|
| 计划状态 | planStatuses | 生产计划的状态枚举 |
| 子批次状态 | planItemStatuses | 子批次的状态枚举 |
| 计划优先级 | planPriorities | 计划优先级枚举 |
| 计划来源 | planSources | 计划来源枚举 |
| 工艺模板关联类型 | processTemplateLinkTypes | 工艺模板关联类型枚举 |
| 设备关联类型 | equipmentLinkTypes | 设备关联类型枚举 |
| 变更类型 | changeTypes | 变更类型枚举 |
| 操作来源 | operationSources | 操作来源枚举 |

## 🔧 使用方式

### 加载字典

```javascript
// 在页面或组件中
await this.$store.dispatch('dictionary/productionPlan/loadDictionaries')
```

### 获取标签

```javascript
// 获取计划状态标签
const label = this.$store.getters['dictionary/productionPlan/getPlanStatusLabel']('草稿')
```

### 获取选项（用于下拉框）

```javascript
// 获取计划状态选项
const options = this.$store.getters['dictionary/productionPlan/planStatusOptions']
// 返回: [{ value: '草稿', label: '草稿' }, ...]
```

### 检查加载状态

```javascript
const loaded = this.$store.state.dictionary.productionPlan.loaded
```

## 🗂 文件结构

```
productionPlan/
├── index.js           # 模块主文件
└── README.md          # 本文档
```

## 🔄 缓存管理

- **缓存键**：`app_dictionaries_cache`
- **缓存时长**：24 小时
- **清除缓存**：`this.$store.dispatch('dictionary/productionPlan/clearCache')`

## 📡 API 接口

- **接口路径**：`@/views/production-management/production-plan-management/api`
- **方法**：`getAllDictionaries()`

## 🔗 相关模块

- 生产计划管理页面：`src/views/production-management/production-plan-management/`

---

**创建日期：** 2025-10-16

