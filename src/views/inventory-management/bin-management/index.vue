/**
 * 文件名称：index.vue
 * 文件描述：料框管理模块主页面
 * 创建日期：2025-01-10
 * 修改记录：
 *   - 2025-01-10: 初始创建，完成基础架构搭建
 *   - 2025-10-11: 重构为标准模块架构，集成搜索、表格、表单组件
 */

<template>
  <div class="bin-management">
    <!-- 料框搜索组件 -->
    <bin-search
      v-model="searchParams"
      :loading="loading"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- 料框表格组件 -->
    <bin-table
      ref="binTable"
      :data="tableData"
      :loading="loading"
      :pagination="pagination"
      @pagination-change="handlePaginationChange"
      @refresh="handleRefresh"
      @register="handleRegister"
      @view="handleView"
      @change-status="handleUpdateStatus"
      @view-history="handleViewHistory"
    />

    <!-- 料框表单抽屉 -->
    <bin-form-drawer
      :visible.sync="formDrawerVisible"
      :mode="formMode"
      :bin-id="currentBinId"
      @success="handleFormSuccess"
      @close="handleFormClose"
    />

    <!-- 料框状态对话框 -->
    <bin-status-dialog
      :visible.sync="statusDialogVisible"
      :bin-data="currentBin"
      @success="handleStatusUpdateSuccess"
    />

    <!-- 料框状态历史对话框 -->
    <bin-status-history-dialog
      :visible.sync="historyDialogVisible"
      :bin-id="currentBinId"
    />
  </div>
</template>

<script>
import BinSearch from './components/BinSearch.vue'
import BinTable from './components/BinTable.vue'
import BinFormDrawer from './components/BinFormDrawer.vue'
import BinStatusDialog from './components/BinStatusDialog.vue'
import BinStatusHistoryDialog from './components/BinStatusHistoryDialog.vue'
import { debounce } from '@/utils'
import { getBinList } from './api'
import { DEFAULT_PAGINATION } from './constants'

/**
 * 料框管理模块主页面
 *
 * 功能说明：
 * - 料框注册：批量或单个料框的注册登记
 * - 列表查询：支持多维度条件筛选
 * - 状态管理：料框状态变更和追踪
 * - 历史查询：料框状态变更历史记录
 *
 * 业务流程：
 * - 料框从入车间登记到状态变更的全生命周期管理
 * - 料框状态流转：待入库(退火) → 待退火 → 装炉中 → 退火中 → 已退火 → 待检验 → 已出库
 */
export default {
  name: 'BinManagement',
  components: {
    BinSearch,
    BinTable,
    BinFormDrawer,
    BinStatusDialog,
    BinStatusHistoryDialog
  },
  data() {
    return {
      // 搜索参数
      searchParams: {
        ...DEFAULT_PAGINATION
      },
      // 表格数据
      tableData: [],
      // 分页参数
      pagination: {
        page: 1,
        limit: 20,
        total: 0
      },
      // 加载状态
      loading: false,
      // 表单抽屉可见性
      formDrawerVisible: false,
      // 表单模式：create-新增, update-编辑, view-查看
      formMode: 'create',
      // 当前操作的料框ID
      currentBinId: null,
      // 当前操作的料框对象
      currentBin: null,
      // 状态对话框可见性
      statusDialogVisible: false,
      // 历史对话框可见性
      historyDialogVisible: false
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
     * 安全加载料框列表（不抛出异常）
     */
    async fetchListSafe() {
      try {
        await this.fetchList()
      } catch (error) {
        // 静默处理，错误已在fetchList中显示
      }
    },

    /**
     * 加载料框列表
     */
    async fetchList() {
      this.loading = true
      try {
        const response = await getBinList(this.searchParams)

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
          this.$message.error(response.message || '获取料框列表失败')
        }
      } catch (error) {
        console.error('加载料框列表失败:', error)
        this.tableData = []
        this.pagination.total = 0

        let errorMessage = '获取料框列表失败'
        if (error.response && error.response.data && error.response.data.error) {
          errorMessage = error.response.data.error.message || errorMessage
        } else if (error.message) {
          errorMessage = error.message
        }

        this.$message.error(errorMessage)
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
        this.$refs.binTable.refreshSucceed('料框列表刷新成功')
      } catch (error) {
        this.$refs.binTable.refreshFail('料框列表刷新失败，请重试')
        console.error('刷新料框列表失败:', error)
      }
    },

    /**
     * 处理重置
     */
    handleReset() {
      this.searchParams = {
        ...DEFAULT_PAGINATION,
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
     * 处理查看详情
     */
    handleView(bin) {
      this.currentBinId = bin.id
      this.formMode = 'view'
      this.formDrawerVisible = true
    },

    /**
     * 处理注册料框
     */
    handleRegister() {
      this.currentBinId = null
      this.formMode = 'create'
      this.formDrawerVisible = true
    },

    /**
     * 处理更新状态
     */
    handleUpdateStatus(bin) {
      this.currentBin = bin
      this.statusDialogVisible = true
    },

    /**
     * 处理查看历史
     */
    handleViewHistory(bin) {
      this.currentBinId = bin.id
      this.historyDialogVisible = true
    },

    /**
     * 处理表单提交成功
     */
    handleFormSuccess() {
      this.formDrawerVisible = false
      this.fetchListSafe()
    },

    /**
     * 处理表单关闭
     */
    handleFormClose() {
      this.formDrawerVisible = false
      this.currentBinId = null
    },

    /**
     * 处理状态更新成功
     */
    handleStatusUpdateSuccess() {
      this.statusDialogVisible = false
      this.currentBin = null
      this.fetchListSafe()
    }
  }
}
</script>

<style lang="scss" scoped>
.bin-management {
  padding: 20px;

  // 响应式设计
  @media (max-width: 768px) {
    padding: 10px;
  }
}
</style>
