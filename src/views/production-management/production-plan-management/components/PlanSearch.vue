/**
 * 文件名称：PlanSearch.vue
 * 文件描述：生产计划搜索组件 - 提供多维度筛选和模糊搜索功能
 * 创建日期：2025-01-21
 * 修改记录：
 *   - 2025-01-21: 初始创建
 *   - 2025-01-21: 修正参数映射,确保使用英文枚举值
 *
 * 功能说明：
 *   1. 关键词搜索：支持对计划编号、产品编码、客户名称的模糊搜索
 *   2. 状态筛选：按计划状态筛选(RECEIVED/CONFIRMED/RELEASED等)
 *   3. 来源筛选：按计划来源筛选(ERP/MANUAL)
 *   4. 优先级筛选：按优先级筛选(LOW/NORMAL/HIGH/URGENT)
 *   5. 日期范围：支持计划交期和创建时间的范围筛选
 *
 * 查询参数说明：
 *   - search: 模糊搜索关键词
 *   - status: 计划状态(英文枚举值)
 *   - source: 计划来源(英文枚举值)
 *   - planPriority: 计划优先级(英文枚举值)
 *   - deliveryDateRange: 计划交期范围[开始日期, 结束日期]
 *   - createdDateRange: 创建时间范围[开始日期, 结束日期]
 *
 * 注意：查询参数值必须使用英文枚举值,与接口文档保持一致
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

      // 注意：根据接口文档,查询参数应使用英文枚举值(如'RECEIVED', 'ERP'等)
      // 字典选项的value已经是英文枚举值,无需转换
      // 如果字典系统返回的是中文值,则需要反向转换为英文枚举值

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

