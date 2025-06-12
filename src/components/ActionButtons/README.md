# ActionButtons 操作按钮组组件

现代化的操作按钮组组件，提供统一的表格操作按钮布局，支持自定义按钮、权限控制、错误处理和无障碍访问。

## ✨ 核心特性

### 🚀 性能优化
- **防抖保护**：内置防抖机制，防止重复点击
- **智能缓存**：computed属性缓存，避免不必要的重复计算
- **内存管理**：自动清理定时器和事件监听器

### 🛡️ 容错设计
- **错误边界**：自动捕获和处理按钮错误
- **类型安全**：严格的Props验证和类型检查
- **优雅降级**：异常情况下的备用UI

### 📱 用户体验
- **即时反馈**：加载状态、操作反馈
- **无障碍访问**：ARIA标签、键盘导航支持
- **响应式设计**：多设备适配

### 🎨 现代UI
- **统一设计**：遵循设计系统规范
- **动效交互**：流畅的过渡动画
- **主题支持**：支持多种视觉主题

## 📦 安装使用

### 基础引入
```javascript
import ActionButtons from '@/components/ActionButtons'
import { generateTableButtons } from '@/components/ActionButtons/presets'

export default {
  components: {
    ActionButtons
  }
}
```

### 全局注册
```javascript
// main.js
import ActionButtons from '@/components/ActionButtons'
Vue.component('ActionButtons', ActionButtons)
```

## 🔧 API 文档

### Props

| 属性 | 类型 | 默认值 | 说明 |
|-----|------|--------|------|
| buttons | Array | [] | 按钮配置数组 |
| size | String | 'mini' | 按钮尺寸：medium/small/mini |
| mode | String | 'normal' | 显示模式：normal/text |
| row | Object | null | 当前行数据（表格中使用） |
| maxVisible | Number | 3 | 最大显示按钮数 |
| showTooltip | Boolean | false | 是否显示提示信息 |
| debounceDelay | Number | 300 | 防抖延迟时间（毫秒） |
| ariaLabel | String | '操作按钮组' | 无障碍标签 |
| permissionChecker | Function | null | 权限检查函数 |

### Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| click | {action, row, parentAction} | 按钮点击事件 |
| button-error | errorInfo | 按钮错误事件 |

### 按钮配置对象

```typescript
interface ButtonConfig {
  text: string              // 按钮文本
  action: string           // 操作标识
  icon?: string           // 图标类名
  type?: string           // 按钮类型
  class?: string          // 自定义样式类
  tooltip?: string        // 提示信息
  ariaLabel?: string      // 无障碍标签
  disabled?: boolean      // 是否禁用
  loading?: boolean       // 是否加载中
  showLoading?: boolean   // 是否显示加载状态
  debounce?: boolean      // 是否防抖
  permission?: string     // 权限标识
  condition?: Function    // 显示条件函数
  onClick?: Function      // 点击处理函数
  children?: Array        // 子菜单项（下拉按钮）
}
```

## 🚀 快速开始

### 基础用法

```vue
<template>
  <ActionButtons 
    :buttons="buttons"
    :row="currentRow"
    @click="handleAction"
  />
</template>

<script>
export default {
  data() {
    return {
      currentRow: { id: 1, name: '示例', status: 1 },
      buttons: [
        {
          text: '查看',
          action: 'view',
          icon: 'el-icon-view',
          type: 'text'
        },
        {
          text: '编辑',
          action: 'edit', 
          icon: 'el-icon-edit',
          type: 'text'
        },
        {
          text: '删除',
          action: 'delete',
          icon: 'el-icon-delete',
          type: 'text',
          class: 'danger-button'
        }
      ]
    }
  },
  methods: {
    handleAction({ action, row }) {
      console.log(`执行${action}操作`, row)
    }
  }
}
</script>
```

### 使用预设配置

