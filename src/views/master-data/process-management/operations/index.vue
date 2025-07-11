/**
 * 工序管理主页面
 * 功能描述：提供工序的列表查看、搜索、新增、编辑、删除等功能
 * 支持单条和批量操作，符合现代前端开发规范
 */
<template>
  <div class="operation-management">
    <!-- 搜索表单 -->
    <search-form
      v-model="searchParams"
      :loading="loading"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- 操作表格 -->
    <operation-table
      ref="operationTable"
      :data="tableData"
      :loading="loading"
      :total="total"
      :page="pagination.page"
      :limit="pagination.limit"
      @pagination-change="handlePaginationChange"
      @add="handleCreate"
      @edit="handleEdit"
      @view="handleView"
      @delete="handleDelete"
      @batch-delete="handleBatchDelete"
      @status-change="handleStatusChange"
      @batch-enable="handleBatchEnable"
      @batch-disable="handleBatchDisable"
      @export="handleExport"
      @import="handleImport"
      @refresh="fetchList"
    />

    <!-- 工序表单抽屉 -->
    <operation-form-drawer
      :visible.sync="formDrawerVisible"
      :mode="formMode"
      :operation-data="currentOperation"
      @success="handleFormSuccess"
      @close="handleFormClose"
    />
  </div>
</template>

<script>
import SearchForm from './components/SearchForm.vue'
import OperationTable from './components/OperationTable.vue'
import OperationFormDrawer from './components/OperationFormDrawer.vue'
import { debounce } from '@/utils'
import {
  getOperationList,
  updateOperationStatus,
  batchUpdateOperationStatus,
  deleteOperation,
  batchDeleteOperations
} from './api'
import { ApiError } from '@/utils/request'

