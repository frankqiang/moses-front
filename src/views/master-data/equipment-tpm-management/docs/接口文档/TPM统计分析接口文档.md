# Moses API TPM统计分析模块接口文档

## 概述

本文档详细说明了 Moses API TPM统计分析模块的所有接口，包括请求方法、路径、参数、请求和响应数据结构、功能描述、错误码和返回示例。**本文档严格基于实际代码实现编写**，确保前端开发人员能够准确对接。

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

> **权限点映射**：
> - `mdm.tpm.statistics.view`：查看TPM统计数据（所有统计分析接口均需要此权限）
>
> **注意事项**：所有接口都需要登录认证，通过 JWT Bearer Token 验证身份。

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

## TPM统计分析业务概述

TPM统计分析模块提供设备维护管理的全方位数据分析能力，帮助管理者了解设备状态、维护效率、故障趋势、备件消耗等关键指标，支持数据驱动的决策。

### 核心功能

1. **维护计划执行率统计**：分析维护计划的完成情况，评估维护管理效率
2. **故障汇总统计**：多维度统计故障数据，识别故障模式和高风险设备
3. **MTTR趋势分析**：跟踪平均修复时间变化，评估维修能力改善
4. **备件消耗分析**：分析备件使用情况，优化备件库存管理
5. **TPM综合看板**：提供整体TPM管理状况的实时视图
6. **设备健康度评分**：基于多维度指标评估设备健康状况
7. **维护工作量统计**：分析维护人员工作负荷，优化资源分配

## TPM统计分析接口详细说明

### 1. 获取维护计划执行率统计

**接口路径**: `GET /v1/mdm/tpm/statistics/maintenance-plan-rate`

**功能描述**: 统计指定时间段内维护计划的执行率，支持按设备和时间粒度筛选。该接口分析维护任务的完成情况，提供总体执行率和按时间段的详细统计，帮助管理者评估维护管理效率。

**认证要求**: 需要 Bearer Token

**权限要求**: `mdm.tpm.statistics.view`

**请求头**:

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**查询参数**:

| 参数名        | 类型   | 必填 | 限制                              | 描述                   | 示例                                 |
| ------------- | ------ | ---- | --------------------------------- | ---------------------- | ------------------------------------ |
| startDate     | string | 是   | ISO日期格式                       | 开始日期               | 2024-01-01                           |
| endDate       | string | 是   | ISO日期格式，不能早于开始日期     | 结束日期               | 2024-03-31                           |
| equipmentId   | string | 否   | UUID格式                          | 设备ID筛选             | 123e4567-e89b-12d3-a456-426614174000 |
| equipmentType | string | 否   | 枚举：退火炉/行车/自动料车/备料台 | 设备类型筛选           | 退火炉                               |
| timePeriod    | string | 否   | 枚举：日/周/月/年，默认：月       | 时间粒度，用于数据分组 | 月                                   |

**请求示例**:

```bash
curl -X GET "http://localhost:3000/v1/mdm/tpm/statistics/maintenance-plan-rate?startDate=2024-01-01&endDate=2024-03-31&equipmentType=退火炉&timePeriod=月" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**成功响应** (HTTP 200):

```json
{
  "success": true,
  "data": {
    "summary": {
      "totalTasks": 120,
      "completedTasks": 108,
      "overallExecutionRate": "90.00%"
    },
    "details": [
      {
        "period": "2024-01-01T00:00:00.000Z",
        "totalTasks": 40,
        "completedTasks": 36,
        "executionRate": "90.00"
      },
      {
        "period": "2024-02-01T00:00:00.000Z",
        "totalTasks": 40,
        "completedTasks": 38,
        "executionRate": "95.00"
      },
      {
        "period": "2024-03-01T00:00:00.000Z",
        "totalTasks": 40,
        "completedTasks": 34,
        "executionRate": "85.00"
      }
    ],
    "timePeriod": "月"
  },
  "message": "获取维护计划执行率统计成功",
  "meta": {
    "timestamp": "2024-10-15T10:30:00.000Z",
    "requestId": "req-1234567890-abcdef",
    "version": "v1"
  }
}
```

**响应字段说明**:

| 字段名                       | 类型    | 描述                        | 示例                       |
| ---------------------------- | ------- | --------------------------- | -------------------------- |
| summary                      | object  | 总体统计摘要                | -                          |
| summary.totalTasks           | integer | 统计期内总任务数            | 120                        |
| summary.completedTasks       | integer | 统计期内已完成任务数        | 108                        |
| summary.overallExecutionRate | string  | 总体执行率（百分比）        | "90.00%"                   |
| details                      | array   | 按时间段的详细统计          | -                          |
| details[].period             | string  | 时间段起始时间（ISO格式）   | "2024-01-01T00:00:00.000Z" |
| details[].totalTasks         | integer | 该时间段总任务数            | 40                         |
| details[].completedTasks     | integer | 该时间段已完成任务数        | 36                         |
| details[].executionRate      | string  | 该时间段执行率（不带%符号） | "90.00"                    |
| timePeriod                   | string  | 时间粒度                    | "月"                       |

**错误响应**:

| HTTP状态码 | 错误码           | 错误消息                 | 说明                         | 处理建议                       |
| ---------- | ---------------- | ------------------------ | ---------------------------- | ------------------------------ |
| 400        | VALIDATION_ERROR | 请求参数验证失败         | 请求参数不符合验证规则       | 检查请求参数格式和必填字段     |
| 400        | VALIDATION_ERROR | 开始日期为必填项         | 缺少startDate参数            | 提供startDate参数              |
| 400        | VALIDATION_ERROR | 结束日期为必填项         | 缺少endDate参数              | 提供endDate参数                |
| 400        | VALIDATION_ERROR | 结束日期不能早于开始日期 | 日期范围设置错误             | 确保endDate >= startDate       |
| 401        | UNAUTHORIZED     | 未授权，Token无效或过期  | 未提供认证Token或Token已失效 | 重新登录获取有效Token          |
| 403        | FORBIDDEN        | 无权限执行此操作         | 当前用户没有查看统计的权限   | 联系管理员分配相应权限         |
| 500        | STATISTICS_001   | 统计查询失败             | 服务器内部错误，操作执行失败 | 查看日志定位问题或联系技术支持 |

---

### 2. 获取故障汇总统计

**接口路径**: `GET /v1/mdm/tpm/statistics/failure-summary`

**功能描述**: 统计指定时间段内的故障汇总信息，支持按设备、故障类型、时间粒度筛选。该接口提供多维度的故障数据分析，包括按时间段、按故障类型、按设备的统计，帮助识别故障模式和高风险设备。

**认证要求**: 需要 Bearer Token

**权限要求**: `mdm.tpm.statistics.view`

**请求头**:

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**查询参数**:

| 参数名        | 类型   | 必填 | 限制                              | 描述                   | 示例                                 |
| ------------- | ------ | ---- | --------------------------------- | ---------------------- | ------------------------------------ |
| startDate     | string | 是   | ISO日期格式                       | 开始日期               | 2024-01-01                           |
| endDate       | string | 是   | ISO日期格式，不能早于开始日期     | 结束日期               | 2024-03-31                           |
| equipmentId   | string | 否   | UUID格式                          | 设备ID筛选             | 123e4567-e89b-12d3-a456-426614174000 |
| equipmentType | string | 否   | 枚举：退火炉/行车/自动料车/备料台 | 设备类型筛选           | 退火炉                               |
| failureType   | string | 否   | 枚举：机械/电气/液压/控制/其他    | 故障类型筛选           | 电气                                 |
| timePeriod    | string | 否   | 枚举：日/周/月/年，默认：月       | 时间粒度，用于数据分组 | 月                                   |

**请求示例**:

```bash
curl -X GET "http://localhost:3000/v1/mdm/tpm/statistics/failure-summary?startDate=2024-01-01&endDate=2024-03-31&equipmentType=退火炉&timePeriod=月" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**成功响应** (HTTP 200):

