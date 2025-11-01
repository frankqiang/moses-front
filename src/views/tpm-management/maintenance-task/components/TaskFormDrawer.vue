<!--
  文件名称：TaskFormDrawer.vue
  文件描述：维护任务创建表单抽屉组件
  创建日期：2024-01-20
  修改记录：
    - 2024-01-20: 初始创建，实现任务创建表单
    - 2024-01-20: 重构优化，使用统一的工具函数和错误处理

  功能说明：
    - 严格按照接口文档实现创建维护任务功能
    - 支持任务类型：计划维护、应急抢修、状态检修
    - 时间格式统一使用ISO 8601标准
    - 使用统一的错误处理和消息提示

  接口文档：src/views/tpm-management/maintenance-task/docs/接口文档/维护任务管理接口文档.md#1-创建维护任务
-->
<template>
  <base-drawer
    :visible.sync="drawerVisible"
    :title="drawerTitle"
    width="800px"
    :wrapper-closable="false"
    @close="handleClose"
  >
    <el-form
      ref="taskForm"
      :model="formData"
      :rules="formRules"
      label-width="120px"
      class="task-form"
    >
      <!-- 任务编码（可选） -->
      <el-form-item label="任务编码" prop="taskCode">
        <el-input
          v-model="formData.taskCode"
          placeholder="留空则自动生成，格式：MT-设备编码-时间戳"
          clearable
          maxlength="100"
          show-word-limit
        >
          <template slot="append">
            <el-tooltip content="任务编码可留空，系统将自动生成" placement="top">
              <i class="el-icon-info" />
            </el-tooltip>
          </template>
        </el-input>
      </el-form-item>

      <!-- 设备选择（必填） -->
      <el-form-item label="设备" prop="equipmentId">
        <equipment-selector
          v-model="formData.equipmentId"
          @change="handleEquipmentChange"
        />
      </el-form-item>

      <!-- 任务类型（必填） -->
      <el-form-item label="任务类型" prop="taskType">
        <task-type-selector v-model="formData.taskType" />
      </el-form-item>

      <!-- 任务标题（必填） -->
      <el-form-item label="任务标题" prop="taskTitle">
        <el-input
          v-model="formData.taskTitle"
          placeholder="请输入任务标题"
          clearable
          maxlength="200"
          show-word-limit
        />
      </el-form-item>

      <!-- 维护计划（可选） -->
      <el-form-item label="维护计划" prop="planId">
        <maintenance-plan-selector
          v-model="formData.planId"
          :equipment-id="formData.equipmentId"
        />
      </el-form-item>

      <!-- 计划开始时间（必填） -->
      <el-form-item label="计划开始时间" prop="plannedStartTime">
        <el-date-picker
          v-model="formData.plannedStartTime"
          type="datetime"
          placeholder="请选择计划开始时间"
          value-format="yyyy-MM-dd HH:mm:ss"
          style="width: 100%"
          :picker-options="startTimePickerOptions"
        />
      </el-form-item>

      <!-- 计划结束时间（可选） -->
      <el-form-item label="计划结束时间" prop="plannedEndTime">
        <el-date-picker
          v-model="formData.plannedEndTime"
          type="datetime"
          placeholder="请选择计划结束时间（可选）"
          value-format="yyyy-MM-dd HH:mm:ss"
          style="width: 100%"
          :picker-options="endTimePickerOptions"
        />
      </el-form-item>

      <!-- 执行人员（可选） -->
      <el-form-item label="执行人员" prop="assignedTo">
        <personnel-selector
          v-model="formData.assignedTo"
          :show-workload="false"
        />
      </el-form-item>

      <!-- 任务描述（可选） -->
      <el-form-item label="任务描述" prop="taskDescription">
        <el-input
          v-model="formData.taskDescription"
          type="textarea"
          :rows="4"
          placeholder="请输入任务描述"
          maxlength="2000"
          show-word-limit
        />
      </el-form-item>

      <!-- 备注（可选） -->
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="formData.remark"
          type="textarea"
          :rows="3"
          placeholder="请输入备注信息"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取 消</el-button>
      <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
        {{ submitLoading ? '提交中...' : '确 定' }}
      </el-button>
    </template>
  </base-drawer>
</template>

