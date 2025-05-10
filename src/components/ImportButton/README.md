# 导入按钮组件 (ImportButton)

## 简介

ImportButton是一个用于处理数据导入的全局组件，集成了文件上传、模板下载、导入确认和结果展示等功能。该组件旨在为系统中各个需要数据导入的模块提供统一、便捷的解决方案。

## 功能特点

- 集成文件上传、模板下载与结果展示，一站式解决数据导入需求
- 支持文件拖拽上传和点击上传两种交互方式
- 提供文件类型和大小验证
- 可自定义导入说明和提示内容
- 支持详细的导入结果展示，包括成功数量和失败原因
- 完全兼容Element UI风格
- 支持Mock环境和实际生产环境

## 使用方法

### 基本使用

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
  }
}
</script>
```

### 自定义导入说明

```vue
<template>
  <div>
    <import-button
      :import-api="importProductData"
      :template-api="downloadProductTemplate"
      dialog-title="导入产品数据"
      tip-title="使用须知："
    >
      <template #tips>
        <ol>
          <li>请按照模板格式填写产品信息</li>
          <li>产品编码必须唯一，且符合规则：字母+数字</li>
          <li>产品规格必须按照"宽度x厚度"格式填写</li>
          <li>一次最多导入300条记录</li>
        </ol>
      </template>
    </import-button>
  </div>
</template>
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
| dialogWidth | String | '550px' | 对话框宽度 |
| showFileList | Boolean | false | 是否显示文件列表 |
| acceptTypes | String | '.xlsx,.xls' | 接受的文件类型 |
| fileTypeTip | String | '只能上传Excel文件(xlsx/xls)，且不超过10MB' | 文件类型提示 |
| templateText | String | '下载模板' | 模板下载按钮文本 |
| confirmText | String | '开始导入' | 确认按钮文本 |
| cancelText | String | '取消' | 取消按钮文本 |
| tipTitle | String | '导入说明：' | 导入提示标题 |
| maxFileSize | Number | 10 | 最大文件大小（MB） |
| showRowNumber | Boolean | true | 是否在错误表格中显示行号 |

## 事件

| 事件名 | 说明 | 参数 |
|-------|------|------|
| import-start | 开始导入时触发 | file: 选择的文件对象 |
| import-success | 导入成功时触发 | result: 导入结果对象 |
| import-error | 导入失败时触发 | error: 错误对象 |
| import-complete | 导入完成时触发（无论成功失败） | - |
| template-download-start | 开始下载模板时触发 | - |
| template-download-success | 模板下载成功时触发 | { isMock } |
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
      message: '产品编码已存在'  // 错误信息
    },
    // ...其他错误记录
  ]
}
```

## 注意事项

1. importApi需要返回一个Promise，并且响应需要包含导入结果数据
2. 如果提供了templateApi，组件会自动显示"下载模板"链接
3. 导入结果展示依赖于后端接口返回的特定格式，确保接口返回的数据包含total、success、fail等字段

## 集成示例

### 与主数据管理页面集成

```vue
<template>
  <div class="app-container">
    <div class="toolbar">
      <import-button
        :import-api="importData"
        :template-api="downloadTemplate"
        dialog-title="导入仓库数据"
        @import-success="handleImportSuccess"
      />
      <!-- 其他工具按钮 -->
    </div>
    
    <!-- 表格组件 -->
  </div>
</template>

<script>
import ImportButton from '@/components/ImportButton'
import { importData, downloadTemplate } from '@/api/master-data/warehouse'

export default {
  components: {
    ImportButton
  },
  methods: {
    handleImportSuccess(result) {
      console.log('导入结果:', result)
      // 刷新表格数据
      this.getList()
    }
  }
}
</script>
```

### 与表格工具栏集成

```vue
<template>
  <div>
    <table-toolbar>
      <template #toolbar-right>
        <import-button
          :import-api="importData"
          :template-api="downloadTemplate"
          :dialog-title="`导入${moduleName}数据`"
          @import-success="handleImportSuccess"
        />
      </template>
    </table-toolbar>
  </div>
</template>
```

## 实现细节

1. 组件采用拖拽上传和点击上传两种方式，增强用户体验
2. 文件上传前会进行类型和大小验证，避免无效上传
3. 导入过程中会显示加载状态，防止重复操作
4. 导入结果根据成功率显示不同的图标和文案
5. 失败数据会以表格形式展示，方便用户定位问题 