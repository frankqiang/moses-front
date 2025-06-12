/**
 * 仓库主数据管理页面（新版）
 * 功能描述：管理系统中的仓库信息，包括仓库编码、名称、类型、地址、容量等信息
 * 创建日期：2023-11-01
 */
<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <search-form
      ref="searchForm"
      :init-query="listQuery"
      :warehouse-type-options="warehouseTypeOptions"
      :loading="listLoading"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- 仓库表格 -->
    <warehouse-table
      ref="warehouseTable"
      :data="list"
      :total="total"
      :loading="listLoading"
      :page="listQuery.page"
      :limit="listQuery.limit"
      :import-api="'/api/warehouse/import'"
      :template-api="'/api/warehouse/template'"
      :export-api="'/api/warehouse/export'"
      @selection-change="handleSelectionChange"
      @pagination="handlePagination"
      @add="handleCreate"
      @update="handleUpdate"
      @status-change="handleStatusChange"
      @refresh="getList"
      @batch-delete="handleBatchDelete"
      @batch-status="handleBatchStatus"
      @import-success="handleImportSuccess"
      @export-success="handleExportSuccess"
    />

    <!-- 编辑/新增对话框 -->
    <warehouse-form
      ref="warehouseForm"
      :type="dialogType"
      :visible.sync="dialogVisible"
      :edit-data="currentRowData"
      :warehouse-type-options="warehouseTypeOptions"
      @submit="submitForm"
      @closed="handleDrawerClosed"
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
  batchUpdateWarehouseStatus

} from '@/api/master-data/warehouse'

// 引入子组件
import SearchForm from './components/SearchForm'
import WarehouseTable from './components/WarehouseTable'
import WarehouseForm from './components/WarehouseForm'

// 引入滚动工具函数
import { scrollTo } from '@/utils/scroll-to'

export default {
  name: 'Warehouse',
  components: {
    SearchForm,
    WarehouseTable,
    WarehouseForm
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
        warehouseType: undefined,
        status: undefined
      },
      dialogVisible: false, // 对话框可见性
      dialogType: 'create', // 对话框类型：create-新增，update-编辑，view-查看
      currentRowData: null, // 当前编辑的行数据
      // 仓库类型选项
      warehouseTypeOptions: [
        { value: 'RAW', label: '原材料仓库' },
        { value: 'FINISHED', label: '成品仓库' },
        { value: 'SEMI', label: '半成品仓库' },
        { value: 'CONSUMABLE', label: '耗材仓库' },
        { value: 'SPARE_PARTS', label: '备件仓库' }
      ],
      selectedRows: [] // 选中的行数据
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
        createWarehouse(formData).then(response => {
          this.$message.success('新增仓库成功')
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
        updateWarehouse(formData).then(response => {
          this.$message.success('更新仓库成功')
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

      this.$confirm(`确认${statusText}该仓库吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        updateWarehouseStatus(row.id, newStatus).then(() => {
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
        batchDeleteWarehouse(ids).then(() => {
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

    // 批量更改状态
    handleBatchStatus(rows, status) {
      const ids = rows.map(row => row.id)
      if (ids.length === 0) {
        this.$message.warning('请选择需要操作的记录')
        return
      }

      const statusText = status === 1 ? '启用' : '禁用'

      this.$confirm(`确认将选中的记录状态修改为"${statusText}"吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        batchUpdateWarehouseStatus({ ids, status }).then(() => {
          this.$message.success('批量更改状态成功')
          this.getList()
        }).catch(() => {
          this.$message.error('批量更改状态失败')
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
    },

    // 处理抽屉关闭
    handleDrawerClosed() {
      // 重置表单状态
      if (this.$refs.warehouseForm) {
        this.$refs.warehouseForm.resetForm()
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
