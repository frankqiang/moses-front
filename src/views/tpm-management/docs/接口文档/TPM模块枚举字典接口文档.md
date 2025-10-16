# TPM模块枚举字典接口文档

## 📋 概述

设备TPM管理模块的枚举字典接口，提供所有TPM相关的枚举值和中文标签。前端应在应用启动时调用并缓存到 localStorage，避免重复请求。

**创建日期**: 2025-10-15
**参照实现**: 工艺模板模块字典接口

---

## 🔗 接口列表

### 1. 获取所有枚举字典

**接口路径**: `GET /v1/mdm/tpm/dictionaries`
**权限要求**: 需要认证
**描述**: 一次性返回TPM模块所有枚举类型的字典数据

#### 请求示例

```http
GET /v1/mdm/tpm/dictionaries
Authorization: Bearer <access_token>
```

#### 响应示例

```json
{
  "success": true,
  "data": {
    "maintenanceTypes": {
      "values": {
        "DAILY": "日常保养",
        "PERIODIC": "定期检查",
        "OVERHAUL": "大修",
        "SPECIAL": "专项维护"
      },
      "labels": {
        "日常保养": "日常保养",
        "定期检查": "定期检查",
        "大修": "大修",
        "专项维护": "专项维护"
      },
      "description": "维护类型",
      "type": "maintenanceTypes"
    },
    "cycleTypes": {
      "values": {
        "BY_TIME": "按时间",
        "BY_RUNTIME": "按运行时长",
        "BY_BATCH": "按生产批次"
      },
      "labels": {
        "按时间": "按时间",
        "按运行时长": "按运行时长",
        "按生产批次": "按生产批次"
      },
      "description": "维护周期类型",
      "type": "cycleTypes"
    },
    "cycleUnits": {
      "values": {
        "DAY": "天",
        "WEEK": "周",
        "MONTH": "月",
        "YEAR": "年",
        "HOUR": "小时",
        "BATCH": "批次"
      },
      "labels": {
        "天": "天",
        "周": "周",
        "月": "月",
        "年": "年",
        "小时": "小时",
        "批次": "批次"
      },
      "description": "周期单位",
      "type": "cycleUnits"
    },
    "planStatuses": {
      "values": {
        "ENABLED": "启用",
        "DISABLED": "禁用"
      },
      "labels": {
        "启用": "启用",
        "禁用": "禁用"
      },
      "description": "维护计划状态",
      "type": "planStatuses"
    },
    "taskTypes": {
      "values": {
        "PLANNED": "计划维护",
        "EMERGENCY": "应急抢修",
        "CONDITION_BASED": "状态检修"
      },
      "labels": {
        "计划维护": "计划维护",
        "应急抢修": "应急抢修",
        "状态检修": "状态检修"
      },
      "description": "维护任务类型",
      "type": "taskTypes"
    },
    "taskStatuses": {
      "values": {
        "PENDING": "待执行",
        "IN_PROGRESS": "执行中",
        "COMPLETED": "已完成",
        "DELAYED": "已延期",
        "CANCELLED": "已取消"
      },
      "labels": {
        "待执行": "待执行",
        "执行中": "执行中",
        "已完成": "已完成",
        "已延期": "已延期",
        "已取消": "已取消"
      },
      "description": "维护任务状态",
      "type": "taskStatuses"
    },
    "failureLevels": {
      "values": {
        "CRITICAL": "I级-严重",
        "MAJOR": "II级-重大",
        "MODERATE": "III级-一般",
        "MINOR": "IV级-轻微"
      },
      "labels": {
        "I级-严重": "I级-严重",
        "II级-重大": "II级-重大",
        "III级-一般": "III级-一般",
        "IV级-轻微": "IV级-轻微"
      },
      "description": "故障等级",
      "type": "failureLevels"
    },
    "impactDegrees": {
      "values": {
        "SHUTDOWN": "停机",
        "DEGRADED": "性能下降",
        "NO_IMPACT": "无影响"
      },
      "labels": {
        "停机": "停机",
        "性能下降": "性能下降",
        "无影响": "无影响"
      },
      "description": "影响程度",
      "type": "impactDegrees"
    },
    "failureTypes": {
      "values": {
        "MECHANICAL": "机械",
        "ELECTRICAL": "电气",
        "HYDRAULIC": "液压",
        "CONTROL": "控制",
        "OTHER": "其他"
      },
      "labels": {
        "机械": "机械",
        "电气": "电气",
        "液压": "液压",
        "控制": "控制",
        "其他": "其他"
      },
      "description": "故障类型",
      "type": "failureTypes"
    },
    "failureStatuses": {
      "values": {
        "PENDING": "待处理",
        "IN_PROGRESS": "处理中",
        "RESOLVED": "已解决",
        "VERIFIED": "已验证",
        "CLOSED": "已关闭"
      },
      "labels": {
        "待处理": "待处理",
        "处理中": "处理中",
        "已解决": "已解决",
        "已验证": "已验证",
        "已关闭": "已关闭"
      },
      "description": "故障处理状态",
      "type": "failureStatuses"
    }
  },
  "message": "获取枚举字典成功",
  "meta": {
    "timestamp": "2025-10-15T10:30:00.000Z",
    "version": "v1"
  }
}
```

