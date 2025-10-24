/**
 * 文件名称：FaultSearch.vue
 * 文件描述：设备故障搜索组件，基于全局SearchForm实现筛选功能
 * 创建日期：2025-01-20
 * 修改记录：
 *   - 2025-01-20: 初始创建，实现核心搜索与高级筛选折叠
 */
<template>
  <div class="fault-search">
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
          width="320"
          popper-class="filter-tooltip"
        >
          <div class="tooltip-content">
            <div class="tooltip-title">故障等级说明</div>
            <div class="status-tags">
              <StatusTag
                :status="FAILURE_LEVEL.CRITICAL"
                :text-map="failureLevelConfig.textMap"
                :type-map="failureLevelConfig.typeMap"
                size="small"
              />
              <StatusTag
                :status="FAILURE_LEVEL.MAJOR"
                :text-map="failureLevelConfig.textMap"
                :type-map="failureLevelConfig.typeMap"
                size="small"
              />
              <StatusTag
                :status="FAILURE_LEVEL.NORMAL"
                :text-map="failureLevelConfig.textMap"
                :type-map="failureLevelConfig.typeMap"
                size="small"
              />
              <StatusTag
                :status="FAILURE_LEVEL.MINOR"
                :text-map="failureLevelConfig.textMap"
                :type-map="failureLevelConfig.typeMap"
                size="small"
              />
            </div>
            <ul>
              <li>I级-严重：设备完全停机，严重影响生产，需立即处理</li>
              <li>II级-重大：设备功能受损，显著影响生产效率</li>
              <li>III级-一般：设备部分功能异常，对生产有一定影响</li>
              <li>IV级-轻微：设备轻微异常，基本不影响生产</li>
            </ul>
          </div>
          <el-button slot="reference" type="text" class="status-info">等级说明</el-button>
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
  FAILURE_LEVEL,
  FAILURE_LEVEL_CONFIG
} from '../constants'

export default {
  name: 'FaultSearch',
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
    },
    equipmentOptions: {
      type: Array,
      default: () => []
    },
    userOptions: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      localQuery: {
        ...DEFAULT_PAGINATION,
        sortBy: DEFAULT_SORT,
        ...this.value
      },
      FAILURE_LEVEL
    }
  },
  computed: {
    orderedSearchItems() {
      const items = SEARCH_FORM_CONFIG.map((item) => {
        if (item.prop === 'equipmentId') {
          return {
            ...item,
            options: this.equipmentOptions
          }
        }
        if (item.prop === 'reporterId' || item.prop === 'repairerId') {
          return {
            ...item,
            options: this.userOptions
          }
        }
        return item
      })

      const primary = items.filter((item) => item.priority === 'primary')
      const advanced = items.filter((item) => item.priority === 'advanced')
      return [...primary, ...advanced]
    },
    primaryFieldCount() {
      const primaryCount = this.orderedSearchItems.filter((item) => item.priority === 'primary').length
      return Math.max(primaryCount, 1)
    },
    failureLevelConfig() {
      return FAILURE_LEVEL_CONFIG
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

        if (key === 'status' && Array.isArray(value) && value.length > 0) {
          result[key] = value.join(',')
          return
        }

        if (key === 'dateRange' && Array.isArray(value) && value.length === 2) {
          result.startDate = value[0]
          result.endDate = value[1]
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
.fault-search {
  ::v-deep .tooltip-content {
    .tooltip-title {
      font-weight: 600;
      margin-bottom: 12px;
      color: #303133;
    }

    .status-tags {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
      flex-wrap: wrap;
    }

    ul {
      margin: 0;
      padding-left: 20px;
      line-height: 1.8;
      color: #606266;

      li {
        margin-bottom: 4px;
      }
    }
  }

  .status-info {
    font-size: 12px;
    padding: 4px 8px;
  }
}
</style>

