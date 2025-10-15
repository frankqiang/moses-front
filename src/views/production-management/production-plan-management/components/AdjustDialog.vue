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
                @change="handleDemandQuantityChange"
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
                  v-for="item in planPriorityOptions"
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
          <el-button
            v-if="needAutoSync"
            type="text"
            size="small"
            style="margin-left: 10px"
            @click="handleAutoSyncWeight"
          >
            <i class="el-icon-refresh" /> 自动同步重量
          </el-button>
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
            label="预计数量(卷/件)"
            width="150"
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
import dictionaryMixin from '../mixins/dictionary'

export default {
  name: 'AdjustDialog',
  mixins: [dictionaryMixin],
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
        return `✅ 校验通过：子批次总重量 ${total}吨 与需求数量 ${demand}吨 一致（误差 ${diff}吨，在±0.5吨容差范围内）`
      }
      return `❌ 校验失败：子批次总重量 ${total}吨 与需求数量 ${demand}吨 相差 ${diff}吨，超出允许的±0.5吨容差范围。请点击"自动同步重量"或手动调整各批次重量。`
    },
    needAutoSync() {
      // 当有子批次且重量不一致时显示自动同步按钮
      return this.hasItems && this.weightValidationStatus === 'error'
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
            requestData.items = this.formData.planItems.map(item => ({
              id: item.id,
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
      return this.getPlanItemStatusLabel(status) || '-'
    },

    /**
     * 需求数量变更时的处理
     */
    handleDemandQuantityChange(newValue) {
      // 如果有子批次且重量不一致，提示用户同步
      if (this.hasItems && this.weightDifference > 0.5) {
        this.$message.warning('需求数量已变更，请同步调整子批次重量或点击"自动同步重量"按钮')
      }
    },

    /**
     * 自动同步子批次重量
     * 将主计划需求数量按比例分配到各子批次
     */
    handleAutoSyncWeight() {
      if (!this.hasItems || !this.formData.demandQuantity) {
        return
      }

      this.$confirm(
        '自动同步将按原有比例重新分配子批次重量，是否继续？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        const totalDemand = this.formData.demandQuantity
        const itemCount = this.formData.planItems.length

        if (itemCount === 1) {
          // 如果只有一个子批次，直接赋值
          this.formData.planItems[0].plannedWeight = totalDemand
        } else {
          // 多个子批次，按原有比例分配
          const originalTotal = this.totalItemsWeight
          if (originalTotal > 0) {
            // 按原有比例分配
            this.formData.planItems.forEach(item => {
              const ratio = (item.plannedWeight || 0) / originalTotal
              item.plannedWeight = parseFloat((totalDemand * ratio).toFixed(3))
            })
          } else {
            // 如果原始总重量为0，平均分配
            const avgWeight = parseFloat((totalDemand / itemCount).toFixed(3))
            this.formData.planItems.forEach((item, index) => {
              if (index === itemCount - 1) {
                // 最后一个批次用总量减去前面的总和，避免精度误差
                const others = this.formData.planItems
                  .slice(0, -1)
                  .reduce((sum, i) => sum + i.plannedWeight, 0)
                item.plannedWeight = parseFloat((totalDemand - others).toFixed(3))
              } else {
                item.plannedWeight = avgWeight
              }
            })
          }
        }

        this.$message.success('子批次重量已自动同步')
      }).catch(() => {
        // 用户取消
      })
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

