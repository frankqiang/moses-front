# 通用搜索/筛选栏组件 (SearchFilterBar)

## 简介

SearchFilterBar是一个灵活、强大的通用搜索/筛选组件，可以根据配置自动生成各种类型的筛选条件表单。组件支持文本输入、数字输入、日期选择、下拉选择等多种表单控件，并支持展开/收起、自动搜索等高级功能。

## 功能特点

- 支持多种表单控件类型：文本框、数字框、日期选择器、时间选择器、下拉选择框、单选框、复选框、开关等
- 支持展开/收起功能，可设置默认显示的字段数量
- 支持自动搜索（值变化时自动触发搜索）
- 支持自定义字段宽度和表单样式
- 提供自定义插槽，可以添加自定义筛选字段和操作按钮
- 完全兼容Element UI风格

## 使用方法

### 基本使用

```vue
<template>
  <search-filter-bar
    :filter-fields="filterFields"
    :initial-values="initialValues"
    @search="handleSearch"
    @reset="handleReset"
  />
</template>

<script>
import SearchFilterBar from '@/components/SearchFilterBar'

export default {
  components: {
    SearchFilterBar
  },
  data() {
    return {
      // 筛选字段配置
      filterFields: [
        { label: '关键词', prop: 'keyword', type: 'input' },
        { 
          label: '状态', 
          prop: 'status', 
          type: 'select',
          options: [
            { label: '启用', value: 1 },
            { label: '禁用', value: 0 }
          ]
        },
        { 
          label: '创建日期', 
          prop: 'createDate', 
          type: 'daterange' 
        }
      ],
      // 初始值
      initialValues: {
        keyword: '',
        status: '',
        createDate: []
      }
    }
  },
  methods: {
    // 处理搜索
    handleSearch(params) {
      console.log('搜索参数:', params)
      // 获取数据...
    },
    
    // 处理重置
    handleReset(params) {
      console.log('重置参数:', params)
      // 重置数据...
    }
  }
}
</script>
```

### 使用展开/收起功能

```vue
<template>
  <search-filter-bar
    :filter-fields="filterFields"
    :default-fields-per-row="3"
    @search="handleSearch"
    @toggle="handleToggle"
  />
</template>

<script>
export default {
  data() {
    return {
      filterFields: [
        { label: '产品编码', prop: 'code' },
        { label: '产品名称', prop: 'name' },
        { label: '产品分类', prop: 'category', type: 'select', options: [...] },
        { label: '创建日期', prop: 'createDate', type: 'daterange' },
        { label: '供应商', prop: 'supplier', type: 'select', options: [...] },
        { label: '状态', prop: 'status', type: 'select', options: [...] }
      ]
    }
  },
  methods: {
    handleToggle(expanded) {
      console.log('展开状态:', expanded)
    }
  }
}
</script>
```

### 使用自动搜索

```vue
<template>
  <search-filter-bar
    :filter-fields="filterFields"
    :auto-search="true"
    :auto-search-delay="800"
    @search="handleSearch"
  />
</template>
```

### 使用自定义字段

```vue
<template>
  <search-filter-bar
    :filter-fields="filterFields"
    @search="handleSearch"
  >
    <!-- 自定义字段 -->
    <template #priceRange="{ formData }">
      <div class="price-range">
        <el-input-number v-model="formData.minPrice" :min="0" placeholder="最小价格" />
        <span class="separator">-</span>
        <el-input-number v-model="formData.maxPrice" :min="0" placeholder="最大价格" />
      </div>
    </template>
    
    <!-- 自定义操作按钮 -->
    <template #actions>
      <el-button type="success" icon="el-icon-download">导出</el-button>
    </template>
  </search-filter-bar>
</template>

<script>
export default {
  data() {
    return {
      filterFields: [
        // ... 其他字段
        { 
          label: '价格区间', 
          prop: 'priceRange', 
          type: 'custom',
          slotName: 'priceRange'
        }
      ]
    }
  }
}
</script>

<style scoped>
.price-range {
  display: flex;
  align-items: center;
  width: 240px;
}
.separator {
  margin: 0 8px;
}
</style>
```

## 筛选字段配置

组件通过filterFields属性接收筛选字段配置，每个字段支持以下属性：

### 通用属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|-------|------|
| label | String | - | 字段标签 |
| prop | String | - | 字段属性名 |
| type | String | 'input' | 字段类型，支持input、number、select、date、daterange、time、timerange、switch、radio、checkbox、cascader、custom |
| placeholder | String | 自动生成 | 占位文本 |
| clearable | Boolean | true | 是否可清空 |
| width | String | - | 字段宽度，覆盖默认宽度 |
| defaultValue | Any | - | 默认值 |

### 类型特定属性

#### 输入框 (input)
无特殊属性

