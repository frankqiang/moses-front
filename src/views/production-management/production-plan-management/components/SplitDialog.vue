/**
 * 文件名称：SplitDialog.vue
 * 文件描述：生产计划拆分对话框
 * 创建日期：2025-01-21
 * 修改记录：
 *   - 2025-01-21: 初始创建，实现P0阶段核心功能
 */

<template>
  <el-dialog
    :visible.sync="visible"
    title="拆分生产计划"
    :close-on-click-modal="false"
    width="1200px"
    @close="handleClose"
  >
    <!-- 主计划基本信息 -->
    <div class="plan-info-section">
      <el-alert
        title="主计划信息"
        type="info"
        :closable="false"
        show-icon
      >
        <template slot="default">
          <div class="info-row">
            <span class="info-label">计划编号：</span>
            <span class="info-value">{{ planData.planNumber }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">产品编码：</span>
            <span class="info-value">{{ planData.productCode }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">需求数量：</span>
            <span class="info-value">{{ planData.demandQuantity }}{{ planData.demandUnit }}</span>
          </div>
        </template>
      </el-alert>
    </div>

    <!-- 拆分方式选择 -->
    <div class="split-mode-section">
      <div class="section-title">拆分方式</div>
      <el-radio-group v-model="splitMode" @change="handleSplitModeChange">
        <el-radio label="average">平均拆分</el-radio>
        <el-radio label="custom">自定义拆分</el-radio>
        <el-radio label="furnace">按炉次容量拆分</el-radio>
      </el-radio-group>

      <!-- 平均拆分配置 -->
      <div v-if="splitMode === 'average'" class="mode-config">
        <el-form-item label="拆分份数">
          <el-input-number
            v-model="splitCount"
            :min="1"
            :max="100"
            :step="1"
            @change="handleAverageSplit"
          />
          <span class="config-hint">系统将平均分配总重量到各个子批次</span>
        </el-form-item>
      </div>

      <!-- 按炉次容量拆分配置 -->
      <div v-if="splitMode === 'furnace'" class="mode-config">
        <el-form-item label="炉次容量（吨）">
          <el-input-number
            v-model="furnaceCapacity"
            :min="1"
            :max="100"
            :precision="1"
            :step="5"
            @change="handleFurnaceSplit"
          />
          <span class="config-hint">系统将根据炉次容量自动计算拆分份数</span>
        </el-form-item>
        <div v-if="furnaceCapacity > 0" class="split-result">
          <span>预计拆分为 <strong>{{ calculatedSplitCount }}</strong> 个子批次</span>
        </div>
      </div>
    </div>

    <!-- 子批次列表 -->
    <div class="items-section">
      <div class="section-header">
        <div class="section-title">子批次列表</div>
        <el-button
          v-if="splitMode === 'custom'"
          type="primary"
          size="small"
          icon="el-icon-plus"
          @click="handleAddItem"
        >
          添加子批次
        </el-button>
      </div>

      <el-table
        :data="formData.items"
        border
        stripe
        max-height="400"
      >
        <el-table-column
          label="序号"
          type="index"
          width="60"
          align="center"
        />
        <el-table-column
          label="子计划编号"
          min-width="180"
        >
          <template slot-scope="{ row }">
            <el-input
              v-model="row.itemNumber"
              placeholder="留空自动生成"
              size="small"
              clearable
            />
          </template>
        </el-table-column>
        <el-table-column
          label="拆分序号"
          width="100"
          align="center"
        >
          <template slot-scope="{ row, $index }">
            {{ $index + 1 }}
          </template>
        </el-table-column>
        <el-table-column
          label="预计重量（吨）"
          width="150"
        >
          <template slot-scope="{ row }">
            <el-input-number
              v-model="row.plannedWeight"
              :min="0.001"
              :max="9999999.999"
              :precision="3"
              :step="0.1"
              size="small"
              controls-position="right"
              style="width: 100%"
              @change="handleWeightChange"
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
              size="small"
              controls-position="right"
              style="width: 100%"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="工艺模板"
          min-width="180"
        >
          <template slot-scope="{ row }">
            <el-select
              v-model="row.processTemplateId"
              placeholder="请选择工艺模板"
              size="small"
              clearable
              filterable
              style="width: 100%"
            >
              <el-option
                v-for="item in processTemplateOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="80"
          align="center"
          fixed="right"
        >
          <template slot-scope="{ $index }">
            <el-button
              v-if="splitMode === 'custom' && formData.items.length > 1"
              type="danger"
              size="mini"
              icon="el-icon-delete"
              circle
              @click="handleDeleteItem($index)"
            />
          </template>
        </el-table-column>
      </el-table>

      <!-- 总重量统计 -->
      <div class="weight-summary">
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="summary-item">
              <span class="summary-label">需求总量：</span>
              <span class="summary-value">{{ planData.demandQuantity }}{{ planData.demandUnit }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="summary-item">
              <span class="summary-label">已分配：</span>
              <span class="summary-value" :class="{ 'text-primary': totalWeight > 0 }">
                {{ totalWeight.toFixed(3) }}{{ planData.demandUnit }}
              </span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="summary-item">
              <span class="summary-label">剩余：</span>
              <span
                class="summary-value"
                :class="{
                  'text-success': Math.abs(remainingWeight) <= 0.5,
                  'text-warning': remainingWeight > 0.5,
                  'text-danger': remainingWeight < -0.5
                }"
              >
                {{ remainingWeight.toFixed(3) }}{{ planData.demandUnit }}
              </span>
            </div>
          </el-col>
        </el-row>

        <!-- 重量校验提示 -->
        <el-alert
          v-if="!isWeightValid"
          title="重量分配不一致"
          type="error"
          :closable="false"
          show-icon
          style="margin-top: 12px"
        >
          <template slot="default">
            子批次总重量与需求数量相差 {{ Math.abs(remainingWeight).toFixed(3) }}{{ planData.demandUnit }}，
            超出允许误差范围（0.5{{ planData.demandUnit }}），请调整子批次重量。
          </template>
        </el-alert>
        <el-alert
          v-else-if="totalWeight > 0"
          title="重量分配正确"
          type="success"
          :closable="false"
          show-icon
          style="margin-top: 12px"
        >
          <template slot="default">
            子批次总重量与需求数量一致，误差 {{ Math.abs(remainingWeight).toFixed(3) }}{{ planData.demandUnit }}
            （在允许范围内）
          </template>
        </el-alert>
      </div>
    </div>

    <!-- 其他配置 -->
    <div class="config-section">
      <el-form ref="configForm" :model="formData" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="目标状态">
              <el-select
                v-model="formData.targetStatus"
                placeholder="请选择拆分后的状态"
                style="width: 100%"
              >
                <el-option label="已确认" value="CONFIRMED" />
                <el-option label="待排程" value="READY_FOR_SCHEDULING" />
              </el-select>
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
                placeholder="请输入拆分原因和描述"
                maxlength="500"
                show-word-limit
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <!-- 对话框底部按钮 -->
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="info" @click="handlePreview">预览</el-button>
      <el-button
        type="primary"
        :loading="submitLoading"
        :disabled="!canSubmit"
        @click="handleSubmit"
      >
        确定拆分
      </el-button>
    </div>

    <!-- 预览对话框 -->
    <el-dialog
      :visible.sync="previewVisible"
      title="拆分结果预览"
      width="900px"
      append-to-body
    >
      <div class="preview-content">
        <div class="preview-summary">
          <p>计划编号：{{ planData.planNumber }}</p>
          <p>拆分数量：{{ formData.items.length }} 个子批次</p>
          <p>总重量：{{ totalWeight.toFixed(3) }}{{ planData.demandUnit }}</p>
        </div>
        <el-table
          :data="formData.items"
          border
          stripe
        >
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="itemNumber" label="子计划编号" min-width="150">
            <template slot-scope="{ row }">
              {{ row.itemNumber || '自动生成' }}
            </template>
          </el-table-column>
          <el-table-column label="拆分序号" width="100" align="center">
            <template slot-scope="{ $index }">
              {{ $index + 1 }}
            </template>
          </el-table-column>
          <el-table-column prop="plannedWeight" label="预计重量（吨）" width="140" align="right">
            <template slot-scope="{ row }">
              {{ row.plannedWeight ? row.plannedWeight.toFixed(3) : '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="plannedQuantity" label="预计数量" width="100" align="right" />
          <el-table-column prop="processTemplateId" label="工艺模板" min-width="150">
            <template slot-scope="{ row }">
              {{ getProcessTemplateName(row.processTemplateId) }}
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div slot="footer">
        <el-button @click="previewVisible = false">返回修改</el-button>
        <el-button
          type="primary"
          :loading="submitLoading"
          @click="handleSubmitFromPreview"
        >
          确认拆分
        </el-button>
      </div>
    </el-dialog>
  </el-dialog>
</template>

<script>
import { splitPlan } from '../api'
// 从工艺参数管理模块获取工艺模板数据
import { fetchProcessTemplateList } from '@/views/master-data/process-parameter-management/api/process-parameter-management'
import { PLAN_STATUS } from '../constants'

export default {
  name: 'SplitDialog',
  props: {
    planData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      visible: false,
      previewVisible: false,
      submitLoading: false,
      splitMode: 'average', // average | custom | furnace
      splitCount: 2,
      furnaceCapacity: 40,
      formData: {
        items: [],
        targetStatus: 'CONFIRMED',
        remarks: '',
        changeDescription: ''
      },
      processTemplateOptions: []
    }
  },
  computed: {
    // 计算总重量
    totalWeight() {
      return this.formData.items.reduce((sum, item) => {
        return sum + (item.plannedWeight || 0)
      }, 0)
    },
    // 计算剩余重量
    remainingWeight() {
      return (this.planData.demandQuantity || 0) - this.totalWeight
    },
    // 重量校验
    isWeightValid() {
      return Math.abs(this.remainingWeight) <= 0.5
    },
    // 按炉次容量计算的拆分数
    calculatedSplitCount() {
      if (this.furnaceCapacity <= 0) return 0
      return Math.ceil((this.planData.demandQuantity || 0) / this.furnaceCapacity)
    },
    // 是否可以提交
    canSubmit() {
      return (
        this.formData.items.length > 0 &&
        this.isWeightValid &&
        this.formData.items.every(item => item.plannedWeight > 0) &&
        !this.planData.isFrozen &&
        this.isStatusAllowSplit
      )
    },
    // 状态是否允许拆分
    isStatusAllowSplit() {
      const allowedStatuses = [PLAN_STATUS.CONFIRMED, 'READY_FOR_SCHEDULING']
      return allowedStatuses.includes(this.planData.status)
    }
  },
  methods: {
    /**
     * 打开对话框
     */
    open() {
      // 检查状态和冻结状态
      if (this.planData.isFrozen) {
        this.$message.error('计划已冻结，不允许拆分')
        return
      }
      if (!this.isStatusAllowSplit) {
        this.$message.error('当前状态不允许拆分，仅已确认或待排程状态的计划可以拆分')
        return
      }

      this.visible = true
      this.initFormData()
      this.loadProcessTemplates()
    },

    /**
     * 关闭对话框
     */
    handleClose() {
      this.visible = false
      this.previewVisible = false
      this.resetForm()
    },

    /**
     * 初始化表单数据
     */
    initFormData() {
      this.splitMode = 'average'
      this.splitCount = 2
      this.furnaceCapacity = 40
      this.formData = {
        items: [],
        targetStatus: 'CONFIRMED',
        remarks: '',
        changeDescription: ''
      }
      // 自动执行平均拆分
      this.handleAverageSplit()
    },

    /**
     * 重置表单
     */
    resetForm() {
      this.formData = {
        items: [],
        targetStatus: 'CONFIRMED',
        remarks: '',
        changeDescription: ''
      }
    },

    /**
     * 加载工艺模板
     */
    async loadProcessTemplates() {
      try {
        const response = await fetchProcessTemplateList({
          status: '生效', // 只获取生效状态的工艺模板（中文状态值）
          limit: 100,
          page: 1
        })

        // 检查响应数据结构 - API 返回的字段是 templates，不是 results
        let templates = []
        if (response && response.data && response.data.templates) {
          templates = response.data.templates
        } else if (response && response.templates) {
          templates = response.templates
        }

        if (templates && templates.length > 0) {
          this.processTemplateOptions = templates.map(template => ({
            id: template.id,
            code: template.templateCode,
            name: template.templateName,
            status: template.status
          }))
        } else {
          this.processTemplateOptions = []
        }
      } catch (error) {
        console.error('加载工艺模板失败:', error)
        this.$message.error(error.message || '加载工艺模板失败')
      }
    },

    /**
     * 拆分方式变化
     */
    handleSplitModeChange() {
      if (this.splitMode === 'average') {
        this.handleAverageSplit()
      } else if (this.splitMode === 'furnace') {
        this.handleFurnaceSplit()
      } else {
        // 自定义模式，保持当前数据
        if (this.formData.items.length === 0) {
          this.handleAddItem()
        }
      }
    },

    /**
     * 平均拆分
     */
    handleAverageSplit() {
      if (this.splitCount < 1) return

      const totalWeight = this.planData.demandQuantity || 0
      const avgWeight = totalWeight / this.splitCount
      const defaultTemplateId = this.planData.defaultProcessTemplateId || ''

      this.formData.items = []
      for (let i = 0; i < this.splitCount; i++) {
        this.formData.items.push({
          itemNumber: '',
          sequence: i + 1,
          plannedWeight: Number(avgWeight.toFixed(3)),
          plannedQuantity: null,
          processTemplateId: defaultTemplateId
        })
      }
    },

    /**
     * 按炉次容量拆分
     */
    handleFurnaceSplit() {
      if (this.furnaceCapacity <= 0) return

      const totalWeight = this.planData.demandQuantity || 0
      const splitCount = this.calculatedSplitCount
      const avgWeight = totalWeight / splitCount
      const defaultTemplateId = this.planData.defaultProcessTemplateId || ''

      this.formData.items = []
      for (let i = 0; i < splitCount; i++) {
        this.formData.items.push({
          itemNumber: '',
          sequence: i + 1,
          plannedWeight: Number(avgWeight.toFixed(3)),
          plannedQuantity: null,
          processTemplateId: defaultTemplateId
        })
      }
    },

    /**
     * 添加子批次
     */
    handleAddItem() {
      const defaultTemplateId = this.planData.defaultProcessTemplateId || ''
      this.formData.items.push({
        itemNumber: '',
        sequence: this.formData.items.length + 1,
        plannedWeight: 0,
        plannedQuantity: null,
        processTemplateId: defaultTemplateId
      })
    },

    /**
     * 删除子批次
     */
    handleDeleteItem(index) {
      this.formData.items.splice(index, 1)
      // 重新设置序号
      this.formData.items.forEach((item, idx) => {
        item.sequence = idx + 1
      })
    },

    /**
     * 重量变化
     */
    handleWeightChange() {
      // 触发计算属性更新
    },

    /**
     * 获取工艺模板名称
     */
    getProcessTemplateName(templateId) {
      if (!templateId) return '未选择'
      const template = this.processTemplateOptions.find(t => t.id === templateId)
      return template ? template.name : templateId
    },

    /**
     * 预览
     */
    handlePreview() {
      if (!this.validateBeforeSubmit()) {
        return
      }
      this.previewVisible = true
    },

    /**
     * 提交前校验
     */
    validateBeforeSubmit() {
      // 检查是否有子批次
      if (this.formData.items.length === 0) {
        this.$message.error('至少需要包含1个子批次')
        return false
      }

      // 检查每个子批次重量
      const hasInvalidWeight = this.formData.items.some(item => !item.plannedWeight || item.plannedWeight <= 0)
      if (hasInvalidWeight) {
        this.$message.error('每个子批次的重量必须大于0')
        return false
      }

      // 检查总重量
      if (!this.isWeightValid) {
        this.$message.error(`子批次总重量与需求数量不一致，超出允许误差范围（0.5${this.planData.demandUnit}）`)
        return false
      }

      // 检查子计划编号重复
      const itemNumbers = this.formData.items
        .filter(item => item.itemNumber)
        .map(item => item.itemNumber)
      const uniqueNumbers = new Set(itemNumbers)
      if (itemNumbers.length !== uniqueNumbers.size) {
        this.$message.error('子计划编号不能重复')
        return false
      }

      return true
    },

    /**
     * 提交拆分
     */
    async handleSubmit() {
      await this.doSubmit()
    },

    /**
     * 从预览提交
     */
    async handleSubmitFromPreview() {
      this.previewVisible = false
      await this.doSubmit()
    },

    /**
     * 执行提交
     */
    async doSubmit() {
      if (!this.validateBeforeSubmit()) {
        return
      }

      try {
        this.submitLoading = true

        // 构建请求数据
        const items = this.formData.items.map((item, index) => {
          const itemData = {
            itemNumber: item.itemNumber || `${this.planData.planNumber}-ITEM-${String(index + 1).padStart(3, '0')}`,
            sequence: index + 1,
            plannedWeight: item.plannedWeight
          }

          if (item.plannedQuantity) {
            itemData.plannedQuantity = item.plannedQuantity
          }
          if (item.processTemplateId) {
            itemData.processTemplateId = item.processTemplateId
            itemData.processTemplateLinkType = 'PRIMARY'
          }

          return itemData
        })

        const requestData = {
          items,
          targetStatus: this.formData.targetStatus,
          changeDescription: this.formData.changeDescription || `拆分为${items.length}个子批次`
        }

        if (this.formData.remarks) {
          requestData.remarks = this.formData.remarks
        }

        const response = await splitPlan(this.planData.id, requestData)

        if (response.success) {
          this.$message.success(response.message || '拆分生产计划成功')
          this.handleClose()
          this.$emit('success')
        } else {
          this.$message.error(response.message || '拆分生产计划失败')
        }
      } catch (error) {
        console.error('拆分生产计划失败:', error)
        const errorMessage = error.response?.data?.error?.message || error.message || '拆分生产计划失败'
        this.$message.error(errorMessage)
      } finally {
        this.submitLoading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.plan-info-section {
  margin-bottom: 20px;

  .info-row {
    line-height: 1.8;

    .info-label {
      font-weight: 600;
      color: #606266;
    }

    .info-value {
      color: #303133;
      margin-left: 8px;
    }
  }
}

.split-mode-section {
  margin-bottom: 20px;
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 4px;

  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 12px;
  }

  .mode-config {
    margin-top: 16px;
    padding-left: 24px;

    .config-hint {
      margin-left: 12px;
      font-size: 12px;
      color: #909399;
    }

    .split-result {
      margin-top: 12px;
      font-size: 14px;
      color: #606266;

      strong {
        color: #409eff;
        font-size: 16px;
      }
    }
  }
}

.items-section {
  margin-bottom: 20px;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: #303133;
    }
  }

  .weight-summary {
    margin-top: 16px;
    padding: 16px;
    background-color: #f5f7fa;
    border-radius: 4px;

    .summary-item {
      text-align: center;

      .summary-label {
        font-size: 13px;
        color: #909399;
      }

      .summary-value {
        display: block;
        margin-top: 8px;
        font-size: 20px;
        font-weight: 600;
        color: #303133;

        &.text-primary {
          color: #409eff;
        }

        &.text-success {
          color: #67c23a;
        }

        &.text-warning {
          color: #e6a23c;
        }

        &.text-danger {
          color: #f56c6c;
        }
      }
    }
  }
}

.config-section {
  margin-bottom: 20px;
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.dialog-footer {
  text-align: right;
}

.preview-content {
  .preview-summary {
    margin-bottom: 20px;
    padding: 16px;
    background-color: #f5f7fa;
    border-radius: 4px;

    p {
      margin: 8px 0;
      line-height: 1.6;
      color: #606266;
    }
  }
}
</style>

