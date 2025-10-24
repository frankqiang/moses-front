<template>
  <div class="basic-info-panel">
    <!-- 方案状态和关键指标卡片 -->
    <el-row :gutter="20" class="metrics-row">
      <!-- 方案状态卡片 -->
      <el-col :span="6">
        <el-card shadow="hover" class="metric-card status-card">
          <div class="card-header">
            <span class="card-title">方案状态</span>
          </div>
          <div class="card-content">
            <status-tag
              :status="plan.status"
              :type-map="statusConfig.typeMap"
              size="large"
            >
              {{ plan.statusLabel || statusConfig.textMap[plan.status] }}
            </status-tag>
            <div class="status-time">
              {{ formatStatusTime }}
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 利用率卡片 -->
      <el-col :span="6">
        <el-card shadow="hover" class="metric-card">
          <div class="card-header">
            <span class="card-title">炉子利用率</span>
          </div>
          <div class="card-content">
            <el-progress
              :percentage="plan.utilizationRate"
              :color="getProgressColor(plan.utilizationRate)"
              :stroke-width="20"
            />
            <div class="metric-value">{{ plan.utilizationRate }}%</div>
          </div>
        </el-card>
      </el-col>

      <!-- 装载率卡片 -->
      <el-col :span="6">
        <el-card shadow="hover" class="metric-card">
          <div class="card-header">
            <span class="card-title">装载率</span>
          </div>
          <div class="card-content">
            <el-progress
              :percentage="plan.loadRate"
              :color="getProgressColor(plan.loadRate)"
              :stroke-width="20"
            />
            <div class="metric-value">{{ plan.loadRate }}%</div>
          </div>
        </el-card>
      </el-col>

      <!-- 交期达成率卡片 -->
      <el-col :span="6">
        <el-card shadow="hover" class="metric-card">
          <div class="card-header">
            <span class="card-title">交期达成率</span>
          </div>
          <div class="card-content">
            <el-progress
              :percentage="plan.deliveryAchievementRate"
              :color="getProgressColor(plan.deliveryAchievementRate)"
              :stroke-width="20"
            />
            <div class="metric-value">{{ plan.deliveryAchievementRate }}%</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 基本信息详情 -->
    <el-card shadow="never" class="info-card">
      <div slot="header" class="card-header">
        <span class="card-title">基本信息</span>
      </div>

      <el-row :gutter="20">
        <el-col :span="8">
          <div class="info-item">
            <span class="info-label">方案编号：</span>
            <span class="info-value">
              {{ plan.planCode }}
              <el-button
                type="text"
                icon="el-icon-document-copy"
                size="mini"
                @click="copyToClipboard(plan.planCode)"
              />
            </span>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="info-item">
            <span class="info-label">方案名称：</span>
            <span class="info-value">{{ plan.planName || '-' }}</span>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="info-item">
            <span class="info-label">算法类型：</span>
            <span class="info-value">{{ plan.algorithmTypeLabel || algorithmTypeText }}</span>
          </div>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="8">
          <div class="info-item">
            <span class="info-label">排程开始时间：</span>
            <span class="info-value">{{ formatDate(plan.scheduleStartTime) }}</span>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="info-item">
            <span class="info-label">排程结束时间：</span>
            <span class="info-value">{{ formatDate(plan.scheduleEndTime) }}</span>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="info-item">
            <span class="info-label">算法执行耗时：</span>
            <span class="info-value">
              {{ plan.computationDurationSeconds }}秒
              <el-tag
                v-if="plan.computationDurationSeconds > 5"
                type="warning"
                size="mini"
                effect="plain"
              >
                耗时较长
              </el-tag>
            </span>
          </div>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="8">
          <div class="info-item">
            <span class="info-label">涉及任务数：</span>
            <span class="info-value">{{ plan.taskCount }}</span>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="info-item">
            <span class="info-label">冲突数量：</span>
            <span class="info-value">
              <el-tag
                v-if="plan.conflictCount > 0"
                type="danger"
                size="small"
              >
                {{ plan.conflictCount }}
              </el-tag>
              <span v-else>0</span>
            </span>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="info-item">
            <span class="info-label">综合评分：</span>
            <span class="info-value">{{ plan.overallScore }}</span>
          </div>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="8">
          <div class="info-item">
            <span class="info-label">创建时间：</span>
            <span class="info-value">{{ formatDate(plan.createdAt) }}</span>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="info-item">
            <span class="info-label">创建人：</span>
            <span class="info-value">
              {{ plan.creator ? `${plan.creator.name} (${plan.creator.role})` : '-' }}
            </span>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="info-item">
            <span class="info-label">更新时间：</span>
            <span class="info-value">{{ formatDate(plan.updatedAt) }}</span>
          </div>
        </el-col>
      </el-row>

      <el-row v-if="plan.publishedAt || plan.cancelledAt" :gutter="20">
        <el-col v-if="plan.publishedAt" :span="12">
          <div class="info-item">
            <span class="info-label">发布时间：</span>
            <span class="info-value">{{ formatDate(plan.publishedAt) }}</span>
          </div>
        </el-col>
        <el-col v-if="plan.cancelledAt" :span="12">
          <div class="info-item">
            <span class="info-label">取消时间：</span>
            <span class="info-value">{{ formatDate(plan.cancelledAt) }}</span>
          </div>
        </el-col>
      </el-row>

      <el-row v-if="plan.cancelReason" :gutter="20">
        <el-col :span="24">
          <div class="info-item">
            <span class="info-label">取消原因：</span>
            <span class="info-value">{{ plan.cancelReason }}</span>
          </div>
        </el-col>
      </el-row>

      <el-row v-if="plan.remarks" :gutter="20">
        <el-col :span="24">
          <div class="info-item">
            <span class="info-label">备注信息：</span>
            <span class="info-value">{{ plan.remarks }}</span>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 优化目标配置 -->
    <el-card shadow="never" class="info-card">
      <div slot="header" class="card-header">
        <span class="card-title">优化目标配置</span>
      </div>
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="config-item">
            <span class="config-label">交期达成权重：</span>
            <span class="config-value">{{ (plan.optimizationGoals.deliveryWeight * 100).toFixed(0) }}%</span>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="config-item">
            <span class="config-label">利用率权重：</span>
            <span class="config-value">{{ (plan.optimizationGoals.utilizationWeight * 100).toFixed(0) }}%</span>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="config-item">
            <span class="config-label">装载率权重：</span>
            <span class="config-value">{{ (plan.optimizationGoals.loadWeight * 100).toFixed(0) }}%</span>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="config-item">
            <span class="config-label">节能权重：</span>
            <span class="config-value">{{ ((plan.optimizationGoals.energySavingWeight || 0) * 100).toFixed(0) }}%</span>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 约束规则配置 -->
    <el-card shadow="never" class="info-card">
      <div slot="header" class="card-header">
        <span class="card-title">约束规则配置</span>
      </div>
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="config-item">
            <span class="config-label">最小容量：</span>
            <span class="config-value">{{ plan.constraintRules.minCapacity }}吨</span>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="config-item">
            <span class="config-label">最大容量：</span>
            <span class="config-value">{{ plan.constraintRules.maxCapacity }}吨</span>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="config-item">
            <span class="config-label">允许混炉：</span>
            <span class="config-value">
              <el-tag :type="plan.constraintRules.allowMixing ? 'success' : 'info'" size="small">
                {{ plan.constraintRules.allowMixing ? '是' : '否' }}
              </el-tag>
            </span>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script>
