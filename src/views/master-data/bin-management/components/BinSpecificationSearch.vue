/**
 * 文件名称：BinSpecificationSearch.vue
 * 文件描述：料框规格搜索组件，基于全局SearchForm实现筛选功能
 * 创建日期：2025-01-09
 * 修改记录：
 *   - 2025-01-09: 初始创建，实现P0阶段核心搜索功能
 */
<template>
  <div class="bin-specification-search">
    <search-form
      :items="searchFormItems"
      :loading="loading"
      :visible-item-count="visibleItemCount"
      :value="localQuery"
      :debounce-time="300"
      @search="handleSearch"
      @reset="handleReset"
    />
  </div>
</template>

<script>
import SearchForm from '@/components/SearchForm'
import { SEARCH_FORM_CONFIG } from '../constants/form-config'
import {
  DEFAULT_PAGINATION,
  DEFAULT_SORT
} from '../constants/bin-specification'

export default {
  name: 'BinSpecificationSearch',
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
    /**
     * 搜索表单配置项
     * @returns {Array} 表单配置数组
     */
    searchFormItems() {
      return SEARCH_FORM_CONFIG
    },
    /**
     * 可见表单项数量（P0阶段全部显示，不折叠）
     * @returns {number} 可见项数量
     */
    visibleItemCount() {
      return SEARCH_FORM_CONFIG.length
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
    /**
     * 处理搜索事件
     * @param {Object} formValues - 表单值
     */
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
     * 标准化查询参数
     * @param {Object} values - 原始表单值
     * @returns {Object} 标准化后的查询参数
     */
    normalizeQuery(values = {}) {
      const result = {}
      Object.keys(values).forEach((key) => {
        const value = values[key]
        // 过滤空值
        if (value === undefined || value === null || value === '') {
          return
        }
        // 处理数组
        if (Array.isArray(value)) {
          if (value.length > 0) {
            result[key] = value
          }
          return
        }
        // 处理字符串
        if (typeof value === 'string') {
          const trimmed = value.trim()
          if (!trimmed) {
            return
          }
          // 规格代码自动转为大写
          result[key] = key === 'specCode' ? trimmed.toUpperCase() : trimmed
          return
        }
        // 其他类型直接赋值
        result[key] = value
      })
      return result
    }
  }
}
</script>

<style lang="scss" scoped>
.bin-specification-search {
  margin-bottom: 16px;
}
</style>

