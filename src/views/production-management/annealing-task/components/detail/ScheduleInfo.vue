/**
 * 文件名称：ScheduleInfo.vue
 * 文件描述：退火任务排程信息卡片组件
 * 创建日期：2025-10-18
 * 修改记录：
 *   - 2025-10-18: 初始创建
 */

<template>
  <el-card class="info-card" shadow="never">
    <div slot="header" class="card-header">
      <span class="card-title">排程信息</span>
    </div>
    <el-descriptions :column="3" border>
      <el-descriptions-item label="计划执行炉号">
        <span class="info-value furnace-code">
          {{ scheduleInfo.plannedFurnaceCode || '未分配' }}
        </span>
      </el-descriptions-item>
      <el-descriptions-item label="排程方案ID">
        <span class="info-value">{{ scheduleInfo.schedulePlanId || '未分配' }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="排程发布时间">
        <span class="info-value">{{ formatTime(scheduleInfo.schedulePublishedAt) }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="计划装炉时间">
        <span class="info-value time-value">
          {{ formatTime(scheduleInfo.plannedLoadingAt) }}
        </span>
      </el-descriptions-item>
      <el-descriptions-item label="计划出炉时间">
        <span class="info-value time-value">
          {{ formatTime(scheduleInfo.plannedUnloadingAt) }}
        </span>
      </el-descriptions-item>
      <el-descriptions-item label="预计执行时长">
        <span class="info-value">
          {{ formatDuration(scheduleInfo.expectedDurationMinutes) }}
        </span>
      </el-descriptions-item>
      <el-descriptions-item label="预计能耗">
        <span class="info-value">
          {{ formatEnergy(scheduleInfo.estimatedEnergyConsumption) }}
        </span>
      </el-descriptions-item>
      <el-descriptions-item label="排程锁定截止时间" :span="2">
        <span class="info-value">{{ formatTime(scheduleInfo.scheduleLockedUntil) }}</span>
      </el-descriptions-item>
    </el-descriptions>
  </el-card>
</template>

<script>
import { parseTime } from '@/utils'

export default {
  name: 'ScheduleInfo',
  props: {
    scheduleInfo: {
      type: Object,
      required: true
    }
  },
  methods: {
    formatTime(time) {
      if (!time) return '未分配'
      return parseTime(time, '{y}-{m}-{d} {h}:{i}')
    },
    formatDuration(minutes) {
      if (!minutes) return '未分配'
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      return hours > 0 ? `${hours}小时${mins}分钟` : `${mins}分钟`
    },
    formatEnergy(energy) {
      if (energy === null || energy === undefined) return '未分配'
      return `${Number(energy).toFixed(1)} kWh`
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

.furnace-code {
  font-weight: 500;
  color: #E6A23C;
}

.time-value {
  font-weight: 500;
}
</style>