```json
{
  "success": true,
  "data": {
    "summary": {
      "totalFailures": 45,
      "severeFailures": 5,
      "timePeriod": "月"
    },
    "timeStatistics": [
      {
        "period": "2024-01-01T00:00:00.000Z",
        "failureCount": 15,
        "severeCounts": 2,
        "majorCounts": 4,
        "normalCounts": 6,
        "minorCounts": 3
      },
      {
        "period": "2024-02-01T00:00:00.000Z",
        "failureCount": 12,
        "severeCounts": 1,
        "majorCounts": 3,
        "normalCounts": 5,
        "minorCounts": 3
      },
      {
        "period": "2024-03-01T00:00:00.000Z",
        "failureCount": 18,
        "severeCounts": 2,
        "majorCounts": 5,
        "normalCounts": 7,
        "minorCounts": 4
      }
    ],
    "typeStatistics": [
      {
        "failureType": "电气",
        "failureCount": 18
      },
      {
        "failureType": "机械",
        "failureCount": 15
      },
      {
        "failureType": "控制",
        "failureCount": 8
      },
      {
        "failureType": "液压",
        "failureCount": 4
      }
    ],
    "equipmentStatistics": [
      {
        "equipmentCode": "AF-001",
        "equipmentName": "1号退火炉",
        "failureCount": 12,
        "avgMTTR": "8.50"
      },
      {
        "equipmentCode": "AF-002",
        "equipmentName": "2号退火炉",
        "failureCount": 10,
        "avgMTTR": "7.25"
      }
    ]
  },
  "message": "获取故障汇总统计成功",
  "meta": {
    "timestamp": "2024-10-15T10:30:00.000Z",
    "requestId": "req-1234567890-abcdef",
    "version": "v1"
  }
}
```

**响应字段说明**:

| 字段名                              | 类型    | 描述                           | 示例                       |
| ----------------------------------- | ------- | ------------------------------ | -------------------------- |
| summary                             | object  | 总体故障统计摘要               | -                          |
| summary.totalFailures               | integer | 统计期内总故障数               | 45                         |
| summary.severeFailures              | integer | 统计期内严重故障数（I级）      | 5                          |
| summary.timePeriod                  | string  | 时间粒度                       | "月"                       |
| timeStatistics                      | array   | 按时间段的故障统计             | -                          |
| timeStatistics[].period             | string  | 时间段起始时间（ISO格式）      | "2024-01-01T00:00:00.000Z" |
| timeStatistics[].failureCount       | integer | 该时间段故障总数               | 15                         |
| timeStatistics[].severeCounts       | integer | 该时间段I级严重故障数          | 2                          |
| timeStatistics[].majorCounts        | integer | 该时间段II级重大故障数         | 4                          |
| timeStatistics[].normalCounts       | integer | 该时间段III级一般故障数        | 6                          |
| timeStatistics[].minorCounts        | integer | 该时间段IV级轻微故障数         | 3                          |
| typeStatistics                      | array   | 按故障类型统计                 | -                          |
| typeStatistics[].failureType        | string  | 故障类型                       | "电气"                     |
| typeStatistics[].failureCount       | integer | 该类型故障数量                 | 18                         |
| equipmentStatistics                 | array   | 按设备统计（前10个故障最多的） | -                          |
| equipmentStatistics[].equipmentCode | string  | 设备编码                       | "AF-001"                   |
| equipmentStatistics[].equipmentName | string  | 设备名称                       | "1号退火炉"                |
| equipmentStatistics[].failureCount  | integer | 该设备故障数量                 | 12                         |
| equipmentStatistics[].avgMTTR       | string  | 该设备平均修复时间（小时）     | "8.50"                     |

**错误响应**:

| HTTP状态码 | 错误码           | 错误消息                 | 说明                         | 处理建议                       |
| ---------- | ---------------- | ------------------------ | ---------------------------- | ------------------------------ |
| 400        | VALIDATION_ERROR | 请求参数验证失败         | 请求参数不符合验证规则       | 检查请求参数格式和必填字段     |
| 400        | VALIDATION_ERROR | 开始日期为必填项         | 缺少startDate参数            | 提供startDate参数              |
| 400        | VALIDATION_ERROR | 结束日期为必填项         | 缺少endDate参数              | 提供endDate参数                |
| 400        | VALIDATION_ERROR | 结束日期不能早于开始日期 | 日期范围设置错误             | 确保endDate >= startDate       |
| 401        | UNAUTHORIZED     | 未授权，Token无效或过期  | 未提供认证Token或Token已失效 | 重新登录获取有效Token          |
| 403        | FORBIDDEN        | 无权限执行此操作         | 当前用户没有查看统计的权限   | 联系管理员分配相应权限         |
| 500        | STATISTICS_001   | 统计查询失败             | 服务器内部错误，操作执行失败 | 查看日志定位问题或联系技术支持 |

