# 导入按钮组件 (ImportButton)

## 简介

ImportButton是一个现代化的通用数据导入组件，集成了文件上传、模板下载、导入确认和结果展示等功能。该组件采用现代前端开发范式，支持防抖保护、错误重试、请求取消、内存管理等高级特性，同时保持向后兼容性。

## 功能特点

### 核心功能
- 集成文件上传、模板下载与结果展示，一站式解决数据导入需求
- 支持文件拖拽上传和点击上传两种交互方式
- 提供文件类型和大小验证
- 可自定义导入说明和提示内容
- 支持详细的导入结果展示，包括成功数量和失败原因
- 完全兼容Element UI风格
- 支持Mock环境和实际生产环境

### 现代化特性 🚀
- **防抖保护**：防止用户快速重复点击（可自定义延迟时间）
- **多文件支持**：支持批量文件导入（可配置最大文件数量）
- **上传进度显示**：实时显示文件上传进度
- **请求取消**：支持取消进行中的导入操作（AbortController）
- **智能文件验证**：文件类型、大小、内容完整性验证
- **错误数据导出**：失败数据可导出为CSV文件便于分析
- **分页错误列表**：大量错误数据支持分页显示
- **内存管理**：自动清理创建的URL对象，防止内存泄漏
- **类型验证**：严格的Props类型验证和错误提示
- **错误分类**：区分不同类型的错误并提供针对性提示
- **浏览器兼容**：支持IE和现代浏览器的文件下载
- **向后兼容**：通过特性开关确保现有代码无需修改

## 使用方法

### 基本使用（兼容模式）

```vue
<template>
  <div>
    <import-button
      :import-api="importWarehouseData"
      :template-api="downloadWarehouseTemplate"
      dialog-title="导入仓库数据"
    />
  </div>
</template>

<script>
import ImportButton from '@/components/ImportButton'
import { importWarehouseData, downloadWarehouseTemplate } from '@/api/master-data/warehouse'

export default {
  components: {
    ImportButton
  },
  methods: {
    // API方法实现
    importWarehouseData,
    downloadWarehouseTemplate
  }
}
</script>
```

### 现代化特性使用

```vue
<template>
  <div>
    <!-- 启用现代化特性的导入组件 -->
    <import-button
      :import-api="importProductData"
      :template-api="downloadProductTemplate"
      dialog-title="导入产品数据"
      :enable-modern-features="true"
      :enable-multiple-files="true"
      :max-file-count="10"
      :max-file-size="50"
      :debounce-delay="300"
      :timeout="120000"
      :show-file-name="true"
      @import-success="handleImportSuccess"
      @import-error="handleImportError"
    >
      <template #tips>
        <ol>
          <li>支持Excel文件格式（.xlsx, .xls）</li>
          <li>单个文件最大50MB，最多可选择10个文件</li>
          <li>产品编码必须唯一，遵循命名规范</li>
          <li>价格字段仅支持数字格式</li>
          <li>导入过程中可随时取消操作</li>
        </ol>
      </template>
    </import-button>
  </div>
</template>

<script>
import ImportButton from '@/components/ImportButton'

export default {
  components: {
    ImportButton
  },
  methods: {
    async importProductData(formData, options = {}) {
      // 支持AbortController的API调用
      return await this.$api.post('/products/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: options.onUploadProgress,
        signal: options.signal,
        timeout: options.timeout || 60000
      })
    },
    
    async downloadProductTemplate() {
      return await this.$api.get('/products/template', {
        responseType: 'blob'
      })
    },
    
    handleImportSuccess(result) {
      console.log('导入成功:', result)
      // 刷新列表或执行其他操作
      this.refreshData()
    },
    
    handleImportError(error) {
      console.error('导入失败:', error)
      // 可以进行错误上报或其他处理
    }
  }
}
</script>
```

## Props

