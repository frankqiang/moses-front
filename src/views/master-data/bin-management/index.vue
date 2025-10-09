/**
 * 文件名称：index.vue
 * 文件描述：料框规格管理模块主页面
 * 创建日期：2025-01-09
 * 修改记录：
 *   - 2025-01-09: 首次创建，完成P0阶段基础架构搭建
 *   - 2025-01-09: TASK007-P0 优化错误处理和用户体验
 */

<template>
  <div class="bin-specification-management">
    <!-- 搜索表单 -->
    <bin-specification-search
      v-model="searchParams"
      :loading="loading"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- 数据表格 -->
    <bin-specification-table
      ref="table"
      :data="tableData"
      :loading="loading"
      :load-error="loadError"
      :pagination="pagination"
      :sort-by="sortBy"
      :export-params="exportParams"
      @create="handleCreate"
      @edit="handleEdit"
      @enable="handleEnable"
      @disable="handleDisable"
      @pagination-change="handlePaginationChange"
      @sort-change="handleSortChange"
      @refresh="handleRefresh"
      @retry="handleRetry"
    />

    <!-- 表单抽屉 -->
    <bin-specification-form-drawer
      v-model="formDrawerVisible"
      :mode="formMode"
      :specification-id="currentSpecificationId"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script>
import { debounce } from '@/utils'
import { fetchBinSpecificationList, toggleBinSpecificationStatus } from './api'
import {
  DEFAULT_PAGINATION,
  DEFAULT_SORT
} from './constants/bin-specification'
import BinSpecificationSearch from './components/BinSpecificationSearch'
import BinSpecificationTable from './components/BinSpecificationTable'
import BinSpecificationFormDrawer from './components/BinSpecificationFormDrawer'

export default {
  name: 'BinSpecificationManagement',
  components: {
    BinSpecificationSearch,
    BinSpecificationTable,
    BinSpecificationFormDrawer
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
      // 加载错误状态（用于显示错误提示和重试按钮）
      loadError: false,
      // 表单抽屉可见性
      formDrawerVisible: false,
      // 表单模式：create-新增, update-编辑, view-查看
      formMode: 'create',
      // 当前操作的规格ID
      currentSpecificationId: null,
      // 选中的行数据
      selectedRows: []
    }
  },
  computed: {
    exportParams() {
      return {
        ...this.searchParams,
        page: 1,
        limit: this.pagination.total || 1000
      }
    }
  },
  created() {
    // 创建防抖搜索函数
    this.debouncedFetchList = debounce(this.fetchListSafe, 300)
    // 页面初始化时加载列表
    this.fetchListSafe()
  },
  methods: {
    /**
     * 安全加载规格列表（不抛出异常）
     */
    async fetchListSafe() {
      try {
        await this.fetchList()
      } catch (error) {
        // 静默处理，错误已在fetchList中显示
      }
    },

    /**
     * 加载规格列表（会抛出异常供调用者处理）
     */
    async fetchList() {
      this.loading = true
      this.loadError = false

      try {
        const response = await fetchBinSpecificationList(this.searchParams)

        // 根据接口文档处理响应数据
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
          this.$message.error(response.message || '获取料框规格列表失败')
        }
      } catch (error) {
        console.error('加载规格列表失败:', error)
        this.tableData = []
        this.pagination.total = 0
        this.loadError = true

        // 显示后端返回的错误消息
        const message = error.response?.data?.error?.message || error.message || '获取料框规格列表失败'
        this.$message.error(message)

        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 搜索事件处理
     */
    handleSearch(params) {
      this.searchParams = { ...params }
      this.debouncedFetchList()
    },

    /**
     * 重置事件处理
     */
    handleReset(params) {
      this.searchParams = { ...params }
      this.fetchListSafe()
    },

    /**
     * 分页变更事件处理
     */
    handlePaginationChange({ page, limit }) {
      this.searchParams.page = page
      this.searchParams.limit = limit
      this.fetchListSafe()
    },

    /**
     * 排序变更事件处理
     */
    handleSortChange(sortBy) {
      this.sortBy = sortBy
      this.searchParams.sortBy = sortBy
      this.searchParams.page = 1 // 排序后重置到第一页
      this.fetchListSafe()
    },

    /**
     * 刷新事件处理
     */
    handleRefresh() {
      this.fetchListSafe()
    },

    /**
     * 重试事件处理
     */
    handleRetry() {
      this.fetchListSafe()
    },

    /**
     * 新增规格
     */
    handleCreate() {
      this.formMode = 'create'
      this.currentSpecificationId = null
      this.formDrawerVisible = true
    },

    /**
     * 编辑规格
     */
    handleEdit(row) {
      this.formMode = 'update'
      this.currentSpecificationId = row.id
      this.formDrawerVisible = true
    },

    /**
     * 启用规格
     */
    async handleEnable(row) {
      try {
        await this.$confirm(`确定要启用规格"${row.specCode}"吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        const response = await toggleBinSpecificationStatus(row.id, '启用')
        this.$message.success(response.message || '启用成功')
        this.fetchListSafe()
      } catch (error) {
        if (error !== 'cancel') {
          const message = error.response?.data?.error?.message || error.message || '启用失败'
          this.$message.error(message)
        }
      }
    },

    /**
     * 禁用规格
     */
    async handleDisable(row) {
      try {
        await this.$confirm(`确定要禁用规格"${row.specCode}"吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        const response = await toggleBinSpecificationStatus(row.id, '禁用')
        this.$message.success(response.message || '禁用成功')
        this.fetchListSafe()
      } catch (error) {
        if (error !== 'cancel') {
          const message = error.response?.data?.error?.message || error.message || '禁用失败'
          this.$message.error(message)
        }
      }
    },

    /**
     * 表单提交成功事件处理
     */
    async handleFormSuccess(response) {
      // 显示后端返回的成功消息
      this.$message.success(response.message || '操作成功')

      // 刷新列表
      await this.fetchListSafe()
    }
  }
}
</script>

<style lang="scss" scoped>
.bin-specification-management {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  // 响应式设计
  @media (max-width: 768px) {
    padding: 10px;
    gap: 12px;
  }
}
</style>

