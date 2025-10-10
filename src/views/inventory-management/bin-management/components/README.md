# 料框/料垛管理组件说明

## BinSearch - 料框搜索组件

### 功能描述

料框搜索组件，基于全局 `SearchForm` 组件实现，提供配置驱动的搜索表单功能。

### 核心功能

#### P0 核心功能（已完成）

1. ✅ **料框状态筛选**：支持14种料框状态的下拉选择
2. ✅ **产品代码搜索**：输入框搜索产品代码
3. ✅ **批次号搜索**：输入框搜索批次号
4. ✅ **关键词搜索**：支持料框编号、产品代码的模糊查询
5. ✅ **注册时间范围**：日期时间范围选择器
6. ✅ **搜索/重置**：标准搜索和重置功能
7. ✅ **参数格式转换**：自动转换为接口文档要求的格式
8. ✅ **防抖搜索**：300ms防抖延迟

#### P1 扩展功能（已完成）

11. ✅ **料框规格筛选**：下拉选择料框规格（动态加载启用状态的规格）
13. ✅ **表单折叠展开**：primary字段优先显示，advanced字段折叠

### 使用方式

```vue
<template>
  <div>
    <BinSearch
      v-model="searchQuery"
      :loading="loading"
      @search="handleSearch"
      @reset="handleReset"
    />
  </div>
</template>

<script>
import BinSearch from './components/BinSearch.vue'

export default {
  components: {
    BinSearch
  },
  data() {
    return {
      searchQuery: {},
      loading: false
    }
  },
  methods: {
    async handleSearch(query) {
      console.log('搜索参数:', query)
      this.loading = true
      try {
        // 调用料框列表查询接口
        // const response = await fetchBinList(query)
        // ...处理响应
      } finally {
        this.loading = false
      }
    },
    handleReset(query) {
      console.log('重置参数:', query)
    }
  }
}
</script>
```

### Props

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| value | Object | 否 | {} | 搜索参数对象（支持v-model） |
| loading | Boolean | 否 | false | 加载状态 |

### Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| search | query: Object | 搜索事件，返回格式化后的查询参数 |
| reset | query: Object | 重置事件，返回默认查询参数 |
| input | query: Object | 支持v-model双向绑定 |

### 搜索参数格式

组件会自动将表单值转换为符合接口文档的格式：

**输入格式（表单值）：**
```javascript
{
  status: 'PENDING_ANNEALING_STORAGE',
  productCode: 'AF-1060',
  batchNumber: 'BATCH-001',
  searchKeyword: 'LK-20250110',
  binSpecificationId: 'uuid-123',
  registeredAtRange: ['2025-01-01T00:00:00', '2025-01-31T23:59:59']
}
```

**输出格式（接口参数）：**
```javascript
{
  page: 1,
  limit: 20,
  sortBy: 'createdAt:desc',
  status: 'PENDING_ANNEALING_STORAGE',
  productCode: 'AF-1060',
  batchNumber: 'BATCH-001',
  searchKeyword: 'LK-20250110',
  binSpecificationId: 'uuid-123',
  registeredAtStart: '2025-01-01T00:00:00.000Z',
  registeredAtEnd: '2025-01-31T23:59:59.000Z'
}
```

### 搜索项配置

搜索项配置来自 `constants/form-config.js` 的 `BIN_SEARCH_FORM_CONFIG`：

**Primary 字段（优先显示）：**
- 料框状态（下拉选择）
- 产品代码（输入框）
- 批次号（输入框）
- 关键词搜索（输入框）

**Advanced 字段（折叠展示）：**
- 料框规格（下拉选择）
- 注册时间范围（日期范围选择器）

### 料框状态枚举

组件支持以下14种料框状态：

