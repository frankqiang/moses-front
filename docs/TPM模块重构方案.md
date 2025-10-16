# TPM模块重构方案

## 📋 问题分析

### 当前状态
- **路由配置**：已经是独立一级菜单 `/equipment-tpm`
- **视图目录**：错误地放在 `src/views/master-data/equipment-tpm-management/`
- **Store目录**：错误地放在 `src/store/modules/mdm/tpm/`
- **模块性质**：TPM（Total Productive Maintenance）是独立的设备全面生产维护管理体系，不属于主数据管理

### 问题影响
1. **架构不合理**：文件组织与业务逻辑不匹配
2. **可维护性差**：容易被误认为是主数据的子模块
3. **路径混乱**：路由路径与文件路径不一致

## 🎯 重构目标

将TPM模块从主数据管理模块中独立出来，建立清晰的模块边界。

### 目标结构
```
src/
├── views/
│   ├── tpm-management/              # TPM管理模块（新位置）
│   │   ├── index.vue               # 模块主页
│   │   ├── maintenance-plan/       # 维护计划管理
│   │   ├── maintenance-task/       # 维护任务管理
│   │   ├── maintenance-record/     # 维护记录管理
│   │   ├── equipment-fault/        # 设备故障管理
│   │   ├── spare-parts/            # 备件管理
│   │   ├── tpm-statistics/         # TPM统计分析
│   │   ├── shared/                 # 共享组件和工具
│   │   ├── mixins/                 # 混入
│   │   ├── api/                    # API接口
│   │   └── docs/                   # 文档
│   └── master-data/
│       └── equipment-management/    # 设备主数据（保留）
└── store/
    └── modules/
        └── tpm/                     # TPM状态管理（新位置）
            └── maintenancePlan.js
```

## 📂 重构步骤

### 第一步：目录迁移

#### 1.1 移动视图文件
```bash
# 从
src/views/master-data/equipment-tpm-management/

# 移动到
src/views/tpm-management/
```

#### 1.2 移动Store文件
```bash
# 从
src/store/modules/mdm/tpm/

# 移动到
src/store/modules/tpm/
```

### 第二步：更新路由配置

**文件位置**：`src/store/modules/permission.js`

需要更新所有组件引用：
```javascript
// 修改前
component: () => import('@/views/master-data/equipment-tpm-management/maintenance-plan/index')

// 修改后
component: () => import('@/views/tpm-management/maintenance-plan/index')
```

涉及的路由组件：
1. `maintenance-plan/index` - 维护计划列表
2. `maintenance-plan/create` - 创建维护计划
3. `maintenance-plan/detail` - 维护计划详情
4. `maintenance-plan/edit` - 编辑维护计划

### 第三步：更新内部引用

#### 3.1 需要更新的文件类型
- [ ] 所有 `*.vue` 文件中的 import 语句
- [ ] 所有 `*.js` 文件中的 import 语句
- [ ] Store 模块注册路径（`src/store/index.js`）
- [ ] 文档中的路径引用

#### 3.2 路径替换规则
```javascript
// 1. 视图组件引用
'@/views/master-data/equipment-tpm-management/' → '@/views/tpm-management/'

// 2. Store引用
'@/store/modules/mdm/tpm/' → '@/store/modules/tpm/'

// 3. API引用（如果有）
'@/views/master-data/equipment-tpm-management/api/' → '@/views/tpm-management/api/'
```

### 第四步：验证清单

- [ ] 路由跳转正常
- [ ] 页面组件加载正常
- [ ] Store状态管理正常
- [ ] API调用正常
- [ ] 菜单导航正常
- [ ] 面包屑导航正常
- [ ] 所有子模块功能正常

## 🔍 影响范围分析

### 需要修改的文件清单

#### 核心配置文件
1. `src/store/modules/permission.js` - 路由配置（4处组件引用）
2. `src/store/index.js` - Store模块注册（可能需要更新）

#### 视图文件（整个目录迁移）
- `src/views/master-data/equipment-tpm-management/**/*`

#### Store文件（整个目录迁移）
- `src/store/modules/mdm/tpm/**/*`

#### 内部引用文件
需要在移动后逐一检查和更新每个文件内部的import语句。

## ⚠️ 注意事项

### 1. Git提交规范
建议分多次提交，便于回滚：
```bash
# 第一次提交：移动文件
git commit -m "refactor(tpm): 移动TPM模块目录结构"

# 第二次提交：更新路由
git commit -m "refactor(tpm): 更新TPM模块路由配置"

# 第三次提交：更新引用
git commit -m "refactor(tpm): 更新TPM模块内部引用"
```

### 2. 避免功能中断
- 在开发分支进行，不直接在主分支操作
- 完成后进行全面功能测试
- 确保所有页面都能正常访问

### 3. 文档同步更新
- 更新README.md中的目录结构说明
- 更新各子模块文档中的路径引用
- 更新任务清单中的文件路径

### 4. 团队沟通
- 通知团队成员目录结构变更
- 更新开发文档和规范
- 协调正在进行的其他开发任务

## 🚀 执行建议

### 推荐方案：使用Git mv命令
```bash
# 1. 移动视图文件（保留Git历史）
git mv src/views/master-data/equipment-tpm-management src/views/tpm-management

# 2. 移动Store文件
git mv src/store/modules/mdm/tpm src/store/modules/tpm

# 3. 提交移动操作
git commit -m "refactor(tpm): 重构TPM模块目录结构，从主数据模块中独立出来"
```

### 批量替换路径
可以使用编辑器的全局查找替换功能：

**查找**：`@/views/master-data/equipment-tpm-management/`
**替换**：`@/views/tpm-management/`

**查找**：`@/store/modules/mdm/tpm/`
**替换**：`@/store/modules/tpm/`

## 📊 重构收益

### 短期收益
1. **清晰的模块边界**：TPM作为独立模块，职责更清晰
2. **统一的路径结构**：路由路径与文件路径保持一致
3. **更好的可维护性**：模块定位准确，便于后续开发

### 长期收益
1. **可扩展性增强**：TPM模块可以独立扩展，不受主数据模块影响
2. **代码组织优化**：为其他模块的重构提供参考
3. **团队协作效率**：新成员更容易理解项目结构

## ✅ 完成标准

- [ ] 所有文件已移动到新位置
- [ ] 所有import路径已更新
- [ ] 路由配置已更新
- [ ] Store注册已更新
- [ ] 所有页面功能正常
- [ ] 无控制台错误
- [ ] 文档已同步更新
- [ ] Git提交历史清晰

---

**预计工作量**：2-4小时
**风险等级**：低（主要是路径更新，不涉及业务逻辑修改）
**建议执行时间**：当前开发任务的间隙或专门安排时间进行

