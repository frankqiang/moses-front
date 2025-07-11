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
    
    <!-- 后续可以添加表单抽屉/对话框 -->

  </div>
</template>

<script>
import { getRoutingList } from './api'
import SearchForm from './components/SearchForm.vue'
import RoutingTable from './components/RoutingTable.vue'
import { debounce } from '@/utils'

export default {
  name: 'RoutingManagement',
  components: {
    SearchForm,
    RoutingTable
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
      }
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
      this.$message.info('TODO: 实现新建工艺路线逻辑')
    },
    handleEdit(row) {
      this.$message.info(`TODO: 实现编辑ID为 ${row.id} 的工艺路线`)
    },
    handleView(row) {
      this.$message.info(`TODO: 实现查看ID为 ${row.id} 的工艺路线`)
    },
    handleDelete(row) {
      this.$confirm(`确定要删除工艺路线 "${row.name}" 吗？`, '删除确认', {
        type: 'warning'
      }).then(() => {
        this.$message.success(`TODO: 实现删除ID为 ${row.id} 的逻辑`)
      }).catch(() => {})
    },
    handleSubmit(row) {
      this.$message.info(`TODO: 实现提交ID为 ${row.id} 的工艺路线`)
    },
    handleNewVersion(row) {
      this.$message.info(`TODO: 实现为ID为 ${row.id} 的工艺路线创建新版本`)
    }
  }
}
</script>

<style scoped>
.routing-management {
  padding: 20px;
}
</style> 