/**
 * 文件名称：index.vue
 * 文件描述：生产计划管理主页面 - 实现生产计划列表展示、查询、筛选和基础操作
 * 创建日期：2025-01-21
 * 修改记录：
 *   - 2025-01-21: 初始创建，完成P0阶段和部分P1阶段功能
 *   - 2025-01-21: 重构对齐业务流程和接口文档
 *
 * 业务流程说明：
 *   1. 查询列表：支持分页、排序、筛选、模糊搜索
 *   2. 状态流转：RECEIVED→CONFIRMED→PENDING_APPROVAL→RELEASED→IN_PROGRESS→COMPLETED
 *   3. 快速操作：确认计划、状态变更（自动走审批）、取消计划（自动走审批）
 *   4. 冻结检查：已冻结的计划禁止所有操作
 *
 * 接口依赖：
 *   - GET /v1/prod/plans - 查询生产计划列表
 *   - PATCH /v1/prod/plans/:planId/status - 更新计划状态
 *
 * 参考文档：
 *   - 生产计划业务流程说明.md
 *   - 查询生产计划列表接口详细说明.md
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
      @cancel="handleCancel"
      @selection-change="handleSelectionChange"
    />

    <!-- 创建计划抽屉 -->
    <plan-form-drawer
      ref="planFormDrawer"
      @success="handleCreateSuccess"
    />

    <!-- 状态变更对话框 -->
    <status-change-dialog
      ref="statusChangeDialog"
      @success="handleStatusChangeSuccess"
    />
  </div>
</template>

<script>
import PlanSearch from './components/PlanSearch.vue'
import PlanTable from './components/PlanTable.vue'
import PlanFormDrawer from './components/PlanFormDrawer.vue'
import StatusChangeDialog from './components/StatusChangeDialog.vue'
import productionPlanDictionaryMixin from './mixins/dictionary'
import { debounce } from '@/utils'
import { fetchPlanList, updatePlanStatus } from './api'
import {
  DEFAULT_PAGINATION,
  DEFAULT_SORT,
  OUTPUT_FORMAT,
  PLAN_STATUS
} from './constants'
import { getErrorMessage, getSuccessMessage } from './constants/messages-config'
import { withRetry, createApprovalErrorHandler } from './utils/approval-error-handler'

export default {
  name: 'ProductionPlanManagement',
  components: {
    PlanSearch,
    PlanTable,
    PlanFormDrawer,
    StatusChangeDialog
  },
  mixins: [productionPlanDictionaryMixin],
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
      currentFormat: OUTPUT_FORMAT.TABLE
    }
  },
  created() {
    // 创建防抖搜索函数
    this.debouncedFetchList = debounce(this.fetchListSafe, 300)
    // 加载枚举字典
    this.loadDictionaries()
    // 恢复页面缓存（查询参数和分页信息）
    this.handlePageCacheRestore()
    // 从路由查询参数恢复搜索状态（路由参数优先级更高，会覆盖缓存）
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
     * 加载枚举字典（使用 mixin 提供的方法）
     */
    async loadDictionaries() {
      try {
        await this.loadProductionPlanDictionary()
      } catch (error) {
        console.error('[生产计划管理] 加载枚举字典失败:', error)
      }
    },

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
      this.loading = true
      try {
        const response = await fetchPlanList({
          ...this.searchParams,
          format: this.currentFormat
        })

        // 根据接口文档处理响应数据
        // 响应格式: { success: true, data: { results, page, limit, totalPages, totalResults, format }, message, meta }
        if (response.success && response.data) {
          this.tableData = response.data.results || []
          this.pagination = {
            page: response.data.page || 1,
            limit: response.data.limit || 20,
            total: response.data.totalResults || 0
          }
          // 注意: 成功响应也可能包含message,但通常不需要显示
        } else {
          this.tableData = []
          this.pagination.total = 0
          // 优先使用后端返回的message（失败时在 error 对象中）
          this.$message.error(response.error?.message || '获取生产计划列表失败')
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
      this.$refs.planFormDrawer.open()
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

        const response = await withRetry(
          () => updatePlanStatus(plan.id, {
            targetStatus: PLAN_STATUS.CONFIRMED,
            changeDescription: '确认生产计划'
          }),
          {
            maxRetries: 3,
            context: {
              operation: 'confirm',
              planId: plan.id
            },
            onApprovalDetailsView: (approvalId) => {
              // 查看审批详情
              console.log('查看审批详情:', approvalId)
            },
            onRefreshData: () => {
              this.fetchListSafe()
            }
          }
        )

        if (response.success) {
          // ⚠️ 必须使用后端返回的message，不得硬编码
          const message = response.message || getSuccessMessage(response, '确认计划成功')
          this.$message.success(message)
          // 刷新列表
          await this.fetchList()
        } else {
          // ⚠️ 优先使用后端返回的错误消息（失败时在 error 对象中）
          this.$message.error(response.error?.message || '确认计划失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('确认计划失败:', error)
          // 如果错误没有被处理，使用默认处理
          if (!error.handled) {
            const errorHandler = createApprovalErrorHandler({
              onRefreshData: () => {
                this.fetchListSafe()
              }
            })
            await errorHandler.handleError(error, {
              operation: 'confirm',
              planId: plan.id
            })
          }
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
     * 处理取消计划
     * 📢 此操作会自动提交审批，审批通过后计划状态变更为已取消
     */
    async handleCancel(plan) {
      try {
        // 弹出输入框让用户输入取消原因
        const { value: cancelReason } = await this.$prompt(
          '⚠️ 此操作将自动提交取消审批，审批通过后计划状态变更为"已取消"\n\n请输入取消原因（必填）',
          `取消计划 ${plan.planNumber}`,
          {
            confirmButtonText: '确认并提交审批',
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

        const response = await withRetry(
          () => updatePlanStatus(plan.id, {
            targetStatus: PLAN_STATUS.CANCELLED,
            cancelReason: cancelReason.trim(),
            changeDescription: '取消生产计划'
          }),
          {
            maxRetries: 3,
            context: {
              operation: 'cancel',
              planId: plan.id
            },
            onApprovalDetailsView: (approvalId) => {
              // 查看审批详情
              console.log('查看审批详情:', approvalId)
            },
            onRefreshData: () => {
              this.fetchListSafe()
            }
          }
        )

        if (response.success) {
          // ⚠️ 必须使用后端返回的message，不得硬编码
          const message = response.message || getSuccessMessage(response, '取消计划成功')
          this.$message.success(message)
          // 刷新列表
          await this.fetchList()
        } else {
          // ⚠️ 优先使用后端返回的错误消息（失败时在 error 对象中）
          this.$message.error(response.error?.message || '取消计划失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('取消计划失败:', error)
          // 如果错误没有被处理，使用默认处理
          if (!error.handled) {
            const errorHandler = createApprovalErrorHandler({
              onRefreshData: () => {
                this.fetchListSafe()
              }
            })
            await errorHandler.handleError(error, {
              operation: 'cancel',
              planId: plan.id
            })
          }
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
     * 页面缓存恢复
     *
     * 修复说明：
     * - 只恢复查询参数和分页信息，不恢复表格数据
     * - 表格数据应该通过 fetchList 从后端重新获取
     * - 添加缓存过期时间检查（30分钟）
     */
    handlePageCacheRestore() {
      const cachedData = sessionStorage.getItem('production-plan-cache')
      if (cachedData) {
        try {
          const cache = JSON.parse(cachedData)

          // 检查缓存是否过期（30分钟）
          const cacheAge = Date.now() - (cache.timestamp || 0)
          const MAX_CACHE_AGE = 30 * 60 * 1000 // 30分钟

          if (cacheAge > MAX_CACHE_AGE) {
            console.log('缓存已过期，清理缓存')
            sessionStorage.removeItem('production-plan-cache')
            return
          }

          // 只恢复查询参数和分页信息
          // ⚠️ 不恢复 tableData，避免缓存大量数据
          this.pagination = cache.pagination || this.pagination
          this.searchParams = cache.searchParams || this.searchParams

          console.log('✅ 页面缓存恢复成功:', {
            pagination: this.pagination,
            searchParams: this.searchParams
          })
        } catch (error) {
          console.warn('页面缓存恢复失败:', error)
          // 清理损坏的缓存
          sessionStorage.removeItem('production-plan-cache')
        }
      }
    },

    /**
     * 页面缓存保存
     *
     * 修复说明：
     * - 只保存查询参数和分页信息，不保存表格数据
     * - 添加 try-catch 保护，防止存储失败影响主流程
     * - 添加数据大小限制检查
     */
    handlePageCacheSave() {
      try {
        const cache = {
          // ⚠️ 不缓存 tableData，避免超出 sessionStorage 配额
          // tableData 应该从后端重新获取，而不是从缓存恢复
          pagination: this.pagination,
          searchParams: this.searchParams,
          timestamp: Date.now()
        }

        const cacheStr = JSON.stringify(cache)

        // 检查缓存大小（不应超过 100KB）
        const cacheSize = new Blob([cacheStr]).size
        const MAX_CACHE_SIZE = 100 * 1024 // 100KB

        if (cacheSize > MAX_CACHE_SIZE) {
          console.warn('缓存数据过大，跳过保存:', {
            size: cacheSize,
            maxSize: MAX_CACHE_SIZE
          })
          return
        }

        sessionStorage.setItem('production-plan-cache', cacheStr)

        console.log('✅ 页面缓存保存成功:', {
          size: cacheSize,
          cacheKeys: Object.keys(cache)
        })
      } catch (error) {
        // 捕获 QuotaExceededError 或其他存储错误
        console.warn('页面缓存保存失败:', error.message)

        // 如果是配额超出错误，清理所有生产计划相关的缓存
        if (error.name === 'QuotaExceededError') {
          console.log('检测到 QuotaExceededError，清理旧缓存...')
          try {
            sessionStorage.removeItem('production-plan-cache')
            // 可以在这里添加清理其他相关缓存的逻辑
          } catch (cleanupError) {
            console.error('清理缓存失败:', cleanupError)
          }
        }

        // ⚠️ 不抛出错误，避免影响主流程
      }
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

