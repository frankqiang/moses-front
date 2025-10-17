<!--
  文件名称：TaskTimeline.vue
  文件描述：任务时间线组件 - 操作历史展示
  创建日期：2024-01-20
  修改记录：
    - 2024-01-20: 初始创建
-->
<template>
  <div class="task-timeline">
    <div class="timeline-header">
      <span class="title">任务时间线</span>
    </div>

    <el-timeline v-if="timelineItems.length > 0">
      <el-timeline-item
        v-for="(item, index) in timelineItems"
        :key="index"
        :timestamp="item.timestamp"
        :type="item.type"
        :icon="item.icon"
        :color="item.color"
        placement="top"
      >
        <div class="timeline-content">
          <div class="timeline-title">{{ item.title }}</div>
          <div v-if="item.description" class="timeline-description">
            {{ item.description }}
          </div>
          <div v-if="item.operator" class="timeline-operator">
            操作人：{{ item.operator }}
          </div>
        </div>
      </el-timeline-item>
    </el-timeline>

    <div v-else class="empty-state">
      <i class="el-icon-time" />
      <p>暂无操作记录</p>
    </div>
  </div>
</template>

<script>
import { parseTime } from '@/utils'

export default {
  name: 'TaskTimeline',

  props: {
    // 任务数据
    task: {
      type: Object,
      required: true
    }
  },

  computed: {
    /**
     * 生成时间线数据
     */
    timelineItems() {
      const items = []

      // 创建任务
      if (this.task.createdAt) {
        items.push({
          timestamp: this.formatDateTime(this.task.createdAt),
          title: '创建任务',
          description: `任务编码：${this.task.taskCode}`,
          operator: this.task.creator?.name,
          type: 'primary',
          icon: 'el-icon-plus',
          color: '#409eff'
        })
      }

      // 任务派工
      if (this.task.assignedTo && this.task.assignee) {
        items.push({
          timestamp: this.formatDateTime(this.task.updatedAt),
          title: '任务派工',
          description: `派工给：${this.task.assignee.name}`,
          operator: this.task.updater?.name,
          type: 'primary',
          icon: 'el-icon-user',
          color: '#409eff'
        })
      }

      // 开始执行
      if (this.task.actualStartTime) {
        items.push({
          timestamp: this.formatDateTime(this.task.actualStartTime),
          title: '开始执行',
          description: '任务进入执行中状态',
          operator: this.task.assignee?.name,
          type: 'warning',
          icon: 'el-icon-video-play',
          color: '#e6a23c'
        })
      }

      // 任务延期
      if (this.task.delayReason) {
        items.push({
          timestamp: this.formatDateTime(this.task.updatedAt),
          title: '任务延期',
          description: `延期原因：${this.task.delayReason}`,
          operator: this.task.assignee?.name,
          type: 'warning',
          icon: 'el-icon-warning-outline',
          color: '#e6a23c'
        })
      }

      // 完成任务
      if (this.task.actualEndTime) {
        items.push({
          timestamp: this.formatDateTime(this.task.actualEndTime),
          title: '完成任务',
          description: '任务已完成，等待确认',
          operator: this.task.assignee?.name,
          type: 'success',
          icon: 'el-icon-circle-check',
          color: '#67c23a'
        })
      }

      // 任务确认
      if (this.task.confirmedAt) {
        items.push({
          timestamp: this.formatDateTime(this.task.confirmedAt),
          title: '任务确认',
          description: '任务已确认，维护记录已生成',
          operator: this.task.confirmer?.name,
          type: 'success',
          icon: 'el-icon-success',
          color: '#67c23a'
        })
      }

      // 任务取消
      if (this.task.status === '已取消') {
        items.push({
          timestamp: this.formatDateTime(this.task.updatedAt),
          title: '任务取消',
          description: this.task.remark || '任务已取消',
          operator: this.task.updater?.name,
          type: 'danger',
          icon: 'el-icon-circle-close',
          color: '#f56c6c'
        })
      }

      // 按时间倒序排列
      return items.reverse()
    }
  },

  methods: {
    /**
     * 格式化日期时间
     */
    formatDateTime(dateTime) {
      return dateTime ? parseTime(dateTime, '{y}-{m}-{d} {h}:{i}:{s}') : '-'
    }
  }
}
</script>

<style lang="scss" scoped>
.task-timeline {
  .timeline-header {
    margin-bottom: 20px;

    .title {
      font-size: 16px;
      font-weight: 500;
      color: #303133;
    }
  }

  .timeline-content {
    .timeline-title {
      font-size: 14px;
      font-weight: 500;
      color: #303133;
      margin-bottom: 4px;
    }

    .timeline-description {
      font-size: 13px;
      color: #606266;
      margin-bottom: 4px;
      line-height: 1.5;
    }

    .timeline-operator {
      font-size: 12px;
      color: #909399;
    }
  }

  .empty-state {
    text-align: center;
    padding: 60px 0;
    color: #909399;

    i {
      font-size: 48px;
      margin-bottom: 16px;
    }

    p {
      margin: 0;
      font-size: 14px;
    }
  }
}

::v-deep .el-timeline-item__timestamp {
  font-size: 12px;
  color: #909399;
}
</style>

