/**
 * 料框规格主数据管理页面
 * 功能描述：管理系统中的料框规格信息，包括基础信息和参数配置
 * 创建日期：2024-10-30
 */
<template>
  <div class="app-container">
    <!-- 当前模块标题 -->
    <div class="module-title">
      料框规格管理
    </div>

    <!-- 搜索表单 -->
    <search-form 
      :init-query="listQuery" 
      :loading="listLoading"
      @search="handleSearch" 
      @reset="handleReset"
    />

    <!-- 表格组件 -->
    <specification-table 
      ref="specTable"
      :data="list" 
      :total="total" 
      :loading="listLoading" 
      :page="listQuery.page" 
      :limit="listQuery.limit" 
      :import-api="'/vue-admin-template/mes/bin-specification/import'"
      :template-api="'/vue-admin-template/mes/bin-specification/download-template'"
      :export-api="'/vue-admin-template/mes/bin-specification/export'"
      @selection-change="handleSelectionChange" 
      @size-change="handleSizeChange" 
      @current-change="handleCurrentChange" 
      @update="handleUpdate" 
      @view="handleView"
      @status-change="handleStatusChange"
      @add="handleCreate"
      @batch-delete="handleBatchDelete"
      @batch-enable="handleBatchEnable"
      @batch-disable="handleBatchDisable"
      @import-success="handleImportSuccess"
      @export-success="handleExportSuccess"
      @pagination="handlePagination"
    />

    <!-- 表单抽屉 -->
    <specification-form-drawer
      ref="formDrawer"
      :visible.sync="drawerVisible"
      :type="drawerType"
      :bin-data="currentBinData"
      :product-options="productOptions"
      @submit="handleFormSubmit"
      @close="handleDrawerClose"
    />
  </div>
</template>

<script>
import {
  getBinSpecList,
  getBinSpecDetail,
  createBinSpec,
  updateBinSpec,
  changeBinSpecStatus,
  batchDeleteBinSpec,
  batchChangeBinSpecStatus,
  getProductTypeList
} from '@/api/master-data/bin-specification'

// 引入子组件
import SearchForm from './components/SearchForm'
import SpecificationTable from './components/SpecificationTable'
import SpecificationFormDrawer from './components/SpecificationFormDrawer'

// 引入工具函数
import { scrollTo } from '@/utils/scroll-to'

