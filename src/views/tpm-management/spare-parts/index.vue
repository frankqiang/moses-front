/**
 * 文件名称：index.vue
 * 文件描述：备件管理模块主页面
 * 创建日期：2025-01-21
 * 修改记录：
 *   - 2025-01-21: 首次创建，完成P0阶段主页面集成和P1阶段12项功能
 */

<template>
  <div class="spare-part-management">
    <!-- 备件搜索组件 -->
    <spare-part-search
      v-model="searchParams"
      :loading="loading"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- 备件表格组件 -->
    <spare-part-table
      ref="sparePartTable"
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
      @create="handleCreate"
      @view="handleView"
      @edit="handleEdit"
      @in-stock="handleInStock"
      @out-stock="handleOutStock"
      @selection-change="handleSelectionChange"
    />

    <!-- 备件创建/编辑表单抽屉 -->
    <spare-part-form-drawer
      :visible.sync="formDrawerVisible"
      :mode="formDrawerMode"
      :spare-part-id="currentSparePartId"
      @success="handleFormSuccess"
      @close="handleFormDrawerClose"
    />

    <!-- 备件入库对话框 -->
    <in-stock-dialog
      :visible.sync="inStockDialogVisible"
      :spare-part-info="currentSparePartData"
      @success="handleInStockSuccess"
      @close="handleInStockDialogClose"
    />

    <!-- 备件出库对话框 -->
    <out-stock-dialog
      :visible.sync="outStockDialogVisible"
      :spare-part-info="currentSparePartData"
      @success="handleOutStockSuccess"
      @close="handleOutStockDialogClose"
    />
  </div>
</template>

<script>
import SparePartSearch from './components/SparePartSearch.vue'
import SparePartTable from './components/SparePartTable.vue'
import SparePartFormDrawer from './components/SparePartFormDrawer.vue'
import InStockDialog from './components/InStockDialog.vue'
import OutStockDialog from './components/OutStockDialog.vue'
import { debounce } from '@/utils'
import { getSpareParts } from './api'
import {
  DEFAULT_PAGINATION,
  DEFAULT_SORT
} from './constants/spare-part-management'
import {
  SUCCESS_MESSAGES,
  ERROR_MESSAGES
} from './constants/messages-config'

