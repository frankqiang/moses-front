/**
 * 文件名称：index.vue
 * 文件描述：生产计划管理主页面
 * 创建日期：2025-01-21
 * 修改记录：
 *   - 2025-01-21: 初始创建，完成P0阶段和部分P1阶段功能
 */

<template>
  <div class="production-plan-management">
    <!-- 搜索组件 -->
    <plan-search
      v-model="searchParams"
      :loading="loading"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- 表格组件 -->
    <plan-table
      ref="planTable"
      :data="tableData"
      :loading="loading"
      :pagination="pagination"
      :sort-by="sortBy"
      :format="currentFormat"
      :toolbar-config="{
        enableRefresh: true,
        enableExport: false,
        enableColumnSettings: true,
        enableBatchActions: false
      }"
      @pagination-change="handlePaginationChange"
      @sort-change="handleSortChange"
      @refresh="handleRefresh"
      @format-change="handleFormatChange"
      @create="handleCreate"
      @import="handleImport"
      @view="handleView"
      @change-status="handleChangeStatus"
      @confirm="handleConfirm"
      @submit-approval="handleSubmitApprovalDialog"
      @cancel="handleCancel"
      @selection-change="handleSelectionChange"
    />

    <!-- 创建计划对话框 -->
    <plan-form-dialog
      ref="planFormDialog"
      @success="handleCreateSuccess"
    />

    <!-- 状态变更对话框 -->
    <status-change-dialog
      ref="statusChangeDialog"
      @success="handleStatusChangeSuccess"
    />

    <!-- 审批提交对话框 -->
    <approval-submit-dialog
      ref="approvalSubmitDialog"
      @success="handleApprovalSubmitSuccess"
    />
  </div>
</template>

<script>
import PlanSearch from './components/PlanSearch.vue'
import PlanTable from './components/PlanTable.vue'
import PlanFormDialog from './components/PlanFormDialog.vue'
import StatusChangeDialog from './components/StatusChangeDialog.vue'
import ApprovalSubmitDialog from './components/ApprovalSubmitDialog.vue'
import { debounce } from '@/utils'
import { fetchPlanList, updatePlanStatus } from './api'
import {
  DEFAULT_PAGINATION,
  DEFAULT_SORT,
  OUTPUT_FORMAT,
  PLAN_STATUS,
  SUCCESS_MESSAGES,
  getErrorMessage
} from './constants'

