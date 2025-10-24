/**
 * 文件名称：index.vue
 * 文件描述：退火炉排程管理模块主页面
 * 创建日期：2025-10-23
 * 修改记录：
 *   - 2025-10-23: 初始创建，完成P0阶段功能和P1部分功能
 */

<template>
  <div class="annealing-schedule-management">
    <!-- 搜索筛选区域 -->
    <div class="annealing-schedule-management__search">
      <search-form
        :items="searchFormItems"
        :loading="loading"
        :visible-item-count="4"
        :value="searchParams"
        @search="handleSearch"
        @reset="handleReset"
      />
    </div>

    <!-- 排程方案表格 -->
    <schedule-plan-table
      ref="scheduleTable"
      :data="tableData"
      :loading="loading"
      :pagination="pagination"
      :sort-by="sortBy"
      :export-api="handleExport"
      :export-params="exportParams"
      :toolbar-config="{
        enableRefresh: true,
        enableExport: true,
        enableColumnSettings: true,
        enableBatchActions: false
      }"
      @pagination-change="handlePaginationChange"
      @sort-change="handleSortChange"
      @refresh="handleRefresh"
      @create="handleCreate"
      @view="handleView"
      @viewGantt="handleViewGantt"
      @publish="handlePublish"
      @cancel="handleCancel"
      @selection-change="handleSelectionChange"
    />

    <!-- 创建排程方案对话框 -->
    <create-schedule-plan-dialog
      :visible.sync="createDialogVisible"
      @success="handleCreateSuccess"
      @close="handleCreateClose"
    />

    <!-- 发布排程方案对话框 -->
    <publish-schedule-plan-dialog
      :visible.sync="publishDialogVisible"
      :plan-data="currentPlan"
      @success="handlePublishSuccess"
      @close="handlePublishClose"
    />

    <!-- 取消排程方案对话框 -->
    <cancel-schedule-plan-dialog
      :visible.sync="cancelDialogVisible"
      :plan-data="currentPlan"
      @success="handleCancelSuccess"
      @close="handleCancelClose"
    />
  </div>
</template>

<script>
import SearchForm from '@/components/SearchForm'
import SchedulePlanTable from './components/SchedulePlanTable.vue'
import CreateSchedulePlanDialog from './components/CreateSchedulePlanDialog.vue'
import PublishSchedulePlanDialog from './components/PublishSchedulePlanDialog.vue'
import CancelSchedulePlanDialog from './components/CancelSchedulePlanDialog.vue'
import { debounce } from '@/utils'
import {
  fetchSchedulePlanList,
  exportSchedulePlans
} from './api'
import {
  DEFAULT_PAGINATION,
  DEFAULT_SORT,
  PLAN_STATUS_OPTIONS,
  ALGORITHM_TYPE_OPTIONS,
  AUTO_REFRESH_INTERVAL,
  PLAN_STATUS,
  ERROR_CODES
} from './constants'

