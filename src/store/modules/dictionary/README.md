# 字典模块目录

## 📋 目录说明

本目录包含所有业务模块的字典 Store，每个子目录对应一个独立的字典模块。

## 🗂 目录结构

```
dictionary/
├── README.md                  # 本文档
├── productionPlan/           # 生产计划字典模块
│   ├── index.js
│   └── README.md
├── processTemplate/          # 工艺模板字典模块
│   ├── index.js
│   └── README.md
├── tpm/                      # TPM字典模块
│   ├── index.js
│   └── README.md
└── ...                       # 未来的其他模块
```

## 📦 现有模块

| 模块目录 | 模块名称 | 说明 | 文档 |
|---------|---------|------|------|
| `productionPlan/` | 生产计划字典 | 生产计划管理相关字典 | [README](./productionPlan/README.md) |
| `processTemplate/` | 工艺模板字典 | 工艺参数管理相关字典 | [README](./processTemplate/README.md) |
| `tpm/` | TPM字典 | TPM维护管理相关字典 | [README](./tpm/README.md) |

## 🎯 模块规范

每个字典模块必须遵循以下规范：

### 1. 文件结构

```
moduleName/
├── index.js           # 必需：模块主文件（Vuex module）
└── README.md          # 必需：模块文档
```

### 2. index.js 结构

```javascript
import { getAllDictionaries } from '@/path/to/api'

const CACHE_KEY = 'moduleNameDictionaries'
const CACHE_VALIDITY_HOURS = 24

const state = {
  // 字典数据字段
  dict1: {},
  dict2: {},
  // ...

  // 加载状态（必需）
  loaded: false,
  loading: false
}

const mutations = {
  SET_DICTIONARIES(state, dictionaries) {
    // 更新字典数据
  },
  SET_LOADED(state, loaded) {
    state.loaded = loaded
  },
  SET_LOADING(state, loading) {
    state.loading = loading
  }
}

const actions = {
  async loadDictionaries({ commit, state }, forceRefresh = false) {
    // 加载逻辑（包含缓存、并发保护）
  },
  clearCache({ commit }) {
    // 清除缓存
  }
}

const getters = {
  // 各种 getter 方法
}

export default {
  namespaced: true,  // 必须启用命名空间
  state,
  mutations,
  actions,
  getters
}
```

### 3. README.md 必需内容

- 模块说明
- 包含的字典列表
- 使用方式示例
- 缓存配置
- API 接口信息
- 相关模块链接

## 🚀 添加新模块

### 步骤1：创建模块目录

```bash
mkdir -p src/store/modules/dictionary/yourModule
```

### 步骤2：创建 index.js

复制现有模块的 `index.js` 作为模板，修改：
- 导入路径
- CACHE_KEY
- state 字段
- mutations/actions/getters

### 步骤3：创建 README.md

参考现有模块的 README 格式。

### 步骤4：注册到主模块

编辑 `src/store/modules/dictionary.js`：

```javascript
import yourModule from './dictionary/yourModule'

export default {
  namespaced: true,
  modules: {
    productionPlan,
    processTemplate,
    tpm,
    yourModule  // 添加这里
  }
}
```

### 步骤5：测试

```javascript
// 测试加载
await this.$store.dispatch('dictionary/yourModule/loadDictionaries')

// 测试获取
const data = this.$store.state.dictionary.yourModule
console.log('Loaded:', data.loaded)
```

## 🎨 命名规范

### 模块目录命名

- 使用 **camelCase**（小驼峰）
- 清晰描述业务领域
- 例如：`productionPlan`, `processTemplate`, `tpm`

### 缓存键命名

- 格式：`模块名 + Dictionaries`
- 例如：`tpmDictionaries`, `productionPlanDictionaries`

### State 字段命名

- 字典数据：复数形式，如 `planStatuses`, `maintenanceTypes`
- 状态标志：`loaded`, `loading`

## 📚 相关文档

- [字典系统模块化重构完成报告](../../../docs/字典系统模块化重构完成报告.md)
- [字典加载重复调用优化报告](../../../docs/字典加载重复调用优化报告.md)
- [枚举字典系统使用指南](../../../docs/枚举字典系统使用指南.md)

## 💡 最佳实践

1. **独立性**：每个模块完全独立，包含自己的 state、actions、getters
2. **一致性**：所有模块遵循相同的结构和命名规范
3. **文档化**：每个模块都有完整的 README 文档
4. **可扩展**：添加新模块不需要修改现有模块代码
5. **性能优化**：内置缓存机制和并发保护

---

**创建日期：** 2025-10-16
**最后更新：** 2025-10-16