export default {
  name: 'ProductionPlanManagement',
  components: {
    PlanSearch,
    PlanTable,
    PlanFormDialog,
    StatusChangeDialog,
    ApprovalSubmitDialog
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
      // 当前视图格式
      currentFormat: OUTPUT_FORMAT.TABLE,
      // 全局loading实例
      globalLoading: null
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
  beforeRouteLeave(to, from, next) {
    // 页面离开时保存缓存
    this.handlePageCacheSave()
    next()
  },
  methods: {
    /**
     * 安全加载生产计划列表（不抛出异常）
     */
    async fetchListSafe() {
      try {
        await this.fetchList()
      } catch (error) {
        // 静默处理，错误已在fetchList中显示
      }
    },

    /**
     * 加载生产计划列表（会抛出异常供调用者处理）
     */
    async fetchList() {
      this.showGlobalLoading()
      this.loading = true
      try {
        const response = await fetchPlanList({
          ...this.searchParams,
          format: this.currentFormat
        })

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
          this.$message.error(response.message || '获取生产计划列表失败')
        }

        // 缓存页面数据
        this.handlePageCacheSave()
      } catch (error) {
        console.error('加载生产计划列表失败:', error)
        this.tableData = []
        this.pagination.total = 0

        // 使用统一的错误消息处理
        const errorMessage = getErrorMessage(error)
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
        this.$refs.planTable.refreshSucceed('生产计划列表刷新成功')
      } catch (error) {
        // 刷新失败时调用子组件的反馈方法
        this.$refs.planTable.refreshFail('生产计划列表刷新失败，请重试')
        console.error('刷新生产计划列表失败:', error)
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
     * 处理格式变化
     */
    handleFormatChange(format) {
      this.currentFormat = format
      this.fetchListSafe()
    },

    /**
     * 处理行选择变化
     */
    handleSelectionChange(selectedRows) {
      this.selectedRows = selectedRows
    },

    /**
     * 处理创建计划
     */
    handleCreate() {
      this.$refs.planFormDialog.open()
    },

    /**
     * 处理创建成功
     */
    async handleCreateSuccess() {
      // 刷新列表
      await this.fetchListSafe()
    },

    /**
     * 处理导入
     */
    handleImport() {
      this.$message.info('批量导入功能开发中')
      // TODO: 实现批量导入功能
    },

    /**
     * 处理查看详情
     */
    handleView(plan) {
      this.$router.push({
        name: 'ProductionPlanDetail',
        params: { id: plan.id }
      })
    },

    /**
     * 处理确认计划
     */
    async handleConfirm(plan) {
      try {
        const confirmed = await this.$confirm(
          `确认要确认计划"${plan.planNumber}"吗？`,
          '确认操作',
          {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        if (!confirmed) {
          return
        }

        this.loading = true

        const response = await updatePlanStatus(plan.id, {
          targetStatus: PLAN_STATUS.CONFIRMED,
          changeDescription: '确认生产计划'
        })

        if (response.success) {
          this.$message.success(response.message || SUCCESS_MESSAGES.CONFIRM)
          // 刷新列表
          await this.fetchList()
        } else {
          this.$message.error(response.message || '确认计划失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('确认计划失败:', error)
          const errorMessage = getErrorMessage(error)
          this.$message.error(errorMessage)
        }
      } finally {
        this.loading = false
      }
    },

    /**
     * 处理状态变更
     */
    handleChangeStatus(plan) {
      this.$refs.statusChangeDialog.open(plan)
    },

    /**
     * 状态变更成功回调
     */
    async handleStatusChangeSuccess() {
      await this.fetchListSafe()
    },

    /**
     * 打开审批提交对话框
     */
    handleSubmitApprovalDialog(plan) {
      this.$refs.approvalSubmitDialog.open(plan)
    },

    /**
     * 审批提交成功回调
     */
    async handleApprovalSubmitSuccess() {
      await this.fetchListSafe()
    },

    /**
     * 处理提交审批（保留旧方法以兼容）
     */
    async handleSubmitApproval(plan) {
      try {
        const confirmed = await this.$confirm(
          `确认要提交计划"${plan.planNumber}"到审批流程吗？`,
          '提交审批',
          {
            confirmButtonText: '提交',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        if (!confirmed) {
          return
        }

        this.loading = true

        // 提交待审批状态
        const response = await updatePlanStatus(plan.id, {
          targetStatus: PLAN_STATUS.PENDING_APPROVAL,
          changeDescription: '提交生产计划审批'
        })

        if (response.success) {
          this.$message.success(response.message || SUCCESS_MESSAGES.SUBMIT_APPROVAL)
          // 刷新列表
          await this.fetchList()
        } else {
          this.$message.error(response.message || '提交审批失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('提交审批失败:', error)
          const errorMessage = getErrorMessage(error)
          this.$message.error(errorMessage)
        }
      } finally {
        this.loading = false
      }
    },

    /**
     * 处理取消计划
     */
    async handleCancel(plan) {
      try {
        // 弹出输入框让用户输入取消原因
        const { value: cancelReason } = await this.$prompt(
          '请输入取消原因（必填）',
          `取消计划 ${plan.planNumber}`,
          {
            confirmButtonText: '确认取消',
            cancelButtonText: '取消',
            inputPattern: /\S+/,
            inputErrorMessage: '取消原因不能为空',
            inputPlaceholder: '请输入取消原因',
            inputType: 'textarea'
          }
        )

        if (!cancelReason) {
          return
        }

        this.loading = true

        const response = await updatePlanStatus(plan.id, {
          targetStatus: PLAN_STATUS.CANCELLED,
          cancelReason: cancelReason.trim(),
          changeDescription: '取消生产计划'
        })

        if (response.success) {
          this.$message.success(response.message || SUCCESS_MESSAGES.CANCEL)
          // 刷新列表
          await this.fetchList()
        } else {
          this.$message.error(response.message || '取消计划失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('取消计划失败:', error)
          const errorMessage = getErrorMessage(error)
          this.$message.error(errorMessage)
        }
      } finally {
        this.loading = false
      }
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
          limit: query.limit ? parseInt(query.limit, 10) : 20
        }
      }
    },

    /**
     * 将搜索参数同步到路由
     */
    syncSearchToRoute(params) {
      const query = {}
      Object.keys(params).forEach(key => {
        const value = params[key]
        if (value !== undefined && value !== null && value !== '') {
          if (typeof value === 'number') {
            query[key] = value.toString()
          } else {
            query[key] = value
          }
        }
      })

      // 避免重复的路由更新
      if (JSON.stringify(query) !== JSON.stringify(this.$route.query)) {
        this.$router.replace({
          path: this.$route.path,
          query
        }).catch(() => {}) // 忽略导航重复的错误
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
    },

    /**
     * 页面缓存恢复
     */
    handlePageCacheRestore() {
      const cachedData = sessionStorage.getItem('production-plan-cache')
      if (cachedData) {
        try {
          const cache = JSON.parse(cachedData)
          this.tableData = cache.tableData || []
          this.pagination = cache.pagination || this.pagination
          this.searchParams = cache.searchParams || this.searchParams
        } catch (error) {
          console.warn('页面缓存恢复失败:', error)
        }
      }
    },

    /**
     * 页面缓存保存
     */
    handlePageCacheSave() {
      const cache = {
        tableData: this.tableData,
        pagination: this.pagination,
        searchParams: this.searchParams,
        timestamp: Date.now()
      }
      sessionStorage.setItem('production-plan-cache', JSON.stringify(cache))
    }
  }
}
</script>

<style lang="scss" scoped>
.production-plan-management {
  padding: 20px;

  // 响应式设计
  @media (max-width: 768px) {
    padding: 10px;
  }
}
</style>

