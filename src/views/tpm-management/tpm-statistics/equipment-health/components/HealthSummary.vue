<!--
 * 文件名称: HealthSummary.vue
 * 文件描述: 设备健康度评分摘要统计组件
 * 创建日期: 2024-01-20
 * 修改记录:
 *   - 2024-01-20: 初始创建
-->
<template>
  <div class="health-summary">
    <el-row :gutter="16">
      <el-col :span="6">
        <el-card shadow="hover" class="summary-card">
          <div class="card-content">
            <div class="card-icon total">
              <i class="el-icon-s-platform" />
            </div>
            <div class="card-info">
              <div class="card-label">设备总数</div>
              <div class="card-value">{{ summary.totalEquipment || 0 }}</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="summary-card">
          <div class="card-content">
            <div class="card-icon score">
              <i class="el-icon-data-analysis" />
            </div>
            <div class="card-info">
              <div class="card-label">平均健康度</div>
              <div class="card-value">{{ summary.avgHealthScore || 0 }}<span class="unit">分</span></div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card shadow="hover" class="summary-card level-card">
          <div class="level-stats">
            <div
              v-for="(count, level) in summary.levelStats"
              :key="level"
              class="level-item"
              :style="{ borderLeftColor: getLevelColor(level) }"
            >
              <div class="level-label">{{ level }}</div>
              <div class="level-value" :style="{ color: getLevelColor(level) }">{{ count }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { HEALTH_LEVEL_CONFIG } from '../constants'

export default {
  name: 'HealthSummary',
  props: {
    summary: {
      type: Object,
      default: () => ({
        totalEquipment: 0,
        avgHealthScore: 0,
        levelStats: {
          '优秀': 0,
          '良好': 0,
          '一般': 0,
          '差': 0
        }
      })
    }
  },
  methods: {
    getLevelColor(level) {
      return HEALTH_LEVEL_CONFIG[level]?.color || '#909399'
    }
  }
}
</script>

<style lang="scss" scoped>
.health-summary {
  margin-bottom: 16px;

  .summary-card {
    ::v-deep .el-card__body {
      padding: 20px;
    }
  }

  .card-content {
    display: flex;
    align-items: center;

    .card-icon {
      width: 56px;
      height: 56px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      margin-right: 16px;

      &.total {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: #fff;
      }

      &.score {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        color: #fff;
      }
    }

    .card-info {
      flex: 1;

      .card-label {
        font-size: 14px;
        color: #909399;
        margin-bottom: 8px;
      }

      .card-value {
        font-size: 28px;
        font-weight: 600;
        color: #303133;

        .unit {
          font-size: 14px;
          font-weight: 400;
          margin-left: 4px;
        }
      }
    }
  }

  .level-card {
    ::v-deep .el-card__body {
      padding: 16px 20px;
    }
  }

  .level-stats {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .level-item {
      flex: 1;
      text-align: center;
      padding: 12px 0;
      border-left: 4px solid;
      margin: 0 8px;

      &:first-child {
        margin-left: 0;
      }

      &:last-child {
        margin-right: 0;
      }

      .level-label {
        font-size: 14px;
        color: #606266;
        margin-bottom: 8px;
      }

      .level-value {
        font-size: 24px;
        font-weight: 600;
      }
    }
  }
}
</style>

