# 料框/料垛管理模块

## 模块概述

料框/料垛管理模块是退火车间库存管理的核心功能，实现料框从入车间登记、组垛/拆垛到状态变更的全生命周期管理。

**核心业务价值：**
- 料框注册：实现料框入库登记，关联规格、产品、批次等信息
- 料框状态追踪：管理料框从"待入库退火"到"已出库"的14种状态流转
- 料垛管理：支持料框组垛和拆垛操作，批量管理料框
- 状态历史追溯：记录并查询料框的完整状态变更历史

## 目录结构

```
bin-stack-management/
├── api/                       # API接口层
│   ├── index.js              # 统一导出入口
│   ├── bin-management.js     # 料框管理API（待实现）
│   └── stack-management.js   # 料垛管理API（待实现）
├── components/               # 组件层
│   ├── BinSearch.vue        # 料框搜索组件（待实现）
│   ├── BinTable.vue         # 料框表格组件（待实现）
│   ├── BinFormDrawer.vue    # 料框表单抽屉（待实现）
│   ├── StackSearch.vue      # 料垛搜索组件（待实现）
│   ├── StackTable.vue       # 料垛表格组件（待实现）
│   ├── StackDialog.vue      # 组垛对话框（待实现）
│   └── DestackDialog.vue    # 拆垛对话框（待实现）
├── constants/               # 常量配置层
│   ├── index.js            # 统一导出入口（待实现）
│   ├── bin-stack-management.js  # 基础常量（待实现）
│   ├── table-config.js     # 表格配置（待实现）
│   ├── form-config.js      # 表单配置（待实现）
│   ├── api-config.js       # API配置（待实现）
│   └── messages-config.js  # 消息配置（待实现）
├── docs/                    # 文档目录
│   ├── 任务清单/
│   │   └── 料框料垛管理前端开发任务清单.md
│   └── 接口文档/
│       ├── 料框管理接口说明文档.md
│       └── 料垛管理接口说明文档.md
├── utils/                   # 工具函数（可选）
├── index.vue               # 主页面入口
└── README.md               # 本文档
```

## 主要功能模块

### 1. 料框管理 (Bin Management)

**功能列表：**
- 料框注册：新料框入车间登记，关联规格、产品、批次
- 料框列表查询：支持多条件搜索、分页、排序
- 料框详情查看：查看料框完整信息和关联数据
- 料框状态变更：手动或自动触发料框状态流转
- 料框状态历史：查询料框的所有状态变更记录

**料框状态枚举（14种）：**
- PENDING_ANNEALING_STORAGE - 待入库(退火)
- PENDING_ANNEALING - 待退火
- PENDING_PREPARATION - 待备料
- PENDING_FURNACE_LOADING - 待装炉(备料台/料车)
- LOADING - 装炉中
- ANNEALING - 退火中
- PENDING_UNLOADING - 待出炉
- ANNEALED - 已退火
- PENDING_INSPECTION - 待检验
- INSPECTED_PASS - 已检验(合格)
- INSPECTED_FAIL - 已检验(不合格)
- PENDING_OUTBOUND - 待出库(包装)
- OUTBOUND - 已出库
- IDLE - 空闲

**关键接口：**
- POST /v1/inv/bins - 料框注册
- POST /v1/inv/bins/batch - 批量注册料框
- GET /v1/inv/bins - 料框列表查询
- GET /v1/inv/bins/:id - 料框详情查询
- PATCH /v1/inv/bins/:id/status - 更新料框状态
- GET /v1/inv/bins/:id/status-history - 料框状态历史查询

### 2. 料垛管理 (Stack Management)

**功能列表：**
- 料框组垛：将多个料框堆叠成料垛
- 料垛列表查询：支持多条件搜索、分页、排序
- 料垛详情查看：查看料垛基本信息和成员料框
- 料垛拆垛：将料垛解散，料框恢复独立状态
- 料垛成员查询：查看料垛包含的所有料框

