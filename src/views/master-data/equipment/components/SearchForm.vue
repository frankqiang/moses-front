/**
 * 设备搜索表单组件
 * 功能描述：提供设备列表的搜索条件输入和搜索、重置功能，使用全局SearchForm组件实现
 * 创建日期：2023-11-05
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
  >
    <!-- 自定义日期范围插槽 -->
    <template #dateRange="{ model }">
      <el-date-picker
        v-model="model.installDateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="安装日期开始"
        end-placeholder="安装日期结束"
        value-format="yyyy-MM-dd"
        style="width: 100%"
      />
    </template>
  </search-form>
</template>

<script>
import SearchForm from '@/components/SearchForm'

export default {
  name: 'EquipmentSearchForm',
  components: {
    SearchForm
  },
  props: {
    // 初始查询条件
    initQuery: {
      type: Object,
      default: () => ({})
    },
    // 设备类型
    equipmentType: {
      type: String,
      required: true
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
        status: '',
        capacityRange: '',
        liftCapacityRange: '',
        navigationMode: '',
        installDateRange: [],
        supplier: '',
        model: ''
      },
      // 供应商选项
      supplierOptions: [
        { value: 'supplier1', label: '供应商A' },
        { value: 'supplier2', label: '供应商B' },
        { value: 'supplier3', label: '供应商C' },
        { value: 'supplier4', label: '供应商D' }
      ]
    }
  },
  computed: {
    // 动态生成表单项配置
    formItems() {
      // 基础表单项（所有设备类型通用）
      const baseItems = [
        {
          prop: 'keyword',
          label: '关键词',
          type: 'input',
          placeholder: '搜索设备ID、名称或型号...',
          class: 'search-item-keyword'
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

      // 根据设备类型添加特定表单项
      let typeSpecificItems = []
      if (this.equipmentType === 'FURNACE') {
        typeSpecificItems = [
          {
            prop: 'capacityRange',
            label: '容量范围',
            type: 'select',
            placeholder: '容量范围',
            options: [
              { value: '', label: '全部' },
              { value: 'small', label: '< 10T' },
              { value: 'medium', label: '10-50T' },
              { value: 'large', label: '> 50T' }
            ]
          }
        ]
      } else if (this.equipmentType === 'CRANE') {
        typeSpecificItems = [
          {
            prop: 'liftCapacityRange',
            label: '起重量范围',
            type: 'select',
            placeholder: '起重量范围',
            options: [
              { value: '', label: '全部' },
              { value: 'small', label: '< 5T' },
              { value: 'medium', label: '5-20T' },
              { value: 'large', label: '> 20T' }
            ]
          }
        ]
      } else if (this.equipmentType === 'AUTO_CART') {
        typeSpecificItems = [
          {
            prop: 'navigationMode',
            label: '导航方式',
            type: 'select',
            placeholder: '导航方式',
            options: [
              { value: '', label: '全部' },
              { value: 'LASER', label: '激光导航' },
              { value: 'MAGNETIC', label: '磁导航' },
              { value: 'VISION', label: '视觉导航' },
              { value: 'INERTIAL', label: '惯性导航' }
            ]
          }
        ]
      }

      // 高级搜索表单项（折叠状态下不显示）
      const advancedItems = [
        {
          prop: 'installDateRange',
          label: '安装日期',
          type: 'slot',
          slotName: 'dateRange'
        },
        {
          prop: 'supplier',
          label: '供应商',
          type: 'select',
          placeholder: '选择供应商',
          options: this.supplierOptions
        },
        {
          prop: 'model',
          label: '设备型号',
          type: 'input',
          placeholder: '输入设备型号'
        }
      ]

      // 合并所有表单项，显示顺序：基础 -> 特定类型 -> 高级（折叠）
      return [
        ...baseItems,
        ...typeSpecificItems,
        ...advancedItems.map(item => ({ ...item, expanded: true })) // 标记为展开项
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
          status: val.status === undefined ? '' : val.status,
          installDateRange: val.installDateRange || [],
          supplier: val.supplier || '',
          model: val.model || '',
          // 设备类型特定字段
          capacityRange: this.equipmentType === 'FURNACE' ? (val.capacityRange || '') : '',
          liftCapacityRange: this.equipmentType === 'CRANE' ? (val.liftCapacityRange || '') : '',
          navigationMode: this.equipmentType === 'AUTO_CART' ? (val.navigationMode || '') : ''
        }
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    // 准备搜索参数
    prepareSearchParams(model) {
      const params = { ...model }

      // 处理日期范围
      if (params.installDateRange && params.installDateRange.length === 2) {
        params.installDateStart = params.installDateRange[0]
        params.installDateEnd = params.installDateRange[1]
        delete params.installDateRange // 删除原始数组，避免后端困惑
      }

      return params
    },

    // 搜索事件处理
    handleSearch(model) {
      const params = this.prepareSearchParams(model)
      this.$emit('search', params)
    },

    // 重置事件处理
    handleReset() {
      // 全局组件会将表单重置为空值，这里直接发出重置事件
      const emptyModel = {
        keyword: '',
        status: '',
        capacityRange: '',
        liftCapacityRange: '',
        navigationMode: '',
        installDateRange: [],
        supplier: '',
        model: ''
      }

      this.$emit('reset', this.prepareSearchParams(emptyModel))
    }
  }
}
</script>

<style lang="scss" scoped>
/* 全局组件自带样式，这里只需添加自定义样式 */
.search-item-keyword {
  width: 280px;
}
</style>
