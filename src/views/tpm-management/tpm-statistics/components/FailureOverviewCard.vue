<!--
文件名称：FailureOverviewCard.vue
文件描述：故障处理概览卡片组件
创建日期：2024-01-20
修改记录：
  - 2024-01-20: 初始创建
-->

<template>
  <el-card class="overview-card" shadow="hover">
    <div slot="header" class="card-header">
      <div class="header-left">
        <i class="el-icon-warning header-icon" />
        <span class="card-title">故障处理概览</span>
      </div>
      <el-tag :type="rateTagType" size="small">
        解决率 {{ data.resolutionRate }}%
      </el-tag>
    </div>

    <div class="card-content">
      <div class="stat-row">
        <div class="stat-item">
          <div class="stat-label">总故障数</div>
          <div class="stat-value total">{{ data.totalFailures }}</div>
        </div>
        <div class="stat-divider" />
        <div class="stat-item">
          <div class="stat-label">严重故障</div>
          <div class="stat-value severe">{{ data.severeFailures }}</div>
        </div>
      </div>

      <div class="stat-row">
        <div class="stat-item">
          <div class="stat-label">已解决</div>
          <div class="stat-value resolved">{{ data.resolvedFailures }}</div>
        </div>
        <div class="stat-divider" />
        <div class="stat-item">
          <div class="stat-label">解决率</div>
          <div class="stat-value rate" :class="rateClass">{{ data.resolutionRate }}%</div>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script>
import { KPI_STANDARDS } from '../constants'

export default {
  name: 'FailureOverviewCard',

  props: {
    data: {
      type: Object,
      required: true,
      default: () => ({
        totalFailures: 0,
        severeFailures: 0,
        resolvedFailures: 0,
        resolutionRate: '0.00'
      })
    }
  },

  computed: {
    rateTagType() {
      const rate = parseFloat(this.data.resolutionRate)
      if (rate >= KPI_STANDARDS.RESOLUTION_RATE.excellent) {
        return 'success'
      } else if (rate >= KPI_STANDARDS.RESOLUTION_RATE.good) {
        return 'warning'
      }
      return 'danger'
    },

    rateClass() {
      const rate = parseFloat(this.data.resolutionRate)
      if (rate >= KPI_STANDARDS.RESOLUTION_RATE.excellent) {
        return 'excellent'
      } else if (rate >= KPI_STANDARDS.RESOLUTION_RATE.good) {
        return 'good'
      }
      return 'poor'
    }
  }
}
</script>

<style lang="scss" scoped>
.overview-card {
  height: 100%;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-4px);
  }

  ::v-deep .el-card__header {
    padding: 16px 20px;
    border-bottom: 1px solid #f0f0f0;
  }

  ::v-deep .el-card__body {
    padding: 20px;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .header-left {
    display: flex;
    align-items: center;
  }

  .header-icon {
    font-size: 20px;
    color: #E6A23C;
    margin-right: 8px;
  }

  .card-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }
}

.card-content {
  .stat-row {
    display: flex;
    align-items: center;
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .stat-item {
    flex: 1;
    text-align: center;

    .stat-label {
      font-size: 14px;
      color: #909399;
      margin-bottom: 8px;
    }

    .stat-value {
      font-size: 28px;
      font-weight: 600;
      line-height: 1;

      &.total {
        color: #409EFF;
      }

      &.severe {
        color: #F56C6C;
      }

      &.resolved {
        color: #67C23A;
      }

      &.rate {
        &.excellent {
          color: #67C23A;
        }

        &.good {
          color: #E6A23C;
        }

        &.poor {
          color: #F56C6C;
        }
      }
    }
  }

  .stat-divider {
    width: 1px;
    height: 40px;
    background-color: #EBEEF5;
  }
}
</style>

