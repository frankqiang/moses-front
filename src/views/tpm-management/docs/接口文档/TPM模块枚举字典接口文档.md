# Moses API TPM模块枚举字典接口文档

## 概述

本文档详细说明了 Moses API TPM模块的枚举字典接口，包括请求方法、路径、参数、请求和响应数据结构、功能描述、错误码和返回示例。**本文档严格基于实际代码实现编写**，确保前端开发人员能够准确对接。

### API 基础信息

- **基础 URL**: `http://localhost:3000/v1` (开发环境)
- **API 版本**: v1
- **认证方式**: JWT Bearer Token
- **数据格式**: JSON
- **字符编码**: UTF-8
- **Content-Type**: application/json

### Swagger 文档

项目已集成 Swagger 文档，可通过以下地址访问：

- **开发环境**: http://localhost:3000/v1/docs
- **在线文档**: 提供完整的 API 接口说明、参数定义和示例

### 权限约定

- **字典查询权限**: 需要用户已登录认证，无需特定权限
- **适用场景**: 所有TPM相关模块的枚举值查询

## 统一响应格式

### 成功响应格式

所有成功的 API 调用都会返回以下统一格式：

```json
{
  "success": true,
  "data": {
    // 具体的业务数据，根据接口而不同
  },
  "message": "操作成功的描述信息",
  "meta": {
    "timestamp": "2025-10-16T10:30:00.000Z",
    "requestId": "req-1234567890-abcdef",
    "version": "v1"
  }
}
```

### 错误响应格式

所有错误的 API 调用都会返回以下统一格式：

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "用户友好的错误描述",
    "details": {
      "field": "发生错误的字段名（可选）",
      "value": "错误的字段值（可选）"
    }
  },
  "meta": {
    "timestamp": "2025-10-16T10:30:00.000Z",
    "requestId": "req-1234567890-abcdef",
    "version": "v1"
  }
}
```

**响应字段说明**：

- `success`: 布尔值，表示请求是否成功
- `data`: 成功时包含业务数据，失败时为 null
- `error`: 失败时包含错误信息，成功时为 null
- `message`: 成功时的操作描述
- `error.code`: 标准化的错误码，用于程序化处理
- `error.message`: 用户友好的错误描述，可直接展示给用户
- `error.details`: 可选的错误详细信息
- `meta`: 元数据信息，包含时间戳、请求 ID 和版本号

---

## TPM模块枚举字典接口详细说明

### 1. 获取所有枚举字典

**接口路径**: `GET /v1/mdm/tpm/dictionaries`

**功能描述**: 一次性返回TPM模块所有枚举类型的字典数据，用于系统初始化或缓存刷新。返回的数据包含维护计划、维护任务、设备故障等所有TPM相关的枚举值和中文标签映射。

**认证要求**: 需要 Bearer Token

**请求头**:

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**查询参数**: 无

**请求参数**: 无

**请求示例**:

```bash
curl -X GET http://localhost:3000/v1/mdm/tpm/dictionaries \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**成功响应** (HTTP 200):

```json
{
  "success": true,
  "data": {
    "maintenanceTypes": {
      "DAILY": "日常保养",
      "PERIODIC": "定期检查",
      "OVERHAUL": "大修",
      "SPECIAL": "专项维护"
    },
    "cycleTypes": {
      "BY_TIME": "按时间",
      "BY_RUNTIME": "按运行时长",
      "BY_BATCH": "按生产批次"
    },
    "cycleUnits": {
      "DAY": "天",
      "WEEK": "周",
      "MONTH": "月",
      "YEAR": "年",
      "HOUR": "小时",
      "BATCH": "批次"
    },
    "planStatuses": {
      "ENABLED": "启用",
      "DISABLED": "禁用"
    },
    "taskTypes": {
      "PLANNED": "计划维护",
      "EMERGENCY": "应急抢修",
      "CONDITION_BASED": "状态检修"
    },
    "taskStatuses": {
      "PENDING": "待执行",
      "IN_PROGRESS": "执行中",
      "COMPLETED": "已完成",
      "DELAYED": "已延期",
      "CANCELLED": "已取消"
    },
    "failureLevels": {
      "CRITICAL": "I级-严重",
      "MAJOR": "II级-重大",
      "MODERATE": "III级-一般",
      "MINOR": "IV级-轻微"
    },
    "impactDegrees": {
      "SHUTDOWN": "停机",
      "DEGRADED": "性能下降",
      "NO_IMPACT": "无影响"
    },
    "failureTypes": {
      "MECHANICAL": "机械",
      "ELECTRICAL": "电气",
      "HYDRAULIC": "液压",
      "CONTROL": "控制",
      "OTHER": "其他"
    },
    "failureStatuses": {
      "PENDING": "待处理",
      "IN_PROGRESS": "处理中",
      "RESOLVED": "已解决",
      "VERIFIED": "已验证",
      "CLOSED": "已关闭"
    }
  },
  "message": "获取枚举字典成功",
  "meta": {
    "timestamp": "2025-10-16T10:30:00.000Z",
    "version": "v1"
  }
}
```

