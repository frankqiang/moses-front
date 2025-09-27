/**
 * 文件名称：ProductSearch.vue
 * 文件描述：铝箔产品搜索组件，基于全局SearchForm实现筛选功能
 * 创建日期：2025-09-26
 * 修改记录：
 *   - 2025-09-26: 初始创建，实现核心搜索与高级筛选折叠
 */
<template>
  <div class="product-search">
    <SearchForm
      :items="orderedSearchItems"
      :loading="loading"
      :visible-item-count="primaryFieldCount"
      :value="localQuery"
      @search="handleSearch"
      @reset="handleReset"
    >
      <template #buttons>
        <el-popover
          placement="bottom"
          trigger="hover"
          width="280"
          popper-class="filter-tooltip"
        >
          <div class="tooltip-content">
            <div class="tooltip-title">生命周期状态说明</div>
            <div class="status-tags">
              <StatusTag :status="LIFECYCLE_STATUS.TRIAL" :text-map="lifecycleStatusConfig.textMap" :type-map="lifecycleStatusConfig.typeMap" />
              <StatusTag :status="LIFECYCLE_STATUS.MASS" :text-map="lifecycleStatusConfig.textMap" :type-map="lifecycleStatusConfig.typeMap" />
              <StatusTag :status="LIFECYCLE_STATUS.RETIRED" :text-map="lifecycleStatusConfig.textMap" :type-map="lifecycleStatusConfig.typeMap" />
            </div>
            <ul>
              <li>试产：用于验证新产品能力，需密切关注质量指标。</li>
              <li>量产：可直接投入生产计划，是默认主查询状态。</li>
              <li>停产：仅保留历史数据，供追溯和分析使用。</li>
            </ul>
          </div>
          <el-button slot="reference" type="text" class="status-info">状态说明</el-button>
        </el-popover>
      </template>
    </SearchForm>
  </div>
</template>

<script>
import SearchForm from '@/components/SearchForm'
import StatusTag from '@/components/StatusTag'
import { SEARCH_FORM_CONFIG } from '../constants/form-config'
import {
  DEFAULT_PAGINATION,
  DEFAULT_SORT,
  SPEC_RANGE_FIELDS,
  LIFECYCLE_STATUS_CONFIG,
  LIFECYCLE_STATUS
} from '../constants/aluminum-foil-product-management'

const ADVANCED_FIELDS = [
  'temper',
  'lifecycleStatus',
  'thicknessMin',
  'thicknessMax',
  'widthMin',
  'widthMax',
  'search'
]

export default {
  name: 'ProductSearch',
  components: {
    SearchForm,
    StatusTag
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
    },
    lifecycleStatusConfig() {
      return LIFECYCLE_STATUS_CONFIG
    },
    LIFECYCLE_STATUS() {
      return LIFECYCLE_STATUS
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
          if (ADVANCED_FIELDS.includes(key)) {
            return
          }
          result[key] = value
          return
        }
        if (typeof value === 'string') {
          const trimmed = value.trim()
          if (!trimmed) {
            return
          }
          result[key] = key === 'alloyGrade' || key === 'temper' ? trimmed.toUpperCase() : trimmed
          return
        }
        result[key] = value
      })

      if (values.thicknessMin !== undefined || values.thicknessMax !== undefined) {
        const thicknessRange = this.extractRange(values.thicknessMin, values.thicknessMax, 'thickness')
        Object.assign(result, thicknessRange)
      }
      if (values.widthMin !== undefined || values.widthMax !== undefined) {
        const widthRange = this.extractRange(values.widthMin, values.widthMax, 'width')
        Object.assign(result, widthRange)
      }

      return result
    },
    extractRange(minValue, maxValue, field) {
      const rangeResult = {}
      const minKey = `${field}Min`
      const maxKey = `${field}Max`
      const minValid = this.isValidNumber(minValue, minKey)
      const maxValid = this.isValidNumber(maxValue, maxKey)

      if (minValid) {
        rangeResult[minKey] = Number(minValue)
      }
      if (maxValid) {
        rangeResult[maxKey] = Number(maxValue)
      }

      if (minValid && maxValid && Number(minValue) > Number(maxValue)) {
        const message = '最小值不能大于最大值'
        this.$emit('validation-error', {
          field,
          message
        })
        if (this.$message) {
          this.$message.warning(message)
        }
        delete rangeResult[minKey]
        delete rangeResult[maxKey]
      }

      return rangeResult
    },
    isValidNumber(value, field) {
      if (value === undefined || value === null || value === '') {
        return false
      }
      const numberValue = Number(value)
      if (Number.isNaN(numberValue)) {
        const message = '请输入有效数字'
        this.$emit('validation-error', {
          field,
          message
        })
        if (this.$message) {
          this.$message.warning(message)
        }
        return false
      }
      const rangeField = field.replace(/(Min|Max)$/u, '').toLowerCase()
      if (SPEC_RANGE_FIELDS[rangeField]) {
        return numberValue >= 0
      }
      return true
    }
  }
}
</script>

<style scoped>
.status-tags {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.status-tags .el-tag {
  margin: 0;
}
</style>

