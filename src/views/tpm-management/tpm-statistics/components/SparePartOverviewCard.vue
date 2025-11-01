<!--
文件名称：SparePartOverviewCard.vue
文件描述：备件管理概览卡片组件
创建日期：2024-01-20
修改记录：
  - 2024-01-20: 初始创建
-->

<template>
  <el-card class="overview-card" shadow="hover">
    <div slot="header" class="card-header">
      <div class="header-left">
        <i class="el-icon-files header-icon" />
        <span class="card-title">备件管理概览</span>
      </div>
      <el-badge v-if="data.lowStockCount > 0" :value="data.lowStockCount" :max="99" type="warning">
        <el-tag type="warning" size="small">低库存预警</el-tag>
      </el-badge>
    </div>

    <div class="card-content">
      <div class="stat-row">
        <div class="stat-item">
          <div class="stat-label">领用记录</div>
          <div class="stat-value transactions">{{ data.totalTransactions }}</div>
        </div>
        <div class="stat-divider" />
        <div class="stat-item">
          <div class="stat-label">消耗数量</div>
          <div class="stat-value quantity">{{ data.totalQuantity }}</div>
        </div>
      </div>

      <div class="stat-row">
        <div class="stat-item">
          <div class="stat-label">消耗成本</div>
          <div class="stat-value cost">¥{{ formatCost(data.totalCost) }}</div>
        </div>
        <div class="stat-divider" />
        <div class="stat-item">
          <div class="stat-label">低库存</div>
          <div class="stat-value low-stock">{{ data.lowStockCount }}</div>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script>
export default {
  name: 'SparePartOverviewCard',

  props: {
    data: {
      type: Object,
      required: true,
      default: () => ({
        totalTransactions: 0,
        totalQuantity: 0,
        totalCost: '0.00',
        lowStockCount: 0
      })
    }
  },

  methods: {
    formatCost(cost) {
      const num = parseFloat(cost)
      return num.toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
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
    color: #909399;
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

      &.transactions {
        color: #409EFF;
      }

      &.quantity {
        color: #67C23A;
      }

      &.cost {
        color: #E6A23C;
        font-size: 24px;
      }

      &.low-stock {
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

