/**
 * 料框规格搜索表单组件
 * 功能描述：提供料框规格列表的搜索条件输入和搜索、重置功能，使用全局SearchForm组件实现
 * 创建日期：2024-10-30
 */
<template>
  <search-form
    ref="searchForm"
    :items="formItems"
    :value="formModel"
    :loading="loading"
    @search="handleSearch"
    @reset="handleReset"
  >
    <!-- 自定义插槽（如需要） -->
  </search-form>
</template>

<script>
import SearchForm from '@/components/SearchForm'

export default {
  name: 'BinSpecificationSearchForm',
  components: {
    SearchForm
  },
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
        code: '',
        name: '',
        status: '',
        material: '',
        supplier: ''
      },
      // 材质选项
      materialOptions: [
        { value: '铝合金', label: '铝合金' },
        { value: '不锈钢', label: '不锈钢' },
        { value: '碳钢', label: '碳钢' },
        { value: '镀锌钢', label: '镀锌钢' }
      ]
    }
  },
  computed: {
    // 动态生成表单项配置
    formItems() {
      // 基础表单项
      const baseItems = [
        {
          prop: 'code',
          label: '规格代码',
          type: 'input',
          placeholder: '请输入规格代码',
          class: 'search-item-code'
        },
        {
          prop: 'name',
          label: '规格名称',
          type: 'input',
          placeholder: '请输入规格名称',
          class: 'search-item-name'
        },
        {
          prop: 'status',
          label: '状态',
          type: 'select',
          placeholder: '状态筛选',
          options: [
            { value: '', label: '全部' },
            { value: 1, label: '启用' },
            { value: 0, label: '禁用' }
          ]
        }
      ]
      
      // 高级搜索表单项（折叠状态下不显示）
      const advancedItems = [
        {
          prop: 'material',
          label: '材质',
          type: 'select',
          placeholder: '选择材质',
          options: this.materialOptions
        },
        {
          prop: 'supplier',
          label: '供应商',
          type: 'input',
          placeholder: '输入供应商信息'
        }
      ]
      
      // 合并所有表单项
      return [
        ...baseItems,
        ...advancedItems.map(item => ({ ...item, expanded: false })) // 标记为折叠项
      ]
    }
  },
  watch: {
    // 监听初始查询条件变化
    initQuery: {
      handler(val) {
        // 初始化表单模型数据
        this.formModel = {
          code: val.code || '',
          name: val.name || '',
          status: val.status === undefined ? '' : val.status,
          material: val.material || '',
          supplier: val.supplier || ''
        }
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    // 准备搜索参数（去除空值）
    prepareSearchParams(model) {
      const params = {}
      // 只保留有值的参数
      for (const key in model) {
        if (model[key] !== '' && model[key] !== undefined && model[key] !== null) {
          params[key] = model[key]
        }
      }
      return params
    },
    
    // 搜索操作
    handleSearch(model) {
      const params = this.prepareSearchParams(model)
      // 向父组件发送搜索事件
      this.$emit('search', params)
    },
    
    // 重置搜索
    handleReset() {
      // 全局组件会将表单重置为空值，这里直接发出重置事件
      const emptyModel = {
        code: '',
        name: '',
        status: '',
        material: '',
        supplier: ''
      }
      
      // 重置本地表单模型（确保下次搜索时不会回显旧值）
      this.formModel = { ...emptyModel }
      
      // 向父组件发送重置事件
      this.$emit('reset', {})
    }
  }
}
</script>

<style lang="scss" scoped>
/* 自定义样式 */
.search-item-code,
.search-item-name {
  width: 220px;
}
</style> 