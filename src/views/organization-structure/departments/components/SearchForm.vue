<!--
 * 文件名称：SearchForm.vue
 * 文件描述：部门搜索表单组件
 * 创建日期：2024-01-20
 * 修改记录：
 *   - 2024-01-20: 创建，使用全局SearchForm组件
-->

<template>
  <SearchForm :items="searchFormConfig" :loading="loading" @search="handleSearch" @reset="handleReset" />
</template>

<script>
import SearchForm from '@/components/SearchForm'
import { SEARCH_FORM_CONFIG, SEARCH_FORM_FIELDS } from '../constants'

export default {
  name: 'DepartmentSearchForm',
  components: {
    SearchForm
  },
  props: {
    // 加载状态
    loading: {
      type: Boolean,
      default: false
    },
    // 父部门选项
    parentOptions: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    /**
         * 搜索表单配置
         */
    searchFormConfig() {
      const config = SEARCH_FORM_CONFIG.map(item => ({ ...item }))

      // 动态设置父部门选项
      const parentField = config.find(item => item.prop === SEARCH_FORM_FIELDS.PARENT_ID)
      if (parentField) {
        parentField.options = [
          { label: '全部', value: '' },
          ...this.parentOptions.map(option => ({
            label: option.label,
            value: option.value
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
