<!--
  文件名称：WorkloadBalanceAnalysis.vue
  文件描述：工作量均衡度分析组件
  创建日期：2024-01-20
  修改记录：
    - 2024-01-20: 初始创建
-->

<template>
  <el-card class="balance-analysis-card" shadow="never">
    <div slot="header" class="card-header">
      <span class="card-title">
        <i class="el-icon-s-data" />
        工作量均衡度分析
      </span>
      <el-tooltip content="识别工作量与平均值偏差超过30%的人员" placement="top">
        <i class="el-icon-info" style="color: #909399; cursor: help;" />
      </el-tooltip>
    </div>

    <div v-if="balanceData && balanceData.length > 0" class="balance-content">
      <!-- 统计概览 -->
      <div class="balance-overview">
        <div class="overview-item">
          <div class="overview-label">平均工作量</div>
          <div class="overview-value">{{ avgWorkload.toFixed(1) }} <span class="unit">小时</span></div>
        </div>
        <div class="overview-item">
          <div class="overview-label">工作量偏差</div>
          <div class="overview-value">{{ maxDeviation.toFixed(1) }}%</div>
        </div>
        <div class="overview-item">
          <div class="overview-label">异常人员</div>
          <div class="overview-value" style="color: #F56C6C;">{{ abnormalCount }} <span class="unit">人</span></div>
        </div>
        <div class="overview-item">
          <div class="overview-label">均衡度评价</div>
          <div class="overview-value">
            <el-tag :type="balanceLevel.type" size="medium">
              {{ balanceLevel.label }}
            </el-tag>
          </div>
        </div>
      </div>

      <!-- 人员工作量偏差列表 -->
      <div class="balance-list">
        <div
          v-for="(item, index) in balanceData"
          :key="index"
          class="balance-item"
          :class="{ abnormal: item.isAbnormal }"
        >
          <div class="item-header">
            <div class="item-name">
              <el-avatar :size="36">{{ item.assigneeName.charAt(0) }}</el-avatar>
              <span>{{ item.assigneeName }}</span>
              <el-tag v-if="item.isAbnormal" type="danger" size="mini" style="margin-left: 8px;">
                异常
              </el-tag>
            </div>
            <div class="item-value">
              <span class="value">{{ item.workload }}</span>
              <span class="unit">小时</span>
            </div>
          </div>

          <div class="item-progress">
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{
                  width: Math.min(item.percentage, 100) + '%',
                  background: getProgressColor(item.deviation)
                }"
              />
              <div class="progress-avg-line" :style="{ left: avgPercentage + '%' }">
                <div class="avg-label">平均</div>
              </div>
            </div>
            <div class="progress-info">
              <span :class="{ warning: Math.abs(item.deviation) > 30 }">
                {{ item.deviation > 0 ? '+' : '' }}{{ item.deviation.toFixed(1) }}%
              </span>
            </div>
          </div>

          <div v-if="item.isAbnormal" class="item-suggestion">
            <i class="el-icon-warning" />
            <span>{{ item.suggestion }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <i class="el-icon-info" />
      <p>暂无均衡度分析数据</p>
    </div>
  </el-card>
</template>

<script>
import { BALANCE_THRESHOLD } from '../constants/maintenance-workload'

export default {
  name: 'WorkloadBalanceAnalysis',
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
  computed: {
    balanceData() {
      // 只对按人员分组的数据进行均衡度分析
      if (this.groupBy !== 'assignee' || !this.workloadData || this.workloadData.length === 0) {
        return []
      }

      const workloads = this.workloadData.map(item => parseFloat(item.totalWorkHours))
      const avgWorkload = workloads.reduce((sum, val) => sum + val, 0) / workloads.length
      const maxWorkload = Math.max(...workloads)

      return this.workloadData.map(item => {
        const workload = parseFloat(item.totalWorkHours)
        const deviation = ((workload - avgWorkload) / avgWorkload) * 100
        const isAbnormal = Math.abs(deviation) > BALANCE_THRESHOLD
        const percentage = (workload / maxWorkload) * 100

        let suggestion = ''
        if (isAbnormal) {
          if (deviation > 0) {
            suggestion = '工作量过高，建议调配部分任务或增加人手支持'
          } else {
            suggestion = '工作量偏低，可适当增加任务或安排培训学习'
          }
        }

        return {
          assigneeName: item.assigneeName || '-',
          workload: workload.toFixed(1),
          deviation,
          isAbnormal,
          percentage,
          suggestion
        }
      }).sort((a, b) => b.workload - a.workload)
    },
    avgWorkload() {
      if (this.balanceData.length === 0) return 0
      const workloads = this.balanceData.map(item => parseFloat(item.workload))
      return workloads.reduce((sum, val) => sum + val, 0) / workloads.length
    },
    maxDeviation() {
      if (this.balanceData.length === 0) return 0
      const deviations = this.balanceData.map(item => Math.abs(item.deviation))
      return Math.max(...deviations)
    },
    abnormalCount() {
      return this.balanceData.filter(item => item.isAbnormal).length
    },
    avgPercentage() {
      if (this.balanceData.length === 0) return 50
      const maxWorkload = Math.max(...this.balanceData.map(item => parseFloat(item.workload)))
      return (this.avgWorkload / maxWorkload) * 100
    },
    balanceLevel() {
      if (this.maxDeviation <= 20) {
        return { type: 'success', label: '均衡良好' }
      } else if (this.maxDeviation <= 30) {
        return { type: 'warning', label: '轻度不均' }
      } else if (this.maxDeviation <= 50) {
        return { type: 'danger', label: '中度不均' }
      } else {
        return { type: 'danger', label: '严重不均' }
      }
    }
  },
  methods: {
    getProgressColor(deviation) {
      if (Math.abs(deviation) <= 20) {
        return '#67C23A'
      } else if (Math.abs(deviation) <= 30) {
        return '#409EFF'
      } else if (Math.abs(deviation) <= 50) {
        return '#E6A23C'
      } else {
        return '#F56C6C'
      }
    }
  }
}
</script>

<style scoped lang="scss">
.balance-analysis-card {
  margin-bottom: 16px;

  .card-header {
    display: flex;
    align-items: center;
    gap: 8px;

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

  .balance-content {
    .balance-overview {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
      padding-bottom: 24px;
      border-bottom: 1px solid #EBEEF5;

      .overview-item {
        text-align: center;

        .overview-label {
          font-size: 14px;
          color: #909399;
          margin-bottom: 8px;
        }

        .overview-value {
          font-size: 24px;
          font-weight: 600;
          color: #303133;

          .unit {
            font-size: 14px;
            font-weight: 400;
            color: #909399;
            margin-left: 4px;
          }
        }
      }
    }

    .balance-list {
      display: flex;
      flex-direction: column;
      gap: 16px;

      .balance-item {
        padding: 16px;
        background: #FAFAFA;
        border-radius: 8px;
        border: 1px solid transparent;
        transition: all 0.3s;

        &.abnormal {
          background: #FEF0F0;
          border-color: #FBC4C4;
        }

        &:hover {
          background: #F5F7FA;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;

          .item-name {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 14px;
            font-weight: 500;
            color: #303133;
          }

          .item-value {
            .value {
              font-size: 20px;
              font-weight: 600;
              color: #303133;
            }

            .unit {
              font-size: 12px;
              color: #909399;
              margin-left: 4px;
            }
          }
        }

        .item-progress {
          display: flex;
          align-items: center;
          gap: 12px;

          .progress-bar {
            flex: 1;
            height: 24px;
            background: #E4E7ED;
            border-radius: 12px;
            position: relative;
            overflow: hidden;

            .progress-fill {
              height: 100%;
              border-radius: 12px;
              transition: width 0.6s ease;
            }

            .progress-avg-line {
              position: absolute;
              top: -4px;
              bottom: -4px;
              width: 2px;
              background: #303133;

              .avg-label {
                position: absolute;
                top: -20px;
                left: 50%;
                transform: translateX(-50%);
                font-size: 10px;
                color: #303133;
                white-space: nowrap;
                font-weight: 600;
              }
            }
          }

          .progress-info {
            min-width: 60px;
            text-align: right;
            font-size: 14px;
            font-weight: 600;
            color: #606266;

            .warning {
              color: #F56C6C;
            }
          }
        }

        .item-suggestion {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 12px;
          padding: 8px 12px;
          background: #FDF6EC;
          border-radius: 4px;
          font-size: 13px;
          color: #E6A23C;

          i {
            font-size: 16px;
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
</style>

