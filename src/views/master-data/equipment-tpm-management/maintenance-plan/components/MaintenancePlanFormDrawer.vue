/**
 * 文件名称：MaintenancePlanFormDrawer.vue
 * 文件描述：维护计划表单抽屉组件，支持创建、编辑、查看维护计划
 * 创建日期：2025-10-15
 * 修改记录：
 *   - 2025-10-15: 初始创建，实现基础表单功能
 *   - 2025-10-15: 集成通用组件，提高代码复用性
 */
<template>
  <base-drawer
    :visible.sync="drawerVisible"
    :title="drawerTitle"
    width="900px"
    :wrapper-closable="false"
    @open="handleDrawerOpen"
    @close="handleDrawerClose"
  >
    <!-- 表单内容 -->
    <el-form
      ref="form"
      :model="formData"
      :rules="formRules"
      label-width="160px"
      size="small"
      :disabled="innerMode === 'view'"
    >
      <!-- 一、基础信息 -->
      <div class="form-section">
        <div class="section-title">一、基础信息</div>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item
              label="计划编码"
              prop="planCode"
              :class="{ 'field-changed': innerMode === 'update' && isFieldChanged('planCode') }"
            >
              <el-input
                v-model="formData.planCode"
                placeholder="留空则自动生成"
                maxlength="100"
                show-word-limit
              />
              <div class="field-hint">不填写时系统将根据设备编码自动生成</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="计划名称"
              prop="planName"
              :class="{ 'field-changed': innerMode === 'update' && isFieldChanged('planName') }"
            >
              <el-input
                v-model="formData.planName"
                placeholder="请输入计划名称"
                maxlength="200"
                show-word-limit
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="关联设备" prop="equipmentId">
              <equipment-selector
                v-model="formData.equipmentId"
                :disabled="innerMode === 'view'"
                @select="handleEquipmentSelect"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="维护类型" prop="maintenanceType">
              <maintenance-type-select
                v-model="formData.maintenanceType"
                :disabled="innerMode === 'view'"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 二、维护周期配置 -->
      <div class="form-section">
        <div class="section-title">二、维护周期配置</div>
        <cycle-config-form
          :cycle-type.sync="formData.cycleType"
          :cycle-value.sync="formData.cycleValue"
          :cycle-unit.sync="formData.cycleUnit"
          :disabled="innerMode === 'view'"
          @change="handleCycleChange"
        />

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="提前生成任务天数" prop="advanceDays">
              <el-input-number
                v-model="formData.advanceDays"
                :min="0"
                :max="365"
                placeholder="请输入提前天数"
                controls-position="right"
                style="width: 100%"
              />
              <div class="field-hint">仅对"按时间"周期类型生效，默认3天</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="标准工时" prop="standardDurationHours">
              <standard-duration-input
                v-model="formData.standardDurationHours"
                :disabled="innerMode === 'view'"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 三、维护内容 -->
      <div class="form-section">
        <div class="section-title">三、维护内容</div>
        <el-form-item label="维护项目" prop="maintenanceItems">
          <el-input
            v-model="formData.maintenanceItems"
            type="textarea"
            :rows="4"
            placeholder="请输入维护项目和内容描述"
            maxlength="1000"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="所需技能/资质" prop="requiredSkills">
          <el-input
            v-model="formData.requiredSkills"
            type="textarea"
            :rows="2"
            placeholder="请输入所需技能或资质要求"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="安全注意事项" prop="safetyNotes">
          <el-input
            v-model="formData.safetyNotes"
            type="textarea"
            :rows="2"
            placeholder="请输入安全注意事项"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="作业指导书附件" prop="instructionAttachmentUrl">
          <el-input
            v-model="formData.instructionAttachmentUrl"
            placeholder="请输入附件URL"
            maxlength="500"
            show-word-limit
          />
          <div class="field-hint">请输入维护作业指导书的URL地址</div>
        </el-form-item>
      </div>

      <!-- 四、备件清单 -->
      <div class="form-section">
        <spare-parts-table
          ref="sparePartsTable"
          v-model="formData.requiredSpareParts"
          :readonly="innerMode === 'view'"
          title="四、备件清单"
        />
      </div>

      <!-- 五、计划状态 -->
      <div v-if="innerMode === 'create'" class="form-section">
        <div class="section-title">五、计划状态</div>
        <el-form-item label="计划状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio
              v-for="item in planStatusOptions"
              :key="item.value"
              :label="item.value"
            >
              {{ item.label }}
            </el-radio>
          </el-radio-group>
          <div class="field-hint">启用后将自动按周期生成维护任务</div>
        </el-form-item>
      </div>
    </el-form>

    <!-- 底部操作按钮 -->
    <template slot="footer">
      <el-button
        size="small"
        @click="handleCancel"
      >
        {{ innerMode === 'view' ? '关闭' : '取消' }}
      </el-button>
      <el-button
        v-if="innerMode !== 'view'"
        type="primary"
        size="small"
        :loading="submitLoading"
        @click="handleSubmit"
      >
        {{ innerMode === 'create' ? '创建' : '保存' }}
      </el-button>
    </template>
  </base-drawer>
