<!--
 * 文件名称：SearchForm.vue
 * 文件描述：岗位搜索表单组件
 * 创建日期：2024-01-20
 * 修改记录：
 *   - 2024-01-20: 创建，使用全局SearchForm组件
-->

<template>
  <SearchForm :items="searchFormConfig" :loading="loading" @search="handleSearch" @reset="handleReset" />
</template>

<script>
import { SEARCH_FORM_CONFIG } from '../constants/position'

export default {
  name: 'PositionSearchForm',
  props: {
    // 加载状态
    loading: {
      type: Boolean,
      default: false
    },
    // 部门选项
    departmentOptions: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    /**
         * 搜索表单配置
         */
    searchFormConfig() {
      const config = [...SEARCH_FORM_CONFIG]

      // 动态设置部门选项
      const departmentField = config.find(item => item.prop === 'departmentId')
      if (departmentField) {
        departmentField.options = [
          { label: '全部', value: '' },
          ...this.departmentOptions.map(option => ({
            label: option.name,
            value: option.id
          }))
        ]
      }

      return config
    }
  },
  methods: {
    /**
         * 处理搜索
         */
    handleSearch(formData) {
      this.$emit('search', formData)
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
