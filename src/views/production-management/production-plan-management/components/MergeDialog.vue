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
              <el-descriptions-item label="计划编号">{{ selectedTargetPlan.planNumber || '未知' }}</el-descriptions-item>
              <el-descriptions-item label="产品ID">{{ selectedTargetPlan.productId || '未设置' }}</el-descriptions-item>
              <el-descriptions-item label="产品编码">{{ selectedTargetPlan.productCode || '未设置' }}</el-descriptions-item>
              <el-descriptions-item label="产品名称" :span="2">{{ selectedTargetPlan.productName || '未设置' }}</el-descriptions-item>
              <el-descriptions-item label="需求数量">
                {{ selectedTargetPlan.demandQuantity || 0 }} {{ selectedTargetPlan.demandUnit || '' }}
              </el-descriptions-item>
              <el-descriptions-item label="子批次数量">
                {{ (selectedTargetPlan.items || []).length }}
              </el-descriptions-item>
              <el-descriptions-item label="工艺模板ID" :span="2">
                {{ selectedTargetPlan.defaultProcessTemplateId || '未设置' }}
              </el-descriptions-item>
              <el-descriptions-item label="工艺模板名称">
                <!-- ✅ 直接使用标准字段访问（接口已保证一致性） -->
                {{ getTargetPlanProcessTemplateName() }}
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </div>
      </el-card>

      <!-- 待合并子批次选择区 -->
      <el-card class="section-card" shadow="never">
        <div slot="header" class="card-header">
          <span class="card-title">待合并子批次选择</span>
          <span class="card-subtitle">只能选择来自其他计划的、状态为"草稿"或"待排程"的子批次进行合并</span>
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

          <!-- 联动筛选提示 -->
          <el-alert
            v-if="selectedTargetPlan && selectedTargetPlan.productCode"
            type="info"
            :closable="false"
            show-icon
            style="margin-bottom: 16px"
          >
            <template slot="title">
              🔗 <strong>智能联动筛选</strong>：仅显示来自其他计划的、与目标计划产品一致的子批次（{{ selectedTargetPlan.productCode || '未知' }}），已自动排除目标计划自己的批次
            </template>
          </el-alert>

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
            <!-- ✅ 直接使用标准字段访问（接口已保证一致性） -->
            <el-table-column label="工艺模板" min-width="150" show-overflow-tooltip>
              <template slot-scope="scope">
                {{ (scope.row.processTemplate && scope.row.processTemplate.name) || '未设置' }}
              </template>
            </el-table-column>
            <!-- 🔧 新增：目标计划标识列 -->
            <el-table-column label="来源" width="100">
              <template slot-scope="scope">
                <el-tag
                  v-if="selectedTargetPlan && scope.row.parentPlanId === selectedTargetPlan.id"
                  type="success"
                  size="small"
                >
                  目标计划
                </el-tag>
                <el-tag
                  v-else
                  type="info"
                  size="small"
                >
                  其他计划
                </el-tag>
              </template>
            </el-table-column>
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
              <div>✓ 至少一个子批次来自其他计划（防止自合并）</div>
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
              {{ selectedTargetPlan ? (selectedTargetPlan.planNumber || '未知') : '未选择' }}
            </el-descriptions-item>
            <el-descriptions-item label="目标计划产品">
              {{ selectedTargetPlan ? (selectedTargetPlan.productCode || '未设置') : '未选择' }}
            </el-descriptions-item>
            <el-descriptions-item label="涉及来源计划数">
              {{ getSourcePlansCount() }}
            </el-descriptions-item>
            <el-descriptions-item label="来自其他计划的批次数" label-style="font-weight: 600; color: #409EFF;">
              {{ getItemsFromOtherPlansCount() }} / {{ selectedItems.length }}
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
            <el-table-column label="工艺一致性" width="110">
              <template slot-scope="scope">
                <el-tag
                  :type="scope.row.processTemplates.length > 1 ? 'danger' : 'success'"
                  size="small"
                >
                  {{ scope.row.processTemplates.length > 1 ? '不一致' : '一致' }}
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
  ITEM_STATUS_TYPE_MAP
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

      // 数据缓存（优化性能，避免重复调用接口）
      allPlansCache: [],

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
      // 优化：一次性获取所有需要的数据，避免重复调用接口
      this.fetchAllPlansData()
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
     * 🔧 修复：清理联动状态
     */
    resetForm() {
      // 清理缓存数据
      this.allPlansCache = []

      // 🔧 重要：先清理选择状态，避免联动触发
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

      // 清理表格选择状态
      if (this.$refs.itemsTable) {
        this.$refs.itemsTable.clearSelection()
      }
    },

    /**
     * 一次性获取所有计划数据并分离处理
     * 优化：避免重复调用接口，提升性能
     */
    async fetchAllPlansData() {
      try {
        this.loading = true
        this.targetPlanLoading = true
        this.itemsLoading = true

        const allPlans = await this.getAllPlansWithPagination()

        // 分离目标计划和子批次
        this.processPlansData(allPlans)
      } catch (error) {
        console.error('获取计划数据失败:', error)

        // 🔧 判断是否需要业务层显示错误消息
        // request.js 会自动显示以下类型的错误：VAL_*、SYS_*、5xx、429、423、403
        // 其他业务错误需要业务层显示
        const errorCode = error.code || error.response?.data?.error?.code
        const shouldShowMessage = !this.isErrorHandledByRequestLayer(errorCode, error.status)

        if (shouldShowMessage) {
          // ✅ 使用后端返回的错误消息
          const errorMessage = error.response?.data?.error?.message || error.message || '获取计划数据失败，请稍后重试'
          this.$message.error(errorMessage)
        }
      } finally {
        this.loading = false
        this.targetPlanLoading = false
        this.itemsLoading = false
      }
    },

    /**
     * 分页获取所有符合条件的计划数据
     * ⚡ 性能优化：只查询状态为 CONFIRMED 或 PARTIALLY_RELEASED 的计划
     */
    async getAllPlansWithPagination() {
      const allPlans = []

      // ⚡ 优化：分别查询两种状态的计划，减少不必要的数据传输
      // 注意：接口的 status 参数只支持单个值，不支持数组
      const statuses = [PLAN_STATUS.CONFIRMED, PLAN_STATUS.PARTIALLY_RELEASED]

      for (const status of statuses) {
        let currentPage = 1
        const pageSize = 100 // 接口限制最大为100
        let hasMore = true

        while (hasMore) {
          const params = {
            page: currentPage,
            limit: pageSize,
            status: status, // ⚡ 关键优化：传递状态参数进行后端筛选
            includeDetails: true // 获取子计划数据
          }

          const response = await fetchPlanList(params)
          if (response.success && response.data) {
            const plans = response.data.results || []
            allPlans.push(...plans)

            // 判断是否还有更多数据
            const pagination = response.data.pagination
            hasMore = pagination && currentPage < pagination.totalPages
            currentPage++
          } else {
            this.$message.error(response.error?.message || '获取计划列表失败')
            hasMore = false
            break
          }
        }
      }

      return allPlans
    },

    /**
     * 处理计划数据，分离目标计划和子批次
     * ⚡ 性能优化：后端已筛选状态，前端只需处理数据结构
     */
    processPlansData(allPlans) {
      // 缓存所有计划数据
      this.allPlansCache = allPlans

      const targetPlans = []
      const availableItems = []

      allPlans.forEach(plan => {
        // ⚡ 优化：后端已筛选状态为 CONFIRMED 或 PARTIALLY_RELEASED，无需重复判断
        targetPlans.push(plan)

        // 提取符合条件的子批次：状态为 DRAFT 或 READY_FOR_SCHEDULING
        if (plan.items && Array.isArray(plan.items)) {
          plan.items.forEach(item => {
            if (item.status === ITEM_STATUS.DRAFT || item.status === ITEM_STATUS.READY_FOR_SCHEDULING) {
              availableItems.push({
                ...item,
                planId: item.planId || plan.id, // 保持原有的planId，如果没有则使用父计划ID
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

      // 应用当前的筛选条件
      this.targetPlanList = this.applyTargetPlanFilters(targetPlans)
      this.itemsList = this.applyItemFilters(availableItems)
    },

    /**
     * 应用目标计划筛选条件
     */
    applyTargetPlanFilters(plans) {
      return plans.filter(plan => {
        const { planNumber, productCode, status } = this.targetPlanFilters

        if (planNumber && plan.planNumber && !plan.planNumber.toLowerCase().includes(planNumber.toLowerCase())) {
          return false
        }
        if (productCode && plan.productCode && !plan.productCode.toLowerCase().includes(productCode.toLowerCase())) {
          return false
        }
        if (status && plan.status !== status) {
          return false
        }

        return true
      })
    },

    /**
     * 应用子批次筛选条件
     * 🔧 新增：如果选择了目标计划，自动排除目标计划自己的批次（防止自合并）
     */
    applyItemFilters(items) {
      return items.filter(item => {
        // 🔧 核心筛选：如果已选择目标计划，排除目标计划自己的批次
        if (this.selectedTargetPlan && item.planId === this.selectedTargetPlan.id) {
          return false
        }

        const { planNumber, productCode, processTemplateName, status } = this.itemFilters

        if (planNumber && item.parentPlanNumber && !item.parentPlanNumber.toLowerCase().includes(planNumber.toLowerCase())) {
          return false
        }
        if (productCode && item.parentProductCode && !item.parentProductCode.toLowerCase().includes(productCode.toLowerCase())) {
          return false
        }
        // ✅ 直接使用标准字段访问（接口已保证一致性）
        if (processTemplateName) {
          const itemTemplateName = item.processTemplate?.name || '未设置'
          if (!itemTemplateName.toLowerCase().includes(processTemplateName.toLowerCase())) {
            return false
          }
        }
        if (status && item.status !== status) {
          return false
        }

        return true
      })
    },

    /**
     * 获取目标计划列表（优化为本地筛选）
     * 兼容原有的搜索和重置功能，但使用缓存数据
     */
    async fetchTargetPlans() {
      // 如果没有缓存数据，先获取全部数据
      if (!this.allPlansCache || this.allPlansCache.length === 0) {
        await this.fetchAllPlansData()
        return
      }

      try {
        this.targetPlanLoading = true

        // ⚡ 优化：缓存中的数据已经是筛选过的，无需重复判断状态
        // 直接应用搜索筛选条件即可
        this.targetPlanList = this.applyTargetPlanFilters(this.allPlansCache)
      } catch (error) {
        console.error('筛选目标计划失败:', error)

        // 🔧 判断是否需要业务层显示错误消息
        const errorCode = error.code || error.response?.data?.error?.code
        const shouldShowMessage = !this.isErrorHandledByRequestLayer(errorCode, error.status)

        if (shouldShowMessage) {
          const errorMessage = error.response?.data?.error?.message || error.message || '筛选目标计划失败，请稍后重试'
          this.$message.error(errorMessage)
        }
      } finally {
        this.targetPlanLoading = false
      }
    },

    /**
     * 获取可合并的子批次列表（优化为本地筛选）
     * 兼容原有的搜索和重置功能，但使用缓存数据
     */
    async fetchAvailableItems() {
      // 如果没有缓存数据，先获取全部数据
      if (!this.allPlansCache || this.allPlansCache.length === 0) {
        await this.fetchAllPlansData()
        // fetchAllPlansData 中已经调用了 processPlansData，数据已设置完毕
        return
      }

      try {
        this.itemsLoading = true

        // ⚡ 优化：从缓存中提取符合条件的子批次
        // 缓存中的父计划状态已由后端筛选（CONFIRMED 或 PARTIALLY_RELEASED）
        // 只需检查子批次状态为 DRAFT 或 READY_FOR_SCHEDULING
        const availableItems = []
        this.allPlansCache.forEach(plan => {
          if (plan.items && Array.isArray(plan.items)) {
            plan.items.forEach(item => {
              // 只保留草稿或待排程状态的子批次
              if (item.status === ITEM_STATUS.DRAFT || item.status === ITEM_STATUS.READY_FOR_SCHEDULING) {
                availableItems.push({
                  ...item,
                  planId: item.planId || plan.id, // 保持原有的planId，如果没有则使用父计划ID
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

        // 应用筛选条件
        this.itemsList = this.applyItemFilters(availableItems)
      } catch (error) {
        console.error('筛选子批次列表失败:', error)

        // 🔧 判断是否需要业务层显示错误消息
        const errorCode = error.code || error.response?.data?.error?.code
        const shouldShowMessage = !this.isErrorHandledByRequestLayer(errorCode, error.status)

        if (shouldShowMessage) {
          const errorMessage = error.response?.data?.error?.message || error.message || '筛选子批次列表失败，请稍后重试'
          this.$message.error(errorMessage)
        }
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
     * 🔧 修复：实现目标计划与子批次列表的联动
     */
    handleTargetPlanChange(row) {
      this.selectedTargetPlan = row

      // 🔧 联动更新：目标计划选择后，重新筛选子批次列表
      if (row) {
        this.updateItemsListByTargetPlan()
      } else {
        // 取消选择时，显示所有可用子批次
        this.refreshItemsList()
      }

      this.performValidation()
    },

    /**
     * 根据目标计划更新子批次列表（联动筛选）
     * 🔧 新增：实现产品兼容性筛选 + 排除目标计划自己的批次（防止自合并）
     */
    updateItemsListByTargetPlan() {
      if (!this.selectedTargetPlan || !this.allPlansCache || this.allPlansCache.length === 0) {
        return
      }

      try {
        this.itemsLoading = true

        // ⚡ 优化：从缓存中提取符合条件的子批次
        // 缓存中的父计划状态已由后端筛选（CONFIRMED 或 PARTIALLY_RELEASED）
        // 只需检查：1. 子批次状态  2. 产品ID与目标计划一致  3. 不是目标计划自己的批次
        const availableItems = []
        this.allPlansCache.forEach(plan => {
          if (plan.items && Array.isArray(plan.items)) {
            plan.items.forEach(item => {
              // 只保留草稿或待排程状态的子批次
              if (item.status === ITEM_STATUS.DRAFT || item.status === ITEM_STATUS.READY_FOR_SCHEDULING) {
                // 🔧 关键筛选条件：
                // 1. 产品ID与目标计划一致
                // 2. 不是目标计划自己的批次（防止自合并）
                if (plan.productId === this.selectedTargetPlan.productId &&
                    plan.id !== this.selectedTargetPlan.id) {
                  availableItems.push({
                    ...item,
                    planId: item.planId || plan.id,
                    parentPlanNumber: plan.planNumber,
                    parentPlanId: plan.id,
                    parentProductId: plan.productId,
                    parentProductCode: plan.productCode,
                    parentProductName: plan.productName
                  })
                }
              }
            })
          }
        })

        // 应用搜索筛选条件
        this.itemsList = this.applyItemFilters(availableItems)
      } catch (error) {
        console.error('根据目标计划筛选子批次失败:', error)

        // 🔧 判断是否需要业务层显示错误消息
        const errorCode = error.code || error.response?.data?.error?.code
        const shouldShowMessage = !this.isErrorHandledByRequestLayer(errorCode, error.status)

        if (shouldShowMessage) {
          const errorMessage = error.response?.data?.error?.message || error.message || '根据目标计划筛选子批次失败，请稍后重试'
          this.$message.error(errorMessage)
        }
      } finally {
        this.itemsLoading = false
      }
    },

    /**
     * 刷新子批次列表（显示所有可用子批次）
     * 🔧 新增：取消目标计划选择时的回退逻辑
     */
    refreshItemsList() {
      if (!this.allPlansCache || this.allPlansCache.length === 0) {
        return
      }

      try {
        this.itemsLoading = true

        // ⚡ 优化：从缓存中提取所有符合条件的子批次（不限制产品）
        // 缓存中的父计划状态已由后端筛选（CONFIRMED 或 PARTIALLY_RELEASED）
        // 只需检查子批次状态为 DRAFT 或 READY_FOR_SCHEDULING
        const availableItems = []
        this.allPlansCache.forEach(plan => {
          if (plan.items && Array.isArray(plan.items)) {
            plan.items.forEach(item => {
              // 只保留草稿或待排程状态的子批次
              if (item.status === ITEM_STATUS.DRAFT || item.status === ITEM_STATUS.READY_FOR_SCHEDULING) {
                availableItems.push({
                  ...item,
                  planId: item.planId || plan.id,
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

        // 应用搜索筛选条件
        this.itemsList = this.applyItemFilters(availableItems)
      } catch (error) {
        console.error('刷新子批次列表失败:', error)

        // 🔧 判断是否需要业务层显示错误消息
        const errorCode = error.code || error.response?.data?.error?.code
        const shouldShowMessage = !this.isErrorHandledByRequestLayer(errorCode, error.status)

        if (shouldShowMessage) {
          const errorMessage = error.response?.data?.error?.message || error.message || '刷新子批次列表失败，请稍后重试'
          this.$message.error(errorMessage)
        }
      } finally {
        this.itemsLoading = false
      }
    },

    /**
     * 子批次搜索
     * 🔧 修复：考虑目标计划选择状态的搜索
     */
    handleItemSearch() {
      if (this.selectedTargetPlan) {
        // 如果已选择目标计划，使用联动筛选
        this.updateItemsListByTargetPlan()
      } else {
        // 未选择目标计划，显示所有可用子批次
        this.fetchAvailableItems()
      }
    },

    /**
     * 子批次重置
     * 🔧 修复：考虑目标计划选择状态的重置
     */
    handleItemReset() {
      this.itemFilters = {
        planNumber: '',
        productCode: '',
        processTemplateName: '',
        status: ''
      }

      if (this.selectedTargetPlan) {
        // 如果已选择目标计划，使用联动筛选
        this.updateItemsListByTargetPlan()
      } else {
        // 未选择目标计划，显示所有可用子批次
        this.fetchAvailableItems()
      }
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

      // 0. 验证必须选择子批次（按接口文档要求）
      if (this.selectedItems.length === 0) {
        this.validationErrors.push('必须指定至少一个子计划ID')
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

      // 1.1 验证目标计划未被冻结（按接口文档要求）
      if (this.selectedTargetPlan.isFrozen) {
        this.validationErrors.push('目标计划已被冻结，无法进行合并操作')
      }

      // 2. 验证所有子批次状态
      const invalidStatusItems = this.selectedItems.filter(
        item => ![ITEM_STATUS.DRAFT, ITEM_STATUS.READY_FOR_SCHEDULING].includes(item.status)
      )
      if (invalidStatusItems.length > 0) {
        this.validationErrors.push(`有 ${invalidStatusItems.length} 个子批次状态不符合要求，只能合并"草稿"或"待排程"状态的子批次`)
      }

      // 🔧 修复：验证必须至少有一个来自其他计划的批次（防止自合并）
      // 业务规则：合并操作必须选择其他计划的批次，不能将计划自己的批次合并到自己
      const itemsFromOtherPlans = this.selectedItems.filter(item => item.planId !== this.selectedTargetPlan.id)
      if (itemsFromOtherPlans.length === 0) {
        this.validationErrors.push('合并操作必须选择至少一个来自其他计划的批次，不能将计划自己的批次合并到自己')
      }

      // 4. 验证产品一致性（所有来源计划的产品必须与目标计划一致）
      const targetProductId = this.selectedTargetPlan.productId
      const productMismatchItems = this.selectedItems.filter(item => item.parentProductId !== targetProductId)
      if (productMismatchItems.length > 0) {
        const uniqueProducts = [...new Set(productMismatchItems.map(item => item.parentProductCode))]
        this.validationErrors.push(
          `产品不一致：目标计划产品为 "${this.selectedTargetPlan.productCode || '未知'}"，但有 ${productMismatchItems.length} 个子批次的产品不匹配（${uniqueProducts.join(', ')}）`
        )
      }

      // 5. 验证来源计划状态（按接口文档要求）
      const sourcePlanStatusErrors = this.validateSourcePlansStatus()
      if (sourcePlanStatusErrors.length > 0) {
        this.validationErrors.push(...sourcePlanStatusErrors)
      }

      // 5.1 验证来源计划未被冻结（按接口文档要求）
      const frozenPlanErrors = this.validateSourcePlansFrozenStatus()
      if (frozenPlanErrors.length > 0) {
        this.validationErrors.push(...frozenPlanErrors)
      }

      // 6. 验证工艺模板一致性（按来源计划分组验证）
      const processTemplateErrors = this.validateProcessTemplatesByPlan()
      if (processTemplateErrors.length > 0) {
        this.validationErrors.push(...processTemplateErrors)
      }
    },

    /**
     * 验证来源计划的状态
     * 接口文档要求：来源计划状态必须是 CONFIRMED 或 PARTIALLY_RELEASED
     */
    validateSourcePlansStatus() {
      const errors = []

      if (!this.allPlansCache || this.allPlansCache.length === 0) {
        return errors
      }

      // 获取所有涉及的来源计划ID（排除目标计划）
      const sourcePlanIds = new Set()
      this.selectedItems.forEach(item => {
        if (item.planId !== this.selectedTargetPlan.id) {
          sourcePlanIds.add(item.planId)
        }
      })

      // 检查每个来源计划的状态
      sourcePlanIds.forEach(planId => {
        const sourcePlan = this.allPlansCache.find(plan => plan.id === planId)
        if (sourcePlan && ![PLAN_STATUS.CONFIRMED, PLAN_STATUS.PARTIALLY_RELEASED].includes(sourcePlan.status)) {
          errors.push(`来源计划 "${sourcePlan.planNumber}" 状态为"${this.getPlanStatusLabel(sourcePlan.status)}"，不允许合并。仅允许"已确认"或"部分下发"状态的计划`)
        }
      })

      return errors
    },

    /**
     * 验证来源计划的冻结状态
     * 接口文档要求：目标计划和来源计划均未被冻结（isFrozen = false）
     */
    validateSourcePlansFrozenStatus() {
      const errors = []

      if (!this.allPlansCache || this.allPlansCache.length === 0) {
        return errors
      }

      // 获取所有涉及的来源计划ID（排除目标计划）
      const sourcePlanIds = new Set()
      this.selectedItems.forEach(item => {
        if (item.planId !== this.selectedTargetPlan.id) {
          sourcePlanIds.add(item.planId)
        }
      })

      // 检查每个来源计划的冻结状态
      sourcePlanIds.forEach(planId => {
        const sourcePlan = this.allPlansCache.find(plan => plan.id === planId)
        if (sourcePlan && sourcePlan.isFrozen) {
          errors.push(`来源计划 "${sourcePlan.planNumber}" 已被冻结，无法进行合并操作`)
        }
      })

      return errors
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
        // ✅ 直接使用标准字段访问（接口已保证一致性）
        const templateIds = group.items.map(item => item.processTemplate?.id || targetTemplateId)
        const uniqueTemplateIds = [...new Set(templateIds)]

        if (uniqueTemplateIds.length > 1) {
          // ✅ 直接使用标准字段访问
          const templateNames = group.items.map(item => item.processTemplate?.name || '未设置')
          const uniqueTemplateNames = [...new Set(templateNames)]
          errors.push(
            `来源计划 "${group.planNumber}" 的子批次工艺模板不一致（${uniqueTemplateNames.join(', ')}），同一计划的子批次必须使用相同工艺模板`
          )
        }
      })

      return errors
    },

    /**
     * 获取目标计划的工艺模板名称
     * 从第一个子批次中获取工艺模板名称
     */
    getTargetPlanProcessTemplateName() {
      if (!this.selectedTargetPlan) return '未设置'
      if (!this.selectedTargetPlan.items || this.selectedTargetPlan.items.length === 0) return '未设置'

      const firstItem = this.selectedTargetPlan.items[0]
      if (!firstItem.processTemplate) return '未设置'

      return firstItem.processTemplate.name || '未设置'
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
     * 🔧 新增：获取来自其他计划的批次数量（防止自合并）
     */
    getItemsFromOtherPlansCount() {
      if (!this.selectedTargetPlan || this.selectedItems.length === 0) {
        return 0
      }
      return this.selectedItems.filter(item => item.planId !== this.selectedTargetPlan.id).length
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
      const quantity = this.selectedTargetPlan.demandQuantity || 0
      const unit = this.selectedTargetPlan.demandUnit || '吨'
      return `${quantity} ${unit}`
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
        // ✅ 直接使用标准字段访问（接口已保证一致性）
        groupedByPlan[planId].processTemplates.add(item.processTemplate?.name || '未设置')
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
     * 判断错误是否已被 request.js 层处理（显示过消息）
     * 根据 request.js 的 handleCommonErrors 逻辑判断
     * @param {string} errorCode - 错误码
     * @param {number} status - HTTP状态码
     * @returns {boolean} 是否已被request层处理（显示过消息）
     */
    isErrorHandledByRequestLayer(errorCode, status) {
      if (!errorCode && !status) {
        return false
      }

      // 1. 验证错误（VAL_*）- request.js 已显示
      if (errorCode && errorCode.startsWith('VAL_')) {
        return true
      }

      // 2. 系统错误（SYS_*）- request.js 已显示
      if (errorCode && errorCode.startsWith('SYS_')) {
        return true
      }

      // 3. 速率限制错误 - request.js 已显示
      if (status === 429 || ['AUTH_020', 'AUTH_021', 'AUTH_022'].includes(errorCode)) {
        return true
      }

      // 4. 账户锁定错误 - request.js 已显示
      if (status === 423 || ['AUTH_014', 'AUTH_015'].includes(errorCode)) {
        return true
      }

      // 5. 权限不足错误 - request.js 已显示
      if (status === 403 || errorCode === 'AUTH_006' || errorCode === 'AUTH_009' || errorCode === 'FORBIDDEN') {
        return true
      }

      // 6. HTTP 5xx 错误 - request.js 已显示
      if (status >= 500) {
        return true
      }

      // 其他业务错误 - request.js 未显示，需要业务层处理
      return false
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
          // 🔧 新增：处理自合并错误码（业务规则修复）
          if (response.error?.code === 'PRODUCTION_PLAN_MERGE_INVALID_PAYLOAD') {
            const errorMsg = response.error?.message || '合并操作必须选择其他计划的批次，不能将计划自己的批次合并到自己'
            this.$message({
              type: 'warning',
              message: errorMsg,
              duration: 5000,
              showClose: true
            })
          } else {
            // 其他失败情况
            this.$message.error(response.error?.message || '合并生产计划失败')
          }
        }
      } catch (error) {
        console.error('合并生产计划失败:', error)

        // 🔧 处理自合并错误码（业务规则修复）
        if (error.response?.data?.error?.code === 'PRODUCTION_PLAN_MERGE_INVALID_PAYLOAD') {
          const errorMsg = error.response.data.error.message || '合并操作必须选择其他计划的批次，不能将计划自己的批次合并到自己'
          this.$message({
            type: 'warning',
            message: errorMsg,
            duration: 5000,
            showClose: true
          })
          return
        }

        // 🔧 判断是否需要业务层显示错误消息
        const errorCode = error.code || error.response?.data?.error?.code
        const shouldShowMessage = !this.isErrorHandledByRequestLayer(errorCode, error.status)

        if (shouldShowMessage) {
          // ✅ 使用后端返回的错误消息
          const errorMessage = error.response?.data?.error?.message || error.message || '合并生产计划失败，请稍后重试'
          this.$message.error(errorMessage)
        }
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

