/**
 * 文件名称：PlanInfo.vue
 * 文件描述：退火任务关联的生产计划信息卡片组件
 * 创建日期：2025-10-18
 * 修改记录：
 *   - 2025-10-18: 初始创建
 *   - 2025-10-22: 根据接口改进v1.1.0，优先使用后端返回的中文标签（statusLabel、planPriorityLabel）
 */

<template>
  <el-card class="info-card" shadow="never">
    <div slot="header" class="card-header">
      <span class="card-title">生产计划信息</span>
    </div>
    <el-descriptions v-if="planInfo || planItemInfo" :column="3" border>
      <!-- 生产计划信息 -->
      <template v-if="planInfo">
        <el-descriptions-item label="生产计划编号">
          <el-link
            type="primary"
            :underline="false"
            @click="handleViewPlan(planInfo.id)"
          >
            {{ planInfo.planNumber || '-' }}
          </el-link>
        </el-descriptions-item>
        <el-descriptions-item label="计划优先级">
          <span class="info-value">{{ planInfo.planPriorityLabel || planInfo.planPriority || '-' }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="计划状态">
          <span class="info-value">{{ planInfo.statusLabel || planInfo.status || '-' }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="外部订单号">
          <span class="info-value">{{ planInfo.externalOrderNumber || '-' }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="客户名称">
          <span class="info-value">{{ planInfo.customerName || '-' }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="交货日期">
          <span class="info-value">{{ formatTime(planInfo.deliveryDate) }}</span>
        </el-descriptions-item>
      </template>

      <!-- 计划批次信息 -->
      <template v-if="planItemInfo">
        <el-descriptions-item label="批次序号">
          <span class="info-value">{{ planItemInfo.itemNumber || '-' }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="批次计划重量">
          <span class="info-value weight-value">
            {{ formatWeight(planItemInfo.plannedWeight) }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="批次计划数量">
          <span class="info-value">{{ planItemInfo.plannedQuantity || '-' }}</span>
        </el-descriptions-item>
      </template>
    </el-descriptions>
    <el-empty
      v-else
      description="无关联生产计划信息（手工创建任务）"
      :image-size="80"
    />
  </el-card>
</template>

<script>
import { parseTime } from '@/utils'

export default {
  name: 'PlanInfo',
  props: {
    planInfo: {
      type: Object,
      default: null
    },
    planItemInfo: {
      type: Object,
      default: null
    }
  },
  methods: {
    formatWeight(weight) {
      if (weight === null || weight === undefined) {
        return '-'
      }
      return `${Number(weight).toFixed(3)} 吨`
    },
    formatTime(time) {
      if (!time) return '-'
      return parseTime(time, '{y}-{m}-{d}')
    },
    handleViewPlan(planId) {
      if (!planId) return
      this.$emit('view-plan', planId)
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

