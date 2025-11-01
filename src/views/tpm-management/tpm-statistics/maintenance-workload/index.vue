<!--
  文件名称：index.vue
  文件描述：维护工作量统计主页面
  创建日期：2024-01-20
  修改记录：
    - 2024-01-20: 初始创建
-->

<template>
  <div class="maintenance-workload-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">
        <i class="el-icon-s-data" />
        维护工作量统计
      </h2>
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/tpm-management' }">TPM管理</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/tpm-management/statistics' }">统计分析</el-breadcrumb-item>
        <el-breadcrumb-item>维护工作量统计</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 查询条件区域 -->
    <el-card class="search-card" shadow="never">
      <el-form
        ref="queryForm"
        :model="queryParams"
        :inline="true"
        label-width="100px"
        class="query-form"
      >
        <el-row :gutter="16">
          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <el-form-item
              label="开始日期"
              prop="startDate"
              :rules="[{ required: true, message: '请选择开始日期', trigger: 'change' }]"
            >
              <el-date-picker
                v-model="queryParams.startDate"
                type="date"
                placeholder="选择开始日期"
                value-format="yyyy-MM-dd"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <el-form-item
              label="结束日期"
              prop="endDate"
              :rules="[{ required: true, message: '请选择结束日期', trigger: 'change' }]"
            >
              <el-date-picker
                v-model="queryParams.endDate"
                type="date"
                placeholder="选择结束日期"
                value-format="yyyy-MM-dd"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <el-form-item label="维护人员" prop="assigneeId">
              <el-input
                v-model="queryParams.assigneeId"
                placeholder="请输入维护人员ID"
                clearable
                style="width: 100%"
              />
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <el-form-item label="设备类型" prop="equipmentType">
              <el-select
                v-model="queryParams.equipmentType"
                placeholder="请选择设备类型"
                clearable
                style="width: 100%"
              >
                <el-option
                  v-for="item in equipmentTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <el-form-item label="时间粒度" prop="timePeriod">
              <el-select
                v-model="queryParams.timePeriod"
                placeholder="请选择时间粒度"
                style="width: 100%"
              >
                <el-option
                  v-for="item in timePeriodOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <el-form-item label="分组方式" prop="groupBy">
              <el-select
                v-model="queryParams.groupBy"
                placeholder="请选择分组方式"
                style="width: 100%"
                @change="handleGroupByChange"
              >
                <el-option
                  v-for="item in groupByOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="24" :md="24" :lg="6">
            <el-form-item label-width="0">
              <el-button
                type="primary"
                icon="el-icon-search"
                :loading="loading"
                @click="handleQuery"
              >
                查询
              </el-button>
              <el-button
                icon="el-icon-refresh-left"
                @click="handleReset"
              >
                重置
              </el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 数据加载状态 -->
    <div v-loading="loading" style="min-height: 200px;">
      <template v-if="!loading && statisticsData">
        <!-- 工作量统计汇总 -->
        <workload-summary :summary="statisticsData.summary" />

        <!-- 工作量趋势分析 -->
        <workload-trend
          :trend-data="statisticsData.workloadTrend"
          :time-period="queryParams.timePeriod"
        />

        <!-- 分组工作量统计表格 -->
        <workload-table
          :workload-data="statisticsData.workloadByGroup"
          :group-by="queryParams.groupBy"
          :show-balance-analysis="queryParams.groupBy === 'assignee'"
        />

        <!-- 分组工作量对比图表 -->
        <workload-comparison-chart
          :workload-data="statisticsData.workloadByGroup"
          :group-by="queryParams.groupBy"
        />

        <!-- 仅在按人员分组时显示以下组件 -->
        <template v-if="queryParams.groupBy === 'assignee'">
          <!-- 工作量均衡度分析 -->
          <workload-balance-analysis
            :workload-data="statisticsData.workloadByGroup"
            :group-by="queryParams.groupBy"
          />

          <!-- 人员工作量排名 -->
          <assignee-ranking
            :workload-data="statisticsData.workloadByGroup"
            :group-by="queryParams.groupBy"
          />
        </template>

        <!-- 平均工时对比分析 -->
        <avg-work-hours-comparison
          :workload-data="statisticsData.workloadByGroup"
          :group-by="queryParams.groupBy"
        />
      </template>

      <!-- 空状态 -->
      <div v-if="!loading && !statisticsData" class="empty-state">
        <i class="el-icon-info" />
        <p>请选择查询条件后点击"查询"按钮</p>
      </div>
    </div>
  </div>
</template>