import { parseTime } from '@/utils'
import StatusTag from '@/components/StatusTag'
import { PLAN_STATUS_CONFIG, ALGORITHM_TYPE_MAP } from '../../constants'

export default {
  name: 'BasicInfoPanel',
  components: {
    StatusTag
  },
  props: {
    plan: {
      type: Object,
      required: true
    }
  },
  computed: {
    statusConfig() {
      return PLAN_STATUS_CONFIG
    },
    algorithmTypeText() {
      return ALGORITHM_TYPE_MAP[this.plan.algorithmType] || this.plan.algorithmType
    },
    formatStatusTime() {
      if (this.plan.statusUpdatedAt) {
        return this.formatDate(this.plan.statusUpdatedAt)
      }
      return '-'
    }
  },
  methods: {
    /**
     * 格式化日期
     */
    formatDate(date) {
      if (!date) return '-'
      return parseTime(date, '{y}-{m}-{d} {h}:{i}:{s}')
    },

    /**
     * 获取进度条颜色
     */
    getProgressColor(value) {
      if (value >= 90) return '#67C23A'
      if (value >= 70) return '#E6A23C'
      return '#F56C6C'
    },

    /**
     * 复制到剪贴板
     */
    async copyToClipboard(text) {
      try {
        await navigator.clipboard.writeText(text)
        this.$message.success('已复制到剪贴板')
      } catch (error) {
        // 兼容性处理
        const textarea = document.createElement('textarea')
        textarea.value = text
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        try {
          document.execCommand('copy')
          this.$message.success('已复制到剪贴板')
        } catch (err) {
          this.$message.error('复制失败')
        }
        document.body.removeChild(textarea)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.basic-info-panel {
  .metrics-row {
    margin-bottom: 20px;
  }

  .metric-card {
    .card-header {
      .card-title {
        font-size: 14px;
        font-weight: 500;
        color: #606266;
      }
    }

    .card-content {
      padding-top: 12px;
      text-align: center;

      .metric-value {
        margin-top: 12px;
        font-size: 24px;
        font-weight: 600;
        color: #303133;
      }

      .status-time {
        margin-top: 8px;
        font-size: 12px;
        color: #909399;
      }
    }

    &.status-card {
      .card-content {
        display: flex;
        flex-direction: column;
        align-items: center;
      }
    }
  }

  .info-card {
    margin-bottom: 20px;

    .card-header {
      .card-title {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }
    }

    .el-row {
      margin-bottom: 16px;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .info-item,
    .config-item {
      display: flex;
      align-items: center;
      min-height: 32px;

      .info-label,
      .config-label {
        color: #606266;
        font-weight: 500;
        white-space: nowrap;
      }

      .info-value,
      .config-value {
        flex: 1;
        color: #303133;
        margin-left: 8px;
      }
    }
  }

  ::v-deep .el-progress__text {
    display: none;
  }
}
</style>

