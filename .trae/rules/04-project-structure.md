---
description: 
globs: 
alwaysApply: true
---
# 项目结构与组件架构

## 规则类型：Auto Attached
**匹配模式**: `**/README.md`, `**/package.json`, `vue.config.js`
**说明**: 这些是项目基础配置文件，需要自动附加项目结构规则

## 规则说明与适用范围
本规则定义了项目的标准目录结构、文件组织方式和组件架构设计原则。所有开发人员都需遵循此结构规范。

## 项目概述
这是一个基于Vue.js 2.x的管理系统模板，集成了Element UI、axios、权限控制等功能。它为开发管理系统提供了一个完整的框架。

### 核心文件
- [src/main.js](mdc:src/main.js) - 应用的入口文件，初始化Vue实例和全局配置
- [src/App.vue](mdc:src/App.vue) - 根组件
- [src/permission.js](mdc:src/permission.js) - 权限控制逻辑

### 构建和配置
- [vue.config.js](mdc:vue.config.js) - Vue CLI配置文件
- [package.json](mdc:package.json) - 项目依赖和脚本

### 环境配置
- `.env.development` - 开发环境配置
- `.env.staging` - 测试环境配置
- `.env.production` - 生产环境配置

### 测试和构建
- `tests/` - 单元测试和集成测试
- `build/` - 构建相关配置和脚本

### 静态资源
- `public/` - 不需要webpack处理的静态资源
- `src/assets/` - 需要webpack处理的静态资源

## 标准项目结构

本项目推荐采用**模块内聚式架构**，同时保留必要的全局资源管理。这种架构模式强调模块的独立性和内聚性，便于大型项目的开发和维护。

### 全局资源结构

```
src/
├── api/                     # 全局API接口层
│   ├── user.js              # 用户认证相关API
│   └── common.js            # 系统级通用API
├── constants/               # 全局常量
│   ├── app.js               # 应用级常量
│   └── common.js            # 系统级通用常量
├── router/                  # 全局路由配置
│   ├── index.js             # 路由主入口
├── components/              # 全局通用组件
│   ├── SvgIcon/             # SVG图标组件
│   ├── Breadcrumb/          # 面包屑导航组件
│   └── ...                  # 其他全局组件
├── utils/                   # 全局工具函数
│   ├── request.js           # 请求工具
│   ├── formatter.js         # 格式化工具
│   └── validator.js         # 验证工具
├── store/                   # Vuex状态管理
│   ├── index.js             # Store主入口
│   └── modules/             # Store模块
├── layout/                  # 布局组件
│   ├── index.vue            # 主布局容器
│   └── components/          # 布局子组件
└── assets/                  # 全局静态资源
```

### 业务模块结构

每个业务模块应采用**高内聚**的目录结构，包含自身所需的API、常量和组件：

```
src/views/master-data/
├── equipment/               # 设备管理模块
│   ├── index.vue            # 模块主页面
│   ├── api/                 # 模块专用API
│   │   └── index.js         # 设备相关API封装
│   ├── constants/           # 模块专用常量
│   │   └── index.js         # 设备相关常量定义
│   ├── router/              # 模块专用路由（可选）
│   │   └── index.js         # 设备管理子路由
│   ├── components/          # 模块专用组件
│   │   ├── SearchForm.vue   # 搜索表单组件
│   │   ├── DataTable.vue    # 数据表格组件
│   │   └── EditDialog.vue   # 编辑对话框组件
│   ├── mixins/              # 模块专用混入
│   │   └── form-mixin.js    # 表单处理混入
│   ├── utils/               # 模块专用工具函数
│   │   └── formatter.js     # 数据格式化工具
│   └── README.md            # 模块说明文档
├── warehouse/               # 仓库管理模块（类似结构）
└── ...                      # 其他业务模块
```

### Mock数据组织结构

Mock数据采用**全局集中 + 模块化组织**的方式：

```
mock/
├── index.js                 # Mock服务入口，统一注册所有模块
├── utils/                   # Mock工具函数
│   ├── response.js          # 响应处理工具
│   └── generator.js         # 数据生成工具
├── user.js                  # 用户认证Mock
├── table.js                 # 通用表格Mock
└── master-data/             # 主数据Mock（按模块组织）
    ├── equipment.js         # 设备管理Mock
    ├── warehouse.js         # 仓库管理Mock
    ├── furnace-type.js      # 炉型管理Mock
    └── process-management/  # 复杂模块可创建子目录
        ├── index.js         # 模块入口
        └── data/            # 基础数据
```

## 目录命名规范

- 使用小写中划线命名法（kebab-case）命名目录
- 业务模块按功能域划分（如`master-data`, `process-control`, `user-management`等）
- 通用功能放在公共目录（如`common`, `shared`等）

## 功能模块目录结构

### 架构设计原则

#### 模块内聚式

**优势**：模块内聚性强，便于独立开发和维护
**适用场景**：大型项目、多团队协作、微前端架构

```javascript
// 模块API使用方式
import { getEquipmentList } from './api'
// 或者
import * as equipmentApi from './api'
equipmentApi.getEquipmentList()

// 模块常量使用方式
import { EQUIPMENT_STATUS } from './constants'
```

### 全局资源与模块资源的区别

| 资源类型 | 全局资源 | 模块资源 |
|---------|---------|---------|
| API | 用户认证、系统级API | 业务模块专用API |
| 常量 | 系统状态码、全局配置 | 业务模块专用状态和配置 |
| 路由 | 主路由、布局路由 | 模块内部子路由 |
| 组件 | 通用UI组件、布局组件 | 业务模块专用组件 |
| 工具函数 | HTTP请求、格式化等通用工具 | 模块专用业务逻辑工具 |

