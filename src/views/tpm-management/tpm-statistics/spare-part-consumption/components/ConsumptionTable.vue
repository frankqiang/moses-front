<template>
  <div class="consumption-table">
    <el-card shadow="hover">
      <div slot="header" class="card-header">
        <span class="card-title">
          <i class="el-icon-document" />
          备件消耗明细（TOP 20）
        </span>
        <el-tag v-if="highConsumptionCount > 0" type="warning" effect="plain">
          <i class="el-icon-warning-outline" />
          {{ highConsumptionCount }} 个高消耗备件
        </el-tag>
      </div>
      <el-table
        v-loading="loading"
        :data="tableData"
        stripe
        border
        style="width: 100%"
        :row-class-name="getRowClassName"
        :header-cell-style="{ background: '#F5F7FA', color: '#606266', fontWeight: '600' }"
      >
        <el-table-column
          type="index"
          label="排名"
          width="70"
          align="center"
          fixed
        >
          <template slot-scope="scope">
            <el-tag
              v-if="scope.$index < 3"
              :type="getRankingType(scope.$index)"
              effect="dark"
              size="small"
            >
              {{ scope.$index + 1 }}
            </el-tag>
            <span v-else class="rank-number">{{ scope.$index + 1 }}</span>
          </template>
        </el-table-column>

        <el-table-column
          prop="sparePartCode"
          label="备件编码"
          min-width="120"
          fixed
          show-overflow-tooltip
        />

        <el-table-column
          prop="sparePartName"
          label="备件名称"
          min-width="150"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <div class="name-cell">
              <span>{{ scope.row.sparePartName }}</span>
              <el-tag
                v-if="scope.$index < HIGH_CONSUMPTION_THRESHOLD"
                type="danger"
                effect="plain"
                size="mini"
              >
                高消耗
              </el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column
          prop="unit"
          label="单位"
          width="80"
          align="center"
        />

        <el-table-column
          prop="unitPrice"
          label="单价（元）"
          width="120"
          align="right"
        >
          <template slot-scope="scope">
            <span class="price-text">¥{{ scope.row.unitPrice }}</span>
          </template>
        </el-table-column>

        <el-table-column
          prop="totalQuantity"
          label="总消耗量"
          width="120"
          align="right"
          sortable
        >
          <template slot-scope="scope">
            <span class="quantity-text">{{ scope.row.totalQuantity }}</span>
          </template>
        </el-table-column>

        <el-table-column
          prop="frequency"
          label="使用频次"
          width="120"
          align="right"
          sortable
        >
          <template slot-scope="scope">
            <span class="frequency-text">{{ scope.row.frequency }} 次</span>
          </template>
        </el-table-column>

        <el-table-column
          prop="totalCost"
          label="总成本（元）"
          width="140"
          align="right"
          sortable
        >
          <template slot-scope="scope">
            <span class="cost-text">¥{{ scope.row.totalCost }}</span>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="tableData.length === 0 && !loading" class="empty-hint">
        <el-empty description="暂无备件消耗数据" />
      </div>
    </el-card>
  </div>
</template>

<script>
import { HIGH_CONSUMPTION_THRESHOLD } from '../constants/spare-part-consumption'

export default {
  name: 'ConsumptionTable',
  props: {
    partStatistics: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      HIGH_CONSUMPTION_THRESHOLD
    }
  },
  computed: {
    tableData() {
      return this.partStatistics || []
    },
    highConsumptionCount() {
      return Math.min(this.tableData.length, HIGH_CONSUMPTION_THRESHOLD)
    }
  },
  methods: {
    getRowClassName({ rowIndex }) {
      if (rowIndex < HIGH_CONSUMPTION_THRESHOLD) {
        return 'high-consumption-row'
      }
      return ''
    },
    getRankingType(index) {
      const types = ['danger', 'warning', 'success']
      return types[index] || 'info'
    }
  }
}
</script>

<style lang="scss" scoped>
.consumption-table {
  ::v-deep .el-card__header {
    padding: 16px 20px;
    border-bottom: 1px solid #E4E7ED;
  }

  ::v-deep .el-card__body {
    padding: 20px;
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .card-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    display: flex;
    align-items: center;
    gap: 8px;

    i {
      font-size: 18px;
      color: #1976D2;
    }
  }

  .rank-number {
    display: inline-block;
    width: 24px;
    height: 24px;
    line-height: 24px;
    text-align: center;
    border-radius: 50%;
    background: #F5F7FA;
    color: #909399;
    font-weight: 600;
    font-size: 12px;
  }

  .name-cell {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .price-text {
    color: #606266;
    font-weight: 500;
  }

  .quantity-text {
    color: #1976D2;
    font-weight: 600;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }

  .frequency-text {
    color: #00BCD4;
    font-weight: 500;
  }

  .cost-text {
    color: #FF9800;
    font-weight: 600;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }

  ::v-deep .el-table {
    .high-consumption-row {
      background-color: #FFF3E0 !important;

      &:hover > td {
        background-color: #FFE0B2 !important;
      }
    }

    th {
      padding: 14px 0;
    }

    td {
      padding: 12px 0;
    }
  }

  .empty-hint {
    padding: 40px 0;
  }
}
</style>

