# SearchFormV2 高级搜索表单组件

## 简介

SearchFormV2是一个优化版的高级搜索表单组件，解决了原SearchForm组件存在的问题，提供了更加稳定、高效的表单处理能力。该组件支持丰富的表单项类型、表单折叠展开、自动搜索等功能，同时优化了数据流向，避免死循环问题。

## 主要改进

相比原始的SearchForm组件，SearchFormV2做了以下关键改进：

1. **减少模板重复**：使用动态组件和组件映射表，显著减少了模板中的重复代码
2. **优化数据流向**：采用明确的数据流向设计，避免了数据更新时的死循环问题
3. **增加防抖功能**：所有搜索操作都经过防抖处理，避免频繁触发后端API
4. **增强重置功能**：通过标记重置状态，解决了重置过程中数据循环更新的问题
5. **使用v-show优化**：使用v-show代替v-if处理折叠项，避免DOM频繁重建
6. **公开组件方法**：提供submit、reset等方法，方便父组件调用
7. **更严格的类型检查**：对props进行更严格的类型检查和验证
8. **增强的空值处理**：更全面地处理各种类型的空值，包括空数组

## 使用示例

### 基本用法

```vue
<template>
  <div class="app-container">
    <search-form-v2
      ref="searchForm"
      :items="formItems"
      v-model="searchParams"
      :loading="loading"
      @search="handleSearch"
      @reset="handleReset"
    />
    
    <div class="table-container">
      <!-- 表格内容 -->
    </div>
  </div>
</template>

<script>
import SearchFormV2 from '@/components/SearchFormV2'

export default {
  components: {
    SearchFormV2
  },
  data() {
    return {
      // 搜索参数
      searchParams: {
        name: '',
        status: ''
      },
      // 加载状态
      loading: false
    }
  },
  computed: {
    // 表单项配置
    formItems() {
      return [
        {
          prop: 'name',
          label: '名称',
          type: 'input',
          placeholder: '请输入名称',
          clearable: true
        },
        {
          prop: 'status',
          label: '状态',
          type: 'select',
          placeholder: '请选择状态',
          clearable: true,
          options: [
            { label: '启用', value: 'active' },
            { label: '禁用', value: 'inactive' }
          ]
        }
      ]
    }
  },
  methods: {
    // 处理搜索
    handleSearch(params) {
      console.log('搜索参数:', params)
      this.loading = true
      
      // 调用API进行搜索
      this.fetchData(params).finally(() => {
        this.loading = false
      })
    },
    
    // 处理重置
    handleReset() {
      console.log('表单已重置')
    },
    
    // 获取数据
    fetchData(params) {
      // 实现数据获取逻辑...
    }
  }
}
</script>
```

### 高级配置

```vue
<template>
  <search-form-v2
    ref="searchForm"
    :items="formItems"
    v-model="searchParams"
    :loading="loading"
    :visible-item-count="4"
    :debounce-time="500"
    :search-after-reset="true"
    @search="handleSearch"
    @reset="handleReset"
  >
    <!-- 自定义表单项插槽 -->
    <template #customField="{ model }">
      <div class="custom-field">
        <el-button @click="handleCustomAction(model)">
          自定义操作
        </el-button>
      </div>
    </template>
    
    <!-- 自定义按钮插槽 -->
    <template #buttons>
      <el-button type="success" @click="handleExport">
        导出
      </el-button>
    </template>
  </search-form-v2>
</template>

<script>
export default {
  computed: {
    formItems() {
      return [
        // 常规表单项...
        {
          prop: 'custom',
          label: '自定义字段',
          type: 'slot',
          slotName: 'customField'
        }
      ]
    }
  }
}
</script>
```

## 组件属性 (Props)

| 属性名 | 类型 | 默认值 | 说明 |
|-------|------|-------|------|
| items | Array | 必填 | 表单项配置数组 |
| value | Object | {} | 表单数据对象 (v-model) |
| inline | Boolean | true | 是否为行内表单 |
| labelWidth | String | '' | 表单项标签宽度 |
| expandable | Boolean | true | 是否可展开收起 |
| visibleItemCount | Number | 3 | 始终可见的表单项数量 |
| loading | Boolean | false | 查询按钮加载状态 |
| searchAfterReset | Boolean | false | 重置后是否自动搜索 |
| debounceTime | Number | 300 | 搜索防抖延迟时间(ms) |

