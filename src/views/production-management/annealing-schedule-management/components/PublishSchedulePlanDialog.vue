<!--
  文件名称：PublishSchedulePlanDialog.vue
  文件描述：发布排程方案对话框组件，支持冲突检测、强制发布等功能
  创建日期：2025-10-23
  修改记录：
    - 2025-10-23: 初始创建
-->

<template>
  <el-dialog
    :visible="visible"
    :title="dialogTitle"
    width="800px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="handleClose"
  >
    <!-- 加载状态 -->
    <div v-if="loading" v-loading="loading" style="min-height: 200px; display: flex; align-items: center; justify-content: center;">
      <span>{{ loadingText }}</span>
    </div>

    <!-- 冲突预警步骤 -->
    <div v-else-if="currentStep === 'conflict-warning' && hasConflicts" class="conflict-warning">
      <el-alert
        :title="conflictAlertTitle"
        :type="conflictAlertType"
        :description="conflictAlertDescription"
        show-icon
        :closable="false"
        style="margin-bottom: 20px;"
      />

      <!-- 冲突统计 -->
      <div class="conflict-stats">
        <div class="stat-item">
          <span class="stat-label">总冲突数：</span>
          <span class="stat-value">{{ conflictStats.total }}</span>
        </div>
        <div class="stat-item stat-critical">
          <span class="stat-label">致命冲突：</span>
          <span class="stat-value">{{ conflictStats.critical }}</span>
        </div>
        <div class="stat-item stat-high">
          <span class="stat-label">高级冲突：</span>
          <span class="stat-value">{{ conflictStats.high }}</span>
        </div>
        <div class="stat-item stat-medium">
          <span class="stat-label">中级冲突：</span>
          <span class="stat-value">{{ conflictStats.medium }}</span>
        </div>
        <div class="stat-item stat-low">
          <span class="stat-label">低级冲突：</span>
          <span class="stat-value">{{ conflictStats.low }}</span>
        </div>
      </div>

      <!-- 冲突列表 -->
      <div class="conflict-list">
        <div class="conflict-list-header">
          <span>冲突详情</span>
        </div>
        <el-table
          :data="conflicts"
          style="width: 100%"
          max-height="300"
          stripe
        >
          <el-table-column
            prop="conflictType"
            label="冲突类型"
            width="120"
          >
            <template slot-scope="{ row }">
              <el-tag :type="getConflictTypeTagType(row.conflictType)" size="small">
                {{ formatConflictType(row.conflictType) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="severityLevel"
            label="严重程度"
            width="100"
          >
            <template slot-scope="{ row }">
              <el-tag :type="getSeverityTagType(row.severityLevel)" size="small">
                {{ formatSeverity(row.severityLevel) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="description"
            label="冲突描述"
            min-width="200"
            show-overflow-tooltip
          />
          <el-table-column
            prop="suggestion"
            label="解决建议"
            min-width="180"
            show-overflow-tooltip
          />
        </el-table>
      </div>
    </div>

    <!-- 发布确认步骤 -->
    <div v-else-if="currentStep === 'confirm'" class="publish-confirm">
      <el-alert
        v-if="hasNonCriticalConflicts"
        title="存在非致命冲突"
        type="warning"
        description="存在非致命冲突，建议处理后再发布。如需强制发布，请勾选下方选项。"
        show-icon
        :closable="false"
        style="margin-bottom: 20px;"
      />

      <!-- 方案关键信息 -->
      <div class="plan-info">
        <div class="info-row">
          <span class="label">方案编号：</span>
          <span class="value">{{ planData.planCode }}</span>
        </div>
        <div class="info-row">
          <span class="label">方案名称：</span>
          <span class="value">{{ planData.planName || '-' }}</span>
        </div>
        <div class="info-row">
          <span class="label">排程时间范围：</span>
          <span class="value">{{ formatTimeRange(planData.scheduleStartTime, planData.scheduleEndTime) }}</span>
        </div>
        <div class="info-row">
          <span class="label">排程结果数量：</span>
          <span class="value">{{ planData.taskCount || 0 }} 个任务</span>
        </div>
        <div class="info-row">
          <span class="label">利用率：</span>
          <span class="value" :class="getRateClass(planData.utilizationRate)">
            {{ formatPercentage(planData.utilizationRate) }}
          </span>
        </div>
        <div class="info-row">
          <span class="label">装载率：</span>
          <span class="value" :class="getRateClass(planData.loadRate)">
            {{ formatPercentage(planData.loadRate) }}
          </span>
        </div>
        <div class="info-row">
          <span class="label">交期达成率：</span>
          <span class="value" :class="getRateClass(planData.deliveryAchievementRate)">
            {{ formatPercentage(planData.deliveryAchievementRate) }}
          </span>
        </div>
      </div>

      <!-- 发布参数配置 -->
      <el-form ref="publishForm" :model="publishForm" label-width="100px" style="margin-top: 20px;">
        <el-form-item v-if="hasNonCriticalConflicts" label="强制发布">
          <el-checkbox v-model="publishForm.forcePublish">
            忽略非致命冲突，强制发布（请谨慎使用）
          </el-checkbox>
        </el-form-item>
        <el-form-item label="发布备注">
          <el-input
            v-model="publishForm.remarks"
            type="textarea"
            :rows="3"
            placeholder="请输入发布备注说明（选填）"
            maxlength="1000"
            show-word-limit
          />
        </el-form-item>
      </el-form>
    </div>

    <!-- 底部按钮 -->
    <div slot="footer" class="dialog-footer">
      <!-- 冲突预警步骤按钮 -->
      <template v-if="currentStep === 'conflict-warning'">
        <el-button @click="handleClose">取消</el-button>
        <el-button @click="handleBackToAdjust">返回调整</el-button>
        <el-button
          v-if="!hasCriticalConflicts"
          type="warning"
          :loading="publishing"
          @click="handleGoToConfirm"
        >
          继续发布
        </el-button>
      </template>

      <!-- 发布确认步骤按钮 -->
      <template v-if="currentStep === 'confirm'">
        <el-button @click="handleClose">取消</el-button>
        <el-button
          type="primary"
          :loading="publishing"
          @click="handlePublish"
        >
          {{ hasNonCriticalConflicts && publishForm.forcePublish ? '强制发布' : '确认发布' }}
        </el-button>
      </template>
    </div>
  </el-dialog>
</template>

<script>
import { fetchScheduleConflicts, publishSchedulePlan } from '../api'
import { CONFLICT_TYPE_MAP, SEVERITY_LEVEL_MAP } from '../constants'
import { parseTime } from '@/utils'

export default {
  name: 'PublishSchedulePlanDialog',
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    planData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      loading: false,
      loadingText: '正在检查排程冲突...',
      publishing: false,
      currentStep: 'conflict-warning', // conflict-warning | confirm
      conflicts: [],
      publishForm: {
        forcePublish: false,
        remarks: ''
      }
    }
  },
  computed: {
    dialogTitle() {
      if (this.currentStep === 'conflict-warning') {
        return '发布前冲突检测'
      }
      return '确认发布排程方案'
    },
    hasConflicts() {
      return this.conflicts.length > 0
    },
    hasCriticalConflicts() {
      return this.conflicts.some(c => c.severityLevel === 'critical')
    },
    hasNonCriticalConflicts() {
      return this.hasConflicts && !this.hasCriticalConflicts
    },
    conflictStats() {
      const stats = {
        total: this.conflicts.length,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0
      }
      this.conflicts.forEach(conflict => {
        const level = conflict.severityLevel
        if (stats[level] !== undefined) {
          stats[level]++
        }
      })
      return stats
    },
    conflictAlertTitle() {
      if (this.hasCriticalConflicts) {
        return '检测到致命冲突，无法发布'
      }
      return '检测到非致命冲突'
    },
    conflictAlertType() {
      if (this.hasCriticalConflicts) {
        return 'error'
      }
      return 'warning'
    },
    conflictAlertDescription() {
      if (this.hasCriticalConflicts) {
        return '存在致命冲突，必须处理后才能发布。请返回调整排程结果，或取消当前发布操作。'
      }
      return '存在非致命冲突，建议处理后再发布。如需强制发布，请在确认页面勾选强制发布选项。'
    }
  },
  watch: {
    visible: {
      handler(val) {
        if (val) {
          this.initDialog()
        }
      },
      immediate: true
    }
  },
  methods: {
    /**
     * 初始化对话框
     */
    async initDialog() {
      if (!this.visible || !this.planData.id) {
        return
      }

      this.currentStep = 'conflict-warning'
      this.conflicts = []
      this.publishForm = {
        forcePublish: false,
        remarks: ''
      }

      // 检查冲突
      await this.checkConflicts()
    },

    /**
     * 检查排程冲突
     */
    async checkConflicts() {
      this.loading = true
      this.loadingText = '正在检查排程冲突...'
      try {
        const response = await fetchScheduleConflicts(this.planData.id)

        if (response.success && response.data) {
          this.conflicts = response.data.results || []

          // 如果没有冲突，直接跳转到确认步骤
          if (this.conflicts.length === 0) {
            this.currentStep = 'confirm'
          }
        } else {
          this.$message.error(response.message || '获取冲突列表失败')
          this.handleClose()
        }
      } catch (error) {
        console.error('检查冲突失败:', error)
        this.$message.error(this.getErrorMessage(error))
        this.handleClose()
      } finally {
        this.loading = false
      }
    },

    /**
     * 前往确认步骤
     */
    handleGoToConfirm() {
      this.currentStep = 'confirm'
    },

    /**
     * 返回调整
     */
    handleBackToAdjust() {
      this.$message.info('请调整排程结果解决冲突后再发布')
      this.handleClose()
    },

    /**
     * 执行发布
     */
    async handlePublish() {
      // 如果存在致命冲突，不允许发布
      if (this.hasCriticalConflicts) {
        this.$message.error('存在致命冲突，无法发布')
        return
      }

      // 如果存在非致命冲突但未勾选强制发布，提示用户
      if (this.hasNonCriticalConflicts && !this.publishForm.forcePublish) {
        try {
          await this.$confirm('存在非致命冲突，是否继续发布？', '提示', {
            confirmButtonText: '继续发布',
            cancelButtonText: '返回',
            type: 'warning'
          })
        } catch {
          return
        }
      }

      this.publishing = true
      try {
        const response = await publishSchedulePlan(this.planData.id, {
          forcePublish: this.publishForm.forcePublish,
          remarks: this.publishForm.remarks
        })

        if (response.success && response.data) {
          // 显示成功消息，包含影响的任务数量和发布时间
          const affectedCount = response.data.affectedTasksCount || 0
          const publishedAt = response.data.publishedAt ? this.formatDateTime(response.data.publishedAt) : ''
          const successMessage = `${response.message || '发布排程方案成功'}，已同步更新 ${affectedCount} 个退火任务${publishedAt ? '，发布时间：' + publishedAt : ''}`

          this.$message.success(successMessage)
          this.$emit('success', response.data)
          this.handleClose()
        } else {
          // 根据错误码显示不同的错误消息
          const errorMessage = this.getErrorCodeMessage(response.error?.code) || response.message || '发布排程方案失败'
          this.$message.error(errorMessage)
        }
      } catch (error) {
        console.error('发布排程方案失败:', error)
        const errorMessage = this.getErrorMessage(error)
        this.$message.error(errorMessage)
      } finally {
        this.publishing = false
      }
    },

    /**
     * 关闭对话框
     */
    handleClose() {
      this.$emit('update:visible', false)
      this.$emit('close')
    },

    /**
     * 格式化冲突类型
     */
    formatConflictType(type) {
      return CONFLICT_TYPE_MAP[type]?.text || type
    },

    /**
     * 获取冲突类型标签类型
     */
    getConflictTypeTagType(type) {
      const typeMap = {
        'time-conflict': 'danger',
        'capacity-exceeded': 'warning',
        'process-incompatible': 'warning',
        'material-not-ready': 'info',
        'maintenance-conflict': 'warning'
      }
      return typeMap[type] || 'info'
    },

    /**
     * 格式化严重程度
     */
    formatSeverity(level) {
      return SEVERITY_LEVEL_MAP[level]?.text || level
    },

    /**
     * 获取严重程度标签类型
     */
    getSeverityTagType(level) {
      const typeMap = {
        'critical': 'danger',
        'high': 'warning',
        'medium': 'warning',
        'low': 'info'
      }
      return typeMap[level] || 'info'
    },

    /**
     * 格式化时间范围
     */
    formatTimeRange(start, end) {
      if (!start || !end) return '-'
      return `${parseTime(start, '{y}-{m}-{d} {h}:{i}')} ~ ${parseTime(end, '{y}-{m}-{d} {h}:{i}')}`
    },

    /**
     * 格式化日期时间
     */
    formatDateTime(dateTime) {
      if (!dateTime) return '-'
      return parseTime(dateTime, '{y}-{m}-{d} {h}:{i}:{s}')
    },

    /**
     * 格式化百分比
     */
    formatPercentage(value) {
      if (value === null || value === undefined) return '-'
      return `${(value * 100).toFixed(1)}%`
    },

    /**
     * 获取指标等级类名
     */
    getRateClass(value) {
      if (value === null || value === undefined) return ''
      if (value >= 0.9) return 'rate-high'
      if (value >= 0.7) return 'rate-medium'
      return 'rate-low'
    },

    /**
     * 获取错误消息
     */
    getErrorMessage(error) {
      if (error.response) {
        const { status, data } = error.response
        if (status === 401) {
          return '请先登录'
        } else if (status === 403) {
          return '权限不足，请联系管理员'
        } else if (data && data.error) {
          return this.getErrorCodeMessage(data.error.code) || data.error.message || '操作失败'
        }
      }
      return error.message || '操作失败'
    },

    /**
     * 根据错误码获取错误消息
     */
    getErrorCodeMessage(code) {
      const errorMap = {
        'SPM_001': '排程方案不存在或已删除',
        'SPM_006': '排程方案状态无效，不允许发布',
        'SPM_008': '发布排程方案失败，请稍后重试',
        'SPM_010': '检测到致命冲突，无法发布'
      }
      return errorMap[code] || ''
    }
  }
}
</script>

<style lang="scss" scoped>
.conflict-warning {
  .conflict-stats {
    display: flex;
    justify-content: space-around;
    padding: 16px;
    background-color: #f5f7fa;
    border-radius: 4px;
    margin-bottom: 20px;

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;

      .stat-label {
        font-size: 12px;
        color: #909399;
      }

      .stat-value {
        font-size: 24px;
        font-weight: bold;
        color: #606266;
      }

      &.stat-critical .stat-value {
        color: #f56c6c;
      }

      &.stat-high .stat-value {
        color: #e6a23c;
      }

      &.stat-medium .stat-value {
        color: #e6a23c;
      }

      &.stat-low .stat-value {
        color: #909399;
      }
    }
  }

  .conflict-list {
    .conflict-list-header {
      padding: 10px 0;
      font-weight: bold;
      color: #303133;
    }
  }
}

.publish-confirm {
  .plan-info {
    background-color: #f5f7fa;
    padding: 16px;
    border-radius: 4px;

    .info-row {
      display: flex;
      margin-bottom: 12px;
      line-height: 1.6;

      &:last-child {
        margin-bottom: 0;
      }

      .label {
        width: 120px;
        color: #606266;
        font-weight: 500;
      }

      .value {
        flex: 1;
        color: #303133;

        &.rate-high {
          color: #67c23a;
          font-weight: bold;
        }

        &.rate-medium {
          color: #e6a23c;
          font-weight: bold;
        }

        &.rate-low {
          color: #f56c6c;
          font-weight: bold;
        }
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>

