/**
 * 炉型管理搜索表单组件
 * 功能描述：提供炉型列表的搜索条件输入和搜索、重置功能，使用全局SearchForm组件实现
 * 创建日期：2024-11-16
 */
<template>
  <search-form
    ref="searchForm"
    :items="formItems"
    v-model="formModel"
    :loading="loading"
    @search="handleSearch"
    @reset="handleReset"
  />
</template>

<script>
export default {
  name: 'FurnaceTypeSearchForm',
  props: {
    // 初始查询条件
    initQuery: {
      type: Object,
      default: () => ({})
    },
    // 加载状态
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      // 表单模型数据（响应式）
      formModel: {
        keyword: '',
        status: ''
      },
      // 表单项配置
      formItems: [
        {
          prop: 'keyword',
          label: '炉型编码/名称',
          type: 'input',
          placeholder: '请输入炉型编码或名称'
        },
        {
          prop: 'status',
          label: '状态',
          type: 'select',
          placeholder: '请选择状态',
          options: [
            { label: '全部', value: '' },
            { label: '启用', value: 'enabled' },
            { label: '禁用', value: 'disabled' }
          ],
          style: { width: '140px' }
        }
      ]
    }
  },
  watch: {
    // 监听初始查询条件变化
    initQuery: {
      handler(val) {
        // 初始化表单模型数据
        this.formModel = {
          keyword: val.keyword || '',
          status: val.status || ''
        }
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    // 搜索按钮点击事件
    handleSearch(formData) {
      const searchParams = { ...formData }
      // 移除空值字段
      Object.keys(searchParams).forEach(key => {
        if (searchParams[key] === undefined || searchParams[key] === null || searchParams[key] === '') {
          delete searchParams[key]
        }
      })
      this.$emit('search', searchParams)
    },
    
    // 重置按钮点击事件
    handleReset() {
      this.formModel = {
        keyword: '',
        status: ''
      }
      this.$emit('reset')
    }
  }
}
</script> 