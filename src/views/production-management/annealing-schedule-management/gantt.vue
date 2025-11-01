<!--
  文件名称：gantt.vue
  文件描述：排程甘特图页面，展示排程方案的可视化甘特图
  创建日期：2025-10-23
  修改记录：
    - 2025-10-23: 初始创建
    - 2025-10-28: 重构以适配后端接口更新，优先使用后端返回的 label 字段
-->

<template>
  <div class="gantt-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <el-button
          icon="el-icon-arrow-left"
          size="small"
          @click="handleGoBack"
        >
          返回
        </el-button>
        <div class="header-title">
          <h2>排程甘特图</h2>
          <div v-if="planInfo" class="plan-info">
            <span class="plan-number">{{ planInfo.planCode }}</span>
            <span class="separator">|</span>
            <span class="plan-name">{{ planInfo.planName || '未命名方案' }}</span>
            <el-tag
              :type="getStatusTagType(planInfo.planStatus || planInfo.status)"
              size="small"
              style="margin-left: 8px"
            >
              {{ planInfo.planStatusLabel || planInfo.statusLabel || getStatusText(planInfo.planStatus || planInfo.status) }}
            </el-tag>
          </div>
        </div>
      </div>

      <div class="header-right">
        <!-- 关键指标展示 -->
        <div v-if="planInfo" class="metrics">
          <div class="metric-item">
            <span class="metric-label">利用率</span>
            <span class="metric-value" :class="getMetricClass(planInfo.utilizationRate)">
              {{ formatPercentage(planInfo.utilizationRate) }}
            </span>
          </div>
          <div class="metric-item">
            <span class="metric-label">装载率</span>
            <span class="metric-value" :class="getMetricClass(planInfo.loadRate)">
              {{ formatPercentage(planInfo.loadRate) }}
            </span>
          </div>
          <div class="metric-item">
            <span class="metric-label">交期达成率</span>
            <span class="metric-value" :class="getMetricClass(planInfo.deliveryAchievementRate)">
              {{ formatPercentage(planInfo.deliveryAchievementRate) }}
            </span>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="actions">
          <el-button
            v-if="canPublish"
            type="primary"
            icon="el-icon-check"
            size="small"
            @click="handlePublish"
          >
            发布方案
          </el-button>
          <el-button
            v-if="canCancel"
            type="danger"
            icon="el-icon-close"
            size="small"
            plain
            @click="handleCancel"
          >
            取消方案
          </el-button>
          <el-button
            icon="el-icon-document"
            size="small"
            @click="handleViewDetail"
          >
            查看详情
          </el-button>
        </div>
      </div>
    </div>

    <!-- 甘特图组件 -->
    <div class="gantt-content">
      <schedule-gantt-chart
        v-if="planId"
        :plan-id="planId"
      />
    </div>
  </div>
</template>

<script>
import ScheduleGanttChart from './components/ScheduleGanttChart.vue'
import { fetchSchedulePlanDetail, cancelSchedulePlan } from './api'
import { STATUS_CONFIG } from './constants/schedule-management'

