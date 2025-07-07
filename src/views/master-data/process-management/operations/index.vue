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
      :data="tableData"
      :loading="loading"
      :total="total"
      :page="pagination.page"
      :limit="pagination.limit"
      @pagination="handlePaginationChange"
      @create="handleCreate"
      @edit="handleEdit"
      @view="handleView"
      @delete="handleDelete"
      @batch-delete="handleBatchDelete"
      @status-change="handleStatusChange"
      @batch-status-change="handleBatchStatusChange"
      @export="handleExport"
      @import="handleImport"
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
import SearchForm from '../components/SearchForm.vue'
import OperationTable from '../components/OperationTable.vue'
import OperationFormDrawer from '../components/OperationFormDrawer.vue'
import { debounce } from '@/utils'
import { getOperationList } from '../api'

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
      } catch (error) {
        console.error('获取工序列表失败:', error)
        this.$message.error('获取数据失败，请稍后重试')
      } finally {
        this.loading = false
      }
    },

    // 搜索处理
    handleSearch() {
      this.pagination.page = 1
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
          await this.$api.delete(`/mes/v1/master-data/process-management/operations/${row.id}`)
          this.$message.success('删除成功')
          this.fetchList()
        } catch (error) {
          console.error('删除失败:', error)
          this.$message.error('删除失败，请稍后重试')
        }
      }).catch(() => {
        // 用户取消删除
      })
    },

    // 批量删除工序
    handleBatchDelete(rows) {
      this.$confirm(`确定要删除选中的 ${rows.length} 个工序吗？`, '批量删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        try {
          const ids = rows.map(row => row.id)
          await this.$api.delete('/mes/v1/master-data/process-management/operations/batch', {
            data: { ids }
          })
          this.$message.success('批量删除成功')
          this.fetchList()
        } catch (error) {
          console.error('批量删除失败:', error)
          this.$message.error('批量删除失败，请稍后重试')
        }
      }).catch(() => {
        // 用户取消删除
      })
    },

    // 状态变更处理
    handleStatusChange(row, status) {
      this.$confirm(`确定要将工序 "${row.name}" 状态更改为 "${status}" 吗？`, '状态变更确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        try {
          await this.$api.put(`/mes/v1/master-data/process-management/operations/${row.id}/status`, {
            status
          })
          this.$message.success('状态更新成功')
          this.fetchList()
        } catch (error) {
          console.error('状态更新失败:', error)
          this.$message.error('状态更新失败，请稍后重试')
        }
      }).catch(() => {
        // 用户取消更新
      })
    },

    // 批量状态变更处理
    handleBatchStatusChange(rows, status) {
      this.$confirm(`确定要将选中的 ${rows.length} 个工序状态更改为 "${status}" 吗？`, '批量状态变更确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        try {
          const ids = rows.map(row => row.id)
          await this.$api.put('/mes/v1/master-data/process-management/operations/batch/status', {
            ids,
            status
          })
          this.$message.success('批量状态更新成功')
          this.fetchList()
        } catch (error) {
          console.error('批量状态更新失败:', error)
          this.$message.error('批量状态更新失败，请稍后重试')
        }
      }).catch(() => {
        // 用户取消更新
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