#### 数字输入框 (number)
| 属性 | 类型 | 默认值 | 说明 |
|------|------|-------|------|
| min | Number | - | 最小值 |
| max | Number | - | 最大值 |
| step | Number | 1 | 步长 |
| precision | Number | - | 精度 |
| controls | Boolean | true | 是否显示控制按钮 |

#### 下拉选择框 (select)
| 属性 | 类型 | 默认值 | 说明 |
|------|------|-------|------|
| options | Array | - | 选项数组，可以是对象数组或简单数组 |
| multiple | Boolean | false | 是否多选 |
| collapseTags | Boolean | false | 是否折叠多选标签 |
| valueKey | String | 'value' | 选项对象中作为值的属性名 |
| labelKey | String | 'label' | 选项对象中作为标签的属性名 |

#### 日期选择器 (date)
| 属性 | 类型 | 默认值 | 说明 |
|------|------|-------|------|
| dateType | String | 'date' | 日期类型：date、week、month、year等 |
| format | String | - | 显示格式 |
| valueFormat | String | 'yyyy-MM-dd' | 值格式 |

#### 日期范围选择器 (daterange)
| 属性 | 类型 | 默认值 | 说明 |
|------|------|-------|------|
| format | String | - | 显示格式 |
| valueFormat | String | 'yyyy-MM-dd' | 值格式 |

#### 时间选择器 (time)
| 属性 | 类型 | 默认值 | 说明 |
|------|------|-------|------|
| format | String | 'HH:mm:ss' | 显示格式 |
| valueFormat | String | - | 值格式 |

#### 开关 (switch)
| 属性 | 类型 | 默认值 | 说明 |
|------|------|-------|------|
| activeText | String | - | 开启状态文本 |
| inactiveText | String | - | 关闭状态文本 |
| activeValue | Any | - | 开启状态值 |
| inactiveValue | Any | - | 关闭状态值 |

#### 单选框组 (radio) / 复选框组 (checkbox)
| 属性 | 类型 | 默认值 | 说明 |
|------|------|-------|------|
| options | Array | - | 选项数组，同select |
| valueKey | String | 'value' | 选项对象中作为值的属性名 |
| labelKey | String | 'label' | 选项对象中作为标签的属性名 |

#### 级联选择器 (cascader)
| 属性 | 类型 | 默认值 | 说明 |
|------|------|-------|------|
| options | Array | - | 选项数组 |
| props | Object | - | 配置选项，同Element UI Cascader组件 |

#### 自定义字段 (custom)
| 属性 | 类型 | 默认值 | 说明 |
|------|------|-------|------|
| slotName | String | field.prop | 插槽名称 |

## Props

| 属性名 | 类型 | 默认值 | 说明 |
|-------|------|-------|------|
| filterFields | Array | 必填 | 筛选字段配置 |
| initialValues | Object | {} | 初始值 |
| size | String | 'small' | 表单尺寸 |
| labelWidth | String | '100px' | 标签宽度 |
| searchText | String | '搜索' | 搜索按钮文本 |
| searchIcon | String | 'el-icon-search' | 搜索按钮图标 |
| resetText | String | '重置' | 重置按钮文本 |
| resetIcon | String | 'el-icon-refresh' | 重置按钮图标 |
| containerClass | String | '' | 容器自定义class |
| defaultFieldsPerRow | Number | 0 | 每行显示的默认字段数（0表示不启用展开/收起功能） |
| defaultWidth | String | '200px' | 默认输入框宽度 |
| autoSearch | Boolean | false | 是否自动搜索（值变化时） |
| autoSearchDelay | Number | 500 | 自动搜索的防抖延迟（毫秒） |

## 事件

| 事件名 | 说明 | 参数 |
|-------|------|------|
| search | 搜索按钮点击或自动搜索触发时触发 | searchParams: 搜索参数对象 |
| reset | 重置按钮点击时触发 | formData: 重置后的表单数据 |
| toggle | 展开/收起切换时触发 | expanded: 是否展开 |

## 插槽

| 插槽名 | 说明 | 参数 |
|-------|------|------|
| [field.slotName或field.prop] | 自定义字段内容插槽 | { field, formData } |
| actions | 自定义按钮插槽 | - |

## 集成案例

### 产品管理模块

