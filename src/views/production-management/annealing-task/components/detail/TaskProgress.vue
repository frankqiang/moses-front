/**
 * 文件名称：TaskProgress.vue
 * 文件描述：退火任务执行进度可视化组件
 * 创建日期：2025-10-18
 * 修改记录：
 *   - 2025-10-18: 初始创建
 */

<template>
  <el-card class="info-card" shadow="never">
    <div slot="header" class="card-header">
      <span class="card-title">执行进度</span>
      <el-button
        type="text"
        icon="el-icon-refresh"
        :loading="refreshing"
        @click="handleRefresh"
      >
        刷新
      </el-button>
    </div>
    <div v-if="progressData" class="progress-container">
      <!-- 整体进度 -->
      <div class="overall-progress">
        <div class="progress-label">
          <span>整体进度</span>
          <span class="progress-phase">{{ getPhaseLabel(progressData.overallProgress.currentPhase) }}</span>
        </div>
        <el-progress
          :percentage="progressData.overallProgress.percentage"
          :stroke-width="24"
          :color="getProgressColor(progressData.overallProgress.percentage)"
        />
      </div>

      <!-- 各阶段进度 -->
      <el-row :gutter="16" class="stages-progress">
        <!-- 装炉阶段 -->
        <el-col :span="8">
          <div class="stage-card">
            <div class="stage-header">
              <i class="el-icon-upload2" />
              <span class="stage-title">装炉阶段</span>
            </div>
            <div class="stage-body">
              <div class="circular-progress">
                <el-progress
                  type="circle"
                  :percentage="progressData.loadingProgress.percentage"
                  :width="120"
                  :color="getStageColor(progressData.loadingProgress.status)"
                >
                  <template slot="default">
                    <div class="progress-content">
                      <div class="progress-percent">{{ progressData.loadingProgress.percentage }}%</div>
                      <div class="progress-status">{{ getProgressStatusLabel(progressData.loadingProgress.status) }}</div>
                    </div>
                  </template>
                </el-progress>
              </div>
              <div class="stage-details">
                <div class="detail-item">
                  <span class="detail-label">开始时间：</span>
                  <span class="detail-value">{{ formatTime(progressData.loadingProgress.startedAt) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">完成时间：</span>
                  <span class="detail-value">{{ formatTime(progressData.loadingProgress.completedAt) }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-col>

        <!-- 执行阶段 -->
        <el-col :span="8">
          <div class="stage-card">
            <div class="stage-header">
              <i class="el-icon-time" />
              <span class="stage-title">执行阶段</span>
            </div>
            <div class="stage-body">
              <div class="circular-progress">
                <el-progress
                  type="circle"
                  :percentage="progressData.executionProgress.percentage"
                  :width="120"
                  :color="getStageColor(progressData.executionProgress.status)"
                >
                  <template slot="default">
                    <div class="progress-content">
                      <div class="progress-percent">{{ progressData.executionProgress.percentage }}%</div>
                      <div class="progress-status">{{ getProgressStatusLabel(progressData.executionProgress.status) }}</div>
                    </div>
                  </template>
                </el-progress>
              </div>
              <div class="stage-details">
                <div class="detail-item">
                  <span class="detail-label">已用时长：</span>
                  <span class="detail-value">{{ formatDuration(progressData.executionProgress.elapsedMinutes) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">剩余时长：</span>
                  <span class="detail-value">{{ formatDuration(progressData.executionProgress.remainingMinutes) }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-col>

        <!-- 出炉阶段 -->
        <el-col :span="8">
          <div class="stage-card">
            <div class="stage-header">
              <i class="el-icon-download" />
              <span class="stage-title">出炉阶段</span>
            </div>
            <div class="stage-body">
              <div class="circular-progress">
                <el-progress
                  type="circle"
                  :percentage="progressData.unloadingProgress.percentage"
                  :width="120"
                  :color="getStageColor(progressData.unloadingProgress.status)"
                >
                  <template slot="default">
                    <div class="progress-content">
                      <div class="progress-percent">{{ progressData.unloadingProgress.percentage }}%</div>
                      <div class="progress-status">{{ getProgressStatusLabel(progressData.unloadingProgress.status) }}</div>
                    </div>
                  </template>
                </el-progress>
              </div>
              <div class="stage-details">
                <div class="detail-item">
                  <span class="detail-label">开始时间：</span>
                  <span class="detail-value">{{ formatTime(progressData.unloadingProgress.startedAt) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">完成时间：</span>
                  <span class="detail-value">{{ formatTime(progressData.unloadingProgress.completedAt) }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>

      <!-- 物料统计 -->
      <div class="material-stats">
        <div class="stats-title">物料统计</div>
        <el-row :gutter="16">
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-label">总物料数</div>
              <div class="stat-value">{{ progressData.materialProgress.totalCount }}</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-label">已装炉</div>
              <div class="stat-value loaded">{{ progressData.materialProgress.loadedCount }}</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-label">执行中</div>
              <div class="stat-value in-progress">{{ progressData.materialProgress.inProgressCount }}</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-label">已出炉</div>
              <div class="stat-value unloaded">{{ progressData.materialProgress.unloadedCount }}</div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
    <el-empty
      v-else
      description="暂无进度信息"
      :image-size="80"
    />
  </el-card>
</template>

<script>
import { parseTime } from '@/utils'
import {
  PROGRESS_PHASE_MAP,
  PROGRESS_STATUS_MAP,
  PROGRESS_STATUS_COLOR_MAP
} from '../../constants'

export default {
  name: 'TaskProgress',
  props: {
    progressData: {
      type: Object,
      default: null
    },
    refreshing: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    getPhaseLabel(phase) {
      return PROGRESS_PHASE_MAP[phase] || phase || '-'
    },
    getProgressStatusLabel(status) {
      return PROGRESS_STATUS_MAP[status] || status || '-'
    },
    getProgressColor(percentage) {
      if (percentage < 30) return '#909399'
      if (percentage < 70) return '#409EFF'
      if (percentage < 100) return '#E6A23C'
      return '#67C23A'
    },
    getStageColor(status) {
      return PROGRESS_STATUS_COLOR_MAP[status] || '#909399'
    },
    formatTime(time) {
      if (!time) return '-'
      return parseTime(time, '{y}-{m}-{d} {h}:{i}')
    },
    formatDuration(minutes) {
      if (!minutes && minutes !== 0) return '-'
      if (minutes < 60) {
        return `${minutes}分钟`
      }
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      return `${hours}小时${mins}分钟`
    },
    handleRefresh() {
      this.$emit('refresh')
    }
  }
}
</script>

<style lang="scss" scoped>
.info-card {
  margin-bottom: 16px;

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
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.progress-container {
  .overall-progress {
    margin-bottom: 32px;

    .progress-label {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
      font-size: 14px;
      color: #606266;

      .progress-phase {
        color: #409EFF;
        font-weight: 500;
      }
    }
  }

  .stages-progress {
    margin-bottom: 24px;

    .stage-card {
      background: #fafafa;
      border-radius: 8px;
      padding: 16px;

      .stage-header {
        display: flex;
        align-items: center;
        margin-bottom: 16px;
        font-size: 14px;
        color: #303133;

        i {
          font-size: 18px;
          margin-right: 8px;
          color: #409EFF;
        }

        .stage-title {
          font-weight: 500;
        }
      }

      .stage-body {
        .circular-progress {
          display: flex;
          justify-content: center;
          margin-bottom: 16px;

          .progress-content {
            text-align: center;

            .progress-percent {
              font-size: 18px;
              font-weight: 600;
              color: #303133;
              margin-bottom: 4px;
            }

            .progress-status {
              font-size: 12px;
              color: #909399;
            }
          }
        }

        .stage-details {
          .detail-item {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            line-height: 24px;

            .detail-label {
              color: #909399;
            }

            .detail-value {
              color: #606266;
            }
          }
        }
      }
    }
  }

  .material-stats {
    background: #f5f7fa;
    border-radius: 8px;
    padding: 20px;

    .stats-title {
      font-size: 14px;
      font-weight: 500;
      color: #303133;
      margin-bottom: 16px;
    }

    .stat-item {
      text-align: center;

      .stat-label {
        font-size: 13px;
        color: #909399;
        margin-bottom: 8px;
      }

      .stat-value {
        font-size: 24px;
        font-weight: 600;
        color: #303133;

        &.loaded {
          color: #67C23A;
        }

        &.in-progress {
          color: #409EFF;
        }

        &.unloaded {
          color: #909399;
        }
      }
    }
  }
}
</style>