export default {
  name: 'BinSpecification',
  components: {
    SearchForm,
    SpecificationTable,
    SpecificationFormDrawer
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
        status: undefined,
        material: undefined,
        supplier: undefined
      },
      selectedRows: [], // 选中的行
      drawerVisible: false, // 抽屉可见性
      drawerType: 'create', // 抽屉类型: create, update, view
      currentBinData: null, // 当前编辑的数据
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
        // 滚动到顶部
        scrollTo(0, 500)
      }).catch(() => {
        this.listLoading = false
      })
    },

    // 获取产品类型选项
    getProductOptions() {
      getProductTypeList().then(response => {
        if (response && response.data && response.data.items) {
          this.productOptions = response.data.items
        } else {
          this.$message.error('获取产品类型列表失败：响应数据格式错误')
          console.error('获取产品类型列表失败：响应数据格式错误', response)
        }
      }).catch(error => {
        this.$message.error(`获取产品类型列表失败: ${error.message || '未知错误'}`)
        console.error('获取产品类型列表失败:', error)
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
      // 重置为初始查询参数
      this.listQuery = {
        page: 1,
        limit: 10,
        code: undefined,
        name: undefined,
        status: undefined,
        material: undefined,
        supplier: undefined
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

    // 处理分页
    handlePagination({ page, limit }) {
      this.listQuery.page = page
      this.listQuery.limit = limit
      this.getList()
    },

    // 表格选择变化
    handleSelectionChange(selection) {
      this.selectedRows = selection
    },

    // 新增
    handleCreate() {
      this.drawerType = 'create'
      this.currentBinData = null
      this.drawerVisible = true
    },

    // 编辑
    handleUpdate(row) {
      this.drawerType = 'update'
      this.currentBinData = JSON.parse(JSON.stringify(row))
      this.drawerVisible = true
    },

    // 查看
    handleView(row) {
      this.drawerType = 'view'
      this.currentBinData = JSON.parse(JSON.stringify(row))
      this.drawerVisible = true
    },

    // 提交表单
    handleFormSubmit(formData, continueCreate) {
      // 处理产品ID数组，转换为完整产品对象数组
      if (formData.applicableProducts && Array.isArray(formData.applicableProducts)) {
        // 根据ID找到完整的产品对象
        formData.applicableProducts = formData.applicableProducts.map(productId => {
          const product = this.productOptions.find(item => item.id === productId)
          return product || { id: productId }
        })
      }

      if (this.drawerType === 'create') {
        // 新增
        createBinSpec(formData).then(() => {
          this.$message.success('新增成功')
          if (!continueCreate) {
            this.drawerVisible = false
          } else {
            // 继续创建，清空表单
            this.$refs.formDrawer.resetForm()
          }
          this.getList()
        })
      } else {
        // 更新
        updateBinSpec(formData).then(() => {
          this.$message.success('更新成功')
          this.drawerVisible = false
          this.getList()
        })
      }
    },

    // 关闭抽屉
    handleDrawerClose() {
      this.currentBinData = null
    },

    // 状态变更
    handleStatusChange(row) {
      const status = row.status === 1 ? 0 : 1
      const statusText = status === 1 ? '启用' : '禁用'

      this.$confirm(`确认要${statusText}该料框规格吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        changeBinSpecStatus(row.id, status).then(() => {
          this.$message.success(`${statusText}成功`)
          this.getList()
        })
      }).catch(() => {})
    },

    // 批量删除
    handleBatchDelete(rows) {
      if (!rows || rows.length === 0) {
        this.$message.warning('请至少选择一条记录')
        return
      }

      const ids = rows.map(row => row.id)
      const names = rows.map(row => row.name).join('、')

      this.$confirm(`确认批量删除以下料框规格吗？<br><span class="text-danger">${names}</span>`, '批量删除提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: true
      }).then(() => {
        this.listLoading = true
        batchDeleteBinSpec(ids).then(response => {
          this.$message.success(response.data.message || `成功删除${ids.length}条数据`)
          this.selectedRows = []
          setTimeout(() => {
            this.getList()
          }, 300)
        }).catch(error => {
          console.error('批量删除错误:', error)
          this.$message.error(`批量删除失败: ${error.message || '未知错误'}`)
          this.listLoading = false
        })
      }).catch(() => {
        this.$message.info('已取消删除操作')
      })
    },

    // 批量启用
    handleBatchEnable(rows) {
      this.handleBatchStatus(rows, 1, '启用')
    },

    // 批量禁用
    handleBatchDisable(rows) {
      this.handleBatchStatus(rows, 0, '禁用')
    },

    // 批量更改状态通用方法
    handleBatchStatus(rows, targetStatus, statusText) {
      if (!rows || rows.length === 0) {
        this.$message.warning('请至少选择一条记录')
        return
      }
      
      // 只选择需要操作的行
      const targetRows = rows.filter(row => row.status !== targetStatus)
      
      if (targetRows.length === 0) {
        this.$message.info(`所选记录已全部${statusText}，无需操作`)
        return
      }
      
      this.$confirm(`确认批量${statusText}选中的记录吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.listLoading = true
        batchChangeBinSpecStatus(targetRows.map(row => row.id), targetStatus).then(response => {
          this.$message.success(
            response.data.message || `批量${statusText}成功：${targetRows.length}条记录已${statusText}`
          )
          // 延迟执行，确保后端处理完成
          setTimeout(() => {
            this.getList()
          }, 300)
        }).catch(error => {
          console.error(`批量${statusText}错误:`, error)
          this.$message.error(`批量${statusText}失败: ${error.message || '未知错误'}`)
          this.listLoading = false
        })
      }).catch(() => {
        // 取消操作
        this.$message.info('操作已取消')
      })
    },

    // 导入成功处理
    handleImportSuccess() {
      this.getList()
    },

    // 导出成功处理
    handleExportSuccess() {
      this.$message.success('导出成功')
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  padding: 24px;
  
  .module-title {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 24px;
    color: #303133;
  }
  
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
