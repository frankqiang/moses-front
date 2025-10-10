<!--
  文件名称：BinStatusDialog.vue
  文件描述：料框状态变更对话框组件
  创建日期：2025-01-10
  修改记录：
    - 2025-01-10: 初始创建，实现料框状态手动变更功能
-->
<template>
  <el-dialog
    :visible.sync="dialogVisible"
    title="料框状态变更"
    width="600px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    top="10vh"
    @close="handleClose"
  >
    <!-- 料框信息展示 -->
    <div v-if="binData" class="bin-info">
      <el-alert
        :title="`料框编号：${binData.binCode} | 当前状态：${getCurrentStatusText()}`"
        type="info"
        :closable="false"
        show-icon
      />
    </div>

    <!-- 状态变更表单 -->
    <el-form
      ref="statusForm"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      class="status-form"
    >
      <!-- 目标状态选择 -->
      <el-form-item label="目标状态" prop="targetStatus">
        <el-select
          v-model="formData.targetStatus"
          placeholder="请选择目标状态"
          style="width: 100%"
          filterable
        >
          <el-option
            v-for="item in statusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <div class="field-hint">
          <i class="el-icon-info" />
          当前允许转换的状态（后端会验证转换规则）
        </div>
      </el-form-item>

      <!-- 触发类型选择 -->
      <el-form-item label="触发类型" prop="triggerType">
        <el-select
          v-model="formData.triggerType"
          placeholder="请选择触发类型"
          style="width: 100%"
        >
          <el-option
            v-for="item in triggerTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <!-- 备注输入 -->
      <el-form-item label="备注" prop="remarks">
        <el-input
          v-model="formData.remarks"
          type="textarea"
          placeholder="请输入状态变更备注（可选）"
          :rows="4"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>
    </el-form>

    <!-- 操作提示 -->
    <div class="operation-tips">
      <el-alert title="操作提示" type="warning" :closable="false" show-icon>
        <template #default>
          <div class="tips-content">
            状态变更将记录到历史记录中，请确认目标状态是否正确。如果状态转换不合法，系统将拒绝此操作。
          </div>
        </template>
      </el-alert>
    </div>

    <!-- 对话框底部按钮 -->
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button
          type="primary"
          :loading="loading"
          @click="handleConfirm"
        >
          {{ loading ? '提交中...' : '确认变更' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import { updateBinStatus } from '../api/bin-management'
import {
  BIN_STATUS_OPTIONS,
  BIN_STATUS_TEXT_MAP,
  TRIGGER_TYPE_OPTIONS
} from '../constants'

export default {
  name: 'BinStatusDialog',
  props: {
    // 对话框显示状态
    visible: {
      type: Boolean,
      default: false
    },
    // 料框数据
    binData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      dialogVisible: this.visible,
      loading: false,
      formData: {
        targetStatus: '', // 目标状态
        triggerType: '', // 触发类型
        remarks: '' // 备注
      },
      formRules: {
        targetStatus: [
          {
            required: true,
            message: '请选择目标状态',
            trigger: 'change'
          }
        ],
        triggerType: [
          {
            required: true,
            message: '请选择触发类型',
            trigger: 'change'
          }
        ]
      },
      // 状态选项
      statusOptions: BIN_STATUS_OPTIONS,
      // 触发类型选项
      triggerTypeOptions: TRIGGER_TYPE_OPTIONS
    }
  },
  watch: {
    visible(newVal) {
      this.dialogVisible = newVal
    },
    dialogVisible(newVal) {
      this.$emit('update:visible', newVal)
    }
  },
  methods: {
    /**
     * 获取当前状态显示文本
     */
    getCurrentStatusText() {
      if (!this.binData || !this.binData.status) {
        return '未知'
      }
      return BIN_STATUS_TEXT_MAP[this.binData.status] || this.binData.status
    },

    /**
     * 确认状态变更
     */
    async handleConfirm() {
      try {
        // 表单验证
        await this.$refs.statusForm.validate()

        this.loading = true

        // 准备请求数据
        const requestData = {
          targetStatus: this.formData.targetStatus,
          triggerType: this.formData.triggerType
        }

        // 备注为可选项，只有填写时才传递
        if (this.formData.remarks) {
          requestData.remarks = this.formData.remarks
        }

        // 调用状态更新API
        const response = await updateBinStatus(this.binData.id, requestData)

        // 显示后端返回的成功消息
        if (response.message) {
          this.$message.success(response.message)
        } else {
          this.$message.success('料框状态更新成功')
        }

        // 触发成功事件，传递更新后的数据
        this.$emit('success', response.data)
        this.handleClose()
      } catch (error) {
        console.error('状态变更失败:', error)

        // 显示后端返回的错误消息
        let errorMessage = '状态变更失败'

        if (error.error && error.error.message) {
          errorMessage = error.error.message
        } else if (error.message) {
          errorMessage = error.message
        }

        // 特殊处理状态转换不合法的错误
        if (error.error && error.error.code === 'BIN_STATUS_TRANSITION_INVALID') {
          if (error.error.details && error.error.details.allowedTransitions) {
            const allowedStatusText = error.error.details.allowedTransitions
              .map(status => BIN_STATUS_TEXT_MAP[status] || status)
              .join('、')
            errorMessage = `${errorMessage}。允许的状态转换：${allowedStatusText}`
          }
        }

        this.$message.error(errorMessage)
      } finally {
        this.loading = false
      }
    },

    /**
     * 取消操作
     */
    handleCancel() {
      this.handleClose()
    },

    /**
     * 关闭对话框
     */
    handleClose() {
      this.dialogVisible = false
      this.resetForm()
      this.$emit('close')
    },

    /**
     * 重置表单
     */
    resetForm() {
      this.formData = {
        targetStatus: '',
        triggerType: '',
        remarks: ''
      }

      this.$nextTick(() => {
        this.$refs.statusForm?.clearValidate()
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.bin-info {
  margin-bottom: 16px;
}

.status-form {
  margin-bottom: 16px;

  .field-hint {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
    display: flex;
    align-items: center;

    i {
      margin-right: 4px;
    }
  }
}

.operation-tips {
  margin-bottom: 16px;

  .tips-content {
    font-size: 12px;
    line-height: 1.5;
    color: #606266;
  }
}

.dialog-footer {
  text-align: right;
  padding-top: 16px;
}

// 对话框内容优化
::v-deep .el-dialog {
  margin-bottom: 5vh !important;

  .el-dialog__body {
    padding: 20px 20px 10px 20px;
  }

  .el-dialog__footer {
    padding: 10px 20px 20px 20px;
  }
}

// 响应式优化
@media (max-height: 800px) {
  ::v-deep .el-dialog {
    margin-top: 5vh !important;
    margin-bottom: 5vh !important;
  }
}

@media (max-height: 600px) {
  ::v-deep .el-dialog {
    margin-top: 3vh !important;
    margin-bottom: 3vh !important;

    .el-dialog__body {
      padding: 15px 20px 5px 20px;
    }

    .el-dialog__footer {
      padding: 5px 20px 15px 20px;
    }
  }

  .operation-tips {
    margin-bottom: 12px;
  }

  .status-form {
    margin-bottom: 12px;
  }

  .bin-info {
    margin-bottom: 12px;
  }
}
</style>

