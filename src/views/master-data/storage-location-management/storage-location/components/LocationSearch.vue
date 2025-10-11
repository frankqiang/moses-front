<!--
  文件名称: LocationSearch.vue
  文件描述: 库位搜索组件
  创建日期: 2025-01-20
  修改记录:
    - 2025-01-20: 初始创建
-->

<template>
  <SearchForm
    v-model="searchModel"
    :items="searchItems"
    @search="handleSearch"
    @reset="handleReset"
  />
</template>

<script>
import SearchForm from '@/components/SearchForm'
import {
  LOCATION_TYPE_OPTIONS,
  OCCUPANCY_STATUS_OPTIONS
} from '../constants'
import { getStorageAreas } from '../api'

export default {
  name: 'LocationSearch',
  components: {
    SearchForm
  },
  data() {
    return {
      searchModel: {
        keyword: '',
        storageAreaId: '',
        occupancyStatus: '',
        locationType: ''
      },
      areaOptions: [],
      loadingAreas: false
    }
  },
  computed: {
    searchItems() {
      return [
        {
          prop: 'keyword',
          label: '关键词',
          type: 'input',
          placeholder: '请输入库位ID',
          clearable: true
        },
        {
          prop: 'storageAreaId',
          label: '所属库区',
          type: 'select',
          placeholder: '请选择库区',
          clearable: true,
          options: this.areaOptions,
          loading: this.loadingAreas
        },
        {
          prop: 'occupancyStatus',
          label: '占用状态',
          type: 'select',
          placeholder: '请选择占用状态',
          clearable: true,
          options: OCCUPANCY_STATUS_OPTIONS
        },
        {
          prop: 'locationType',
          label: '库位类型',
          type: 'select',
          placeholder: '请选择库位类型',
          clearable: true,
          options: LOCATION_TYPE_OPTIONS
        }
      ]
    }
  },
  created() {
    this.fetchAreaOptions()
  },
  methods: {
    /**
     * 获取库区选项（所有库区，不限制状态）
     */
    async fetchAreaOptions() {
      try {
        this.loadingAreas = true
        const response = await getStorageAreas({
          page: 1,
          limit: 100 // 接口限制最大100条，符合接口文档要求
        })
        this.areaOptions = (response.data.results || []).map(area => ({
          label: `${area.areaCode} - ${area.areaName}`,
          value: area.id
        }))
      } catch (error) {
        console.error('获取库区选项失败:', error)
      } finally {
        this.loadingAreas = false
      }
    },

    /**
     * 处理搜索
     */
    handleSearch() {
      this.$emit('search', this.searchModel)
    },

    /**
     * 处理重置
     */
    handleReset() {
      this.searchModel = {
        keyword: '',
        storageAreaId: '',
        occupancyStatus: '',
        locationType: ''
      }
      this.$emit('reset')
    }
  }
}
</script>

