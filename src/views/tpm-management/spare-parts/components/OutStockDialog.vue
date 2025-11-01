/**
 * 文件名称：OutStockDialog.vue
 * 文件描述：备件出库操作对话框组件，支持领用、退库、报废等类型
 * 创建日期：2025-01-25
 * 修改记录：
 *   - 2025-01-25: 初始创建
 */

<template>
  <el-dialog
    :visible.sync="dialogVisible"
    :title="dialogTitle"
    width="700px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="handleClose"
  >
    <!-- 备件基础信息 -->
    <div class="spare-part-info">
      <el-descriptions :column="2" border size="small">
        <el-descriptions-item label="备件编码">
          {{ sparePartInfo.sparePartCode || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="备件名称">
          {{ sparePartInfo.sparePartName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="当前库存">
          <span :class="lowStockClass">
            {{ currentStock }} {{ sparePartInfo.unit || '件' }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="安全库存">
          {{ sparePartInfo.safetyStock || 0 }} {{ sparePartInfo.unit || '件' }}
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <!-- 库存不足警告 -->
    <el-alert
      v-if="showStockWarning"
      title="库存不足警告"
      type="error"
      :description="`当前库存仅剩 ${currentStock} ${sparePartInfo.unit || '件'}，请谨慎出库！`"
      :closable="false"
      show-icon
      style="margin-bottom: 20px"
    />

    <!-- 出库表单 -->
    <el-form
      ref="outStockForm"
      :model="formData"
      :rules="formRules"
      label-width="120px"
      style="margin-top: 20px"
    >
      <el-form-item label="出库类型" prop="transactionType">
        <el-select
          v-model="formData.transactionType"
          placeholder="请选择出库类型"
          style="width: 100%"
          @change="handleTypeChange"
        >
          <el-option label="领用" value="领用" />
          <el-option label="退库" value="退库" />
          <el-option label="报废" value="报废" />
        </el-select>
        <div class="form-tip">
          领用时必须关联维护任务或故障单
        </div>
      </el-form-item>

      <el-form-item label="出库单号" prop="transactionCode">
        <el-input
          v-model="formData.transactionCode"
          :placeholder="transactionCodePlaceholder"
          clearable
        />
        <div class="form-tip">
          留空则系统自动生成（{{ transactionCodeHint }}）
        </div>
      </el-form-item>

      <el-form-item label="出库数量" prop="quantity">
        <el-input-number
          v-model="formData.quantity"
          :min="1"
          :max="currentStock"
          :precision="0"
          controls-position="right"
          style="width: 100%"
          @change="handleQuantityChange"
        />
        <div class="form-tip">
          必须为正整数（1 ~ {{ currentStock }}）
        </div>
      </el-form-item>

      <!-- 出库后预计库存 -->
      <el-form-item label="预计库存">
        <div class="predicted-stock">
          <span class="current-value">当前：{{ currentStock }}</span>
          <i :class="predictedStockIcon" :style="{ margin: '0 8px', color: predictedStockIconColor }" />
          <span class="quantity-value">{{ transactionTypeText }}：{{ formData.quantity || 0 }}</span>
          <i class="el-icon-right" style="margin: 0 8px; color: #909399;" />
          <span :class="predictedStockClass">
            预计：{{ predictedStock }} {{ sparePartInfo.unit || '件' }}
          </span>
          <el-tag
            v-if="willBeLowStock"
            type="warning"
            size="mini"
            style="margin-left: 8px"
          >
            低库存
          </el-tag>
        </div>
      </el-form-item>

      <!-- 领用类型时显示关联信息 -->
      <template v-if="formData.transactionType === '领用'">
        <el-form-item label="关联维护任务" prop="relatedTaskId">
          <el-select
            v-model="formData.relatedTaskId"
            placeholder="请选择维护任务"
            filterable
            clearable
            style="width: 100%"
          >
            <el-option
              v-for="task in maintenanceTasks"
              :key="task.id"
              :label="`${task.code} - ${task.title}`"
              :value="task.id"
            />
          </el-select>
          <div class="form-tip">
            领用时必须选择维护任务或故障单（至少一项）
          </div>
        </el-form-item>

        <el-form-item label="关联故障单" prop="relatedFailureId">
          <el-select
            v-model="formData.relatedFailureId"
            placeholder="请选择故障单"
            filterable
            clearable
            style="width: 100%"
          >
            <el-option
              v-for="failure in equipmentFailures"
              :key="failure.id"
              :label="`${failure.code} - ${failure.description}`"
              :value="failure.id"
            />
          </el-select>
          <div class="form-tip">
            领用时必须选择维护任务或故障单（至少一项）
          </div>
        </el-form-item>
      </template>

      <el-form-item label="用途说明" prop="purpose">
        <el-input
          v-model="formData.purpose"
          type="textarea"
          :rows="3"
          :placeholder="purposePlaceholder"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="formData.remark"
          type="textarea"
          :rows="2"
          placeholder="请输入备注信息（可选）"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>
    </el-form>

    <!-- 对话框底部按钮 -->
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取 消</el-button>
      <el-button
        type="primary"
        :loading="submitLoading"
        @click="handleSubmit"
      >
        确认出库
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { outStockSparePart } from '../api'

export default {
  name: 'OutStockDialog',

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    sparePartInfo: {
      type: Object,
      default: () => ({})
    }
  },

  data() {
    // 自定义验证规则：领用时必须关联维护任务或故障单
    const validateRelation = (rule, value, callback) => {
      if (this.formData.transactionType === '领用') {
        if (!this.formData.relatedTaskId && !this.formData.relatedFailureId) {
          callback(new Error('领用时必须选择维护任务或故障单（至少一项）'))
        } else {
          callback()
        }
      } else {
        callback()
      }
    }

    return {
      dialogVisible: false,
      submitLoading: false,
      formData: {
        transactionType: '领用',
        transactionCode: '',
        quantity: 1,
        relatedTaskId: '',
        relatedFailureId: '',
        purpose: '',
        remark: ''
      },
      formRules: {
        transactionType: [
          { required: true, message: '请选择出库类型', trigger: 'change' }
        ],
        quantity: [
          { required: true, message: '请输入出库数量', trigger: 'blur' },
          {
            type: 'number',
            min: 1,
            message: '出库数量必须大于等于1',
            trigger: 'change'
          },
          {
            validator: (rule, value, callback) => {
              if (value > this.currentStock) {
                callback(new Error(`出库数量不能超过当前库存（${this.currentStock}）`))
              } else {
                callback()
              }
            },
            trigger: 'change'
          }
        ],
        relatedTaskId: [
          { validator: validateRelation, trigger: 'change' }
        ],
        relatedFailureId: [
          { validator: validateRelation, trigger: 'change' }
        ]
      },
      // 模拟维护任务数据（实际应从API获取）
      maintenanceTasks: [
        { id: 'task-001', code: 'MT-2024-001', title: '退火炉定期维护' },
        { id: 'task-002', code: 'MT-2024-002', title: '行车设备检修' },
        { id: 'task-003', code: 'MT-2024-003', title: '料车系统保养' }
      ],
      // 模拟故障单数据（实际应从API获取）
      equipmentFailures: [
        { id: 'failure-001', code: 'EF-2024-001', description: '3号退火炉主电机故障' },
        { id: 'failure-002', code: 'EF-2024-002', description: '行车液压系统泄漏' },
        { id: 'failure-003', code: 'EF-2024-003', description: '料车导航系统异常' }
      ]
    }
  },

  computed: {
    dialogTitle() {
      return '备件出库'
    },

    // 当前库存
    currentStock() {
      return this.sparePartInfo.currentQuantity || 0
    },

    // 预计出库后库存
    predictedStock() {
      if (this.formData.transactionType === '退库') {
        // 退库是增加库存
        return this.currentStock + (this.formData.quantity || 0)
      } else {
        // 领用和报废是减少库存
        return this.currentStock - (this.formData.quantity || 0)
      }
    },

    // 低库存样式类
    lowStockClass() {
      const safetyStock = this.sparePartInfo.safetyStock || 0
      return this.currentStock <= safetyStock ? 'low-stock' : ''
    },

    // 预计库存样式类
    predictedStockClass() {
      const safetyStock = this.sparePartInfo.safetyStock || 0
      if (this.predictedStock <= safetyStock) {
        return 'predicted-stock-low'
      } else if (this.formData.transactionType === '退库' && this.predictedStock > this.currentStock) {
        return 'predicted-stock-normal'
      }
      return ''
    },

    // 是否会低于安全库存
    willBeLowStock() {
      const safetyStock = this.sparePartInfo.safetyStock || 0
      return this.predictedStock <= safetyStock
    },

    // 显示库存不足警告
    showStockWarning() {
      const safetyStock = this.sparePartInfo.safetyStock || 0
      return this.currentStock <= safetyStock && this.formData.transactionType !== '退库'
    },

    // 出库类型文本
    transactionTypeText() {
      const typeMap = {
        '领用': '出库',
        '退库': '入库',
        '报废': '出库'
      }
      return typeMap[this.formData.transactionType] || '出库'
    },

    // 预计库存图标
    predictedStockIcon() {
      return this.formData.transactionType === '退库' ? 'el-icon-plus' : 'el-icon-minus'
    },

    // 预计库存图标颜色
    predictedStockIconColor() {
      return this.formData.transactionType === '退库' ? '#67C23A' : '#F56C6C'
    },

    // 出库单号占位符
    transactionCodePlaceholder() {
      const typeMap = {
        '领用': 'SP-OUT-时间戳',
        '退库': 'SP-RET-时间戳',
        '报废': 'SP-SCR-时间戳'
      }
      return `留空则系统自动生成（格式：${typeMap[this.formData.transactionType] || 'SP-OUT-时间戳'}）`
    },

    // 出库单号提示
    transactionCodeHint() {
      const typeMap = {
        '领用': 'SP-OUT-时间戳',
        '退库': 'SP-RET-时间戳',
        '报废': 'SP-SCR-时间戳'
      }
      return typeMap[this.formData.transactionType] || 'SP-OUT-时间戳'
    },

    // 用途说明占位符
    purposePlaceholder() {
      const typeMap = {
        '领用': '请输入领用用途说明，如：设备维护使用、故障维修更换等',
        '退库': '请输入退库原因，如：多领退回、维修未使用等',
        '报废': '请输入报废原因，如：保质期过期报废、损坏无法使用等'
      }
      return typeMap[this.formData.transactionType] || '请输入出库用途说明'
    }
  },

  watch: {
    visible: {
      handler(val) {
        this.dialogVisible = val
        if (val) {
          this.resetForm()
        }
      },
      immediate: true
    }
  },

  methods: {
    // 出库类型变化处理
    handleTypeChange(value) {
      // 切换类型时清空关联信息
      if (value !== '领用') {
        this.formData.relatedTaskId = ''
        this.formData.relatedFailureId = ''
      }
      // 清除关联字段的验证错误
      this.$nextTick(() => {
        if (this.$refs.outStockForm) {
          this.$refs.outStockForm.clearValidate(['relatedTaskId', 'relatedFailureId'])
        }
      })
    },

    // 数量变化处理
    handleQuantityChange(value) {
      // 可以在这里添加额外的数量变化逻辑
    },

    // 提交出库
    handleSubmit() {
      this.$refs.outStockForm.validate(async(valid) => {
        if (!valid) {
          return false
        }

        // 构建确认信息
        let confirmHtml = `<div style="line-height: 1.8;">
          <p><strong>确认出库信息：</strong></p>
          <p>备件名称：${this.sparePartInfo.sparePartName}</p>
          <p>出库类型：<span style="color: #409EFF; font-weight: bold;">${this.formData.transactionType}</span></p>
          <p>出库数量：<span style="color: ${this.formData.transactionType === '退库' ? '#67C23A' : '#F56C6C'}; font-weight: bold;">${this.formData.quantity}</span> ${this.sparePartInfo.unit || '件'}</p>
          <p>当前库存：${this.currentStock} ${this.sparePartInfo.unit || '件'}</p>
          <p>预计库存：<span style="color: ${this.willBeLowStock ? '#F56C6C' : '#409EFF'}; font-weight: bold;">${this.predictedStock}</span> ${this.sparePartInfo.unit || '件'}</p>`

        // 如果是领用，显示关联信息
        if (this.formData.transactionType === '领用') {
          if (this.formData.relatedTaskId) {
            const task = this.maintenanceTasks.find(t => t.id === this.formData.relatedTaskId)
            if (task) {
              confirmHtml += `<p>关联维护任务：${task.code} - ${task.title}</p>`
            }
          }
          if (this.formData.relatedFailureId) {
            const failure = this.equipmentFailures.find(f => f.id === this.formData.relatedFailureId)
            if (failure) {
              confirmHtml += `<p>关联故障单：${failure.code} - ${failure.description}</p>`
            }
          }
        }

        confirmHtml += `</div>`

        // 显示确认弹窗
        try {
          await this.$confirm(
            confirmHtml,
            '确认出库',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning',
              dangerouslyUseHTMLString: true
            }
          )
        } catch (error) {
          // 用户取消确认
          return
        }

        // 执行出库操作
        this.submitLoading = true
        try {
          // 准备请求数据
          const requestData = {
            quantity: this.formData.quantity,
            transactionType: this.formData.transactionType
          }

          // 如果填写了出库单号，则添加到请求中
          if (this.formData.transactionCode && this.formData.transactionCode.trim()) {
            requestData.transactionCode = this.formData.transactionCode.trim()
          }

          // 如果是领用类型，添加关联信息
          if (this.formData.transactionType === '领用') {
            if (this.formData.relatedTaskId) {
              requestData.relatedTaskId = this.formData.relatedTaskId
            }
            if (this.formData.relatedFailureId) {
              requestData.relatedFailureId = this.formData.relatedFailureId
            }
          }

          // 如果填写了用途说明，则添加到请求中
          if (this.formData.purpose && this.formData.purpose.trim()) {
            requestData.purpose = this.formData.purpose.trim()
          }

          // 如果填写了备注，则添加到请求中
          if (this.formData.remark && this.formData.remark.trim()) {
            requestData.remark = this.formData.remark.trim()
          }

          const response = await outStockSparePart(this.sparePartInfo.id, requestData)

          // 显示成功消息（使用后端返回的消息）
          this.$message.success(response.message || '备件出库成功')

          // 触发成功事件，传递返回的数据
          this.$emit('success', response.data)

          // 关闭对话框
          this.handleClose()
        } catch (error) {
          // 错误消息已经在request拦截器中处理
          console.error('出库失败:', error)
        } finally {
          this.submitLoading = false
        }
      })
    },

    // 关闭对话框
    handleClose() {
      this.dialogVisible = false
      this.$emit('update:visible', false)
      this.$emit('close')
    },

    // 重置表单
    resetForm() {
      this.formData = {
        transactionType: '领用',
        transactionCode: '',
        quantity: 1,
        relatedTaskId: '',
        relatedFailureId: '',
        purpose: '',
        remark: ''
      }
      this.$nextTick(() => {
        if (this.$refs.outStockForm) {
          this.$refs.outStockForm.clearValidate()
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.spare-part-info {
  margin-bottom: 20px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.5;
}

.predicted-stock {
  display: flex;
  align-items: center;
  font-size: 14px;
  padding: 8px 12px;
  background-color: #f5f7fa;
  border-radius: 4px;

  .current-value {
    color: #606266;
  }

  .quantity-value {
    font-weight: bold;
  }

  .predicted-stock-low {
    color: #F56C6C;
    font-weight: bold;
  }

  .predicted-stock-normal {
    color: #67C23A;
    font-weight: bold;
  }
}

.low-stock {
  color: #F56C6C;
  font-weight: bold;
}

.dialog-footer {
  text-align: right;
}

::v-deep .el-dialog__body {
  padding: 20px;
}

::v-deep .el-descriptions {
  .el-descriptions-item__label {
    width: 120px;
    background-color: #fafafa;
  }
}
</style>

