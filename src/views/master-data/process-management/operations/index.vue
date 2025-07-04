<template>
  <div class="app-container">
    <div class="filter-container">
      <search-form
        :loading="listLoading"
        @search="handleSearch"
        @reset="handleReset"
      />
    </div>

    <operation-table
      :data="list"
      :loading="listLoading"
      :total="total"
      :page="listQuery.page"
      :limit="listQuery.limit"
      :export-params="listQuery"
      @refresh="getList"
      @pagination="handlePagination"
      @create="handleCreate"
      @edit="handleEdit"
      @status-change="handleStatusChange"
      @delete="handleDelete"
      @batch-delete="handleBatchDelete"
      @batch-enable="handleBatchEnable"
      @batch-disable="handleBatchDisable"
    />
  </div>
</template>

<script>
import { debounce } from '@/utils'
import SearchForm from '../components/SearchForm'
import OperationTable from '../components/OperationTable'
import { getOperationList, updateOperationStatus, deleteOperation, batchUpdateOperationStatus, batchDeleteOperations } from '../api'

export default {
  name: 'OperationList',

  components: {
    SearchForm,
    OperationTable
  },

  data() {
    return {
      list: [],
      total: 0,
      listLoading: false,
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
    this.debouncedGetList = debounce(this.getList, 300)
    this.getList()
  },

  methods: {
    // 获取工序列表
    async getList() {
      try {
        this.listLoading = true
        const response = await getOperationList(this.listQuery)
        this.list = response.data.items
        this.total = response.data.total
      } catch (error) {
        console.error('获取工序列表失败', error)
        this.$message.error('获取数据失败: ' + (error.message || '未知错误'))
      } finally {
        this.listLoading = false
      }
    },

    // 处理搜索
    handleSearch(formData) {
      this.listQuery = {
        ...this.listQuery,
        page: 1,
        keyword: formData.keyword || '',
        type: formData.type || '',
        status: formData.status || ''
      }
      this.debouncedGetList()
    },

    // 处理重置
    handleReset() {
      this.listQuery = {
        page: 1,
        limit: 10,
        keyword: '',
        type: '',
        status: ''
      }
      this.debouncedGetList()
    },

    // 处理分页
    handlePagination({ page, limit }) {
      this.listQuery = {
        ...this.listQuery,
        page,
        limit
      }
      this.getList()
    },

    // 处理创建
    handleCreate() {
      // 这里可以打开创建工序的表单抽屉
      this.$message.info('打开创建工序表单')
    },

    // 处理编辑
    handleEdit(row) {
      // 这里可以打开编辑工序的表单抽屉
      this.$message.info(`编辑工序: ${row.name}`)
    },

    // 处理状态变更
    async handleStatusChange({ id, status }) {
      try {
        this.listLoading = true
        await updateOperationStatus(id, status)
        this.$message.success(`工序状态已${status === 'Enabled' ? '启用' : '禁用'}`)
        this.getList()
      } catch (error) {
        console.error('更新工序状态失败', error)
        this.$message.error('操作失败: ' + (error.message || '未知错误'))
      } finally {
        this.listLoading = false
      }
    },

    // 处理删除
    async handleDelete(row) {
      try {
        this.listLoading = true
        await deleteOperation(row.id)
        this.$message.success('工序删除成功')
        this.getList()
      } catch (error) {
        console.error('删除工序失败', error)
        this.$message.error('删除失败: ' + (error.message || '未知错误'))
      } finally {
        this.listLoading = false
      }
    },

    // 处理批量删除
    async handleBatchDelete(rows) {
      try {
        this.listLoading = true
        const ids = rows.map(row => row.id)
        await batchDeleteOperations(ids)
        this.$message.success(`成功删除 ${rows.length} 条记录`)
        this.getList()
      } catch (error) {
        console.error('批量删除工序失败', error)
        this.$message.error('批量删除失败: ' + (error.message || '未知错误'))
      } finally {
        this.listLoading = false
      }
    },

    // 处理批量启用
    async handleBatchEnable(rows) {
      try {
        this.listLoading = true
        const ids = rows.map(row => row.id)
        await batchUpdateOperationStatus(ids, 'Enabled')
        this.$message.success(`成功启用 ${rows.length} 条记录`)
        this.getList()
      } catch (error) {
        console.error('批量启用工序失败', error)
        this.$message.error('批量操作失败: ' + (error.message || '未知错误'))
      } finally {
        this.listLoading = false
      }
    },

    // 处理批量禁用
    async handleBatchDisable(rows) {
      try {
        this.listLoading = true
        const ids = rows.map(row => row.id)
        await batchUpdateOperationStatus(ids, 'Disabled')
        this.$message.success(`成功禁用 ${rows.length} 条记录`)
        this.getList()
      } catch (error) {
        console.error('批量禁用工序失败', error)
        this.$message.error('批量操作失败: ' + (error.message || '未知错误'))
      } finally {
        this.listLoading = false
      }
    }
  }
}
</script>
