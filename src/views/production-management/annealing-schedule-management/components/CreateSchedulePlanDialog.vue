/**
 * 文件名称：CreateSchedulePlanDialog.vue
 * 文件描述：创建排程方案对话框组件（向导式表单）
 * 创建日期：2025-10-23
 * 修改记录：
 *   - 2025-10-23: 初始创建，实现P0阶段和P1阶段第11项功能
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
        <el-step title="任务筛选" />
        <el-step title="优化目标" />
        <el-step title="约束规则" />
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
                v-model="formData.taskFilters.minWeight"
                :min="0.01"
                :max="100"
                :precision="2"
                :controls="false"
                placeholder="最小重量"
                style="width: 100%"
              />
            </el-col>
            <el-col :span="2" style="text-align: center">-</el-col>
            <el-col :span="11">
              <el-input-number
                v-model="formData.taskFilters.maxWeight"
                :min="0.01"
                :max="100"
                :precision="2"
                :controls="false"
                placeholder="最大重量"
                style="width: 100%"
              />
            </el-col>
            <div class="create-schedule-plan-dialog__hint">
              单位：吨
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
            <span v-if="previewTaskCount !== null" class="create-schedule-plan-dialog__preview-result">
              预计{{ previewTaskCount }}个待排程任务，总重量{{ previewTotalWeight }}吨
            </span>
          </el-form-item>
        </div>

        <!-- 第三步：优化目标配置 -->
        <div v-show="currentStep === 2" class="create-schedule-plan-dialog__step">
          <div class="create-schedule-plan-dialog__section-title">
            <span>优化目标配置</span>
            <div class="create-schedule-plan-dialog__preset-buttons">
              <el-button
                v-for="(preset, key) in optimizationPresets"
                :key="key"
                size="mini"
                @click="applyPreset(key)"
              >
                {{ preset.name }}
              </el-button>
            </div>
          </div>

          <div class="create-schedule-plan-dialog__weight-summary">
            <span>权重总和：</span>
            <span :class="{ 'is-error': totalWeight > 1 }">{{ (totalWeight * 100).toFixed(0) }}%</span>
            <span v-if="totalWeight <= 1" class="create-schedule-plan-dialog__weight-remaining">
              剩余可分配：{{ ((1 - totalWeight) * 100).toFixed(0) }}%
            </span>
            <span v-else class="create-schedule-plan-dialog__weight-error">
              <i class="el-icon-warning" /> 权重总和超过100%，请调整
            </span>
          </div>

          <el-form-item label="交期达成权重" prop="optimizationGoals.meetDeadlineWeight">
            <el-slider
              v-model="formData.optimizationGoals.meetDeadlineWeight"
              :min="0"
              :max="1"
              :step="0.01"
              :format-tooltip="formatPercentage"
              show-input
            />
            <div class="create-schedule-plan-dialog__hint">
              优先安排交期紧急或优先级高的任务
            </div>
          </el-form-item>

          <el-form-item label="炉子利用率权重" prop="optimizationGoals.utilizationWeight">
            <el-slider
              v-model="formData.optimizationGoals.utilizationWeight"
              :min="0"
              :max="1"
              :step="0.01"
              :format-tooltip="formatPercentage"
              show-input
            />
            <div class="create-schedule-plan-dialog__hint">
              减少炉子空闲时间，考虑连续排产
            </div>
          </el-form-item>

          <el-form-item label="装载率权重" prop="optimizationGoals.loadRateWeight">
            <el-slider
              v-model="formData.optimizationGoals.loadRateWeight"
              :min="0"
              :max="1"
              :step="0.01"
              :format-tooltip="formatPercentage"
              show-input
            />
            <div class="create-schedule-plan-dialog__hint">
              在满足混炉规则前提下，尽量拼凑满炉任务
            </div>
          </el-form-item>

          <el-form-item label="节能权重" prop="optimizationGoals.energySavingWeight">
            <el-slider
              v-model="formData.optimizationGoals.energySavingWeight"
              :min="0"
              :max="1"
              :step="0.01"
              :format-tooltip="formatPercentage"
              show-input
            />
            <div class="create-schedule-plan-dialog__hint">
              将工艺相似的任务连续排，减少大幅升降温
            </div>
          </el-form-item>
        </div>

        <!-- 第四步：约束规则配置 -->
        <div v-show="currentStep === 3" class="create-schedule-plan-dialog__step">
          <div class="create-schedule-plan-dialog__section-title">
            约束规则配置
          </div>

          <el-form-item label="容量范围" prop="constraintRules.capacity">
            <el-col :span="11">
              <el-input-number
                v-model="formData.constraintRules.minCapacity"
                :min="10"
                :max="100"
                :precision="0"
                :controls="false"
                placeholder="最小容量"
                style="width: 100%"
              />
            </el-col>
            <el-col :span="2" style="text-align: center">-</el-col>
            <el-col :span="11">
              <el-input-number
                v-model="formData.constraintRules.maxCapacity"
                :min="10"
                :max="100"
                :precision="0"
                :controls="false"
                placeholder="最大容量"
                style="width: 100%"
              />
            </el-col>
            <div class="create-schedule-plan-dialog__hint">
              单位：吨，最小容量必须小于最大容量
            </div>
          </el-form-item>

          <el-form-item label="是否允许混炉" prop="constraintRules.allowMixing">
            <el-switch v-model="formData.constraintRules.allowMixing" />
            <div class="create-schedule-plan-dialog__hint">
              允许将多个不同任务合并到同一炉次执行
            </div>
          </el-form-item>

          <el-collapse v-model="mixingRulesExpanded" :disabled="!formData.constraintRules.allowMixing">
            <el-collapse-item title="混炉规则配置（可选）" name="mixingRules">
              <el-form-item label="仅相同产品" label-width="120px">
                <el-switch v-model="formData.constraintRules.mixingRules.sameProductOnly" />
              </el-form-item>

              <el-form-item label="相同合金牌号" label-width="120px">
                <el-switch v-model="formData.constraintRules.mixingRules.sameAlloyGradeRequired" />
              </el-form-item>

              <el-form-item label="最大温度差" label-width="120px">
                <el-input-number
                  v-model="formData.constraintRules.mixingRules.maxTemperatureDiff"
                  :min="0"
                  :max="500"
                  :precision="0"
                  placeholder="请输入最大温度差"
                />
                <span style="margin-left: 10px">℃</span>
              </el-form-item>
            </el-collapse-item>
          </el-collapse>
        </div>

        <!-- 第五步：确认与提交 -->
        <div v-show="currentStep === 4" class="create-schedule-plan-dialog__step">
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

              <el-descriptions-item label="优化目标" :span="2">
                交期达成：{{ (formData.optimizationGoals.meetDeadlineWeight * 100).toFixed(0) }}%
                ，利用率：{{ (formData.optimizationGoals.utilizationWeight * 100).toFixed(0) }}%
                ，装载率：{{ (formData.optimizationGoals.loadRateWeight * 100).toFixed(0) }}%
                ，节能：{{ (formData.optimizationGoals.energySavingWeight * 100).toFixed(0) }}%
              </el-descriptions-item>

              <el-descriptions-item label="约束规则" :span="2">
                容量：{{ formData.constraintRules.minCapacity }}-{{ formData.constraintRules.maxCapacity }}吨
                ，{{ formData.constraintRules.allowMixing ? '允许混炉' : '不允许混炉' }}
              </el-descriptions-item>

              <el-descriptions-item label="备注说明" :span="2">
                {{ formData.remarks || '-' }}
              </el-descriptions-item>

              <el-descriptions-item label="预计任务数量" :span="2">
                <span v-if="previewTaskCount !== null">{{ previewTaskCount }}个任务</span>
                <span v-else>未预览</span>
              </el-descriptions-item>
            </el-descriptions>
          </div>

          <div v-if="submitting" class="create-schedule-plan-dialog__progress">
            <el-progress :percentage="submitProgress" :status="submitStatus" />
            <p class="create-schedule-plan-dialog__progress-text">{{ submitProgressText }}</p>
          </div>
        </div>
      </el-form>
    </div>

    <div slot="footer" class="create-schedule-plan-dialog__footer">
      <el-button v-if="currentStep > 0" @click="prevStep">上一步</el-button>
      <el-button @click="handleClose">取消</el-button>
      <el-button v-if="currentStep < 4" type="primary" @click="nextStep">下一步</el-button>
      <el-button v-if="currentStep === 4" type="primary" :loading="submitting" @click="handleSubmit">
        确认创建
      </el-button>
      <!-- P1阶段功能：保存配置模板 -->
      <el-dropdown v-if="currentStep === 4" trigger="click" @command="handleTemplateCommand">
        <el-button size="small">
          配置模板 <i class="el-icon-arrow-down" />
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="save">保存为模板</el-dropdown-item>
          <el-dropdown-item command="load">加载模板</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>

    <!-- 预览待排程任务对话框 -->
    <el-dialog
      :visible.sync="previewDialogVisible"
      title="预览待排程任务"
      width="1200px"
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

        <!-- 任务列表 -->
        <el-table
          :data="previewData.tasks"
          border
          stripe
          max-height="400"
          class="preview-tasks-dialog__table"
        >
          <el-table-column prop="taskCode" label="任务编号" width="220" fixed />
          <el-table-column prop="productCode" label="产品编码" width="150" />
          <el-table-column prop="alloyGrade" label="合金牌号" width="100" />
          <el-table-column prop="priority" label="优先级" width="100">
            <template slot-scope="{ row }">
              <el-tag :type="getPriorityTagType(row.priority)" size="small">
                {{ getPriorityText(row.priority) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="plannedWeight" label="计划重量（吨）" width="130" align="right">
            <template slot-scope="{ row }">
              {{ row.plannedWeight ? row.plannedWeight.toFixed(2) : '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="materialCount" label="物料数量" width="100" align="center" />
          <el-table-column prop="plannedLoadingAt" label="计划装炉时间" width="170">
            <template slot-scope="{ row }">
              {{ formatDateTime(row.plannedLoadingAt) }}
            </template>
          </el-table-column>
          <el-table-column prop="mixingGroupCode" label="混炉分组" width="130" show-overflow-tooltip />
          <el-table-column label="生产计划" width="150" show-overflow-tooltip>
            <template slot-scope="{ row }">
              {{ row.planInfo ? row.planInfo.planCode : '-' }}
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
        <el-button @click="previewDialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </el-dialog>
</template>

<script>
import { createSchedulePlan, fetchPendingTasks } from '../api'
import {
  ALGORITHM_TYPE_SELECT_OPTIONS,
  PRIORITY_OPTIONS,
  OPTIMIZATION_PRESETS,
  DEFAULT_OPTIMIZATION_GOALS,
  DEFAULT_CONSTRAINT_RULES,
  CREATE_PLAN_VALIDATION_RULES,
  TIME_RANGE_SHORTCUTS
} from '../constants'

export default {
  name: 'CreateSchedulePlanDialog',
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
      mixingRulesExpanded: [],
      advancedFiltersExpanded: [],
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
          minWeight: null,
          maxWeight: null,
          // 新增的可选参数（2025-10-24接口更新）
          planId: '',
          mixingGroupCode: '',
          includeScheduleLocked: false
        },
        optimizationGoals: { ...DEFAULT_OPTIMIZATION_GOALS },
        constraintRules: {
          ...DEFAULT_CONSTRAINT_RULES,
          mixingRules: {
            sameProductOnly: false,
            sameAlloyGradeRequired: false,
            maxTemperatureDiff: null
          }
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
    optimizationPresets() {
      return OPTIMIZATION_PRESETS
    },
    timeRangePickerOptions() {
      return {
        shortcuts: TIME_RANGE_SHORTCUTS
      }
    },
    totalWeight() {
      const { meetDeadlineWeight, utilizationWeight, loadRateWeight, energySavingWeight } = this.formData.optimizationGoals
      return (meetDeadlineWeight || 0) + (utilizationWeight || 0) + (loadRateWeight || 0) + (energySavingWeight || 0)
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
     * 验证容量范围
     */
    validateCapacity() {
      const { minCapacity, maxCapacity } = this.formData.constraintRules
      if (minCapacity && maxCapacity && minCapacity >= maxCapacity) {
        this.$message.warning('最小容量必须小于最大容量')
        return false
      }
      return true
    },

    /**
     * 验证优化目标权重
     */
    validateWeights() {
      if (this.totalWeight > 1) {
        this.$message.warning('优化目标权重总和不能超过100%')
        return false
      }
      return true
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
      } else if (this.currentStep === 2) {
        // 验证优化目标权重
        if (!this.validateWeights()) {
          return
        }
        this.currentStep++
      } else if (this.currentStep === 3) {
        // 验证约束规则
        if (!this.validateCapacity()) {
          return
        }
        this.currentStep++
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
     * 应用预设模板
     */
    applyPreset(presetKey) {
      const preset = this.optimizationPresets[presetKey]
      if (preset && preset.goals) {
        this.formData.optimizationGoals = { ...preset.goals }
        this.$message.success(`已应用"${preset.name}"配置`)
      }
    },

    /**
     * 格式化百分比
     */
    formatPercentage(value) {
      return `${(value * 100).toFixed(0)}%`
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
        minWeight,
        maxWeight,
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
      if (minWeight !== null || maxWeight !== null) {
        filters.push(`重量:${minWeight || 0}-${maxWeight || '不限'}吨`)
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
        minWeight,
        maxWeight,
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
      if (minWeight !== null && minWeight !== undefined) {
        params.minWeight = minWeight
      }
      if (maxWeight !== null && maxWeight !== undefined) {
        params.maxWeight = maxWeight
      }
      if (includeScheduleLocked === true) {
        params.includeScheduleLocked = true
      }

      return params
    },

    /**
     * 计算总重量
     */
    calculateTotalWeight(tasks) {
      if (!tasks || tasks.length === 0) {
        return 0
      }
      const total = tasks.reduce((sum, task) => {
        return sum + (task.plannedWeight || 0)
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
     * 提交创建排程方案
     */
    async handleSubmit() {
      try {
        // 最终验证
        await this.$refs.formRef.validate()

        if (!this.validateCapacity()) {
          return
        }

        if (!this.validateWeights()) {
          return
        }

        this.submitting = true
        this.submitProgress = 0
        this.submitStatus = ''
        this.submitProgressText = '正在提交排程方案...'

        // 模拟进度
        const progressTimer = setInterval(() => {
          if (this.submitProgress < 90) {
            this.submitProgress += 10
            if (this.submitProgress >= 30) {
              this.submitProgressText = '正在运行排程算法...'
            }
          }
        }, 300)

        // 构建请求数据
        const requestData = this.buildRequestData()

        // 调用创建接口
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
        console.error('创建排程方案失败:', error)
        this.submitStatus = 'exception'
        this.submitProgressText = '创建失败'

        // 根据错误类型显示不同的错误消息
        let errorMessage = '创建排程方案失败'
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

        // 保留用户输入的数据，不重置表单
      } finally {
        this.submitting = false
      }
    },

    /**
     * 构建请求数据
     */
    buildRequestData() {
      const data = {
        scheduleStartTime: this.formData.timeRange[0],
        scheduleEndTime: this.formData.timeRange[1],
        algorithmType: this.formData.algorithmType,
        optimizationGoals: { ...this.formData.optimizationGoals },
        constraintRules: { ...this.formData.constraintRules }
      }

      // 可选字段
      if (this.formData.planName) {
        data.planName = this.formData.planName
      }

      if (this.formData.remarks) {
        data.remarks = this.formData.remarks
      }

      // 任务筛选条件
      const taskFilters = {}
      if (this.formData.taskFilters.productCode) {
        taskFilters.productCode = this.formData.taskFilters.productCode
      }
      if (this.formData.taskFilters.alloyGrade) {
        taskFilters.alloyGrade = this.formData.taskFilters.alloyGrade
      }
      if (this.formData.taskFilters.priorities && this.formData.taskFilters.priorities.length > 0) {
        taskFilters.priorities = this.formData.taskFilters.priorities.join(',')
      }
      // 使用新的交货日期参数（推荐）代替已废弃的计划装炉时间参数
      if (this.formData.taskFilters.deliveryDateRange && this.formData.taskFilters.deliveryDateRange.length === 2) {
        taskFilters.deliveryDateFrom = this.formData.taskFilters.deliveryDateRange[0]
        taskFilters.deliveryDateTo = this.formData.taskFilters.deliveryDateRange[1]
      }
      if (this.formData.taskFilters.minWeight !== null) {
        taskFilters.minWeight = this.formData.taskFilters.minWeight
      }
      if (this.formData.taskFilters.maxWeight !== null) {
        taskFilters.maxWeight = this.formData.taskFilters.maxWeight
      }
      // 新增的可选参数（2025-10-24接口更新）
      if (this.formData.taskFilters.planId) {
        taskFilters.planId = this.formData.taskFilters.planId
      }
      if (this.formData.taskFilters.mixingGroupCode) {
        taskFilters.mixingGroupCode = this.formData.taskFilters.mixingGroupCode
      }
      if (this.formData.taskFilters.includeScheduleLocked === true) {
        taskFilters.includeScheduleLocked = true
      }

      if (Object.keys(taskFilters).length > 0) {
        data.taskFilters = taskFilters
      }

      // 混炉规则
      if (!data.constraintRules.allowMixing) {
        delete data.constraintRules.mixingRules
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
      this.mixingRulesExpanded = []
      this.advancedFiltersExpanded = []

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
          minWeight: null,
          maxWeight: null,
          // 新增的可选参数（2025-10-24接口更新）
          planId: '',
          mixingGroupCode: '',
          includeScheduleLocked: false
        },
        optimizationGoals: { ...DEFAULT_OPTIMIZATION_GOALS },
        constraintRules: {
          ...DEFAULT_CONSTRAINT_RULES,
          mixingRules: {
            sameProductOnly: false,
            sameAlloyGradeRequired: false,
            maxTemperatureDiff: null
          }
        }
      }

      // 清空表单验证
      if (this.$refs.formRef) {
        this.$nextTick(() => {
          this.$refs.formRef.clearValidate()
        })
      }
    },

    /**
     * 处理配置模板命令（P1阶段功能）
     */
    handleTemplateCommand(command) {
      if (command === 'save') {
        this.saveConfigTemplate()
      } else if (command === 'load') {
        this.loadConfigTemplate()
      }
    },

    /**
     * 保存配置模板
     */
    async saveConfigTemplate() {
      try {
        const { value: templateName } = await this.$prompt('请输入配置模板名称', '保存配置模板', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputPattern: /\S+/,
          inputErrorMessage: '模板名称不能为空'
        })

        const template = {
          name: templateName,
          algorithmType: this.formData.algorithmType,
          optimizationGoals: { ...this.formData.optimizationGoals },
          constraintRules: { ...this.formData.constraintRules },
          taskFilters: { ...this.formData.taskFilters },
          createdAt: new Date().toISOString()
        }

        // 保存到localStorage
        const savedTemplates = JSON.parse(localStorage.getItem('schedulePlanTemplates') || '[]')
        savedTemplates.push(template)
        localStorage.setItem('schedulePlanTemplates', JSON.stringify(savedTemplates))

        this.$message.success('配置模板保存成功')
      } catch (error) {
        if (error !== 'cancel') {
          console.error('保存配置模板失败:', error)
          this.$message.error('保存配置模板失败')
        }
      }
    },

    /**
     * 加载配置模板
     */
    async loadConfigTemplate() {
      try {
        const savedTemplates = JSON.parse(localStorage.getItem('schedulePlanTemplates') || '[]')

        if (savedTemplates.length === 0) {
          this.$message.warning('暂无保存的配置模板')
          return
        }

        // 显示模板选择对话框
        savedTemplates.map((t, index) => ({
          label: `${t.name} (${new Date(t.createdAt).toLocaleString()})`,
          value: index
        }))

        // 使用MessageBox显示模板列表
        const templateListHtml = savedTemplates.map((t, index) => `
          <div style="padding: 10px; border: 1px solid #e4e7ed; margin-bottom: 10px; cursor: pointer; border-radius: 4px;"
               data-index="${index}"
               onmouseover="this.style.backgroundColor='#f5f7fa'"
               onmouseout="this.style.backgroundColor='white'"
               onclick="window.selectTemplate(${index})">
            <div style="font-weight: bold;">${t.name}</div>
            <div style="font-size: 12px; color: #909399;">创建时间：${new Date(t.createdAt).toLocaleString()}</div>
          </div>
        `).join('')

        // 创建全局选择函数
        let selectedIndex = -1
        window.selectTemplate = (index) => {
          selectedIndex = index
          // 模拟点击确定按钮
          document.querySelector('.el-message-box__btns .el-button--primary').click()
        }

        await this.$alert(templateListHtml, '选择配置模板', {
          dangerouslyUseHTMLString: true,
          showCancelButton: true,
          confirmButtonText: '取消',
          cancelButtonText: ''
        }).catch(() => {
          // 用户选择了模板
          if (selectedIndex >= 0) {
            const template = savedTemplates[selectedIndex]
            // 加载模板数据
            this.formData.algorithmType = template.algorithmType
            this.formData.optimizationGoals = { ...template.optimizationGoals }
            this.formData.constraintRules = { ...template.constraintRules }
            this.formData.taskFilters = { ...template.taskFilters }

            this.$message.success('配置模板加载成功')
          }
        })

        // 清理全局函数
        delete window.selectTemplate
      } catch (error) {
        console.error('加载配置模板失败:', error)
        this.$message.error('加载配置模板失败')
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