```vue
<template>
  <ActionButtons 
    :buttons="tableButtons"
    :row="row"
    mode="text"
    :show-tooltip="true"
    @click="handleTableAction"
  />
</template>

<script>
import { generateTableButtons } from '@/components/ActionButtons/presets'

export default {
  data() {
    return {
      row: { id: 1, status: 1 }
    }
  },
  computed: {
    tableButtons() {
      return generateTableButtons({
        showView: true,
        showEdit: true,
        showDelete: true,
        showEnable: true,
        showDisable: true,
        disabled: false,
        size: 'mini',
        showTooltip: true,
        permissions: {
          edit: 'user:edit',
          delete: 'user:delete'
        },
        conditions: {
          edit: row => !row.readonly,
          delete: row => !row.permanent
        }
      })
    }
  },
  methods: {
    async handleTableAction({ action, row }) {
      switch(action) {
        case 'view':
          this.$router.push(`/detail/${row.id}`)
          break
        case 'edit':
          this.$router.push(`/edit/${row.id}`)
          break
        case 'delete':
          await this.deleteItem(row.id)
          break
      }
    },
    
    async deleteItem(id) {
      try {
        await this.$confirm('确定删除吗？', '提示')
        await api.delete(id)
        this.$message.success('删除成功')
        this.$emit('refresh')
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('删除失败')
        }
      }
    }
  }
}
</script>
```

## 🎯 使用场景

### 1. 表格操作列

```vue
<template>
  <el-table :data="tableData">
    <el-table-column label="姓名" prop="name" />
    <el-table-column label="状态" prop="status" />
    <el-table-column label="操作" width="200">
      <template slot-scope="{ row }">
        <ActionButtons 
          :buttons="getTableButtons(row)"
          :row="row"
          mode="text"
          :max-visible="3"
          @click="handleRowAction"
        />
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import { generateTableButtons, CommonButtons } from '@/components/ActionButtons/presets'

export default {
  methods: {
    getTableButtons(row) {
      return generateTableButtons({
        showView: true,
        showEdit: this.canEdit(row),
        showDelete: this.canDelete(row),
        showEnable: row.status === 0,
        showDisable: row.status === 1,
        disabled: row.processing
      })
    },
    
    canEdit(row) {
      return !row.readonly && this.$hasPermission('user:edit')
    },
    
    canDelete(row) {
      return !row.permanent && this.$hasPermission('user:delete')
    }
  }
}
</script>
```

### 2. 表单操作

```vue
<template>
  <el-form :model="form" ref="form">
    <!-- 表单内容 -->
    
    <div class="form-actions">
      <ActionButtons 
        :buttons="formButtons"
        @click="handleFormAction"
      />
    </div>
  </el-form>
</template>

<script>
import { generateFormButtons } from '@/components/ActionButtons/presets'

export default {
  data() {
    return {
      form: {},
      loading: false,
      isDirty: false
    }
  },
  computed: {
    formButtons() {
      return generateFormButtons({
        showSubmit: true,
        showCancel: true,
        showReset: true,
        showSave: true,
        isValid: this.isFormValid,
        isLoading: this.loading,
        isDirty: this.isDirty
      })
    }
  },
  methods: {
    async handleFormAction({ action }) {
      switch(action) {
        case 'submit':
          await this.submitForm()
          break
        case 'save':
          await this.saveDraft()
          break
        case 'cancel':
          this.$router.back()
          break
        case 'reset':
          this.$refs.form.resetFields()
          break
      }
    }
  }
}
</script>
```

### 3. 审批操作

```vue
<template>
  <ActionButtons 
    :buttons="approvalButtons"
    :row="application"
    @click="handleApproval"
  />
</template>

<script>
import { generateApprovalButtons } from '@/components/ActionButtons/presets'

export default {
  computed: {
    approvalButtons() {
      return generateApprovalButtons({
        showApprove: this.canApprove,
        showReject: this.canReject,
        showTransfer: this.canTransfer,
        canApprove: this.application.status === 'pending',
        canReject: this.application.status === 'pending'
      })
    }
  },
  methods: {
    async handleApproval({ action, row }) {
      const handlers = {
        approve: () => this.approveApplication(row.id),
        reject: () => this.rejectApplication(row.id),
        transfer: () => this.transferApplication(row.id)
      }
      
      await handlers[action]?.()
    }
  }
}
</script>
```

### 4. 批量操作

```vue
<template>
  <div>
    <!-- 批量操作按钮 -->
    <ActionButtons 
      :buttons="batchButtons"
      @click="handleBatchAction"
    />
    
    <!-- 表格 -->
    <el-table :data="tableData" @selection-change="handleSelectionChange">
      <el-table-column type="selection" />
      <!-- 其他列 -->
    </el-table>
  </div>
</template>

<script>
import { generateBatchButtons } from '@/components/ActionButtons/presets'

export default {
  data() {
    return {
      selectedRows: []
    }
  },
  computed: {
    batchButtons() {
      return generateBatchButtons({
        selectedCount: this.selectedRows.length,
        showBatchDelete: true,
        showBatchExport: true,
        showBatchEnable: true,
        showBatchDisable: true
      })
    }
  },
  methods: {
    handleSelectionChange(selection) {
      this.selectedRows = selection
    },
    
    async handleBatchAction({ action }) {
      const ids = this.selectedRows.map(row => row.id)
      
      switch(action) {
        case 'batch-delete':
          await this.batchDelete(ids)
          break
        case 'batch-export':
          await this.batchExport(ids)
          break
      }
    }
  }
}
</script>
```

