/**
 * 文件名称：detail.vue
 * 文件描述：生产计划详情页面
 * 创建日期：2025-01-21
 * 修改记录：
 *   - 2025-01-21: 初始创建，实现P0阶段核心功能
 */

<template>
  <div class="production-plan-detail">
    <!-- 页面头部 -->
    <div class="detail-header">
      <el-page-header :content="pageTitle" @back="handleBack" />
      <div class="header-actions">
        <el-button icon="el-icon-refresh" @click="handleRefresh">刷新</el-button>
        <el-button
          v-if="canChangeStatus"
          type="primary"
          icon="el-icon-refresh"
          @click="handleChangeStatus"
        >
          状态变更
        </el-button>
        <el-button
          v-if="canSubmitApproval"
          type="warning"
          icon="el-icon-s-promotion"
          @click="handleSubmitApproval"
        >
          提交审批
        </el-button>
        <el-button
          v-if="!editMode && !planData.isFrozen"
          type="primary"
          icon="el-icon-edit"
          @click="handleEdit"
        >
          编辑
        </el-button>
        <el-button
          v-if="editMode"
          type="primary"
          :loading="saveLoading"
          @click="handleSave"
        >
          保存
        </el-button>
        <el-button v-if="editMode" @click="handleCancelEdit">取消</el-button>
        <el-button
          v-if="canSplit"
          icon="el-icon-share"
          @click="handleSplit"
        >
          拆分
        </el-button>
        <el-button
          v-if="canAdjust"
          icon="el-icon-setting"
          @click="handleAdjust"
        >
          调整
        </el-button>
        <el-button
          v-if="canMerge"
          icon="el-icon-connection"
          @click="handleMerge"
        >
          合并
        </el-button>
        <el-button
          v-if="canEvaluate"
          icon="el-icon-data-analysis"
          @click="handleEvaluate"
        >
          可行性评估
        </el-button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-loading="loading" class="detail-content">
      <el-tabs v-model="activeTab" type="border-card">
        <!-- 基本信息Tab -->
        <el-tab-pane label="基本信息" name="basic">
          <basic-info
            ref="basicInfo"
            :plan-data="planData"
            :edit-mode="editMode"
            @update="handleUpdateBasicInfo"
          />
        </el-tab-pane>

        <!-- 子批次列表Tab -->
        <el-tab-pane label="子批次列表" name="items">
          <items-table
            :items="planData.items || []"
            :loading="loading"
          />
        </el-tab-pane>

        <!-- 变更日志Tab -->
        <el-tab-pane label="变更日志" name="changeLogs">
          <change-logs-timeline
            :change-logs="planData.changeLogs || []"
            :loading="loading"
          />
        </el-tab-pane>

        <!-- 审批记录Tab -->
        <el-tab-pane label="审批记录" name="approvals">
          <approval-records
            :plan-id="planId"
            :plan-data="planData"
            @approval-processed="handleApprovalProcessed"
          />
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 拆分对话框 -->
    <split-dialog
      ref="splitDialog"
      :plan-data="planData"
      @success="handleSplitSuccess"
    />

    <!-- 调整对话框 -->
    <adjust-dialog
      ref="adjustDialog"
      :plan-data="planData"
      @success="handleAdjustSuccess"
    />

    <!-- 合并对话框 -->
    <merge-dialog
      ref="mergeDialog"
      @success="handleMergeSuccess"
    />

    <!-- 状态变更对话框 -->
    <status-change-dialog
      ref="statusChangeDialog"
      @success="handleStatusChangeSuccess"
    />

    <!-- 审批提交对话框 -->
    <approval-submit-dialog
      ref="approvalSubmitDialog"
      @success="handleApprovalSubmitSuccess"
    />

    <!-- 可行性评估对话框 -->
    <feasibility-dialog
      ref="feasibilityDialog"
    />
  </div>
</template>

