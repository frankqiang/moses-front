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
              <el-descriptions-item label="审批时间">
                {{ formatTime(row.approvedAt) }}
              </el-descriptions-item>
              <el-descriptions-item label="审批意见">
                {{ row.decisionRemarks || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="审批说明" :span="2">
                {{ row.remarks || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="要求的权限" :span="2">
                <el-tag
                  v-for="(permission, index) in row.requiredPermissions"
                  :key="index"
                  size="mini"
                  style="margin: 2px"
                >
                  {{ permission }}
                </el-tag>
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
        label="审批说明"
        min-width="180"
        show-overflow-tooltip
      >
        <template slot-scope="{ row }">
          {{ row.remarks || '-' }}
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
        width="120"
        align="center"
        fixed="right"
      >
        <template slot-scope="{ row }">
          <el-button
            v-if="canCancelApproval(row)"
            type="text"
            size="small"
            @click="handleCancelApproval(row)"
          >
            撤销审批
          </el-button>
          <span v-else>-</span>
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
  </div>
</template>

<script>
import { parseTime } from '@/utils'
import { fetchApprovalRequests, updatePlanStatus } from '../../api'
import {
  APPROVAL_STATUS_MAP,
  APPROVAL_STATUS_TYPE_MAP,
  APPROVAL_STATUS_OPTIONS
} from '../../constants'
import { getErrorMessage } from '../../constants'

export default {
  name: 'ApprovalRecords',
  props: {
    planId: {
      type: String,
      required: true
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

        if (response.success && response.data) {
          this.approvalList = response.data.results || []
          this.totalResults = response.data.totalResults || 0
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
     * 判断是否可以撤销审批
     */
    canCancelApproval(row) {
      // 只有待审批状态且为申请人本人时可撤销
      return row.status === 'PENDING' && row.requesterId === this.currentUserId
    },

    /**
     * 撤销审批
     */
    async handleCancelApproval(row) {
      try {
        await this.$confirm('确定要撤销此审批申请吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        this.loading = true

        // 调用状态更新接口，将状态从PENDING_APPROVAL改回CONFIRMED
        const response = await updatePlanStatus(this.planId, {
          targetStatus: 'CONFIRMED',
          changeDescription: '撤销审批申请'
        })

        if (response.success) {
          this.$message.success(response.message || '撤销审批成功')
          this.fetchApprovals()
          this.$emit('approval-cancelled')
        } else {
          this.$message.error(response.message || '撤销审批失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('撤销审批失败:', error)
          const errorMessage = getErrorMessage(error)
          this.$message.error(errorMessage)
        }
      } finally {
        this.loading = false
      }
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