## 表单项配置

表单项配置是一个对象数组，每个对象定义一个表单项，支持以下属性：

```javascript
{
  // 基础属性（必填）
  prop: 'fieldName',     // 字段名称，用于v-model绑定
  label: '字段标签',      // 字段标签文本
  type: 'input',         // 表单项类型
  
  // 通用可选属性
  placeholder: '请输入',  // 占位文本
  disabled: false,       // 是否禁用
  clearable: true,       // 是否可清空
  class: 'custom-class', // 自定义CSS类名
  
  // 特定类型的属性
  options: [],           // select/radio/checkbox的选项
  multiple: false,       // select是否多选
  dateType: 'date',      // 日期选择器类型
  format: 'yyyy-MM-dd',  // 日期/时间格式
  valueFormat: 'yyyy-MM-dd', // 日期/时间值格式
  min: 0,                // 数字输入框最小值
  max: 100,              // 数字输入框最大值
  
  // 回调函数
  onChange: function(value) {}, // 值变化回调
  
  // 行为控制
  searchOnChange: false, // 值变化时是否自动搜索
  
  // 插槽相关（type=slot时）
  slotName: 'customSlot' // 自定义插槽名称
}
```

## 支持的表单项类型

SearchFormV2支持以下表单项类型：

- `input` - 输入框
- `select` - 选择器
- `date` - 日期选择器
- `time` - 时间选择器
- `radio` - 单选框组
- `checkbox` - 复选框组
- `number` / `input-number` - 数字输入框
- `rate` - 评分
- `switch` - 开关
- `slider` - 滑块
- `slot` - 自定义插槽

## 事件

| 事件名 | 说明 | 参数 |
|-------|------|------|
| search | 提交搜索时触发 | params: 过滤后的搜索参数对象 |
| reset | 重置表单时触发 | 无 |
| input | 表单值变化时触发 | formData: 完整的表单数据对象 |

## 方法

以下方法可以通过`ref`调用：

| 方法名 | 说明 | 参数 |
|-------|------|------|
| submit | 提交表单 | 无 |
| reset | 重置表单 | 无 |
| setValues | 设置表单值 | values: 要设置的值对象 |

```javascript
// 提交表单
this.$refs.searchForm.submit()

// 重置表单
this.$refs.searchForm.reset()

// 设置表单值
this.$refs.searchForm.setValues({
  name: '测试',
  status: 'active'
})
```

## 插槽

| 插槽名 | 说明 | 作用域变量 |
|-------|------|----------|
| [字段名] | 自定义表单项插槽 | model: 表单数据对象 |
| buttons | 按钮区域插槽 | 无 |

## 与原SearchForm的区别

1. **命名**：组件名称为`SearchFormV2`
2. **防抖**：默认包含搜索防抖功能，可通过`debounceTime`属性调整
3. **事件参数**：`search`事件只返回非空字段
4. **数据流向**：使用更清晰的内外部数据流，避免死循环
5. **动态组件**：使用动态组件替代大量条件渲染，代码更简洁
6. **公开方法**：提供了更多的公开方法供父组件调用

## 最佳实践

1. **设置适当的visibleItemCount**：根据页面布局设置合适的可见表单项数量
2. **使用自定义插槽**：对于复杂的表单项，使用插槽自定义内容
3. **适当使用防抖**：对于需要即时搜索的场景，调整debounceTime为合适的值
4. **处理好重置逻辑**：根据业务需求决定是否在重置后自动搜索

## 迁移指南

从SearchForm迁移到SearchFormV2只需几个简单步骤：

1. 将组件引用从`SearchForm`改为`SearchFormV2`
2. 检查表单项配置，确保符合新组件的要求
3. 如果有使用组件内部变量或方法，请参考本文档调整为新的API

例如：

```javascript
// 原代码
import SearchForm from '@/components/SearchForm'

// 新代码
import SearchFormV2 from '@/components/SearchFormV2'
```

## 注意事项

1. 组件内部会过滤空值，只有非空值才会包含在search事件的参数中
2. 重置表单会将所有字段设置为空值，并触发reset事件
3. 如果需要在重置后自动搜索，请设置searchAfterReset为true
4. 自定义插槽需要通过slotName属性指定插槽名称 