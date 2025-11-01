<!--
 * 文件名称: HealthDetailDialog.vue
 * 文件描述: 设备健康度详情弹窗组件
 * 创建日期: 2024-01-20
 * 修改记录:
 *   - 2024-01-20: 初始创建
-->
<template>
  <el-dialog
    :visible.sync="dialogVisible"
    title="设备健康度详情"
    width="800px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div v-if="equipment" class="detail-content">
      <!-- 设备基本信息 -->
      <div class="info-section">
        <div class="section-title">设备基本信息</div>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="设备编码">{{ equipment.equipmentCode }}</el-descriptions-item>
          <el-descriptions-item label="设备名称">{{ equipment.equipmentName }}</el-descriptions-item>
          <el-descriptions-item label="设备类型">{{ equipment.equipmentType }}</el-descriptions-item>
          <el-descriptions-item label="设备状态">
            <el-tag :type="getStatusType(equipment.status)" size="small">
              {{ equipment.status }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 健康度评分 -->
      <div class="score-section">
        <div class="section-title">健康度评分</div>
        <div class="score-display">
          <div class="score-circle">
            <el-progress
              type="circle"
              :percentage="equipment.healthScore"
              :width="150"
              :color="getScoreColor(equipment.healthScore)"
              :format="() => `${equipment.healthScore}分`"
            />
          </div>
          <div class="score-info">
            <div class="score-level">
              <span class="label">健康等级：</span>
              <el-tag
                :type="getLevelType(equipment.healthLevel)"
                :color="getLevelColor(equipment.healthLevel)"
                effect="dark"
                size="medium"
              >
                <i :class="getLevelIcon(equipment.healthLevel)" />
                {{ equipment.healthLevel }}
              </el-tag>
            </div>
            <div class="score-desc">
              {{ getLevelDescription(equipment.healthLevel) }}
            </div>
          </div>
        </div>
      </div>

      <!-- 评分依据详情 -->
      <div class="basis-section">
        <div class="section-title">评分依据详情</div>
        <el-table
          :data="scoringBasis"
          border
          stripe
          style="width: 100%"
        >
          <el-table-column prop="dimension" label="评分维度" width="150" />
          <el-table-column prop="actualValue" label="实际情况" width="150" />
          <el-table-column prop="riskLevel" label="风险等级" width="100">
            <template slot-scope="{ row }">
              <el-tag :type="getRiskType(row.riskLevel)" size="small">
                {{ row.riskLevel }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="deduction" label="扣分" width="80" align="center">
            <template slot-scope="{ row }">
              <span :class="{'deduction-text': row.deduction > 0}">
                {{ row.deduction > 0 ? `-${row.deduction}分` : '0分' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="suggestion" label="改善建议" />
        </el-table>
      </div>

      <!-- 改善建议 -->
      <div class="suggestion-section">
        <div class="section-title">改善建议</div>
        <el-alert
          v-for="(suggestion, index) in improvementSuggestions"
          :key="index"
          :title="suggestion.title"
          :type="suggestion.type"
          :description="suggestion.description"
          show-icon
          :closable="false"
          class="suggestion-alert"
        />
      </div>
    </div>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">关闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { HEALTH_LEVEL_CONFIG } from '../constants'

export default {
  name: 'HealthDetailDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    equipment: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      dialogVisible: false
    }
  },
  computed: {
    scoringBasis() {
      if (!this.equipment) return []

      return [
        {
          dimension: '故障次数',
          actualValue: `${this.equipment.failureCount}次（最近3个月）`,
          riskLevel: this.getFailureRisk(this.equipment.failureCount),
          deduction: this.getFailureDeduction(this.equipment.failureCount),
          suggestion: this.getFailureSuggestion(this.equipment.failureCount)
        },
        {
          dimension: '维护完成率',
          actualValue: `${this.equipment.maintenanceCompletionRate}%`,
          riskLevel: this.getMaintenanceRisk(this.equipment.maintenanceCompletionRate),
          deduction: this.getMaintenanceDeduction(this.equipment.maintenanceCompletionRate),
          suggestion: this.getMaintenanceSuggestion(this.equipment.maintenanceCompletionRate)
        },
        {
          dimension: '平均修复时间',
          actualValue: `${this.equipment.avgMTTR}小时`,
          riskLevel: this.getMTTRRisk(this.equipment.avgMTTR),
          deduction: this.getMTTRDeduction(this.equipment.avgMTTR),
          suggestion: this.getMTTRSuggestion(this.equipment.avgMTTR)
        },
        {
          dimension: '维护间隔',
          actualValue: `${this.equipment.daysSinceLastMaintenance}天`,
          riskLevel: this.getMaintenanceIntervalRisk(this.equipment.daysSinceLastMaintenance),
          deduction: this.getMaintenanceIntervalDeduction(this.equipment.daysSinceLastMaintenance),
          suggestion: this.getMaintenanceIntervalSuggestion(this.equipment.daysSinceLastMaintenance)
        },
        {
          dimension: '设备状态',
          actualValue: this.equipment.status,
          riskLevel: this.getStatusRisk(this.equipment.status),
          deduction: this.getStatusDeduction(this.equipment.status),
          suggestion: this.getStatusSuggestion(this.equipment.status)
        }
      ]
    },
    improvementSuggestions() {
      if (!this.equipment) return []

      const suggestions = []

      if (this.equipment.healthScore < 60) {
        suggestions.push({
          type: 'error',
          title: '紧急改善建议',
          description: '该设备健康度评分低于60分，建议立即组织专项检查，制定详细改善计划，并安排专人跟进。'
        })
      } else if (this.equipment.healthScore < 75) {
        suggestions.push({
          type: 'warning',
          title: '重点关注建议',
          description: '该设备健康度评分处于一般水平，建议增加维护频次，密切关注设备运行状态。'
        })
      }

      if (this.equipment.failureCount >= 7) {
        suggestions.push({
          type: 'warning',
          title: '故障频发预警',
          description: '该设备故障频繁，建议进行根本原因分析，查找系统性问题，制定预防措施。'
        })
      }

      if (this.equipment.maintenanceCompletionRate < 80) {
        suggestions.push({
          type: 'warning',
          title: '维护执行不力',
          description: '该设备维护完成率偏低，建议优化维护计划，确保维护任务按时完成。'
        })
      }

      if (this.equipment.daysSinceLastMaintenance > 180) {
        suggestions.push({
          type: 'warning',
          title: '维护严重滞后',
          description: '该设备距离上次维护已超过180天，建议立即安排维护检查，避免因维护不及时导致故障。'
        })
      }

      if (suggestions.length === 0) {
        suggestions.push({
          type: 'success',
          title: '设备状态良好',
          description: '该设备运行稳定，维护执行良好，建议继续保持当前维护计划。'
        })
      }

      return suggestions
    }
  },
  watch: {
    visible(val) {
      this.dialogVisible = val
    },
    dialogVisible(val) {
      if (!val) {
        this.$emit('update:visible', false)
      }
    }
  },
  methods: {
    handleClose() {
      this.dialogVisible = false
    },
    getScoreColor(score) {
      if (score >= 90) return '#67C23A'
      if (score >= 75) return '#409EFF'
      if (score >= 60) return '#E6A23C'
      return '#F56C6C'
    },
    getLevelColor(level) {
      return HEALTH_LEVEL_CONFIG[level]?.color || '#909399'
    },
    getLevelIcon(level) {
      return HEALTH_LEVEL_CONFIG[level]?.icon || 'el-icon-info'
    },
    getLevelType(level) {
      const typeMap = {
        '优秀': 'success',
        '良好': 'info',
        '一般': 'warning',
        '差': 'danger'
      }
      return typeMap[level] || 'info'
    },
    getLevelDescription(level) {
      return HEALTH_LEVEL_CONFIG[level]?.description || ''
    },
    getStatusType(status) {
      const typeMap = {
        '运行': 'success',
        '停机': 'info',
        '维护': 'warning',
        '故障': 'danger'
      }
      return typeMap[status] || 'info'
    },
    getRiskType(risk) {
      const typeMap = {
        '低风险': 'success',
        '中风险': 'warning',
        '高风险': 'danger'
      }
      return typeMap[risk] || 'info'
    },
    // 故障次数评估
    getFailureRisk(count) {
      if (count >= 7) return '高风险'
      if (count >= 4) return '中风险'
      return '低风险'
    },
    getFailureDeduction(count) {
      if (count >= 7) return 30
      if (count >= 4) return 15
      return 0
    },
    getFailureSuggestion(count) {
      if (count >= 7) return '故障频繁，需进行根本原因分析'
      if (count >= 4) return '故障频率偏高，建议加强预防性维护'
      return '故障率正常，继续保持'
    },
    // 维护完成率评估
    getMaintenanceRisk(rate) {
      if (rate < 80) return '高风险'
      if (rate < 95) return '中风险'
      return '低风险'
    },
    getMaintenanceDeduction(rate) {
      if (rate < 80) return 20
      if (rate < 95) return 10
      return 0
    },
    getMaintenanceSuggestion(rate) {
      if (rate < 80) return '维护执行不力，需优化维护计划'
      if (rate < 95) return '维护执行一般，有待改善'
      return '维护执行良好，继续保持'
    },
    // MTTR评估
    getMTTRRisk(mttr) {
      if (mttr > 24) return '高风险'
      if (mttr > 8) return '中风险'
      return '低风险'
    },
    getMTTRDeduction(mttr) {
      if (mttr > 24) return 15
      if (mttr > 8) return 5
      return 0
    },
    getMTTRSuggestion(mttr) {
      if (mttr > 24) return '修复时间过长，需提升维修效率'
      if (mttr > 8) return '修复时间偏长，有改进空间'
      return '修复效率良好，继续保持'
    },
    // 维护间隔评估
    getMaintenanceIntervalRisk(days) {
      if (days > 180) return '高风险'
      if (days > 90) return '中风险'
      return '低风险'
    },
    getMaintenanceIntervalDeduction(days) {
      if (days > 180) return 15
      if (days > 90) return 10
      return 0
    },
    getMaintenanceIntervalSuggestion(days) {
      if (days > 180) return '维护严重滞后，建议立即安排维护'
      if (days > 90) return '维护间隔偏长，建议尽快安排维护'
      return '维护及时，符合计划'
    },
    // 设备状态评估
    getStatusRisk(status) {
      if (status === '故障') return '高风险'
      if (status === '维护') return '中风险'
      return '低风险'
    },
    getStatusDeduction(status) {
      if (status === '故障') return 20
      if (status === '维护') return 5
      return 0
    },
    getStatusSuggestion(status) {
      if (status === '故障') return '设备故障，需紧急处理'
      if (status === '维护') return '设备维护中，暂时不可用'
      return '设备运行正常'
    }
  }
}
</script>

<style lang="scss" scoped>
.detail-content {
  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 12px;
    padding-left: 8px;
    border-left: 4px solid #409EFF;
  }

  .info-section {
    margin-bottom: 24px;
  }

  .score-section {
    margin-bottom: 24px;

    .score-display {
      display: flex;
      align-items: center;
      padding: 20px;
      background: #f5f7fa;
      border-radius: 4px;

      .score-circle {
        margin-right: 40px;
      }

      .score-info {
        flex: 1;

        .score-level {
          margin-bottom: 16px;

          .label {
            font-size: 14px;
            color: #606266;
            margin-right: 8px;
          }
        }

        .score-desc {
          font-size: 14px;
          color: #606266;
          line-height: 1.6;
        }
      }
    }
  }

  .basis-section {
    margin-bottom: 24px;

    .deduction-text {
      color: #F56C6C;
      font-weight: 600;
    }
  }

  .suggestion-section {
    .suggestion-alert {
      margin-bottom: 12px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

::v-deep .el-dialog__body {
  max-height: 70vh;
  overflow-y: auto;
}
</style>

