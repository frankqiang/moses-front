/**
 * 待审批申请搜索表单组件
 * 功能描述：提供搜索和筛选待审批申请的表单界面
 * 创建日期：2024-12-23
 * 重构日期：2024-12-23 - 使用SearchFormV2组件，采用配置化方式
 */
<template>
  <search-form-v2
    :items="searchFormConfig"
    :loading="loading"
    @search="handleSearch"
    @reset="handleReset"
  />
</template>

<script>
import { SEARCH_FORM_CONFIG } from '../constants'

export default {
  name: 'PendingApplicationSearchForm',

  props: {
    loading: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      searchFormConfig: SEARCH_FORM_CONFIG
    }
  },

  methods: {
    /**
     * 处理搜索事件
     * @param {Object} formData - 搜索表单数据
     */
    handleSearch(formData) {
      this.$emit('search', formData)
    },

    /**
     * 处理重置事件
     */
    handleReset() {
      this.$emit('reset')
    }
  }
}
</script>
