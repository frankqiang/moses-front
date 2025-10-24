/**
 * 文件名称：index.vue
 * 文件描述：维护记录管理模块主页面
 * 创建日期：2025-01-20
 * 修改记录：
 *   - 2025-01-20: 完成P0和P1阶段主页面集成
 */

<template>
  <div class="maintenance-record-management">
    <!-- 维护记录搜索组件 -->
    <record-search
      v-model="searchParams"
      :loading="loading"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- 维护记录表格组件 -->
    <record-table
      ref="recordTable"
      :data="tableData"
      :loading="loading"
      :pagination="pagination"
      :sort-by="sortBy"
      :show-work-hours-stats="true"
      :toolbar-config="{
        enableRefresh: true,
        enableExport: false,
        enableColumnSettings: true,
        enableBatchActions: false
      }"
      @pagination-change="handlePaginationChange"
      @sort-change="handleSortChange"
      @refresh="handleRefresh"
      @view="handleView"
    />

    <!-- 维护记录详情抽屉 -->
    <record-detail-drawer
      :visible.sync="detailDrawerVisible"
      :record-id="currentRecordId"
      @close="handleDetailClose"
      @update-success="handleUpdateSuccess"
    />
  </div>
</template>

<script>
import RecordSearch from './components/RecordSearch.vue'
import RecordTable from './components/RecordTable.vue'
import RecordDetailDrawer from './components/RecordDetailDrawer.vue'
import { debounce } from '@/utils'
import { getMaintenanceRecords } from './api'
import {
  DEFAULT_PAGINATION,
  DEFAULT_SORT
} from './constants/maintenance-record'

export default {
  name: 'MaintenanceRecordManagement',
  components: {
    RecordSearch,
    RecordTable,
    RecordDetailDrawer
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
        limit: 10,
        total: 0
      },
      // 排序参数
      sortBy: DEFAULT_SORT,
      // 加载状态
      loading: false,
      // 全局loading实例
      globalLoading: null,
      // 详情抽屉相关
      detailDrawerVisible: false,
      currentRecordId: ''
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
     * 安全加载维护记录列表（不抛出异常）
     */
    async fetchListSafe() {
      try {
        await this.fetchList()
      } catch (error) {
        // 静默处理，错误已在fetchList中显示
      }
    },

    /**
     * 加载维护记录列表（会抛出异常供调用者处理）
     */
    async fetchList() {
      this.showGlobalLoading()
      this.loading = true
      try {
        const response = await getMaintenanceRecords(this.searchParams)

        // 根据接口文档处理响应数据
        if (response.success && response.data) {
          this.tableData = response.data.results || []
          this.pagination = {
            page: response.data.page || 1,
            limit: response.data.limit || 10,
            total: response.data.totalResults || 0
          }
        } else {
          this.tableData = []
          this.pagination.total = 0
          // 使用后端返回的消息
          this.$message.error(response.message || '获取维护记录列表失败')
        }
      } catch (error) {
        console.error('加载维护记录列表失败:', error)
        this.tableData = []
        this.pagination.total = 0

        // 处理不同类型的错误，优先使用后端返回的错误消息
        let errorMessage = '获取维护记录列表失败'
        if (error.response) {
          const { status, data } = error.response
          if (status === 401) {
            errorMessage = '请先登录'
          } else if (status === 403) {
            errorMessage = '权限不足'
          } else if (data && data.error && data.error.message) {
            // 优先使用后端返回的错误消息
            errorMessage = data.error.message
          }
        } else if (error.message) {
          errorMessage = error.message
        }

        this.$message.error(errorMessage)
        // 重新抛出错误，供调用者处理（如刷新反馈）
        throw error
      } finally {
        this.loading = false
        this.hideGlobalLoading()
      }
    },

    /**
     * 处理搜索
     */
    handleSearch(searchParams) {
      this.searchParams = {
        ...searchParams,
        page: 1, // 搜索时重置到第一页
        limit: this.pagination.limit
      }
      this.debouncedFetchList()
    },

    /**
     * 处理刷新
     */
    async handleRefresh() {
      try {
        await this.fetchList()
        // 刷新成功时调用子组件的反馈方法
        this.$refs.recordTable.refreshSucceed('维护记录列表刷新成功')
      } catch (error) {
        // 刷新失败时调用子组件的反馈方法
        this.$refs.recordTable.refreshFail('维护记录列表刷新失败，请重试')
        console.error('刷新维护记录列表失败:', error)
      }
    },

    /**
     * 处理重置
     */
    handleReset() {
      this.searchParams = {
        ...DEFAULT_PAGINATION,
        sortBy: DEFAULT_SORT,
        limit: this.pagination.limit
      }
      this.fetchListSafe()
    },

    /**
     * 处理分页变化
     */
    handlePaginationChange({ page, limit }) {
      this.pagination.page = page
      this.pagination.limit = limit
      this.searchParams.page = page
      this.searchParams.limit = limit
      this.fetchListSafe()
    },

    /**
     * 处理排序变化
     */
    handleSortChange(sortBy) {
      this.sortBy = sortBy
      this.searchParams.sortBy = sortBy
      this.searchParams.page = 1 // 排序时重置到第一页
      this.fetchListSafe()
    },

    /**
     * 处理查看详情
     */
    handleView(record) {
      if (!record || !record.id) {
        this.$message.warning('缺少维护记录ID')
        return
      }
      this.currentRecordId = record.id
      this.detailDrawerVisible = true
    },

    /**
     * 处理详情抽屉关闭
     */
    handleDetailClose() {
      this.detailDrawerVisible = false
      this.currentRecordId = ''
    },

    /**
     * 处理维护记录更新成功
     */
    async handleUpdateSuccess() {
      // 刷新列表以显示最新数据
      await this.fetchListSafe()
    },

    /**
     * 从路由查询参数恢复搜索状态
     */
    restoreSearchFromRoute() {
      const query = this.$route.query
      if (query && Object.keys(query).length > 0) {
        this.searchParams = {
          ...DEFAULT_PAGINATION,
          sortBy: DEFAULT_SORT,
          ...query,
          // 转换数值类型
          page: query.page ? parseInt(query.page, 10) : 1,
          limit: query.limit ? parseInt(query.limit, 10) : 10
        }
      }
    },

    /**
     * 显示全局加载遮罩
     */
    showGlobalLoading() {
      this.globalLoading = this.$loading({
        text: '加载中...',
        background: 'rgba(0, 0, 0, 0.7)'
      })
    },

    /**
     * 隐藏全局加载遮罩
     */
    hideGlobalLoading() {
      if (this.globalLoading) {
        this.globalLoading.close()
        this.globalLoading = null
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.maintenance-record-management {
  padding: 20px;

  // 响应式设计
  @media (max-width: 768px) {
    padding: 10px;
  }
}
</style>