| 属性名 | 类型 | 默认值 | 说明 |
|-------|------|-------|------|
| importApi | Function | 必填 | 导入API方法，接收FormData参数并返回Promise |
| templateApi | Function | null | 模板下载API方法，返回Promise |
| text | String | '导入' | 按钮文本 |
| icon | String | 'el-icon-upload2' | 按钮图标 |
| type | String | 'primary' | 按钮类型，同Element UI Button组件 |
| size | String | 'small' | 按钮大小，同Element UI Button组件 |
| disabled | Boolean | false | 是否禁用 |
| dialogTitle | String | '导入数据' | 对话框标题 |
| dialogWidth | String | '550px' | 对话框宽度，支持px/%/em/rem/vw |
| showFileList | Boolean | false | 是否显示文件列表 |
| acceptTypes | String | '.xlsx,.xls' | 接受的文件类型 |
| fileTypeTip | String | '只能上传Excel文件(xlsx/xls)，且不超过10MB' | 文件类型提示 |
| templateText | String | '下载模板' | 模板下载按钮文本 |
| confirmText | String | '开始导入' | 确认按钮文本 |
| cancelText | String | '取消' | 取消按钮文本 |
| tipTitle | String | '导入说明：' | 导入提示标题 |
| maxFileSize | Number | 10 | 最大文件大小（MB），范围：1-1024 |
| showRowNumber | Boolean | true | 是否在错误表格中显示行号 |

### 现代化特性Props

| 属性名 | 类型 | 默认值 | 说明 |
|-------|------|-------|------|
| enableModernFeatures | Boolean | false | 是否启用现代化特性 |
| enableMultipleFiles | Boolean | false | 是否支持多文件上传 |
| maxFileCount | Number | 5 | 最大文件数量，范围：1-20 |
| debounceDelay | Number | 500 | 防抖延迟时间（毫秒），范围：0-5000 |
| timeout | Number | 60000 | 请求超时时间（毫秒），范围：1000-600000 |
| showFileName | Boolean | false | 是否在错误表格中显示文件名 |

## 事件

| 事件名 | 说明 | 参数 |
|-------|------|------|
| import-start | 开始导入时触发 | files: 选择的文件数组 |
| import-success | 导入成功时触发 | result: 导入结果对象 |
| import-error | 导入失败时触发 | error: 错误对象 |
| import-complete | 导入完成时触发（无论成功失败） | - |
| template-download-start | 开始下载模板时触发 | - |
| template-download-success | 模板下载成功时触发 | { fileName, isMock } |
| template-download-error | 模板下载失败时触发 | error: 错误对象 |
| reset | 重置导入状态时触发 | - |

## 插槽

| 插槽名 | 说明 |
|-------|------|
| tips | 自定义导入说明内容 |

## 导入结果对象格式

导入成功后的回调参数应符合以下格式：

```js
{
  total: 100,      // 总记录数
  success: 95,     // 成功记录数
  fail: 5,         // 失败记录数
  errors: [        // 失败详情（可选）
    {
      row: 5,      // 行号
      message: '产品编码已存在',  // 错误信息
      fileName: 'products.xlsx'  // 文件名（多文件模式时）
    },
    // ...其他错误记录
  ]
}
```

## API要求

### 导入API格式
```js
// 单文件模式
async function importData(formData, options = {}) {
  // formData包含：
  // - file: 上传的文件
  
  return await axios.post('/api/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: options.onUploadProgress, // 上传进度回调
    signal: options.signal,                     // 请求取消信号
    timeout: options.timeout || 60000          // 超时时间
  })
}

// 多文件模式
async function importMultipleData(formData, options = {}) {
  // formData包含：
  // - files[0], files[1], files[2]... : 多个上传文件
  // - fileCount: 文件数量
  
  return await axios.post('/api/import/multiple', formData, options)
}
```

### 模板下载API格式
```js
async function downloadTemplate() {
  return await axios.get('/api/template', {
    responseType: 'blob' // 重要：必须设置为blob
  })
}
```

## 现代化特性详解

### 1. 防抖保护机制
- 防止用户快速重复点击导入按钮
- 防止重复下载模板
- 可配置防抖延迟时间

```vue
<import-button
  :debounce-delay="300"
  :import-api="importData"
/>
```

