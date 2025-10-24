/**
 * 文件名称：CompleteRepairDialog.vue
 * 文件描述：完成故障处理对话框组件
 * 创建日期：2025-01-20
 * 修改记录：
 *   - 2025-01-20: 初始创建
 */
<template>
  <el-dialog
    title="完成故障处理"
    :visible.sync="dialogVisible"
    width="800px"
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

      <el-form-item label="处理措施" prop="repairActions">
        <el-input
          v-model="formData.repairActions"
          type="textarea"
          :rows="4"
          placeholder="请详细描述故障处理过程和采取的措施"
          maxlength="1000"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="详细原因分析">
        <el-input
          v-model="formData.failureCauseDetailed"
          type="textarea"
          :rows="3"
          placeholder="请填写详细的故障原因分析（可选）"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="使用备件清单">
        <div class="spare-parts-section">
          <el-table
            :data="formData.sparePartsUsed"
            border
            size="small"
            max-height="300"
          >
            <el-table-column label="备件编码" min-width="120">
              <template slot-scope="scope">
                <el-select
                  v-model="scope.row.sparePartId"
                  placeholder="请选择备件"
                  filterable
                  clearable
                  size="small"
                  @change="handleSparePartChange(scope.$index, scope.row.sparePartId)"
                >
                  <el-option
                    v-for="part in sparePartsList"
                    :key="part.id"
                    :label="part.sparePartCode"
                    :value="part.id"
                  />
                </el-select>
              </template>
            </el-table-column>

            <el-table-column label="备件名称" min-width="150">
              <template slot-scope="scope">
                {{ scope.row.sparePartName || '-' }}
              </template>
            </el-table-column>

            <el-table-column label="数量" width="120">
              <template slot-scope="scope">
                <el-input-number
                  v-model="scope.row.quantity"
                  :min="1"
                  :max="9999"
                  size="small"
                  controls-position="right"
                  style="width: 100%"
                />
              </template>
            </el-table-column>

            <el-table-column label="操作" width="80" align="center">
              <template slot-scope="scope">
                <el-button
                  type="text"
                  size="small"
                  icon="el-icon-delete"
                  style="color: #f56c6c"
                  @click="handleRemoveSparePart(scope.$index)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <el-button
            type="primary"
            plain
            size="small"
            icon="el-icon-plus"
            style="margin-top: 12px"
            @click="handleAddSparePart"
          >
            添加备件
          </el-button>
        </div>
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
import { completeRepair } from '@/api/mdm/tpm/equipmentFailure'

export default {
  name: 'CompleteRepairDialog',
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
    sparePartsList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      dialogVisible: false,
      submitting: false,
      formData: {
        repairActions: '',
        failureCauseDetailed: '',
        sparePartsUsed: []
      },
      rules: {
        repairActions: [
          { required: true, message: '请填写处理措施', trigger: 'blur' },
          { min: 10, message: '处理措施至少需要10个字符', trigger: 'blur' }
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
      this.formData = {
        repairActions: '',
        failureCauseDetailed: '',
        sparePartsUsed: []
      }
      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.clearValidate()
      })
    },
    handleClose() {
      this.dialogVisible = false
    },
    // 添加备件行
    handleAddSparePart() {
      this.formData.sparePartsUsed.push({
        sparePartId: '',
        sparePartCode: '',
        sparePartName: '',
        quantity: 1
      })
    },
    // 删除备件行
    handleRemoveSparePart(index) {
      this.formData.sparePartsUsed.splice(index, 1)
    },
    // 备件选择变化
    handleSparePartChange(index, sparePartId) {
      const selectedPart = this.sparePartsList.find(p => p.id === sparePartId)
      if (selectedPart) {
        this.$set(this.formData.sparePartsUsed, index, {
          sparePartId: selectedPart.id,
          sparePartCode: selectedPart.sparePartCode,
          sparePartName: selectedPart.sparePartName,
          quantity: this.formData.sparePartsUsed[index].quantity || 1
        })
      }
    },
    handleSubmit() {
      this.$refs.form.validate(async(valid) => {
        if (!valid) return

        // 过滤掉未选择备件的行
        const validSpareParts = this.formData.sparePartsUsed.filter(item => item.sparePartId)

        try {
          this.submitting = true
          const requestData = {
            repairActions: this.formData.repairActions,
            failureCauseDetailed: this.formData.failureCauseDetailed || undefined,
            sparePartsUsed: validSpareParts.length > 0 ? validSpareParts : undefined
          }

          const response = await completeRepair(this.failureId, requestData)
          this.$message.success(response.message || '完成故障处理成功')
          this.$emit('success')
          this.handleClose()
        } catch (error) {
          this.$message.error(error.message || '完成故障处理失败')
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

.spare-parts-section {
  width: 100%;

  ::v-deep .el-table {
    .el-select {
      width: 100%;
    }
  }
}
</style>

