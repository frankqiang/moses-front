<!--
文件名称：MaintenancePlanSearch.vue
文件描述：维护计划搜索组件
创建日期：2025-10-15
修改记录：
  - 2025-10-15: 初始创建
-->

<template>
  <search-form
    v-if="dictionaryLoaded"
    :items="formItems"
    v-model="searchForm"
    @search="handleSearch"
    @reset="handleReset"
  />
</template>

<script>
import SearchForm from '@/components/SearchForm'
import tpmDictionaryMixin from '@/views/master-data/equipment-tpm-management/mixins/dictionary'

export default {
  name: 'MaintenancePlanSearch',

  components: {
    SearchForm
  },

  mixins: [tpmDictionaryMixin],

  data() {
    return {
      // 字典加载状态
      dictionaryLoaded: false,
      // 搜索表单数据
      searchForm: {
        search: '',
        equipmentId: '',
        maintenanceType: '',
        cycleType: '',
        status: ''
      }
    }
  },

  computed: {
    // 搜索表单项配置
    formItems() {
      return [
        {
          type: 'input',
          prop: 'search',
          label: '关键词',
          placeholder: '请输入计划编码或名称',
          clearable: true
        },
        {
          type: 'select',
          prop: 'maintenanceType',
          label: '维护类型',
          placeholder: '请选择维护类型',
          clearable: true,
          options: this.maintenanceTypeOptions || []
        },
        {
          type: 'select',
          prop: 'cycleType',
          label: '周期类型',
          placeholder: '请选择周期类型',
          clearable: true,
          options: this.cycleTypeOptions || []
        },
        {
          type: 'select',
          prop: 'status',
          label: '计划状态',
          placeholder: '请选择计划状态',
          clearable: true,
          options: this.planStatusOptions || []
        }
      ]
    }
  },

  async created() {
    // 加载TPM模块字典
    await this.loadTPMDictionary()
    // 标记字典已加载
    this.dictionaryLoaded = true
  },

  methods: {
    // 处理搜索
    handleSearch(formData) {
      this.$emit('search', formData)
    },

    // 处理重置
    handleReset(formData) {
      this.$emit('reset', formData)
    }
  }
}
</script>
