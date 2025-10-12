/**
 * 文件名称：FeasibilityDialog.vue
 * 文件描述：生产计划可行性评估对话框组件
 * 创建日期：2025-01-21
 * 修改记录：
 *   - 2025-01-21: 初始创建，实现P0阶段核心功能
 */

<template>
  <el-dialog
    :visible.sync="visible"
    :title="dialogTitle"
    width="900px"
    :close-on-click-modal="false"
    top="5vh"
    @close="handleClose"
  >
    <div v-loading="loading" class="feasibility-dialog">
      <!-- 计划基本信息 -->
      <el-card class="info-card" shadow="never">
        <div slot="header" class="card-header">
          <span><i class="el-icon-document" /> 计划基本信息</span>
        </div>
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="计划编号">
            {{ planData.planNumber || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="产品编码">
            {{ planData.productCode || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="需求数量">
            {{ planData.demandQuantity }} {{ planData.demandUnit }}
          </el-descriptions-item>
          <el-descriptions-item label="计划交期">
            {{ formatDate(planData.plannedDeliveryDate) }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 评估参数配置 -->
      <el-card class="params-card" shadow="never">
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
          <el-form-item>
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
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 评估结果 -->
      <div v-if="hasResult" class="result-section">
        <!-- 总体评估 -->
        <el-card class="result-card" shadow="never">
          <div slot="header" class="card-header">
            <span><i class="el-icon-pie-chart" /> 总体评估</span>
          </div>
          <div class="overall-assessment">
            <div class="feasibility-indicator">
              <i
                :class="[
                  'indicator-icon',
                  result.feasibilityAnalysis.isFeasible ? 'el-icon-success' : 'el-icon-warning'
                ]"
                :style="{ color: result.feasibilityAnalysis.isFeasible ? '#67C23A' : '#F56C6C' }"
              />
              <div class="indicator-text">
                <div class="text-main">
                  {{ result.feasibilityAnalysis.isFeasible ? '可行' : '不可行' }}
                </div>
                <div class="text-sub">
                  {{ result.feasibilityAnalysis.isFeasible ? '计划可按时完成' : '存在交期风险' }}
                </div>
              </div>
            </div>
            <div class="utilization-rate">
              <div class="rate-label">设备利用率</div>
              <el-progress
                :percentage="Math.round(result.feasibilityAnalysis.utilizationRate * 100)"
                :color="getUtilizationColor(result.feasibilityAnalysis.utilizationRate)"
                :stroke-width="20"
              />
            </div>
          </div>
        </el-card>

        <!-- 资源需求 -->
        <el-card class="result-card" shadow="never">
          <div slot="header" class="card-header">
            <span><i class="el-icon-box" /> 资源需求</span>
          </div>
          <el-row :gutter="20" class="resource-stats">
            <el-col :span="8">
              <div class="stat-item">
                <div class="stat-value">{{ result.feasibilityAnalysis.requiredFurnaceBatches }}</div>
                <div class="stat-label">所需炉次数</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="stat-item">
                <div class="stat-value">{{ result.feasibilityAnalysis.estimatedTotalHours }}</div>
                <div class="stat-label">预计总工时（小时）</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="stat-item">
                <div class="stat-value">{{ result.feasibilityAnalysis.estimatedTotalDays }}</div>
                <div class="stat-label">预计总天数</div>
              </div>
            </el-col>
          </el-row>
        </el-card>

        <!-- 时间预测 -->
        <el-card class="result-card" shadow="never">
          <div slot="header" class="card-header">
            <span><i class="el-icon-time" /> 时间预测</span>
          </div>
          <el-descriptions :column="1" border size="small">
            <el-descriptions-item label="预计完成时间">
              {{ formatDateTime(result.feasibilityAnalysis.estimatedCompletionDate) }}
            </el-descriptions-item>
            <el-descriptions-item label="计划交期">
              {{ formatDateTime(result.plannedDeliveryDate) }}
            </el-descriptions-item>
            <el-descriptions-item label="剩余缓冲天数">
              <el-tag
                :type="getBufferDaysType(result.feasibilityAnalysis.remainingBufferDays)"
                size="medium"
              >
                {{ result.feasibilityAnalysis.remainingBufferDays }} 天
                ({{ getBufferDaysText(result.feasibilityAnalysis.remainingBufferDays) }})
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 风险提示 -->
        <el-card
          v-if="result.feasibilityAnalysis.risks && result.feasibilityAnalysis.risks.length > 0"
          class="result-card"
          shadow="never"
        >
          <div slot="header" class="card-header">
            <span><i class="el-icon-warning" /> 风险提示</span>
          </div>
          <el-alert
            v-for="(risk, index) in result.feasibilityAnalysis.risks"
            :key="index"
            :title="risk"
            type="warning"
            show-icon
            :closable="false"
            style="margin-bottom: 10px"
          />
        </el-card>

        <!-- 建议 -->
        <el-card
          v-if="result.feasibilityAnalysis.recommendations && result.feasibilityAnalysis.recommendations.length > 0"
          class="result-card"
          shadow="never"
        >
          <div slot="header" class="card-header">
            <span><i class="el-icon-s-opportunity" /> 优化建议</span>
          </div>
          <ul class="recommendations-list">
            <li
              v-for="(recommendation, index) in result.feasibilityAnalysis.recommendations"
              :key="index"
            >
              <i class="el-icon-check" />
              {{ recommendation }}
            </li>
          </ul>
        </el-card>

        <!-- 容量约束信息 -->
        <el-card class="result-card capacity-card" shadow="never">
          <div slot="header" class="card-header">
            <span><i class="el-icon-data-line" /> 容量约束条件</span>
          </div>
          <el-descriptions :column="3" border size="small">
            <el-descriptions-item label="炉次容量">
              {{ result.feasibilityAnalysis.capacityConstraints.furnaceCapacity }} 吨
            </el-descriptions-item>
            <el-descriptions-item label="设备负荷率">
              {{ result.feasibilityAnalysis.capacityConstraints.loadRate }}
            </el-descriptions-item>
            <el-descriptions-item label="班次时长">
              {{ result.feasibilityAnalysis.capacityConstraints.shiftDurationHours }} 小时
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
          this.$message.error(response.message || '评估失败')
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
     */
    validateBeforeEvaluate() {
      // 检查是否已拆分子批次
      if (!this.planData.items || this.planData.items.length === 0) {
        this.$message.warning('生产计划缺少可用于评估的子计划，请先拆分计划再进行评估')
        return false
      }

      // 检查子批次是否有有效重量
      const hasValidWeight = this.planData.items.some(item => item.predictedWeight && item.predictedWeight > 0)
      if (!hasValidWeight) {
        this.$message.warning('生产计划缺少有效重量，无法评估，请补充子计划的预计重量信息')
        return false
      }

      // 检查是否关联工艺模板
      if (!this.planData.defaultProcessTemplateId) {
        this.$message.warning('生产计划未关联工艺模板，无法评估，请先关联工艺模板后再评估')
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

