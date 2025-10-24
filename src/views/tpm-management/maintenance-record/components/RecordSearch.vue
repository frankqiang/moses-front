/**
 * 文件名称：RecordSearch.vue
 * 文件描述：维护记录搜索组件，基于全局SearchForm实现筛选功能
 * 创建日期：2025-01-20
 * 修改记录：
 *   - 2025-01-20: 初始创建，实现核心搜索与高级筛选折叠
 */
<template>
  <div class="record-search">
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
            <div class="tooltip-title">维护类型说明</div>
            <div class="status-tags">
              <StatusTag
                :status="MAINTENANCE_TYPE.DAILY"
                :text-map="maintenanceTypeConfig.textMap"
                :type-map="maintenanceTypeConfig.typeMap"
                size="small"
                effect="light"
              />
              <StatusTag
                :status="MAINTENANCE_TYPE.PERIODIC"
                :text-map="maintenanceTypeConfig.textMap"
                :type-map="maintenanceTypeConfig.typeMap"
                size="small"
                effect="light"
              />
              <StatusTag
                :status="MAINTENANCE_TYPE.OVERHAUL"
                :text-map="maintenanceTypeConfig.textMap"
                :type-map="maintenanceTypeConfig.typeMap"
                size="small"
                effect="light"
              />
              <StatusTag
                :status="MAINTENANCE_TYPE.SPECIAL"
                :text-map="maintenanceTypeConfig.textMap"
                :type-map="maintenanceTypeConfig.typeMap"
                size="small"
                effect="light"
              />
            </div>
            <ul>
              <li>日常保养：设备的日常例行保养。</li>
              <li>定期检查：按周期进行的设备状态检查。</li>
              <li>大修：设备的全面检修和零部件更换。</li>
              <li>专项维护：针对特定问题的专项维护任务。</li>
            </ul>
          </div>
          <el-button slot="reference" type="text" class="type-info">类型说明</el-button>
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
  MAINTENANCE_TYPE_CONFIG,
  MAINTENANCE_TYPE
} from '../constants/maintenance-record'

export default {
  name: 'RecordSearch',
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
    maintenanceTypeConfig() {
      return MAINTENANCE_TYPE_CONFIG
    },
    MAINTENANCE_TYPE() {
      return MAINTENANCE_TYPE
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

      // 时间范围处理
      if (values.startDate) {
        result.startDate = this.formatDateTime(values.startDate)
      }
      if (values.endDate) {
        result.endDate = this.formatDateTime(values.endDate)
      }

      return result
    },
    /**
     * 格式化日期时间为ISO 8601格式
     */
    formatDateTime(dateValue) {
      if (!dateValue) {
        return null
      }
      try {
        const date = new Date(dateValue)
        if (Number.isNaN(date.getTime())) {
          return null
        }
        return date.toISOString()
      } catch (error) {
        console.warn('格式化日期时间失败:', dateValue, error)
        return null
      }
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

.tooltip-content {
  line-height: 1.6;
}

.tooltip-title {
  font-weight: bold;
  margin-bottom: 8px;
}

.tooltip-content ul {
  margin: 0;
  padding-left: 20px;
}

.tooltip-content li {
  margin-bottom: 4px;
}
</style>

