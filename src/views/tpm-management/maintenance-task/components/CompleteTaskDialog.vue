<!--
  文件名称：CompleteTaskDialog.vue
  文件描述：维护任务完成表单对话框组件
  创建日期：2024-01-20
  修改记录：
    - 2024-01-20: 初始创建，实现任务完成表单功能
-->
<template>
  <el-dialog
    :visible.sync="dialogVisible"
    :title="dialogTitle"
    width="900px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="handleClose"
  >
    <el-form
      ref="completeForm"
      :model="formData"
      :rules="formRules"
      label-width="140px"
      class="complete-task-form"
    >
      <!-- 任务基础信息展示 -->
      <div v-if="taskInfo" class="task-info-section">
        <el-alert
          :title="`任务编码：${taskInfo.taskCode || '-'} | 任务标题：${taskInfo.taskTitle || '未命名'}`"
          type="info"
          :closable="false"
          show-icon
        />
      </div>

      <!-- 维护内容详情（必填） -->
      <el-form-item label="维护内容详情" prop="maintenanceContent">
        <el-input
          v-model="formData.maintenanceContent"
          type="textarea"
          :rows="4"
          placeholder="请详细描述本次维护的具体内容和工作项（必填，最多500字）"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>

      <!-- 发现问题描述 -->
      <el-form-item label="发现问题描述" prop="problemFound">
        <el-input
          v-model="formData.problemFound"
          type="textarea"
          :rows="3"
          placeholder="请描述维护过程中发现的问题（可选，最多500字）"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>

      <!-- 处理措施 -->
      <el-form-item label="处理措施" prop="solutionApplied">
        <el-input
          v-model="formData.solutionApplied"
          type="textarea"
          :rows="3"
          placeholder="请描述针对发现问题采取的处理措施（可选，最多500字）"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>

      <!-- 设备状态记录 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="维护前设备状态" prop="equipmentStatusBefore">
            <el-input
              v-model="formData.equipmentStatusBefore"
              placeholder="请输入维护前设备状态"
              maxlength="200"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="维护后设备状态" prop="equipmentStatusAfter">
            <el-input
              v-model="formData.equipmentStatusAfter"
              placeholder="请输入维护后设备状态"
              maxlength="200"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 维护工时 -->
      <el-form-item label="维护工时（小时）" prop="workHours">
        <el-input-number
          v-model="formData.workHours"
          :min="0"
          :max="999.99"
          :precision="2"
          :step="0.5"
          placeholder="请输入维护工时"
          style="width: 100%"
        />
        <span class="form-tip">支持小数，最多2位小数</span>
      </el-form-item>

      <!-- 备件使用清单 -->
      <el-form-item label="备件使用清单">
        <spare-parts-table
          v-model="formData.sparePartsUsed"
          :editable="true"
        />
      </el-form-item>

      <!-- 下次维护建议 -->
      <el-form-item label="下次维护建议" prop="nextMaintenanceSuggestion">
        <el-input
          v-model="formData.nextMaintenanceSuggestion"
          type="textarea"
          :rows="3"
          placeholder="请填写下次维护建议（可选）"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>

      <!-- 任务备注 -->
      <el-form-item label="任务备注" prop="remark">
        <el-input
          v-model="formData.remark"
          type="textarea"
          :rows="2"
          placeholder="请填写任务备注（可选）"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>

      <!-- 维护记录备注 -->
      <el-form-item label="维护记录备注" prop="recordRemark">
        <el-input
          v-model="formData.recordRemark"
          type="textarea"
          :rows="2"
          placeholder="请填写维护记录备注（可选）"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取 消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">
        {{ submitting ? '提交中...' : '确认完成' }}
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import SparePartsTable from './SparePartsTable'
import { completeTask } from '../api'

