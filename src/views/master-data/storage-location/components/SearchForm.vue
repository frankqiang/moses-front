/**
 * 库位管理搜索表单组件（新版）
 * 功能描述：提供库位查询条件输入和搜索/重置功能
 * 创建日期：2023-09-01
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
 * 功能描述：提供库位查询条件输入和搜索/重置功能
 */
import SearchForm from '@/components/SearchForm'

export default {
  name: 'LocationSearchForm',
  components: {
    SearchForm
  },
  props: {
    initQuery: {
      type: Object,
      default: () => ({})
    },
    warehouseOptions: {
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
        warehouseId: '',
        locationType: '',
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
          label: '库位编码',
          type: 'input',
          placeholder: '请输入库位编码',
          clearable: true
        },
        {
          prop: 'name',
          label: '库位名称',
          type: 'input',
          placeholder: '请输入库位名称',
          clearable: true
        },
        {
          prop: 'warehouseId',
          label: '所属仓库',
          type: 'select',
          placeholder: '请选择所属仓库',
          clearable: true,
          style: { width: '200px' },
          options: this.warehouseOptions.map(item => ({
            label: item.name,
            value: item.id
          }))
        },
        {
          prop: 'locationType',
          label: '库位类型',
          type: 'select',
          placeholder: '请选择库位类型',
          clearable: true,
          style: { width: '200px' },
          options: [
            { label: '存储区', value: 'STORAGE' },
            { label: '收货区', value: 'RECEIVING' },
            { label: '发货区', value: 'SHIPPING' },
            { label: '暂存区', value: 'STAGING' },
            { label: '质检区', value: 'QC' }
          ]
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
        warehouseId: this.initQuery.warehouseId || '',
        locationType: this.initQuery.locationType || '',
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
        warehouseId: '',
        locationType: '',
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
