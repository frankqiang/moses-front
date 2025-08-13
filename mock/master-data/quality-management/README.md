# 质量管理模块 Mock API 目录结构

## 目录组织原则

本模块采用优化的分层目录结构，将数据文件放置在各个子模块内部，提高了模块的内聚性和可维护性。

## 目录结构

```
quality-management/
├── index.js                           # 模块统一入口，导出所有子模块路由
├── README.md                          # 模块说明文档
└── inspection-item-management/        # 检验项目管理子模块
    ├── index.js                       # 子模块API处理函数和路由配置
    └── data/                          # 子模块数据目录
        └── inspection-items.js        # 检验项目基础数据和生成函数
```

## 设计优势

### 1. 模块化设计
- 每个业务功能独立成子模块
- 数据和逻辑封装在模块内部
- 便于团队协作开发

### 2. 数据就近原则
- 数据文件放置在使用它的模块内部
- 避免跨模块数据依赖
- 提高模块的独立性

### 3. 统一入口管理
- 通过 `index.js` 统一导出所有路由
- 便于主入口文件引用
- 支持模块的动态加载

### 4. 扩展性良好
- 新增子模块只需在对应目录创建文件
- 在主 `index.js` 中添加引用即可
- 不影响现有模块

## 文件说明

### quality-management/index.js
模块的统一入口文件，负责：
- 导入所有子模块的路由配置
- 统一导出给主 Mock 入口文件
- 支持未来子模块的扩展

### inspection-item-management/index.js
检验项目管理的API处理文件，包含：
- 完整的CRUD操作处理函数
- 数据过滤和分页逻辑
- 业务规则验证
- 路由配置定义

### inspection-item-management/data/inspection-items.js
检验项目的数据文件，提供：
- 基础数据定义
- 数据生成函数
- 枚举值和映射关系
- 可配置的数据结构

## 未来扩展

可以按照相同的模式添加更多子模块：

```
quality-management/
├── index.js
├── inspection-item-management/
├── inspection-plan-management/        # 检验计划管理
│   ├── index.js
│   └── data/
│       └── inspection-plans.js
├── quality-report-management/         # 质量报告管理
│   ├── index.js
│   └── data/
│       └── quality-reports.js
└── non-conformity-management/         # 不合格品管理
    ├── index.js
    └── data/
        └── non-conformities.js
```

## 使用方式

在主 Mock 入口文件中引用：

```javascript
const qualityManagement = require('./master-data/quality-management')

const mocks = [
  // 其他模块...
  ...qualityManagement
]
```

这种设计既保持了模块的独立性，又提供了统一的管理入口，是Mock API组织的最佳实践。