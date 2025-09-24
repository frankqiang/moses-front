/**
* 文件名称：SearchForm.vue
* 文件描述：角色管理搜索表单组件，提供角色搜索和筛选功能
* 创建日期：2024-01-20
* 修改记录：
* - 2024-01-20: 初始创建，实现基础搜索功能
*/
<template>
  <SearchForm :items="searchFormConfig" :loading="loading" @search="handleSearch" @reset="handleReset" />
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
     * 处理搜索 - 严格按照接口文档参数格式处理
     */
    handleSearch(formData) {
      const searchParams = { ...formData }

      // 处理日期范围转换
      if (searchParams.dateRange && searchParams.dateRange.length === 2) {
        searchParams.createdFrom = searchParams.dateRange[0]
        searchParams.createdTo = searchParams.dateRange[1]
        delete searchParams.dateRange
      }

      // 处理数组类型的筛选参数 - 确保与接口文档保持一致
      ['type', 'status', 'level'].forEach(field => {
        if (searchParams[field] && Array.isArray(searchParams[field]) && searchParams[field].length === 0) {
          delete searchParams[field]
        }
      })

      // 处理布尔类型的isDefault参数
      if (searchParams.isDefault !== undefined && searchParams.isDefault !== null) {
        // 将字符串转换为布尔值（接口文档要求）
        if (searchParams.isDefault === 'true') {
          searchParams.isDefault = true
        } else if (searchParams.isDefault === 'false') {
          searchParams.isDefault = false
        }
      }

      // 清理空值参数
      Object.keys(searchParams).forEach(key => {
        if (searchParams[key] === '' || searchParams[key] === null || searchParams[key] === undefined) {
          delete searchParams[key]
        }
      })

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
