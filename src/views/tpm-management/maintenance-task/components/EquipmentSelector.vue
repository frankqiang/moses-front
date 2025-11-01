<!--
  文件名称：EquipmentSelector.vue
  文件描述：设备选择器组件 - 支持搜索和分页
  创建日期：2024-01-20
  修改记录：
    - 2024-01-20: 初始创建
-->
<template>
  <el-select
    :value="value"
    :placeholder="placeholder"
    :disabled="disabled"
    :clearable="clearable"
    :filterable="filterable"
    :remote="remote"
    :remote-method="handleSearch"
    :loading="loading"
    @input="handleInput"
    @change="handleChange"
    @clear="handleClear"
  >
    <el-option
      v-for="item in equipmentList"
      :key="item.id"
      :label="`${item.equipmentCode} - ${item.name}`"
      :value="item.id"
    >
      <span style="float: left">{{ item.equipmentCode }}</span>
      <span style="float: right; color: #8492a6; font-size: 13px">{{ item.name }}</span>
    </el-option>
    <el-option
      v-if="hasMore && !loading"
      value=""
      disabled
      style="text-align: center; color: #409eff; cursor: pointer"
      @click.native="loadMore"
    >
      加载更多...
    </el-option>
  </el-select>
</template>

<script>
import { fetchEquipmentList } from '@/views/master-data/equipment-management/api/equipment-management'

export default {
  name: 'EquipmentSelector',

  props: {
    value: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: '请选择设备'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    clearable: {
      type: Boolean,
      default: true
    },
    filterable: {
      type: Boolean,
      default: true
    },
    remote: {
      type: Boolean,
      default: true
    },
    // 设备类型筛选（可选）
    equipmentType: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      equipmentList: [],
      loading: false,
      searchKeyword: '',
      currentPage: 1,
      pageSize: 20,
      total: 0
    }
  },

  computed: {
    hasMore() {
      return this.equipmentList.length < this.total
    }
  },

  created() {
    this.loadEquipmentList()
  },

  methods: {
    /**
     * 加载设备列表
     */
    async loadEquipmentList(append = false) {
      try {
        this.loading = true
        const params = {
          page: this.currentPage,
          limit: this.pageSize,
          search: this.searchKeyword
        }

        // 如果指定了设备类型，添加筛选
        if (this.equipmentType) {
          params.equipmentType = this.equipmentType
        }

        const response = await fetchEquipmentList(params)
        // 从 response.data 中获取结果
        const { results, totalResults } = response.data || {}

        if (append) {
          this.equipmentList = [...this.equipmentList, ...(results || [])]
        } else {
          this.equipmentList = results || []
        }

        this.total = totalResults || 0
      } catch (error) {
        console.error('加载设备列表失败:', error)
        this.$message.error(error.message || '加载设备列表失败')
        // 错误时重置数据
        this.equipmentList = []
        this.total = 0
      } finally {
        this.loading = false
      }
    },

    /**
     * 搜索处理
     */
    handleSearch(query) {
      this.searchKeyword = query
      this.currentPage = 1
      this.loadEquipmentList()
    },

    /**
     * 加载更多
     */
    loadMore() {
      if (!this.hasMore || this.loading) return
      this.currentPage++
      this.loadEquipmentList(true)
    },

    /**
     * 输入处理
     */
    handleInput(val) {
      this.$emit('input', val)
    },

    /**
     * 值变化处理
     */
    handleChange(val) {
      const selectedEquipment = this.equipmentList.find(item => item.id === val)
      this.$emit('change', val, selectedEquipment)
    },

    /**
     * 清除处理
     */
    handleClear() {
      this.$emit('clear')
      this.$emit('change', '', null)
    }
  }
}
</script>