**响应字段说明**:

| 字段名                | 类型    | 描述                                | 示例                       |
| --------------------- | ------- | ----------------------------------- | -------------------------- |
| success               | boolean | 请求是否成功                        | true                       |
| data                  | object  | 字典数据对象，包含所有枚举类型      | {...}                      |
| data.maintenanceTypes | object  | 维护类型枚举 (CODE -> 中文标签)     | {...}                      |
| data.cycleTypes       | object  | 维护周期类型枚举 (CODE -> 中文标签) | {...}                      |
| data.cycleUnits       | object  | 周期单位枚举 (CODE -> 中文标签)     | {...}                      |
| data.planStatuses     | object  | 维护计划状态枚举 (CODE -> 中文标签) | {...}                      |
| data.taskTypes        | object  | 维护任务类型枚举 (CODE -> 中文标签) | {...}                      |
| data.taskStatuses     | object  | 维护任务状态枚举 (CODE -> 中文标签) | {...}                      |
| data.failureLevels    | object  | 故障等级枚举 (CODE -> 中文标签)     | {...}                      |
| data.impactDegrees    | object  | 影响程度枚举 (CODE -> 中文标签)     | {...}                      |
| data.failureTypes     | object  | 故障类型枚举 (CODE -> 中文标签)     | {...}                      |
| data.failureStatuses  | object  | 故障处理状态枚举 (CODE -> 中文标签) | {...}                      |
| message               | string  | 操作结果描述                        | "获取枚举字典成功"         |
| meta.timestamp        | string  | 响应时间戳 (ISO 8601格式)           | "2025-10-16T10:30:00.000Z" |
| meta.version          | string  | API版本号                           | "v1"                       |

**枚举对象字段说明** (以 maintenanceTypes 为例):

| 字段名（枚举CODE） | 类型   | 描述               | 示例       |
| ------------------ | ------ | ------------------ | ---------- |
| DAILY              | string | 日常保养的中文标签 | "日常保养" |
| PERIODIC           | string | 定期检查的中文标签 | "定期检查" |
| OVERHAUL           | string | 大修的中文标签     | "大修"     |
| SPECIAL            | string | 专项维护的中文标签 | "专项维护" |

**错误响应**:

**错误码列表**:

| HTTP状态码 | 错误码         | 错误消息                | 说明                         | 处理建议              |
| ---------- | -------------- | ----------------------- | ---------------------------- | --------------------- |
| 401        | UNAUTHORIZED   | 未授权，Token无效或过期 | 未提供认证Token或Token已失效 | 重新登录获取有效Token |
| 500        | INTERNAL_ERROR | 服务器内部错误          | 服务器处理请求时发生异常     | 联系技术支持          |

