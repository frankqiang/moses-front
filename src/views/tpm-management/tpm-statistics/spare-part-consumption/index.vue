<template>
  <div class="spare-part-consumption-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">
        <i class="el-icon-coin" />
        备件消耗分析
      </h2>
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/tpm-management' }">TPM管理</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/tpm-management/statistics' }">统计分析</el-breadcrumb-item>
        <el-breadcrumb-item>备件消耗分析</el-breadcrumb-item>
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
            <el-form-item label="排序方式" prop="sortBy">
              <el-select
                v-model="queryParams.sortBy"
                placeholder="请选择排序方式"
                style="width: 100%"
                @change="handleSortChange"
              >
                <el-option
                  v-for="item in sortByOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="24" class="form-actions">
            <el-button
              type="primary"
              icon="el-icon-search"
              :loading="loading"
              @click="handleQuery"
            >
              查询
            </el-button>
            <el-button
              icon="el-icon-refresh"
              @click="handleReset"
            >
              重置
            </el-button>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 高消耗预警提示（P1第7项） -->
    <el-alert
      v-if="showHighConsumptionAlert"
      :title="`发现 ${highConsumptionCount} 个高消耗备件（TOP ${HIGH_CONSUMPTION_THRESHOLD}）`"
      type="warning"
      :closable="false"
      show-icon
      class="high-consumption-alert"
    >
      <template slot="default">
        <div class="alert-content">
          <span>这些备件消耗量或成本较高，建议重点关注库存和采购计划。</span>
          <span class="high-consumption-items">
            {{ highConsumptionParts.map(p => p.sparePartName).join('、') }}
          </span>
        </div>
      </template>
    </el-alert>

    <!-- 总体摘要 -->
    <consumption-summary :summary="summary" />

    <!-- 消耗趋势图 -->
    <consumption-trend :trend-data="trendData" :loading="loading" />

    <!-- 消耗排名柱状图（P1第6项） -->
    <consumption-ranking
      :part-statistics="partStatistics"
      :sort-by="queryParams.sortBy"
      :loading="loading"
    />

    <!-- 消耗明细表格 -->
    <consumption-table :part-statistics="partStatistics" :loading="loading" />
  </div>
</template>

<script>
import { getSparePartConsumption } from './api/spare-part-consumption'
import ConsumptionSummary from './components/ConsumptionSummary'
import ConsumptionTrend from './components/ConsumptionTrend'
import ConsumptionRanking from './components/ConsumptionRanking'
import ConsumptionTable from './components/ConsumptionTable'
import {
  TIME_PERIOD_OPTIONS,
  SORT_BY_OPTIONS,
  EQUIPMENT_TYPE_OPTIONS,
  DEFAULT_QUERY_PARAMS,
  HIGH_CONSUMPTION_THRESHOLD
} from './constants/spare-part-consumption'

export default {
  name: 'SparePartConsumption',
  components: {
    ConsumptionSummary,
    ConsumptionTrend,
    ConsumptionRanking,
    ConsumptionTable
  },
  data() {
    // 获取默认时间范围（最近3个月）
    const endDate = new Date()
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - 3)

    return {
      loading: false,
      queryParams: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        equipmentType: '',
        timePeriod: DEFAULT_QUERY_PARAMS.timePeriod,
        sortBy: DEFAULT_QUERY_PARAMS.sortBy
      },
      summary: {
        totalQuantity: 0,
        totalTransactions: 0,
        uniqueParts: 0,
        totalCost: '0.00',
        timePeriod: DEFAULT_QUERY_PARAMS.timePeriod
      },
      trendData: [],
      partStatistics: [],
      timePeriodOptions: TIME_PERIOD_OPTIONS,
      sortByOptions: SORT_BY_OPTIONS,
      equipmentTypeOptions: EQUIPMENT_TYPE_OPTIONS,
      HIGH_CONSUMPTION_THRESHOLD
    }
  },
  computed: {
    highConsumptionParts() {
      return this.partStatistics.slice(0, HIGH_CONSUMPTION_THRESHOLD)
    },
    highConsumptionCount() {
      return Math.min(this.partStatistics.length, HIGH_CONSUMPTION_THRESHOLD)
    },
    showHighConsumptionAlert() {
      return this.partStatistics.length > 0 && !this.loading
    }
  },
  mounted() {
    this.handleQuery()
  },
  methods: {
    async handleQuery() {
      // 表单验证
      try {
        await this.$refs.queryForm.validate()
      } catch (error) {
        return
      }

      // 日期范围验证
      if (this.queryParams.endDate < this.queryParams.startDate) {
        this.$message.warning('结束日期不能早于开始日期')
        return
      }

      this.loading = true
      try {
        const params = {
          ...this.queryParams
        }
        // 移除空值参数
        Object.keys(params).forEach(key => {
          if (params[key] === '' || params[key] === null || params[key] === undefined) {
            delete params[key]
          }
        })

        const response = await getSparePartConsumption(params)

        if (response && response.data) {
          this.summary = response.data.summary || {}
          this.trendData = response.data.trendData || []
          this.partStatistics = response.data.partStatistics || []

          this.$message.success(response.message || '查询成功')
        }
      } catch (error) {
        console.error('查询备件消耗分析失败:', error)
        this.$message.error(error.message || '查询失败，请稍后重试')
      } finally {
        this.loading = false
      }
    },
    handleReset() {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setMonth(startDate.getMonth() - 3)

      this.queryParams = {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        equipmentType: '',
        timePeriod: DEFAULT_QUERY_PARAMS.timePeriod,
        sortBy: DEFAULT_QUERY_PARAMS.sortBy
      }

      this.$refs.queryForm.clearValidate()
    },
    handleSortChange() {
      // 排序方式变更后重新查询数据
      this.handleQuery()
    }
  }
}
</script>

<style lang="scss" scoped>
.spare-part-consumption-container {
  padding: 24px;

  .page-header {
    margin-bottom: 24px;

    .page-title {
      font-size: 24px;
      font-weight: 600;
      color: #303133;
      margin: 0 0 12px 0;
      display: flex;
      align-items: center;
      gap: 12px;

      i {
        font-size: 28px;
        color: #1976D2;
      }
    }

    ::v-deep .el-breadcrumb {
      font-size: 14px;
    }
  }

  .search-card {
    margin-bottom: 24px;
    border-radius: 8px;

    ::v-deep .el-card__body {
      padding: 20px;
    }
  }

  .query-form {
    ::v-deep .el-form-item {
      margin-bottom: 16px;
      width: 100%;
    }

    ::v-deep .el-form-item__label {
      font-weight: 500;
      color: #606266;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 8px;
    }
  }

  .high-consumption-alert {
    margin-bottom: 24px;
    border-radius: 8px;

    .alert-content {
      display: flex;
      flex-direction: column;
      gap: 8px;

      .high-consumption-items {
        color: #E6A23C;
        font-weight: 600;
        font-size: 14px;
      }
    }
  }
}

@media (max-width: 768px) {
  .spare-part-consumption-container {
    padding: 16px;

    .query-form {
      .form-actions {
        justify-content: center;
      }
    }
  }
}
</style>