export default {
  name: 'CompleteTaskDialog',

  components: {
    SparePartsTable
  },

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    taskInfo: {
      type: Object,
      default: () => ({
        id: '',
        taskCode: '',
        taskTitle: ''
      })
    }
  },

  data() {
    return {
      dialogVisible: false,
      submitting: false,
      formData: {
        maintenanceContent: '',
        problemFound: '',
        solutionApplied: '',
        equipmentStatusBefore: '',
        equipmentStatusAfter: '',
        workHours: null,
        sparePartsUsed: [],
        nextMaintenanceSuggestion: '',
        remark: '',
        recordRemark: ''
      },
      formRules: {
        maintenanceContent: [
          { required: true, message: '请填写维护内容详情', trigger: 'blur' },
          { max: 500, message: '维护内容详情最多500个字符', trigger: 'blur' }
        ]
      }
    }
  },

  computed: {
    dialogTitle() {
      return '完成维护任务'
    }
  },

  watch: {
    visible(val) {
      this.dialogVisible = val
      if (val) {
        this.resetForm()
      }
    },
    dialogVisible(val) {
      this.$emit('update:visible', val)
    }
  },

  methods: {

    /**
     * 表单验证
     */
    validateForm() {
      return new Promise((resolve, reject) => {
        this.$refs.completeForm.validate((valid) => {
          if (!valid) {
            this.$message.warning('请检查表单填写是否完整')
            reject(new Error('表单验证失败'))
            return
          }

          // 验证备件清单（根据接口文档：sparePartName和quantity必填，sparePartId和sparePartCode可选）
          if (this.formData.sparePartsUsed.length > 0) {
            for (let i = 0; i < this.formData.sparePartsUsed.length; i++) {
              const part = this.formData.sparePartsUsed[i]
              if (!part.sparePartName || !part.quantity || part.quantity <= 0) {
                this.$message.warning(`请完善第${i + 1}行备件信息（备件名称和数量必填）`)
                reject(new Error('备件信息不完整'))
                return
              }
            }
          }

          resolve()
        })
      })
    },

    /**
     * 提交表单
     */
    async handleSubmit() {
      try {
        // 表单验证
        await this.validateForm()

        // 确认提示
        await this.$confirm(
          '完成任务后将自动生成维护记录，任务状态将变为"已完成"，确认提交？',
          '确认完成',
          {
            confirmButtonText: '确认提交',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        this.submitting = true

        // 构建提交数据
        const submitData = {
          maintenanceContent: this.formData.maintenanceContent,
          problemFound: this.formData.problemFound || undefined,
          solutionApplied: this.formData.solutionApplied || undefined,
          equipmentStatusBefore: this.formData.equipmentStatusBefore || undefined,
          equipmentStatusAfter: this.formData.equipmentStatusAfter || undefined,
          // workHours 允许为0，所以需要特殊处理
          workHours: this.formData.workHours !== null && this.formData.workHours !== undefined ? this.formData.workHours : undefined,
          nextMaintenanceSuggestion: this.formData.nextMaintenanceSuggestion || undefined,
          remark: this.formData.remark || undefined,
          recordRemark: this.formData.recordRemark || undefined
        }

        // 处理备件清单
        if (this.formData.sparePartsUsed.length > 0) {
          submitData.sparePartsUsed = this.formData.sparePartsUsed.map(part => ({
            sparePartId: part.sparePartId || undefined,
            sparePartCode: part.sparePartCode || undefined,
            sparePartName: part.sparePartName,
            quantity: part.quantity
          }))
        }

        // 调用API
        const response = await completeTask(this.taskInfo.id, submitData)

        // 根据接口文档的统一响应格式处理
        this.$message.success(response.message || '任务完成成功')
        this.$emit('success', response.data)
        this.handleClose()
      } catch (error) {
        // 跳过用户取消确认框的情况
        if (error === 'cancel') {
          return
        }

        // 跳过表单验证失败的情况（已在validateForm中提示）
        if (error.message === '表单验证失败') {
          return
        }

        console.error('完成任务失败:', error)

        // 根据接口文档的错误码进行友好提示
        const errorCode = error?.error?.code || error?.code
        const errorMessage = error?.error?.message || error?.message

        switch (errorCode) {
          case 'TPM_TASK_002':
            this.$message.error('维护任务不存在，请刷新页面后重试')
            break
          case 'TPM_TASK_008':
            this.$message.error('只有执行中状态的任务才能完成，请检查任务状态')
            break
          case 'TPM_TASK_009':
          case 'FORBIDDEN':
            this.$message.error('只有任务执行人才能完成任务，请检查权限')
            break
          case 'USER_001':
            this.$message.error('执行人员不存在或已被禁用')
            break
          case 'VALIDATION_ERROR':
            this.$message.error(errorMessage || '请求参数验证失败，请检查表单填写')
            break
          case 'UNAUTHORIZED':
            this.$message.error('登录已过期，请重新登录')
            break
          case 'INTERNAL_ERROR':
            this.$message.error('服务器内部错误，请联系技术支持')
            break
          default:
            this.$message.error(errorMessage || '完成任务失败，请稍后重试')
        }
      } finally {
        this.submitting = false
      }
    },

    /**
     * 重置表单
     */
    resetForm() {
      this.formData = {
        maintenanceContent: '',
        problemFound: '',
        solutionApplied: '',
        equipmentStatusBefore: '',
        equipmentStatusAfter: '',
        workHours: null,
        sparePartsUsed: [],
        nextMaintenanceSuggestion: '',
        remark: '',
        recordRemark: ''
      }

      // 清除表单验证状态
      this.$nextTick(() => {
        if (this.$refs.completeForm) {
          this.$refs.completeForm.clearValidate()
        }
      })
    },

    /**
     * 关闭对话框
     */
    handleClose() {
      this.dialogVisible = false
      this.resetForm()
    }
  }
}
</script>

<style lang="scss" scoped>
.complete-task-form {
  .task-info-section {
    margin-bottom: 20px;
  }

  .form-tip {
    margin-left: 12px;
    font-size: 12px;
    color: #909399;
  }

  .spare-parts-section {
    width: 100%;

    .spare-parts-table {
      ::v-deep .el-table__body-wrapper {
        max-height: 300px;
        overflow-y: auto;
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>