**401 未授权示例**:

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "未授权，Token无效或过期"
  },
  "meta": {
    "timestamp": "2025-10-16T10:30:00.000Z",
    "requestId": "req-123456",
    "version": "v1"
  }
}
```

---

### 2. 获取特定类型枚举字典

**接口路径**: `GET /v1/mdm/tpm/dictionaries/:type`

**功能描述**: 返回指定类型的枚举字典。如果只需要某一种枚举类型（如只需要维护类型），可以使用此接口减少数据传输量。接口会根据type参数返回对应的枚举值到中文标签的映射。

**认证要求**: 需要 Bearer Token

**请求头**:

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**路径参数**:

| 参数名 | 类型   | 必填 | 限制               | 描述                                   | 示例             |
| ------ | ------ | ---- | ------------------ | -------------------------------------- | ---------------- |
| type   | string | 是   | 见下方"可选值"列表 | 字典类型标识，用于指定要获取的枚举类型 | maintenanceTypes |

**type 参数可选值**:

| 值               | 说明         | 枚举数量 |
| ---------------- | ------------ | -------- |
| maintenanceTypes | 维护类型     | 4        |
| cycleTypes       | 维护周期类型 | 3        |
| cycleUnits       | 周期单位     | 6        |
| planStatuses     | 维护计划状态 | 2        |
| taskTypes        | 维护任务类型 | 3        |
| taskStatuses     | 维护任务状态 | 5        |
| failureLevels    | 故障等级     | 4        |
| impactDegrees    | 影响程度     | 3        |
| failureTypes     | 故障类型     | 5        |
| failureStatuses  | 故障处理状态 | 5        |

**查询参数**: 无

**请求参数**: 无

**请求示例**:

```bash
curl -X GET http://localhost:3000/v1/mdm/tpm/dictionaries/maintenanceTypes \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**成功响应** (HTTP 200):

```json
{
  "success": true,
  "data": {
    "DAILY": "日常保养",
    "PERIODIC": "定期检查",
    "OVERHAUL": "大修",
    "SPECIAL": "专项维护"
  },
  "message": "获取维护类型字典成功",
  "meta": {
    "timestamp": "2025-10-16T10:30:00.000Z",
    "version": "v1"
  }
}
```

**响应字段说明**:

| 字段名         | 类型    | 描述                           | 示例                       |
| -------------- | ------- | ------------------------------ | -------------------------- |
| success        | boolean | 请求是否成功                   | true                       |
| data           | object  | 枚举CODE到中文标签的键值对映射 | {"DAILY": "日常保养", ...} |
| data.{CODE}    | string  | 枚举CODE对应的中文标签         | "日常保养"                 |
| message        | string  | 操作结果描述                   | "获取维护类型字典成功"     |
| meta.timestamp | string  | 响应时间戳 (ISO 8601格式)      | "2025-10-16T10:30:00.000Z" |
| meta.version   | string  | API版本号                      | "v1"                       |

**错误响应**:

**错误码列表**:

| HTTP状态码 | 错误码               | 错误消息                | 说明                         | 处理建议              |
| ---------- | -------------------- | ----------------------- | ---------------------------- | --------------------- |
| 401        | UNAUTHORIZED         | 未授权，Token无效或过期 | 未提供认证Token或Token已失效 | 重新登录获取有效Token |
| 404        | DICTIONARY_NOT_FOUND | 字典类型不存在          | 请求的字典类型不在支持列表中 | 检查type参数是否正确  |
| 500        | INTERNAL_ERROR       | 服务器内部错误          | 服务器处理请求时发生异常     | 联系技术支持          |

