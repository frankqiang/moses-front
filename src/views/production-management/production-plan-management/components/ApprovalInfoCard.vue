<!--
  文件名称：ApprovalInfoCard.vue
  文件描述：审批信息展示卡片组件 - 统一的审批信息显示组件，用于各审批对话框
  创建日期：2025-01-30
  修改记录：
    - 2025-01-30: 初始创建，提取公共审批信息展示逻辑
-->
<template>
  <div class="approval-info-card">
    <!-- 基本审批信息 -->
    <el-descriptions
      v-if="approvalData"
      :column="2"
      border
      class="approval-info"
    >
      <el-descriptions-item label="计划编号">
        {{ planNumber }}
      </el-descriptions-item>
      <el-descriptions-item label="产品信息">
        <div v-if="productInfo">
          <div class="product-name">{{ productInfo.name }}</div>
          <div class="product-code">{{ productInfo.code }}</div>
        </div>
        <span v-else>-</span>
      </el-descriptions-item>
      <el-descriptions-item label="申请人">
        <div v-if="requesterInfo">
          <div class="user-name">{{ requesterInfo.name }}</div>
          <div class="user-email">{{ requesterInfo.email }}</div>
        </div>
        <span v-else>-</span>
      </el-descriptions-item>
      <el-descriptions-item label="申请时间">
        {{ formatDateTime(approvalData.requestedAt) }}
      </el-descriptions-item>
      <el-descriptions-item v-if="approverInfo" label="审批人">
        <div>
          <div class="user-name">{{ approverInfo.name }}</div>
          <div class="user-email">{{ approverInfo.email }}</div>
        </div>
      </el-descriptions-item>
      <el-descriptions-item v-if="approvalData.decidedAt" label="审批时间">
        {{ formatDateTime(approvalData.decidedAt) }}
      </el-descriptions-item>
      <el-descriptions-item label="当前状态">
        <el-tag :type="previousStatusType" size="small">
          {{ previousStatusText }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="目标状态">
        <el-tag :type="targetStatusType" size="small">
          {{ targetStatusText }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="审批状态" :span="approverInfo ? 1 : 2">
        <el-tag :type="approvalStatusType" size="small">
          {{ approvalStatusText }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item v-if="approverInfo && approvalData.decisionRemarks" label="审批意见" :span="2">
        <div class="decision-remarks">{{ approvalData.decisionRemarks }}</div>
      </el-descriptions-item>
      <el-descriptions-item label="申请原因" :span="2">
        {{ approvalData.remarks || '-' }}
      </el-descriptions-item>
      <el-descriptions-item v-if="cancelReason" label="取消原因" :span="2">
        <el-tag type="warning" size="small">{{ cancelReason }}</el-tag>
      </el-descriptions-item>
    </el-descriptions>

    <!-- 审计轨迹 -->
    <el-collapse v-if="auditTrail && auditTrail.length > 0" class="audit-trail-collapse">
      <el-collapse-item title="审批流程记录" name="audit">
        <el-timeline>
          <el-timeline-item
            v-for="(record, index) in auditTrail"
            :key="index"
            :timestamp="formatDateTime(record.timestamp)"
            placement="top"
            :type="getAuditActionType(record.action)"
          >
            <div class="audit-record">
              <div class="audit-action">
                <el-tag :type="getAuditActionTagType(record.action)" size="mini">
                  {{ getAuditActionText(record.action) }}
                </el-tag>
              </div>
              <div class="audit-operator">
                操作人：{{ record.operatorName || '未知' }}
                <span v-if="record.operatorIp" class="operator-ip">（{{ record.operatorIp }}）</span>
              </div>
              <div v-if="record.remarks" class="audit-remarks">
                备注：{{ record.remarks }}
              </div>
            </div>
          </el-timeline-item>
        </el-timeline>
      </el-collapse-item>
    </el-collapse>

    <!-- 计划快照详情（可选展示） -->
    <el-collapse v-if="showPlanSnapshot && planSnapshot" class="plan-snapshot-collapse">
      <el-collapse-item title="计划快照详情" name="snapshot">
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="需求数量">
            {{ planSnapshot.demandQuantity }} {{ planSnapshot.demandUnit }}
          </el-descriptions-item>
          <el-descriptions-item label="计划状态">
            <el-tag :type="getStatusType(planSnapshot.status)" size="mini">
              {{ getStatusText(planSnapshot.status) }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <!-- 计划明细项 -->
        <div v-if="planSnapshot.items && planSnapshot.items.length > 0" class="plan-items">
          <div class="plan-items-title">计划明细项（{{ planSnapshot.items.length }}项）：</div>
          <el-table :data="planSnapshot.items" size="small" border>
            <el-table-column prop="sequence" label="序号" width="60" align="center" />
            <el-table-column prop="itemNumber" label="明细编号" min-width="150" />
            <el-table-column label="计划数量" width="100" align="right">
              <template slot-scope="{ row }">
                {{ row.plannedQuantity }}
              </template>
            </el-table-column>
            <el-table-column label="计划重量" width="120" align="right">
              <template slot-scope="{ row }">
                {{ row.plannedWeight }} kg
              </template>
            </el-table-column>
            <el-table-column label="明细状态" width="130" align="center">
              <template slot-scope="{ row }">
                <el-tag :type="getItemStatusType(row.status)" size="mini">
                  {{ getItemStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script>
import {
  PLAN_STATUS_TYPE_MAP
} from '../constants'
import dictionaryMixin from '../mixins/dictionary'

export default {
  name: 'ApprovalInfoCard',
  mixins: [dictionaryMixin],
  props: {
    // 审批数据对象（必需）
    approvalData: {
      type: Object,
      required: true
    },
    // 生产计划数据 - 用于显示实际的计划编号和状态
    planData: {
      type: Object,
      default: () => ({})
    },
    // 是否显示计划快照详情
    showPlanSnapshot: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    // 计划编号
    planNumber() {
      return this.planData.planNumber ||
             (this.approvalData && this.approvalData.metadata &&
              this.approvalData.metadata.planSnapshot && this.approvalData.metadata.planSnapshot.planNumber) || '-'
    },

    // 申请人信息
    requesterInfo() {
      if (!this.approvalData || !this.approvalData.requester) {
        return null
      }
      return {
        name: this.approvalData.requester.name || '-',
        email: this.approvalData.requester.email || '-'
      }
    },

    // 审批人信息（如果已审批）
    approverInfo() {
      if (!this.approvalData || !this.approvalData.approver) {
        return null
      }
      return {
        name: this.approvalData.approver.name || '-',
        email: this.approvalData.approver.email || '-'
      }
    },

    // 产品信息
    productInfo() {
      if (!this.approvalData || !this.approvalData.metadata ||
          !this.approvalData.metadata.planSnapshot) {
        return null
      }
      const snapshot = this.approvalData.metadata.planSnapshot
      return {
        code: snapshot.productCode || '-',
        name: snapshot.productName || '-'
      }
    },

    // 取消原因（仅当目标状态为CANCELLED时显示）
    cancelReason() {
      if (!this.approvalData || !this.approvalData.metadata) {
        return null
      }
      const isCancel = this.approvalData.requestedAction === 'CANCELLED' ||
                       (this.approvalData.metadata.targetStatus === 'CANCELLED')
      return isCancel ? this.approvalData.metadata.cancelReason : null
    },

    // 计划快照
    planSnapshot() {
      if (!this.approvalData || !this.approvalData.metadata) {
        return null
      }
      return this.approvalData.metadata.planSnapshot
    },

    // 审计轨迹
    auditTrail() {
      if (!this.approvalData || !this.approvalData.metadata ||
          !this.approvalData.metadata.auditTrail) {
        return []
      }
      // 按时间倒序排列（最新的在前）
      return [...this.approvalData.metadata.auditTrail].sort((a, b) => {
        return new Date(b.timestamp) - new Date(a.timestamp)
      })
    },

    // 当前状态
    previousStatusText() {
      const status = this.planData.status ||
                    (this.approvalData && this.approvalData.metadata && this.approvalData.metadata.previousStatus) || ''
      return this.getStatusText(status)
    },

    previousStatusType() {
      const status = this.planData.status ||
                    (this.approvalData && this.approvalData.metadata && this.approvalData.metadata.previousStatus) || ''
      return this.getStatusType(status)
    },

    // 目标状态
    targetStatusText() {
      const status = (this.approvalData && this.approvalData.requestedAction) ||
                    (this.approvalData && this.approvalData.metadata && this.approvalData.metadata.targetStatus) || ''
      return this.getStatusText(status)
    },

    targetStatusType() {
      const status = (this.approvalData && this.approvalData.requestedAction) ||
                    (this.approvalData && this.approvalData.metadata && this.approvalData.metadata.targetStatus) || ''
      return this.getStatusType(status)
    },

    // 审批状态
    approvalStatusText() {
      return this.getApprovalStatusLabel(this.approvalData.status) || '-'
    },

    approvalStatusType() {
      const statusTypeMap = {
        'PENDING': 'warning',
        'APPROVED': 'success',
        'REJECTED': 'danger',
        'CANCELLED': 'info'
      }
      return statusTypeMap[this.approvalData.status] || 'info'
    }
  },
  methods: {
    /**
     * 格式化日期时间
     */
    formatDateTime(dateTimeStr) {
      if (!dateTimeStr) return '-'
      try {
        const date = new Date(dateTimeStr)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hour = String(date.getHours()).padStart(2, '0')
        const minute = String(date.getMinutes()).padStart(2, '0')
        const second = String(date.getSeconds()).padStart(2, '0')
        return `${year}-${month}-${day} ${hour}:${minute}:${second}`
      } catch (error) {
        console.error('日期格式化失败:', error)
        return dateTimeStr
      }
    },

    /**
     * 获取状态文本
     */
    getStatusText(status) {
      return this.getPlanStatusLabel(status) || '-'
    },

    /**
     * 获取状态类型
     */
    getStatusType(status) {
      return PLAN_STATUS_TYPE_MAP[status] || 'info'
    },

    /**
     * 获取明细项状态文本
     */
    getItemStatusText(status) {
      return this.getPlanItemStatusLabel(status) || '-'
    },

    /**
     * 获取明细项状态类型
     */
    getItemStatusType(status) {
      const typeMap = {
        'READY_FOR_SCHEDULING': 'info',
        'IN_PROGRESS': 'warning',
        'COMPLETED': 'success',
        'CANCELLED': 'danger'
      }
      return typeMap[status] || 'info'
    },

    /**
     * 获取审计操作文本
     */
    getAuditActionText(action) {
      const actionMap = {
        'SUBMIT': '提交审批',
        'APPROVE': '批准',
        'REJECT': '驳回',
        'CANCEL': '取消'
      }
      return actionMap[action] || action
    },

    /**
     * 获取审计操作标签类型
     */
    getAuditActionTagType(action) {
      const typeMap = {
        'SUBMIT': 'info',
        'APPROVE': 'success',
        'REJECT': 'danger',
        'CANCEL': 'warning'
      }
      return typeMap[action] || 'info'
    },

    /**
     * 获取审计操作时间线类型
     */
    getAuditActionType(action) {
      const typeMap = {
        'SUBMIT': 'primary',
        'APPROVE': 'success',
        'REJECT': 'danger',
        'CANCEL': 'warning'
      }
      return typeMap[action] || 'primary'
    }
  }
}
</script>

<style lang="scss" scoped>
.approval-info-card {
  .approval-info {
    margin-bottom: 16px;
  }

  .product-name {
    font-weight: 500;
    color: #303133;
  }

  .product-code {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
  }

  .user-name {
    font-weight: 500;
    color: #303133;
  }

  .user-email {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
  }

  .decision-remarks {
    color: #606266;
    line-height: 1.6;
  }

  .audit-trail-collapse,
  .plan-snapshot-collapse {
    margin-bottom: 16px;

    .audit-record {
      .audit-action {
        margin-bottom: 8px;
      }

      .audit-operator {
        font-size: 14px;
        color: #606266;
        margin-bottom: 4px;

        .operator-ip {
          color: #909399;
          font-size: 12px;
        }
      }

      .audit-remarks {
        font-size: 13px;
        color: #909399;
        margin-top: 4px;
        padding-left: 8px;
        border-left: 2px solid #e4e7ed;
      }
    }

    .plan-items {
      margin-top: 16px;

      .plan-items-title {
        font-size: 14px;
        font-weight: 500;
        color: #303133;
        margin-bottom: 8px;
      }
    }
  }
}

::v-deep .el-collapse-item__header {
  font-weight: 500;
  color: #303133;
}

::v-deep .el-timeline-item__timestamp {
  font-size: 12px;
}
</style>