### 模块复杂度适配

根据模块的复杂度和特点，可以适当调整目录结构：

- **简单模块**：至少包含`index.vue`和`components/`目录
- **中等复杂度模块**：增加`api/`、`constants/`、`mixins/`等目录
- **复杂模块**：使用完整的目录结构，必要时可以增加子模块目录

### 从集中式迁移到模块内聚式的步骤

如果项目之前采用集中式管理，可以按照以下步骤逐步迁移：

```javascript
// 步骤1：在模块内创建API重导出文件
// views/master-data/equipment/api/index.js
export {
  getEquipmentList,
  createEquipment,
  updateEquipment,
  deleteEquipment
} from '@/api/master-data/equipment'

// 步骤2：在组件中使用相对路径
// views/master-data/equipment/index.vue
import * as equipmentApi from './api'
// 替代原来的：import { getEquipmentList } from '@/api/master-data/equipment'

// 步骤3：逐步将API实现迁移到模块内
// 最终目标：完全在模块内定义API，不再依赖全局API
```

**重要提示**：模块内聚式架构的核心优势：
- **开发效率**：相关代码集中在一起，减少跨目录查找
- **代码可维护性**：修改某个模块不影响其他模块
- **团队协作**：不同团队可以独立负责不同模块
- **代码复用**：模块可以作为整体在不同项目间复用
- **测试便利性**：模块可以独立测试

## 组件架构设计

### 组件系统概述
项目组件分为两类：
1. 通用组件 (`src/components`) - 可在多个页面复用的组件
2. 视图组件 (`src/views`) - 特定页面的组件

### 核心设计原则
- **组件化开发**：将大型组件拆分为小型、可复用的组件
- **关注点分离**：组件应专注于单一功能或职责
- **逻辑与UI分离**：使用mixins或Vuex管理逻辑，组件专注于UI渲染
- **命名统一**：组件、文件和目录命名应遵循统一规范
- **配置化**：尽量通过配置而非硬编码实现功能
- **复用性**：充分利用全局组件和预设配置
- **可维护性**：清晰的结构和足够的文档
- **用户体验**：一致的交互模式和视觉样式

### 组件设计模式

#### 容器组件 (index.vue)
- 负责组合子组件、管理状态和数据流转
- 不应包含复杂UI逻辑，主要是组件组合和事件处理
- 包含数据加载和提交的核心方法
- 引入必要的mixins
- 将API调用逻辑抽离到api目录中，容器组件只负责调用API并处理响应

#### 展示组件
- 专注于单一功能或UI区块
- 通过props接收数据，通过events发送用户操作
- 避免直接调用API或修改全局状态
- 保持组件的独立性和可复用性
- 对于表单和表格等复杂组件，进一步拆分为更小的功能组件

### 数据加载模式
组件中的数据加载应遵循以下模式：

```javascript
export default {
  data() {
    return {
      loading: false,
      list: [],
      total: 0,
      listQuery: {
        page: 1,
        limit: 10,
        // 其他查询参数...
      }
    }
  },
  
  created() {
    // 创建防抖函数
    this.debouncedGetList = debounce(this.getList, 300)
    // 初始加载
    this.getList()
  },
  
  methods: {
    async getList() {
      try {
        this.loading = true
        const res = await api.getList(this.listQuery)
        this.list = res.data.items
        this.total = res.data.total
      } catch (error) {
        console.error('获取列表失败', error)
        this.$message.error('获取数据失败: ' + (error.message || '未知错误'))
      } finally {
        this.loading = false
      }
    },
    
    // 搜索处理
    handleSearch() {
      this.listQuery.page = 1
      this.debouncedGetList()
    },
    
    // 分页处理
    handlePageChange(page) {
      this.listQuery.page = page
      this.getList()
    }
  }
}
```

### 组件通信规范

#### Props命名规范
- 使用小驼峰命名法
- 提供默认值和类型验证
- 文档化prop的用途和限制

#### Events命名规范
- 使用kebab-case（短横线）命名法
- 使用动词前缀如：`search`、`update`、`select`、`change`
- 确保事件名称明确表达意图

#### 父子组件通信规范
- 父传子：使用props
- 子传父：使用自定义事件($emit)
- 复杂状态：考虑使用Vuex

## Mixin设计规范

### 通用Mixin设计原则
- 一个mixin应专注于一个功能领域
- 避免在mixin中定义过多的方法和属性
- 使用命名前缀避免命名冲突
- 在mixin中提供适当的注释和文档

### 常用通用Mixin
- **resizeMixin**：处理窗口大小变化
- **i18nMixin**：处理国际化
- **permissionMixin**：处理权限控制
- **themeMixin**：处理主题切换
- **formMixin**：处理表单相关逻辑
- **tableMixin**：处理表格相关逻辑
- **searchMixin**：处理搜索相关逻辑

### Mixin示例
```javascript
// mixins/form-mixin.js
export default {
  data() {
    return {
      loading: false,
      form: {},
      rules: {}
    }
  },
  methods: {
    // 初始化表单数据
    initFormData() {
      this.form = {
        // 默认表单数据
      }
    },
    // 验证表单
    validateForm() {
      return new Promise((resolve, reject) => {
        this.$refs.form.validate(valid => {
          if (valid) {
            resolve(this.form)
          } else {
            this.$message.warning('表单填写有误，请检查')
            reject(new Error('表单验证失败'))
          }
        })
      })
    },
    // 重置表单
    resetForm() {
      this.$refs.form && this.$refs.form.resetFields()
      this.initFormData()
    }
  }
}
```
