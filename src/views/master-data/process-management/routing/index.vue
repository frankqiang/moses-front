<template>
  <div class="app-container routing-management">
    <search-form
      :loading="loading"
      @search="handleSearch"
      @reset="handleReset"
    />

    <routing-table
      :data="list"
      :total="total"
      :loading="loading"
      :page="listQuery.page"
      :limit="listQuery.limit"
      @pagination-change="handlePaginationChange"
      @add="handleCreate"
      @edit="handleEdit"
      @view="handleView"
      @delete="handleDelete"
      @submit="handleSubmitApproval"
      @approve="handleApprove"
      @reject="handleReject"
      @archive="handleArchive"
      @newVersion="handleNewVersion"
      @refresh="getList"
      @history="handleHistory"
      @batch-delete="handleBatchDelete"
      @batch-archive="handleBatchArchive"
    />

    <!-- 工艺路线表单抽屉 -->
    <routing-form-drawer
      :visible.sync="formDrawerVisible"
      :mode="formMode"
      :routing-data="currentRouting"
      @success="handleFormSuccess"
      @close="handleFormClose"
    />
    
    <!-- 历史记录查看对话框 -->
    <routing-history-dialog
      :visible.sync="historyDialogVisible"
      :routing-data="currentHistoryRouting"
      @close="handleHistoryDialogClose"
    />

  </div>
</template>

<script>
import { 
  getRoutingList, 
  deleteRouting, 
  createNewVersion,
  submitRoutingApproval,
  approveRouting,
  rejectRouting,
  archiveRouting,
  getRoutingHistory,
  getRoutingApprovalHistory
} from './api'
import SearchForm from './components/SearchForm.vue'
import RoutingTable from './components/RoutingTable.vue'
import RoutingFormDrawer from './components/RoutingFormDrawer.vue'
import RoutingHistoryDialog from './components/RoutingHistoryDialog.vue'
import { debounce } from '@/utils'

