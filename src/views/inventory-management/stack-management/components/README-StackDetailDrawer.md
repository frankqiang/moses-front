# StackDetailDrawer 组件说明

## 📋 组件概述

**文件名称**: `StackDetailDrawer.vue`
**组件名称**: `StackDetailDrawer`
**功能描述**: 料垛详情查看抽屉组件，用于展示料垛的完整信息

## 🎯 功能特性

### 核心功能

1. **料垛基本信息展示**
   - 料垛编号（带样式标签）
   - 料垛状态（使用 StatusTag 组件）
   - 料框规格代码
   - 产品代码
   - 批次号
   - 当前位置
   - 料框数量
   - 堆叠层数
   - 总重量
   - 备注

2. **组垛信息展示**
   - 组垛时间（格式化显示）
   - 组垛操作员（优先显示姓名和用户名）
   - 拆垛时间（如果已拆垛）
   - 拆垛操作员（如果已拆垛）

3. **系统信息展示**
   - 创建时间
   - 创建人
   - 更新时间
   - 更新人

4. **快捷操作**
   - 查看成员料框列表
   - 拆垛操作（仅 ACTIVE 状态）

### 数据处理

#### 智能字段显示

组件实现了多层降级的字段显示逻辑：

**当前位置显示**:
```javascript
getCurrentLocationDisplay(stack) {
  // 优先：locationCode - locationName
  // 降级1：locationCode
  // 降级2：locationName
  // 降级3：currentLocationId (UUID)
}
```

**操作员显示**:
```javascript
getStackerDisplay(stack) {
  // 优先：realName (username)
  // 降级1：realName
  // 降级2：username
  // 降级3：stackedBy/destackedBy (UUID)
}
```

## 📡 Props

| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|-------|------|------|--------|------|
| visible | Boolean | 否 | false | 抽屉可见性 |
| stackId | String | 是 | '' | 料垛ID（UUID格式） |

## 🎪 Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| update:visible | visible (Boolean) | 抽屉可见性变化 |
| view-bins | stack (Object) | 点击"查看详细料框列表"时触发 |
| destack | stack (Object) | 点击"拆垛"按钮时触发 |

## 🔌 API 调用

### 料垛详情查询

**接口**: `GET /v1/inv/stacks/:id`

**调用时机**: 抽屉打开时自动调用

**错误处理**:
- 自动显示错误消息（由 request 拦截器处理）
- 失败时自动关闭抽屉

## 📦 依赖组件

### 全局组件

- `BaseDrawer`: 抽屉容器组件
- `StatusTag`: 状态标签组件

### Element UI 组件

- `el-descriptions`: 描述列表
- `el-tag`: 标签
- `el-button`: 按钮
- `el-alert`: 提示框

## 💻 使用示例

### 基础使用

```vue
<template>
  <div>
    <!-- 触发按钮 -->
    <el-button @click="handleView(stack)">
      查看详情
    </el-button>

    <!-- 详情抽屉 -->
    <stack-detail-drawer
      :visible.sync="detailDrawerVisible"
      :stack-id="currentStackId"
      @view-bins="handleViewBins"
      @destack="handleDestack"
    />
  </div>
</template>

<script>
import StackDetailDrawer from './components/StackDetailDrawer.vue'

export default {
  components: {
    StackDetailDrawer
  },

  data() {
    return {
      detailDrawerVisible: false,
      currentStackId: ''
    }
  },

  methods: {
    handleView(stack) {
      this.currentStackId = stack.id
      this.detailDrawerVisible = true
    },

    handleViewBins(stack) {
      // 打开料框列表对话框
      console.log('查看成员料框:', stack)
    },

    handleDestack(stack) {
      // 打开拆垛对话框
      console.log('拆垛:', stack)
    }
  }
}
</script>
```

### 完整示例（在料垛管理主页面中）

