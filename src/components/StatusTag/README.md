# StatusTag 状态标签组件

一个灵活强大的状态标签组件，支持自定义文本、类型、颜色和图标映射，内置现代化优化功能。

## ✨ 特性

### 📦 基础功能
- ✅ 完全兼容Element UI Tag组件API
- ✅ 支持文本、类型、颜色、图标映射
- ✅ 提供丰富的预设状态配置
- ✅ 支持自定义样式和尺寸
- ✅ 响应式设计，移动端友好

### 🚀 现代化增强 (启用 `enableModernFeatures`)
- 🛡️ **错误边界保护** - 自动捕获和处理组件错误
- ⚡ **防抖点击** - 避免快速点击导致的重复操作
- 🎯 **状态管理** - 完善的错误状态和点击计数
- 🔧 **性能优化** - 智能缓存和计算属性优化
- ♿ **可访问性支持** - 符合WCAG标准的无障碍设计
- 📊 **调试支持** - 内置错误上报和状态监控

## 📦 安装

该组件已全局注册，可直接使用：

```vue
<template>
  <StatusTag 
    :status="1" 
    :text-map="{ 0: '禁用', 1: '启用' }" 
    :type-map="{ 0: 'info', 1: 'success' }"
  />
</template>
```

## 🎯 基础用法

### 最简单的状态标签

```vue
<template>
  <div>
    <!-- 基础用法 -->
    <StatusTag 
      :status="1" 
      :text-map="{ 0: '禁用', 1: '启用' }" 
      :type-map="{ 0: 'info', 1: 'success' }"
    />
    
    <!-- 带图标 -->
    <StatusTag 
      :status="true" 
      :text-map="{ false: '关闭', true: '开启' }" 
      :type-map="{ false: 'danger', true: 'success' }"
      :icon-map="{ false: 'el-icon-close', true: 'el-icon-check' }"
    />
  </div>
</template>
```

### 使用预设配置

```vue
<template>
  <div>
    <!-- 产品生命周期状态 -->
    <StatusTag 
      :status="'production'" 
      :text-map="productLifecycleMap.textMap" 
      :type-map="productLifecycleMap.typeMap"
      :icon-map="productLifecycleMap.iconMap"
    />
    
    <!-- 审核状态 -->
    <StatusTag 
      :status="'approved'" 
      :text-map="auditStatusMap.textMap" 
      :type-map="auditStatusMap.typeMap"
      :icon-map="auditStatusMap.iconMap"
    />
  </div>
</template>

<script>
import { productLifecycleMap, auditStatusMap } from '@/components/StatusTag/types'

export default {
  data() {
    return {
      productLifecycleMap,
      auditStatusMap
    }
  }
}
</script>
```

### 现代化功能示例

```vue
<template>
  <div>
    <!-- 可点击的状态标签 -->
    <StatusTag 
      :status="'clickable'" 
      :text-map="{ 'clickable': '点击我' }" 
      :type-map="{ 'clickable': 'primary' }"
      :enable-modern-features="true"
      :clickable="true"
      :click-debounce-delay="500"
      @click="handleStatusClick"
      @error="handleStatusError"
    />
    
    <!-- 可关闭的状态标签 -->
    <StatusTag 
      :status="'closable'" 
      :text-map="{ 'closable': '可关闭' }" 
      :type-map="{ 'closable': 'warning' }"
      :closable="true"
      @close="handleStatusClose"
    />
  </div>
</template>

<script>
export default {
  methods: {
    handleStatusClick(data) {
      console.log('状态标签被点击:', data)
      this.$message.success(`点击了: ${data.displayText}`)
    },
    
    handleStatusError(errorInfo) {
      console.error('状态标签错误:', errorInfo)
      this.$message.error('组件发生错误')
    },
    
    handleStatusClose(data) {
      console.log('状态标签被关闭:', data)
    }
  }
}
</script>
```

## 📋 API 文档

### Props