---

### 3. 获取MTTR趋势分析

**接口路径**: `GET /v1/mdm/tpm/statistics/mttr-trend`

**功能描述**: 分析指定时间段内设备平均修复时间（MTTR - Mean Time To Repair）的变化趋势。该接口提供按时间段和按故障等级的MTTR统计，帮助评估维修能力的改善情况和不同等级故障的处理效率。

**认证要求**: 需要 Bearer Token

**权限要求**: `mdm.tpm.statistics.view`

**请求头**:

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**查询参数**:

| 参数名        | 类型   | 必填 | 限制                              | 描述                   | 示例                                 |
| ------------- | ------ | ---- | --------------------------------- | ---------------------- | ------------------------------------ |
| startDate     | string | 是   | ISO日期格式                       | 开始日期               | 2024-01-01                           |
| endDate       | string | 是   | ISO日期格式，不能早于开始日期     | 结束日期               | 2024-03-31                           |
| equipmentId   | string | 否   | UUID格式                          | 设备ID筛选             | 123e4567-e89b-12d3-a456-426614174000 |
| equipmentType | string | 否   | 枚举：退火炉/行车/自动料车/备料台 | 设备类型筛选           | 退火炉                               |
| timePeriod    | string | 否   | 枚举：日/周/月/年，默认：月       | 时间粒度，用于数据分组 | 月                                   |

**请求示例**:

```bash
curl -X GET "http://localhost:3000/v1/mdm/tpm/statistics/mttr-trend?startDate=2024-01-01&endDate=2024-03-31&equipmentType=退火炉&timePeriod=月" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**成功响应** (HTTP 200):

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

**响应字段说明**:

| 字段名                         | 类型    | 描述                         | 示例                       |
| ------------------------------ | ------- | ---------------------------- | -------------------------- |
| summary                        | object  | 总体MTTR统计摘要             | -                          |
| summary.totalFailures          | integer | 统计期内已修复的故障总数     | 42                         |
| summary.overallMTTR            | string  | 统计期内总体平均修复时间     | "8.35小时"                 |
| summary.timePeriod             | string  | 时间粒度                     | "月"                       |
| trendData                      | array   | MTTR趋势数据                 | -                          |
| trendData[].period             | string  | 时间段起始时间（ISO格式）    | "2024-01-01T00:00:00.000Z" |
| trendData[].failureCount       | integer | 该时间段已修复故障数         | 15                         |
| trendData[].avgMTTR            | string  | 该时间段平均修复时间（小时） | "9.20"                     |
| trendData[].minMTTR            | string  | 该时间段最短修复时间（小时） | "2.50"                     |
| trendData[].maxMTTR            | string  | 该时间段最长修复时间（小时） | "24.00"                    |
| levelStatistics                | array   | 按故障等级的MTTR统计         | -                          |
| levelStatistics[].failureLevel | string  | 故障等级                     | "I级-严重"                 |
| levelStatistics[].failureCount | integer | 该等级故障数量               | 5                          |
| levelStatistics[].avgMTTR      | string  | 该等级平均修复时间（小时）   | "18.50"                    |

**错误响应**:

| HTTP状态码 | 错误码           | 错误消息                 | 说明                         | 处理建议                       |
| ---------- | ---------------- | ------------------------ | ---------------------------- | ------------------------------ |
| 400        | VALIDATION_ERROR | 请求参数验证失败         | 请求参数不符合验证规则       | 检查请求参数格式和必填字段     |
| 400        | VALIDATION_ERROR | 开始日期为必填项         | 缺少startDate参数            | 提供startDate参数              |
| 400        | VALIDATION_ERROR | 结束日期为必填项         | 缺少endDate参数              | 提供endDate参数                |
| 400        | VALIDATION_ERROR | 结束日期不能早于开始日期 | 日期范围设置错误             | 确保endDate >= startDate       |
| 401        | UNAUTHORIZED     | 未授权，Token无效或过期  | 未提供认证Token或Token已失效 | 重新登录获取有效Token          |
| 403        | FORBIDDEN        | 无权限执行此操作         | 当前用户没有查看统计的权限   | 联系管理员分配相应权限         |
| 500        | STATISTICS_001   | 统计查询失败             | 服务器内部错误，操作执行失败 | 查看日志定位问题或联系技术支持 |

---

### 4. 获取备件消耗分析

**接口路径**: `GET /v1/mdm/tpm/statistics/spare-part-consumption`

**功能描述**: 分析指定时间段内备件的消耗情况，包括消耗量、消耗成本、使用频次等。该接口提供备件消耗趋势和按备件的详细统计，支持按消耗量、成本、频次排序，帮助优化备件库存管理。

**认证要求**: 需要 Bearer Token

**权限要求**: `mdm.tpm.statistics.view`

**请求头**:

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**查询参数**:

| 参数名        | 类型   | 必填 | 限制                                                         | 描述                   | 示例                                 |
| ------------- | ------ | ---- | ------------------------------------------------------------ | ---------------------- | ------------------------------------ |
| startDate     | string | 是   | ISO日期格式                                                  | 开始日期               | 2024-01-01                           |
| endDate       | string | 是   | ISO日期格式，不能早于开始日期                                | 结束日期               | 2024-03-31                           |
| sparePartId   | string | 否   | UUID格式                                                     | 备件ID筛选             | 123e4567-e89b-12d3-a456-426614174000 |
| equipmentId   | string | 否   | UUID格式                                                     | 设备ID筛选             | 123e4567-e89b-12d3-a456-426614174000 |
| equipmentType | string | 否   | 枚举：退火炉/行车/自动料车/备料台                            | 设备类型筛选           | 退火炉                               |
| timePeriod    | string | 否   | 枚举：日/周/月/年，默认：月                                  | 时间粒度，用于数据分组 | 月                                   |
| sortBy        | string | 否   | 枚举：totalQuantity/totalCost/frequency，默认：totalQuantity | 排序字段               | totalCost                            |

**请求示例**:

```bash
curl -X GET "http://localhost:3000/v1/mdm/tpm/statistics/spare-part-consumption?startDate=2024-01-01&endDate=2024-03-31&equipmentType=退火炉&sortBy=totalCost&timePeriod=月" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**成功响应** (HTTP 200):

