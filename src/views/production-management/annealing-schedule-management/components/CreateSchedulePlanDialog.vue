/**
 * 文件名称：CreateSchedulePlanDialog.vue
 * 文件描述：创建排程方案对话框组件（向导式表单）
 * 创建日期：2025-10-23
 * 修改记录：
 *   - 2025-10-23: 初始创建，实现P0阶段和P1阶段第11项功能
 *   - 2025-10-25: 删除配置模板功能（保存/加载模板），当前版本不需要
 *   - 2025-10-31: 适配后端接口变更，改为用户指定任务ID（taskIds），移除taskFilters参数
 *   - 2025-10-31: 新增任务选择功能，预览对话框支持勾选任务，强制要求用户选择任务
 *   - 2025-11-01: 🔐 重大架构升级：移除前端锁定逻辑，后端统一在事务内管理任务锁定
 *   - 2025-11-01: 简化创建流程，直接调用创建接口，后端自动锁定、验证、创建、回滚
 *   - 2025-11-01: 新增409错误处理，详细展示任务不可用原因（已被使用/锁定/状态不对）
 *   - 2025-11-01: 适配后端接口更新，使用 schedulingStatus.isLocked 判断任务锁定状态
 */
<template>
  <el-dialog
    :visible.sync="dialogVisible"
    title="创建排程方案"
    width="900px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :before-close="handleClose"
    class="create-schedule-plan-dialog"
  >
    <div class="create-schedule-plan-dialog__body">
      <!-- 步骤指示器 -->
      <el-steps :active="currentStep" finish-status="success" align-center class="create-schedule-plan-dialog__steps">
        <el-step title="基本信息" />
        <el-step title="选择任务" />
        <el-step title="确认提交" />
      </el-steps>

      <el-form
        ref="formRef"
        :model="formData"
        :rules="validationRules"
        label-width="140px"
        class="create-schedule-plan-dialog__form"
      >
        <!-- 第一步：基本信息配置 -->
        <div v-show="currentStep === 0" class="create-schedule-plan-dialog__step">
          <el-form-item label="排程时间范围" prop="timeRange">
            <el-date-picker
              v-model="formData.timeRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              value-format="yyyy-MM-dd HH:mm:ss"
              :picker-options="timeRangePickerOptions"
              style="width: 100%"
            />
            <div class="create-schedule-plan-dialog__hint">
              建议排程时间范围不超过30天，以保证算法性能
            </div>
          </el-form-item>

          <el-form-item label="方案名称" prop="planName">
            <el-input
              v-model="formData.planName"
              placeholder="请输入方案名称（可选）"
              maxlength="200"
              show-word-limit
            />
            <div class="create-schedule-plan-dialog__hint">
              如不填写，系统将自动生成方案编号
            </div>
          </el-form-item>

          <el-form-item label="算法类型" prop="algorithmType">
            <el-radio-group v-model="formData.algorithmType">
              <el-radio
                v-for="algo in algorithmOptions"
                :key="algo.value"
                :label="algo.value"
                :disabled="algo.disabled"
                class="create-schedule-plan-dialog__algo-option"
              >
                <div class="create-schedule-plan-dialog__algo-label">
                  <span>{{ algo.label }}</span>
                  <el-rate
                    v-model="algo.recommended"
                    disabled
                    show-score
                    text-color="#ff9900"
                    :max="5"
                    :allow-half="false"
                    style="margin-left: 10px"
                  />
                </div>
                <div class="create-schedule-plan-dialog__algo-desc">{{ algo.description }}</div>
              </el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="备注说明" prop="remarks">
            <el-input
              v-model="formData.remarks"
              type="textarea"
              :rows="3"
              placeholder="请输入备注说明（可选）"
              maxlength="1000"
              show-word-limit
            />
          </el-form-item>
        </div>

        <!-- 第二步：任务筛选条件配置 -->
        <div v-show="currentStep === 1" class="create-schedule-plan-dialog__step">
          <el-alert
            type="info"
            :closable="false"
            show-icon
            style="margin-bottom: 20px;"
          >
            <template slot="title">
              <strong>说明</strong>：筛选条件仅用于预览任务列表，请点击"预览待排程任务"后勾选要排程的任务
            </template>
          </el-alert>

          <div class="create-schedule-plan-dialog__section-title">
            任务筛选条件（可选，不填写表示不限制）
          </div>

          <el-form-item label="产品编码" prop="taskFilters.productCode">
            <el-input
              v-model="formData.taskFilters.productCode"
              placeholder="请输入产品编码"
            />
          </el-form-item>

          <el-form-item label="合金牌号" prop="taskFilters.alloyGrade">
            <el-input
              v-model="formData.taskFilters.alloyGrade"
              placeholder="请输入合金牌号"
            />
          </el-form-item>

          <el-form-item label="优先级" prop="taskFilters.priorities">
            <el-checkbox-group v-model="formData.taskFilters.priorities">
              <el-checkbox v-for="priority in priorityOptions" :key="priority.value" :label="priority.value">
                {{ priority.label }}
              </el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <el-form-item label="交货日期范围" prop="taskFilters.deliveryDateRange">
            <el-date-picker
              v-model="formData.taskFilters.deliveryDateRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="yyyy-MM-dd HH:mm:ss"
              style="width: 100%"
            />
            <div class="create-schedule-plan-dialog__hint">
              根据生产计划的交货期筛选待排程任务
            </div>
          </el-form-item>

          <el-form-item label="重量范围" prop="taskFilters.weightRange">
            <el-col :span="11">
              <el-input-number
                v-model="formData.taskFilters.minActualWeight"
                :min="0.01"
                :max="100"
                :precision="2"
                :controls="false"
                placeholder="最小实际重量"
                style="width: 100%"
              />
            </el-col>
            <el-col :span="2" style="text-align: center">-</el-col>
            <el-col :span="11">
              <el-input-number
                v-model="formData.taskFilters.maxActualWeight"
                :min="0.01"
                :max="100"
                :precision="2"
                :controls="false"
                placeholder="最大实际重量"
                style="width: 100%"
              />
            </el-col>
            <div class="create-schedule-plan-dialog__hint">
              单位：吨（基于任务的实际重量筛选）
            </div>
          </el-form-item>

          <!-- 高级筛选选项 -->
          <el-collapse v-model="advancedFiltersExpanded">
            <el-collapse-item title="高级筛选选项（可选）" name="advancedFilters">
              <el-form-item label="生产计划ID" label-width="140px">
                <el-input
                  v-model="formData.taskFilters.planId"
                  placeholder="请输入生产计划ID（精确匹配）"
                />
                <div class="create-schedule-plan-dialog__hint">
                  按单个生产计划ID筛选任务
                </div>
              </el-form-item>

              <el-form-item label="混炉分组编码" label-width="140px">
                <el-input
                  v-model="formData.taskFilters.mixingGroupCode"
                  placeholder="请输入混炉分组编码"
                />
                <div class="create-schedule-plan-dialog__hint">
                  筛选指定混炉分组的任务
                </div>
              </el-form-item>

              <el-form-item label="包含已锁定任务" label-width="140px">
                <el-switch v-model="formData.taskFilters.includeScheduleLocked" />
                <div class="create-schedule-plan-dialog__hint">
                  是否包含已被其他排程方案锁定的任务
                </div>
              </el-form-item>
            </el-collapse-item>
          </el-collapse>

          <el-form-item>
            <el-button type="primary" size="small" :loading="previewing" @click="previewTasks">
              <i class="el-icon-view" /> 预览待排程任务
            </el-button>
            <span v-if="selectedTasks.length > 0" class="create-schedule-plan-dialog__preview-result">
              已选择{{ selectedTasks.length }}个任务，总重量{{ selectedTotalWeight }}吨
            </span>
            <span v-else-if="previewTaskCount !== null" class="create-schedule-plan-dialog__preview-result" style="color: #909399;">
              预览到{{ previewTaskCount }}个待排程任务（未选择）
            </span>
          </el-form-item>
        </div>

        <!-- 第三步：确认与提交 -->
        <div v-show="currentStep === 2" class="create-schedule-plan-dialog__step">
          <div class="create-schedule-plan-dialog__section-title">
            确认配置信息
          </div>

          <div class="create-schedule-plan-dialog__summary">
            <el-descriptions :column="2" border size="small">
              <el-descriptions-item label="排程时间范围" :span="2">
                <span v-if="formData.timeRange && formData.timeRange.length === 2">
                  {{ formData.timeRange[0] }} 至 {{ formData.timeRange[1] }}
                </span>
                <span v-else>-</span>
              </el-descriptions-item>

              <el-descriptions-item label="方案名称" :span="2">
                {{ formData.planName || '自动生成' }}
              </el-descriptions-item>

              <el-descriptions-item label="算法类型" :span="2">
                {{ getAlgorithmText(formData.algorithmType) }}
              </el-descriptions-item>

              <el-descriptions-item label="任务筛选条件" :span="2">
                {{ formatTaskFilters() }}
              </el-descriptions-item>

              <el-descriptions-item label="备注说明" :span="2">
                {{ formData.remarks || '-' }}
              </el-descriptions-item>

              <el-descriptions-item label="预计任务数量" :span="2">
                <span v-if="previewTaskCount !== null">{{ previewTaskCount }}个任务</span>
                <span v-else>未预览</span>
              </el-descriptions-item>

              <el-descriptions-item label="已选择任务" :span="2">
                <span v-if="selectedTasks.length > 0" class="selected-tasks-info">
                  <el-tag type="success" size="small">{{ selectedTasks.length }}个任务</el-tag>
                  <span style="margin-left: 10px;">总重量: {{ selectedTotalWeight }} 吨</span>
                </span>
                <span v-else class="text-danger">
                  <i class="el-icon-error" /> 未选择任务，请返回第二步选择任务
                </span>
              </el-descriptions-item>
            </el-descriptions>
          </div>

          <div v-if="submitting" class="create-schedule-plan-dialog__progress">
            <el-progress :percentage="submitProgress" :status="submitStatus || undefined" />
            <p class="create-schedule-plan-dialog__progress-text">{{ submitProgressText }}</p>
          </div>
        </div>
      </el-form>
    </div>

    <div slot="footer" class="create-schedule-plan-dialog__footer">
      <el-button v-if="currentStep > 0" @click="prevStep">上一步</el-button>
      <el-button @click="handleClose">取消</el-button>
      <el-button v-if="currentStep < 2" type="primary" @click="nextStep">下一步</el-button>
      <el-button v-if="currentStep === 2" type="primary" :loading="submitting" @click="handleSubmit">
        确认创建
      </el-button>
    </div>

    <!-- 预览待排程任务对话框 -->
    <el-dialog
      :visible.sync="previewDialogVisible"
      title="预览待排程任务"
      width="1600px"
      append-to-body
      class="preview-tasks-dialog"
    >
      <div v-if="previewLoading" class="preview-tasks-dialog__loading">
        <el-spinner />
        <p>正在查询待排程任务...</p>
      </div>

      <div v-else-if="previewData" class="preview-tasks-dialog__content">
        <!-- 统计信息 -->
        <el-alert
          type="info"
          :closable="false"
          class="preview-tasks-dialog__summary"
        >
          <div slot="title">
            <strong>查询结果：</strong>
            共找到 <span class="highlight">{{ previewData.totalCount }}</span> 个待排程任务，
            总重量 <span class="highlight">{{ previewTotalWeight }}</span> 吨
          </div>
        </el-alert>

        <!-- 选择统计和操作按钮 -->
        <div class="preview-tasks-dialog__toolbar">
          <div class="toolbar-left">
            <el-button size="small" type="primary" @click="handleSelectAvailable">仅选可用</el-button>
            <el-button size="small" @click="handleClearSelection">清空选择</el-button>
          </div>
          <div class="toolbar-right">
            <span v-if="selectedTasks.length > 0" class="selection-info">
              已选择 <span class="highlight-count">{{ selectedTasks.length }}</span> 个任务，
              总重量 <span class="highlight-count">{{ selectedTotalWeight }}</span> 吨
            </span>
            <span v-else class="selection-info-empty">
              请勾选要排程的任务
            </span>
          </div>
        </div>

        <!-- 任务列表 -->
        <el-table
          ref="previewTable"
          :data="previewData.tasks"
          border
          stripe
          max-height="500"
          class="preview-tasks-dialog__table"
          @selection-change="handlePreviewSelectionChange"
        >
          <!-- 勾选列 -->
          <el-table-column
            type="selection"
            width="55"
            :selectable="checkTaskSelectable"
            fixed
          />
          <el-table-column prop="taskCode" label="任务编号" width="200" fixed />
          <el-table-column prop="taskName" label="任务名称" width="180" show-overflow-tooltip />

          <!-- 产品信息 -->
          <el-table-column label="产品信息" width="220">
            <template slot-scope="{ row }">
              <div class="product-info">
                <div class="product-code">{{ row.productCode }}</div>
                <div class="product-name">{{ row.productName || '-' }}</div>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="alloyGrade" label="合金牌号" width="90" align="center" />

          <!-- 优先级（任务+计划） -->
          <el-table-column label="优先级" width="100">
            <template slot-scope="{ row }">
              <el-tag :type="getPriorityTagType(row.priority)" size="mini">
                {{ getPriorityText(row.priority) }}
              </el-tag>
              <div v-if="row.planInfo && row.planInfo.planPriority" class="plan-priority">
                计划: {{ getPriorityText(row.planInfo.planPriority) }}
              </div>
            </template>
          </el-table-column>

          <!-- 重量和物料 -->
          <el-table-column label="任务重量(吨)" width="130" align="right">
            <template slot-scope="{ row }">
              <div class="weight-info">
                <div class="actual-weight">
                  实际: {{ row.actualWeight !== null && row.actualWeight !== undefined ? row.actualWeight.toFixed(2) : '-' }}
                </div>
                <div class="planned-weight">
                  计划: {{ row.plannedWeight ? row.plannedWeight.toFixed(2) : '-' }}
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="materialCount" label="物料数" width="80" align="center" />

          <!-- 工艺模板 -->
          <el-table-column label="工艺模板" width="140" show-overflow-tooltip>
            <template slot-scope="{ row }">
              {{ row.processTemplate ? row.processTemplate.templateName : '-' }}
            </template>
          </el-table-column>

          <!-- 生产计划信息 -->
          <el-table-column label="生产计划" width="160" show-overflow-tooltip>
            <template slot-scope="{ row }">
              <div v-if="row.planInfo" class="plan-info">
                <div class="plan-number">{{ row.planInfo.planNumber }}</div>
                <div class="customer-name">{{ row.planInfo.customerName || '-' }}</div>
              </div>
              <span v-else>-</span>
            </template>
          </el-table-column>

          <!-- 交货日期 - 关键！ -->
          <el-table-column label="交货日期" width="115" align="center">
            <template slot-scope="{ row }">
              <span :class="getDeliveryDateClass(row.requiredCompletionDate)">
                {{ formatDate(row.requiredCompletionDate) }}
              </span>
            </template>
          </el-table-column>

          <!-- 排程锁定状态 -->
          <el-table-column label="锁定状态" width="90" align="center">
            <template slot-scope="{ row }">
              <el-tooltip v-if="getTaskLockStatus(row)" placement="top">
                <div slot="content">
                  锁定至: {{ formatDateTime(row.scheduleLockedUntil) }}<br>
                  被其他排程方案锁定中
                </div>
                <el-tag type="warning" size="mini">已锁定</el-tag>
              </el-tooltip>
              <el-tag v-else type="success" size="mini">可用</el-tag>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <el-pagination
          v-if="previewData.totalCount > previewPageSize"
          :current-page.sync="previewPageNum"
          :page-size="previewPageSize"
          :total="previewData.totalCount"
          layout="total, prev, pager, next"
          class="preview-tasks-dialog__pagination"
          @current-change="handlePreviewPageChange"
        />
      </div>

      <div v-else class="preview-tasks-dialog__empty">
        <el-empty description="暂无数据" />
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="previewDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          :disabled="selectedTasks.length === 0"
          @click="confirmTaskSelection"
        >
          确定选择（{{ selectedTasks.length }}个任务）
        </el-button>
      </div>
    </el-dialog>
  </el-dialog>
