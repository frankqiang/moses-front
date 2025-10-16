# TPM 字典模块

## 📋 模块说明

本模块管理 TPM（全面生产维护）相关的所有枚举字典数据，包括维护计划、维护任务、设备故障等子模块的字典。

## 📦 包含的字典

| 字典名称 | 字段名 | 说明 |
|---------|--------|------|
| 维护类型 | maintenanceTypes | 维护类型枚举（预防性维护、预测性维护等） |
| 维护周期类型 | cycleTypes | 维护周期类型枚举（按时间、按运行时长、按生产批次） |
| 周期单位 | cycleUnits | 周期单位枚举（天、周、月、年、小时、批次） |
| 维护计划状态 | planStatuses | 维护计划的状态枚举 |
| 维护任务类型 | taskTypes | 维护任务类型枚举 |
| 维护任务状态 | taskStatuses | 维护任务状态枚举 |
| 故障等级 | failureLevels | 设备故障等级枚举 |
| 影响程度 | impactDegrees | 故障影响程度枚举 |
| 故障类型 | failureTypes | 故障类型枚举 |
| 故障处理状态 | failureStatuses | 故障处理状态枚举 |

## 🔧 使用方式

### 使用 Mixin（推荐）

```javascript
import tpmDictionaryMixin from '@/views/tpm-management/mixins/dictionary'

export default {
  mixins: [tpmDictionaryMixin],

  async created() {
    // 加载字典
    await this.loadTPMDictionary()
  },

  computed: {
    // 直接使用 mixin 提供的计算属性
    statusOptions() {
      return this.planStatusOptions
    }
  },

  methods: {
    getStatusText(status) {
      // 直接使用 mixin 提供的方法
      return this.getPlanStatusLabel(status)
    }
  }
}
```

### 直接使用 Store

```javascript
// 加载字典
await this.$store.dispatch('dictionary/tpm/loadDictionaries')

// 获取标签
const label = this.$store.getters['dictionary/tpm/getPlanStatusLabel']('启用')

// 获取选项
const options = this.$store.getters['dictionary/tpm/planStatusOptions']

// 检查加载状态
const loaded = this.$store.state.dictionary.tpm.loaded
```

## 🗂 文件结构

```
tpm/
├── index.js           # 模块主文件
└── README.md          # 本文档
```

## 🔄 缓存管理

- **缓存键**：`tpmDictionaries`
- **缓存时长**：24 小时
- **清除缓存**：`this.$store.dispatch('dictionary/tpm/clearCache')`

## 📡 API 接口

- **接口路径**：`@/views/tpm-management/api/dictionary`
- **方法**：`getAllDictionaries()`

## 🎯 Mixin 提供的功能

TPM 模块提供了专门的 Mixin，封装了所有字典相关的功能：

### Computed 属性

- `maintenanceTypeOptions` - 维护类型选项
- `cycleTypeOptions` - 周期类型选项
- `cycleUnitOptions` - 周期单位选项
- `planStatusOptions` - 计划状态选项
- `taskTypeOptions` - 任务类型选项
- `taskStatusOptions` - 任务状态选项
- 等等...

### Methods 方法

- `getMaintenanceTypeLabel(type)` - 获取维护类型标签
- `getCycleTypeLabel(type)` - 获取周期类型标签
- `getPlanStatusLabel(status)` - 获取计划状态标签
- `loadTPMDictionary()` - 加载 TPM 字典
- `isTPMDictionaryLoaded()` - 检查是否已加载
- 等等...

## 🔗 相关模块

- TPM 管理目录：`src/views/tpm-management/`
- 维护计划管理：`src/views/tpm-management/maintenance-plan/`
- TPM 字典 Mixin：`src/views/tpm-management/mixins/dictionary.js`

## 📚 相关文档

- [字典加载重复调用优化报告](../../../../docs/字典加载重复调用优化报告.md)

---

**创建日期：** 2025-10-16

