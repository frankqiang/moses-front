/**
 * 文件名称：StatusTimelineDialog.vue
 * 文件描述：退火任务状态流转历史时间轴对话框
 * 创建日期：2025-10-20
 * 修改记录：
 *   - 2025-10-20: 初始创建，实现状态流转历史可视化展示
 */
<template>
  <el-dialog
    :visible.sync="dialogVisible"
    title="状态流转历史"
    width="700px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div v-loading="loading" class="timeline-container">
      <!-- 空状态 -->
      <el-empty
        v-if="!loading && (!timelineData || timelineData.length === 0)"
        description="暂无状态流转记录"
        :image-size="120"
      />

      <!-- 时间轴 -->
      <el-timeline v-if="timelineData && timelineData.length > 0">
        <el-timeline-item
          v-for="(item, index) in timelineData"
          :key="index"
          :timestamp="formatTimestamp(item.timestamp)"
          :color="getTimelineColor(item.status)"
          placement="top"
        >
          <el-card class="timeline-card" shadow="hover">
            <div class="timeline-header">
              <status-tag
                :status="item.status"
                :text-map="statusTextMap"
                :type-map="statusTypeMap"
                effect="light"
                size="medium"
              />
              <span v-if="index === 0" class="current-badge">当前</span>
            </div>

            <div v-if="item.description" class="timeline-description">
              {{ item.description }}
            </div>

            <div v-if="item.reason" class="timeline-reason">
              <el-tag type="warning" size="small" effect="plain">
                原因
              </el-tag>
              <span>{{ item.reason }}</span>
            </div>

            <div v-if="item.remarks" class="timeline-remarks">
              <el-tag type="info" size="small" effect="plain">
                备注
              </el-tag>
              <span>{{ item.remarks }}</span>
            </div>

            <div class="timeline-footer">
              <span class="operator-info">
                <i class="el-icon-user" />
                {{ item.operatorName || '系统' }}
              </span>
              <span v-if="item.duration" class="duration-info">
                <i class="el-icon-time" />
                持续 {{ item.duration }}
              </span>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </div>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">关闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { fetchAnnealingTaskDetail } from '../api'
import { STATUS_CONFIG } from '../constants/table-config'
import StatusTag from '@/components/StatusTag'
import { parseTime } from '@/utils'

