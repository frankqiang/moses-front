/**
 * 文件名称：PlanSearch.vue
 * 文件描述：生产计划搜索组件
 * 创建日期：2025-01-21
 * 修改记录：
 *   - 2025-01-21: 初始创建
 */
<template>
  <div class="plan-search">
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
import dictionaryMixin from '../mixins/dictionary'
import {
  DEFAULT_PAGINATION,
  DEFAULT_SORT
} from '../constants/production-plan-management'

export default {
  name: 'PlanSearch',
  components: {
    SearchForm
  },
  mixins: [dictionaryMixin],
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
     * 动态生成搜索表单配置（使用字典系统）
     */
    searchFormConfig() {
      return [
        {
          prop: 'search',
          label: '关键词',
          type: 'input',
          placeholder: '计划编号、产品编码、客户名称',
          priority: 'primary',
          clearable: true
        },
        {
          prop: 'status',
          label: '状态',
          type: 'select',
          placeholder: '请选择计划状态',
          options: this.planStatusOptions, // 使用字典
          priority: 'primary',
          clearable: true
        },
        {
          prop: 'source',
          label: '来源',
          type: 'select',
          placeholder: '请选择计划来源',
          options: this.planSourceOptions, // 使用字典
          priority: 'advanced',
          clearable: true
        },
        {
          prop: 'planPriority',
          label: '优先级',
          type: 'select',
          placeholder: '请选择计划优先级',
          options: this.planPriorityOptions, // 使用字典
          priority: 'advanced',
          clearable: true
        },
        {
          prop: 'productCode',
          label: '产品编码',
          type: 'input',
          placeholder: '请输入产品编码',
          priority: 'advanced',
          clearable: true
        },
        {
          prop: 'planNumber',
          label: '计划编号',
          type: 'input',
          placeholder: '请输入计划编号',
          priority: 'advanced',
          clearable: true
        },
        {
          prop: 'externalOrderNumber',
          label: '外部订单号',
          type: 'input',
          placeholder: '请输入外部订单号',
          priority: 'advanced',
          clearable: true
        },
        {
          prop: 'deliveryDateRange',
          label: '计划交期',
          type: 'daterange',
          placeholder: ['开始日期', '结束日期'],
          priority: 'advanced',
          clearable: true,
          format: 'yyyy-MM-dd',
          valueFormat: 'yyyy-MM-dd'
        },
        {
          prop: 'createdDateRange',
          label: '创建时间',
          type: 'daterange',
          placeholder: ['开始日期', '结束日期'],
          priority: 'advanced',
          clearable: true,
          format: 'yyyy-MM-dd',
          valueFormat: 'yyyy-MM-dd'
        }
      ]
    },
    orderedSearchItems() {
      const primary = this.searchFormConfig.filter((item) => item.priority === 'primary')
      const advanced = this.searchFormConfig.filter((item) => item.priority === 'advanced')
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
        if (Array.isArray(value)) {
          // 保留日期范围数组
          if (value.length > 0 && value[0] !== null && value[0] !== '') {
            result[key] = value
          }
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

<style scoped lang="scss">
.plan-search {
  margin-bottom: 16px;
}
</style>