**404 字典类型不存在示例**:

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
    "timestamp": "2025-10-16T10:30:00.000Z",
    "requestId": "req-123456",
    "version": "v1"
  }
}
```

---

## 错误码说明

### TPM字典相关错误码 (TPM_DICT_xxx)

| 错误码               | HTTP 状态码 | 错误消息       | 说明                   | 处理建议             |
| -------------------- | ----------- | -------------- | ---------------------- | -------------------- |
| DICTIONARY_NOT_FOUND | 404         | 字典类型不存在 | 请求的字典类型标识无效 | 检查type参数是否正确 |

### 通用错误码

| 错误码         | HTTP 状态码 | 错误消息                | 说明                         | 处理建议               |
| -------------- | ----------- | ----------------------- | ---------------------------- | ---------------------- |
| UNAUTHORIZED   | 401         | 未授权，Token无效或过期 | 未提供认证Token或Token已失效 | 重新登录获取有效Token  |
| FORBIDDEN      | 403         | 无权限执行此操作        | 当前用户没有该操作的权限     | 联系管理员分配相应权限 |
| INTERNAL_ERROR | 500         | 服务器内部错误          | 服务器处理请求时发生异常     | 联系技术支持           |

---

## 数据模型

### 枚举字典数据结构

枚举字典采用简洁的键值对格式，其中键为枚举CODE（大写英文，下划线分隔），值为对应的中文标签。

**通用结构**:

```json
{
  "{枚举类型}": {
    "{CODE1}": "{中文标签1}",
    "{CODE2}": "{中文标签2}"
  }
}
```

**设计说明**:
- 枚举CODE用于数据库存储和业务逻辑判断
- 中文标签用于用户界面显示
- 采用扁平结构，避免嵌套复杂度

### 枚举类型详细定义

#### 1. 维护类型 (maintenanceTypes)

| 枚举CODE | 中文标签 | 说明                   | 应用场景           |
| -------- | -------- | ---------------------- | ------------------ |
| DAILY    | 日常保养 | 设备的日常维护保养     | 维护计划、维护记录 |
| PERIODIC | 定期检查 | 按周期进行的定期检查   | 维护计划、维护记录 |
| OVERHAUL | 大修     | 设备的大修或翻新       | 维护计划、维护记录 |
| SPECIAL  | 专项维护 | 针对特定问题的专项维护 | 维护计划、维护记录 |

#### 2. 维护周期类型 (cycleTypes)

| 枚举CODE   | 中文标签   | 说明                   | 应用场景 |
| ---------- | ---------- | ---------------------- | -------- |
| BY_TIME    | 按时间     | 基于时间周期的维护计划 | 维护计划 |
| BY_RUNTIME | 按运行时长 | 基于设备运行时长的维护 | 维护计划 |
| BY_BATCH   | 按生产批次 | 基于生产批次的维护计划 | 维护计划 |

#### 3. 周期单位 (cycleUnits)

| 枚举CODE | 中文标签 | 说明                     | 应用场景 |
| -------- | -------- | ------------------------ | -------- |
| DAY      | 天       | 按天计算的时间周期       | 维护计划 |
| WEEK     | 周       | 按周计算的时间周期       | 维护计划 |
| MONTH    | 月       | 按月计算的时间周期       | 维护计划 |
| YEAR     | 年       | 按年计算的时间周期       | 维护计划 |
| HOUR     | 小时     | 按小时计算的运行时长周期 | 维护计划 |
| BATCH    | 批次     | 按生产批次计算的周期     | 维护计划 |

#### 4. 维护计划状态 (planStatuses)

| 枚举CODE | 中文标签 | 说明                     | 应用场景 |
| -------- | -------- | ------------------------ | -------- |
| ENABLED  | 启用     | 计划已启用，自动生成任务 | 维护计划 |
| DISABLED | 禁用     | 计划已禁用，不生成任务   | 维护计划 |

#### 5. 维护任务类型 (taskTypes)

| 枚举CODE        | 中文标签 | 说明                   | 应用场景 |
| --------------- | -------- | ---------------------- | -------- |
| PLANNED         | 计划维护 | 按计划执行的预防性维护 | 维护任务 |
| EMERGENCY       | 应急抢修 | 紧急故障的抢修任务     | 维护任务 |
| CONDITION_BASED | 状态检修 | 基于设备状态的维护任务 | 维护任务 |

#### 6. 维护任务状态 (taskStatuses)

| 枚举CODE    | 中文标签 | 说明                 | 应用场景 |
| ----------- | -------- | -------------------- | -------- |
| PENDING     | 待执行   | 任务已创建，等待执行 | 维护任务 |
| IN_PROGRESS | 执行中   | 任务正在执行         | 维护任务 |
| COMPLETED   | 已完成   | 任务已完成           | 维护任务 |
| DELAYED     | 已延期   | 任务已申请延期       | 维护任务 |
| CANCELLED   | 已取消   | 任务已取消           | 维护任务 |

#### 7. 故障等级 (failureLevels)

| 枚举CODE | 中文标签   | 说明                 | 应用场景 |
| -------- | ---------- | -------------------- | -------- |
| CRITICAL | I级-严重   | 严重故障，立即处理   | 设备故障 |
| MAJOR    | II级-重大  | 重大故障，优先处理   | 设备故障 |
| MODERATE | III级-一般 | 一般故障，按计划处理 | 设备故障 |
| MINOR    | IV级-轻微  | 轻微故障，可延后处理 | 设备故障 |

#### 8. 影响程度 (impactDegrees)

| 枚举CODE  | 中文标签 | 说明         | 应用场景 |
| --------- | -------- | ------------ | -------- |
| SHUTDOWN  | 停机     | 设备完全停机 | 设备故障 |
| DEGRADED  | 性能下降 | 设备性能降低 | 设备故障 |
| NO_IMPACT | 无影响   | 对生产无影响 | 设备故障 |

#### 9. 故障类型 (failureTypes)

| 枚举CODE   | 中文标签 | 说明         | 应用场景 |
| ---------- | -------- | ------------ | -------- |
| MECHANICAL | 机械     | 机械系统故障 | 设备故障 |
| ELECTRICAL | 电气     | 电气系统故障 | 设备故障 |
| HYDRAULIC  | 液压     | 液压系统故障 | 设备故障 |
| CONTROL    | 控制     | 控制系统故障 | 设备故障 |
| OTHER      | 其他     | 其他类型故障 | 设备故障 |

#### 10. 故障处理状态 (failureStatuses)

| 枚举CODE    | 中文标签 | 说明                 | 应用场景 |
| ----------- | -------- | -------------------- | -------- |
| PENDING     | 待处理   | 故障已报告，等待处理 | 设备故障 |
| IN_PROGRESS | 处理中   | 故障正在处理         | 设备故障 |
| RESOLVED    | 已解决   | 故障已解决           | 设备故障 |
| VERIFIED    | 已验证   | 故障处理已验证       | 设备故障 |
| CLOSED      | 已关闭   | 故障单已关闭         | 设备故障 |

### 字段说明

**日期时间格式**:
- 所有日期时间字段均使用 ISO 8601 格式：`YYYY-MM-DDTHH:mm:ss.sssZ`
- 示例：`"2025-10-16T10:30:00.000Z"`

**枚举CODE命名规范**:
- 全部大写英文字母
- 多个单词使用下划线 `_` 分隔
- 具有自解释性
- 示例：`PENDING_APPROVAL`、`IN_PROGRESS`、`READY_FOR_SCHEDULING`

**中文标签规范**:
- 简洁明确，通常2-6个汉字
- 使用用户容易理解的业务术语
- 保持系统内一致性

---

## 安全说明

### 认证机制

所有枚举字典接口需要通过JWT Token认证，Token需在请求头中提供：

```
Authorization: Bearer {token}
```

Token获取方式请参考登录模块文档。

### 安全特性

1. **Token验证**: 每次请求都会验证Token的有效性和过期时间
2. **数据只读**: 枚举字典接口仅提供查询功能，不支持修改
3. **权限控制**: 已登录用户即可访问，无需特殊权限
4. **速率限制**: 遵循系统统一的API访问速率限制

### 使用建议

1. **缓存策略**: 枚举数据变化频率低，建议客户端缓存减少请求
2. **批量获取**: 优先使用"获取所有枚举字典"接口，一次性获取所有数据
3. **错误处理**: 实现降级方案，当接口不可用时使用本地默认值
4. **版本控制**: 关注API版本更新，枚举值可能随版本变化

---

## 总结

本文档详细说明了 Moses API TPM模块的枚举字典接口，包括：

### 核心内容

1. **2 个核心接口**：
   - 获取所有枚举字典
   - 获取特定类型枚举字典

2. **10 种枚举类型**：
   - 维护类型、维护周期类型、周期单位
   - 维护计划状态、维护任务类型、维护任务状态
   - 故障等级、影响程度、故障类型、故障处理状态

3. **完整的请求/响应格式**：统一的数据结构和错误处理

4. **详细的参数说明**：每个接口的参数类型、限制和示例

5. **全面的错误码定义**：覆盖各类错误情况

开发人员可以根据本文档进行前端集成开发，如需更多技术细节，请参考 Swagger 在线文档或联系后端开发团队。

---

## 相关文档

- [维护计划管理接口文档](./维护计划管理接口文档.md)
- [维护任务管理接口文档](./维护任务管理接口文档.md)
- [设备故障管理接口文档](./设备故障管理接口文档.md)
- [工艺模板枚举字典接口文档](../../工艺管理/接口文档/工艺模板枚举字典接口文档.md)

---

## 后端实现参考

### 相关文件

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

**文档版本**: v1.0.0
**最后更新**: 2025-10-16
**维护人员**: 后端开发团队
**变更说明**: 优化枚举字典接口设计，移除冗余labels字段，采用CODE->中文直接映射