| 状态代码 | 中文名称 | 标签类型 |
|---------|---------|---------|
| IDLE | 闲置 | info |
| PENDING_ANNEALING_STORAGE | 待入库退火 | warning |
| WAITING_ANNEALING | 待退火 | warning |
| WAITING_PREPARATION | 待备料 | warning |
| WAITING_LOADING | 待装炉 | warning |
| LOADING | 装炉中 | 默认 |
| ANNEALING | 退火中 | 默认 |
| WAITING_UNLOAD | 待出炉 | warning |
| ANNEALED | 已退火 | success |
| WAITING_INSPECTION | 待检验 | warning |
| INSPECTED_QUALIFIED | 已检验-合格 | success |
| INSPECTED_UNQUALIFIED | 已检验-不合格 | danger |
| WAITING_OUTBOUND | 待出库 | warning |
| OUTBOUND | 已出库 | info |

### 接口对接说明

#### 料框列表查询接口

- **接口路径**：`GET /v1/inv/bins`
- **查询参数**：与组件输出格式一致
- **响应格式**：标准分页响应

详细接口文档请参考：[料框管理接口文档](../docs/接口文档/料框管理接口说明文档.md)

#### 料框规格接口

- **接口路径**：`GET /mdm/bin-specifications`
- **查询参数**：`{ status: '启用', limit: 100 }`
- **用途**：获取启用状态的料框规格选项

详细接口文档请参考主数据模块的料框规格接口文档

### 注意事项

1. **防抖搜索**：搜索操作自动防抖300ms，避免频繁请求
2. **参数格式**：时间范围会自动转换为ISO 8601格式
3. **空值过滤**：空字符串和空值会被自动过滤
4. **料框规格**：动态加载启用状态的规格，如果加载失败会静默处理
5. **v-model支持**：组件支持v-model双向绑定搜索参数

### 开发规范

- ✅ 使用全局 `SearchForm` 组件，不自行实现表单
- ✅ 料框状态选项来自 constants 枚举定义
- ✅ 时间格式符合接口文档（ISO 8601）
- ✅ 参数命名与接口文档完全一致
- ✅ 代码通过 ESLint 检查

---

## BinStatusDialog - 料框状态变更对话框组件

### 功能描述

料框状态变更对话框组件，使用 `el-dialog` 实现，提供料框状态手动变更功能。

### 核心功能

#### P1 重要功能（已完成）

1. ✅ **对话框组件功能完整**：样式符合项目规范，交互流畅
2. ✅ **目标状态选择**：下拉选择目标状态（显示所有14种料框状态）
3. ✅ **触发类型选择**：下拉选择包含5种枚举值（扫码确认、PLC信号、物流任务、人工操作、系统自动）
5. ✅ **备注输入**：支持多行文本输入（最多500字符）
6. ✅ **请求参数格式**：与接口文档完全一致
7. ✅ **错误提示**：显示后端返回的error.message，状态转换不合法时显示允许的转换状态
8. ✅ **成功提示**：显示后端返回的message
9. ✅ **关闭清空**：关闭对话框时自动清空表单数据

### 使用方式

```vue
<template>
  <div>
    <!-- 触发按钮 -->
    <el-button @click="handleShowDialog">状态变更</el-button>

    <!-- 状态变更对话框 -->
    <BinStatusDialog
      :visible.sync="dialogVisible"
      :bin-data="currentBin"
      @success="handleStatusChanged"
      @close="handleDialogClose"
    />
  </div>
</template>

<script>
import BinStatusDialog from './components/BinStatusDialog.vue'

export default {
  components: {
    BinStatusDialog
  },
  data() {
    return {
      dialogVisible: false,
      currentBin: null
    }
  },
  methods: {
    handleShowDialog() {
      this.currentBin = {
        id: 'uuid-123',
        binCode: 'LK-20250110-0001',
        status: 'PENDING_ANNEALING_STORAGE'
      }
      this.dialogVisible = true
    },
    handleStatusChanged(updatedData) {
      console.log('状态已更新:', updatedData)
      // 刷新列表或更新本地数据
    },
    handleDialogClose() {
      this.dialogVisible = false
    }
  }
}
</script>
```

### Props

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| visible | Boolean | 是 | false | 对话框显示状态（支持.sync修饰符） |
| binData | Object | 是 | {} | 料框数据对象（包含id、binCode、status等字段） |

### Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| success | updatedData: Object | 状态变更成功事件，返回更新后的料框数据 |
| close | - | 对话框关闭事件 |
| update:visible | visible: Boolean | 支持.sync修饰符双向绑定 |