**料垛状态枚举（2种）：**
- ACTIVE - 活动中
- DESTACKED - 已拆垛

**组垛规则：**
- 料框规格代码必须相同
- 产品代码必须相同
- 批次号必须相同
- 料框状态必须相同
- 堆叠层数不得超过规格最大堆叠层数

**关键接口：**
- POST /v1/inv/stacks - 组垛
- GET /v1/inv/stacks - 料垛列表查询
- GET /v1/inv/stacks/:id - 料垛详情查询
- POST /v1/inv/stacks/:id/destack - 拆垛
- GET /v1/inv/stacks/:id/bins - 料垛成员料框列表查询

## 技术栈

- **前端框架:** Vue 2.x + Vue CLI
- **UI 组件库:** Element UI
- **状态管理:** Vuex
- **路由管理:** Vue Router
- **HTTP 客户端:** Axios（使用项目统一的request实例）
- **构建工具:** Webpack
- **代码规范:** ESLint + Prettier
- **CSS 预处理器:** Sass/SCSS

## 全局组件使用

本模块严格遵循项目既定的全局组件使用规范：

- **BaseTable** - 表格数据展示（完全替代el-table）
- **TableToolbar** - 表格工具栏（刷新、导出、列设置）
- **SearchForm** - 搜索表单（配置驱动）
- **Drawer** - 抽屉容器（表单、详情）
- **ActionButtons** - 操作按钮组（表格操作列）
- **StatusTag** - 状态标签显示
- **OverflowTagsPopover** - 溢出标签展示

## 开发规范

### 架构模式
参考 `src/views/master-data/aluminum-foil-product-management` 模块的架构：
- 采用配置驱动的开发方式
- constants 统一管理配置和常量
- api 层统一封装接口调用
- components 层职责单一，可复用

### 接口对接
严格按照后端接口文档实现：
- 请求参数格式与接口文档100%一致
- 响应数据处理符合统一响应格式（success、data、error、message、meta）
- 错误处理使用接口文档定义的错误码
- 成功消息和错误消息都使用后端返回内容

### 代码规范
- 遵循ESLint规范（属性顺序、行尾空格、未使用的导入等）
- 所有文件必须包含完整的文件头注释
- 关键函数必须包含JSDoc注释
- 常量和配置必须添加说明注释

## 开发进度

- [x] TASK001: 搭建模块基础架构（P0）
- [ ] TASK002: 配置常量和枚举定义（P0）
- [ ] TASK003: 实现API接口封装（P0）
- [ ] TASK004: 开发料框搜索组件（P0）
- [ ] TASK005: 开发料框表格组件（P0）
- [ ] TASK006: 开发料框表单抽屉组件（P0）
- [ ] TASK007: 开发料框状态变更对话框组件（P1）
- [ ] TASK008: 开发料框状态历史对话框组件（P1）
- [ ] TASK009: 开发料垛搜索组件（P0）
- [ ] TASK010: 开发料垛表格组件（P0）
- [ ] TASK011: 开发组垛对话框组件（P0）
- [ ] TASK012: 开发拆垛确认对话框组件（P0）
- [ ] TASK013: 开发料垛成员料框对话框组件（P1）
- [ ] TASK014: 开发料框/料垛管理主页面（P0）
- [ ] TASK015: 批量注册料框功能（P2 - 可选）

## 相关文档

- [需求文档](../../docs/mes/30-INV-库存管理.md) - 3.2.1 料框/料垛管理
- [前端任务清单](./docs/任务清单/料框料垛管理前端开发任务清单.md)
- [料框管理接口文档](./docs/接口文档/料框管理接口说明文档.md)
- [料垛管理接口文档](./docs/接口文档/料垛管理接口说明文档.md)

## 联系方式

如有问题或建议，请联系前端开发团队。

---

**文档版本:** v1.0.0
**创建日期:** 2025-01-10
**维护团队:** 前端开发团队

