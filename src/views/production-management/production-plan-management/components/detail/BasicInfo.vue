/**
 * 文件名称：BasicInfo.vue
 * 文件描述：生产计划基本信息组件（支持展示和编辑模式）
 * 创建日期：2025-01-21
 * 修改记录：
 *   - 2025-01-21: 初始创建
 */

<template>
  <div class="basic-info">
    <el-form
      ref="form"
      :model="formData"
      :rules="editMode ? formRules : {}"
      label-width="140px"
      class="info-form"
    >
      <!-- 计划基本信息 -->
      <div class="info-section">
        <div class="section-title">计划基本信息</div>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="计划编号">
              <span class="info-value">{{ planData.planNumber || '-' }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="外部订单号">
              <span class="info-value">{{ planData.externalOrderNumber || '-' }}</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="计划来源">
              <span class="info-value">{{ getSourceText(planData.source) }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="ERP同步批次号">
              <span class="info-value">{{ planData.erpSyncBatchNo || '-' }}</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="计划优先级" prop="planPriority">
              <el-select
                v-if="editMode"
                v-model="formData.planPriority"
                placeholder="请选择计划优先级"
                style="width: 100%"
              >
                <el-option
                  v-for="item in priorityOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
              <status-tag
                v-else-if="planData.planPriority"
                :status="planData.planPriority"
                :text-map="PLAN_PRIORITY_MAP"
                :type-map="PLAN_PRIORITY_TYPE_MAP"
              />
              <span v-else class="info-value">-</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="计划状态">
              <status-tag
                v-if="planData.status"
                :status="planData.status"
                :text-map="PLAN_STATUS_MAP"
                :type-map="PLAN_STATUS_TYPE_MAP"
              />
              <span v-else class="info-value">-</span>
              <el-tag v-if="planData.isFrozen" type="danger" size="small" style="margin-left: 8px">
                已冻结
              </el-tag>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="完成进度">
              <el-progress
                :percentage="planData.currentProgressPercentage || 0"
                :color="getProgressColor(planData.currentProgressPercentage)"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 产品信息 -->
      <div class="info-section">
        <div class="section-title">产品信息</div>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="产品编码">
              <span class="info-value">{{ planData.productCode || '-' }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="产品名称">
              <span class="info-value">{{ planData.productName || '-' }}</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="需求数量" prop="demandQuantity">
              <el-input-number
                v-if="editMode"
                v-model="formData.demandQuantity"
                :min="0.001"
                :max="9999999.999"
                :precision="3"
                :step="1"
                controls-position="right"
                style="width: 100%"
              />
              <span v-else class="info-value">
                {{ planData.demandQuantity }}{{ planData.demandUnit }}
              </span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="需求单位">
              <span class="info-value">{{ planData.demandUnit || '-' }}</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="计划交期" prop="plannedDeliveryDate">
              <el-date-picker
                v-if="editMode"
                v-model="formData.plannedDeliveryDate"
                type="datetime"
                placeholder="请选择计划交期"
                format="yyyy-MM-dd HH:mm:ss"
                value-format="yyyy-MM-ddTHH:mm:ss.sssZ"
                style="width: 100%"
              />
              <span v-else class="info-value">
                {{ formatTime(planData.plannedDeliveryDate) }}
              </span>
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 客户信息 -->
      <div class="info-section">
        <div class="section-title">客户信息</div>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="客户名称" prop="customerName">
              <el-input
                v-if="editMode"
                v-model="formData.customerName"
                placeholder="请输入客户名称"
                maxlength="100"
                clearable
              />
              <span v-else class="info-value">{{ planData.customerName || '-' }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="客户编码" prop="customerCode">
              <el-input
                v-if="editMode"
                v-model="formData.customerCode"
                placeholder="请输入客户编码"
                maxlength="50"
                clearable
              />
              <span v-else class="info-value">{{ planData.customerCode || '-' }}</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="特殊要求" prop="specificRequirements">
              <el-input
                v-if="editMode"
                v-model="formData.specificRequirements"
                type="textarea"
                :rows="3"
                placeholder="请输入特殊要求"
                maxlength="1000"
                show-word-limit
              />
              <span v-else class="info-value">{{ planData.specificRequirements || '-' }}</span>
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 工艺与设备配置 -->
      <div class="info-section">
        <div class="section-title">工艺与设备配置</div>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="默认工艺模板">
              <span class="info-value">{{ planData.defaultProcessTemplateId || '-' }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="工艺模板关联类型">
              <span class="info-value">
                {{ getProcessLinkTypeText(planData.processTemplateLinkType) }}
              </span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="优选设备">
              <span class="info-value">{{ planData.preferredEquipmentId || '-' }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备关联类型">
              <span class="info-value">{{ planData.equipmentLinkType || '-' }}</span>
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 时间戳信息 -->
      <div class="info-section">
        <div class="section-title">时间信息</div>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="创建时间">
              <span class="info-value">{{ formatTime(planData.createdAt) }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="更新时间">
              <span class="info-value">{{ formatTime(planData.updatedAt) }}</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="确认时间">
              <span class="info-value">{{ formatTime(planData.confirmedAt) }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="下达时间">
              <span class="info-value">{{ formatTime(planData.releasedAt) }}</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="完成时间">
              <span class="info-value">{{ formatTime(planData.completedAt) }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="取消时间">
              <span class="info-value">{{ formatTime(planData.cancelledAt) }}</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="planData.cancelReason">
          <el-col :span="24">
            <el-form-item label="取消原因">
              <span class="info-value">{{ planData.cancelReason }}</span>
            </el-form-item>
          </el-col>
        </el-row>
      </div>
    </el-form>
  </div>
</template>

<script>
import StatusTag from '@/components/StatusTag'
import { parseTime } from '@/utils'
import {
  PLAN_SOURCE_MAP,
  PLAN_STATUS_MAP,
  PLAN_STATUS_TYPE_MAP,
  PLAN_PRIORITY_MAP,
  PLAN_PRIORITY_TYPE_MAP,
  PLAN_PRIORITY_OPTIONS
} from '../../constants'

export default {
  name: 'BasicInfo',
  components: {
    StatusTag
  },
  props: {
    planData: {
      type: Object,
      required: true
    },
    editMode: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      PLAN_STATUS_MAP,
      PLAN_STATUS_TYPE_MAP,
      PLAN_PRIORITY_MAP,
      PLAN_PRIORITY_TYPE_MAP,
      priorityOptions: PLAN_PRIORITY_OPTIONS,
      formData: {
        demandQuantity: null,
        plannedDeliveryDate: '',
        planPriority: '',
        customerName: '',
        customerCode: '',
        specificRequirements: ''
      },
      formRules: {
        demandQuantity: [
          { required: true, message: '请输入需求数量', trigger: 'blur' },
          { type: 'number', min: 0.001, message: '需求数量必须大于0', trigger: 'blur' }
        ],
        plannedDeliveryDate: [
          { required: true, message: '请选择计划交期', trigger: 'change' }
        ],
        customerName: [
          { max: 100, message: '客户名称最多100个字符', trigger: 'blur' }
        ],
        customerCode: [
          { max: 50, message: '客户编码最多50个字符', trigger: 'blur' }
        ],
        specificRequirements: [
          { max: 1000, message: '特殊要求最多1000个字符', trigger: 'blur' }
        ]
      }
    }
  },
  watch: {
    planData: {
      handler(newVal) {
        if (newVal) {
          this.initFormData()
        }
      },
      immediate: true
    }
  },
  methods: {
    /**
     * 初始化表单数据
     */
    initFormData() {
      this.formData = {
        demandQuantity: this.planData.demandQuantity,
        plannedDeliveryDate: this.planData.plannedDeliveryDate,
        planPriority: this.planData.planPriority,
        customerName: this.planData.customerName || '',
        customerCode: this.planData.customerCode || '',
        specificRequirements: this.planData.specificRequirements || ''
      }
    },

    /**
     * 验证表单
     */
    validate() {
      return new Promise((resolve) => {
        this.$refs.form.validate((valid) => {
          resolve(valid)
        })
      })
    },

    /**
     * 获取表单数据
     */
    getFormData() {
      return { ...this.formData }
    },

    /**
     * 格式化时间
     */
    formatTime(time) {
      return time ? parseTime(time, '{y}-{m}-{d} {h}:{i}:{s}') : '-'
    },

    /**
     * 获取来源文本
     */
    getSourceText(source) {
      return PLAN_SOURCE_MAP[source] || source || '-'
    },

    /**
     * 获取工艺模板关联类型文本
     */
    getProcessLinkTypeText(linkType) {
      const map = {
        PRIMARY: '主要工艺',
        BACKUP: '备用工艺',
        MANUAL_OVERRIDE: '手动覆盖'
      }
      return map[linkType] || linkType || '-'
    },

    /**
     * 获取进度条颜色
     */
    getProgressColor(percentage) {
      if (percentage >= 100) return '#67C23A'
      if (percentage >= 80) return '#409EFF'
      if (percentage >= 50) return '#E6A23C'
      return '#F56C6C'
    }
  }
}
</script>

<style lang="scss" scoped>
.basic-info {
  .info-section {
    margin-bottom: 24px;
    padding: 16px;
    background-color: #f5f7fa;
    border-radius: 4px;

    &:last-child {
      margin-bottom: 0;
    }

    .section-title {
      font-size: 15px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 2px solid #409eff;
    }
  }

  .info-value {
    display: inline-block;
    color: #606266;
    line-height: 32px;
  }

  ::v-deep .el-form-item {
    margin-bottom: 16px;
  }

  ::v-deep .el-form-item__label {
    font-weight: 500;
  }
}
</style>

