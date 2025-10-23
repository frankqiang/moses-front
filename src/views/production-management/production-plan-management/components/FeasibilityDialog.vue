/**
 * 文件名称：FeasibilityDialog.vue
 * 文件描述：生产计划可行性评估对话框组件
 * 创建日期：2025-01-21
 * 修改记录：
 *   - 2025-01-21: 初始创建，实现P0阶段核心功能
 *   - 2025-01-XX: 重构以适配新接口，支持排程表和风险提示
 */

<template>
  <el-dialog
    :visible.sync="visible"
    :title="dialogTitle"
    width="1000px"
    :close-on-click-modal="false"
    top="5vh"
    @close="handleClose"
  >
    <div v-loading="loading" class="feasibility-dialog">
      <!-- 计划基本信息 -->
      <el-card class="info-card" shadow="hover">
        <div slot="header" class="card-header">
          <span><i class="el-icon-document" /> 计划基本信息</span>
        </div>
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="计划编号">
            {{ result ? result.planNumber : (planData.planNumber || '-') }}
          </el-descriptions-item>
          <el-descriptions-item label="产品编码">
            {{ result ? result.productCode : (planData.productCode || '-') }}
          </el-descriptions-item>
          <el-descriptions-item label="需求数量">
            <template v-if="result">
              {{ result.demandQuantity }} {{ result.demandUnit || 'TON' }}
            </template>
            <template v-else>
              {{ planData.demandQuantity }} {{ planData.demandUnit }}
            </template>
          </el-descriptions-item>
          <el-descriptions-item label="计划交期">
            <template v-if="result">
              {{ formatDate(result.plannedDeliveryDate) }}
            </template>
            <template v-else>
              {{ formatDate(planData.plannedDeliveryDate) }}
            </template>
          </el-descriptions-item>
          <el-descriptions-item v-if="result" label="总计划重量">
            {{ result.totalPlannedWeight }} 吨
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 评估参数配置 -->
      <el-card class="params-card" shadow="hover">
        <div slot="header" class="card-header">
          <span><i class="el-icon-setting" /> 评估参数配置</span>
        </div>
        <el-form
          ref="paramsForm"
          :model="params"
          :rules="paramsRules"
          label-width="120px"
          size="small"
        >
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="设备负荷率" prop="loadRate">
                <el-input-number
                  v-model="params.loadRate"
                  :min="0.1"
                  :max="1.5"
                  :step="0.1"
                  :precision="1"
                  style="width: 100%"
                />
                <div class="param-hint">范围：0.1-1.5，默认1.0</div>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="炉次容量" prop="furnaceCapacity">
                <el-input-number
                  v-model="params.furnaceCapacity"
                  :min="1"
                  :precision="1"
                  style="width: 100%"
                />
                <div class="param-hint">单位：吨，默认40吨</div>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="班次时长" prop="shiftDurationHours">
                <el-input-number
                  v-model="params.shiftDurationHours"
                  :min="1"
                  :max="24"
                  :precision="1"
                  style="width: 100%"
                />
                <div class="param-hint">单位：小时，默认8小时</div>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-card>

      <!-- 评估结果 -->
      <div v-if="hasResult" class="result-section">
        <!-- 总体评估 -->
        <el-card class="result-card" shadow="hover">
          <div slot="header" class="card-header">
            <span><i class="el-icon-pie-chart" /> 总体评估</span>
          </div>
          <div class="overall-assessment">
            <div class="feasibility-indicator">
              <i
                :class="[
                  'indicator-icon',
                  computedFeasibility.isFeasible ? 'el-icon-success' : 'el-icon-warning'
                ]"
                :style="{ color: computedFeasibility.isFeasible ? '#67C23A' : '#F56C6C' }"
              />
              <div class="indicator-text">
                <div class="text-main">
                  {{ computedFeasibility.isFeasible ? '可行' : '不可行' }}
                </div>
                <div class="text-sub">
                  {{ computedFeasibility.isFeasible ? '计划可按时完成' : '存在风险' }}
                </div>
              </div>
            </div>
            <div class="utilization-rate">
              <div class="rate-label">平均容量利用率</div>
              <el-progress
                :percentage="Math.round(computedFeasibility.avgUtilization)"
                :color="getUtilizationColor(computedFeasibility.avgUtilization / 100)"
                :stroke-width="20"
              />
            </div>
          </div>
        </el-card>

        <!-- 资源需求 -->
        <el-card class="result-card" shadow="hover">
          <div slot="header" class="card-header">
            <span><i class="el-icon-box" /> 资源需求</span>
          </div>
          <el-row :gutter="20" class="resource-stats">
            <el-col :span="8">
              <div class="stat-item">
                <div class="stat-value">{{ result.estimatedFurnaceCount }}</div>
                <div class="stat-label">所需炉次数</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="stat-item">
                <div class="stat-value">{{ result.estimatedTotalHours }}</div>
                <div class="stat-label">预计总工时（小时）</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="stat-item">
                <div class="stat-value">{{ computedFeasibility.estimatedTotalDays }}</div>
                <div class="stat-label">预计总天数</div>
              </div>
            </el-col>
          </el-row>
          <el-row :gutter="20" class="resource-stats" style="margin-top: 16px">
            <el-col :span="12">
              <div class="stat-item">
                <div class="stat-value">{{ result.estimatedCycleTimeHours }}</div>
                <div class="stat-label">单炉工艺周期时间（小时）</div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="stat-item">
                <div class="stat-value">{{ computedFeasibility.capacityPerBatch }}</div>
                <div class="stat-label">单炉实际容量（吨）</div>
              </div>
            </el-col>
          </el-row>
        </el-card>

        <!-- 时间预测 -->
        <el-card class="result-card" shadow="hover">
          <div slot="header" class="card-header">
            <span><i class="el-icon-time" /> 时间预测</span>
          </div>
          <el-descriptions :column="1" border size="small">
            <el-descriptions-item label="预计完成时间">
              {{ formatDateTime(computedFeasibility.estimatedCompletionDate) }}
            </el-descriptions-item>
            <el-descriptions-item label="计划交期">
              {{ formatDateTime(result.plannedDeliveryDate) }}
            </el-descriptions-item>
            <el-descriptions-item label="剩余缓冲天数">
              <el-tag
                :type="getBufferDaysType(computedFeasibility.remainingBufferDays)"
                size="medium"
              >
                {{ computedFeasibility.remainingBufferDays }} 天
                ({{ getBufferDaysText(computedFeasibility.remainingBufferDays) }})
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 排程表 -->
        <el-card
          v-if="result.schedule && result.schedule.length > 0"
          class="result-card"
          shadow="hover"
        >
          <div slot="header" class="card-header">
            <span><i class="el-icon-s-data" /> 详细排程计划</span>
          </div>
          <el-table
            :data="result.schedule"
            border
            size="small"
            max-height="400"
            style="width: 100%"
          >
            <el-table-column
              prop="batchIndex"
              label="炉次序号"
              width="100"
              align="center"
            />
            <el-table-column
              label="预计开始时间"
              width="180"
            >
              <template slot-scope="scope">
                {{ formatDateTime(scope.row.expectedStartAt) }}
              </template>
            </el-table-column>
            <el-table-column
              label="预计结束时间"
              width="180"
            >
              <template slot-scope="scope">
                {{ formatDateTime(scope.row.expectedEndAt) }}
              </template>
            </el-table-column>
            <el-table-column
              prop="plannedWeight"
              label="计划重量（吨）"
              width="130"
              align="right"
            >
              <template slot-scope="scope">
                {{ scope.row.plannedWeight }}
              </template>
            </el-table-column>
            <el-table-column
              label="容量利用率"
              align="center"
            >
              <template slot-scope="scope">
                <el-progress
                  :percentage="Math.round(scope.row.capacityUtilizationPercentage)"
                  :color="getScheduleUtilizationColor(scope.row.capacityUtilizationPercentage)"
                  :stroke-width="16"
                  :text-inside="true"
                />
              </template>
            </el-table-column>
          </el-table>
        </el-card>

        <!-- 风险提示 -->
        <el-card
          v-if="result.warnings && result.warnings.length > 0"
          class="result-card"
          shadow="hover"
        >
          <div slot="header" class="card-header">
            <span><i class="el-icon-warning" /> 风险提示</span>
          </div>
          <el-alert
            v-for="(warning, index) in result.warnings"
            :key="index"
            :title="warning.message"
            :type="getWarningType(warning.type)"
            show-icon
            :closable="false"
            style="margin-bottom: 10px"
          >
            <template v-if="warning.type === 'delivery-delay'">
              <div class="warning-details">
                <div>预计完成时间：{{ formatDateTime(warning.expectedCompletion) }}</div>
                <div>计划交期：{{ formatDateTime(warning.plannedDeliveryDate) }}</div>
              </div>
            </template>
            <template v-else-if="warning.type === 'capacity-insufficient'">
              <div class="warning-details">
                <div>计划总重量：{{ warning.totalWeight }} 吨</div>
                <div>单炉容量：{{ warning.capacityPerBatch }} 吨</div>
                <div>炉次数：{{ warning.batchCount }}</div>
                <div>预估总容量：{{ warning.estimatedCapacity }} 吨</div>
              </div>
            </template>
          </el-alert>
        </el-card>

        <!-- 优化建议 -->
        <el-card
          v-if="computedRecommendations.length > 0"
          class="result-card"
          shadow="hover"
        >
          <div slot="header" class="card-header">
            <span><i class="el-icon-s-opportunity" /> 优化建议</span>
          </div>
          <ul class="recommendations-list">
            <li
              v-for="(recommendation, index) in computedRecommendations"
              :key="index"
            >
              <i class="el-icon-check" />
              {{ recommendation }}
            </li>
          </ul>
        </el-card>

        <!-- 容量约束信息 -->
        <el-card class="result-card capacity-card" shadow="hover">
          <div slot="header" class="card-header">
            <span><i class="el-icon-data-line" /> 评估参数配置</span>
          </div>
          <el-descriptions :column="3" border size="small">
            <el-descriptions-item label="炉次容量">
              {{ result.furnaceCapacityTon }} 吨
            </el-descriptions-item>
            <el-descriptions-item label="设备负荷率">
              {{ result.loadRate }}
            </el-descriptions-item>
            <el-descriptions-item label="班次时长">
              {{ params.shiftDurationHours }} 小时
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </div>

      <!-- 空状态 -->
      <el-empty
        v-if="!hasResult && !loading"
        description="请配置评估参数后点击【开始评估】按钮"
        :image-size="120"
      />
    </div>

    <div slot="footer" class="dialog-footer">
      <el-button
        type="primary"
        icon="el-icon-data-analysis"
        :loading="evaluating"
        @click="handleEvaluate"
      >
        开始评估
      </el-button>
      <el-button
        v-if="hasResult"
        icon="el-icon-refresh"
        @click="handleReEvaluate"
      >
        重新评估
      </el-button>
      <el-button @click="handleClose">关闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { parseTime } from '@/utils'
