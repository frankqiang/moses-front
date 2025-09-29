<!--
文件名称：TemplateSearch.vue
文件描述：工艺参数模板搜索与工具栏组件，基于SearchForm和TableToolbar全局组件
创建日期：2025-09-29
修改记录：
  - 2025-09-29: 初始创建，实现TASK003 P0阶段核心功能
  - 2025-09-29: 增加路由Query同步功能（P1阶段第8项）
-->

<template>
  <div class="template-search-container">
    <!-- 搜索表单 - 使用SearchForm全局组件配置驱动 -->
    <SearchForm
      ref="searchForm"
      :config="searchFormConfig"
      :model="searchParams"
      :loading="loading"
      @search="handleSearch"
      @reset="handleReset"
      @change="handleSearchChange"
    />

    <!-- 工具栏 - 集成TableToolbar -->
    <TableToolbar
      :loading="loading"
      :enable-refresh="true"
      :enable-export="true"
      :enable-column-settings="true"
      :enable-batch-action="false"
      @create="handleCreate"
      @refresh="handleRefresh"
      @export="handleExport"
      @column-settings="handleColumnSettings"
    >
      <!-- 自定义工具栏左侧内容 -->
      <template #left>
        <el-button
          type="primary"
          icon="el-icon-plus"
          :loading="loading"
          @click="handleCreate"
        >
          新建模板
        </el-button>
      </template>

      <!-- 自定义工具栏右侧内容 -->
      <template #right>
        <el-tooltip content="搜索条件会自动同步到URL，方便分享链接" placement="top">
          <el-button
            icon="el-icon-link"
            circle
            size="small"
            @click="copyCurrentUrl"
          />
        </el-tooltip>
      </template>
    </TableToolbar>
  </div>
</template>

<script>
import SearchForm from '@/components/SearchForm'
import TableToolbar from '@/components/TableToolbar'
import { SEARCH_FORM_CONFIG, DEFAULT_PAGINATION, DEFAULT_SORT } from '../constants'
import { fetchProductOptions } from '../api'
import { debounce } from '@/utils'