<script>
import BaseDrawer from '@/components/Drawer'
import EquipmentSelector from './EquipmentSelector'
import MaintenancePlanSelector from './MaintenancePlanSelector'
import PersonnelSelector from './PersonnelSelector'
import TaskTypeSelector from './TaskTypeSelector'
import { createMaintenanceTask } from '../api'
import { buildCreateTaskData, initFormData, getFormRules } from '../utils/form-utils'
import { handleApiError } from '../utils/error-handler'
import { showCreateSuccess } from '../utils/message-handler'

export default {
  name: 'TaskFormDrawer',
  components: {
    BaseDrawer,
    EquipmentSelector,
    MaintenancePlanSelector,
    PersonnelSelector,
    TaskTypeSelector
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      drawerVisible: false,
      submitLoading: false,

      // 表单数据 - 使用工具函数初始化
      formData: initFormData(),

      // 表单验证规则 - 使用工具函数生成
      formRules: {},

      // 时间选择器配置
      startTimePickerOptions: {
        disabledDate(time) {
          // 不限制过去时间，允许创建历史任务
          return false
        }
      },
      endTimePickerOptions: {
        disabledDate: (time) => {
          if (this.formData.plannedStartTime) {
            return time.getTime() < new Date(this.formData.plannedStartTime).getTime()
          }
          return false
        }
      }
    }
  },
  computed: {
    drawerTitle() {
      return '创建维护任务'
    }
  },
  watch: {
    visible: {
      handler(val) {
        this.drawerVisible = val
        if (val) {
          this.initForm()
        }
      },
      immediate: true
    },
    drawerVisible(val) {
      this.$emit('update:visible', val)
    }
  },
  created() {
    // 初始化表单验证规则
    this.formRules = getFormRules(this)
  },
  methods: {
    /**
     * 初始化表单
     */
    initForm() {
      // 重置表单
      this.resetForm()
    },

    /**
     * 重置表单
     * 使用工具函数初始化表单数据，确保数据结构一致
     */
    resetForm() {
      this.formData = initFormData()
      this.$nextTick(() => {
        if (this.$refs.taskForm) {
          this.$refs.taskForm.clearValidate()
        }
      })
    },

    /**
     * 设备变化事件处理
     * 设备变化时清空维护计划选择，避免关联错误的维护计划
     *
     * @param {string} equipmentId - 设备ID
     * @param {Object} equipment - 设备对象（可选）
     */
    handleEquipmentChange(equipmentId, equipment) {
      // 设备变化时清空维护计划选择
      if (!equipmentId) {
        this.formData.planId = ''
      }
    },

    /**
     * 关闭抽屉
     * 关闭时重置表单，清除验证状态
     */
    handleClose() {
      this.drawerVisible = false
      this.resetForm()
    },

    /**
     * 提交表单
     *
     * 业务流程：
     * 1. 验证表单
     * 2. 构建提交数据（使用工具函数，确保符合接口格式）
     * 3. 调用创建接口
     * 4. 处理响应（成功/失败）
     * 5. 关闭抽屉并刷新列表
     */
    handleSubmit() {
      this.$refs.taskForm.validate(async(valid) => {
        if (!valid) {
          this.$message.warning('请完善必填信息')
          return false
        }

        try {
          this.submitLoading = true

          // 使用工具函数构建提交数据，确保符合接口文档格式
          const submitData = buildCreateTaskData(this.formData)

          // 开发环境输出提交数据，便于调试
          if (process.env.NODE_ENV === 'development') {
            console.log('📤 [创建维护任务] 提交数据:', submitData)
          }

          // 调用创建接口
          const response = await createMaintenanceTask(submitData)

          // 开发环境输出响应数据
          if (process.env.NODE_ENV === 'development') {
            console.log('✅ [创建维护任务] 成功响应:', response)
          }

          // 使用统一的成功消息处理器，优先使用后端返回的消息
          showCreateSuccess(response.message)

          // 关闭抽屉
          this.handleClose()

          // 通知父组件刷新列表
          this.$emit('success', response.data)
        } catch (error) {
          // 使用统一的错误处理器
          handleApiError(error)
        } finally {
          this.submitLoading = false
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.task-form {
  ::v-deep .el-form-item__label {
    font-weight: 500;
  }

  ::v-deep .el-select,
  ::v-deep .el-date-picker {
    width: 100%;
  }
}
</style>

