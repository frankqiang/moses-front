/**
 * 文件名称：AdjustDialog.vue
 * 文件描述：生产计划调整对话框
 * 创建日期：2025-01-21
 * 修改记录：
 *   - 2025-01-21: 初始创建
 */

<template>
  <el-dialog
    :visible.sync="visible"
    title="调整生产计划"
    :close-on-click-modal="false"
    width="900px"
    @close="handleClose"
  >
    <el-form
      ref="adjustForm"
      :model="formData"
      :rules="formRules"
      label-width="120px"
    >
      <!-- 对比信息 -->
      <div class="compare-section">
        <el-alert
          title="调整提示"
          type="info"
          :closable="false"
          show-icon
        >
          <template slot="default">
            <div>当前计划：{{ planData.planNumber }}</div>
            <div>产品：{{ planData.productCode }} - {{ planData.productName }}</div>
            <div>当前需求数量：{{ planData.demandQuantity }}{{ planData.demandUnit }}</div>
          </template>
        </el-alert>
      </div>

      <!-- 调整字段 -->
      <div class="form-section">
        <div class="section-title">调整内容</div>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="需求数量" prop="demandQuantity">
              <el-input-number
                v-model="formData.demandQuantity"
                :min="0.001"
                :max="9999999.999"
                :precision="3"
                :step="1"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="计划优先级" prop="planPriority">
              <el-select
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
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="计划交期" prop="plannedDeliveryDate">
              <el-date-picker
                v-model="formData.plannedDeliveryDate"
                type="datetime"
                placeholder="请选择计划交期"
                format="yyyy-MM-dd HH:mm:ss"
                value-format="yyyy-MM-ddTHH:mm:ss.sssZ"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="变更描述" prop="changeDescription">
              <el-input
                v-model="formData.changeDescription"
                type="textarea"
                :rows="3"
                placeholder="请输入调整原因和变更描述"
                maxlength="500"
                show-word-limit
              />
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 子批次调整（可选） -->
      <div v-if="hasItems" class="form-section">
        <div class="section-title">
          子批次调整（可选）
          <el-tooltip content="调整子批次后会自动校验总重量是否与主计划需求数量一致" placement="top">
            <i class="el-icon-question" />
          </el-tooltip>
        </div>
        <el-table
          :data="formData.planItems"
          border
          stripe
        >
          <el-table-column
            prop="itemNumber"
            label="子计划编号"
            width="150"
          />
          <el-table-column
            label="预计重量(吨)"
            width="150"
          >
            <template slot-scope="{ row }">
              <el-input-number
                v-model="row.plannedWeight"
                :min="0.001"
                :precision="3"
                :step="1"
                controls-position="right"
                size="small"
                style="width: 100%"
              />
            </template>
          </el-table-column>
          <el-table-column
            label="预计数量"
            width="120"
          >
            <template slot-scope="{ row }">
              <el-input-number
                v-model="row.plannedQuantity"
                :min="0"
                :precision="0"
                controls-position="right"
                size="small"
                style="width: 100%"
              />
            </template>
          </el-table-column>
          <el-table-column
            label="状态"
            width="120"
          >
            <template slot-scope="{ row }">
              {{ getItemStatusText(row.status) }}
            </template>
          </el-table-column>
        </el-table>

        <!-- 总重量校验提示 -->
        <div class="weight-validation">
          <el-alert
            :title="weightValidationMessage"
            :type="weightValidationStatus"
            :closable="false"
            show-icon
          />
        </div>
      </div>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
        确定调整
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { adjustPlan } from '../api'
import { PLAN_PRIORITY_OPTIONS } from '../constants'

