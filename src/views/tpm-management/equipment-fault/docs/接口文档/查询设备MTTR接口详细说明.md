# 查询设备MTTR 接口详细说明

---

## 📋 目录

- [功能概述](#功能概述)
- [业务流程](#业务流程)
- [接口文档](#接口文档)
- [使用示例](#使用示例)
- [附录](#附录)

---

## 功能概述

### 所有功能

查询设备MTTR（Mean Time To Repair，平均修复时间）是设备TPM管理中的核心分析功能之一，用于统计指定设备在特定时间周期内的平均故障修复时间，以支持设备维护效率评估和改进决策的业务场景。

### 关键特性

- ✅ **精确MTTR计算**：基于已完成修复的故障记录，计算真实的平均修复时间
- ✅ **灵活时间筛选**：支持自定义开始和结束时间，默认统计近一年数据
- ✅ **设备信息完整**：返回设备编码、名称等基础信息，便于报表展示
- ✅ **数据验证严格**：确保只统计有效的修复记录（有开始和结束时间）
- ✅ **时间单位标准化**：统一以小时为单位显示MTTR，便于比较分析
- ✅ **异常情况处理**：当设备不存在或无有效数据时提供明确反馈

---

### 使用前提

- ✅ 用户已通过身份认证（Bearer Token）
- ✅ 设备必须存在于系统中且未被删除
- ✅ 需要统计的故障记录必须有完整的修复时间记录
- ✅ 查询时间范围不能有逻辑错误（结束时间不能早于开始时间）

### 不适用场景

- ❌ 查询尚未完成修复的故障记录，无法计算有效MTTR
- ❌ 设备从未发生过故障或所有故障都未完成修复的情况

---

## 业务流程

### 整体流程图

```
┌─────────────────┐
│  接收请求参数   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  验证设备存在   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  解析时间参数   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 【开启数据查询】│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  计算MTTR统计   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  组装响应数据   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  返回统计结果   │
└─────────────────┘
```

### 详细步骤说明

#### 步骤1: 接收请求参数
- 提取设备ID（equipmentId）从路径参数
- 解析查询参数中的开始时间（startDate）和结束时间（endDate）
- 记录操作日志，包含用户ID和查询条件

#### 步骤2: 验证设备存在
- 根据设备ID查询设备基础信息
- 如果设备不存在，抛出404错误（EQUIPMENT_001）
- 获取设备编码和名称用于后续响应

#### 步骤3: 解析时间参数
- 如果未提供开始时间，默认设置为一年前
- 如果未提供结束时间，默认设置为当前时间
- 确保时间参数格式正确且逻辑合理

#### 步骤4: 计算MTTR统计
- 调用模型层的calculateMTTR静态方法
- 查询指定时间范围内已完成修复的故障记录
- 计算所有故障记录的平均修复时间（以小时为单位）
- 如果没有有效记录，返回null值

#### 步骤5: 组装响应数据
- 构建包含设备信息、MTTR值、时间单位和统计周期的响应对象
- 将MTTR值保留两位小数精度
- 添加统计周期信息便于用户理解数据范围

#### 步骤6: 返回统计结果
- 使用统一响应格式返回成功结果
- 包含完整的元数据信息（时间戳、请求ID等）

---

## 接口文档

### 基本信息

**接口路径**: `GET /v1/mdm/tpm/equipment-failures/by-equipment/{equipmentId}/mttr`

**功能描述**: 查询指定设备在特定时间周期内的平均修复时间（MTTR），用于设备维护效率分析和TPM改进决策

**认证要求**: Bearer Token 认证，无特定权限要求

## 统一响应格式说明

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
    "timestamp": "2024-01-20T10:30:00.000Z",
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
      "value": "错误的字段值（可选）",
      "retryAfter": 300,
      "traceId": "req-1234567890-abcdef"
    }
  },
  "meta": {
    "timestamp": "2024-01-20T10:30:00.000Z",
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

**请求头**:

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

### 路径参数

| 参数名      | 类型   | 必填 | 限制     | 描述           | 示例                                   |
| ----------- | ------ | ---- | -------- | -------------- | -------------------------------------- |
| equipmentId | string | 是   | UUID格式 | 设备唯一标识符 | "123e4567-e89b-12d3-a456-426614174000" |

### 查询参数

| 参数名    | 类型   | 必填 | 限制                                 | 描述                           | 默认值   | 示例                       |
| --------- | ------ | ---- | ------------------------------------ | ------------------------------ | -------- | -------------------------- |
| startDate | string | 否   | ISO 8601日期时间格式                 | 统计开始时间，不能晚于结束时间 | 一年前   | "2024-01-01T00:00:00.000Z" |
| endDate   | string | 否   | ISO 8601日期时间格式，不早于开始时间 | 统计结束时间，不能早于开始时间 | 当前时间 | "2024-12-31T23:59:59.999Z" |

### 请求示例

#### cURL 命令

```bash
curl -X GET http://localhost:3000/v1/mdm/tpm/equipment-failures/by-equipment/123e4567-e89b-12d3-a456-426614174000/mttr \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -G \
  -d "startDate=2024-01-01T00:00:00.000Z" \
  -d "endDate=2024-12-31T23:59:59.999Z"
```

#### 带参数的请求URL示例

```
GET /v1/mdm/tpm/equipment-failures/by-equipment/123e4567-e89b-12d3-a456-426614174000/mttr?startDate=2024-01-01T00:00:00.000Z&endDate=2024-12-31T23:59:59.999Z
```

### 成功响应

**HTTP 状态码**: `200 OK`

**响应结构**:

```json
{
  "success": true,
  "data": {
    "equipmentId": "123e4567-e89b-12d3-a456-426614174000",
    "equipmentCode": "EQ-2024-001",
    "equipmentName": "退火炉#1",
    "mttr": 4.25,
    "unit": "hours",
    "period": {
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-12-31T23:59:59.999Z"
    }
  },
  "message": "获取设备MTTR成功",
  "meta": {
    "timestamp": "2024-01-21T09:00:00.000Z",
    "requestId": "req-1234567890-abcdef",
    "version": "v1"
  }
}
```

### 响应字段说明

#### 主数据字段（data 对象）

| 字段名        | 类型   | 说明                                      | 示例值                                 |
| ------------- | ------ | ----------------------------------------- | -------------------------------------- |
| equipmentId   | string | 设备ID                                    | "123e4567-e89b-12d3-a456-426614174000" |
| equipmentCode | string | 设备编码                                  | "EQ-2024-001"                          |
| equipmentName | string | 设备名称                                  | "退火炉#1"                             |
| mttr          | number | 平均修复时间，保留2位小数，无数据时为null | 4.25                                   |
| unit          | string | 时间单位，固定为"hours"                   | "hours"                                |
| period        | object | 统计时间周期（见下）                      | {...}                                  |

#### 统计周期字段（period 对象）

| 字段名    | 类型   | 说明                         | 示例值                     |
| --------- | ------ | ---------------------------- | -------------------------- |
| startDate | string | 统计开始时间（ISO 8601格式） | "2024-01-01T00:00:00.000Z" |
| endDate   | string | 统计结束时间（ISO 8601格式） | "2024-12-31T23:59:59.999Z" |

#### 响应元信息（meta 对象）

| 字段名    | 类型   | 说明                       | 示例值                     |
| --------- | ------ | -------------------------- | -------------------------- |
| timestamp | string | 响应时间戳（ISO 8601格式） | "2024-01-21T09:00:00.000Z" |
| requestId | string | 请求追踪ID                 | "req-1234567890-abcdef"    |
| version   | string | API版本号                  | "v1"                       |

### 错误响应

| HTTP状态码 | 错误码                  | 错误消息         | 说明                       | 处理建议               |
| ---------- | ----------------------- | ---------------- | -------------------------- | ---------------------- |
| 400        | VALIDATION_ERROR        | 请求参数验证失败 | 参数格式或值不符合要求     | 检查参数格式和约束条件 |
| 401        | UNAUTHORIZED            | 未授权           | Token无效/过期             | 重新登录获取有效Token  |
| 404        | EQUIPMENT_001           | 设备不存在       | 指定的设备ID不存在         | 检查设备ID是否正确     |
| 500        | MTTR_CALCULATION_FAILED | MTTR计算失败     | 服务器在计算MTTR时发生异常 | 联系技术支持或稍后重试 |
| 500        | INTERNAL_ERROR          | 服务器内部错误   | 系统异常                   | 联系技术支持           |

### 错误响应示例

#### 设备不存在错误

```json
{
  "success": false,
  "error": {
    "code": "EQUIPMENT_001",
    "message": "设备不存在",
    "details": {
      "field": "equipmentId",
      "value": "123e4567-e89b-12d3-a456-426614174000"
    }
  },
  "meta": {
    "timestamp": "2024-01-21T09:00:00.000Z",
    "requestId": "req-1234567890-abcdef",
    "version": "v1"
  }
}
```

#### 参数验证失败错误

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "设备ID必须是有效的UUID格式",
    "details": {
      "field": "equipmentId",
      "value": "invalid-uuid"
    }
  },
  "meta": {
    "timestamp": "2024-01-21T09:00:00.000Z",
    "requestId": "req-1234567890-abcdef",
    "version": "v1"
  }
}
```

#### 时间参数错误

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "结束日期不能早于开始日期",
    "details": {
      "field": "endDate",
      "value": "2024-01-01T00:00:00.000Z"
    }
  },
  "meta": {
    "timestamp": "2024-01-21T09:00:00.000Z",
    "requestId": "req-1234567890-abcdef",
    "version": "v1"
  }
}
```

---

## 使用示例

### 场景1: 查询设备近一年MTTR

**业务需求**: 管理人员需要了解退火炉#1在过去一年的平均修复时间，评估维护团队的效率

```bash
curl -X GET http://localhost:3000/v1/mdm/tpm/equipment-failures/by-equipment/123e4567-e89b-12d3-a456-426614174000/mttr \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**预期结果**: 返回设备基础信息和近一年的MTTR统计数据

### 场景2: 查询设备指定季度MTTR

**业务需求**: 设备工程师需要分析Q4季度的设备修复时间表现，与其他季度进行对比

```bash
curl -X GET http://localhost:3000/v1/mdm/tpm/equipment-failures/by-equipment/123e4567-e89b-12d3-a456-426614174000/mttr \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -G \
  -d "startDate=2024-10-01T00:00:00.000Z" \
  -d "endDate=2024-12-31T23:59:59.999Z"
```

**预期结果**: 返回Q4季度的MTTR数据，便于季度间对比分析

### 场景3: 查询设备月度MTTR趋势

**业务需求**: TPM主管需要按月查询设备MTTR，分析维护改进措施的效果

```bash
curl -X GET http://localhost:3000/v1/mdm/tpm/equipment-failures/by-equipment/123e4567-e89b-12d3-a456-426614174000/mttr \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -G \
  -d "startDate=2024-11-01T00:00:00.000Z" \
  -d "endDate=2024-11-30T23:59:59.999Z"
```

**预期结果**: 返回11月份的MTTR数据，用于月度报告和趋势分析

### 场景4: 查询新设备MTTR基线

**业务需求**: 新投产设备运行3个月后，需要建立MTTR基线数据作为后续比较基准

```bash
curl -X GET http://localhost:3000/v1/mdm/tpm/equipment-failures/by-equipment/456e7890-e89b-12d3-a456-426614174001/mttr \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -G \
  -d "startDate=2024-09-01T00:00:00.000Z" \
  -d "endDate=2024-11-30T23:59:59.999Z"
```

**预期结果**: 返回新设备3个月的MTTR基线数据

### 场景5: 无故障设备查询

**业务需求**: 查询运行良好的设备MTTR，验证其维护状况

```bash
curl -X GET http://localhost:3000/v1/mdm/tpm/equipment-failures/by-equipment/789e0123-e89b-12d3-a456-426614174002/mttr \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**预期结果**: 返回mttr为null的响应，表示该时间段内无完成修复的故障记录

---

## 附录

### MTTR计算逻辑

MTTR（平均修复时间）计算基于以下条件：
- 只统计已完成修复的故障记录（有repairStartTime和repairEndTime）
- 计算公式：MTTR = Σ(修复时间) / 故障次数
- 修复时间 = repairEndTime - repairStartTime
- 时间单位统一为小时，保留2位小数

### 时间参数说明

| 时间参数  | 格式要求         | 默认值   | 说明                                 |
| --------- | ---------------- | -------- | ------------------------------------ |
| startDate | ISO 8601日期时间 | 一年前   | 统计开始时间，包含边界值             |
| endDate   | ISO 8601日期时间 | 当前时间 | 统计结束时间，包含边界值             |
| 无参数    | N/A              | 默认一年 | 未提供任何时间参数时，统计近一年数据 |

### 数据有效性规则

- 故障记录必须有完整的修复时间记录
- 设备必须存在且未被逻辑删除
- 故障记录必须未被逻辑删除
- 修复时间必须为正数（结束时间晚于开始时间）

### 响应数据说明

- `mttr`字段为null表示指定时间段内无有效的修复记录
- 时间单位固定为小时（hours），便于标准化比较
- 统计时间范围采用闭区间，包含起止时间点的数据
- 设备信息来源于设备主表，确保数据一致性

### 相关常量

| 常量名                    | 值      | 说明                 |
| ------------------------- | ------- | -------------------- |
| DEFAULT_STATS_PERIOD_DAYS | 365     | 默认统计周期（天）   |
| MTTR_DECIMAL_PLACES       | 2       | MTTR数值保留小数位数 |
| TIME_UNIT                 | "hours" | 时间单位标识         |

---
