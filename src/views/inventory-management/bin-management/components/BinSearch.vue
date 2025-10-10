/**
 * 文件名称：BinSearch.vue
 * 文件描述：料框搜索组件，基于全局SearchForm实现筛选功能
 * 创建日期：2025-01-10
 * 修改记录：
 *   - 2025-01-10: 初始创建，实现料框搜索功能
 */
<template>
  <div class="bin-search">
    <SearchForm
      :items="orderedSearchItems"
      :loading="loading"
      :visible-item-count="primaryFieldCount"
      :value="localQuery"
      @search="handleSearch"
      @reset="handleReset"
    />
  </div>
</template>

<script>
import SearchForm from '@/components/SearchForm'
import { BIN_SEARCH_FORM_CONFIG } from '../constants/form-config'
import { DEFAULT_PAGINATION, DEFAULT_SORT } from '../constants'
import { debounce } from '@/utils'

export default {
  name: 'BinSearch',
  components: {
    SearchForm
  },
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    value: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      localQuery: {
        ...DEFAULT_PAGINATION,
        sortBy: DEFAULT_SORT,
        ...this.value
      },
      binSpecificationOptions: [] // P1: 料框规格选项
    }
  },
  computed: {
    orderedSearchItems() {
      // 根据优先级排序搜索项，primary在前，advanced在后
      const primary = BIN_SEARCH_FORM_CONFIG.filter((item) => item.priority === 'primary')
      const advanced = BIN_SEARCH_FORM_CONFIG.filter((item) => item.priority === 'advanced')

      // P1: 动态更新料框规格选项
      const items = [...primary, ...advanced]
      const binSpecItem = items.find(item => item.prop === 'binSpecificationId')
      if (binSpecItem) {
        binSpecItem.options = this.binSpecificationOptions
      }

      return items
    },
    primaryFieldCount() {
      // 计算primary优先级的字段数量，用于控制折叠展开
      const primaryCount = this.orderedSearchItems.filter((item) => item.priority === 'primary').length
      return Math.max(primaryCount, 1)
    }
  },
  watch: {
    value: {
      deep: true,
      handler(newVal) {
        this.localQuery = {
          ...DEFAULT_PAGINATION,
          sortBy: DEFAULT_SORT,
          ...newVal
        }
      }
    }
  },
  mounted() {
    // P1: 加载料框规格选项
    this.loadBinSpecifications()
  },
  methods: {
    /**
     * 处理搜索事件（防抖300ms）
     * @param {Object} formValues - 表单值
     */
    handleSearch: debounce(function(formValues) {
      const sanitized = this.normalizeQuery(formValues)
      const payload = {
        ...DEFAULT_PAGINATION,
        sortBy: DEFAULT_SORT,
        ...sanitized
      }
      this.localQuery = { ...payload }
      this.$emit('search', payload)
      this.$emit('input', { ...payload })
    }, 300),

    /**
     * 处理重置事件
     */
    handleReset() {
      this.localQuery = {
        ...DEFAULT_PAGINATION,
        sortBy: DEFAULT_SORT
      }
      this.$emit('reset', { ...this.localQuery })
      this.$emit('input', { ...this.localQuery })
    },

    /**
     * 规范化查询参数
     * @param {Object} values - 原始表单值
     * @returns {Object} - 规范化后的查询参数
     */
    normalizeQuery(values = {}) {
      const result = {}

      // 处理每个字段
      Object.keys(values).forEach((key) => {
        const value = values[key]

        // 跳过空值
        if (value === undefined || value === null || value === '') {
          return
        }

        // 处理时间范围字段
        if (key === 'registeredAtRange') {
          if (Array.isArray(value) && value.length === 2) {
            // 转换为ISO 8601格式
            result.registeredAtStart = new Date(value[0]).toISOString()
            result.registeredAtEnd = new Date(value[1]).toISOString()
          }
          return
        }

        // 处理字符串字段
        if (typeof value === 'string') {
          const trimmed = value.trim()
          if (!trimmed) {
            return
          }
          result[key] = trimmed
          return
        }

        // 其他字段直接赋值
        result[key] = value
      })

      return result
    },

    /**
     * P1: 加载料框规格选项
     */
    async loadBinSpecifications() {
      try {
        // 调用主数据模块的料框规格接口，只获取启用状态的规格
        const { fetchBinSpecificationList } = await import('@/views/master-data/bin-management/api/bin-specification')
        const response = await fetchBinSpecificationList({
          status: '启用',
          limit: 100 // 获取前100个启用的规格
        })

        if (response && response.data && response.data.results) {
          this.binSpecificationOptions = response.data.results.map(item => ({
            value: item.id,
            label: `${item.specCode} - ${item.specName}`
          }))
        }
      } catch (error) {
        console.error('加载料框规格选项失败:', error)
        this.binSpecificationOptions = []
      }
    }
  }
}
</script>

<style scoped>
.bin-search {
  /* 使用全局SearchForm组件，无需额外样式 */
}
</style>