export default {
  name: 'OperationManagement',
  components: {
    SearchForm,
    OperationTable,
    OperationFormDrawer
  },
  data() {
    return {
      // 搜索参数
      searchParams: {
        keyword: '',
        type: '',
        status: '',
        reportingPoint: ''
      },
      // 表格数据
      tableData: [],
      // 总记录数
      total: 0,
      // 分页参数
      pagination: {
        page: 1,
        limit: 10
      },
      // 加载状态
      loading: false,
      // 表单抽屉可见性
      formDrawerVisible: false,
      // 表单模式：create-新增, update-编辑, view-查看
      formMode: 'create',
      // 当前操作的工序数据
      currentOperation: null
    }
  },
  created() {
    // 创建防抖搜索函数
    this.debouncedSearch = debounce(this.fetchList, 300)
    // 初始化加载数据
    this.fetchList()
  },
  methods: {
    // 获取列表数据
    async fetchList() {
      try {
        this.loading = true
        const params = {
          page: this.pagination.page,
          limit: this.pagination.limit,
          ...this.searchParams
        }

        const response = await getOperationList(params)
        this.tableData = response.data.items || []
        this.total = response.data.total || 0
        this.$refs.operationTable.refreshSucceed()
      } catch (error) {
        console.error('获取工序列表失败:', error)
        this.$refs.operationTable.refreshFail('获取数据失败，请稍后重试')
      } finally {
        this.loading = false
      }
    },

    // 搜索处理
    handleSearch(formData) {
      this.pagination.page = 1
      this.searchParams = formData
      this.debouncedSearch()
    },

    // 重置搜索
    handleReset() {
      this.searchParams = {
        keyword: '',
        type: '',
        status: '',
        reportingPoint: ''
      }
      this.pagination.page = 1
      this.fetchList()
    },

    // 统一的分页变化处理
    handlePaginationChange({ page, limit }) {
      this.pagination.page = page
      this.pagination.limit = limit
      this.fetchList()
    },

    // 创建工序
    handleCreate() {
      this.formMode = 'create'
      this.currentOperation = null
      this.formDrawerVisible = true
    },

    // 编辑工序
    handleEdit(row) {
      this.formMode = 'update'
      this.currentOperation = { ...row }
      this.formDrawerVisible = true
    },

    // 查看工序
    handleView(row) {
      this.formMode = 'view'
      this.currentOperation = { ...row }
      this.formDrawerVisible = true
    },

    // 删除工序
    handleDelete(row) {
      this.$confirm(`确定要删除工序 "${row.name}" 吗？`, '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        try {
          const response = await deleteOperation(row.id)
          this.$message.success(response.message || '删除成功')
          this.fetchList()
        } catch (error) {
          console.error('删除失败:', error)
          const errorMessage = error.response?.data?.message || error.message || '删除失败，请稍后重试'
          this.$message.error(errorMessage)
        }
      }).catch(() => {
        // 用户取消删除
        this.$message.info('已取消删除操作')
      })
    },

    // 批量删除工序 - 简化版
    async handleBatchDelete(rows) {
      this.$confirm(`确认批量删除选中的 ${rows.length} 个工序吗？此操作不可恢复`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        try {
          const ids = rows.map(row => row.id)
          const response = await batchDeleteOperations(ids)
          this.$message.success(response.message || `成功删除 ${response.data?.totalDeleted || rows.length} 个工序`)
          this.fetchList()
        } catch (error) {
          // 增加详细的错误日志，方便调试
          console.error('捕获到的API错误:', error)

          if (error instanceof ApiError && error.code === 'OPERATIONS_IN_USE') {
            const cannotDeleteIds = error.details?.cannotDeleteIds || []

            if (cannotDeleteIds.length > 0) {
              const cannotDeleteDetails = cannotDeleteIds.map(id => {
                const item = rows.find(row => row.id === id)
                return item ? `【${item.code}】${item.name}` : id
              })

              this.$message({
                message: `以下工序正在被工艺路线使用，无法删除：<br/>${cannotDeleteDetails.join('<br/>')}`,
                type: 'error',
                duration: 8000,
                dangerouslyUseHTMLString: true,
                customClass: 'batch-delete-error-message'
              })
            } else {
              this.$message.error(error.message || '部分工序正在使用中，无法删除')
            }
          } else {
            const errorMessage = error.message || '删除失败，请稍后重试'
            this.$message.error(errorMessage)
          }
        }
      }).catch(() => {
        this.$message.info('已取消删除操作')
      })
    },

    // 状态变更处理
    handleStatusChange({ id, status }) {
      const row = this.tableData.find(item => item.id === id)
      if (!row) {
        this.$message.error('未找到对应工序')
        return
      }

      const statusText = status === 'Enabled' ? '启用' : '禁用'
      this.$confirm(`确定要将工序 "${row.name}" 状态更改为 "${statusText}" 吗？`, '状态变更确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        try {
          const response = await updateOperationStatus(id, status)
          this.$message.success(response.message || '状态更新成功')
          this.fetchList()
        } catch (error) {
          console.error('状态更新失败:', error)
          const errorMessage = error.response?.data?.message || error.message || '状态更新失败，请稍后重试'
          this.$message.error(errorMessage)
        }
      }).catch(() => {
        // 用户取消更新
        this.$message.info('已取消状态变更操作')
      })
    },

    // 批量启用处理
    handleBatchEnable(rows) {
      this.$confirm(`确定要启用选中的 ${rows.length} 个工序吗？`, '批量启用确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        try {
          const ids = rows.map(row => row.id)
          const response = await batchUpdateOperationStatus(ids, 'Enabled')
          this.$message.success(response.message || '批量启用成功')
          this.fetchList()
        } catch (error) {
          console.error('批量启用失败:', error)
          const errorMessage = error.response?.data?.message || error.message || '批量启用失败，请稍后重试'
          this.$message.error(errorMessage)
        }
      }).catch(() => {
        // 用户取消启用
        this.$message.info('已取消批量启用操作')
      })
    },

    // 批量禁用处理
    handleBatchDisable(rows) {
      this.$confirm(`确定要禁用选中的 ${rows.length} 个工序吗？`, '批量禁用确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        try {
          const ids = rows.map(row => row.id)
          const response = await batchUpdateOperationStatus(ids, 'Disabled')
          this.$message.success(response.message || '批量禁用成功')
          this.fetchList()
        } catch (error) {
          console.error('批量禁用失败:', error)
          const errorMessage = error.response?.data?.message || error.message || '批量禁用失败，请稍后重试'
          this.$message.error(errorMessage)
        }
      }).catch(() => {
        // 用户取消禁用
        this.$message.info('已取消批量禁用操作')
      })
    },

    // 导出处理
    handleExport() {
      // 导出功能实现
      console.log('导出工序数据')
      this.$message.info('导出功能开发中...')
    },

    // 导入处理
    handleImport() {
      // 导入功能实现
      console.log('导入工序数据')
      this.$message.info('导入功能开发中...')
    },

    // 表单成功处理
    handleFormSuccess(result) {
      console.log('表单操作成功:', result)

      // 刷新列表
      this.fetchList()

      // 如果不是连续编辑，关闭抽屉
      if (!result.continueEdit) {
        this.formDrawerVisible = false
      }
    },

    // 表单关闭处理
    handleFormClose() {
      this.formDrawerVisible = false
      this.currentOperation = null
    }
  }
}
</script>

<style lang="scss" scoped>
.operation-management {
  padding: 20px;
}
</style>

<style lang="scss">
// 批量删除错误信息样式
.batch-delete-error-message {
  .el-message__content {
    white-space: pre-line !important;
    line-height: 1.6 !important;
    max-width: 500px !important;
  }
}
</style>
