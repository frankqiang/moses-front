<!--
  文件名称:AssigneeRanking.vue
  文件描述：人员工作量排名组件
  创建日期：2024-01-20
  修改记录：
    - 2024-01-20: 初始创建
-->

<template>
  <el-card class="assignee-ranking-card" shadow="never">
    <div slot="header" class="card-header">
      <span class="card-title">
        <i class="el-icon-trophy" />
        人员工作量排名
      </span>
      <div class="header-actions">
        <el-radio-group v-model="sortField" size="small">
          <el-radio-button label="totalTasks">按任务数</el-radio-button>
          <el-radio-button label="totalWorkHours">按总工时</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <div v-if="rankingData && rankingData.length > 0" class="ranking-content">
      <div
        v-for="(item, index) in rankingData"
        :key="index"
        class="ranking-item"
        :class="{ 'top-three': index < 3 }"
      >
        <div class="rank-badge" :class="`rank-${index + 1}`">
          <span v-if="index < 3" class="rank-icon">
            <i :class="getRankIcon(index)" />
          </span>
          <span v-else class="rank-number">{{ index + 1 }}</span>
        </div>

        <div class="assignee-info">
          <el-avatar :size="40">{{ item.assigneeName.charAt(0) }}</el-avatar>
          <div class="info-content">
            <div class="name">{{ item.assigneeName }}</div>
            <div class="stats">
              <span class="stat-item">
                <i class="el-icon-s-order" />
                {{ item.totalTasks }}个任务
              </span>
              <span class="stat-item">
                <i class="el-icon-time" />
                {{ item.totalWorkHours }}小时
              </span>
            </div>
          </div>
        </div>

        <div class="rank-data">
          <div class="data-item">
            <div class="data-label">完成率</div>
            <div class="data-value">
              <el-progress
                :percentage="parseFloat(item.completionRate)"
                :color="getCompletionRateColor(parseFloat(item.completionRate))"
                :stroke-width="6"
                :show-text="false"
              />
              <span class="percentage">{{ item.completionRate }}%</span>
            </div>
          </div>
          <div class="data-item">
            <div class="data-label">平均工时</div>
            <div class="data-value">
              <span class="value">{{ item.avgWorkHours }}</span>
              <span class="unit">小时/任务</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <i class="el-icon-info" />
      <p>暂无人员排名数据</p>
    </div>
  </el-card>
</template>

<script>
import { COMPLETION_RATE_STANDARDS } from '../constants/maintenance-workload'

export default {
  name: 'AssigneeRanking',
  props: {
    workloadData: {
      type: Array,
      default: () => []
    },
    groupBy: {
      type: String,
      default: 'assignee'
    }
  },
  data() {
    return {
      sortField: 'totalWorkHours'
    }
  },
  computed: {
    rankingData() {
      // 只对按人员分组的数据进行排名
      if (this.groupBy !== 'assignee' || !this.workloadData || this.workloadData.length === 0) {
        return []
      }

      const data = [...this.workloadData]
      return data.sort((a, b) => {
        const valueA = this.sortField === 'totalTasks'
          ? a.totalTasks
          : parseFloat(a.totalWorkHours)
        const valueB = this.sortField === 'totalTasks'
          ? b.totalTasks
          : parseFloat(b.totalWorkHours)
        return valueB - valueA
      }).slice(0, 10) // 只显示前10名
    }
  },
  methods: {
    getRankIcon(index) {
      const icons = ['el-icon-medal-1', 'el-icon-medal', 'el-icon-trophy']
      return icons[index] || ''
    },
    getCompletionRateColor(rate) {
      if (rate >= COMPLETION_RATE_STANDARDS.EXCELLENT.min) {
        return COMPLETION_RATE_STANDARDS.EXCELLENT.color
      } else if (rate >= COMPLETION_RATE_STANDARDS.GOOD.min) {
        return COMPLETION_RATE_STANDARDS.GOOD.color
      } else {
        return COMPLETION_RATE_STANDARDS.NEED_IMPROVEMENT.color
      }
    }
  }
}
</script>

<style scoped lang="scss">
.assignee-ranking-card {
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

    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  }

  .ranking-content {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .ranking-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: #FAFAFA;
      border-radius: 8px;
      border: 1px solid transparent;
      transition: all 0.3s;

      &.top-three {
        background: linear-gradient(135deg, #FFF9E6 0%, #FAFAFA 100%);
      }

      &:hover {
        background: #F5F7FA;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        transform: translateX(4px);
      }

      .rank-badge {
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 48px;
        height: 48px;
        border-radius: 50%;
        font-weight: 600;
        font-size: 18px;

        &.rank-1 {
          background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
          color: #fff;
          box-shadow: 0 4px 12px rgba(255, 215, 0, 0.4);

          .rank-icon i {
            font-size: 28px;
          }
        }

        &.rank-2 {
          background: linear-gradient(135deg, #C0C0C0 0%, #A9A9A9 100%);
          color: #fff;
          box-shadow: 0 4px 12px rgba(192, 192, 192, 0.4);

          .rank-icon i {
            font-size: 26px;
          }
        }

        &.rank-3 {
          background: linear-gradient(135deg, #CD7F32 0%, #B87333 100%);
          color: #fff;
          box-shadow: 0 4px 12px rgba(205, 127, 50, 0.4);

          .rank-icon i {
            font-size: 24px;
          }
        }

        .rank-number {
          color: #606266;
        }
      }

      .assignee-info {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;
        min-width: 0;

        .info-content {
          flex: 1;
          min-width: 0;

          .name {
            font-size: 16px;
            font-weight: 600;
            color: #303133;
            margin-bottom: 6px;
          }

          .stats {
            display: flex;
            gap: 16px;
            font-size: 13px;
            color: #909399;

            .stat-item {
              display: flex;
              align-items: center;
              gap: 4px;

              i {
                font-size: 14px;
              }
            }
          }
        }
      }

      .rank-data {
        display: flex;
        gap: 24px;

        .data-item {
          .data-label {
            font-size: 12px;
            color: #909399;
            margin-bottom: 6px;
          }

          .data-value {
            display: flex;
            align-items: center;
            gap: 8px;

            .el-progress {
              width: 100px;
            }

            .percentage,
            .value {
              font-size: 14px;
              font-weight: 600;
              color: #303133;
            }

            .unit {
              font-size: 12px;
              color: #909399;
            }
          }
        }
      }
    }
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    color: #909399;

    i {
      font-size: 64px;
      margin-bottom: 16px;
    }

    p {
      font-size: 14px;
      margin: 0;
    }
  }
}

@media screen and (max-width: 768px) {
  .assignee-ranking-card {
    .ranking-item {
      flex-direction: column;
      align-items: flex-start;

      .rank-data {
        width: 100%;
        flex-direction: column;
        gap: 12px;
      }
    }
  }
}
</style>