import { fetchFeasibility } from '../api'
import { getErrorMessage } from '../constants'

export default {
  name: 'FeasibilityDialog',
  data() {
    return {
      visible: false,
      loading: false,
      evaluating: false,
      planData: {},
      // 评估参数
      params: {
        loadRate: 1.0,
        furnaceCapacity: 40.0,
        shiftDurationHours: 8.0
      },
      // 参数校验规则
      paramsRules: {
        loadRate: [
          { required: true, message: '请输入设备负荷率', trigger: 'blur' },
          { type: 'number', min: 0.1, max: 1.5, message: '设备负荷率范围为0.1-1.5', trigger: 'blur' }
        ],
        furnaceCapacity: [
          { required: true, message: '请输入炉次容量', trigger: 'blur' },
          { type: 'number', min: 1, message: '炉次容量必须大于0', trigger: 'blur' }
        ],
        shiftDurationHours: [
          { required: true, message: '请输入班次时长', trigger: 'blur' },
          { type: 'number', min: 1, max: 24, message: '班次时长范围为1-24小时', trigger: 'blur' }
        ]
      },
      // 评估结果
      result: null
    }
  },
  computed: {
    dialogTitle() {
      return `可行性评估 - ${this.planData.planNumber || ''}`
    },
    hasResult() {
      return this.result !== null
    },
    /**
     * 计算可行性相关数据
     * 由于新接口不直接返回这些字段，需要前端计算
     */
    computedFeasibility() {
      if (!this.result) {
        return {
          isFeasible: true,
          avgUtilization: 0,
          estimatedTotalDays: 0,
          estimatedCompletionDate: null,
          remainingBufferDays: 0,
          capacityPerBatch: 0
        }
      }

      // 计算单炉实际容量
      const capacityPerBatch = this.result.furnaceCapacityTon * this.result.loadRate

      // 计算预计总天数
      const estimatedTotalDays = Math.ceil(this.result.estimatedTotalHours / 24)

      // 计算平均容量利用率（基于排程表）
      let avgUtilization = 100
      if (this.result.schedule && this.result.schedule.length > 0) {
        const totalUtilization = this.result.schedule.reduce((sum, item) => {
          return sum + item.capacityUtilizationPercentage
        }, 0)
        avgUtilization = totalUtilization / this.result.schedule.length
      }

      // 计算预计完成时间（取排程表最后一炉的结束时间，或基于总工时计算）
      let estimatedCompletionDate = null
      if (this.result.schedule && this.result.schedule.length > 0) {
        const lastSchedule = this.result.schedule[this.result.schedule.length - 1]
        estimatedCompletionDate = lastSchedule.expectedEndAt
      } else {
        // 如果没有排程表，基于总工时估算
        const now = new Date()
        const completionTime = now.getTime() + (this.result.estimatedTotalHours * 60 * 60 * 1000)
        estimatedCompletionDate = new Date(completionTime).toISOString()
      }

      // 计算剩余缓冲天数
      let remainingBufferDays = 0
      if (this.result.plannedDeliveryDate && estimatedCompletionDate) {
        const deliveryDate = new Date(this.result.plannedDeliveryDate)
        const completionDate = new Date(estimatedCompletionDate)
        const diffTime = deliveryDate.getTime() - completionDate.getTime()
        remainingBufferDays = Math.floor(diffTime / (24 * 60 * 60 * 1000))
      }

      // 判断是否可行（无风险提示且剩余缓冲天数>=0）
      const hasWarnings = this.result.warnings && this.result.warnings.length > 0
      const isFeasible = !hasWarnings && remainingBufferDays >= 0

      return {
        isFeasible,
        avgUtilization: Math.round(avgUtilization * 100) / 100,
        estimatedTotalDays,
        estimatedCompletionDate,
        remainingBufferDays,
        capacityPerBatch: Math.round(capacityPerBatch * 1000) / 1000
      }
    },
    /**
     * 生成优化建议
     */
    computedRecommendations() {
      if (!this.result || !this.result.warnings || this.result.warnings.length === 0) {
        return []
      }

      const recommendations = []

      this.result.warnings.forEach(warning => {
        switch (warning.type) {
          case 'delivery-delay':
            recommendations.push('建议1：提高设备负荷率（如从1.0提高到1.2），减少所需炉次数')
            recommendations.push('建议2：使用更大容量的设备，提高单炉装载量')
            recommendations.push('建议3：延长班次时长，提高日产能')
            recommendations.push('建议4：与客户协商调整交期，预留更充足的时间')
            break
          case 'capacity-insufficient':
            recommendations.push('建议：提高负荷率或增加炉次数，确保总产能满足计划重量')
            break
          case 'invalid-cycle-time':
            recommendations.push('建议：检查并完善工艺模板的温度段配置，确保参数完整')
            break
        }
      })

      // 根据容量利用率提供建议
      if (this.computedFeasibility.avgUtilization < 70) {
        recommendations.push('提示：平均容量利用率较低，建议优化拆分方案或合并计划以提高设备利用率')
      } else if (this.computedFeasibility.avgUtilization > 95) {
        recommendations.push('提示：容量利用率较高，设备接近满载，需要密切关注执行风险')
      }

      return recommendations
    }
  },
  methods: {
    /**
     * 打开对话框
     */
    open(planData) {
      if (!planData || !planData.id) {
        this.$message.error('缺少计划数据')
        return
      }

      this.planData = planData
      this.resetParams()
      this.result = null
      this.visible = true
    },

    /**
     * 关闭对话框
     */
    handleClose() {
      this.visible = false
      this.resetParams()
      this.result = null
    },

    /**
     * 重置参数
     */
    resetParams() {
      this.params = {
        loadRate: 1.0,
        furnaceCapacity: 40.0,
        shiftDurationHours: 8.0
      }
      this.$nextTick(() => {
        if (this.$refs.paramsForm) {
          this.$refs.paramsForm.clearValidate()
        }
      })
    },

    /**
     * 开始评估
     */
    async handleEvaluate() {
      try {
        // 表单验证
        const valid = await this.$refs.paramsForm.validate()
        if (!valid) {
          return
        }

        // 评估前校验
        if (!this.validateBeforeEvaluate()) {
          return
        }

        this.evaluating = true

        const response = await fetchFeasibility(this.planData.id, {
          loadRate: this.params.loadRate,
          furnaceCapacity: this.params.furnaceCapacity,
          shiftDurationHours: this.params.shiftDurationHours
        })

        if (response.success && response.data) {
          this.result = response.data
          this.$message.success(response.message || '评估完成')
        } else {
          // 失败时 message 在 error 对象中
          this.$message.error(response.error?.message || '评估失败')
        }
      } catch (error) {
        console.error('评估失败:', error)
        const errorMessage = getErrorMessage(error)
        this.$message.error(errorMessage)
      } finally {
        this.evaluating = false
      }
    },

    /**
     * 重新评估
     */
    handleReEvaluate() {
      this.result = null
      this.$nextTick(() => {
        this.handleEvaluate()
      })
    },

    /**
     * 评估前校验
     * 注意：这些校验在前端只是提前检查，实际的权威校验在后端
     * 错误消息需要与接口文档保持一致，以便用户理解
     */
    validateBeforeEvaluate() {
      // 检查是否已拆分子批次
      if (!this.planData.items || this.planData.items.length === 0) {
        this.$message.warning('生产计划缺少可用于评估的子计划')
        return false
      }

      // 检查子批次是否有有效重量（根据接口文档，字段名为 plannedWeight）
      const hasValidWeight = this.planData.items.some(item => item.plannedWeight && item.plannedWeight > 0)
      if (!hasValidWeight) {
        this.$message.warning('生产计划缺少有效重量，无法评估')
        return false
      }

      // 检查是否关联工艺模板
      if (!this.planData.defaultProcessTemplateId) {
        this.$message.warning('生产计划未关联工艺模板，无法评估')
        return false
      }

      return true
    },

    /**
     * 获取缓冲天数类型
     */
    getBufferDaysType(days) {
      if (days > 7) return 'success' // 充足-绿色
      if (days >= 3) return 'warning' // 紧张-橙色
      return 'danger' // 不足-红色
    },

    /**
     * 获取缓冲天数文本
     */
    getBufferDaysText(days) {
      if (days > 7) return '充足'
      if (days >= 3) return '紧张'
      if (days >= 0) return '不足'
      return '已延期'
    },

    /**
     * 获取设备利用率颜色
     */
    getUtilizationColor(rate) {
      const percentage = rate * 100
      if (percentage >= 90) return '#F56C6C'
      if (percentage >= 70) return '#E6A23C'
      if (percentage >= 50) return '#67C23A'
      return '#409EFF'
    },

    /**
     * 获取排程表利用率颜色
     */
    getScheduleUtilizationColor(percentage) {
      if (percentage >= 95) return '#67C23A' // 绿色：利用率高
      if (percentage >= 80) return '#409EFF' // 蓝色：利用率正常
      if (percentage >= 60) return '#E6A23C' // 橙色：利用率偏低
      return '#F56C6C' // 红色：利用率过低
    },

    /**
     * 获取风险类型对应的Alert类型
     */
    getWarningType(warningType) {
      switch (warningType) {
        case 'delivery-delay':
          return 'error' // 交期延误：错误
        case 'capacity-insufficient':
          return 'warning' // 产能不足：警告
        case 'invalid-cycle-time':
          return 'warning' // 配置无效：警告
        default:
          return 'warning'
      }
    },

    /**
     * 格式化日期
     */
    formatDate(value) {
      if (!value) return '-'
      return parseTime(value, '{y}-{m}-{d}')
    },

    /**
     * 格式化日期时间
     */
    formatDateTime(value) {
      if (!value) return '-'
      return parseTime(value, '{y}-{m}-{d} {h}:{i}')
    }
  }
}
</script>

