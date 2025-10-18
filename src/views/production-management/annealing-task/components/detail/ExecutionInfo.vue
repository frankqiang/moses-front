/**
 * 文件名称：ExecutionInfo.vue
 * 文件描述：退火任务执行信息卡片组件
 * 创建日期：2025-10-18
 * 修改记录：
 *   - 2025-10-18: 初始创建
 */

<template>
  <el-card class="info-card" shadow="never">
    <div slot="header" class="card-header">
      <span class="card-title">执行信息</span>
    </div>
    <el-descriptions :column="3" border>
      <el-descriptions-item label="实际装炉开始时间">
        <span class="info-value">
          {{ formatTime(executionInfo.actualLoadingStartedAt) }}
        </span>
      </el-descriptions-item>
      <el-descriptions-item label="实际装炉完成时间">
        <span class="info-value">
          {{ formatTime(executionInfo.actualLoadingCompletedAt) }}
        </span>
      </el-descriptions-item>
      <el-descriptions-item label="装炉用时">
        <span class="info-value">
          {{ calculateDuration(
            executionInfo.actualLoadingStartedAt,
            executionInfo.actualLoadingCompletedAt
          ) }}
        </span>
      </el-descriptions-item>
      <el-descriptions-item label="退火开始时间">
        <span class="info-value">
          {{ formatTime(executionInfo.executionStartedAt) }}
        </span>
      </el-descriptions-item>
      <el-descriptions-item label="退火完成时间">
        <span class="info-value">
          {{ formatTime(executionInfo.executionCompletedAt) }}
        </span>
      </el-descriptions-item>
      <el-descriptions-item label="退火用时">
        <span class="info-value">
          {{ calculateDuration(
            executionInfo.executionStartedAt,
            executionInfo.executionCompletedAt
          ) }}
        </span>
      </el-descriptions-item>
      <el-descriptions-item label="实际出炉开始时间">
        <span class="info-value">
          {{ formatTime(executionInfo.actualUnloadingStartedAt) }}
        </span>
      </el-descriptions-item>
      <el-descriptions-item label="实际出炉完成时间">
        <span class="info-value">
          {{ formatTime(executionInfo.actualUnloadingCompletedAt) }}
        </span>
      </el-descriptions-item>
      <el-descriptions-item label="出炉用时">
        <span class="info-value">
          {{ calculateDuration(
            executionInfo.actualUnloadingStartedAt,
            executionInfo.actualUnloadingCompletedAt
          ) }}
        </span>
      </el-descriptions-item>
    </el-descriptions>
  </el-card>
</template>

<script>
import { parseTime } from '@/utils'

export default {
  name: 'ExecutionInfo',
  props: {
    executionInfo: {
      type: Object,
      required: true
    }
  },
  methods: {
    formatTime(time) {
      if (!time) return '-'
      return parseTime(time, '{y}-{m}-{d} {h}:{i}')
    },
    calculateDuration(startTime, endTime) {
      if (!startTime || !endTime) return '-'
      const start = new Date(startTime)
      const end = new Date(endTime)
      const durationMinutes = Math.round((end - start) / 1000 / 60)

      if (durationMinutes < 60) {
        return `${durationMinutes}分钟`
      }

      const hours = Math.floor(durationMinutes / 60)
      const minutes = durationMinutes % 60
      return `${hours}小时${minutes}分钟`
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
</style>

