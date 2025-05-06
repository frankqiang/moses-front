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
    <product-table 
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
    <product-form 
      :type="dialogType" 
      :visible.sync="dialogVisible" 
      :edit-data="currentRowData" 
      :process-template-options="processTemplateOptions" 
      :quality-standard-options="qualityStandardOptions" 
      @submit="submitForm"
    />

    <!-- 导入对话框 -->
    <import-dialog 
      :visible.sync="importDialogVisible" 
      :loading="importLoading" 
      :import-result="importResult" 
      @import="handleImport" 
      @reset="resetImport"
      @template-download="handleDownloadTemplate"
    />
  </div>
</template>

<script>
import {
  getProductList,
  createProduct,
  updateProduct,
  changeProductStatus,
  batchDeleteProduct,
  batchChangeProductStatus,
  getProcessTemplateList,
  getQualityStandardList,
  exportProduct,
  downloadTemplate,
  importProduct
} from '@/api/master-data/product-management'

// 引入子组件
import SearchForm from './components/SearchForm'
import ActionBar from './components/ActionBar'
import ProductTable from './components/ProductTable'
import ProductForm from './components/ProductForm'
import ImportDialog from './components/ImportDialog'

// 引入混入
import tableMixin from './mixins/tableMixin'
import importExportMixin from './mixins/importExportMixin'

/**
 * 铝箔产品管理
 * 功能描述：管理车间生产或处理的铝箔产品的基础信息
 */
export default {
  name: 'ProductManagement',
  components: {
    SearchForm,
    ActionBar,
    ProductTable,
    ProductForm,
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
        alloy: undefined,
        lifecycleStatus: undefined
      },
      dialogVisible: false, // 对话框可见性
      dialogType: 'create', // 对话框类型：create-新增，update-编辑
      currentRowData: null, // 当前编辑的行数据
      processTemplateOptions: [], // 工艺模板选项
      qualityStandardOptions: [] // 质量标准选项
    }
  },
  created() {
    this.getList()
    this.getProcessTemplateOptions()
    this.getQualityStandardOptions()
  },
  methods: {
    // 获取列表数据
    getList() {
      this.listLoading = true
      getProductList(this.listQuery).then(response => {
        this.list = response.data.items
        this.total = response.data.total
        this.listLoading = false
      }).catch(() => {
        this.listLoading = false
      })
    },

    // 获取工艺模板选项
    getProcessTemplateOptions() {
      getProcessTemplateList().then(response => {
        this.processTemplateOptions = response.data.items
      })
    },

    // 获取质量标准选项
    getQualityStandardOptions() {
      getQualityStandardList().then(response => {
        this.qualityStandardOptions = response.data.items
      })
    },

    // 搜索
    handleSearch(params) {
      this.listQuery = {
        page: 1,
        limit: this.listQuery.limit,
        ...params
      }
      this.getList()
    },

    // 重置搜索
    handleReset() {
      this.listQuery = {
        page: 1,
        limit: 10
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
        createProduct(formData).then(() => {
          this.$message.success('新增铝箔产品成功')
          this.dialogVisible = false
          this.getList()
        })
      } else {
        // 更新
        updateProduct(formData).then(() => {
          this.$message.success('更新铝箔产品成功')
          this.dialogVisible = false
          this.getList()
        })
      }
    },
    
    // 改变产品状态
    handleStatusChange(row, lifecycleStatus) {
      changeProductStatus(row.id, lifecycleStatus).then(() => {
        this.$message.success('状态修改成功')
        this.getList()
      })
    },
    
    // 批量删除
    handleBatchDelete(ids) {
      batchDeleteProduct(ids).then(() => {
        this.$message.success('批量删除成功')
        this.getList()
        this.selectedRows = []
      })
    },
    
    // 批量修改状态
    handleBatchStatus(ids, lifecycleStatus) {
      batchChangeProductStatus(ids, lifecycleStatus).then(() => {
        this.$message.success('批量修改状态成功')
        this.getList()
      })
    },
    
    // 导出功能
    handleExport() {
      exportProduct(this.listQuery)
    },
    
    // 下载模板
    handleDownloadTemplate() {
      downloadTemplate()
    },
    
    // 导入数据
    handleImport(file) {
      importProduct(file)
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