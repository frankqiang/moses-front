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
        this.$message.error('获取工艺路线列表失败')
        console.error('获取工艺路线列表失败:', error)
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
          await deleteRouting(row.id)
          this.$message.success('删除成功')
          this.getList()
        } catch (error) {
          console.error('删除工艺路线失败:', error)
          // 错误信息由request拦截器统一处理，此处无需额外展示
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
    handleNewVersion(row) {
      this.$confirm(`确定要为工艺路线 "${row.name}" 创建一个新版本吗？`, '创建新版本确认', {
        type: 'info'
      }).then(() => {
        this.$message.info(`TODO: 实现为ID为 ${row.id} 的工艺路线创建新版本的逻辑`)
      }).catch(() => {})
    },
    handleFormSuccess(payload = {}) {
      if (payload.continue) {
        // "保存并继续" 模式，列表刷新即可，抽屉不关闭
        this.getList()
      } else {
        // 默认模式，关闭抽屉并刷新列表
        this.formDrawerVisible = false
        this.getList()
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