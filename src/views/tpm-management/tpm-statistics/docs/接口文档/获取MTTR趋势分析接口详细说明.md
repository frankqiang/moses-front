# 获取MTTR趋势分析接口详细说明

---

## 📋 目录

- [功能概述](#功能概述)
- [业务流程](#业务流程)
- [接口文档](#接口文档)
- [使用示例](#使用示例)
- [常见问题](#常见问题)
- [附录](#附录)

---

## 功能概述

### 所有功能

获取MTTR趋势分析（Get MTTR Trend Analysis）是设备TPM管理模块中TPM统计分析的核心功能之一，用于分析指定时间段内设备平均修复时间（MTTR - Mean Time To Repair）的变化趋势，以支持维修效率评估、资源优化配置和持续改进决策的业务场景。

该接口提供按时间段的MTTR趋势统计和按故障等级的MTTR对比分析，帮助管理者全面了解设备维修能力的改善情况，识别不同等级故障的处理效率差异，为维修资源配置、备件储备优化和维修流程改进提供数据支持。

### 关键特性

- ✅ **多维度时间分析**：支持按日/周/月/年四种时间粒度统计MTTR趋势，灵活适应不同管理需求
- ✅ **趋势变化跟踪**：提供各时间段的平均、最小、最大修复时间，全面展现MTTR变化趋势
- ✅ **等级对比分析**：按故障等级（I级-严重、II级-重大、III级-一般、IV级-轻微）统计平均MTTR，识别不同等级故障的处理效率差异
- ✅ **灵活筛选条件**：支持按设备ID、设备类型筛选，满足不同层级的分析需求
- ✅ **效率评估依据**：为维修团队效率评估、资源优化配置提供量化数据支持
- ✅ **统一响应格式**：遵循项目标准响应格式，确保前后端数据交互的一致性

---

### 使用前提

- ✅ 用户已登录且拥有 `mdm.tpm.statistics.view` 权限
- ✅ 系统中已有设备故障记录且包含修复时间信息（repairStartTime 和 repairCompletionTime）
- ✅ 查询时间范围设置合理（结束日期不能早于开始日期）
- ✅ 至少存在一条已修复完成的故障记录（有完整的修复时间数据）

### 不适用场景

- ❌ 查询未修复完成的故障统计 - 应使用"获取故障汇总统计"接口
- ❌ 查询设备整体健康状况 - 应使用"获取设备健康度评分"接口
- ❌ 实时监控设备故障状态 - 应使用TPM综合看板或设备故障列表接口

---

## 业务流程

### 整体流程图

```
┌─────────────────────┐
│  接收API请求        │
│  (startDate/endDate)│
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  参数验证           │
│  - 必填参数检查     │
│  - 日期格式验证     │
│  - 日期范围校验     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  权限验证           │
│  (mdm.tpm.statistics│
│   .view)            │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  构建查询条件       │
│  - 时间范围筛选     │
│  - 设备ID/类型筛选  │
│  - 修复完成状态筛选 │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  查询故障数据       │
│  - 关联设备表       │
│  - 计算修复时长     │
│  - 时间单位转换     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  趋势数据统计       │
│  - 按时间粒度分组   │
│  - 计算AVG/MIN/MAX  │
│  - 统计故障数量     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  等级数据统计       │
│  - 按故障等级分组   │
│  - 计算平均MTTR     │
│  - 统计故障数量     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  计算总体摘要       │
│  - 总故障数         │
│  - 总体平均MTTR     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  数据格式化         │
│  - 时间保留2位小数  │
│  - 日期ISO格式化    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  返回统一响应格式   │
│  (summary/trendData/│
│   levelStatistics)  │
└─────────────────────┘
```

### 详细步骤说明

#### 步骤1: 接收API请求
- 接收GET请求，提取查询参数
- 必填参数：startDate（开始日期）、endDate（结束日期）
- 可选参数：equipmentId（设备ID）、equipmentType（设备类型）、timePeriod（时间粒度）

#### 步骤2: 参数验证
- **必填参数检查**：验证 startDate 和 endDate 是否存在
- **日期格式验证**：确保日期符合 ISO 8601 格式（YYYY-MM-DD）
- **日期范围校验**：验证 endDate 不能早于 startDate
- **可选参数验证**：
  - equipmentId 必须为有效的 UUID 格式
  - equipmentType 必须为枚举值之一（退火炉/行车/自动料车/备料台）
  - timePeriod 必须为枚举值之一（日/周/月/年），默认为"月"

#### 步骤3: 权限验证
- 验证用户 JWT Token 有效性
- 检查用户是否具有 `mdm.tpm.statistics.view` 权限
- 权限验证失败返回 403 错误

#### 步骤4: 构建查询条件
- **时间范围筛选**：
  - 按故障发生时间（failureTime）筛选
  - 筛选范围：startDate <= failureTime <= endDate
- **设备筛选**（可选）：
  - 如果提供 equipmentId，按设备ID精确筛选
  - 如果提供 equipmentType，关联设备表按类型筛选
- **修复状态筛选**：
  - 仅统计有修复完成时间的故障记录
  - 过滤条件：repairCompletionTime IS NOT NULL AND repairStartTime IS NOT NULL
- **软删除过滤**：排除已软删除的记录（deletedAt IS NULL）

#### 步骤5: 查询故障数据
- **关联查询**：
  - 主表：EquipmentFailure（设备故障表）
  - 关联表：Equipment（设备表）- 用于设备类型筛选
- **计算修复时长**：
  - 修复时长（秒） = repairCompletionTime - repairStartTime
  - MTTR（小时） = 修复时长 / 3600
- **数据预处理**：
  - 过滤修复时长为负数或异常值的记录
  - 确保所有时间字段都为有效值

#### 步骤6: 趋势数据统计
- **按时间粒度分组**：
  - 日：DATE_TRUNC('day', failureTime)
  - 周：DATE_TRUNC('week', failureTime)
  - 月：DATE_TRUNC('month', failureTime)
  - 年：DATE_TRUNC('year', failureTime)
- **统计指标计算**：
  - 故障数量：COUNT(*)
  - 平均MTTR：AVG(修复时长/3600)
  - 最小MTTR：MIN(修复时长/3600)
  - 最大MTTR：MAX(修复时长/3600)
- **数据排序**：按时间段升序排列

#### 步骤7: 等级数据统计
- **按故障等级分组**：
  - I级-严重、II级-重大、III级-一般、IV级-轻微
- **统计指标计算**：
  - 该等级故障数量：COUNT(*)
  - 该等级平均MTTR：AVG(修复时长/3600)
- **数据排序**：按等级优先级排序（I级 > II级 > III级 > IV级）

#### 步骤8: 计算总体摘要
- **总故障数**：统计时间段内所有已修复故障的数量
- **总体平均MTTR**：
  - 计算所有故障的平均修复时间
  - 格式化为"X.XX小时"字符串
- **时间粒度**：记录使用的时间粒度设置

#### 步骤9: 数据格式化
- **时间精度控制**：
  - 所有MTTR值保留2位小数
  - 使用 ROUND 函数进行四舍五入
- **日期格式化**：
  - 时间段起始时间格式化为 ISO 8601 格式
  - 示例：2024-01-01T00:00:00.000Z
- **数值单位标注**：
  - 总体MTTR添加"小时"单位
  - 趋势数据和等级统计中的MTTR为数值型（小时）

#### 步骤10: 返回统一响应格式
- **成功响应**（HTTP 200）：
  - success: true
  - data: 包含 summary、trendData、levelStatistics
  - message: "获取MTTR趋势分析成功"
  - meta: 包含 timestamp、requestId、version
- **错误处理**：
  - 参数验证失败：返回 400 错误
  - 权限不足：返回 403 错误
  - 服务器错误：返回 500 错误，记录详细日志

---

## 接口文档

### 基本信息

**接口路径**: `GET /v1/mdm/tpm/statistics/mttr-trend`

**功能描述**: 分析指定时间段内设备平均修复时间（MTTR）的变化趋势，提供按时间段的趋势统计和按故障等级的对比分析，帮助评估维修能力改善情况和不同等级故障的处理效率。

**认证要求**: Bearer Token（JWT），需要 `mdm.tpm.statistics.view` 权限

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

### 查询参数

| 参数名        | 类型   | 必填 | 限制                              | 描述                   | 默认值 | 示例                                   |
| ------------- | ------ | ---- | --------------------------------- | ---------------------- | ------ | -------------------------------------- |
| startDate     | string | 是   | ISO日期格式（YYYY-MM-DD）         | 统计开始日期           | -      | "2024-01-01"                           |
| endDate       | string | 是   | ISO日期格式，不能早于开始日期     | 统计结束日期           | -      | "2024-03-31"                           |
| equipmentId   | string | 否   | UUID格式                          | 按设备ID筛选           | null   | "123e4567-e89b-12d3-a456-426614174000" |
| equipmentType | string | 否   | 枚举：退火炉/行车/自动料车/备料台 | 按设备类型筛选         | null   | "退火炉"                               |
| timePeriod    | string | 否   | 枚举：日/周/月/年                 | 时间粒度，用于数据分组 | "月"   | "月"                                   |

**参数说明**：

- **startDate**：统计的起始日期，按故障发生时间筛选，包含该日期
- **endDate**：统计的截止日期，按故障发生时间筛选，包含该日期
- **equipmentId**：指定设备的UUID，用于查询单个设备的MTTR趋势
- **equipmentType**：设备类型，用于查询特定类型设备的MTTR趋势
- **timePeriod**：时间粒度，决定趋势数据的分组方式
  - `日`：按天统计，适用于短期详细分析
  - `周`：按周统计，适用于周度趋势跟踪
  - `月`：按月统计（默认），适用于月度报告和对比
  - `年`：按年统计，适用于年度总结和长期趋势

### 请求示例

#### cURL 命令（按月统计退火炉MTTR趋势）

```bash
curl -X GET "http://localhost:3000/v1/mdm/tpm/statistics/mttr-trend?startDate=2024-01-01&endDate=2024-03-31&equipmentType=退火炉&timePeriod=月" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### cURL 命令（按周统计特定设备MTTR趋势）

```bash
curl -X GET "http://localhost:3000/v1/mdm/tpm/statistics/mttr-trend?startDate=2024-01-01&endDate=2024-03-31&equipmentId=123e4567-e89b-12d3-a456-426614174000&timePeriod=周" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### cURL 命令（按日统计所有设备MTTR趋势）

```bash
curl -X GET "http://localhost:3000/v1/mdm/tpm/statistics/mttr-trend?startDate=2024-03-01&endDate=2024-03-31&timePeriod=日" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 成功响应

**HTTP 状态码**: `200 OK`

**响应结构**:

```json
{
  "success": true,
  "data": {
    "summary": {
      "totalFailures": 42,
      "overallMTTR": "8.35小时",
      "timePeriod": "月"
    },
    "trendData": [
      {
        "period": "2024-01-01T00:00:00.000Z",
        "failureCount": 15,
        "avgMTTR": "9.20",
        "minMTTR": "2.50",
        "maxMTTR": "24.00"
      },
      {
        "period": "2024-02-01T00:00:00.000Z",
        "failureCount": 12,
        "avgMTTR": "7.80",
        "minMTTR": "1.80",
        "maxMTTR": "18.50"
      },
      {
        "period": "2024-03-01T00:00:00.000Z",
        "failureCount": 15,
        "avgMTTR": "8.10",
        "minMTTR": "2.00",
        "maxMTTR": "20.00"
      }
    ],
    "levelStatistics": [
      {
        "failureLevel": "I级-严重",
        "failureCount": 5,
        "avgMTTR": "18.50"
      },
      {
        "failureLevel": "II级-重大",
        "failureCount": 12,
        "avgMTTR": "10.20"
      },
      {
        "failureLevel": "III级-一般",
        "failureCount": 18,
        "avgMTTR": "6.30"
      },
      {
        "failureLevel": "IV级-轻微",
        "failureCount": 7,
        "avgMTTR": "3.50"
      }
    ]
  },
  "message": "获取MTTR趋势分析成功",
  "meta": {
    "timestamp": "2024-10-15T10:30:00.000Z",
    "requestId": "req-1234567890-abcdef",
    "version": "v1"
  }
}
```

### 响应字段说明

#### 主数据字段（data 对象）

| 字段名          | 类型   | 说明                         | 示例值 |
| --------------- | ------ | ---------------------------- | ------ |
| summary         | object | 总体MTTR统计摘要             | {...}  |
| trendData       | array  | MTTR趋势数据（按时间段统计） | [...]  |
| levelStatistics | array  | 按故障等级的MTTR统计         | [...]  |

#### 总体摘要字段（summary 对象）

| 字段名        | 类型    | 说明                     | 示例值     |
| ------------- | ------- | ------------------------ | ---------- |
| totalFailures | integer | 统计期内已修复的故障总数 | 42         |
| overallMTTR   | string  | 统计期内总体平均修复时间 | "8.35小时" |
| timePeriod    | string  | 时间粒度（日/周/月/年）  | "月"       |

**字段说明**：
- `totalFailures`：仅统计有完整修复时间的故障记录数量
- `overallMTTR`：所有故障的平均修复时间，格式为"X.XX小时"，保留2位小数
- `timePeriod`：当前使用的时间粒度，与查询参数中的 timePeriod 一致

#### 趋势数据字段（trendData 数组中的对象）

| 字段名       | 类型    | 说明                         | 示例值                     |
| ------------ | ------- | ---------------------------- | -------------------------- |
| period       | string  | 时间段起始时间（ISO格式）    | "2024-01-01T00:00:00.000Z" |
| failureCount | integer | 该时间段已修复故障数         | 15                         |
| avgMTTR      | string  | 该时间段平均修复时间（小时） | "9.20"                     |
| minMTTR      | string  | 该时间段最短修复时间（小时） | "2.50"                     |
| maxMTTR      | string  | 该时间段最长修复时间（小时） | "24.00"                    |

**字段说明**：
- `period`：时间段的起始时间，根据 timePeriod 参数决定粒度
  - 日粒度：当天的 00:00:00
  - 周粒度：该周第一天的 00:00:00
  - 月粒度：该月1号的 00:00:00
  - 年粒度：该年1月1号的 00:00:00
- `failureCount`：该时间段内有完整修复时间的故障数量
- `avgMTTR`：该时间段内所有故障的平均修复时间，保留2位小数
- `minMTTR`：该时间段内最短的修复时间，用于识别快速修复案例
- `maxMTTR`：该时间段内最长的修复时间，用于识别问题修复案例

**数据排序**：按时间段升序排列（从早到晚）

#### 等级统计字段（levelStatistics 数组中的对象）

| 字段名       | 类型    | 说明                       | 示例值     |
| ------------ | ------- | -------------------------- | ---------- |
| failureLevel | string  | 故障等级                   | "I级-严重" |
| failureCount | integer | 该等级故障数量             | 5          |
| avgMTTR      | string  | 该等级平均修复时间（小时） | "18.50"    |

**字段说明**：
- `failureLevel`：故障等级，包含中文描述
  - I级-严重：影响生产，需立即处理
  - II级-重大：影响较大，需优先处理
  - III级-一般：有一定影响，按计划处理
  - IV级-轻微：影响较小，可延后处理
- `failureCount`：该等级的故障数量
- `avgMTTR`：该等级所有故障的平均修复时间，保留2位小数

**数据排序**：按等级优先级排序（I级 > II级 > III级 > IV级）

#### 响应元信息（meta 对象）

| 字段名    | 类型   | 说明                       | 示例值                     |
| --------- | ------ | -------------------------- | -------------------------- |
| timestamp | string | 响应时间戳（ISO 8601格式） | "2024-01-21T09:00:00.000Z" |
| requestId | string | 请求追踪ID                 | "req-1234567890-abcdef"    |
| version   | string | API版本号                  | "v1"                       |

### 错误响应

| HTTP状态码 | 错误码           | 错误消息                 | 说明                            | 处理建议                       |
| ---------- | ---------------- | ------------------------ | ------------------------------- | ------------------------------ |
| 400        | VALIDATION_ERROR | 请求参数验证失败         | 请求参数不符合验证规则          | 检查请求参数格式和必填字段     |
| 400        | VALIDATION_ERROR | 开始日期为必填项         | 缺少startDate参数               | 提供startDate参数              |
| 400        | VALIDATION_ERROR | 结束日期为必填项         | 缺少endDate参数                 | 提供endDate参数                |
| 400        | VALIDATION_ERROR | 结束日期不能早于开始日期 | 日期范围设置错误                | 确保endDate >= startDate       |
| 400        | VALIDATION_ERROR | 设备ID格式不正确         | equipmentId不是有效的UUID       | 检查equipmentId格式            |
| 400        | VALIDATION_ERROR | 设备类型不在允许范围内   | equipmentType不是有效的枚举值   | 使用正确的设备类型枚举值       |
| 400        | VALIDATION_ERROR | 时间粒度不在允许范围内   | timePeriod不是有效的枚举值      | 使用日/周/月/年之一            |
| 401        | UNAUTHORIZED     | 未授权，Token无效或过期  | 未提供认证Token或Token已失效    | 重新登录获取有效Token          |
| 403        | FORBIDDEN        | 无权限执行此操作         | 当前用户没有查看统计的权限      | 联系管理员分配相应权限         |
| 404        | NOT_FOUND        | 设备不存在               | 指定的equipmentId找不到对应设备 | 检查设备ID是否正确             |
| 500        | STATISTICS_001   | 统计查询失败             | 服务器内部错误，操作执行失败    | 查看日志定位问题或联系技术支持 |

### 错误响应示例

#### 参数验证失败（缺少必填参数）

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "开始日期为必填项",
    "details": {
      "field": "startDate",
      "traceId": "req-1234567890-abcdef"
    }
  },
  "meta": {
    "timestamp": "2024-01-21T09:00:00.000Z",
    "requestId": "req-1234567890-abcdef",
    "version": "v1"
  }
}
```

#### 日期范围错误

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "结束日期不能早于开始日期",
    "details": {
      "field": "endDate",
      "value": "2023-12-31",
      "startDate": "2024-01-01",
      "traceId": "req-1234567890-abcdef"
    }
  },
  "meta": {
    "timestamp": "2024-01-21T09:00:00.000Z",
    "requestId": "req-1234567890-abcdef",
    "version": "v1"
  }
}
```

#### 权限不足

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "无权限执行此操作",
    "details": {
      "requiredPermission": "mdm.tpm.statistics.view",
      "traceId": "req-1234567890-abcdef"
    }
  },
  "meta": {
    "timestamp": "2024-01-21T09:00:00.000Z",
    "requestId": "req-1234567890-abcdef",
    "version": "v1"
  }
}
```

#### 服务器内部错误

```json
{
  "success": false,
  "error": {
    "code": "STATISTICS_001",
    "message": "统计查询失败",
    "details": {
      "traceId": "req-1234567890-abcdef"
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

### 场景1: 评估第一季度退火炉维修效率

**业务需求**: 管理层需要评估2024年第一季度退火炉设备的维修效率改善情况，按月查看MTTR变化趋势。

**请求示例**:

```bash
curl -X GET "http://localhost:3000/v1/mdm/tpm/statistics/mttr-trend?startDate=2024-01-01&endDate=2024-03-31&equipmentType=退火炉&timePeriod=月" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**分析要点**:
- 查看每月平均MTTR的变化趋势，判断维修效率是否提升
- 对比不同月份的最大MTTR，识别是否存在异常的长时间故障
- 分析各故障等级的平均MTTR，评估对不同等级故障的响应能力
- 如果MTTR呈下降趋势，说明维修能力在提升
- 如果某等级MTTR偏高，可能需要针对性培训或资源投入

### 场景2: 对比设备类型的维修响应速度

**业务需求**: 设备管理部门需要对比不同设备类型（退火炉、行车）的维修响应速度，优化维修资源配置。

**步骤1 - 查询退火炉MTTR**:

```bash
curl -X GET "http://localhost:3000/v1/mdm/tpm/statistics/mttr-trend?startDate=2024-01-01&endDate=2024-06-30&equipmentType=退火炉&timePeriod=月" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**步骤2 - 查询行车MTTR**:

```bash
curl -X GET "http://localhost:3000/v1/mdm/tpm/statistics/mttr-trend?startDate=2024-01-01&endDate=2024-06-30&equipmentType=行车&timePeriod=月" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**对比分析**:
- 对比两种设备类型的总体平均MTTR
- 分析各时间段的MTTR趋势差异
- 识别MTTR较高的设备类型，可能需要增加备件储备或专业维修人员
- 评估不同设备类型在各故障等级的修复效率差异

### 场景3: 监控特定高价值设备的维修效率

**业务需求**: 针对某台关键退火炉设备（设备ID：123e4567-e89b-12d3-a456-426614174000），按周跟踪其维修效率变化。

**请求示例**:

```bash
curl -X GET "http://localhost:3000/v1/mdm/tpm/statistics/mttr-trend?startDate=2024-03-01&endDate=2024-03-31&equipmentId=123e4567-e89b-12d3-a456-426614174000&timePeriod=周" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**应用场景**:
- 跟踪关键设备的每周维修效率
- 及时发现MTTR异常上升，预警维修能力问题
- 评估设备状态是否恶化（MTTR持续上升可能表示设备老化）
- 为设备大修或更换决策提供数据支持

### 场景4: 分析年度维修能力改善情况

**业务需求**: 年终总结时，需要分析全年各设备类型的维修能力改善情况，按季度展现趋势。

**请求示例**:

```bash
curl -X GET "http://localhost:3000/v1/mdm/tpm/statistics/mttr-trend?startDate=2023-01-01&endDate=2023-12-31&timePeriod=月" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**分析维度**:
- 查看全年MTTR趋势，评估维修能力持续改进效果
- 对比各季度的平均MTTR，识别季节性或周期性影响
- 分析各故障等级的MTTR变化，评估不同等级故障的处理能力提升
- 识别最大MTTR出现的时间段，分析原因并制定改进措施
- 为下一年度维修资源规划和目标设定提供依据

### 场景5: 应急响应能力评估

**业务需求**: 评估维修团队对严重故障（I级-严重）的应急响应能力，分析近期MTTR变化。

**请求示例**:

```bash
curl -X GET "http://localhost:3000/v1/mdm/tpm/statistics/mttr-trend?startDate=2024-03-01&endDate=2024-03-31&timePeriod=日" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**关注重点**:
- 查看 `levelStatistics` 中"I级-严重"的平均MTTR
- 对比不同等级故障的MTTR差异，评估优先级处理机制是否有效
- 如果I级故障的平均MTTR仍然较高，需要优化应急响应流程
- 分析每日MTTR波动，识别响应能力的稳定性
- 为应急预案优化和培训计划制定提供数据支持

---

## 常见问题

### Q1: 为什么某些时间段没有数据？

**原因**：该时间段内没有已修复完成的故障记录，或所有故障记录缺少完整的修复时间信息。

**解决方案**：
- 确认该时间段内是否有设备故障发生
- 检查故障记录是否填写了 `repairStartTime` 和 `repairCompletionTime`
- 确认故障状态是否已更新为"已修复"或类似状态
- 如果是新系统上线，历史数据可能不完整，属于正常现象

### Q2: 总体平均MTTR与各时间段平均值加总不一致？

**原因**：总体平均MTTR是基于所有故障记录计算的全局平均值，而不是各时间段平均值的简单平均。

**计算逻辑**：
- **总体平均MTTR** = 所有故障的修复时长总和 / 故障总数
- **时间段平均MTTR** = 该时间段故障的修复时长总和 / 该时间段故障数

**示例说明**：
- 1月：15个故障，平均MTTR = 9.20小时
- 2月：12个故障，平均MTTR = 7.80小时
- 3月：15个故障，平均MTTR = 8.10小时
- **总体平均MTTR** = (15×9.20 + 12×7.80 + 15×8.10) / (15+12+15) ≈ 8.42小时
- **不等于** (9.20 + 7.80 + 8.10) / 3 = 8.37小时

### Q3: 如何解读不同故障等级的MTTR差异？

**正常情况**：I级-严重 > II级-重大 > III级-一般 > IV级-轻微

**原因分析**：
- **I级-严重**：通常涉及核心部件故障或复杂问题，需要更长的诊断和修复时间
- **II级-重大**：问题较为复杂，但不如I级严重，修复时间适中
- **III级-一般**：常见故障，维修人员经验丰富，修复较快
- **IV级-轻微**：简单问题，快速处理即可

**异常情况处理**：
- 如果低等级故障MTTR反而更高，可能存在以下问题：
  - 故障等级评定不准确，需要重新评估故障分级标准
  - 低等级故障未被优先处理，导致积压
  - 维修资源分配不合理，低等级故障缺少关注
- 建议定期审查故障分级标准和维修优先级策略

### Q4: 最大MTTR异常高，如何处理？

**原因分析**：
- 零部件缺货，等待采购时间过长
- 故障诊断困难，需要外部专家支持
- 多次修复尝试失败，反复返工
- 故障记录填写错误（如修复完成时间未及时更新）

**处理建议**：
1. **数据核查**：检查最大MTTR对应的故障记录，确认数据准确性
2. **根因分析**：对异常长时间故障进行根因分析
3. **流程优化**：
   - 优化备件采购和储备策略
   - 建立技术支持快速响应机制
   - 加强维修人员培训
4. **预防措施**：根据分析结果制定预防措施，避免类似情况重复发生

### Q5: 如何利用MTTR数据优化维修资源配置？

**数据分析维度**：
1. **时间趋势分析**：
   - MTTR下降 → 维修能力提升，资源配置合理
   - MTTR上升 → 需要增加资源或优化流程
   - MTTR波动大 → 资源配置不稳定，需要标准化管理

2. **等级对比分析**：
   - 高等级故障MTTR过高 → 增加专业维修人员或备件储备
   - 低等级故障MTTR偏高 → 优化日常维护流程或培训

3. **设备类型对比**：
   - 某类设备MTTR明显高于其他 → 针对性配置专业维修资源
   - 多类设备MTTR均衡 → 资源可以灵活调配

**优化建议**：
- **人员配置**：根据MTTR和故障数量评估维修人员工作负荷
- **备件储备**：分析高MTTR故障的备件需求，优化库存结构
- **培训计划**：针对MTTR偏高的故障类型加强培训
- **流程改进**：识别MTTR瓶颈环节，优化维修流程

### Q6: MTTR与MTBF的关系，如何综合分析？

**指标定义**：
- **MTTR（Mean Time To Repair）**：平均修复时间，反映维修效率
- **MTBF（Mean Time Between Failures）**：平均故障间隔时间，反映设备可靠性

**综合分析**：
- **理想状态**：高MTBF（故障少） + 低MTTR（修得快） = 高设备可用性
- **需改进状态**：
  - 低MTBF + 高MTTR → 设备可靠性和维修效率都需要改进（优先级最高）
  - 低MTBF + 低MTTR → 虽然修得快，但故障频繁，需要改进设备可靠性
  - 高MTBF + 高MTTR → 虽然故障少，但一旦发生修复慢，需要优化维修能力

**使用建议**：
- 结合使用"获取MTTR趋势分析"和"获取MTBF趋势分析"接口
- 交叉分析设备可靠性和维修效率
- 制定综合改进策略，平衡预防性维护和修复能力提升

### Q7: 如何设定MTTR的改进目标？

**目标设定方法**：

1. **行业对标**：
   - 参考同行业类似设备的MTTR基准值
   - 目标：达到或超过行业平均水平

2. **历史对比**：
   - 分析本企业历史最佳MTTR水平
   - 目标：在当前基础上降低10-20%

3. **分级设定**：
   - 针对不同故障等级设定不同目标
   - 示例目标：
     - I级-严重：≤ 12小时
     - II级-重大：≤ 8小时
     - III级-一般：≤ 4小时
     - IV级-轻微：≤ 2小时

4. **设备差异化**：
   - 关键设备目标更严格
   - 辅助设备目标可适当放宽

**目标达成跟踪**：
- 按月统计实际MTTR与目标的对比
- 分析未达成原因，制定改进措施
- 定期回顾和调整目标设定

---

## 附录

### 故障等级定义

| 等级代码 | 等级名称   | 严重程度 | 影响范围                     | 响应要求   | 典型MTTR范围 |
| -------- | ---------- | -------- | ---------------------------- | ---------- | ------------ |
| I        | I级-严重   | 最高     | 直接停产，影响关键工艺       | 立即响应   | 12-24小时    |
| II       | II级-重大  | 高       | 显著影响生产效率或产品质量   | 优先处理   | 6-12小时     |
| III      | III级-一般 | 中       | 对生产有一定影响，可短期容忍 | 按计划处理 | 2-6小时      |
| IV       | IV级-轻微  | 低       | 影响较小，不影响正常生产     | 常规处理   | 0.5-2小时    |

**说明**：
- 故障等级由设备管理人员根据实际影响程度评定
- MTTR范围仅供参考，实际值受设备类型、故障复杂度、备件可用性等多因素影响
- 等级评定应考虑生产计划、设备重要性、备用方案可行性等因素

### 设备类型枚举

| 设备类型 | 编码     | 说明               | 典型MTTR特点         |
| -------- | -------- | ------------------ | -------------------- |
| 退火炉   | 退火炉   | 铝箔退火处理设备   | MTTR较长，故障复杂   |
| 行车     | 行车     | 物料搬运吊装设备   | MTTR中等，故障较常见 |
| 自动料车 | 自动料车 | 自动化物料运输设备 | MTTR较短，故障易诊断 |
| 备料台   | 备料台   | 物料准备和暂存设备 | MTTR最短，结构简单   |

### 时间粒度说明

| 粒度代码 | 中文名称 | SQL实现                            | 适用场景                   | 数据量特点 |
| -------- | -------- | ---------------------------------- | -------------------------- | ---------- |
| 日       | 日       | `DATE_TRUNC('day', failureTime)`   | 短期详细分析，应急响应跟踪 | 数据点多   |
| 周       | 周       | `DATE_TRUNC('week', failureTime)`  | 周度趋势跟踪，工作周对比   | 数据点适中 |
| 月       | 月       | `DATE_TRUNC('month', failureTime)` | 月度报告，常规管理分析     | 数据点少   |
| 年       | 年       | `DATE_TRUNC('year', failureTime)`  | 年度总结，长期趋势分析     | 数据点最少 |

**选择建议**：
- **日常管理**：使用"月"粒度，平衡详细程度和趋势可见性
- **问题诊断**：使用"日"或"周"粒度，精确定位问题发生时间
- **年度总结**：使用"月"粒度，展现全年趋势
- **长期对比**：使用"年"粒度，分析多年演变

### MTTR计算公式

**基本公式**：

```
MTTR（小时） = (repairCompletionTime - repairStartTime) / 3600秒
```

**统计公式**：

- **时间段平均MTTR** = SUM(该时间段所有故障的修复时长) / 该时间段故障数
- **等级平均MTTR** = SUM(该等级所有故障的修复时长) / 该等级故障数
- **总体平均MTTR** = SUM(所有故障的修复时长) / 总故障数

**计算要求**：
- 仅统计有完整修复时间的故障记录（repairStartTime 和 repairCompletionTime 都不为空）
- 修复时长为正值（repairCompletionTime > repairStartTime）
- 所有MTTR值保留2位小数
- 过滤异常值（如修复时长超过合理范围的记录）

**示例计算**：

假设某月有3条故障记录：
1. 故障A：修复时长 = 10800秒（3小时）
2. 故障B：修复时长 = 21600秒（6小时）
3. 故障C：修复时长 = 7200秒（2小时）

```
平均MTTR = (10800 + 21600 + 7200) / 3 / 3600 = 3.67小时
最小MTTR = 7200 / 3600 = 2.00小时
最大MTTR = 21600 / 3600 = 6.00小时
```

### 相关接口

| 接口名称           | 接口路径                                        | 说明                         | 关联关系     |
| ------------------ | ----------------------------------------------- | ---------------------------- | ------------ |
| 获取故障汇总统计   | GET /v1/mdm/tpm/statistics/failure-summary      | 多维度故障统计，含数量和类型 | 互补使用     |
| 获取MTBF趋势分析   | GET /v1/mdm/tpm/statistics/mtbf-trend           | 分析平均故障间隔时间趋势     | 配合分析     |
| 获取设备健康度评分 | GET /v1/mdm/tpm/statistics/equipment-health     | 基于MTTR等数据评估设备健康度 | 关联分析     |
| 获取维护工作量统计 | GET /v1/mdm/tpm/statistics/maintenance-workload | 分析维修人员工作负荷         | 资源优化依据 |
| 获取TPM综合看板    | GET /v1/mdm/tpm/dashboard                       | 提供包含MTTR在内的综合看板   | 整体概览     |
| 获取设备故障列表   | GET /v1/mdm/tpm/equipment-failures              | 查询故障明细记录             | 钻取查询     |
| 获取设备故障详情   | GET /v1/mdm/tpm/equipment-failures/:id          | 查看单个故障的详细信息       | 钻取查询     |

**使用建议**：
- **全面分析**：结合"获取故障汇总统计"和"获取MTTR趋势分析"，全面了解故障情况和维修效率
- **可靠性评估**：结合"获取MTBF趋势分析"和"获取MTTR趋势分析"，综合评估设备可靠性和可维护性
- **健康度评估**：使用"获取设备健康度评分"接口，基于MTTR等多维度指标评估设备整体健康状况
- **资源优化**：结合"获取维护工作量统计"，评估维修人员负荷与MTTR的关系，优化资源配置
- **明细钻取**：当发现异常MTTR时，使用"获取设备故障列表"和"获取设备故障详情"接口钻取查看具体故障记录

### 数据质量要求

为确保MTTR统计分析的准确性，设备故障记录需满足以下数据质量要求：

| 数据项               | 质量要求                     | 影响说明                 |
| -------------------- | ---------------------------- | ------------------------ |
| repairStartTime      | 必填，准确记录开始维修的时间 | 缺失则无法计算MTTR       |
| repairCompletionTime | 必填，准确记录修复完成的时间 | 缺失则无法计算MTTR       |
| failureLevel         | 必填，准确评定故障等级       | 影响等级统计的准确性     |
| equipmentId          | 必填，关联正确的设备         | 影响按设备筛选的准确性   |
| failureTime          | 必填，准确记录故障发生时间   | 影响时间范围筛选的准确性 |

**数据录入建议**：
- 维修开始时立即填写 `repairStartTime`
- 维修完成后立即填写 `repairCompletionTime`
- 避免批量补录导致时间记录不准确
- 定期审查异常修复时长的记录（如MTTR > 48小时），确认数据准确性

---
