<!--
文件名称：MaintenanceOverviewCard.vue
文件描述：维护任务概览卡片组件
创建日期：2024-01-20
修改记录：
  - 2024-01-20: 初始创建
-->

<template>
  <el-card class="overview-card" shadow="hover">
    <div slot="header" class="card-header">
      <div class="header-left">
        <i class="el-icon-s-tools header-icon" />
        <span class="card-title">维护任务概览</span>
      </div>
      <el-tag :type="rateTagType" size="small">
        完成率 {{ data.completionRate }}%
      </el-tag>
    </div>

    <div class="card-content">
      <div class="stat-row">
        <div class="stat-item">
          <div class="stat-label">总任务数</div>
          <div class="stat-value total">{{ data.totalTasks }}</div>
        </div>
        <div class="stat-divider" />
        <div class="stat-item">
          <div class="stat-label">已完成</div>
          <div class="stat-value completed">{{ data.completedTasks }}</div>
        </div>
      </div>

      <div class="stat-row">
        <div class="stat-item">
          <div class="stat-label">执行中</div>
          <div class="stat-value in-progress">{{ data.inProgressTasks }}</div>
        </div>
        <div class="stat-divider" />
        <div class="stat-item">
          <div class="stat-label">已延期</div>
          <div class="stat-value overdue">{{ data.overdueTasks }}</div>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script>
import { KPI_STANDARDS } from '../constants'

export default {
  name: 'MaintenanceOverviewCard',

  props: {
    data: {
      type: Object,
      required: true,
      default: () => ({
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        overdueTasks: 0,
        completionRate: '0.00'
      })
    }
  },

  computed: {
    rateTagType() {
      const rate = parseFloat(this.data.completionRate)
      if (rate >= KPI_STANDARDS.COMPLETION_RATE.excellent) {
        return 'success'
      } else if (rate >= KPI_STANDARDS.COMPLETION_RATE.good) {
        return 'warning'
      }
      return 'danger'
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
    color: #67C23A;
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

      &.completed {
        color: #67C23A;
      }

      &.in-progress {
        color: #E6A23C;
      }

      &.overdue {
        color: #F56C6C;
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