export default {
  name: 'AnnealingScheduleManagement',
  components: {
    SearchForm,
    SchedulePlanTable,
    CreateSchedulePlanDialog,
    PublishSchedulePlanDialog,
    CancelSchedulePlanDialog
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
      // 选中的行数据
      selectedRows: [],
      // 自动刷新定时器
      autoRefreshTimer: null,
      // 全局loading实例
      globalLoading: null,
      // 创建排程方案对话框显示状态
      createDialogVisible: false,
      // 发布排程方案对话框显示状态
      publishDialogVisible: false,
      // 取消排程方案对话框显示状态
      cancelDialogVisible: false,
      // 当前操作的排程方案数据
      currentPlan: {}
    }
  },
  computed: {
    searchFormItems() {
      return [
        {
          type: 'input',
          prop: 'search',
          label: '关键词搜索',
          placeholder: '请输入方案编号或名称',
          priority: 'primary'
        },
        {
          type: 'select',
          prop: 'status',
          label: '方案状态',
          placeholder: '请选择方案状态',
          options: PLAN_STATUS_OPTIONS,
          multiple: true,
          priority: 'primary'
        },
        {
          type: 'select',
          prop: 'algorithmType',
          label: '算法类型',
          placeholder: '请选择算法类型',
          options: ALGORITHM_TYPE_OPTIONS,
          priority: 'primary'
        },
        {
          type: 'daterange',
          prop: 'scheduleTimeRange',
          label: '排程时间范围',
          startPlaceholder: '开始时间',
          endPlaceholder: '结束时间',
          priority: 'primary'
        },
        {
          type: 'daterange',
          prop: 'createdAtRange',
          label: '创建时间范围',
          startPlaceholder: '开始时间',
          endPlaceholder: '结束时间',
          priority: 'advanced'
        }
      ]
    },
    exportParams() {
      return {
        ...this.searchParams,
        page: 1,
        limit: this.pagination.total || 1000
      }
    },
    hasComputingPlans() {
      return this.tableData.some(plan => plan.status === PLAN_STATUS.COMPUTING)
    }
  },
  watch: {
    // 监听是否有运算中的方案，自动刷新
    hasComputingPlans: {
      handler(hasComputing) {
        if (hasComputing) {
          this.startAutoRefresh()
        } else {
          this.stopAutoRefresh()
        }
      },
      immediate: true
    }
  },
  created() {
    // 创建防抖搜索函数
    this.debouncedFetchList = debounce(this.fetchListSafe, 300)
    // 页面初始化时加载列表
    this.fetchListSafe()
  },
  beforeDestroy() {
    // 清理定时器
    this.stopAutoRefresh()
  },
  methods: {
    /**
     * 安全加载排程方案列表（不抛出异常）
     */
    async fetchListSafe() {
      try {
        await this.fetchList()
      } catch (error) {
        // 静默处理，错误已在fetchList中显示
      }
    },

    /**
     * 加载排程方案列表
     */
    async fetchList() {
      this.showGlobalLoading()
      this.loading = true
      try {
        // 处理搜索参数
        const params = this.buildQueryParams()

        const response = await fetchSchedulePlanList(params)

        // 根据接口文档处理响应数据（2025-10-24更新）
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
          const errorMessage = response.message || '获取排程方案列表失败'
          this.$message.error(errorMessage)
        }
      } catch (error) {
        console.error('加载排程方案列表失败:', error)
        this.tableData = []
        this.pagination.total = 0

        // 处理不同类型的错误
        const errorMessage = this.getErrorMessage(error)
        this.$message.error(errorMessage)
        throw error
      } finally {
        this.loading = false
        this.hideGlobalLoading()
      }
    },

    /**
     * 构建查询参数
     */
    buildQueryParams() {
      const params = { ...this.searchParams }

      // 处理关键词搜索：将search参数映射为planCode（方案编号模糊搜索）
      if (params.search) {
        params.planCode = params.search
        delete params.search
      }

      // 处理日期范围
      if (params.scheduleTimeRange && Array.isArray(params.scheduleTimeRange)) {
        params.scheduleStartTimeFrom = params.scheduleTimeRange[0]
        params.scheduleStartTimeTo = params.scheduleTimeRange[1]
        delete params.scheduleTimeRange
      }

      if (params.createdAtRange && Array.isArray(params.createdAtRange)) {
        params.createdAtStart = params.createdAtRange[0]
        params.createdAtEnd = params.createdAtRange[1]
        delete params.createdAtRange
      }

      // 处理状态多选
      if (params.status && Array.isArray(params.status)) {
        params.status = params.status.join(',')
      }

      // 移除空值
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key]
        }
      })

      return params
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
        this.$refs.scheduleTable.refreshSucceed('排程方案列表刷新成功')
      } catch (error) {
        this.$refs.scheduleTable.refreshFail('排程方案列表刷新失败，请重试')
        console.error('刷新排程方案列表失败:', error)
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
     * 处理行选择变化
     */
    handleSelectionChange(selectedRows) {
      this.selectedRows = selectedRows
    },

    /**
     * 处理创建排程方案
     * 开发阶段：不检查权限
     * 生产环境：需检查 prod.scheduling.create 权限
     */
    handleCreate() {
      this.createDialogVisible = true
    },

    /**
     * 处理创建成功
     */
    handleCreateSuccess(planData) {
      // 刷新列表
      this.fetchListSafe()

      // 可选：跳转到详情页面或甘特图页面
      // this.$router.push({ name: 'SchedulePlanDetail', params: { id: planData.id } })
    },

    /**
     * 处理创建对话框关闭
     */
    handleCreateClose() {
      this.createDialogVisible = false
    },

    /**
     * 处理查看详情
     */
    handleView(plan) {
      this.$router.push({
        name: 'AnnealingScheduleDetail',
        params: { id: plan.id }
      })
    },

    /**
     * 处理查看甘特图
     */
    handleViewGantt(plan) {
      // 检查方案状态，只有已生成或已发布的方案才能查看甘特图
      if (!['generated', 'published'].includes(plan.status)) {
        this.$message.warning('只有已生成或已发布的排程方案才能查看甘特图')
        return
      }

      this.$router.push({
        name: 'ScheduleGanttChart',
        params: { id: plan.id }
      })
    },

    /**
     * 处理发布排程方案
     * 开发阶段：不检查权限
     * 生产环境：需检查 prod.scheduling.publish 权限
     */
    handlePublish(plan) {
      // 检查方案状态
      if (plan.status !== PLAN_STATUS.GENERATED) {
        this.$message.warning('只有已生成状态的排程方案才能发布')
        return
      }

      // 保存当前操作的方案数据
      this.currentPlan = { ...plan }
      // 打开发布对话框
      this.publishDialogVisible = true
    },

    /**
     * 处理发布成功
     */
    handlePublishSuccess(planData) {
      // 刷新列表
      this.fetchListSafe()
    },

    /**
     * 处理发布对话框关闭
     */
    handlePublishClose() {
      this.publishDialogVisible = false
      this.currentPlan = {}
    },

    /**
     * 处理取消排程方案
     * 开发阶段：不检查权限
     * 生产环境：需检查 prod.scheduling.cancel 权限
     */
    handleCancel(plan) {
      // 检查方案状态
      if (![PLAN_STATUS.DRAFT, PLAN_STATUS.COMPUTING, PLAN_STATUS.GENERATED].includes(plan.status)) {
        this.$message.warning('只有草稿、运算中或已生成状态的排程方案才能取消')
        return
      }

      // 保存当前操作的方案数据
      this.currentPlan = { ...plan }
      // 打开取消对话框
      this.cancelDialogVisible = true
    },

    /**
     * 处理取消成功
     */
    handleCancelSuccess(planData) {
      // 刷新列表
      this.fetchListSafe()
    },

    /**
     * 处理取消对话框关闭
     */
    handleCancelClose() {
      this.cancelDialogVisible = false
      this.currentPlan = {}
    },

    /**
     * 处理导出
     */
    async handleExport(params) {
      try {
        const response = await exportSchedulePlans(params)

        // 创建下载链接
        const blob = new Blob([response])
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `排程方案列表_${new Date().toISOString().split('T')[0]}.xlsx`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)

        this.$message.success('导出成功')
      } catch (error) {
        console.error('导出失败:', error)
        this.$message.error('导出失败')
      }
    },

    /**
     * 开始自动刷新
     */
    startAutoRefresh() {
      if (this.autoRefreshTimer) {
        return
      }
      this.autoRefreshTimer = setInterval(() => {
        if (!this.loading) {
          this.fetchListSafe()
        }
      }, AUTO_REFRESH_INTERVAL)
    },

    /**
     * 停止自动刷新
     */
    stopAutoRefresh() {
      if (this.autoRefreshTimer) {
        clearInterval(this.autoRefreshTimer)
        this.autoRefreshTimer = null
      }
    },

    /**
     * 获取错误消息
     */
    getErrorMessage(error) {
      if (error.response) {
        const { status, data } = error.response
        if (status === 401) {
          return '请先登录'
        } else if (status === 403) {
          return '权限不足，请联系管理员'
        } else if (data && data.error) {
          return this.getErrorCodeMessage(data.error.code) || data.error.message || '操作失败'
        }
      }
      return error.message || '操作失败'
    },

    /**
     * 根据错误码获取错误消息
     */
    getErrorCodeMessage(code) {
      if (!code) {
        return ''
      }
      const errorConfig = ERROR_CODES[code]
      return errorConfig ? errorConfig.message : ''
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
.annealing-schedule-management {
  padding: 10px;

  &__search {
    margin-bottom: 16px;
  }

  // 响应式设计
  @media (max-width: 768px) {
    padding: 10px;
  }
}
</style>

