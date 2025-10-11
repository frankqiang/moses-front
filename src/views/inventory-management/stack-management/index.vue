/**
 * 文件名称：index.vue
 * 文件描述：料垛管理独立页面
 * 创建日期：2025-01-10
 * 修改记录：
 *   - 2025-01-10: 初始创建，实现料垛管理独立页面
 */

<template>
  <div class="stack-management">
    <!-- 料垛搜索组件 -->
    <stack-search
      v-model="searchParams"
      :loading="loading"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- 料垛表格组件 -->
    <stack-table
      ref="stackTable"
      :data="tableData"
      :loading="loading"
      :pagination="pagination"
      :sort-by="sortBy"
      :toolbar-config="{
        enableRefresh: true,
        enableExport: false,
        enableColumnSettings: true,
        enableBatchActions: false
      }"
      @pagination-change="handlePaginationChange"
      @sort-change="handleSortChange"
      @refresh="handleRefresh"
      @create-stack="handleCreateStack"
      @view="handleView"
      @view-bins="handleViewBins"
      @destack="handleDestack"
      @selection-change="handleSelectionChange"
    />

    <!-- 组垛对话框 -->
    <stack-dialog
      :visible.sync="stackDialogVisible"
      @stacked="handleStackSuccess"
    />

    <!-- 拆垛确认对话框 -->
    <destack-dialog
      :visible.sync="destackDialogVisible"
      :stack="currentStack"
      @destacked="handleDestackSuccess"
    />

    <!-- 料垛成员料框对话框 -->
    <stack-bins-dialog
      :visible.sync="stackBinsDialogVisible"
      :stack="currentStack"
      @bin-updated="handleBinUpdated"
    />
  </div>
</template>

<script>
import StackSearch from './components/StackSearch.vue'
import StackTable from './components/StackTable.vue'
import StackDialog from './components/StackDialog.vue'
import DestackDialog from './components/DestackDialog.vue'
import StackBinsDialog from './components/StackBinsDialog.vue'
import { debounce } from '@/utils'
import { getStackList } from './api'
import { DEFAULT_PAGINATION, DEFAULT_SORT } from './constants'

export default {
  name: 'StackManagement',

  components: {
    StackSearch,
    StackTable,
    StackDialog,
    DestackDialog,
    StackBinsDialog
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
      // 组垛对话框可见性
      stackDialogVisible: false,
      // 拆垛对话框可见性
      destackDialogVisible: false,
      // 料垛成员料框对话框可见性
      stackBinsDialogVisible: false,
      // 当前操作的料垛对象
      currentStack: null,
      // 选中的行数据
      selectedRows: []
    }
  },

  watch: {
    // 监听搜索参数变化，同步到路由
    searchParams: {
      handler(newParams) {
        this.syncSearchToRoute(newParams)
      },
      deep: true
    },
    // 监听路由变化，恢复搜索状态
    '$route.query': {
      handler(newQuery) {
        if (newQuery && Object.keys(newQuery).length > 0) {
          this.restoreSearchFromRoute()
        }
      },
      deep: true
    }
  },

  created() {
    // 创建防抖搜索函数
    this.debouncedFetchList = debounce(this.fetchListSafe, 300)
    // 从路由查询参数恢复搜索状态
    this.restoreSearchFromRoute()
    // 页面初始化时加载列表
    this.fetchListSafe()
  },

  methods: {
    /**
     * 安全加载料垛列表（不抛出异常）
     */
    async fetchListSafe() {
      try {
        await this.fetchList()
      } catch (error) {
        // 静默处理，错误已在fetchList中显示
      }
    },

    /**
     * 加载料垛列表
     */
    async fetchList() {
      this.loading = true
      try {
        const response = await getStackList(this.searchParams)

        if (response.success && response.data) {
          this.tableData = response.data.results || []
          this.pagination = {
            page: response.data.page || 1,
            limit: response.data.limit || 20,
            total: response.data.totalResults || 0
          }
        } else {
          this.tableData = []
          this.pagination.total = 0
          this.$message.error(response.message || '获取料垛列表失败')
        }
      } catch (error) {
        console.error('加载料垛列表失败:', error)
        this.tableData = []
        this.pagination.total = 0
        // 错误处理由request拦截器统一处理
      } finally {
        this.loading = false
      }
    },

    /**
     * 搜索
     */
    handleSearch() {
      // 重置page为1
      this.searchParams.page = 1
      this.debouncedFetchList()
    },

    /**
     * 重置
     */
    handleReset() {
      this.searchParams = {
        ...DEFAULT_PAGINATION,
        sortBy: DEFAULT_SORT
      }
      this.sortBy = DEFAULT_SORT
      this.fetchListSafe()
    },

    /**
     * 分页变更
     */
    handlePaginationChange({ page, limit }) {
      this.searchParams.page = page
      this.searchParams.limit = limit
      this.pagination.page = page
      this.pagination.limit = limit
      this.fetchListSafe()
    },

    /**
     * 排序变更
     */
    handleSortChange(sortBy) {
      this.searchParams.sortBy = sortBy || DEFAULT_SORT
      this.sortBy = sortBy || DEFAULT_SORT
      this.fetchListSafe()
    },

    /**
     * 刷新
     */
    async handleRefresh() {
      try {
        await this.fetchList()
        this.$refs.stackTable?.refreshSucceed('刷新成功')
      } catch (error) {
        this.$refs.stackTable?.refreshFail('刷新失败')
      }
    },

    /**
     * 组垛
     */
    handleCreateStack() {
      this.stackDialogVisible = true
    },

    /**
     * 查看
     */
    handleView(stack) {
      // 可以实现料垛详情查看
      console.log('查看料垛详情:', stack)
    },

    /**
     * 料垛成员料框查看
     */
    handleViewBins(stack) {
      this.currentStack = stack
      this.stackBinsDialogVisible = true
    },

    /**
     * 拆垛
     */
    handleDestack(stack) {
      this.currentStack = stack
      this.destackDialogVisible = true
    },

    /**
     * 组垛成功回调
     */
    handleStackSuccess() {
      this.fetchListSafe()
      this.stackDialogVisible = false
    },

    /**
     * 拆垛成功回调
     */
    handleDestackSuccess() {
      this.fetchListSafe()
      this.destackDialogVisible = false
    },

    /**
     * 料框更新回调
     */
    handleBinUpdated() {
      // 可选：刷新料垛列表
      this.fetchListSafe()
    },

    /**
     * 选择变更
     */
    handleSelectionChange(selection) {
      this.selectedRows = selection
    },

    /**
     * 同步搜索参数到路由
     */
    syncSearchToRoute(params) {
      const query = {}
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          query[key] = params[key]
        }
      })
      this.$router.replace({ query }).catch(() => {})
    },

    /**
     * 从路由恢复搜索状态
     */
    restoreSearchFromRoute() {
      const query = this.$route.query
      if (Object.keys(query).length > 0) {
        this.searchParams = {
          ...this.searchParams,
          ...query
        }
        if (query.sortBy) {
          this.sortBy = query.sortBy
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.stack-management {
  padding: 20px;
}
</style>