<style lang="scss" scoped>
.feasibility-dialog {
  .info-card,
  .params-card,
  .result-card {
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .card-header {
    font-weight: 600;
    font-size: 14px;

    i {
      margin-right: 6px;
      color: #409eff;
    }
  }

  .param-hint {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
  }

  .result-section {
    margin-top: 20px;
  }

  .overall-assessment {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;

    .feasibility-indicator {
      display: flex;
      align-items: center;
      gap: 16px;
      flex: 1;

      .indicator-icon {
        font-size: 64px;
      }

      .indicator-text {
        .text-main {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .text-sub {
          font-size: 14px;
          color: #909399;
        }
      }
    }

    .utilization-rate {
      flex: 1;

      .rate-label {
        font-size: 14px;
        color: #606266;
        margin-bottom: 12px;
      }
    }
  }

  .resource-stats {
    .stat-item {
      text-align: center;
      padding: 20px;
      background-color: #f5f7fa;
      border-radius: 4px;

      .stat-value {
        font-size: 32px;
        font-weight: 600;
        color: #409eff;
        margin-bottom: 8px;
      }

      .stat-label {
        font-size: 14px;
        color: #606266;
      }
    }
  }

  .recommendations-list {
    margin: 0;
    padding-left: 20px;
    list-style: none;

    li {
      margin-bottom: 12px;
      line-height: 1.6;
      color: #606266;

      &:last-child {
        margin-bottom: 0;
      }

      i {
        color: #67c23a;
        margin-right: 8px;
      }
    }
  }

  .warning-details {
    margin-top: 8px;
    font-size: 13px;
    line-height: 1.8;
    color: #606266;

    div {
      margin-bottom: 4px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .capacity-card {
    background-color: #f9fafc;
  }
}

::v-deep .el-dialog__body {
  max-height: 70vh;
  overflow-y: auto;
  padding: 20px;
}

::v-deep .el-card__header {
  padding: 12px 16px;
  background-color: #f5f7fa;
}

::v-deep .el-card__body {
  padding: 16px;
}

::v-deep .el-alert {
  &:last-child {
    margin-bottom: 0;
  }
}
</style>

