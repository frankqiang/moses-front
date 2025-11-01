<!--
  文件名称：AvgWorkHoursComparison.vue
  文件描述：平均工时对比分析组件
  创建日期：2024-01-20
  修改记录：
    - 2024-01-20: 初始创建
-->

<template>
  <el-card class="avg-hours-comparison-card" shadow="never">
    <div slot="header" class="card-header">
      <span class="card-title">
        <i class="el-icon-time" />
        平均工时对比分析
      </span>
    </div>

    <div v-if="comparisonData && comparisonData.length > 0" class="comparison-content">
      <!-- 整体平均值 -->
      <div class="overall-avg">
        <div class="avg-badge">
          <i class="el-icon-data-line" />
        </div>
        <div class="avg-info">
          <div class="avg-label">整体平均工时</div>
          <div class="avg-value">
            <span class="value">{{ overallAvg.toFixed(1) }}</span>
            <span class="unit">小时/任务</span>
          </div>
          <div class="avg-tag">
            <el-tag :type="getOverallAvgType" size="small">
              {{ getOverallAvgLabel }}
            </el-tag>
          </div>
        </div>
      </div>

      <!-- 分组对比列表 -->
      <div class="comparison-list">
        <div
          v-for="(item, index) in comparisonData"
          :key="index"
          class="comparison-item"
        >
          <div class="item-header">
            <div class="item-name">
              <span class="name-text">{{ item.name }}</span>
              <el-tag
                :type="getAvgHoursType(item.avgHours)"
                size="mini"
                style="margin-left: 8px;"
              >
                {{ getAvgHoursLabel(item.avgHours) }}
              </el-tag>
            </div>
            <div class="item-hours">
              <span class="hours-value">{{ item.avgHours }}</span>
              <span class="hours-unit">小时/任务</span>
            </div>
          </div>

          <div class="item-comparison">
            <div class="comparison-bar">
              <div
                class="bar-fill"
                :style="{
                  width: Math.min((item.avgHours / maxAvgHours) * 100, 100) + '%',
                  background: getBarColor(item.avgHours)
                }"
              >
                <span class="bar-text">{{ item.avgHours }}</span>
              </div>
              <!-- 整体平均线标记 -->
              <div
                class="avg-marker"
                :style="{ left: (overallAvg / maxAvgHours) * 100 + '%' }"
              >
                <div class="marker-line" />
              </div>
            </div>

            <div class="comparison-info">
              <span :class="{ positive: item.diff > 0, negative: item.diff < 0 }">
                {{ item.diff > 0 ? '+' : '' }}{{ item.diff.toFixed(1) }}
              </span>
              <span class="info-text">vs 平均</span>
            </div>
          </div>

          <div class="item-details">
            <div class="detail-item">
              <span class="detail-label">总任务：</span>
              <span class="detail-value">{{ item.totalTasks }}个</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">总工时：</span>
              <span class="detail-value">{{ item.totalHours }}小时</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">效率评价：</span>
              <span class="detail-value">{{ getEfficiencyDesc(item.avgHours) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <i class="el-icon-info" />
      <p>暂无平均工时对比数据</p>
    </div>
  </el-card>
</template>

<script>
import { AVG_WORK_HOURS_STANDARDS } from '../constants/maintenance-workload'

export default {
  name: 'AvgWorkHoursComparison',
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
    comparisonData() {
      if (!this.workloadData || this.workloadData.length === 0) {
        return []
      }

      return this.workloadData.map(item => {
        const avgHours = parseFloat(item.avgWorkHours)
        const totalHours = parseFloat(item.totalWorkHours)
        const totalTasks = item.totalTasks

        let name = ''
        switch (this.groupBy) {
          case 'assignee':
            name = item.assigneeName || '-'
            break
          case 'equipmentType':
            name = item.equipmentType || '-'
            break
          case 'maintenanceType':
            name = item.maintenanceType || '-'
            break
          default:
            name = '-'
        }

        return {
          name,
          avgHours,
          totalHours,
          totalTasks,
          diff: avgHours - this.overallAvg
        }
      }).sort((a, b) => b.avgHours - a.avgHours)
    },
    overallAvg() {
      if (!this.comparisonData || this.comparisonData.length === 0) return 0
      const totalHours = this.comparisonData.reduce((sum, item) => sum + item.totalHours, 0)
      const totalTasks = this.comparisonData.reduce((sum, item) => sum + item.totalTasks, 0)
      return totalTasks > 0 ? totalHours / totalTasks : 0
    },
    maxAvgHours() {
      if (!this.comparisonData || this.comparisonData.length === 0) return 1
      return Math.max(...this.comparisonData.map(item => item.avgHours), this.overallAvg)
    },
    getOverallAvgType() {
      if (this.overallAvg <= AVG_WORK_HOURS_STANDARDS.HIGH_EFFICIENT.max) {
        return 'success'
      } else if (this.overallAvg <= AVG_WORK_HOURS_STANDARDS.NORMAL.max) {
        return 'primary'
      } else if (this.overallAvg <= AVG_WORK_HOURS_STANDARDS.SLOW.max) {
        return 'warning'
      } else {
        return 'danger'
      }
    },
    getOverallAvgLabel() {
      if (this.overallAvg <= AVG_WORK_HOURS_STANDARDS.HIGH_EFFICIENT.max) {
        return AVG_WORK_HOURS_STANDARDS.HIGH_EFFICIENT.label
      } else if (this.overallAvg <= AVG_WORK_HOURS_STANDARDS.NORMAL.max) {
        return AVG_WORK_HOURS_STANDARDS.NORMAL.label
      } else if (this.overallAvg <= AVG_WORK_HOURS_STANDARDS.SLOW.max) {
        return AVG_WORK_HOURS_STANDARDS.SLOW.label
      } else {
        return AVG_WORK_HOURS_STANDARDS.INEFFICIENT.label
      }
    }
  },
  methods: {
    getAvgHoursLabel(hours) {
      if (hours <= AVG_WORK_HOURS_STANDARDS.HIGH_EFFICIENT.max) {
        return AVG_WORK_HOURS_STANDARDS.HIGH_EFFICIENT.label
      } else if (hours <= AVG_WORK_HOURS_STANDARDS.NORMAL.max) {
        return AVG_WORK_HOURS_STANDARDS.NORMAL.label
      } else if (hours <= AVG_WORK_HOURS_STANDARDS.SLOW.max) {
        return AVG_WORK_HOURS_STANDARDS.SLOW.label
      } else {
        return AVG_WORK_HOURS_STANDARDS.INEFFICIENT.label
      }
    },
    getAvgHoursType(hours) {
      if (hours <= AVG_WORK_HOURS_STANDARDS.HIGH_EFFICIENT.max) {
        return 'success'
      } else if (hours <= AVG_WORK_HOURS_STANDARDS.NORMAL.max) {
        return 'primary'
      } else if (hours <= AVG_WORK_HOURS_STANDARDS.SLOW.max) {
        return 'warning'
      } else {
        return 'danger'
      }
    },
    getBarColor(hours) {
      if (hours <= AVG_WORK_HOURS_STANDARDS.HIGH_EFFICIENT.max) {
        return 'linear-gradient(90deg, #85CE61 0%, #67C23A 100%)'
      } else if (hours <= AVG_WORK_HOURS_STANDARDS.NORMAL.max) {
        return 'linear-gradient(90deg, #66B1FF 0%, #409EFF 100%)'
      } else if (hours <= AVG_WORK_HOURS_STANDARDS.SLOW.max) {
        return 'linear-gradient(90deg, #F0B020 0%, #E6A23C 100%)'
      } else {
        return 'linear-gradient(90deg, #F78989 0%, #F56C6C 100%)'
      }
    },
    getEfficiencyDesc(hours) {
      if (hours <= AVG_WORK_HOURS_STANDARDS.HIGH_EFFICIENT.max) {
        return AVG_WORK_HOURS_STANDARDS.HIGH_EFFICIENT.description
      } else if (hours <= AVG_WORK_HOURS_STANDARDS.NORMAL.max) {
        return AVG_WORK_HOURS_STANDARDS.NORMAL.description
      } else if (hours <= AVG_WORK_HOURS_STANDARDS.SLOW.max) {
        return AVG_WORK_HOURS_STANDARDS.SLOW.description
      } else {
        return AVG_WORK_HOURS_STANDARDS.INEFFICIENT.description
      }
    }
  }
}
</script>

<style scoped lang="scss">
.avg-hours-comparison-card {
  margin-bottom: 16px;

  .card-header {
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

  .comparison-content {
    .overall-avg {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      background: linear-gradient(135deg, #E3F2FD 0%, #F5F7FA 100%);
      border-radius: 8px;
      margin-bottom: 24px;

      .avg-badge {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 64px;
        height: 64px;
        background: linear-gradient(135deg, #409EFF 0%, #2979FF 100%);
        border-radius: 50%;
        box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);

        i {
          font-size: 32px;
          color: #fff;
        }
      }

      .avg-info {
        flex: 1;

        .avg-label {
          font-size: 14px;
          color: #606266;
          margin-bottom: 6px;
        }

        .avg-value {
          .value {
            font-size: 32px;
            font-weight: 700;
            color: #303133;
            margin-right: 8px;
          }

          .unit {
            font-size: 14px;
            color: #909399;
          }
        }

        .avg-tag {
          margin-top: 8px;
        }
      }
    }

    .comparison-list {
      display: flex;
      flex-direction: column;
      gap: 16px;

      .comparison-item {
        padding: 16px;
        background: #FAFAFA;
        border-radius: 8px;
        transition: all 0.3s;

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

            .name-text {
              font-size: 15px;
              font-weight: 600;
              color: #303133;
            }
          }

          .item-hours {
            .hours-value {
              font-size: 20px;
              font-weight: 700;
              color: #303133;
              margin-right: 4px;
            }

            .hours-unit {
              font-size: 12px;
              color: #909399;
            }
          }
        }

        .item-comparison {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;

          .comparison-bar {
            flex: 1;
            height: 32px;
            background: #E4E7ED;
            border-radius: 16px;
            position: relative;
            overflow: visible;

            .bar-fill {
              height: 100%;
              border-radius: 16px;
              display: flex;
              align-items: center;
              justify-content: flex-end;
              padding: 0 12px;
              transition: width 0.6s ease;

              .bar-text {
                font-size: 13px;
                font-weight: 600;
                color: #fff;
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
              }
            }

            .avg-marker {
              position: absolute;
              top: -6px;
              bottom: -6px;
              width: 2px;
              transform: translateX(-50%);

              .marker-line {
                width: 2px;
                height: 100%;
                background: #303133;
                position: relative;

                &::before,
                &::after {
                  content: '';
                  position: absolute;
                  left: 50%;
                  transform: translateX(-50%);
                  width: 8px;
                  height: 8px;
                  background: #303133;
                  border-radius: 50%;
                }

                &::before {
                  top: -4px;
                }

                &::after {
                  bottom: -4px;
                }
              }
            }
          }

          .comparison-info {
            min-width: 80px;
            text-align: right;
            font-size: 14px;
            font-weight: 600;

            .positive {
              color: #F56C6C;
            }

            .negative {
              color: #67C23A;
            }

            .info-text {
              font-size: 12px;
              color: #909399;
              margin-left: 4px;
            }
          }
        }

        .item-details {
          display: flex;
          gap: 20px;
          font-size: 13px;
          color: #606266;

          .detail-item {
            .detail-label {
              color: #909399;
              margin-right: 4px;
            }

            .detail-value {
              font-weight: 500;
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
</style>

