# 维护计划管理模块 - 测试文档

## 📖 目录

- [概述](#概述)
- [快速开始](#快速开始)
- [测试结果](#测试结果)
- [测试文件](#测试文件)
- [文档导航](#文档导航)

## 🎯 概述

本目录包含维护计划管理模块的完整单元测试套件，覆盖API服务、工具函数和配置文件。所有测试均通过，为模块的稳定性和可维护性提供保障。

### 测试统计

```
✅ 测试套件: 7个
✅ 测试用例: 157个
✅ 通过率: 100%
⏱ 执行时间: ~20秒
```

## 🚀 快速开始

### 运行所有测试
```bash
npm run test:unit -- tests/unit/maintenance-plan
```

### 运行特定测试套件
```bash
# API测试
npm run test:unit -- tests/unit/maintenance-plan/api

# 工具函数测试
npm run test:unit -- tests/unit/maintenance-plan/utils

# 配置测试
npm run test:unit -- tests/unit/maintenance-plan/constants
```

### 生成覆盖率报告
```bash
npm run test:unit -- tests/unit/maintenance-plan --coverage --coverageDirectory=coverage/maintenance-plan
```

### 监视模式（开发时推荐）
```bash
npm run test:unit -- tests/unit/maintenance-plan --watch
```

## 📊 测试结果

### 最新测试运行结果

```
Test Suites: 7 passed, 7 total
Tests:       157 passed, 157 total
Snapshots:   0 total
Time:        19.096s
```

### 测试覆盖详情

| 测试套件 | 用例数 | 通过 | 失败 | 状态 |
|---------|--------|------|------|------|
| API服务测试 | 14 | 14 | 0 | ✅ |
| 错误处理工具 | 35 | 35 | 0 | ✅ |
| 格式化工具 | 35 | 35 | 0 | ✅ |
| 消息处理工具 | 35 | 35 | 0 | ✅ |
| 常量配置 | 14 | 14 | 0 | ✅ |
| 表格配置 | 14 | 14 | 0 | ✅ |
| 表单配置 | 38 | 38 | 0 | ✅ |

## 📁 测试文件

### 目录结构

```
tests/unit/maintenance-plan/
├── api/
│   └── maintenance-plan.spec.js          # API服务测试 (14个用例)
├── utils/
│   ├── errorHandler.spec.js              # 错误处理测试 (35个用例)
│   ├── formatter.spec.js                 # 格式化测试 (35个用例)
│   └── messageHandler.spec.js            # 消息处理测试 (35个用例)
├── constants/
│   ├── index.spec.js                     # 常量配置测试 (14个用例)
│   ├── table-config.spec.js              # 表格配置测试 (14个用例)
│   └── form-config.spec.js               # 表单配置测试 (38个用例)
├── COMPONENT_TEST_GUIDE.md               # 组件测试指南
├── TEST_SUMMARY.md                       # 测试总结报告
└── README.md                             # 本文档
```

### 测试文件说明

#### 1. API服务测试 (`api/maintenance-plan.spec.js`)

**覆盖范围**:
- ✅ 查询维护计划列表（带参数/不带参数）
- ✅ 查询单个维护计划详情
- ✅ 创建维护计划
- ✅ 更新维护计划
- ✅ 启用/禁用维护计划
- ✅ 参数验证
- ✅ 错误处理

**关键测试**:
```javascript
// 查询列表测试
getMaintenancePlans() // 无参数
getMaintenancePlans({ equipmentId: 'xxx' }) // 带筛选

// CRUD操作测试
getMaintenancePlanById(id)
createMaintenancePlan(data)
updateMaintenancePlan(id, data)
enableMaintenancePlan(id)
disableMaintenancePlan(id)
```

#### 2. 工具函数测试

##### errorHandler.spec.js (35个用例)
- ✅ 统一错误处理
- ✅ 错误类型识别
- ✅ 错误消息显示控制
- ✅ 自定义错误回调

##### formatter.spec.js (35个用例)
- ✅ 日期时间格式化
- ✅ 周期信息格式化
- ✅ 标准工时格式化
- ✅ 状态/类型标签转换
- ✅ 边界值处理

##### messageHandler.spec.js (35个用例)
- ✅ 成功/错误/警告/信息消息
- ✅ 操作成功消息
- ✅ 操作警告消息
- ✅ 消息选项自定义
- ✅ 环境差异化处理

#### 3. 配置测试

##### index.spec.js (14个用例)
- ✅ 状态标签配置
- ✅ 维护类型标签配置
- ✅ 周期类型标签配置
- ✅ 配置一致性验证

##### table-config.spec.js (14个用例)
- ✅ 列配置结构
- ✅ 固定列配置
- ✅ 排序配置
- ✅ 插槽配置
- ✅ 列宽度合理性

##### form-config.spec.js (38个用例)
- ✅ 搜索表单配置
- ✅ 表单字段配置
- ✅ 验证规则配置
- ✅ 表单模式配置
- ✅ 变更检测配置
- ✅ 提示信息配置

## 📚 文档导航

### 核心文档

1. **[TEST_SUMMARY.md](./TEST_SUMMARY.md)** - 详细的测试总结报告
   - 测试概览和统计
   - 每个测试套件的详细说明
   - 测试覆盖情况
   - 代码质量指标
   - 测试最佳实践

2. **[COMPONENT_TEST_GUIDE.md](./COMPONENT_TEST_GUIDE.md)** - Vue组件测试指南
   - 组件测试框架
   - 测试最佳实践
   - 测试示例代码
   - 学习路径
   - 常见问题解答

### 相关文档

- [源代码README](../../../src/views/master-data/equipment-tpm-management/maintenance-plan/docs/) - 模块功能文档
- [接口文档](../../../src/views/master-data/equipment-tpm-management/maintenance-plan/docs/接口文档/) - API接口规范

## 🎯 测试策略

### 测试金字塔

```
         /\
        /  \     集成测试
       /----\    (未实现)
      /      \
     / 单元测试 \  157个用例 ✅
    /___________\
```

### 当前重点

**已完成** ✅:
- API服务完整测试
- 工具函数完整测试
- 配置文件完整测试
- 测试文档编写

**待实现** 📋:
- Vue组件单元测试（已提供指南）
- 集成测试（建议使用Cypress）
- E2E测试（可选）

## 🔍 测试质量保证

### 测试编写原则

1. **独立性**: 每个测试用例互不影响
2. **可读性**: 清晰的描述和断言
3. **完整性**: 覆盖正常和异常流程
4. **可维护性**: 避免重复，使用辅助函数

### 测试命名规范

- 测试套件: `describe('模块名称测试', ...)`
- 测试用例: `it('应该...', ...)`
- 测试文件: `*.spec.js`

### Mock策略

- ✅ Mock外部依赖（Element UI、axios）
- ✅ 不Mock被测模块内部函数
- ✅ Mock console输出避免污染

## 🛠 开发工作流

### 添加新测试

1. 在相应目录创建测试文件
2. 遵循现有测试结构和命名规范
3. 编写测试用例
4. 运行测试确保通过
5. 提交代码

### 修复失败测试

1. 运行测试查看错误信息
2. 定位问题（源码还是测试）
3. 修复问题
4. 重新运行测试验证
5. 提交修复

### 更新测试

当源代码发生变化时：
1. 运行测试检查是否失败
2. 根据变化更新测试用例
3. 确保测试通过
4. 更新相关文档

## 📈 持续改进

### 定期审查

- 每月审查测试覆盖率
- 识别未测试的代码路径
- 添加缺失的测试用例
- 重构冗余的测试代码

### 性能优化

- 监控测试执行时间
- 优化慢速测试
- 使用mock减少真实依赖
- 并行运行测试

### 文档更新

- 保持文档与代码同步
- 记录测试策略变化
- 更新最佳实践
- 添加新的示例

## 🤝 贡献指南

### 如何贡献测试

1. Fork项目
2. 创建测试分支
3. 编写测试用例
4. 运行所有测试确保通过
5. 提交Pull Request

### 测试审查清单

- [ ] 测试用例清晰易懂
- [ ] 覆盖正常和异常流程
- [ ] 遵循项目测试规范
- [ ] 所有测试通过
- [ ] 更新相关文档

## 📞 支持

### 遇到问题？

1. 查看 [TEST_SUMMARY.md](./TEST_SUMMARY.md) 了解详情
2. 查看 [COMPONENT_TEST_GUIDE.md](./COMPONENT_TEST_GUIDE.md) 获取指导
3. 查看Jest和Vue Test Utils官方文档
4. 联系团队寻求帮助

### 常用资源

- [Jest官方文档](https://jestjs.io/)
- [Vue Test Utils文档](https://vue-test-utils.vuejs.org/)
- [Element UI测试指南](https://element.eleme.io/)

---

## 📝 版本历史

### v1.0.0 (2025-01-20)
- ✅ 完成API服务测试（14个用例）
- ✅ 完成工具函数测试（105个用例）
- ✅ 完成配置测试（38个用例）
- ✅ 编写测试文档
- ✅ 创建组件测试指南

---

**最后更新**: 2025-01-20
**维护团队**: 开发团队
**文档版本**: 1.0.0

