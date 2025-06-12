# 导出按钮组件 (ExportButton)

## 简介

ExportButton是一个现代化的通用表格数据导出组件，提供将表格数据导出为Excel文件的功能。组件采用现代前端开发范式，支持防抖保护、错误重试、请求取消、内存管理等高级特性，同时保持向后兼容性。

## 功能特点

### 核心功能
- 支持自定义导出API和参数
- 支持自定义文件名和文件类型
- 支持导出前确认
- 提供加载状态和错误处理
- 支持自定义按钮样式和图标
- 完全兼容Element UI风格
- 支持Mock环境和实际生产环境

### 现代化特性 🚀
- **防抖保护**：防止用户快速重复点击（可自定义延迟时间）
- **请求取消**：支持取消进行中的导出操作（AbortController）
- **智能重试**：自动识别可重试错误并提供重试选项
- **内存管理**：自动清理创建的URL对象，防止内存泄漏
- **类型验证**：严格的Props类型验证和错误提示
- **错误分类**：区分不同类型的错误并提供针对性提示
- **浏览器兼容**：支持IE和现代浏览器的文件下载
- **向后兼容**：通过特性开关确保现有代码无需修改

## 使用方法

### 基本使用（兼容模式）

```vue
<template>
  <export-button
    :export-api="exportWarehouseData"
    :params="listQuery"
    filename="仓库数据"
  />
</template>

<script>
import ExportButton from '@/components/ExportButton'
import { exportWarehouseData } from '@/api/master-data/warehouse'

export default {
  components: {
    ExportButton
  },
  data() {
    return {
      listQuery: {
        // 导出查询参数
      }
    }
  }
}
</script>
```

### 现代化特性使用

```vue
<template>
  <export-button
    :export-api="exportProductData"
    :params="exportParams"
    filename="产品数据"
    text="导出Excel"
    icon="el-icon-document"
    type="success"
    size="mini"
    :need-confirm="false"
    :enable-modern-features="true"
    :debounce-delay="300"
    :timeout="60000"
    @export-success="handleExportSuccess"
    @export-error="handleExportError"
    @export-start="handleExportStart"
  />
</template>

<script>
export default {
  methods: {
    handleExportStart(params) {
      console.log('开始导出，参数:', params)
    },
    
    handleExportSuccess({ filename, size, isMock }) {
      if (isMock) {
        console.log('Mock环境导出成功')
      } else {
        console.log(`导出成功: ${filename}, 大小: ${size} bytes`)
      }
    },
    
    handleExportError(error) {
      console.error('导出失败:', error)
      // 可以在这里进行错误上报
    }
  }
}
</script>
```

### 高级用法：可取消导出

```vue
<template>
  <div>
    <export-button
      ref="exportBtn"
      :export-api="exportLargeData"
      :params="exportParams"
      filename="大数据文件"
      :enable-modern-features="true"
      :timeout="300000"
      @export-start="exportStarted = true"
      @export-complete="exportStarted = false"
    />
    
    <el-button 
      v-if="exportStarted" 
      type="danger" 
      size="small"
      @click="cancelExport"
    >
      取消导出
    </el-button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      exportStarted: false
    }
  },
  methods: {
    cancelExport() {
      this.$refs.exportBtn.cancelExport()
    }
  }
}
</script>
```

## Props

### 基础属性

| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| exportApi | Function | 必填 | 导出API方法，接收参数并返回Promise |
| params | Object | {} | 导出参数，会传递给exportApi |
| filename | String | '导出数据' | 导出文件名（不含扩展名） |
| fileType | String | 'xlsx' | 文件类型（扩展名，不含点号） |
| text | String | '导出' | 按钮文本 |
| icon | String | 'el-icon-download' | 按钮图标 |
| type | String | 'primary' | 按钮类型，同Element UI Button组件 |
| size | String | 'small' | 按钮大小，同Element UI Button组件 |
| disabled | Boolean | false | 是否禁用 |

### 交互属性

| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| needConfirm | Boolean | true | 导出前是否需要确认 |
| confirmText | String | '确认导出当前筛选条件下的所有数据吗？' | 确认提示文本 |
| successText | String | '导出成功' | 导出成功提示文本 |
| errorText | String | '导出失败' | 导出失败提示文本 |

### 技术属性

| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| mimeType | String | 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' | 导出文件的MIME类型 |

### 现代化特性属性 🚀

| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| enableModernFeatures | Boolean | false | 是否启用现代化特性 |
| debounceDelay | Number | 500 | 防抖延迟时间（毫秒，0-5000） |
| timeout | Number | 30000 | 请求超时时间（毫秒，最长5分钟） |

## 事件

| 事件名 | 说明 | 参数 |
| --- | --- | --- |
| export-start | 开始导出时触发 | params: 导出参数 |
| export-success | 导出成功时触发 | {filename, size?, isMock} |
| export-error | 导出失败时触发 | error: 错误对象 |
| export-complete | 导出完成时触发（无论成功失败） | - |
| cancel | 用户取消导出时触发 | - |

## 方法

| 方法名 | 说明 | 参数 |
| --- | --- | --- |
| cancelExport | 取消正在进行的导出（仅现代化模式） | - |

## Props验证

组件提供严格的Props验证，包括：

- **exportApi**: 必须是函数类型
- **params**: 必须是对象类型
- **filename**: 不能包含非法字符 `<>:"/\|?*`
- **fileType**: 支持类型检查，推荐使用 `xlsx`, `xls`, `csv`, `pdf`
- **type**: 验证Element UI按钮类型
- **size**: 验证Element UI按钮大小
- **debounceDelay**: 范围验证 0-5000ms
- **timeout**: 范围验证 1-300000ms（最长5分钟）

