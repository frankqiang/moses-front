/**
 * 文件名称：StartRepairDialog.vue
 * 文件描述：开始处理故障对话框组件
 * 创建日期：2025-01-20
 * 修改记录：
 *   - 2025-01-20: 初始创建
 */
<template>
  <el-dialog
    title="开始处理故障"
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

      <el-form-item label="故障等级">
        <status-tag
          :status="failureLevel"
          :type-map="FAILURE_LEVEL_CONFIG.typeMap"
          :text-map="FAILURE_LEVEL_CONFIG.textMap"
        />
      </el-form-item>

      <el-form-item label="影响程度">
        <span>{{ impactDegree }}</span>
        <el-alert
          v-if="impactDegree === '停机'"
          type="warning"
          :closable="false"
          style="margin-top: 8px"
        >
          设备将自动设为"维修中"状态
        </el-alert>
      </el-form-item>

      <el-form-item label="处理人员" prop="repairerId">
        <el-select
          v-model="formData.repairerId"
          placeholder="请选择处理人员"
          filterable
          clearable
          style="width: 100%"
        >
          <el-option
            v-for="user in userList"
            :key="user.id"
            :label="`${user.name} (${user.email})`"
            :value="user.id"
          />
        </el-select>
      </el-form-item>
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
import { startRepair } from '@/api/mdm/tpm/equipmentFailure'
import { FAILURE_LEVEL_CONFIG } from '../constants'
import StatusTag from '@/components/StatusTag'

export default {
  name: 'StartRepairDialog',
  components: {
    StatusTag
  },
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
    failureLevel: {
      type: String,
      default: ''
    },
    impactDegree: {
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
      FAILURE_LEVEL_CONFIG,
      formData: {
        repairerId: ''
      },
      rules: {
        repairerId: [
          { required: true, message: '请选择处理人员', trigger: 'change' }
        ]
      }
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
      this.formData.repairerId = ''
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
          const response = await startRepair(this.failureId, {
            repairerId: this.formData.repairerId
          })
          this.$message.success(response.message || '开始处理故障成功')
          this.$emit('success')
          this.handleClose()
        } catch (error) {
          this.$message.error(error.message || '开始处理故障失败')
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
</style>

