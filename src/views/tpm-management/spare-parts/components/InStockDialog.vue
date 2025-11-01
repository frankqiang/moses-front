/**
 * 文件名称：InStockDialog.vue
 * 文件描述：备件入库操作对话框组件
 * 创建日期：2025-01-21
 * 修改记录：
 *   - 2025-01-21: 初始创建
 */

<template>
  <el-dialog
    :visible.sync="dialogVisible"
    :title="dialogTitle"
    width="600px"
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

    <!-- 入库表单 -->
    <el-form
      ref="inStockForm"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      style="margin-top: 20px"
    >
      <el-form-item label="入库单号" prop="transactionCode">
        <el-input
          v-model="formData.transactionCode"
          placeholder="留空则系统自动生成（格式：SP-IN-时间戳）"
          clearable
        />
        <div class="form-tip">
          提示：不填写时系统将自动生成格式化的入库单号
        </div>
      </el-form-item>

      <el-form-item label="入库数量" prop="quantity">
        <el-input-number
          v-model="formData.quantity"
          :min="1"
          :max="999999"
          :precision="0"
          controls-position="right"
          style="width: 100%"
          @change="handleQuantityChange"
        />
        <div class="form-tip">
          必须为正整数（≥ 1）
        </div>
      </el-form-item>

      <!-- 入库后预计库存 -->
      <el-form-item label="预计库存">
        <div class="predicted-stock">
          <span class="current-value">当前：{{ currentStock }}</span>
          <i class="el-icon-plus" style="margin: 0 8px; color: #67C23A;" />
          <span class="quantity-value">入库：{{ formData.quantity || 0 }}</span>
          <i class="el-icon-right" style="margin: 0 8px; color: #909399;" />
          <span :class="predictedStockClass">
            预计：{{ predictedStock }} {{ sparePartInfo.unit || '件' }}
          </span>
        </div>
      </el-form-item>

      <el-form-item label="用途说明" prop="purpose">
        <el-input
          v-model="formData.purpose"
          type="textarea"
          :rows="3"
          placeholder="请输入入库用途说明，如：采购入库、调拨入库等"
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
        确认入库
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { inStockSparePart } from '../api'

export default {
  name: 'InStockDialog',

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
    return {
      dialogVisible: false,
      submitLoading: false,
      formData: {
        transactionCode: '',
        quantity: 1,
        purpose: '',
        remark: ''
      },
      formRules: {
        quantity: [
          { required: true, message: '请输入入库数量', trigger: 'blur' },
          {
            type: 'number',
            min: 1,
            message: '入库数量必须大于等于1',
            trigger: 'change'
          }
        ]
      }
    }
  },

  computed: {
    dialogTitle() {
      return '备件入库'
    },

    // 当前库存
    currentStock() {
      return this.sparePartInfo.currentQuantity || 0
    },

    // 预计入库后库存
    predictedStock() {
      return this.currentStock + (this.formData.quantity || 0)
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
      } else if (this.predictedStock > this.currentStock && this.predictedStock > safetyStock) {
        return 'predicted-stock-normal'
      }
      return ''
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
    // 数量变化处理
    handleQuantityChange(value) {
      // 可以在这里添加额外的数量变化逻辑
    },

    // 提交入库
    handleSubmit() {
      this.$refs.inStockForm.validate(async(valid) => {
        if (!valid) {
          return false
        }

        // 显示确认弹窗
        try {
          await this.$confirm(
            `<div style="line-height: 1.8;">
              <p><strong>确认入库信息：</strong></p>
              <p>备件名称：${this.sparePartInfo.sparePartName}</p>
              <p>入库数量：<span style="color: #67C23A; font-weight: bold;">${this.formData.quantity}</span> ${this.sparePartInfo.unit || '件'}</p>
              <p>当前库存：${this.currentStock} ${this.sparePartInfo.unit || '件'}</p>
              <p>预计库存：<span style="color: #409EFF; font-weight: bold;">${this.predictedStock}</span> ${this.sparePartInfo.unit || '件'}</p>
            </div>`,
            '确认入库',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'info',
              dangerouslyUseHTMLString: true
            }
          )
        } catch (error) {
          // 用户取消确认
          return
        }

        // 执行入库操作
        this.submitLoading = true
        try {
          // 准备请求数据
          const requestData = {
            quantity: this.formData.quantity
          }

          // 如果填写了入库单号，则添加到请求中
          if (this.formData.transactionCode && this.formData.transactionCode.trim()) {
            requestData.transactionCode = this.formData.transactionCode.trim()
          }

          // 如果填写了用途说明，则添加到请求中
          if (this.formData.purpose && this.formData.purpose.trim()) {
            requestData.purpose = this.formData.purpose.trim()
          }

          // 如果填写了备注，则添加到请求中
          if (this.formData.remark && this.formData.remark.trim()) {
            requestData.remark = this.formData.remark.trim()
          }

          const response = await inStockSparePart(this.sparePartInfo.id, requestData)

          // 显示成功消息（使用后端返回的消息）
          this.$message.success(response.message || '备件入库成功')

          // 触发成功事件，传递返回的数据
          this.$emit('success', response.data)

          // 关闭对话框
          this.handleClose()
        } catch (error) {
          // 错误消息已经在request拦截器中处理
          console.error('入库失败:', error)
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
        transactionCode: '',
        quantity: 1,
        purpose: '',
        remark: ''
      }
      this.$nextTick(() => {
        if (this.$refs.inStockForm) {
          this.$refs.inStockForm.clearValidate()
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
    color: #67C23A;
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
    width: 100px;
    background-color: #fafafa;
  }
}
</style>

