/**
 * 文件名称：UserSearch.vue
 * 文件描述：用户搜索组件，负责用户列表的搜索和筛选功能
 * 创建日期：2024-01-15
 * 修改记录：
 *   - 2024-01-15: 从index.vue中拆分出来，提高组件复用性
 */
<template>
  <search-form
    :items="searchFormItems"
    :loading="loading"
    @search="handleSearch"
    @reset="handleReset"
  />
</template>

<script>
import SearchForm from '@/components/SearchForm'
import { SEARCH_FORM_CONFIG } from '../constants/form-config'
import { USER_STATUS_OPTIONS, DEPARTMENT_OPTIONS } from '../constants'

export default {
  name: 'UserSearch',
  components: {
    SearchForm
  },
  props: {
    loading: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    /**
     * 搜索表单配置项 - 使用统一配置文件
     */
    searchFormItems() {
      return SEARCH_FORM_CONFIG
    }
  },
  methods: {
    /**
     * 搜索处理
     */
    handleSearch(searchData) {
      this.$emit('search', searchData)
    },

    /**
     * 重置处理
     */
    handleReset() {
      this.$emit('reset')
    }
  }
}
</script>

<style scoped>
/* 组件特定样式 */
</style>