---

### 2. 获取特定类型枚举字典

**接口路径**: `GET /v1/mdm/tpm/dictionaries/:type`
**权限要求**: 需要认证
**描述**: 返回指定类型的枚举字典

#### 路径参数

| 参数名 | 类型   | 必填 | 说明                   |
| ------ | ------ | ---- | ---------------------- |
| type   | string | 是   | 字典类型，见下方可选值 |

#### 字典类型可选值

| 类型值             | 说明         | 枚举值数量 | 应用模块           |
| ------------------ | ------------ | ---------- | ------------------ |
| `maintenanceTypes` | 维护类型     | 4          | 维护计划、维护记录 |
| `cycleTypes`       | 维护周期类型 | 3          | 维护计划           |
| `cycleUnits`       | 周期单位     | 6          | 维护计划           |
| `planStatuses`     | 维护计划状态 | 2          | 维护计划           |
| `taskTypes`        | 维护任务类型 | 3          | 维护任务           |
| `taskStatuses`     | 维护任务状态 | 5          | 维护任务           |
| `failureLevels`    | 故障等级     | 4          | 设备故障           |
| `impactDegrees`    | 影响程度     | 3          | 设备故障           |
| `failureTypes`     | 故障类型     | 5          | 设备故障           |
| `failureStatuses`  | 故障处理状态 | 5          | 设备故障           |

#### 请求示例

```http
GET /v1/mdm/tpm/dictionaries/maintenanceTypes
Authorization: Bearer <access_token>
```

#### 响应示例（成功）

```json
{
  "success": true,
  "data": {
    "values": {
      "DAILY": "日常保养",
      "PERIODIC": "定期检查",
      "OVERHAUL": "大修",
      "SPECIAL": "专项维护"
    },
    "labels": {
      "日常保养": "日常保养",
      "定期检查": "定期检查",
      "大修": "大修",
      "专项维护": "专项维护"
    },
    "description": "维护类型",
    "type": "maintenanceTypes"
  },
  "message": "获取维护类型字典成功",
  "meta": {
    "timestamp": "2025-10-15T10:30:00.000Z",
    "version": "v1"
  }
}
```

#### 响应示例（字典类型不存在）

```json
{
  "success": false,
  "error": {
    "code": "DICTIONARY_NOT_FOUND",
    "message": "字典类型 \"invalidType\" 不存在",
    "details": {
      "providedType": "invalidType",
      "availableTypes": [
        "maintenanceTypes",
        "cycleTypes",
        "cycleUnits",
        "planStatuses",
        "taskTypes",
        "taskStatuses",
        "failureLevels",
        "impactDegrees",
        "failureTypes",
        "failureStatuses"
      ]
    }
  },
  "meta": {
    "timestamp": "2025-10-15T10:30:00.000Z",
    "requestId": "req-123456",
    "version": "v1"
  }
}
```

---

## 📦 枚举值详细说明

### 1. 维护类型 (maintenanceTypes)

| 枚举键   | 中文值   | 说明                   | 适用模块           |
| -------- | -------- | ---------------------- | ------------------ |
| DAILY    | 日常保养 | 设备的日常维护保养     | 维护计划、维护记录 |
| PERIODIC | 定期检查 | 按周期进行的定期检查   | 维护计划、维护记录 |
| OVERHAUL | 大修     | 设备的大修或翻新       | 维护计划、维护记录 |
| SPECIAL  | 专项维护 | 针对特定问题的专项维护 | 维护计划、维护记录 |

### 2. 维护周期类型 (cycleTypes)

| 枚举键     | 中文值     | 说明                   |
| ---------- | ---------- | ---------------------- |
| BY_TIME    | 按时间     | 基于时间周期的维护计划 |
| BY_RUNTIME | 按运行时长 | 基于设备运行时长的维护 |
| BY_BATCH   | 按生产批次 | 基于生产批次的维护计划 |

