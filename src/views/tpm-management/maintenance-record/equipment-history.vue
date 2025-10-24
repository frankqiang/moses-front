<!--
  文件名称: equipment-history.vue
  文件描述: 设备维护历史查询页面 - 展示指定设备的所有维护记录
  创建日期: 2025-01-20
  修改记录:
    - 2025-01-20: 初始创建，实现设备维护历史查询、筛选、统计和导出功能
-->

<template>
  <div class="app-container equipment-history-container">
    <!-- 设备选择器 -->
    <el-card class="equipment-selector-card" shadow="never">
      <div class="equipment-selector-header">
        <h3 class="section-title">
          <i class="el-icon-s-operation" />
          设备选择
        </h3>
      </div>
      <el-form :inline="true" class="equipment-selector-form">
        <el-form-item label="选择设备">
          <el-select
            v-model="selectedEquipmentId"
            filterable
            clearable
            placeholder="请选择要查询的设备"
            style="width: 400px"
            @change="handleEquipmentChange"
          >
            <el-option
              v-for="item in equipmentOptions"
              :key="item.value"
              :label="`${item.equipmentCode} - ${item.name} (${item.equipmentType})`"
              :value="item.value"
            >
              <span style="float: left">{{ item.equipmentCode }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{ item.name }}</span>
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 设备信息和统计数据 -->
    <el-card v-if="equipmentInfo" class="equipment-info-card" shadow="never">
      <div class="equipment-info-header">
        <div class="equipment-basic-info">
          <h3 class="equipment-name">
            <i class="el-icon-s-platform" />
            {{ equipmentInfo.name }}
            <el-tag type="info" size="small">{{ equipmentInfo.equipmentCode }}</el-tag>
            <el-tag type="primary" size="small">{{ equipmentInfo.equipmentType }}</el-tag>
          </h3>
        </div>
        <div class="equipment-actions">
          <el-button
            type="primary"
            size="small"
            icon="el-icon-download"
            :loading="exportLoading"
            @click="handleExport"
          >
            导出维护履历
          </el-button>
        </div>
      </div>

      <!-- 统计数据 -->
      <div class="statistics-section">
        <el-row :gutter="16">
          <el-col :span="6">
            <div class="statistic-card">
              <div class="statistic-icon total">
                <i class="el-icon-document" />
              </div>
              <div class="statistic-content">
                <div class="statistic-value">{{ statistics.totalCount }}</div>
                <div class="statistic-label">总维护次数</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="statistic-card">
              <div class="statistic-icon hours">
                <i class="el-icon-time" />
              </div>
              <div class="statistic-content">
                <div class="statistic-value">{{ statistics.totalWorkHours }}</div>
                <div class="statistic-label">总维护工时（小时）</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="statistic-card">
              <div class="statistic-icon daily">
                <i class="el-icon-info" />
              </div>
              <div class="statistic-content">
                <div class="statistic-value">{{ statistics.dailyMaintenanceCount }}</div>
                <div class="statistic-label">日常保养次数</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="statistic-card">
              <div class="statistic-icon periodic">
                <i class="el-icon-s-check" />
              </div>
              <div class="statistic-content">
                <div class="statistic-value">{{ statistics.periodicCheckCount }}</div>
                <div class="statistic-label">定期检查次数</div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <!-- 筛选条件 -->
    <el-card v-if="equipmentInfo" class="filter-card" shadow="never">
      <el-form :inline="true" class="filter-form">
        <el-form-item label="维护类型">
          <el-select
            v-model="filterParams.maintenanceType"
            clearable
            placeholder="全部类型"
            style="width: 150px"
            @change="handleFilterChange"
          >
            <el-option
              v-for="item in maintenanceTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="维护日期">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
            style="width: 300px"
            @change="handleDateRangeChange"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="loadMaintenanceHistory">
            查询
          </el-button>
          <el-button icon="el-icon-refresh" @click="handleReset">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 维护历史时间线 -->
    <el-card v-if="equipmentInfo" class="timeline-card" shadow="never">
      <div class="timeline-header">
        <h3 class="section-title">
          <i class="el-icon-time" />
          维护历史记录
          <span class="record-count">（共 {{ pagination.totalResults }} 条记录）</span>
        </h3>
      </div>

      <!-- 加载状态 -->
      <div v-loading="loading" class="timeline-container">
        <!-- 空状态 -->
        <el-empty v-if="!loading && maintenanceRecords.length === 0" description="暂无维护记录" />

        <!-- 维护记录时间线 -->
        <el-timeline v-else class="maintenance-timeline">
          <el-timeline-item
            v-for="record in maintenanceRecords"
            :key="record.id"
            :timestamp="formatMaintenanceDate(record.maintenanceDate)"
            placement="top"
            :color="getTimelineColor(record.maintenanceType)"
          >
            <maintenance-record-card
              :record="record"
              @click="handleCardClick(record)"
            />
          </el-timeline-item>
        </el-timeline>

        <!-- 分页 -->
        <div v-if="pagination.totalResults > 0" class="pagination-container">
          <el-pagination
            :current-page="pagination.page"
            :page-sizes="[10, 20, 30, 50]"
            :page-size="pagination.limit"
            :total="pagination.totalResults"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </el-card>

    <!-- 维护趋势图表（P1功能） -->
    <el-card v-if="equipmentInfo && showTrendChart" class="trend-chart-card" shadow="never">
      <div class="chart-header">
        <h3 class="section-title">
          <i class="el-icon-s-data" />
          维护趋势分析
        </h3>
      </div>
      <maintenance-trend-chart :equipment-id="selectedEquipmentId" :records="allRecords" />
    </el-card>
  </div>