export default {
  name: 'SparePartManagement',
  components: {
    SparePartSearch,
    SparePartTable,
    SparePartFormDrawer,
    InStockDialog,
    OutStockDialog
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
      // 选中的行数据
      selectedRows: [],
      // 全局loading实例
      globalLoading: null,
      // 表单抽屉可见性
      formDrawerVisible: false,
      // 表单抽屉模式：create/edit
      formDrawerMode: 'create',
      // 当前操作的备件ID
      currentSparePartId: '',
      // 入库对话框可见性
      inStockDialogVisible: false,
      // 出库对话框可见性
      outStockDialogVisible: false,
      // 当前操作的备件数据（用于入库/出库）
      currentSparePartData: {}
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
    $route: {
      handler(newRoute) {
        // 路由变化时恢复搜索状态
        if (newRoute.query && Object.keys(newRoute.query).length > 0) {
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
  /**
   * 路由离开前钩子 - 清理组件状态
   */
  beforeRouteLeave(to, from, next) {
    // 关闭所有打开的对话框和抽屉
    this.formDrawerVisible = false
    this.inStockDialogVisible = false
    this.outStockDialogVisible = false

    // 隐藏全局加载遮罩
    this.hideGlobalLoading()

    // 清理当前操作的数据
    this.currentSparePartId = ''
    this.currentSparePartData = {}
    this.selectedRows = []

    next()
  },
  methods: {
    /**
     * 安全加载备件列表（不抛出异常）
     */
    async fetchListSafe() {
      try {
        await this.fetchList()
      } catch (error) {
        // 静默处理，错误已在fetchList中显示
      }
    },

    /**
     * 加载备件列表（会抛出异常供调用者处理）
     */
    async fetchList() {
      this.showGlobalLoading()
      this.loading = true
      try {
        // 构建查询参数
        const params = {
          ...this.searchParams
        }

        const response = await getSpareParts(params)

        // 根据接口文档处理响应数据
        if (response && response.data) {
          this.tableData = response.data.results || []
          this.pagination = {
            page: response.data.page || 1,
            limit: response.data.limit || 10,
            total: response.data.totalResults || 0
          }
        } else {
          this.tableData = []
          this.pagination.total = 0
          this.$message.error(response.message || ERROR_MESSAGES.LOAD_LIST_FAILED)
        }

        // 埋点统计
        this.trackEvent('load-list', {
          page: this.searchParams.page,
          limit: this.searchParams.limit,
          total: this.pagination.total
        })
      } catch (error) {
        console.error('加载备件列表失败:', error)
        this.tableData = []
        this.pagination.total = 0

        // 处理不同类型的错误
        let errorMessage = ERROR_MESSAGES.LOAD_LIST_FAILED
        if (error.response) {
          const { status, data } = error.response
          if (status === 401) {
            errorMessage = ERROR_MESSAGES.UNAUTHORIZED
          } else if (status === 403) {
            errorMessage = ERROR_MESSAGES.FORBIDDEN
          } else if (data && data.error && data.error.message) {
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
        // 埋点统计
        this.trackEvent('refresh', {
          page: this.searchParams.page,
          limit: this.searchParams.limit
        })
        await this.fetchList()
        // 刷新成功时调用子组件的反馈方法
        this.$refs.sparePartTable.refreshSucceed(SUCCESS_MESSAGES.REFRESH_LIST)
      } catch (error) {
        // 刷新失败时调用子组件的反馈方法
        this.$refs.sparePartTable.refreshFail(ERROR_MESSAGES.REFRESH_LIST_FAILED)
        console.error('刷新备件列表失败:', error)
      }
    },

    /**
     * 处理重置
     */
    handleReset() {
      // 埋点统计
      this.trackEvent('reset-search', {
        previousParams: this.searchParams
      })

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
     * 处理查看详情
     */
    handleView(sparePart) {
      // 埋点统计
      this.trackEvent('view-spare-part', { sparePartId: sparePart.id })

      // 跳转到详情页面
      this.$router.push({
        name: 'SparePartDetail',
        params: { id: sparePart.id }
      })
    },

    /**
     * 处理编辑
     */
    handleEdit(sparePart) {
      // 埋点统计
      this.trackEvent('edit-spare-part', { sparePartId: sparePart.id })

      // 打开编辑表单抽屉
      this.formDrawerMode = 'edit'
      this.currentSparePartId = sparePart.id
      this.formDrawerVisible = true
    },

    /**
     * 处理创建
     */
    handleCreate() {
      // 埋点统计
      this.trackEvent('create-spare-part')

      // 打开创建表单抽屉
      this.formDrawerMode = 'create'
      this.currentSparePartId = ''
      this.formDrawerVisible = true
    },

    /**
     * 处理表单提交成功（创建或编辑）
     */
    handleFormSuccess(sparePart) {
      // 埋点统计
      const action = this.formDrawerMode === 'create' ? 'create-spare-part-success' : 'edit-spare-part-success'
      this.trackEvent(action, { sparePartId: sparePart.id })

      // 关闭抽屉
      this.formDrawerVisible = false

      // 刷新列表
      this.fetchListSafe()
    },

    /**
     * 处理表单抽屉关闭
     */
    handleFormDrawerClose() {
      this.formDrawerVisible = false
    },

    /**
     * 处理入库
     */
    handleInStock(sparePart) {
      // 埋点统计
      this.trackEvent('in-stock', { sparePartId: sparePart.id })

      // 设置当前备件数据
      this.currentSparePartData = {
        id: sparePart.id,
        sparePartCode: sparePart.sparePartCode,
        sparePartName: sparePart.sparePartName,
        unit: sparePart.unit,
        currentQuantity: sparePart.inventory?.currentQuantity || 0,
        safetyStock: sparePart.safetyStock || 0
      }

      // 打开入库对话框
      this.inStockDialogVisible = true
    },

    /**
     * 处理入库成功
     */
    handleInStockSuccess(data) {
      // 埋点统计
      this.trackEvent('in-stock-success', {
        sparePartId: this.currentSparePartData.id,
        quantity: data.transaction?.quantity
      })

      // 关闭对话框
      this.inStockDialogVisible = false

      // 刷新列表
      this.fetchListSafe()
    },

    /**
     * 处理入库对话框关闭
     */
    handleInStockDialogClose() {
      this.inStockDialogVisible = false
      this.currentSparePartData = {}
    },

    /**
     * 处理出库
     */
    handleOutStock(sparePart) {
      // 埋点统计
      this.trackEvent('out-stock', { sparePartId: sparePart.id })

      // 设置当前备件数据
      this.currentSparePartData = {
        id: sparePart.id,
        sparePartCode: sparePart.sparePartCode,
        sparePartName: sparePart.sparePartName,
        unit: sparePart.unit,
        currentQuantity: sparePart.inventory?.currentQuantity || 0,
        safetyStock: sparePart.safetyStock || 0
      }

      // 打开出库对话框
      this.outStockDialogVisible = true
    },

    /**
     * 处理出库成功
     */
    handleOutStockSuccess(data) {
      // 埋点统计
      this.trackEvent('out-stock-success', {
        sparePartId: this.currentSparePartData.id,
        quantity: data.transaction?.quantity,
        transactionType: data.transaction?.transactionType
      })

      // 关闭对话框
      this.outStockDialogVisible = false

      // 刷新列表
      this.fetchListSafe()
    },

    /**
     * 处理出库对话框关闭
     */
    handleOutStockDialogClose() {
      this.outStockDialogVisible = false
      this.currentSparePartData = {}
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
          limit: query.limit ? parseInt(query.limit, 10) : 10,
          lowStock: query.lowStock === 'true' || query.lowStock === true
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
          } else if (typeof value === 'boolean') {
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
     * 埋点统计
     */
    trackEvent(action, data = {}) {
      // 这里可以集成实际的埋点统计系统
      console.log('埋点统计:', {
        page: 'spare-part-management',
        action,
        data,
        timestamp: new Date().toISOString()
      })
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
.spare-part-management {
  padding: 20px;
  // 响应式设计
  @media (max-width: 768px) {
    padding: 10px;
  }
}
</style>

