/**
 * 文件名称：index.vue
 * 文件描述：退火任务管理模块主页面
 * 创建日期：2025-10-18
 * 修改记录：
 *   - 2025-10-18: 首次创建，完成P0阶段主页面集成
 */

<template>
  <div class="annealing-task-management">
    <!-- 任务搜索组件 -->
    <task-search
      v-model="searchParams"
      :loading="loading"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- 任务表格组件 -->
    <task-table
      ref="taskTable"
      :data="tableData"
      :loading="loading"
      :load-error="loadError"
      :pagination="pagination"
      :sort-by="sortBy"
      :export-api="handleExport"
      :export-params="exportParams"
      :toolbar-config="{
        enableRefresh: true,
        enableExport: false,
        enableColumnSettings: true,
        enableBatchActions: false
      }"
      @pagination-change="handlePaginationChange"
      @sort-change="handleSortChange"
      @refresh="handleRefresh"
      @retry="handleRetry"
      @create="handleCreate"
      @view="handleView"
      @edit="handleEdit"
      @bind-materials="handleBindMaterials"
      @view-plan="handleViewPlan"
      @selection-change="handleSelectionChange"
    />

    <!-- 手工创建任务抽屉 -->
    <task-create-drawer
      :visible.sync="createDrawerVisible"
      @success="handleCreateSuccess"
    />
  </div>
</template>

<script>
import TaskSearch from './components/TaskSearch.vue'
import TaskTable from './components/TaskTable.vue'
import TaskCreateDrawer from './components/TaskCreateDrawer.vue'
import { debounce } from '@/utils'
import { fetchAnnealingTaskList } from './api'
import {
  DEFAULT_PAGINATION,
  DEFAULT_SORT,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES
} from './constants'

export default {
  name: 'AnnealingTaskManagement',
  components: {
    TaskSearch,
    TaskTable,
    TaskCreateDrawer
  },
  data() {
    return {
      // 搜索参数
      searchParams: {
        ...DEFAULT_PAGINATION,
        sortBy: DEFAULT_SORT
      },
      // 表格数据
      tableData: [],
      // 分页参数
      pagination: {
        page: 1,
        limit: 20,
        total: 0
      },
      // 排序参数
      sortBy: DEFAULT_SORT,
      // 加载状态
      loading: false,
      // 加载错误
      loadError: null,
      // 选中的行数据
      selectedRows: [],
      // 创建任务抽屉状态
      createDrawerVisible: false
    }
  },
  computed: {
    exportParams() {
      const { page, limit, sortBy, ...filters } = this.searchParams
      return filters
    }
  },
  mounted() {
    this.loadTaskList()
  },
  methods: {
    async loadTaskList() {
      this.loading = true
      this.loadError = null
      try {
        const params = {
          ...this.searchParams,
          page: this.pagination.page,
          limit: this.pagination.limit,
          sortBy: this.sortBy
        }

        const response = await fetchAnnealingTaskList(params)

        if (response && response.data) {
          this.tableData = response.data.results || []
          this.pagination = {
            page: response.data.page || 1,
            limit: response.data.limit || 20,
            total: response.data.totalResults || 0
          }
        }
      } catch (error) {
        console.error('获取退火任务列表失败:', error)
        this.loadError = error.message || ERROR_MESSAGES.FETCH_LIST
        this.tableData = []
        this.pagination.total = 0

        // 使用后端返回的错误消息，如果没有则使用备用消息
        const errorMessage = error.response?.data?.error?.message || ERROR_MESSAGES.FETCH_LIST
        this.$message.error(errorMessage)
      } finally {
        this.loading = false
      }
    },
    handleSearch(params) {
      this.searchParams = { ...params }
      this.pagination.page = 1
      this.loadTaskList()
    },
    handleReset(params) {
      this.searchParams = { ...params }
      this.pagination.page = 1
      this.sortBy = DEFAULT_SORT
      this.loadTaskList()
    },
    handlePaginationChange({ page, limit }) {
      this.pagination.page = page
      this.pagination.limit = limit
      this.loadTaskList()
    },
    handleSortChange(sortBy) {
      this.sortBy = sortBy
      this.pagination.page = 1
      this.loadTaskList()
    },
    handleRefresh() {
      this.loadTaskList()
    },
    handleRetry() {
      this.loadTaskList()
    },
    handleCreate() {
      // 打开创建任务抽屉
      this.createDrawerVisible = true
    },
    handleCreateSuccess(taskData) {
      // 创建成功后刷新列表
      this.loadTaskList()

      // 可选：跳转到任务详情页
      // this.$router.push(`/production-management/annealing-task/${taskData.id}`)
    },
    handleView(task) {
      // 跳转到任务详情页
      this.$router.push(`/production-management/annealing-task/${task.id}`)
    },
    handleEdit(task) {
      // TODO: 实现编辑任务功能
      console.log('编辑任务:', task)
      this.$message.info('编辑任务功能将在后续任务中实现')
    },
    handleBindMaterials(task) {
      // TODO: 实现绑定物料功能（TASK005）
      console.log('绑定物料:', task)
      this.$message.info('绑定物料功能将在后续任务中实现')
    },
    handleViewPlan(planId) {
      // TODO: 跳转到生产计划详情页
      console.log('查看生产计划:', planId)
      this.$message.info('查看生产计划功能需要生产计划模块支持')
    },
    handleSelectionChange(selection) {
      this.selectedRows = selection
    },
    handleExport() {
      // TODO: 实现导出功能
      this.$message.info('导出功能将在后续任务中实现')
      return Promise.resolve()
    }
  }
}
</script>

<style lang="scss" scoped>
.annealing-task-management {
  padding: 20px;
  background-color: #f0f2f5;
  min-height: calc(100vh - 84px);
}
</style>

