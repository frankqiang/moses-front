/**
 * 物料编码规则搜索表单组件
 * 功能描述：提供物料编码规则列表的搜索条件输入和搜索、重置功能，使用全局SearchForm组件实现
 * 创建日期：2023-10-01
 * 更新日期：2024-10-28
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

export default {
  name: 'MaterialCodeSearchForm',
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
        ruleName: '',
        ruleType: ''
      },
      // 规则类型选项
      ruleTypeOptions: [
        { value: 'pure_numeric', label: '纯数字流水号' },
        { value: 'prefix_numeric', label: '前缀+流水号' },
        { value: 'custom', label: '自定义规则' }
      ]
    }
  },
  computed: {
    // 动态生成表单项配置
    formItems() {
      return [
        {
          prop: 'ruleName',
          label: '规则名称',
          type: 'input',
          placeholder: '请输入规则名称',
          class: 'search-item-name'
        },
        {
          prop: 'ruleType',
          label: '规则类型',
          type: 'select',
          placeholder: '请选择规则类型',
          options: this.ruleTypeOptions
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
          ruleName: val.ruleName || '',
          ruleType: val.ruleType || ''
        }
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    // 搜索事件处理
    handleSearch(model) {
      this.$emit('search', { ...model })
    },

    // 重置事件处理
    handleReset() {
      const emptyModel = {
        ruleName: '',
        ruleType: ''
      }

      this.$emit('reset', emptyModel)
    }
  }
}
</script>

<style lang="scss" scoped>
/* 全局组件自带样式，这里只需添加自定义样式 */
.search-item-name {
  width: 240px;
}
</style>
