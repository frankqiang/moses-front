# TPM模块字典集成说明

## 📋 概述

TPM模块（设备TPM管理）已完成枚举字典系统的集成，实现了从硬编码枚举值到动态字典数据的迁移。

**创建日期**: 2025-10-15
**参照实现**: 工艺参数管理模块字典系统
**适用范围**: 整个TPM模块（维护计划、维护任务、维护记录、设备故障等所有子模块）

---

## ✅ 集成完成内容

### 1. 字典API (`equipment-tpm-management/api/dictionary.js`)

创建了**TPM模块级别**的字典API，所有TPM子模块共用：

- `getAllDictionaries()` - 获取所有TPM模块枚举字典
- `getDictionaryByType(type)` - 获取特定类型的枚举字典

**文件位置**: `src/views/master-data/equipment-tpm-management/api/dictionary.js`
**接口文档**: [TPM模块枚举字典接口文档](../../docs/接口文档/TPM模块枚举字典接口文档.md)

### 2. 字典Mixin (`equipment-tpm-management/mixins/dictionary.js`)

创建了**TPM模块级别**的字典Mixin，所有TPM子模块共用，继承自 `@/mixins/dictionaryBase`，提供：

**文件位置**: `src/views/master-data/equipment-tpm-management/mixins/dictionary.js`

#### 计算属性（Computed）

**维护类型相关：**
- `maintenanceTypeOptions` - 维护类型下拉选项
- `maintenanceTypeLabels` - 维护类型标签映射

**维护周期类型相关：**
- `cycleTypeOptions` - 周期类型下拉选项
- `cycleTypeLabels` - 周期类型标签映射

**周期单位相关：**
- `cycleUnitOptions` - 所有周期单位选项
- `timeBasedCycleUnitOptions` - 按时间周期单位（天/周/月/年）
- `runtimeBasedCycleUnitOptions` - 按运行时长周期单位（小时）
- `batchBasedCycleUnitOptions` - 按生产批次周期单位（批次）

**维护计划状态相关：**
- `planStatusOptions` - 计划状态下拉选项
- `planStatusLabels` - 计划状态标签映射

**维护任务相关：**
- `taskTypeOptions` - 任务类型下拉选项
- `taskTypeLabels` - 任务类型标签映射
- `taskStatusOptions` - 任务状态下拉选项
- `taskStatusLabels` - 任务状态标签映射

**故障管理相关：**
- `failureLevelOptions` - 故障等级下拉选项
- `failureLevelLabels` - 故障等级标签映射
- `impactDegreeOptions` - 影响程度下拉选项
- `failureTypeOptions` - 故障类型下拉选项
- `failureStatusOptions` - 故障处理状态下拉选项
- `failureStatusLabels` - 故障处理状态标签映射

#### 方法（Methods）

**标签获取方法：**
- `getMaintenanceTypeLabel(type)` - 获取维护类型标签
- `getCycleTypeLabel(type)` - 获取周期类型标签
- `getCycleUnitLabel(unit)` - 获取周期单位标签
- `getCycleUnitOptionsByCycleType(cycleType)` - 根据周期类型获取对应单位选项
- `getPlanStatusLabel(status)` - 获取计划状态标签
- `getTaskTypeLabel(type)` - 获取任务类型标签
- `getTaskStatusLabel(status)` - 获取任务状态标签
- `getFailureLevelLabel(level)` - 获取故障等级标签
- `getImpactDegreeLabel(degree)` - 获取影响程度标签
- `getFailureTypeLabel(type)` - 获取故障类型标签
- `getFailureStatusLabel(status)` - 获取故障处理状态标签

**字典管理方法：**
- `loadTPMDictionary()` - 加载TPM模块字典
- `isTPMDictionaryLoaded()` - 检查字典是否已加载

### 3. 组件集成

已完成以下组件的字典集成：

#### ✅ MaintenancePlanFormDrawer.vue
- 使用 `maintenanceTypeOptions` 替代硬编码的 `MAINTENANCE_TYPES`
- 使用 `cycleTypeOptions` 替代硬编码的 `CYCLE_TYPES`
- 使用 `planStatusOptions` 替代硬编码的 `PLAN_STATUS`
- 使用 `getCycleUnitOptionsByCycleType()` 实现周期单位联动

#### ✅ MaintenancePlanSearch.vue
- 使用 `maintenanceTypeOptions` 提供维护类型筛选
- 使用 `cycleTypeOptions` 提供周期类型筛选
- 使用 `planStatusOptions` 提供计划状态筛选

#### ✅ index.vue（主页面）
- 集成字典mixin
- 在 `created` 钩子中调用 `loadTPMDictionary()` 加载字典

