/**
 * 文件名称：AuditLogSearch.vue
 * 文件描述：生产计划审计日志搜索表单组件
 * 创建日期：2025-10-17
 * 修改记录：
 *   - 2025-10-17: 根据新接口文档创建，支持完整的筛选条件
 *   - 2025-10-23: 重构使用全局SearchForm组件，统一UI风格
 */

<template>
  <div class="audit-log-search">
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
import {
  AUDIT_LOG_SEARCH_FORM_CONFIG,
  AUDIT_LOG_DEFAULT_PAGINATION,
  AUDIT_LOG_DEFAULT_SORT
} from '../constants/audit-logs-config'

export default {
  name: 'AuditLogSearch',
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
        ...AUDIT_LOG_DEFAULT_PAGINATION,
        sortBy: AUDIT_LOG_DEFAULT_SORT,
        ...this.value
      }
    }
  },
  computed: {
    orderedSearchItems() {
      const primary = AUDIT_LOG_SEARCH_FORM_CONFIG.filter((item) => item.priority === 'primary')
      const advanced = AUDIT_LOG_SEARCH_FORM_CONFIG.filter((item) => item.priority === 'advanced')
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
          ...AUDIT_LOG_DEFAULT_PAGINATION,
          sortBy: AUDIT_LOG_DEFAULT_SORT,
          ...newVal
        }
      }
    }
  },
  methods: {
    /**
     * 处理搜索
     * 构建符合接口文档要求的查询参数
     */
    handleSearch(formValues) {
      const sanitized = this.normalizeQuery(formValues)
      const payload = {
        ...AUDIT_LOG_DEFAULT_PAGINATION,
        sortBy: AUDIT_LOG_DEFAULT_SORT,
        ...sanitized
      }
      this.localQuery = { ...payload }
      this.$emit('search', payload)
      this.$emit('input', { ...payload })
    },

    /**
     * 重置搜索条件
     */
    handleReset() {
      this.localQuery = {
        ...AUDIT_LOG_DEFAULT_PAGINATION,
        sortBy: AUDIT_LOG_DEFAULT_SORT
      }
      this.$emit('reset', { ...this.localQuery })
      this.$emit('input', { ...this.localQuery })
    },

    /**
     * 规范化查询参数
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
          // 特殊处理时间范围
          if (key === 'timeRange' && value.length === 2) {
            result.startTime = new Date(value[0]).toISOString()
            result.endTime = new Date(value[1]).toISOString()
          } else {
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
          result[key] = trimmed
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
.audit-log-search {
  // SearchForm组件已有内置样式，这里保持简洁
}
</style>

