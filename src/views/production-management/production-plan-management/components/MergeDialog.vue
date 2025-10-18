/**
 * 文件名称：MergeDialog.vue
 * 文件描述：生产计划合并对话框组件
 * 创建日期：2025-01-21
 * 修改记录：
 *   - 2025-01-21: 初始创建，实现P0阶段核心功能
 *   - 2025-10-17: 重构，完全按照接口文档规范实现
 */

<template>
  <el-dialog
    title="合并生产计划"
    :visible.sync="visible"
    width="70%"
    top="5vh"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    custom-class="merge-dialog"
    @close="handleClose"
  >
    <div v-loading="loading" class="merge-dialog-content">
      <!-- 目标计划选择区 -->
      <el-card class="section-card" shadow="never">
        <div slot="header" class="card-header">
          <span class="card-title">目标计划选择</span>
          <span class="card-subtitle">请选择状态为"已确认"或"部分下发"的计划作为合并目标</span>
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
            <el-table-column prop="productName" label="产品名称" min-width="150" show-overflow-tooltip />
            <el-table-column prop="demandQuantity" label="需求数量" width="120">
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
              <el-descriptions-item label="产品ID">{{ selectedTargetPlan.productId }}</el-descriptions-item>
              <el-descriptions-item label="产品编码">{{ selectedTargetPlan.productCode }}</el-descriptions-item>
              <el-descriptions-item label="产品名称" :span="2">{{ selectedTargetPlan.productName }}</el-descriptions-item>
              <el-descriptions-item label="需求数量">
                {{ selectedTargetPlan.demandQuantity }} {{ selectedTargetPlan.demandUnit }}
              </el-descriptions-item>
              <el-descriptions-item label="子批次数量">
                {{ (selectedTargetPlan.items || []).length }}
              </el-descriptions-item>
              <el-descriptions-item label="工艺模板ID" :span="2">
                {{ selectedTargetPlan.defaultProcessTemplateId || '未设置' }}
              </el-descriptions-item>
              <el-descriptions-item label="工艺模板名称">
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
          <span class="card-subtitle">只能选择状态为"草稿"或"待排程"的子批次进行合并</span>
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
            <el-form-item label="产品编码">
              <el-input
                v-model="itemFilters.productCode"
                placeholder="请输入产品编码"
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
            <el-table-column prop="parentProductCode" label="产品编码" min-width="120" show-overflow-tooltip />
            <el-table-column prop="itemNumber" label="子批次编号" min-width="150" show-overflow-tooltip />
            <el-table-column prop="plannedWeight" label="预计重量(吨)" width="120" />
            <el-table-column prop="plannedQuantity" label="预计数量" width="100" />
            <el-table-column prop="processTemplateName" label="工艺模板" min-width="150" show-overflow-tooltip />
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
          <!-- 验证错误提示 -->
          <el-alert
            v-if="validationErrors.length > 0"
            type="error"
            :title="`发现 ${validationErrors.length} 个问题，请修正后再提交`"
            :closable="false"
            show-icon
            style="margin-bottom: 16px"
          >
            <ul style="margin: 8px 0 0 0; padding-left: 20px;">
              <li v-for="(error, index) in validationErrors" :key="index">{{ error }}</li>
            </ul>
          </el-alert>

          <!-- 验证成功提示 -->
          <el-alert
            v-else-if="selectedTargetPlan"
            type="success"
            title="✓ 合并前验证通过，可以提交"
            :closable="false"
            show-icon
            style="margin-bottom: 16px"
          >
            <div style="margin-top: 8px; font-size: 13px; color: #67C23A;">
              <div>✓ 目标计划状态符合要求</div>
              <div>✓ 所有子批次状态符合要求</div>
              <div>✓ 至少一个子批次属于目标计划</div>
              <div>✓ 产品一致性检查通过</div>
              <div>✓ 工艺模板一致性检查通过（按来源计划分组）</div>
            </div>
          </el-alert>

          <el-alert
            v-else
            type="warning"
            title="请先选择目标计划"
            :closable="false"
            show-icon
            style="margin-bottom: 16px"
          />

          <!-- 合并详情 -->
          <el-descriptions :column="3" border size="small">
            <el-descriptions-item label="目标计划">
              {{ selectedTargetPlan ? selectedTargetPlan.planNumber : '未选择' }}
            </el-descriptions-item>
            <el-descriptions-item label="目标计划产品">
              {{ selectedTargetPlan ? selectedTargetPlan.productCode : '未选择' }}
            </el-descriptions-item>
            <el-descriptions-item label="涉及来源计划数">
              {{ getSourcePlansCount() }}
            </el-descriptions-item>
            <el-descriptions-item label="待合并子批次数">
              {{ selectedItems.length }}
            </el-descriptions-item>
            <el-descriptions-item label="目标计划现有子批次数">
              {{ getTargetItemsCount() }}
            </el-descriptions-item>
            <el-descriptions-item label="合并后总子批次数">
              {{ getTotalItemsCount() }}
            </el-descriptions-item>
            <el-descriptions-item label="目标计划当前需求数量">
              {{ getTargetDemandQuantity() }}
            </el-descriptions-item>
            <el-descriptions-item label="待合并总重量">
              {{ getTotalWeight().toFixed(3) }} 吨
            </el-descriptions-item>
            <el-descriptions-item label="合并后需求数量">
              {{ getMergedTotalWeight().toFixed(3) }} 吨
            </el-descriptions-item>
          </el-descriptions>

          <!-- 按来源计划分组显示 -->
          <el-divider>待合并子批次分组详情</el-divider>
          <el-table :data="getGroupedItems()" size="small" border>
            <el-table-column prop="planNumber" label="来源计划" min-width="150" />
            <el-table-column prop="productCode" label="产品编码" min-width="120" />
            <el-table-column prop="itemCount" label="子批次数" width="100" />
            <el-table-column prop="totalWeight" label="总重量(吨)" width="120" />
            <el-table-column prop="processTemplates" label="工艺模板" min-width="150">
              <template slot-scope="scope">
                <el-tag
                  v-for="template in scope.row.processTemplates"
                  :key="template"
                  size="mini"
                  :type="scope.row.processTemplates.length > 1 ? 'danger' : 'success'"
                  style="margin-right: 4px;"
                >
                  {{ template }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template slot-scope="scope">
                <el-tag
                  :type="scope.row.processTemplates.length > 1 ? 'danger' : 'success'"
                  size="small"
                >
                  {{ scope.row.processTemplates.length > 1 ? '工艺不一致' : '验证通过' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
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

/**
 * 合并对话框组件
 * 完全按照接口文档实现合并逻辑：
 * - 目标计划状态：CONFIRMED 或 PARTIALLY_RELEASED
 * - 子批次状态：DRAFT 或 READY_FOR_SCHEDULING
 * - 工艺模板一致性：同一来源计划的子批次必须使用相同工艺模板
 * - 产品一致性：所有来源计划的产品必须与目标计划一致
 * - 必须至少有一个子批次属于目标计划
 */
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
        productCode: '',
        processTemplateName: '',
        status: ''
      },
      selectedItems: [],

      // 变更描述
      changeDescription: '',

      // 验证错误列表
      validationErrors: []
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
        this.validationErrors.length === 0
      )
    },

    /**
     * 允许作为目标的计划状态选项
     * 根据接口文档：CONFIRMED（已确认）或 PARTIALLY_RELEASED（部分下发）
     */
    allowedTargetStatuses() {
      return [
        { value: PLAN_STATUS.CONFIRMED, label: this.getPlanStatusLabel(PLAN_STATUS.CONFIRMED) },
        { value: PLAN_STATUS.PARTIALLY_RELEASED, label: this.getPlanStatusLabel(PLAN_STATUS.PARTIALLY_RELEASED) }
      ]
    },

    /**
     * 允许合并的子批次状态选项
     * 根据接口文档：DRAFT（草稿）或 READY_FOR_SCHEDULING（待排程）
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
        productCode: '',
        processTemplateName: '',
        status: ''
      }
      this.changeDescription = ''
      this.validationErrors = []
    },

    /**
     * 获取目标计划列表
     * 只查询状态为 CONFIRMED 或 PARTIALLY_RELEASED 的计划
     * 使用分页方式获取所有数据（limit最大为100）
     */
    async fetchTargetPlans() {
      try {
        this.targetPlanLoading = true
        const allPlans = []
        let currentPage = 1
        const pageSize = 100 // 接口限制最大为100
        let hasMore = true

        // 分页获取所有符合条件的计划
        while (hasMore) {
          const params = {
            page: currentPage,
            limit: pageSize,
            status: [PLAN_STATUS.CONFIRMED, PLAN_STATUS.PARTIALLY_RELEASED].join(','),
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
            const plans = response.data.results || []
            allPlans.push(...plans)

            // 判断是否还有更多数据
            const pagination = response.data.pagination
            hasMore = pagination && currentPage < pagination.totalPages
            currentPage++
          } else {
            // 失败时 message 在 error 对象中
            this.$message.error(response.error?.message || '获取目标计划列表失败')
            hasMore = false
          }
        }

        this.targetPlanList = allPlans
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
     * 从所有计划中提取状态为 DRAFT 或 READY_FOR_SCHEDULING 的子批次
     * 使用分页方式获取所有数据（limit最大为100）
     */
    async fetchAvailableItems() {
      try {
        this.itemsLoading = true
        const allItems = []
        let currentPage = 1
        const pageSize = 100 // 接口限制最大为100
        let hasMore = true

        // 分页获取所有计划
        while (hasMore) {
          const params = {
            page: currentPage,
            limit: pageSize,
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

            // 提取符合状态的子批次
            plans.forEach(plan => {
              if (plan.items && Array.isArray(plan.items)) {
                plan.items.forEach(item => {
                  // 只保留草稿或待排程状态的子批次
                  if (item.status === ITEM_STATUS.DRAFT || item.status === ITEM_STATUS.READY_FOR_SCHEDULING) {
                    allItems.push({
                      ...item,
                      parentPlanNumber: plan.planNumber,
                      parentPlanId: plan.id,
                      parentProductId: plan.productId,
                      parentProductCode: plan.productCode,
                      parentProductName: plan.productName
                    })
                  }
                })
              }
            })

            // 判断是否还有更多数据
            const pagination = response.data.pagination
            hasMore = pagination && currentPage < pagination.totalPages
            currentPage++
          } else {
            // 失败时 message 在 error 对象中
            this.$message.error(response.error?.message || '获取子批次列表失败')
            hasMore = false
          }
        }

        this.itemsList = allItems
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
      this.performValidation()
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
        productCode: '',
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
      this.performValidation()
    },

    /**
     * 执行完整验证
     * 按照接口文档的业务规则进行验证
     */
    performValidation() {
      this.validationErrors = []

      if (this.selectedItems.length === 0) {
        return
      }

      if (!this.selectedTargetPlan) {
        this.validationErrors.push('请先选择目标计划')
        return
      }

      // 1. 验证目标计划状态
      if (![PLAN_STATUS.CONFIRMED, PLAN_STATUS.PARTIALLY_RELEASED].includes(this.selectedTargetPlan.status)) {
        this.validationErrors.push(`目标计划状态必须是"已确认"或"部分下发"，当前状态：${this.getPlanStatusLabel(this.selectedTargetPlan.status)}`)
      }

      // 2. 验证所有子批次状态
      const invalidStatusItems = this.selectedItems.filter(
        item => ![ITEM_STATUS.DRAFT, ITEM_STATUS.READY_FOR_SCHEDULING].includes(item.status)
      )
      if (invalidStatusItems.length > 0) {
        this.validationErrors.push(`有 ${invalidStatusItems.length} 个子批次状态不符合要求，只能合并"草稿"或"待排程"状态的子批次`)
      }

      // 3. 验证至少一个子批次属于目标计划
      const belongsToTarget = this.selectedItems.some(item => item.planId === this.selectedTargetPlan.id)
      if (!belongsToTarget) {
        this.validationErrors.push('必须选择至少一个属于目标计划的子批次')
      }

      // 4. 验证产品一致性（所有来源计划的产品必须与目标计划一致）
      const targetProductId = this.selectedTargetPlan.productId
      const productMismatchItems = this.selectedItems.filter(item => item.parentProductId !== targetProductId)
      if (productMismatchItems.length > 0) {
        const uniqueProducts = [...new Set(productMismatchItems.map(item => item.parentProductCode))]
        this.validationErrors.push(
          `产品不一致：目标计划产品为 "${this.selectedTargetPlan.productCode}"，但有 ${productMismatchItems.length} 个子批次的产品不匹配（${uniqueProducts.join(', ')}）`
        )
      }

      // 5. 验证工艺模板一致性（按来源计划分组验证）
      const processTemplateErrors = this.validateProcessTemplatesByPlan()
      if (processTemplateErrors.length > 0) {
        this.validationErrors.push(...processTemplateErrors)
      }
    },

    /**
     * 按来源计划分组验证工艺模板一致性
     * 接口文档要求：同一来源计划的子批次必须使用相同工艺模板
     * 不同来源计划可以使用不同工艺模板
     */
    validateProcessTemplatesByPlan() {
      const errors = []
      const targetTemplateId = this.selectedTargetPlan.defaultProcessTemplateId

      // 按来源计划分组
      const groupedByPlan = {}
      this.selectedItems.forEach(item => {
        const planId = item.planId
        if (!groupedByPlan[planId]) {
          groupedByPlan[planId] = {
            planNumber: item.parentPlanNumber || item.planId,
            items: []
          }
        }
        groupedByPlan[planId].items.push(item)
      })

      // 验证每个来源计划的工艺模板一致性
      Object.values(groupedByPlan).forEach(group => {
        // 获取该计划的所有工艺模板ID（使用子批次的工艺模板或目标计划的默认工艺模板）
        const templateIds = group.items.map(item => item.processTemplateId || targetTemplateId)
        const uniqueTemplateIds = [...new Set(templateIds)]

        if (uniqueTemplateIds.length > 1) {
          const templateNames = group.items.map(item => item.processTemplateName || '未设置')
          const uniqueTemplateNames = [...new Set(templateNames)]
          errors.push(
            `来源计划 "${group.planNumber}" 的子批次工艺模板不一致（${uniqueTemplateNames.join(', ')}），同一计划的子批次必须使用相同工艺模板`
          )
        }
      })

      return errors
    },

    /**
     * 获取来源计划数量
     */
    getSourcePlansCount() {
      if (this.selectedItems.length === 0) {
        return 0
      }
      const uniquePlanIds = new Set(
        this.selectedItems
          .filter(item => item.planId !== this.selectedTargetPlan?.id)
          .map(item => item.planId)
      )
      return uniquePlanIds.size
    },

    /**
     * 获取目标计划现有子批次数量
     */
    getTargetItemsCount() {
      if (!this.selectedTargetPlan) {
        return 0
      }
      return (this.selectedTargetPlan.items || []).length
    },

    /**
     * 获取合并后总子批次数量
     */
    getTotalItemsCount() {
      if (!this.selectedTargetPlan) {
        return 0
      }
      const currentCount = this.getTargetItemsCount()
      return currentCount + this.selectedItems.length
    },

    /**
     * 获取目标计划当前需求数量
     */
    getTargetDemandQuantity() {
      if (!this.selectedTargetPlan) {
        return '0 吨'
      }
      return `${this.selectedTargetPlan.demandQuantity || 0} ${this.selectedTargetPlan.demandUnit || '吨'}`
    },

    /**
     * 获取待合并总重量
     */
    getTotalWeight() {
      return this.selectedItems.reduce((sum, item) => sum + (item.plannedWeight || 0), 0)
    },

    /**
     * 获取合并后需求数量
     * 根据接口文档：合并后 demandQuantity = 目标计划当前 demandQuantity + 待合并总重量
     */
    getMergedTotalWeight() {
      if (!this.selectedTargetPlan) {
        return 0
      }
      const currentDemand = this.selectedTargetPlan.demandQuantity || 0
      return currentDemand + this.getTotalWeight()
    },

    /**
     * 按来源计划分组获取子批次信息
     */
    getGroupedItems() {
      const groupedByPlan = {}

      this.selectedItems.forEach(item => {
        const planId = item.planId
        if (!groupedByPlan[planId]) {
          groupedByPlan[planId] = {
            planId,
            planNumber: item.parentPlanNumber || item.planId,
            productCode: item.parentProductCode || '',
            items: [],
            totalWeight: 0,
            processTemplates: new Set()
          }
        }

        groupedByPlan[planId].items.push(item)
        groupedByPlan[planId].totalWeight += item.plannedWeight || 0
        groupedByPlan[planId].processTemplates.add(item.processTemplateName || '未设置')
      })

      // 转换为数组并格式化
      return Object.values(groupedByPlan).map(group => ({
        planNumber: group.planNumber,
        productCode: group.productCode,
        itemCount: group.items.length,
        totalWeight: group.totalWeight.toFixed(3),
        processTemplates: Array.from(group.processTemplates)
      }))
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
      // 最终验证
      this.performValidation()

      if (!this.selectedTargetPlan) {
        this.$message.error('请选择目标计划')
        return
      }

      if (this.selectedItems.length === 0) {
        this.$message.error('请至少选择一个子批次')
        return
      }

      if (this.validationErrors.length > 0) {
        this.$message.error(`存在 ${this.validationErrors.length} 个验证错误，请修正后再提交`)
        return
      }

      // 构建确认信息
      const sourcePlansCount = this.getSourcePlansCount()
      const confirmMessage = sourcePlansCount > 0
        ? `确认将 ${this.selectedItems.length} 个子批次（来自 ${sourcePlansCount} 个其他计划）合并到计划 "${this.selectedTargetPlan.planNumber}" 吗？\n\n合并后来源计划将被自动取消。`
        : `确认将 ${this.selectedItems.length} 个子批次合并到计划 "${this.selectedTargetPlan.planNumber}" 吗？`

      // 确认对话框
      try {
        await this.$confirm(confirmMessage, '确认合并', {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning',
          dangerouslyUseHTMLString: false
        })
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
          // 失败时 message 在 error 对象中
          this.$message.error(response.error?.message || '合并生产计划失败')
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
// 对话框全局样式（非 scoped）
::v-deep .merge-dialog {
  .el-dialog__body {
    max-height: calc(90vh - 150px);
    overflow-y: auto;
    padding: 20px;
  }

  .el-dialog__footer {
    border-top: 1px solid #EBEEF5;
    padding: 15px 20px;
  }
}

.merge-dialog-content {
  .section-card {
    margin-bottom: 20px;

    &:last-child {
      margin-bottom: 0;
    }

    .card-header {
      display: flex;
      flex-direction: column;
      align-items: flex-start;

      .card-title {
        font-size: 16px;
        font-weight: 500;
        color: #303133;
        margin-bottom: 4px;
      }

      .card-subtitle {
        font-size: 13px;
        color: #909399;
        font-weight: normal;
      }
    }
  }

  .target-plan-section {
    .target-plan-detail {
      margin-top: 16px;
    }
  }

  .merge-preview {
    ::v-deep .el-alert__description {
      margin-top: 4px;
      line-height: 1.6;
    }

    .el-divider {
      margin: 20px 0 16px 0;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

// 响应式设计
@media (max-width: 768px) {
  ::v-deep .merge-dialog {
    .el-dialog__body {
      max-height: calc(90vh - 120px);
    }
  }

  .merge-dialog-content {
    .el-form--inline .el-form-item {
      display: block;
      margin-right: 0;
      margin-bottom: 12px;
    }
  }
}
</style>

