<!--
 * 文件名称: index.vue
 * 文件描述: 设备健康度评分主页面
 * 创建日期: 2024-01-20
 * 修改记录:
 *   - 2024-01-20: 初始创建
-->
<template>
  <div class="equipment-health-container">
    <!-- 查询条件 -->
    <health-search :value="queryParams" @search="handleSearch" />

    <!-- 统计摘要 -->
    <health-summary :summary="summary" />

    <!-- 图表展示 -->
    <health-charts
      :summary="summary"
      :equipment-health="equipmentHealth"
    />

    <!-- 设备健康度列表 -->
    <health-table
      :table-data="equipmentHealth"
      :loading="loading"
      @show-algorithm="showAlgorithmDialog"
      @view-detail="handleViewDetail"
    />

    <!-- 算法说明弹窗 -->
    <algorithm-dialog :visible.sync="algorithmDialogVisible" />

    <!-- 健康度详情弹窗 -->
    <health-detail-dialog
      :visible.sync="detailDialogVisible"
      :equipment="currentEquipment"
    />
  </div>
</template>

<script>
import HealthSearch from './components/HealthSearch.vue'
import HealthSummary from './components/HealthSummary.vue'
import HealthCharts from './components/HealthCharts.vue'
import HealthTable from './components/HealthTable.vue'
import AlgorithmDialog from './components/AlgorithmDialog.vue'
import HealthDetailDialog from './components/HealthDetailDialog.vue'
import { getEquipmentHealth } from './api'

export default {
  name: 'EquipmentHealth',
  components: {
    HealthSearch,
    HealthSummary,
    HealthCharts,
    HealthTable,
    AlgorithmDialog,
    HealthDetailDialog
  },
  data() {
    return {
      loading: false,
      queryParams: {
        equipmentType: '',
        limit: 20,
        sortBy: 'healthScore',
        sortOrder: 'asc'
      },
      summary: {
        totalEquipment: 0,
        avgHealthScore: 0,
        levelStats: {
          '优秀': 0,
          '良好': 0,
          '一般': 0,
          '差': 0
        }
      },
      equipmentHealth: [],
      algorithmDialogVisible: false,
      detailDialogVisible: false,
      currentEquipment: null
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      this.loading = true
      try {
        const params = {}
        if (this.queryParams.equipmentType) {
          params.equipmentType = this.queryParams.equipmentType
        }
        if (this.queryParams.limit) {
          params.limit = this.queryParams.limit
        }
        if (this.queryParams.sortBy) {
          params.sortBy = this.queryParams.sortBy
        }
        if (this.queryParams.sortOrder) {
          params.sortOrder = this.queryParams.sortOrder
        }

        const response = await getEquipmentHealth(params)
        if (response.success) {
          this.summary = response.data.summary
          this.equipmentHealth = response.data.equipmentHealth
          this.$message.success(response.message || '获取设备健康度评分成功')
        }
      } catch (error) {
        console.error('获取设备健康度评分失败:', error)
        this.$message.error(error.message || '获取设备健康度评分失败')
      } finally {
        this.loading = false
      }
    },
    handleSearch(params) {
      this.queryParams = { ...this.queryParams, ...params }
      this.fetchData()
    },
    showAlgorithmDialog() {
      this.algorithmDialogVisible = true
    },
    handleViewDetail(equipment) {
      this.currentEquipment = equipment
      this.detailDialogVisible = true
    }
  }
}
</script>

<style lang="scss" scoped>
.equipment-health-container {
  padding: 16px;
  background: #f5f7fa;
  min-height: calc(100vh - 84px);
}
</style>