export default {
  name: 'TemplateSearch',
  components: {
    SearchForm,
    TableToolbar
  },
  props: {
    // 控制组件loading状态
    loading: {
      type: Boolean,
      default: false
    },
    // 初始搜索参数（可从父组件传入）
    initialParams: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      // 搜索表单配置（处理远程数据）
      searchFormConfig: this.processSearchFormConfig(SEARCH_FORM_CONFIG),
      // 搜索参数
      searchParams: {
        keyword: '',
        status: '',
        versionStatus: '',
        applicableProductIds: [],
        applicableAlloy: '',
        thicknessMin: null,
        thicknessMax: null,
        widthMin: null,
        widthMax: null,
        createdAtFrom: '',
        createdAtTo: '',
        updatedAtFrom: '',
        updatedAtTo: '',
        sortBy: DEFAULT_SORT,
        ...DEFAULT_PAGINATION
      }
    }
  },
  watch: {
    // 监听初始参数变化，支持父组件动态设置
    initialParams: {
      handler(newParams) {
        if (newParams && Object.keys(newParams).length > 0) {
          this.searchParams = {
            ...this.searchParams,
            ...newParams
          }
        }
      },
      immediate: true,
      deep: true
    },
    // 监听路由变化，同步搜索参数
    '$route.query': {
      handler(newQuery) {
        if (this.shouldSyncFromRoute) {
          this.syncFromRouteQuery(newQuery)
        }
      },
      immediate: true,
      deep: true
    }
  },
  created() {
    // 创建防抖搜索函数
    this.debouncedSearch = debounce(this.executeSearch, 300)

    // 标记是否应该从路由同步（避免初始化时的循环）
    this.shouldSyncFromRoute = false

    // 在下一个tick后启用路由同步
    this.$nextTick(() => {
      this.shouldSyncFromRoute = true
    })
  },
  methods: {
    /**
     * 处理搜索表单配置，注入远程数据处理方法
     */
    processSearchFormConfig(config) {
      return config.map(item => {
        if (item.type === 'remote-select' && item.remoteConfig?.action === 'fetchProductOptions') {
          return {
            ...item,
            remoteMethod: this.fetchProductOptions
          }
        }
        return item
      })
    },

    /**
     * 获取适用产品选项（远程数据）
     */
    async fetchProductOptions(keyword = '') {
      try {
        const response = await fetchProductOptions({ keyword, limit: 50 })
        return response.data.options.map(product => ({
          value: product.id,
          label: `${product.productCode} - ${product.productName}`,
          disabled: product.lifecycleStatus !== '在产'
        }))
      } catch (error) {
        console.error('获取产品选项失败:', error)
        this.$message.warning('获取产品选项失败，请稍后重试')
        return []
      }
    },

    /**
     * 处理搜索操作
     * 去除空格、格式化参数、触发父组件回调
     */
    handleSearch() {
      const formattedParams = this.formatSearchParams(this.searchParams)
      this.executeSearch(formattedParams)
    },

    /**
     * 处理重置操作
     * 恢复默认分页与排序
     */
    handleReset() {
      this.searchParams = {
        keyword: '',
        status: '',
        versionStatus: '',
        applicableProductIds: [],
        applicableAlloy: '',
        thicknessMin: null,
        thicknessMax: null,
        widthMin: null,
        widthMax: null,
        createdAtFrom: '',
        createdAtTo: '',
        updatedAtFrom: '',
        updatedAtTo: '',
        sortBy: DEFAULT_SORT,
        ...DEFAULT_PAGINATION
      }

      // 立即执行搜索
      this.handleSearch()
    },

    /**
     * 处理搜索条件变化
     * 用于实时搜索或表单验证
     */
    handleSearchChange(field, value) {
      this.searchParams[field] = value

      // 对于某些字段进行实时搜索（如状态选择）
      if (['status', 'versionStatus', 'sortBy'].includes(field)) {
        this.debouncedSearch(this.formatSearchParams(this.searchParams))
      }
    },

    /**
     * 执行搜索（内部方法）
     * 发送格式化后的参数给父组件
     */
    executeSearch(params) {
      // 同步到路由Query
      this.syncToRouteQuery(params)

      // 触发父组件搜索
      this.$emit('search', params)
    },

    /**
     * 格式化搜索参数
     * 空值过滤、范围拆分、字符串去空格
     */
    formatSearchParams(rawParams) {
      const params = { ...rawParams }

      // 去除字符串字段的多余空格
      if (params.keyword) {
        params.keyword = params.keyword.trim()
      }
      if (params.applicableAlloy) {
        params.applicableAlloy = params.applicableAlloy.trim().toUpperCase()
      }

      // 移除空值字段（但保留数组、数字0等有效值）
      const cleanedParams = {}
      Object.keys(params).forEach(key => {
        const value = params[key]
        if (value !== null && value !== undefined && value !== '') {
          // 数组类型：保留非空数组
          if (Array.isArray(value)) {
            if (value.length > 0) {
              cleanedParams[key] = value
            }
          } else {
            cleanedParams[key] = value
          }
        }
      })

      return cleanedParams
    },

    /**
     * 将搜索条件同步到路由Query（P1阶段第8项功能）
     */
    syncToRouteQuery(params) {
      if (!this.shouldSyncFromRoute) return

      // 准备路由Query，排除分页信息（由列表组件管理）
      const query = { ...params }
      delete query.page
      delete query.limit

      // 处理数组字段为字符串
      if (query.applicableProductIds && Array.isArray(query.applicableProductIds)) {
        query.applicableProductIds = query.applicableProductIds.join(',')
      }

      // 避免循环更新
      const currentQuery = JSON.stringify(this.$route.query)
      const newQuery = JSON.stringify(query)

      if (currentQuery !== newQuery) {
        this.$router.replace({
          path: this.$route.path,
          query: Object.keys(query).length > 0 ? query : undefined
        }).catch(() => {
          // 忽略导航重复错误
        })
      }
    },

    /**
     * 从路由Query同步搜索条件
     */
    syncFromRouteQuery(query) {
      if (!query || Object.keys(query).length === 0) return

      const syncedParams = { ...this.searchParams }

      // 同步字符串字段
      const stringFields = [
        'keyword', 'status', 'versionStatus', 'applicableAlloy',
        'createdAtFrom', 'createdAtTo', 'updatedAtFrom', 'updatedAtTo', 'sortBy'
      ]
      stringFields.forEach(field => {
        if (query[field]) {
          syncedParams[field] = query[field]
        }
      })

      // 同步数值字段
      const numberFields = ['thicknessMin', 'thicknessMax', 'widthMin', 'widthMax']
      numberFields.forEach(field => {
        if (query[field]) {
          const numValue = parseFloat(query[field])
          if (!isNaN(numValue)) {
            syncedParams[field] = numValue
          }
        }
      })

      // 同步数组字段
      if (query.applicableProductIds) {
        syncedParams.applicableProductIds = query.applicableProductIds.split(',').filter(id => id.trim())
      }

      this.searchParams = syncedParams
    },

    /**
     * 复制当前页面URL到剪贴板
     */
    async copyCurrentUrl() {
      try {
        const url = window.location.href
        await navigator.clipboard.writeText(url)
        this.$message.success('链接已复制到剪贴板，可以分享给其他人')
      } catch (error) {
        // 降级处理：手动选择
        const input = document.createElement('input')
        input.value = window.location.href
        document.body.appendChild(input)
        input.select()
        document.execCommand('copy')
        document.body.removeChild(input)
        this.$message.success('链接已复制到剪贴板')
      }
    },

    /**
     * 处理刷新操作
     */
    handleRefresh() {
      this.$emit('refresh')
    },

    /**
     * 处理创建操作
     */
    handleCreate() {
      this.$emit('create')
    },

    /**
     * 处理导出操作
     */
    handleExport() {
      // 传递当前搜索条件用于导出
      const exportParams = this.formatSearchParams(this.searchParams)
      this.$emit('export', exportParams)
    },

    /**
     * 处理列设置操作
     */
    handleColumnSettings() {
      this.$emit('column-settings')
    },

    /**
     * 获取当前搜索参数（供父组件调用）
     */
    getCurrentParams() {
      return this.formatSearchParams(this.searchParams)
    },

    /**
     * 重置搜索参数（供父组件调用）
     */
    resetParams() {
      this.handleReset()
    }
  }
}
</script>

<style lang="scss" scoped>
.template-search-container {
  margin-bottom: 16px;

  // 确保搜索表单与工具栏的间距
  .search-form + .table-toolbar {
    margin-top: 16px;
  }
}

// 响应式调整
@media (max-width: 768px) {
  .template-search-container {
    margin-bottom: 12px;

    .search-form + .table-toolbar {
      margin-top: 12px;
    }
  }
}
</style>