</template>

<script>
import { createSchedulePlan, fetchPendingTasks } from '../api'
import {
  ALGORITHM_TYPE_SELECT_OPTIONS,
  PRIORITY_OPTIONS,
  CREATE_PLAN_VALIDATION_RULES,
  TIME_RANGE_SHORTCUTS
} from '../constants'
import errorMixin from '@/mixins/errorMixin'

export default {
  name: 'CreateSchedulePlanDialog',
  mixins: [errorMixin],
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      dialogVisible: false,
      currentStep: 0,
      submitting: false,
      submitProgress: 0,
      submitStatus: '',
      submitProgressText: '正在提交...',
      previewTaskCount: null,
      previewTotalWeight: 0,
      previewDialogVisible: false,
      previewLoading: false,
      previewing: false,
      previewData: null,
      previewPageNum: 1,
      previewPageSize: 50,
      advancedFiltersExpanded: [],
      selectedTasks: [], // 预览对话框中选中的任务
      selectedTotalWeight: 0, // 选中任务的总重量
      formData: {
        timeRange: [],
        planName: '',
        algorithmType: 'rule-based',
        remarks: '',
        taskFilters: {
          productCode: '',
          alloyGrade: '',
          priorities: [],
          deliveryDateRange: [],
          minActualWeight: null,
          maxActualWeight: null,
          // 新增的可选参数（2025-10-24接口更新）
          planId: '',
          mixingGroupCode: '',
          includeScheduleLocked: false
        }
      },
      validationRules: {
        ...CREATE_PLAN_VALIDATION_RULES,
        timeRange: [
          { validator: this.validateTimeRange, trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    algorithmOptions() {
      return ALGORITHM_TYPE_SELECT_OPTIONS
    },
    priorityOptions() {
      return PRIORITY_OPTIONS
    },
    timeRangePickerOptions() {
      return {
        shortcuts: TIME_RANGE_SHORTCUTS
      }
    }
  },
  watch: {
    visible: {
      handler(val) {
        this.dialogVisible = val
        if (val) {
          this.resetForm()
        }
      },
      immediate: true
    }
  },
  methods: {
    /**
     * 验证时间范围
     */
    validateTimeRange(rule, value, callback) {
      if (!value || value.length !== 2) {
        callback(new Error('请选择完整的时间范围'))
        return
      }
      const [start, end] = value
      if (new Date(start) >= new Date(end)) {
        callback(new Error('结束时间必须晚于开始时间'))
        return
      }
      callback()
    },

    /**
     * 下一步
     */
    nextStep() {
      // 验证当前步骤
      if (this.currentStep === 0) {
        // 验证当前步骤基础信息
        this.$refs.formRef.validate((valid) => {
          if (valid) {
            this.currentStep++
          }
        })
      } else {
        // 其他步骤直接进入下一步
        this.currentStep++
      }
    },

    /**
     * 上一步
     */
    prevStep() {
      if (this.currentStep > 0) {
        this.currentStep--
      }
    },

    /**
     * 获取算法文本
     */
    getAlgorithmText(type) {
      const algo = this.algorithmOptions.find(a => a.value === type)
      return algo ? algo.label : type
    },

    /**
     * 格式化任务筛选条件
     */
    formatTaskFilters() {
      const filters = []
      const {
        productCode,
        alloyGrade,
        priorities,
        deliveryDateRange,
        minActualWeight,
        maxActualWeight,
        planId,
        mixingGroupCode,
        includeScheduleLocked
      } = this.formData.taskFilters

      if (productCode) filters.push(`产品编码:${productCode}`)
      if (alloyGrade) filters.push(`合金牌号:${alloyGrade}`)
      if (priorities && priorities.length > 0) filters.push(`优先级:${priorities.join(',')}`)
      if (deliveryDateRange && deliveryDateRange.length === 2) {
        filters.push(`交货日期:${deliveryDateRange[0]}至${deliveryDateRange[1]}`)
      }
      if (minActualWeight !== null || maxActualWeight !== null) {
        filters.push(`实际重量:${minActualWeight || 0}-${maxActualWeight || '不限'}吨`)
      }
      if (planId) filters.push(`生产计划ID:${planId}`)
      if (mixingGroupCode) filters.push(`混炉分组:${mixingGroupCode}`)
      if (includeScheduleLocked) filters.push('包含已锁定任务')

      return filters.length > 0 ? filters.join('；') : '无限制'
    },

    /**
     * 预览待排程任务
     */
    async previewTasks() {
      try {
        this.previewing = true

        // 构建查询参数
        const params = this.buildPreviewParams()

        // 调用接口获取待排程任务
        const response = await fetchPendingTasks(params)

        if (response && response.success && response.data) {
          const { tasks, totalCount } = response.data

          // 更新预览数据
          this.previewTaskCount = totalCount
          this.previewTotalWeight = this.calculateTotalWeight(tasks)
          this.previewData = response.data
          this.previewPageNum = 1

          // 显示预览对话框
          this.previewDialogVisible = true
          this.previewLoading = false

          // 使用后端返回的消息，备用消息仅在后端未返回时使用
          this.$message.success(response.message || '获取待排程任务列表成功')
        } else {
          this.$message.warning(response.message || '未查询到待排程任务')
          this.previewTaskCount = 0
          this.previewTotalWeight = 0
        }
      } catch (error) {
        console.error('预览待排程任务失败:', error)

        let errorMessage = '查询待排程任务失败'
        if (error.response) {
          const { status, data } = error.response
          if (status === 400) {
            errorMessage = data.error?.message || '请求参数验证失败'
          } else if (status === 401) {
            errorMessage = '请先登录'
          } else if (status === 403) {
            errorMessage = '权限不足，请联系管理员'
          } else if (data && data.error) {
            errorMessage = data.error.message || errorMessage
          }
        } else if (error.message) {
          errorMessage = error.message
        }

        this.$message.error(errorMessage)
      } finally {
        this.previewing = false
      }
    },

    /**
     * 构建预览查询参数
     */
    buildPreviewParams() {
      const params = {
        limit: this.previewPageSize,
        offset: (this.previewPageNum - 1) * this.previewPageSize
      }

      const {
        productCode,
        alloyGrade,
        mixingGroupCode,
        priorities,
        minActualWeight,
        maxActualWeight,
        includeScheduleLocked
      } = this.formData.taskFilters

      // 添加可选的筛选条件
      if (productCode) {
        params.productCode = productCode
      }
      if (alloyGrade) {
        params.alloyGrade = alloyGrade
      }
      if (mixingGroupCode) {
        params.mixingGroupCode = mixingGroupCode
      }
      if (priorities && priorities.length > 0) {
        params.priorities = priorities.join(',')
      }
      if (minActualWeight !== null && minActualWeight !== undefined) {
        params.minActualWeight = minActualWeight
      }
      if (maxActualWeight !== null && maxActualWeight !== undefined) {
        params.maxActualWeight = maxActualWeight
      }
      if (includeScheduleLocked === true) {
        params.includeScheduleLocked = true
      }

      return params
    },

    /**
     * 计算总重量（优先使用实际重量）
     */
    calculateTotalWeight(tasks) {
      if (!tasks || tasks.length === 0) {
        return 0
      }
      const total = tasks.reduce((sum, task) => {
        // 优先使用实际重量，如果没有实际重量则使用计划重量
        const weight = (task.actualWeight !== null && task.actualWeight !== undefined)
          ? task.actualWeight
          : (task.plannedWeight || 0)
        return sum + weight
      }, 0)
      return total.toFixed(2)
    },

    /**
     * 处理预览分页变化
     */
    async handlePreviewPageChange(page) {
      try {
        this.previewLoading = true
        this.previewPageNum = page

        const params = this.buildPreviewParams()
        const response = await fetchPendingTasks(params)

        if (response && response.success && response.data) {
          this.previewData = response.data
        }
      } catch (error) {
        console.error('分页查询失败:', error)

        // 使用后端返回的错误消息
        let errorMessage = '分页查询失败'
        if (error.response && error.response.data && error.response.data.error) {
          errorMessage = error.response.data.error.message || errorMessage
        } else if (error.message) {
          errorMessage = error.message
        }

        this.$message.error(errorMessage)
      } finally {
        this.previewLoading = false
      }
    },

    /**
     * 获取优先级标签类型
     * 注意：必须严格按照接口文档中的枚举值定义
     */
    getPriorityTagType(priority) {
      const typeMap = {
        emergency: 'danger', // 紧急 - 红色
        high: 'warning', // 高 - 橙色
        normal: 'info', // 普通 - 蓝色
        low: 'info' // 低 - 灰色
      }
      return typeMap[priority] || 'info'
    },

    /**
     * 获取优先级文本
     * 注意：必须严格按照接口文档中的枚举值定义
     */
    getPriorityText(priority) {
      const textMap = {
        emergency: '紧急',
        high: '高',
        normal: '普通',
        low: '低'
      }
      return textMap[priority] || priority
    },

    /**
     * 格式化日期时间
     */
    formatDateTime(dateTimeString) {
      if (!dateTimeString) {
        return '-'
      }
      try {
        const date = new Date(dateTimeString)
        return date.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })
      } catch (error) {
        return dateTimeString
      }
    },

    /**
     * 格式化日期（不含时间）
     */
    formatDate(dateString) {
      if (!dateString) {
        return '-'
      }
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        })
      } catch (error) {
        return dateString
      }
    },

    /**
     * 格式化时长（分钟转为小时和分钟）
     */
    formatDuration(minutes) {
      if (!minutes || minutes === 0) {
        return '-'
      }
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      if (hours > 0 && mins > 0) {
        return `${hours}h${mins}m`
      } else if (hours > 0) {
        return `${hours}h`
      } else {
        return `${mins}m`
      }
    },

    /**
     * 获取交货日期的样式类名（根据紧急程度）
     */
    getDeliveryDateClass(deliveryDate) {
      if (!deliveryDate) {
        return ''
      }

      try {
        const now = new Date()
        const delivery = new Date(deliveryDate)
        const daysUntil = Math.ceil((delivery - now) / (1000 * 60 * 60 * 24))

        if (daysUntil < 0) {
          return 'delivery-overdue' // 已逾期
        } else if (daysUntil <= 3) {
          return 'delivery-urgent' // 3天内：紧急
        } else if (daysUntil <= 7) {
          return 'delivery-warning' // 7天内：警告
        } else {
          return 'delivery-normal' // 正常
        }
      } catch (error) {
        return ''
      }
    },

    /**
     * 处理预览表格的选择变化
     */
    handlePreviewSelectionChange(selection) {
      this.selectedTasks = selection
      this.selectedTotalWeight = this.calculateTotalWeight(selection)
    },

    /**
     * 检查任务是否可选（已锁定的任务不可选）
     * ✅ 使用 schedulingStatus.isLocked 或扁平化的 isLocked 判断锁定状态
     */
    checkTaskSelectable(row) {
      return !this.getTaskLockStatus(row)
    },

    /**
     * 获取任务锁定状态
     * @param {Object} task - 任务对象
     * @returns {boolean} 是否被锁定
     */
    getTaskLockStatus(task) {
      // 优先使用扁平化的 isLocked 字段
      if (task.isLocked !== undefined) {
        return task.isLocked
      }
      // 其次使用 schedulingStatus.isLocked
      if (task.schedulingStatus && task.schedulingStatus.isLocked !== undefined) {
        return task.schedulingStatus.isLocked
      }
      // 兼容旧逻辑：判断 scheduleLockedUntil 是否有值且大于当前时间
      if (task.scheduleLockedUntil) {
        return new Date(task.scheduleLockedUntil) > new Date()
      }
      return false
    },

    /**
     * 仅选择可用任务（排除已锁定的）
     */
    handleSelectAvailable() {
      if (!this.$refs.previewTable || !this.previewData?.tasks) return

      let availableCount = 0
      let unavailableCount = 0

      this.previewData.tasks.forEach(task => {
        const isAvailable = !this.getTaskLockStatus(task)
        this.$refs.previewTable.toggleRowSelection(task, isAvailable)
        if (isAvailable) {
          availableCount++
        } else {
          unavailableCount++
        }
      })

      // 提示信息
      if (availableCount === 0) {
        this.$message.warning('当前页面没有可用任务')
      } else if (unavailableCount > 0) {
        this.$message.info(`已选择 ${availableCount} 个可用任务，跳过 ${unavailableCount} 个不可用任务`)
      } else {
        this.$message.success(`已全选 ${availableCount} 个任务`)
      }
    },

    /**
     * 清空选择
     */
    handleClearSelection() {
      if (!this.$refs.previewTable) return
      this.$refs.previewTable.clearSelection()
    },

    /**
     * 确认任务选择
     */
    confirmTaskSelection() {
      if (this.selectedTasks.length === 0) {
        this.$message.warning('请至少选择一个任务')
        return
      }

      // 检查是否有已锁定的任务
      const lockedTasks = this.selectedTasks.filter(t => this.getTaskLockStatus(t))
      if (lockedTasks.length > 0) {
        this.$message.warning(`选中的任务中有 ${lockedTasks.length} 个已被锁定，请重新选择`)
        return
      }

      this.$message.success(`已选择 ${this.selectedTasks.length} 个任务`)
      this.previewDialogVisible = false
    },

    /**
     * 提交创建排程方案
     */
    async handleSubmit() {
      try {
        // 最终验证
        await this.$refs.formRef.validate()

        // 强制要求选择任务
        if (this.selectedTasks.length === 0) {
          this.$message.error('请先在预览对话框中选择要排程的任务')
          return
        }

        this.submitting = true
        this.submitProgress = 0
        this.submitStatus = ''
        this.submitProgressText = '正在创建排程方案...'

        // 模拟进度
        this.submitProgress = 20
        const progressTimer = setInterval(() => {
          if (this.submitProgress < 90) {
            this.submitProgress += 10
            if (this.submitProgress >= 50) {
              this.submitProgressText = '正在运行排程算法...'
            }
          }
        }, 300)

        // 构建请求数据（直接使用选中的任务ID）
        const requestData = this.buildRequestData()

        // 调用创建接口（后端会自动锁定任务并在事务内完成所有操作）
        const response = await createSchedulePlan(requestData)

        clearInterval(progressTimer)
        this.submitProgress = 100
        this.submitStatus = 'success'
        this.submitProgressText = '创建成功！'

        if (response.success && response.data) {
          // 使用更新后的字段名（2025-10-24接口更新）
          const {
            planCode, // planNumber → planCode
            taskCount, // 新增字段
            conflictCount, // 新增字段
            utilizationRate,
            loadRate,
            deliveryAchievementRate,
            computationDurationSeconds // algorithmExecutionTimeMs → computationDurationSeconds
          } = response.data

          // 显示成功信息
          const successMessage = `
            <div>
              <p><strong>方案编号：</strong>${planCode}</p>
              <p><strong>排程任务数：</strong>${taskCount} 个</p>
              <p><strong>冲突数量：</strong>${conflictCount} 个</p>
              <p><strong>炉子利用率：</strong>${(utilizationRate * 100).toFixed(2)}%</p>
              <p><strong>装载率：</strong>${(loadRate * 100).toFixed(2)}%</p>
              <p><strong>交期达成率：</strong>${(deliveryAchievementRate * 100).toFixed(2)}%</p>
              <p><strong>算法执行耗时：</strong>${computationDurationSeconds}秒</p>
            </div>
          `

          this.$notify({
            title: '创建排程方案成功',
            dangerouslyUseHTMLString: true,
            message: successMessage,
            type: 'success',
            duration: 5000
          })

          // 触发成功事件，传递方案数据
          this.$emit('success', response.data)

          // 延迟关闭对话框
          setTimeout(() => {
            this.handleClose()
          }, 1000)
        } else {
          this.submitStatus = 'exception'
          this.submitProgressText = '创建失败'
          const errorMessage = response.message || '创建排程方案失败'
          this.$message.error(errorMessage)
        }
      } catch (error) {
        this.submitStatus = 'exception'
        this.submitProgressText = '创建失败'
        this.handleError(error)
      } finally {
        this.submitting = false
      }
    },

    /**
     * 构建请求数据（2025-11-01 更新）
     * @returns {Object} 创建排程方案的请求数据
     *
     * 📋 接口参数说明：
     * ✅ 必填参数：
     *   - scheduleStartTime: 排程开始时间
     *   - scheduleEndTime: 排程结束时间
     *   - algorithmType: 排程算法类型（当前固定为 "rule-based"）
     *   - taskIds: 任务ID数组（从 selectedTasks 提取）
     *
     * 🎯 可选参数：
     *   - planName: 方案名称
     *   - remarks: 备注说明
     *
     * 🔐 后端自动处理：
     *   - 任务锁定：后端在事务内自动锁定任务
     *   - 任务验证：自动验证任务状态、可用性、并发冲突
     *   - 事务回滚：失败时自动回滚，无需前端处理
     */
    buildRequestData() {
      // 从选中的任务中提取ID列表
      const taskIds = this.selectedTasks.map(t => t.id)

      const data = {
        scheduleStartTime: this.formData.timeRange[0],
        scheduleEndTime: this.formData.timeRange[1],
        algorithmType: this.formData.algorithmType,
        taskIds // 用户选择的任务ID列表（必填）
      }

      // 可选字段
      if (this.formData.planName) {
        data.planName = this.formData.planName
      }

      if (this.formData.remarks) {
        data.remarks = this.formData.remarks
      }

      return data
    },

    /**
     * 关闭对话框
     */
    handleClose() {
      if (this.submitting) {
        this.$message.warning('正在创建排程方案，请稍候...')
        return
      }

      this.dialogVisible = false
      this.$emit('update:visible', false)
      this.$emit('close')
    },

    /**
     * 重置表单
     */
    resetForm() {
      this.currentStep = 0
      this.submitting = false
      this.submitProgress = 0
      this.submitStatus = ''
      this.previewTaskCount = null
      this.previewTotalWeight = 0
      this.previewDialogVisible = false
      this.previewLoading = false
      this.previewing = false
      this.previewData = null
      this.previewPageNum = 1
      this.advancedFiltersExpanded = []
      this.selectedTasks = []
      this.selectedTotalWeight = 0

      // 重置表单数据为默认值
      this.formData = {
        timeRange: [],
        planName: '',
        algorithmType: 'rule-based',
        remarks: '',
        taskFilters: {
          productCode: '',
          alloyGrade: '',
          priorities: [],
          deliveryDateRange: [],
          minActualWeight: null,
          maxActualWeight: null,
          // 新增的可选参数（2025-10-24接口更新）
          planId: '',
          mixingGroupCode: '',
          includeScheduleLocked: false
        }
      }

      // 清空表单验证
      if (this.$refs.formRef) {
        this.$nextTick(() => {
          this.$refs.formRef.clearValidate()
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.create-schedule-plan-dialog {
  &__body {
    min-height: 400px;
  }

  &__steps {
    margin-bottom: 30px;
  }

  &__form {
    padding: 0 20px;
  }

  &__step {
    min-height: 350px;
  }

  &__section-title {
    font-size: 16px;
    font-weight: bold;
    color: #303133;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 2px solid #409eff;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__preset-buttons {
    display: flex;
    gap: 8px;
  }

  &__hint {
    font-size: 12px;
    color: #909399;
    margin-top: 5px;
  }

  &__algo-option {
    display: block;
    margin-bottom: 15px;
    padding: 10px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    background-color: #f5f7fa;

    &:hover {
      background-color: #ecf5ff;
      border-color: #409eff;
    }
  }

  &__algo-label {
    display: flex;
    align-items: center;
    margin-bottom: 5px;
  }

  &__algo-desc {
    font-size: 12px;
    color: #606266;
    margin-left: 24px;
  }

  &__weight-summary {
    padding: 10px;
    background-color: #f0f9ff;
    border-radius: 4px;
    margin-bottom: 20px;
    font-size: 14px;

    span {
      margin-right: 10px;
    }

    .is-error {
      color: #f56c6c;
      font-weight: bold;
    }
  }

  &__weight-remaining {
    color: #67c23a;
  }

  &__weight-error {
    color: #f56c6c;

    i {
      margin-right: 4px;
    }
  }

  &__lead-time-shortcuts {
    margin-top: 10px;
    display: flex;
    gap: 8px;
  }

  &__preview-result {
    margin-left: 10px;
    color: #409eff;
    font-weight: bold;
  }

  &__summary {
    margin-top: 20px;
  }

  &__progress {
    margin-top: 30px;
    padding: 20px;
    background-color: #f5f7fa;
    border-radius: 4px;
  }

  &__progress-text {
    text-align: center;
    margin-top: 10px;
    font-size: 14px;
    color: #606266;
  }

  &__footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
}

// 预览任务对话框样式
.preview-tasks-dialog {
  &__loading {
    text-align: center;
    padding: 50px 0;

    p {
      margin-top: 20px;
      color: #606266;
      font-size: 14px;
    }
  }

  &__content {
    .highlight {
      color: #409eff;
      font-weight: bold;
      font-size: 16px;
    }

    // 产品信息样式
    .product-info {
      .product-code {
        font-weight: 500;
        color: #303133;
        margin-bottom: 4px;
      }

      .product-name {
        font-size: 12px;
        color: #909399;
      }
    }

    // 计划优先级样式
    .plan-priority {
      font-size: 11px;
      color: #909399;
      margin-top: 4px;
      line-height: 1.2;
    }

    // 生产计划信息样式
    .plan-info {
      .plan-number {
        font-weight: 500;
        color: #303133;
        margin-bottom: 4px;
      }

      .customer-name {
        font-size: 12px;
        color: #909399;
      }
    }

    // 交货日期样式 - 根据紧急程度着色
    .delivery-overdue {
      color: #f56c6c;
      font-weight: bold;
      animation: blink 1.5s infinite;
    }

    .delivery-urgent {
      color: #f56c6c;
      font-weight: bold;
    }

    .delivery-warning {
      color: #e6a23c;
      font-weight: 500;
    }

    .delivery-normal {
      color: #606266;
    }
  }

  &__summary {
    margin-bottom: 20px;
  }

  &__table {
    margin-bottom: 20px;
  }

  &__pagination {
    text-align: right;
  }

  &__empty {
    padding: 50px 0;
  }

  &__toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    margin-bottom: 12px;
    border-bottom: 1px solid #ebeef5;

    .toolbar-left {
      display: flex;
      gap: 8px;
    }

    .toolbar-right {
      .selection-info {
        font-size: 14px;
        color: #606266;

        .highlight-count {
          color: #409eff;
          font-weight: bold;
          font-size: 16px;
        }
      }

      .selection-info-empty {
        font-size: 14px;
        color: #909399;
      }
    }
  }
}

// 重量信息样式
.weight-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  text-align: right;

  .actual-weight {
    font-weight: 600;
    color: #409EFF;
    font-size: 13px;
  }

  .planned-weight {
    font-size: 12px;
    color: #909399;
  }
}

// 第三步确认页面样式
.selected-tasks-info {
  display: flex;
  align-items: center;
}

.text-warning {
  color: #e6a23c;

  i {
    margin-right: 4px;
  }
}

.text-danger {
  color: #f56c6c;
  font-weight: 500;

  i {
    margin-right: 4px;
  }
}

// 逾期闪烁动画
@keyframes blink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

::v-deep {
  .el-slider__input {
    width: 130px;
  }

  .el-collapse-item__header {
    font-weight: bold;
  }
}
</style>

