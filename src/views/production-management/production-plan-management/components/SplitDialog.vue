/**
 * 文件名称：SplitDialog.vue
 * 文件描述：生产计划拆分对话框
 * 创建日期：2025-01-21
 * 修改记录：
 *   - 2025-01-21: 初始创建，实现P0阶段核心功能
 *   - 2025-10-17: 移除 itemNumber 和 sequence 参数传递（后端自动生成）
 */

<template>
  <el-dialog
    :visible.sync="visible"
    title="拆分生产计划"
    :close-on-click-modal="false"
    width="1200px"
    top="5vh"
    custom-class="split-dialog"
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
        <div class="config-item">
          <label class="config-label">拆分份数</label>
          <el-input-number
            v-model="splitCount"
            :min="1"
            :max="100"
            :step="1"
            @change="handleAverageSplit"
          />
          <span class="config-hint">系统将平均分配总重量到各个子批次</span>
        </div>
      </div>

      <!-- 按炉次容量拆分配置 -->
      <div v-if="splitMode === 'furnace'" class="mode-config">
        <div class="config-item">
          <label class="config-label">炉次容量（吨）</label>
          <el-input-number
            v-model="furnaceCapacity"
            :min="1"
            :max="100"
            :precision="1"
            :step="5"
            @change="handleFurnaceSplit"
          />
          <span class="config-hint">系统将根据炉次容量自动计算拆分份数</span>
        </div>
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
        max-height="300"
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
          label="分配设备"
          min-width="200"
        >
          <template slot-scope="{ row }">
            <el-select
              v-model="row.assignedEquipmentId"
              placeholder="请选择设备"
              size="small"
              clearable
              filterable
              style="width: 100%"
            >
              <el-option
                v-for="item in equipmentOptions"
                :key="item.id"
                :label="`${item.code || ''} - ${item.name}`"
                :value="item.id"
              >
                <span style="float: left">{{ item.code }}</span>
                <span style="float: right; color: #8492a6; font-size: 13px">{{ item.name }}</span>
              </el-option>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column
          label="装炉时段开始"
          min-width="180"
        >
          <template slot-scope="{ row }">
            <el-date-picker
              v-model="row.expectedFurnaceWindowStart"
              type="datetime"
              placeholder="选择开始时间"
              size="small"
              value-format="yyyy-MM-dd HH:mm:ss"
              style="width: 100%"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="装炉时段结束"
          min-width="180"
        >
          <template slot-scope="{ row }">
            <el-date-picker
              v-model="row.expectedFurnaceWindowEnd"
              type="datetime"
              placeholder="选择结束时间"
              size="small"
              value-format="yyyy-MM-dd HH:mm:ss"
              style="width: 100%"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="备注"
          min-width="150"
        >
          <template slot-scope="{ row }">
            <el-input
              v-model="row.remarks"
              placeholder="备注说明"
              size="small"
              clearable
            />
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
            <el-form-item label="备注说明" prop="remarks">
              <el-input
                v-model="formData.remarks"
                type="textarea"
                :rows="2"
                placeholder="请输入备注说明（选填，最多500字符）"
                maxlength="500"
                show-word-limit
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
                placeholder="请输入拆分原因和描述（选填，最多500字符）"
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
          max-height="400"
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
          <el-table-column prop="plannedQuantity" label="预计数量" width="100" align="right">
            <template slot-scope="{ row }">
              {{ row.plannedQuantity || '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="processTemplateId" label="工艺模板" min-width="150">
            <template slot-scope="{ row }">
              {{ getProcessTemplateName(row.processTemplateId) }}
            </template>
          </el-table-column>
          <el-table-column prop="assignedEquipmentId" label="分配设备" min-width="120">
            <template slot-scope="{ row }">
              {{ getEquipmentName(row.assignedEquipmentId) }}
            </template>
          </el-table-column>
          <el-table-column prop="expectedFurnaceWindowStart" label="装炉开始" width="160">
            <template slot-scope="{ row }">
              {{ row.expectedFurnaceWindowStart || '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="expectedFurnaceWindowEnd" label="装炉结束" width="160">
            <template slot-scope="{ row }">
              {{ row.expectedFurnaceWindowEnd || '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="remarks" label="备注" min-width="150">
            <template slot-scope="{ row }">
              {{ row.remarks || '-' }}
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
// 从设备管理模块获取设备列表
import { fetchEquipmentList } from '@/views/master-data/equipment-management/api/equipment-management'
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
      processTemplateOptions: [],
      equipmentOptions: []
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
    // 状态是否允许拆分（根据接口文档：仅RECEIVED或CONFIRMED状态可拆分）
    isStatusAllowSplit() {
      const allowedStatuses = [PLAN_STATUS.RECEIVED, PLAN_STATUS.CONFIRMED]
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
        this.$message.error('当前状态不允许拆分，仅已接收（RECEIVED）或已确认（CONFIRMED）状态的计划可以拆分')
        return
      }

      this.visible = true
      this.initFormData()
      this.loadProcessTemplates()
      this.loadEquipments()
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
     * 加载设备列表
     */
    async loadEquipments() {
      try {
        const response = await fetchEquipmentList({
          equipmentType: 'annealing_furnace', // 只获取退火炉类型的设备（小写下划线格式）
          status: 'enabled', // 只获取启用状态的设备
          includeDetails: false, // 不需要详情，减少数据量
          limit: 100,
          page: 1
        })

        // 处理响应数据（根据 equipment-management.js 的返回格式）
        if (response.success && response.data) {
          const equipments = response.data.results || response.data.equipments || []
          this.equipmentOptions = equipments.map(equipment => ({
            id: equipment.id,
            name: equipment.name, // equipment-management 返回的字段是 name
            code: equipment.equipmentCode, // equipment-management 返回的字段是 equipmentCode
            type: equipment.equipmentType,
            status: equipment.status
          }))
        } else {
          console.warn('设备列表数据为空')
          this.equipmentOptions = []
        }
      } catch (error) {
        console.error('加载设备列表失败:', error)
        this.$message.warning('加载设备列表失败，请手动刷新或联系管理员')
        // 不阻断用户操作，设置为空数组
        this.equipmentOptions = []
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
          processTemplateId: defaultTemplateId,
          assignedEquipmentId: null,
          expectedFurnaceWindowStart: null,
          expectedFurnaceWindowEnd: null,
          remarks: ''
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
          processTemplateId: defaultTemplateId,
          assignedEquipmentId: null,
          expectedFurnaceWindowStart: null,
          expectedFurnaceWindowEnd: null,
          remarks: ''
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
        processTemplateId: defaultTemplateId,
        assignedEquipmentId: null,
        expectedFurnaceWindowStart: null,
        expectedFurnaceWindowEnd: null,
        remarks: ''
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
     * 获取设备名称
     */
    getEquipmentName(equipmentId) {
      if (!equipmentId) return '未选择'
      const equipment = this.equipmentOptions.find(e => e.id === equipmentId)
      return equipment ? `${equipment.code || ''} - ${equipment.name}` : equipmentId
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

        // 根据接口文档构建请求数据
        // 注意：itemNumber 和 sequence 字段由后端自动生成，前端无需传递
        const items = this.formData.items.map((item) => {
          const itemData = {
            // 预计重量（必填，吨）
            plannedWeight: Number(item.plannedWeight),
            // 预计数量（可选，卷数/件数）
            plannedQuantity: item.plannedQuantity ? Number(item.plannedQuantity) : undefined,
            // 工艺模板ID（可选）
            processTemplateId: item.processTemplateId || undefined,
            // 工艺模板关联类型（可选）
            processTemplateLinkType: item.processTemplateId ? 'PRIMARY' : undefined,
            // 分配的设备ID（可选）
            assignedEquipmentId: item.assignedEquipmentId || undefined,
            // 计划装炉时段开始（可选，ISO 8601格式）
            expectedFurnaceWindowStart: item.expectedFurnaceWindowStart ? this.formatDateTimeToISO(item.expectedFurnaceWindowStart) : undefined,
            // 计划装炉时段结束（可选，ISO 8601格式）
            expectedFurnaceWindowEnd: item.expectedFurnaceWindowEnd ? this.formatDateTimeToISO(item.expectedFurnaceWindowEnd) : undefined,
            // 备注（可选）
            remarks: item.remarks || undefined
          }

          // 移除 undefined 字段
          Object.keys(itemData).forEach(key => {
            if (itemData[key] === undefined) {
              delete itemData[key]
            }
          })

          return itemData
        })

        const requestData = {
          // 子批次拆分项列表（必填）
          items,
          // 拆分后的目标状态（可选，默认CONFIRMED）
          targetStatus: this.formData.targetStatus || 'CONFIRMED',
          // 备注说明（可选，最大500字符）
          remarks: this.formData.remarks || undefined,
          // 变更描述（可选，最大500字符）
          changeDescription: this.formData.changeDescription || `拆分为${items.length}个子批次`
        }

        // 移除 undefined 字段
        Object.keys(requestData).forEach(key => {
          if (requestData[key] === undefined) {
            delete requestData[key]
          }
        })

        console.log('[拆分生产计划] 请求数据:', requestData)

        const response = await splitPlan(this.planData.id, requestData)

        if (response.success) {
          this.$message.success(response.message || '拆分生产计划成功')
          this.handleClose()
          this.$emit('success')
        } else {
          // 失败时 message 在 error 对象中
          this.$message.error(response.error?.message || '拆分生产计划失败')
        }
      } catch (error) {
        console.error('[拆分生产计划] 请求失败:', error)
        this.handleSplitError(error)
      } finally {
        this.submitLoading = false
      }
    },

    /**
     * 处理拆分错误（根据接口文档错误码）
     */
    handleSplitError(error) {
      // 优先从响应中获取错误信息
      const errorData = error.response?.data?.error
      const errorCode = errorData?.code
      const errorMessage = errorData?.message

      // 根据接口文档的错误码处理
      switch (errorCode) {
        case 'PRODUCTION_PLAN_SPLIT_INVALID_PAYLOAD':
          this.$message.error(errorMessage || '拆分请求参数不合法，请检查子批次数据')
          break
        case 'PRODUCTION_PLAN_SPLIT_QUANTITY_MISMATCH':
          this.$message.error(errorMessage || '拆分后重量与原计划不一致，请调整子批次重量')
          // 显示详细的重量信息
          if (errorData?.details) {
            const { demandQuantity, totalSplitWeight, tolerance } = errorData.details
            this.$notify({
              title: '重量不一致',
              message: `需求数量: ${demandQuantity}${this.planData.demandUnit}\n拆分总重量: ${totalSplitWeight}${this.planData.demandUnit}\n允许误差: ±${tolerance}${this.planData.demandUnit}`,
              type: 'error',
              duration: 5000
            })
          }
          break
        case 'PRODUCTION_PLAN_OPERATION_NOT_ALLOWED':
          if (errorMessage && errorMessage.includes('冻结')) {
            this.$message.error('计划已冻结，不允许拆分')
          } else if (errorMessage && errorMessage.includes('状态')) {
            this.$message.error('当前状态不允许拆分，仅已接收或已确认状态的计划可以拆分')
          } else if (errorMessage && errorMessage.includes('权限')) {
            this.$message.error('您没有拆分生产计划的权限，请联系管理员')
          } else {
            this.$message.error(errorMessage || '操作不允许')
          }
          break
        case 'PRODUCTION_PLAN_NOT_FOUND':
          this.$message.error('生产计划不存在')
          break
        case 'PRODUCTION_PLAN_TRANSACTION_FAILED':
          this.$message.error('拆分生产计划失败，请稍后重试')
          break
        case 'UNAUTHORIZED':
          this.$message.error('未授权，请重新登录')
          break
        case 'FORBIDDEN':
          this.$message.error('无权限执行此操作，请联系管理员')
          break
        default:
          // 默认错误处理
          this.$message.error(errorMessage || error.message || '拆分生产计划失败，请稍后重试')
      }
    },

    /**
     * 格式化日期时间为ISO 8601格式
     */
    formatDateTimeToISO(dateStr) {
      if (!dateStr) return null
      try {
        // 如果是 YYYY-MM-DD HH:mm:ss 格式，转换为 ISO 8601
        const date = new Date(dateStr.replace(' ', 'T'))
        return date.toISOString()
      } catch (error) {
        console.warn('日期格式转换失败:', dateStr, error)
        return dateStr
      }
    }
  }
}
</script>

<style lang="scss" scoped>
// 对话框样式优化 - 确保内容可滚动
::v-deep .split-dialog {
  .el-dialog__body {
    max-height: 70vh;
    overflow-y: auto;
    padding: 20px 20px 0;
  }
}

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

    .config-item {
      display: flex;
      align-items: center;
      gap: 12px;

      .config-label {
        font-size: 14px;
        color: #606266;
        min-width: 100px;
      }
    }

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