#### ℹ️ MaintenancePlanTable.vue
- 保留使用 `constants` 中的 Tag 配置（`MAINTENANCE_TYPE_TAG_CONFIG`、`CYCLE_TYPE_TAG_CONFIG`、`STATUS_TAG_CONFIG`）
- 这些配置用于UI展示，不需要从字典获取

---

## 🔄 数据流程

```
应用启动
  ↓
主页面 created() 钩子
  ↓
调用 loadTPMDictionary()
  ↓
调用 API: getAllDictionaries()
  ↓
后端返回所有字典数据
  ↓
存储到 Vuex Store (dictionary/modules/tpm)
  ↓
缓存到 localStorage (tpmDictionaries)
  ↓
组件通过 computed 属性获取选项
```

---

## 📝 使用示例

### 在组件中使用

```vue
<template>
  <div>
    <!-- 使用维护类型下拉选项 -->
    <el-select v-model="form.maintenanceType">
      <el-option
        v-for="item in maintenanceTypeOptions"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-select>

    <!-- 使用周期单位联动 -->
    <el-select v-model="form.cycleUnit">
      <el-option
        v-for="item in getCycleUnitOptionsByCycleType(form.cycleType)"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-select>

    <!-- 显示标签 -->
    <span>{{ getMaintenanceTypeLabel(row.maintenanceType) }}</span>
  </div>
</template>

<script>
// 导入TPM模块级别的字典mixin
import tpmDictionaryMixin from '@/views/master-data/equipment-tpm-management/mixins/dictionary'

export default {
  mixins: [tpmDictionaryMixin],

  async created() {
    // 加载字典
    await this.loadTPMDictionary()
  }
}
</script>
```

---

## 🎯 优势

### 1. **动态更新**
- 字典值可通过后端配置动态更新
- 无需修改前端代码即可调整枚举值

### 2. **统一管理**
- 所有枚举值统一在后端管理
- 前端通过统一接口获取，确保一致性

### 3. **缓存优化**
- 字典数据缓存到 localStorage
- 减少重复请求，提升性能

### 4. **国际化支持**
- 字典系统支持多语言扩展
- 便于后续国际化实现

### 5. **类型安全**
- 通过字典映射确保枚举值的正确性
- 避免硬编码导致的拼写错误

---

## ⚠️ 注意事项

### 1. 字典加载时机
- 必须在组件使用字典选项前加载完成
- 建议在 `created` 钩子中调用 `loadTPMDictionary()`

### 2. 缓存更新
- 字典数据会缓存到 localStorage
- 清除缓存需调用相应的清理方法

### 3. 错误处理
- 如果字典加载失败，组件应提供降级方案
- 可使用 `isTPMDictionaryLoaded()` 检查加载状态

### 4. 兼容性
- 保持与现有 `constants` 配置的兼容性
- Tag 配置等UI相关配置仍保留在 `constants` 中

---

## 📂 文件清单

### 新增文件（TPM模块级别）
```
src/views/master-data/equipment-tpm-management/
├── api/
│   └── dictionary.js                          # TPM模块字典API（所有子模块共用）
├── mixins/
│   └── dictionary.js                          # TPM模块字典Mixin（所有子模块共用）
└── maintenance-plan/
    └── docs/
        └── TPM模块字典集成说明.md            # 本文档
```

### 修改文件（维护计划子模块）
```
src/views/master-data/equipment-tpm-management/maintenance-plan/
├── components/
│   ├── MaintenancePlanFormDrawer.vue          # 集成TPM字典mixin
│   ├── MaintenancePlanSearch.vue              # 集成TPM字典mixin
│   └── MaintenancePlanTable.vue               # 保持不变（使用constants）
└── index.vue                                  # 集成TPM字典mixin
```

### 架构说明

```
equipment-tpm-management/                      # TPM模块根目录
├── api/
│   └── dictionary.js                          # 【共用】字典API
├── mixins/
│   └── dictionary.js                          # 【共用】字典Mixin
├── maintenance-plan/                          # 维护计划子模块
│   ├── components/                            # 使用共用mixin
│   └── index.vue                              # 使用共用mixin
├── maintenance-task/                          # 维护任务子模块（可使用共用mixin）
├── maintenance-record/                        # 维护记录子模块（可使用共用mixin）
└── equipment-failure/                         # 设备故障子模块（可使用共用mixin）
```

---

## 🔗 相关文档

- [TPM模块枚举字典接口文档](../../docs/接口文档/TPM模块枚举字典接口文档.md)
- [TPM模块字典API](../../api/dictionary.js)
- [TPM模块字典Mixin](../../mixins/dictionary.js)
- [工艺参数管理模块字典实现](../../../process-parameter-management/mixins/dictionary.js)
- [字典基础Mixin](../../../../../../mixins/dictionaryBase.js)

---

**文档版本**: v1.0.0
**最后更新**: 2025-10-15
**维护人员**: AI Assistant