## 🔧 高级配置

### 权限控制

```vue
<template>
  <ActionButtons 
    :buttons="buttons"
    :permission-checker="checkPermission"
    @click="handleAction"
  />
</template>

<script>
export default {
  data() {
    return {
      buttons: [
        {
          text: '编辑',
          action: 'edit',
          permission: 'user:edit'
        },
        {
          text: '删除', 
          action: 'delete',
          permission: 'user:delete'
        }
      ]
    }
  },
  methods: {
    checkPermission(permission) {
      return this.$store.getters.permissions.includes(permission)
    }
  }
}
</script>
```

### 自定义样式

```vue
<style lang="scss" scoped>
.action-buttons {
  // 自定义间距
  gap: 12px;
  
  // 自定义按钮样式
  .el-button {
    &.custom-primary {
      background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
      border: none;
      color: white;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
      }
    }
  }
}
</style>
```

### 错误处理

```vue
<template>
  <ActionButtons 
    :buttons="buttons"
    @click="handleAction"
    @button-error="handleButtonError"
  />
</template>

<script>
export default {
  methods: {
    async handleAction({ action, row }) {
      try {
        await this.performAction(action, row)
      } catch (error) {
        this.$message.error(`操作失败: ${error.message}`)
      }
    },
    
    handleButtonError(errorInfo) {
      console.error('按钮错误:', errorInfo)
      this.$message.error('按钮功能暂时不可用')
      
      // 错误上报
      this.$errorReporter.report(errorInfo)
    }
  }
}
</script>
```

## 🎨 样式自定义

### CSS变量

```css
:root {
  --action-button-gap: 8px;
  --action-button-radius: 6px;
  --action-button-transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  --action-button-hover-transform: translateY(-1px);
  --action-button-hover-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
}
```

### 主题定制

```scss
.action-buttons {
  &.theme-dark {
    .el-button {
      background: #2d3748;
      color: #e2e8f0;
      border-color: #4a5568;
      
      &:hover {
        background: #4a5568;
        border-color: #718096;
      }
    }
  }
  
  &.theme-compact {
    gap: 4px;
    
    .el-button {
      padding: 4px 8px;
      font-size: 12px;
    }
  }
}
```

## 📚 最佳实践

### 1. 性能优化
- 使用computed属性缓存按钮配置
- 避免在render函数中创建新对象
- 合理使用防抖延迟时间

### 2. 用户体验
- 提供清晰的操作反馈
- 使用有意义的图标和文本
- 支持键盘导航

### 3. 可维护性
- 使用预设配置减少重复代码
- 统一错误处理机制
- 详细的注释和文档

### 4. 无障碍访问
- 提供ARIA标签
- 确保键盘可访问
- 支持屏幕阅读器

## 🔍 故障排除

### 常见问题

1. **按钮不显示**
   - 检查权限配置
   - 检查条件函数返回值
   - 检查按钮配置格式

2. **点击无反应**
   - 检查事件监听器
   - 检查防抖配置
   - 检查按钮禁用状态

3. **样式异常**
   - 检查CSS作用域
   - 检查样式类名冲突
   - 检查响应式配置

### 调试技巧

```javascript
// 开启调试模式
export default {
  created() {
    if (process.env.NODE_ENV === 'development') {
      console.log('ActionButtons props:', this.$props)
      console.log('Filtered buttons:', this.filteredButtons)
    }
  }
}
```

## 📈 更新日志

### v2.0.0 (现代化升级版)
- ✨ 新增防抖保护机制
- ✨ 新增错误边界处理
- ✨ 新增无障碍访问支持
- ✨ 新增响应式设计
- ✨ 新增现代化UI样式
- 🐛 修复内存泄漏问题
- 📚 完善文档和示例

### v1.0.0 (基础版本)
- ✨ 基础按钮组功能
- ✨ 权限控制
- ✨ 下拉菜单支持 