</template>

<script>
import BaseDrawer from '@/components/Drawer'
import EquipmentSelector from './EquipmentSelector.vue'
import MaintenanceTypeSelect from './MaintenanceTypeSelect.vue'
import CycleConfigForm from './CycleConfigForm.vue'
import StandardDurationInput from './StandardDurationInput.vue'
import SparePartsTable from './SparePartsTable.vue'
import tpmDictionaryMixin from '@/views/master-data/equipment-tpm-management/mixins/dictionary'
import { FORM_RULES } from '../constants'
import {
  createMaintenancePlan,
  updateMaintenancePlan
} from '../api/maintenance-plan'
import {
  handleApiError,
  handleFormValidationError,
  showOperationSuccess,
  showConfirm,
  showWarning
} from '../utils'

export default {
  name: 'MaintenancePlanFormDrawer',

  components: {
    BaseDrawer,
    EquipmentSelector,
    MaintenanceTypeSelect,
    CycleConfigForm,
    StandardDurationInput,
    SparePartsTable
  },

  mixins: [tpmDictionaryMixin],

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    mode: {
      type: String,
      default: 'create',
      validator: val => ['create', 'update', 'view'].includes(val)
    },
    planData: {
      type: Object,
      default: null
    }
  },

  data() {
    return {
      drawerVisible: this.visible,
      innerMode: this.mode,
      submitLoading: false,

      // 表单数据
      formData: {
        planCode: '',
        planName: '',
        equipmentId: '',
        maintenanceType: '',
        maintenanceItems: '',
        cycleType: '',
        cycleValue: null,
        cycleUnit: '',
        standardDurationHours: null,
        requiredSpareParts: [],
        requiredSkills: '',
        safetyNotes: '',
        instructionAttachmentUrl: '',
        status: '启用',
        advanceDays: 3
      },

      // 原始数据（用于对比变更）
      originalFormData: null,

      // 字段变更状态
      changedFields: {},

      // 表单验证规则（从常量导入）
      formRules: FORM_RULES
    }
  },

  computed: {
    drawerTitle() {
      const titleMap = {
        create: '创建维护计划',
        update: '编辑维护计划',
        view: '查看维护计划'
      }
      return titleMap[this.innerMode] || '维护计划'
    },

    // 检测是否有字段变更
    hasFieldChanges() {
      if (this.innerMode !== 'update' || !this.originalFormData) {
        return false
      }
      return this.detectFieldChanges().length > 0
    },

    // 检测周期参数是否变更
    hasCycleChanges() {
      if (this.innerMode !== 'update' || !this.originalFormData) {
        return false
      }
      const cycleFields = ['cycleType', 'cycleValue', 'cycleUnit']
      return cycleFields.some(field =>
        this.formData[field] !== this.originalFormData[field]
      )
    }
  },

  watch: {
    visible(val) {
      this.drawerVisible = val
    },
    drawerVisible(val) {
      this.$emit('update:visible', val)
    },
    mode(val) {
      this.innerMode = val
    },
    planData: {
      handler(val) {
        if (val && this.innerMode !== 'create') {
          this.fillFormData(val)
        }
      },
      immediate: true,
      deep: true
    }
  },

  async created() {
    // 加载TPM模块字典
    await this.loadTPMDictionary()
  },

  methods: {
    /**
     * 抽屉打开事件处理
     */
    handleDrawerOpen() {
      if (this.innerMode === 'create') {
        this.resetFormData()
      } else if (this.planData) {
        this.fillFormData(this.planData)
      }
    },

    /**
     * 抽屉关闭事件处理
     */
    handleDrawerClose() {
      this.resetFormData()
      this.$refs.form?.clearValidate()
    },

    /**
     * 重置表单数据
     */
    resetFormData() {
      this.formData = {
        planCode: '',
        planName: '',
        equipmentId: '',
        maintenanceType: '',
        maintenanceItems: '',
        cycleType: '',
        cycleValue: null,
        cycleUnit: '',
        standardDurationHours: null,
        requiredSpareParts: [],
        requiredSkills: '',
        safetyNotes: '',
        instructionAttachmentUrl: '',
        status: '启用',
        advanceDays: 3
      }
    },

    /**
     * 填充表单数据（编辑/查看模式）
     */
    fillFormData(data) {
      this.formData = {
        planCode: data.planCode || '',
        planName: data.planName || '',
        equipmentId: data.equipmentId || '',
        maintenanceType: data.maintenanceType || '',
        maintenanceItems: data.maintenanceItems || '',
        cycleType: data.cycleType || '',
        cycleValue: data.cycleValue || null,
        cycleUnit: data.cycleUnit || '',
        standardDurationHours: data.standardDurationHours ? parseFloat(data.standardDurationHours) : null,
        requiredSpareParts: Array.isArray(data.requiredSpareParts) ? [...data.requiredSpareParts] : [],
        requiredSkills: data.requiredSkills || '',
        safetyNotes: data.safetyNotes || '',
        instructionAttachmentUrl: data.instructionAttachmentUrl || '',
        status: data.status || '启用',
        advanceDays: data.advanceDays || 3
      }

      // 保存原始数据用于变更对比（深拷贝）
      if (this.innerMode === 'update') {
        this.originalFormData = JSON.parse(JSON.stringify(this.formData))
      }

      // 如果有设备信息，添加到设备选项中
      if (data.equipment) {
        this.equipmentOptions = [{
          id: data.equipment.id,
          equipmentCode: data.equipment.equipmentCode,
          name: data.equipment.name
        }]
      }
    },

    /**
     * 检测字段变更
     */
    detectFieldChanges() {
      if (!this.originalFormData) return []

      const changes = []
      const fieldsToCheck = [
        'planCode', 'planName', 'equipmentId', 'maintenanceType',
        'maintenanceItems', 'cycleType', 'cycleValue', 'cycleUnit',
        'standardDurationHours', 'requiredSkills', 'safetyNotes',
        'instructionAttachmentUrl', 'advanceDays'
      ]

      fieldsToCheck.forEach(field => {
        if (this.isFieldChanged(field)) {
          changes.push({
            field,
            oldValue: this.originalFormData[field],
            newValue: this.formData[field]
          })
        }
      })

      // 检查备件清单变更
      if (this.isSparepartsChanged()) {
        changes.push({
          field: 'requiredSpareParts',
          oldValue: this.originalFormData.requiredSpareParts,
          newValue: this.formData.requiredSpareParts
        })
      }

      return changes
    },

    /**
     * 检查单个字段是否变更
     */
    isFieldChanged(field) {
      return this.formData[field] !== this.originalFormData[field]
    },

    /**
     * 检查备件清单是否变更
     */
    isSparepartsChanged() {
      const original = this.originalFormData.requiredSpareParts || []
      const current = this.formData.requiredSpareParts || []

      if (original.length !== current.length) return true

      return original.some((originalItem, index) => {
        const currentItem = current[index]
        return originalItem.sparePartId !== currentItem.sparePartId ||
               originalItem.quantity !== currentItem.quantity
      })
    },

    /**
     * 构建更新数据（只包含变更的字段）
     */
    buildUpdateData() {
      const changes = this.detectFieldChanges()
      const updateData = {}

      changes.forEach(change => {
        updateData[change.field] = change.newValue
      })

      // 过滤空值（但保留数字0和false）
      Object.keys(updateData).forEach(key => {
        const value = updateData[key]
        if (value === null || value === undefined || value === '') {
          delete updateData[key]
        }
      })

      return updateData
    },

    /**
     * 设备选择事件处理
     * @param {Object} equipment - 选中的设备信息
     */
    handleEquipmentSelect(equipment) {
      console.log('选中设备:', equipment)
      // 可以根据需要处理设备选择后的逻辑
    },

    /**
     * 周期配置变更事件处理
     * @param {Object} cycleConfig - 周期配置对象
     */
    handleCycleChange(cycleConfig) {
      console.log('周期配置变更:', cycleConfig)
      // 周期配置已通过.sync自动更新到formData
    },

    /**
     * 取消操作
     */
    handleCancel() {
      this.drawerVisible = false
    },

    /**
     * 提交表单
     */
    handleSubmit() {
      this.$refs.form.validate(valid => {
        if (!valid) {
          showWarning('请完善表单信息')
          return
        }

        // 验证备件清单（如果有备件）
        if (this.formData.requiredSpareParts.length > 0) {
          const sparePartsValid = this.$refs.sparePartsTable.validate()
          if (!sparePartsValid.valid) {
            return
          }
        }

        if (this.innerMode === 'create') {
          this.createPlan()
        } else {
          this.handleUpdateSubmit()
        }
      })
    },

    /**
     * 处理编辑模式的提交
     */
    async handleUpdateSubmit() {
      // 检查是否有字段变更
      if (!this.hasFieldChanges) {
        showWarning('未检测到任何变更')
        return
      }

      // 检查周期参数变更，显示确认对话框
      if (this.hasCycleChanges) {
        try {
          await showConfirm({
            message: '检测到维护周期参数发生变更，这可能会影响未来任务的生成时间和频率。确定要继续更新吗？',
            title: '周期参数变更确认',
            type: 'warning',
            confirmButtonText: '确认更新',
            cancelButtonText: '取消'
          })
          this.updatePlan()
        } catch {
          // 用户取消
        }
      } else {
        this.updatePlan()
      }
    },

    /**
     * 创建维护计划
     */
    async createPlan() {
      try {
        this.submitLoading = true

        // 准备提交数据
        const submitData = {
          ...this.formData,
          // 过滤空值
          planCode: this.formData.planCode || undefined,
          standardDurationHours: this.formData.standardDurationHours || undefined,
          requiredSpareParts: this.formData.requiredSpareParts.length > 0
            ? this.formData.requiredSpareParts
            : undefined,
          requiredSkills: this.formData.requiredSkills || undefined,
          safetyNotes: this.formData.safetyNotes || undefined,
          instructionAttachmentUrl: this.formData.instructionAttachmentUrl || undefined
        }

        const response = await createMaintenancePlan(submitData)

        showOperationSuccess('create', response)
        this.drawerVisible = false
        this.$emit('success', response.data)
      } catch (error) {
        // 如果是验证错误，进行字段级别的处理
        if (error.code === 'VALIDATION_ERROR' && error.details?.field) {
          handleFormValidationError(error, this.$refs.form)
        } else {
          handleApiError(error, {
            defaultMessage: '创建维护计划失败'
          })
        }
      } finally {
        this.submitLoading = false
      }
    },

    /**
     * 更新维护计划
     */
    async updatePlan() {
      try {
        this.submitLoading = true

        // 构建更新数据（只包含变更的字段）
        const updateData = this.buildUpdateData()

        // 检查是否有要更新的数据
        if (Object.keys(updateData).length === 0) {
          showWarning('未检测到任何变更')
          this.submitLoading = false
          return
        }

        // 移除状态字段（状态通过启用/禁用接口修改）
        delete updateData.status

        if (process.env.NODE_ENV === 'development') {
          console.log('🔄 [Update] 变更的字段:', updateData)
        }

        const response = await updateMaintenancePlan(this.planData.id, updateData)

        showOperationSuccess('update', response)
        this.drawerVisible = false
        this.$emit('success', response.data)
      } catch (error) {
        // 如果是验证错误，进行字段级别的处理
        if (error.code === 'VALIDATION_ERROR' && error.details?.field) {
          handleFormValidationError(error, this.$refs.form)
        } else {
          handleApiError(error, {
            defaultMessage: '更新维护计划失败'
          })
        }
      } finally {
        this.submitLoading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.form-section {
  margin-bottom: 24px;

  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid #EBEEF5;
  }
}

.field-hint {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.5;
}

// 字段变更高亮样式
.field-changed {
  position: relative;

  ::v-deep .el-form-item__label {
    color: #E6A23C;
    font-weight: 600;

    &::after {
      content: '*';
      color: #E6A23C;
      margin-left: 4px;
    }
  }

  ::v-deep .el-input__inner,
  ::v-deep .el-textarea__inner,
  ::v-deep .el-input-number__inner {
    border-color: #E6A23C;
    box-shadow: 0 0 0 2px rgba(230, 162, 60, 0.1);
  }

  ::v-deep .el-select .el-input__inner {
    border-color: #E6A23C;
  }
}
</style>

