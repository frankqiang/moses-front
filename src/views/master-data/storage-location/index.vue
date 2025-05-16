/**
* 库位主数据管理页面（新版）
* 功能描述：管理库房中的库位信息，包括库位编码、名称、类型、所属库房等信息
* 创建日期：2023-09-01
*/
<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <search-form ref="searchForm" :init-query="listQuery" :warehouse-options="warehouseOptions" :loading="listLoading"
      @search="handleSearch" @reset="handleReset" />

    <!-- 库位表格 -->
    <location-table ref="locationTable" :data="list" :total="total" :loading="listLoading" :page="listQuery.page"
      :limit="listQuery.limit" :import-api="'/api/master-data/storage-location/import'"
      :template-api="'/api/master-data/storage-location/template'"
      :export-api="'/api/master-data/storage-location/export'" @selection-change="handleSelectionChange"
      @pagination="handlePagination" @add="handleCreate" @update="handleUpdate" @status-change="handleStatusChange"
      @refresh="getList" @batch-delete="handleBatchDelete" @batch-enable="handleBatchEnable"
      @batch-disable="handleBatchDisable" @import-success="handleImportSuccess" @export-success="handleExportSuccess" />

    <!-- 编辑/新增对话框 -->
    <location-form ref="locationForm" :type="dialogType" :visible.sync="dialogVisible" :edit-data="currentRowData"
      :warehouse-options="warehouseOptions" @submit="submitForm" @closed="handleDrawerClosed" />
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
  batchUpdateLocationStatus
} from '@/api/master-data/storage-location'

// 从仓库管理模块导入获取仓库列表的API
import { getAllWarehouses } from '@/api/master-data/warehouse'

// 导入滚动工具函数
import { scrollTo } from '@/utils/scroll-to'

// 引入子组件
import SearchForm from './components/SearchForm'
import LocationTable from './components/LocationTable'
import LocationForm from './components/LocationForm'

export default {
  name: 'StorageLocation',
  components: {
    SearchForm,
    LocationTable,
    LocationForm
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
        warehouseId: undefined,
        locationType: undefined,
        status: undefined
      },
      dialogVisible: false, // 对话框可见性
      dialogType: 'create', // 对话框类型：create-新增，update-编辑，view-查看
      currentRowData: null, // 当前编辑的行数据
      warehouseOptions: [], // 仓库选项
      selectedRows: [] // 选中的行数据
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

      // 直接打开对话框，不需要手动重置表单
      // DrawerForm 组件会在打开时自动处理表单数据
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
        createLocation(formData).then(response => {
          this.$message.success('新增库位成功')
          this.dialogVisible = false

          // 如果响应中包含最新列表数据，直接使用
          if (response.data && response.data.items) {
            this.list = response.data.items
            this.total = response.data.total
          } else {
            // 否则重新请求列表数据
            this.getList()
          }

          // 滚动到顶部
          scrollTo(0, 800)
        }).catch(() => {
          // 提交失败时不关闭表单
        })
      } else {
        // 更新
        updateLocation(formData).then(response => {
          this.$message.success('更新库位成功')
          this.dialogVisible = false

          // 如果响应中包含最新列表数据，直接使用
          if (response.data && response.data.items) {
            this.list = response.data.items
            this.total = response.data.total
          } else {
            // 否则重新请求列表数据
            this.getList()
          }

          // 滚动到顶部
          scrollTo(0, 800)
        }).catch(() => {
          // 提交失败时不关闭表单
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
          this.getList()
        }).catch(error => {
          this.$message.error(`操作失败: ${error.message || '未知错误'}`)
        })
      }).catch(() => {
        // 取消操作
      })
    },

    // 批量删除
    handleBatchDelete(rows) {
      if (!rows || rows.length === 0) {
        this.$message.warning('请选择需要删除的记录')
        return
      }

      this.$confirm('确认批量删除选中的库位记录吗？此操作不可恢复', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.listLoading = true
        
        // 获取选中行的ID列表
        const ids = rows.map(row => row.id)
        
        batchDeleteLocation(ids).then(response => {
          this.$message.success(response.data.message || '批量删除成功')
          this.selectedRows = []
          
          // 延迟执行，确保后端处理完成
          setTimeout(() => {
            this.getList()
          }, 300)
        }).catch(error => {
          console.error('批量删除错误:', error)
          this.$message.error(`批量删除失败: ${error.message || '未知错误'}`)
          this.listLoading = false
        })
      }).catch(() => {
        // 取消操作
        this.$message.info('已取消删除操作')
      })
    },

    // 批量启用
    handleBatchEnable(rows) {
      if (!rows || rows.length === 0) {
        this.$message.warning('请选择需要启用的记录')
        return
      }

      this.$confirm('确认批量启用选中的库位记录吗？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.listLoading = true
        
        // 获取选中行的ID列表
        const ids = rows.map(row => row.id)
        
        batchUpdateLocationStatus({ ids, status: 1 }).then(response => {
          this.$message.success(response.data.message || '批量启用成功')
          this.selectedRows = []
          
          // 延迟执行，确保后端处理完成
          setTimeout(() => {
            this.getList()
          }, 300)
        }).catch(error => {
          console.error('批量启用错误:', error)
          this.$message.error(`批量启用失败: ${error.message || '未知错误'}`)
          this.listLoading = false
        })
      }).catch(() => {
        // 取消操作
        this.$message.info('已取消启用操作')
      })
    },

    // 批量禁用
    handleBatchDisable(rows) {
      if (!rows || rows.length === 0) {
        this.$message.warning('请选择需要禁用的记录')
        return
      }

      this.$confirm('确认批量禁用选中的库位记录吗？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.listLoading = true
        
        // 获取选中行的ID列表
        const ids = rows.map(row => row.id)
        
        batchUpdateLocationStatus({ ids, status: 0 }).then(response => {
          this.$message.success(response.data.message || '批量禁用成功')
          this.selectedRows = []
          
          // 延迟执行，确保后端处理完成
          setTimeout(() => {
            this.getList()
          }, 300)
        }).catch(error => {
          console.error('批量禁用错误:', error)
          this.$message.error(`批量禁用失败: ${error.message || '未知错误'}`)
          this.listLoading = false
        })
      }).catch(() => {
        // 取消操作
        this.$message.info('已取消禁用操作')
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
    },

    // 处理抽屉关闭
    handleDrawerClosed() {
      // 重置表单状态
      if (this.$refs.locationForm) {
        this.$refs.locationForm.resetForm()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
}
</style> 