### 3. 周期单位 (cycleUnits)

| 枚举键 | 中文值 | 说明                     |
| ------ | ------ | ------------------------ |
| DAY    | 天     | 按天计算的时间周期       |
| WEEK   | 周     | 按周计算的时间周期       |
| MONTH  | 月     | 按月计算的时间周期       |
| YEAR   | 年     | 按年计算的时间周期       |
| HOUR   | 小时   | 按小时计算的运行时长周期 |
| BATCH  | 批次   | 按生产批次计算的周期     |

### 4. 维护计划状态 (planStatuses)

| 枚举键   | 中文值 | 说明                     |
| -------- | ------ | ------------------------ |
| ENABLED  | 启用   | 计划已启用，自动生成任务 |
| DISABLED | 禁用   | 计划已禁用，不生成任务   |

### 5. 维护任务类型 (taskTypes)

| 枚举键          | 中文值   | 说明                   |
| --------------- | -------- | ---------------------- |
| PLANNED         | 计划维护 | 按计划执行的预防性维护 |
| EMERGENCY       | 应急抢修 | 紧急故障的抢修任务     |
| CONDITION_BASED | 状态检修 | 基于设备状态的维护任务 |

### 6. 维护任务状态 (taskStatuses)

| 枚举键      | 中文值 | 说明                 |
| ----------- | ------ | -------------------- |
| PENDING     | 待执行 | 任务已创建，等待执行 |
| IN_PROGRESS | 执行中 | 任务正在执行         |
| COMPLETED   | 已完成 | 任务已完成           |
| DELAYED     | 已延期 | 任务已申请延期       |
| CANCELLED   | 已取消 | 任务已取消           |

### 7. 故障等级 (failureLevels)

| 枚举键   | 中文值     | 说明                 |
| -------- | ---------- | -------------------- |
| CRITICAL | I级-严重   | 严重故障，立即处理   |
| MAJOR    | II级-重大  | 重大故障，优先处理   |
| MODERATE | III级-一般 | 一般故障，按计划处理 |
| MINOR    | IV级-轻微  | 轻微故障，可延后处理 |

### 8. 影响程度 (impactDegrees)

| 枚举键    | 中文值   | 说明         |
| --------- | -------- | ------------ |
| SHUTDOWN  | 停机     | 设备完全停机 |
| DEGRADED  | 性能下降 | 设备性能降低 |
| NO_IMPACT | 无影响   | 对生产无影响 |

### 9. 故障类型 (failureTypes)

| 枚举键     | 中文值 | 说明         |
| ---------- | ------ | ------------ |
| MECHANICAL | 机械   | 机械系统故障 |
| ELECTRICAL | 电气   | 电气系统故障 |
| HYDRAULIC  | 液压   | 液压系统故障 |
| CONTROL    | 控制   | 控制系统故障 |
| OTHER      | 其他   | 其他类型故障 |

### 10. 故障处理状态 (failureStatuses)

| 枚举键      | 中文值 | 说明                 |
| ----------- | ------ | -------------------- |
| PENDING     | 待处理 | 故障已报告，等待处理 |
| IN_PROGRESS | 处理中 | 故障正在处理         |
| RESOLVED    | 已解决 | 故障已解决           |
| VERIFIED    | 已验证 | 故障处理已验证       |
| CLOSED      | 已关闭 | 故障单已关闭         |

---

## 🎯 前端使用指南

### 1. 应用启动时缓存

```javascript
// 在应用初始化时获取并缓存
async function initTPMDictionaries() {
  try {
    const response = await axios.get('/v1/mdm/tpm/dictionaries');

    // 缓存到 localStorage
    localStorage.setItem('tpmDictionaries', JSON.stringify(response.data.data));

    // 或缓存到 Vuex/Redux
    store.commit('SET_TPM_DICTIONARIES', response.data.data);

    console.log('TPM模块字典缓存成功');
  } catch (error) {
    console.error('获取TPM模块字典失败:', error);
  }
}
```

### 2. 使用缓存的字典数据

```javascript
// 从缓存获取字典
function getTPMDictionaries() {
  const cached = localStorage.getItem('tpmDictionaries');
  return cached ? JSON.parse(cached) : null;
}

// 获取特定类型的标签
function getLabel(type, value) {
  const dictionaries = getTPMDictionaries();
  return dictionaries?.[type]?.labels?.[value] || value;
}

// 使用示例
const statusLabel = getLabel('taskStatuses', '待执行');
console.log(statusLabel); // 输出: "待执行"
```

### 3. 生成下拉选项

