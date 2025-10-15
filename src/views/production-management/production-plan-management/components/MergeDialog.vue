/**
 * 文件名称：MergeDialog.vue
 * 文件描述：生产计划合并对话框组件
 * 创建日期：2025-01-21
 * 修改记录：
 *   - 2025-01-21: 初始创建，实现P0阶段核心功能
 */

<template>
  <el-dialog
    title="合并生产计划"
    :visible.sync="visible"
    width="90%"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="handleClose"
  >
    <div v-loading="loading" class="merge-dialog-content">
      <!-- 目标计划选择区 -->
      <el-card class="section-card" shadow="never">
        <div slot="header" class="card-header">
          <span class="card-title">目标计划选择</span>
        </div>
        <div class="target-plan-section">
          <!-- 搜索筛选区 -->
          <el-form :inline="true" size="small" @submit.native.prevent>
            <el-form-item label="计划编号">
              <el-input
                v-model="targetPlanFilters.planNumber"
                placeholder="请输入计划编号"
                clearable
                @change="handleTargetPlanSearch"
              />
            </el-form-item>
            <el-form-item label="产品编码">
              <el-input
                v-model="targetPlanFilters.productCode"
                placeholder="请输入产品编码"
                clearable
                @change="handleTargetPlanSearch"
              />
            </el-form-item>
            <el-form-item label="状态">
              <el-select
                v-model="targetPlanFilters.status"
                placeholder="请选择状态"
                clearable
                @change="handleTargetPlanSearch"
              >
                <el-option
                  v-for="status in allowedTargetStatuses"
                  :key="status.value"
                  :label="status.label"
                  :value="status.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="el-icon-search" @click="handleTargetPlanSearch">
                搜索
              </el-button>
              <el-button icon="el-icon-refresh" @click="handleTargetPlanReset">
                重置
              </el-button>
            </el-form-item>
          </el-form>

          <!-- 目标计划列表 -->
          <el-table
            :data="targetPlanList"
            :loading="targetPlanLoading"
            highlight-current-row
            style="width: 100%"
            height="200"
            @current-change="handleTargetPlanChange"
          >
            <el-table-column type="index" label="序号" width="60" />
            <el-table-column prop="planNumber" label="计划编号" min-width="150" show-overflow-tooltip />
            <el-table-column prop="productCode" label="产品编码" min-width="120" show-overflow-tooltip />
            <el-table-column prop="demandQuantity" label="需求数量" width="100">
              <template slot-scope="scope">
                {{ scope.row.demandQuantity }} {{ scope.row.demandUnit }}
              </template>
            </el-table-column>
            <el-table-column label="子批次数量" width="100">
              <template slot-scope="scope">
                {{ (scope.row.items || []).length }}
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template slot-scope="scope">
                <el-tag :type="getStatusType(scope.row.status)" size="small">
                  {{ getStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>

          <!-- 目标计划详情 -->
          <div v-if="selectedTargetPlan" class="target-plan-detail">
            <el-divider>目标计划详情</el-divider>
            <el-descriptions :column="3" border size="small">
              <el-descriptions-item label="计划编号">{{ selectedTargetPlan.planNumber }}</el-descriptions-item>
              <el-descriptions-item label="产品编码">{{ selectedTargetPlan.productCode }}</el-descriptions-item>
              <el-descriptions-item label="产品名称">{{ selectedTargetPlan.productName }}</el-descriptions-item>
              <el-descriptions-item label="需求数量">
                {{ selectedTargetPlan.demandQuantity }} {{ selectedTargetPlan.demandUnit }}
              </el-descriptions-item>
              <el-descriptions-item label="子批次数量">
                {{ (selectedTargetPlan.items || []).length }}
              </el-descriptions-item>
              <el-descriptions-item label="工艺模板">
                {{ selectedTargetPlan.processTemplateName || '未设置' }}
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </div>
      </el-card>

      <!-- 待合并子批次选择区 -->
      <el-card class="section-card" shadow="never">
        <div slot="header" class="card-header">
          <span class="card-title">待合并子批次选择</span>
        </div>
        <div class="items-section">
          <!-- 搜索筛选区 -->
          <el-form :inline="true" size="small" @submit.native.prevent>
            <el-form-item label="所属计划">
              <el-input
                v-model="itemFilters.planNumber"
                placeholder="请输入计划编号"
                clearable
                @change="handleItemSearch"
              />
            </el-form-item>
            <el-form-item label="工艺模板">
              <el-input
                v-model="itemFilters.processTemplateName"
                placeholder="请输入工艺模板名称"
                clearable
                @change="handleItemSearch"
              />
            </el-form-item>
            <el-form-item label="状态">
              <el-select
                v-model="itemFilters.status"
                placeholder="请选择状态"
                clearable
                @change="handleItemSearch"
              >
                <el-option
                  v-for="status in allowedItemStatuses"
                  :key="status.value"
                  :label="status.label"
                  :value="status.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="el-icon-search" @click="handleItemSearch">
                搜索
              </el-button>
              <el-button icon="el-icon-refresh" @click="handleItemReset">
                重置
              </el-button>
            </el-form-item>
          </el-form>

          <!-- 待合并子批次列表 -->
          <el-table
            ref="itemsTable"
            :data="itemsList"
            :loading="itemsLoading"
            style="width: 100%"
            height="300"
            @selection-change="handleItemsSelectionChange"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column type="index" label="序号" width="60" />
            <el-table-column prop="parentPlanNumber" label="所属计划" min-width="150" show-overflow-tooltip />
            <el-table-column prop="itemNumber" label="子计划编号" min-width="150" show-overflow-tooltip />
            <el-table-column prop="plannedWeight" label="预计重量(吨)" width="120" />
            <el-table-column prop="plannedQuantity" label="预计数量" width="100" />
            <el-table-column prop="processTemplateName" label="工艺模板" min-width="120" show-overflow-tooltip />
            <el-table-column label="状态" width="100">
              <template slot-scope="scope">
                <el-tag :type="getItemStatusType(scope.row.status)" size="small">
                  {{ getItemStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-card>

      <!-- 合并预览区 -->
      <el-card v-if="selectedItems.length > 0" class="section-card" shadow="never">
        <div slot="header" class="card-header">
          <span class="card-title">合并预览</span>
        </div>
        <div class="merge-preview">
          <el-alert
            v-if="processTemplateError"
            type="error"
            :title="processTemplateError"
            :closable="false"
            show-icon
            style="margin-bottom: 16px"
          />
          <el-alert
            v-else-if="!selectedTargetPlan"
            type="warning"
            title="请先选择目标计划"
            :closable="false"
            show-icon
            style="margin-bottom: 16px"
          />
          <el-alert
            v-else
            type="success"
            title="工艺模板一致性检查通过"
            :closable="false"
            show-icon
            style="margin-bottom: 16px"
          />

          <el-descriptions :column="3" border size="small">
            <el-descriptions-item label="目标计划">
              {{ selectedTargetPlan ? selectedTargetPlan.planNumber : '未选择' }}
            </el-descriptions-item>
            <el-descriptions-item label="待合并子批次数">
              {{ selectedItems.length }}
            </el-descriptions-item>
            <el-descriptions-item label="合并后总子批次数">
              {{ getTotalItemsCount() }}
            </el-descriptions-item>
            <el-descriptions-item label="待合并总重量">
              {{ getTotalWeight().toFixed(3) }} 吨
            </el-descriptions-item>
            <el-descriptions-item label="合并后总重量">
              {{ getMergedTotalWeight().toFixed(3) }} 吨
            </el-descriptions-item>
            <el-descriptions-item label="工艺模板">
              {{ getProcessTemplateInfo() }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </el-card>

      <!-- 变更描述 -->
      <el-form label-width="100px" style="margin-top: 20px">
        <el-form-item label="变更描述">
          <el-input
            v-model="changeDescription"
            type="textarea"
            :rows="3"
            maxlength="500"
            show-word-limit
            placeholder="请输入合并原因（选填，最多500字符）"
          />
        </el-form-item>
      </el-form>
    </div>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button
        type="primary"
        :loading="submitting"
        :disabled="!canSubmit"
        @click="handleSubmit"
      >
        确认合并
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { fetchPlanList, mergePlans } from '../api'
import dictionaryMixin from '../mixins/dictionary'
import {
  PLAN_STATUS,
  PLAN_STATUS_TYPE_MAP,
  ITEM_STATUS,
  ITEM_STATUS_TYPE_MAP,
  getErrorMessage
} from '../constants'

export default {
  name: 'MergeDialog',
  mixins: [dictionaryMixin],
  data() {
    return {
      visible: false,
      loading: false,
      submitting: false,

      // 目标计划相关
      targetPlanList: [],
      targetPlanLoading: false,
      targetPlanFilters: {
        planNumber: '',
        productCode: '',
        status: ''
      },
      selectedTargetPlan: null,

      // 待合并子批次相关
      itemsList: [],
      itemsLoading: false,
      itemFilters: {
        planNumber: '',
        processTemplateName: '',
        status: ''
      },
      selectedItems: [],

      // 变更描述
      changeDescription: '',

      // 工艺模板错误
      processTemplateError: ''
    }
  },
  computed: {
    /**
     * 是否可以提交
     */
    canSubmit() {
      return (
        this.selectedTargetPlan &&
        this.selectedItems.length > 0 &&
        !this.processTemplateError
      )
    },

    /**
     * 允许作为目标的计划状态选项（使用字典）
     */
    allowedTargetStatuses() {
      return [
        { value: PLAN_STATUS.CONFIRMED, label: this.getPlanStatusLabel(PLAN_STATUS.CONFIRMED) },
        { value: PLAN_STATUS.READY_FOR_SCHEDULING, label: this.getPlanStatusLabel(PLAN_STATUS.READY_FOR_SCHEDULING) }
      ]
    },

    /**
     * 允许合并的子批次状态选项（使用字典）
     */
    allowedItemStatuses() {
      return [
        { value: ITEM_STATUS.DRAFT, label: this.getPlanItemStatusLabel(ITEM_STATUS.DRAFT) },
        { value: ITEM_STATUS.READY_FOR_SCHEDULING, label: this.getPlanItemStatusLabel(ITEM_STATUS.READY_FOR_SCHEDULING) }
      ]
    }
  },
  methods: {
    /**
     * 打开对话框
     */
    open() {
      this.visible = true
      this.resetForm()
      this.fetchTargetPlans()
      this.fetchAvailableItems()
    },

    /**
     * 关闭对话框
     */
    handleClose() {
      this.visible = false
      this.resetForm()
    },

    /**
     * 重置表单
     */
    resetForm() {
      this.selectedTargetPlan = null
      this.selectedItems = []
      this.targetPlanFilters = {
        planNumber: '',
        productCode: '',
        status: ''
      }
      this.itemFilters = {
        planNumber: '',
        processTemplateName: '',
        status: ''
      }
      this.changeDescription = ''
      this.processTemplateError = ''
    },

    /**
     * 获取目标计划列表
     */
    async fetchTargetPlans() {
      try {
        this.targetPlanLoading = true
        const params = {
          page: 1,
          limit: 100,
          status: [PLAN_STATUS.CONFIRMED, PLAN_STATUS.READY_FOR_SCHEDULING].join(','),
          ...this.targetPlanFilters
        }

        // 清空空值
        Object.keys(params).forEach(key => {
          if (!params[key]) {
            delete params[key]
          }
        })

        const response = await fetchPlanList(params)
        if (response.success && response.data) {
          this.targetPlanList = response.data.results || []
        } else {
          this.$message.error(response.message || '获取目标计划列表失败')
        }
      } catch (error) {
        console.error('获取目标计划列表失败:', error)
        const errorMessage = getErrorMessage(error)
        this.$message.error(errorMessage)
      } finally {
        this.targetPlanLoading = false
      }
    },

    /**
     * 获取可合并的子批次列表
     */
    async fetchAvailableItems() {
      try {
        this.itemsLoading = true
        // 获取所有符合状态的计划，然后提取子批次
        const params = {
          page: 1,
          limit: 1000,
          ...this.itemFilters
        }

        // 清空空值
        Object.keys(params).forEach(key => {
          if (!params[key]) {
            delete params[key]
          }
        })

        const response = await fetchPlanList(params)
        if (response.success && response.data) {
          const plans = response.data.results || []
          // 提取所有子批次并过滤符合状态的
          const items = []
          plans.forEach(plan => {
            if (plan.items && Array.isArray(plan.items)) {
              plan.items.forEach(item => {
                // 只保留草稿或待排程状态的子批次
                if (item.status === ITEM_STATUS.DRAFT || item.status === ITEM_STATUS.READY_FOR_SCHEDULING) {
                  items.push({
                    ...item,
                    parentPlanNumber: plan.planNumber,
                    parentPlanId: plan.id
                  })
                }
              })
            }
          })
          this.itemsList = items
        } else {
          this.$message.error(response.message || '获取子批次列表失败')
        }
      } catch (error) {
        console.error('获取子批次列表失败:', error)
        const errorMessage = getErrorMessage(error)
        this.$message.error(errorMessage)
      } finally {
        this.itemsLoading = false
      }
    },

    /**
     * 目标计划搜索
     */
    handleTargetPlanSearch() {
      this.fetchTargetPlans()
    },

    /**
     * 目标计划重置
     */
    handleTargetPlanReset() {
      this.targetPlanFilters = {
        planNumber: '',
        productCode: '',
        status: ''
      }
      this.fetchTargetPlans()
    },

    /**
     * 目标计划选择变化
     */
    handleTargetPlanChange(row) {
      this.selectedTargetPlan = row
      this.validateProcessTemplate()
    },

    /**
     * 子批次搜索
     */
    handleItemSearch() {
      this.fetchAvailableItems()
    },

    /**
     * 子批次重置
     */
    handleItemReset() {
      this.itemFilters = {
        planNumber: '',
        processTemplateName: '',
        status: ''
      }
      this.fetchAvailableItems()
    },

    /**
     * 子批次选择变化
     */
    handleItemsSelectionChange(selection) {
      this.selectedItems = selection
      this.validateProcessTemplate()
    },

    /**
     * 验证工艺模板一致性
     */
    validateProcessTemplate() {
      this.processTemplateError = ''

      if (this.selectedItems.length === 0) {
        return
      }

      if (!this.selectedTargetPlan) {
        this.processTemplateError = '请先选择目标计划'
        return
      }

      // 获取目标计划的工艺模板ID
      const targetTemplateId = this.selectedTargetPlan.defaultProcessTemplateId

      // 检查所有子批次的工艺模板是否一致
      const templateIds = this.selectedItems.map(item => item.processTemplateId)
      const uniqueTemplateIds = [...new Set(templateIds)]

      if (uniqueTemplateIds.length > 1) {
        this.processTemplateError = '所选子批次的工艺模板不一致，请选择相同工艺模板的子批次'
        return
      }

      // 检查子批次工艺模板是否与目标计划一致
      if (uniqueTemplateIds[0] !== targetTemplateId) {
        this.processTemplateError = '所选子批次的工艺模板与目标计划不一致，必须使用相同的工艺模板'
      }
    },

    /**
     * 获取总子批次数量
     */
    getTotalItemsCount() {
      if (!this.selectedTargetPlan) {
        return 0
      }
      const currentCount = (this.selectedTargetPlan.items || []).length
      return currentCount + this.selectedItems.length
    },

    /**
     * 获取待合并总重量
     */
    getTotalWeight() {
      return this.selectedItems.reduce((sum, item) => sum + (item.plannedWeight || 0), 0)
    },

    /**
     * 获取合并后总重量
     */
    getMergedTotalWeight() {
      if (!this.selectedTargetPlan) {
        return 0
      }
      const currentWeight = (this.selectedTargetPlan.items || []).reduce((sum, item) => sum + (item.plannedWeight || 0), 0)
      return currentWeight + this.getTotalWeight()
    },

    /**
     * 获取工艺模板信息
     */
    getProcessTemplateInfo() {
      if (this.selectedItems.length === 0) {
        return '未选择子批次'
      }
      const firstItem = this.selectedItems[0]
      return firstItem.processTemplateName || '未设置'
    },

    /**
     * 获取状态文本
     */
    getStatusText(status) {
      return this.getPlanStatusLabel(status)
    },

    /**
     * 获取状态类型
     */
    getStatusType(status) {
      return PLAN_STATUS_TYPE_MAP[status] || 'info'
    },

    /**
     * 获取子批次状态文本
     */
    getItemStatusText(status) {
      return this.getPlanItemStatusLabel(status)
    },

    /**
     * 获取子批次状态类型
     */
    getItemStatusType(status) {
      return ITEM_STATUS_TYPE_MAP[status] || 'info'
    },

    /**
     * 提交合并
     */
    async handleSubmit() {
      // 验证
      if (!this.selectedTargetPlan) {
        this.$message.error('请选择目标计划')
        return
      }

      if (this.selectedItems.length === 0) {
        this.$message.error('请至少选择一个子批次')
        return
      }

      if (this.processTemplateError) {
        this.$message.error(this.processTemplateError)
        return
      }

      // 确认对话框
      try {
        await this.$confirm(
          `确认将 ${this.selectedItems.length} 个子批次合并到计划 "${this.selectedTargetPlan.planNumber}" 吗？`,
          '确认合并',
          {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
      } catch {
        return
      }

      // 提交合并请求
      try {
        this.submitting = true

        const data = {
          targetPlanId: this.selectedTargetPlan.id,
          planItemIds: this.selectedItems.map(item => item.id),
          changeDescription: this.changeDescription || undefined
        }

        const response = await mergePlans(data)

        if (response.success) {
          this.$message.success(response.message || '合并生产计划成功')
          this.$emit('success')
          this.handleClose()
        } else {
          this.$message.error(response.message || '合并生产计划失败')
        }
      } catch (error) {
        console.error('合并生产计划失败:', error)
        const errorMessage = getErrorMessage(error)
        this.$message.error(errorMessage)
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.merge-dialog-content {
  .section-card {
    margin-bottom: 20px;

    &:last-child {
      margin-bottom: 0;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .card-title {
        font-size: 16px;
        font-weight: 500;
        color: #303133;
      }
    }
  }

  .target-plan-section {
    .target-plan-detail {
      margin-top: 16px;
    }
  }

  .items-section {
    // 子批次选择区样式
  }

  .merge-preview {
    // 合并预览区样式
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

// 响应式设计
@media (max-width: 768px) {
  .merge-dialog-content {
    .el-form--inline .el-form-item {
      display: block;
      margin-right: 0;
      margin-bottom: 12px;
    }
  }
}
</style>