| 属性名 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| status | 状态值（必填） | String/Number/Boolean | - | - |
| textMap | 状态文本映射 | Object | - | {} |
| typeMap | 状态类型映射 | Object | success/info/warning/danger/primary | {} |
| colorMap | 状态颜色映射（优先级高于typeMap） | Object | - | {} |
| iconMap | 状态图标映射 | Object | - | {} |
| effect | 标签主题 | String | dark/light/plain | light |
| size | 标签大小 | String | medium/small/mini | small |
| hit | 是否有边框描边 | Boolean | - | false |
| closable | 是否可关闭 | Boolean | - | false |
| disableTransitions | 是否禁用渐变动画 | Boolean | - | false |
| defaultText | 默认显示文本 | String | - | '' |
| defaultType | 默认标签类型 | String | success/info/warning/danger/primary | info |
| enableModernFeatures | 是否启用现代化特性 | Boolean | - | false |
| clickDebounceDelay | 点击防抖延迟(ms) | Number | 0-5000 | 300 |
| errorFallbackText | 错误后备显示文本 | String | - | '错误' |
| customClass | 自定义CSS类名 | String/Array/Object | - | '' |
| clickable | 是否可点击 | Boolean | - | false |
| maxTextLength | 最大显示文本长度 | Number | ≥0 | 0 |

### Events

| 事件名 | 说明 | 回调参数 |
|------|------|------|
| click | 点击标签时触发（需设置clickable为true） | { status, displayText, tagType, event, clickCount } |
| close | 点击关闭按钮时触发（需设置closable为true） | { status, displayText, event } |
| error | 组件发生错误时触发 | { message, context, timestamp, status } |
| error-reset | 错误状态重置时触发 | - |

### Methods

| 方法名 | 说明 | 参数 | 返回值 |
|------|------|------|-------|
| getStatusInfo | 获取组件状态信息 | - | { status, displayText, tagType, customColor, iconClass, hasError, errorInfo, clickCount } |
| resetError | 重置错误状态 | - | - |

## 🎨 预设配置

项目提供了多种预设状态映射，覆盖常见业务场景：

### 基础状态
- `enabledStatusMap` - 启用/禁用状态
- `auditStatusMap` - 审核状态
- `priorityMap` - 优先级状态
- `progressStatusMap` - 进度状态

### 业务状态
- `productLifecycleMap` - 产品生命周期
- `deviceStatusMap` - 设备状态
- `orderStatusMap` - 订单状态
- `userStatusMap` - 用户状态
- `qualityStatusMap` - 质量状态
- `inventoryStatusMap` - 库存状态
- `networkStatusMap` - 网络状态
- `syncStatusMap` - 同步状态

### 使用预设配置

```vue
<script>
import { 
  enabledStatusMap, 
  deviceStatusMap, 
  priorityMap 
} from '@/components/StatusTag/types'

export default {
  data() {
    return {
      enabledStatusMap,
      deviceStatusMap,
      priorityMap
    }
  }
}
</script>
```

## 🛠️ 工具函数

### createStatusMap

创建自定义状态映射：

```javascript
import { createStatusMap } from '@/components/StatusTag/types'

const customStatusMap = createStatusMap({
  statuses: [
    { key: 'active', text: '活跃', type: 'success', icon: 'el-icon-check' },
    { key: 'inactive', text: '非活跃', type: 'info', icon: 'el-icon-minus' }
  ],
  textPrefix: '状态:',
  typeDefault: 'primary',
  iconDefault: 'el-icon-info'
})
```

### mergeStatusMaps

合并多个状态映射：

```javascript
import { mergeStatusMaps, enabledStatusMap, priorityMap } from '@/components/StatusTag/types'

const combinedMap = mergeStatusMaps(enabledStatusMap, priorityMap)
```

### getAllPresetMaps

获取所有预设映射：

```javascript
import { getAllPresetMaps } from '@/components/StatusTag/types'

const allMaps = getAllPresetMaps()
console.log(allMaps) // 包含所有预设映射的对象
```

## 💡 使用场景

### 1. 表格中的状态列

```vue
<template>
  <el-table :data="tableData">
    <el-table-column prop="status" label="状态">
      <template slot-scope="scope">
        <StatusTag 
          :status="scope.row.status" 
          :text-map="deviceStatusMap.textMap" 
          :type-map="deviceStatusMap.typeMap"
          :icon-map="deviceStatusMap.iconMap"
        />
      </template>
    </el-table-column>
  </el-table>
</template>
```

### 2. 卡片中的状态展示

