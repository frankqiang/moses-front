/**
 * 工艺参数搜索表单组件
 * 功能描述：提供工艺模板列表的搜索条件输入和搜索、重置功能，使用全局SearchForm组件实现
 * 创建日期：2024-11-15
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
import { getAllFurnaceTypes } from '@/api/master-data/furnace-type'

export default {
  name: 'ProcessParameterSearchForm',
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
        status: '',
        furnaceTypeId: ''
      },
      // 表单项配置
      formItems: [
        {
          prop: 'keyword',
          label: '模板ID/名称',
          type: 'input',
          placeholder: '请输入模板ID或名称'
        },
        {
          prop: 'status',
          label: '状态',
          type: 'select',
          placeholder: '请选择状态',
          options: [
            { label: '全部', value: '' },
            { label: '草稿', value: 'draft' },
            { label: '待审批', value: 'pending' },
            { label: '生效', value: 'effective' },
            { label: '历史', value: 'history' }
          ],
          style: { width: '140px' }
        },
        {
          prop: 'furnaceTypeId',
          label: '关联炉型',
          type: 'select',
          placeholder: '请选择炉型',
          options: [],
          style: { width: '160px' }
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
          status: val.status || '',
          furnaceTypeId: val.furnaceTypeId || ''
        }
      },
      immediate: true,
      deep: true
    }
  },
  created() {
    // 获取炉型列表
    this.getFurnaceTypes()
  },
  methods: {
    // 获取炉型列表
    getFurnaceTypes() {
      getAllFurnaceTypes().then(response => {
        const furnaceTypeItem = this.formItems.find(item => item.prop === 'furnaceTypeId')
        if (furnaceTypeItem) {
          // 添加"全部"选项
          const options = [{ label: '全部', value: '' }]
          
          // 添加从API获取的选项
          let furnaceTypes = []
          
          // 处理嵌套的API返回结构
          if (response && response.code === 20000) {
            if (response.data && response.data.items) {
              // 分页格式的返回
              furnaceTypes = response.data.items
            } else if (Array.isArray(response.data)) {
              // 直接返回数组的情况
              furnaceTypes = response.data
            }
          }
          
          if (furnaceTypes.length > 0) {
            const apiOptions = furnaceTypes.map(item => ({
              label: item.furnaceTypeName || item.name,
              value: item.furnaceTypeCode || item.id
            }))
            options.push(...apiOptions)
          }
          
          // 更新炉型选项
          furnaceTypeItem.options = options
        }
      }).catch((error) => {
        console.error('获取炉型列表失败:', error)
        this.$message.error('获取炉型列表失败')
      })
    },
    
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
        status: '',
        furnaceTypeId: ''
      }
      this.$emit('reset')
    }
  }
}
</script> 