```vue
<template>
  <div class="product-management">
    <search-filter-bar
      :filter-fields="[
        { label: '产品编码', prop: 'code' },
        { label: '产品名称', prop: 'name' },
        { 
          label: '产品类别', 
          prop: 'category', 
          type: 'select',
          options: categoryOptions
        },
        { 
          label: '状态', 
          prop: 'status', 
          type: 'select',
          options: [
            { label: '在售', value: 'active' },
            { label: '已下架', value: 'inactive' },
            { label: '缺货', value: 'out_of_stock' }
          ]
        },
        { 
          label: '创建日期', 
          prop: 'createTime', 
          type: 'daterange' 
        },
        { 
          label: '价格区间', 
          prop: 'priceRange', 
          type: 'custom' 
        }
      ]"
      :default-fields-per-row="3"
      @search="handleSearch"
    >
      <template #priceRange="{ formData }">
        <el-input-number v-model="formData.minPrice" :min="0" placeholder="最小价格" style="width: 100px" />
        <span style="margin: 0 5px">-</span>
        <el-input-number v-model="formData.maxPrice" :min="0" placeholder="最大价格" style="width: 100px" />
      </template>
      
      <template #actions>
        <el-button type="success" size="small" icon="el-icon-download" @click="exportData">导出</el-button>
      </template>
    </search-filter-bar>
    
    <!-- 表格部分 -->
  </div>
</template>
```

### 订单管理模块

```vue
<template>
  <div class="order-management">
    <search-filter-bar
      :filter-fields="orderFilterFields"
      :initial-values="initialValues"
      size="small"
      label-width="80px"
      :auto-search="true"
      :default-width="'180px'"
      @search="loadOrderList"
    />
    
    <!-- 表格部分 -->
  </div>
</template>

<script>
export default {
  data() {
    return {
      orderFilterFields: [
        { label: '订单号', prop: 'orderNo' },
        { label: '客户名称', prop: 'customerName' },
        { 
          label: '订单状态', 
          prop: 'orderStatus',
          type: 'select',
          options: this.orderStatusOptions
        },
        { 
          label: '支付方式', 
          prop: 'paymentMethod',
          type: 'select',
          options: this.paymentMethodOptions
        },
        { 
          label: '订单日期', 
          prop: 'orderDate',
          type: 'daterange' 
        },
        { 
          label: '配送方式', 
          prop: 'deliveryType',
          type: 'radio',
          options: [
            { label: '全部', value: '' },
            { label: '自提', value: 'self_pickup' },
            { label: '快递', value: 'express' }
          ],
          defaultValue: ''
        }
      ],
      initialValues: {
        orderStatus: 'all'
      }
    }
  }
}
</script>
```

## 结合表格使用的完整示例

```vue
<template>
  <div class="app-container">
    <!-- 搜索筛选栏 -->
    <search-filter-bar
      :filter-fields="filterFields"
      :initial-values="listQuery"
      @search="handleSearch"
      @reset="handleReset"
    />
    
    <!-- 批量操作工具栏 -->
    <batch-actions-toolbar
      :selected-rows="selectedRows"
      @batch-delete="handleBatchDelete"
    />
    
    <!-- 表格 -->
    <el-table
      v-loading="listLoading"
      :data="list"
      border
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <!-- 表格列... -->
    </el-table>
    
    <!-- 分页 -->
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />
  </div>
</template>

<script>
import SearchFilterBar from '@/components/SearchFilterBar'
import BatchActionsToolbar from '@/components/BatchActionsToolbar'
import Pagination from '@/components/Pagination'

export default {
  components: {
    SearchFilterBar,
    BatchActionsToolbar,
    Pagination
  },
  data() {
    return {
      // 筛选字段配置
      filterFields: [
        // 字段配置...
      ],
      // 列表查询参数
      listQuery: {
        page: 1,
        limit: 10,
        // 其他查询参数...
      },
      // 表格数据
      list: [],
      // 总记录数
      total: 0,
      // 列表加载状态
      listLoading: false,
      // 选中的行
      selectedRows: []
    }
  },
  created() {
    this.getList()
  },
  methods: {
    // 获取列表数据
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.data.items
        this.total = response.data.total
        this.listLoading = false
      }).catch(() => {
        this.listLoading = false
      })
    },
    
    // 处理搜索
    handleSearch(params) {
      this.listQuery = {
        ...this.listQuery,
        ...params,
        page: 1
      }
      this.getList()
    },
    
    // 处理重置
    handleReset() {
      this.listQuery = {
        page: 1,
        limit: 10
      }
      this.getList()
    },
    
    // 处理选择行变化
    handleSelectionChange(selection) {
      this.selectedRows = selection
    },
    
    // 处理批量删除
    handleBatchDelete(ids) {
      // 处理批量删除逻辑...
    }
  }
}
</script>
```

## 注意事项

1. 组件会自动根据字段配置生成对应的表单控件，确保prop名称与实际API参数匹配
2. 使用自动搜索功能时，注意设置合适的延迟时间，避免频繁请求
3. 自定义字段需要通过插槽实现，确保插槽名称与字段配置中的slotName或prop匹配
4. 组件会自动处理字段的默认值，但建议在initialValues中提供完整的初始值结构 