</template>

<script>
import { getEquipmentMaintenanceHistory } from './api/maintenance-record'
import { MAINTENANCE_TYPE_OPTIONS } from './constants/maintenance-record'
import MaintenanceRecordCard from './components/MaintenanceRecordCard.vue'
import MaintenanceTrendChart from './components/MaintenanceTrendChart.vue'
import { parseTime } from '@/utils'
import * as XLSX from 'xlsx'

export default {
  name: 'EquipmentMaintenanceHistory',
  components: {
    MaintenanceRecordCard,
    MaintenanceTrendChart
  },
  data() {
    return {
      // 设备选择
      selectedEquipmentId: '',
      equipmentOptions: [],
      equipmentInfo: null,

      // 维护记录数据
      maintenanceRecords: [],
      allRecords: [], // 用于图表展示的全部记录

      // 筛选参数
      filterParams: {
        maintenanceType: ''
      },
      dateRange: null,

      // 分页
      pagination: {
        page: 1,
        limit: 10,
        totalPages: 0,
        totalResults: 0
      },

      // 统计数据
      statistics: {
        totalCount: 0,
        totalWorkHours: 0,
        dailyMaintenanceCount: 0,
        periodicCheckCount: 0,
        overhaulCount: 0,
        specialMaintenanceCount: 0
      },

      // 状态
      loading: false,
      exportLoading: false,
      showTrendChart: true,

      // 常量
      maintenanceTypeOptions: MAINTENANCE_TYPE_OPTIONS
    }
  },
  mounted() {
    this.loadEquipmentOptions()
    // 如果URL中带有equipmentId参数，自动加载该设备的维护历史
    if (this.$route.query.equipmentId) {
      this.selectedEquipmentId = this.$route.query.equipmentId
      this.handleEquipmentChange(this.selectedEquipmentId)
    }
  },
  methods: {
    /**
     * 加载设备选项列表
     */
    async loadEquipmentOptions() {
      try {
        // TODO: 替换为实际的设备列表接口
        // 临时mock数据
        this.equipmentOptions = [
          {
            value: '660e8400-e29b-41d4-a716-446655440001',
            equipmentCode: 'AF001',
            name: '退火炉1号',
            equipmentType: '退火炉'
          },
          {
            value: '660e8400-e29b-41d4-a716-446655440002',
            equipmentCode: 'AF002',
            name: '退火炉2号',
            equipmentType: '退火炉'
          }
        ]
      } catch (error) {
        console.error('加载设备列表失败:', error)
        this.$message.error('加载设备列表失败')
      }
    },

    /**
     * 处理设备选择变化
     */
    handleEquipmentChange(equipmentId) {
      if (!equipmentId) {
        this.equipmentInfo = null
        this.maintenanceRecords = []
        return
      }

      // 获取设备信息
      const equipment = this.equipmentOptions.find(item => item.value === equipmentId)
      if (equipment) {
        this.equipmentInfo = {
          id: equipment.value,
          equipmentCode: equipment.equipmentCode,
          name: equipment.name,
          equipmentType: equipment.equipmentType
        }
      }

      // 重置筛选条件和分页
      this.resetFilters()

      // 加载维护历史
      this.loadMaintenanceHistory()
    },

    /**
     * 加载维护历史记录
     */
    async loadMaintenanceHistory() {
      if (!this.selectedEquipmentId) {
        return
      }

      this.loading = true
      try {
        const params = {
          page: this.pagination.page,
          limit: this.pagination.limit
        }

        // 添加筛选条件
        if (this.filterParams.maintenanceType) {
          params.maintenanceType = this.filterParams.maintenanceType
        }
        if (this.dateRange && this.dateRange.length === 2) {
          params.startDate = this.dateRange[0]
          params.endDate = this.dateRange[1]
        }

        const response = await getEquipmentMaintenanceHistory(this.selectedEquipmentId, params)

        if (response && response.data) {
          const { results, page, limit, totalPages, totalResults } = response.data

          this.maintenanceRecords = results || []
          this.pagination = {
            page,
            limit,
            totalPages,
            totalResults
          }

          // 计算统计数据
          this.calculateStatistics()

          // 如果是第一页，加载全部记录用于图表展示
          if (page === 1) {
            this.loadAllRecordsForChart()
          }
        }
      } catch (error) {
        console.error('加载维护历史失败:', error)
        this.$message.error(error.message || '加载维护历史失败')
      } finally {
        this.loading = false
      }
    },

    /**
     * 加载全部记录用于图表展示
     */
    async loadAllRecordsForChart() {
      try {
        const params = {
          page: 1,
          limit: 1000 // 获取足够多的记录用于图表展示
        }

        // 添加筛选条件
        if (this.filterParams.maintenanceType) {
          params.maintenanceType = this.filterParams.maintenanceType
        }
        if (this.dateRange && this.dateRange.length === 2) {
          params.startDate = this.dateRange[0]
          params.endDate = this.dateRange[1]
        }

        const response = await getEquipmentMaintenanceHistory(this.selectedEquipmentId, params)

        if (response && response.data && response.data.results) {
          this.allRecords = response.data.results
        }
      } catch (error) {
        console.error('加载图表数据失败:', error)
      }
    },

    /**
     * 计算统计数据
     */
    calculateStatistics() {
      const records = this.maintenanceRecords

      this.statistics.totalCount = this.pagination.totalResults

      // 计算总工时
      let totalWorkHours = 0
      let dailyCount = 0
      let periodicCount = 0
      let overhaulCount = 0
      let specialCount = 0

      records.forEach(record => {
        // 累加工时
        if (record.workHours) {
          totalWorkHours += parseFloat(record.workHours)
        }

        // 统计各类型维护次数
        switch (record.maintenanceType) {
          case '日常保养':
            dailyCount++
            break
          case '定期检查':
            periodicCount++
            break
          case '大修':
            overhaulCount++
            break
          case '专项维护':
            specialCount++
            break
        }
      })

      this.statistics.totalWorkHours = totalWorkHours.toFixed(2)
      this.statistics.dailyMaintenanceCount = dailyCount
      this.statistics.periodicCheckCount = periodicCount
      this.statistics.overhaulCount = overhaulCount
      this.statistics.specialMaintenanceCount = specialCount
    },

    /**
     * 处理筛选条件变化
     */
    handleFilterChange() {
      this.pagination.page = 1
      this.loadMaintenanceHistory()
    },

    /**
     * 处理日期范围变化
     */
    handleDateRangeChange() {
      this.pagination.page = 1
      this.loadMaintenanceHistory()
    },

    /**
     * 重置筛选条件
     */
    handleReset() {
      this.filterParams.maintenanceType = ''
      this.dateRange = null
      this.pagination.page = 1
      this.loadMaintenanceHistory()
    },

    /**
     * 重置所有筛选条件
     */
    resetFilters() {
      this.filterParams = {
        maintenanceType: ''
      }
      this.dateRange = null
      this.pagination = {
        page: 1,
        limit: 10,
        totalPages: 0,
        totalResults: 0
      }
    },

    /**
     * 处理每页数量变化
     */
    handleSizeChange(size) {
      this.pagination.limit = size
      this.pagination.page = 1
      this.loadMaintenanceHistory()
    },

    /**
     * 处理页码变化
     */
    handleCurrentChange(page) {
      this.pagination.page = page
      this.loadMaintenanceHistory()
    },

    /**
     * 处理卡片点击 - 跳转到详情页
     */
    handleCardClick(record) {
      this.$router.push({
        path: `/mdm/tpm/maintenance-records/${record.id}`
      })
    },

    /**
     * 导出维护履历
     */
    async handleExport() {
      if (!this.selectedEquipmentId) {
        this.$message.warning('请先选择设备')
        return
      }

      this.exportLoading = true
      try {
        // 获取全部记录
        const params = {
          page: 1,
          limit: 10000 // 获取所有记录
        }

        // 添加筛选条件
        if (this.filterParams.maintenanceType) {
          params.maintenanceType = this.filterParams.maintenanceType
        }
        if (this.dateRange && this.dateRange.length === 2) {
          params.startDate = this.dateRange[0]
          params.endDate = this.dateRange[1]
        }

        const response = await getEquipmentMaintenanceHistory(this.selectedEquipmentId, params)

        if (response && response.data && response.data.results) {
          const records = response.data.results

          // 构建Excel数据
          const excelData = records.map((record, index) => ({
            '序号': index + 1,
            '维护记录编码': record.recordCode,
            '维护日期': this.formatMaintenanceDate(record.maintenanceDate),
            '维护类型': record.maintenanceType,
            '维护内容': record.maintenanceContent,
            '发现问题': record.problemFound || '-',
            '处理措施': record.solutionApplied || '-',
            '维护工时': record.workHours ? `${record.workHours}小时` : '-',
            '执行人员': record.executor ? record.executor.name : '-',
            '确认人员': record.confirmer ? record.confirmer.name : '-',
            '维护前状态': record.equipmentStatusBefore || '-',
            '维护后状态': record.equipmentStatusAfter || '-'
          }))

          // 创建工作簿
          const ws = XLSX.utils.json_to_sheet(excelData)
          const wb = XLSX.utils.book_new()
          XLSX.utils.book_append_sheet(wb, ws, '维护履历')

          // 生成文件名
          const fileName = `${this.equipmentInfo.equipmentCode}_维护履历_${parseTime(new Date(), '{y}{m}{d}')}.xlsx`

          // 导出文件
          XLSX.writeFile(wb, fileName)

          this.$message.success('导出成功')
        }
      } catch (error) {
        console.error('导出失败:', error)
        this.$message.error(error.message || '导出失败')
      } finally {
        this.exportLoading = false
      }
    },

    /**
     * 格式化维护日期
     */
    formatMaintenanceDate(date) {
      return parseTime(date, '{y}-{m}-{d} {h}:{i}')
    },

    /**
     * 获取时间线颜色
     */
    getTimelineColor(maintenanceType) {
      const colorMap = {
        '日常保养': '#409EFF',
        '定期检查': '#67C23A',
        '大修': '#E6A23C',
        '专项维护': '#F56C6C'
      }
      return colorMap[maintenanceType] || '#909399'
    }
  }
}
</script>

