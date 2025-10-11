<template>
  <el-dialog
    :visible.sync="dialogVisible"
    :title="dialogTitle"
    width="1200px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="handleClose"
  >
    <!-- 表单区域 -->
    <el-form
      ref="stackForm"
      :model="formData"
      :rules="formRules"
      label-width="120px"
      class="stack-dialog-form"
    >
      <!-- 料垛编号 -->
      <el-form-item label="料垛编号" prop="stackCode">
        <el-input
          v-model="formData.stackCode"
          placeholder="不填写则自动生成（格式：LD-YYYYMMDD-XXXX）"
          clearable
          maxlength="50"
        >
          <template slot="prepend">
            <i class="el-icon-barcode" />
          </template>
        </el-input>
        <div class="form-item-tip">
          <i class="el-icon-info" />
          料垛编号可不填，系统将自动生成
        </div>
      </el-form-item>

      <!-- 料框选择方式切换 -->
      <el-form-item label="选择方式">
        <el-radio-group v-model="selectMode" @change="handleSelectModeChange">
          <el-radio label="manual">手动输入</el-radio>
          <el-radio label="table">表格选择</el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- 手动输入料框ID -->
      <el-form-item v-if="selectMode === 'manual'" label="料框ID列表" prop="binIdsInput">
        <el-input
          v-model="binIdsInput"
          type="textarea"
          :rows="4"
          placeholder="请输入料框ID，多个ID用逗号、分号或换行分隔"
          @blur="handleBinIdsInputBlur"
        />
        <div class="form-item-tip">
          <i class="el-icon-info" />
          输入料框ID后失焦自动解析
        </div>
      </el-form-item>

      <!-- 表格选择料框 -->
      <el-form-item v-if="selectMode === 'table'" label="选择料框">
        <el-button
          type="primary"
          size="small"
          icon="el-icon-plus"
          @click="handleOpenBinSelector"
        >
          打开料框选择器
        </el-button>
        <el-button
          v-if="selectedBins.length > 0"
          type="danger"
          size="small"
          icon="el-icon-delete"
          plain
          @click="handleClearAllBins"
        >
          清空所有料框
        </el-button>
      </el-form-item>

      <!-- 已选料框列表展示 -->
      <el-form-item label="已选料框" class="selected-bins-section">
        <div v-if="selectedBins.length === 0" class="empty-tip">
          <i class="el-icon-info" />
          暂未选择料框，至少需要选择2个料框进行组垛
        </div>
        <div v-else class="selected-bins-list">
          <!-- 统计信息 -->
          <div class="bins-summary">
            <el-tag type="info" size="small">
              已选 {{ selectedBins.length }} 个料框
            </el-tag>
            <el-tag type="success" size="small">
              堆叠层数：{{ stackLayers }} 层
            </el-tag>
            <el-tag type="warning" size="small">
              总重量：{{ totalWeight }} kg
            </el-tag>
            <el-tag
              v-if="maxStackingLayers > 0"
              :type="stackLayers > maxStackingLayers ? 'danger' : 'info'"
              size="small"
            >
              规格最大堆叠：{{ maxStackingLayers }} 层
            </el-tag>
          </div>

          <!-- 料框列表表格 -->
          <el-table
            :data="selectedBins"
            border
            size="small"
            max-height="300"
            :row-class-name="getRowClassName"
            class="bins-table"
          >
            <el-table-column type="index" label="序号" width="60" align="center" />
            <el-table-column prop="binCode" label="料框编号" min-width="160" align="center" show-overflow-tooltip />
            <el-table-column label="料框规格" min-width="140" align="center">
              <template slot-scope="{ row }">
                <span>{{ row.specification ? row.specification.specificationCode : row.binSpecificationId }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="productCode" label="产品代码" min-width="160" align="left" show-overflow-tooltip />
            <el-table-column prop="batchNumber" label="批次号" min-width="140" align="center" show-overflow-tooltip />
            <el-table-column label="重量(kg)" min-width="100" align="right">
              <template slot-scope="{ row }">
                {{ row.weight ? row.weight.toFixed(3) : '-' }}
              </template>
            </el-table-column>
            <el-table-column label="状态" min-width="120" align="center">
              <template slot-scope="{ row }">
                <status-tag :status="row.status" :config="binStatusConfig" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" align="center" fixed="right">
              <template slot-scope="{ row, $index }">
                <el-button
                  type="text"
                  size="small"
                  icon="el-icon-top"
                  :disabled="$index === 0"
                  @click="handleMoveBinUp($index)"
                >
                  上移
                </el-button>
                <el-button
                  type="text"
                  size="small"
                  icon="el-icon-bottom"
                  :disabled="$index === selectedBins.length - 1"
                  @click="handleMoveBinDown($index)"
                >
                  下移
                </el-button>
                <el-button
                  type="text"
                  size="small"
                  icon="el-icon-delete"
                  style="color: #f56c6c"
                  @click="handleRemoveBin($index)"
                >
                  移除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 规则提示信息 -->
          <div v-if="validationErrors.length > 0" class="validation-errors">
            <el-alert
              v-for="(error, index) in validationErrors"
              :key="index"
              :title="error"
              type="error"
              :closable="false"
              show-icon
              style="margin-top: 8px"
            />
          </div>
        </div>
      </el-form-item>

      <!-- 备注 -->
      <el-form-item label="备注" prop="remarks">
        <el-input
          v-model="formData.remarks"
          type="textarea"
          :rows="3"
          placeholder="请输入备注信息（可选，最多500字符）"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>
    </el-form>

    <!-- 组垛规则提示 -->
    <div class="stacking-rules-tip">
      <el-alert
        title="组垛规则说明"
        type="info"
        :closable="false"
        show-icon
      >
        <template slot="default">
          <ul class="rules-list">
            <li>至少需要选择2个料框进行组垛</li>
            <li>所有料框必须具有相同的料框规格代码</li>
            <li>所有料框必须具有相同的铝箔产品代码</li>
            <li>所有料框必须具有相同的批次号（业务要求）</li>
            <li>所有料框必须处于相同的状态</li>
            <li>堆叠层数不得超过该规格的最大堆叠层数</li>
            <li>所有料框必须不在其他料垛中（stackId为空）</li>
          </ul>
        </template>
      </el-alert>
    </div>

    <!-- 底部操作按钮 -->
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">
        取消
      </el-button>
      <el-button
        type="primary"
        :loading="submitting"
        :disabled="!canSubmit"
        @click="handleSubmit"
      >
        确认组垛
      </el-button>
    </div>

    <!-- 料框选择器对话框 -->
    <bin-selector-dialog
      :visible.sync="binSelectorVisible"
      :selected-bin-ids="selectedBinIds"
      @confirm="handleBinSelectorConfirm"
    />
  </el-dialog>
</template>

<script>
import { createStack } from '../api'
import { getBinDetail } from '@/views/inventory-management/bin-management/api'
import { STACK_CODE_PATTERN } from '../constants'
import { BIN_STATUS_CONFIG } from '@/views/inventory-management/bin-management/constants'
import StatusTag from '@/components/StatusTag'
import BinSelectorDialog from './BinSelectorDialog.vue'

export default {
  name: 'StackDialog',

  components: {
    StatusTag,
    BinSelectorDialog
  },

  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },

  data() {
    // 料垛编号格式验证
    const validateStackCode = (rule, value, callback) => {
      if (!value) {
        callback()
        return
      }
      if (!STACK_CODE_PATTERN.test(value)) {
        callback(new Error('料垛编号格式不正确（正确格式：LD-YYYYMMDD-XXXX）'))
      } else {
        callback()
      }
    }

    // 料框ID输入验证
    const validateBinIdsInput = (rule, value, callback) => {
      if (this.selectMode === 'table') {
        callback()
        return
      }
      if (this.selectedBins.length < 2) {
        callback(new Error('至少需要选择2个料框进行组垛'))
      } else {
        callback()
      }
    }

    return {
      dialogVisible: false,
      submitting: false,
      selectMode: 'manual', // manual: 手动输入, table: 表格选择
      binIdsInput: '',
      formData: {
        stackCode: '',
        remarks: ''
      },
      formRules: {
        stackCode: [
          { validator: validateStackCode, trigger: 'blur' }
        ],
        binIdsInput: [
          { validator: validateBinIdsInput, trigger: 'blur' }
        ]
      },
      selectedBins: [], // 已选择的料框列表
      validationErrors: [], // 组垛规则验证错误
      binStatusConfig: BIN_STATUS_CONFIG,
      binSelectorVisible: false
    }
  },

  computed: {
    dialogTitle() {
      return '组垛'
    },

    // 已选料框的ID列表
    selectedBinIds() {
      return this.selectedBins.map(bin => bin.id)
    },

    // 堆叠层数
    stackLayers() {
      return this.selectedBins.length
    },

    // 总重量
    totalWeight() {
      const total = this.selectedBins.reduce((sum, bin) => sum + (bin.weight || 0), 0)
      return total.toFixed(3)
    },

    // 最大堆叠层数（从第一个料框的规格中获取）
    maxStackingLayers() {
      if (this.selectedBins.length === 0) return 0
      const firstBin = this.selectedBins[0]
      return firstBin.specification?.maxStackingLayers || 0
    },

    // 是否可以提交
    canSubmit() {
      return this.selectedBins.length >= 2 && this.validationErrors.length === 0 && !this.submitting
    }
  },

  watch: {
    visible: {
      handler(val) {
        this.dialogVisible = val
      },
      immediate: true
    },

    dialogVisible(val) {
      this.$emit('update:visible', val)
    },

    // 监听已选料框变化，实时校验规则
    selectedBins: {
      handler() {
        this.validateStackingRules()
      },
      deep: true
    }
  },

  methods: {
    /**
     * 切换选择方式
     */
    handleSelectModeChange(mode) {
      // 切换选择方式时清空已选料框
      if (mode === 'table' && this.binIdsInput) {
        this.$confirm('切换选择方式将清空已输入的料框ID，是否继续？', '提示', {
          type: 'warning'
        }).then(() => {
          this.binIdsInput = ''
          this.selectedBins = []
        }).catch(() => {
          this.selectMode = this.selectMode === 'manual' ? 'table' : 'manual'
        })
      }
    },

    /**
     * 处理料框ID输入失焦
     */
    async handleBinIdsInputBlur() {
      if (!this.binIdsInput.trim()) {
        this.selectedBins = []
        return
      }

      // 解析输入的料框ID（支持逗号、分号、换行分隔）
      const binIds = this.binIdsInput
        .split(/[,;\n]/)
        .map(id => id.trim())
        .filter(id => id)

      if (binIds.length === 0) {
        this.selectedBins = []
        return
      }

      // 去重
      const uniqueBinIds = [...new Set(binIds)]

      // 加载料框详情
      await this.loadBinDetails(uniqueBinIds)
    },

    /**
     * 加载料框详情
     */
    async loadBinDetails(binIds) {
      const loading = this.$loading({
        lock: true,
        text: '正在加载料框信息...',
        spinner: 'el-icon-loading'
      })

      try {
        const promises = binIds.map(id => getBinDetail(id))
        const results = await Promise.allSettled(promises)

        const successBins = []
        const failedIds = []

        results.forEach((result, index) => {
          if (result.status === 'fulfilled' && result.value.success) {
            successBins.push(result.value.data)
          } else {
            failedIds.push(binIds[index])
          }
        })

        if (failedIds.length > 0) {
          this.$message.warning(`以下料框ID加载失败：${failedIds.join(', ')}`)
        }

        this.selectedBins = successBins

        if (successBins.length === 0) {
          this.$message.error('没有成功加载任何料框信息')
        }
      } catch (error) {
        console.error('加载料框详情失败:', error)
        this.$message.error('加载料框信息失败，请重试')
      } finally {
        loading.close()
      }
    },

    /**
     * 打开料框选择器
     */
    handleOpenBinSelector() {
      this.binSelectorVisible = true
    },

    /**
     * 料框选择器确认
     */
    handleBinSelectorConfirm(selectedBins) {
      this.selectedBins = selectedBins
      this.binSelectorVisible = false
    },

    /**
     * 清空所有料框
     */
    handleClearAllBins() {
      this.$confirm('确定要清空所有已选料框吗？', '提示', {
        type: 'warning'
      }).then(() => {
        this.selectedBins = []
      }).catch(() => {})
    },

    /**
     * 上移料框
     */
    handleMoveBinUp(index) {
      if (index === 0) return
      const bins = [...this.selectedBins]
      const temp = bins[index]
      bins[index] = bins[index - 1]
      bins[index - 1] = temp
      this.selectedBins = bins
    },

    /**
     * 下移料框
     */
    handleMoveBinDown(index) {
      if (index === this.selectedBins.length - 1) return
      const bins = [...this.selectedBins]
      const temp = bins[index]
      bins[index] = bins[index + 1]
      bins[index + 1] = temp
      this.selectedBins = bins
    },

    /**
     * 移除料框
     */
    handleRemoveBin(index) {
      this.selectedBins.splice(index, 1)
    },

    /**
     * 验证组垛规则
     */
    validateStackingRules() {
      this.validationErrors = []

      if (this.selectedBins.length < 2) {
        return
      }

      const firstBin = this.selectedBins[0]

      // 检查规格一致性
      const specificationMismatch = this.selectedBins.some(bin => bin.binSpecificationId !== firstBin.binSpecificationId)
      if (specificationMismatch) {
        this.validationErrors.push('所有料框必须具有相同的料框规格代码')
      }

      // 检查产品代码一致性
      const productMismatch = this.selectedBins.some(bin => bin.productCode !== firstBin.productCode)
      if (productMismatch) {
        this.validationErrors.push('所有料框必须具有相同的铝箔产品代码')
      }

      // 检查批次号一致性
      const batchMismatch = this.selectedBins.some(bin => bin.batchNumber !== firstBin.batchNumber)
      if (batchMismatch) {
        this.validationErrors.push('所有料框必须具有相同的批次号')
      }

      // 检查状态一致性
      const statusMismatch = this.selectedBins.some(bin => bin.status !== firstBin.status)
      if (statusMismatch) {
        this.validationErrors.push('所有料框必须处于相同的状态')
      }

      // 检查是否已在料垛中
      const inStack = this.selectedBins.some(bin => bin.stackId)
      if (inStack) {
        this.validationErrors.push('所有料框必须不在其他料垛中')
      }

      // 检查堆叠层数限制
      if (this.maxStackingLayers > 0 && this.stackLayers > this.maxStackingLayers) {
        this.validationErrors.push(`堆叠层数（${this.stackLayers}）超过规格最大堆叠层数（${this.maxStackingLayers}）`)
      }

      return this.validationErrors.length === 0
    },

    /**
     * 获取表格行的类名（高亮冲突的料框）
     */
    getRowClassName({ rowIndex }) {
      // 检查是否有规格不一致的冲突
      if (this.selectedBins.length > 0) {
        const firstBin = this.selectedBins[0]
        const currentBin = this.selectedBins[rowIndex]

        const hasConflict =
          currentBin.binSpecificationId !== firstBin.binSpecificationId ||
          currentBin.productCode !== firstBin.productCode ||
          currentBin.batchNumber !== firstBin.batchNumber ||
          currentBin.status !== firstBin.status ||
          currentBin.stackId

        if (hasConflict) {
          return 'conflict-row'
        }
      }
      return ''
    },

    /**
     * 提交表单
     */
    handleSubmit() {
      this.$refs.stackForm.validate(async(valid) => {
        if (!valid) return

        if (this.selectedBins.length < 2) {
          this.$message.warning('至少需要选择2个料框进行组垛')
          return
        }

        if (this.validationErrors.length > 0) {
          this.$message.error('存在组垛规则违规，无法提交')
          return
        }

        this.submitting = true

        try {
          const data = {
            binIds: this.selectedBinIds
          }

          // 料垛编号（可选）
          if (this.formData.stackCode) {
            data.stackCode = this.formData.stackCode
          }

          // 备注（可选）
          if (this.formData.remarks) {
            data.remarks = this.formData.remarks
          }

          const response = await createStack(data)

          if (response.success) {
            this.$message.success(response.message || '组垛成功')
            this.$emit('created', response.data)
            this.handleClose()
          }
        } catch (error) {
          console.error('组垛失败:', error)
          // 错误处理由request拦截器统一处理
          // 如果后端返回详细错误信息（如conflictingBinIds），这里可以进一步处理
          if (error.response?.data?.error?.details?.conflictingBinIds) {
            const conflictIds = error.response.data.error.details.conflictingBinIds
            this.$message.error(`以下料框存在冲突：${conflictIds.join(', ')}`)
          }
        } finally {
          this.submitting = false
        }
      })
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
      // 重置表单
      this.$refs.stackForm?.resetFields()
      this.binIdsInput = ''
      this.selectedBins = []
      this.validationErrors = []
      this.selectMode = 'manual'
      this.submitting = false

      this.dialogVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
.stack-dialog-form {
  margin-top: 20px;

  .form-item-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;

    i {
      margin-right: 4px;
    }
  }

  .selected-bins-section {
    .empty-tip {
      padding: 20px;
      text-align: center;
      color: #909399;
      background-color: #f5f7fa;
      border-radius: 4px;

      i {
        margin-right: 8px;
        font-size: 16px;
      }
    }

    .selected-bins-list {
      .bins-summary {
        display: flex;
        gap: 12px;
        margin-bottom: 12px;
        flex-wrap: wrap;
      }

      .bins-table {
        ::v-deep .conflict-row {
          background-color: #fef0f0 !important;

          &:hover > td {
            background-color: #fde2e2 !important;
          }
        }
      }

      .validation-errors {
        margin-top: 12px;
      }
    }
  }
}

.stacking-rules-tip {
  margin-top: 20px;

  .rules-list {
    margin: 0;
    padding-left: 20px;

    li {
      line-height: 1.8;
      color: #606266;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>

