<!--
文件名称：TemplateSearch.vue
文件描述：工艺参数模板搜索与工具栏组件，基于SearchForm和TableToolbar全局组件
创建日期：2025-09-29
修改记录：
  - 2025-09-29: 初始创建，实现TASK003 P0阶段核心功能
  - 2025-09-29: 增加路由Query同步功能（P1阶段第8项）
  - 2025-10-09: 修复搜索参数传递问题，添加@input事件监听同步SearchForm的数据
-->

<template>
  <div class="template-search-container">
    <!-- 搜索表单 - 使用SearchForm全局组件配置驱动 -->
    <SearchForm
      ref="searchForm"
      :items="searchFormConfig"
      :value="searchParams"
      :loading="loading"
      @input="handleFormInput"
      @search="handleSearch"
      @reset="handleReset"
    />
  </div>
</template>

<script>
import SearchForm from '@/components/SearchForm'
import { SEARCH_FORM_CONFIG, DEFAULT_PAGINATION, DEFAULT_SORT } from '../constants'
import { fetchProductOptions } from '../api'

export default {
  name: 'TemplateSearch',
  components: {
    SearchForm
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
      // 搜索表单配置（深拷贝以便动态修改options）
      searchFormConfig: JSON.parse(JSON.stringify(SEARCH_FORM_CONFIG)),
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
      },
      // 产品选项列表
      productOptions: []
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
  async created() {
    // 标记是否应该从路由同步（避免初始化时的循环）
    this.shouldSyncFromRoute = false

    // 加载产品选项
    await this.loadProductOptions()

    // 在下一个tick后启用路由同步
    this.$nextTick(() => {
      this.shouldSyncFromRoute = true
    })
  },
  methods: {
    /**
     * 加载产品选项列表
     */
    async loadProductOptions() {
      try {
        const response = await fetchProductOptions({ keyword: '', limit: 100 })
        this.productOptions = response.data.options.map(product => ({
          value: product.id,
          label: `${product.productCode} - ${product.productName}`,
          disabled: product.lifecycleStatus !== '量产'
        }))

        // 更新searchFormConfig中的产品选项
        const productField = this.searchFormConfig.find(item => item.prop === 'applicableProductIds')
        if (productField) {
          productField.options = this.productOptions
        }
      } catch (error) {
        console.error('加载产品选项失败:', error)
        this.$message.warning('加载产品选项失败，请稍后重试')
      }
    },

    /**
     * 处理SearchForm的input事件 - 同步表单数据
     * SearchForm组件会通过@input事件将内部表单数据同步到父组件
     */
    handleFormInput(formData) {
      // 同步SearchForm的内部数据到searchParams
      this.searchParams = {
        ...this.searchParams,
        ...formData
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