## 错误处理

### 错误类型识别

组件能够智能识别不同类型的错误：

- **AbortError**: 用户主动取消
- **Timeout**: 请求超时
- **HTTP 5xx**: 服务器错误（提供重试）
- **HTTP 403**: 权限错误
- **HTTP 404**: 接口不存在
- **NETWORK_ERROR**: 网络错误（提供重试）

### 重试机制

现代化模式下，对于可重试的错误会自动提供重试选项：

```javascript
// 可重试错误类型
- 服务器错误 (HTTP 5xx)
- 网络错误 (NETWORK_ERROR)
- 请求超时 (Timeout)
```

## 最佳实践

### 1. 渐进式采用现代化特性

```vue
<!-- 第一步：保持现有代码不变 -->
<export-button :export-api="api" :params="params" />

<!-- 第二步：启用现代化特性 -->
<export-button 
  :export-api="api" 
  :params="params" 
  :enable-modern-features="true" 
/>

<!-- 第三步：根据需要调整参数 -->
<export-button 
  :export-api="api" 
  :params="params" 
  :enable-modern-features="true"
  :debounce-delay="300"
  :timeout="60000"
/>
```

### 2. API设计规范

```javascript
// 推荐的API设计
export async function exportData(params) {
  return request({
    url: '/api/export',
    method: 'post',
    data: params,
    responseType: 'blob', // 重要：设置响应类型
    timeout: params.timeout || 30000
  })
}

// 现代化API设计（支持取消）
export async function exportDataModern(params) {
  return request({
    url: '/api/export',
    method: 'post',
    data: params,
    responseType: 'blob',
    signal: params.signal, // 支持AbortController
    timeout: params.timeout || 30000
  })
}
```

### 3. 错误处理最佳实践

```vue
<template>
  <export-button
    :export-api="exportData"
    :params="getExportParams()"
    :enable-modern-features="true"
    @export-error="handleExportError"
  />
</template>

<script>
export default {
  methods: {
    getExportParams() {
      // 移除分页参数，只传递筛选条件
      const { page, limit, ...filterParams } = this.listQuery
      return filterParams
    },
    
    handleExportError(error) {
      // 错误上报
      if (window.errorReporter) {
        window.errorReporter.captureException(error, {
          tags: { component: 'ExportButton' },
          extra: { params: this.getExportParams() }
        })
      }
    }
  }
}
</script>
```

### 4. 性能优化建议

```vue
<template>
  <!-- 大文件导出使用更长的超时时间 -->
  <export-button
    :export-api="exportLargeFile"
    :params="params"
    :timeout="300000"
    :enable-modern-features="true"
    filename="大数据报表"
  />
  
  <!-- 频繁操作使用更短的防抖时间 -->
  <export-button
    :export-api="exportQuickData"
    :params="params"
    :debounce-delay="200"
    :enable-modern-features="true"
  />
</template>
```

## 注意事项

### 1. API要求
- exportApi需要返回一个Promise
- 响应数据应该是二进制数据流（blob）
- 需要在API请求时设置 `responseType: 'blob'`

### 2. Mock环境
- Mock API应返回包含 `'export-success'` 字符串的响应
- 组件会自动识别Mock环境并显示相应提示

### 3. 浏览器兼容性
- 现代化特性需要支持AbortController的浏览器
- IE浏览器会自动使用兼容模式
- 所有浏览器都支持基础导出功能

### 4. 内存管理
- 组件会自动清理创建的URL对象
- 在组件销毁时会自动取消进行中的请求
- 防抖函数会在组件销毁时自动清理

## 集成示例

### 与TableToolbar集成

```vue
<template>
  <table-toolbar>
    <template #toolbar-right>
      <export-button
        :export-api="exportData"
        :params="exportParams"
        :filename="moduleName + '数据'"
        :enable-modern-features="true"
      />
    </template>
  </table-toolbar>
</template>
```

### 与列表页面集成

```vue
<template>
  <div class="app-container">
    <div class="toolbar">
      <export-button
        :export-api="exportWarehouseData"
        :params="getExportParams()"
        filename="仓库数据"
        :enable-modern-features="true"
        @export-success="handleExportSuccess"
        @export-error="handleExportError"
      />
    </div>
    
    <!-- 表格组件 -->
  </div>
</template>

<script>
export default {
  methods: {
    getExportParams() {
      // 移除分页参数
      const { page, limit, ...params } = this.listQuery
      return params
    },
    
    handleExportSuccess({ filename, size }) {
      console.log(`已导出文件: ${filename}`)
      if (size) {
        console.log(`文件大小: ${this.formatFileSize(size)}`)
      }
    },
    
    handleExportError(error) {
      // 错误处理和上报
      console.error('导出失败:', error)
    },
    
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }
  }
}
</script>
```

## 质量检查清单

### 使用前检查
- [ ] API函数已正确配置responseType: 'blob'
- [ ] 导出参数已正确过滤（移除分页参数）
- [ ] 文件名不包含非法字符
- [ ] 权限检查已实现

### 现代化特性检查
- [ ] 已启用enableModernFeatures
- [ ] 防抖时间已根据使用场景调整
- [ ] 超时时间已根据数据量调整
- [ ] 错误处理已实现

### 性能检查
- [ ] 大文件导出使用了合适的超时时间
- [ ] 频繁操作使用了合适的防抖时间
- [ ] 错误上报已配置
- [ ] 内存泄漏已验证

通过遵循这些最佳实践，ExportButton组件能够在各种场景下提供稳定、高性能的导出功能。 