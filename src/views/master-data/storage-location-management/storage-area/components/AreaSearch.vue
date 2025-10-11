<!--
文件名称: AreaSearch.vue
文件描述: 库区搜索组件
创建日期: 2025-01-20
修改记录:
  - 2025-01-20: 初始创建
-->

<template>
  <search-form
    :fields="searchFields"
    :initial-values="searchParams"
    @search="handleSearch"
    @reset="handleReset"
  />
</template>

<script>
import SearchForm from '@/components/SearchForm'
import { AREA_TYPE_OPTIONS, AREA_STATUS_OPTIONS } from '../constants'

export default {
  name: 'AreaSearch',
  components: {
    SearchForm
  },
  props: {
    searchParams: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      searchFields: [
        {
          type: 'input',
          prop: 'keyword',
          label: '关键词',
          placeholder: '请输入库区代码或名称'
        },
        {
          type: 'select',
          prop: 'areaType',
          label: '库区类型',
          placeholder: '请选择库区类型',
          options: AREA_TYPE_OPTIONS,
          clearable: true
        },
        {
          type: 'select',
          prop: 'status',
          label: '库区状态',
          placeholder: '请选择库区状态',
          options: AREA_STATUS_OPTIONS,
          clearable: true
        }
      ]
    }
  },
  methods: {
    handleSearch(values) {
      this.$emit('search', values)
    },
    handleReset() {
      this.$emit('reset')
    }
  }
}
</script>