export default {
  name: 'AdjustDialog',
  props: {
    planData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      visible: false,
      submitLoading: false,
      formData: {
        demandQuantity: null,
        plannedDeliveryDate: '',
        planPriority: '',
        changeDescription: '',
        planItems: []
      },
      formRules: {
        demandQuantity: [
          { required: true, message: '请输入需求数量', trigger: 'blur' },
          { type: 'number', min: 0.001, message: '需求数量必须大于0', trigger: 'blur' }
        ],
        plannedDeliveryDate: [
          { required: true, message: '请选择计划交期', trigger: 'change' }
        ],
        changeDescription: [
          { required: true, message: '请输入变更描述', trigger: 'blur' },
          { max: 500, message: '变更描述最多500个字符', trigger: 'blur' }
        ]
      },
      priorityOptions: PLAN_PRIORITY_OPTIONS,
      // 子批次状态映射
      itemStatusMap: {
        DRAFT: '草稿',
        READY_FOR_SCHEDULING: '待排程',
        SCHEDULED: '已排程',
        READY_FOR_EXECUTION: '待执行',
        IN_PROGRESS: '执行中',
        COMPLETED: '已完成',
        CANCELLED: '已取消'
      }
    }
  },
  computed: {
    hasItems() {
      return this.planData.items && this.planData.items.length > 0
    },
    totalItemsWeight() {
      if (!this.formData.planItems || this.formData.planItems.length === 0) {
        return 0
      }
      return this.formData.planItems.reduce((sum, item) => {
        return sum + (item.plannedWeight || 0)
      }, 0)
    },
    weightDifference() {
      return Math.abs(this.totalItemsWeight - (this.formData.demandQuantity || 0))
    },
    weightValidationStatus() {
      // 允许0.5吨误差
      if (this.weightDifference <= 0.5) {
        return 'success'
      }
      return 'error'
    },
    weightValidationMessage() {
      const total = this.totalItemsWeight.toFixed(3)
      const demand = (this.formData.demandQuantity || 0).toFixed(3)
      const diff = this.weightDifference.toFixed(3)

      if (this.weightDifference <= 0.5) {
        return `子批次总重量(${total}吨)与需求数量(${demand}吨)一致，误差${diff}吨（允许范围内）`
      }
      return `子批次总重量(${total}吨)与需求数量(${demand}吨)不一致，误差${diff}吨（超出允许范围0.5吨）`
    }
  },
  methods: {
    /**
     * 打开对话框
     */
    open() {
      this.visible = true
      this.initFormData()
    },

    /**
     * 关闭对话框
     */
    handleClose() {
      this.visible = false
      this.resetForm()
    },

    /**
     * 初始化表单数据
     */
    initFormData() {
      this.formData = {
        demandQuantity: this.planData.demandQuantity,
        plannedDeliveryDate: this.planData.plannedDeliveryDate,
        planPriority: this.planData.planPriority,
        changeDescription: '',
        planItems: this.planData.items ? JSON.parse(JSON.stringify(this.planData.items)) : []
      }
    },

    /**
     * 重置表单
     */
    resetForm() {
      this.formData = {
        demandQuantity: null,
        plannedDeliveryDate: '',
        planPriority: '',
        changeDescription: '',
        planItems: []
      }
      this.$nextTick(() => {
        this.$refs.adjustForm && this.$refs.adjustForm.clearValidate()
      })
    },

    /**
     * 提交调整
     */
    handleSubmit() {
      this.$refs.adjustForm.validate(async(valid) => {
        if (!valid) {
          this.$message.error('请填写完整的表单信息')
          return
        }

        // 如果有子批次，校验总重量
        if (this.hasItems && this.weightValidationStatus === 'error') {
          this.$message.error('子批次总重量与需求数量不一致，请调整后再提交')
          return
        }

        try {
          this.submitLoading = true

          // 构建请求数据
          const requestData = {
            demandQuantity: this.formData.demandQuantity,
            plannedDeliveryDate: this.formData.plannedDeliveryDate,
            planPriority: this.formData.planPriority,
            changeDescription: this.formData.changeDescription
          }

          // 如果有子批次调整
          if (this.hasItems) {
            requestData.planItems = this.formData.planItems.map(item => ({
              itemId: item.id,
              plannedWeight: item.plannedWeight,
              plannedQuantity: item.plannedQuantity
            }))
          }

          const response = await adjustPlan(this.planData.id, requestData)

          if (response.success) {
            this.$message.success(response.message || '调整生产计划成功')
            this.handleClose()
            this.$emit('success')
          } else {
            this.$message.error(response.message || '调整生产计划失败')
          }
        } catch (error) {
          console.error('调整生产计划失败:', error)
          const errorMessage = error.response?.data?.error?.message || error.message || '调整生产计划失败'
          this.$message.error(errorMessage)
        } finally {
          this.submitLoading = false
        }
      })
    },

    /**
     * 获取子批次状态文本
     */
    getItemStatusText(status) {
      return this.itemStatusMap[status] || status || '-'
    }
  }
}
</script>

<style lang="scss" scoped>
.compare-section {
  margin-bottom: 20px;

  ::v-deep .el-alert {
    .el-alert__content {
      div {
        line-height: 1.8;
      }
    }
  }
}

.form-section {
  margin-bottom: 20px;
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 4px;

  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 2px solid #409eff;

    .el-icon-question {
      cursor: pointer;
      color: #909399;
      margin-left: 4px;
    }
  }

  ::v-deep .el-form-item {
    margin-bottom: 16px;
  }

  .weight-validation {
    margin-top: 16px;
  }
}

.dialog-footer {
  text-align: right;
}
</style>

