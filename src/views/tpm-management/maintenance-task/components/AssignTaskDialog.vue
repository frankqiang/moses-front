<!--
  文件名称：AssignTaskDialog.vue
  文件描述：任务派工对话框组件
  创建日期：2024-01-20
  修改记录：
    - 2024-01-20: 初始创建，实现任务派工功能
    - 2024-01-20: 根据接口文档重构，移除remark字段，完善错误处理和状态验证
-->
<template>
  <el-dialog
    :visible.sync="dialogVisible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    title="任务派工"
    width="600px"
    @close="handleClose"
  >
    <!-- 任务信息展示 -->
    <div v-if="taskInfo" class="task-info-section">
      <h4 class="section-title">
        <i class="el-icon-document" />
        当前任务信息
      </h4>
      <el-descriptions :column="1" border size="small">
        <el-descriptions-item label="任务编码">
          <span class="code-text">{{ taskInfo.taskCode }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="任务标题">
          {{ taskInfo.taskTitle }}
        </el-descriptions-item>
        <el-descriptions-item label="设备">
          {{ taskInfo.equipment ? taskInfo.equipment.name : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="任务状态">
          <el-tag :type="getStatusTagType(taskInfo.status)" size="small">
            {{ taskInfo.status }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <!-- 派工表单 -->
    <el-form
      ref="assignForm"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      class="assign-form"
    >
      <el-form-item label="执行人员" prop="assignedTo" required>
        <el-select
          v-model="formData.assignedTo"
          placeholder="请选择执行人员"
          filterable
          :loading="personnelLoading"
          style="width: 100%"
        >
          <el-option
            v-for="person in personnelList"
            :key="person.id"
            :label="person.name"
            :value="person.id"
          >
            <div class="personnel-option">
              <div class="personnel-info">
                <span class="personnel-name">{{ person.name }}</span>
                <span class="personnel-email">{{ person.email }}</span>
              </div>
              <div class="personnel-workload">
                <el-tag type="info" size="mini">
                  {{ getPersonnelWorkload(person.id) }}个任务
                </el-tag>
              </div>
            </div>
          </el-option>
          <div v-if="personnelList.length === 0 && !personnelLoading" slot="empty" class="empty-text">
            暂无可用人员
          </div>
        </el-select>
        <div v-if="selectedPersonnelInfo" class="selected-info">
          <i class="el-icon-info" />
          <span>当前负载：{{ getPersonnelWorkload(formData.assignedTo) }}个任务</span>
        </div>
      </el-form-item>
    </el-form>

    <!-- 对话框底部按钮 -->
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button
        type="primary"
        :loading="submitting"
        @click="handleConfirm"
      >
        确认派工
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { assignTask, getMaintenancePersonnel, getWorkloadAnalysis } from '../api/maintenance-task'
import { STATUS_TAG_TYPE_MAP } from '../constants/maintenance-task'

export default {
  name: 'AssignTaskDialog',

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    taskInfo: {
      type: Object,
      default: null
    }
  },

  data() {
    return {
      dialogVisible: false,
      submitting: false,
      personnelLoading: false,
      personnelList: [],
      workloadData: {},
      formData: {
        assignedTo: ''
      },
      formRules: {
        assignedTo: [
          { required: true, message: '请选择执行人员', trigger: 'change' }
        ]
      }
    }
  },

  computed: {
    /**
     * 获取选中人员信息
     */
    selectedPersonnelInfo() {
      if (!this.formData.assignedTo) return null
      return this.personnelList.find(p => p.id === this.formData.assignedTo)
    }
  },

  watch: {
    visible(val) {
      this.dialogVisible = val
      if (val) {
        this.initDialog()
      }
    }
  },

  methods: {
    /**
     * 初始化对话框
     */
    async initDialog() {
      // 重置表单
      this.resetForm()

      // 状态验证：只有待执行状态的任务才能派工
      if (this.taskInfo && this.taskInfo.status !== '待执行') {
        this.$message.warning('只有待执行状态的任务才能派工')
        this.handleClose()
        return
      }

      // 加载人员列表
      await this.loadPersonnelList()

      // 加载负载数据
      await this.loadWorkloadData()
    },

    /**
     * 重置表单
     */
    resetForm() {
      this.formData = {
        assignedTo: ''
      }
      if (this.$refs.assignForm) {
        this.$refs.assignForm.clearValidate()
      }
    },

    /**
     * 加载人员列表
     * 根据接口文档，人员筛选接口支持按组织架构筛选，不支持关键词搜索
     */
    async loadPersonnelList() {
      this.personnelLoading = true
      try {
        const params = {
          limit: 100, // 加载更多人员以便前端筛选
          sortBy: 'name:asc'
        }

        const response = await getMaintenancePersonnel(params)
        this.personnelList = response.data || []
      } catch (error) {
        console.error('加载人员列表失败:', error)
        // 使用后端返回的error.message字段
        this.$message.error(error.message || '加载人员列表失败')
        this.personnelList = []
      } finally {
        this.personnelLoading = false
      }
    },

    /**
     * 加载负载数据
     */
    async loadWorkloadData() {
      try {
        // 获取当前月份的负载数据
        const startDate = new Date()
        startDate.setDate(1)
        startDate.setHours(0, 0, 0, 0)

        const endDate = new Date()
        endDate.setMonth(endDate.getMonth() + 1)
        endDate.setDate(0)
        endDate.setHours(23, 59, 59, 999)

        const response = await getWorkloadAnalysis({
          groupBy: 'assignee',
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        })

        // 转换为便于查找的格式
        const workloadMap = {}
        if (response.data && response.data.data) {
          response.data.data.forEach(item => {
            if (item.assigneeId !== 'unassigned') {
              workloadMap[item.assigneeId] = {
                totalTasks: item.totalTasks || 0,
                pendingTasks: item.pendingTasks || 0,
                inProgressTasks: item.inProgressTasks || 0,
                delayedTasks: item.delayedTasks || 0
              }
            }
          })
        }
        this.workloadData = workloadMap
      } catch (error) {
        console.error('加载负载数据失败:', error)
        // 负载数据加载失败不影响派工流程
        this.workloadData = {}
      }
    },

    /**
     * 获取人员负载
     */
    getPersonnelWorkload(personnelId) {
      if (!personnelId || !this.workloadData[personnelId]) {
        return 0
      }
      const workload = this.workloadData[personnelId]
      // 计算当前负载：待执行 + 执行中 + 已延期
      return (workload.pendingTasks || 0) +
             (workload.inProgressTasks || 0) +
             (workload.delayedTasks || 0)
    },

    /**
     * 获取任务状态标签类型
     */
    getStatusTagType(status) {
      return STATUS_TAG_TYPE_MAP[status] || 'info'
    },

    /**
     * 确认派工
     */
    async handleConfirm() {
      // 表单验证
      const valid = await this.$refs.assignForm.validate().catch(() => false)
      if (!valid) {
        return
      }

      // 获取选中的人员信息用于确认提示
      const selectedPerson = this.personnelList.find(p => p.id === this.formData.assignedTo)
      const personnelName = selectedPerson ? selectedPerson.name : '选定的执行人员'

      // 二次确认
      try {
        await this.$confirm(
          `确认将任务"${this.taskInfo.taskTitle}"派发给 ${personnelName} 吗？`,
          '确认派工',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
      } catch {
        return
      }

      // 提交派工
      this.submitting = true
      try {
        const response = await assignTask(this.taskInfo.id, {
          assignedTo: this.formData.assignedTo
        })

        // 使用后端返回的message字段
        this.$message.success(response.message || '派工成功')

        // 触发成功事件，传递更新后的任务数据
        this.$emit('success', response.data)

        // 关闭对话框
        this.handleClose()
      } catch (error) {
        console.error('派工失败:', error)
        // 使用后端返回的error.message字段
        this.$message.error(error.message || '派工失败，请重试')
      } finally {
        this.submitting = false
      }
    },

    /**
     * 关闭对话框
     */
    handleClose() {
      this.resetForm()
      this.$emit('update:visible', false)
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss" scoped>
.task-info-section {
  margin-bottom: 24px;
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 4px;

  .section-title {
    margin: 0 0 12px 0;
    font-size: 14px;
    font-weight: 600;
    color: #303133;
    display: flex;
    align-items: center;
    gap: 6px;

    i {
      color: #409eff;
    }
  }

  .code-text {
    font-family: 'Courier New', Courier, monospace;
    color: #409eff;
    font-weight: 500;
  }
}

.assign-form {
  margin-top: 20px;

  .personnel-option {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 4px 0;

    .personnel-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;

      .personnel-name {
        font-size: 14px;
        color: #303133;
        font-weight: 500;
      }

      .personnel-email {
        font-size: 12px;
        color: #909399;
      }
    }

    .personnel-workload {
      flex-shrink: 0;
      margin-left: 12px;
    }
  }

  .selected-info {
    margin-top: 8px;
    font-size: 12px;
    color: #606266;
    display: flex;
    align-items: center;
    gap: 4px;

    i {
      color: #409eff;
    }
  }

  .empty-text {
    text-align: center;
    padding: 20px;
    color: #909399;
    font-size: 14px;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>

