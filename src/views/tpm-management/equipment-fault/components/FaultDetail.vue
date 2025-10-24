/**
 * 文件名称：FaultDetail.vue
 * 文件描述：设备故障详情页面组件
 * 创建日期：2025-01-20
 * 修改记录：
 *   - 2025-01-20: 初始创建
 */
<template>
  <div v-loading="loading" class="fault-detail">
    <!-- 页面头部：故障编码和操作按钮 -->
    <div class="detail-header">
      <div class="header-left">
        <el-button
          type="text"
          icon="el-icon-arrow-left"
          @click="handleBack"
        >
          返回列表
        </el-button>
        <el-divider direction="vertical" />
        <span class="fault-code">{{ failureData.failureCode }}</span>
        <!-- 重复故障标记 -->
        <el-tag
          v-if="failureData.isRepeatFailure"
          type="danger"
          size="mini"
          effect="dark"
        >
          <i class="el-icon-warning" /> 重复故障
        </el-tag>
      </div>
      <div class="header-right">
        <action-buttons
          :buttons="actionButtons"
          @click="handleAction"
        />
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="detail-content">
      <!-- 基础信息卡片 -->
      <el-card class="info-card" shadow="never">
        <div slot="header" class="card-header">
          <span class="card-title">基础信息</span>
        </div>
        <el-row :gutter="24">
          <el-col :span="8">
            <div class="info-item">
              <span class="info-label">故障编码：</span>
              <span class="info-value">{{ failureData.failureCode || '-' }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <span class="info-label">故障时间：</span>
              <span class="info-value">{{ formatDateTime(failureData.failureTime) }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <span class="info-label">故障状态：</span>
              <status-tag
                :status="failureData.status"
                :type-map="FAILURE_STATUS_CONFIG.typeMap"
                :text-map="FAILURE_STATUS_CONFIG.textMap"
              />
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :span="8">
            <div class="info-item">
              <span class="info-label">故障等级：</span>
              <status-tag
                :status="failureData.failureLevel"
                :type-map="FAILURE_LEVEL_CONFIG.typeMap"
                :text-map="FAILURE_LEVEL_CONFIG.textMap"
              />
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <span class="info-label">影响程度：</span>
              <span class="info-value">{{ failureData.impactDegree || '-' }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <span class="info-label">故障类型：</span>
              <span class="info-value">{{ failureData.failureType || '-' }}</span>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- 设备信息卡片 -->
      <el-card class="info-card" shadow="never">
        <div slot="header" class="card-header">
          <span class="card-title">设备信息</span>
        </div>
        <el-row :gutter="24">
          <el-col :span="8">
            <div class="info-item">
              <span class="info-label">设备编码：</span>
              <span class="info-value">{{ (failureData.equipment && failureData.equipment.equipmentCode) || '-' }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <span class="info-label">设备名称：</span>
              <span class="info-value">{{ (failureData.equipment && failureData.equipment.equipmentName) || '-' }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <span class="info-label">设备类型：</span>
              <span class="info-value">{{ (failureData.equipment && failureData.equipment.equipmentType) || '-' }}</span>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :span="8">
            <div class="info-item">
              <span class="info-label">设备状态：</span>
              <span class="info-value">{{ (failureData.equipment && failureData.equipment.status) || '-' }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <span class="info-label">制造商：</span>
              <span class="info-value">{{ (failureData.equipment && failureData.equipment.manufacturer) || '-' }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <span class="info-label">设备型号：</span>
              <span class="info-value">{{ (failureData.equipment && failureData.equipment.model) || '-' }}</span>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- 故障描述卡片 -->
      <el-card class="info-card" shadow="never">
        <div slot="header" class="card-header">
          <span class="card-title">故障描述</span>
        </div>
        <div class="description-section">
          <div class="description-item">
            <div class="description-label">故障现象：</div>
            <div class="description-content">{{ failureData.failureDescription || '-' }}</div>
          </div>
          <el-divider />
          <div class="description-item">
            <div class="description-label">初步原因分析：</div>
            <div class="description-content">{{ failureData.failureCausePreliminary || '-' }}</div>
          </div>
          <el-divider v-if="failureData.failureCauseDetailed" />
          <div v-if="failureData.failureCauseDetailed" class="description-item">
            <div class="description-label">详细原因分析：</div>
            <div class="description-content">{{ failureData.failureCauseDetailed }}</div>
          </div>
        </div>
      </el-card>

      <!-- 人员信息卡片 -->
      <el-card class="info-card" shadow="never">
        <div slot="header" class="card-header">
          <span class="card-title">人员信息</span>
        </div>
        <el-row :gutter="24">
          <el-col :span="8">
            <div class="info-item">
              <span class="info-label">报告人：</span>
              <span class="info-value">{{ (failureData.reporter && failureData.reporter.name) || '-' }}</span>
            </div>
            <div v-if="failureData.reporter && failureData.reporter.email" class="info-item">
              <span class="info-label">联系邮箱：</span>
              <span class="info-value">{{ failureData.reporter.email }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <span class="info-label">处理人：</span>
              <span class="info-value">{{ (failureData.repairer && failureData.repairer.name) || '-' }}</span>
            </div>
            <div v-if="failureData.repairer && failureData.repairer.email" class="info-item">
              <span class="info-label">联系邮箱：</span>
              <span class="info-value">{{ failureData.repairer.email }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <span class="info-label">验证人：</span>
              <span class="info-value">{{ (failureData.verifier && failureData.verifier.name) || '-' }}</span>
            </div>
            <div v-if="failureData.verifier && failureData.verifier.email" class="info-item">
              <span class="info-label">联系邮箱：</span>
              <span class="info-value">{{ failureData.verifier.email }}</span>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- 处理信息卡片 -->
      <el-card v-if="hasRepairInfo" class="info-card" shadow="never">
        <div slot="header" class="card-header">
          <span class="card-title">处理信息</span>
        </div>
        <el-row :gutter="24">
          <el-col :span="8">
            <div class="info-item">
              <span class="info-label">处理开始时间：</span>
              <span class="info-value">{{ formatDateTime(failureData.repairStartTime) }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <span class="info-label">处理结束时间：</span>
              <span class="info-value">{{ formatDateTime(failureData.repairEndTime) }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <span class="info-label">MTTR：</span>
              <span class="info-value">{{ formatMTTR(failureData.mttrHours) }}</span>
            </div>
          </el-col>
        </el-row>
        <el-divider v-if="failureData.repairActions" />
        <div v-if="failureData.repairActions" class="description-item">
          <div class="description-label">处理措施：</div>
          <div class="description-content">{{ failureData.repairActions }}</div>
        </div>
        <!-- 使用备件清单 -->
        <el-divider v-if="failureData.sparePartsUsed && failureData.sparePartsUsed.length > 0" />
        <div v-if="failureData.sparePartsUsed && failureData.sparePartsUsed.length > 0">
          <div class="description-label">使用备件清单：</div>
          <el-table
            :data="failureData.sparePartsUsed"
            border
            size="small"
            style="margin-top: 12px"
          >
            <el-table-column prop="sparePartCode" label="备件编码" min-width="120" />
            <el-table-column prop="sparePartName" label="备件名称" min-width="150" />
            <el-table-column prop="quantity" label="数量" width="80" align="center" />
            <el-table-column prop="unitPrice" label="单价" width="100" align="right">
              <template slot-scope="scope">
                {{ scope.row.unitPrice ? `¥${scope.row.unitPrice.toFixed(2)}` : '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="totalPrice" label="总价" width="100" align="right">
              <template slot-scope="scope">
                {{ scope.row.totalPrice ? `¥${scope.row.totalPrice.toFixed(2)}` : '-' }}
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-card>

      <!-- 根本原因分析卡片 -->
      <el-card v-if="hasRootCauseAnalysis" class="info-card" shadow="never">
        <div slot="header" class="card-header">
          <span class="card-title">根本原因分析</span>
        </div>
        <div class="description-section">
          <div class="description-item">
            <div class="description-label">根本原因分析：</div>
            <div class="description-content">{{ failureData.rootCauseAnalysis }}</div>
          </div>
          <el-divider v-if="failureData.preventiveMeasures" />
          <div v-if="failureData.preventiveMeasures" class="description-item">
            <div class="description-label">预防措施：</div>
            <div class="description-content">{{ failureData.preventiveMeasures }}</div>
          </div>
        </div>
      </el-card>

      <!-- 处理流程时间线 -->
      <el-card class="info-card" shadow="never">
        <div slot="header" class="card-header">
          <span class="card-title">处理流程</span>
        </div>
        <el-timeline>
          <el-timeline-item
            v-for="(activity, index) in timelineActivities"
            :key="index"
            :timestamp="activity.timestamp"
            :type="activity.type"
            :icon="activity.icon"
            placement="top"
          >
            <div class="timeline-content">
              <div class="timeline-title">{{ activity.title }}</div>
              <div v-if="activity.content" class="timeline-desc">{{ activity.content }}</div>
            </div>
          </el-timeline-item>
        </el-timeline>
      </el-card>

      <!-- 审计信息卡片 -->
      <el-card class="info-card" shadow="never">
        <div slot="header" class="card-header">
          <span class="card-title">审计信息</span>
        </div>
        <el-row :gutter="24">
          <el-col :span="12">
            <div class="info-item">
              <span class="info-label">创建人：</span>
              <span class="info-value">{{ failureData.createdBy || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">创建时间：</span>
              <span class="info-value">{{ formatDateTime(failureData.createdAt) }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <span class="info-label">更新人：</span>
              <span class="info-value">{{ failureData.updatedBy || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">更新时间：</span>
              <span class="info-value">{{ formatDateTime(failureData.updatedAt) }}</span>
            </div>
          </el-col>
        </el-row>
      </el-card>
    </div>
  </div>
</template>

<script>
import { getEquipmentFailureById } from '@/api/mdm/tpm/equipmentFailure'
import { FAILURE_LEVEL_CONFIG, FAILURE_STATUS_CONFIG, FAILURE_STATUS } from '../constants'
import ActionButtons from '@/components/ActionButtons'
import StatusTag from '@/components/StatusTag'
import { formatDateTime } from '../utils'

export default {
  name: 'FaultDetail',
  components: {
    ActionButtons,
    StatusTag
  },
  props: {
    failureId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      loading: false,
      failureData: {},
      FAILURE_LEVEL_CONFIG,
      FAILURE_STATUS_CONFIG,
      FAILURE_STATUS
    }
  },
  computed: {
    // 是否有处理信息
    hasRepairInfo() {
      return this.failureData.repairStartTime ||
             this.failureData.repairEndTime ||
             this.failureData.repairActions ||
             (this.failureData.sparePartsUsed && this.failureData.sparePartsUsed.length > 0)
    },
    // 是否有根本原因分析
    hasRootCauseAnalysis() {
      return this.failureData.rootCauseAnalysis || this.failureData.preventiveMeasures
    },
    // 操作按钮配置
    actionButtons() {
      const buttons = []
      const status = this.failureData.status

      // 编辑按钮 - 待处理、处理中状态可编辑
      if (status === FAILURE_STATUS.PENDING || status === FAILURE_STATUS.IN_PROGRESS) {
        buttons.push({
          action: 'edit',
          text: '编辑',
          type: 'primary',
          icon: 'el-icon-edit'
        })
      }

      // 开始处理按钮 - 待处理状态可开始处理
      if (status === FAILURE_STATUS.PENDING) {
        buttons.push({
          action: 'start-repair',
          text: '开始处理',
          type: 'success',
          icon: 'el-icon-video-play'
        })
      }

      // 完成处理按钮 - 处理中状态可完成处理
      if (status === FAILURE_STATUS.IN_PROGRESS) {
        buttons.push({
          action: 'complete-repair',
          text: '完成处理',
          type: 'success',
          icon: 'el-icon-check'
        })
      }

      // 验证按钮 - 已解决状态可验证
      if (status === FAILURE_STATUS.RESOLVED) {
        buttons.push({
          action: 'verify',
          text: '验证',
          type: 'primary',
          icon: 'el-icon-circle-check'
        })
      }

      // 提交根本原因分析按钮 - 已解决、已验证状态可提交
      if (status === FAILURE_STATUS.RESOLVED || status === FAILURE_STATUS.VERIFIED) {
        buttons.push({
          action: 'root-cause-analysis',
          text: '根本原因分析',
          type: 'warning',
          icon: 'el-icon-document'
        })
      }

      // 关闭按钮 - 非已关闭状态都可以关闭
      if (status !== FAILURE_STATUS.CLOSED) {
        buttons.push({
          action: 'close',
          text: '关闭',
          type: 'danger',
          icon: 'el-icon-close'
        })
      }

      return buttons
    },
    // 时间线活动
    timelineActivities() {
      const activities = []

      // 故障报告
      if (this.failureData.createdAt) {
        activities.push({
          timestamp: formatDateTime(this.failureData.createdAt),
          title: '故障报告',
          content: `${(this.failureData.reporter && this.failureData.reporter.name) || '未知'} 创建了故障报告`,
          type: 'primary',
          icon: 'el-icon-document-add'
        })
      }

      // 开始处理
      if (this.failureData.repairStartTime) {
        activities.push({
          timestamp: formatDateTime(this.failureData.repairStartTime),
          title: '开始处理',
          content: `${(this.failureData.repairer && this.failureData.repairer.name) || '未知'} 开始处理故障`,
          type: 'warning',
          icon: 'el-icon-video-play'
        })
      }

      // 完成处理
      if (this.failureData.repairEndTime) {
        activities.push({
          timestamp: formatDateTime(this.failureData.repairEndTime),
          title: '完成处理',
          content: `${(this.failureData.repairer && this.failureData.repairer.name) || '未知'} 完成故障处理`,
          type: 'success',
          icon: 'el-icon-check'
        })
      }

      // 验证
      if (this.failureData.status === FAILURE_STATUS.VERIFIED || this.failureData.status === FAILURE_STATUS.CLOSED) {
        if (this.failureData.verifier) {
          activities.push({
            timestamp: formatDateTime(this.failureData.updatedAt),
            title: '验证通过',
            content: `${this.failureData.verifier.name} 验证处理结果`,
            type: 'success',
            icon: 'el-icon-circle-check'
          })
        }
      }

      // 关闭
      if (this.failureData.status === FAILURE_STATUS.CLOSED) {
        activities.push({
          timestamp: formatDateTime(this.failureData.updatedAt),
          title: '故障关闭',
          content: '故障单已关闭',
          type: 'info',
          icon: 'el-icon-circle-close'
        })
      }

      return activities
    }
  },
  mounted() {
    this.fetchFailureDetail()
  },
  methods: {
    // 获取故障详情
    async fetchFailureDetail() {
      try {
        this.loading = true
        const response = await getEquipmentFailureById(this.failureId)
        this.failureData = response.data || {}
      } catch (error) {
        this.$message.error(error.message || '获取故障详情失败')
      } finally {
        this.loading = false
      }
    },
    // 返回列表
    handleBack() {
      this.$emit('back')
    },
    // 处理操作按钮点击
    handleAction(event) {
      // ActionButtons组件发出的事件对象包含 { action, data, row }
      this.$emit('action', { action: event.action, failureId: this.failureId })
    }
  }
}
</script>

<style lang="scss" scoped>
.fault-detail {
  background-color: #f5f7fa;
  min-height: calc(100vh - 84px);
  padding: 16px;

  .detail-header {
    background: #fff;
    padding: 16px 24px;
    border-radius: 4px;
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;

      .fault-code {
        font-size: 18px;
        font-weight: 600;
        color: #303133;
      }
    }

    .header-right {
      display: flex;
      gap: 8px;
    }
  }

  .detail-content {
    .info-card {
      margin-bottom: 16px;
      border-radius: 4px;

      ::v-deep .el-card__header {
        padding: 16px 24px;
        background-color: #fafafa;
        border-bottom: 1px solid #e8eaec;
      }

      ::v-deep .el-card__body {
        padding: 24px;
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .card-title {
          font-size: 16px;
          font-weight: 600;
          color: #303133;
        }
      }

      .info-item {
        margin-bottom: 16px;
        line-height: 1.8;

        &:last-child {
          margin-bottom: 0;
        }

        .info-label {
          color: #606266;
          font-size: 14px;
          display: inline-block;
          min-width: 100px;
        }

        .info-value {
          color: #303133;
          font-size: 14px;
        }
      }

      .description-section {
        .description-item {
          .description-label {
            font-size: 14px;
            font-weight: 600;
            color: #606266;
            margin-bottom: 12px;
          }

          .description-content {
            font-size: 14px;
            color: #303133;
            line-height: 1.8;
            white-space: pre-wrap;
            word-break: break-word;
          }
        }
      }

      .timeline-content {
        .timeline-title {
          font-size: 14px;
          font-weight: 600;
          color: #303133;
          margin-bottom: 4px;
        }

        .timeline-desc {
          font-size: 13px;
          color: #606266;
        }
      }
    }
  }
}
</style>