```json
{
  "success": true,
  "data": {
    "summary": {
      "totalQuantity": 285,
      "totalTransactions": 156,
      "uniqueParts": 32,
      "totalCost": "45680.50",
      "timePeriod": "月"
    },
    "trendData": [
      {
        "period": "2024-01-01T00:00:00.000Z",
        "totalQuantity": 95,
        "transactionCount": 52,
        "uniquePartCount": 18
      },
      {
        "period": "2024-02-01T00:00:00.000Z",
        "totalQuantity": 88,
        "transactionCount": 48,
        "uniquePartCount": 16
      },
      {
        "period": "2024-03-01T00:00:00.000Z",
        "totalQuantity": 102,
        "transactionCount": 56,
        "uniquePartCount": 20
      }
    ],
    "partStatistics": [
      {
        "sparePartCode": "SP-001",
        "sparePartName": "加热元件",
        "unit": "个",
        "unitPrice": "1500.00",
        "totalQuantity": 12,
        "frequency": 8,
        "totalCost": "18000.00"
      },
      {
        "sparePartCode": "SP-002",
        "sparePartName": "温度传感器",
        "unit": "个",
        "unitPrice": "800.00",
        "totalQuantity": 15,
        "frequency": 10,
        "totalCost": "12000.00"
      }
    ]
  },
  "message": "获取备件消耗分析成功",
  "meta": {
    "timestamp": "2024-10-15T10:30:00.000Z",
    "requestId": "req-1234567890-abcdef",
    "version": "v1"
  }
}
```

**响应字段说明**:

| 字段名                         | 类型    | 描述                               | 示例                       |
| ------------------------------ | ------- | ---------------------------------- | -------------------------- |
| summary                        | object  | 总体消耗统计摘要                   | -                          |
| summary.totalQuantity          | integer | 统计期内备件总消耗数量             | 285                        |
| summary.totalTransactions      | integer | 统计期内备件领用记录总数           | 156                        |
| summary.uniqueParts            | integer | 统计期内涉及的不同备件数量         | 32                         |
| summary.totalCost              | string  | 统计期内备件总消耗成本（元）       | "45680.50"                 |
| summary.timePeriod             | string  | 时间粒度                           | "月"                       |
| trendData                      | array   | 消耗趋势数据                       | -                          |
| trendData[].period             | string  | 时间段起始时间（ISO格式）          | "2024-01-01T00:00:00.000Z" |
| trendData[].totalQuantity      | integer | 该时间段备件消耗数量               | 95                         |
| trendData[].transactionCount   | integer | 该时间段领用记录数                 | 52                         |
| trendData[].uniquePartCount    | integer | 该时间段涉及的不同备件数           | 18                         |
| partStatistics                 | array   | 按备件统计（前20个，按sortBy排序） | -                          |
| partStatistics[].sparePartCode | string  | 备件编码                           | "SP-001"                   |
| partStatistics[].sparePartName | string  | 备件名称                           | "加热元件"                 |
| partStatistics[].unit          | string  | 单位                               | "个"                       |
| partStatistics[].unitPrice     | string  | 单价（元）                         | "1500.00"                  |
| partStatistics[].totalQuantity | integer | 该备件总消耗数量                   | 12                         |
| partStatistics[].frequency     | integer | 该备件领用频次                     | 8                          |
| partStatistics[].totalCost     | string  | 该备件总消耗成本（元）             | "18000.00"                 |

**错误响应**:

| HTTP状态码 | 错误码           | 错误消息                 | 说明                         | 处理建议                       |
| ---------- | ---------------- | ------------------------ | ---------------------------- | ------------------------------ |
| 400        | VALIDATION_ERROR | 请求参数验证失败         | 请求参数不符合验证规则       | 检查请求参数格式和必填字段     |
| 400        | VALIDATION_ERROR | 开始日期为必填项         | 缺少startDate参数            | 提供startDate参数              |
| 400        | VALIDATION_ERROR | 结束日期为必填项         | 缺少endDate参数              | 提供endDate参数                |
| 400        | VALIDATION_ERROR | 结束日期不能早于开始日期 | 日期范围设置错误             | 确保endDate >= startDate       |
| 401        | UNAUTHORIZED     | 未授权，Token无效或过期  | 未提供认证Token或Token已失效 | 重新登录获取有效Token          |
| 403        | FORBIDDEN        | 无权限执行此操作         | 当前用户没有查看统计的权限   | 联系管理员分配相应权限         |
| 500        | STATISTICS_001   | 统计查询失败             | 服务器内部错误，操作执行失败 | 查看日志定位问题或联系技术支持 |

---

### 5. 获取TPM综合看板数据

**接口路径**: `GET /v1/mdm/tpm/dashboard`

**功能描述**: 提供TPM管理的综合看板数据，包括设备状态、维护任务、故障、备件等关键指标。该接口默认统计当前月份的数据，提供整体TPM管理状况的实时视图，适用于管理驾驶舱展示。

**认证要求**: 需要 Bearer Token

**权限要求**: `mdm.tpm.statistics.view`

**请求头**:

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**查询参数**:

| 参数名        | 类型   | 必填 | 限制                              | 描述                           | 示例   |
| ------------- | ------ | ---- | --------------------------------- | ------------------------------ | ------ |
| equipmentType | string | 否   | 枚举：退火炉/行车/自动料车/备料台 | 设备类型筛选                   | 退火炉 |
| timePeriod    | string | 否   | 枚举：日/周/月/年，默认：月       | 时间粒度（保留字段，暂未使用） | 月     |

**请求示例**:

```bash
curl -X GET "http://localhost:3000/v1/mdm/tpm/dashboard?equipmentType=退火炉" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**成功响应** (HTTP 200):

```json
{
  "success": true,
  "data": {
    "equipmentOverview": {
      "totalEquipment": 20,
      "runningEquipment": 16,
      "maintenanceEquipment": 2,
      "faultEquipment": 2,
      "availabilityRate": "80.00"
    },
    "maintenanceOverview": {
      "totalTasks": 45,
      "completedTasks": 40,
      "inProgressTasks": 3,
      "overdueTasks": 2,
      "completionRate": "88.89"
    },
    "failureOverview": {
      "totalFailures": 15,
      "severeFailures": 2,
      "resolvedFailures": 12,
      "resolutionRate": "80.00"
    },
    "sparePartOverview": {
      "totalTransactions": 58,
      "totalQuantity": 125,
      "totalCost": "18650.00",
      "lowStockCount": 5
    },
    "reportPeriod": {
      "startDate": "2024-10-01",
      "endDate": "2024-10-31",
      "timePeriod": "月"
    }
  },
  "message": "获取TPM综合看板数据成功",
  "meta": {
    "timestamp": "2024-10-15T10:30:00.000Z",
    "requestId": "req-1234567890-abcdef",
    "version": "v1"
  }
}
```

**响应字段说明**:

| 字段名                                 | 类型    | 描述                           | 示例         |
| -------------------------------------- | ------- | ------------------------------ | ------------ |
| equipmentOverview                      | object  | 设备状态概览                   | -            |
| equipmentOverview.totalEquipment       | integer | 设备总数                       | 20           |
| equipmentOverview.runningEquipment     | integer | 运行中的设备数                 | 16           |
| equipmentOverview.maintenanceEquipment | integer | 维护中的设备数                 | 2            |
| equipmentOverview.faultEquipment       | integer | 故障中的设备数                 | 2            |
| equipmentOverview.availabilityRate     | string  | 设备可用率（%，不带%符号）     | "80.00"      |
| maintenanceOverview                    | object  | 维护任务概览                   | -            |
| maintenanceOverview.totalTasks         | integer | 本月维护任务总数               | 45           |
| maintenanceOverview.completedTasks     | integer | 本月已完成任务数               | 40           |
| maintenanceOverview.inProgressTasks    | integer | 本月执行中任务数               | 3            |
| maintenanceOverview.overdueTasks       | integer | 本月已延期任务数               | 2            |
| maintenanceOverview.completionRate     | string  | 本月任务完成率（%，不带%符号） | "88.89"      |
| failureOverview                        | object  | 故障处理概览                   | -            |
| failureOverview.totalFailures          | integer | 本月故障总数                   | 15           |
| failureOverview.severeFailures         | integer | 本月严重故障数（I级）          | 2            |
| failureOverview.resolvedFailures       | integer | 本月已解决故障数               | 12           |
| failureOverview.resolutionRate         | string  | 本月故障解决率（%，不带%符号） | "80.00"      |
| sparePartOverview                      | object  | 备件管理概览                   | -            |
| sparePartOverview.totalTransactions    | integer | 本月备件领用记录数             | 58           |
| sparePartOverview.totalQuantity        | integer | 本月备件领用总数量             | 125          |
| sparePartOverview.totalCost            | string  | 本月备件消耗总成本（元）       | "18650.00"   |
| sparePartOverview.lowStockCount        | integer | 当前低库存备件数量             | 5            |
| reportPeriod                           | object  | 报告时间范围                   | -            |
| reportPeriod.startDate                 | string  | 统计开始日期                   | "2024-10-01" |
| reportPeriod.endDate                   | string  | 统计结束日期                   | "2024-10-31" |
| reportPeriod.timePeriod                | string  | 时间粒度                       | "月"         |

**错误响应**:

| HTTP状态码 | 错误码           | 错误消息                | 说明                         | 处理建议                       |
| ---------- | ---------------- | ----------------------- | ---------------------------- | ------------------------------ |
| 400        | VALIDATION_ERROR | 请求参数验证失败        | 请求参数不符合验证规则       | 检查请求参数格式               |
| 401        | UNAUTHORIZED     | 未授权，Token无效或过期 | 未提供认证Token或Token已失效 | 重新登录获取有效Token          |
| 403        | FORBIDDEN        | 无权限执行此操作        | 当前用户没有查看统计的权限   | 联系管理员分配相应权限         |
| 500        | STATISTICS_001   | 统计查询失败            | 服务器内部错误，操作执行失败 | 查看日志定位问题或联系技术支持 |

---

### 6. 获取设备健康度评分

**接口路径**: `GET /v1/mdm/tpm/statistics/equipment-health`

**功能描述**: 基于故障频率、维护完成率、修复时间等多个维度评估设备健康状况。该接口计算设备健康度评分（0-100分），并根据评分划分健康等级（优秀/良好/一般/差），帮助识别需要重点关注的设备。评分基于最近3个月的数据计算。

**认证要求**: 需要 Bearer Token

**权限要求**: `mdm.tpm.statistics.view`

**请求头**:

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**查询参数**:

| 参数名        | 类型    | 必填 | 限制                                                               | 描述                       | 示例                                 |
| ------------- | ------- | ---- | ------------------------------------------------------------------ | -------------------------- | ------------------------------------ |
| equipmentId   | string  | 否   | UUID格式                                                           | 设备ID筛选                 | 123e4567-e89b-12d3-a456-426614174000 |
| equipmentType | string  | 否   | 枚举：退火炉/行车/自动料车/备料台                                  | 设备类型筛选               | 退火炉                               |
| limit         | integer | 否   | 最小值：1，最大值：100，默认：20                                   | 返回数量限制               | 50                                   |
| sortBy        | string  | 否   | 枚举：healthScore/equipmentCode/lastMaintenance，默认：healthScore | 排序字段                   | healthScore                          |
| sortOrder     | string  | 否   | 枚举：asc/desc，默认：asc                                          | 排序方式，asc升序/desc降序 | asc                                  |

**请求示例**:

```bash
curl -X GET "http://localhost:3000/v1/mdm/tpm/statistics/equipment-health?equipmentType=退火炉&limit=10&sortBy=healthScore&sortOrder=asc" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**成功响应** (HTTP 200):