```vue
<template>
  <el-card>
    <div slot="header">
      <span>设备信息</span>
      <StatusTag 
        :status="device.status" 
        :text-map="deviceStatusMap.textMap" 
        :type-map="deviceStatusMap.typeMap"
        style="float: right;"
      />
    </div>
    <p>设备详细信息...</p>
  </el-card>
</template>
```

### 3. 表单中的状态选择

```vue
<template>
  <el-form>
    <el-form-item label="状态预览">
      <div class="status-preview">
        <StatusTag 
          v-for="status in statusOptions"
          :key="status.value"
          :status="status.value" 
          :text-map="statusTextMap" 
          :type-map="statusTypeMap"
          :custom-class="{ active: formData.status === status.value }"
          :clickable="true"
          @click="selectStatus"
        />
      </div>
    </el-form-item>
  </el-form>
</template>
```

## 🔧 高级用法

### 错误处理和监控

```vue
<template>
  <StatusTag 
    :status="dynamicStatus" 
    :text-map="statusMap"
    :enable-modern-features="true"
    @error="handleComponentError"
    ref="statusTag"
  />
</template>

<script>
export default {
  methods: {
    handleComponentError(errorInfo) {
      // 错误上报
      this.$report.error('StatusTag组件错误', {
        component: 'StatusTag',
        errorInfo,
        context: this.$route.path
      })
      
      // 错误恢复
      this.$nextTick(() => {
        this.$refs.statusTag.resetError()
      })
    },
    
    getComponentStatus() {
      return this.$refs.statusTag.getStatusInfo()
    }
  }
}
</script>
```

### 性能优化

```vue
<template>
  <div>
    <!-- 大量标签时启用虚拟化 -->
    <virtual-list
      v-if="statusList.length > 1000"
      :data-key="'id'"
      :data-sources="statusList"
      :data-component="statusTagComponent"
      :keeps="50"
    />
    
    <!-- 少量标签正常渲染 -->
    <StatusTag 
      v-else
      v-for="item in statusList"
      :key="item.id"
      :status="item.status" 
      :text-map="statusTextMap" 
      :type-map="statusTypeMap"
    />
  </div>
</template>

<script>
export default {
  data() {
    return {
      statusTagComponent: 'StatusTag'
    }
  }
}
</script>
```

## 🎯 最佳实践

### 1. 状态映射管理
- 将状态映射定义在常量文件中，便于维护
- 使用有意义的状态值，避免使用数字或无意义字符串
- 为每个状态提供图标，提升用户体验

### 2. 性能优化
- 大量标签时启用现代化特性的防抖功能
- 使用Object.freeze冻结大型状态映射对象
- 避免在模板中进行复杂计算

### 3. 错误处理
- 始终提供默认值和后备方案
- 在生产环境中启用错误上报
- 为异常状态提供用户友好的提示

### 4. 可访问性
- 为状态标签提供明确的文本描述
- 使用合适的颜色对比度
- 支持键盘导航和屏幕阅读器

### 5. 移动端适配
- 在移动设备上使用较小的尺寸
- 确保点击区域足够大（至少44px）
- 考虑手势操作的友好性

## 🚨 注意事项

1. **状态值限制**：status不能为null或undefined，会导致显示异常
2. **映射对象格式**：确保textMap、typeMap等为有效的对象格式
3. **性能考虑**：大量标签场景下建议启用现代化特性和虚拟化
4. **版本兼容**：现代化特性需要Vue 2.6+和项目内的utils工具支持
5. **浏览器支持**：部分现代特性需要现代浏览器支持

## 📱 演示示例

访问 [组件演示页面](/components/status-tag) 查看完整的功能演示和使用示例。

## 🤝 贡献指南

如果您发现问题或有改进建议：

1. 在项目中创建Issue描述问题
2. Fork项目并创建新分支
3. 提交您的改进代码
4. 创建Pull Request

## 📄 更新日志

### v2.0.0 (2024-12-19)
- ✨ 新增现代化特性支持
- ✨ 新增错误边界保护
- ✨ 新增防抖点击功能
- ✨ 新增图标映射支持
- ✨ 新增可关闭标签功能
- ✨ 扩展预设状态映射
- 🐛 修复状态值为0或false时的显示问题
- 🔧 优化Props验证和类型检查
- 📱 改进移动端响应式设计

### v1.0.0 (2023-11-20)
- ✨ 初始版本发布
- ✨ 基础状态标签功能
- ✨ 预设状态映射配置 