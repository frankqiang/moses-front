/**
 * 文件名称：SearchForm.vue
 * 文件描述：角色管理搜索表单组件，提供角色搜索和筛选功能
 * 创建日期：2024-01-20
 * 修改记录：
 *   - 2024-01-20: 初始创建，实现基础搜索功能
 */
<template>
  <SearchForm
    :items="searchFormConfig"
    :loading="loading"
    @search="handleSearch"
    @reset="handleReset"
  />
</template>

<script>
import { SEARCH_FORM_CONFIG } from '../constants'

export default {
  name: 'RoleSearchForm',
  props: {
    // 加载状态
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      // 搜索表单配置
      searchFormConfig: SEARCH_FORM_CONFIG
    }
  },
  methods: {
    /**
     * 处理搜索
     */
    handleSearch(formData) {
      // 处理日期范围
      const searchParams = { ...formData }
      if (searchParams.dateRange && searchParams.dateRange.length === 2) {
        searchParams.createdFrom = searchParams.dateRange[0]
        searchParams.createdTo = searchParams.dateRange[1]
        delete searchParams.dateRange
      }

      this.$emit('search', searchParams)
    },

    /**
     * 处理重置
     */
    handleReset() {
      this.$emit('reset')
    }
  }
}
</script>
