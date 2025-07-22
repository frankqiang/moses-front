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
      @submit="handleSubmit"
      @newVersion="handleNewVersion"
      @refresh="getList"
    />

    <!-- 工艺路线表单抽屉 -->
    <routing-form-drawer
      :visible.sync="formDrawerVisible"
      :mode="formMode"
      :routing-data="currentRouting"
      @success="handleFormSuccess"
      @close="handleFormClose"
    />

  </div>
</template>

<script>
import { getRoutingList, deleteRouting } from './api'
import SearchForm from './components/SearchForm.vue'
import RoutingTable from './components/RoutingTable.vue'
import RoutingFormDrawer from './components/RoutingFormDrawer.vue'
import { debounce } from '@/utils'

export default {
  name: 'RoutingManagement',
  components: {
    SearchForm,
    RoutingTable,
    RoutingFormDrawer
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
      currentRouting: null
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
    handleSubmit(row) {
      this.$confirm(`确定要提交审批工艺路线 "${row.name}" 吗？`, '提交确认', {
        type: 'info'
      }).then(() => {
        this.$message.info(`TODO: 实现提交ID为 ${row.id} 的工艺路线状态变更逻辑`)
      }).catch(() => {})
    },
    /**
     * 处理创建新版本操作
     * @param {Object} row - 工艺路线数据行
     */
    async handleNewVersion(row) {
      try {
        // 前置条件校验
        const validationResult = this.validateNewVersionConditions(row)
        if (!validationResult.valid) {
          this.$message.warning(validationResult.message)
          return
        }
        
        // 用户意图确认
        const confirmResult = await this.confirmNewVersionCreation(row)
        if (!confirmResult) {
          return
        }
        
        // 执行创建新版本操作
        await this.executeNewVersionCreation(row)
        
      } catch (error) {
        console.error('创建新版本失败:', error)
        const errorMessage = error.response?.data?.message || error.message || '创建新版本失败，请稍后重试'
        this.$message.error(errorMessage)
      }
    },
    
    /**
     * 验证创建新版本的前置条件
     * @param {Object} row - 工艺路线数据行
     * @returns {Object} 验证结果 { valid: boolean, message: string }
     */
    validateNewVersionConditions(row) {
      // 检查工艺路线状态
      if (row.status !== 'Enabled') {
        return {
          valid: false,
          message: '只有生效状态的工艺路线才能创建新版本'
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
     */
    async confirmNewVersionCreation(row) {
      const confirmMessage = `
        <div style="text-align: left; line-height: 1.6;">
          <p><strong>即将为以下工艺路线创建新版本：</strong></p>
          <p>• 路线名称：${row.name}</p>
          <p>• 路线编码：${row.code}</p>
          <p>• 当前版本：${row.version}</p>
          <p>• 路线类型：${this.getTypeLabel(row.type)}</p>
          <br>
          <p><strong>创建新版本后：</strong></p>
          <p>• 新版本将基于当前版本的所有配置</p>
          <p>• 新版本状态为草稿，需要重新配置和审批</p>
          <p>• 当前版本保持不变</p>
          <br>
          <p>确定要继续吗？</p>
        </div>
      `
      
      try {
        await this.$confirm(confirmMessage, '创建新版本确认', {
          confirmButtonText: '确定创建',
          cancelButtonText: '取消',
          type: 'info',
          dangerouslyUseHTMLString: true,
          customClass: 'new-version-confirm-dialog'
        })
        return true
      } catch {
        this.$message.info('已取消创建新版本')
        return false
      }
    },
    
    /**
     * 执行创建新版本操作
     * @param {Object} row - 工艺路线数据行
     */
    async executeNewVersionCreation(row) {
      // 显示加载状态
      const loading = this.$loading({
        lock: true,
        text: '正在创建新版本...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      
      try {
        // TODO: 调用创建新版本的API
        // const response = await createNewVersion(row.id)
        
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // 成功反馈
        this.$message.success({
          message: `工艺路线 "${row.name}" 的新版本创建成功`,
          duration: 3000
        })
        
        // 刷新列表以显示新创建的版本
        await this.getList()
        
        // 可选：自动打开新创建的版本进行编辑
        // this.openNewVersionForEdit(newVersionData)
        
      } finally {
        loading.close()
      }
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
      console.log('handleFormSuccess called with payload:', payload);
      if (payload.continueEdit) {
        console.log('Continue mode: refreshing list without closing drawer');
        this.getList();
        console.log(222222222)
      } else {
        console.log('Default mode: closing drawer and refreshing list');
        this.formDrawerVisible = false;
        this.getList();
        console.log(3333333333)
      }
    },
    handleFormClose() {
      this.currentRouting = null
    }
  }
}
</script>

<style scoped>
.routing-management {
  padding: 20px;
}
</style>