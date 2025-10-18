/**
 * 文件名称：audit-logs.vue
 * 文件描述：生产计划审计日志查询页面
 * 创建日期：2025-10-17
 * 修改记录：
 *   - 2025-10-17: 根据新接口文档创建完整的审计日志查询功能
 */

<template>
  <div class="production-plan-audit-logs">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>生产计划审计日志</h2>
      <p class="page-description">
        查看生产计划的所有变更记录，支持多维度筛选和导出
      </p>
    </div>

    <!-- 搜索表单 -->
    <audit-log-search
      :enable-export="true"
      @search="handleSearch"
      @reset="handleReset"
      @export="handleExport"
    />

    <!-- 数据表格 -->
    <audit-log-table
      :logs="auditLogs"
      :loading="loading"
      :pagination="pagination"
      @view-plan="handleViewPlan"
      @sort-change="handleSortChange"
      @page-size-change="handlePageSizeChange"
      @page-change="handlePageChange"
    />
  </div>
</template>

<script>
import AuditLogSearch from './components/AuditLogSearch.vue'
import AuditLogTable from './components/AuditLogTable.vue'
import { fetchAuditLogs } from './api'
import { getErrorMessage } from './constants'

export default {
  name: 'ProductionPlanAuditLogs',
  components: {
    AuditLogSearch,
    AuditLogTable
  },
  data() {
    return {
      // 审计日志数据
      auditLogs: [],
      // 加载状态
      loading: false,
      // 查询参数
      queryParams: {},
      // 分页信息（根据接口文档，默认limit为10）
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
      },
      // 排序规则
      sortBy: 'createdAt:desc'
    }
  },
  created() {
    // 检查是否有路由传参（例如从详情页跳转过来）
    if (this.$route.query.planId) {
      this.queryParams.planId = this.$route.query.planId
    }
    // 加载数据
    this.fetchData()
  },
  methods: {
    /**
     * 加载审计日志数据
     * 根据接口文档：GET /v1/prod/plans/audit-logs
     */
    async fetchData() {
      try {
        this.loading = true

        // 构建请求参数
        const params = {
          ...this.queryParams,
          page: this.pagination.page,
          limit: this.pagination.limit,
          sortBy: this.sortBy
        }

        console.log('📊 查询审计日志参数:', params)

        const response = await fetchAuditLogs(params)

        // 根据接口文档的响应格式处理数据
        if (response.success && response.data) {
          this.auditLogs = response.data.results || []
          this.pagination = {
            page: response.data.page || 1,
            limit: response.data.limit || 20,
            total: response.data.totalResults || 0,
            totalPages: response.data.totalPages || 0
          }

          console.log('✅ 审计日志加载成功:', {
            count: this.auditLogs.length,
            total: this.pagination.total,
            page: this.pagination.page,
            totalPages: this.pagination.totalPages
          })
        } else {
          // 区分失败和成功但无数据两种情况
          this.auditLogs = []
          if (response.success === false) {
            // 请求失败，message 在 error 对象中
            this.$message.error(response.error?.message || '查询审计日志失败')
          } else {
            // 成功但数据为空，message 在顶层
            this.$message.warning(response.message || '未查询到审计日志数据')
          }
        }
      } catch (error) {
        console.error('❌ 加载审计日志失败:', error)

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

        // 清空数据
        this.auditLogs = []
      } finally {
        this.loading = false
      }
    },

    /**
     * 处理搜索
     */
    handleSearch(params) {
      console.log('🔍 搜索审计日志:', params)
      this.queryParams = { ...params }
      // 重置到第一页
      this.pagination.page = 1
      this.fetchData()
    },

    /**
     * 处理重置
     */
    handleReset() {
      console.log('🔄 重置搜索条件')
      this.queryParams = {}
      this.pagination.page = 1
      this.sortBy = 'createdAt:desc'
      this.fetchData()
    },

    /**
     * 处理导出
     */
    async handleExport(params) {
      try {
        console.log('📥 导出审计日志:', params)
        this.$message.info('导出功能开发中...')

        // TODO: 实现导出功能
        // 可以选择以下两种方式：
        // 1. 使用相同的接口，但添加 format 参数导出 CSV
        // 2. 获取所有数据后在前端生成 Excel 文件

        // 示例实现：
        // const exportParams = {
        //   ...params,
        //   format: 'csv',
        //   limit: 5000 // 导出最大限制
        // }
        // const response = await fetchAuditLogs(exportParams)
        // // 处理下载逻辑...
      } catch (error) {
        console.error('❌ 导出审计日志失败:', error)
        const errorMessage = error.response?.data?.error?.message || getErrorMessage(error)
        this.$message.error(`导出失败: ${errorMessage}`)
      }
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
    },

    /**
     * 处理排序变化
     */
    handleSortChange(sortBy) {
      console.log('📊 排序变化:', sortBy)
      this.sortBy = sortBy || 'createdAt:desc'
      this.fetchData()
    },

    /**
     * 处理每页数量变化
     */
    handlePageSizeChange(size) {
      console.log('📄 每页数量变化:', size)
      this.pagination.limit = size
      this.pagination.page = 1 // 重置到第一页
      this.fetchData()
    },

    /**
     * 处理页码变化
     */
    handlePageChange(page) {
      console.log('📃 页码变化:', page)
      this.pagination.page = page
      this.fetchData()
    }
  }
}
</script>

<style lang="scss" scoped>
.production-plan-audit-logs {
  padding: 20px;

  .page-header {
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid #ebeef5;

    h2 {
      font-size: 20px;
      font-weight: 600;
      color: #303133;
      margin: 0 0 8px 0;
    }

    .page-description {
      font-size: 13px;
      color: #909399;
      margin: 0;
      line-height: 1.6;
    }
  }

  // 响应式设计
  @media (max-width: 768px) {
    padding: 10px;

    .page-header {
      h2 {
        font-size: 18px;
      }

      .page-description {
        font-size: 12px;
      }
    }
  }
}
</style>

