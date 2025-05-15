/**
 * 仓库管理搜索表单组件（新版）
 * 功能描述：提供仓库查询条件输入和搜索/重置功能
 * 创建日期：2023-11-01
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
 * 功能描述：提供仓库查询条件输入和搜索/重置功能
 */
import SearchForm from '@/components/SearchForm'

export default {
  name: 'WarehouseSearchForm',
  components: {
    SearchForm
  },
  props: {
    initQuery: {
      type: Object,
      default: () => ({})
    },
    warehouseTypeOptions: {
      type: Array,
      default: () => []
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
        warehouseType: '',
        status: ''
      }
    }
  },
  computed: {
    // 表单配置项
    formItems() {
      return [
        {
          prop: 'code',
          label: '仓库编码',
          type: 'input',
          placeholder: '请输入仓库编码',
          clearable: true
        },
        {
          prop: 'name',
          label: '仓库名称',
          type: 'input',
          placeholder: '请输入仓库名称',
          clearable: true
        },
        {
          prop: 'warehouseType',
          label: '仓库类型',
          type: 'select',
          placeholder: '请选择仓库类型',
          clearable: true,
          style: { width: '200px' },
          options: this.warehouseTypeOptions
        },
        {
          prop: 'status',
          label: '状态',
          type: 'select',
          placeholder: '请选择状态',
          clearable: true,
          style: { width: '200px' },
          options: [
            { label: '启用', value: 1 },
            { label: '禁用', value: 0 }
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
        warehouseType: this.initQuery.warehouseType || '',
        status: this.initQuery.status !== undefined ? this.initQuery.status : ''
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
        warehouseType: '',
        status: ''
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