export default {
  name: 'StatusTimelineDialog',
  components: {
    StatusTag
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    taskCode: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      loading: false,
      timelineData: [],
      statusTextMap: STATUS_CONFIG.textMap,
      statusTypeMap: STATUS_CONFIG.typeMap
    }
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible
      },
      set(val) {
        this.$emit('update:visible', val)
      }
    }
  },
  watch: {
    visible(val) {
      if (val && this.taskCode) {
        this.loadTimelineData()
      }
    }
  },
  methods: {
    async loadTimelineData() {
      this.loading = true
      try {
        // 注意：这里假设任务详情接口返回操作日志
        // 实际实现需要根据后端接口调整
        const response = await fetchAnnealingTaskDetail(this.taskCode)

        if (response && response.data) {
          this.buildTimelineData(response.data)
        }
      } catch (error) {
        console.error('加载状态历史失败:', error)
        this.$message.error('加载状态历史失败')
      } finally {
        this.loading = false
      }
    },
    buildTimelineData(taskData) {
      // 从任务数据和操作日志构建时间轴数据
      const timeline = []
      const task = taskData.task

      // 构建当前状态记录
      if (task.status) {
        timeline.push({
          status: task.status,
          timestamp: task.statusUpdatedAt || task.updatedAt,
          description: this.getStatusDescription(task.status),
          operatorName: task.updatedByName,
          remarks: task.remarks
        })
      }

      // 如果有操作日志，解析状态变更记录
      if (taskData.logs && Array.isArray(taskData.logs)) {
        const statusChangeLogs = taskData.logs
          .filter(log => log.action === 'status-changed')
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

        statusChangeLogs.forEach(log => {
          const originalValue = log.originalValue ? JSON.parse(log.originalValue) : {}
          const newValue = log.newValue ? JSON.parse(log.newValue) : {}

          timeline.push({
            status: newValue.status || originalValue.status,
            timestamp: log.createdAt,
            description: log.description,
            reason: log.operationContext?.reason,
            remarks: log.operationContext?.remarks,
            operatorName: log.operatorName
          })
        })
      }

      // 计算每个状态的持续时间
      for (let i = 0; i < timeline.length - 1; i++) {
        const currentTime = new Date(timeline[i].timestamp)
        const nextTime = new Date(timeline[i + 1].timestamp)
        const duration = this.calculateDuration(nextTime, currentTime)
        timeline[i].duration = duration
      }

      // 如果当前状态不是终态，计算已持续时间
      if (timeline.length > 0 && !this.isFinalStatus(timeline[0].status)) {
        const duration = this.calculateDuration(new Date(timeline[0].timestamp), new Date())
        timeline[0].duration = duration
      }

      this.timelineData = timeline
    },
    getStatusDescription(status) {
      const descriptions = {
        'draft': '任务创建为草稿状态',
        'pending-schedule': '任务提交待排程',
        'scheduled': '排程系统已分配炉号和时间',
        'waiting-loading': '等待开始装炉',
        'loading': '装炉操作进行中',
        'waiting-execute': '装炉完成，等待执行',
        'in-progress': '退火工艺执行中',
        'waiting-unload': '退火完成，等待出炉',
        'completed': '任务已完成',
        'paused': '任务已暂停',
        'cancelled': '任务已取消',
        'terminated': '任务异常终止'
      }
      return descriptions[status] || ''
    },
    isFinalStatus(status) {
      return ['completed', 'cancelled', 'terminated'].includes(status)
    },
    calculateDuration(startTime, endTime) {
      const diff = endTime - startTime
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      if (hours > 24) {
        const days = Math.floor(hours / 24)
        const remainHours = hours % 24
        return `${days}天${remainHours}小时`
      } else if (hours > 0) {
        return `${hours}小时${minutes}分钟`
      } else if (minutes > 0) {
        return `${minutes}分钟`
      } else {
        return '刚刚'
      }
    },
    formatTimestamp(timestamp) {
      return parseTime(timestamp, '{y}-{m}-{d} {h}:{i}:{s}')
    },
    getTimelineColor(status) {
      const colorMap = {
        'draft': '#909399',
        'pending-schedule': '#409EFF',
        'scheduled': '#67C23A',
        'waiting-loading': '#E6A23C',
        'loading': '#E6A23C',
        'waiting-execute': '#E6A23C',
        'in-progress': '#E6A23C',
        'waiting-unload': '#E6A23C',
        'completed': '#67C23A',
        'paused': '#909399',
        'cancelled': '#F56C6C',
        'terminated': '#F56C6C'
      }
      return colorMap[status] || '#409EFF'
    },
    handleClose() {
      this.dialogVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
.timeline-container {
  min-height: 300px;
  max-height: 600px;
  overflow-y: auto;
  padding: 16px 0;
}

.timeline-card {
  margin-bottom: 16px;

  ::v-deep .el-card__body {
    padding: 16px;
  }
}

.timeline-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;

  .current-badge {
    padding: 2px 8px;
    background-color: #67C23A;
    color: white;
    font-size: 12px;
    border-radius: 2px;
  }
}

.timeline-description {
  margin-bottom: 8px;
  font-size: 14px;
  color: #606266;
}

.timeline-reason,
.timeline-remarks {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 13px;
  color: #606266;

  span {
    flex: 1;
    line-height: 1.5;
  }
}

.timeline-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #EBEEF5;
  font-size: 12px;
  color: #909399;

  .operator-info,
  .duration-info {
    display: flex;
    align-items: center;
    gap: 4px;

    i {
      font-size: 14px;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}

::v-deep .el-timeline {
  padding-left: 0;
}

::v-deep .el-timeline-item__timestamp {
  font-size: 13px;
  font-weight: 500;
  color: #606266;
}
</style>

