/**
 * 文件名称：ApprovalRecords.vue
 * 文件描述：生产计划审批记录组件
 * 创建日期：2025-01-21
 * 修改记录：
 *   - 2025-01-21: 初始创建
 *   - 2025-01-21: 扩展P0阶段功能 - 添加筛选、详情展开、撤销审批
 *   - 2025-10-17: 根据新接口文档验证，确保符合审批记录查询接口规范
 *   - 2025-10-17: 重构组件，完全符合新接口文档规范
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
              <el-descriptions-item label="审批状态">
                <el-tag :type="getStatusType(row.status)" size="small">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="申请人">
                <div v-if="row.requester">
                  <div>{{ row.requester.name }}</div>
                  <div style="font-size: 12px; color: #909399;">{{ row.requester.email }}</div>
                </div>
                <span v-else>-</span>
              </el-descriptions-item>
              <el-descriptions-item label="申请人ID">
                {{ row.requesterId || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="审批人">
                <div v-if="row.approver">
                  <div>{{ row.approver.name }}</div>
                  <div style="font-size: 12px; color: #909399;">{{ row.approver.email }}</div>
                </div>
                <span v-else>-</span>
              </el-descriptions-item>
              <el-descriptions-item label="审批人ID">
                {{ row.approverId || '-' }}
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
              <el-descriptions-item label="申请说明" :span="2">
                {{ row.remarks || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="记录创建时间">
                {{ formatTime(row.createdAt) }}
              </el-descriptions-item>
              <el-descriptions-item label="记录更新时间">
                {{ formatTime(row.updatedAt) }}
              </el-descriptions-item>
              <el-descriptions-item label="元数据" :span="2">
                <pre v-if="row.metadata" class="metadata-pre">{{ formatMetadata(row.metadata) }}</pre>
                <span v-else>-</span>
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
        label="申请人"
        width="150"
      >
        <template slot-scope="{ row }">
          <div v-if="row.requester">
            <div>{{ row.requester.name }}</div>
            <div style="font-size: 12px; color: #909399;">{{ row.requester.email }}</div>
          </div>
          <span v-else>-</span>
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
        label="申请时间"
        width="160"
      >
        <template slot-scope="{ row }">
          {{ formatTime(row.requestedAt) }}
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
  APPROVAL_STATUS_TYPE_MAP
} from '../../constants'
import dictionaryMixin from '../../mixins/dictionary'
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
  mixins: [dictionaryMixin],
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
      // 审批状态选项 - 从字典mixin获取
      // approvalStatusOptions 通过 mixin 提供
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
  async created() {
    // 加载字典
    await this.loadProductionPlanDictionary()
  },
  methods: {
    /**
     * 加载审批记录
     *
     * 接口文档：GET /v1/prod/plans/:planId/approval/requests
     * 响应结构：
     * {
     *   data: {
     *     approvals: [...],  // 审批记录数组
     *     pagination: { total, page, limit, totalPages }
     *   }
     * }
     *
     * 响应字段说明：
     * - id: 审批申请唯一标识符（UUID）
     * - resourceType: 资源类型，固定为 'prod.production-plan'
     * - resourceId: 资源唯一标识符（生产计划ID）
     * - requestedAction: 申请的目标动作/状态（如 RELEASED、CANCELLED 等）
     * - status: 审批状态（PENDING、APPROVED、REJECTED、CANCELLED、WITHDRAWN、EXPIRED）
     * - requesterId: 申请人用户ID
     * - approverId: 审批人用户ID（如果已决策）
     * - requestedAt: 申请提交时间（ISO 8601格式）
     * - decidedAt: 审批决策时间（ISO 8601格式，待审批时为 null）
     * - remarks: 申请备注/说明
     * - decisionRemarks: 审批意见/决策说明（待审批时为 null）
     * - metadata: 扩展上下文信息（JSON对象，包含计划号、产品编码等）
     * - requester: 申请人信息对象 { id, name, email }
     * - approver: 审批人信息对象 { id, name, email }（待审批时为 null）
     */
    async fetchApprovals() {
      if (!this.planId) {
        console.warn('⚠️ fetchApprovals: planId 为空，跳过查询')
        return
      }

      try {
        this.loading = true

        const params = {
          page: this.pagination.page,
          limit: this.pagination.limit,
          sortBy: 'requestedAt:desc' // 按提交时间倒序，最新的在前面
        }

        // 添加状态筛选
        if (this.filterForm.status) {
          params.status = this.filterForm.status
        }
        // 📢 如果未选择筛选条件，不传 status 参数表示查询所有状态

        console.log('🔍 查询审批记录:', {
          planId: this.planId,
          params: params
        })

        const response = await fetchApprovalRequests(this.planId, params)

        console.log('📥 审批记录响应:', {
          fullResponse: response,
          data: response.data,
          approvals: response.data?.approvals,
          approvalsLength: response.data?.approvals?.length,
          pagination: response.data?.pagination
        })

        // 处理响应数据
        if (response.data) {
          // 直接使用后端返回的审批记录数组，不做额外处理
          this.approvalList = response.data.approvals || []

          // 分页信息
          const pagination = response.data.pagination || {}
          this.totalResults = pagination.total || 0

          console.log('✅ 审批记录加载成功:', {
            列表数量: this.approvalList.length,
            总记录数: this.totalResults,
            审批记录: this.approvalList
          })
        } else {
          console.warn('⚠️ 响应中没有 data 字段')
          this.approvalList = []
          this.totalResults = 0
        }
      } catch (error) {
        console.error('❌ 加载审批记录失败:', error)
        console.error('错误详情:', {
          message: error.message,
          response: error.response,
          config: error.config
        })
        this.approvalList = []
        this.totalResults = 0
        this.$message.error(error.message || '加载审批记录失败')
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
      return this.getApprovalStatusLabel(status) || status || '-'
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

