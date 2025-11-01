<template>
  <div class="consumption-summary">
    <el-card class="summary-card" shadow="hover">
      <div class="summary-content">
        <div class="summary-item">
          <div class="summary-label">
            <i class="el-icon-box" />
            <span>总消耗量</span>
          </div>
          <div class="summary-value primary">{{ summary.totalQuantity || 0 }}</div>
          <div class="summary-unit">件</div>
        </div>

        <div class="summary-item">
          <div class="summary-label">
            <i class="el-icon-files" />
            <span>总交易次数</span>
          </div>
          <div class="summary-value info">{{ summary.totalTransactions || 0 }}</div>
          <div class="summary-unit">次</div>
        </div>

        <div class="summary-item">
          <div class="summary-label">
            <i class="el-icon-menu" />
            <span>涉及备件种类</span>
          </div>
          <div class="summary-value success">{{ summary.uniqueParts || 0 }}</div>
          <div class="summary-unit">种</div>
        </div>

        <div class="summary-item">
          <div class="summary-label">
            <i class="el-icon-coin" />
            <span>总成本</span>
          </div>
          <div class="summary-value warning">{{ formattedTotalCost }}</div>
          <div class="summary-unit">元</div>
        </div>

        <div class="summary-item">
          <div class="summary-label">
            <i class="el-icon-time" />
            <span>统计粒度</span>
          </div>
          <div class="summary-value secondary">{{ summary.timePeriod || '-' }}</div>
          <div class="summary-unit" />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { formatNumber } from '@/utils'

export default {
  name: 'ConsumptionSummary',
  props: {
    summary: {
      type: Object,
      default: () => ({
        totalQuantity: 0,
        totalTransactions: 0,
        uniqueParts: 0,
        totalCost: '0.00',
        timePeriod: '-'
      })
    }
  },
  computed: {
    formattedTotalCost() {
      const cost = parseFloat(this.summary.totalCost || 0)
      return formatNumber(cost, 2)
    }
  }
}
</script>

<style lang="scss" scoped>
.consumption-summary {
  margin-bottom: 24px;

  .summary-card {
    border-radius: 8px;

    ::v-deep .el-card__body {
      padding: 24px;
    }
  }

  .summary-content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 32px;
  }

  .summary-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 16px;
    border-radius: 8px;
    background: linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(25, 118, 210, 0.01) 100%);
    transition: all 0.3s ease;

    &:hover {
      background: linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(25, 118, 210, 0.02) 100%);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }
  }

  .summary-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    color: #606266;
    margin-bottom: 12px;
    font-weight: 500;

    i {
      font-size: 16px;
    }
  }

  .summary-value {
    font-size: 32px;
    font-weight: 700;
    line-height: 1.2;
    margin-bottom: 4px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

    &.primary {
      color: #1976D2;
    }

    &.info {
      color: #00BCD4;
    }

    &.success {
      color: #4CAF50;
    }

    &.warning {
      color: #FF9800;
    }

    &.secondary {
      color: #9E9E9E;
      font-size: 24px;
    }
  }

  .summary-unit {
    font-size: 12px;
    color: #909399;
    height: 18px;
  }
}

@media (max-width: 768px) {
  .consumption-summary {
    .summary-content {
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    .summary-value {
      font-size: 28px;
    }
  }
}

@media (max-width: 480px) {
  .consumption-summary {
    .summary-content {
      grid-template-columns: 1fr;
    }
  }
}
</style>

