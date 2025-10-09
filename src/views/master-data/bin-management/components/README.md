# 料框规格管理组件文档

## 组件列表

### 1. BinSpecificationSearch - 搜索组件

**文件路径**: `components/BinSpecificationSearch.vue`

**功能描述**: 基于全局SearchForm组件实现的料框规格搜索表单，支持规格代码、规格名称模糊查询，以及材质、状态精确筛选。

**Props**:
- `loading` (Boolean): 搜索加载状态，默认false
- `value` (Object): 查询参数对象（支持v-model）

**Events**:
- `@search`: 搜索事件，参数为标准化后的查询对象
- `@reset`: 重置事件，参数为默认查询对象
- `@input`: 数据更新事件（v-model支持）

**使用示例**:

```vue
<template>
  <div>
    <!-- 搜索组件 -->
    <bin-specification-search
      v-model="searchParams"
      :loading="loading"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- 表格组件 -->
    <bin-specification-table
      :data="tableData"
      :loading="loading"
      :pagination="pagination"
      @pagination-change="handlePaginationChange"
    />
  </div>
</template>

<script>
import BinSpecificationSearch from './components/BinSpecificationSearch'
import BinSpecificationTable from './components/BinSpecificationTable'

export default {
  components: {
    BinSpecificationSearch,
    BinSpecificationTable
  },
  data() {
    return {
      searchParams: {
        page: 1,
        limit: 20,
        sortBy: 'createdAt:desc'
      },
      tableData: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0
      },
      loading: false
    }
  },
  methods: {
    async handleSearch(params) {
      this.searchParams = { ...params }
      await this.fetchList()
    },
    async handleReset(params) {
      this.searchParams = { ...params }
      await this.fetchList()
    },
    async handlePaginationChange({ page, limit }) {
      this.searchParams.page = page
      this.searchParams.limit = limit
      await this.fetchList()
    },
    async fetchList() {
      this.loading = true
      try {
        // 调用API获取数据
        const response = await fetchBinSpecificationList(this.searchParams)
        this.tableData = response.data.results
        this.pagination = {
          page: response.data.page,
          limit: response.data.limit,
          total: response.data.totalResults
        }
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
```

**搜索字段说明**:

| 字段名 | 类型 | 说明 | 查询方式 |
|--------|------|------|----------|
| specCode | String | 规格代码 | 模糊查询，自动转大写 |
| specName | String | 规格名称 | 模糊查询 |
| material | String | 材质 | 精确匹配，下拉选择 |
| status | String | 状态 | 精确匹配，下拉选择（启用/禁用） |

**特性**:
- ✅ 自动防抖（300ms）
- ✅ 一键重置所有筛选条件
- ✅ 规格代码自动转大写
- ✅ 空值过滤（自动清除空字符串、null、undefined）
- ✅ 重置后自动回到第一页
- ✅ 与后端接口100%对齐

---

### 2. BinSpecificationTable - 表格组件

**文件路径**: `components/BinSpecificationTable.vue`

**功能描述**: 基于全局BaseTable组件实现的料框规格列表展示，支持分页、排序、状态切换等功能。

（详细文档见组件文件内注释）

---

### 3. BinSpecificationFormDrawer - 表单抽屉组件

**文件路径**: `components/BinSpecificationFormDrawer.vue`

**功能描述**: 基于全局Drawer组件和el-form实现的料框规格新增/编辑表单，支持所有字段的验证和数据提交。

**Props**:
- `visible` (Boolean): 抽屉显示状态，支持v-model绑定
- `mode` (String): 表单模式，可选值：'create'(新增)、'update'(编辑)、'view'(查看)，默认'create'
- `specificationId` (String|Number): 规格ID，编辑和查看模式时必传

**Events**:
- `@update:visible`: 抽屉显示状态更新事件（v-model支持）
- `@success`: 提交成功事件，参数为创建/更新后的规格数据

**使用示例**:

```vue
<template>
  <div>
    <!-- 新增按钮 -->
    <el-button type="primary" @click="handleCreate">新增规格</el-button>

    <!-- 表格（省略） -->
    <bin-specification-table @edit="handleEdit" />

    <!-- 表单抽屉 -->
    <bin-specification-form-drawer
      v-model="drawerVisible"
      :mode="drawerMode"
      :specification-id="currentSpecId"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script>
import BinSpecificationFormDrawer from './components/BinSpecificationFormDrawer'

export default {
  components: {
    BinSpecificationFormDrawer
  },
  data() {
    return {
      drawerVisible: false,
      drawerMode: 'create',
      currentSpecId: null
    }
  },
  methods: {
    handleCreate() {
      this.drawerMode = 'create'
      this.currentSpecId = null
      this.drawerVisible = true
    },
    handleEdit(row) {
      this.drawerMode = 'update'
      this.currentSpecId = row.id
      this.drawerVisible = true
    },
    async handleFormSuccess(data) {
      this.$message.success('操作成功')
      await this.fetchList() // 刷新列表
    }
  }
}
</script>
```

**表单字段说明**:

| 字段名 | 类型 | 必填 | 说明 | 验证规则 |
|--------|------|------|------|----------|
| specCode | String | 是 | 规格代码 | 1-50字符，大写字母/数字/中划线，创建后不可修改 |
| specName | String | 是 | 规格名称 | 1-200字符 |
| length | Number | 是 | 长度(cm) | 0.01-10000，最多2位小数 |
| width | Number | 是 | 宽度(cm) | 0.01-10000，最多2位小数 |
| height | Number | 是 | 高度(cm) | 0.01-10000，最多2位小数 |
| maxLoadCapacity | Number | 是 | 最大载重(kg) | 0.01-100000，最多2位小数 |
| material | String | 是 | 材质 | 1-100字符 |
| maxStackLayers | Number | 是 | 最大堆叠层数 | 1-100的整数 |
| applicableProductTypes | Array | 否 | 适用产品类型ID列表 | UUID数组，支持多选 |
| supplierInfo | String | 否 | 供应商信息 | 最多500字符 |
| status | String | 否 | 状态 | 启用/禁用，仅新增时可设置 |

**特性**:
- ✅ 规格代码自动转换为大写
- ✅ 规格代码创建后不可修改（编辑模式下禁用）
- ✅ 完整的表单验证（所有必填字段和格式验证）
- ✅ 新增和编辑模式自动识别
- ✅ 数据加载失败自动关闭抽屉并提示
- ✅ 使用后端返回的消息提示（成功和失败）
- ✅ 适用产品类型多选功能（P1第6项）
- ✅ 表单分区设计，结构清晰
- ✅ 所有字段提供友好的输入提示
- ✅ 支持表单重置和取消操作

**注意事项**:
1. 规格代码创建后不可修改，编辑模式下该字段自动禁用
2. 状态字段在编辑模式下通过专门的启用/禁用操作修改，表单中不可修改
3. 适用产品类型功能依赖铝箔产品管理模块，当前版本该选项为空（预留）
4. 提交成功后会自动关闭抽屉并触发success事件

---

## 开发规范

1. **组件引入**: 所有组件必须优先使用全局组件（SearchForm、BaseTable、StatusTag等）
2. **接口对齐**: 所有API调用必须与后端接口文档100%一致
3. **错误处理**: 使用后端返回的error.message，不得硬编码错误消息
4. **代码规范**: 通过ESLint检查，遵循项目代码规范
5. **防抖处理**: 搜索操作使用300ms防抖延迟

## 更新记录

- 2025-01-09: 创建BinSpecificationFormDrawer组件（TASK005-P0和P1第6项完成）
- 2025-01-09: 创建BinSpecificationSearch组件（TASK004-P0完成）

