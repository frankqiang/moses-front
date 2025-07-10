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
    />

    <!-- 工序表单抽屉 -->
    <operation-form-drawer
      :visible.sync="formDrawerVisible"
      :mode="formMode"
      :operation-data="currentOperation"
      @success="handleFormSuccess"
      @close="handleFormClose"
    />

    <!-- 批量删除确认组件 -->
    <batch-delete-confirm
      ref="batchDeleteConfirm"
      :delete-api="deleteOperationsApi"
      :conflict-detector="detectOperationConflicts"
      :display-fields="{
        id: 'id',
        code: 'code',
        name: 'name'
      }"
      title="批量删除工序"
      action-name="删除"
      @delete-success="handleDeleteSuccess"
      @delete-error="handleDeleteError"
      @delete-cancel="handleDeleteCancel"
      @conflict-detected="handleConflictDetected"
    />
  </div>
</template>

<script>
import SearchForm from '../components/SearchForm.vue'
import OperationTable from '../components/OperationTable.vue'
import OperationFormDrawer from '../components/OperationFormDrawer.vue'
import BatchDeleteConfirm from '@/components/BatchDeleteConfirm'
import { debounce } from '@/utils'
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
    OperationFormDrawer,
    BatchDeleteConfirm
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
        this.$message.info('已取消删除操作')
      })
    },

    // 批量删除工序
    handleBatchDelete(rows) {
      this.$refs.batchDeleteConfirm.show(rows)
    },

    // 删除API函数
    async deleteOperationsApi(items) {
      try {
        const ids = items.map(item => item.id)
        console.log('正在执行删除操作，工序IDs:', ids)
        
        const response = await batchDeleteOperations(ids)
        
        // 检查响应数据，确保删除操作成功
        const actualDeletedCount = response.data?.deletedCount || response.deletedCount || items.length
        
        console.log('删除操作完成:', {
          请求删除数量: items.length,
          实际删除数量: actualDeletedCount,
          响应消息: response.message
        })
        
        return {
          success: true,
          message: response.message || `批量删除成功，共删除 ${actualDeletedCount} 个工序`,
          deletedCount: actualDeletedCount
        }
      } catch (error) {
        console.error('批量删除失败:', error)
        
        // 处理特殊错误情况
        if (error.response?.status === 404) {
          return {
            success: false,
            message: '要删除的工序不存在或已被删除'
          }
        }
        
        if (error.response?.status === 409) {
          return {
            success: false,
            message: '工序正在使用中，无法删除'
          }
        }
        
        return {
          success: false,
          message: error.message || error.response?.data?.message || '批量删除失败，请稍后重试'
        }
      }
    },

    // 冲突检测函数
    async detectOperationConflicts(items) {
      try {
        // ✅ 修复：调用专门的冲突检测API，而不是直接删除
        const ids = items.map(item => item.id)
        
        // 这里应该调用专门的冲突检测API
        // 暂时模拟冲突检测逻辑，实际开发中应该是后端提供的冲突检测接口
        const mockConflictCheckResponse = await this.checkOperationConflicts(ids)
        
        if (mockConflictCheckResponse.hasConflicts) {
          return {
            hasConflicts: true,
            conflicts: mockConflictCheckResponse.conflicts,
            canDelete: mockConflictCheckResponse.canDelete
          }
        }

        // 如果没有冲突，返回可以删除
        return {
          hasConflicts: false,
          conflicts: [],
          canDelete: items
        }
      } catch (error) {
        console.error('冲突检测失败:', error)
        
        // 检测失败时，默认无冲突（让组件处理错误）
        return {
          hasConflicts: false,
          conflicts: [],
          canDelete: items
        }
      }
    },

    // 模拟冲突检测API（实际项目中应该是后端API）
    async checkOperationConflicts(ids) {
      // 模拟API调用延时
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // 模拟冲突检测逻辑
      // 实际项目中这里应该调用后端的冲突检测接口
      const conflicts = []
      const canDelete = []
      
      // 🔧 修复：使用更合理的冲突判断规则，确保数据不重复
      ids.forEach(id => {
        const item = this.tableData.find(row => row.id === id)
        if (item) {
          // 基于工序状态和类型判断是否冲突（更真实的业务逻辑）
          const hasConflict = this.checkSingleOperationConflict(item)
          
          if (hasConflict) {
            conflicts.push({
              ...item,
              reason: hasConflict.reason
            })
          } else {
            canDelete.push(item)
          }
        }
      })
      
      console.log('冲突检测完成:', {
        总数: ids.length,
        冲突数量: conflicts.length,
        可删除数量: canDelete.length,
        冲突ID列表: conflicts.map(c => c.id),
        可删除ID列表: canDelete.map(c => c.id)
      })
      
      return {
        hasConflicts: conflicts.length > 0,
        conflicts,
        canDelete
      }
    },

    // 检查单个工序是否有冲突
    checkSingleOperationConflict(operation) {
      // 模拟业务规则：
      // 1. 启用状态的工序可能正在使用中
      // 2. 特定类型的工序可能有依赖关系
      // 3. 特定ID模式的工序模拟正在使用
      
      // 规则1：状态为 Enabled 且类型为 Production 的工序正在使用中
      if (operation.status === 'Enabled' && operation.type === 'Production') {
        return {
          reason: '生产工序正在使用中，无法删除'
        }
      }
      
      // 规则2：工序代码包含特定关键字的正在使用中
      if (operation.code && (operation.code.includes('ROLLING') || operation.code.includes('HEATING'))) {
        return {
          reason: '关键工序正在使用中，无法删除'
        }
      }
      
      // 规则3：模拟某些随机工序正在使用（基于工序名称哈希）
      const nameHash = operation.name ? operation.name.split('').reduce((a, b) => a + b.charCodeAt(0), 0) : 0
      if (nameHash % 7 === 0) {  // 约14%的工序会有冲突
        return {
          reason: '工序被其他模块引用，无法删除'
        }
      }
      
      // 规则4：特定ID格式的工序正在使用
      if (operation.id && operation.id.toString().includes('NaN')) {
        return {
          reason: '数据异常的工序无法删除'
        }
      }
      
      return null  // 无冲突
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
    },

    // 删除成功处理
    handleDeleteSuccess({ deletedCount, message }) {
      // 只有真正删除了数据才显示成功消息
      if (deletedCount > 0) {
        this.$message.success(message || `成功删除 ${deletedCount} 个工序`)
        this.fetchList()
      } else {
        // 如果删除数量为0，可能是重复调用或其他问题
        console.warn('删除成功但删除数量为0:', { deletedCount, message })
        this.$message.warning('删除操作已完成，但未发现需要删除的数据')
      }
    },

    // 删除失败处理
    handleDeleteError({ error }) {
      console.error('删除操作失败:', error)
      const errorMessage = error?.message || error?.response?.data?.message || '删除操作失败，请稍后重试'
      this.$message.error(errorMessage)
    },

    // 取消删除处理
    handleDeleteCancel() {
      // 只有用户主动取消时才显示取消消息
      console.log('用户取消了删除操作')
      this.$message.info('已取消删除操作')
    },

    // 冲突检测处理
    handleConflictDetected({ conflicts, canDelete }) {
      console.log('检测到删除冲突:', conflicts)
      console.log('可删除的项目:', canDelete)
      
      // 这里不需要额外的消息提示，BatchDeleteConfirm 组件会处理冲突显示
      if (conflicts.length > 0) {
        console.warn(`检测到 ${conflicts.length} 个工序存在冲突，无法删除`)
      }
      if (canDelete.length > 0) {
        console.info(`有 ${canDelete.length} 个工序可以正常删除`)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.operation-management {
  padding: 20px;
}
</style>
