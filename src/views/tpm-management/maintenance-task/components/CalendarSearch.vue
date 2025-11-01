/**
 * 文件名称：CalendarSearch.vue
 * 文件描述：维护任务日历视图搜索组件，基于全局SearchForm实现筛选功能
 * 创建日期：2025-10-31
 * 修改记录：
 *   - 2025-10-31: 初始创建，实现设备和执行人筛选
 */
<template>
  <div class="calendar-search">
    <SearchForm
      :items="searchItems"
      :loading="loading"
      :value="localFilters"
      :visible-item-count="2"
      @search="handleSearch"
      @reset="handleReset"
    >
      <template #buttons>
        <el-button
          type="primary"
          icon="el-icon-refresh"
          :loading="loading"
          @click="handleRefresh"
        >
          刷新
        </el-button>
      </template>
    </SearchForm>
  </div>
</template>

<script>
import SearchForm from '@/components/SearchForm'
import { CALENDAR_SEARCH_FORM_CONFIG } from '../constants'

export default {
  name: 'CalendarSearch',
  components: {
    SearchForm
  },
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    equipmentOptions: {
      type: Array,
      default: () => []
    },
    personnelOptions: {
      type: Array,
      default: () => []
    },
    value: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      localFilters: {
        ...this.value
      }
    }
  },
  computed: {
    /**
     * 搜索表单配置项
     * 动态注入设备和人员选项
     */
    searchItems() {
      return CALENDAR_SEARCH_FORM_CONFIG.map(item => {
        if (item.prop === 'equipmentId') {
          return {
            ...item,
            options: this.equipmentOptions
          }
        }
        if (item.prop === 'assignedTo') {
          return {
            ...item,
            options: this.personnelOptions
          }
        }
        return item
      })
    }
  },
  watch: {
    value: {
      deep: true,
      handler(newVal) {
        this.localFilters = { ...newVal }
      }
    }
  },
  methods: {
    /**
     * 处理搜索
     */
    handleSearch(formValues) {
      const sanitized = this.normalizeFilters(formValues)
      this.localFilters = { ...sanitized }
      this.$emit('search', sanitized)
      this.$emit('input', sanitized)
    },

    /**
     * 处理重置
     */
    handleReset() {
      this.localFilters = {}
      this.$emit('reset', {})
      this.$emit('input', {})
    },

    /**
     * 处理刷新
     */
    handleRefresh() {
      this.$emit('refresh')
    },

    /**
     * 标准化筛选条件
     */
    normalizeFilters(values = {}) {
      const result = {}
      Object.keys(values).forEach(key => {
        const value = values[key]
        // 过滤空值
        if (value === undefined || value === null || value === '') {
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
.calendar-search {
  // 为SearchForm组件提供内边距，因为父级卡片padding已设为0
  padding: 16px 20px;
}
</style>