### 表单字段

#### 目标状态（targetStatus）- 必填

支持选择14种料框状态：

| 状态代码 | 中文名称 |
|---------|---------|
| IDLE | 闲置 |
| PENDING_ANNEALING_STORAGE | 待入库退火 |
| WAITING_ANNEALING | 待退火 |
| WAITING_PREPARATION | 待备料 |
| WAITING_LOADING | 待装炉 |
| LOADING | 装炉中 |
| ANNEALING | 退火中 |
| WAITING_UNLOAD | 待出炉 |
| ANNEALED | 已退火 |
| WAITING_INSPECTION | 待检验 |
| INSPECTED_QUALIFIED | 已检验-合格 |
| INSPECTED_UNQUALIFIED | 已检验-不合格 |
| WAITING_OUTBOUND | 待出库 |
| OUTBOUND | 已出库 |

#### 触发类型（triggerType）- 必填

支持选择5种触发类型：

| 触发类型代码 | 中文名称 |
|-------------|---------|
| SCAN_CONFIRMATION | 扫码确认 |
| PLC_SIGNAL | PLC信号 |
| LOGISTICS_TASK | 物流任务 |
| MANUAL_OPERATION | 人工操作 |
| SYSTEM_AUTO | 系统自动 |

#### 备注（remarks）- 可选

- 类型：多行文本
- 最大长度：500字符
- 说明：记录状态变更的原因或备注信息

### 请求参数格式

组件提交的数据格式与接口文档完全一致：

```javascript
{
  targetStatus: 'WAITING_ANNEALING',
  triggerType: 'SCAN_CONFIRMATION',
  remarks: '人工确认装炉'  // 可选，未填写时不传递此字段
}
```

### 接口对接说明

#### 更新料框状态接口

- **接口路径**：`PATCH /v1/inv/bins/:id/status`
- **请求参数**：如上述格式
- **成功响应**：返回更新后的料框完整信息
- **错误响应**：返回错误码和错误消息

