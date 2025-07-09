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
      @batch-enable="handleBatchEnable"
      @batch-disable="handleBatchDisable"
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
import { ApiError } from '@/utils/request'
import { 
  getOperationList, 
  updateOperationStatus, 
  batchUpdateOperationStatus,
  deleteOperation,
  batchDeleteOperations
} from '../api'

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
      })
    },

    // 批量删除工序
    handleBatchDelete(rows) {
      this.performBatchDeleteOperation(rows)
    },

    // 执行批量删除操作
    async performBatchDeleteOperation(rows) {
      try {
        this.loading = true
        const ids = rows.map(row => row.id)
        const response = await batchDeleteOperations(ids)

        // 提供详细的成功反馈
        const successMessage = response.message || `批量删除成功，共删除 ${rows.length} 个工序`
        this.$message.success(successMessage)
        this.fetchList()
      } catch (error) {
        console.error('批量删除失败:', error)

        // 增强错误处理逻辑 - 支持新旧格式
        const errorCode = error.code || error.response?.data?.error?.code
        const errorDetails = error.details || error.response?.data?.error?.details

        if (errorCode === 'OPERATIONS_IN_USE') {
          const { cannotDeleteIds } = errorDetails || {}
          const cannotDeleteOperations = rows.filter(row => cannotDeleteIds?.includes(row.id))
          this.showCannotDeleteDialog(cannotDeleteOperations, rows)
        } else {
          const errorMessage = error.message || error.response?.data?.message || '批量删除失败，请稍后重试'
          this.$message.error(errorMessage)
        }
      } finally {
        this.loading = false
      }
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
    },

    // 显示不可删除工序的详细信息
    showCannotDeleteDialog(cannotDeleteOperations, allRows) {
      const canDeleteCount = allRows.length - cannotDeleteOperations.length
      const canDeleteOperations = allRows.filter(row =>
        !cannotDeleteOperations.some(blocked => blocked.id === row.id)
      )

      const dialogContent = `
        <div class="simple-conflict-dialog">
          <div class="conflict-header">
            <i class="el-icon-warning conflict-icon"></i>
            <div class="conflict-text">
              <h3>部分工序无法删除</h3>
              <p>发现 ${cannotDeleteOperations.length} 个工序正在使用中${canDeleteCount > 0 ? `，${canDeleteCount} 个工序可安全删除` : ''}</p>
            </div>
          </div>
          
          <div class="blocked-operations">
            <h4>无法删除的工序：</h4>
            <div class="operation-list">
              ${cannotDeleteOperations.map((op, index) => `
                <div class="operation-item blocked">
                  <span class="item-number">${index + 1}</span>
                  <span class="item-code">${op.code}</span>
                  <span class="item-name">${op.name}</span>
                  <span class="item-status">使用中</span>
                </div>
              `).join('')}
            </div>
          </div>
          
          ${canDeleteCount > 0 ? `
            <div class="allowed-operations">
              <h4>可安全删除的工序：</h4>
              <div class="operation-list">
                ${canDeleteOperations.map((op, index) => `
                  <div class="operation-item allowed">
                    <span class="item-number">${index + 1}</span>
                    <span class="item-code">${op.code}</span>
                    <span class="item-name">${op.name}</span>
                    <span class="item-status">可删除</span>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
          
          <div class="conflict-note">
            <i class="el-icon-info"></i>
            <span>${canDeleteCount > 0 ? '您可以选择继续删除可用的工序' : '所有工序都在使用中，无法删除'}</span>
          </div>
        </div>
      `

      this.$confirm(dialogContent, '删除冲突', {
        confirmButtonText: canDeleteCount > 0 ? '仅删除可删除的工序' : '我知道了',
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: true,
        customClass: 'simple-conflict-dialog-box'
      }).then(() => {
        if (canDeleteCount > 0) {
          this.performBatchDeleteOperation(canDeleteOperations)
        }
      }).catch(() => {
        this.$message.info('已取消操作')
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.operation-management {
  padding: 20px;
}
</style>
