/**
 * 文件名称：index.vue
 * 文件描述：铝箔产品管理模块主页面
 * 创建日期：2025-09-27
 * 修改记录：
 *   - 2025-09-27: 首次创建，完成P0阶段主页面集成
 */

<template>
  <div class="aluminum-foil-product-management">
    <!-- 产品搜索组件 -->
    <product-search
      v-model="searchParams"
      :loading="loading"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- 产品表格组件 -->
    <product-table
      ref="productTable"
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
      @view="handleView"
      @edit="handleEdit"
      @selection-change="handleSelectionChange"
    />

    <!-- 产品表单抽屉 -->
    <product-form-drawer
      :visible.sync="formDrawerVisible"
      :mode="formMode"
      :product-data="currentProduct"
      @success="handleFormSuccess"
      @close="handleFormClose"
    />
  </div>
</template>

<script>
import ProductSearch from './components/ProductSearch.vue'
import ProductTable from './components/ProductTable.vue'
import ProductFormDrawer from './components/ProductFormDrawer.vue'
import { debounce } from '@/utils'
import {
  fetchFoilProductList,
  getFoilProductDetail
} from './api'
import {
  DEFAULT_PAGINATION,
  DEFAULT_SORT
} from './constants/aluminum-foil-product-management'

export default {
  name: 'AluminumFoilProductManagement',
  components: {
    ProductSearch,
    ProductTable,
    ProductFormDrawer
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
      // 表单抽屉可见性
      formDrawerVisible: false,
      // 表单模式：create-新增, update-编辑, view-查看
      formMode: 'create',
      // 当前操作的产品数据
      currentProduct: null,
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
    this.debouncedFetchList = debounce(this.fetchList, 300)
    // 从路由查询参数恢复搜索状态
    this.restoreSearchFromRoute()
    // 页面初始化时加载列表
    this.fetchList()
  },
  beforeRouteLeave(to, from, next) {
    // 页面离开时保存缓存
    this.handlePageCacheSave()
    next()
  },
  methods: {
    /**
     * 加载产品列表
     */
    async fetchList() {
      this.showGlobalLoading()
      this.loading = true
      try {
        const response = await fetchFoilProductList(this.searchParams)

        this.tableData = response.data.results || []
        this.pagination = {
          page: response.data.page || 1,
          limit: response.data.limit || 20,
          total: response.data.totalResults || 0
        }

        // 缓存页面数据
        this.handlePageCacheSave()

        // 埋点统计
        this.trackEvent('load-list', {
          page: this.searchParams.page,
          limit: this.searchParams.limit,
          total: this.pagination.total
        })
      } catch (error) {
        console.error('加载产品列表失败:', error)
        this.tableData = []
        this.pagination.total = 0
        this.$message.error(error.message || '加载产品列表失败')
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
    handleRefresh() {
      // 埋点统计
      this.trackEvent('refresh', {
        page: this.searchParams.page,
        limit: this.searchParams.limit
      })
      this.fetchList()
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
      this.fetchList()
    },

    /**
     * 处理分页变化
     */
    handlePaginationChange({ page, limit }) {
      this.pagination.page = page
      this.pagination.limit = limit
      this.searchParams.page = page
      this.searchParams.limit = limit
      this.fetchList()
    },

    /**
     * 处理排序变化
     */
    handleSortChange(sortBy) {
      this.sortBy = sortBy
      this.searchParams.sortBy = sortBy
      this.searchParams.page = 1 // 排序时重置到第一页
      this.fetchList()
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
    async handleView(product) {
      // 埋点统计
      this.trackEvent('view-product', { productId: product.id })

      this.loading = true
      try {
        const response = await getFoilProductDetail(product.id)
        this.currentProduct = response.data
        this.formMode = 'view'
        this.formDrawerVisible = true
      } catch (error) {
        console.error('获取产品详情失败:', error)
        this.$message.error(error.message || '获取产品详情失败')
      } finally {
        this.loading = false
      }
    },

    /**
     * 处理编辑
     */
    async handleEdit(product) {
      // 埋点统计
      this.trackEvent('edit-product', { productId: product.id })

      this.loading = true
      try {
        const response = await getFoilProductDetail(product.id)
        this.currentProduct = response.data
        this.formMode = 'update'
        this.formDrawerVisible = true
      } catch (error) {
        console.error('获取产品详情失败:', error)
        this.$message.error(error.message || '获取产品详情失败')
      } finally {
        this.loading = false
      }
    },

    /**
     * 处理创建
     */
    handleCreate() {
      // 埋点统计
      this.trackEvent('create-product')

      this.currentProduct = null
      this.formMode = 'create'
      this.formDrawerVisible = true
    },

    /**
     * 处理表单提交成功
     */
    handleFormSuccess() {
      this.formDrawerVisible = false
      this.fetchList()
    },

    /**
     * 处理表单关闭
     */
    handleFormClose() {
      this.formDrawerVisible = false
      this.currentProduct = null
    },

    /**
     * 处理导出
     */
    async handleExport(params) {
      // 埋点统计
      this.trackEvent('export', { params })

      try {
        const response = await this.$utils.request({
          url: '/v1/aluminum-foil-products/export',
          method: 'post',
          data: params,
          responseType: 'blob'
        })

        // 创建下载链接
        const blob = new Blob([response.data])
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `铝箔产品列表_${new Date().toISOString().split('T')[0]}.xlsx`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)

        this.$message.success(response.message || '导出成功')
      } catch (error) {
        console.error('导出失败:', error)
        this.$message.error(error.message || '导出失败')
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
          limit: query.limit ? parseInt(query.limit, 10) : 20,
          thicknessMin: query.thicknessMin ? parseFloat(query.thicknessMin) : undefined,
          thicknessMax: query.thicknessMax ? parseFloat(query.thicknessMax) : undefined,
          widthMin: query.widthMin ? parseFloat(query.widthMin) : undefined,
          widthMax: query.widthMax ? parseFloat(query.widthMax) : undefined
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
     * 埋点统计
     */
    trackEvent(action, data = {}) {
      // 这里可以集成实际的埋点统计系统
      console.log('埋点统计:', {
        page: 'aluminum-foil-product-management',
        action,
        data,
        timestamp: new Date().toISOString()
      })
    },

    /**
     * 显示全局加载遮罩
     */
    showGlobalLoading() {
      this.$loading.show({
        text: '加载中...',
        background: 'rgba(0, 0, 0, 0.7)'
      })
    },

    /**
     * 隐藏全局加载遮罩
     */
    hideGlobalLoading() {
      this.$loading.hide()
    },

    /**
     * 页面缓存恢复
     */
    handlePageCacheRestore() {
      const cachedData = sessionStorage.getItem('aluminum-foil-product-cache')
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
      sessionStorage.setItem('aluminum-foil-product-cache', JSON.stringify(cache))
    }
  }
}
</script>

<style lang="scss" scoped>
.aluminum-foil-product-management {
  padding: 20px;
  // 响应式设计
  @media (max-width: 768px) {
    padding: 10px;
  }
}
</style>
