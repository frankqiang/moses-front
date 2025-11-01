<!--
  文件名称：AdjustScheduleItemDialog.vue
  文件描述：手动调整排程结果对话框组件
  创建日期：2025-10-23
  修改记录：
    - 2025-10-23: 初始创建
-->
<template>
  <el-dialog
    :visible.sync="dialogVisible"
    :title="dialogTitle"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    width="800px"
    @close="handleClose"
  >
    <el-form
      ref="adjustForm"
      :model="formData"
      :rules="formRules"
      label-width="120px"
    >
      <!-- 当前排程信息展示 -->
      <div class="current-info">
        <h4>当前排程信息</h4>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="info-item">
              <span class="label">任务编号：</span>
              <span class="value">{{ currentItem.taskCode }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <span class="label">产品编码：</span>
              <span class="value">{{ currentItem.task ? currentItem.task.productCode : '-' }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <span class="label">当前炉号：</span>
              <span class="value">{{ currentItem.furnaceCode }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <span class="label">任务重量：</span>
              <span class="value">{{ getTaskWeight(currentItem) }}吨</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <span class="label">炉次总重量：</span>
              <span class="value">{{ (currentItem.scheduleContext && currentItem.scheduleContext.totalWeight) || '-' }}吨</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <span class="label">当前装炉时间：</span>
              <span class="value">{{ formatDateTime(currentItem.plannedLoadingAt) }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <span class="label">当前出炉时间：</span>
              <span class="value">{{ formatDateTime(currentItem.plannedUnloadingAt) }}</span>
            </div>
          </el-col>
        </el-row>
      </div>

      <el-divider />

      <!-- 调整参数表单 -->
      <h4>调整参数</h4>
      <el-form-item label="目标炉号" prop="furnaceCode">
        <el-select
          v-model="formData.furnaceCode"
          placeholder="请选择目标炉号"
          filterable
          clearable
          style="width: 100%"
          :loading="furnaceLoading"
        >
          <el-option
            v-for="furnace in furnaceList"
            :key="furnace.code"
            :value="furnace.code"
            :label="`${furnace.code} - ${furnace.name}`"
            :disabled="furnace.disabled"
          >
            <span>{{ furnace.code }} - {{ furnace.name }}</span>
            <span style="float: right; color: #8492a6; font-size: 13px">
              {{ furnace.capacity }}T | {{ furnace.statusText }}
            </span>
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="计划装炉时间" prop="plannedLoadTime">
        <el-date-picker
          v-model="formData.plannedLoadTime"
          type="datetime"
          placeholder="选择装炉时间"
          style="width: 100%"
          format="yyyy-MM-dd HH:mm:ss"
          :picker-options="pickerOptions"
        />
        <div class="time-adjust-shortcuts">
          <el-button
            size="mini"
            type="text"
            @click="adjustTime('plannedLoadTime', 1)"
          >
            延后1小时
          </el-button>
          <el-button
            size="mini"
            type="text"
            @click="adjustTime('plannedLoadTime', 2)"
          >
            延后2小时
          </el-button>
          <el-button
            size="mini"
            type="text"
            @click="adjustTime('plannedLoadTime', 24)"
          >
            延后1天
          </el-button>
        </div>
      </el-form-item>

      <el-form-item label="计划出炉时间" prop="plannedUnloadTime">
        <el-date-picker
          v-model="formData.plannedUnloadTime"
          type="datetime"
          placeholder="选择出炉时间"
          style="width: 100%"
          format="yyyy-MM-dd HH:mm:ss"
          :picker-options="pickerOptions"
        />
        <div class="time-adjust-shortcuts">
          <el-button
            size="mini"
            type="text"
            @click="adjustTime('plannedUnloadTime', 1)"
          >
            延后1小时
          </el-button>
          <el-button
            size="mini"
            type="text"
            @click="adjustTime('plannedUnloadTime', 2)"
          >
            延后2小时
          </el-button>
          <el-button
            size="mini"
            type="text"
            @click="adjustTime('plannedUnloadTime', 24)"
          >
            延后1天
          </el-button>
        </div>
      </el-form-item>

      <el-form-item label="调整原因" prop="remarks">
        <el-input
          v-model="formData.remarks"
          type="textarea"
          :rows="3"
          placeholder="请说明调整原因（必填，最多1000字符）"
          maxlength="1000"
          show-word-limit
        />
      </el-form-item>

      <!-- 冲突检测结果 -->
      <div v-if="conflicts.length > 0" class="conflicts-section">
        <el-divider />
        <h4>
          <i class="el-icon-warning" />
          冲突检测结果
          <el-tag
            :type="hasCriticalConflict ? 'danger' : 'warning'"
            size="small"
            style="margin-left: 10px"
          >
            {{ conflicts.length }}个冲突
          </el-tag>
        </h4>
        <el-alert
          v-if="hasCriticalConflict"
          title="存在致命冲突，无法保存调整"
          type="error"
          :closable="false"
          style="margin-bottom: 10px"
        />
        <el-alert
          v-else
          title="存在非致命冲突，建议先解决"
          type="warning"
          :closable="false"
          style="margin-bottom: 10px"
        />
        <div class="conflicts-list">
          <div
            v-for="(conflict, index) in conflicts"
            :key="index"
            class="conflict-item"
            :class="`severity-${conflict.severity}`"
          >
            <div class="conflict-header">
              <el-tag
                :type="getSeverityType(conflict.severity)"
                size="small"
              >
                {{ getSeverityText(conflict.severity) }}
              </el-tag>
              <span class="conflict-type">{{ getConflictTypeText(conflict.conflictType) }}</span>
            </div>
            <div class="conflict-description">
              {{ conflict.conflictDescription }}
            </div>
            <div v-if="conflict.resolutionSuggestion" class="conflict-suggestion">
              <i class="el-icon-lightbulb" />
              {{ conflict.resolutionSuggestion }}
            </div>
          </div>
        </div>
      </div>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button
        type="primary"
        plain
        :loading="previewLoading"
        @click="handlePreviewConflict"
      >
        预览冲突
      </el-button>
      <el-button
        type="primary"
        :loading="submitLoading"
        :disabled="hasCriticalConflict"
        @click="handleSubmit"
      >
        确认调整
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { adjustScheduleItem } from '../api'
import {
  CONFLICT_TYPE_MAP,
  SEVERITY_LEVEL_MAP,
  SEVERITY_TYPE_MAP
} from '../constants/detail-config'
import { parseTime } from '@/utils'

export default {
  name: 'AdjustScheduleItemDialog',

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    planId: {
      type: String,
      required: true
    },
    currentItem: {
      type: Object,
      default: () => ({})
    }
  },

  data() {
    // 自定义验证规则：出炉时间必须晚于装炉时间
    const validateUnloadTime = (rule, value, callback) => {
      if (!value) {
        callback()
        return
      }
      const loadTime = this.formData.plannedLoadTime
      if (loadTime && value.getTime() <= loadTime.getTime()) {
        callback(new Error('出炉时间必须晚于装炉时间'))
      } else {
        callback()
      }
    }

    return {
      dialogVisible: false,
      formData: {
        furnaceCode: '',
        plannedLoadTime: null,
        plannedUnloadTime: null,
        remarks: ''
      },
      formRules: {
        remarks: [
          { required: true, message: '请输入调整原因', trigger: 'blur' },
          { max: 1000, message: '调整原因不能超过1000个字符', trigger: 'blur' }
        ],
        plannedUnloadTime: [
          { validator: validateUnloadTime, trigger: 'change' }
        ]
      },
      furnaceList: [],
      furnaceLoading: false,
      conflicts: [],
      previewLoading: false,
      submitLoading: false,
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() < Date.now() - 8.64e7 // 禁用昨天之前的日期
        }
      }
    }
  },

  computed: {
    dialogTitle() {
      return `手动调整排程结果 - ${this.currentItem.taskCode || ''}`
    },
    hasCriticalConflict() {
      return this.conflicts.some(c => c.severity === 'critical')
    }
  },

  watch: {
    visible: {
      handler(val) {
        this.dialogVisible = val
        if (val) {
          this.initForm()
          this.fetchFurnaceList()
        }
      },
      immediate: true
    },
    dialogVisible(val) {
      if (!val) {
        this.$emit('update:visible', false)
      }
    }
  },

  methods: {
    /**
     * 获取任务重量（优先使用实际重量）
     */
    getTaskWeight(item) {
      if (!item || !item.task) return '-'

      // 优先使用实际重量
      const actualWeight = item.task.actualWeight
      if (actualWeight !== null && actualWeight !== undefined) {
        return typeof actualWeight === 'number' ? actualWeight.toFixed(2) : actualWeight
      }

      // 备用：计划重量
      const plannedWeight = item.task.plannedWeight
      if (plannedWeight !== null && plannedWeight !== undefined) {
        return typeof plannedWeight === 'number' ? plannedWeight.toFixed(2) : plannedWeight
      }

      return '-'
    },

    /**
     * 初始化表单数据
     */
    initForm() {
      this.formData = {
        furnaceCode: this.currentItem.furnaceCode || '',
        plannedLoadTime: this.currentItem.plannedLoadingAt ? new Date(this.currentItem.plannedLoadingAt) : null,
        plannedUnloadTime: this.currentItem.plannedUnloadingAt ? new Date(this.currentItem.plannedUnloadingAt) : null,
        remarks: ''
      }
      this.conflicts = []
      this.$nextTick(() => {
        if (this.$refs.adjustForm) {
          this.$refs.adjustForm.clearValidate()
        }
      })
    },

    /**
     * 获取炉子列表
     */
    async fetchFurnaceList() {
      this.furnaceLoading = true
      try {
        // TODO: 集成设备管理模块的炉子列表接口
        // 这里使用模拟数据
        this.furnaceList = [
          {
            code: 'TH-01',
            name: '退火炉1号',
            capacity: 40,
            status: 'idle',
            statusText: '空闲',
            disabled: false
          },
          {
            code: 'TH-02',
            name: '退火炉2号',
            capacity: 42,
            status: 'idle',
            statusText: '空闲',
            disabled: false
          },
          {
            code: 'TH-03',
            name: '退火炉3号',
            capacity: 40,
            status: 'running',
            statusText: '运行中',
            disabled: false
          },
          {
            code: 'TH-04',
            name: '退火炉4号',
            capacity: 40,
            status: 'fault',
            statusText: '故障',
            disabled: true
          },
          {
            code: 'TH-05',
            name: '退火炉5号',
            capacity: 40,
            status: 'maintenance',
            statusText: '维护',
            disabled: true
          }
        ]
      } catch (error) {
        this.$message.error('获取炉子列表失败')
      } finally {
        this.furnaceLoading = false
      }
    },

    /**
     * 时间快捷调整
     * @param {string} field - 字段名
     * @param {number} hours - 延后的小时数
     */
    adjustTime(field, hours) {
      const currentTime = this.formData[field]
      if (!currentTime) {
        this.$message.warning('请先选择时间')
        return
      }
      const date = new Date(currentTime.getTime())
      date.setHours(date.getHours() + hours)
      this.formData[field] = date
    },

    /**
     * 预览冲突检测
     */
    async handlePreviewConflict() {
      // 验证表单
      try {
        await this.$refs.adjustForm.validate()
      } catch (error) {
        this.$message.warning('请先完善调整参数')
        return
      }

      // 检查是否至少修改了一个字段
      if (!this.hasChanges()) {
        this.$message.warning('请至少修改一个字段')
        return
      }

      this.previewLoading = true
      try {
        // 先提交调整（用于冲突检测）
        const adjustData = this.buildAdjustData()
        const response = await adjustScheduleItem(
          this.planId,
          this.currentItem.id,
          adjustData
        )

        // 获取冲突列表
        if (response.data.conflicts && response.data.conflicts.length > 0) {
          this.conflicts = response.data.conflicts
          this.$message.warning(`检测到 ${this.conflicts.length} 个冲突`)
        } else {
          this.conflicts = []
          this.$message.success('未检测到冲突，可以安全调整')
        }
      } catch (error) {
        // 处理验证错误并显示冲突信息
        this.handleAdjustmentError(error)
      } finally {
        this.previewLoading = false
      }
    },

    /**
     * 提交调整
     */
    async handleSubmit() {
      // 验证表单
      try {
        await this.$refs.adjustForm.validate()
      } catch (error) {
        return
      }

      // 检查是否至少修改了一个字段
      if (!this.hasChanges()) {
        this.$message.warning('请至少修改一个字段')
        return
      }

      // 检查是否有致命冲突
      if (this.hasCriticalConflict) {
        this.$message.error('存在致命冲突，无法保存调整')
        return
      }

      this.submitLoading = true
      try {
        const adjustData = this.buildAdjustData()
        const response = await adjustScheduleItem(
          this.planId,
          this.currentItem.id,
          adjustData
        )

        const message = response.message || '排程结果调整成功'
        this.$message.success(message)

        // 如果调整成功但返回冲突，显示提示
        if (response.data.conflicts && response.data.conflicts.length > 0) {
          this.$message.warning(
            `调整成功，但检测到 ${response.data.conflicts.length} 个冲突，请注意处理`
          )
        }

        this.$emit('success')
        this.handleClose()
      } catch (error) {
        // 处理验证错误并显示冲突信息
        this.handleAdjustmentError(error)
      } finally {
        this.submitLoading = false
      }
    },

    /**
     * 处理调整错误（包含冲突信息）
     */
    handleAdjustmentError(error) {
      // 检查是否有详细的错误信息
      if (error.details) {
        const { errors, conflicts } = error.details

        // 转换并显示冲突信息
        if (conflicts && conflicts.length > 0) {
          this.conflicts = this.transformConflicts(conflicts)
        }

        // 显示详细错误消息（如果有）
        // 注意：验证错误(VAL_开头)已经由axios拦截器显示基础消息，这里只显示详细错误
        if (errors && errors.length > 0) {
          this.$message({
            message: errors.join('\n'),
            type: 'error',
            duration: 5000,
            showClose: true
          })
        }
      } else {
        // 没有详细信息，显示基础错误（非验证错误）
        if (!error.code || !error.code.startsWith('VAL_')) {
          this.$message.error(error.message || '调整排程结果失败')
        }
      }
    },

    /**
     * 转换后端返回的简化冲突格式为组件期望的完整格式
     */
    transformConflicts(backendConflicts) {
      return backendConflicts.map((conflict, index) => {
        const conflictType = conflict.type || conflict.conflictType || 'unknown'

        // 根据冲突类型生成描述信息
        let description = ''
        let suggestion = ''
        const severity = 'critical' // 默认为致命冲突

        if (conflictType === 'time-conflict') {
          const loadTime = this.formatDateTime(conflict.plannedLoadingAt)
          const unloadTime = this.formatDateTime(conflict.plannedUnloadingAt)
          description = `时间冲突：与任务 ${conflict.taskCode} 的时间段冲突（${loadTime} ~ ${unloadTime}）`
          suggestion = '建议调整装炉时间或选择其他炉子'
        } else if (conflictType === 'capacity-conflict') {
          description = `容量冲突：与任务 ${conflict.taskCode} 同时排程会超出炉子容量限制`
          suggestion = '建议调整时间段或分批次排程'
        } else if (conflictType === 'process-conflict') {
          description = `工艺冲突：与任务 ${conflict.taskCode} 的工艺参数不兼容`
          suggestion = '建议选择不同的炉子或调整工艺参数'
        } else if (conflictType === 'resource-conflict') {
          description = `资源冲突：与任务 ${conflict.taskCode} 存在资源竞争`
          suggestion = '建议调整时间段以错开资源使用'
        } else {
          description = `与任务 ${conflict.taskCode} 存在冲突`
          suggestion = '请检查并调整排程参数'
        }

        // 如果后端提供了完整格式，优先使用后端数据
        return {
          id: conflict.id || `conflict-${index}`,
          conflictType: conflictType,
          severity: conflict.severityLevel || conflict.severity || severity,
          conflictDescription: conflict.description || description,
          resolutionSuggestion: conflict.suggestion || suggestion,
          affectedTaskIds: conflict.affectedTaskIds || [conflict.taskCode]
        }
      })
    },

    /**
     * 检查是否有字段变更
     */
    hasChanges() {
      const loadTimeChanged = this.formData.plannedLoadTime
        ? this.formData.plannedLoadTime.toISOString() !== new Date(this.currentItem.plannedLoadingAt).toISOString()
        : !!this.currentItem.plannedLoadingAt

      const unloadTimeChanged = this.formData.plannedUnloadTime
        ? this.formData.plannedUnloadTime.toISOString() !== new Date(this.currentItem.plannedUnloadingAt).toISOString()
        : !!this.currentItem.plannedUnloadingAt

      return (
        this.formData.furnaceCode !== this.currentItem.furnaceCode ||
        loadTimeChanged ||
        unloadTimeChanged
      )
    },

    /**
     * 构建调整数据
     */
    buildAdjustData() {
      const data = {
        remarks: this.formData.remarks
      }

      // 检查炉号是否变更
      if (this.formData.furnaceCode !== this.currentItem.furnaceCode) {
        data.furnaceCode = this.formData.furnaceCode
      }

      // 检查装炉时间是否变更
      const loadTimeChanged = this.formData.plannedLoadTime
        ? this.formData.plannedLoadTime.toISOString() !== new Date(this.currentItem.plannedLoadingAt).toISOString()
        : false

      if (loadTimeChanged && this.formData.plannedLoadTime) {
        data.plannedLoadTime = this.formData.plannedLoadTime.toISOString()
      }

      // 检查出炉时间是否变更
      const unloadTimeChanged = this.formData.plannedUnloadTime
        ? this.formData.plannedUnloadTime.toISOString() !== new Date(this.currentItem.plannedUnloadingAt).toISOString()
        : false

      if (unloadTimeChanged && this.formData.plannedUnloadTime) {
        data.plannedUnloadTime = this.formData.plannedUnloadTime.toISOString()
      }

      return data
    },

    /**
     * 格式化日期时间
     */
    formatDateTime(datetime) {
      return parseTime(datetime, '{y}-{m}-{d} {h}:{i}:{s}')
    },

    /**
     * 获取冲突类型文本
     */
    getConflictTypeText(type) {
      return CONFLICT_TYPE_MAP[type] || type
    },

    /**
     * 获取严重程度文本
     */
    getSeverityText(level) {
      return SEVERITY_LEVEL_MAP[level] || level
    },

    /**
     * 获取严重程度类型
     */
    getSeverityType(level) {
      return SEVERITY_TYPE_MAP[level] || 'info'
    },

    /**
     * 关闭对话框
     */
    handleClose() {
      this.dialogVisible = false
      this.conflicts = []
      this.$refs.adjustForm.resetFields()
    }
  }
}
</script>

<style lang="scss" scoped>
.current-info {
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 20px;

  h4 {
    margin-top: 0;
    margin-bottom: 12px;
    font-size: 14px;
    font-weight: 600;
    color: #303133;
  }

  .info-item {
    margin-bottom: 8px;
    font-size: 14px;
    line-height: 1.5;

    .label {
      color: #909399;
      margin-right: 8px;
    }

    .value {
      color: #303133;
      font-weight: 500;
    }
  }
}

.time-adjust-shortcuts {
  margin-top: 8px;

  .el-button {
    padding: 0;
    margin-right: 16px;
  }
}

.conflicts-section {
  margin-top: 20px;

  h4 {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    font-size: 14px;
    font-weight: 600;
    color: #303133;

    i {
      margin-right: 6px;
      color: #e6a23c;
    }
  }

  .conflicts-list {
    max-height: 300px;
    overflow-y: auto;
  }

  .conflict-item {
    padding: 12px;
    margin-bottom: 12px;
    border-radius: 4px;
    border: 1px solid #dcdfe6;
    background-color: #fff;

    &.severity-critical {
      border-color: #f56c6c;
      background-color: #fef0f0;
    }

    &.severity-high {
      border-color: #f56c6c;
      background-color: #fef0f0;
    }

    &.severity-medium {
      border-color: #e6a23c;
      background-color: #fdf6ec;
    }

    &.severity-low {
      border-color: #909399;
      background-color: #f4f4f5;
    }

    .conflict-header {
      display: flex;
      align-items: center;
      margin-bottom: 8px;

      .conflict-type {
        margin-left: 8px;
        font-size: 14px;
        font-weight: 500;
        color: #303133;
      }
    }

    .conflict-description {
      font-size: 13px;
      color: #606266;
      line-height: 1.6;
      margin-bottom: 8px;
    }

    .conflict-suggestion {
      padding: 8px;
      background-color: rgba(255, 255, 255, 0.5);
      border-radius: 4px;
      font-size: 13px;
      color: #606266;
      line-height: 1.6;

      i {
        margin-right: 4px;
        color: #e6a23c;
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>