```javascript
// 将枚举转换为 Select 组件选项
function getDictionaryOptions(type) {
  const dictionaries = getTPMDictionaries();
  const dict = dictionaries?.[type];

  if (!dict) return [];

  return Object.entries(dict.values).map(([key, value]) => ({
    label: value,
    value: key,
  }));
}

// Vue 使用示例
<template>
  <el-select v-model="form.maintenanceType" placeholder="请选择维护类型">
    <el-option
      v-for="item in maintenanceTypeOptions"
      :key="item.value"
      :label="item.label"
      :value="item.value"
    />
  </el-select>
</template>

<script>
export default {
  data() {
    return {
      form: { maintenanceType: '' },
      maintenanceTypeOptions: getDictionaryOptions('maintenanceTypes')
    };
  }
};
</script>
```

### 4. 表格列显示转换

```javascript
// Element UI 表格列格式化
<el-table-column
  prop="status"
  label="任务状态"
  :formatter="(row) => getLabel('taskStatuses', row.status)"
/>

// 或使用自定义插槽
<el-table-column prop="status" label="任务状态">
  <template #default="{ row }">
    <el-tag :type="getStatusType(row.status)">
      {{ getLabel('taskStatuses', row.status) }}
    </el-tag>
  </template>
</el-table-column>
```

---

## 🔄 更新策略

### 何时更新缓存？

1. **应用启动时**: 首次加载必须获取
2. **版本更新后**: 清除旧缓存，重新获取
3. **定期刷新**: 每24小时刷新一次（可选）
4. **手动刷新**: 提供手动刷新按钮（可选）

### 版本控制示例

```javascript
const TPM_DICTIONARY_VERSION = '1.0.0'; // 在应用配置中定义

function checkDictionaryVersion() {
  const cachedVersion = localStorage.getItem('tpmDictionaryVersion');

  if (cachedVersion !== TPM_DICTIONARY_VERSION) {
    // 版本不匹配，清除旧缓存
    localStorage.removeItem('tpmDictionaries');
    localStorage.setItem('tpmDictionaryVersion', TPM_DICTIONARY_VERSION);

    // 重新获取
    return initTPMDictionaries();
  }
}
```

---

## ⚠️ 注意事项

1. **权限要求**: 需要用户已登录且通过认证
2. **缓存策略**: 建议在应用启动时获取并缓存，避免每次请求
3. **错误处理**: 如果获取失败，应有降级方案（使用默认值或本地备份）
4. **数据一致性**: 枚举值与数据库 ENUM 定义保持一致
5. **向后兼容**: 新增枚举值不会影响现有代码，但删除枚举值需谨慎
6. **跨模块复用**: 维护类型等枚举在多个模块中复用（维护计划、维护记录）

---

## 📂 相关文件

### 后端文件

- **常量定义**: `src/models/mdm/tpm/tpm.constants.js`
- **控制器**: `src/controllers/modules/mdm/tpm/tpmDictionary.controller.js`
- **路由**: `src/routes/v1/modules/mdm/tpm/tpmDictionary.route.js`
- **测试**: `tests/integration/mdm/tpm/tpmDictionary.test.js`

### 数据模型参考

- **维护计划**: `src/models/mdm/tpm/maintenancePlan.model.js`
- **维护任务**: `src/models/mdm/tpm/maintenanceTask.model.js`
- **维护记录**: `src/models/mdm/tpm/maintenanceRecord.model.js`
- **设备故障**: `src/models/mdm/tpm/equipmentFailure.model.js`

---

## 🧪 测试覆盖

待实现集成测试，测试覆盖：

- [ ] 获取所有字典功能
- [ ] 获取特定类型字典功能
- [ ] 字典数据结构验证
- [ ] 枚举值完整性验证
- [ ] 错误处理（不存在的字典类型）
- [ ] 认证验证（未登录访问）

**测试文件**: `tests/integration/mdm/tpm/tpmDictionary.test.js`

---

## 📊 接口响应时间

- **获取所有字典**: < 100ms
- **获取特定字典**: < 50ms

---

## 🔗 相关文档

- [维护计划管理接口文档](./维护计划管理接口文档.md)
- [维护任务管理接口文档](./维护任务管理接口文档.md)
- [维护记录管理接口文档](./维护记录管理接口文档.md)
- [设备故障管理接口文档](./设备故障管理接口文档.md)
- [工艺模板枚举字典接口](../../工艺管理/接口文档/工艺模板枚举字典接口文档.md)

---

**文档版本**: v1.0.0
**最后更新**: 2025-10-15
**维护人员**: AI Assistant

