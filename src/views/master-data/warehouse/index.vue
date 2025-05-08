<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <search-form 
      :init-query="listQuery" 
      :warehouse-type-options="warehouseTypeOptions"
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
    <warehouse-table 
      ref="warehouseTable"
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
    <warehouse-form 
      :type="dialogType" 
      :visible.sync="dialogVisible" 
      :edit-data="currentRowData" 
      :warehouse-type-options="warehouseTypeOptions" 
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
 * 仓库主数据管理页面
 * 功能描述：管理系统中的仓库信息，包括仓库编码、名称、类型、地址、容量等信息
 * 创建日期：2023-11-01
 */
// 导入API函数
import {
  getWarehouseList,
  createWarehouse,
  updateWarehouse,
  updateWarehouseStatus,
  batchDeleteWarehouse,
  batchUpdateWarehouseStatus,
  importWarehouseData,
  exportWarehouseData,
  downloadWarehouseTemplate
} from '@/api/master-data/warehouse'

// 引入子组件
import SearchForm from './components/SearchForm'
import ActionBar from './components/ActionBar'
import WarehouseTable from './components/WarehouseTable'
import WarehouseForm from './components/WarehouseForm'
import ImportDialog from './components/ImportDialog'

// 引入混入
import tableMixin from './mixins/tableMixin'
import importExportMixin from './mixins/importExportMixin'

export default {
  name: 'Warehouse',
  components: {
    SearchForm,
    ActionBar,
    WarehouseTable,
    WarehouseForm,
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
        warehouseType: undefined,
        status: undefined
      },
      dialogVisible: false, // 对话框可见性
      dialogType: 'create', // 对话框类型：create-新增，update-编辑
      currentRowData: null, // 当前编辑的行数据
      // 仓库类型选项
      warehouseTypeOptions: [
        { value: 'RAW', label: '原材料仓库' },
        { value: 'FINISHED', label: '成品仓库' },
        { value: 'SEMI', label: '半成品仓库' },
        { value: 'CONSUMABLE', label: '耗材仓库' },
        { value: 'SPARE_PARTS', label: '备件仓库' }
      ]
    }
  },
  created() {
    // 加载数据
    this.getList()
  },
  methods: {
    // 获取列表数据
    getList() {
      this.listLoading = true
      getWarehouseList(this.listQuery).then(response => {
        this.list = response.data.items
        this.total = response.data.total
        this.listLoading = false
      }).catch(() => {
        this.listLoading = false
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
        createWarehouse(formData).then(() => {
          this.$message.success('新增成功')
          this.dialogVisible = false
          this.getList()
        }).catch(error => {
          this.$message.error(`新增失败: ${error.message || '未知错误'}`)
        })
      } else {
        // 更新
        updateWarehouse(formData).then(() => {
          this.$message.success('更新成功')
          this.dialogVisible = false
          this.getList()
        }).catch(error => {
          this.$message.error(`更新失败: ${error.message || '未知错误'}`)
        })
      }
    },
    
    // 切换状态
    handleStatusChange(row) {
      const newStatus = row.status === 1 ? 0 : 1
      const statusText = newStatus === 1 ? '启用' : '禁用'
      this.$confirm(`确认${statusText}该仓库吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        updateWarehouseStatus(row.id, newStatus).then(() => {
          this.$message.success(`${statusText}成功`)
          row.status = newStatus
        }).catch(error => {
          this.$message.error(`操作失败: ${error.message || '未知错误'}`)
        })
      }).catch(() => {
        // 取消操作
      })
    },

    // 批量删除
    handleBatchDelete(ids) {
      if (!ids || ids.length === 0) return
      
      this.listLoading = true
      batchDeleteWarehouse(ids).then(() => {
        this.$message.success('批量删除成功')
        this.getList()
      }).catch(error => {
        this.$message.error(`批量删除失败: ${error.message || '未知错误'}`)
      }).finally(() => {
        this.listLoading = false
      })
    },
    
    // 批量更改状态
    handleBatchStatus(ids, status) {
      if (!ids || ids.length === 0) return
      
      const statusText = status === 1 ? '启用' : '禁用'
      this.listLoading = true
      
      batchUpdateWarehouseStatus({ ids, status }).then(() => {
        this.$message.success(`批量${statusText}成功`)
        this.getList()
      }).catch(error => {
        this.$message.error(`批量${statusText}失败: ${error.message || '未知错误'}`)
      }).finally(() => {
        this.listLoading = false
      })
    },
    
    // 导入导出功能
    handleImportExport(type) {
      if (type === 'import') {
        this.importDialogVisible = true
      } else if (type === 'export') {
        this.exportData()
      } else if (type === 'template') {
        this.downloadTemplate()
      }
    },
    
    // 导出数据
    exportData() {
      exportWarehouseData(this.listQuery).then(response => {
        this.downloadFile(response, '仓库数据.xlsx')
      }).catch(error => {
        this.$message.error(`导出失败: ${error.message || '未知错误'}`)
      })
    },
    
    // 下载模板
    downloadTemplate() {
      downloadWarehouseTemplate().then(response => {
        this.downloadFile(response, '仓库导入模板.xlsx')
      }).catch(error => {
        this.$message.error(`下载模板失败: ${error.message || '未知错误'}`)
      })
    },
    
    // 导入数据
    handleImport(formData) {
      this.importLoading = true
      importWarehouseData(formData).then(response => {
        this.importResult = response.data
        this.importLoading = false
        
        if (response.data.success === response.data.total) {
          this.$message.success('导入成功')
          this.getList()
        } else {
          this.$message.warning(`导入完成，成功${response.data.success}条，失败${response.data.fail}条`)
        }
      }).catch(error => {
        this.importLoading = false
        this.$message.error(`导入失败: ${error.message || '未知错误'}`)
      })
    },
    
    // 重置导入
    resetImport() {
      this.importResult = null
    },
    
    // 下载文件
    downloadFile(response, fileName) {
      const blob = new Blob([response], { type: 'application/vnd.ms-excel' })
      const link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob)
      link.download = fileName
      link.click()
      window.URL.revokeObjectURL(link.href)
    }
  }
}
</script> 