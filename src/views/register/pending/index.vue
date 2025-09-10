/**
 * 待审批申请列表页面
 * 功能描述：为管理员提供查看和管理待审批注册申请的界面
 * 创建日期：2024-12-23
 */
<template>
  <div class="pending-applications">
    <!-- 统计数据展示 -->
    <div class="stats-section">
      <application-stats
        :date-range="statsDateRange"
        :auto-load="true"
        :refresh-interval="300000"
        @stats-loaded="handleStatsLoaded"
        @stats-error="handleStatsError"
      />
    </div>

    <!-- 搜索表单 -->
    <search-form :loading="loading" @search="handleSearch" @reset="handleReset" />

    <!-- 申请列表表格 -->
    <ApplicationTable
      :data="tableData"
      :loading="loading"
      :total="total"
      :page="pagination.page"
      :limit="pagination.limit"
      @pagination-change="handlePaginationChange"
      @sort-change="handleSortChange"
      @selection-change="handleSelectionChange"
      @refresh="fetchList"
      @view="handleView"
      @approve="handleApprove"
      @reject="handleReject"
      @batch-approve="handleBatchApprove"
      @batch-reject="handleBatchReject"
    />

    <!-- 拒绝申请对话框 -->
    <el-dialog
      :title="rejectDialog.title"
      :visible.sync="rejectDialog.visible"
      width="500px"
      :close-on-click-modal="false"
      @close="resetRejectionForm"
    >
      <div class="reject-form">
        <p v-if="rejectDialog.isBatch" style="margin-bottom: 10px; color: #E6A23C;">
          确定要拒绝选中的 {{ selectedRows.length }} 个申请吗？
        </p>
        <p class="reject-form-label">拒绝理由：</p>
        <el-input
          v-model="rejectionForm.reason"
          type="textarea"
          :rows="3"
          placeholder="请输入拒绝理由"
          maxlength="500"
          show-word-limit
        />
        <p class="reject-form-label" style="margin-top: 15px">审批备注（可选）：</p>
        <el-input
          v-model="rejectionForm.notes"
          type="textarea"
          :rows="2"
          placeholder="请输入审批备注（可选）"
          maxlength="500"
          show-word-limit
        />
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="rejectDialog.visible = false">取 消</el-button>
        <el-button type="primary" @click="confirmReject">确定拒绝</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import SearchForm from './components/SearchForm.vue'
import ApplicationTable from './components/ApplicationTable.vue'
import ApplicationStats from '../components/ApplicationStats.vue'
import {
  getPendingApplications,
  approveApplication,
  rejectApplication,
  batchApproveApplications,
  batchRejectApplications,
  handleRegistrationError
} from '../api/register'

