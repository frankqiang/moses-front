<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <search-form 
      :init-query="listQuery" 
      @search="handleSearch" 
      @reset="handleReset"
    />

    <!-- 操作按钮 -->
    <action-bar 
      :selected-ids="selectedRows.map(row => row.id)" 
      @create="handleCreate" 
      @batch-delete="handleBatchDelete" 
      @batch-status="handleBatchStatus" 
      @import-export="handleImportExport"
    />

    <!-- 表格数据 -->
    <specification-table 
      :data="list" 
      :total="total" 
      :loading="listLoading" 
      :page="listQuery.page" 
      :limit="listQuery.limit" 
      @selection-change="handleSelectionChange" 
      @size-change="handleSizeChange" 
      @current-change="handleCurrentChange" 
      @update="handleUpdate" 
      @status-change="handleStatusChange"
    />

    <!-- 编辑/新增对话框 -->
    <specification-form 
      :type="dialogType" 
      :visible.sync="dialogVisible" 
      :edit-data="currentRowData" 
      :product-options="productOptions" 
      @submit="submitForm"
    />

    <!-- 导入对话框 -->
    <import-dialog 
      :visible.sync="importDialogVisible" 
      :loading="importLoading" 
      :import-result="importResult" 
      @import="handleImport" 
      @reset="resetImport"
    />
  </div>
</template>

<script>
import {
  getBinSpecList,
  createBinSpec,
  updateBinSpec,
  getProductTypeList
} from '@/api/master-data/bin-specification'

// 引入子组件
import SearchForm from './components/SearchForm'
import ActionBar from './components/ActionBar'
import SpecificationTable from './components/SpecificationTable'
import SpecificationForm from './components/SpecificationForm'
import ImportDialog from './components/ImportDialog'

// 引入混入
import tableMixin from './mixins/tableMixin'
import importExportMixin from './mixins/importExportMixin'

export default {
  name: 'BinSpecification',
  components: {
    SearchForm,
    ActionBar,
    SpecificationTable,
    SpecificationForm,
    ImportDialog
  },
  mixins: [tableMixin, importExportMixin],
  data() {
    return {
      list: [], // 列表数据
      total: 0, // 总记录数
      listLoading: false, // 列表加载状态
      listQuery: { // 列表查询参数
        page: 1,
        limit: 10,
        code: undefined,
        name: undefined,
        status: undefined
      },
      dialogVisible: false, // 对话框可见性
      dialogType: 'create', // 对话框类型：create-新增，update-编辑
      currentRowData: null, // 当前编辑的行数据
      productOptions: [] // 产品类型选项
    }
  },
  created() {
    this.getList()
    this.getProductOptions()
  },
  methods: {
    // 获取列表数据
    getList() {
      this.listLoading = true
      getBinSpecList(this.listQuery).then(response => {
        this.list = response.data.items
        this.total = response.data.total
        this.listLoading = false
      }).catch(() => {
        this.listLoading = false
      })
    },

    // 获取产品类型选项
    getProductOptions() {
      getProductTypeList().then(response => {
        this.productOptions = response.data.items
      })
    },

    // 搜索
    handleSearch(params) {
      this.listQuery = {
        ...this.listQuery,
        page: 1,
        ...params
      }
      this.getList()
    },

    // 重置搜索
    handleReset(params) {
      this.listQuery = {
        ...this.listQuery,
        page: 1,
        ...params
      }
      this.getList()
    },

    // 每页显示条数变化
    handleSizeChange(val) {
      this.listQuery.limit = val
      this.getList()
    },

    // 当前页变化
    handleCurrentChange(val) {
      this.listQuery.page = val
      this.getList()
    },

    // 新增
    handleCreate() {
      this.dialogType = 'create'
      this.currentRowData = null
      this.dialogVisible = true
    },

    // 编辑
    handleUpdate(row) {
      this.dialogType = 'update'
      this.currentRowData = row
      this.dialogVisible = true
    },

    // 提交表单
    submitForm(formData) {
      if (this.dialogType === 'create') {
        // 新增
        createBinSpec(formData).then(() => {
          this.$message.success('新增成功')
          this.dialogVisible = false
          this.getList()
        })
      } else {
        // 更新
        updateBinSpec(formData).then(() => {
          this.$message.success('更新成功')
          this.dialogVisible = false
          this.getList()
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  padding: 24px;
  
  .text-danger {
    color: #F56C6C;
    font-weight: bold;
  }

  .text-primary {
    color: #409EFF;
    font-weight: bold;
  }
}
</style>
