/**
 * 文件名称：PendingTaskSearch.vue
 * 文件描述：待排程任务搜索组件，提供多维筛选能力
 * 创建日期：2025-10-20
 * 修改记录：
 *   - 2025-10-20: 初始创建，实现待排程任务搜索与筛选
 */

<template>
  <div class="pending-task-search">
    <SearchForm
      v-model="localQuery"
      :items="orderedSearchItems"
      :loading="loading"
      :visible-item-count="primaryFieldCount"
      :debounce-time="400"
      @search="handleSearch"
      @reset="handleReset"
    >
      <template #includeScheduleLocked>
        <div class="include-locked-toggle">
          <el-switch
            v-model="localQuery.includeScheduleLocked"
            active-text="包含已锁定"
            inactive-text="排除已锁定"
            @change="handleIncludeLockedChange"
          />
        </div>
      </template>
    </SearchForm>
  </div>
</template>

<script>
import SearchForm from '@/components/SearchForm'
import { PENDING_SEARCH_FORM_CONFIG, PENDING_DEFAULT_PAGINATION } from '../constants'

export default {
  name: 'PendingTaskSearch',
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
        ...PENDING_DEFAULT_PAGINATION,
        includeScheduleLocked: false,
        ...this.value
      }
    }
  },
  computed: {
    orderedSearchItems() {
      const primary = PENDING_SEARCH_FORM_CONFIG.filter((item) => item.priority === 'primary')
      const advanced = PENDING_SEARCH_FORM_CONFIG.filter((item) => item.priority === 'advanced')
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
          ...PENDING_DEFAULT_PAGINATION,
          includeScheduleLocked: false,
          ...newVal
        }
      }
    }
  },
  methods: {
    handleSearch(formValues) {
      const sanitized = this.normalizeQuery(formValues)
      this.localQuery = { ...this.localQuery, ...sanitized }
      this.$emit('search', sanitized)
      this.$emit('input', { ...this.localQuery })
    },
    handleReset() {
      const resetQuery = {
        ...PENDING_DEFAULT_PAGINATION,
        includeScheduleLocked: false
      }
      this.localQuery = { ...resetQuery }
      this.$emit('reset', { ...resetQuery })
      this.$emit('input', { ...resetQuery })
    },
    handleIncludeLockedChange() {
      const sanitized = this.normalizeQuery(this.localQuery)
      this.$emit('search', sanitized)
      this.$emit('input', { ...this.localQuery })
    },
    normalizeQuery(values = {}) {
      const result = {
        ...PENDING_DEFAULT_PAGINATION,
        includeScheduleLocked: Boolean(values.includeScheduleLocked)
      }

      Object.keys(values).forEach((key) => {
        const value = values[key]

        if (value === undefined || value === null || value === '') {
          return
        }

        switch (key) {
          case 'productCode':
          case 'alloyGrade':
          case 'mixingGroupCode':
            result[key] = String(value).trim().toUpperCase()
            break
          case 'priorities':
            if (Array.isArray(value) && value.length) {
              result[key] = [...value]
            }
            break
          case 'minWeight':
          case 'maxWeight':
            result[key] = Number(value)
            break
          case 'plannedLoadingFrom':
          case 'plannedLoadingTo':
            result[key] = value
            break
          default:
            result[key] = value
            break
        }
      })

      return result
    }
  }
}
</script>

<style scoped>
.pending-task-search {
  margin-bottom: 16px;
}

.include-locked-toggle {
  display: flex;
  align-items: center;
  min-width: 200px;
}
</style>

