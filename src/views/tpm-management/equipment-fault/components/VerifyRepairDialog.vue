/**
 * 文件名称：VerifyRepairDialog.vue
 * 文件描述：验证故障处理对话框组件
 * 创建日期：2025-01-20
 * 修改记录：
 *   - 2025-01-20: 初始创建
 */
<template>
  <el-dialog
    title="验证故障处理"
    :visible.sync="dialogVisible"
    width="600px"
    :close-on-click-modal="false"
    :before-close="handleClose"
    @open="handleOpen"
  >
    <el-form
      ref="form"
      :model="formData"
      :rules="rules"
      label-width="120px"
      size="medium"
    >
      <el-form-item label="故障编码">
        <span>{{ failureCode }}</span>
      </el-form-item>

      <el-form-item label="处理人员">
        <span>{{ repairerName }}</span>
      </el-form-item>

      <el-form-item label="处理措施">
        <div class="readonly-content">
          {{ repairActions || '-' }}
        </div>
      </el-form-item>

      <el-form-item label="验证人员" prop="verifierId">
        <el-select
          v-model="formData.verifierId"
          placeholder="请选择验证人员"
          filterable
          clearable
          style="width: 100%"
        >
          <el-option
            v-for="user in availableVerifiers"
            :key="user.id"
            :label="`${user.name} (${user.email})`"
            :value="user.id"
          />
        </el-select>
        <div class="form-tip">
          <i class="el-icon-info" />
          验证人员不能是故障处理人员
        </div>
      </el-form-item>

      <el-alert
        type="info"
        :closable="false"
        style="margin-bottom: 0"
      >
        验证通过后，设备状态将恢复为"启用"
      </el-alert>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取 消</el-button>
      <el-button
        type="primary"
        :loading="submitting"
        @click="handleSubmit"
      >
        确 定
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { verifyRepair } from '@/api/mdm/tpm/equipmentFailure'

export default {
  name: 'VerifyRepairDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    failureId: {
      type: String,
      required: true
    },
    failureCode: {
      type: String,
      default: ''
    },
    repairerId: {
      type: String,
      default: ''
    },
    repairerName: {
      type: String,
      default: ''
    },
    repairActions: {
      type: String,
      default: ''
    },
    userList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      dialogVisible: false,
      submitting: false,
      formData: {
        verifierId: ''
      },
      rules: {
        verifierId: [
          { required: true, message: '请选择验证人员', trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    // 可选择的验证人员（排除处理人员）
    availableVerifiers() {
      return this.userList.filter(user => user.id !== this.repairerId)
    }
  },
  watch: {
    visible(val) {
      this.dialogVisible = val
    },
    dialogVisible(val) {
      if (!val) {
        this.$emit('update:visible', false)
      }
    }
  },
  methods: {
    handleOpen() {
      this.formData.verifierId = ''
      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.clearValidate()
      })
    },
    handleClose() {
      this.dialogVisible = false
    },
    handleSubmit() {
      this.$refs.form.validate(async(valid) => {
        if (!valid) return

        try {
          this.submitting = true
          const response = await verifyRepair(this.failureId, {
            verifierId: this.formData.verifierId
          })
          this.$message.success(response.message || '验证故障处理成功')
          this.$emit('success')
          this.handleClose()
        } catch (error) {
          this.$message.error(error.message || '验证故障处理失败')
        } finally {
          this.submitting = false
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.readonly-content {
  padding: 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
  color: #606266;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 200px;
  overflow-y: auto;
}

.form-tip {
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
  line-height: 1.5;

  i {
    margin-right: 4px;
  }
}
</style>

