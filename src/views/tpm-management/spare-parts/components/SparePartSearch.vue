/**
 * 文件名称：SparePartSearch.vue
 * 文件描述：备件搜索组件，基于全局SearchForm实现筛选功能
 * 创建日期：2025-01-21
 * 修改记录：
 *   - 2025-01-21: 初始创建，实现核心搜索与高级筛选折叠
 */
<template>
  <div class="spare-part-search">
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
import { SEARCH_FORM_CONFIG } from '../constants/form-config'
import { DEFAULT_PAGINATION, DEFAULT_SORT } from '../constants/spare-part-management'

export default {
  name: 'SparePartSearch',
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
      }
    }
  },
  computed: {
    orderedSearchItems() {
      const primary = SEARCH_FORM_CONFIG.filter((item) => item.priority === 'primary')
      const advanced = SEARCH_FORM_CONFIG.filter((item) => item.priority === 'advanced')
      return [...primary, ...advanced]
    },
    primaryFieldCount() {
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
  methods: {
    handleSearch(formValues) {
      const sanitized = this.normalizeQuery(formValues)
      const payload = {
        ...DEFAULT_PAGINATION,
        sortBy: DEFAULT_SORT,
        ...sanitized
      }
      this.localQuery = { ...payload }
      this.$emit('search', payload)
      this.$emit('input', { ...payload })
    },
    handleReset() {
      this.localQuery = {
        ...DEFAULT_PAGINATION,
        sortBy: DEFAULT_SORT
      }
      this.$emit('reset', { ...this.localQuery })
      this.$emit('input', { ...this.localQuery })
    },
    normalizeQuery(values = {}) {
      const result = {}
      Object.keys(values).forEach((key) => {
        const value = values[key]
        if (value === undefined || value === null || value === '') {
          return
        }
        if (typeof value === 'string') {
          const trimmed = value.trim()
          if (!trimmed) {
            return
          }
          result[key] = trimmed
          return
        }
        result[key] = value
      })

      return result
    }
  }
}
</script>

<style lang="scss" scoped>
.spare-part-search {
  margin-bottom: 12px;
}
</style>

