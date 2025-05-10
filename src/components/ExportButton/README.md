# 导出按钮组件 (ExportButton)

## 简介

ExportButton是一个通用的表格数据导出组件，提供将表格数据导出为Excel文件的功能。支持自定义文件名、导出前确认、加载状态管理和错误处理等特性，可以无缝集成到各种主数据管理模块中。

## 功能特点

- 支持自定义导出API和参数
- 支持自定义文件名和文件类型
- 支持导出前确认
- 提供加载状态和错误处理
- 支持自定义按钮样式和图标
- 完全兼容Element UI风格
- 支持Mock环境和实际生产环境

## 使用方法

### 基本使用

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

### 自定义样式和行为

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
    @export-success="handleExportSuccess"
    @export-error="handleExportError"
  />
</template>
```

## Props

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
| needConfirm | Boolean | true | 导出前是否需要确认 |
| confirmText | String | '确认导出当前筛选条件下的所有数据吗？' | 确认提示文本 |
| successText | String | '导出成功' | 导出成功提示文本 |
| errorText | String | '导出失败' | 导出失败提示文本 |
| mimeType | String | 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' | 导出文件的MIME类型 |

## 事件

| 事件名 | 说明 | 参数 |
| --- | --- | --- |
| export-start | 开始导出时触发 | params: 导出参数 |
| export-success | 导出成功时触发 | {filename, isMock} |
| export-error | 导出失败时触发 | error: 错误对象 |
| export-complete | 导出完成时触发（无论成功失败） | - |
| cancel | 用户取消导出时触发 | - |

## 注意事项

1. exportApi需要返回一个Promise，并且响应数据应该是二进制数据流（blob）
2. 需要在API请求时设置responseType: 'blob'
3. 如果在Mock环境中，需要返回特定格式的字符串，如'export-success'

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
      />
    </template>
  </table-toolbar>
</template>
```

### 与主页面集成

```vue
<template>
  <div class="app-container">
    <div class="toolbar">
      <export-button
        :export-api="exportWarehouseData"
        :params="getExportParams()"
        filename="仓库数据"
        @export-success="handleExportSuccess"
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
    
    handleExportSuccess({ filename }) {
      console.log(`已导出文件: ${filename}`)
      // 可以在这里记录日志或进行其他操作
    }
  }
}
</script>
```

## 实现细节

1. 组件内部会自动处理加载状态和错误
2. 文件名会自动添加日期后缀，确保唯一性
3. 导出前默认会进行确认，避免意外操作
4. 兼容Mock环境，便于开发和测试 