详细接口文档请参考：[料框管理接口文档](../docs/接口文档/料框管理接口说明文档.md#5-更新料框状态)

### 错误处理

#### 状态转换不合法错误（BIN_STATUS_TRANSITION_INVALID）

当状态转换不符合业务规则时，组件会：

1. 显示后端返回的 `error.message`
2. 如果响应中包含 `allowedTransitions`，会显示允许的转换状态
3. 示例错误提示：
   ```
   不允许从当前状态转换到目标状态。允许的状态转换：待退火、闲置
   ```

#### 其他错误

组件会优先显示后端返回的 `error.message`，确保用户看到准确的错误信息。

### 注意事项

1. **状态转换规则**：由后端验证，前端只做基础的必填验证
2. **触发类型必选**：必须选择一个触发类型以记录状态变更来源
3. **备注可选**：备注字段为可选，但建议填写以便于追溯
4. **成功消息**：使用后端返回的message字段，不硬编码消息文本
5. **错误消息**：使用后端返回的error.message字段，确保信息准确
6. **表单重置**：对话框关闭时会自动清空表单数据和验证状态

### 开发规范

- ✅ 使用 `el-dialog` 实现对话框
- ✅ 状态和触发类型选项来自 constants 枚举定义
- ✅ 请求参数格式与接口文档100%一致
- ✅ 成功和错误消息使用后端返回的内容
- ✅ 支持.sync修饰符双向绑定visible属性
- ✅ 代码通过 ESLint 检查

---

## BinStatusHistoryDialog - 料框状态历史对话框组件

### 功能描述

料框状态历史对话框组件，使用 `el-dialog` 和 `el-timeline` 实现，提供料框状态变更历史的查看和追溯功能。

### 核心功能

#### P1 重要功能（已完成）

1. ✅ **对话框组件功能完整**：样式符合项目规范，交互流畅
2. ✅ **时间轴展示**：使用el-timeline组件展示状态变更历史
3. ✅ **时间倒序显示**：按时间倒序显示所有历史记录
4. ✅ **关键字段显示**：显示旧状态、新状态、触发类型、操作员、变更时间、备注等所有关键信息
5. ✅ **状态标签显示**：使用StatusTag组件显示料框状态，颜色映射正确
6. ✅ **时间范围筛选**：支持起始时间和结束时间的范围筛选
7. ✅ **分页加载**：支持limit和offset参数的分页加载
8. ✅ **首次注册标识**：首次注册记录的oldStatus显示为"新注册"

### 使用方式

```vue
<template>
  <div>
    <!-- 触发按钮 -->
    <el-button @click="handleShowHistory">查看历史</el-button>

    <!-- 状态历史对话框 -->
    <BinStatusHistoryDialog
      :visible.sync="historyDialogVisible"
      :bin-id="currentBinId"
      :bin-code="currentBinCode"
    />
  </div>
</template>

<script>
import BinStatusHistoryDialog from './components/BinStatusHistoryDialog.vue'

export default {
  components: {
    BinStatusHistoryDialog
  },
  data() {
    return {
      historyDialogVisible: false,
      currentBinId: '',
      currentBinCode: ''
    }
  },
  methods: {
    handleShowHistory(row) {
      this.currentBinId = row.id
      this.currentBinCode = row.binCode
      this.historyDialogVisible = true
    }
  }
}
</script>
```

### Props

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| visible | Boolean | 是 | false | 对话框显示状态（支持.sync修饰符） |
| binId | String | 是 | '' | 料框ID（UUID格式） |
| binCode | String | 否 | '' | 料框编号（用于显示标题） |

### Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| update:visible | visible: Boolean | 支持.sync修饰符双向绑定 |

### 筛选功能

#### 时间范围筛选

- **组件**：`el-date-picker`（datetimerange类型）
- **格式**：YYYY-MM-DD HH:mm:ss
- **转换**：自动转换为ISO 8601格式发送给后端
- **清空**：支持清空时间范围恢复全部历史

#### 分页功能

- **每页数量**：支持10、20、30、50条选择
- **默认值**：10条/页
- **参数格式**：使用limit和offset（不同于其他接口的page/limit）
- **页码计算**：offset = (currentPage - 1) * limit

### 历史记录展示

#### 时间轴布局

使用 `el-timeline` 组件展示历史记录，每条记录包含：

**卡片头部（时间戳）：**
- 显示格式：YYYY-MM-DD HH:mm:ss
- 位置：顶部时间戳

**卡片内容：**
1. **状态变更**：
   - 旧状态：使用StatusTag组件展示（首次注册显示为"新注册"）
   - 箭头图标：`el-icon-right`
   - 新状态：使用StatusTag组件展示

2. **触发类型**：
   - 显示为info类型的小标签
   - 中文文本映射

3. **操作员**：
   - 显示操作员ID
   - 可选字段，未关联时不显示

4. **设备ID**：
   - 显示设备ID
   - 可选字段，未关联时不显示

5. **备注**：
   - 显示变更备注
   - 可选字段，未填写时不显示

#### 状态标签颜色映射

料框状态使用StatusTag组件，自动匹配颜色：

| 状态类型 | 标签颜色 | 示例状态 |
|---------|---------|---------|
| 成功（success） | 绿色 | 已退火、已检验-合格 |
| 警告（warning） | 黄色 | 待入库退火、待退火、待检验 |
| 危险（danger） | 红色 | 已检验-不合格 |
| 信息（info） | 蓝色 | 闲置、已出库 |
| 默认 | 灰色 | 装炉中、退火中 |

#### 首次注册特殊处理

当历史记录的 `oldStatus` 为 `null` 时：
- 显示文本："新注册"
- 样式：灰色底色，边框，小号字体
- 示例：`新注册` → `待入库退火`

### 请求参数格式

组件向接口发送的参数格式：

```javascript
{
  limit: 10,                              // 每页数量
  offset: 0,                              // 偏移量
  startDate: '2025-01-01T00:00:00.000Z',  // 开始时间（ISO 8601格式，可选）
  endDate: '2025-01-31T23:59:59.999Z'     // 结束时间（ISO 8601格式，可选）
}
```

### 响应数据格式

接口返回的历史记录数组格式：

```javascript
{
  "success": true,
  "data": [
    {
      "id": "723e4567-...",
      "binId": "423e4567-...",
      "binCode": "LK-20250110-0001",
      "oldStatus": "PENDING_ANNEALING_STORAGE",  // 首次注册时为null
      "newStatus": "WAITING_ANNEALING",
      "triggerType": "SCAN_CONFIRMATION",
      "operatorId": "523e4567-...",
      "equipmentId": null,
      "changedAt": "2025-01-10T11:00:00.000Z",
      "remarks": "人工确认装炉",
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0",
      "createdBy": "523e4567-...",
      "createdAt": "2025-01-10T11:00:00.000Z"
    }
  ],
  "message": "获取料框状态历史成功"
}
```

### 接口对接说明

#### 料框状态历史查询接口

- **接口路径**：`GET /v1/inv/bins/:id/status-history`
- **路径参数**：`:id` - 料框ID（UUID格式）
- **查询参数**：limit、offset、startDate、endDate
- **成功响应**：返回状态历史记录数组（按时间倒序）
- **错误响应**：返回错误码和错误消息

详细接口文档请参考：[料框管理接口文档](../docs/接口文档/料框管理接口说明文档.md#6-料框状态历史查询)

### 错误处理

#### 料框不存在错误（BIN_NOT_FOUND）

当料框ID不存在时，组件会：
- 显示后端返回的 `error.message`
- 示例错误提示：`料框不存在`

#### 参数验证失败错误（VAL_001）

当查询参数格式错误时，组件会：
- 显示后端返回的 `error.message`
- 示例错误提示：`每页数量最大为100`

#### 其他错误

组件会优先显示后端返回的 `error.message`，确保用户看到准确的错误信息。

### 注意事项

1. **时间格式转换**：
   - 前端显示：YYYY-MM-DD HH:mm:ss
   - 接口传递：ISO 8601格式（YYYY-MM-DDTHH:mm:ss.sssZ）
   - 自动转换：组件内部自动处理格式转换

2. **分页参数**：
   - 使用 `limit` 和 `offset`，不同于其他接口的 `page` 和 `limit`
   - offset计算公式：`(currentPage - 1) * limit`

3. **首次注册识别**：
   - `oldStatus` 为 `null` 时表示首次注册
   - 显示为"新注册"文本，不使用StatusTag组件

4. **空状态处理**：
   - 无历史记录时显示 `el-empty` 空状态
   - 提示文本："暂无状态变更记录"

5. **时间倒序**：
   - 后端默认返回时间倒序数据
   - 最新的状态变更记录显示在最上方

6. **可选字段处理**：
   - `operatorId`、`equipmentId`、`remarks` 为可选字段
   - 未填写时不显示对应行

### 样式说明

#### 时间轴样式

- **最大高度**：500px
- **滚动**：超过最大高度时垂直滚动
- **时间戳**：14px字体，加粗，深色文本

#### 历史卡片样式

- **状态变更**：
  - 横向布局，居中对齐
  - 标签间距：8px
  - 箭头图标：灰色，居中

- **详细信息**：
  - 标签：加粗，深色
  - 值：常规字体，深色
  - 行间距：8px

- **新注册标识**：
  - 背景：浅灰色（#f4f4f5）
  - 边框：1px灰色（#e9e9eb）
  - 圆角：4px
  - 内边距：0 8px

#### 分页样式

- **位置**：居中对齐
- **上边距**：20px
- **布局**：总数、每页数量、上一页、页码、下一页、跳转

### 开发规范

- ✅ 使用 `el-dialog` 实现对话框
- ✅ 使用 `el-timeline` 组件展示时间轴
- ✅ 状态显示使用全局 `StatusTag` 组件
- ✅ 触发类型文本映射来自 constants 枚举定义
- ✅ 时间格式化使用项目统一的 `parseTime` 工具函数
- ✅ 请求参数格式与接口文档100%一致
- ✅ 分页参数使用 `limit` 和 `offset`
- ✅ 支持.sync修饰符双向绑定visible属性
- ✅ 代码通过 ESLint 检查