### 2. 多文件批量导入
- 支持同时选择多个文件
- 可配置最大文件数量
- 显示每个文件的详细信息

```vue
<import-button
  :enable-modern-features="true"
  :enable-multiple-files="true"
  :max-file-count="10"
  :import-api="importMultipleData"
/>
```

### 3. 请求取消功能
- 使用AbortController实现请求取消
- 导入过程中显示"取消导入"按钮
- 支持网络请求的优雅中断

### 4. 增强的文件验证
- 文件类型验证（扩展名和MIME类型）
- 文件大小验证（精确到MB）
- 文件内容完整性检查
- 文件名特殊字符检查

### 5. 错误数据导出
- 导入失败的数据可导出为CSV文件
- 支持中文字符（BOM编码）
- 包含行号、错误原因等详细信息

### 6. 内存管理优化
- 自动跟踪和清理创建的URL对象
- 组件销毁时清理所有资源
- 防止内存泄漏

## 最佳实践

### 1. API设计建议
```js
// 推荐的错误处理方式
export async function importProductData(formData, options = {}) {
  try {
    const response = await request.post('/products/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: options.timeout || 60000,
      signal: options.signal,
      onUploadProgress: options.onUploadProgress
    })
    
    return {
      data: {
        total: response.data.total,
        success: response.data.success,
        fail: response.data.fail,
        errors: response.data.errors || []
      }
    }
  } catch (error) {
    // 设置错误类型便于组件进行分类处理
    if (error.code === 'ECONNABORTED') {
      error.retryable = true
    }
    throw error
  }
}
```

### 2. 错误处理示例
```vue
<template>
  <import-button
    :import-api="importWithRetry"
    @import-error="handleImportError"
  />
</template>

<script>
export default {
  methods: {
    async importWithRetry(formData, options) {
      let retryCount = 0
      const maxRetries = 3
      
      while (retryCount < maxRetries) {
        try {
          return await this.importProductData(formData, options)
        } catch (error) {
          retryCount++
          if (retryCount >= maxRetries || !error.retryable) {
            throw error
          }
          // 等待后重试
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }
    },
    
    handleImportError(error) {
      // 根据错误类型提供不同的用户提示
      if (error.response?.status === 413) {
        this.$message.error('文件过大，请分批导入')
      } else if (error.code === 'NETWORK_ERROR') {
        this.$message.error('网络连接失败，请检查网络后重试')
      }
    }
  }
}
</script>
```

### 3. 性能优化建议
- 大文件导入时启用上传进度显示
- 合理设置文件大小限制
- 使用分页显示大量错误数据
- 及时清理不需要的文件引用

### 4. 用户体验优化
- 提供清晰的文件格式要求说明
- 显示实时的上传进度
- 支持导入过程的取消操作
- 详细的错误信息和解决建议

## 注意事项

1. **兼容性**: enableModernFeatures为false时保持完全向后兼容
2. **API格式**: 确保后端API返回标准的导入结果格式
3. **文件大小**: 合理设置maxFileSize避免服务器压力
4. **错误处理**: 实现完善的错误分类和用户提示
5. **内存管理**: 在组件销毁时会自动清理资源，无需手动处理

## 浏览器支持

- **现代浏览器**: 支持所有现代化特性
- **IE11+**: 通过polyfill支持基础功能
- **移动端**: 响应式设计，支持触摸操作

## 更新日志

### v2.0.0 (2024-12-20)
- ✨ 新增现代化特性开关
- ✨ 支持多文件批量导入
- ✨ 添加防抖保护机制
- ✨ 实现请求取消功能
- ✨ 增强文件验证逻辑
- ✨ 支持错误数据导出
- ✨ 优化内存管理
- ✨ 改进用户交互体验
- 🐛 修复文件大小计算精度问题
- 🐛 修复内存泄漏问题
- 📝 完善文档和示例

### v1.0.0 (2023-12-10)
- 🎉 初始版本发布
- ✨ 基础导入功能
- ✨ 模板下载功能
- ✨ 结果展示功能 