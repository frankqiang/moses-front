# 工艺模板字典模块

## 📋 模块说明

本模块管理工艺参数管理（工艺模板）相关的所有枚举字典数据。

## 📦 包含的字典

| 字典名称 | 字段名 | 说明 |
|---------|--------|------|
| 工艺模板状态 | templateStatuses | 工艺模板的状态枚举 |
| 工艺模板版本状态 | templateVersionStatuses | 工艺模板版本的状态枚举 |
| 保护气氛类型 | atmosphereTypes | 保护气氛类型枚举 |
| 循环风机速度 | circulationFanSpeeds | 循环风机速度枚举 |
| 控温方式 | controlModes | 控温方式枚举 |

## 🔧 使用方式

### 加载字典

```javascript
// 在页面或组件中
await this.$store.dispatch('dictionary/processTemplate/loadDictionaries')
```

### 获取标签

```javascript
// 获取工艺模板状态标签
const label = this.$store.getters['dictionary/processTemplate/getTemplateStatusLabel']('草稿')
```

### 获取选项（用于下拉框）

```javascript
// 获取工艺模板状态选项
const options = this.$store.getters['dictionary/processTemplate/templateStatusOptions']
// 返回: [{ value: '草稿', label: '草稿' }, ...]
```

### 检查加载状态

```javascript
const loaded = this.$store.state.dictionary.processTemplate.loaded
```

## 🗂 文件结构

```
processTemplate/
├── index.js           # 模块主文件
└── README.md          # 本文档
```

## 🔄 缓存管理

- **缓存键**：`processTemplateDictionaries`
- **缓存时长**：24 小时
- **清除缓存**：`this.$store.dispatch('dictionary/processTemplate/clearCache')`

## 📡 API 接口

- **接口路径**：`@/views/master-data/process-parameter-management/api`
- **方法**：`getAllDictionaries()`

## 🔗 相关模块

- 工艺参数管理页面：`src/views/master-data/process-parameter-management/`

---

**创建日期：** 2025-10-16

