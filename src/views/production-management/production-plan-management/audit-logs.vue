/**
 * 文件名称：audit-logs.vue
 * 文件描述：生产计划审计日志查询页面
 * 创建日期：2025-10-17
 * 修改记录：
 *   - 2025-10-17: 根据新接口文档创建完整的审计日志查询功能
 *   - 2025-10-23: 重构使用全局组件，统一架构风格
 */

<template>
  <div class="production-plan-audit-logs">
    <!-- 审计日志搜索组件 -->
    <audit-log-search
      v-model="searchParams"
      :loading="loading"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- 审计日志表格组件 -->
    <audit-log-table
      ref="auditLogTable"
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
      @view-plan="handleViewPlan"
    />
  </div>
</template>

<script>
import AuditLogSearch from './components/AuditLogSearch.vue'
import AuditLogTable from './components/AuditLogTable.vue'
import { debounce } from '@/utils'
import { fetchAuditLogs } from './api'
import { getErrorMessage } from './constants'
import {
  AUDIT_LOG_DEFAULT_PAGINATION,
  AUDIT_LOG_DEFAULT_SORT
} from './constants/audit-logs-config'

export default {
  name: 'ProductionPlanAuditLogs',
  components: {
    AuditLogSearch,
    AuditLogTable
  },
  data() {
    return {
      // 搜索参数
      searchParams: {
        ...AUDIT_LOG_DEFAULT_PAGINATION,
        sortBy: AUDIT_LOG_DEFAULT_SORT
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
      sortBy: AUDIT_LOG_DEFAULT_SORT,
      // 加载状态
      loading: false
    }
  },
  created() {
    // 创建防抖搜索函数
    this.debouncedFetchList = debounce(this.fetchListSafe, 300)

    // 检查是否有路由传参（例如从详情页跳转过来）
    if (this.$route.query.planId) {
      this.searchParams.planId = this.$route.query.planId
    }

    // 页面初始化时加载列表
    this.fetchListSafe()
  },
  methods: {
    /**
     * 安全加载审计日志列表（不抛出异常）
     */
    async fetchListSafe() {
      try {
        await this.fetchList()
      } catch (error) {
        // 静默处理，错误已在fetchList中显示
      }
    },

    /**
     * 加载审计日志列表（会抛出异常供调用者处理）
     * 根据接口文档：GET /v1/prod/plans/audit-logs
     */
    async fetchList() {
      this.loading = true
      try {
        const response = await fetchAuditLogs(this.searchParams)

        // 根据接口文档的响应格式处理数据
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
          this.$message.error(response.message || '获取审计日志失败')
        }
      } catch (error) {
        console.error('加载审计日志失败:', error)
        this.tableData = []
        this.pagination.total = 0

        // 根据接口文档的错误响应处理
        const errorCode = error.response?.data?.error?.code
        const errorMessage = error.response?.data?.error?.message || getErrorMessage(error)

        // 特殊错误码处理
        if (errorCode === 'VALIDATION_ERROR') {
          this.$message.error(`参数验证失败: ${errorMessage}`)
        } else if (errorCode === 'FORBIDDEN' || error.response?.status === 403) {
          this.$message.error('无权限查看审计日志')
        } else if (errorCode === 'UNAUTHORIZED' || error.response?.status === 401) {
          this.$message.error('未授权，请重新登录')
        } else {
          this.$message.error(`查询失败: ${errorMessage}`)
        }

        // 重新抛出错误，供调用者处理（如刷新反馈）
        throw error
      } finally {
        this.loading = false
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
        this.$refs.auditLogTable.refreshSucceed('审计日志刷新成功')
      } catch (error) {
        // 刷新失败时调用子组件的反馈方法
        this.$refs.auditLogTable.refreshFail('审计日志刷新失败，请重试')
        console.error('刷新审计日志失败:', error)
      }
    },

    /**
     * 处理重置
     */
    handleReset() {
      this.searchParams = {
        ...AUDIT_LOG_DEFAULT_PAGINATION,
        sortBy: AUDIT_LOG_DEFAULT_SORT,
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
     * 查看计划详情
     */
    handleViewPlan(planId) {
      // 跳转到计划详情页
      this.$router.push({
        path: `/production-management/production-plan/detail/${planId}`,
        query: { tab: 'changeLogs' } // 打开变更日志Tab
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.production-plan-audit-logs {
  padding: 20px;

  // 响应式设计
  @media (max-width: 768px) {
    padding: 10px;
  }
}
</style>

