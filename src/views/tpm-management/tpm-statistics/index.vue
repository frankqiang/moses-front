<!--
文件名称：index.vue
文件描述：TPM综合看板主页面
创建日期：2024-01-20
修改记录：
  - 2024-01-20: 初始创建
-->

<template>
  <div class="tpm-dashboard-container">
    <!-- 页面头部 -->
    <div class="dashboard-header">
      <div class="header-left">
        <h2 class="page-title">TPM综合看板</h2>
        <div v-if="reportPeriod.startDate" class="report-period">
          <i class="el-icon-date" />
          <span>统计期间：{{ reportPeriod.startDate }} 至 {{ reportPeriod.endDate }}</span>
        </div>
      </div>

      <div class="header-right">
        <!-- 设备类型筛选 -->
        <el-select
          v-model="selectedEquipmentType"
          placeholder="请选择设备类型"
          clearable
          class="filter-select"
          @change="handleEquipmentTypeChange"
        >
          <el-option
            v-for="item in equipmentTypes"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>

        <!-- 自动刷新设置 -->
        <el-dropdown trigger="click" @command="handleRefreshIntervalChange">
          <el-button icon="el-icon-setting" circle />
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              v-for="item in refreshIntervals"
              :key="item.value"
              :command="item.value"
              :divided="item.value === 0"
            >
              <i v-if="item.value === refreshInterval" class="el-icon-check" />
              {{ item.label }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>

        <!-- 刷新按钮 -->
        <el-button
          type="primary"
          icon="el-icon-refresh"
          :loading="loading"
          @click="fetchDashboardData"
        >
          刷新
        </el-button>
      </div>
    </div>

    <!-- 卡片网格 -->
    <div v-loading="loading" class="dashboard-content">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
          <equipment-overview-card :data="dashboardData.equipmentOverview" />
        </el-col>

        <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
          <maintenance-overview-card :data="dashboardData.maintenanceOverview" />
        </el-col>

        <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
          <failure-overview-card :data="dashboardData.failureOverview" />
        </el-col>

        <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
          <spare-part-overview-card :data="dashboardData.sparePartOverview" />
        </el-col>
      </el-row>
    </div>

    <!-- 最后更新时间 -->
    <div v-if="lastUpdateTime" class="dashboard-footer">
      <span class="update-time">
        <i class="el-icon-time" />
        最后更新：{{ lastUpdateTime }}
      </span>
      <span v-if="refreshInterval > 0" class="next-refresh">
        <i class="el-icon-timer" />
        下次刷新：{{ nextRefreshTime }}
      </span>
    </div>
  </div>
</template>

<script>
import { getDashboardData } from './api/tpm-statistics'
import EquipmentOverviewCard from './components/EquipmentOverviewCard'
import MaintenanceOverviewCard from './components/MaintenanceOverviewCard'
import FailureOverviewCard from './components/FailureOverviewCard'
import SparePartOverviewCard from './components/SparePartOverviewCard'
import { EQUIPMENT_TYPES, REFRESH_INTERVALS, DEFAULT_REFRESH_INTERVAL } from './constants'

export default {
  name: 'TpmDashboard',

  components: {
    EquipmentOverviewCard,
    MaintenanceOverviewCard,
    FailureOverviewCard,
    SparePartOverviewCard
  },

  data() {
    return {
      loading: false,
      selectedEquipmentType: '',
      equipmentTypes: EQUIPMENT_TYPES,
      refreshIntervals: REFRESH_INTERVALS,
      refreshInterval: DEFAULT_REFRESH_INTERVAL,
      refreshTimer: null,
      lastUpdateTime: '',
      nextRefreshTime: '',
      dashboardData: {
        equipmentOverview: {
          totalEquipment: 0,
          runningEquipment: 0,
          maintenanceEquipment: 0,
          faultEquipment: 0,
          availabilityRate: '0.00'
        },
        maintenanceOverview: {
          totalTasks: 0,
          completedTasks: 0,
          inProgressTasks: 0,
          overdueTasks: 0,
          completionRate: '0.00'
        },
        failureOverview: {
          totalFailures: 0,
          severeFailures: 0,
          resolvedFailures: 0,
          resolutionRate: '0.00'
        },
        sparePartOverview: {
          totalTransactions: 0,
          totalQuantity: 0,
          totalCost: '0.00',
          lowStockCount: 0
        }
      },
      reportPeriod: {
        startDate: '',
        endDate: '',
        timePeriod: '月'
      }
    }
  },

  mounted() {
    this.fetchDashboardData()
    this.startAutoRefresh()
  },

  beforeDestroy() {
    this.stopAutoRefresh()
  },

  methods: {
    /**
     * 获取看板数据
     */
    async fetchDashboardData() {
      this.loading = true
      try {
        const params = {}
        if (this.selectedEquipmentType) {
          params.equipmentType = this.selectedEquipmentType
        }

        const response = await getDashboardData(params)

        if (response.success) {
          const { data } = response
          this.dashboardData = {
            equipmentOverview: data.equipmentOverview || this.dashboardData.equipmentOverview,
            maintenanceOverview: data.maintenanceOverview || this.dashboardData.maintenanceOverview,
            failureOverview: data.failureOverview || this.dashboardData.failureOverview,
            sparePartOverview: data.sparePartOverview || this.dashboardData.sparePartOverview
          }
          this.reportPeriod = data.reportPeriod || this.reportPeriod

          // 更新最后更新时间
          this.lastUpdateTime = this.formatDateTime(new Date())

          // 计算下次刷新时间
          if (this.refreshInterval > 0) {
            this.calculateNextRefreshTime()
          }

          this.$message.success(response.message || '数据加载成功')
        }
      } catch (error) {
        console.error('获取看板数据失败:', error)
        this.$message.error(error.message || '获取看板数据失败')
      } finally {
        this.loading = false
      }
    },

    /**
     * 处理设备类型筛选变化
     */
    handleEquipmentTypeChange() {
      this.fetchDashboardData()
    },

    /**
     * 处理刷新间隔变化
     */
    handleRefreshIntervalChange(interval) {
      this.refreshInterval = interval
      this.stopAutoRefresh()
      if (interval > 0) {
        this.startAutoRefresh()
        this.$message.success(`已设置自动刷新间隔为${interval}分钟`)
      } else {
        this.$message.info('已关闭自动刷新')
      }
    },

    /**
     * 启动自动刷新
     */
    startAutoRefresh() {
      if (this.refreshInterval > 0) {
        this.refreshTimer = setInterval(() => {
          this.fetchDashboardData()
        }, this.refreshInterval * 60 * 1000)
      }
    },

    /**
     * 停止自动刷新
     */
    stopAutoRefresh() {
      if (this.refreshTimer) {
        clearInterval(this.refreshTimer)
        this.refreshTimer = null
      }
    },

    /**
     * 计算下次刷新时间
     */
    calculateNextRefreshTime() {
      if (this.refreshInterval > 0) {
        const nextTime = new Date()
        nextTime.setMinutes(nextTime.getMinutes() + this.refreshInterval)
        this.nextRefreshTime = this.formatDateTime(nextTime)
      } else {
        this.nextRefreshTime = ''
      }
    },

    /**
     * 格式化日期时间
     */
    formatDateTime(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    }
  }
}
</script>

<style lang="scss" scoped>
.tpm-dashboard-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 84px);

  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 20px;
    background-color: #ffffff;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

    .header-left {
      .page-title {
        margin: 0 0 8px 0;
        font-size: 24px;
        font-weight: 600;
        color: #303133;
      }

      .report-period {
        display: flex;
        align-items: center;
        font-size: 14px;
        color: #606266;

        i {
          margin-right: 4px;
        }
      }
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 12px;

      .filter-select {
        width: 200px;
      }
    }
  }

  .dashboard-content {
    .el-col {
      margin-bottom: 20px;
    }
  }

  .dashboard-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 20px;
    padding: 12px 20px;
    background-color: #ffffff;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    font-size: 14px;
    color: #909399;

    .update-time,
    .next-refresh {
      display: flex;
      align-items: center;

      i {
        margin-right: 4px;
      }
    }
  }
}

// 响应式布局优化
@media screen and (max-width: 1200px) {
  .tpm-dashboard-container {
    .dashboard-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;

      .header-right {
        width: 100%;
        justify-content: flex-end;
      }
    }
  }
}

@media screen and (min-width: 1920px) {
  .tpm-dashboard-container {
    max-width: 1920px;
    margin: 0 auto;
  }
}
</style>

