/**
 * 文件名称：BasicInfo.vue
 * 文件描述：退火任务基本信息卡片组件
 * 创建日期：2025-10-18
 * 修改记录：
 *   - 2025-10-18: 初始创建
 *   - 2025-10-22: 根据接口改进v1.1.0，优先使用后端返回的中文标签（statusLabel、priorityLabel、sourceLabel）
 *                和完整的用户信息对象（createdByUser、updatedByUser）
 */

<template>
  <el-card class="info-card" shadow="never">
    <div slot="header" class="card-header">
      <span class="card-title">基本信息</span>
    </div>
    <el-descriptions :column="3" border>
      <el-descriptions-item label="任务编号">
        <span class="info-value">{{ taskData.taskCode || '-' }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="任务名称">
        <span class="info-value">{{ taskData.taskName || '-' }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="任务状态">
        <el-tag :type="getStatusType(taskData.status)" size="small">
          {{ taskData.statusLabel || getStatusLabel(taskData.status) }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="任务来源">
        <span class="info-value">{{ taskData.sourceLabel || getSourceLabel(taskData.source) }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="任务优先级">
        <el-tag :type="getPriorityType(taskData.priority)" size="small">
          {{ taskData.priorityLabel || getPriorityLabel(taskData.priority) }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="计划重量">
        <span class="info-value weight-value">
          {{ formatWeight(taskData.plannedWeight) }}
        </span>
      </el-descriptions-item>
      <el-descriptions-item label="计划数量">
        <span class="info-value">{{ taskData.plannedQuantity || '-' }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="实际重量">
        <span class="info-value weight-value">
          {{ formatWeight(taskData.actualWeight) }}
        </span>
      </el-descriptions-item>
      <el-descriptions-item label="物料数量">
        <span class="info-value">{{ taskData.materialCount || 0 }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="创建人">
        <span class="info-value">{{ getCreatorName(taskData) }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="创建时间">
        <span class="info-value">{{ formatTime(taskData.createdAt) }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="最后更新人">
        <span class="info-value">{{ getUpdaterName(taskData) }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="最后更新时间">
        <span class="info-value">{{ formatTime(taskData.updatedAt) }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="备注" :span="2">
        <span class="info-value">{{ taskData.remarks || '-' }}</span>
      </el-descriptions-item>
    </el-descriptions>
  </el-card>
</template>

<script>
import { parseTime } from '@/utils'
import {
  TASK_STATUS_OPTIONS,
  TASK_PRIORITY_OPTIONS,
  TASK_SOURCE_OPTIONS,
  STATUS_COLOR_MAP,
  PRIORITY_COLOR_MAP
} from '../../constants'

export default {
  name: 'BasicInfo',
  props: {
    taskData: {
      type: Object,
      required: true
    }
  },
  methods: {
    /**
     * 获取创建人姓名（优先使用createdByUser对象）
     */
    getCreatorName(taskData) {
      if (taskData.createdByUser) {
        return taskData.createdByUser.name || taskData.createdByUser.username || '-'
      }
      return taskData.createdBy || '-'
    },

    /**
     * 获取更新人姓名（优先使用updatedByUser对象）
     */
    getUpdaterName(taskData) {
      if (taskData.updatedByUser) {
        return taskData.updatedByUser.name || taskData.updatedByUser.username || '-'
      }
      return taskData.updatedBy || '-'
    },

    getStatusLabel(status) {
      const option = TASK_STATUS_OPTIONS.find(item => item.value === status)
      return option ? option.label : status || '-'
    },
    getStatusType(status) {
      return STATUS_COLOR_MAP[status] || 'info'
    },
    getPriorityLabel(priority) {
      const option = TASK_PRIORITY_OPTIONS.find(item => item.value === priority)
      return option ? option.label : priority || '-'
    },
    getPriorityType(priority) {
      return PRIORITY_COLOR_MAP[priority] || 'info'
    },
    getSourceLabel(source) {
      const option = TASK_SOURCE_OPTIONS.find(item => item.value === source)
      return option ? option.label : source || '-'
    },
    formatWeight(weight) {
      if (weight === null || weight === undefined) {
        return '-'
      }
      return `${Number(weight).toFixed(3)} 吨`
    },
    formatTime(time) {
      if (!time) return '-'
      return parseTime(time, '{y}-{m}-{d} {h}:{i}')
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

.info-value {
  color: #606266;
  font-size: 14px;
}

.weight-value {
  font-weight: 500;
  color: #409EFF;
}
</style>

