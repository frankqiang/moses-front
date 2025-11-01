<!--
  文件名称：WorkloadSummary.vue
  文件描述：工作量统计汇总组件
  创建日期：2024-01-20
  修改记录：
    - 2024-01-20: 初始创建
-->

<template>
  <el-card class="workload-summary-card" shadow="never">
    <div slot="header" class="card-header">
      <span class="card-title">
        <i class="el-icon-data-analysis" />
        工作量统计汇总
      </span>
    </div>

    <el-row :gutter="16">
      <el-col :xs="24" :sm="12" :md="8" :lg="4">
        <div class="summary-item">
          <div class="summary-icon" style="background: #E3F2FD;">
            <i class="el-icon-s-order" style="color: #409EFF;" />
          </div>
          <div class="summary-content">
            <div class="summary-label">总任务数</div>
            <div class="summary-value">{{ summary.totalTasks || 0 }}</div>
            <div class="summary-unit">个</div>
          </div>
        </div>
      </el-col>

      <el-col :xs="24" :sm="12" :md="8" :lg="4">
        <div class="summary-item">
          <div class="summary-icon" style="background: #E8F5E9;">
            <i class="el-icon-circle-check" style="color: #67C23A;" />
          </div>
          <div class="summary-content">
            <div class="summary-label">已完成任务</div>
            <div class="summary-value">{{ summary.completedTasks || 0 }}</div>
            <div class="summary-unit">个</div>
          </div>
        </div>
      </el-col>

      <el-col :xs="24" :sm="12" :md="8" :lg="4">
        <div class="summary-item">
          <div class="summary-icon" style="background: #FFF3E0;">
            <i class="el-icon-time" style="color: #E6A23C;" />
          </div>
          <div class="summary-content">
            <div class="summary-label">总工时</div>
            <div class="summary-value">{{ summary.totalWorkHours || '0.0' }}</div>
            <div class="summary-unit">小时</div>
          </div>
        </div>
      </el-col>

      <el-col :xs="24" :sm="12" :md="8" :lg="4">
        <div class="summary-item">
          <div class="summary-icon" style="background: #F3E5F5;">
            <i class="el-icon-user" style="color: #9B59B6;" />
          </div>
          <div class="summary-content">
            <div class="summary-label">活跃维护人员</div>
            <div class="summary-value">{{ summary.activeAssignees || 0 }}</div>
            <div class="summary-unit">人</div>
          </div>
        </div>
      </el-col>

      <el-col :xs="24" :sm="12" :md="8" :lg="4">
        <div class="summary-item">
          <div class="summary-icon" :style="{ background: completionRateColor + '20' }">
            <i class="el-icon-success" :style="{ color: completionRateColor }" />
          </div>
          <div class="summary-content">
            <div class="summary-label">任务完成率</div>
            <div class="summary-value">{{ summary.completionRate || '0.00' }}%</div>
            <div class="summary-tag">
              <el-tag :type="completionRateType" size="mini">
                {{ completionRateLabel }}
              </el-tag>
            </div>
          </div>
        </div>
      </el-col>

      <el-col :xs="24" :sm="12" :md="8" :lg="4">
        <div class="summary-item">
          <div class="summary-icon" style="background: #E0F7FA;">
            <i class="el-icon-info" style="color: #00BCD4;" />
          </div>
          <div class="summary-content">
            <div class="summary-label">统计粒度</div>
            <div class="summary-value" style="font-size: 18px;">{{ summary.timePeriod || '-' }}</div>
            <div class="summary-unit">{{ groupByLabel }}</div>
          </div>
        </div>
      </el-col>
    </el-row>
  </el-card>
</template>

<script>
import { COMPLETION_RATE_STANDARDS, GROUP_BY_OPTIONS } from '../constants/maintenance-workload'

export default {
  name: 'WorkloadSummary',
  props: {
    summary: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    completionRate() {
      return parseFloat(this.summary.completionRate || 0)
    },
    completionRateColor() {
      if (this.completionRate >= COMPLETION_RATE_STANDARDS.EXCELLENT.min) {
        return COMPLETION_RATE_STANDARDS.EXCELLENT.color
      } else if (this.completionRate >= COMPLETION_RATE_STANDARDS.GOOD.min) {
        return COMPLETION_RATE_STANDARDS.GOOD.color
      } else {
        return COMPLETION_RATE_STANDARDS.NEED_IMPROVEMENT.color
      }
    },
    completionRateType() {
      if (this.completionRate >= COMPLETION_RATE_STANDARDS.EXCELLENT.min) {
        return 'success'
      } else if (this.completionRate >= COMPLETION_RATE_STANDARDS.GOOD.min) {
        return 'primary'
      } else {
        return 'danger'
      }
    },
    completionRateLabel() {
      if (this.completionRate >= COMPLETION_RATE_STANDARDS.EXCELLENT.min) {
        return COMPLETION_RATE_STANDARDS.EXCELLENT.label
      } else if (this.completionRate >= COMPLETION_RATE_STANDARDS.GOOD.min) {
        return COMPLETION_RATE_STANDARDS.GOOD.label
      } else {
        return COMPLETION_RATE_STANDARDS.NEED_IMPROVEMENT.label
      }
    },
    groupByLabel() {
      const groupBy = this.summary.groupBy
      const option = GROUP_BY_OPTIONS.find(item => item.value === groupBy)
      return option ? option.label : '-'
    }
  }
}
</script>

<style scoped lang="scss">
.workload-summary-card {
  margin-bottom: 16px;

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .card-title {
      font-size: 16px;
      font-weight: 500;
      color: #303133;

      i {
        margin-right: 8px;
        font-size: 18px;
        vertical-align: middle;
      }
    }
  }

  .summary-item {
    display: flex;
    align-items: center;
    padding: 16px;
    background: #FAFAFA;
    border-radius: 4px;
    transition: all 0.3s;

    &:hover {
      background: #F5F7FA;
      transform: translateY(-2px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .summary-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      border-radius: 8px;
      margin-right: 12px;

      i {
        font-size: 24px;
      }
    }

    .summary-content {
      flex: 1;

      .summary-label {
        font-size: 12px;
        color: #909399;
        margin-bottom: 4px;
      }

      .summary-value {
        font-size: 24px;
        font-weight: 600;
        color: #303133;
        line-height: 1;
        margin-bottom: 2px;
      }

      .summary-unit {
        font-size: 12px;
        color: #909399;
      }

      .summary-tag {
        margin-top: 4px;
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .workload-summary-card {
    .summary-item {
      margin-bottom: 8px;
    }
  }
}
</style>