<script>
import { getMaintenanceWorkload } from './api'
import {
  EQUIPMENT_TYPE_OPTIONS,
  TIME_PERIOD_OPTIONS,
  GROUP_BY_OPTIONS
} from './constants/maintenance-workload'
import WorkloadSummary from './components/WorkloadSummary.vue'
import WorkloadTrend from './components/WorkloadTrend.vue'
import WorkloadTable from './components/WorkloadTable.vue'
import WorkloadComparisonChart from './components/WorkloadComparisonChart.vue'
import WorkloadBalanceAnalysis from './components/WorkloadBalanceAnalysis.vue'
import AssigneeRanking from './components/AssigneeRanking.vue'
import AvgWorkHoursComparison from './components/AvgWorkHoursComparison.vue'

export default {
  name: 'MaintenanceWorkload',
  components: {
    WorkloadSummary,
    WorkloadTrend,
    WorkloadTable,
    WorkloadComparisonChart,
    WorkloadBalanceAnalysis,
    AssigneeRanking,
    AvgWorkHoursComparison
  },
  data() {
    // 设置默认时间范围为最近3个月
    const endDate = new Date()
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - 3)

    return {
      loading: false,
      queryParams: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        assigneeId: '',
        equipmentType: '',
        timePeriod: '月',
        groupBy: 'assignee'
      },
      equipmentTypeOptions: EQUIPMENT_TYPE_OPTIONS,
      timePeriodOptions: TIME_PERIOD_OPTIONS,
      groupByOptions: GROUP_BY_OPTIONS,
      statisticsData: null
    }
  },
  created() {
    // 页面加载时自动查询
    this.fetchStatistics()
  },
  methods: {
    /**
     * 查询统计数据
     */
    async fetchStatistics() {
      this.$refs.queryForm.validate(async(valid) => {
        if (!valid) {
          return
        }

        // 验证日期范围
        if (new Date(this.queryParams.endDate) < new Date(this.queryParams.startDate)) {
          this.$message.warning('结束日期不能早于开始日期')
          return
        }

        this.loading = true
        try {
          // 构建请求参数
          const params = {
            startDate: this.queryParams.startDate,
            endDate: this.queryParams.endDate,
            timePeriod: this.queryParams.timePeriod,
            groupBy: this.queryParams.groupBy
          }

          // 添加可选参数
          if (this.queryParams.assigneeId) {
            params.assigneeId = this.queryParams.assigneeId
          }
          if (this.queryParams.equipmentType) {
            params.equipmentType = this.queryParams.equipmentType
          }

          const response = await getMaintenanceWorkload(params)

          if (response.success && response.data) {
            this.statisticsData = response.data
            this.$message.success(response.message || '获取维护工作量统计成功')
          } else {
            this.$message.error(response.message || '获取维护工作量统计失败')
          }
        } catch (error) {
          console.error('获取维护工作量统计失败:', error)
          this.$message.error(error.message || '获取维护工作量统计失败，请稍后重试')
        } finally {
          this.loading = false
        }
      })
    },
    /**
     * 处理查询按钮点击
     */
    handleQuery() {
      this.fetchStatistics()
    },
    /**
     * 处理重置按钮点击
     */
    handleReset() {
      this.$refs.queryForm.resetFields()
      // 重新设置默认时间范围
      const endDate = new Date()
      const startDate = new Date()
      startDate.setMonth(startDate.getMonth() - 3)
      this.queryParams.startDate = startDate.toISOString().split('T')[0]
      this.queryParams.endDate = endDate.toISOString().split('T')[0]
      this.queryParams.timePeriod = '月'
      this.queryParams.groupBy = 'assignee'
      this.statisticsData = null
    },
    /**
     * 处理分组方式变更
     */
    handleGroupByChange() {
      // 分组方式变更时，如果已有数据则重新查询
      if (this.statisticsData) {
        this.fetchStatistics()
      }
    }
  }
}
</script>

<style scoped lang="scss">
.maintenance-workload-container {
  padding: 20px;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .page-title {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: #303133;

      i {
        margin-right: 12px;
        color: #409EFF;
        vertical-align: middle;
      }
    }
  }

  .search-card {
    margin-bottom: 16px;

    .query-form {
      .el-form-item {
        margin-bottom: 16px;
      }
    }
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 100px 20px;
    color: #909399;

    i {
      font-size: 80px;
      margin-bottom: 20px;
    }

    p {
      font-size: 16px;
      margin: 0;
    }
  }
}

@media screen and (max-width: 768px) {
  .maintenance-workload-container {
    padding: 12px;

    .page-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;

      .page-title {
        font-size: 20px;
      }
    }
  }
}
</style>