export default {
  name: 'PendingApplications',
  components: {
    SearchForm,
    ApplicationTable,
    ApplicationStats
  },
  data() {
    return {
      // 表格数据
      tableData: [],
      total: 0,
      loading: false,

      // 分页参数
      pagination: {
        page: 1,
        limit: 10
      },

      // 搜索参数
      searchParams: {
        search: '',
        departmentId: '',
        startDate: '',
        endDate: ''
      },

      // 排序参数
      sortParams: {
        sortBy: 'createdAt',
        sortOrder: 'DESC'
      },

      // 选中的行数据
      selectedRows: [],

      // 拒绝表单
      rejectionForm: {
        reason: '',
        notes: ''
      },

      // 拒绝申请对话框
      rejectDialog: {
        visible: false,
        title: '',
        isBatch: false,
        target: null // 单个拒绝时的目标行
      },

      // 统计数据相关
      statsDateRange: 'month' // 默认显示本月统计
    }
  },
  created() {
    this.fetchList()
  },
  methods: {
    /**
     * 获取待审批申请列表
     */
    async fetchList() {
      this.loading = true
      try {
        const params = {
          page: this.pagination.page,
          limit: this.pagination.limit,
          ...this.searchParams,
          ...this.sortParams
        }

        const response = await getPendingApplications(params)

        // 直接使用response.data中的数据
        const responseData = response.data

        this.tableData = responseData.applications || []

        // 分页信息处理
        const pagination = responseData.pagination || {}
        this.total = pagination.total || 0
      } catch (error) {
        console.error('获取待审批申请列表失败:', error)
        handleRegistrationError(error, {
          showMessage: true,
          defaultMessage: '获取待审批申请列表失败，请稍后重试'
        })
        this.tableData = []
        this.total = 0
      } finally {
        this.loading = false
      }
    },

    /**
       * 处理搜索
     * @param {Object} formData - 搜索表单数据
     */
    handleSearch(formData) {
      console.log('搜索参数:', formData)

      // 处理日期范围
      if (formData.dateRange && formData.dateRange.length === 2) {
        formData.startDate = formData.dateRange[0]
        formData.endDate = formData.dateRange[1]
      }
      delete formData.dateRange

      // 清理空值参数
      const cleanParams = {}
      Object.keys(formData).forEach(key => {
        if (formData[key] !== '' && formData[key] !== null && formData[key] !== undefined) {
          cleanParams[key] = formData[key]
        }
      })

      this.searchParams = cleanParams
      this.pagination.page = 1
      this.fetchList()
    },

    /**
     * 处理重置
     */
    handleReset() {
      this.searchParams = {
        search: '',
        departmentId: '',
        startDate: '',
        endDate: ''
      }
      this.pagination.page = 1
      this.fetchList()
    },

    /**
     * 处理分页变化
     */
    handlePaginationChange({ page, limit }) {
      this.pagination.page = page
      this.pagination.limit = limit
      this.fetchList()
    },

    /**
     * 处理排序变化
     * @param {Object} sortInfo - 排序信息 { prop, order }
     */
    handleSortChange(sortInfo) {
      console.log('排序变化:', sortInfo)

      if (sortInfo.prop && sortInfo.order) {
        this.sortParams.sortBy = sortInfo.prop
        this.sortParams.sortOrder = sortInfo.order === 'ascending' ? 'ASC' : 'DESC'
      } else {
        // 清除排序
        this.sortParams.sortBy = 'createdAt'
        this.sortParams.sortOrder = 'DESC'
      }

      this.pagination.page = 1
      this.fetchList()
    },

    /**
       * 处理批量选择变化
     * @param {Array} selection - 选中的行数据
     */
    handleSelectionChange(selection) {
      console.log('批量选择变化:', selection)
      this.selectedRows = selection
    },

    /**
       * 处理查看详情
     * @param {Object} row - 申请记录
     */
    handleView(row) {
      // 跳转到申请状态查询页面查看详情
      this.$router.push({
        name: 'RegisterStatus',
        query: { id: row.id }
      })
    },

    /**
     * 处理批准申请
     * @param {Object} row - 申请记录
     */
    async handleApprove(row) {
      try {
        // 弹出确认对话框，支持添加审批备注
        const { value: notes } = await this.$prompt(
          '请输入审批备注（可选）：',
          `批准申请 - ${row.applicantName}`,
          {
            confirmButtonText: '确定批准',
            cancelButtonText: '取消',
            inputType: 'textarea',
            inputPlaceholder: '请输入审批备注（可选）',
            type: 'info',
            showCancelButton: true,
            closeOnClickModal: false,
            inputValidator: (value) => {
              if (value && value.length > 500) {
                return '审批备注不能超过500个字符'
              }
              return true
            }
          }
        )

        // 设置加载状态
        this.$set(row, 'approving', true)

        // 调用批准接口
        const response = await approveApplication(row.id, { notes })

        this.$message.success(response.message || '申请批准成功')
        this.fetchList()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('批准申请失败:', error)
          handleRegistrationError(error, {
            showMessage: true,
            defaultMessage: '批准申请失败'
          })
        }
      } finally {
        this.$set(row, 'approving', false)
      }
    },

    /**
     * 处理拒绝申请
     * @param {Object} row - 申请记录
     */
    handleReject(row) {
      this.resetRejectionForm()
      this.rejectDialog.title = `拒绝申请 - ${row.applicantName || row.applicant?.name || '未知申请人'}`
      this.rejectDialog.isBatch = false
      this.rejectDialog.target = row
      this.rejectDialog.visible = true
    },

    /**
     * 处理批量批准申请
     * @param {Array} selectedRows - 选中的申请记录
     */
    async handleBatchApprove(selectedRows) {
      if (!selectedRows || selectedRows.length === 0) {
        this.$message.warning('请先选择要批准的申请')
        return
      }

      try {
        // 弹出确认对话框
        const { value: notes } = await this.$prompt(
          `确定要批准选中的 ${selectedRows.length} 个申请吗？\n\n请输入审批备注（可选）：`,
          '批量批准申请',
          {
            confirmButtonText: '确定批准',
            cancelButtonText: '取消',
            inputType: 'textarea',
            inputPlaceholder: '请输入审批备注（可选）',
            type: 'warning',
            showCancelButton: true,
            closeOnClickModal: false,
            inputValidator: (value) => {
              if (value && value.length > 500) {
                return '审批备注不能超过500个字符'
              }
              return true
            }
          }
        )

        // 提取申请ID
        const applicationIds = selectedRows.map(row => row.id)

        // 调用批量批准接口
        const response = await batchApproveApplications({
          applicationIds,
          notes: notes || ''
        })

        this.$message.success(response.message || `成功批准 ${selectedRows.length} 个申请`)
        this.fetchList()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('批量批准申请失败:', error)
          handleRegistrationError(error, {
            showMessage: true,
            defaultMessage: '批量批准申请失败'
          })
        }
      }
    },

    /**
     * 处理批量拒绝申请
     * @param {Array} selectedRows - 选中的申请记录
     */
    handleBatchReject(selectedRows) {
      if (!selectedRows || selectedRows.length === 0) {
        this.$message.warning('请先选择要拒绝的申请')
        return
      }
      this.resetRejectionForm()
      this.rejectDialog.title = `批量拒绝申请 (${selectedRows.length}个)`
      this.rejectDialog.isBatch = true
      this.rejectDialog.target = selectedRows
      this.rejectDialog.visible = true
    },

    /**
     * 确认拒绝操作
     */
    async confirmReject() {
      if (!this.rejectionForm.reason || this.rejectionForm.reason.trim().length === 0) {
        this.$message.error('拒绝理由不能为空')
        return
      }

      const { reason, notes } = this.rejectionForm
      const { isBatch, target } = this.rejectDialog

      if (isBatch) {
        // 批量拒绝
        const applicationIds = target.map(row => row.id)
        try {
          const response = await batchRejectApplications({ applicationIds, reason, notes })
          this.$message.success(response.message || `成功拒绝 ${target.length} 个申请`)
          this.fetchList()
        } catch (error) {
          console.error('批量拒绝申请失败:', error)
          handleRegistrationError(error, {
            showMessage: true,
            defaultMessage: '批量拒绝申请失败'
          })
        }
      } else {
        // 单个拒绝
        const row = target
        this.$set(row, 'rejecting', true)
        try {
          const response = await rejectApplication(row.id, { reason, notes })
          this.$message.success(response.message || '申请已拒绝')
          this.fetchList()
        } catch (error) {
          console.error('拒绝申请失败:', error)
          handleRegistrationError(error, {
            showMessage: true,
            defaultMessage: '拒绝申请失败'
          })
        } finally {
          this.$set(row, 'rejecting', false)
        }
      }

      this.rejectDialog.visible = false
    },

    /**
     * 重置拒绝表单
     */
    resetRejectionForm() {
      this.rejectionForm.reason = ''
      this.rejectionForm.notes = ''
    },

    /**
     * 处理统计数据加载完成事件
     * @param {Object} data - 统计数据
     */
    handleStatsLoaded(data) {
      console.log('统计数据加载完成:', data)
      // 可以在这里处理统计数据，比如更新页面标题等
    },

    /**
     * 处理统计数据加载错误事件
     * @param {Object} error - 错误信息
     */
    handleStatsError(error) {
      console.error('统计数据加载失败:', error)
      // 统计数据加载失败不影响主要功能，只记录日志
    }
  }
}
</script>

<style lang="scss" scoped>
.pending-applications {
  padding: 20px;

  .stats-section {
    margin-bottom: 24px;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #e9ecef;
  }

  .search-form {
    margin-bottom: 20px;
  }
}

// 拒绝申请表单样式
.reject-form-label {
  font-weight: 500;
  margin-bottom: 8px;
  color: #303133;
}
</style>
