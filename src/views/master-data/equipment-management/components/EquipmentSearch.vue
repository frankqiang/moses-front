/**
 * 文件名称：EquipmentSearch.vue
 * 文件描述：设备主数据管理模块搜索组件，基于全局 SearchForm 实现筛选功能
 * 创建日期：2025-09-29
 * 修改记录：
 *   - 2025-09-29: 初始创建，完成 TASK003 P0 与 P1 #8、#10 要求
 */

<template>
  <div class="equipment-search">
    <SearchForm
      ref="searchFormRef"
      :items="orderedSearchItems"
      :value="localQuery"
      :loading="loading"
      :visible-item-count="primaryFieldCount"
      :debounce-time="500"
      @search="handleSearch"
      @reset="handleReset"
    />
  </div>
</template>

<script>
import SearchForm from '@/components/SearchForm'
import {
  SEARCH_FORM_CONFIG,
  DEFAULT_PAGINATION,
  DEFAULT_SORT,
  SORTABLE_FIELDS
} from '../constants'

const PRIMARY_PRIORITY = 'primary'
const ADVANCED_PRIORITY = 'advanced'

/**
 * 需要自动去除首尾空格的字符串字段
 */
const TRIMMED_STRING_FIELDS = [
  'equipmentCode',
  'name',
  'communicationEndpoint',
  'search'
]

export default {
  name: 'EquipmentSearch',
  components: {
    SearchForm
  },
  props: {
    value: {
      type: Object,
      default: () => ({})
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      localQuery: {
        ...DEFAULT_PAGINATION,
        sortBy: DEFAULT_SORT,
        includeDetails: true,
        ...this.value
      }
    }
  },
  computed: {
    orderedSearchItems() {
      // 仅为少数关键字段开启改动即搜，其他字段需点击“查询”
      const allowInstant = ['equipmentCode', 'status']
      const withSearchOnChange = SEARCH_FORM_CONFIG.map(item => ({
        ...item,
        searchOnChange: allowInstant.includes(item.prop)
      }))

      const primaryFields = withSearchOnChange.filter((item) => item.priority === PRIMARY_PRIORITY)
      const advancedFields = withSearchOnChange.filter((item) => item.priority === ADVANCED_PRIORITY)
      return [...primaryFields, ...advancedFields]
    },
    primaryFieldCount() {
      const count = this.orderedSearchItems.filter((item) => item.priority === PRIMARY_PRIORITY).length
      return Math.max(count, 1)
    }
  },
  watch: {
    value: {
      deep: true,
      handler(newValue) {
        this.localQuery = {
          ...DEFAULT_PAGINATION,
          sortBy: DEFAULT_SORT,
          includeDetails: true,
          ...newValue
        }
      }
    }
  },
  methods: {
    handleSearch(formValues) {
      const normalized = this.normalizeQuery(formValues)
      const payload = {
        ...DEFAULT_PAGINATION,
        sortBy: DEFAULT_SORT,
        includeDetails: true,
        ...normalized
      }

      this.localQuery = { ...payload }
      this.$emit('search', payload)
      this.$emit('input', { ...payload })
    },
    handleReset() {
      const defaultQuery = {
        ...DEFAULT_PAGINATION,
        sortBy: DEFAULT_SORT,
        includeDetails: true
      }

      this.localQuery = { ...defaultQuery }
      this.$emit('reset', { ...defaultQuery })
      this.$emit('input', { ...defaultQuery })

      // 重置后触发一次默认查询
      this.$nextTick(() => {
        this.$refs.searchFormRef?.submit()
      })
    },
    normalizeQuery(values = {}) {
      const sanitized = {}

      Object.keys(values).forEach((key) => {
        const currentValue = values[key]

        if (currentValue === undefined || currentValue === null || currentValue === '') {
          return
        }

        if (Array.isArray(currentValue)) {
          this.extractDateRange(key, currentValue, sanitized)
          return
        }

        if (typeof currentValue === 'string') {
          const trimmed = TRIMMED_STRING_FIELDS.includes(key) ? currentValue.trim() : currentValue
          if (!trimmed) {
            return
          }
          sanitized[key] = trimmed
          return
        }

        sanitized[key] = currentValue
      })

      this.ensureIncludeDetailsConsistency(sanitized)
      this.validateSortField(sanitized)

      return sanitized
    },
    extractDateRange(field, value, result) {
      const targetItem = SEARCH_FORM_CONFIG.find((item) => item.prop === field)
      if (!targetItem || targetItem.type !== 'daterange') {
        return
      }

      const [startValue, endValue] = value
      if (startValue) {
        result[targetItem.startProp] = startValue
      }
      if (endValue) {
        result[targetItem.endProp] = endValue
      }
    },
    ensureIncludeDetailsConsistency(payload) {
      if (payload.includeDetails === undefined) {
        payload.includeDetails = true
      }

      if (typeof payload.includeDetails === 'boolean') {
        payload.includeDetails = payload.includeDetails.toString()
      }
    },
    validateSortField(payload) {
      if (!payload.sortBy) {
        return
      }

      const [field, direction] = payload.sortBy.split(':')
      const normalizedDirection = direction?.toLowerCase()

      if (!SORTABLE_FIELDS.includes(field) || (normalizedDirection && !['asc', 'desc'].includes(normalizedDirection))) {
        payload.sortBy = DEFAULT_SORT
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.equipment-search {
  padding: 0 20px;
  .search-form-container {
    box-shadow: none;
    border-radius: 8px;
  }
}
</style>
