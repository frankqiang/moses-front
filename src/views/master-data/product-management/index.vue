/**
 * 产品管理模块
 * 功能描述：管理铝箔产品的基础信息，包括产品属性、生命周期和关联信息
 * 创建日期：2024-11-10
 */
<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <search-form 
      ref="searchForm"
      :init-query="listQuery" 
      @search="handleSearch" 
      @reset="handleReset"
    />

    <!-- 产品表格 -->
    <product-table
      ref="productTable" 
      :data="list" 
      :total="total" 
      :loading="listLoading" 
      :page="listQuery.page" 
      :limit="listQuery.limit"
      :import-api="'/api/product/import'"
      :template-api="'/api/product/template'"
      :export-api="'/api/product/export'" 
      @selection-change="handleSelectionChange" 
      @pagination="handlePagination"
      @add="handleCreate"
      @update="handleUpdate"
      @view="handleView" 
      @status-change="handleStatusChange"
      @refresh="getList"
      @batch-delete="handleBatchDelete"
      @batch-status="handleBatchStatus"
      @batch-lifecycle-change="handleBatchLifecycleChange"
      @import-success="handleImportSuccess"
      @export-success="handleExportSuccess"
    />

    <!-- 编辑/新增对话框 -->
    <product-form 
      ref="productForm"
      :type="dialogType" 
      :visible.sync="dialogVisible" 
      :edit-data="currentRowData" 
      :process-template-options="processTemplateOptions" 
      :quality-standard-options="qualityStandardOptions" 
      @submit="submitForm"
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
import ProductTable from './components/ProductTable'
import ProductForm from './components/ProductForm'

// 引入滚动工具函数
import { scrollTo } from '@/utils/scroll-to'

/**
 * 铝箔产品管理
 * 功能描述：管理车间生产或处理的铝箔产品的基础信息
 */
export default {
  name: 'ProductManagement',
  components: {
    SearchForm,
    ProductTable,
    ProductForm
  },
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
      dialogType: 'create', // 对话框类型：create-新增，update-编辑，view-查看
      currentRowData: null, // 当前编辑的行数据
      processTemplateOptions: [], // 工艺模板选项
      qualityStandardOptions: [], // 质量标准选项
      selectedRows: [] // 选中的行数据
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

    // 处理选择行变化
    handleSelectionChange(selection) {
      this.selectedRows = selection
    },

    // 新增
    handleCreate() {
      this.dialogType = 'create'
      this.currentRowData = null
      
      // 确保在打开对话框前重置表单状态
      if (this.$refs.productForm) {
        this.$nextTick(() => {
          this.$refs.productForm.resetForm()
        })
      }
      
      this.dialogVisible = true
    },

    // 编辑
    handleUpdate(row) {
      this.dialogType = 'update'
      this.currentRowData = row
      this.dialogVisible = true
    },

    // 查看
    handleView(row) {
      this.dialogType = 'view'
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
          // 滚动到顶部
          scrollTo(0, 800)
        }).catch(() => {
          // 提交失败时不关闭表单
        })
      } else {
        // 更新
        updateProduct(formData).then(() => {
          this.$message.success('更新铝箔产品成功')
          this.dialogVisible = false
          this.getList()
          // 滚动到顶部
          scrollTo(0, 800)
        }).catch(() => {
          // 提交失败时不关闭表单
        })
      }
    },
    
    // 改变产品状态
    handleStatusChange(row, lifecycleStatus) {
      const statusText = {
        'trial': '试产',
        'production': '量产',
        'discontinued': '停产'
      }
      
      this.$confirm(`确认将该产品状态修改为"${statusText[lifecycleStatus]}"吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        changeProductStatus(row.id, lifecycleStatus).then(() => {
          this.$message.success('状态修改成功')
          this.getList()
        })
      }).catch(() => {
        // 取消操作
      })
    },
    
    // 批量删除
    handleBatchDelete(rows) {
      const ids = rows.map(row => row.id)
      if (ids.length === 0) {
        this.$message.warning('请选择需要删除的记录')
        return
      }
      
      this.$confirm('确认删除选中的记录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        batchDeleteProduct(ids).then(() => {
          this.$message.success('批量删除成功')
          this.getList()
          this.selectedRows = []
        }).catch(() => {
          this.$message.error('批量删除失败')
        })
      }).catch(() => {
        // 取消删除
      })
    },
    
    // 批量修改状态
    handleBatchStatus(rows, lifecycleStatus) {
      const ids = rows.map(row => row.id)
      if (ids.length === 0) {
        this.$message.warning('请选择需要操作的记录')
        return
      }
      
      const statusText = {
        'trial': '试产',
        'production': '量产',
        'discontinued': '停产'
      }
      
      this.$confirm(`确认将选中的记录状态修改为"${statusText[lifecycleStatus]}"吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        batchChangeProductStatus(ids, lifecycleStatus).then(() => {
          this.$message.success('批量更改状态成功')
          this.getList()
        }).catch(() => {
          this.$message.error('批量更改状态失败')
        })
      }).catch(() => {
        // 取消操作
      })
    },
    
    // 批量修改产品生命周期
    handleBatchLifecycleChange(lifecycleStatus) {
      const rows = this.selectedRows
      const ids = rows.map(row => row.id)
      if (ids.length === 0) {
        this.$message.warning('请选择需要操作的记录')
        return
      }
      
      const statusText = {
        'trial': '试产',
        'production': '量产',
        'discontinued': '停产'
      }
      
      this.$confirm(`确认将选中的${ids.length}个产品生命周期修改为"${statusText[lifecycleStatus]}"吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        batchChangeProductStatus(ids, lifecycleStatus).then(() => {
          this.$message.success(`成功将${ids.length}个产品生命周期修改为"${statusText[lifecycleStatus]}"`)
          this.getList()
        }).catch(() => {
          this.$message.error('批量修改产品生命周期失败')
        })
      }).catch(() => {
        // 取消操作
      })
    },
    
    // 导入成功
    handleImportSuccess(result) {
      if (result.success === result.total) {
        this.$message.success(`导入成功，共导入${result.success}条记录`)
      } else {
        this.$message.warning(`导入完成，成功${result.success}条，失败${result.fail}条`)
      }
      this.getList()
    },
    
    // 导出成功
    handleExportSuccess(result) {
      this.$message.success('导出成功')
    },

    // 处理分页
    handlePagination({ page, limit }) {
      this.listQuery.page = page
      this.listQuery.limit = limit
      this.getList()
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
}
</style> 