export default {
  name: 'ScheduleGanttPage',

  components: {
    ScheduleGanttChart
  },

  data() {
    return {
      planId: null,
      planInfo: null
    }
  },

  computed: {
    // 是否可以发布
    canPublish() {
      const status = this.planInfo?.planStatus || this.planInfo?.status
      return this.planInfo && status === 'generated'
    },

    // 是否可以取消
    canCancel() {
      const status = this.planInfo?.planStatus || this.planInfo?.status
      return this.planInfo && ['draft', 'generated'].includes(status)
    }
  },

  created() {
    this.planId = this.$route.params.id || this.$route.query.id
    if (!this.planId) {
      this.$message.error('缺少排程方案ID参数')
      this.handleGoBack()
      return
    }
    this.loadPlanInfo()
  },

  methods: {
    // 加载方案基本信息
    async loadPlanInfo() {
      try {
        const response = await fetchSchedulePlanDetail(this.planId)
        // 注意：2025-10-27接口更新，响应结构已扁平化
        // 所有方案字段直接在 data 下，不再嵌套在 data.plan 中
        this.planInfo = response.data
      } catch (error) {
        console.error('加载排程方案信息失败:', error)
        const message = error.response?.data?.error?.message || '加载排程方案信息失败'
        this.$message.error(message)
      }
    },

    // 返回列表
    handleGoBack() {
      this.$router.push({
        name: 'AnnealingScheduleManagement'
      })
    },

    // 查看详情
    handleViewDetail() {
      this.$router.push({
        name: 'SchedulePlanDetail',
        params: { id: this.planId }
      })
    },

    // 发布方案
    handlePublish() {
      this.$router.push({
        name: 'SchedulePlanDetail',
        params: { id: this.planId },
        query: { action: 'publish' }
      })
    },

    // 取消方案
    async handleCancel() {
      try {
        await this.$confirm(
          '取消后方案将无法恢复，请谨慎操作。是否确认取消？',
          '确认取消',
          {
            confirmButtonText: '确认取消',
            cancelButtonText: '取消操作',
            type: 'warning'
          }
        )

        const { value } = await this.$prompt('请输入取消原因', '取消原因', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputValidator: (value) => {
            if (!value || !value.trim()) {
              return '取消原因不能为空'
            }
            if (value.length > 500) {
              return '取消原因不能超过500字符'
            }
            return true
          }
        })

        const response = await cancelSchedulePlan(this.planId, {
          reason: value
        })

        this.$message.success(response.message || '取消排程方案成功')
        this.loadPlanInfo()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('取消排程方案失败:', error)
          this.$message.error(error.message || '取消排程方案失败')
        }
      }
    },

    /**
     * 获取状态文本（备用方案）
     * ✅ 优先使用后端返回的 planStatusLabel 字段
     * 此方法仅在后端未返回 label 时作为备用
     */
    getStatusText(status) {
      return STATUS_CONFIG.textMap[status] || status
    },

    /**
     * 获取状态标签类型
     * 用于 el-tag 的 type 属性，控制颜色
     */
    getStatusTagType(status) {
      return STATUS_CONFIG.typeMap[status] || ''
    },

    // 格式化百分比
    formatPercentage(value) {
      if (value === null || value === undefined) {
        return '-'
      }
      return `${(value * 100).toFixed(1)}%`
    },

    // 获取指标颜色类
    getMetricClass(value) {
      if (value === null || value === undefined) {
        return ''
      }
      if (value >= 0.9) {
        return 'metric-excellent'
      }
      if (value >= 0.7) {
        return 'metric-good'
      }
      return 'metric-poor'
    }
  }
}
</script>

<style lang="scss" scoped>
.gantt-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 84px);
  background: #f5f7fa;

  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
    background: #fff;
    border-bottom: 1px solid #e4e7ed;

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;

      .header-title {
        h2 {
          margin: 0 0 4px 0;
          font-size: 18px;
          font-weight: 600;
          color: #303133;
        }

        .plan-info {
          display: flex;
          align-items: center;
          font-size: 14px;
          color: #606266;

          .plan-number {
            font-weight: 500;
          }

          .separator {
            margin: 0 8px;
            color: #dcdfe6;
          }

          .plan-name {
            color: #909399;
          }
        }
      }
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 24px;

      .metrics {
        display: flex;
        gap: 24px;

        .metric-item {
          display: flex;
          flex-direction: column;
          align-items: center;

          .metric-label {
            font-size: 12px;
            color: #909399;
            margin-bottom: 4px;
          }

          .metric-value {
            font-size: 18px;
            font-weight: 600;

            &.metric-excellent {
              color: #67c23a;
            }

            &.metric-good {
              color: #e6a23c;
            }

            &.metric-poor {
              color: #f56c6c;
            }
          }
        }
      }

      .actions {
        display: flex;
        gap: 8px;
      }
    }
  }

  .gantt-content {
    flex: 1;
    padding: 16px;
    overflow: hidden;
  }
}
</style>

