<!--
  文件名称：MaintenancePlanSelector.vue
  文件描述：维护计划选择器组件 - 支持按设备筛选和远程搜索
  创建日期：2024-01-20
  修改记录：
    - 2024-01-20: 初始创建
    - 2024-01-20: 优化用户体验 - 初始化时加载默认数据 + 支持远程搜索

  设计说明：
    - 初始化时加载最近100条启用的维护计划，确保用户打开下拉框时能看到数据
    - 支持远程搜索功能，用户输入关键词时从后端精确搜索
    - 当选择设备时，自动筛选该设备的维护计划
    - 兼顾用户体验和性能优化
-->
<template>
  <el-select
    :value="value"
    :placeholder="placeholder"
    :disabled="disabled"
    :clearable="clearable"
    :filterable="filterable"
    :remote="remote"
    :remote-method="handleRemoteSearch"
    :loading="loading"
    @input="handleInput"
    @change="handleChange"
    @clear="handleClear"
  >
    <el-option
      v-for="item in planList"
      :key="item.id"
      :label="`${item.planCode} - ${item.planName}`"
      :value="item.id"
    >
      <div style="display: flex; justify-content: space-between; align-items: center">
        <span>{{ item.planCode }}</span>
        <span style="color: #8492a6; font-size: 13px">{{ item.planName }}</span>
      </div>
    </el-option>
  </el-select>
</template>

<script>
import { getMaintenancePlans } from '@/views/tpm-management/maintenance-plan/api/maintenance-plan'

export default {
  name: 'MaintenancePlanSelector',

  props: {
    value: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: '请选择维护计划'
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
    // 是否启用远程搜索
    remote: {
      type: Boolean,
      default: true
    },
    // 按设备筛选
    equipmentId: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      planList: [],
      loading: false,
      searchKeyword: ''
    }
  },

  watch: {
    equipmentId: {
      handler(newVal) {
        // 当设备ID变化时，重新加载维护计划列表（包括清空设备ID的情况）
        this.loadPlanList()
      },
      immediate: false
    }
  },

  created() {
    // 初始化时加载默认数据（最近的维护计划）
    this.loadPlanList()
  },

  methods: {
    /**
     * 加载维护计划列表
     */
    async loadPlanList() {
      try {
        this.loading = true
        const params = {
          page: 1,
          limit: 100,
          status: '启用' // 只加载启用状态的计划
        }

        // 如果有搜索关键词，添加搜索参数
        if (this.searchKeyword) {
          params.search = this.searchKeyword
        }

        // 如果指定了设备ID，添加筛选
        if (this.equipmentId) {
          params.equipmentId = this.equipmentId
        }

        const response = await getMaintenancePlans(params)
        // 从 response.data 中获取结果
        this.planList = response.data?.results || []
      } catch (error) {
        console.error('加载维护计划列表失败:', error)
        this.$message.error(error.message || '加载维护计划列表失败')
        // 错误时重置数据
        this.planList = []
      } finally {
        this.loading = false
      }
    },

    /**
     * 远程搜索处理
     */
    handleRemoteSearch(query) {
      this.searchKeyword = query
      this.loadPlanList()
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
      const selectedPlan = this.planList.find(item => item.id === val)
      this.$emit('change', val, selectedPlan)
    },

    /**
     * 清除处理
     */
    handleClear() {
      this.searchKeyword = ''
      this.$emit('clear')
      this.$emit('change', '', null)
    }
  }
}
</script>

