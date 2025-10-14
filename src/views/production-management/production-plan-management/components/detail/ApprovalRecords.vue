/**
 * 文件名称：ApprovalRecords.vue
 * 文件描述：生产计划审批记录组件
 * 创建日期：2025-01-21
 * 修改记录：
 *   - 2025-01-21: 初始创建
 *   - 2025-01-21: 扩展P0阶段功能 - 添加筛选、详情展开、撤销审批
 */

<template>
  <div class="approval-records">
    <!-- 筛选栏 -->
    <div class="filter-bar">
      <el-form :inline="true" :model="filterForm" size="small">
        <el-form-item label="审批状态">
          <el-select
            v-model="filterForm.status"
            placeholder="全部"
            clearable
            style="width: 150px"
            @change="handleFilterChange"
          >
            <el-option
              v-for="option in approvalStatusOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="fetchApprovals">
            查询
          </el-button>
          <el-button icon="el-icon-refresh" @click="handleReset">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 审批记录表格 -->
    <el-table
      v-loading="loading"
      :data="approvalList"
      border
      stripe
    >
      <!-- 展开行 -->
      <el-table-column type="expand">
        <template slot-scope="{ row }">
          <div class="expand-detail">
            <el-descriptions :column="2" border size="small">
              <el-descriptions-item label="审批ID">
                {{ row.id }}
              </el-descriptions-item>
              <el-descriptions-item label="资源类型">
                {{ row.resourceType || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="资源ID">
                {{ row.resourceId || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="请求的操作">
                {{ getActionText(row.requestedAction) }}
              </el-descriptions-item>
              <el-descriptions-item label="申请人ID">
                {{ row.requesterId || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="申请人姓名">
                {{ row.requesterName || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="审批人ID">
                {{ row.approverId || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="审批人姓名">
                {{ row.approverName || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="提交时间">
                {{ formatTime(row.requestedAt) }}
              </el-descriptions-item>
              <el-descriptions-item label="审批决定时间">
                {{ formatTime(row.decidedAt) }}
              </el-descriptions-item>
              <el-descriptions-item label="审批意见">
                {{ row.decisionRemarks || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="审批说明" :span="2">
                {{ row.remarks || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="要求的权限" :span="2">
                <template v-if="row.requiredPermissions && row.requiredPermissions.length > 0">
                  <el-tag
                    v-for="(permission, index) in row.requiredPermissions"
                    :key="index"
                    size="mini"
                    style="margin: 2px"
                  >
                    {{ permission }}
                  </el-tag>
                </template>
                <span v-else>-</span>
              </el-descriptions-item>
              <el-descriptions-item label="元数据" :span="2">
                <pre class="metadata-pre">{{ formatMetadata(row.metadata) }}</pre>
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </template>
      </el-table-column>

      <el-table-column
        prop="requestedAction"
        label="请求的操作"
        width="120"
        align="center"
      >
        <template slot-scope="{ row }">
          {{ getActionText(row.requestedAction) }}
        </template>
      </el-table-column>

      <el-table-column
        prop="status"
        label="审批状态"
        width="120"
        align="center"
      >
        <template slot-scope="{ row }">
          <el-tag :type="getStatusType(row.status)" size="small">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column
        prop="requesterName"
        label="申请人"
        width="120"
      >
        <template slot-scope="{ row }">
          {{ row.requesterName || '-' }}
        </template>
      </el-table-column>

      <el-table-column
        prop="remarks"
        label="申请说明"
        min-width="150"
        show-overflow-tooltip
      >
        <template slot-scope="{ row }">
          {{ row.remarks || '-' }}
        </template>
      </el-table-column>

      <el-table-column
        prop="decisionRemarks"
        label="审批意见"
        min-width="150"
        show-overflow-tooltip
      >
        <template slot-scope="{ row }">
          {{ row.decisionRemarks || '-' }}
        </template>
      </el-table-column>

      <el-table-column
        label="创建时间"
        width="160"
      >
        <template slot-scope="{ row }">
          {{ formatTime(row.createdAt) }}
        </template>
      </el-table-column>

      <el-table-column
        label="操作"
        width="200"
        align="center"
        fixed="right"
      >
        <template slot-scope="{ row }">
          <!-- 批准按钮 -->
          <el-button
            v-if="canApproveApproval(row)"
            type="text"
            size="small"
            style="color: #67C23A"
            @click="handleApprove(row)"
          >
            批准
          </el-button>
          <!-- 驳回按钮 -->
          <el-button
            v-if="canRejectApproval(row)"
            type="text"
            size="small"
            style="color: #F56C6C"
            @click="handleReject(row)"
          >
            驳回
          </el-button>
          <!-- 取消按钮 -->
          <el-button
            v-if="canCancelApproval(row)"
            type="text"
            size="small"
            style="color: #E6A23C"
            @click="handleCancel(row)"
          >
            取消
          </el-button>
          <span v-if="!canApproveApproval(row) && !canRejectApproval(row) && !canCancelApproval(row)">-</span>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-if="totalResults > 0"
      :current-page="pagination.page"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="pagination.limit"
      :total="totalResults"
      layout="total, sizes, prev, pager, next, jumper"
      style="margin-top: 16px; text-align: right"
      @size-change="handleSizeChange"
      @current-change="handlePageChange"
    />

    <!-- 空状态 -->
    <el-empty
      v-if="!loading && (!approvalList || approvalList.length === 0)"
      description="暂无审批记录"
      :image-size="100"
    />

    <!-- 批准审批对话框 -->
    <approval-approve-dialog
      ref="approveDialog"
      :plan-data="planData"
      @success="handleApprovalSuccess"
    />

    <!-- 驳回审批对话框 -->
    <approval-reject-dialog
      ref="rejectDialog"
      :plan-data="planData"
      @success="handleApprovalSuccess"
    />

    <!-- 取消审批对话框 -->
    <approval-cancel-dialog
      ref="cancelDialog"
      :plan-data="planData"
      @success="handleApprovalSuccess"
    />
  </div>
</template>

<script>
import { parseTime } from '@/utils'
import { fetchApprovalRequests } from '../../api'
import {
  APPROVAL_STATUS_MAP,
  APPROVAL_STATUS_TYPE_MAP,
  APPROVAL_STATUS_OPTIONS
} from '../../constants'
import ApprovalApproveDialog from '../ApprovalApproveDialog.vue'
import ApprovalRejectDialog from '../ApprovalRejectDialog.vue'
import ApprovalCancelDialog from '../ApprovalCancelDialog.vue'

export default {
  name: 'ApprovalRecords',
  components: {
    ApprovalApproveDialog,
    ApprovalRejectDialog,
    ApprovalCancelDialog
  },
  props: {
    planId: {
      type: String,
      required: true
    },
    planData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      loading: false,
      approvalList: [],
      totalResults: 0,
      // 筛选条件
      filterForm: {
        status: ''
      },
      // 分页参数
      pagination: {
        page: 1,
        limit: 10
      },
      // 审批状态选项
      approvalStatusOptions: APPROVAL_STATUS_OPTIONS,
      // 操作类型映射
      actionMap: {
        RELEASED: '下达',
        CANCELLED: '取消',
        CONFIRMED: '确认',
        ADJUST: '调整',
        SPLIT: '拆分',
        MERGE: '合并'
      }
    }
  },
  computed: {
    // 获取当前用户ID（模拟，实际应从Vuex store获取）
    currentUserId() {
      // TODO: 从Vuex store获取当前登录用户ID
      return this.$store.state.user?.id || null
    }
  },
  watch: {
    planId: {
      handler(newVal) {
        if (newVal) {
          this.fetchApprovals()
        }
      },
      immediate: true
    }
  },
  methods: {
    /**
     * 加载审批记录
     */
    async fetchApprovals() {
      if (!this.planId) return

      try {
        this.loading = true

        const params = {
          page: this.pagination.page,
          limit: this.pagination.limit
        }

        // 添加状态筛选
        if (this.filterForm.status) {
          params.status = this.filterForm.status
        }

        const response = await fetchApprovalRequests(this.planId, params)

        // API 返回的字段是 approvals，不是 results
        if (response.data) {
          const approvals = response.data.approvals || []

          // 调试日志：检查后端是否返回 metadata
          if (approvals.length > 0) {
            console.log('📋 审批记录示例数据:', approvals[0])
            console.log('📋 metadata字段:', approvals[0].metadata)
          }

          // 处理数据，将 requester 和 approver 对象展开
          this.approvalList = approvals.map(approval => {
            // 使用后端返回的 metadata，或构建默认值
            const metadata = approval.metadata || {}

            // 补充缺失的 metadata 字段
            if (!metadata.planNumber) {
              metadata.planNumber = (this.planData && this.planData.planNumber) || ''
            }
            if (!metadata.targetStatus) {
              // 目标状态就是 requestedAction
              metadata.targetStatus = approval.requestedAction || ''
            }
            if (!metadata.previousStatus) {
              // previousStatus 推断逻辑：
              // 对于待审批的请求，previousStatus 应该是提交审批前的状态
              // 通常：下达操作的 previousStatus 是 CONFIRMED
              //       取消操作的 previousStatus 可能是 CONFIRMED、RELEASED 等
              // 如果当前计划状态是 PENDING_APPROVAL，说明审批未处理，可以推断
              if (this.planData && this.planData.status === 'PENDING_APPROVAL') {
                // 根据目标状态推断原始状态
                if (approval.requestedAction === 'RELEASED') {
                  metadata.previousStatus = 'CONFIRMED'
                } else if (approval.requestedAction === 'CANCELLED') {
                  metadata.previousStatus = 'CONFIRMED' // 通常是从已确认状态取消
                } else {
                  metadata.previousStatus = ''
                }
              } else {
                // 如果计划状态已经不是 PENDING_APPROVAL，说明审批已处理
                // 无法准确推断 previousStatus，保持为空
                metadata.previousStatus = ''
              }
            }

            return {
              ...approval,
              requesterName: approval.requester ? approval.requester.name : '-',
              approverName: approval.approver ? approval.approver.name : '-',
              // 添加默认的 requiredPermissions（如果后端没有返回）
              requiredPermissions: approval.requiredPermissions || ['prod.production-plan.approval'],
              metadata
            }
          })

          // 分页信息
          const pagination = response.data.pagination || {}
          this.totalResults = pagination.total || 0
        } else {
          this.approvalList = []
          this.totalResults = 0
        }
      } catch (error) {
        console.error('加载审批记录失败:', error)
        this.approvalList = []
        this.totalResults = 0
      } finally {
        this.loading = false
      }
    },

    /**
     * 筛选条件变更
     */
    handleFilterChange() {
      this.pagination.page = 1
      this.fetchApprovals()
    },

    /**
     * 重置筛选条件
     */
    handleReset() {
      this.filterForm = {
        status: ''
      }
      this.pagination.page = 1
      this.fetchApprovals()
    },

    /**
     * 分页大小变更
     */
    handleSizeChange(size) {
      this.pagination.limit = size
      this.pagination.page = 1
      this.fetchApprovals()
    },

    /**
     * 页码变更
     */
    handlePageChange(page) {
      this.pagination.page = page
      this.fetchApprovals()
    },

    /**
     * 判断是否可以批准审批
     */
    canApproveApproval(row) {
      // 待审批状态且不是申请人本人
      return row.status === 'PENDING' && row.requesterId !== this.currentUserId
    },

    /**
     * 判断是否可以驳回审批
     */
    canRejectApproval(row) {
      // 待审批状态且不是申请人本人
      return row.status === 'PENDING' && row.requesterId !== this.currentUserId
    },

    /**
     * 判断是否可以取消审批
     */
    canCancelApproval(row) {
      // 只有待审批状态且为申请人本人时可取消
      return row.status === 'PENDING' && row.requesterId === this.currentUserId
    },

    /**
     * 批准审批
     */
    handleApprove(row) {
      this.$refs.approveDialog.open(row)
    },

    /**
     * 驳回审批
     */
    handleReject(row) {
      this.$refs.rejectDialog.open(row)
    },

    /**
     * 取消审批
     */
    handleCancel(row) {
      this.$refs.cancelDialog.open(row)
    },

    /**
     * 审批操作成功后的处理
     */
    handleApprovalSuccess() {
      this.fetchApprovals()
      this.$emit('approval-processed')
    },

    /**
     * 获取状态文本
     */
    getStatusText(status) {
      return APPROVAL_STATUS_MAP[status] || status || '-'
    },

    /**
     * 获取状态类型
     */
    getStatusType(status) {
      return APPROVAL_STATUS_TYPE_MAP[status] || 'info'
    },

    /**
     * 获取操作类型文本
     */
    getActionText(action) {
      return this.actionMap[action] || action || '-'
    },

    /**
     * 格式化时间
     */
    formatTime(time) {
      return time ? parseTime(time, '{y}-{m}-{d} {h}:{i}') : '-'
    },

    /**
     * 格式化元数据
     */
    formatMetadata(metadata) {
      if (!metadata) return '-'
      try {
        return JSON.stringify(metadata, null, 2)
      } catch (error) {
        return String(metadata)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.approval-records {
  .filter-bar {
    margin-bottom: 16px;
    padding: 16px;
    background-color: #f5f7fa;
    border-radius: 4px;
  }

  .expand-detail {
    padding: 16px;
    background-color: #f9fafc;

    .metadata-pre {
      max-height: 300px;
      overflow: auto;
      padding: 8px;
      background-color: #f5f7fa;
      border-radius: 4px;
      font-size: 12px;
      line-height: 1.5;
      color: #606266;
    }
  }

  .time-info {
    font-size: 12px;
    color: #909399;
    line-height: 1.5;

    div {
      margin: 2px 0;
    }
  }
}
</style>