<style lang="scss" scoped>
.equipment-history-container {
  padding: 20px;

  .el-card {
    margin-bottom: 20px;
    border-radius: 8px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .section-title {
    margin: 0;
    font-size: 16px;
    font-weight: 500;
    color: #303133;

    i {
      margin-right: 8px;
      color: #409EFF;
    }

    .record-count {
      margin-left: 8px;
      font-size: 14px;
      font-weight: normal;
      color: #909399;
    }
  }
}

// 设备选择器样式
.equipment-selector-card {
  .equipment-selector-header {
    margin-bottom: 16px;
  }

  .equipment-selector-form {
    margin-bottom: 0;

    ::v-deep .el-form-item {
      margin-bottom: 0;
    }
  }
}

// 设备信息卡片样式
.equipment-info-card {
  .equipment-info-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .equipment-basic-info {
    .equipment-name {
      margin: 0;
      font-size: 18px;
      font-weight: 500;
      color: #303133;

      i {
        margin-right: 8px;
        color: #409EFF;
      }

      .el-tag {
        margin-left: 8px;
      }
    }
  }

  .equipment-actions {
    display: flex;
    gap: 8px;
  }
}

// 统计数据样式
.statistics-section {
  .statistic-card {
    display: flex;
    align-items: center;
    padding: 20px;
    background: linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%);
    border-radius: 8px;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .statistic-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 56px;
      height: 56px;
      margin-right: 16px;
      border-radius: 12px;

      i {
        font-size: 28px;
        color: #fff;
      }

      &.total {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      &.hours {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      }

      &.daily {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      }

      &.periodic {
        background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
      }
    }

    .statistic-content {
      flex: 1;

      .statistic-value {
        font-size: 28px;
        font-weight: 600;
        color: #303133;
        line-height: 1.2;
      }

      .statistic-label {
        margin-top: 4px;
        font-size: 14px;
        color: #909399;
      }
    }
  }
}

// 筛选表单样式
.filter-card {
  .filter-form {
    margin-bottom: 0;

    ::v-deep .el-form-item {
      margin-bottom: 0;
    }
  }
}

// 时间线样式
.timeline-card {
  .timeline-header {
    margin-bottom: 20px;
  }

  .timeline-container {
    min-height: 300px;

    .maintenance-timeline {
      padding: 20px 0;

      ::v-deep .el-timeline-item {
        padding-bottom: 24px;

        &:last-child {
          padding-bottom: 0;
        }

        .el-timeline-item__timestamp {
          font-size: 14px;
          font-weight: 500;
          color: #606266;
        }
      }
    }
  }

  .pagination-container {
    display: flex;
    justify-content: flex-end;
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px solid #EBEEF5;
  }
}

// 趋势图表样式
.trend-chart-card {
  .chart-header {
    margin-bottom: 20px;
  }
}

// 响应式布局
@media screen and (max-width: 768px) {
  .equipment-history-container {
    padding: 12px;

    .equipment-info-header {
      flex-direction: column;
      align-items: flex-start;

      .equipment-actions {
        margin-top: 12px;
      }
    }

    .statistics-section {
      .el-col {
        margin-bottom: 12px;
      }
    }
  }
}
</style>

