# 检验项目管理常量重构指南

## 重构概述

本次重构将原来的单文件集中式常量组织方式（`inspection-item.js`）重构为多文件分离式设计，提高代码的可维护性和团队协作效率。

## 重构前后对比

### 重构前（单文件集中式）
```
constants/
├── index.js
└── inspection-item.js  (299行，包含所有常量)
```

### 重构后（多文件分离式）
```
constants/
├── index.js           // 统一导出入口
├── business.js        // 业务常量（状态、类型、枚举值）
├── table-config.js    // 表格配置
├── form-config.js     // 表单配置
└── inspection-item.js.backup  // 原文件备份
```

## 文件职责说明

### 1. business.js - 业务常量
- 检验类别（INSPECTION_CATEGORIES）
- 数据类型（DATA_TYPES）
- 检验项目状态（INSPECTION_ITEM_STATUS）
- 适用产品类型（APPLICABLE_PRODUCTS）
- 检验方法（INSPECTION_METHODS）
- 状态配置（STATUS_CONFIG）
- 各种选项数组

### 2. table-config.js - 表格配置
- 表格列配置（TABLE_COLUMNS）
- 默认可见列（DEFAULT_VISIBLE_COLUMNS）

### 3. form-config.js - 表单配置
- 搜索表单配置（SEARCH_FORM_CONFIG）
- 依赖 business.js 中的选项数据

### 4. index.js - 统一导出
- 提供便捷的导入接口
- 保持向后兼容性

## 重构优势

### 1. 职责清晰
- 每个文件专注于特定领域
- 符合单一职责原则
- 便于理解和维护

### 2. 易于维护
- 修改影响范围小
- 减少代码冲突
- 便于并行开发

### 3. 可扩展性强
- 新增功能时只需添加对应配置文件
- 配置文件可被其他模块复用
- 支持渐进式扩展

### 4. 团队协作友好
- 不同开发者可以并行修改不同文件
- 减少合并冲突
- 提高开发效率

## 使用方式

### 导入所有常量（推荐）
```javascript
import {
  TABLE_COLUMNS,
  DEFAULT_VISIBLE_COLUMNS,
  STATUS_CONFIG,
  SEARCH_FORM_CONFIG
} from '../constants'
```

### 按需导入
```javascript
// 只导入业务常量
import {
  INSPECTION_ITEM_STATUS,
  STATUS_CONFIG
} from '../constants/business'

// 只导入表格配置
import {
  TABLE_COLUMNS,
  DEFAULT_VISIBLE_COLUMNS
} from '../constants/table-config'
```

## 最佳实践建议

### 1. 文件大小控制
- 单个文件建议不超过150行
- 超过时考虑进一步拆分

### 2. 命名规范
- 文件名应清晰表达其职责
- 使用 kebab-case 命名
- 避免过于抽象的命名

### 3. 依赖管理
- form-config.js 依赖 business.js
- 通过 index.js 统一导出
- 避免循环依赖

### 4. 向后兼容
- 保持原有导入方式不变
- 通过 index.js 提供统一接口
- 渐进式迁移

## 迁移指南

对于其他模块的类似重构，建议按以下步骤进行：

1. **分析现有常量**：按职责分类
2. **创建新文件**：business.js、table-config.js、form-config.js
3. **迁移常量**：将相关常量移动到对应文件
4. **更新 index.js**：修改导出配置
5. **备份原文件**：重命名为 .backup
6. **测试验证**：确保功能正常

## 注意事项

1. **保持向后兼容**：确保现有导入方式仍然有效
2. **测试充分**：重构后需要全面测试
3. **文档更新**：及时更新相关文档
4. **团队沟通**：确保团队成员了解新的组织方式

## 总结

本次重构遵循了现代前端开发的最佳实践，提高了代码的组织性和可维护性。这种分离式设计模式已在 operations 模块中得到验证，是推荐的标准做法。