export default {
  name: 'RoutingManagement',
  components: {
    SearchForm,
    RoutingTable,
    RoutingFormDrawer,
    RoutingHistoryDialog
  },
  data() {
    return {
      list: [],
      total: 0,
      loading: true,
      listQuery: {
        page: 1,
        limit: 10,
        keyword: '',
        type: '',
        status: ''
      },
      // 表单抽屉相关状态
      formDrawerVisible: false,
      formMode: 'create',
      currentRouting: null,

       // 历史记录对话框相关
      historyDialogVisible: false,
      currentHistoryRouting: null,
      // 操作状态标志
      isCreatingNewVersion: false // 防止重复创建新版本
    }
  },
  created() {
    this.debouncedFetchList = debounce(this.getList, 300)
    this.getList()
  },
  methods: {
    async getList() {
      this.loading = true
      try {
        const { data } = await getRoutingList(this.listQuery)
        this.list = data.items
        this.total = data.total
      } catch (error) {
        console.error('获取工艺路线列表失败:', error)
        const errorMessage = error.response?.data?.message || error.message || '获取工艺路线列表失败'
        this.$message.error(errorMessage)
      } finally {
        this.loading = false
      }
    },
    handleSearch(query) {
      this.listQuery.page = 1
      this.listQuery.keyword = query.keyword
      this.listQuery.status = Array.isArray(query.status) ? query.status.join(',') : ''
      this.listQuery.type = Array.isArray(query.type) ? query.type.join(',') : ''
      this.debouncedFetchList()
    },
    handleReset() {
      this.listQuery = {
        page: 1,
        limit: 10,
        keyword: '',
        type: '',
        status: ''
      }
      this.getList()
    },
    handlePaginationChange({ page, limit }) {
      this.listQuery.page = page
      this.listQuery.limit = limit
      this.getList()
    },
    handleCreate() {
      this.formMode = 'create'
      this.currentRouting = null
      this.formDrawerVisible = true
    },
    handleEdit(row) {
      this.formMode = 'update'
      this.currentRouting = row
      this.formDrawerVisible = true
    },
    handleView(row) {
      this.formMode = 'view'
      this.currentRouting = row
      this.formDrawerVisible = true
    },
    handleDelete(row) {
      this.$confirm(`确定要删除工艺路线 "${row.name}" 吗？`, '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        try {
          const response = await deleteRouting(row.id)
          this.$message.success(response.message || '删除成功')
          this.getList()
        } catch (error) {
          console.error('删除工艺路线失败:', error)
          const errorMessage = error.response?.data?.message || error.message || '删除失败，请稍后重试'
          this.$message.error(errorMessage)
        }
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    /**
     * 处理提交审批操作
     * @param {Object} row - 工艺路线数据行
     * @description 将草稿状态的工艺路线提交审批，状态变更为待审批
     */
    async handleSubmitApproval(row) {
      try {
        // 状态校验
        if (row.status !== 'Draft') {
          this.$message.warning('只有草稿状态的工艺路线才能提交审批')
          return
        }
        
        // 用户确认
        await this.$confirm(
          `确定要提交审批工艺路线 "${row.name}" 吗？\n提交后将无法继续编辑，需要等待审批结果。`, 
          '提交审批确认', 
          {
            confirmButtonText: '确定提交',
            cancelButtonText: '取消',
            type: 'warning',
            dangerouslyUseHTMLString: true
          }
        )
        
        // 执行提交审批操作
        const response = await submitRoutingApproval(row.id, {
          code: row.code, // 添加路线代码
          name: row.name, // 添加路线名称
          submittedBy: 'current_user', // 实际应用中应从用户状态获取
          submittedAt: new Date().toISOString(),
          remarks: '提交审批' // 可以后续扩展为用户输入
        })
        
        this.$message.success(response.message || '提交审批成功')
        this.getList() // 刷新列表
        
      } catch (error) {
        if (error === 'cancel') {
          this.$message.info('已取消提交')
        } else {
          console.error('提交审批失败:', error)
          const errorMessage = error.response?.data?.message || error.message || '提交审批失败，请稍后重试'
          this.$message.error(errorMessage)
        }
      }
    },
    
    /**
     * 处理批准操作
     * @param {Object} row - 工艺路线数据行
     * @description 批准待审批状态的工艺路线，状态变更为生效
     */
    async handleApprove(row) {
      try {
        // 状态校验
        if (row.status !== 'PendingApproval') {
          this.$message.warning('只有待审批状态的工艺路线才能批准')
          return
        }
        
        // 用户确认
        await this.$confirm(
          `确定要批准工艺路线 "${row.name}" 吗？\n批准后该工艺路线将立即生效。`, 
          '批准确认', 
          {
            confirmButtonText: '确定批准',
            cancelButtonText: '取消',
            type: 'success',
            dangerouslyUseHTMLString: true
          }
        )
        
        // 执行批准操作
        const response = await approveRouting(row.id, {
          approvedBy: 'current_user', // 实际应用中应从用户状态获取
          approvedAt: new Date().toISOString(),
          approvalComments: '批准通过' // 可以后续扩展为用户输入
        })
        
        this.$message.success(response.message || '批准成功')
        this.getList() // 刷新列表
        
      } catch (error) {
        if (error === 'cancel') {
          this.$message.info('已取消批准')
        } else {
          console.error('批准失败:', error)
          const errorMessage = error.response?.data?.message || error.message || '批准失败，请稍后重试'
          this.$message.error(errorMessage)
        }
      }
    },
    
    /**
     * 处理驳回操作
     * @param {Object} row - 工艺路线数据行
     * @description 驳回待审批状态的工艺路线，状态变更为草稿
     */
    async handleReject(row) {
      try {
        // 状态校验
        if (row.status !== 'PendingApproval') {
          this.$message.warning('只有待审批状态的工艺路线才能驳回')
          return
        }
        
        // 获取驳回原因（可以后续扩展为更复杂的表单）
        const { value: rejectReason } = await this.$prompt(
          '请输入驳回原因：', 
          '驳回工艺路线', 
          {
            confirmButtonText: '确定驳回',
            cancelButtonText: '取消',
            inputType: 'textarea',
            inputPlaceholder: '请详细说明驳回原因...',
            inputValidator: (value) => {
              if (!value || value.trim().length === 0) {
                return '驳回原因不能为空'
              }
              if (value.trim().length < 5) {
                return '驳回原因至少需要5个字符'
              }
              return true
            }
          }
        )
        
        // 执行驳回操作
        const response = await rejectRouting(row.id, {
          rejectedBy: 'current_user', // 实际应用中应从用户状态获取
          rejectedAt: new Date().toISOString(),
          rejectReason: rejectReason.trim()
        })
        
        this.$message.success(response.message || '驳回成功')
        this.getList() // 刷新列表
        
      } catch (error) {
        if (error === 'cancel') {
          this.$message.info('已取消驳回')
        } else {
          console.error('驳回失败:', error)
          const errorMessage = error.response?.data?.message || error.message || '驳回失败，请稍后重试'
          this.$message.error(errorMessage)
        }
      }
    },
    
    /**
     * 处理归档操作
     * @param {Object} row - 工艺路线数据行
     * @description 将生效状态的工艺路线归档，状态变更为已归档
     */
    async handleArchive(row) {
      try {
        // 状态校验
        if (row.status !== 'Enabled') {
          this.$message.warning('只有生效状态的工艺路线才能归档')
          return
        }
        
        // 用户确认
        await this.$confirm(
          `确定要归档工艺路线 "${row.name}" 吗？\n归档后该工艺路线将不再可用，但可以查看历史记录。`, 
          '归档确认', 
          {
            confirmButtonText: '确定归档',
            cancelButtonText: '取消',
            type: 'warning',
            dangerouslyUseHTMLString: true
          }
        )
        
        // 执行归档操作
        const response = await archiveRouting(row.id, {
          archivedBy: 'current_user', // 实际应用中应从用户状态获取
          archivedAt: new Date().toISOString(),
          archiveReason: '手动归档' // 可以后续扩展为用户输入
        })
        
        this.$message.success(response.message || '归档成功')
        this.getList() // 刷新列表
        
      } catch (error) {
        if (error === 'cancel') {
          this.$message.info('已取消归档')
        } else {
          console.error('归档失败:', error)
          const errorMessage = error.response?.data?.message || error.message || '归档失败，请稍后重试'
          this.$message.error(errorMessage)
        }
      }
    },
    /**
     * 处理创建新版本操作
     * @param {Object} row - 工艺路线数据行
     */
    async handleNewVersion(row) {
      // 防重复操作检查
      if (this.isCreatingNewVersion) {
        this.$message.warning('正在处理中，请勿重复操作')
        return
      }
      
      try {
        // 前置条件校验
        const validationResult = this.validateNewVersionConditions(row)
        if (!validationResult.valid) {
          this.$message.warning(validationResult.message)
          return
        }
        
        // 用户意图确认 - 符合文档要求的确认对话框
        const confirmResult = await this.confirmNewVersionCreation(row)
        if (!confirmResult) {
          // 用户取消操作
          return
        }
        
        // 执行创建新版本操作 - 包含页面遮罩和防重复操作
        await this.executeNewVersionCreation(row)
        
      } catch (error) {
        // 错误处理
        console.error('创建新版本失败:', error)
        const errorMessage = error.response?.data?.message || error.message || '创建新版本失败，请稍后重试'
        this.$message.error(errorMessage)
        // 重置操作状态
        this.isCreatingNewVersion = false
      }
    },
    
    /**
     * 验证创建新版本的前置条件
     * @param {Object} row - 工艺路线数据行
     * @returns {Object} 验证结果 { valid: boolean, message: string }
     * @description 实现前置条件校验，包括存在性校验、状态一致性校验和草稿唯一性校验
     */
    validateNewVersionConditions(row) {
      // 存在性校验 - 检查工艺路线是否存在
      if (!row || !row.id) {
        return {
          valid: false,
          message: '工艺路线不存在或数据无效'
        }
      }
      
      // 状态一致性校验 - 检查工艺路线状态
      if (row.status !== 'Enabled') {
        return {
          valid: false,
          message: '只有生效状态的工艺路线才能创建新版本'
        }
      }
      
      // 草稿唯一性校验 - 检查是否已存在草稿版本
      // 注意：由于数据结构中没有baseId字段，这里使用code字段来判断同一工艺路线的不同版本
      // 同一工艺路线的不同版本应该具有相同的code值
      const hasDraft = this.list.some(item => 
        item.code === row.code && 
        item.status === 'Draft' && 
        item.id !== row.id
      )
      
      if (hasDraft) {
        return {
          valid: false,
          message: '已存在该工艺路线的草稿版本，请先处理现有草稿'
        }
      }
      
      // 检查必要的数据完整性
      if (!row.steps || row.steps.length === 0) {
        return {
          valid: false,
          message: '工艺路线必须包含至少一个工序步骤才能创建新版本'
        }
      }
      
      // 检查是否有必要的基础信息
      if (!row.code || !row.name || !row.type) {
        return {
          valid: false,
          message: '工艺路线的基础信息不完整，无法创建新版本'
        }
      }
      
      return { valid: true, message: '' }
    },
    
    /**
     * 用户创建新版本意图确认
     * @param {Object} row - 工艺路线数据行
     * @returns {Promise<boolean>} 用户确认结果
     * @description 实现用户交互与意图确认，显示简洁明了的确认信息
     */
    async confirmNewVersionCreation(row) {
      // 根据文档要求，显示简洁明了的确认信息
      // 动态内容：显示"您确定要基于当前[路线名称] v[当前版本号]创建一个新的可编辑草稿版本吗？"
      const confirmMessage = `您确定要基于当前<strong>${row.name} v${row.version}</strong>创建一个新的可编辑草稿版本吗？`
      
      try {
        // 使用Element UI的确认对话框
        await this.$confirm(confirmMessage, '确认创建新版本', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info',
          dangerouslyUseHTMLString: true,
          closeOnClickModal: false, // 防止误操作，点击遮罩不关闭
          closeOnPressEscape: true, // 允许按ESC键关闭
          customClass: 'new-version-confirm-dialog'
        })
        return true
      } catch {
        // 用户取消操作
        this.$message.info('已取消创建新版本')
        return false
      }
    },
    
    /**
     * 执行创建新版本操作
     * @param {Object} row - 工艺路线数据行
     * @description 实现核心处理流程中的数据持久化部分，包括调用API创建新版本、处理成功反馈和错误处理
     */
    async executeNewVersionCreation(row) {
      // 防重复操作标志
      if (this.isCreatingNewVersion) {
        this.$message.warning('正在处理中，请勿重复操作')
        return
      }
      
      this.isCreatingNewVersion = true
      
      // 显示全屏加载状态，实现页面遮罩
      const loading = this.$loading({
        lock: true,
        text: '正在创建新版本...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      
      try {
        // 调用创建新版本的API
        const response = await createNewVersion(row.id)
        
        // 获取新版本数据
        const newVersionData = response.data
        
        // 成功反馈 - 显示"已创建成功！"成功提示
        this.$message.success({
          message: `新版本 v${newVersionData?.version || '新版本'} 已创建成功！`,
          duration: 3000
        })
        
        // 刷新列表以显示新创建的版本
        await this.getList()
        
        // 自动导航到新创建的版本编辑页面
        if (newVersionData && newVersionData.id) {
          // 找到新创建的版本数据
          const newVersion = this.list.find(item => item.id === newVersionData.id)
          if (newVersion) {
            // 打开编辑抽屉
            this.formMode = 'update'
            this.currentRouting = newVersion
            this.formDrawerVisible = true
          }
        }
        
      } catch (error) {
        // 错误处理
        console.error('创建新版本失败:', error)
        const errorMessage = error.response?.data?.message || error.message || '创建新版本失败，请稍后重试'
        this.$message.error(errorMessage)
      } finally {
        // 关闭加载状态并重置防重复操作标志
        loading.close()
        this.isCreatingNewVersion = false
      }
    },
    
    /**
     * 查看历史记录
     * @param {Object} routing - 工艺路线数据
     */
    handleHistory(routing) {
      this.currentHistoryRouting = routing
      this.historyDialogVisible = true
    },

    /**
     * 关闭历史记录对话框
     */
    handleHistoryDialogClose() {
      this.historyDialogVisible = false
      this.currentHistoryRouting = null
    },

    /**
     * 获取路线类型标签
     * @param {string} type - 路线类型值
     * @returns {string} 类型标签
     */
    getTypeLabel(type) {
      const typeOptions = [
        { label: '标准路线', value: 'Standard' },
        { label: '返工路线', value: 'Rework' },
        { label: '试验路线', value: 'Trial' }
      ]
      const option = typeOptions.find(opt => opt.value === type)
      return option ? option.label : type
    },
    handleFormSuccess(payload = {}) {
      console.log('handleFormSuccess called with payload:', payload)
      if (payload.continueEdit) {
        console.log('Continue mode: refreshing list without closing drawer')
        this.getList()
      } else {
        console.log('Default mode: closing drawer and refreshing list')
        this.formDrawerVisible = false
        this.getList()
      }
    },
    handleFormClose() {
      this.currentRouting = null
    },
    /**
     * 处理批量删除操作
     * @param {Array} rows - 选中的工艺路线数据
     */
    async handleBatchDelete(rows) {
      if (!rows || rows.length === 0) {
        this.$message.warning('请至少选择一条记录')
        return
      }
      
      try {
        await this.$confirm(
          `确定要删除选中的 ${rows.length} 条工艺路线吗？此操作不可恢复。`,
          '批量删除确认',
          {
            confirmButtonText: '确定删除',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        
        // 显示加载状态
        const loading = this.$loading({
          lock: true,
          text: '正在删除...',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        })
        
        try {
          // 批量删除API调用
          const deletePromises = rows.map(row => deleteRouting(row.id))
          await Promise.all(deletePromises)
          
          this.$message.success(`成功删除 ${rows.length} 条工艺路线`)
          this.getList()
        } catch (error) {
          console.error('批量删除失败:', error)
          const errorMessage = error.response?.data?.message || error.message || '批量删除失败，请稍后重试'
          this.$message.error(errorMessage)
        } finally {
          loading.close()
        }
      } catch {
        this.$message.info('已取消删除')
      }
    },
    /**
     * 处理批量归档操作
     * @param {Array} rows - 选中的工艺路线数据
     */
    async handleBatchArchive(rows) {
      if (!rows || rows.length === 0) {
        this.$message.warning('请至少选择一条记录')
        return
      }
      
      // 检查所有选中项是否都是生效状态
      const invalidRows = rows.filter(row => row.status !== 'Enabled')
      if (invalidRows.length > 0) {
        this.$message.warning('只有生效状态的工艺路线才能归档')
        return
      }
      
      try {
        await this.$confirm(
          `确定要归档选中的 ${rows.length} 条工艺路线吗？归档后将不再可用。`,
          '批量归档确认',
          {
            confirmButtonText: '确定归档',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        
        // 显示加载状态
        const loading = this.$loading({
          lock: true,
          text: '正在归档...',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        })
        
        try {
          // 批量归档API调用
          const archivePromises = rows.map(row => archiveRouting(row.id))
          await Promise.all(archivePromises)
          
          this.$message.success(`成功归档 ${rows.length} 条工艺路线`)
          this.getList()
        } catch (error) {
          console.error('批量归档失败:', error)
          const errorMessage = error.response?.data?.message || error.message || '批量归档失败，请稍后重试'
          this.$message.error(errorMessage)
        } finally {
          loading.close()
        }
      } catch {
        this.$message.info('已取消归档')
      }
    }
  }
}
</script>

<style scoped>
.routing-management {
  padding: 20px;
}
</style>