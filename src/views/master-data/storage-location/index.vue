<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <search-form 
      :init-query="listQuery" 
      :warehouse-options="warehouseOptions"
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
    <location-table 
      ref="locationTable"
      :data="list" 
      :total="total" 
      :loading="listLoading" 
      :page="listQuery.page" 
      :limit="listQuery.limit" 
      @selection-change="handleSelectionChange" 
      @pagination="handlePagination" 
      @update="handleUpdate" 
      @status-change="handleStatusChange"
    />

    <!-- 编辑/新增对话框 -->
    <location-form 
      :type="dialogType" 
      :visible.sync="dialogVisible" 
      :edit-data="currentRowData" 
      :warehouse-options="warehouseOptions" 
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
/**
 * 库位主数据管理页面
 * 功能描述：管理库房中的库位信息，包括库位编码、名称、类型、所属库房等信息
 * 创建日期：2023-09-01
 */
// 导入API函数
import {
  getLocationList,
  createLocation,
  updateLocation,
  updateLocationStatus,
  batchDeleteLocation,
  batchUpdateLocationStatus,
  importLocationData,
  exportLocationData,
  downloadLocationTemplate
} from '@/api/master-data/storage-location'

// 从仓库管理模块导入获取仓库列表的API
import { getAllWarehouses } from '@/api/master-data/warehouse'

// 导入滚动工具函数
import { scrollTo } from '@/utils/scroll-to'

// 引入子组件
import SearchForm from './components/SearchForm'
import ActionBar from './components/ActionBar'
import LocationTable from './components/LocationTable'
import LocationForm from './components/LocationForm'
import ImportDialog from './components/ImportDialog'

// 引入混入
import tableMixin from './mixins/tableMixin'
import importExportMixin from './mixins/importExportMixin'

export default {
  name: 'StorageLocation',
  components: {
    SearchForm,
    ActionBar,
    LocationTable,
    LocationForm,
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
        warehouseId: undefined,
        locationType: undefined,
        status: undefined
      },
      dialogVisible: false, // 对话框可见性
      dialogType: 'create', // 对话框类型：create-新增，update-编辑
      currentRowData: null, // 当前编辑的行数据
      warehouseOptions: [] // 仓库选项
    }
  },
  created() {
    // 加载数据
    this.getList()
    this.getWarehouseOptions()
  },
  methods: {
    // 获取列表数据
    getList() {
      this.listLoading = true
      getLocationList(this.listQuery).then(response => {
        this.list = response.data.items
        this.total = response.data.total
        this.listLoading = false
      }).catch(() => {
        this.listLoading = false
      })
    },

    // 获取仓库选项
    getWarehouseOptions() {
      getAllWarehouses().then(response => {
        // 确保正确解析响应数据
        if (response && response.data) {
          this.warehouseOptions = response.data.items || []
          console.log('从仓库管理模块获取仓库数据:', this.warehouseOptions)
        } else {
          this.$message.error('获取仓库列表失败：响应数据格式错误')
        }
      }).catch(error => {
        // 详细记录错误信息
        console.error('获取仓库列表失败:', error)
        this.$message.error(`获取仓库列表失败: ${error.message || '未知错误'}`)
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
      // 滚动到顶部
      scrollTo(0, 800)
    },

    // 重置搜索
    handleReset(params) {
      this.listQuery = {
        ...this.listQuery,
        page: 1,
        ...params
      }
      this.getList()
      // 滚动到顶部
      scrollTo(0, 800)
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
        createLocation(formData).then(() => {
          this.$message.success('新增成功')
          this.dialogVisible = false
          this.getList()
          // 滚动到顶部
          scrollTo(0, 800)
        }).catch(error => {
          this.$message.error(`新增失败: ${error.message || '未知错误'}`)
        })
      } else {
        // 更新
        updateLocation(formData).then(() => {
          this.$message.success('更新成功')
          this.dialogVisible = false
          this.getList()
          // 滚动到顶部
          scrollTo(0, 800)
        }).catch(error => {
          this.$message.error(`更新失败: ${error.message || '未知错误'}`)
        })
      }
    },
    
    // 切换状态
    handleStatusChange(row) {
      const newStatus = row.status === 1 ? 0 : 1
      const statusText = newStatus === 1 ? '启用' : '禁用'
      this.$confirm(`确认${statusText}该库位吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        updateLocationStatus(row.id, newStatus).then(() => {
          this.$message.success(`${statusText}成功`)
          row.status = newStatus
        }).catch(error => {
          this.$message.error(`操作失败: ${error.message || '未知错误'}`)
        })
      }).catch(() => {
        // 取消操作
      })
    },

    // API方法已在mixins中实现，这里进行重写覆盖模拟方法

    // 批量删除
    handleBatchDelete(ids) {
      if (!ids || ids.length === 0) return
      
      this.listLoading = true
      batchDeleteLocation(ids).then(() => {
        this.$message.success('批量删除成功')
        this.getList()
      }).catch(error => {
        this.$message.error(`批量删除失败: ${error.message || '未知错误'}`)
      }).finally(() => {
        this.listLoading = false
      })
    },
    
    // 批量更改状态
    handleBatchStatus({ ids, status }) {
      if (!ids || ids.length === 0) return
      
      const statusText = status === 1 ? '启用' : '禁用'
      
      this.listLoading = true
      batchUpdateLocationStatus({ ids, status }).then(() => {
        this.$message.success(`批量${statusText}成功`)
        this.getList()
      }).catch(error => {
        this.$message.error(`批量${statusText}失败: ${error.message || '未知错误'}`)
      }).finally(() => {
        this.listLoading = false
      })
    },

    // 处理导入
    handleImport(formData) {
      this.importLoading = true
      
      importLocationData(formData).then(response => {
        this.importResult = response.data
        if (this.importResult && this.importResult.success) {
          // 如果导入成功，刷新列表数据
          this.getList()
        }
      }).catch(error => {
        this.importResult = {
          success: false,
          message: '导入请求失败',
          errors: [{ row: '-', field: '-', message: error.message || '网络错误' }]
        }
      }).finally(() => {
        this.importLoading = false
      })
    },
    
    // 导出数据
    exportData() {
      // 获取当前筛选条件
      const params = { ...this.listQuery }
      
      // 删除分页参数
      delete params.page
      delete params.limit
      
      exportLocationData(params).then(response => {
        // 创建下载链接
        const blob = new Blob([response.data], { 
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        })
        const link = document.createElement('a')
        link.href = window.URL.createObjectURL(blob)
        link.download = '库位数据_' + new Date().getTime() + '.xlsx'
        link.click()
        window.URL.revokeObjectURL(link.href)
        
        this.$message.success('导出成功')
      }).catch(() => {
        this.$message.error('导出失败')
      })
    },
    
    // 下载导入模板
    downloadTemplate() {
      downloadLocationTemplate().then(response => {
        // 创建下载链接
        const blob = new Blob([response.data], { 
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        })
        const link = document.createElement('a')
        link.href = window.URL.createObjectURL(blob)
        link.download = '库位导入模板.xlsx'
        link.click()
        window.URL.revokeObjectURL(link.href)
        
        this.$message.success('模板下载成功')
      }).catch(() => {
        this.$message.error('模板下载失败')
      })
    },

    // 处理分页
    handlePagination({ page, limit }) {
      this.listQuery.page = page
      this.listQuery.limit = limit
      this.getList()
      // 滚动到顶部
      scrollTo(0, 800)
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