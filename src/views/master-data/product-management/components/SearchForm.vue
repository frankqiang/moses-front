/**
 * 产品管理搜索表单组件（新版）
 * 功能描述：提供铝箔产品查询条件输入和搜索/重置功能
 * 创建日期：2024-11-10
 */
<template>
  <div class="search-form-container">
    <search-form
      ref="searchForm"
      :items="formItems"
      :value="form"
      :loading="loading"
      :collapse-rows="1"
      @search="handleSearch"
      @reset="handleReset"
    />
  </div>
</template>

<script>
/**
 * 搜索表单组件
 * 功能描述：提供铝箔产品查询条件输入和搜索/重置功能
 */
import SearchForm from '@/components/SearchForm'

export default {
  name: 'ProductSearchForm',
  components: {
    SearchForm
  },
  props: {
    initQuery: {
      type: Object,
      default: () => ({})
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      form: {
        code: '',
        name: '',
        alloy: '',
        lifecycleStatus: ''
      }
    }
  },
  computed: {
    // 表单配置项
    formItems() {
      return [
        {
          prop: 'code',
          label: '产品编码',
          type: 'input',
          placeholder: '请输入产品编码',
          clearable: true
        },
        {
          prop: 'name',
          label: '产品名称',
          type: 'input',
          placeholder: '请输入产品名称',
          clearable: true
        },
        {
          prop: 'alloy',
          label: '合金牌号',
          type: 'select',
          placeholder: '请选择合金牌号',
          clearable: true,
          style: { width: '200px' },
          options: [
            { label: '1100', value: '1100' },
            { label: '8011', value: '8011' },
            { label: '3003', value: '3003' },
            { label: '8021', value: '8021' }
          ]
        },
        {
          prop: 'lifecycleStatus',
          label: '产品状态',
          type: 'select',
          placeholder: '请选择产品状态',
          clearable: true,
          style: { width: '200px' },
          options: [
            { label: '试产', value: 'trial' },
            { label: '量产', value: 'production' },
            { label: '停产', value: 'discontinued' }
          ]
        }
      ]
    }
  },
  watch: {
    // 监听initQuery变化，更新表单值
    initQuery: {
      handler(val) {
        this.initFormValues()
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    // 初始化表单值
    initFormValues() {
      this.form = {
        code: this.initQuery.code || '',
        name: this.initQuery.name || '',
        alloy: this.initQuery.alloy || '',
        lifecycleStatus: this.initQuery.lifecycleStatus || ''
      }
    },
    // 搜索
    handleSearch(formData) {
      const params = {}
      // 只添加非空值到搜索参数中
      Object.keys(formData).forEach(key => {
        if (formData[key] !== '' && formData[key] !== null && formData[key] !== undefined) {
          params[key] = formData[key]
        }
      })
      this.$emit('search', params)
    },
    // 重置
    handleReset() {
      this.form = {
        code: '',
        name: '',
        alloy: '',
        lifecycleStatus: ''
      }
      this.$emit('reset')
    }
  }
}
</script>

<style lang="scss" scoped>
.search-form-container {
  margin-bottom: 16px;
}
</style> 