```json
{
  "success": true,
  "data": {
    "summary": {
      "totalEquipment": 20,
      "avgHealthScore": 82.5,
      "levelStats": {
        "优秀": 8,
        "良好": 7,
        "一般": 3,
        "差": 2
      }
    },
    "equipmentHealth": [
      {
        "equipmentId": "123e4567-e89b-12d3-a456-426614174000",
        "equipmentCode": "AF-003",
        "equipmentName": "3号退火炉",
        "equipmentType": "退火炉",
        "status": "运行",
        "healthScore": 65.0,
        "healthLevel": "一般",
        "failureCount": 8,
        "maintenanceCompletionRate": 75.0,
        "avgMTTR": 12.50,
        "daysSinceLastMaintenance": 95,
        "lastMaintenanceDate": "2024-07-12T08:00:00.000Z"
      },
      {
        "equipmentId": "223e4567-e89b-12d3-a456-426614174000",
        "equipmentCode": "AF-005",
        "equipmentName": "5号退火炉",
        "equipmentType": "退火炉",
        "status": "故障",
        "healthScore": 50.0,
        "healthLevel": "差",
        "failureCount": 12,
        "maintenanceCompletionRate": 70.0,
        "avgMTTR": 18.30,
        "daysSinceLastMaintenance": 120,
        "lastMaintenanceDate": "2024-06-17T10:30:00.000Z"
      }
    ]
  },
  "message": "获取设备健康度评分成功",
  "meta": {
    "timestamp": "2024-10-15T10:30:00.000Z",
    "requestId": "req-1234567890-abcdef",
    "version": "v1"
  }
}
```

**响应字段说明**:

| 字段名                                      | 类型    | 描述                                    | 示例                          |
| ------------------------------------------- | ------- | --------------------------------------- | ----------------------------- |
| summary                                     | object  | 健康度统计摘要                          | -                             |
| summary.totalEquipment                      | integer | 统计的设备总数                          | 20                            |
| summary.avgHealthScore                      | number  | 平均健康度评分                          | 82.5                          |
| summary.levelStats                          | object  | 各健康等级设备数量统计                  | -                             |
| summary.levelStats.优秀                     | integer | 健康等级为"优秀"的设备数（90-100分）    | 8                             |
| summary.levelStats.良好                     | integer | 健康等级为"良好"的设备数（75-89分）     | 7                             |
| summary.levelStats.一般                     | integer | 健康等级为"一般"的设备数（60-74分）     | 3                             |
| summary.levelStats.差                       | integer | 健康等级为"差"的设备数（0-59分）        | 2                             |
| equipmentHealth                             | array   | 各设备健康度详情                        | -                             |
| equipmentHealth[].equipmentId               | string  | 设备ID                                  | "123e4567-e89b-12d3-a456-..." |
| equipmentHealth[].equipmentCode             | string  | 设备编码                                | "AF-003"                      |
| equipmentHealth[].equipmentName             | string  | 设备名称                                | "3号退火炉"                   |
| equipmentHealth[].equipmentType             | string  | 设备类型                                | "退火炉"                      |
| equipmentHealth[].status                    | string  | 当前设备状态                            | "运行"                        |
| equipmentHealth[].healthScore               | number  | 健康度评分（0-100）                     | 65.0                          |
| equipmentHealth[].healthLevel               | string  | 健康等级（优秀/良好/一般/差）           | "一般"                        |
| equipmentHealth[].failureCount              | integer | 最近3个月故障次数                       | 8                             |
| equipmentHealth[].maintenanceCompletionRate | number  | 最近3个月维护任务完成率（%，不带%符号） | 75.0                          |
| equipmentHealth[].avgMTTR                   | number  | 最近3个月平均修复时间（小时）           | 12.50                         |
| equipmentHealth[].daysSinceLastMaintenance  | integer | 距离上次维护的天数                      | 95                            |
| equipmentHealth[].lastMaintenanceDate       | string  | 上次维护日期（ISO格式），可能为null     | "2024-07-12T08:00:00.000Z"    |

**健康度评分算法说明**:

设备健康度评分基于以下因素计算（初始分100分，根据各项指标扣分）：

1. **故障次数影响**（最近3个月）：
   - 0-3次：不扣分
   - 4-6次：扣15分
   - 7次以上：扣30分

2. **维护完成率影响**（最近3个月）：
   - 95%以上：不扣分
   - 80-94%：扣10分
   - 80%以下：扣20分

3. **平均修复时间影响**：
   - 8小时以内：不扣分
   - 8-24小时：扣5分
   - 24小时以上：扣15分

4. **距离上次维护时间影响**：
   - 90天以内：不扣分
   - 90-180天：扣10分
   - 180天以上：扣15分

5. **设备状态影响**：
   - 运行/停机：不扣分
   - 维护：扣5分
   - 故障：扣20分

最终评分范围：0-100分

**健康等级划分**：
- 优秀：90-100分
- 良好：75-89分
- 一般：60-74分
- 差：0-59分

**错误响应**:

| HTTP状态码 | 错误码           | 错误消息                | 说明                         | 处理建议                       |
| ---------- | ---------------- | ----------------------- | ---------------------------- | ------------------------------ |
| 400        | VALIDATION_ERROR | 请求参数验证失败        | 请求参数不符合验证规则       | 检查请求参数格式               |
| 400        | VALIDATION_ERROR | 数量限制不能小于1       | limit参数小于1               | 设置limit >= 1                 |
| 400        | VALIDATION_ERROR | 数量限制不能超过100     | limit参数大于100             | 设置limit <= 100               |
| 401        | UNAUTHORIZED     | 未授权，Token无效或过期 | 未提供认证Token或Token已失效 | 重新登录获取有效Token          |
| 403        | FORBIDDEN        | 无权限执行此操作        | 当前用户没有查看统计的权限   | 联系管理员分配相应权限         |
| 500        | STATISTICS_001   | 统计查询失败            | 服务器内部错误，操作执行失败 | 查看日志定位问题或联系技术支持 |

---

### 7. 获取维护工作量统计

**接口路径**: `GET /v1/mdm/tpm/statistics/maintenance-workload`

**功能描述**: 统计维护人员的工作量分布，支持按人员、设备类型、维护类型等维度分组统计。该接口提供工作量趋势和分组统计，帮助管理者了解维护人员的工作负荷，优化资源分配。

**认证要求**: 需要 Bearer Token

**权限要求**: `mdm.tpm.statistics.view`

**请求头**:

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**查询参数**:

| 参数名        | 类型   | 必填 | 限制                                                         | 描述                       | 示例                                 |
| ------------- | ------ | ---- | ------------------------------------------------------------ | -------------------------- | ------------------------------------ |
| startDate     | string | 是   | ISO日期格式                                                  | 开始日期                   | 2024-01-01                           |
| endDate       | string | 是   | ISO日期格式，不能早于开始日期                                | 结束日期                   | 2024-03-31                           |
| assigneeId    | string | 否   | UUID格式                                                     | 维护人员ID筛选             | 123e4567-e89b-12d3-a456-426614174000 |
| equipmentType | string | 否   | 枚举：退火炉/行车/自动料车/备料台                            | 设备类型筛选               | 退火炉                               |
| timePeriod    | string | 否   | 枚举：日/周/月/年，默认：月                                  | 时间粒度，用于趋势数据分组 | 月                                   |
| groupBy       | string | 否   | 枚举：assignee/equipmentType/maintenanceType，默认：assignee | 分组字段                   | assignee                             |

**请求示例**:

```bash
curl -X GET "http://localhost:3000/v1/mdm/tpm/statistics/maintenance-workload?startDate=2024-01-01&endDate=2024-03-31&groupBy=assignee&timePeriod=月" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**成功响应** (HTTP 200):

```json
{
  "success": true,
  "data": {
    "summary": {
      "totalTasks": 150,
      "completedTasks": 135,
      "totalWorkHours": "720.5",
      "activeAssignees": 8,
      "completionRate": "90.00",
      "timePeriod": "月",
      "groupBy": "assignee"
    },
    "workloadByGroup": [
      {
        "assigneeId": "123e4567-e89b-12d3-a456-426614174000",
        "assigneeName": "张三",
        "totalTasks": 45,
        "completedTasks": 42,
        "totalWorkHours": "220.5",
        "avgWorkHours": "5.2",
        "completionRate": "93.33"
      },
      {
        "assigneeId": "223e4567-e89b-12d3-a456-426614174000",
        "assigneeName": "李四",
        "totalTasks": 38,
        "completedTasks": 34,
        "totalWorkHours": "185.0",
        "avgWorkHours": "5.4",
        "completionRate": "89.47"
      }
    ],
    "workloadTrend": [
      {
        "period": "2024-01-01T00:00:00.000Z",
        "totalTasks": 50,
        "completedTasks": 45,
        "totalWorkHours": "240.0"
      },
      {
        "period": "2024-02-01T00:00:00.000Z",
        "totalTasks": 48,
        "completedTasks": 44,
        "totalWorkHours": "228.5"
      },
      {
        "period": "2024-03-01T00:00:00.000Z",
        "totalTasks": 52,
        "completedTasks": 46,
        "totalWorkHours": "252.0"
      }
    ]
  },
  "message": "获取维护工作量统计成功",
  "meta": {
    "timestamp": "2024-10-15T10:30:00.000Z",
    "requestId": "req-1234567890-abcdef",
    "version": "v1"
  }
}
```

**响应字段说明**:

| 字段名                            | 类型    | 描述                                    | 示例                          |
| --------------------------------- | ------- | --------------------------------------- | ----------------------------- |
| summary                           | object  | 工作量统计摘要                          | -                             |
| summary.totalTasks                | integer | 统计期内总任务数                        | 150                           |
| summary.completedTasks            | integer | 统计期内已完成任务数                    | 135                           |
| summary.totalWorkHours            | string  | 统计期内总工时（小时）                  | "720.5"                       |
| summary.activeAssignees           | integer | 统计期内活跃的维护人员数                | 8                             |
| summary.completionRate            | string  | 统计期内任务完成率（%，不带%符号）      | "90.00"                       |
| summary.timePeriod                | string  | 时间粒度                                | "月"                          |
| summary.groupBy                   | string  | 分组方式                                | "assignee"                    |
| workloadByGroup                   | array   | 按分组的工作量统计                      | -                             |
| workloadByGroup[].assigneeId      | string  | 维护人员ID（当groupBy=assignee时）      | "123e4567-e89b-12d3-a456-..." |
| workloadByGroup[].assigneeName    | string  | 维护人员姓名（当groupBy=assignee时）    | "张三"                        |
| workloadByGroup[].equipmentType   | string  | 设备类型（当groupBy=equipmentType时）   | "退火炉"                      |
| workloadByGroup[].maintenanceType | string  | 维护类型（当groupBy=maintenanceType时） | "预防性维护"                  |
| workloadByGroup[].totalTasks      | integer | 该分组总任务数                          | 45                            |
| workloadByGroup[].completedTasks  | integer | 该分组已完成任务数                      | 42                            |
| workloadByGroup[].totalWorkHours  | string  | 该分组总工时（小时）                    | "220.5"                       |
| workloadByGroup[].avgWorkHours    | string  | 该分组平均单任务工时（小时）            | "5.2"                         |
| workloadByGroup[].completionRate  | string  | 该分组任务完成率（%，不带%符号）        | "93.33"                       |
| workloadTrend                     | array   | 工作量趋势数据                          | -                             |
| workloadTrend[].period            | string  | 时间段起始时间（ISO格式）               | "2024-01-01T00:00:00.000Z"    |
| workloadTrend[].totalTasks        | integer | 该时间段总任务数                        | 50                            |
| workloadTrend[].completedTasks    | integer | 该时间段已完成任务数                    | 45                            |
| workloadTrend[].totalWorkHours    | string  | 该时间段总工时（小时）                  | "240.0"                       |

**不同分组方式的响应差异**:

- **groupBy=assignee**：workloadByGroup中包含assigneeId和assigneeName字段
- **groupBy=equipmentType**：workloadByGroup中包含equipmentType字段
- **groupBy=maintenanceType**：workloadByGroup中包含maintenanceType字段

**错误响应**:

| HTTP状态码 | 错误码           | 错误消息                 | 说明                         | 处理建议                       |
| ---------- | ---------------- | ------------------------ | ---------------------------- | ------------------------------ |
| 400        | VALIDATION_ERROR | 请求参数验证失败         | 请求参数不符合验证规则       | 检查请求参数格式和必填字段     |
| 400        | VALIDATION_ERROR | 开始日期为必填项         | 缺少startDate参数            | 提供startDate参数              |
| 400        | VALIDATION_ERROR | 结束日期为必填项         | 缺少endDate参数              | 提供endDate参数                |
| 400        | VALIDATION_ERROR | 结束日期不能早于开始日期 | 日期范围设置错误             | 确保endDate >= startDate       |
| 401        | UNAUTHORIZED     | 未授权，Token无效或过期  | 未提供认证Token或Token已失效 | 重新登录获取有效Token          |
| 403        | FORBIDDEN        | 无权限执行此操作         | 当前用户没有查看统计的权限   | 联系管理员分配相应权限         |
| 500        | STATISTICS_001   | 统计查询失败             | 服务器内部错误，操作执行失败 | 查看日志定位问题或联系技术支持 |

---

## 错误码说明

系统使用统一的错误码体系，便于客户端处理和日志追踪。

### TPM统计分析相关错误码 (STATISTICS_xxx)

| 错误码         | HTTP 状态码 | 错误消息     | 说明                                   | 处理建议                       |
| -------------- | ----------- | ------------ | -------------------------------------- | ------------------------------ |
| STATISTICS_001 | 500         | 统计查询失败 | 数据库查询失败或统计计算过程中发生错误 | 查看日志定位问题或联系技术支持 |

### 通用错误码

| 错误码           | HTTP 状态码 | 错误消息                | 说明                         | 处理建议                   |
| ---------------- | ----------- | ----------------------- | ---------------------------- | -------------------------- |
| VALIDATION_ERROR | 400         | 请求参数验证失败        | 请求参数不符合验证规则       | 检查请求参数格式和必填字段 |
| UNAUTHORIZED     | 401         | 未授权，Token无效或过期 | 未提供认证Token或Token已失效 | 重新登录获取有效Token      |
| FORBIDDEN        | 403         | 无权限执行此操作        | 当前用户没有该操作的权限     | 联系管理员分配相应权限     |
| INTERNAL_ERROR   | 500         | 服务器内部错误          | 服务器发生未预期的错误       | 联系技术支持               |

### 错误处理最佳实践

1. **统一错误处理**: 前端应根据错误码进行统一处理，而不是依赖 HTTP 状态码

2. **错误码模式识别**: 建议根据错误码前缀进行模式识别处理
   - `STATISTICS_`: 统计分析相关错误，可能是数据查询或计算问题
   - `VALIDATION_`: 验证相关错误，需要检查输入参数
   - `UNAUTHORIZED`/`FORBIDDEN`: 认证授权错误，需要重新登录或申请权限

3. **错误消息展示**: 直接使用 `error.message` 字段的内容，无需前端硬编码错误消息

4. **日志记录**: 使用 `traceId` 进行错误追踪和问题排查

## 数据字段说明

### 日期时间格式

- 所有日期时间字段均使用 ISO 8601 格式：`YYYY-MM-DDTHH:mm:ss.sssZ`
- 示例：`"2024-10-15T10:30:00.000Z"`
- 查询参数中的日期可以简化为：`YYYY-MM-DD`（如：`2024-10-15`）

### 时间粒度说明

时间粒度参数（timePeriod）用于控制统计数据的时间分组：

- **日**：按天统计，period为当天0点
- **周**：按周统计，period为该周周一0点
- **月**：按月统计，period为当月1日0点
- **年**：按年统计，period为当年1月1日0点

### 百分比字段说明

响应中的百分比字段有两种格式：

1. **带%符号**：如 `"90.00%"`，用于总体汇总统计
2. **不带%符号**：如 `"90.00"`，用于详细列表数据，便于前端处理和计算

### 枚举值说明

**设备类型 (equipmentType)**:
- 退火炉
- 行车
- 自动料车
- 备料台

**故障类型 (failureType)**:
- 机械
- 电气
- 液压
- 控制
- 其他

**故障等级 (failureLevel)**:
- I级-严重
- II级-重大
- III级-一般
- IV级-轻微

**设备状态 (status)**:
- 运行
- 停机
- 维护
- 故障

**维护任务状态 (taskStatus)**:
- 待执行
- 执行中
- 已完成
- 已延期
- 已取消

**健康等级 (healthLevel)**:
- 优秀（90-100分）
- 良好（75-89分）
- 一般（60-74分）
- 差（0-59分）

## 安全说明

### 认证机制

所有TPM统计分析接口都需要JWT Bearer Token认证：

1. **Token获取**: 通过登录接口获取访问令牌
2. **Token使用**: 在请求头中携带 `Authorization: Bearer <token>`
3. **Token过期**: Token过期后需要重新登录或使用刷新令牌

### 权限控制

所有统计分析接口需要 `mdm.tpm.statistics.view` 权限。权限不足时返回403错误。

### 数据安全

1. **数据筛选**: 接口自动根据用户权限和组织范围筛选数据
2. **敏感信息**: 统计数据中不包含敏感的个人信息
3. **数据导出**: 暂不支持数据导出功能，如需导出请联系管理员

### 使用建议

1. **合理设置时间范围**: 避免查询过长时间范围的数据，建议不超过1年
2. **分批查询**: 对于大量数据，建议分批次查询
3. **缓存策略**: 统计数据可以在客户端适当缓存，减少服务器压力
4. **定时刷新**: 看板数据建议每5-10分钟刷新一次

## 总结

本文档详细说明了 Moses API TPM统计分析模块的所有接口，包括：

### 核心内容

1. **7个核心接口**：
   - 维护计划执行率统计
   - 故障汇总统计
   - MTTR趋势分析
   - 备件消耗分析
   - TPM综合看板
   - 设备健康度评分
   - 维护工作量统计

2. **完整的请求/响应格式**：统一的数据结构和错误处理

3. **详细的参数说明**：每个接口的参数类型、限制和示例

4. **全面的错误码定义**：覆盖TPM统计分析相关的各类错误

### 使用场景

- **管理驾驶舱**: 使用TPM综合看板接口展示整体状况
- **设备管理**: 使用设备健康度评分识别问题设备
- **维护优化**: 使用维护计划执行率和工作量统计优化维护安排
- **故障分析**: 使用故障汇总和MTTR趋势分析改善维修能力
- **成本控制**: 使用备件消耗分析优化备件库存

开发人员可以根据本文档进行前端集成开发，如需更多技术细节，请参考 Swagger 在线文档或联系后端开发团队。