```vue
<template>
  <div class="stack-management">
    <!-- 料垛表格 -->
    <stack-table
      :data="tableData"
      @view="handleView"
    />

    <!-- 料垛详情抽屉 -->
    <stack-detail-drawer
      :visible.sync="stackDetailDrawerVisible"
      :stack-id="currentStackId"
      @view-bins="handleViewBinsFromDetail"
      @destack="handleDestackFromDetail"
    />

    <!-- 成员料框对话框 -->
    <stack-bins-dialog
      :visible.sync="stackBinsDialogVisible"
      :stack="currentStack"
    />

    <!-- 拆垛对话框 -->
    <destack-dialog
      :visible.sync="destackDialogVisible"
      :stack="currentStack"
      @destacked="handleDestackSuccess"
    />
  </div>
</template>

<script>
export default {
  data() {
    return {
      stackDetailDrawerVisible: false,
      stackBinsDialogVisible: false,
      destackDialogVisible: false,
      currentStackId: '',
      currentStack: null
    }
  },

  methods: {
    // 打开详情抽屉
    handleView(stack) {
      this.currentStackId = stack.id
      this.stackDetailDrawerVisible = true
    },

    // 从详情抽屉查看成员料框
    handleViewBinsFromDetail(stack) {
      this.currentStack = stack
      this.stackBinsDialogVisible = true
    },

    // 从详情抽屉拆垛
    handleDestackFromDetail(stack) {
      this.currentStack = stack
      this.destackDialogVisible = true
    },

    // 拆垛成功回调
    handleDestackSuccess() {
      // 刷新列表
      this.fetchList()
      // 关闭对话框
      this.destackDialogVisible = false
      // 关闭详情抽屉
      this.stackDetailDrawerVisible = false
    }
  }
}
</script>
```

## 🎨 样式说明

### 布局结构

```scss
.stack-detail-section {
  margin-bottom: 24px;  // 各区块间距

  .section-title {
    display: flex;
    justify-content: space-between;  // 标题和操作按钮两端对齐
    align-items: center;
    margin-bottom: 16px;
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;  // 按钮右对齐
  gap: 12px;  // 按钮间距
}
```

### Element UI 样式覆盖

```scss
::v-deep .el-descriptions {
  .el-descriptions__title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 16px;
  }

  .el-descriptions-item__label {
    font-weight: 500;  // 标签字体加粗
  }
}
```

## 🔍 数据流向

```
1. 用户点击表格"查看"按钮
   ↓
2. 触发 handleView(stack)
   ↓
3. 设置 currentStackId = stack.id
   ↓
4. 设置 stackDetailDrawerVisible = true
   ↓
5. 抽屉打开，watch.visible 触发
   ↓
6. 调用 fetchStackDetail() 获取详情
   ↓
7. 调用 API: GET /v1/inv/stacks/:id
   ↓
8. 接收响应，渲染详情数据
   ↓
9. 用户可执行快捷操作:
   - 查看成员料框 → emit('view-bins')
   - 拆垛 → emit('destack')
```

## ⚠️ 注意事项

1. **必须传入有效的 stackId**
   - stackId 必须是有效的 UUID 格式
   - 如果 stackId 为空，会显示警告并不调用接口

2. **关联对象字段**
   - `currentLocation`、`stacker`、`destacker` 等关联对象的字段结构取决于后端 include 配置
   - 组件实现了多层降级处理，确保即使部分字段缺失也能正常显示

3. **状态判断**
   - "拆垛"按钮仅在料垛状态为 `ACTIVE` 时显示
   - 成员料框列表提示也仅在 `ACTIVE` 状态时显示

4. **事件传递**
   - 从详情抽屉触发的操作（查看料框、拆垛）会 emit 事件到父组件
   - 父组件需要监听这些事件并打开相应的对话框

## 📊 性能优化

1. **按需加载**: 仅在抽屉打开时才调用接口获取数据
2. **数据缓存**: 关闭抽屉时清空数据，避免内存占用
3. **错误处理**: 接口失败时自动关闭抽屉，避免显示空白内容

## 🎯 未来增强

1. **编辑功能**: 可添加编辑按钮，允许修改料垛备注
2. **打印功能**: 添加打印/导出料垛详情功能
3. **历史记录**: 显示料垛的操作历史记录
4. **关联查询**: 增加快速查询关联规格、产品的功能

---

**创建日期**: 2025-10-12
**最后更新**: 2025-10-12
**维护人员**: AI Assistant