<script>
import BasicInfo from './components/detail/BasicInfo.vue'
import ItemsTable from './components/detail/ItemsTable.vue'
import ChangeLogsTimeline from './components/detail/ChangeLogsTimeline.vue'
import ApprovalRecords from './components/detail/ApprovalRecords.vue'
import AdjustDialog from './components/AdjustDialog.vue'
import SplitDialog from './components/SplitDialog.vue'
import MergeDialog from './components/MergeDialog.vue'
import StatusChangeDialog from './components/StatusChangeDialog.vue'
import ApprovalSubmitDialog from './components/ApprovalSubmitDialog.vue'
import FeasibilityDialog from './components/FeasibilityDialog.vue'
import { fetchPlanDetail, adjustPlan } from './api'
import { getErrorMessage } from './constants'

export default {
  name: 'ProductionPlanDetail',
  components: {
    BasicInfo,
    ItemsTable,
    ChangeLogsTimeline,
    ApprovalRecords,
    AdjustDialog,
    SplitDialog,
    MergeDialog,
    StatusChangeDialog,
    ApprovalSubmitDialog,
    FeasibilityDialog
  },
  data() {
    return {
      planId: '',
      planData: {
        items: [],
        changeLogs: []
      },
      loading: false,
      editMode: false,
      saveLoading: false,
      activeTab: 'basic',
      // 编辑前的备份数据
      originalData: null
    }
  },
  computed: {
    pageTitle() {
      return this.planData.planNumber ? `生产计划详情 - ${this.planData.planNumber}` : '生产计划详情'
    },
    canChangeStatus() {
      // 除已完成和已取消外的其他状态，且未冻结，可以进行状态变更
      const excludedStatuses = ['COMPLETED', 'CANCELLED']
      return !this.planData.isFrozen && !this.editMode && !excludedStatuses.includes(this.planData.status)
    },
    canSubmitApproval() {
      // 只有已确认状态且未冻结的计划可提交审批
      return !this.planData.isFrozen && !this.editMode && this.planData.status === 'CONFIRMED'
    },
    canSplit() {
      // 已冻结的计划不允许拆分，只有已确认或待排程状态的计划可拆分
      const allowedStatuses = ['CONFIRMED', 'READY_FOR_SCHEDULING']
      return !this.planData.isFrozen && !this.editMode && allowedStatuses.includes(this.planData.status)
    },
    canAdjust() {
      // 已冻结的计划不允许调整
      return !this.planData.isFrozen && !this.editMode
    },
    canMerge() {
      // 已冻结的计划不允许合并，只有已确认或待排程状态的计划可合并
      const allowedStatuses = ['CONFIRMED', 'READY_FOR_SCHEDULING']
      return !this.planData.isFrozen && !this.editMode && allowedStatuses.includes(this.planData.status)
    },
    canEvaluate() {
      // 已确认及之后的状态可以进行可行性评估
      const allowedStatuses = ['CONFIRMED', 'PENDING_APPROVAL', 'RELEASED', 'PARTIALLY_RELEASED', 'IN_PROGRESS']
      return !this.editMode && allowedStatuses.includes(this.planData.status)
    }
  },
  created() {
    this.planId = this.$route.params.id
    if (!this.planId) {
      this.$message.error('缺少计划ID参数')
      this.handleBack()
      return
    }
    this.fetchDetail()
  },
  methods: {
    /**
     * 加载计划详情
     */
    async fetchDetail() {
      try {
        this.loading = true
        const response = await fetchPlanDetail(this.planId)

        if (response.success && response.data) {
          this.planData = response.data
        } else {
          this.$message.error(response.message || '获取计划详情失败')
          this.handleBack()
        }
      } catch (error) {
        console.error('加载计划详情失败:', error)
        const errorMessage = getErrorMessage(error)
        this.$message.error(errorMessage)
        // 如果是404错误，返回列表页
        if (error.response?.status === 404) {
          this.handleBack()
        }
      } finally {
        this.loading = false
      }
    },

    /**
     * 刷新详情
     */
    async handleRefresh() {
      await this.fetchDetail()
      this.$message.success('刷新成功')
    },

    /**
     * 返回列表页
     */
    handleBack() {
      this.$router.push('/production-management/production-plan')
    },

    /**
     * 进入编辑模式
     */
    handleEdit() {
      if (this.planData.isFrozen) {
        this.$message.warning('计划已冻结，不允许编辑')
        return
      }
      // 备份原始数据
      this.originalData = JSON.parse(JSON.stringify(this.planData))
      this.editMode = true
    },

    /**
     * 取消编辑
     */
    handleCancelEdit() {
      // 恢复原始数据
      if (this.originalData) {
        this.planData = JSON.parse(JSON.stringify(this.originalData))
        this.originalData = null
      }
      this.editMode = false
    },

    /**
     * 保存编辑
     */
    async handleSave() {
      try {
        // 验证表单
        const valid = await this.$refs.basicInfo.validate()
        if (!valid) {
          this.$message.error('请填写完整的表单信息')
          return
        }

        this.saveLoading = true

        // 获取修改后的数据
        const updatedData = this.$refs.basicInfo.getFormData()

        // 调用调整接口
        const response = await adjustPlan(this.planId, {
          demandQuantity: updatedData.demandQuantity,
          plannedDeliveryDate: updatedData.plannedDeliveryDate,
          planPriority: updatedData.planPriority,
          customerName: updatedData.customerName,
          customerCode: updatedData.customerCode,
          specificRequirements: updatedData.specificRequirements,
          changeDescription: '编辑生产计划基本信息'
        })

        if (response.success) {
          this.$message.success(response.message || '保存成功')
          this.editMode = false
          this.originalData = null
          // 重新加载详情
          await this.fetchDetail()
        } else {
          this.$message.error(response.message || '保存失败')
        }
      } catch (error) {
        console.error('保存失败:', error)
        const errorMessage = getErrorMessage(error)
        this.$message.error(errorMessage)
      } finally {
        this.saveLoading = false
      }
    },

    /**
     * 更新基本信息（来自子组件）
     */
    handleUpdateBasicInfo(updatedData) {
      Object.assign(this.planData, updatedData)
    },

    /**
     * 打开拆分对话框
     */
    handleSplit() {
      this.$refs.splitDialog.open()
    },

    /**
     * 拆分成功
     */
    async handleSplitSuccess() {
      await this.fetchDetail()
    },

    /**
     * 打开调整对话框
     */
    handleAdjust() {
      this.$refs.adjustDialog.open()
    },

    /**
     * 调整成功
     */
    async handleAdjustSuccess() {
      await this.fetchDetail()
    },

    /**
     * 打开合并对话框
     */
    handleMerge() {
      this.$refs.mergeDialog.open()
    },

    /**
     * 合并成功
     */
    async handleMergeSuccess() {
      await this.fetchDetail()
    },

    /**
     * 处理状态变更
     */
    handleChangeStatus() {
      this.$refs.statusChangeDialog.open(this.planData)
    },

    /**
     * 状态变更成功
     */
    async handleStatusChangeSuccess() {
      await this.fetchDetail()
    },

    /**
     * 处理提交审批
     */
    handleSubmitApproval() {
      this.$refs.approvalSubmitDialog.open(this.planData)
    },

    /**
     * 审批提交成功
     */
    async handleApprovalSubmitSuccess() {
      await this.fetchDetail()
    },

    /**
     * 处理可行性评估
     */
    handleEvaluate() {
      this.$refs.feasibilityDialog.open(this.planData)
    },

    /**
     * 审批处理成功后刷新详情
     */
    async handleApprovalProcessed() {
      await this.fetchDetail()
    }
  }
}
</script>

<style lang="scss" scoped>
.production-plan-detail {
  padding: 20px;

  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid #ebeef5;

    .header-actions {
      .el-button {
        margin-left: 12px;
      }
    }
  }

  .detail-content {
    min-height: 400px;

    ::v-deep .el-tabs {
      .el-tabs__header {
        margin: 0;
      }

      .el-tabs__content {
        padding: 20px;
      }
    }
  }

  // 响应式设计
  @media (max-width: 768px) {
    padding: 10px;

    .detail-header {
      flex-direction: column;
      align-items: flex-start;

      .header-actions {
        margin-top: 12px;
        width: 100%;

        .el-button {
          margin-left: 0;
          margin-right: 8px;
          margin-bottom: 8px;
        }
      }
    }
  }
}
</style>

