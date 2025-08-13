/**
 * 检验项目搜索表单组件
 * 功能描述：提供检验项目列表的搜索条件输入和搜索、重置功能
 * 创建日期：2024-12-19
 */
<template>
  <search-form
    ref="searchForm"
    :items="formItems"
    :value="formModel"
    :loading="loading"
    @search="handleSearch"
    @reset="handleReset"
  />
</template>

<script>
import SearchForm from '@/components/SearchForm'
import { SEARCH_FORM_CONFIG } from '../constants'

export default {
  name: 'InspectionItemSearchForm',
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
        keyword: '',
        category: '',
        dataType: '',
        applicableProduct: '',
        status: ''
      }
    }
  },
  computed: {
    // 表单项配置
    formItems() {
      return SEARCH_FORM_CONFIG
    }
  },
  watch: {
    // 监听初始查询条件变化
    initQuery: {
      handler(newVal) {
        if (newVal && Object.keys(newVal).length > 0) {
          this.formModel = {
            ...this.formModel,
            ...newVal
          }
        }
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    /**
     * 处理搜索事件
     * @param {Object} formData - 表单数据
     */
    handleSearch(formData) {
      // 过滤空值
      const params = {}
      Object.keys(formData).forEach(key => {
        if (formData[key] !== '' && formData[key] !== null && formData[key] !== undefined) {
          params[key] = formData[key]
        }
      })
      
      this.$emit('search', params)
    },

    /**
     * 处理重置事件
     */
    handleReset() {
      this.formModel = {
        keyword: '',
        category: '',
        dataType: '',
        applicableProduct: '',
        status: ''
      }
      this.$emit('reset')
    },

    /**
     * 获取当前表单数据
     * @returns {Object} 表单数据
     */
    getFormData() {
      return { ...this.formModel }
    },

    /**
     * 设置表单数据
     * @param {Object} data - 表单数据
     */
    setFormData(data) {
      this.formModel = {
        ...this.formModel,
        ...data
      }
    },

    /**
     * 重置表单
     */
    resetForm() {
      this.$refs.searchForm.resetForm()
    }
  }
}
</script>

<style lang="scss" scoped>
// 如果需要自定义样式，可以在这里添加
</style>